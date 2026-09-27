import { synthesizePuter } from './puterService';
import { synthesizeKokoro, ProgressCallback } from './kokoroService';
import { synthesizeWebSpeech } from './browserTtsService';
import { AppConfig } from './configStore';
import { VoiceItem, TtsEngineType } from './voiceCatalog';

export interface GenerationParams {
  text: string;
  voice: VoiceItem;
  speed: number;
  config: AppConfig;
  onProgress?: ProgressCallback;
}

export interface GenerationResult {
  audioUrl: string;
  duration?: number;
  engineUsed: TtsEngineType;
  voiceUsed: string;
  timestamp: number;
}

// Client-side call to our internal Edge Neural TTS endpoint
async function synthesizeEdgeClient(
  text: string,
  voiceId: string,
  speed: number
): Promise<{ audioUrl: string }> {
  const res = await fetch('/api/edge-tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      voice: voiceId,
      speed,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Edge TTS error (${res.status})`);
  }

  const blob = await res.blob();
  const audioUrl = URL.createObjectURL(blob);
  return { audioUrl };
}

export async function routeAndSynthesize({
  text,
  voice,
  speed,
  config,
  onProgress,
}: GenerationParams): Promise<GenerationResult> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('Please enter text to synthesize.');
  }

  const targetEngine: TtsEngineType = voice.engine;

  // Check admin disabled states
  if (targetEngine === 'edge' && !config.edgeEnabled) {
    throw new Error('Edge Neural TTS engine is currently disabled by Admin.');
  }
  if (targetEngine === 'kokoro' && !config.kokoroEnabled) {
    throw new Error('Kokoro Local In-Browser engine is currently disabled by Admin.');
  }
  if (targetEngine === 'webspeech' && !config.webspeechEnabled) {
    throw new Error('Web Speech Native engine is currently disabled by Admin.');
  }
  if (targetEngine === 'puter' && !config.puterEnabled) {
    throw new Error('Puter Cloud engine is currently disabled by Admin.');
  }

  try {
    // 1. FREE Microsoft Edge Neural Voices
    if (targetEngine === 'edge') {
      if (onProgress) {
        onProgress({ status: `Calling Microsoft Edge Neural API (${voice.name})...`, progress: 30 });
      }

      const res = await synthesizeEdgeClient(trimmed, voice.id, speed);

      if (onProgress) {
        onProgress({ status: 'Edge Neural Speech ready!', progress: 100 });
      }

      return {
        audioUrl: res.audioUrl,
        engineUsed: 'edge',
        voiceUsed: voice.name,
        timestamp: Date.now(),
      };
    }

    // 2. Kokoro-82M In-Browser Neural Synthesis
    if (targetEngine === 'kokoro') {
      if (onProgress) {
        onProgress({ status: 'Preparing Kokoro in-browser model...', progress: 10 });
      }

      const res = await synthesizeKokoro(
        trimmed,
        voice.id,
        speed,
        config.kokoroDtype,
        config.kokoroDevice,
        onProgress
      );

      return {
        audioUrl: res.audioUrl,
        duration: res.duration,
        engineUsed: 'kokoro',
        voiceUsed: voice.name,
        timestamp: Date.now(),
      };
    }

    // 3. Browser Native Speech Synthesis API
    if (targetEngine === 'webspeech') {
      if (onProgress) {
        onProgress({ status: 'Playing via native browser speech synthesizer...', progress: 50 });
      }

      const res = await synthesizeWebSpeech(trimmed, voice.id, speed);

      if (onProgress) {
        onProgress({ status: 'Speaking completed!', progress: 100 });
      }

      return {
        audioUrl: res.audioUrl,
        duration: res.duration,
        engineUsed: 'webspeech',
        voiceUsed: voice.name,
        timestamp: Date.now(),
      };
    }

    // 4. Puter Cloud TTS (Legacy)
    if (targetEngine === 'puter') {
      if (onProgress) {
        onProgress({ status: `Calling Puter.js Cloud API (${voice.category})...`, progress: 30 });
      }

      const res = await synthesizePuter(
        trimmed,
        voice.provider as 'openai' | 'elevenlabs' | 'aws-polly',
        voice.id
      );

      return {
        audioUrl: res.audioUrl,
        duration: res.duration,
        engineUsed: 'puter',
        voiceUsed: voice.name,
        timestamp: Date.now(),
      };
    }

    throw new Error(`Unsupported engine: ${targetEngine}`);
  } catch (err: any) {
    // If error occurs and fallback to Edge is enabled
    if (config.fallbackToEdgeIfError && targetEngine !== 'edge' && config.edgeEnabled) {
      console.warn(`Engine ${targetEngine} failed, falling back to Edge Neural TTS:`, err);
      if (onProgress) {
        onProgress({ status: 'Initial engine failed, falling back to free Edge Neural Voice...', progress: 50 });
      }

      const fallbackRes = await synthesizeEdgeClient(trimmed, 'en-US-JennyNeural', speed);
      return {
        audioUrl: fallbackRes.audioUrl,
        engineUsed: 'edge',
        voiceUsed: 'Jenny (Edge Fallback)',
        timestamp: Date.now(),
      };
    }

    throw err;
  }
}
