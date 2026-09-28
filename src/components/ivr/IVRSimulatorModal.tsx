import React, { useState } from 'react';
import {
  PhoneCall,
  PhoneOff,
  Volume2,
  X,
  MessageSquare,
  Sparkles,
  Smartphone,
  RefreshCw,
  Play
} from 'lucide-react';
import { api } from '../../api/client';
import { speakText, stopSpeaking } from '../../utils/audioUtils';
import { useLanguage } from '../../context/LanguageContext';

interface IVRSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IVRSimulatorModal: React.FC<IVRSimulatorModalProps> = ({ isOpen, onClose }) => {
  const { language: currentLang } = useLanguage();
  const [callActive, setCallActive] = useState<boolean>(false);
  const [ivrLang, setIvrLang] = useState<'mr' | 'hi' | 'en'>('mr');
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [smsReceipt, setSmsReceipt] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const startCall = async () => {
    setLoading(true);
    setCallActive(true);
    setSmsReceipt(null);

    try {
      const res = await api.ivr.simulate({
        language: ivrLang
      });

      if (res.success) {
        setCurrentPrompt(res.promptAudioText);
        speakText(res.promptAudioText, ivrLang);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const pressKeypad = async (key: number) => {
    if (!callActive) return;
    setLoading(true);

    try {
      const res = await api.ivr.simulate({
        language: ivrLang,
        menu_selection: key
      });

      if (res.success) {
        setCurrentPrompt(res.promptAudioText);
        setSmsReceipt(res.smsDispatched || null);
        speakText(res.promptAudioText, ivrLang);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const endCall = () => {
    stopSpeaking();
    setCallActive(false);
    setCurrentPrompt('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">IVR Feature Phone Helpline Simulator</h3>
              <p className="text-xs text-emerald-200">Toll-Free 1800-180-1551 (पशुसंजीवनी २४x७)</p>
            </div>
          </div>
          <button
            onClick={() => {
              endCall();
              onClose();
            }}
            className="p-1 rounded-lg text-emerald-200 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Dial Screen */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white text-center space-y-2 border border-slate-800 shadow-inner">
            <div className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-bold">
              {callActive ? '🟢 Call In Progress — 1800-180-1551' : '⚪ Line Standby — Toll-Free'}
            </div>
            <div className="text-lg font-bold font-mono">
              {callActive ? '1800-180-1551' : 'Pashu Sanjeevani IVR'}
            </div>

            {currentPrompt && (
              <div className="p-3 bg-slate-800 rounded-xl text-xs text-slate-200 italic border border-slate-700 max-h-32 overflow-y-auto text-left leading-relaxed">
                <div className="flex items-center justify-between text-[10px] font-bold text-emerald-400 not-italic uppercase mb-1">
                  <span>Voice Prompt:</span>
                  <button onClick={() => speakText(currentPrompt, ivrLang)} className="hover:underline flex items-center gap-1">
                    <Volume2 className="w-3 h-3" /> Replay Voice
                  </button>
                </div>
                "{currentPrompt}"
              </div>
            )}
          </div>

          {/* Language Selector */}
          <div className="flex items-center justify-center gap-2">
            {(['mr', 'hi', 'en'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setIvrLang(l)}
                disabled={callActive}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  ivrLang === l
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {l === 'mr' ? '१ मराठी (Marathi)' : l === 'hi' ? '२ हिन्दी (Hindi)' : '3 English'}
              </button>
            ))}
          </div>

          {/* Call / Hangup CTA */}
          <div className="flex justify-center">
            {!callActive ? (
              <button
                onClick={startCall}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-600/30 active:scale-95 transition"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <PhoneCall className="w-5 h-5" />}
                <span>Dial 1800-180-1551</span>
              </button>
            ) : (
              <button
                onClick={endCall}
                className="flex items-center gap-2 px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-rose-600/30 active:scale-95 transition"
              >
                <PhoneOff className="w-5 h-5" />
                <span>End Call (कॉल समाप्त)</span>
              </button>
            )}
          </div>

          {/* Keypad */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
              IVR Interactive Keypad (कीपॅड दाबा)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: 1, label: '1: Report Sickness', sub: 'आजारी नोंदणी' },
                { key: 2, label: '2: Vaccine Info', sub: 'लसीकरण तारीख' },
                { key: 3, label: '3: Vet Doctor Help', sub: 'डॉक्टर संपर्क' },
                { key: 4, label: '4: Outbreak Advisory', sub: 'रोग सतर्कता' }
              ].map((btn) => (
                <button
                  key={btn.key}
                  disabled={!callActive || loading}
                  onClick={() => pressKeypad(btn.key)}
                  className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-left border border-slate-200 dark:border-slate-700 transition active:scale-95 disabled:opacity-40"
                >
                  <div className="font-bold text-xs">{btn.label}</div>
                  <div className="text-[10px] text-slate-400">{btn.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* SMS Notification Receipt simulation */}
          {smsReceipt && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-900 space-y-1 text-xs animate-in fade-in">
              <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Simulated Gov SMS Delivered to Farmer Phone:</span>
              </div>
              <p className="font-mono text-emerald-800 dark:text-emerald-200 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900/60">
                {smsReceipt}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
