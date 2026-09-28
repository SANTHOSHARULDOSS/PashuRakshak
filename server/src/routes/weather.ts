import { Router } from 'express';

const router = Router();

// Maharashtra Agro-climatic weather data & vector breeding intelligence
const DISTRICT_WEATHER_DATA: Record<string, any> = {
  'Pune': {
    temperature_c: 29.4,
    humidity_pct: 78,
    rainfall_mm_24h: 14.2,
    rainfall_anomaly: '+12% above seasonal mean',
    vector_risk: 'HIGH',
    vector_risk_details: 'High humidity & stagnant water puddles in Western Maharashtra promote Tabanid & Stomoxys fly breeding (High LSD & HS vector pressure).',
    heat_stress_index: 'MODERATE (THI: 76.5)',
    monsoon_phase: 'Post-Monsoon Transition',
    last_synced: new Date().toISOString()
  },
  'Ahmednagar': {
    temperature_c: 31.8,
    humidity_pct: 72,
    rainfall_mm_24h: 4.5,
    rainfall_anomaly: '+5% normal range',
    vector_risk: 'MODERATE',
    vector_risk_details: 'Moderate fly activity in irrigated canal areas (Parner, Sangamner).',
    heat_stress_index: 'MODERATE-HIGH (THI: 78.1)',
    monsoon_phase: 'Dry Spurt',
    last_synced: new Date().toISOString()
  },
  'Satara': {
    temperature_c: 27.5,
    humidity_pct: 84,
    rainfall_mm_24h: 22.0,
    rainfall_anomaly: '+25% heavy rainfall',
    vector_risk: 'CRITICAL',
    vector_risk_details: 'Heavy rainfall and saturated pastures increase risk of Hemorrhagic Septicemia and liver fluke infestation in Karad & Patan valleys.',
    heat_stress_index: 'LOW (THI: 72.0)',
    monsoon_phase: 'Wet Saturated Zone',
    last_synced: new Date().toISOString()
  },
  'Kolhapur': {
    temperature_c: 28.0,
    humidity_pct: 86,
    rainfall_mm_24h: 30.5,
    rainfall_anomaly: '+30% flood-prone',
    vector_risk: 'HIGH',
    vector_risk_details: 'Panchganga river basin waterlogging favors clostridial and bacterial spore propagation.',
    heat_stress_index: 'LOW-MODERATE',
    monsoon_phase: 'Riverine High Moisture',
    last_synced: new Date().toISOString()
  },
  'Chhatrapati Sambhajinagar': {
    temperature_c: 33.2,
    humidity_pct: 64,
    rainfall_mm_24h: 0.0,
    rainfall_anomaly: '-8% deficit',
    vector_risk: 'MODERATE',
    vector_risk_details: 'Dry semi-arid conditions reduce vector flies but elevate heat stress in crossbred dairy cattle.',
    heat_stress_index: 'HIGH (THI: 81.2)',
    monsoon_phase: 'Dry Semi-Arid',
    last_synced: new Date().toISOString()
  },
  'Nagpur': {
    temperature_c: 32.5,
    humidity_pct: 70,
    rainfall_mm_24h: 8.0,
    rainfall_anomaly: 'Normal',
    vector_risk: 'MODERATE',
    vector_risk_details: 'Moderate humidity in Vidarbha region.',
    heat_stress_index: 'MODERATE',
    monsoon_phase: 'Normal',
    last_synced: new Date().toISOString()
  }
};

router.get('/:district', (req, res) => {
  const { district } = req.params;
  const weather = DISTRICT_WEATHER_DATA[district] || DISTRICT_WEATHER_DATA['Pune'];

  return res.json({
    success: true,
    district: district || 'Pune',
    isRealtimeDemoFeed: true,
    data: {
      ...weather,
      vector_activity_index: weather.vector_risk
    }
  });
});

export default router;
