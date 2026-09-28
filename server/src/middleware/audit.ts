import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/db.js';

export interface AuditParams {
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entity: string;
  entityId: string;
  prevValue?: any;
  newValue?: any;
  ipAddress?: string;
}

export function logAudit(params: AuditParams) {
  try {
    const stmt = db.prepare(`
      INSERT INTO audit_logs (id, user_id, user_name, user_role, action, entity, entity_id, prev_value, new_value, ip_address, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    stmt.run(
      `aud_${uuidv4().substring(0, 8)}`,
      params.userId,
      params.userName,
      params.userRole,
      params.action,
      params.entity,
      params.entityId,
      params.prevValue ? (typeof params.prevValue === 'string' ? params.prevValue : JSON.stringify(params.prevValue)) : null,
      params.newValue ? (typeof params.newValue === 'string' ? params.newValue : JSON.stringify(params.newValue)) : null,
      params.ipAddress || '127.0.0.1'
    );
  } catch (err) {
    console.error('[Audit Log Error]', err);
  }
}
