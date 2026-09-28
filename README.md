# 🛡️ PashuRakshak — Maharashtra Livestock Health Intelligence Platform

[![Smart India Hackathon 2026](https://img.shields.io/badge/SIH%202026-PS%20ID%3A%20SIH26128-orange.svg)](https://sih.gov.in)
[![Organization](https://img.shields.io/badge/Govt%20of%20Maharashtra-MSInS%20%26%20Animal%20Husbandry-blue.svg)](https://msins.in)
[![Category](https://img.shields.io/badge/Theme-MedTech%20%2F%20BioTech%20%2F%20GovTech-emerald.svg)]()
[![PWA Ready](https://img.shields.io/badge/PWA-Offline--First%20IndexedDB-purple.svg)]()

> **Tagline:** *"Detect Early. Respond Faster. Protect Livestock."*  
> **Official Title:** PashuRakshak — Maharashtra Livestock Health Intelligence Platform  
> **Problem Statement ID:** SIH26128 (Smart India Hackathon 2026)  
> **Category:** Software | **Theme:** MedTech / BioTech / HealthTech  

---

## 📖 Executive Overview

**PashuRakshak** is an AI-assisted, offline-first livestock health surveillance and early-warning intelligence platform designed for the **Government of Maharashtra** (Maharashtra State Innovation Society, Department of Skills, Employment, Entrepreneurship and Innovation & Animal Husbandry Department).

It unites **Farmers, Field Veterinarians, Para-Veterinary Workers, Diagnostic Laboratories, District Animal Husbandry Officers, and State Surveillance Directors** into a single unified epidemiological containment chain.

---

## 🚀 Key Features

1. **🌾 Accessible Farmer Experience:**
   - Simple touch-friendly UI with Marathi (मराठी), Hindi (हिन्दी), and English localization.
   - **Voice Assistant:** Speech-to-text symptom reporting and voice playback for rural farmers.
   - Ear Tag Livestock Registry (Gir, Khillari, Murrah, Osmanabadi, etc.) with GPS geotagging.
   - 24x7 Emergency Vet Ambulance (`1962`) and Pashu Sanjeevani (`1800-180-1551`) integration.

2. **⚡ Offline-First Architecture:**
   - Built on **IndexedDB** (`idb`) and Service Workers.
   - Allows viewing cached records, submitting reports offline, queueing sync batches, and explicit side-by-side **Conflict Resolution**.
   - Includes **"Test Offline"** simulator toggle for demonstration without pulling network cables.

3. **🧠 Explainable AI Clinical Triage Engine:**
   - Multi-factorial deterministic & statistical risk scoring (0–100).
   - Differential diagnosis matching for Lumpy Skin Disease (LSD), Foot & Mouth Disease (FMD), Anthrax, Hemorrhagic Septicemia (HS), Black Quarter (BQ), PPR, and Bovine Brucellosis.
   - Evaluates symptom severity, pyrexia, vaccination status, agro-meteorological vector risks, and localized cluster density.
   - Statutory Veterinary Disclaimer: *"AI-assisted preliminary assessment — veterinary confirmation required."*

4. **🗺️ Interactive GIS Outbreak Surveillance:**
   - Interactive Leaflet map with Maharashtra district and taluka boundaries.
   - Automatic Spatiotemporal Anomaly Detection ($>3\times$ baseline surge within $\le 15\text{ km}$).
   - Color-coded containment buffer circles with radius visualization.

5. **🔬 Laboratory Diagnostic Lifecycle:**
   - Specimen tracking from field dispatch to cold-chain intake.
   - Diagnostic certification for Real-Time PCR, Antigen ELISA, and bacterial culture.
   - Automatic real-time status synchronization to linked field veterinary dossiers (`DIAGNOSIS_AVAILABLE`).

6. **💉 Immunization & Vaccination Registry:**
   - Vaccination booster reminders and overdue alerts.
   - District & taluka-level campaign manager aligned with National Animal Disease Control Programme (NADCP Phase IV).

7. **📞 Simulated IVR Phone Telephony:**
   - Interactive Toll-Free `1800-180-1551` phone keypad simulator.
   - Audio prompts in Marathi/Hindi with simulated government SMS dispatch receipts.

8. **📊 State & District Governance Dashboards:**
   - 8 core KPIs, 7-day case inflow vs resolution trajectories, disease distribution charts.
   - One-click **Printable Government Surveillance Bulletin (PDF-ready)** and CSV raw data exports.
   - Immutable operational security audit logs.

9. **✨ SIH 2026 Presentation Mode:**
   - One-click interactive 8-step live walkthrough tour for judges (5–8 min presentation).

---

## 🔐 Demo Accounts (One-Click Role Switcher)

| Role | Demo Account Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Farmer** | Ramesh Patil (Shirur, Pune) | `farmer@pashurakshak.gov.in` | `pashu123` |
| **Field Vet** | Dr. Anand Deshmukh (B.V.Sc & A.H) | `vet@pashurakshak.gov.in` | `pashu123` |
| **Para-Vet** | Sunil Shinde (Livestock Supervisor) | `paravet@pashurakshak.gov.in` | `pashu123` |
| **Lab Tech** | Dr. Priya Kulkarni (DADL Pathologist) | `lab@pashurakshak.gov.in` | `pashu123` |
| **District Admin**| Sanjay Jadhav (Pune DAHO) | `district.admin@pashurakshak.gov.in` | `pashu123` |
| **State Admin** | Dr. Vilas Gaikwad (Surveillance Director) | `state.admin@pashurakshak.gov.in` | `pashu123` |

*(Note: Evaluators can also instantly switch between all 6 roles directly using the top-right navbar dropdown without entering passwords).*

---

## 🛠️ Quickstart & Local Setup

### Prerequisites
- **Node.js:** v18+ (tested on Node.js v24)
- **npm:** v9+

### 1. Installation
```bash
# Clone repository
git clone https://github.com/SANTHOSHARULDOSS/PashuRakshak.git
cd PashuRakshak

# Install dependencies
npm install
```

### 2. Environment Configuration
```bash
# Copy example environment
cp .env.example .env
```

### 3. Database Seed
```bash
# Initialize and populate Maharashtra livestock surveillance demo data
npm run seed
```

### 4. Run Development Server
```bash
# Starts both frontend client and backend API concurrently
npm run dev
```

- **Frontend Application:** `http://localhost:5173`
- **Backend API Gateway:** `http://localhost:5000/api`
- **API Health Check:** `http://localhost:5000/api/health`

### 5. Production Build
```bash
npm run build
```

---

## 📂 Repository Structure

```
d:/PashuRakshak/
├── docs/
│   ├── ARCHITECTURE.md          # Full system architecture
│   ├── DATABASE.md              # ER schema and data models
│   ├── API.md                   # REST API documentation
│   ├── AI_ENGINE.md             # AI triage and outbreak algorithms
│   ├── OFFLINE_SYNC.md          # IndexedDB sync queue & conflict engine
│   ├── SECURITY.md              # RBAC matrix and security safeguards
│   ├── DEMO_GUIDE.md            # SIH presentation walkthrough
│   └── SIH_PITCH.md             # Executive pitch & problem alignment
├── public/
│   ├── logo.svg                 # Official PashuRakshak vector logo
│   ├── manifest.json            # PWA manifest
│   ├── sw.js                    # Service Worker caching script
│   └── emblems/                 # Official Maharashtra & MSInS seals
├── server/
│   └── src/
│       ├── ai/                  # Clinical rule engine & AI risk assessor
│       ├── db/                  # SQLite schema & Maharashtra seed generator
│       ├── middleware/          # JWT auth & immutable audit logging
│       ├── routes/              # Modular Express REST endpoints
│       └── index.ts             # API server entrypoint
├── src/
│   ├── api/                     # Typed client with offline interception
│   ├── components/
│   │   ├── admin/               # State/District command dashboards
│   │   ├── common/              # Navbar, Sidebar, Badges, Modals
│   │   ├── farmer/              # Farmer reporting, herd list, advisories
│   │   ├── gis/                 # Leaflet Disease Surveillance Map
│   │   ├── ivr/                 # 1800-180-1551 Phone Simulator
│   │   ├── lab/                 # Diagnostic sample & PCR/ELISA tracker
│   │   └── vet/                 # Clinical triage, dossier, prescription
│   ├── context/                 # Auth, Language, Theme, OfflineSync contexts
│   ├── locales/                 # Marathi (mr), Hindi (hi), English (en) JSON
│   ├── types/                   # TypeScript interfaces
│   ├── utils/                   # IndexedDB, Web Speech audio, CSV/PDF export
│   ├── App.tsx                  # Master application routing & modals
│   ├── main.tsx                 # React entrypoint
│   └── index.css                # Tailwind CSS v4 styling
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🏛️ Government of Maharashtra Endorsement & Problem Statement Alignment

Developed for **Smart India Hackathon 2026 (Problem Statement SIH26128)** under the guidance of:
- **Maharashtra State Innovation Society (MSInS)**
- **Department of Skills, Employment, Entrepreneurship and Innovation**
- **Department of Animal Husbandry, Government of Maharashtra**

*Detect Early. Respond Faster. Protect Livestock.*
