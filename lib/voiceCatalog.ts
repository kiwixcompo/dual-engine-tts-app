export type TtsEngineType = 'edge' | 'kokoro' | 'webspeech' | 'puter';

export interface VoiceItem {
  id: string;
  name: string;
  engine: TtsEngineType;
  provider: 'edge' | 'kokoro' | 'webspeech' | 'openai' | 'elevenlabs' | 'aws-polly';
  category: string;
  gender?: 'female' | 'male' | 'neutral';
  accent?: string;
  description?: string;
  badge?: string;
}

// 1. FREE Microsoft Edge Neural Voices (Cloud Studio Quality, $0 Server Cost, No Limits)
export const EDGE_NEURAL_VOICES: VoiceItem[] = [
  { id: 'en-US-JennyNeural', name: 'Jenny (Natural Warm)', engine: 'edge', provider: 'edge', category: 'Edge Neural (Free Cloud)', gender: 'female', accent: 'American', description: 'Flagship Microsoft Neural voice, conversational & crisp', badge: 'Popular' },
  { id: 'en-US-GuyNeural', name: 'Guy (Professional)', engine: 'edge', provider: 'edge', category: 'Edge Neural (Free Cloud)', gender: 'male', accent: 'American', description: 'Authentic broadcaster tone, great for narrations' },
  { id: 'en-US-AriaNeural', name: 'Aria (Expressive)', engine: 'edge', provider: 'edge', category: 'Edge Neural (Free Cloud)', gender: 'female', accent: 'American', description: 'High emotional dynamism, suitable for storytelling' },
  { id: 'en-US-ChristopherNeural', name: 'Christopher (Authoritative)', engine: 'edge', provider: 'edge', category: 'Edge Neural (Free Cloud)', gender: 'male', accent: 'American', description: 'Deep, reliable executive presenter voice' },
  { id: 'en-GB-SoniaNeural', name: 'Sonia (British Natural)', engine: 'edge', provider: 'edge', category: 'Edge Neural (Free Cloud)', gender: 'female', accent: 'British', description: 'Polished British RP narration voice' },
  { id: 'en-GB-RyanNeural', name: 'Ryan (British Cinematic)', engine: 'edge', provider: 'edge', category: 'Edge Neural (Free Cloud)', gender: 'male', accent: 'British', description: 'Smooth, cinematic British male cadence' },
  { id: 'en-AU-NatashaNeural', name: 'Natasha (Australian)', engine: 'edge', provider: 'edge', category: 'Edge Neural (Free Cloud)', gender: 'female', accent: 'Australian', description: 'Friendly Australian natural accent' }
];

// 2. Kokoro-82M In-Browser Neural Voices (Client-Side GPU/CPU, 100% Free & Unlimited)
export const KOKORO_VOICES: VoiceItem[] = [
  { id: 'af_heart', name: 'Heart (Studio Grade A)', engine: 'kokoro', provider: 'kokoro', category: 'Kokoro (Local In-Browser)', gender: 'female', accent: 'American', description: 'Flagship Grade A warm female voice', badge: 'Top AI' },
  { id: 'af_bella', name: 'Bella (Warm & Fiery)', engine: 'kokoro', provider: 'kokoro', category: 'Kokoro (Local In-Browser)', gender: 'female', accent: 'American', description: 'Grade A- passionate, natural delivery' },
  { id: 'af_sky', name: 'Sky (Corporate)', engine: 'kokoro', provider: 'kokoro', category: 'Kokoro (Local In-Browser)', gender: 'female', accent: 'American', description: 'Crisp corporate and instructional voice' },
  { id: 'af_sarah', name: 'Sarah (Soft Narration)', engine: 'kokoro', provider: 'kokoro', category: 'Kokoro (Local In-Browser)', gender: 'female', accent: 'American', description: 'Gentle, soothing podcast narration' },
  { id: 'af_nicole', name: 'Nicole (Audiobook)', engine: 'kokoro', provider: 'kokoro', category: 'Kokoro (Local In-Browser)', gender: 'female', accent: 'American', description: 'Rich resonance suited for audiobooks' },
  { id: 'am_michael', name: 'Michael (Executive)', engine: 'kokoro', provider: 'kokoro', category: 'Kokoro (Local In-Browser)', gender: 'male', accent: 'American', description: 'Commanding male presenter voice' },
  { id: 'am_echo', name: 'Echo (Conversational)', engine: 'kokoro', provider: 'kokoro', category: 'Kokoro (Local In-Browser)', gender: 'male', accent: 'American', description: 'Relaxed, friendly male voice' },
  { id: 'bm_george', name: 'George (Deep UK)', engine: 'kokoro', provider: 'kokoro', category: 'Kokoro (Local In-Browser)', gender: 'male', accent: 'British', description: 'Classic deep UK English voice' },
  { id: 'bf_emma', name: 'Emma (Warm UK)', engine: 'kokoro', provider: 'kokoro', category: 'Kokoro (Local In-Browser)', gender: 'female', accent: 'British', description: 'Welcoming British female presenter' }
];

// 3. Web Speech API Native Voices (Instant, Zero Download, 100% Free)
export const WEBSPEECH_VOICES: VoiceItem[] = [
  { id: 'browser-default', name: 'System Default Voice', engine: 'webspeech', provider: 'webspeech', category: 'Browser Native (Instant 0MB)', gender: 'neutral', accent: 'Local Device', description: 'Zero-download native device synthesis with 0ms latency', badge: 'Instant' },
  { id: 'browser-english-us', name: 'Browser US English', engine: 'webspeech', provider: 'webspeech', category: 'Browser Native (Instant 0MB)', gender: 'neutral', accent: 'American', description: 'Native OS-installed neural voice (Google / Apple / Windows)' },
  { id: 'browser-english-uk', name: 'Browser UK English', engine: 'webspeech', provider: 'webspeech', category: 'Browser Native (Instant 0MB)', gender: 'neutral', accent: 'British', description: 'Native OS-installed British English voice' }
];

// 4. Puter Cloud Voices (Optional / Legacy Cloud)
export const PUTER_VOICES: VoiceItem[] = [
  { id: 'alloy', name: 'Alloy', engine: 'puter', provider: 'openai', category: 'Puter (OpenAI Cloud)', gender: 'neutral', accent: 'American', description: 'Versatile, neutral, and balanced tone' },
  { id: 'echo', name: 'Echo', engine: 'puter', provider: 'openai', category: 'Puter (OpenAI Cloud)', gender: 'male', accent: 'American', description: 'Warm, conversational tone' },
  { id: 'eleven_rachel', name: 'Rachel', engine: 'puter', provider: 'elevenlabs', category: 'Puter (ElevenLabs)', gender: 'female', accent: 'American', description: 'Narrative emotional range' }
];

export const ALL_VOICES: VoiceItem[] = [
  ...EDGE_NEURAL_VOICES,
  ...KOKORO_VOICES,
  ...WEBSPEECH_VOICES,
  ...PUTER_VOICES
];
