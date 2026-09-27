'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { VoiceSelector } from '@/components/VoiceSelector';
import { AudioPlayer } from '@/components/AudioPlayer';
import { HistoryPanel } from '@/components/HistoryPanel';
import {
  ALL_VOICES,
  EDGE_NEURAL_VOICES,
  KOKORO_VOICES,
  WEBSPEECH_VOICES,
  MOOD_PRESETS,
  MoodPreset,
  VoiceItem,
  TtsEngineType,
} from '@/lib/voiceCatalog';
import {
  AppConfig,
  loadAppConfig,
  DEFAULT_CONFIG,
} from '@/lib/configStore';
import {
  routeAndSynthesize,
  GenerationResult,
} from '@/lib/ttsRouter';
import {
  Sparkles,
  FileText,
  AlertCircle,
  Loader2,
  Gauge,
  Globe,
  Cpu,
  Zap,
} from 'lucide-react';
import { injectPuterPopupBlocker } from '@/lib/puterService';

const SAMPLE_PROMPTS = [
  {
    title: 'Technology & AI',
    text: 'Experience instant high-fidelity speech synthesis powered by Microsoft Edge Neural voices and Kokoro-82M, with zero API fees and unlimited free generation.',
  },
  {
    title: 'Cinematic Story',
    text: 'Beyond the horizon of conventional cloud computing, neural networks now synthesize cinematic voices directly in the palm of your hand.',
  },
  {
    title: 'Tutorial & Education',
    text: 'Welcome to this comprehensive overview. Today we demonstrate how to achieve studio-grade voice narration with zero server costs.',
  },
  {
    title: 'Announcement',
    text: 'Attention passengers, the next express departure for New York is now boarding at platform seven. Please have your tickets ready.',
  },
];

