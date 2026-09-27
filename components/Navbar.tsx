'use client';

import Link from 'next/link';
import { Sparkles, Cpu, Globe, Zap, Cloud } from 'lucide-react';
import { AppConfig } from '@/lib/configStore';
import { TtsEngineType } from '@/lib/voiceCatalog';

interface NavbarProps {
  config: AppConfig;
  activeEngine: TtsEngineType;
}

export function Navbar({ config, activeEngine }: NavbarProps) {
  const renderEngineBadge = () => {
    switch (activeEngine) {
      case 'edge':
        return (
          <span className="inline-flex items-center gap-1 font-medium text-sky-400">
            <Globe className="w-3.5 h-3.5" /> Edge Neural (Free Cloud)
          </span>
        );
      case 'kokoro':
        return (
          <span className="inline-flex items-center gap-1 font-medium text-emerald-400">
            <Cpu className="w-3.5 h-3.5" /> Kokoro (Local WebGPU/WASM)
          </span>
        );
      case 'webspeech':
        return (
          <span className="inline-flex items-center gap-1 font-medium text-amber-400">
            <Zap className="w-3.5 h-3.5" /> Browser Native (0MB Instant)
          </span>
        );
      case 'puter':
        return (
          <span className="inline-flex items-center gap-1 font-medium text-indigo-400">
            <Cloud className="w-3.5 h-3.5" /> Puter (OpenAI/11Labs)
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-neutral-950/80 border-b border-neutral-800 text-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-emerald-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-sky-400 group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
                {config.appTitle || 'AI Voiceover Studio'}
              </span>
              <span className="ml-2 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                100% Free & Unlimited
              </span>
            </div>
          </Link>
        </div>

        {/* Engine indicators - Admin link removed for security/stealth */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border border-neutral-800 bg-neutral-900/60 text-neutral-300">
            <span className="text-neutral-500">Active Engine:</span>
            {renderEngineBadge()}
          </div>
        </div>
      </div>
    </header>
  );
}
