// Puter.js integration wrapper with popup suppressor

declare global {
  interface Window {
    puter?: {
      ai: {
        txt2speech: (
          text: string,
          options?: {
            provider?: string;
            voice?: string;
            model?: string;
          }
        ) => Promise<HTMLAudioElement | Blob | Response>;
      };
    };
  }
}

let puterLoadPromise: Promise<void> | null = null;

// Hide any modal or popups created by Puter.js
export function injectPuterPopupBlocker(): void {
  if (typeof document === 'undefined') return;

  const styleId = 'puter-popup-suppressor-style';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      /* Block Puter.js login modal, auth popups and backdrops */
      [id^="puter-modal"],
      .puter-modal,
      .puter-overlay,
      .puter-dialog,
      iframe[src*="puter.com"],
      div[style*="z-index: 2147483647"],
      div[style*="z-index: 9999999"] {
        display: none !important;
        visibility: hidden !important;
        pointer-events: none !important;
        opacity: 0 !important;
      }
    `;
    document.head.appendChild(style);
  }
}

export async function loadPuterScript(): Promise<void> {
  if (typeof window === 'undefined') return;
  injectPuterPopupBlocker();

  if (window.puter) return;
  if (puterLoadPromise) return puterLoadPromise;

  puterLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src*="puter.com/v2/puter.js"]');
    if (existing) {
      if (window.puter) {
        resolve();
      } else {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', (e) => reject(e));
      }
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.puter.com/v2/';
    script.async = true;
    script.onload = () => {
      injectPuterPopupBlocker();
      resolve();
    };
    script.onerror = (err) => {
      reject(new Error(`Failed to load Puter.js script: ${err}`));
    };
    document.head.appendChild(script);
  });

  return puterLoadPromise;
}

export async function synthesizePuter(
  text: string,
  provider: 'openai' | 'elevenlabs' | 'aws-polly',
  voice: string
): Promise<{ audioUrl: string; duration?: number }> {
  injectPuterPopupBlocker();
  await loadPuterScript();

  if (!window.puter || !window.puter.ai || !window.puter.ai.txt2speech) {
    throw new Error('Puter.js loaded but puter.ai.txt2speech is not available.');
  }

  let providerArg = provider;
  let voiceArg = voice;

  if (provider === 'elevenlabs' && voice.startsWith('eleven_')) {
    voiceArg = voice.replace('eleven_', '');
  }

  const result = await window.puter.ai.txt2speech(text, {
    provider: providerArg,
    voice: voiceArg,
  });

  if (result instanceof HTMLAudioElement) {
    if (result.src) {
      return { audioUrl: result.src };
    }
  }

  if (result instanceof Blob) {
    const audioUrl = URL.createObjectURL(result);
    return { audioUrl };
  }

  // @ts-expect-error Puter result shape
  if (result && result.src) {
    // @ts-expect-error Puter result shape
    return { audioUrl: result.src };
  }

  throw new Error('Unexpected response format from Puter TTS');
}
