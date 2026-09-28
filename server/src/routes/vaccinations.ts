import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/db.js';
import { AuthRequest, authenticateToken } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

// List Vaccinations
router.get('/', authenticateToken, (req: AuthRequest, res) => {
  const { animal_id, district, taluka, status } = req.query;

  try {
    let query = `
      SELECT v.*,
             l.ear_tag_id, l.species, l.breed, l.district as animal_district, l.taluka as animal_taluka,
             u.full_name as owner_name, u.village as animal_village
      FROM vaccinations v
      LEFT JOIN livestock l ON v.animal_id = l.id
      LEFT JOIN users u ON l.owner_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (req.user?.role === 'FARMER') {
      query += ` AND l.owner_id = ?`;
      params.push(req.user.id);
    } else if (animal_id) {
      query += ` AND v.animal_id = ?`;
      params.push(animal_id);
    }

    if (district) {
      query += ` AND l.district = ?`;
      params.push(district);
    }
    if (taluka) {
      query += ` AND l.taluka = ?`;
      params.push(taluka);
    }
    if (status) {
      query += ` AND v.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY v.administered_date DESC`;

    const records = db.prepare(query).all(...params);
    return res.json({ success: true, count: records.length, data: records });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Administer / Log Vaccination
router.post('/', authenticateToken, (req: AuthRequest, res) => {
  const {
    animal_id,
    vaccine_name,
    batch_no,
    dose_number = 1,
    administered_date,
    next_due_date,
    remarks
  } = req.body;

  if (!animal_id || !vaccine_name || !batch_no || !administered_date) {
    return res.status(400).json({ success: false, message: 'Missing required vaccination fields' });
  }

  try {
    const id = `vac_${uuidv4().substring(0, 8)}`;
    const calcNextDue = next_due_date || new Date(Date.now() + 180 * 24 * 3600000).toISOString().split('T')[0]; // +6 months default

    const stmt = db.prepare(`
      INSERT INTO vaccinations (
        id, animal_id, vaccine_name, batch_no, dose_number,
        administered_date, next_due_date, administered_by, status, remarks, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'COMPLETED', ?, datetime('now'))
    `);

    stmt.run(
      id,
      animal_id,
      vaccine_name,
      batch_no,
      dose_number,
      administered_date,
      calcNextDue,
      req.user?.full_name || 'Veterinary Officer',
      remarks || null
    );

    // Update Animal Vaccination Status
    db.prepare(`
      UPDATE livestock
      SET vaccination_status = 'UP_TO_DATE',
          last_vaccination_date = ?,
          next_vaccination_due = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `).run(administered_date, calcNextDue, animal_id);

    logAudit({
      userId: req.user!.id,
      userName: req.user!.full_name,
      userRole: req.user!.role,
      action: 'LOG_VACCINATION',
      entity: 'Vaccination',
      entityId: id,
      newValue: { animal_id, vaccine_name, batch_no },
      ipAddress: req.ip
    });

    return res.status(201).json({
      success: true,
      message: 'Vaccination record registered and livestock profile updated',
      data: { id, next_due_date: calcNextDue }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// List Campaigns
router.get('/campaigns', authenticateToken, (req: AuthRequest, res) => {
  try {
    const campaigns = db.prepare(`SELECT * FROM vaccination_campaigns ORDER BY start_date DESC`).all();
    const formatted = campaigns.map((c: any) => ({
      ...c,
      talukas: typeof c.talukas === 'string' ? JSON.parse(c.talukas) : c.talukas
    }));
    return res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Create Campaign
router.post('/campaigns', authenticateToken, (req: AuthRequest, res) => {
  const {
    title,
    disease_target,
    district,
    talukas = ['All'],
    start_date,
    end_date,
    target_count
  } = req.body;

  if (!title || !disease_target || !district || !start_date || !target_count) {
    return res.status(400).json({ success: false, message: 'Missing required campaign parameters' });
  }

  try {
    const id = `cmp_${uuidv4().substring(0, 8)}`;
    db.prepare(`
      INSERT INTO vaccination_campaigns (
        id, title, disease_target, district, talukas,
        start_date, end_date, target_count, achieved_count, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 'ACTIVE', datetime('now'))
    `).run(
      id,
      title,
      disease_target,
      district,
      JSON.stringify(talukas),
      start_date,
      end_date || start_date,
      Number(target_count)
    );

    return res.status(201).json({ success: true, message: 'Vaccination campaign initiated', data: { id } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
