// Comprehensive HTTP REST API Verification Suite
async function testHttpEndpoints() {
  console.log('========================================================');
  console.log(' 🌐 Testing Live PashuRakshak HTTP REST API Endpoints');
  console.log('========================================================\n');

  const BASE_URL = 'http://localhost:5000/api';
  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<boolean>) {
    try {
      const ok = await fn();
      if (ok) {
        console.log(`  ✅ HTTP 200 OK: ${name}`);
        passed++;
      } else {
        console.error(`  ❌ FAIL: ${name}`);
        failed++;
      }
    } catch (err: any) {
      console.error(`  ❌ ERROR: ${name} -> ${err.message}`);
      failed++;
    }
  }

  // 1. Health Check
  await test('GET /api/health', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    return res.status === 200 && data.status === 'HEALTHY' && data.state === 'Maharashtra';
  });

  // 2. State Admin Demo Switcher
  let adminToken = '';
  await test('POST /api/auth/demo/STATE_ADMIN', async () => {
    const res = await fetch(`${BASE_URL}/auth/demo/STATE_ADMIN`, { method: 'POST' });
    const data = await res.json();
    adminToken = data.token;
    return res.status === 200 && data.success && !!adminToken;
  });

  // 3. Farmer Demo Switcher
  let farmerToken = '';
  await test('POST /api/auth/demo/FARMER', async () => {
    const res = await fetch(`${BASE_URL}/auth/demo/FARMER`, { method: 'POST' });
    const data = await res.json();
    farmerToken = data.token;
    return res.status === 200 && data.success && !!farmerToken;
  });

  // 4. Dashboard Overview (Admin)
  await test('GET /api/dashboard/overview', async () => {
    const res = await fetch(`${BASE_URL}/dashboard/overview`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    return res.status === 200 && data.success && data.data.kpis.totalLivestock > 0;
  });

  // 5. My Animals List (Farmer)
  await test('GET /api/animals', async () => {
    const res = await fetch(`${BASE_URL}/animals`, {
      headers: { Authorization: `Bearer ${farmerToken}` }
    });
    const data = await res.json();
    return res.status === 200 && data.success && Array.isArray(data.data);
  });

  // 6. AI Triage Engine
  await test('POST /api/ai/triage', async () => {
    const res = await fetch(`${BASE_URL}/ai/triage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        species: 'Cattle',
        symptoms: ['Skin lesions', 'Fever', 'Swelling', 'Excessive salivation'],
        severity: 'HIGH',
        district: 'Pune',
        taluka: 'Haveli'
      })
    });
    const data = await res.json();
    return res.status === 200 && data.success && data.data.risk_score > 0 && !!data.data.primary_suspected_disease;
  });

  // 7. Outbreak Surveillance
  await test('GET /api/outbreaks', async () => {
    const res = await fetch(`${BASE_URL}/outbreaks`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    return res.status === 200 && data.success && data.data.length > 0;
  });

  // 8. Lab Samples Chain of Custody
  await test('GET /api/lab/samples', async () => {
    const res = await fetch(`${BASE_URL}/lab/samples`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    return res.status === 200 && data.success && data.data.length > 0;
  });

  // 9. Vaccinations & Ring Campaigns
  await test('GET /api/vaccinations', async () => {
    const res = await fetch(`${BASE_URL}/vaccinations`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    return res.status === 200 && data.success && data.data.length > 0;
  });

  // 10. Alerts & Notifications
  await test('GET /api/alerts', async () => {
    const res = await fetch(`${BASE_URL}/alerts`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    return res.status === 200 && data.success && Array.isArray(data.data);
  });

  // 11. Weather & Vector Transmission Index
  await test('GET /api/weather/Pune', async () => {
    const res = await fetch(`${BASE_URL}/weather/Pune`);
    const data = await res.json();
    return res.status === 200 && data.success && !!data.data.vector_activity_index;
  });

  // 12. Simulated IVR 1800-180-1551 Helpline Call
  await test('POST /api/ivr/call', async () => {
    const res = await fetch(`${BASE_URL}/ivr/call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callerPhone: '+919822099999',
        language: 'mr',
        speciesChoice: '1', // Cattle
        symptomChoice: '1', // High fever & blisters
        district: 'Pune',
        taluka: 'Haveli'
      })
    });
    const data = await res.json();
    return res.status === 200 && data.success && !!data.callRecord.case_number;
  });

  console.log('\n========================================================');
  console.log(` 🏁 HTTP API Suite Complete: ${passed} Passed, ${failed} Failed`);
  console.log('========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

testHttpEndpoints().catch(console.error);
