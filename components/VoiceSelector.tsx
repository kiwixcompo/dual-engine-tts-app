'use client';

import React, { useState, useRef } from 'react';
import {
  VoiceItem,
  EDGE_NEURAL_VOICES,
  KOKORO_VOICES,
  WEBSPEECH_VOICES,
  PUTER_VOICES,
  MOOD_PRESETS,
  MoodPreset,
  TtsEngineType,
} from '@/lib/voiceCatalog';
import {
  Globe,
  Cpu,
  Zap,
  Cloud,
  Volume2,
  Play,
  Square,
  Sparkles,
  Check,
  Loader2,
  Filter,
} from 'lucide-react';
import { AppConfig } from '@/lib/configStore';
import { routeAndSynthesize } from '@/lib/ttsRouter';

interface VoiceSelectorProps {
  selectedVoiceId: string;
  onVoiceSelect: (voice: VoiceItem) => void;
  config: AppConfig;
  selectedMoodId: string;
  onMoodSelect: (mood: MoodPreset) => void;
}

export function VoiceSelector({
  selectedVoiceId,
  onVoiceSelect,
  config,
  selectedMoodId,
  onMoodSelect,
}: VoiceSelectorProps) {
  // Voice Preview State
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Filter voice categories based on Admin settings
  const availableEdge = config.edgeEnabled ? EDGE_NEURAL_VOICES : [];
  const availableKokoro = config.kokoroEnabled ? KOKORO_VOICES : [];
  const availableWebSpeech = config.webspeechEnabled ? WEBSPEECH_VOICES : [];
  const availablePuter = config.puterEnabled ? PUTER_VOICES : [];

  const allAvailable = [
    ...availableEdge,
    ...availableKokoro,
    ...availableWebSpeech,
    ...availablePuter,
  ];

  const currentVoice =
    allAvailable.find((v) => v.id === selectedVoiceId) || allAvailable[0];

  const currentMood =
    MOOD_PRESETS.find((m) => m.id === selectedMoodId) || MOOD_PRESETS[0];

  // Voices filtered/recommended by active mood
  const isRecommended = (voiceId: string) => {
    return currentMood.recommendedVoiceIds.includes(voiceId);
  };

  const handleStopPreview = () => {
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      audioPreviewRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setPreviewingVoiceId(null);
    setIsLoadingPreview(false);
  };

  const handlePlayPreview = async (voice: VoiceItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // If already playing this voice, toggle off
    if (previewingVoiceId === voice.id) {
      handleStopPreview();
      return;
    }

    handleStopPreview();
    setPreviewingVoiceId(voice.id);
    setIsLoadingPreview(true);

    const sampleText =
      voice.sampleText ||
      `Hello! This is ${voice.name}, ready for your narration.`;

    try {
      const result = await routeAndSynthesize({
        text: sampleText,
        voice,
        speed: 1.0,
        config,
      });

      // If synthesized successfully, play audio
      if (!audioPreviewRef.current) {
        audioPreviewRef.current = new Audio();
      }

      audioPreviewRef.current.src = result.audioUrl;
      audioPreviewRef.current.onended = () => {
        setPreviewingVoiceId(null);
        setIsLoadingPreview(false);
      };
      audioPreviewRef.current.onerror = () => {
        setPreviewingVoiceId(null);
        setIsLoadingPreview(false);
      };

      await audioPreviewRef.current.play();
      setIsLoadingPreview(false);
    } catch (err) {
      console.error('Preview error:', err);
      setPreviewingVoiceId(null);
      setIsLoadingPreview(false);
    }
  };

  const getEngineBadge = (engine: TtsEngineType) => {
    switch (engine) {
      case 'edge':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-medium text-xs">
            <Globe className="w-3 h-3" /> Edge Neural
          </span>
        );
      case 'kokoro':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium text-xs">
            <Cpu className="w-3 h-3" /> Kokoro-82M
          </span>
        );
      case 'webspeech':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium text-xs">
            <Zap className="w-3 h-3" /> Web Speech
          </span>
        );
      case 'puter':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium text-xs">
            <Cloud className="w-3 h-3" /> Puter
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Mood & Use Case Selector */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-sky-400" />
            <span>Script Mood / Use Case</span>
          </label>
          <span className="text-[11px] text-neutral-500">
            Smart Recommendations
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {MOOD_PRESETS.map((mood) => {
            const isSelected = mood.id === selectedMoodId;
            return (
              <button
                key={mood.id}
                type="button"
                onClick={() => onMoodSelect(mood)}
                className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-sky-500/15 border-sky-500/50 shadow-sm shadow-sky-500/10 ring-1 ring-sky-500/40'
                    : 'bg-neutral-900/60 border-neutral-800/80 hover:border-neutral-700 text-neutral-300'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <span>{mood.icon}</span>
                  <span className={isSelected ? 'text-sky-300' : 'text-neutral-200'}>
                    {mood.name}
                  </span>
                </div>
                <span className="text-[10px] text-neutral-400 mt-1 line-clamp-1 leading-snug">
                  {mood.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Recommended Voices for Current Mood Banner */}
      {currentMood.recommendedVoiceIds.length > 0 && (
        <div className="p-3.5 bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-transparent border border-sky-500/30 rounded-2xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-300">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Recommended for &ldquo;{currentMood.name}&rdquo;:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {currentMood.recommendedVoiceIds.map((recId) => {
              const voice = allAvailable.find((v) => v.id === recId);
              if (!voice) return null;
              const isSelected = voice.id === selectedVoiceId;
              const isPlaying = previewingVoiceId === voice.id;

              return (
                <div
                  key={voice.id}
                  onClick={() => onVoiceSelect(voice)}
                  className={`cursor-pointer px-2.5 py-1.5 rounded-xl border text-xs flex items-center gap-2 transition-all ${
                    isSelected
                      ? 'bg-sky-500 text-white border-sky-400 font-semibold shadow-md shadow-sky-500/25'
                      : 'bg-neutral-900/80 border-neutral-700/80 text-neutral-200 hover:border-sky-500/50 hover:bg-neutral-800'
                  }`}
                >
                  <span>{voice.name.split(' (')[0]}</span>
                  {voice.badge && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-black/30 font-normal">
                      {voice.badge}
                    </span>
                  )}
                  <button
                    type="button"
                    title={`Preview ${voice.name}`}
                    onClick={(e) => handlePlayPreview(voice, e)}
                    className={`p-1 rounded-full transition-colors ${
                      isPlaying
                        ? 'bg-rose-500 text-white'
                        : isSelected
                        ? 'bg-white/20 hover:bg-white/30 text-white'
                        : 'bg-neutral-800 hover:bg-neutral-700 text-sky-400'
                    }`}
                  >
                    {isPlaying ? (
                      isLoadingPreview ? (
                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                      ) : (
                        <Square className="w-2.5 h-2.5 fill-current" />
                      )
                    ) : (
                      <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Main Voice Dropdown & Active Voice Details */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label
            htmlFor="voice-select"
            className="text-sm font-semibold text-neutral-200 flex items-center gap-2"
          >
            <Volume2 className="w-4 h-4 text-indigo-400" />
            <span>Select Voice</span>
          </label>
          {currentVoice && <div>{getEngineBadge(currentVoice.engine)}</div>}
        </div>

        <div className="relative">
          <select
            id="voice-select"
            value={selectedVoiceId}
            onChange={(e) => {
              const voice = allAvailable.find((v) => v.id === e.target.value);
              if (voice) onVoiceSelect(voice);
            }}
            className="w-full bg-neutral-900 border border-neutral-800 text-neutral-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all cursor-pointer hover:border-neutral-700 shadow-inner"
          >
            {/* Section 1: Edge Neural Voices */}
            {availableEdge.length > 0 && (
              <optgroup label="── 🌐 Free Edge Neural Voices (High-Fidelity Cloud) ──">
                {availableEdge.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {isRecommended(voice.id) ? '⭐ ' : ''}
                    {voice.name} {voice.badge ? `★ [${voice.badge}]` : ''} ({voice.accent}, {voice.gender})
                  </option>
                ))}
              </optgroup>
            )}

            {/* Section 2: Kokoro In-Browser Neural */}
            {availableKokoro.length > 0 && (
              <optgroup label="── ⚡ Kokoro-82M (Client-Side Neural, WebGPU/WASM) ──">
                {availableKokoro.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {isRecommended(voice.id) ? '⭐ ' : ''}
                    {voice.name} {voice.badge ? `★ [${voice.badge}]` : ''} ({voice.accent})
                  </option>
                ))}
              </optgroup>
            )}

            {/* Section 3: Browser Native Speech */}
            {availableWebSpeech.length > 0 && (
              <optgroup label="── ⚡ Native Browser Web Speech (Instant 0MB) ──">
                {availableWebSpeech.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name} ({voice.accent})
                  </option>
                ))}
              </optgroup>
            )}

            {/* Section 4: Puter Cloud */}
            {availablePuter.length > 0 && (
              <optgroup label="── ☁️ Puter Cloud (OpenAI / 11Labs) ──">
                {availablePuter.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.category} • {voice.name} ({voice.accent})
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        {/* Selected Voice Card with Preview Button & Details */}
        {currentVoice && (
          <div className="p-4 bg-neutral-900/80 rounded-2xl border border-neutral-800 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-neutral-800 text-neutral-300 mt-0.5">
                  {currentVoice.engine === 'edge' && <Globe className="w-4 h-4 text-sky-400" />}
                  {currentVoice.engine === 'kokoro' && <Cpu className="w-4 h-4 text-emerald-400" />}
                  {currentVoice.engine === 'webspeech' && <Zap className="w-4 h-4 text-amber-400" />}
                  {currentVoice.engine === 'puter' && <Cloud className="w-4 h-4 text-indigo-400" />}
                </div>
                <div>
                  <div className="font-semibold text-neutral-100 flex items-center gap-2 text-sm">
                    <span>{currentVoice.name}</span>
                    {isRecommended(currentVoice.id) && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                        Recommended
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-neutral-400 mt-0.5">
                    {currentVoice.category} • {currentVoice.accent} • {currentVoice.gender || 'neutral'}
                  </div>
                </div>
              </div>

              {/* Preview Button */}
              <button
                type="button"
                onClick={() => handlePlayPreview(currentVoice)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                  previewingVoiceId === currentVoice.id
                    ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-sky-400 hover:text-white border-neutral-700'
                }`}
              >
                {previewingVoiceId === currentVoice.id ? (
                  isLoadingPreview ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Stop Preview</span>
                    </>
                  )
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    <span>Preview Voice</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed border-t border-neutral-800/80 pt-2.5">
              {currentVoice.description || 'Natural speech synthesis.'}
            </p>

            {currentVoice.moods && currentVoice.moods.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider">
                  Styles:
                </span>
                {currentVoice.moods.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 border border-neutral-700/60 font-mono"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
