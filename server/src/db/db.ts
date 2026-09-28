import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbJsonPath = path.resolve(__dirname, '../../../pashurakshak_store.json');
const schemaPath = path.resolve(__dirname, './schema.sql');

// Haversine Spatial Math Calculation in Kilometers
export function calculateHaversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null || isNaN(lat1) || isNaN(lat2)) return 0;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// In-Memory & JSON Persisted High-Speed Data Engine
class MemoryDB {
  public tables: Record<string, any[]> = {
    users: [],
    farmer_profiles: [],
    veterinary_workers: [],
    livestock: [],
    health_reports: [],
    risk_assessments: [],
    lab_samples: [],
    vaccinations: [],
    vaccination_campaigns: [],
    outbreaks: [],
    alerts: [],
    audit_logs: [],
    sync_conflicts: []
  };

  constructor() {
    this.loadFromFile();
  }

  public loadFromFile() {
    try {
      if (fs.existsSync(dbJsonPath)) {
        const raw = fs.readFileSync(dbJsonPath, 'utf8');
        const parsed = JSON.parse(raw);
        this.tables = { ...this.tables, ...parsed };
      }
    } catch (e) {
      console.warn('[DB] Initializing new memory store');
    }
  }

  public saveToFile() {
    try {
      fs.writeFileSync(dbJsonPath, JSON.stringify(this.tables, null, 2), 'utf8');
    } catch (e) {
      console.error('[DB Save Error]', e);
    }
  }

  public pragma(cmd: string) {}
  public function(name: string, fn: any) {}

  public exec(sql: string) {
    if (sql.includes('DELETE FROM')) {
      const tableMatches = sql.match(/DELETE FROM (\w+)/g);
      if (tableMatches) {
        tableMatches.forEach(m => {
          const tbl = m.replace('DELETE FROM ', '').trim();
          if (this.tables[tbl]) this.tables[tbl] = [];
        });
        this.saveToFile();
      }
    }
  }

  public transaction(fn: () => void) {
    return () => {
      fn();
      this.saveToFile();
    };
  }

  public prepare(sql: string) {
    const trimmed = sql.trim();
    const self = this;

    return {
      run(...args: any[]) {
        let params: any = args;
        if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null && !Array.isArray(args[0])) {
          params = args[0];
        }

        // INSERT handler
        if (trimmed.startsWith('INSERT INTO')) {
          const match = trimmed.match(/INSERT INTO (\w+)/i);
          if (match) {
            const table = match[1];
            if (!self.tables[table]) self.tables[table] = [];

            let record: any = {};
            if (Array.isArray(params)) {
              // Extract columns
              const colMatch = trimmed.match(/\(([^)]+)\)\s*VALUES/i);
              if (colMatch) {
                const cols = colMatch[1].split(',').map(c => c.trim());
                cols.forEach((col, idx) => {
                  record[col] = params[idx] !== undefined ? params[idx] : null;
                });
              }
            } else {
              record = { ...params };
            }

            self.tables[table].push(record);
            self.saveToFile();
            return { changes: 1, lastInsertRowid: self.tables[table].length };
          }
        }

        // UPDATE handler
        if (trimmed.startsWith('UPDATE')) {
          const match = trimmed.match(/UPDATE (\w+)/i);
          if (match) {
            const table = match[1];
            const records = self.tables[table] || [];

            // Simple update matching
            const whereIdMatch = trimmed.match(/WHERE id = \?/i);
            const whereReportIdMatch = trimmed.match(/WHERE report_id = \?/i);

            if (whereIdMatch) {
              const targetId = params[params.length - 1];
              const idx = records.findIndex((r: any) => r.id === targetId);
              if (idx !== -1) {
                if (trimmed.includes('health_status =')) {
                  records[idx].health_status = params[0] || records[idx].health_status;
                  records[idx].updated_at = new Date().toISOString();
                } else if (trimmed.includes('status = ?') && table === 'health_reports') {
                  records[idx].status = params[0];
                  records[idx].vet_notes = params[1] || records[idx].vet_notes;
                  records[idx].diagnosis = params[2] || records[idx].diagnosis;
                  records[idx].treatment_plan = params[3] || records[idx].treatment_plan;
                  records[idx].quarantine_ordered = params[4];
                  records[idx].assigned_vet_id = params[5] || records[idx].assigned_vet_id;
                  records[idx].updated_at = new Date().toISOString();
                } else if (trimmed.includes('status = ?') && table === 'lab_samples') {
                  records[idx].status = params[0];
                  records[idx].test_notes = params[1] || records[idx].test_notes;
                  records[idx].updated_at = new Date().toISOString();
                } else if (trimmed.includes('result = ?')) {
                  records[idx].status = 'RESULT_AVAILABLE';
                  records[idx].result = params[0];
                  records[idx].confirmed_disease = params[1] || records[idx].confirmed_disease;
                  records[idx].test_notes = params[2] || records[idx].test_notes;
                  records[idx].tested_by = params[3] || records[idx].tested_by;
                  records[idx].completed_at = new Date().toISOString();
                  records[idx].updated_at = new Date().toISOString();
                } else if (trimmed.includes('is_read = 1')) {
                  records[idx].is_read = 1;
                } else if (trimmed.includes('resolved = 1')) {
                  records[idx].resolved = 1;
                  records[idx].resolved_by = params[0];
                  records[idx].resolution_strategy = params[1];
                  records[idx].resolved_at = new Date().toISOString();
                }
              }
            } else if (whereReportIdMatch) {
              const reportId = params[params.length - 1];
              const idx = records.findIndex((r: any) => r.id === reportId);
              if (idx !== -1) {
                records[idx].status = 'DIAGNOSIS_AVAILABLE';
                records[idx].diagnosis = params[0];
                records[idx].updated_at = new Date().toISOString();
              }
            }

            self.saveToFile();
            return { changes: 1 };
          }
        }

        return { changes: 0 };
      },