export default function HomePage() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [text, setText] = useState<string>(SAMPLE_PROMPTS[0].text);
  const [selectedVoice, setSelectedVoice] = useState<VoiceItem>(EDGE_NEURAL_VOICES[0]);
  const [selectedMoodId, setSelectedMoodId] = useState<string>('all');
  const [speed, setSpeed] = useState<number>(1.0);

  // Generation status
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressState, setProgressState] = useState<{
    status: string;
    progress?: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Audio Result
  const [currentResult, setCurrentResult] = useState<GenerationResult | null>(null);
  const [history, setHistory] = useState<GenerationResult[]>([]);

  useEffect(() => {
    // Hide Puter popups on mount
    injectPuterPopupBlocker();

    const loaded = loadAppConfig();
    setConfig(loaded);

    // Initial voice based on defaultEngine
    if (loaded.defaultEngine === 'edge' && loaded.edgeEnabled) {
      setSelectedVoice(EDGE_NEURAL_VOICES[0]);
    } else if (loaded.defaultEngine === 'kokoro' && loaded.kokoroEnabled) {
      setSelectedVoice(KOKORO_VOICES[0]);
    } else if (loaded.defaultEngine === 'webspeech' && loaded.webspeechEnabled) {
      setSelectedVoice(WEBSPEECH_VOICES[0]);
    } else {
      setSelectedVoice(EDGE_NEURAL_VOICES[0]);
    }

    try {
      const stored = localStorage.getItem('tts_generation_history_v2');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleGenerate = async () => {
    if (!text.trim()) {
      setErrorMsg('Please enter text to synthesize.');
      return;
    }

    setErrorMsg(null);
    setIsGenerating(true);
    setProgressState({
      status: `Initializing ${selectedVoice.name}...`,
      progress: 10,
    });

    try {
      const result = await routeAndSynthesize({
        text,
        voice: selectedVoice,
        speed,
        config,
        onProgress: (status) => {
          setProgressState(status);
        },
      });

      setCurrentResult(result);
      const updatedHistory = [result, ...history.slice(0, 9)];
      setHistory(updatedHistory);
      try {
        localStorage.setItem('tts_generation_history_v2', JSON.stringify(updatedHistory));
      } catch (e) {
        // Ignore quota
      }
    } catch (err: any) {
      console.error('Synthesis failed:', err);
      setErrorMsg(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
      setProgressState(null);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('tts_generation_history_v2');
  };

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const estimatedSeconds = Math.round((wordCount / 150) * 60);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      <Navbar config={config} activeEngine={selectedVoice.engine} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-sky-400 bg-clip-text text-transparent sm:text-4xl">
                Unlimited Multi-Engine Voiceover Studio
              </h1>
              <p className="mt-1 text-sm text-neutral-400 max-w-2xl">
                100% Free & Unlimited speech generation powered by <span className="text-sky-400 font-medium">Microsoft Edge Neural</span>, <span className="text-emerald-400 font-medium">Kokoro-82M (WebGPU/WASM)</span>, and <span className="text-amber-400 font-medium">Native Browser Speech</span>. Zero API keys, zero credit exhaustion.
              </p>
            </div>

            {/* Quick Engine Switcher Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedVoice(EDGE_NEURAL_VOICES[0])}
                className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 ${
                  selectedVoice.engine === 'edge'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm shadow-sky-500/20'
                    : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <Globe className="w-3.5 h-3.5" /> Edge Neural (Free Cloud)
              </button>
              <button
                onClick={() => setSelectedVoice(KOKORO_VOICES[0])}
                className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 ${
                  selectedVoice.engine === 'kokoro'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                    : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" /> Kokoro Local (In-Browser)
              </button>
              <button
                onClick={() => setSelectedVoice(WEBSPEECH_VOICES[0])}
                className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 ${
                  selectedVoice.engine === 'webspeech'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20'
                    : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <Zap className="w-3.5 h-3.5" /> Browser Native (0MB)
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Text Input & Audio Output */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-6 shadow-xl backdrop-blur-sm space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-400" />
                  <span>Script & Text Input</span>
                </label>
                <div className="flex items-center gap-3 text-xs text-neutral-500 font-mono">
                  <span>{charCount} chars</span>
                  <span>•</span>
                  <span>{wordCount} words</span>
                  <span>•</span>
                  <span>~{estimatedSeconds}s</span>
                </div>
              </div>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste your script here..."
                rows={8}
                className="w-full bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4 text-sm sm:text-base text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-sky-500/80 focus:border-transparent transition-all resize-y shadow-inner leading-relaxed"
              />

              <div className="space-y-2 pt-1">
                <span className="text-xs font-medium text-neutral-400">
                  Quick Sample Scripts:
                </span>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_PROMPTS.map((prompt) => (
                    <button
                      key={prompt.title}
                      onClick={() => setText(prompt.text)}
                      className="px-3 py-1 rounded-lg text-xs bg-neutral-800/80 hover:bg-neutral-700/80 text-neutral-300 hover:text-white border border-neutral-700/60 transition-colors"
                    >
                      {prompt.title}
                    </button>
                  ))}
                  <button
                    onClick={() => setText('')}
                    className="px-2.5 py-1 rounded-lg text-xs bg-neutral-950 text-neutral-500 hover:text-rose-400 border border-neutral-800 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            <AudioPlayer
              audioUrl={currentResult?.audioUrl || null}
              voiceName={currentResult?.voiceUsed || selectedVoice.name}
              engineUsed={currentResult?.engineUsed}
              autoPlay={true}
            />

            <HistoryPanel
              history={history}
              onPlayClip={(clip) => setCurrentResult(clip)}
              onClearHistory={handleClearHistory}
            />
          </div>

          {/* Right Column: Voice Selection & Settings */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-6 shadow-xl backdrop-blur-sm space-y-6">
              <VoiceSelector
                selectedVoiceId={selectedVoice.id}
                onVoiceSelect={(voice) => setSelectedVoice(voice)}
                config={config}
                selectedMoodId={selectedMoodId}
                onMoodSelect={(mood) => {
                  setSelectedMoodId(mood.id);
                  // Auto-switch to first recommended voice if available and enabled
                  if (mood.recommendedVoiceIds.length > 0) {
                    const recVoice = ALL_VOICES.find((v) => v.id === mood.recommendedVoiceIds[0]);
                    if (recVoice) {
                      setSelectedVoice(recVoice);
                    }
                  }
                  // Prepopulate script prompt if user wants
                  if (mood.sampleScript && (!text || text === SAMPLE_PROMPTS[0].text)) {
                    setText(mood.sampleScript);
                  }
                }}
              />

              {/* Speed Slider */}
              <div className="space-y-2 pt-2 border-t border-neutral-800/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-sky-400" />
                    Speech Speed Rate
                  </span>
                  <span className="font-mono text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-md">
                    {speed.toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
                <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                  <span>0.5x (Slow)</span>
                  <span>1.0x (Normal)</span>
                  <span>2.0x (Fast)</span>
                </div>
              </div>

              {/* Progress State or Error */}
              {progressState && (
                <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 space-y-2">
                  <div className="flex items-center justify-between text-xs text-sky-300">
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      {progressState.status}
                    </span>
                    {typeof progressState.progress === 'number' && (
                      <span className="font-mono">{progressState.progress}%</span>
                    )}
                  </div>
                  {typeof progressState.progress === 'number' && (
                    <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-sky-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(5, progressState.progress))}%` }}
                      />
                    </div>
                  )}
                </div>
              )}

              {errorMsg && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-semibold">Synthesis Error</div>
                    <div>{errorMsg}</div>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white font-semibold text-base shadow-xl shadow-sky-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Synthesizing Audio...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span>Generate Speech ({selectedVoice.engine.toUpperCase()})</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <span className="text-[11px] text-emerald-400/90 font-medium">
                  ✓ 100% Free & Unlimited • Zero Credit Limits • No Subscriptions
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
