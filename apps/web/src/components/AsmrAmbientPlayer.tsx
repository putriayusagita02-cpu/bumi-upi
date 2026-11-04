// apps/web/src/components/AsmrAmbientPlayer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { asmrAudioEngine, AsmrPreset } from '../lib/asmrAudioEngine';
import { Volume2, VolumeX, Sparkles, X } from './icons';

export const AsmrAmbientPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [preset, setPreset] = useState<AsmrPreset>('all');
  const [volume, setVolume] = useState(0.6);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Sync state with engine
    setIsPlaying(asmrAudioEngine.isRunning());
    const currentP = asmrAudioEngine.getPreset();
    if (currentP) setPreset(currentP);
  }, []);

  const handleTogglePlay = () => {
    setHasInteracted(true);
    if (isPlaying) {
      asmrAudioEngine.stop();
      setIsPlaying(false);
    } else {
      asmrAudioEngine.setVolume(volume);
      asmrAudioEngine.play(preset);
      setIsPlaying(true);
    }
  };

  const handleSelectPreset = (newPreset: AsmrPreset) => {
    setPreset(newPreset);
    setHasInteracted(true);
    if (isPlaying) {
      asmrAudioEngine.play(newPreset);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    asmrAudioEngine.setVolume(newVol);
  };

  const presetLabels: Record<AsmrPreset, { name: string; icon: string; desc: string }> = {
    all: {
      name: 'Harmoni Pasundan',
      icon: '🌿',
      desc: 'Paduan sejuk rintik hujan Garut, dapur hawu, dan petikan kacapi',
    },
    rain: {
      name: 'Teras Gerimis Garut',
      icon: '🌧️',
      desc: 'Hujan rintik di atap sirap & tetesan gemercik pancuran bambu',
    },
    kitchen: {
      name: 'Hawu Dapur Liwet',
      icon: '🪵',
      desc: 'Desis kastrol liwet mendidih & gemeretak kayu bakar hawu nenek',
    },
    kacapi: {
      name: 'Petikan Kacapi Petang',
      icon: '🎶',
      desc: 'Melodi lembut waditra Sunda laras salendro penenang jiwa',
    },
  };

  return (
    <>
      {/* Floating Pill: Bottom Left (Balances Tanya Upi at Bottom Right) */}
      <div className="fixed bottom-20 left-4 md:bottom-6 md:left-6 z-40 print:hidden">
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#2B2625]/90 backdrop-blur-md border border-[#D4A24C]/60 shadow-2xl text-[#F5EEDC] transition-all hover:scale-102">
          {/* Main Action Pill */}
          <button
            type="button"
            onClick={handleTogglePlay}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition-all ${
              isPlaying
                ? 'bg-[#3E4F30] text-[#F5EEDC] shadow-sm'
                : 'bg-white/10 text-white/90 hover:bg-white/20'
            }`}
            title={isPlaying ? 'Jeda Suara Suasana' : 'Putar Audio Suasana Dapur Nenek Garut'}
          >
            {isPlaying ? (
              <>
                {/* Animated Equalizer Wave */}
                <span className="flex items-end gap-0.5 h-3.5 w-3.5 pb-0.5">
                  <span className="w-0.5 h-full bg-[#D4A24C] rounded-full animate-bounce" style={{ animationDuration: '0.6s' }} />
                  <span className="w-0.5 h-2/3 bg-[#D4A24C] rounded-full animate-bounce" style={{ animationDuration: '0.8s', animationDelay: '0.2s' }} />
                  <span className="w-0.5 h-4/5 bg-[#D4A24C] rounded-full animate-bounce" style={{ animationDuration: '0.5s', animationDelay: '0.4s' }} />
                </span>
                <span className="tracking-wide text-[11px] hidden sm:inline">
                  {presetLabels[preset].name}
                </span>
                <span className="sm:hidden text-xs">{presetLabels[preset].icon}</span>
              </>
            ) : (
              <>
                <span className="text-xs">🎧</span>
                <span className="tracking-wide text-[11px] hidden sm:inline">
                  Suasana Garut (ASMR)
                </span>
                <span className="sm:hidden text-xs">ASMR</span>
              </>
            )}
          </button>

          {/* Quick Expand / Settings Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-full text-[#D4A24C] hover:bg-white/10 transition"
            aria-label="Pilih Suasana & Volume"
            title="Pilih Suasana & Atur Volume"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Soundscape Control Card */}
      {isExpanded && (
        <div className="fixed bottom-36 left-4 md:bottom-20 md:left-6 z-50 w-[calc(100vw-2rem)] max-w-sm sm:w-96 rounded-3xl bg-[#2B2625]/95 backdrop-blur-lg border border-[#D4A24C]/60 p-5 shadow-2xl text-[#F5EEDC] animate-in slide-in-from-bottom-3 duration-200 print:hidden">
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-white/15">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#3E4F30] text-[#D4A24C] text-[10px] font-bold">
                <span>🌿</span>
                <span>ASMR Sintetis Garut</span>
              </div>
              <h3
                className="font-serif text-base font-bold text-white mt-1"
                style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
              >
                Suasana Dapur Nenek Garut
              </h3>
              <p className="text-[10px] text-[#D0C0B0] leading-tight">
                Web Audio alami tanpa beban kuota — hadirkan ketenangan khas Priangan.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Presets Grid */}
          <div className="py-3 space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#D4A24C] block">
              Pilih Suasana Tradisional:
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {(Object.keys(presetLabels) as AsmrPreset[]).map((key) => {
                const item = presetLabels[key];
                const active = preset === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      handleSelectPreset(key);
                      if (!isPlaying) {
                        asmrAudioEngine.setVolume(volume);
                        asmrAudioEngine.play(key);
                        setIsPlaying(true);
                      }
                    }}
                    className={`flex items-start gap-2.5 p-2 rounded-2xl text-left transition border ${
                      active
                        ? 'bg-[#3E4F30]/80 border-[#D4A24C] text-white shadow-xs'
                        : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-xl p-1 rounded-xl bg-black/20 shrink-0">
                      {item.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#F5EEDC]">{item.name}</span>
                        {active && isPlaying && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#D4A24C] text-[#2B2625] font-black uppercase">
                            Aktif
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#C4B29E] leading-tight mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Volume Control & Play/Stop */}
          <div className="pt-3 border-t border-white/15 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-white/80 text-[11px] font-medium">
                {volume === 0 ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-[#D4A24C]" />}
                <span>Kekuatan Suara:</span>
              </span>
              <span className="font-mono text-[10px] text-[#D4A24C] font-bold">
                {Math.round(volume * 100)}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#D4A24C]"
            />

            {/* Bottom Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleTogglePlay}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs ${
                  isPlaying
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-[#3E4F30] hover:brightness-110 text-[#F5EEDC]'
                }`}
              >
                <span>{isPlaying ? '⏸ Hentikan Suara' : '▶ Putar Suasana'}</span>
              </button>

              <button
                type="button"
                onClick={() => asmrAudioEngine.playCelebrationChime()}
                className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-[#D4A24C] text-[11px] font-semibold border border-white/10 transition"
                title="Dengarkan Dentang Waditra Bonang"
              >
                🔔 Dentang Waditra
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
