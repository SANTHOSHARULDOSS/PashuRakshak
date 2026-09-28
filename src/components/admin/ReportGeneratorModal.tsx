import React, { useState } from 'react';
import { X, FileText, Download, Printer, Check, RefreshCw } from 'lucide-react';
import { printSurveillanceBulletin, exportToCSV } from '../../utils/exportUtils';
import { api } from '../../api/client';

interface ReportGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportGeneratorModal: React.FC<ReportGeneratorModalProps> = ({ isOpen, onClose }) => {
  const [reportType, setReportType] = useState<string>('EPIDEMIOLOGY_BULLETIN');
  const [district, setDistrict] = useState<string>('Maharashtra State (All)');
  const [loading, setLoading] = useState<boolean>(false);

  const handleGenerate = async (format: 'PRINT' | 'CSV') => {
    setLoading(true);
    try {
      const res = await api.dashboard.getOverview();
      if (format === 'PRINT') {
        printSurveillanceBulletin(district, res.data);
      } else {
        exportToCSV(`PashuRakshak_${reportType}_${district}`, res.data?.districtWiseCases || []);
      }
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="p-5 bg-gradient-to-r from-gov-800 to-gov-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6" />
            <div>
              <h3 className="font-bold text-base">Generate Official Surveillance Bulletin</h3>
              <p className="text-xs text-gov-200">PDF-Ready Layout & CSV Export</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Report Category *
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:ring-2 focus:ring-gov-500 outline-none"
            >
              <option value="EPIDEMIOLOGY_BULLETIN">Weekly State Epidemiological Bulletin</option>
              <option value="DISTRICT_OUTBREAK_REPORT">District Outbreak Containment Summary</option>
              <option value="VACCINATION_COVERAGE">NADCP Vaccination Coverage Audit</option>
              <option value="LAB_DIAGNOSTICS">Diagnostic Laboratory Performance Report</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Select Jurisdiction *
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:ring-2 focus:ring-gov-500 outline-none"
            >
              <option value="Maharashtra State (All)">Maharashtra State (All 36 Districts)</option>
              <option value="Pune District">Pune District</option>
              <option value="Ahmednagar District">Ahmednagar District</option>
              <option value="Satara District">Satara District</option>
              <option value="Kolhapur District">Kolhapur District</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-3">
            <button
              onClick={() => handleGenerate('PRINT')}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-2.5 bg-gov-700 hover:bg-gov-800 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Bulletin (PDF)</span>
            </button>

            <button
              onClick={() => handleGenerate('CSV')}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 transition"
            >
              <Download className="w-4 h-4" />
              <span>Export Raw CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
