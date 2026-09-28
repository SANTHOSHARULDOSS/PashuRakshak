import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/db.js';
import { AuthRequest, authenticateToken } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

// List Lab Samples
router.get('/samples', authenticateToken, (req: AuthRequest, res) => {
  const { status, result, disease_suspected, test_type, search } = req.query;

  try {
    let query = `
      SELECT ls.*,
             l.ear_tag_id, l.species, l.breed, l.district as animal_district, l.taluka as animal_taluka,
             r.severity, r.village as report_village
      FROM lab_samples ls
      LEFT JOIN livestock l ON ls.animal_id = l.id
      LEFT JOIN health_reports r ON ls.report_id = r.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      query += ` AND ls.status = ?`;
      params.push(status);
    }
    if (result) {
      query += ` AND ls.result = ?`;
      params.push(result);
    }
    if (disease_suspected) {
      query += ` AND ls.disease_suspected LIKE ?`;
      params.push(`%${disease_suspected}%`);
    }
    if (test_type) {
      query += ` AND ls.test_type LIKE ?`;
      params.push(`%${test_type}%`);
    }
    if (search) {
      query += ` AND (ls.sample_code LIKE ? OR l.ear_tag_id LIKE ? OR ls.lab_name LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += ` ORDER BY ls.created_at DESC`;

    const samples = db.prepare(query).all(...params);
    return res.json({ success: true, count: samples.length, data: samples });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Single Lab Sample Detail
router.get('/samples/:id', authenticateToken, (req: AuthRequest, res) => {
  const { id } = req.params;

  try {
    const sample = db.prepare(`
      SELECT ls.*,
             l.ear_tag_id, l.species, l.breed, l.district as animal_district, l.taluka as animal_taluka,
             r.severity, r.symptoms, r.diagnosis as initial_vet_diagnosis
      FROM lab_samples ls
      LEFT JOIN livestock l ON ls.animal_id = l.id
      LEFT JOIN health_reports r ON ls.report_id = r.id
      WHERE ls.id = ? OR ls.sample_code = ?
    `).get(id, id) as any;

    if (!sample) {
      return res.status(404).json({ success: false, message: 'Lab sample not found' });
    }

    return res.json({ success: true, data: sample });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Create Lab Sample Referral (Vet initiates diagnostic test)
router.post('/samples', authenticateToken, (req: AuthRequest, res) => {
  const {
    report_id,
    animal_id,
    disease_suspected,
    sample_type,
    test_type,
    lab_name = 'District Animal Disease Diagnostic Laboratory, Pune'
  } = req.body;

  if (!report_id || !animal_id || !disease_suspected || !sample_type || !test_type) {
    return res.status(400).json({ success: false, message: 'Missing required lab referral fields' });
  }

  try {
    const id = `lab_smp_${uuidv4().substring(0, 8)}`;
    const sampleCode = `LAB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const stmt = db.prepare(`
      INSERT INTO lab_samples (
        id, sample_code, report_id, animal_id, disease_suspected,
        sample_type, collection_date, collected_by, dispatch_date,
        lab_name, test_type, status, result, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), ?, datetime('now'), ?, ?, 'DISPATCHED', 'PENDING', datetime('now'), datetime('now'))
    `);

    stmt.run(
      id,
      sampleCode,
      report_id,
      animal_id,
      disease_suspected,
      sample_type,
      req.user?.full_name || 'Field Veterinarian',
      lab_name,
      test_type
    );

    // Update Report Status to LAB_PENDING
    db.prepare(`
      UPDATE health_reports
      SET status = 'LAB_PENDING', updated_at = datetime('now')
      WHERE id = ?
    `).run(report_id);

    logAudit({
      userId: req.user!.id,
      userName: req.user!.full_name,
      userRole: req.user!.role,
      action: 'CREATE_LAB_REFERRAL',
      entity: 'LabSample',
      entityId: id,
      newValue: { sampleCode, disease_suspected, test_type },
      ipAddress: req.ip
    });

    return res.status(201).json({
      success: true,
      message: 'Diagnostic sample referral created and dispatched to lab',
      data: { id, sample_code: sampleCode }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Update Sample Status Lifecycle (LAB_RECEIVED, TESTING)
router.patch('/samples/:id/status', authenticateToken, (req: AuthRequest, res) => {
  const { id } = req.params;
  const { status, test_notes } = req.body;

  try {
    const existing = db.prepare(`SELECT * FROM lab_samples WHERE id = ?`).get(id) as any;
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Sample not found' });
    }

    let extraUpdates = '';
    const params: any[] = [status, test_notes || existing.test_notes];

    if (status === 'LAB_RECEIVED' && !existing.lab_received_date) {
      extraUpdates += `, lab_received_date = datetime('now')`;
    }

    db.prepare(`
      UPDATE lab_samples
      SET status = ?, test_notes = ?, updated_at = datetime('now') ${extraUpdates}
      WHERE id = ?
    `).run(...params, id);

    logAudit({
      userId: req.user!.id,
      userName: req.user!.full_name,
      userRole: req.user!.role,
      action: 'UPDATE_SAMPLE_STATUS',
      entity: 'LabSample',
      entityId: id as string,
      prevValue: existing.status,
      newValue: status,
      ipAddress: req.ip
    });

    return res.json({ success: true, message: `Sample status updated to ${status}` });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Record Lab Test Result (POSITIVE / NEGATIVE / INCONCLUSIVE)
router.post('/samples/:id/result', authenticateToken, (req: AuthRequest, res) => {
  const { id } = req.params;
  const {
    result,
    confirmed_disease,
    test_notes
  } = req.body;

  if (!result) {
    return res.status(400).json({ success: false, message: 'Diagnostic result is required' });
  }

  try {
    const sample = db.prepare(`SELECT * FROM lab_samples WHERE id = ?`).get(id) as any;
    if (!sample) {
      return res.status(404).json({ success: false, message: 'Sample not found' });
    }

    // 1. Update Lab Sample
    db.prepare(`
      UPDATE lab_samples
      SET status = 'RESULT_AVAILABLE',
          result = ?,
          confirmed_disease = ?,
          test_notes = COALESCE(?, test_notes),
          tested_by = ?,
          completed_at = datetime('now'),
          updated_at = datetime('now')
      WHERE id = ?
    `).run(
      result,
      confirmed_disease || sample.disease_suspected,
      test_notes,
      req.user?.full_name || 'Dr. Priya Kulkarni',
      id
    );

    // 2. Update Linked Case Report Status
    db.prepare(`
      UPDATE health_reports
      SET status = 'DIAGNOSIS_AVAILABLE',
          diagnosis = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `).run(
      result === 'POSITIVE' ? `Confirmed: ${confirmed_disease || sample.disease_suspected}` : 'Laboratory Negative / Non-pathogenic',
      sample.report_id
    );

    // 3. Generate Alert if Positive
    if (result === 'POSITIVE') {
      const report = db.prepare(`SELECT * FROM health_reports WHERE id = ?`).get(sample.report_id) as any;
      const animal = db.prepare(`SELECT * FROM livestock WHERE id = ?`).get(sample.animal_id) as any;

      db.prepare(`
        INSERT INTO alerts (id, alert_type, title, message, severity, target_role, target_district, target_taluka, related_report_id, is_read, created_at)
        VALUES (?, 'LAB_RESULT_AVAILABLE', ?, ?, 'CRITICAL', 'FIELD_VET', ?, ?, ?, 0, datetime('now'))
      `).run(
        `alt_${uuidv4().substring(0, 8)}`,
        `Lab Result POSITIVE: ${confirmed_disease || sample.disease_suspected}`,
        `Sample ${sample.sample_code} confirmed positive for ${animal.ear_tag_id} in ${report.village}, ${report.taluka}. Immediate containment & ring vaccination recommended.`,
        report.district,
        report.taluka,
        sample.report_id
      );
    }

    logAudit({
      userId: req.user!.id,
      userName: req.user!.full_name,
      userRole: req.user!.role,
      action: 'RECORD_LAB_RESULT',
      entity: 'LabSample',
      entityId: id as string,
      newValue: { result, confirmed_disease },
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: 'Diagnostic test result recorded and case workflow updated'
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
