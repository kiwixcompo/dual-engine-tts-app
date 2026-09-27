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
  moods?: string[];
  sampleText?: string;
}

// 1. FREE Microsoft Edge Neural Voices (Cloud Studio Quality, $0 Server Cost, No Limits)
export const EDGE_NEURAL_VOICES: VoiceItem[] = [
  {
    id: 'en-US-JennyNeural',
    name: 'Jenny (Natural Warm)',
    engine: 'edge',
    provider: 'edge',
    category: 'Edge Neural (Free Cloud)',
    gender: 'female',
    accent: 'American',
    description: 'Flagship Microsoft Neural voice, conversational & crisp',
    badge: 'Popular',
    moods: ['conversational', 'commercial', 'warm', 'friendly', 'explainer'],
    sampleText: 'Hi there! I am Jenny, a warm and conversational voice ready for your podcasts and videos.'
  },
  {
    id: 'en-US-GuyNeural',
    name: 'Guy (Professional)',
    engine: 'edge',
    provider: 'edge',
    category: 'Edge Neural (Free Cloud)',
    gender: 'male',
    accent: 'American',
    description: 'Authentic broadcaster tone, great for narrations',
    badge: 'Pro News',
    moods: ['professional', 'news', 'documentary', 'corporate', 'authoritative'],
    sampleText: 'Good evening. This is Guy reporting live with clear, authoritative narration.'
  },
  {
    id: 'en-US-AriaNeural',
    name: 'Aria (Expressive)',
    engine: 'edge',
    provider: 'edge',
    category: 'Edge Neural (Free Cloud)',
    gender: 'female',
    accent: 'American',
    description: 'High emotional dynamism, suitable for storytelling',
    badge: 'Expressive',
    moods: ['storytelling', 'cinematic', 'emotional', 'dramatic', 'audiobook'],
    sampleText: 'Once upon a time in a world unseen, ancient mysteries awaited the brave traveler.'
  },
  {
    id: 'en-US-ChristopherNeural',
    name: 'Christopher (Authoritative)',
    engine: 'edge',
    provider: 'edge',
    category: 'Edge Neural (Free Cloud)',
    gender: 'male',
    accent: 'American',
    description: 'Deep, reliable executive presenter voice',
    badge: 'Executive',
    moods: ['corporate', 'authoritative', 'formal', 'trailer', 'educational'],
    sampleText: 'Innovation drives the future of enterprise architecture and digital transformation.'
  },
  {
    id: 'en-GB-SoniaNeural',
    name: 'Sonia (British Natural)',
    engine: 'edge',
    provider: 'edge',
    category: 'Edge Neural (Free Cloud)',
    gender: 'female',
    accent: 'British',
    description: 'Polished British RP narration voice',
    badge: 'British RP',
    moods: ['documentary', 'educational', 'sophisticated', 'formal', 'audiobook'],
    sampleText: 'Welcome to the royal gallery. Here we preserve masterpieces of timeless heritage.'
  },
  {
    id: 'en-GB-RyanNeural',
    name: 'Ryan (British Cinematic)',
    engine: 'edge',
    provider: 'edge',
    category: 'Edge Neural (Free Cloud)',
    gender: 'male',
    accent: 'British',
    description: 'Smooth, cinematic British male cadence',
    badge: 'Cinematic',
    moods: ['cinematic', 'storytelling', 'trailer', 'commercial', 'dramatic'],
    sampleText: 'In a world divided by shadow and light, destiny calls upon a single hero.'
  },
  {
    id: 'en-AU-NatashaNeural',
    name: 'Natasha (Australian)',
    engine: 'edge',
    provider: 'edge',
    category: 'Edge Neural (Free Cloud)',
    gender: 'female',
    accent: 'Australian',
    description: 'Friendly Australian natural accent',
    moods: ['casual', 'friendly', 'explainer', 'travel', 'conversational'],
    sampleText: 'G day! Let us explore the great natural wonders and vibrant adventures together.'
  }
];

