// Web Speech API Utilities for Farmer Voice Input and Audio Readout

export function speakText(text: string, lang: 'mr' | 'hi' | 'en' = 'mr') {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported on this browser.');
    return;
  }

  window.speechSynthesis.cancel(); // cancel previous

  const utterance = new SpeechSynthesisUtterance(text);
  if (lang === 'mr') {
    utterance.lang = 'mr-IN';
  } else if (lang === 'hi') {
    utterance.lang = 'hi-IN';
  } else {
    utterance.lang = 'en-IN';
  }

  utterance.rate = 0.95; // comfortable pace for rural farmers
  utterance.pitch = 1.0;

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Speech-to-Text Recognition Handler
export function startVoiceRecognition(
  lang: 'mr' | 'hi' | 'en',
  onResult: (transcript: string) => void,
  onError?: (err: any) => void
): { stop: () => void } | null {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    if (onError) onError(new Error('Speech recognition not supported in this browser.'));
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';

  recognition.onresult = (event: any) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      transcript += event.results[i][0].transcript;
    }
    onResult(transcript);
  };

  recognition.onerror = (event: any) => {
    if (onError) onError(event.error);
  };

  try {
    recognition.start();
  } catch (err) {
    console.warn('Voice recognition start error:', err);
  }

  return {
    stop: () => {
      try {
        recognition.stop();
      } catch (e) {}
    }
  };
}
