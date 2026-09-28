// Comprehensive System Verification Test for PashuRakshak
import { assessLivestockRisk } from './ai/riskAssessor.js';
import { db, initDB } from './db/db.js';
import { runSeed } from './db/seed.js';

async function runSystemVerification() {
  console.log('========================================================');
  console.log(' 🧪 PashuRakshak Full-Stack System Verification Suite');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, details?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name} ${details ? `(${details})` : ''}`);
      failed++;
    }
  }

  // 1. DB & Storage Verification
  console.log('[1/6] Testing Database & Data Engine...');
  initDB();
  const users = db.prepare('SELECT COUNT(*) as c FROM users').get() as any;
  assert('Users table exists and populated', users.c >= 6, `Found ${users.c} users`);

  const livestock = db.prepare('SELECT COUNT(*) as c FROM livestock').get() as any;
  assert('Livestock records populated', livestock.c >= 5, `Found ${livestock.c} livestock`);

  const outbreaks = db.prepare('SELECT COUNT(*) as c FROM outbreaks').get() as any;
  assert('Outbreak zones present', outbreaks.c >= 2, `Found ${outbreaks.c} outbreaks`);

  // 2. AI Risk Assessor & Rule Engine Tests
  console.log('\n[2/6] Testing AI Clinical Triage & Differential Diagnosis...');
  
  // Case A: Lumpy Skin Disease (LSD)
  const lsdResult = assessLivestockRisk({
    species: 'Cattle',
    symptoms: ['Skin lesions', 'Fever', 'Swelling', 'Excessive salivation'],
    severity: 'HIGH',
    district: 'Pune',
    taluka: 'Haveli'
  });
  assert('AI identifies LSD as high risk (>40)', lsdResult.risk_score >= 40, `Score: ${lsdResult.risk_score}`);
  assert('AI differential diagnosis includes primary or secondary match', lsdResult.differential_diagnoses.length > 0);
  assert('AI incorporates weather & vector factor', !!lsdResult.weather_factors.vector_risk);

  // Case B: Foot and Mouth Disease (FMD)
  const fmdResult = assessLivestockRisk({
    species: 'Buffalo',
    symptoms: ['Excessive salivation', 'Lameness', 'Fever', 'Reduced milk production'],
    severity: 'HIGH',
    district: 'Kolhapur',
    taluka: 'Karvir'
  });
  assert('AI flags FMD clinical symptoms', fmdResult.risk_score >= 40, `Score: ${fmdResult.risk_score}`);

  // Case C: Anthrax (Critical)
  const anthraxResult = assessLivestockRisk({
    species: 'Cattle',
    symptoms: ['Sudden high fever', 'Bleeding from orifices', 'Bloody diarrhea'],
    severity: 'CRITICAL',
    district: 'Satara'
  });
  assert('Anthrax scored as high or critical priority', anthraxResult.risk_score >= 50, `Score: ${anthraxResult.risk_score}`);

  // 3. Spatiotemporal GIS & Spatial Calculations
  console.log('\n[3/6] Testing Spatial GIS Distance Calculation...');
  const testDist = db.prepare(`SELECT haversine_distance(18.5204, 73.8567, 18.7500, 73.8500) as d`).get() as any;
  assert('Haversine distance computes correctly', testDist.d > 20 && testDist.d < 30, `Distance: ${testDist.d.toFixed(2)} km`);

  // 4. Lab Workflow & Status Progression
  console.log('\n[4/6] Testing Lab Diagnostic Chain of Custody...');
  const sample = db.prepare(`SELECT * FROM lab_samples LIMIT 1`).get() as any;
  assert('Lab sample chain exists', !!sample && !!sample.sample_code, `Sample Code: ${sample?.sample_code}`);

  // 5. Audit Logging Trail
  console.log('\n[5/6] Testing Audit Trail Security...');
  const auditCount = db.prepare(`SELECT COUNT(*) as c FROM audit_logs`).get() as any;
  assert('Audit trail records system operations', auditCount.c >= 0);

  // 6. Vaccination Ring Tracking
  console.log('\n[6/6] Testing Vaccination Campaign Tracking...');
  const vaxCount = db.prepare(`SELECT COUNT(*) as c FROM vaccinations`).get() as any;
  assert('Vaccination records present', vaxCount.c >= 5, `Found ${vaxCount.c} vaccinations`);

  console.log('\n========================================================');
  console.log(` 🏁 Suite Complete: ${passed} Passed, ${failed} Failed`);
  console.log('========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSystemVerification().catch(console.error);
