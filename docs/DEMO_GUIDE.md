# SIH Presentation Demo Guide — PashuRakshak

**Total Demo Duration:** 5–8 minutes  
**Goal:** Demonstrate the complete end-to-end chain from rural livestock disease detection to state-level outbreak containment and ring vaccination.

---

## 8-Step Walkthrough Flow for SIH Judges

### Step 1: Farmer Disease Reporting
- **Role:** `Farmer Demo (Ramesh Patil - Shirur, Pune)`
- **Action:** Open Dashboard → Click **"Report Sick Livestock"** (or use the multi-lingual **Voice Assistant** / tap mic in Marathi: *"माझ्या गाईला ताप आणि अंगावर गाठी आहेत"*).
- **Outcome:** Select Cow `MH-PUN-001892`, select symptoms (*Fever*, *Skin lesions*, *Reduced milk production*), severity *HIGH*.
- **Demo Tip:** Tap **"Test Offline"** button in navbar to prove that the report is instantly queued in **IndexedDB** with a *"Saved Offline"* badge! Re-enable online mode to see automatic background synchronization.

### Step 2: AI Clinical Risk Triage
- **Engine Execution:** AI Risk Engine computes:
  - **Risk Score:** `84/100 (HIGH)`
  - **Primary Suspect:** `Lumpy Skin Disease (Capripoxvirus)`
  - **Confidence:** `80%`
  - **Explainability:** Identifies skin nodules, high fever (104.8°F), overdue vaccine status, and 78% vector-friendly humidity.

### Step 3: Veterinary Prioritization & Clinical Examination
- **Role:** Switch to `Field Vet Demo (Dr. Anand Deshmukh)` using top-right Role Dropdown.
- **Action:** Vet dashboard displays high-priority emergency case at top of queue.
- **Outcome:** Open case dossier → enter clinical diagnosis → order strict animal isolation → click **"Order Lab PCR / ELISA"** to dispatch cold-chain diagnostic swab.

### Step 4: Diagnostic Laboratory Confirmation
- **Role:** Switch to `Lab Tech Demo (Dr. Priya Kulkarni)`
- **Action:** Open Lab Dashboard → advance sample `LAB-PUN-2026-089` to *Testing* → click **"Record Diagnostic Result"** → certify **POSITIVE (Capripoxvirus DNA confirmed, Ct 24.2)**.
- **Outcome:** Linked case report status automatically transitions to `DIAGNOSIS_AVAILABLE`.

### Step 5: Spatiotemporal Outbreak Detection & GIS Heatmap
- **Role:** Switch to `District Admin Demo (Sanjay Jadhav)`
- **Action:** Open **Surveillance Map (GIS)**.
- **Outcome:** Visualizes active containment buffer circle (8.5 km radius) around Nighoj/Shirur with 23 active cases, 7 affected villages, and color-coded risk indicators.

### Step 6: Emergency Farmer Broadcast Advisory
- **Action:** In District Admin dashboard, broadcast emergency advisory to all cattle owners in Shirur taluka:
  *"शिरूर तालुक्यात लम्पी त्वचा रोगाचा संसर्ग टाळण्यासाठी जनावरांचे बाजार बंद ठेवण्यात आले आहेत..."*
- **Outcome:** Farmers immediately receive notification in in-app notification center and simulated SMS.

### Step 7: State Command Center & Ring Vaccination
- **Role:** Switch to `State Admin Demo (Dr. Vilas Gaikwad)`
- **Action:** View statewide 36-district surveillance metrics → click **"Print Official Bulletin"** (generates official government PDF) → click **"Launch Vaccination Drive"** allocating 50,000 Goat Pox vaccine doses.

### Step 8: IVR 1800-180-1551 Phone Telephony Simulation
- **Action:** Click phone icon in navbar → launch **IVR Simulator** → dial `1800-180-1551` → choose Marathi prompt `1` → press `1` to report sickness or `2` for vaccination dates.
- **Outcome:** Audio prompt speaks aloud in Marathi/Hindi with simulated SMS receipt.
