# AI Clinical Triage & Outbreak Detection Engine — PashuRakshak

> **Statutory Veterinary Disclaimer:**  
> *"AI-assisted preliminary assessment — veterinary confirmation required."*

---

## 1. Engine Objective

In rural Maharashtra, veterinary doctor-to-livestock ratios are stretched across large taluka geographies. Farmers often delay reporting subtle early symptoms until severe systemic complications or mortalities occur.

The **PashuRakshak AI Risk Engine** provides:
1. Immediate, objective risk stratification (0–100 score).
2. Differential diagnosis suggestions with confidence percentages.
3. Explainable clinical factors for transparent decision support.
4. Immediate bio-security and containment advice for farmers while field teams mobilize.

---

## 2. Multi-Factorial Risk Scoring Algorithm

The risk score $R \in [10, 99]$ is computed via deterministic clinical matching combined with dynamic environmental and spatial risk multipliers:

$$R = \text{Clamp}\Big( S_{\text{clinical}} + \Delta_{\text{severity}} + \Delta_{\text{vaccine}} + \Delta_{\text{spatial}} + \Delta_{\text{weather}}, 10, 99 \Big)$$

### Factor Weights:

1. **Clinical Symptom Matching ($S_{\text{clinical}}$):**
   - **Mandatory Hallmark Symptoms:** $+45\%$ weight (e.g. Skin nodules + High fever for Lumpy Skin Disease; Hypersalivation + Lameness for Foot & Mouth Disease; Sudden mortality + Bleeding for Anthrax).
   - **Characteristic Signs:** $+25\%$ weight (e.g. Swelling, drop in milk yield, lacrimation).
   - **Secondary Signs:** $+15\%$ weight (e.g. Anorexia, dullness, diarrhea).

2. **Severity Modifier ($\Delta_{\text{severity}}$):**
   - Critical / Emergency reported: $+20\%$
   - Acute High severity: $+10\%$
   - Pyrexia $\ge 104^\circ\text{F}$: $+10\%$

3. **Vaccination Vulnerability ($\Delta_{\text{vaccine}}$):**
   - Overdue or Unvaccinated: $+15\%$ vulnerability increase
   - Up-to-date vaccination: $-10\%$ mortality risk mitigation

4. **Spatial Density & Cluster Multiplier ($\Delta_{\text{spatial}}$):**
   - $\ge 4$ active cases in same taluka / 25 km radius: $+20\%$ cluster risk
   - 2–3 active cases in proximity: $+10\%$ localized activity

5. **Agro-Meteorological Vector Index ($\Delta_{\text{weather}}$):**
   - Humidity $>75\%$ + Temperature $26-32^\circ\text{C}$ creates peak vector breeding conditions for Stomoxys calcitrans and Tabanid flies (increases LSD / HS transmission risk by $+5\%$).

---

## 3. Disease Knowledge Base Profiles

| Disease Code | Hallmark Symptoms | Target Species | Base Urgency | Confirmatory Assay |
| :--- | :--- | :--- | :--- | :--- |
| **LSD** (Lumpy Skin Disease) | Skin nodules / lumps, High fever | Cattle, Buffalo | HIGH | Capripoxvirus Real-time PCR |
| **FMD** (Foot & Mouth Disease) | Excessive salivation, Foot lameness | Cattle, Buffalo, Goat, Pig | HIGH | Antigen Sandwich ELISA |
| **ANTHRAX** | Sudden mortality, High pyrexia | Cattle, Buffalo, Sheep, Goat | CRITICAL | McFadyean Smear & PCR |
| **HS** (Hemorrhagic Septicemia) | Submandibular throat edema, Snoring | Cattle, Buffalo | CRITICAL | Pasteurella multocida Culture/PCR |
| **BQ** (Black Quarter) | Crepitating muscle swelling, Lameness | Cattle, Buffalo, Sheep | HIGH | Fluorescent Antibody Test |
| **PPR** (Goat Plague) | High fever, Diarrhea, Ocular discharge | Goat, Sheep | HIGH | Competitive ELISA |
| **Brucellosis** | Late-term abortion, Retained placenta | Cattle, Buffalo, Goat | MEDIUM | RBPT & Milk Ring Test |
| **Avian Flu** | Sudden flock mortality, Cyanosis | Poultry | CRITICAL | RT-PCR (H5N1) |

---

## 4. Spatiotemporal Outbreak Detection

The system calculates temporal baseline deviations for every taluka:

$$\text{Anomaly Factor} = \frac{\text{Current 7-Day Active Cases}}{\text{Historical Baseline Weekly Cases}}$$

When $\text{Anomaly Factor} > 3.0$ and cases are clustered within a Haversine radius of $\le 15\text{ km}$, the system automatically declares an **Active Containment Outbreak Cluster** and triggers rapid response taskforce deployment.
