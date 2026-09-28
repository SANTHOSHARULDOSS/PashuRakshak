import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/db.js';
import { AuthRequest, authenticateToken } from '../middleware/auth.js';
import { assessLivestockRisk } from '../ai/riskAssessor.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

// Batch Sync Queue from Offline Client
router.post('/', authenticateToken, (req: AuthRequest, res) => {
  const { queue = [] } = req.body; // array of { localId, operation, payload, clientVersion, timestamp }

  if (!Array.isArray(queue) || queue.length === 0) {
    return res.json({ success: true, message: 'No items to sync', results: { synced: [], conflicts: [] } });
  }

  const syncedResults: any[] = [];
  const conflictResults: any[] = [];

  const runSyncTransaction = db.transaction(() => {
    for (const item of queue) {
      const { localId, operation, payload, clientVersion = 1, timestamp } = item;

      try {
        if (operation === 'CREATE_REPORT') {
          // Check if already synced by localId
          const existing = db.prepare(`SELECT id FROM health_reports WHERE local_id = ?`).get(localId) as any;
          if (existing) {
            syncedResults.push({ localId, serverId: existing.id, status: 'ALREADY_SYNCED' });
            continue;
          }

          const serverId = `rep_${uuidv4().substring(0, 8)}`;
          const animal = db.prepare(`SELECT * FROM livestock WHERE id = ?`).get(payload.animal_id) as any;

          const reportLat = payload.latitude || animal?.latitude || 18.8247;
          const reportLng = payload.longitude || animal?.longitude || 74.3412;
          const reportVillage = payload.village || animal?.village || 'Nighoj';
          const reportTaluka = payload.taluka || animal?.taluka || 'Shirur';
          const reportDistrict = payload.district || animal?.district || 'Pune';

          // AI Assessment
          const assessment = assessLivestockRisk({
            species: animal?.species || 'Cattle',
            symptoms: payload.symptoms || [],
            severity: payload.severity || 'MEDIUM',
            temperature_f: payload.temperature_f ? Number(payload.temperature_f) : undefined,
            vaccination_status: animal?.vaccination_status,
            latitude: reportLat,
            longitude: reportLng,
            district: reportDistrict,
            taluka: reportTaluka
          });

          // Insert Report
          db.prepare(`
            INSERT INTO health_reports (
              id, local_id, animal_id, reporter_id, symptoms, severity,
              temperature_f, photo_url, audio_url, latitude, longitude,
              village, taluka, district, status, sync_status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', 'SYNCED', ?, datetime('now'))
          `).run(
            serverId,
            localId,
            payload.animal_id,
            req.user?.id || payload.reporter_id || animal?.owner_id,
            JSON.stringify(payload.symptoms || []),
            payload.severity || 'MEDIUM',
            payload.temperature_f ? Number(payload.temperature_f) : null,
            payload.photo_url || null,
            payload.audio_url || null,
            reportLat,
            reportLng,
            reportVillage,
            reportTaluka,
            reportDistrict,
            timestamp || new Date().toISOString()
          );

          // Insert AI Assessment
          db.prepare(`
            INSERT INTO risk_assessments (
              id, report_id, risk_score, risk_level, primary_suspected_disease,
              confidence_percentage, differential_diagnoses, contributing_factors,
              recommended_action, weather_factors, cluster_alert_flag, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
          `).run(
            `risk_${serverId}`,
            serverId,
            assessment.risk_score,
            assessment.risk_level,
            assessment.primary_suspected_disease,
            assessment.confidence_percentage,
            JSON.stringify(assessment.differential_diagnoses),
            JSON.stringify(assessment.contributing_factors),
            assessment.recommended_action,
            JSON.stringify(assessment.weather_factors),
            assessment.cluster_alert_flag
          );

          // Update Livestock
          db.prepare(`UPDATE livestock SET health_status = 'SICK', updated_at = datetime('now') WHERE id = ?`).run(payload.animal_id);

          syncedResults.push({
            localId,
            serverId,
            operation,
            status: 'SYNCED',
            riskAssessment: assessment
          });
        } else if (operation === 'UPDATE_ANIMAL') {
          const currentAnimal = db.prepare(`SELECT * FROM livestock WHERE id = ?`).get(payload.id) as any;

          if (!currentAnimal) {
            continue;
          }

          // Conflict detection: if server was modified while client was offline
          if (currentAnimal.version > clientVersion) {
            const conflictId = `cnf_${uuidv4().substring(0, 8)}`;
            db.prepare(`
              INSERT INTO sync_conflicts (
                id, entity_type, entity_id, server_version, local_version,
                server_payload, local_payload, resolved, created_at
              ) VALUES (?, 'LIVESTOCK', ?, ?, ?, ?, ?, 0, datetime('now'))
            `).run(
              conflictId,
              payload.id,
              currentAnimal.version,
              clientVersion,
              JSON.stringify(currentAnimal),
              JSON.stringify(payload)
            );

            conflictResults.push({
              conflictId,
              entityType: 'LIVESTOCK',
              entityId: payload.id,
              serverVersion: currentAnimal.version,
              localVersion: clientVersion,
              serverData: currentAnimal,
              localData: payload
            });
            continue;
          }

          // Apply clean update
          db.prepare(`
            UPDATE livestock
            SET health_status = COALESCE(?, health_status),
                vaccination_status = COALESCE(?, vaccination_status),
                version = version + 1,
                updated_at = datetime('now')
            WHERE id = ?
          `).run(payload.health_status, payload.vaccination_status, payload.id);

          syncedResults.push({ localId, serverId: payload.id, operation, status: 'SYNCED' });
        }
      } catch (itemErr: any) {
        console.error('[Sync Item Error]', itemErr);
      }
    }
  });

  try {
    runSyncTransaction();

    logAudit({
      userId: req.user?.id || 'sync_system',
      userName: req.user?.full_name || 'Field Sync Client',
      userRole: req.user?.role || 'FARMER',
      action: 'PROCESS_OFFLINE_SYNC_BATCH',
      entity: 'SyncQueue',
      entityId: `batch_${Date.now()}`,
      newValue: { syncedCount: syncedResults.length, conflictCount: conflictResults.length },
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: `Offline synchronization completed (${syncedResults.length} synced, ${conflictResults.length} conflicts)`,
      results: {
        synced: syncedResults,
        conflicts: conflictResults
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// List Unresolved Conflicts
router.get('/conflicts', authenticateToken, (req: AuthRequest, res) => {
  try {
    const conflicts = db.prepare(`SELECT * FROM sync_conflicts WHERE resolved = 0 ORDER BY created_at DESC`).all();
    const formatted = conflicts.map((c: any) => ({
      ...c,
      server_payload: JSON.parse(c.server_payload),
      local_payload: JSON.parse(c.local_payload)
    }));
    return res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Resolve Conflict
router.post('/conflicts/:id/resolve', authenticateToken, (req: AuthRequest, res) => {
  const { id } = req.params;
  const { resolution_strategy = 'SERVER_WINS', resolved_payload } = req.body;

  try {
    const conflict = db.prepare(`SELECT * FROM sync_conflicts WHERE id = ?`).get(id) as any;
    if (!conflict) {
      return res.status(404).json({ success: false, message: 'Conflict record not found' });
    }

    if (resolution_strategy === 'LOCAL_WINS' || resolution_strategy === 'MERGED') {
      const dataToApply = resolved_payload || JSON.parse(conflict.local_payload);

      if (conflict.entity_type === 'LIVESTOCK') {
        db.prepare(`
          UPDATE livestock
          SET health_status = COALESCE(?, health_status),
              vaccination_status = COALESCE(?, vaccination_status),
              version = version + 1,
              updated_at = datetime('now')
          WHERE id = ?
        `).run(dataToApply.health_status, dataToApply.vaccination_status, conflict.entity_id);
      }
    }

    db.prepare(`
      UPDATE sync_conflicts
      SET resolved = 1,
          resolved_by = ?,
          resolved_at = datetime('now'),
          resolution_strategy = ?
      WHERE id = ?
    `).run(req.user?.full_name || 'Admin', resolution_strategy, id);

    logAudit({
      userId: req.user!.id,
      userName: req.user!.full_name,
      userRole: req.user!.role,
      action: 'RESOLVE_SYNC_CONFLICT',
      entity: 'SyncConflict',
      entityId: id as string,
      newValue: { strategy: resolution_strategy },
      ipAddress: req.ip
    });

    return res.json({ success: true, message: `Conflict resolved using ${resolution_strategy}` });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
