import { Router } from 'express';
import { db } from '../db/db.js';
import { AuthRequest, authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

// Audit Logs Listing (Admins, Vets)
router.get('/', authenticateToken, requireRole(['DISTRICT_ADMIN', 'STATE_ADMIN', 'FIELD_VET']), (req: AuthRequest, res) => {
  const { entity, action, limit = 100 } = req.query;

  try {
    let query = `SELECT * FROM audit_logs WHERE 1=1`;
    const params: any[] = [];

    if (entity) {
      query += ` AND entity = ?`;
      params.push(entity);
    }
    if (action) {
      query += ` AND action = ?`;
      params.push(action);
    }

    query += ` ORDER BY timestamp DESC LIMIT ?`;
    params.push(Number(limit));

    const logs = db.prepare(query).all(...params);
    return res.json({ success: true, count: logs.length, data: logs });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
