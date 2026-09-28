import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X, Sparkles, MessageSquare } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { startVoiceRecognition, speakText, stopSpeaking } from '../../utils/audioUtils';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAutoFillReport?: (symptoms: string[], text: string) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  onAutoFillReport
}) => {
  const { language } = useLanguage();
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [responseMsg, setResponseMsg] = useState<string>('');
  const [recHandler, setRecHandler] = useState<{ stop: () => void } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTranscript('');
      const initialGreeting =
        language === 'mr'
          ? 'नमस्कार! पशुरक्षक व्हॉईस सहाय्यकामध्ये आपले स्वागत आहे. बोला, आपल्या जनावराची काय समस्या आहे?'
          : language === 'hi'
          ? 'नमस्ते! पशुरक्षक वॉयस असिस्टेंट में आपका स्वागत है। बताएं, आपके पशु को क्या समस्या है?'
          : 'Hello! Welcome to PashuRakshak Voice Assistant. Please tell me your livestock symptoms.';
      setResponseMsg(initialGreeting);
      speakText(initialGreeting, language);
    } else {
      stopSpeaking();
      if (recHandler) recHandler.stop();
      setIsListening(false);
    }
  }, [isOpen, language]);

  const toggleListening = () => {
    if (isListening) {
      if (recHandler) recHandler.stop();
      setIsListening(false);
    } else {
      stopSpeaking();
      setIsListening(true);
      const handler = startVoiceRecognition(
        language,
        (text) => {
          setTranscript(text);
          processVoiceQuery(text);
        },
        (err) => {
          console.warn('Voice error:', err);
          setIsListening(false);
        }
      );
      setRecHandler(handler);
    }
  };

  const processVoiceQuery = (query: string) => {
    const lower = query.toLowerCase();
    let reply = '';
    const detectedSymptoms: string[] = [];

    // Symptom keyword extraction
    if (lower.includes('ताप') || lower.includes('fever') || lower.includes('bukhar') || lower.includes('hot')) {
      detectedSymptoms.push('Fever');
    }
    if (lower.includes('गाठ') || lower.includes('gathi') || lower.includes('fode') || lower.includes('nodule') || lower.includes('lump') || lower.includes('skin')) {
      detectedSymptoms.push('Skin lesions');
    }
    if (lower.includes('दूध') || lower.includes('dudh') || lower.includes('milk')) {
      detectedSymptoms.push('Reduced milk production');
    }
    if (lower.includes('लाळ') || lower.includes('saliva') || lower.includes('lal')) {
      detectedSymptoms.push('Excessive salivation');
    }
    if (lower.includes('लंगड') || lower.includes('limp') || lower.includes('langda')) {
      detectedSymptoms.push('Lameness');
    }

    if (detectedSymptoms.length > 0) {
      if (language === 'mr') {
        reply = `मी आपल्या बोलण्यातून लक्षणे नोंदवली आहेत: ${detectedSymptoms.join(', ')}. प्राथमिक निष्कर्षानुसार हा लम्पी त्वचा रोग (LSD) किंवा संसर्ग असू शकतो. आजार नोंदणी फॉर्म आपोआप भरत आहे.`;
      } else if (language === 'hi') {
        reply = `लक्षणे पहचानी गईं: ${detectedSymptoms.join(', ')}। रिपोर्ट फॉर्म में जानकारी जोड़ दी गई है।`;
      } else {
        reply = `Identified symptoms: ${detectedSymptoms.join(', ')}. Auto-filling health report for veterinary review.`;
      }

      if (onAutoFillReport) {
        onAutoFillReport(detectedSymptoms, query);
      }
    } else if (lower.includes('लसीकरण') || lower.includes('vaccin') || lower.includes('tika')) {
      reply = language === 'mr'
        ? 'शिरूर तालुक्यात लम्पी त्वचा रोग व एफएमडी मोफत रिंग लसीकरण मोहीम सुरू आहे. आपल्या जनावराची नोंदणी तपासा.'
        : 'LSD and FMD ring vaccination drives are active in your area.';
    } else if (lower.includes('डॉक्टर') || lower.includes('vet') || lower.includes('hospital')) {
      reply = language === 'mr'
        ? 'आपले नजीकचे केंद्र शिरूर पशुवैद्यकीय दवाखाना आहे. संपर्क: डॉ. आनंद देशमुख, फोन: ९४२३०११२२३.'
        : 'Nearest hospital: Shirur Veterinary Polyclinic. Doctor in charge: Dr. Anand Deshmukh (+919423011223).';
    } else {
      reply = language === 'mr'
        ? 'मी आपले ऐकले. आपण "माझ्या गाईला ताप आणि अंगावर गाठी आहेत" किंवा "लसीकरण कधी आहे" असे विचारू शकता.'
        : 'I heard you. You can report symptoms like "My cow has fever and skin lumps" or ask about vaccination.';
    }

    setResponseMsg(reply);
    speakText(reply, language);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Top bar */}
        <div className="p-4 bg-gradient-to-r from-gov-800 to-gov-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-saffron-400 animate-pulse" />
            <h3 className="font-bold text-sm">
              {language === 'mr' ? 'पशुरक्षक व्हॉईस सहाय्यक' : language === 'hi' ? 'पशुरक्षक वॉयस असिस्टेंट' : 'PashuRakshak Voice Assistant'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-center space-y-6">
          {/* Animated Microphone Button */}
          <div className="flex justify-center">
            <button
              onClick={toggleListening}
              className={`relative p-7 rounded-full shadow-xl transition-all active:scale-90 ${
                isListening
                  ? 'bg-rose-600 text-white ring-8 ring-rose-400/40 animate-pulse'
                  : 'bg-gov-700 hover:bg-gov-800 text-white hover:ring-8 hover:ring-gov-400/20'
              }`}
            >
              {isListening ? <Mic className="w-10 h-10" /> : <MicOff className="w-10 h-10" />}
            </button>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gov-600 dark:text-gov-400">
              {isListening ? (language === 'mr' ? 'ऐकत आहे... बोला...' : 'Listening... Speak now...') : (language === 'mr' ? 'माईक बटण दाबून बोला' : 'Tap microphone to speak')}
            </p>
            {transcript && (
              <div className="mt-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 italic">
                "{transcript}"
              </div>
            )}
          </div>

          {/* AI Response Card */}
          <div className="p-4 bg-saffron-50 dark:bg-slate-950 rounded-xl border border-saffron-200 dark:border-slate-800 text-left">
            <div className="flex items-center justify-between text-xs font-bold text-saffron-900 dark:text-saffron-400 mb-1">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" /> AI Response:
              </span>
              <button
                onClick={() => speakText(responseMsg, language)}
                className="hover:underline flex items-center gap-1 text-[11px]"
              >
                <Volume2 className="w-3.5 h-3.5" /> Replay Voice
              </button>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{responseMsg}</p>
          </div>

          {/* Example voice prompts */}
          <div className="text-left">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Try saying (बोलून पहा):</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                'माझ्या गाईला ताप आणि अंगावर गाठी आल्या आहेत',
                'शिरूरमध्ये लम्पी रोगाचा उद्रेक आहे का?',
                'नजीकच्या डॉक्टरांचा फोन नंबर द्या'
              ].map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTranscript(sample);
                    processVoiceQuery(sample);
                  }}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
                >
                  "{sample}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
