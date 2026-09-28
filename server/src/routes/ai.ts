import { Router } from 'express';
import { assessLivestockRisk } from '../ai/riskAssessor.js';
import { DISEASE_RULES } from '../ai/ruleEngine.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Real-time AI Triage & Differential Diagnosis Simulator
router.post('/triage', (req, res) => {
  const {
    species = 'Cattle',
    symptoms = [],
    severity = 'MEDIUM',
    temperature_f,
    vaccination_status = 'UP_TO_DATE',
    latitude,
    longitude,
    district = 'Pune',
    taluka = 'Shirur'
  } = req.body;

  try {
    const result = assessLivestockRisk({
      species,
      symptoms,
      severity,
      temperature_f: temperature_f ? Number(temperature_f) : undefined,
      vaccination_status,
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      district,
      taluka
    });

    return res.json({
      success: true,
      disclaimer: 'AI-assisted preliminary assessment — veterinary confirmation required.',
      data: result
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Knowledge Base Rules Listing for Transparency
router.get('/rules', (req, res) => {
  return res.json({
    success: true,
    count: DISEASE_RULES.length,
    data: DISEASE_RULES
  });
});

export default router;
