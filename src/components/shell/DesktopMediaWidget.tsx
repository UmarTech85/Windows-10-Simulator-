import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Disc3, ExternalLink, X } from 'lucide-react';
import { MusicPlayerState } from '../../types/music';
import { musicGenerator } from '../../utils/musicSynth';
import { soundEngine } from '../../utils/sound';

interface DesktopMediaWidgetProps {
  player: MusicPlayerState;
  onOpenGroove: () => void;
  isGrooveWindowOpen: boolean;
}

export const DesktopMediaWidget: React.FC<DesktopMediaWidgetProps> = ({
  player,
  onOpenGroove,
  isGrooveWindowOpen,
}) => {
  const [minimized, setMinimized] = useState(false);
  const [bars, setBars] = useState<number[]>([6, 12, 18, 14, 8]);
  const animRef = useRef<number | null>(null);

  const currentTrack = player.tracks[player.currentTrackIndex] || player.tracks[0];

  // Mini visualizer loop
  useEffect(() => {
    const loop = () => {
      if (musicGenerator.analyser && player.isPlaying) {
        const data = new Uint8Array(musicGenerator.analyser.frequencyBinCount);
        musicGenerator.analyser.getByteFrequencyData(data);
        const nextBars = [
          Math.max(4, ((data[2] || 0) / 255) * 18),
          Math.max(4, ((data[5] || 0) / 255) * 18),
          Math.max(4, ((data[9] || 0) / 255) * 18),
          Math.max(4, ((data[14] || 0) / 255) * 18),
          Math.max(4, ((data[20] || 0) / 255) * 18),
        ];
        setBars(nextBars);
      } else {
        setBars((prev) => prev.map((v) => Math.max(3, v * 0.85)));
      }
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [player.isPlaying]);

  // Don't show if Groove Music window is currently active and visible, or if not playing and minimized
  if (!player.isPlaying && minimized) return null;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`fixed z-30 transition-all duration-300 font-sans select-none ${
        minimized
          ? 'bottom-14 right-4 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 rounded-full p-2 shadow-2xl flex items-center gap-2 text-white cursor-pointer'
          : 'bottom-14 right-4 sm:right-6 w-76 sm:w-80 bg-[#181818]/95 backdrop-blur-xl border border-zinc-700/80 rounded-xl p-3.5 shadow-2xl text-white animate-slideUp'
      }`}
    >
      {minimized ? (
        <div
          onClick={() => {
            setMinimized(false);
            soundEngine.playClick();
          }}
          className="flex items-center gap-2 px-1"
        >
          <div
            className={`w-6 h-6 rounded-full bg-gradient-to-tr ${currentTrack.coverGradient} flex items-center justify-center`}
          >
            <Disc3 size={14} className={player.isPlaying ? 'animate-spin' : ''} />
          </div>
          <span className="text-xs font-medium max-w-28 truncate">{currentTrack.title}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              player.togglePlay();
            }}
            className="p-1 hover:bg-zinc-700 rounded-full text-blue-400"
          >
            {player.isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {/* Header Row */}
          <div className="flex items-center justify-between text-[11px] text-zinc-400 border-b border-zinc-800 pb-1.5">
            <div className="flex items-center gap-1.5 font-medium text-blue-400">
              <Disc3 size={13} className={player.isPlaying ? 'animate-spin' : ''} />
              <span>Groove Music · Background Player</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onOpenGroove();
                }}
                title="Open Groove Music Window"
                className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"
              >
                <ExternalLink size={13} />
              </button>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setMinimized(true);
                }}
                title="Minimize Widget"
                className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Track Info + Mini Spectrum */}
          <div className="flex items-center gap-3">
            <div
              onClick={onOpenGroove}
              className={`w-12 h-12 rounded-lg bg-gradient-to-tr ${currentTrack.coverGradient} flex items-center justify-center shadow-md cursor-pointer hover:scale-105 transition-transform shrink-0`}
            >
              <Disc3 size={24} className={`text-white/90 ${player.isPlaying ? 'animate-spin' : ''}`} />
            </div>

            <div className="flex-1 truncate">
              <h4 className="text-xs font-semibold text-white truncate">{currentTrack.title}</h4>
              <p className="text-[11px] text-zinc-400 truncate">{currentTrack.artist}</p>
              <span className="text-[10px] text-blue-400 font-medium">{currentTrack.genre}</span>
            </div>

            {/* Live Audio Visualizer Bars */}
            <div className="flex items-end gap-0.5 h-6 pl-1">
              {bars.map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-blue-400 rounded-t-xs transition-all duration-75"
                  style={{ height: `${h}px` }}
                />
              ))}
            </div>
          </div>

          {/* Scrubber Progress Bar */}
          <div className="w-full flex items-center gap-2 text-[10px] font-mono text-zinc-400">
            <span>
              {Math.floor(player.currentTime / 60)}:
              {Math.floor(player.currentTime % 60) < 10 ? '0' : ''}
              {Math.floor(player.currentTime % 60)}
            </span>
            <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all"
                style={{ width: `${(player.currentTime / (player.duration || 1)) * 100}%` }}
              />
            </div>
            <span>
              {Math.floor(player.duration / 60)}:
              {Math.floor(player.duration % 60) < 10 ? '0' : ''}
              {Math.floor(player.duration % 60)}
            </span>
          </div>

          {/* Playback Controls Row */}
          <div className="flex items-center justify-center gap-4 pt-0.5">
            <button
              onClick={player.prevTrack}
              title="Previous"
              className="p-1.5 hover:bg-zinc-800 rounded-full text-zinc-300 hover:text-white transition-colors"
            >
              <SkipBack size={15} />
            </button>
            <button
              onClick={player.togglePlay}
              className="w-8 h-8 bg-white hover:bg-zinc-200 text-black rounded-full flex items-center justify-center transition-transform hover:scale-105 shadow-md"
            >
              {player.isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
            </button>
            <button
              onClick={player.nextTrack}
              title="Next"
              className="p-1.5 hover:bg-zinc-800 rounded-full text-zinc-300 hover:text-white transition-colors"
            >
              <SkipForward size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
