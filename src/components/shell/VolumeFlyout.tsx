import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { soundEngine } from '../../utils/sound';

interface VolumeFlyoutProps {
  volume: number;
  muted: boolean;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
}

export const VolumeFlyout: React.FC<VolumeFlyoutProps> = ({
  volume,
  muted,
  onVolumeChange,
  onToggleMute,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    onVolumeChange(val);
  };

  const handleTestSound = () => {
    soundEngine.playDing();
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed bottom-[44px] right-20 w-72 bg-[#1f1f1f]/95 backdrop-blur-xl text-white border-t border-x border-zinc-700/60 shadow-2xl z-50 p-4 font-sans select-none animate-fadeIn rounded-t-sm"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-zinc-300">Speakers (High Definition Audio)</span>
        <span className="text-xs font-mono text-zinc-400">{muted ? '0' : volume}%</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            onToggleMute();
            soundEngine.playClick();
          }}
          className="p-1.5 hover:bg-zinc-700 rounded transition-colors text-zinc-300 hover:text-white"
        >
          {muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        <input
          type="range"
          min="0"
          max="100"
          value={muted ? 0 : volume}
          onChange={handleChange}
          onMouseUp={handleTestSound}
          className="flex-1 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>
    </div>
  );
};
