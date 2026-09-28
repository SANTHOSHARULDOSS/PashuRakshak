import React, { useState, useEffect } from 'react';
import { X, MapPin, Camera, Sparkles, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { LivestockSpecies } from '../../types';

interface AnimalRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AnimalRegistrationModal: React.FC<AnimalRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [earTagId, setEarTagId] = useState<string>('');
  const [species, setSpecies] = useState<LivestockSpecies>('Cattle');
  const [breed, setBreed] = useState<string>('Gir Crossbred');
  const [sex, setSex] = useState<'FEMALE' | 'MALE'>('FEMALE');
  const [ageMonths, setAgeMonths] = useState<number>(36);
  const [latitude, setLatitude] = useState<number>(18.8247);
  const [longitude, setLongitude] = useState<number>(74.3412);
  const [photoUrl, setPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=600&auto=format&fit=crop&q=80');
  const [vaccinationStatus, setVaccinationStatus] = useState<string>('UP_TO_DATE');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      // Auto-generate random standard Maharashtra Ear Tag
      setEarTagId(`MH-${(user?.district || 'PUN').substring(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`);
      captureLocation();
    }
  }, [isOpen, user]);

  const captureLocation = () => {
    if ('geolocation' in navigator) {
      setGpsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
          setGpsLoading(false);
        },
        (err) => {
          console.warn('Geolocation error fallback:', err);
          setGpsLoading(false);
        }
      );
    }
  };

  const breedOptions: Record<LivestockSpecies, string[]> = {
    Cattle: ['Gir Crossbred', 'Khillari', 'Dangi', 'Deoni', 'Red Sindhi', 'Sahiwal', 'Holstein Friesian'],
    Buffalo: ['Murrah', 'Pandharpuri', 'Nagpuri', 'Surti', 'Jaffarabadi', 'Marathwadi'],
    Goat: ['Osmanabadi', 'Sangamneri', 'Berari', 'Sirohi', 'Barbari'],
    Sheep: ['Deccani', 'Madgyal', 'Patanwadi'],
    Pig: ['Large White Yorkshire', 'Ghungroo', 'Indigenous Cross'],
    Poultry: ['Giriraja', 'Kadaknath', 'Aseel', 'Kaveri', 'Broiler']
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!earTagId || !breed) {
      setErrorMsg('Ear Tag ID and Breed are required.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      await api.animals.create({
        ear_tag_id: earTagId,
        species,
        breed,
        sex,
        age_months: Number(ageMonths),
        village: user?.village || 'Nighoj',
        taluka: user?.taluka || 'Shirur',
        district: user?.district || 'Pune',
        latitude,
        longitude,
        health_status: 'HEALTHY',
        vaccination_status: vaccinationStatus as any,
        photo_url: photoUrl
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to register animal.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-gov-800 to-gov-900 text-white flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold">
              {language === 'mr' ? 'नवीन जनावर नोंदणी' : 'Livestock Registration'}
            </h3>
            <p className="text-xs text-gov-200">
              Bharat Pashudhan / Maharashtra Ear Tag Registry
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Ear Tag Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Ear Tag ID (कान टॅग क्रमांक) *
            </label>
            <input
              type="text"
              required
              value={earTagId}
              onChange={(e) => setEarTagId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono font-bold text-sm focus:ring-2 focus:ring-gov-500 outline-none"
              placeholder="e.g. MH-PUN-104921"
            />
          </div>

          {/* Species Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Species (जनावराचा प्रकार) *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Cattle', 'Buffalo', 'Goat', 'Sheep', 'Pig', 'Poultry'] as LivestockSpecies[]).map((sp) => (
                <button
                  type="button"
                  key={sp}
                  onClick={() => {
                    setSpecies(sp);
                    setBreed(breedOptions[sp][0]);
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    species === sp
                      ? 'bg-gov-700 text-white border-gov-700 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {t(`species.${sp}`, sp)}
                </button>
              ))}
            </div>
          </div>

          {/* Breed & Sex */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Breed (जात) *
              </label>
              <select
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-gov-500 outline-none"
              >
                {breedOptions[species].map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Sex (लिंग) *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSex('FEMALE')}
                  className={`py-2 rounded-xl border text-xs font-bold transition ${
                    sex === 'FEMALE'
                      ? 'bg-gov-700 text-white border-gov-700 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  मादी (Female)
                </button>
                <button
                  type="button"
                  onClick={() => setSex('MALE')}
                  className={`py-2 rounded-xl border text-xs font-bold transition ${
                    sex === 'MALE'
                      ? 'bg-gov-700 text-white border-gov-700 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  नर (Male)
                </button>
              </div>
            </div>
          </div>

          {/* Age in Months */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Age (वय महिने) : <strong className="text-gov-700">{ageMonths} months ({Math.floor(ageMonths / 12)} yrs {ageMonths % 12} mo)</strong>
            </label>
            <input
              type="range"
              min="1"
              max="180"
              value={ageMonths}
              onChange={(e) => setAgeMonths(Number(e.target.value))}
              className="w-full accent-gov-700"
            />
          </div>

          {/* GPS Location Auto-Captured */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">GPS Geo-Tag: </span>
                <span className="font-mono text-slate-500">
                  {latitude.toFixed(4)}, {longitude.toFixed(4)} ({user?.village || 'Nighoj'})
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={captureLocation}
              disabled={gpsLoading}
              className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition"
            >
              {gpsLoading ? 'Capturing...' : 'Re-Capture GPS'}
            </button>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gov-700 hover:bg-gov-800 text-white rounded-xl text-xs font-bold shadow-md shadow-gov-700/20 active:scale-95 transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>{language === 'mr' ? 'नोंदणी पूर्ण करा' : 'Register Livestock'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
