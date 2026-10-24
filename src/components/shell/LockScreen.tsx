import React, { useState, useEffect } from 'react';
import { Wifi, BatteryCharging, ArrowRight } from 'lucide-react';
import { soundEngine } from '../../utils/sound';

interface LockScreenProps {
  wallpaper: string;
  onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ wallpaper, onUnlock }) => {
  const [isSwipedUp, setIsSwipedUp] = useState(false);
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [pin, setPin] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
      setDate(
        now.toLocaleDateString([], {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleUnlock = () => {
    soundEngine.playStartup();
    onUnlock();
  };

  return (
    <div
      onClick={() => {
        if (!isSwipedUp) {
          setIsSwipedUp(true);
          soundEngine.playClick();
        }
      }}
      className="fixed inset-0 z-[100] bg-cover bg-center select-none font-sans overflow-hidden flex flex-col justify-between"
      style={{ backgroundImage: `url(${wallpaper})` }}
    >
      {/* Dark frosted overlay */}
      <div className={`absolute inset-0 transition-colors duration-500 ${isSwipedUp ? 'bg-black/50 backdrop-blur-md' : 'bg-black/20'}`} />

      {/* Screen 1: Spotlight Clock View */}
      {!isSwipedUp ? (
        <div className="relative z-10 flex-1 flex flex-col justify-between p-12 text-white animate-fadeIn">
          {/* Top Clock */}
          <div>
            <div className="text-7xl sm:text-8xl font-light tracking-tight font-mono drop-shadow-lg">
              {time}
            </div>
            <div className="text-2xl sm:text-3xl font-normal drop-shadow-md mt-1">
              {date}
            </div>
          </div>

          {/* Bottom Prompt + Tray Indicators */}
          <div className="flex items-end justify-between">
            <div className="text-xs text-white/80 animate-pulse">
              Click anywhere or press Enter to unlock
            </div>
            <div className="flex items-center gap-4 text-white/90">
              <Wifi size={20} />
              <BatteryCharging size={20} className="text-emerald-400" />
            </div>
          </div>
        </div>
      ) : (
        /* Screen 2: User Sign-In View */
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-white animate-slideUp">
          {/* User Avatar */}
          <div className="w-28 h-28 rounded-full bg-zinc-700/80 border-2 border-white/40 flex items-center justify-center text-4xl mb-4 shadow-2xl">
            👤
          </div>
          <h2 className="text-2xl font-light tracking-wide mb-6">User</h2>

          {/* Sign In Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUnlock();
            }}
            className="flex items-center bg-white/20 hover:bg-white/30 border border-white/40 rounded px-3 py-1.5 backdrop-blur-md w-64 shadow-lg focus-within:ring-2 focus-within:ring-blue-400 transition-all"
          >
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="PIN / Password"
              autoFocus
              className="bg-transparent outline-none text-white text-xs placeholder:text-white/60 flex-1"
            />
            <button
              type="submit"
              className="p-1 hover:bg-white/20 rounded text-white transition-colors"
            >
              <ArrowRight size={16} />
            </button>
          </form>

          <button
            onClick={handleUnlock}
            className="mt-4 px-6 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium shadow-md transition-colors"
          >
            Sign in
          </button>
        </div>
      )}
    </div>
  );
};
