'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { TtsEngineType } from '@/lib/voiceCatalog';

interface AudioPlayerProps {
  audioUrl: string | null;
  voiceName?: string;
  engineUsed?: TtsEngineType;
  autoPlay?: boolean;
}

export function AudioPlayer({
  audioUrl,
  voiceName,
  engineUsed,
  autoPlay = true,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!audioUrl) return;

    if (audioRef.current) {
      audioRef.current.load();
      if (autoPlay) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.log('Autoplay deferred:', err);
            setIsPlaying(false);
          });
      }
    }
  }, [audioUrl, autoPlay]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const changeRate = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getEngineLabel = (engine?: TtsEngineType) => {
    switch (engine) {
      case 'edge':
        return 'Microsoft Edge Neural';
      case 'kokoro':
        return 'Kokoro Local In-Browser';
      case 'webspeech':
        return 'Browser Native Speech';
      case 'puter':
        return 'Puter Cloud';
      default:
        return 'Audio Player';
    }
  };

  if (!audioUrl && engineUsed !== 'webspeech') {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/30 p-8 text-center text-neutral-500">
        <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto mb-3 text-neutral-400">
          <Volume2 className="w-6 h-6 text-neutral-500" />
        </div>
        <p className="text-sm font-medium text-neutral-400">Ready to synthesize speech</p>
        <p className="text-xs text-neutral-500 mt-1">
          Pick Edge Neural, Kokoro Local, or Web Speech, then click Generate Speech.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 shadow-xl backdrop-blur-sm space-y-4">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          preload="auto"
        />
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-neutral-300">
            Audio Output: <span className="text-indigo-400">{voiceName || 'Generated Audio'}</span>
          </span>
          {engineUsed && (
            <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-neutral-800 text-sky-400 border border-neutral-700">
              {getEngineLabel(engineUsed)}
            </span>
          )}
        </div>

        {audioUrl && (
          <a
            href={audioUrl}
            download={`voiceover_${voiceName || 'audio'}_${Date.now()}.mp3`}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 hover:border-neutral-600 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Download Audio</span>
          </a>
        )}
      </div>

      {audioUrl ? (
        <>
          {/* Progress scrub bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-neutral-400 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={duration || 1}
              step="0.05"
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
            />
          </div>

          {/* Playback action controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                    setCurrentTime(0);
                  }
                }}
                title="Restart playback"
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlay}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-medium text-sm shadow-md shadow-sky-500/20 active:scale-95 transition-all"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-white" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Play</span>
                  </>
                )}
              </button>

              {/* Speed Pills */}
              <div className="flex items-center rounded-xl bg-neutral-800/80 border border-neutral-700/60 p-0.5 ml-2">
                {[0.75, 1.0, 1.25, 1.5].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => changeRate(rate)}
                    className={`px-2 py-1 text-xs rounded-lg transition-colors font-medium ${
                      playbackRate === rate
                        ? 'bg-neutral-700 text-white shadow-xs'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (!audioRef.current) return;
                  const nextMuted = !isMuted;
                  setIsMuted(nextMuted);
                  audioRef.current.muted = nextMuted;
                }}
                className="p-2 text-neutral-400 hover:text-white transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setVolume(val);
                  setIsMuted(false);
                  if (audioRef.current) {
                    audioRef.current.volume = val;
                    audioRef.current.muted = false;
                  }
                }}
                className="w-16 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>
        </>
      ) : (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300">
          Native Web Speech audio played directly via browser device speakers.
        </div>
      )}
    </div>
  );
}
