-- PashuRakshak SQLite Schema (Govt of Maharashtra - SIH26128)

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('FARMER', 'FIELD_VET', 'PARA_VET', 'LAB_TECH', 'DISTRICT_ADMIN', 'STATE_ADMIN')),
  district TEXT NOT NULL,
  taluka TEXT NOT NULL,
  village TEXT NOT NULL,
  language_pref TEXT DEFAULT 'mr',
  is_active INTEGER DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS farmer_profiles (
  user_id TEXT PRIMARY KEY,
  aadhar_last4 TEXT,
  farm_size_acres REAL DEFAULT 0,
  total_cattle INTEGER DEFAULT 0,
  total_buffalo INTEGER DEFAULT 0,
  total_goats INTEGER DEFAULT 0,
  total_sheep INTEGER DEFAULT 0,
  total_poultry INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS veterinary_workers (
  user_id TEXT PRIMARY KEY,
  registration_no TEXT UNIQUE,
  designation TEXT NOT NULL,
  assigned_taluka TEXT NOT NULL,
  assigned_district TEXT NOT NULL,
  center_name TEXT NOT NULL,
  phone_emergency TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS livestock (
  id TEXT PRIMARY KEY,
  ear_tag_id TEXT UNIQUE NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('Cattle', 'Buffalo', 'Goat', 'Sheep', 'Pig', 'Poultry')),
  breed TEXT NOT NULL,
  sex TEXT NOT NULL CHECK (sex IN ('MALE', 'FEMALE')),
  age_months INTEGER NOT NULL,
  owner_id TEXT NOT NULL,
  village TEXT NOT NULL,
  taluka TEXT NOT NULL,
  district TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  health_status TEXT NOT NULL DEFAULT 'HEALTHY' CHECK (health_status IN ('HEALTHY', 'SICK', 'UNDER_TREATMENT', 'ISOLATED', 'DECEASED')),
  vaccination_status TEXT NOT NULL DEFAULT 'UP_TO_DATE' CHECK (vaccination_status IN ('UP_TO_DATE', 'DUE_SOON', 'OVERDUE', 'UNVACCINATED')),
  last_vaccination_date TEXT,
  next_vaccination_due TEXT,
  previous_diseases TEXT DEFAULT '[]',
  photo_url TEXT,
  version INTEGER DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS health_reports (
  id TEXT PRIMARY KEY,
  local_id TEXT,
  animal_id TEXT NOT NULL,
  reporter_id TEXT NOT NULL,
  symptoms TEXT NOT NULL, -- JSON array of symptom strings
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  temperature_f REAL,
  photo_url TEXT,
  audio_url TEXT,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  village TEXT NOT NULL,
  taluka TEXT NOT NULL,
  district TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'ASSIGNED', 'UNDER_REVIEW', 'SAMPLE_REQUIRED', 'LAB_PENDING', 'DIAGNOSIS_AVAILABLE', 'TREATMENT_STARTED', 'CONTAINMENT', 'RESOLVED')),
  assigned_vet_id TEXT,
  vet_notes TEXT,
  diagnosis TEXT,
  treatment_plan TEXT,
  quarantine_ordered INTEGER DEFAULT 0,
  sync_status TEXT DEFAULT 'SYNCED' CHECK (sync_status IN ('PENDING', 'SYNCING', 'SYNCED', 'FAILED', 'CONFLICT')),
  version INTEGER DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (animal_id) REFERENCES livestock(id),
  FOREIGN KEY (reporter_id) REFERENCES users(id),
  FOREIGN KEY (assigned_vet_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS risk_assessments (
  id TEXT PRIMARY KEY,
  report_id TEXT UNIQUE NOT NULL,
  risk_score INTEGER NOT NULL, -- 0 to 100
  risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
  primary_suspected_disease TEXT NOT NULL,
  confidence_percentage INTEGER NOT NULL,
  differential_diagnoses TEXT NOT NULL, -- JSON array of {disease, confidence, reason}
  contributing_factors TEXT NOT NULL, -- JSON array of strings
  recommended_action TEXT NOT NULL,
  weather_factors TEXT, -- JSON summary of temp, humidity, anomaly
  cluster_alert_flag INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (report_id) REFERENCES health_reports(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lab_samples (
  id TEXT PRIMARY KEY,
  sample_code TEXT UNIQUE NOT NULL,
  report_id TEXT NOT NULL,
  animal_id TEXT NOT NULL,
  disease_suspected TEXT NOT NULL,
  sample_type TEXT NOT NULL,
  collection_date TEXT NOT NULL,
  collected_by TEXT NOT NULL,
  dispatch_date TEXT,
  lab_name TEXT NOT NULL,
  lab_received_date TEXT,
  test_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'COLLECTED' CHECK (status IN ('COLLECTED', 'DISPATCHED', 'LAB_RECEIVED', 'TESTING', 'RESULT_AVAILABLE', 'COMPLETED')),
  result TEXT NOT NULL DEFAULT 'PENDING' CHECK (result IN ('PENDING', 'POSITIVE', 'NEGATIVE', 'INCONCLUSIVE')),
  confirmed_disease TEXT,
  test_notes TEXT,
  tested_by TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (report_id) REFERENCES health_reports(id),
  FOREIGN KEY (animal_id) REFERENCES livestock(id)
);

CREATE TABLE IF NOT EXISTS vaccinations (
  id TEXT PRIMARY KEY,
  animal_id TEXT NOT NULL,
  vaccine_name TEXT NOT NULL,
  batch_no TEXT NOT NULL,
  dose_number INTEGER DEFAULT 1,
  administered_date TEXT NOT NULL,
  next_due_date TEXT NOT NULL,
  administered_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('COMPLETED', 'SCHEDULED', 'OVERDUE')),
  remarks TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (animal_id) REFERENCES livestock(id)
);

CREATE TABLE IF NOT EXISTS vaccination_campaigns (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  disease_target TEXT NOT NULL,
  district TEXT NOT NULL,
  talukas TEXT NOT NULL, -- JSON array
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  target_count INTEGER NOT NULL,
  achieved_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('PLANNED', 'ACTIVE', 'COMPLETED')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS outbreaks (
  id TEXT PRIMARY KEY,
  outbreak_code TEXT UNIQUE NOT NULL,
  disease TEXT NOT NULL,
  district TEXT NOT NULL,
  taluka TEXT NOT NULL,
  epicenter_village TEXT NOT NULL,
  center_lat REAL NOT NULL,
  center_lng REAL NOT NULL,
  radius_km REAL NOT NULL,
  affected_villages_count INTEGER NOT NULL,
  active_cases_count INTEGER NOT NULL,
  mortality_count INTEGER NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
  detected_date TEXT NOT NULL,
  containment_zone_active INTEGER DEFAULT 1,
  assigned_rapid_response_team TEXT NOT NULL,
  advisory_broadcast_sent INTEGER DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  alert_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL')),
  target_role TEXT,
  target_district TEXT,
  target_taluka TEXT,
  target_user_id TEXT,
  related_report_id TEXT,
  is_read INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  prev_value TEXT,
  new_value TEXT,
  ip_address TEXT,
  timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sync_conflicts (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  server_version INTEGER NOT NULL,
  local_version INTEGER NOT NULL,
  server_payload TEXT NOT NULL,
  local_payload TEXT NOT NULL,
  resolved INTEGER DEFAULT 0,
  resolved_by TEXT,
  resolved_at TEXT,
  resolution_strategy TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_livestock_owner ON livestock(owner_id);
CREATE INDEX IF NOT EXISTS idx_livestock_district ON livestock(district, taluka, village);
CREATE INDEX IF NOT EXISTS idx_reports_status ON health_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_district ON health_reports(district, taluka);
CREATE INDEX IF NOT EXISTS idx_outbreaks_district ON outbreaks(district);
CREATE INDEX IF NOT EXISTS idx_alerts_target ON alerts(target_role, target_district);
