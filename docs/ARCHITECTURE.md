# System Architecture — PashuRakshak

**Product Title:** PashuRakshak — Maharashtra Livestock Health Intelligence Platform  
**Tagline:** "Detect Early. Respond Faster. Protect Livestock."  
**Problem Statement ID:** SIH26128 (Smart India Hackathon 2026)  
**Organization:** Government of Maharashtra (Maharashtra State Innovation Society & Dept of Skills, Employment, Entrepreneurship and Innovation)

---

## 1. High-Level Architecture Overview

PashuRakshak is engineered as an **Offline-First, Responsive Progressive Web Application (PWA)** backed by an event-driven RESTful intelligence API. The system establishes a unified surveillance pipeline connecting rural livestock farmers, field veterinarians, para-veterinary workers, disease diagnostic laboratories, district animal husbandry officers, and state directors.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PASHURAKSHAK PWA                              │
│   (Farmer UI / Vet Triage / Lab Portal / GIS / State Command Center)   │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                ┌──────────────────┴──────────────────┐
                ▼                                     ▼
      [ ONLINE HTTP/REST ]                  [ OFFLINE IndexedDB ]
                │                           - Cached Animals & Reports
                │                           - Local Sync Queue
                │                           - Conflict Tracker
                ▼                                     │
    ┌─────────────────────────┐                       │
    │  Express REST Gateway   │                       │
    │  (RBAC, JWT, Rate-limit)│                       │
    └───────────┬─────────────┘                       │
                │                                     │
    ┌───────────┴─────────────────────────────┐       │
    ▼                                         ▼       ▼
[ AI Clinical Triage Engine ]      [ Spatiotemporal GIS Outbreak ]
- Rule-based multi-factorial triage - Haversine distance clustering
- Explainable risk breakdown (0-100) - Baseline deviation anomaly (>3x)
- Differential diagnoses & action   - Dynamic containment buffer zones
    │                                         │
    └───────────────────┬─────────────────────┘
                        ▼
          [ High-Performance Storage ]
          - PostgreSQL / SQLite Architecture
          - Immutable Audit Logs & Revisions
```

---

## 2. Core Surveillance Chain of Custody

The platform enforces a non-broken operational chain:

$$\text{REPORT} \rightarrow \text{ASSESS} \rightarrow \text{PRIORITIZE} \rightarrow \text{REFER} \rightarrow \text{DIAGNOSE} \rightarrow \text{ALERT} \rightarrow \text{CONTAIN} \rightarrow \text{PREVENT} \rightarrow \text{MONITOR}$$

1. **REPORT:** Farmer or para-vet logs animal ear tag ID, symptoms, severity, fever, photo, and voice audio.
2. **ASSESS:** Explainable AI risk engine calculates composite risk score (0-100), differential diagnoses, and containment urgency.
3. **PRIORITIZE:** Field vet receives triage notification with color-coded severity badges and GPS routing.
4. **REFER:** Field vet orders cold-chain diagnostic specimen (EDTA blood, nodule scab, vesicular swab).
5. **DIAGNOSE:** District Animal Disease Diagnostic Laboratory (DADL) certifies PCR / ELISA test result.
6. **ALERT:** System broadcasts automated SMS, IVR audio, and in-app alerts to affected herds.
7. **CONTAIN:** District Administration declares statutory containment radii and suspends cattle markets.
8. **PREVENT:** State Animal Husbandry Commissionerate allocates targeted ring vaccination doses.
9. **MONITOR:** 36-district GIS dashboard tracks resolution rates, mortality trajectories, and herd immunity.

---

## 3. Technology Stack

- **Client Runtime:** React 18, TypeScript, Tailwind CSS v4, Lucide Icons, Leaflet GIS.
- **Offline Storage:** IndexedDB with `idb` wrapper, PWA Service Worker caching shell assets.
- **Audio & Accessibility:** Web Speech API for multi-lingual speech-to-text and voice readout in Marathi (`mr-IN`), Hindi (`hi-IN`), and English (`en-IN`).
- **Server Runtime:** Node.js (ESM), Express REST API, JSON Web Tokens (JWT), BCrypt password hashing.
- **Database Engine:** SQLite / PostgreSQL data model with spatial indexing and ACID transaction support.
- **Telephony Ready:** Simulated IVR backend engine ready for Exotel / Twilio / Gov SMS gateway connection.
