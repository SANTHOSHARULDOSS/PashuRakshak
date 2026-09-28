import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/db.js';
import { AuthRequest, authenticateToken } from '../middleware/auth.js';

const router = Router();

// List Alerts for current user's role and district
router.get('/', authenticateToken, (req: AuthRequest, res) => {
  const { is_read } = req.query;

  try {
    let query = `
      SELECT * FROM alerts
      WHERE (
        target_role = ?
        OR target_role = 'ALL'
        OR target_role IS NULL
        OR target_user_id = ?
      )
      AND (
        target_district = ?
        OR target_district = 'ALL'
        OR target_district IS NULL
      )
    `;
    const params: any[] = [
      req.user?.role || 'FARMER',
      req.user?.id || '',
      req.user?.district || 'Pune'
    ];

    if (is_read !== undefined) {
      query += ` AND is_read = ?`;
      params.push(is_read === 'true' ? 1 : 0);
    }

    query += ` ORDER BY created_at DESC LIMIT 50`;

    const alerts = db.prepare(query).all(...params);
    return res.json({ success: true, count: alerts.length, data: alerts });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Mark alert as read
router.patch('/:id/read', authenticateToken, (req: AuthRequest, res) => {
  const { id } = req.params;

  try {
    db.prepare(`UPDATE alerts SET is_read = 1 WHERE id = ?`).run(id);
    return res.json({ success: true, message: 'Alert marked as read' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Admin Broadcast Advisory
router.post('/broadcast', authenticateToken, (req: AuthRequest, res) => {
  const {
    title,
    message,
    severity = 'WARNING',
    target_role = 'FARMER',
    target_district,
    target_taluka
  } = req.body;

  if (!title || !message) {
    return res.status(400).json({ success: false, message: 'Title and message are required' });
  }

  try {
    const id = `alt_${uuidv4().substring(0, 8)}`;
    db.prepare(`
      INSERT INTO alerts (id, alert_type, title, message, severity, target_role, target_district, target_taluka, is_read, created_at)
      VALUES (?, 'CONTAINMENT_ADVISORY', ?, ?, ?, ?, ?, ?, 0, datetime('now'))
    `).run(
      id,
      title,
      message,
      severity,
      target_role,
      target_district || req.user?.district || 'Pune',
      target_taluka || null
    );

    return res.status(201).json({
      success: true,
      message: 'Advisory broadcast distributed to field users',
      data: { id }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