// 2. Kokoro-82M In-Browser Neural Voices (Client-Side GPU/CPU, 100% Free & Unlimited)
export const KOKORO_VOICES: VoiceItem[] = [
  {
    id: 'af_heart',
    name: 'Heart (Studio Grade A)',
    engine: 'kokoro',
    provider: 'kokoro',
    category: 'Kokoro (Local In-Browser)',
    gender: 'female',
    accent: 'American',
    description: 'Flagship Grade A warm female voice',
    badge: 'Top AI',
    moods: ['warm', 'conversational', 'meditation', 'friendly', 'audiobook'],
    sampleText: 'Take a gentle, deep breath in, and let all the stress simply drift away.'
  },
  {
    id: 'af_bella',
    name: 'Bella (Warm & Fiery)',
    engine: 'kokoro',
    provider: 'kokoro',
    category: 'Kokoro (Local In-Browser)',
    gender: 'female',
    accent: 'American',
    description: 'Grade A- passionate, natural delivery',
    badge: 'Energetic',
    moods: ['commercial', 'energetic', 'social-media', 'expressive', 'casual'],
    sampleText: 'Hey everyone! Check out this incredible new release that changes everything.'
  },
  {
    id: 'af_sky',
    name: 'Sky (Corporate)',
    engine: 'kokoro',
    provider: 'kokoro',
    category: 'Kokoro (Local In-Browser)',
    gender: 'female',
    accent: 'American',
    description: 'Crisp corporate and instructional voice',
    moods: ['corporate', 'educational', 'explainer', 'professional'],
    sampleText: 'Follow steps one through three to configure your workspace for peak efficiency.'
  },
  {
    id: 'af_sarah',
    name: 'Sarah (Soft Narration)',
    engine: 'kokoro',
    provider: 'kokoro',
    category: 'Kokoro (Local In-Browser)',
    gender: 'female',
    accent: 'American',
    description: 'Gentle, soothing podcast narration',
    moods: ['calm', 'meditation', 'soothing', 'audiobook', 'bedtime-story'],
    sampleText: 'Quiet night fell softly across the valley, as moonlight silvered the leaves.'
  },
  {
    id: 'af_nicole',
    name: 'Nicole (Audiobook)',
    engine: 'kokoro',
    provider: 'kokoro',
    category: 'Kokoro (Local In-Browser)',
    gender: 'female',
    accent: 'American',
    description: 'Rich resonance suited for audiobooks',
    moods: ['audiobook', 'storytelling', 'dramatic', 'documentary'],
    sampleText: 'She turned the weathered parchment, uncovering secrets buried for three centuries.'
  },
  {
    id: 'am_michael',
    name: 'Michael (Executive)',
    engine: 'kokoro',
    provider: 'kokoro',
    category: 'Kokoro (Local In-Browser)',
    gender: 'male',
    accent: 'American',
    description: 'Commanding male presenter voice',
    badge: 'Executive',
    moods: ['corporate', 'authoritative', 'commercial', 'professional'],
    sampleText: 'Strategic focus and disciplined execution are the cornerstones of lasting success.'
  },
  {
    id: 'am_echo',
    name: 'Echo (Conversational)',
    engine: 'kokoro',
    provider: 'kokoro',
    category: 'Kokoro (Local In-Browser)',
    gender: 'male',
    accent: 'American',
    description: 'Relaxed, friendly male voice',
    moods: ['casual', 'conversational', 'social-media', 'friendly', 'explainer'],
    sampleText: 'Hey guys, welcome back to the channel. Today we have got something special to share.'
  },
  {
    id: 'bm_george',
    name: 'George (Deep UK)',
    engine: 'kokoro',
    provider: 'kokoro',
    category: 'Kokoro (Local In-Browser)',
    gender: 'male',
    accent: 'British',
    description: 'Classic deep UK English voice',
    moods: ['documentary', 'cinematic', 'storytelling', 'authoritative'],
    sampleText: 'Deep within the ancient forest, creatures of old awaken at the turn of twilight.'
  },
  {
    id: 'bf_emma',
    name: 'Emma (Warm UK)',
    engine: 'kokoro',
    provider: 'kokoro',
    category: 'Kokoro (Local In-Browser)',
    gender: 'female',
    accent: 'British',
    description: 'Welcoming British female presenter',
    moods: ['warm', 'educational', 'friendly', 'travel', 'conversational'],
    sampleText: 'Discover the scenic country paths and cozy tearooms nestled in the English hills.'
  }
];

// 3. Web Speech API Native Voices (Instant, Zero Download, 100% Free)
export const WEBSPEECH_VOICES: VoiceItem[] = [
  {
    id: 'browser-default',
    name: 'System Default Voice',
    engine: 'webspeech',
    provider: 'webspeech',
    category: 'Browser Native (Instant 0MB)',
    gender: 'neutral',
    accent: 'Local Device',
    description: 'Zero-download native device synthesis with 0ms latency',
    badge: 'Instant',
    moods: ['fast-draft', 'casual', 'testing'],
    sampleText: 'This is the native synthesizer built right into your device operating system.'
  },
  {
    id: 'browser-english-us',
    name: 'Browser US English',
    engine: 'webspeech',
    provider: 'webspeech',
    category: 'Browser Native (Instant 0MB)',
    gender: 'neutral',
    accent: 'American',
    description: 'Native OS-installed neural voice (Google / Apple / Windows)',
    moods: ['fast-draft', 'casual', 'explainer'],
    sampleText: 'Testing native United States English browser speech synthesis.'
  },
  {
    id: 'browser-english-uk',
    name: 'Browser UK English',
    engine: 'webspeech',
    provider: 'webspeech',
    category: 'Browser Native (Instant 0MB)',
    gender: 'neutral',
    accent: 'British',
    description: 'Native OS-installed British English voice',
    moods: ['fast-draft', 'formal', 'educational'],
    sampleText: 'Testing native British English browser speech synthesis.'
  }
];

