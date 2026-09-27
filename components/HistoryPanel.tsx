'use client';

import React from 'react';
import { History, Play, Trash2, Clock, Globe, Cpu, Zap, Cloud } from 'lucide-react';
import { GenerationResult } from '@/lib/ttsRouter';

interface HistoryPanelProps {
  history: GenerationResult[];
  onPlayClip: (clip: GenerationResult) => void;
  onClearHistory: () => void;
}

export function HistoryPanel({
  history,
  onPlayClip,
  onClearHistory,
}: HistoryPanelProps) {
  if (history.length === 0) {
    return null;
  }

  const renderEngineIcon = (engine: string) => {
    switch (engine) {
      case 'edge':
        return <Globe className="w-3.5 h-3.5 text-sky-400" />;
      case 'kokoro':
        return <Cpu className="w-3.5 h-3.5 text-emerald-400" />;
      case 'webspeech':
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Cloud className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-semibold text-neutral-200">Recent Clips</h3>
          <span className="text-xs text-neutral-500 font-mono">({history.length})</span>
        </div>
        <button
          onClick={onClearHistory}
          className="flex items-center gap-1 text-xs text-neutral-500 hover:text-rose-400 transition-colors"
          title="Clear clips"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {history.map((item, idx) => (
          <div
            key={item.timestamp || idx}
            className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/90 border border-neutral-800/80 hover:border-neutral-700 transition-all text-xs group"
          >
            <div className="flex items-center gap-2.5 truncate mr-2">
              <div className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400">
                {renderEngineIcon(item.engineUsed)}
              </div>
              <div className="truncate">
                <div className="font-medium text-neutral-200 truncate">
                  {item.voiceUsed}
                </div>
                <div className="text-[11px] text-neutral-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    {new Date(item.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                  {item.duration && <span>• {item.duration.toFixed(1)}s</span>}
                </div>
              </div>
            </div>

            <button
              onClick={() => onPlayClip(item)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 transition-all font-medium shrink-0 group-hover:scale-105"
            >
              <Play className="w-3 h-3 fill-sky-400" />
              <span>Load</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
