export type SupportedEngine = 'edge' | 'kokoro' | 'webspeech' | 'puter';

export interface AppConfig {
  edgeEnabled: boolean;
  kokoroEnabled: boolean;
  webspeechEnabled: boolean;
  puterEnabled: boolean;
  defaultEngine: SupportedEngine;
  defaultVoice: string;
  defaultSpeed: number;
  kokoroDtype: 'q8' | 'fp32' | 'fp16';
  kokoroDevice: 'wasm' | 'webgpu';
  fallbackToEdgeIfError: boolean;
  hidePuterPopups: boolean;
  appTitle: string;
}

export const DEFAULT_CONFIG: AppConfig = {
  edgeEnabled: true,
  kokoroEnabled: true,
  webspeechEnabled: true,
  puterEnabled: false, // Default Puter disabled to prevent credit exhaustion & popups
  defaultEngine: 'edge', // Default to free Microsoft Edge Neural Voices
  defaultVoice: 'en-US-JennyNeural',
  defaultSpeed: 1.0,
  kokoroDtype: 'q8',
  kokoroDevice: 'wasm',
  fallbackToEdgeIfError: true,
  hidePuterPopups: true,
  appTitle: 'AI Voiceover Studio',
};

const STORAGE_KEY = 'tts_app_config_v2';
const AUTH_KEY = 'tts_admin_session';

export function loadAppConfig(): AppConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveAppConfig(config: AppConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function resetAppConfig(): AppConfig {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  return DEFAULT_CONFIG;
}

export function checkAdminAuth(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(AUTH_KEY) === 'authenticated';
}

export function setAdminAuth(authenticated: boolean): void {
  if (typeof window === 'undefined') return;
  if (authenticated) {
    sessionStorage.setItem(AUTH_KEY, 'authenticated');
  } else {
    sessionStorage.removeItem(AUTH_KEY);
  }
}
