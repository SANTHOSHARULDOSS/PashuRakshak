import React from 'react';
import { PhoneCall, MapPin, Clock, Stethoscope, ShieldCheck, Ambulance, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const NearbyVetSupport: React.FC = () => {
  const { language } = useLanguage();

  const centers = [
    {
      id: 1,
      name: 'Shirur Government Veterinary Polyclinic Class-I',
      marathiName: 'शिरूर शासकीय पशुवैद्यकीय सर्वचिकित्सालय वर्ग-१',
      doctor: 'Dr. Anand Deshmukh (B.V.Sc & A.H)',
      phone: '+919423011223',
      distance: '4.2 km away',
      address: 'Main Market Yard Road, Shirur, Pune - 412210',
      hours: '24x7 Emergency Service',
      facilities: ['Inpatient Ward', 'Pathology Lab', 'Surgical Unit', 'Cold Chain Vaccine Depot', 'Emergency Ambulance']
    },
    {
      id: 2,
      name: 'Nighoj Primary Veterinary Aid Center',
      marathiName: 'निघोज प्राथमिक पशुवैद्यकीय सहाय्य केंद्र',
      doctor: 'Sunil Shinde (Livestock Supervisor)',
      phone: '+919765432100',
      distance: '1.1 km away (Nearest)',
      address: 'Near Gram Panchayat, Nighoj Village, Shirur',
      hours: '8:00 AM - 6:00 PM',
      facilities: ['First Aid', 'Routine Vaccination', 'Deworming', 'Artificial Insemination (AI)']
    },
    {
      id: 3,
      name: 'District Animal Disease Diagnostic Laboratory (DADL)',
      marathiName: 'जिल्हा पशु रोग निदान प्रयोगशाळा, औंध, पुणे',
      doctor: 'Dr. Priya Kulkarni (Senior Pathologist)',
      phone: '+919823145678',
      distance: '58 km away',
      address: 'Department of Animal Husbandry Campus, Aundh, Pune - 411067',
      hours: '9:00 AM - 5:30 PM',
      facilities: ['Real-Time PCR', 'ELISA Serology', 'Microscopy', 'Culture & Sensitivity']
    }
  ];

  return (
    <div className="space-y-6">
      {/* 24x7 Toll-Free & Emergency Ambulance Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-700 to-emerald-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-white/20 rounded-2xl">
            <Ambulance className="w-8 h-8" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-emerald-100 text-xs font-bold uppercase tracking-wider">
              24x7 Government Emergency
            </span>
            <h3 className="text-xl font-extrabold text-white mt-1">
              {language === 'mr' ? 'फिरता पशुवैद्यकीय दवाखाना व रुग्णवाहिका' : 'Emergency Mobile Veterinary Ambulance'}
            </h3>
            <p className="text-xs text-emerald-100 mt-1">
              Call toll-free for immediate doorstep critical livestock care
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <a
            href="tel:1962"
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-3 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl font-extrabold text-sm shadow-md transition active:scale-95"
          >
            <PhoneCall className="w-4 h-4 text-emerald-700" />
            <span>Call Toll-Free: 1962</span>
          </a>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {language === 'mr' ? 'नजीकची शासकीय पशुवैद्यकीय केंद्रे' : 'Nearby Veterinary Aid Centers & Hospitals'}
        </h2>
        <p className="text-xs text-slate-500">
          Government certified veterinary hospitals within your taluka & district
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {centers.map((center) => (
          <div
            key={center.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="px-2 py-0.5 rounded-md bg-gov-100 text-gov-800 dark:bg-gov-950 dark:text-gov-300 text-[10px] font-bold">
                  {center.distance}
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {center.hours}
                </span>
              </div>

              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                {language === 'mr' ? center.marathiName : center.name}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                In-charge: <strong>{center.doctor}</strong>
              </p>
              <p className="text-[11px] text-slate-400 flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                <span>{center.address}</span>
              </p>
            </div>

            {/* Facilities Chips */}
            <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-100 dark:border-slate-800">
              {center.facilities.map((fac, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium"
                >
                  {fac}
                </span>
              ))}
            </div>

            {/* Call button */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <a
                href={`tel:${center.phone}`}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gov-700 hover:bg-gov-800 text-white rounded-xl text-xs font-bold shadow-sm transition active:scale-95"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call {center.phone}</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
