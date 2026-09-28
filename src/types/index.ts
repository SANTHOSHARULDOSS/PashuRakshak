export type UserRole =
  | 'FARMER'
  | 'FIELD_VET'
  | 'PARA_VET'
  | 'LAB_TECH'
  | 'DISTRICT_ADMIN'
  | 'STATE_ADMIN';

export type LivestockSpecies =
  | 'Cattle'
  | 'Buffalo'
  | 'Goat'
  | 'Sheep'
  | 'Pig'
  | 'Poultry';

export type HealthStatus =
  | 'HEALTHY'
  | 'SICK'
  | 'UNDER_TREATMENT'
  | 'ISOLATED'
  | 'DECEASED';

export type VaccinationStatus =
  | 'UP_TO_DATE'
  | 'DUE_SOON'
  | 'OVERDUE'
  | 'UNVACCINATED';

export type ReportSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type CaseStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'UNDER_REVIEW'
  | 'SAMPLE_REQUIRED'
  | 'LAB_PENDING'
  | 'DIAGNOSIS_AVAILABLE'
  | 'TREATMENT_STARTED'
  | 'CONTAINMENT'
  | 'RESOLVED';

export interface User {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  role: UserRole;
  district: string;
  taluka: string;
  village: string;
  language_pref: 'en' | 'mr' | 'hi';
  profile?: any;
}

export interface Livestock {
  id: string;
  ear_tag_id: string;
  species: LivestockSpecies;
  breed: string;
  sex: 'MALE' | 'FEMALE';
  age_months: number;
  owner_id: string;
  owner_name?: string;
  owner_phone?: string;
  village: string;
  taluka: string;
  district: string;
  latitude: number;
  longitude: number;
  health_status: HealthStatus;
  vaccination_status: VaccinationStatus;
  last_vaccination_date?: string;
  next_vaccination_due?: string;
  previous_diseases?: string | string[];
  photo_url?: string;
  version?: number;
  created_at: string;
  updated_at?: string;
}

export interface DifferentialDiagnosis {
  disease: string;
  marathiName: string;
  code: string;
  confidence: number;
  reason: string;
  recommendedTest: string;
}

export interface RiskAssessment {
  id: string;
  report_id: string;
  risk_score: number;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  primary_suspected_disease: string;
  confidence_percentage: number;
  differential_diagnoses: DifferentialDiagnosis[];
  contributing_factors: string[];
  recommended_action: string;
  weather_factors?: {
    temp_c: number;
    humidity_pct: number;
    vector_risk: string;
    rainfall_anomaly: string;
  };
  cluster_alert_flag: number;
  created_at: string;
}

export interface HealthReport {
  id: string;
  local_id?: string;
  animal_id: string;
  ear_tag_id?: string;
  species?: LivestockSpecies;
  breed?: string;
  reporter_id: string;
  reporter_name?: string;
  reporter_phone?: string;
  reporter_village?: string;
  symptoms: string[];
  severity: ReportSeverity;
  temperature_f?: number;
  photo_url?: string;
  audio_url?: string;
  latitude: number;
  longitude: number;
  village: string;
  taluka: string;
  district: string;
  status: CaseStatus;
  assigned_vet_id?: string;
  assigned_vet_name?: string;
  assigned_vet_phone?: string;
  vet_notes?: string;
  diagnosis?: string;
  treatment_plan?: string;
  quarantine_ordered?: number;
  sync_status?: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED' | 'CONFLICT';
  version?: number;
  created_at: string;
  updated_at?: string;
  risk_score?: number;
  risk_level?: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  primary_suspected_disease?: string;
  confidence_percentage?: number;
  riskAssessment?: RiskAssessment;
  labSamples?: LabSample[];
  nearbyCases?: any[];
  outbreak?: Outbreak;
}

export interface LabSample {
  id: string;
  sample_code: string;
  report_id: string;
  animal_id: string;
  ear_tag_id?: string;
  species?: string;
  disease_suspected: string;
  sample_type: string;
  collection_date: string;
  collected_by: string;
  dispatch_date?: string;
  lab_name: string;
  lab_received_date?: string;
  test_type: string;
  status: 'COLLECTED' | 'DISPATCHED' | 'LAB_RECEIVED' | 'TESTING' | 'RESULT_AVAILABLE' | 'COMPLETED';
  result: 'PENDING' | 'POSITIVE' | 'NEGATIVE' | 'INCONCLUSIVE';
  confirmed_disease?: string;
  test_notes?: string;
  tested_by?: string;
  completed_at?: string;
  created_at: string;
}

export interface Vaccination {
  id: string;
  animal_id: string;
  ear_tag_id?: string;
  species?: string;
  breed?: string;
  owner_name?: string;
  vaccine_name: string;
  batch_no: string;
  dose_number: number;
  administered_date: string;
  next_due_date: string;
  administered_by: string;
  status: 'COMPLETED' | 'SCHEDULED' | 'OVERDUE';
  remarks?: string;
  created_at: string;
}

export interface VaccinationCampaign {
  id: string;
  title: string;
  disease_target: string;
  district: string;
  talukas: string[];
  start_date: string;
  end_date: string;
  target_count: number;
  achieved_count: number;
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED';
  created_at: string;
}

export interface Outbreak {
  id: string;
  outbreak_code: string;
  disease: string;
  district: string;
  taluka: string;
  epicenter_village: string;
  center_lat: number;
  center_lng: number;
  radius_km: number;
  affected_villages_count: number;
  active_cases_count: number;
  mortality_count: number;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  detected_date: string;
  containment_zone_active: number;
  assigned_rapid_response_team: string;
  advisory_broadcast_sent: number;
  created_at: string;
  reports?: any[];
}

export interface Alert {
  id: string;
  alert_type: string;
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  target_role?: string;
  target_district?: string;
  target_taluka?: string;
  target_user_id?: string;
  related_report_id?: string;
  is_read: number;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  action: string;
  entity: string;
  entityId?: string;
  prev_value?: string;
  new_value?: string;
  ip_address?: string;
  timestamp: string;
}

export interface SyncItem {
  localId: string;
  operation: 'CREATE_REPORT' | 'UPDATE_ANIMAL' | 'ADD_TREATMENT' | 'LOG_VACCINE';
  payload: any;
  clientVersion: number;
  timestamp: string;
  retryCount?: number;
  status: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED' | 'CONFLICT';
}

export interface SyncConflict {
  id: string;
  entity_type: string;
  entity_id: string;
  server_version: number;
  local_version: number;
  server_payload: any;
  local_payload: any;
  resolved: number;
  created_at: string;
}
