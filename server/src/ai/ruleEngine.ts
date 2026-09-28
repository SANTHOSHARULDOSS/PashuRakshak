// PashuRakshak Disease Knowledge Base & Clinical Rules

export interface DiseaseRule {
  id: string;
  code: string;
  name: string;
  marathiName: string;
  hindiName: string;
  targetSpecies: string[];
  mandatorySymptoms: string[];
  characteristicSymptoms: string[];
  secondarySymptoms: string[];
  zoonotic: boolean;
  baseSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendedSample: string;
  recommendedTest: string;
  immediateAction: string;
  quarantineRequired: boolean;
}

export const DISEASE_RULES: DiseaseRule[] = [
  {
    id: 'lsd_01',
    code: 'LSD',
    name: 'Lumpy Skin Disease (LSD)',
    marathiName: 'लम्पी त्वचा रोग',
    hindiName: 'लम्पी स्किन रोग',
    targetSpecies: ['Cattle', 'Buffalo'],
    mandatorySymptoms: ['Skin lesions', 'Fever'],
    characteristicSymptoms: ['Swelling', 'Reduced milk production', 'Excessive salivation'],
    secondarySymptoms: ['Loss of appetite', 'Nasal discharge', 'Lameness'],
    zoonotic: false,
    baseSeverity: 'HIGH',
    recommendedSample: 'Skin Scab / Nodule Biopsy & EDTA Blood',
    recommendedTest: 'Real-time PCR (Capripoxvirus)',
    immediateAction: 'Strict isolation of affected animal, mosquito/fly vector control, and ring vaccination (Goat Pox vaccine) within 5 km radius.',
    quarantineRequired: true,
  },
  {
    id: 'fmd_02',
    code: 'FMD',
    name: 'Foot and Mouth Disease (FMD)',
    marathiName: 'लाळ्या खुरकूत रोग',
    hindiName: 'खुरपका और मुंहपका रोग',
    targetSpecies: ['Cattle', 'Buffalo', 'Goat', 'Sheep', 'Pig'],
    mandatorySymptoms: ['Excessive salivation', 'Lameness'],
    characteristicSymptoms: ['Fever', 'Reduced milk production', 'Loss of appetite'],
    secondarySymptoms: ['Swelling', 'Weakness', 'Nasal discharge'],
    zoonotic: false,
    baseSeverity: 'HIGH',
    recommendedSample: 'Vesicular fluid / Epithelial tissue swab',
    recommendedTest: 'Antigen ELISA & RT-PCR (Aphthovirus)',
    immediateAction: 'Isolate affected herd, foot-bath disinfection (4% sodium carbonate / potassium permanganate), soft nutritious feed.',
    quarantineRequired: true,
  },
  {
    id: 'anthrax_03',
    code: 'ANTHRAX',
    name: 'Anthrax (Bacillus anthracis)',
    marathiName: 'काळपुळी / घटसर्प प्रकार',
    hindiName: 'एंथ्रेक्स (गिल्टी रोग)',
    targetSpecies: ['Cattle', 'Buffalo', 'Sheep', 'Goat'],
    mandatorySymptoms: ['Sudden mortality', 'Fever'],
    characteristicSymptoms: ['Weakness', 'Swelling', 'Cough'],
    secondarySymptoms: ['Nasal discharge', 'Loss of appetite'],
    zoonotic: true,
    baseSeverity: 'CRITICAL',
    recommendedSample: 'Peripheral blood smear (DO NOT OPEN CARCASS)',
    recommendedTest: 'Polychrome Methylene Blue (McFadyean) Staining & PCR',
    immediateAction: 'STRICT DANGER: Do NOT perform post-mortem. Deep burial with quicklime (6 ft). Immediate antibiotic treatment (Penicillin) for in-contact animals.',
    quarantineRequired: true,
  },
  {
    id: 'hs_04',
    code: 'HS',
    name: 'Hemorrhagic Septicemia (HS)',
    marathiName: 'घटसर्प रोग',
    hindiName: 'गलघोंटू रोग',
    targetSpecies: ['Cattle', 'Buffalo'],
    mandatorySymptoms: ['Swelling', 'Fever'],
    characteristicSymptoms: ['Cough', 'Nasal discharge', 'Excessive salivation'],
    secondarySymptoms: ['Loss of appetite', 'Weakness', 'Sudden mortality'],
    zoonotic: false,
    baseSeverity: 'CRITICAL',
    recommendedSample: 'Blood swab / Aspirate from swollen neck region',
    recommendedTest: 'Pasteurella multocida Culture & PCR',
    immediateAction: 'Immediate parenteral antibiotics (Oxytetracycline / Enrofloxacin), anti-inflammatory treatment, ring vaccination of surrounding herds.',
    quarantineRequired: true,
  },
  {
    id: 'bq_05',
    code: 'BQ',
    name: 'Black Quarter (BQ)',
    marathiName: 'फऱ्या रोग',
    hindiName: 'लंगड़ा बुखार / फड़किया',
    targetSpecies: ['Cattle', 'Buffalo', 'Sheep'],
    mandatorySymptoms: ['Lameness', 'Swelling'],
    characteristicSymptoms: ['Fever', 'Loss of appetite', 'Weakness'],
    secondarySymptoms: ['Sudden mortality', 'Reduced milk production'],
    zoonotic: false,
    baseSeverity: 'HIGH',
    recommendedSample: 'Aspirate from crepitant swelling muscle tissue',
    recommendedTest: 'Clostridium chauvoei fluorescent antibody test (FAT)',
    immediateAction: 'Penicillin therapy in early stage, surgical incision with antiseptic flushing, emergency BQ vaccination of healthy cohort.',
    quarantineRequired: false,
  },
  {
    id: 'ppr_06',
    code: 'PPR',
    name: 'Peste des Petits Ruminants (PPR)',
    marathiName: 'शेळ्या-मेंढ्यांची प्लेग',
    hindiName: 'बकरी प्लेग (पीपीआर)',
    targetSpecies: ['Goat', 'Sheep'],
    mandatorySymptoms: ['Fever', 'Diarrhea'],
    characteristicSymptoms: ['Nasal discharge', 'Cough', 'Loss of appetite'],
    secondarySymptoms: ['Weakness', 'Reduced milk production', 'Sudden mortality'],
    zoonotic: false,
    baseSeverity: 'HIGH',
    recommendedSample: 'Nasal/Eye swab & Heparinized Blood',
    recommendedTest: 'Competitive ELISA & RT-PCR (Morbillivirus)',
    immediateAction: 'Supportive fluid therapy, broad-spectrum antibiotics to prevent secondary pneumonia, live attenuated PPR vaccination of surrounding flocks.',
    quarantineRequired: true,
  },
  {
    id: 'brucellosis_07',
    code: 'BRUCELLOSIS',
    name: 'Bovine Brucellosis',
    marathiName: 'ब्रुसेलोसिस (गर्भपात रोग)',
    hindiName: 'ब्रुसेलोसिस संक्रामक गर्भपात',
    targetSpecies: ['Cattle', 'Buffalo', 'Goat', 'Sheep'],
    mandatorySymptoms: ['Abortion'],
    characteristicSymptoms: ['Fever', 'Reduced milk production'],
    secondarySymptoms: ['Weakness', 'Swelling'],
    zoonotic: true,
    baseSeverity: 'MEDIUM',
    recommendedSample: 'Serum & Milk (Brucella Milk Ring Test) / Vaginal Swab',
    recommendedTest: 'Rose Bengal Plate Test (RBPT) & ELISA',
    immediateAction: 'Zoonotic precaution! Protective PPE for handlers, hygienic disposal of aborted fetus and fetal membranes, separate milking.',
    quarantineRequired: true,
  },
  {
    id: 'avian_flu_08',
    code: 'AVIAN_FLU',
    name: 'Avian Influenza / Bird Flu',
    marathiName: 'बर्ड फ्लू (एव्हियन इन्फ्लुएन्झा)',
    hindiName: 'एवियन इन्फ्लूएंजा (बर्ड फ्लू)',
    targetSpecies: ['Poultry'],
    mandatorySymptoms: ['Sudden mortality', 'Weakness'],
    characteristicSymptoms: ['Nasal discharge', 'Cough', 'Swelling'],
    secondarySymptoms: ['Diarrhea', 'Loss of appetite'],
    zoonotic: true,
    baseSeverity: 'CRITICAL',
    recommendedSample: 'Oropharyngeal / Cloacal swabs',
    recommendedTest: 'Real-time RT-PCR (H5N1 / H9N2)',
    immediateAction: 'Cordon farm premises, notify Animal Husbandry Department & District Collector immediately, prepare bio-secure culling protocols.',
    quarantineRequired: true,
  }
];