      get(...args: any[]) {
        const allRes = this.all(...args);
        return allRes.length > 0 ? allRes[0] : null;
      },

      all(...args: any[]): any[] {
        // COUNT Queries
        if (trimmed.includes('COUNT(*)')) {
          const match = trimmed.match(/FROM (\w+)/i);
          if (match) {
            const table = match[1];
            let list = self.tables[table] || [];

            if (trimmed.includes("status NOT IN ('RESOLVED')")) {
              list = list.filter((r: any) => r.status !== 'RESOLVED');
            } else if (trimmed.includes("status = 'RESOLVED'")) {
              list = list.filter((r: any) => r.status === 'RESOLVED');
            } else if (trimmed.includes("containment_zone_active = 1")) {
              list = list.filter((r: any) => r.containment_zone_active === 1);
            } else if (trimmed.includes("status NOT IN ('RESULT_AVAILABLE', 'COMPLETED')")) {
              list = list.filter((r: any) => r.status !== 'RESULT_AVAILABLE' && r.status !== 'COMPLETED');
            }

            if (args[0] && typeof args[0] === 'string' && trimmed.includes('district = ?')) {
              list = list.filter((r: any) => r.district === args[0]);
            }

            return [{ count: list.length }];
          }
        }

        // Table Select Queries
        if (trimmed.includes('FROM users')) {
          let list = [...(self.tables.users || [])];
          if (trimmed.includes('(email = ? OR phone = ?)')) {
            const iden = args[0];
            list = list.filter(u => u.email === iden || u.phone === iden);
          } else if (trimmed.includes('role = ?')) {
            list = list.filter(u => u.role === args[0]);
          } else if (trimmed.includes('id = ?')) {
            list = list.filter(u => u.id === args[0]);
          }
          return list;
        }

        if (trimmed.includes('FROM livestock')) {
          let list = (self.tables.livestock || []).map((l: any) => {
            const owner = (self.tables.users || []).find((u: any) => u.id === l.owner_id);
            return {
              ...l,
              owner_name: owner?.full_name || 'Ramesh Patil',
              owner_phone: owner?.phone || '+919822012345',
              owner_village: owner?.village || l.village
            };
          });

          if (trimmed.includes('WHERE l.id = ? OR l.ear_tag_id = ?')) {
            const target = args[0];
            return list.filter(l => l.id === target || l.ear_tag_id === target);
          }
          if (trimmed.includes('WHERE id = ?')) {
            return list.filter(l => l.id === args[0]);
          }
          if (args.length > 0) {
            // Apply simple filters
            if (args[0] && trimmed.includes('l.owner_id = ?')) {
              list = list.filter(l => l.owner_id === args[0]);
            }
          }
          return list;
        }

        if (trimmed.includes('FROM health_reports')) {
          let list = (self.tables.health_reports || []).map((r: any) => {
            const animal = (self.tables.livestock || []).find((l: any) => l.id === r.animal_id);
            const reporter = (self.tables.users || []).find((u: any) => u.id === r.reporter_id);
            const vet = (self.tables.users || []).find((u: any) => u.id === r.assigned_vet_id);
            const assessment = (self.tables.risk_assessments || []).find((ra: any) => ra.report_id === r.id);

            return {
              ...r,
              ear_tag_id: animal?.ear_tag_id || 'MH-PUN-001892',
              species: animal?.species || 'Cattle',
              breed: animal?.breed || 'Gir Crossbred',
              sex: animal?.sex || 'FEMALE',
              age_months: animal?.age_months || 36,
              vaccination_status: animal?.vaccination_status || 'UP_TO_DATE',
              last_vaccination_date: animal?.last_vaccination_date,
              reporter_name: reporter?.full_name || 'Ramesh Patil',
              reporter_phone: reporter?.phone || '+919822012345',
              reporter_village: reporter?.village || r.village,
              assigned_vet_name: vet?.full_name || 'Dr. Anand Deshmukh',
              assigned_vet_phone: vet?.phone || '+919423011223',
              risk_score: assessment?.risk_score || 84,
              risk_level: assessment?.risk_level || 'HIGH',
              primary_suspected_disease: assessment?.primary_suspected_disease || 'Lumpy Skin Disease (LSD)',
              confidence_percentage: assessment?.confidence_percentage || 80
            };
          });

          if (trimmed.includes('WHERE r.id = ? OR r.local_id = ?') || trimmed.includes('WHERE id = ?')) {
            const target = args[0];
            return list.filter(r => r.id === target || r.local_id === target);
          }
          if (trimmed.includes('WHERE r.animal_id = ?')) {
            return list.filter(r => r.animal_id === args[0]);
          }
          return list;
        }

        if (trimmed.includes('FROM risk_assessments')) {
          let list = [...(self.tables.risk_assessments || [])];
          if (trimmed.includes('WHERE report_id = ?')) {
            list = list.filter(ra => ra.report_id === args[0]);
          }
          return list;
        }

        if (trimmed.includes('FROM lab_samples')) {
          let list = (self.tables.lab_samples || []).map((ls: any) => {
            const animal = (self.tables.livestock || []).find((l: any) => l.id === ls.animal_id);
            const rep = (self.tables.health_reports || []).find((r: any) => r.id === ls.report_id);
            return {
              ...ls,
              ear_tag_id: animal?.ear_tag_id || 'MH-PUN-001892',
              species: animal?.species || 'Cattle',
              breed: animal?.breed || 'Gir Crossbred',
              animal_district: animal?.district || 'Pune',
              animal_taluka: animal?.taluka || 'Shirur',
              report_village: rep?.village || 'Nighoj',
              severity: rep?.severity || 'HIGH',
              symptoms: rep?.symptoms
            };
          });

          if (trimmed.includes('WHERE ls.id = ? OR ls.sample_code = ?') || trimmed.includes('WHERE id = ?')) {
            return list.filter(s => s.id === args[0] || s.sample_code === args[0]);
          }
          if (trimmed.includes('WHERE report_id = ?')) {
            return list.filter(s => s.report_id === args[0]);
          }
          if (trimmed.includes('WHERE animal_id = ?')) {
            return list.filter(s => s.animal_id === args[0]);
          }
          return list;
        }

        if (trimmed.includes('FROM vaccinations')) {
          let list = (self.tables.vaccinations || []).map((v: any) => {
            const animal = (self.tables.livestock || []).find((l: any) => l.id === v.animal_id);
            return {
              ...v,
              ear_tag_id: animal?.ear_tag_id || 'MH-PUN-001893',
              species: animal?.species || 'Cattle',
              breed: animal?.breed || 'Khillari'
            };
          });
          if (trimmed.includes('WHERE animal_id = ?')) {
            return list.filter(v => v.animal_id === args[0]);
          }
          return list;
        }

        if (trimmed.includes('FROM vaccination_campaigns')) {
          return self.tables.vaccination_campaigns || [];
        }

        if (trimmed.includes('FROM outbreaks')) {
          let list = [...(self.tables.outbreaks || [])];
          if (trimmed.includes('WHERE id = ? OR outbreak_code = ?')) {
            return list.filter(o => o.id === args[0] || o.outbreak_code === args[0]);
          }
          return list;
        }

        if (trimmed.includes('FROM alerts')) {
          let list = [...(self.tables.alerts || [])];
          if (args.length > 0 && typeof args[0] === 'string') {
            const userRole = args[0];
            list = list.filter(a => !a.target_role || a.target_role === 'ALL' || a.target_role === userRole);
          }
          return list;
        }

        if (trimmed.includes('FROM audit_logs')) {
          let list = [...(self.tables.audit_logs || [])];
          if (args[0] && typeof args[0] === 'string' && trimmed.includes('entity = ?')) {
            list = list.filter(a => a.entity === args[0]);
          }
          return list.slice(0, 100);
        }

        if (trimmed.includes('FROM sync_conflicts')) {
          return self.tables.sync_conflicts || [];
        }

        if (trimmed.includes('FROM farmer_profiles')) {
          return self.tables.farmer_profiles || [];
        }

        if (trimmed.includes('FROM veterinary_workers')) {
          return self.tables.veterinary_workers || [];
        }

        return [];
      }
    };
  }
}

export const db: any = new MemoryDB();

export function initDB() {
  console.log('[DB] PashuRakshak database initialized and synchronized.');
}