// 4. Puter Cloud Voices (Optional / Legacy Cloud)
export const PUTER_VOICES: VoiceItem[] = [
  {
    id: 'alloy',
    name: 'Alloy',
    engine: 'puter',
    provider: 'openai',
    category: 'Puter (OpenAI Cloud)',
    gender: 'neutral',
    accent: 'American',
    description: 'Versatile, neutral, and balanced tone',
    moods: ['conversational', 'explainer', 'commercial'],
    sampleText: 'Hello! I am Alloy, an adaptable voice crafted for versatile speech generation.'
  },
  {
    id: 'echo',
    name: 'Echo',
    engine: 'puter',
    provider: 'openai',
    category: 'Puter (OpenAI Cloud)',
    gender: 'male',
    accent: 'American',
    description: 'Warm, conversational tone',
    moods: ['warm', 'conversational', 'casual'],
    sampleText: 'Hello there, Echo here, ready to bring your dialogue to life with warmth.'
  },
  {
    id: 'eleven_rachel',
    name: 'Rachel',
    engine: 'puter',
    provider: 'elevenlabs',
    category: 'Puter (ElevenLabs)',
    gender: 'female',
    accent: 'American',
    description: 'Narrative emotional range',
    moods: ['storytelling', 'expressive', 'audiobook'],
    sampleText: 'Every story has a beginning, and every path leads to discovery.'
  }
];

// Presets for Script Moods / Use Cases
export interface MoodPreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  sampleScript: string;
  recommendedVoiceIds: string[];
}

export const MOOD_PRESETS: MoodPreset[] = [
  {
    id: 'all',
    name: 'All Voices',
    icon: '✨',
    description: 'Browse all available studio voices across engines',
    sampleScript: 'Experience high-fidelity speech synthesis with zero server fees and unlimited generation.',
    recommendedVoiceIds: []
  },
  {
    id: 'storytelling',
    name: 'Storytelling & Cinema',
    icon: '🎭',
    description: 'Dramatic, evocative, and emotionally rich narration',
    sampleScript: 'Beyond the horizon of ancient forgotten kingdoms, a whisper stirred within the slumbering forest.',
    recommendedVoiceIds: ['en-US-AriaNeural', 'en-GB-RyanNeural', 'af_nicole', 'bm_george']
  },
  {
    id: 'corporate',
    name: 'Corporate & Executive',
    icon: '💼',
    description: 'Commanding, clear, and authoritative for pitches & business',
    sampleScript: 'Our global strategic initiative delivers sustained growth, operational excellence, and unmatched shareholder value.',
    recommendedVoiceIds: ['en-US-ChristopherNeural', 'en-US-GuyNeural', 'am_michael', 'af_sky']
  },
  {
    id: 'conversational',
    name: 'Conversational & Casual',
    icon: '☕',
    description: 'Natural, friendly, and relatable for podcasts and social clips',
    sampleScript: 'Hey there! Welcome back to another episode. Today we are breaking down the biggest ideas of the week.',
    recommendedVoiceIds: ['en-US-JennyNeural', 'am_echo', 'af_heart', 'en-AU-NatashaNeural']
  },
  {
    id: 'commercial',
    name: 'Commercial & Energetic',
    icon: '🚀',
    description: 'Upbeat, lively, and persuasive for ads & promotional videos',
    sampleScript: 'Get ready for the biggest launch of the season! Unleash your full creative potential starting today.',
    recommendedVoiceIds: ['af_bella', 'en-US-JennyNeural', 'en-GB-RyanNeural', 'am_michael']
  },
  {
    id: 'documentary',
    name: 'Documentary & Education',
    icon: '🎓',
    description: 'Scholarly, articulate, and poised for tutorials and history',
    sampleScript: 'Deep within the ocean depths, bioluminescent organisms thrive under pressures that defy comprehension.',
    recommendedVoiceIds: ['en-GB-SoniaNeural', 'en-US-GuyNeural', 'bm_george', 'af_sky']
  },
  {
    id: 'meditation',
    name: 'Calm & Meditation',
    icon: '🌿',
    description: 'Soothing, gentle, and peaceful for sleep and mindfulness',
    sampleScript: 'Close your eyes. Relax your shoulders, and feel a peaceful wave of serenity wash over your mind.',
    recommendedVoiceIds: ['af_sarah', 'af_heart', 'bf_emma']
  }
];

export const ALL_VOICES: VoiceItem[] = [
  ...EDGE_NEURAL_VOICES,
  ...KOKORO_VOICES,
  ...WEBSPEECH_VOICES,
  ...PUTER_VOICES
];
