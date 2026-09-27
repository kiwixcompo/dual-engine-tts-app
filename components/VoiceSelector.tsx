'use client';

import React from 'react';
import {
  VoiceItem,
  EDGE_NEURAL_VOICES,
  KOKORO_VOICES,
  WEBSPEECH_VOICES,
  PUTER_VOICES,
  TtsEngineType,
} from '@/lib/voiceCatalog';
import { Globe, Cpu, Zap, Cloud, Volume2 } from 'lucide-react';
import { AppConfig } from '@/lib/configStore';

interface VoiceSelectorProps {
  selectedVoiceId: string;
  onVoiceSelect: (voice: VoiceItem) => void;
  config: AppConfig;
}

export function VoiceSelector({
  selectedVoiceId,
  onVoiceSelect,
  config,
}: VoiceSelectorProps) {
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

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const voice = allAvailable.find((v) => v.id === id);
    if (voice) {
      onVoiceSelect(voice);
    }
  };

  const getEngineBadge = (engine: TtsEngineType) => {
    switch (engine) {
      case 'edge':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-medium">
            <Globe className="w-3 h-3" /> Microsoft Edge Neural (Free Cloud)
          </span>
        );
      case 'kokoro':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            <Cpu className="w-3 h-3" /> Kokoro (Local In-Browser GPU/WASM)
          </span>
        );
      case 'webspeech':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
            <Zap className="w-3 h-3" /> Native Web Speech (Instant 0MB)
          </span>
        );
      case 'puter':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
            <Cloud className="w-3 h-3" /> Puter (Cloud)
          </span>
        );
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label
          htmlFor="voice-select"
          className="text-sm font-semibold text-neutral-200 flex items-center gap-2"
        >
          <Volume2 className="w-4 h-4 text-indigo-400" />
          <span>Voice & Engine Selector</span>
        </label>
        {currentVoice && <div>{getEngineBadge(currentVoice.engine)}</div>}
      </div>

      <div className="relative">
        <select
          id="voice-select"
          value={selectedVoiceId}
          onChange={handleSelectChange}
          className="w-full bg-neutral-900 border border-neutral-800 text-neutral-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer hover:border-neutral-700 shadow-inner"
        >
          {/* Section 1: Microsoft Edge Neural (Free, High-Fidelity Cloud) */}
          {availableEdge.length > 0 && (
            <optgroup label="── 🌐 Free Edge Neural Voices (High-Fidelity Cloud, No Credits) ──">
              {availableEdge.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name} {voice.badge ? `★ [${voice.badge}]` : ''} ({voice.accent}, {voice.gender})
                </option>
              ))}
            </optgroup>
          )}

          {/* Section 2: Kokoro In-Browser Neural (Client-Side Unlimited) */}
          {availableKokoro.length > 0 && (
            <optgroup label="── ⚡ Kokoro-82M (Client-Side Neural, WebGPU/WASM) ──">
              {availableKokoro.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name} {voice.badge ? `★ [${voice.badge}]` : ''} ({voice.accent})
                </option>
              ))}
            </optgroup>
          )}

          {/* Section 3: Browser Native Speech (Instant, Zero Download) */}
          {availableWebSpeech.length > 0 && (
            <optgroup label="── ⚡ Native Browser Web Speech (Instant 0MB Download) ──">
              {availableWebSpeech.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name} ({voice.accent})
                </option>
              ))}
            </optgroup>
          )}

          {/* Section 4: Puter Cloud (If Enabled in Admin) */}
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

      {currentVoice && (
        <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800/80 flex items-start gap-3 text-xs text-neutral-400">
          <div className="p-1.5 rounded-lg bg-neutral-800/80 text-neutral-300 mt-0.5">
            {currentVoice.engine === 'edge' && <Globe className="w-3.5 h-3.5 text-sky-400" />}
            {currentVoice.engine === 'kokoro' && <Cpu className="w-3.5 h-3.5 text-emerald-400" />}
            {currentVoice.engine === 'webspeech' && <Zap className="w-3.5 h-3.5 text-amber-400" />}
            {currentVoice.engine === 'puter' && <Cloud className="w-3.5 h-3.5 text-indigo-400" />}
          </div>
          <div className="flex-1 space-y-0.5">
            <div className="font-medium text-neutral-200 flex items-center gap-2">
              <span>{currentVoice.name}</span>
              <span className="text-[11px] text-neutral-500">• {currentVoice.category}</span>
            </div>
            <p className="text-neutral-400 leading-relaxed">
              {currentVoice.description || 'Natural speech synthesis.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
