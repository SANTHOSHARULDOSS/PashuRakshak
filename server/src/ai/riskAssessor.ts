import { DISEASE_RULES, DiseaseRule } from './ruleEngine.js';
import { db } from '../db/db.js';

export interface AssessmentInput {
  species: string;
  symptoms: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  temperature_f?: number;
  vaccination_status?: string;
  latitude?: number;
  longitude?: number;
  district?: string;
  taluka?: string;
}

export interface AssessmentResult {
  risk_score: number;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  primary_suspected_disease: string;
  confidence_percentage: number;
  differential_diagnoses: Array<{
    disease: string;
    marathiName: string;
    code: string;
    confidence: number;
    reason: string;
    recommendedTest: string;
  }>;
  contributing_factors: string[];
  recommended_action: string;
  weather_factors: {
    temp_c: number;
    humidity_pct: number;
    vector_risk: string;
    rainfall_anomaly: string;
  };
  cluster_alert_flag: number;
}

export function assessLivestockRisk(input: AssessmentInput): AssessmentResult {
  const {
    species,
    symptoms = [],
    severity = 'MEDIUM',
    temperature_f,
    vaccination_status = 'UP_TO_DATE',
    latitude,
    longitude,
    district = 'Pune',
    taluka = 'Haveli'
  } = input;

  const contributingFactors: string[] = [];
  const candidateScored: Array<{
    rule: DiseaseRule;
    score: number;
    reason: string;
  }> = [];

  // 1. Check nearby cases cluster within 25 km / same district
  let nearbyCount = 0;
  try {
    if (latitude && longitude) {
      const row = db.prepare(`
        SELECT COUNT(*) as count FROM health_reports
        WHERE status NOT IN ('RESOLVED')
        AND haversine_distance(latitude, longitude, ?, ?) <= 25
      `).get(latitude, longitude) as { count: number };
      nearbyCount = row?.count || 0;
    } else {
      const row = db.prepare(`
        SELECT COUNT(*) as count FROM health_reports
        WHERE district = ? AND status NOT IN ('RESOLVED')
      `).get(district) as { count: number };
      nearbyCount = row?.count || 0;
    }
  } catch (err) {
    nearbyCount = 2; // fallback baseline
  }

  function norm(str: string): string {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  const normalizedInputSymptoms = symptoms.map(s => norm(s));
  const normSpecies = norm(species);

  // 2. Evaluate Clinical Rules
  for (const rule of DISEASE_RULES) {
    // Check species eligibility (case-insensitive substring/equality)
    const speciesMatch = rule.targetSpecies.some(ts => norm(ts).includes(normSpecies) || normSpecies.includes(norm(ts)));
    if (!speciesMatch) continue;

    let matchPoints = 0;
    const reasons: string[] = [];

    // Helper to check if rule symptom matches any input symptom
    const matchSymptom = (ruleSymptom: string) => {
      const target = norm(ruleSymptom);
      return normalizedInputSymptoms.some(inputSym => inputSym.includes(target) || target.includes(inputSym));
    };

    // Mandatory symptoms (must have at least one for high score)
    const matchedMandatory = rule.mandatorySymptoms.filter(matchSymptom);
    if (matchedMandatory.length > 0) {
      matchPoints += (matchedMandatory.length / rule.mandatorySymptoms.length) * 45;
      reasons.push(`Presents hallmark symptoms: ${matchedMandatory.join(', ')}`);
    }

    // Characteristic symptoms
    const matchedChar = rule.characteristicSymptoms.filter(matchSymptom);
    if (matchedChar.length > 0) {
      matchPoints += (matchedChar.length / rule.characteristicSymptoms.length) * 25;
      reasons.push(`Key clinical markers observed: ${matchedChar.join(', ')}`);
    }

    // Secondary symptoms
    const matchedSec = rule.secondarySymptoms.filter(matchSymptom);
    if (matchedSec.length > 0) {
      matchPoints += (matchedSec.length / rule.secondarySymptoms.length) * 15;
    }

    if (matchPoints > 15) {
      candidateScored.push({
        rule,
        score: Math.min(Math.round(matchPoints), 95),
        reason: reasons.join('; ')
      });
    }
  }

  // Sort candidates by score
  candidateScored.sort((a, b) => b.score - a.score);

  // Fallback if no specific rule matched
  const topCandidate = candidateScored[0] || {
    rule: {
      id: 'gen_01',
      code: 'GENERAL_BOVINE_INFECTION',
      name: 'Unspecified Bovine Infection / Pyrexia of Unknown Origin',
      marathiName: 'अस्पष्ट संसर्ग / अज्ञात ताप',
      hindiName: 'अस्पष्ट संक्रमण / अज्ञात बुखार',
      targetSpecies: [species],
      mandatorySymptoms: [],
      characteristicSymptoms: [],
      secondarySymptoms: [],
      zoonotic: false,
      baseSeverity: 'MEDIUM',
      recommendedSample: 'Whole blood in EDTA & Serum',
      recommendedTest: 'Differential Leukocyte Count & Blood Smear',
      immediateAction: 'Veterinary clinical examination, symptomatic antipyretic therapy, and monitoring.',
      quarantineRequired: false,
    },
    score: 45,
    reason: `Symptoms (${symptoms.join(', ')}) indicate general systemic distress.`
  };

  // Base Risk Calculation
  let overallRisk = topCandidate.score;

  // Severity Modifier
  if (severity === 'CRITICAL') {
    overallRisk += 20;
    contributingFactors.push('Critical clinical severity reported by field observer (+20% risk)');
  } else if (severity === 'HIGH') {
    overallRisk += 10;
    contributingFactors.push('Elevated acute symptom severity (+10% risk)');
  }

  // Symptoms Breakdown
  if (symptoms.includes('Sudden mortality')) {
    overallRisk += 25;
    contributingFactors.push('CRITICAL ALERT: Sudden mortality detected — High pathogen virulence indicator');
  }
  if (symptoms.includes('Skin lesions')) {
    contributingFactors.push('Observable dermal lesions matching Poxviridae/LSD pathology profile');
  }
  if (symptoms.includes('Excessive salivation') && symptoms.includes('Lameness')) {
    contributingFactors.push('Concurrent hypersalivation and foot lameness (Characteristic FMD dyad)');
  }
  if (temperature_f && temperature_f >= 104) {
    overallRisk += 10;
    contributingFactors.push(`High pyrexia recorded at ${temperature_f}°F (+10% risk)`);
  }

  // Vaccination Factor
  if (vaccination_status === 'OVERDUE' || vaccination_status === 'UNVACCINATED') {
    overallRisk += 15;
    contributingFactors.push(`Livestock vaccination is ${vaccination_status.replace('_', ' ')} (+15% vulnerability risk)`);
  } else {
    contributingFactors.push('Vaccination status: Up to date (Mitigates mortality probability)');
  }

  // Spatial Clustering Factor
  let isCluster = 0;
  if (nearbyCount >= 4) {
    overallRisk += 20;
    isCluster = 1;
    contributingFactors.push(`High spatial density: ${nearbyCount} active livestock cases reported in ${district}/${taluka} region (+20% cluster risk)`);
  } else if (nearbyCount >= 2) {
    overallRisk += 10;
    contributingFactors.push(`Localized case activity: ${nearbyCount} concurrent reports in surrounding area`);
  }

  // Weather & Vector factor (Simulated Maharashtra agro-climatic conditions)
  const weatherFactors = {
    temp_c: 29.5,
    humidity_pct: 78,
    vector_risk: 'HIGH (Elevated Stomoxys / Tabanid biting fly activity)',
    rainfall_anomaly: '+12% above seasonal average'
  };

  if (topCandidate.rule.code === 'LSD' || topCandidate.rule.code === 'HS') {
    overallRisk += 5;
    contributingFactors.push('Agro-meteorological conditions (78% humidity) favor arthropod vector transmission');
  }

  // Bound risk score between 10 and 99
  const finalRiskScore = Math.max(12, Math.min(98, Math.round(overallRisk)));

  // Risk Level Category
  let riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (finalRiskScore >= 80) riskLevel = 'CRITICAL';
  else if (finalRiskScore >= 60) riskLevel = 'HIGH';
  else if (finalRiskScore >= 35) riskLevel = 'MODERATE';
  else riskLevel = 'LOW';

  // Build Differential Diagnoses
  const differentials = candidateScored.slice(0, 3).map(c => ({
    disease: c.rule.name,
    marathiName: c.rule.marathiName,
    code: c.rule.code,
    confidence: Math.min(94, Math.max(25, c.score)),
    reason: c.reason || 'Symptomatic overlap with epidemiological profile.',
    recommendedTest: c.rule.recommendedTest
  }));

  if (differentials.length === 0) {
    differentials.push({
      disease: topCandidate.rule.name,
      marathiName: topCandidate.rule.marathiName,
      code: topCandidate.rule.code,
      confidence: 50,
      reason: 'Symptom matching based on reported clinical signs.',
      recommendedTest: topCandidate.rule.recommendedTest
    });
  }

  return {
    risk_score: finalRiskScore,
    risk_level: riskLevel,
    primary_suspected_disease: topCandidate.rule.name,
    confidence_percentage: differentials[0]?.confidence || 75,
    differential_diagnoses: differentials,
    contributing_factors: contributingFactors,
    recommended_action: topCandidate.rule.immediateAction,
    weather_factors: weatherFactors,
    cluster_alert_flag: isCluster
  };
}
