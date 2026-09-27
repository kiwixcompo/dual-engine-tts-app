'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Save,
  RotateCcw,
  Sliders,
  Cpu,
  Globe,
  Zap,
  Cloud,
  ArrowLeft,
  LogOut,
  EyeOff,
} from 'lucide-react';
import {
  AppConfig,
  loadAppConfig,
  saveAppConfig,
  resetAppConfig,
  checkAdminAuth,
  setAdminAuth,
  DEFAULT_CONFIG,
  SupportedEngine,
} from '@/lib/configStore';

const SECRET_KEYWORD = 'kiwix';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false); // Unlocked only when user types 'kiwix'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    const authed = checkAdminAuth();
    setIsAuthenticated(authed);
    if (authed) {
      setIsUnlocked(true);
    }
    setConfig(loadAppConfig());

    // Keystroke listener for secret keyword 'kiwix'
    let buffer = '';
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is actively typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      if (e.key.length === 1) {
        buffer = (buffer + e.key.toLowerCase()).slice(-SECRET_KEYWORD.length);
        if (buffer === SECRET_KEYWORD) {
          setIsUnlocked(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'Password@123') {
      setAdminAuth(true);
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid username or password.');
    }
  };

  const handleLogout = () => {
    setAdminAuth(false);
    setIsAuthenticated(false);
    setIsUnlocked(false);
    setUsername('');
    setPassword('');
  };

  const handleSaveConfig = () => {
    if (
      !config.edgeEnabled &&
      !config.kokoroEnabled &&
      !config.webspeechEnabled &&
      !config.puterEnabled
    ) {
      alert('Error: At least one TTS engine must remain enabled.');
      return;
    }

    saveAppConfig(config);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetConfig = () => {
    if (confirm('Reset all engine and system configurations to defaults?')) {
      const def = resetAppConfig();
      setConfig(def);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  // State 1: Completely Hidden 404-style Stealth Page until 'kiwix' is typed
  if (!isUnlocked && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center px-4 text-center text-neutral-400">
        <h1 className="text-4xl font-extrabold text-neutral-200">404</h1>
        <p className="mt-2 text-sm text-neutral-500">Page not found</p>
        <Link
          href="/"
          className="mt-6 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs font-medium text-neutral-300 border border-neutral-800 transition-colors"
        >
          Return Home
        </Link>
      </div>
    );
  }

  // State 2: Secret Unlocked Login Form (No Demo Credentials or Placeholders)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center px-4 py-12 text-neutral-100">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Studio
            </Link>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 p-0.5 shadow-xl mx-auto flex items-center justify-center">
              <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center">
                <Shield className="w-7 h-7 text-sky-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">System Control Access</h2>
          </div>

          <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl space-y-5">
            {loginError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm transition-all shadow-md shadow-sky-600/20 active:scale-[0.98]"
              >
                <KeyRound className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // State 3: Authenticated Admin Dashboard
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pb-16">
      <header className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors border border-neutral-800"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="font-bold text-base flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-400" />
                <span>Engine Administration</span>
              </h1>
              <p className="text-[11px] text-neutral-400">
                Configure engine routing, toggles, and fallback parameters
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-rose-400 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {savedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Settings successfully updated and persisted!</span>
          </div>
        )}

        {/* 4 Engine Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 1. Microsoft Edge Neural */}
          <div
            className={`p-6 rounded-2xl border transition-all ${
              config.edgeEnabled
                ? 'bg-neutral-900/80 border-sky-500/30 shadow-lg shadow-sky-950/20'
                : 'bg-neutral-900/30 border-neutral-800 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-neutral-200">
                    Microsoft Edge Neural
                  </h3>
                  <p className="text-xs text-neutral-400">
                    100% Free Cloud Neural Voices
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.edgeEnabled}
                  onChange={(e) =>
                    setConfig({ ...config, edgeEnabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
              </label>
            </div>

            <div className="mt-4 pt-4 border-t border-neutral-800/80 text-xs text-neutral-400 space-y-2">
              <div className="flex items-center justify-between">
                <span>Cost / Limits:</span>
                <span className="font-medium text-emerald-400">$0.00 • No Character Limits</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <span
                  className={`font-semibold ${
                    config.edgeEnabled ? 'text-sky-400' : 'text-neutral-500'
                  }`}
                >
                  {config.edgeEnabled ? 'Active (Recommended)' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Kokoro In-Browser */}
          <div
            className={`p-6 rounded-2xl border transition-all ${
              config.kokoroEnabled
                ? 'bg-neutral-900/80 border-emerald-500/30 shadow-lg shadow-emerald-950/20'
                : 'bg-neutral-900/30 border-neutral-800 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-neutral-200">
                    Kokoro-82M In-Browser
                  </h3>
                  <p className="text-xs text-neutral-400">
                    100% Free Client-Side Neural GPU/WASM
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.kokoroEnabled}
                  onChange={(e) =>
                    setConfig({ ...config, kokoroEnabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="mt-4 pt-4 border-t border-neutral-800/80 text-xs text-neutral-400 space-y-2">
              <div className="flex items-center justify-between">
                <span>Model Architecture:</span>
                <span className="font-mono text-neutral-300">Kokoro-82M ONNX</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Server Cost:</span>
                <span className="font-medium text-emerald-400">$0.00 (Client-side execution)</span>
              </div>
            </div>
          </div>

          {/* 3. Native Web Speech API */}
          <div
            className={`p-6 rounded-2xl border transition-all ${
              config.webspeechEnabled
                ? 'bg-neutral-900/80 border-amber-500/30 shadow-lg shadow-amber-950/20'
                : 'bg-neutral-900/30 border-neutral-800 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-neutral-200">
                    Browser Native Speech
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Zero-download, native OS synthesis (0ms latency)
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.webspeechEnabled}
                  onChange={(e) =>
                    setConfig({ ...config, webspeechEnabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>

            <div className="mt-4 pt-4 border-t border-neutral-800/80 text-xs text-neutral-400 space-y-2">
              <div className="flex items-center justify-between">
                <span>Download Footprint:</span>
                <span className="font-medium text-amber-400">0 MB</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <span
                  className={`font-semibold ${
                    config.webspeechEnabled ? 'text-amber-400' : 'text-neutral-500'
                  }`}
                >
                  {config.webspeechEnabled ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>

          {/* 4. Puter.js Cloud */}
          <div
            className={`p-6 rounded-2xl border transition-all ${
              config.puterEnabled
                ? 'bg-neutral-900/80 border-indigo-500/30'
                : 'bg-neutral-900/30 border-neutral-800 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-neutral-200">
                    Puter.js Cloud Engine
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Third-party credits (OpenAI / 11Labs)
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.puterEnabled}
                  onChange={(e) =>
                    setConfig({ ...config, puterEnabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="mt-4 pt-4 border-t border-neutral-800/80 text-xs text-neutral-400 space-y-2">
              <div className="flex items-center justify-between">
                <span>Credit Depletion Warning:</span>
                <span className="text-amber-400">Subject to rate limits</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <span
                  className={`font-semibold ${
                    config.puterEnabled ? 'text-indigo-400' : 'text-neutral-500'
                  }`}
                >
                  {config.puterEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Settings Section */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-base font-semibold text-neutral-200 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            <span>Default Engine & System Routing</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-2">
                Primary Default Engine
              </label>
              <select
                value={config.defaultEngine}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    defaultEngine: e.target.value as SupportedEngine,
                  })
                }
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="edge" disabled={!config.edgeEnabled}>
                  Edge Neural Voices (Free Cloud - Recommended)
                </option>
                <option value="kokoro" disabled={!config.kokoroEnabled}>
                  Kokoro-82M (Client-Side Neural WebGPU/WASM)
                </option>
                <option value="webspeech" disabled={!config.webspeechEnabled}>
                  Browser Native Speech (Instant 0MB)
                </option>
                <option value="puter" disabled={!config.puterEnabled}>
                  Puter Cloud Engine
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-2">
                Studio App Title
              </label>
              <input
                type="text"
                value={config.appTitle}
                onChange={(e) => setConfig({ ...config, appTitle: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-neutral-200 flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-sky-400" />
                  <span>Hide Puter.js Popups & Modals</span>
                </div>
                <p className="text-xs text-neutral-400">
                  Blocks Puter.js auth dialogs, overlay backdrops, and credit warning popups.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.hidePuterPopups}
                  onChange={(e) =>
                    setConfig({ ...config, hidePuterPopups: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-neutral-200">
                  Automatic Fallback to Edge Neural
                </div>
                <p className="text-xs text-neutral-400">
                  If Kokoro or Web Speech encounters any error on client devices, automatically fall back to Edge Neural voices.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.fallbackToEdgeIfError}
                  onChange={(e) =>
                    setConfig({ ...config, fallbackToEdgeIfError: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleResetConfig}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>

          <button
            onClick={handleSaveConfig}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm transition-all shadow-lg shadow-sky-600/25 active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </main>
    </div>
  );
}
