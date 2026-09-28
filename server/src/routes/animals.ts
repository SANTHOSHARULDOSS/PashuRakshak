import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/db.js';
import { AuthRequest, authenticateToken } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

// List Animals with search & filters
router.get('/', authenticateToken, (req: AuthRequest, res) => {
  const {
    owner_id,
    species,
    health_status,
    vaccination_status,
    district,
    taluka,
    search
  } = req.query;

  try {
    let query = `
      SELECT l.*, u.full_name as owner_name, u.phone as owner_phone
      FROM livestock l
      LEFT JOIN users u ON l.owner_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    // Role-based restrictions: Farmers can only see their animals or regional summary
    if (req.user?.role === 'FARMER' && !owner_id) {
      query += ` AND l.owner_id = ?`;
      params.push(req.user.id);
    } else if (owner_id) {
      query += ` AND l.owner_id = ?`;
      params.push(owner_id);
    }

    if (species) {
      query += ` AND l.species = ?`;
      params.push(species);
    }
    if (health_status) {
      query += ` AND l.health_status = ?`;
      params.push(health_status);
    }
    if (vaccination_status) {
      query += ` AND l.vaccination_status = ?`;
      params.push(vaccination_status);
    }
    if (district) {
      query += ` AND l.district = ?`;
      params.push(district);
    }
    if (taluka) {
      query += ` AND l.taluka = ?`;
      params.push(taluka);
    }
    if (search) {
      query += ` AND (l.ear_tag_id LIKE ? OR l.breed LIKE ? OR u.full_name LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += ` ORDER BY l.created_at DESC`;

    const animals = db.prepare(query).all(...params);
    return res.json({ success: true, count: animals.length, data: animals });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Single Animal Detail
router.get('/:id', authenticateToken, (req: AuthRequest, res) => {
  const { id } = req.params;

  try {
    const animal = db.prepare(`
      SELECT l.*, u.full_name as owner_name, u.phone as owner_phone, u.village as owner_village
      FROM livestock l
      LEFT JOIN users u ON l.owner_id = u.id
      WHERE l.id = ? OR l.ear_tag_id = ?
    `).get(id, id) as any;

    if (!animal) {
      return res.status(404).json({ success: false, message: 'Livestock not found' });
    }

    // Fetch reports
    const reports = db.prepare(`
      SELECT r.*, ra.risk_score, ra.risk_level, ra.primary_suspected_disease
      FROM health_reports r
      LEFT JOIN risk_assessments ra ON r.id = ra.report_id
      WHERE r.animal_id = ?
      ORDER BY r.created_at DESC
    `).all(animal.id);

    // Fetch vaccinations
    const vaccinations = db.prepare(`
      SELECT * FROM vaccinations WHERE animal_id = ? ORDER BY administered_date DESC
    `).all(animal.id);

    // Fetch lab tests
    const labSamples = db.prepare(`
      SELECT * FROM lab_samples WHERE animal_id = ? ORDER BY collection_date DESC
    `).all(animal.id);

    return res.json({
      success: true,
      data: {
        ...animal,
        reports,
        vaccinations,
        labSamples
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Register New Livestock
router.post('/', authenticateToken, (req: AuthRequest, res) => {
  const {
    ear_tag_id,
    species,
    breed,
    sex,
    age_months,
    owner_id,
    village,
    taluka,
    district,
    latitude,
    longitude,
    health_status = 'HEALTHY',
    vaccination_status = 'UP_TO_DATE',
    last_vaccination_date,
    next_vaccination_due,
    previous_diseases = [],
    photo_url
  } = req.body;

  if (!ear_tag_id || !species || !breed || !sex || !age_months) {
    return res.status(400).json({ success: false, message: 'Missing required livestock registration fields' });
  }

  const assignedOwner = owner_id || req.user?.id;
  const assignedVillage = village || req.user?.village || 'Nighoj';
  const assignedTaluka = taluka || req.user?.taluka || 'Shirur';
  const assignedDistrict = district || req.user?.district || 'Pune';
  const assignedLat = latitude || 18.8247;
  const assignedLng = longitude || 74.3412;

  try {
    const id = `ani_${uuidv4().substring(0, 8)}`;
    const stmt = db.prepare(`
      INSERT INTO livestock (
        id, ear_tag_id, species, breed, sex, age_months, owner_id,
        village, taluka, district, latitude, longitude,
        health_status, vaccination_status, last_vaccination_date,
        next_vaccination_due, previous_diseases, photo_url, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    stmt.run(
      id,
      ear_tag_id,
      species,
      breed,
      sex,
      Number(age_months),
      assignedOwner,
      assignedVillage,
      assignedTaluka,
      assignedDistrict,
      assignedLat,
      assignedLng,
      health_status,
      vaccination_status,
      last_vaccination_date || null,
      next_vaccination_due || null,
      JSON.stringify(previous_diseases),
      photo_url || null
    );

    logAudit({
      userId: req.user!.id,
      userName: req.user!.full_name,
      userRole: req.user!.role,
      action: 'REGISTER_LIVESTOCK',
      entity: 'Livestock',
      entityId: id,
      newValue: { ear_tag_id, species, breed, assignedDistrict },
      ipAddress: req.ip
    });

    return res.status(201).json({
      success: true,
      message: 'Livestock registered successfully',
      data: { id, ear_tag_id, species, breed }
    });
  } catch (err: any) {
    if (err.message?.includes('UNIQUE constraint failed: livestock.ear_tag_id')) {
      return res.status(409).json({ success: false, message: `Ear Tag ID ${ear_tag_id} is already registered.` });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Update Livestock Details
router.put('/:id', authenticateToken, (req: AuthRequest, res) => {
  const { id } = req.params;
  const {
    breed,
    age_months,
    health_status,
    vaccination_status,
    last_vaccination_date,
    next_vaccination_due,
    photo_url
  } = req.body;

  try {
    const existing = db.prepare(`SELECT * FROM livestock WHERE id = ?`).get(id) as any;
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Livestock not found' });
    }

    const stmt = db.prepare(`
      UPDATE livestock
      SET breed = COALESCE(?, breed),
          age_months = COALESCE(?, age_months),
          health_status = COALESCE(?, health_status),
          vaccination_status = COALESCE(?, vaccination_status),
          last_vaccination_date = COALESCE(?, last_vaccination_date),
          next_vaccination_due = COALESCE(?, next_vaccination_due),
          photo_url = COALESCE(?, photo_url),
          version = version + 1,
          updated_at = datetime('now')
      WHERE id = ?
    `);

    stmt.run(
      breed,
      age_months,
      health_status,
      vaccination_status,
      last_vaccination_date,
      next_vaccination_due,
      photo_url,
      id
    );

    logAudit({
      userId: req.user!.id,
      userName: req.user!.full_name,
      userRole: req.user!.role,
      action: 'UPDATE_LIVESTOCK',
      entity: 'Livestock',
      entityId: id as string,
      prevValue: existing.health_status,
      newValue: health_status || existing.health_status,
      ipAddress: req.ip
    });

    return res.json({ success: true, message: 'Livestock record updated successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
