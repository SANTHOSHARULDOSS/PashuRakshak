import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, Filter, AlertCircle, Syringe, HeartPulse, ChevronRight, Calendar } from 'lucide-react';
import { api } from '../../api/client';
import { Livestock } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { useLanguage } from '../../context/LanguageContext';

interface MyAnimalsListProps {
  onOpenRegisterModal: () => void;
  onOpenReportModal: (animalId?: string) => void;
}

export const MyAnimalsList: React.FC<MyAnimalsListProps> = ({
  onOpenRegisterModal,
  onOpenReportModal
}) => {
  const [animals, setAnimals] = useState<Livestock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [speciesFilter, setSpeciesFilter] = useState<string>('');
  const { t, language } = useLanguage();

  const fetchAnimals = async () => {
    try {
      setLoading(true);
      const res = await api.animals.list({
        search: searchTerm || undefined,
        species: speciesFilter || undefined
      });
      if (res.success) {
        setAnimals(res.data);
      }
    } catch (e) {
      console.warn('Failed to load livestock:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnimals();
  }, [searchTerm, speciesFilter]);

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {language === 'mr' ? 'माझे पशुधन नोंदणी' : 'My Registered Livestock'}
          </h2>
          <p className="text-xs text-slate-500">
            {animals.length} animals registered in Bharat Pashudhan / Maharashtra database
          </p>
        </div>

        <button
          onClick={onOpenRegisterModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-gov-700 hover:bg-gov-800 text-white rounded-xl text-xs font-bold shadow-md shadow-gov-700/20 active:scale-95 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{language === 'mr' ? 'नवीन जनावर नोंदवा' : 'Register New Animal'}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Ear Tag ID (e.g. MH-PUN-001892) or Breed..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-gov-500 outline-none"
          />
        </div>

        <select
          value={speciesFilter}
          onChange={(e) => setSpeciesFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-gov-500 outline-none"
        >
          <option value="">All Species (सर्व प्रजाती)</option>
          <option value="Cattle">Cattle (गाय / बैल)</option>
          <option value="Buffalo">Buffalo (म्हैस)</option>
          <option value="Goat">Goat (शेळी)</option>
          <option value="Sheep">Sheep (मेंढी)</option>
          <option value="Poultry">Poultry (कोंबडी)</option>
        </select>
      </div>

      {/* Livestock Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading livestock records...</div>
      ) : animals.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500">
          <p className="font-semibold text-sm">No livestock found matching your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {animals.map((animal) => (
            <div
              key={animal.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-gov-400 transition flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
                    <img
                      src={animal.photo_url || '/logo.svg'}
                      alt={animal.breed}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {animal.breed} ({animal.species})
                    </h3>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">
                      Tag: <strong className="text-slate-800 dark:text-slate-200">{animal.ear_tag_id}</strong>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {animal.sex === 'FEMALE' ? 'Female (मादी)' : 'Male (नर)'} | {Math.floor(animal.age_months / 12)}y {animal.age_months % 12}m
                    </p>
                  </div>
                </div>
                <StatusBadge status={animal.health_status} size="sm" />
              </div>

              {/* Vaccination & Location details */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950/80 rounded-xl space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center justify-between">
                  <span>Vaccine Status:</span>
                  <StatusBadge status={animal.vaccination_status} size="sm" />
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span>Next Due:</span>
                  <strong className="text-slate-700 dark:text-slate-300">
                    {animal.next_vaccination_due ? new Date(animal.next_vaccination_due).toLocaleDateString() : 'Dec 2026'}
                  </strong>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span>Village/Taluka:</span>
                  <span>{animal.village}, {animal.taluka}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => onOpenReportModal(animal.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 rounded-lg text-xs font-bold transition"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Report Illness</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
