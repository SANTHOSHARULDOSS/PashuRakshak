import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/db.js';
import { AuthRequest, authenticateToken, requireRole } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

// List Outbreak Clusters
router.get('/', authenticateToken, (req: AuthRequest, res) => {
  const { district, status } = req.query;

  try {
    let query = `SELECT * FROM outbreaks WHERE 1=1`;
    const params: any[] = [];

    if (district) {
      query += ` AND district = ?`;
      params.push(district);
    }
    if (status === 'active') {
      query += ` AND containment_zone_active = 1`;
    }

    query += ` ORDER BY detected_date DESC`;

    const outbreaks = db.prepare(query).all(...params);
    return res.json({ success: true, count: outbreaks.length, data: outbreaks });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Single Outbreak Detail
router.get('/:id', authenticateToken, (req: AuthRequest, res) => {
  const { id } = req.params;

  try {
    const outbreak = db.prepare(`SELECT * FROM outbreaks WHERE id = ? OR outbreak_code = ?`).get(id, id) as any;
    if (!outbreak) {
      return res.status(404).json({ success: false, message: 'Outbreak cluster not found' });
    }

    // Fetch related reports within the radius
    const reports = db.prepare(`
      SELECT r.id, r.created_at, r.status, r.severity, r.village, l.species, l.ear_tag_id, ra.primary_suspected_disease, ra.risk_score
      FROM health_reports r
      JOIN livestock l ON r.animal_id = l.id
      LEFT JOIN risk_assessments ra ON r.id = ra.report_id
      WHERE haversine_distance(r.latitude, r.longitude, ?, ?) <= ?
      ORDER BY r.created_at DESC
    `).all(outbreak.center_lat, outbreak.center_lng, outbreak.radius_km);

    return res.json({
      success: true,
      data: {
        ...outbreak,
        reports
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Declare or Update Outbreak Containment Zone
router.post('/', authenticateToken, requireRole(['DISTRICT_ADMIN', 'STATE_ADMIN']), (req: AuthRequest, res) => {
  const {
    disease,
    district,
    taluka,
    epicenter_village,
    center_lat,
    center_lng,
    radius_km = 10,
    assigned_rapid_response_team,
    risk_level = 'HIGH'
  } = req.body;

  if (!disease || !district || !taluka || !epicenter_village) {
    return res.status(400).json({ success: false, message: 'Missing required outbreak parameters' });
  }

  try {
    const id = `out_${uuidv4().substring(0, 8)}`;
    const code = `OB-${district.substring(0, 3).toUpperCase()}-2026-${Math.floor(10 + Math.random() * 90)}`;

    const stmt = db.prepare(`
      INSERT INTO outbreaks (
        id, outbreak_code, disease, district, taluka, epicenter_village,
        center_lat, center_lng, radius_km, affected_villages_count,
        active_cases_count, mortality_count, risk_level, detected_date,
        containment_zone_active, assigned_rapid_response_team, advisory_broadcast_sent,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 5, 12, 1, ?, date('now'), 1, ?, 1, datetime('now'), datetime('now'))
    `);

    stmt.run(
      id,
      code,
      disease,
      district,
      taluka,
      epicenter_village,
      center_lat || 18.8247,
      center_lng || 74.3412,
      radius_km,
      risk_level,
      assigned_rapid_response_team || `${district} Rapid Veterinary Response Taskforce`
    );

    // Broadcast High-Priority Alert
    db.prepare(`
      INSERT INTO alerts (id, alert_type, title, message, severity, target_role, target_district, target_taluka, is_read, created_at)
      VALUES (?, 'CONTAINMENT_ADVISORY', ?, ?, 'CRITICAL', 'FARMER', ?, ?, 0, datetime('now'))
    `).run(
      `alt_${uuidv4().substring(0, 8)}`,
      `सतर्कता सूचना: ${disease} उद्रेक क्षेत्र घोषित (${taluka}, ${district})`,
      `${epicenter_village} च्या ${radius_km} किमी परिसरात जनावरांची ने-आण व बाजार तात्काळ थांबवण्यात आला आहे. रिंग लसीकरण मोहीम सुरू आहे.`,
      district,
      taluka
    );

    logAudit({
      userId: req.user!.id,
      userName: req.user!.full_name,
      userRole: req.user!.role,
      action: 'DECLARE_OUTBREAK_CONTAINMENT',
      entity: 'Outbreak',
      entityId: id,
      newValue: { disease, district, taluka, radius_km },
      ipAddress: req.ip
    });

    return res.status(201).json({
      success: true,
      message: 'Outbreak containment zone activated and broadcast advisory distributed',
      data: { id, outbreak_code: code }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
