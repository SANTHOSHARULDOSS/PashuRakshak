import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/db.js';
import { AuthRequest, authenticateToken } from '../middleware/auth.js';
import { assessLivestockRisk } from '../ai/riskAssessor.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

// List Health Reports
router.get('/', authenticateToken, (req: AuthRequest, res) => {
  const {
    status,
    severity,
    district,
    taluka,
    animal_id,
    reporter_id,
    search
  } = req.query;

  try {
    let query = `
      SELECT r.*,
             l.ear_tag_id, l.species, l.breed, l.vaccination_status,
             u.full_name as reporter_name, u.phone as reporter_phone,
             v.full_name as assigned_vet_name,
             ra.risk_score, ra.risk_level, ra.primary_suspected_disease, ra.confidence_percentage
      FROM health_reports r
      LEFT JOIN livestock l ON r.animal_id = l.id
      LEFT JOIN users u ON r.reporter_id = u.id
      LEFT JOIN users v ON r.assigned_vet_id = v.id
      LEFT JOIN risk_assessments ra ON r.id = ra.report_id
      WHERE 1=1
    `;
    const params: any[] = [];

    // Role filtering: Farmers see their reports
    if (req.user?.role === 'FARMER' && !reporter_id) {
      query += ` AND r.reporter_id = ?`;
      params.push(req.user.id);
    } else if (reporter_id) {
      query += ` AND r.reporter_id = ?`;
      params.push(reporter_id);
    }

    // Vets see their assigned taluka/district cases
    if (req.user?.role === 'FIELD_VET' && !district) {
      query += ` AND (r.assigned_vet_id = ? OR r.district = ?)`;
      params.push(req.user.id, req.user.district);
    }

    if (status) {
      query += ` AND r.status = ?`;
      params.push(status);
    }
    if (severity) {
      query += ` AND r.severity = ?`;
      params.push(severity);
    }
    if (district) {
      query += ` AND r.district = ?`;
      params.push(district);
    }
    if (taluka) {
      query += ` AND r.taluka = ?`;
      params.push(taluka);
    }
    if (animal_id) {
      query += ` AND r.animal_id = ?`;
      params.push(animal_id);
    }
    if (search) {
      query += ` AND (l.ear_tag_id LIKE ? OR l.breed LIKE ? OR r.village LIKE ? OR ra.primary_suspected_disease LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    query += ` ORDER BY r.created_at DESC`;

    const reports = db.prepare(query).all(...params);

    // Parse JSON symptoms for frontend convenience
    const formatted = reports.map((r: any) => ({
      ...r,
      symptoms: typeof r.symptoms === 'string' ? JSON.parse(r.symptoms) : r.symptoms
    }));

    return res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Case Detail Endpoint
router.get('/:id', authenticateToken, (req: AuthRequest, res) => {
  const { id } = req.params;

  try {
    const report = db.prepare(`
      SELECT r.*,
             l.ear_tag_id, l.species, l.breed, l.sex, l.age_months, l.vaccination_status, l.last_vaccination_date,
             u.full_name as reporter_name, u.phone as reporter_phone, u.village as reporter_village,
             v.full_name as assigned_vet_name, v.phone as assigned_vet_phone
      FROM health_reports r
      LEFT JOIN livestock l ON r.animal_id = l.id
      LEFT JOIN users u ON r.reporter_id = u.id
      LEFT JOIN users v ON r.assigned_vet_id = v.id
      WHERE r.id = ? OR r.local_id = ?
    `).get(id, id) as any;

    if (!report) {
      return res.status(404).json({ success: false, message: 'Case report not found' });
    }

    // Parse symptoms
    report.symptoms = typeof report.symptoms === 'string' ? JSON.parse(report.symptoms) : report.symptoms;

    // Fetch Risk Assessment
    const riskAssessment = db.prepare(`
      SELECT * FROM risk_assessments WHERE report_id = ?
    `).get(report.id) as any;

    if (riskAssessment) {
      riskAssessment.differential_diagnoses = typeof riskAssessment.differential_diagnoses === 'string'
        ? JSON.parse(riskAssessment.differential_diagnoses)
        : riskAssessment.differential_diagnoses;
      riskAssessment.contributing_factors = typeof riskAssessment.contributing_factors === 'string'
        ? JSON.parse(riskAssessment.contributing_factors)
        : riskAssessment.contributing_factors;
      riskAssessment.weather_factors = typeof riskAssessment.weather_factors === 'string'
        ? JSON.parse(riskAssessment.weather_factors)
        : riskAssessment.weather_factors;
    }

    // Fetch Lab Samples for this report
    const labSamples = db.prepare(`
      SELECT * FROM lab_samples WHERE report_id = ? ORDER BY created_at DESC
    `).all(report.id);

    // Fetch related nearby active cases
    const nearbyCases = db.prepare(`
      SELECT r.id, r.created_at, r.status, r.severity, l.species, l.ear_tag_id, ra.primary_suspected_disease,
             haversine_distance(r.latitude, r.longitude, ?, ?) as distance_km
      FROM health_reports r
      JOIN livestock l ON r.animal_id = l.id
      LEFT JOIN risk_assessments ra ON r.id = ra.report_id
      WHERE r.id != ? AND r.status NOT IN ('RESOLVED')
      AND haversine_distance(r.latitude, r.longitude, ?, ?) <= 30
      ORDER BY distance_km ASC
      LIMIT 6
    `).all(report.latitude, report.longitude, report.id, report.latitude, report.longitude);

    // Check active outbreak overlap
    const outbreak = db.prepare(`
      SELECT * FROM outbreaks
      WHERE district = ? AND containment_zone_active = 1
      AND haversine_distance(center_lat, center_lng, ?, ?) <= (radius_km + 5)
      LIMIT 1
    `).get(report.district, report.latitude, report.longitude);

    return res.json({
      success: true,
      data: {
        ...report,
        riskAssessment,
        labSamples,
        nearbyCases,
        outbreak
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Create New Health Report (with AI evaluation & alerting)
router.post('/', authenticateToken, (req: AuthRequest, res) => {
  const {
    local_id,
    animal_id,
    symptoms = [],
    severity = 'MEDIUM',
    temperature_f,
    photo_url,
    audio_url,
    latitude,
    longitude,
    village,
    taluka,
    district
  } = req.body;

  if (!animal_id || symptoms.length === 0) {
    return res.status(400).json({ success: false, message: 'Animal ID and symptoms are required' });
  }

  try {
    // 1. Fetch Animal Data
    const animal = db.prepare(`SELECT * FROM livestock WHERE id = ?`).get(animal_id) as any;
    if (!animal) {
      return res.status(404).json({ success: false, message: 'Animal not found' });
    }

    const reportId = `rep_${uuidv4().substring(0, 8)}`;
    const reporterId = req.user?.id || animal.owner_id;
    const reportLat = latitude || animal.latitude || 18.8247;
    const reportLng = longitude || animal.longitude || 74.3412;
    const reportVillage = village || animal.village || 'Nighoj';
    const reportTaluka = taluka || animal.taluka || 'Shirur';
    const reportDistrict = district || animal.district || 'Pune';

    // 2. Find Available Field Vet in the Taluka/District
    const vet = db.prepare(`
      SELECT u.id FROM users u
      JOIN veterinary_workers vw ON u.id = vw.user_id
      WHERE u.district = ? AND (vw.assigned_taluka = ? OR u.taluka = ?)
      LIMIT 1
    `).get(reportDistrict, reportTaluka) as any;

    const assignedVetId = vet?.id || null;

    // 3. Execute AI Risk Assessment
    const aiAssessment = assessLivestockRisk({
      species: animal.species,
      symptoms,
      severity,
      temperature_f: temperature_f ? Number(temperature_f) : undefined,
      vaccination_status: animal.vaccination_status,
      latitude: reportLat,
      longitude: reportLng,
      district: reportDistrict,
      taluka: reportTaluka
    });

    // 4. Insert Report
    const insertReport = db.prepare(`
      INSERT INTO health_reports (
        id, local_id, animal_id, reporter_id, symptoms, severity,
        temperature_f, photo_url, audio_url, latitude, longitude,
        village, taluka, district, status, assigned_vet_id,
        sync_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'SYNCED', datetime('now'), datetime('now'))
    `);

    insertReport.run(
      reportId,
      local_id || null,
      animal_id,
      reporterId,
      JSON.stringify(symptoms),
      severity,
      temperature_f ? Number(temperature_f) : null,
      photo_url || null,
      audio_url || null,
      reportLat,
      reportLng,
      reportVillage,
      reportTaluka,
      reportDistrict,
      'OPEN',
      assignedVetId
    );

    // 5. Insert AI Risk Assessment Record
    const insertAssessment = db.prepare(`
      INSERT INTO risk_assessments (
        id, report_id, risk_score, risk_level, primary_suspected_disease,
        confidence_percentage, differential_diagnoses, contributing_factors,
        recommended_action, weather_factors, cluster_alert_flag, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    insertAssessment.run(
      `risk_${reportId}`,
      reportId,
      aiAssessment.risk_score,
      aiAssessment.risk_level,
      aiAssessment.primary_suspected_disease,
      aiAssessment.confidence_percentage,
      JSON.stringify(aiAssessment.differential_diagnoses),
      JSON.stringify(aiAssessment.contributing_factors),
      aiAssessment.recommended_action,
      JSON.stringify(aiAssessment.weather_factors),
      aiAssessment.cluster_alert_flag
    );

    // 6. Update Livestock Health Status
    db.prepare(`
      UPDATE livestock
      SET health_status = 'SICK', updated_at = datetime('now')
      WHERE id = ?
    `).run(animal_id);

    // 7. Generate Real-time Notification Alert for Field Vet & Admins
    if (aiAssessment.risk_score >= 60 || severity === 'CRITICAL' || severity === 'HIGH') {
      const alertId = `alt_${uuidv4().substring(0, 8)}`;
      db.prepare(`
        INSERT INTO alerts (id, alert_type, title, message, severity, target_role, target_district, target_taluka, target_user_id, related_report_id, is_read, created_at)
        VALUES (?, 'HIGH_RISK_ANIMAL', ?, ?, ?, 'FIELD_VET', ?, ?, ?, ?, 0, datetime('now'))
      `).run(
        alertId,
        `High-Risk Case: ${aiAssessment.primary_suspected_disease} (Ear Tag: ${animal.ear_tag_id})`,
        `AI Risk Score ${aiAssessment.risk_score}/100 (${aiAssessment.risk_level}). Symptoms: ${symptoms.slice(0, 3).join(', ')} in ${reportVillage}, ${reportTaluka}.`,
        aiAssessment.risk_level === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
        reportDistrict,
        reportTaluka,
        assignedVetId,
        reportId
      );
    }

    logAudit({
      userId: req.user?.id || 'offline_sync',
      userName: req.user?.full_name || 'Farmer Reporter',
      userRole: req.user?.role || 'FARMER',
      action: 'SUBMIT_HEALTH_REPORT',
      entity: 'HealthReport',
      entityId: reportId,
      newValue: { ear_tag_id: animal.ear_tag_id, symptoms, risk_score: aiAssessment.risk_score },
      ipAddress: req.ip
    });

    return res.status(201).json({
      success: true,
      message: 'Health report registered and AI risk assessment calculated',
      data: {
        report_id: reportId,
        animal_id,
        ear_tag_id: animal.ear_tag_id,
        riskAssessment: aiAssessment
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Veterinary Assessment & Clinical Action Update
router.post('/:id/assessment', authenticateToken, (req: AuthRequest, res) => {
  const { id } = req.params;
  const {
    status = 'UNDER_REVIEW',
    vet_notes,
    diagnosis,
    treatment_plan,
    quarantine_ordered = 0
  } = req.body;

  try {
    const existing = db.prepare(`SELECT * FROM health_reports WHERE id = ?`).get(id) as any;
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    const stmt = db.prepare(`
      UPDATE health_reports
      SET status = ?,
          vet_notes = COALESCE(?, vet_notes),
          diagnosis = COALESCE(?, diagnosis),
          treatment_plan = COALESCE(?, treatment_plan),
          quarantine_ordered = ?,
          assigned_vet_id = COALESCE(?, assigned_vet_id),
          version = version + 1,
          updated_at = datetime('now')
      WHERE id = ?
    `);

    stmt.run(
      status,
      vet_notes,
      diagnosis,
      treatment_plan,
      quarantine_ordered ? 1 : 0,
      req.user?.id,
      id
    );

    // Update Animal status if resolved or quarantined
    if (status === 'RESOLVED') {
      db.prepare(`UPDATE livestock SET health_status = 'HEALTHY', updated_at = datetime('now') WHERE id = ?`).run(existing.animal_id);
    } else if (quarantine_ordered) {
      db.prepare(`UPDATE livestock SET health_status = 'ISOLATED', updated_at = datetime('now') WHERE id = ?`).run(existing.animal_id);
    } else if (status === 'TREATMENT_STARTED') {
      db.prepare(`UPDATE livestock SET health_status = 'UNDER_TREATMENT', updated_at = datetime('now') WHERE id = ?`).run(existing.animal_id);
    }

    logAudit({
      userId: req.user!.id,
      userName: req.user!.full_name,
      userRole: req.user!.role,
      action: 'VET_CASE_UPDATE',
      entity: 'HealthReport',
      entityId: id as string,
      prevValue: existing.status,
      newValue: status,
      ipAddress: req.ip
    });

    return res.json({ success: true, message: 'Veterinary assessment updated successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Case Assignment
router.post('/:id/assign', authenticateToken, (req: AuthRequest, res) => {
  const { id } = req.params;
  const { vet_id } = req.body;

  try {
    db.prepare(`
      UPDATE health_reports
      SET assigned_vet_id = ?, status = CASE WHEN status = 'OPEN' THEN 'ASSIGNED' ELSE status END, updated_at = datetime('now')
      WHERE id = ?
    `).run(vet_id, id);

    return res.json({ success: true, message: 'Case assigned successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
