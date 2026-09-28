# Database Schema & Domain Model — PashuRakshak

## 1. Relational Entity Relationship (ER) Summary

The PashuRakshak database model is designed for high relational integrity, spatial tracking, and strict audit logging.

### Core Tables:

1. **`users`**:
   - `id` (VARCHAR PK)
   - `email` (VARCHAR UNIQUE)
   - `phone` (VARCHAR UNIQUE)
   - `password_hash` (TEXT)
   - `full_name` (VARCHAR)
   - `role` (`FARMER` | `FIELD_VET` | `PARA_VET` | `LAB_TECH` | `DISTRICT_ADMIN` | `STATE_ADMIN`)
   - `district` (VARCHAR)
   - `taluka` (VARCHAR)
   - `village` (VARCHAR)
   - `language_pref` (VARCHAR DEFAULT 'mr')
   - `is_active` (BOOLEAN DEFAULT 1)
   - `created_at` (TIMESTAMP)

2. **`livestock`**:
   - `id` (VARCHAR PK)
   - `ear_tag_id` (VARCHAR UNIQUE)
   - `species` (`Cattle` | `Buffalo` | `Goat` | `Sheep` | `Pig` | `Poultry`)
   - `breed` (VARCHAR)
   - `sex` (`MALE` | `FEMALE`)
   - `age_months` (INTEGER)
   - `owner_id` (VARCHAR FK -> `users.id`)
   - `village`, `taluka`, `district` (VARCHAR)
   - `latitude`, `longitude` (REAL)
   - `health_status` (`HEALTHY` | `SICK` | `UNDER_TREATMENT` | `ISOLATED` | `DECEASED`)
   - `vaccination_status` (`UP_TO_DATE` | `DUE_SOON` | `OVERDUE` | `UNVACCINATED`)
   - `last_vaccination_date`, `next_vaccination_due` (DATE)
   - `previous_diseases` (JSON ARRAY)
   - `photo_url` (TEXT)
   - `version` (INTEGER DEFAULT 1)

3. **`health_reports`**:
   - `id` (VARCHAR PK)
   - `local_id` (VARCHAR)
   - `animal_id` (VARCHAR FK -> `livestock.id`)
   - `reporter_id` (VARCHAR FK -> `users.id`)
   - `symptoms` (JSON ARRAY)
   - `severity` (`LOW` | `MEDIUM` | `HIGH` | `CRITICAL`)
   - `temperature_f` (REAL)
   - `photo_url`, `audio_url` (TEXT)
   - `latitude`, `longitude` (REAL)
   - `status` (`OPEN` | `ASSIGNED` | `UNDER_REVIEW` | `SAMPLE_REQUIRED` | `LAB_PENDING` | `DIAGNOSIS_AVAILABLE` | `TREATMENT_STARTED` | `CONTAINMENT` | `RESOLVED`)
   - `assigned_vet_id` (VARCHAR FK -> `users.id`)
   - `vet_notes`, `diagnosis`, `treatment_plan` (TEXT)
   - `quarantine_ordered` (BOOLEAN DEFAULT 0)
   - `sync_status` (`PENDING` | `SYNCING` | `SYNCED` | `FAILED` | `CONFLICT`)
   - `version` (INTEGER DEFAULT 1)

4. **`risk_assessments`**:
   - `id` (VARCHAR PK)
   - `report_id` (VARCHAR UNIQUE FK -> `health_reports.id`)
   - `risk_score` (INTEGER 0-100)
   - `risk_level` (`LOW` | `MODERATE` | `HIGH` | `CRITICAL`)
   - `primary_suspected_disease` (VARCHAR)
   - `confidence_percentage` (INTEGER)
   - `differential_diagnoses` (JSON ARRAY)
   - `contributing_factors` (JSON ARRAY)
   - `recommended_action` (TEXT)
   - `weather_factors` (JSON)
   - `cluster_alert_flag` (BOOLEAN)

5. **`lab_samples`**:
   - `id` (VARCHAR PK)
   - `sample_code` (VARCHAR UNIQUE)
   - `report_id` (VARCHAR FK -> `health_reports.id`)
   - `animal_id` (VARCHAR FK -> `livestock.id`)
   - `disease_suspected` (VARCHAR)
   - `sample_type` (VARCHAR)
   - `collection_date`, `dispatch_date`, `lab_received_date` (TIMESTAMP)
   - `lab_name`, `test_type` (VARCHAR)
   - `status` (`COLLECTED` | `DISPATCHED` | `LAB_RECEIVED` | `TESTING` | `RESULT_AVAILABLE` | `COMPLETED`)
   - `result` (`PENDING` | `POSITIVE` | `NEGATIVE` | `INCONCLUSIVE`)
   - `confirmed_disease`, `test_notes`, `tested_by` (TEXT)

6. **`outbreaks`**:
   - `id` (VARCHAR PK)
   - `outbreak_code` (VARCHAR UNIQUE)
   - `disease` (VARCHAR)
   - `district`, `taluka`, `epicenter_village` (VARCHAR)
   - `center_lat`, `center_lng`, `radius_km` (REAL)
   - `affected_villages_count`, `active_cases_count`, `mortality_count` (INTEGER)
   - `risk_level` (`LOW` | `MODERATE` | `HIGH` | `CRITICAL`)
   - `containment_zone_active` (BOOLEAN DEFAULT 1)
   - `assigned_rapid_response_team` (VARCHAR)

7. **`audit_logs`**:
   - `id` (VARCHAR PK)
   - `user_id`, `user_name`, `user_role` (VARCHAR)
   - `action`, `entity`, `entity_id` (VARCHAR)
   - `prev_value`, `new_value` (TEXT)
   - `ip_address` (VARCHAR)
   - `timestamp` (TIMESTAMP)

8. **`sync_conflicts`**:
   - `id` (VARCHAR PK)
   - `entity_type`, `entity_id` (VARCHAR)
   - `server_version`, `local_version` (INTEGER)
   - `server_payload`, `local_payload` (TEXT)
   - `resolved` (BOOLEAN)
   - `resolved_by`, `resolution_strategy` (VARCHAR)
