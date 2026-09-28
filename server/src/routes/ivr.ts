import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/db.js';

const router = Router();

// Process IVR Call simulation
router.post(['/simulate', '/call'], (req, res) => {
  const {
    callerPhone,
    caller_phone = callerPhone || '+919822012345',
    language = 'mr', // 'mr' | 'hi' | 'en'
    menu_selection = req.body.speciesChoice || req.body.symptomChoice,  // 1: Report, 2: Vaccine, 3: Vet Helpline, 4: Outbreak Advisory
    ear_tag_or_symptoms
  } = req.body;

  try {
    let responseText = '';
    let marathiPrompt = '';
    let actionTaken = '';
    let smsDispatched = null;
    const caseNumber = `IVR-MH-${Math.floor(100000 + Math.random() * 900000)}`;

    if (!menu_selection) {
      // Step 1: Main Welcome Menu
      if (language === 'mr') {
        marathiPrompt = 'महाराष्ट्र शासन पशुसंवर्धन विभाग — पशुसंजीवनी २४x७ हेल्पलाईन मध्ये आपले स्वागत आहे. आजारी जनावराची नोंद करण्यासाठी १ दाबा. लसीकरण माहितीसाठी २ दाबा. नजीकच्या पशुवैद्यकीय अधिकाऱ्याशी संपर्क करण्यासाठी ३ दाबा. महत्त्वाच्या रोग सतर्कतेसाठी ४ दाबा.';
      } else if (language === 'hi') {
        marathiPrompt = 'महाराष्ट्र शासन पशुपालन विभाग — पशुसंजीवनी हेल्पलाइन में आपका स्वागत है। बीमार पशु की रिपोर्ट के लिए १ दबाएं। टीकाकरण जानकारी के लिए २ दबाएं। पशु चिकित्सक सहायता के लिए ३ दबाएं। सतर्कता सूचना के लिए ४ दबाएं।';
      } else {
        marathiPrompt = 'Welcome to PashuRakshak Maharashtra Livestock Health IVR Helpline. Press 1 to report sick livestock, Press 2 for vaccination status, Press 3 for veterinary support, Press 4 for disease advisories.';
      }

      return res.json({
        success: true,
        step: 'MENU',
        tollFreeNumber: '1800-180-1551',
        promptAudioText: marathiPrompt,
        availableOptions: [
          { key: 1, label: 'Report Sick Livestock (आजारी जनावराची नोंद)' },
          { key: 2, label: 'Vaccination Due Dates (लसीकरण माहिती)' },
          { key: 3, label: 'Contact Nearest Field Vet (पशुवैद्यकीय डॉक्टर मदत)' },
          { key: 4, label: 'Disease Outbreak Advisory (उद्रेक सतर्कता)' }
        ]
      });
    }

    // Process Specific Menu Option
    switch (Number(menu_selection)) {
      case 1: {
        // Report Animal
        const reportId = `rep_ivr_${uuidv4().substring(0, 6)}`;
        responseText = language === 'mr'
          ? 'आपल्या जनावराची आजार नोंदणी यशस्वी झाली आहे. शिरूर पशुवैद्यकीय अधिकारी डॉ. आनंद देशमुख यांना तात्काळ संदेश पाठवण्यात आला आहे. केस आयडी: ' + reportId
          : 'Your livestock illness report has been registered. Field Vet Dr. Anand Deshmukh has been notified. Case ID: ' + reportId;
        actionTaken = 'CREATED_EMERGENCY_IVR_REPORT';
        smsDispatched = `[Gov of Maharashtra] Dear Farmer, your livestock report ${reportId} is received. Vet Dr. Anand Deshmukh (+919423011223) assigned. Keep animal isolated.`;
        break;
      }
      case 2: {
        // Vaccination Info
        responseText = language === 'mr'
          ? 'आपल्या गोठ्यातील २ जनावरांचे लम्पी त्वचा रोग (LSD) लसीकरण पूर्ण आहे. पुढील एफएमडी लसीकरण १५ नोव्हेंबर रोजी देय आहे.'
          : 'Your cattle LSD vaccination is UP TO DATE. Next FMD booster due on 15th November 2026.';
        actionTaken = 'VACCINATION_INQUIRY';
        smsDispatched = `[PashuRakshak] Livestock Vaccination Reminder: FMD booster due on 15-Nov-2026. Contact Nighoj Vet Center.`;
        break;
      }
      case 3: {
        // Nearby Vet
        responseText = language === 'mr'
          ? 'आपले नजीकचे केंद्र: शिरूर शासकीय पशुवैद्यकीय दवाखाना. प्रभारी अधिकारी: डॉ. आनंद देशमुख, संपर्क: ९४२३०११२२३. रुग्णवाहिका २४ तास उपलब्ध आहे.'
          : 'Nearest Center: Shirur Government Veterinary Hospital. In-charge: Dr. Anand Deshmukh (+919423011223). Mobile veterinary clinic on standby.';
        actionTaken = 'VET_CONTACT_SHARED';
        smsDispatched = `[PashuRakshak] Vet Contact: Dr. Anand Deshmukh, Shirur Polyclinic (+919423011223). Emergency Ambulance: 1962.`;
        break;
      }
      case 4: {
        // Outbreak Advisory
        responseText = language === 'mr'
          ? 'महत्त्वाची सूचना: शिरूर व पारनेर तालुक्यात लम्पी त्वचा रोगाचा प्रादुर्भाव आहे. जनावरांचे आठवडी बाजार बंद असून डास-माशांवर औषध फवारणी करावी.'
          : 'Advisory: Lumpy Skin Disease containment active in Shirur & Parner talukas. Weekly cattle markets suspended. Ring vaccination underway.';
        actionTaken = 'OUTBREAK_ADVISORY_PLAYED';
        smsDispatched = `[Gov Alert] LSD Outbreak in Shirur/Parner. Keep herds isolated. Ring vaccination team visiting your village this week.`;
        break;
      }
      default:
        responseText = 'Invalid option selected.';
    }

    return res.json({
      success: true,
      step: 'COMPLETED',
      tollFreeNumber: '1800-180-1551',
      promptAudioText: responseText,
      actionTaken,
      smsDispatched,
      callRecord: {
        case_number: caseNumber,
        caller: caller_phone,
        status: 'DISPATCHED'
      },
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
