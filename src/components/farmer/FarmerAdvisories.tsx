import React from 'react';
import { Megaphone, ShieldAlert, Sparkles, AlertTriangle, Bug, CloudRain, Syringe, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const FarmerAdvisories: React.FC = () => {
  const { language } = useLanguage();

  const advisories = [
    {
      id: 1,
      severity: 'CRITICAL',
      title: language === 'mr' ? 'लम्पी त्वचा रोग (LSD) सतर्कता व प्रतिबंधात्मक उपाय' : 'Lumpy Skin Disease (LSD) High Alert & Prevention',
      date: '२८ सप्टेंबर २०२६',
      badge: 'Active Containment (शिरूर व पारनेर)',
      icon: Bug,
      content: language === 'mr'
        ? 'शिरूर व लगतच्या तालुक्यांमध्ये लम्पी रोगाचा प्रादुर्भाव आढळून आला आहे. गोठ्यात डास, माश्या व गोचीड नियंत्रणासाठी फवारणी करावी. बाधित जनावरांना तात्काळ वेगळे बांधावे आणि गोठ्याची निर्जंतुकीकरण प्रक्रिया करावी.'
        : 'Active LSD clusters identified in Shirur & Parner talukas. Spray insect repellents against Stomoxys & Tabanid biting flies. Isolate affected animals immediately in vector-screened sheds.',
      action: 'गोठ्यात सायपरमेथ्रीन किंवा कडुनिंबाच्या धुराची फवारणी करा.'
    },
    {
      id: 2,
      severity: 'HIGH',
      title: language === 'mr' ? 'लाळ्या खुरकूत (FMD) मोफत लसीकरण मोहीम' : 'Foot & Mouth Disease (FMD) Free Ring Vaccination Drive',
      date: '२५ सप्टेंबर २०२६',
      badge: 'National Animal Disease Control Programme',
      icon: Syringe,
      content: language === 'mr'
        ? 'सर्व दुधाळ व देशी जनावरांना एफएमडी लस टोचून घेणे अनिवार्य आहे. पशुवैद्यकीय पथक आपल्या गावात भेट देईल. लाळ गळणे किंवा खुर सुजणे ही लक्षणे आढळल्यास पोटॅशियम परमँगनेटच्या पाण्याने खूर धुवावेत.'
        : 'Mandatory FMD vaccination drive underway. Wash infected feet with 4% sodium carbonate / potassium permanganate solution and provide soft digestible mash.',
      action: 'पशुवैद्यकीय अधिकाऱ्यांशी संपर्क साधून मोफत लस घ्या.'
    },
    {
      id: 3,
      severity: 'WARNING',
      title: language === 'mr' ? 'पावसाळ्यानंतरचा घटसर्प (HS) व फऱ्या (BQ) प्रतिबंध' : 'Post-Monsoon Hemorrhagic Septicemia (HS) Management',
      date: '२२ सप्टेंबर २०२६',
      badge: 'Seasonal Advisory (हंगामी सल्ला)',
      icon: CloudRain,
      content: language === 'mr'
        ? 'पावसाळ्यानंतर गवत व पाणी साचल्यामुळे घटसर्पाचा धोका वाढतो. गळ्याजवळ गरम सूज किंवा श्वास घेताना घरघर आवाज आल्यास विलंब न करता तात्काळ प्रतिजैविक (एंटीबायोटिक) उपचार सुरू करावेत.'
        : 'High humidity and flooded pastures favor bacterial multiplication. Report any submandibular throat edema and respiratory snoring immediately for parenteral antibiotics.',
      action: 'जनावरांना साचलेले दूषित पाणी पिण्यास देऊ नका.'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-saffron-500" />
          <span>{language === 'mr' ? 'शासकीय रोग सतर्कता व शेतकरी सल्लागार' : 'Official Disease Advisories & Bio-Security Guidelines'}</span>
        </h2>
        <p className="text-xs text-slate-500">
          Government of Maharashtra Animal Husbandry Department Verified Advisories
        </p>
      </div>

      <div className="space-y-4">
        {advisories.map((adv) => {
          const Icon = adv.icon;
          return (
            <div
              key={adv.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-saffron-50 dark:bg-saffron-950/60 text-saffron-700 dark:text-saffron-300 rounded-xl">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-bold uppercase tracking-wider">
                      {adv.badge}
                    </span>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mt-1">
                      {adv.title}
                    </h3>
                    <p className="text-[11px] text-slate-400">{adv.date}</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                {adv.content}
              </p>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>कृती: {adv.action}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
