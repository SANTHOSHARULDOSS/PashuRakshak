import { db, initDB } from './db.js';
import { generateSeedData } from './seedData.js';
import { assessLivestockRisk } from '../ai/riskAssessor.js';

export async function runSeed() {
  console.log('[Seed] Initializing database schema...');
  initDB();

  console.log('[Seed] Clearing previous data...');
  db.exec(`
    DELETE FROM sync_conflicts;
    DELETE FROM audit_logs;
    DELETE FROM alerts;
    DELETE FROM outbreaks;
    DELETE FROM vaccination_campaigns;
    DELETE FROM vaccinations;
    DELETE FROM lab_samples;
    DELETE FROM risk_assessments;
    DELETE FROM health_reports;
    DELETE FROM livestock;
    DELETE FROM veterinary_workers;
    DELETE FROM farmer_profiles;
    DELETE FROM users;
  `);

  console.log('[Seed] Generating seed records...');
  const data = await generateSeedData();

  // 1. Insert Users
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, phone, password_hash, full_name, role, district, taluka, village, language_pref)
    VALUES (@id, @email, @phone, @password_hash, @full_name, @role, @district, @taluka, @village, @language_pref)
  `);
  for (const u of data.users) {
    insertUser.run(u);
  }

  // 2. Insert Farmer Profiles
  const insertFarmer = db.prepare(`
    INSERT INTO farmer_profiles (user_id, aadhar_last4, farm_size_acres, total_cattle, total_buffalo, total_goats, total_sheep, total_poultry)
    VALUES (@user_id, @aadhar_last4, @farm_size_acres, @total_cattle, @total_buffalo, @total_goats, @total_sheep, @total_poultry)
  `);
  for (const fp of data.farmerProfiles) {
    insertFarmer.run(fp);
  }

  // 3. Insert Veterinary Workers
  const insertVet = db.prepare(`
    INSERT INTO veterinary_workers (user_id, registration_no, designation, assigned_taluka, assigned_district, center_name, phone_emergency)
    VALUES (@user_id, @registration_no, @designation, @assigned_taluka, @assigned_district, @center_name, @phone_emergency)
  `);
  for (const vw of data.vetWorkers) {
    insertVet.run(vw);
  }

  // 4. Insert Livestock
  const insertLivestock = db.prepare(`
    INSERT INTO livestock (id, ear_tag_id, species, breed, sex, age_months, owner_id, village, taluka, district, latitude, longitude, health_status, vaccination_status, last_vaccination_date, next_vaccination_due, previous_diseases, photo_url)
    VALUES (@id, @ear_tag_id, @species, @breed, @sex, @age_months, @owner_id, @village, @taluka, @district, @latitude, @longitude, @health_status, @vaccination_status, @last_vaccination_date, @next_vaccination_due, @previous_diseases, @photo_url)
  `);
  for (const l of data.livestock) {
    insertLivestock.run(l);
  }

  // 5. Insert Health Reports & Generate AI Assessments
  const insertReport = db.prepare(`
    INSERT INTO health_reports (id, local_id, animal_id, reporter_id, symptoms, severity, temperature_f, photo_url, audio_url, latitude, longitude, village, taluka, district, status, assigned_vet_id, vet_notes, diagnosis, treatment_plan, quarantine_ordered, sync_status, created_at)
    VALUES (@id, @local_id, @animal_id, @reporter_id, @symptoms, @severity, @temperature_f, @photo_url, @audio_url, @latitude, @longitude, @village, @taluka, @district, @status, @assigned_vet_id, @vet_notes, @diagnosis, @treatment_plan, @quarantine_ordered, @sync_status, @created_at)
  `);

  const insertAssessment = db.prepare(`
    INSERT INTO risk_assessments (id, report_id, risk_score, risk_level, primary_suspected_disease, confidence_percentage, differential_diagnoses, contributing_factors, recommended_action, weather_factors, cluster_alert_flag, created_at)
    VALUES (@id, @report_id, @risk_score, @risk_level, @primary_suspected_disease, @confidence_percentage, @differential_diagnoses, @contributing_factors, @recommended_action, @weather_factors, @cluster_alert_flag, @created_at)
  `);

  for (const r of data.reports) {
    insertReport.run(r);

    const animal = data.livestock.find(l => l.id === r.animal_id);
    const symptoms = JSON.parse(r.symptoms);

    const assessment = assessLivestockRisk({
      species: animal?.species || 'Cattle',
      symptoms,
      severity: r.severity as any,
      temperature_f: r.temperature_f || undefined,
      vaccination_status: animal?.vaccination_status,
      latitude: r.latitude,
      longitude: r.longitude,
      district: r.district,
      taluka: r.taluka
    });

    insertAssessment.run({
      id: `risk_${r.id}`,
      report_id: r.id,
      risk_score: assessment.risk_score,
      risk_level: assessment.risk_level,
      primary_suspected_disease: assessment.primary_suspected_disease,
      confidence_percentage: assessment.confidence_percentage,
      differential_diagnoses: JSON.stringify(assessment.differential_diagnoses),
      contributing_factors: JSON.stringify(assessment.contributing_factors),
      recommended_action: assessment.recommended_action,
      weather_factors: JSON.stringify(assessment.weather_factors),
      cluster_alert_flag: assessment.cluster_alert_flag,
      created_at: r.created_at
    });
  }

  // 6. Insert Lab Samples
  const insertLabSample = db.prepare(`
    INSERT INTO lab_samples (id, sample_code, report_id, animal_id, disease_suspected, sample_type, collection_date, collected_by, dispatch_date, lab_name, lab_received_date, test_type, status, result, confirmed_disease, test_notes, tested_by, completed_at)
    VALUES (@id, @sample_code, @report_id, @animal_id, @disease_suspected, @sample_type, @collection_date, @collected_by, @dispatch_date, @lab_name, @lab_received_date, @test_type, @status, @result, @confirmed_disease, @test_notes, @tested_by, @completed_at)
  `);
  for (const ls of data.labSamples) {
    insertLabSample.run(ls);
  }

  // 7. Insert Vaccinations
  const insertVaccination = db.prepare(`
    INSERT INTO vaccinations (id, animal_id, vaccine_name, batch_no, dose_number, administered_date, next_due_date, administered_by, status, remarks)
    VALUES (@id, @animal_id, @vaccine_name, @batch_no, @dose_number, @administered_date, @next_due_date, @administered_by, @status, @remarks)
  `);
  for (const v of data.vaccinations) {
    insertVaccination.run(v);
  }

  // 8. Insert Campaigns
  const insertCampaign = db.prepare(`
    INSERT INTO vaccination_campaigns (id, title, disease_target, district, talukas, start_date, end_date, target_count, achieved_count, status)
    VALUES (@id, @title, @disease_target, @district, @talukas, @start_date, @end_date, @target_count, @achieved_count, @status)
  `);
  for (const c of data.campaigns) {
    insertCampaign.run(c);
  }

  // 9. Insert Outbreaks
  const insertOutbreak = db.prepare(`
    INSERT INTO outbreaks (id, outbreak_code, disease, district, taluka, epicenter_village, center_lat, center_lng, radius_km, affected_villages_count, active_cases_count, mortality_count, risk_level, detected_date, containment_zone_active, assigned_rapid_response_team, advisory_broadcast_sent)
    VALUES (@id, @outbreak_code, @disease, @district, @taluka, @epicenter_village, @center_lat, @center_lng, @radius_km, @affected_villages_count, @active_cases_count, @mortality_count, @risk_level, @detected_date, @containment_zone_active, @assigned_rapid_response_team, @advisory_broadcast_sent)
  `);
  for (const o of data.outbreaks) {
    insertOutbreak.run(o);
  }

  // 10. Insert Alerts
  const insertAlert = db.prepare(`
    INSERT INTO alerts (id, alert_type, title, message, severity, target_role, target_district, target_taluka, target_user_id, related_report_id, is_read, created_at)
    VALUES (@id, @alert_type, @title, @message, @severity, @target_role, @target_district, @target_taluka, @target_user_id, @related_report_id, @is_read, @created_at)
  `);
  for (const a of data.alerts) {
    insertAlert.run(a);
  }

  // 11. Insert Audit Logs
  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (id, user_id, user_name, user_role, action, entity, entity_id, prev_value, new_value, ip_address, timestamp)
    VALUES (@id, @user_id, @user_name, @user_role, @action, @entity, @entity_id, @prev_value, @new_value, @ip_address, @timestamp)
  `);
  for (const al of data.auditLogs) {
    insertAudit.run(al);
  }

  console.log('[Seed] Database seeding completed successfully with full Maharashtra livestock surveillance data!');
}

if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  runSeed().catch(err => {
    console.error('[Seed Error]', err);
    process.exit(1);
  });
}
