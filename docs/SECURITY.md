# Security & Role-Based Access Control — PashuRakshak

## 1. Role-Based Access Control (RBAC) Matrix

| Resource / Action | FARMER | FIELD_VET | PARA_VET | LAB_TECH | DISTRICT_ADMIN | STATE_ADMIN |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Register Own Livestock** | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Submit Health Report** | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **View Full District Surveillance** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Conduct Vet Clinical Examination** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Order Lab Specimen Dispatch** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Record Certified Lab Results** | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Declare Outbreak Containment Zone** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Broadcast Emergency Advisory** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Launch Vaccination Campaign** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Inspect Audit Trail** | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ |

---

## 2. Core Security Safeguards

1. **Authentication & Session Tokens:**
   - Stateless JWT tokens signed with secure server secret (`HS256`).
   - Passwords hashed using standard `BCrypt` with salt rounds = 10.

2. **Authorization Middleware:**
   - `authenticateToken` middleware verifies bearer token on all protected endpoints.
   - `requireRole([...])` validates role hierarchy before allowing sensitive operations.

3. **Input Validation & Sanitization:**
   - Strict payload validation and type checking on all routes.
   - Check constraints on SQLite schema prevent invalid enumeration injection.
   - Parameterized queries and prepared statements prevent SQL injection.

4. **Immutable Audit Logging:**
   - All updates to livestock health, case statuses, lab results, and containment declarations trigger `logAudit(...)` recording:
     - Actor ID & Full Name
     - User Role
     - Action & Entity
     - Pre-mutation value vs Post-mutation value
     - Actor IP Address
     - Exact timestamp

5. **Secrets & Gateways:**
   - All simulated telephony, SMS, and map credentials are managed via environment variables (`.env`).
   - No API keys are leaked to the client bundle.
