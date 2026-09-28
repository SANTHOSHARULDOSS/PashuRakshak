# REST API Reference — PashuRakshak

All API endpoints are mounted under `/api/*`. Standard JSON response envelope:
```json
{
  "success": true,
  "message": "Optional message",
  "data": {}
}
```

---

## 1. Authentication & Role Switching
- `POST /api/auth/login`: Login with email/phone and password.
- `POST /api/auth/demo/:role`: Instant evaluation switcher for SIH judges (Roles: `FARMER`, `FIELD_VET`, `PARA_VET`, `LAB_TECH`, `DISTRICT_ADMIN`, `STATE_ADMIN`).
- `GET /api/auth/me`: Authenticated profile and role permissions.

---

## 2. Livestock Registry
- `GET /api/animals`: List animals with filters (`species`, `health_status`, `vaccination_status`, `district`, `taluka`, `search`).
- `GET /api/animals/:id`: Comprehensive animal history including vaccination records, past health reports, and lab assays.
- `POST /api/animals`: Register livestock with Ear Tag ID, GPS coordinates, breed, sex, and age.
- `PUT /api/animals/:id`: Optimistic update with automatic version increment.

---

## 3. Disease Reports & Clinical Triage
- `GET /api/reports`: Filtered feed of health cases.
- `GET /api/reports/:id`: Case dossier with symptoms, photos, AI risk assessment, vet notes, and linked laboratory tests.
- `POST /api/reports`: Submit new health report (triggers AI triage calculation, updates animal health state, and checks outbreak cluster thresholds).
- `POST /api/reports/:id/assessment`: Field vet clinical assessment, diagnosis, treatment prescription, and quarantine order.
- `POST /api/reports/:id/assign`: Assign case to specific field veterinary officer.

---

## 4. AI & Rule Triage Engine
- `POST /api/ai/triage`: Standalone AI triage evaluator returning score (0-100), differential diagnoses, and explainability factors.
- `GET /api/ai/rules`: Transparent knowledge base listing of Maharashtra livestock disease rules.

---

## 5. Spatiotemporal Outbreaks & GIS Surveillance
- `GET /api/outbreaks`: List active and historical outbreak containment clusters.
- `GET /api/outbreaks/:id`: Outbreak cluster detail with affected villages and cases.
- `POST /api/outbreaks`: Declare new statutory quarantine containment zone.

---

## 6. Diagnostic Laboratory
- `GET /api/lab/samples`: Filtered laboratory specimen worklist.
- `GET /api/lab/samples/:id`: Specimen detail with cold-chain tracking.
- `POST /api/lab/samples`: Dispatch new diagnostic specimen referral.
- `PATCH /api/lab/samples/:id/status`: Transition lifecycle stage (`DISPATCHED` -> `LAB_RECEIVED` -> `TESTING`).
- `POST /api/lab/samples/:id/result`: Record and certify test result (POSITIVE/NEGATIVE/INCONCLUSIVE) with pathogen serotype.

---

## 7. Immunization & Vaccinations
- `GET /api/vaccinations`: Animal vaccination records.
- `POST /api/vaccinations`: Log newly administered vaccine dose.
- `GET /api/vaccinations/campaigns`: Active state/district vaccination campaigns.
- `POST /api/vaccinations/campaigns`: Launch targeted ring vaccination campaign.

---

## 8. Alerts & Advisories
- `GET /api/alerts`: Role and district-filtered notifications.
- `PATCH /api/alerts/:id/read`: Mark alert as read.
- `POST /api/alerts/broadcast`: Emergency advisory broadcast to farmers.

---

## 9. Simulated IVR Phone Telephony
- `POST /api/ivr/simulate`: Interactive state machine for Toll-Free `1800-180-1551` phone calls with multi-lingual audio speech and automated SMS confirmation.

---

## 10. Offline Batch Sync & Conflict Resolution
- `POST /api/sync`: Synchronizes queued offline operations with version verification.
- `GET /api/sync/conflicts`: View unresolved sync conflicts.
- `POST /api/sync/conflicts/:id/resolve`: Resolve conflict (`SERVER_WINS`, `LOCAL_WINS`, `MERGED`).

---

## 11. Surveillance Analytics & Audit
- `GET /api/dashboard/overview`: High-level state and district surveillance KPIs, temporal charts, and disease breakdowns.
- `GET /api/audit-logs`: Immutable operational security audit trail.
