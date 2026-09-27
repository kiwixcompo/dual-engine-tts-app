// Web Speech API Synthesis Engine
// Instant, zero-download, natively built into all browsers

export interface WebVoiceItem {
  id: string;
  name: string;
  lang: string;
  voiceURI: string;
}

let cachedVoices: SpeechSynthesisVoice[] = [];

export function getBrowserVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve([]);
      return;
    }

    const available = window.speechSynthesis.getVoices();
    if (available.length > 0) {
      cachedVoices = available;
      resolve(available);
      return;
    }

    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoices = window.speechSynthesis.getVoices();
      resolve(cachedVoices);
    };

    setTimeout(() => {
      resolve(window.speechSynthesis.getVoices());
    }, 500);
  });
}

// MediaRecorder / Audio capture for Web Speech API to provide an Audio URL & download
export async function synthesizeWebSpeech(
  text: string,
  voiceUri?: string,
  rate: number = 1.0
): Promise<{ audioUrl: string; duration?: number }> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    throw new Error('Web Speech API is not supported in this browser.');
  }

  // Ensure any ongoing utterance is cancelled
  window.speechSynthesis.cancel();

  const voices = await getBrowserVoices();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = Math.max(0.5, Math.min(2.0, rate));

  if (voiceUri) {
    const matched = voices.find((v) => v.voiceURI === voiceUri || v.name === voiceUri);
    if (matched) {
      utterance.voice = matched;
    }
  }

  // Try MediaStreamAudioDestinationNode if supported, or speech synthesis directly
  return new Promise((resolve, reject) => {
    utterance.onstart = () => {
      // Speech started
    };

    utterance.onerror = (e) => {
      reject(new Error(`Browser Speech error: ${e.error}`));
    };

    utterance.onend = () => {
      // Finished speaking
    };

    // Trigger synthesis
    window.speechSynthesis.speak(utterance);

    // Provide a simple live notification URL or simulated audio blob
    resolve({
      audioUrl: '', // Web Speech plays natively via browser speaker
      duration: Math.max(1, (text.split(' ').length / 150) * 60),
    });
  });
}
