import React, { useState } from 'react';
import { Wifi, Lock, Check } from 'lucide-react';
import { soundEngine } from '../../utils/sound';

interface WifiFlyoutProps {
  connected: boolean;
  activeNetwork: string;
  onToggleConnect: (networkName: string) => void;
}

const NETWORKS = [
  { name: 'Home_WiFi_5G', strength: 'Strong', secured: true },
  { name: 'Office_Gigabit_Guest', strength: 'Strong', secured: true },
  { name: 'CoffeeShop_Free_WiFi', strength: 'Medium', secured: false },
  { name: 'Windows_Direct_Hotspot', strength: 'Weak', secured: true },
];

export const WifiFlyout: React.FC<WifiFlyoutProps> = ({
  connected,
  activeNetwork,
  onToggleConnect,
}) => {
  const [selectedNetwork, setSelectedNetwork] = useState<string>(activeNetwork);

  const handleConnect = (net: string) => {
    soundEngine.playClick();
    onToggleConnect(net);
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed bottom-[44px] right-24 w-80 bg-[#1f1f1f]/95 backdrop-blur-xl text-white border-t border-x border-zinc-700/60 shadow-2xl z-50 p-4 font-sans select-none animate-fadeIn rounded-t-sm"
    >
      <div className="flex items-center justify-between mb-3 border-b border-zinc-700/60 pb-2">
        <span className="text-xs font-semibold text-zinc-300">Available Networks</span>
        <span className="text-[11px] text-zinc-400">Wi-Fi</span>
      </div>

      <div className="space-y-1 max-h-64 overflow-y-auto">
        {NETWORKS.map((net) => {
          const isCurrentActive = connected && activeNetwork === net.name;
          const isSelected = selectedNetwork === net.name;

          return (
            <div
              key={net.name}
              onClick={() => setSelectedNetwork(net.name)}
              className={`p-2.5 rounded-sm cursor-pointer transition-colors border ${
                isSelected
                  ? 'bg-blue-600/30 border-blue-500/40'
                  : 'hover:bg-zinc-800/80 border-transparent'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Wifi size={15} className="text-blue-400" />
                  <span className="font-medium text-zinc-200">{net.name}</span>
                </div>
                {net.secured && <Lock size={12} className="text-zinc-400" />}
              </div>

              {isCurrentActive && (
                <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                  <Check size={12} />
                  <span>Connected, secured</span>
                </div>
              )}

              {isSelected && (
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => handleConnect(net.name)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
                  >
                    {isCurrentActive ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
