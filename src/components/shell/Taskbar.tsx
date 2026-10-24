import React, { useState, useEffect } from 'react';
import {
  Search,
  Wifi,
  Volume2,
  VolumeX,
  BatteryCharging,
  MessageSquare,
  ChevronUp,
  Layers,
} from 'lucide-react';
import { AppId, WindowState, SystemNotification } from '../../types/os';
import { WindowsLogo, AppIcon } from '../common/AppIcon';
import { APP_REGISTRY } from '../../utils/appRegistry';
import { soundEngine } from '../../utils/sound';

interface TaskbarProps {
  windows: WindowState[];
  activeWindowId: string | null;
  notifications: SystemNotification[];
  isStartOpen: boolean;
  isSearchOpen: boolean;
  isActionCenterOpen: boolean;
  isCalendarOpen: boolean;
  isWifiOpen: boolean;
  isVolumeOpen: boolean;
  volume: number;
  muted: boolean;
  wifiConnected: boolean;
  accentColor: string;
  onToggleStart: () => void;
  onToggleSearch: () => void;
  onToggleActionCenter: () => void;
  onToggleCalendar: () => void;
  onToggleWifi: () => void;
  onToggleVolume: () => void;
  onAppClick: (appId: AppId) => void;
  onWindowClick: (win: WindowState) => void;
  onPeekDesktop: () => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  windows,
  activeWindowId,
  notifications,
  isStartOpen,
  isSearchOpen,
  isActionCenterOpen,
  isCalendarOpen,
  isWifiOpen,
  isVolumeOpen,
  volume,
  muted,
  wifiConnected,
  accentColor,
  onToggleStart,
  onToggleSearch,
  onToggleActionCenter,
  onToggleCalendar,
  onToggleWifi,
  onToggleVolume,
  onAppClick,
  onWindowClick,
  onPeekDesktop,
}) => {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [hoveredAppId, setHoveredAppId] = useState<string | null>(null);

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
          month: 'numeric',
          day: 'numeric',
          year: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const pinnedAppIds: AppId[] = ['explorer', 'edge', 'notepad', 'calc', 'groove'];

  // All apps that should be in taskbar: pinned + currently running
  const runningAppIds = Array.from(new Set(windows.map((w) => w.appId)));
  const taskbarAppIds = Array.from(new Set([...pinnedAppIds, ...runningAppIds]));

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <footer
      onClick={(e) => e.stopPropagation()}
      className="fixed bottom-0 left-0 right-0 h-[44px] bg-[#101010]/95 backdrop-blur-xl border-t border-zinc-800 text-white z-40 flex items-center justify-between font-sans select-none"
    >
      {/* Left Zone: Start Button + Search Bar + Task View */}
      <div className="flex items-center h-full">
        {/* Windows Start Button */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onToggleStart();
          }}
          title="Start"
          className={`h-full w-12 flex items-center justify-center transition-colors group ${
            isStartOpen
              ? 'bg-blue-600 text-white'
              : 'hover:bg-white/10 hover:text-blue-400 text-zinc-300'
          }`}
        >
          <WindowsLogo size={18} className="group-hover:scale-105 transition-transform" />
        </button>

        {/* Cortana / Search Box */}
        <div
          onClick={() => {
            soundEngine.playClick();
            onToggleSearch();
          }}
          className={`hidden sm:flex items-center h-full px-3 w-64 bg-black/40 hover:bg-black/60 cursor-text transition-colors border-r border-zinc-800/80 ${
            isSearchOpen ? 'ring-1 ring-blue-500' : ''
          }`}
        >
          <Search size={15} className="text-zinc-400 mr-2 shrink-0" />
          <span className="text-xs text-zinc-400 truncate">Type here to search</span>
        </div>

        {/* Task View */}
        <button
          onClick={() => {
            soundEngine.playClick();
            // Can minimize/restore or cycle
          }}
          title="Task View"
          className="h-full px-3 hover:bg-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-colors border-r border-zinc-800/80"
        >
          <Layers size={16} />
        </button>

        {/* Pinned & Running Apps */}
        <div className="flex items-center h-full px-1 gap-0.5 overflow-x-auto">
          {taskbarAppIds.map((appId) => {
            const appWindows = windows.filter((w) => w.appId === appId);
            const isRunning = appWindows.length > 0;
            const hasActiveWindow = appWindows.some((w) => w.id === activeWindowId && !w.isMinimized);

            return (
              <div
                key={appId}
                onMouseEnter={() => setHoveredAppId(appId)}
                onMouseLeave={() => setHoveredAppId(null)}
                className="relative h-full"
              >
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    if (!isRunning) {
                      onAppClick(appId);
                    } else if (appWindows.length === 1) {
                      onWindowClick(appWindows[0]);
                    } else {
                      // Cycle or focus next
                      const activeIdx = appWindows.findIndex((w) => w.id === activeWindowId);
                      const next = appWindows[(activeIdx + 1) % appWindows.length];
                      onWindowClick(next);
                    }
                  }}
                  title={APP_REGISTRY[appId]?.name}
                  className={`h-full w-11 flex flex-col items-center justify-center transition-colors relative group ${
                    hasActiveWindow
                      ? 'bg-white/20'
                      : isRunning
                      ? 'hover:bg-white/15'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <AppIcon appId={appId} size={20} className="group-hover:scale-110 transition-transform" />

                  {/* Active / Running underline indicator */}
                  {isRunning && (
                    <div
                      className={`absolute bottom-0 h-0.5 rounded-full transition-all ${
                        hasActiveWindow
                          ? 'w-6 bg-blue-400'
                          : 'w-2 bg-zinc-400 group-hover:w-4'
                      }`}
                      style={hasActiveWindow && accentColor ? { backgroundColor: accentColor } : undefined}
                    />
                  )}
                </button>

                {/* Hover Preview Tooltip */}
                {hoveredAppId === appId && isRunning && (
                  <div className="absolute bottom-[48px] left-1/2 -translate-x-1/2 bg-[#1f1f1f]/95 backdrop-blur-md border border-zinc-700 text-white rounded p-2 text-xs shadow-xl pointer-events-none z-50 whitespace-nowrap min-w-32">
                    <div className="font-semibold text-zinc-200">
                      {APP_REGISTRY[appId]?.name}
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate max-w-48">
                      {appWindows[0]?.title}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Zone: System Tray + Clock + Notifications + Peek Desktop */}
      <div className="flex items-center h-full">
        {/* Hidden Icons Chevron */}
        <button
          onClick={() => soundEngine.playClick()}
          title="Show hidden icons"
          className="h-full px-2 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <ChevronUp size={14} />
        </button>

        {/* Battery Indicator */}
        <div
          title="Battery status: 100% available (plugged in)"
          className="h-full px-2 hover:bg-white/10 text-zinc-300 flex items-center justify-center cursor-default"
        >
          <BatteryCharging size={16} className="text-emerald-400" />
        </div>

        {/* Wi-Fi Icon */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onToggleWifi();
          }}
          title={wifiConnected ? 'Internet access' : 'Not connected'}
          className={`h-full px-2 transition-colors ${
            isWifiOpen ? 'bg-white/20' : 'hover:bg-white/10 text-zinc-300 hover:text-white'
          }`}
        >
          <Wifi size={16} className={wifiConnected ? 'text-zinc-200' : 'text-zinc-500'} />
        </button>

        {/* Volume Icon */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onToggleVolume();
          }}
          title={`Speakers: ${muted ? 'Muted' : `${volume}%`}`}
          className={`h-full px-2 transition-colors ${
            isVolumeOpen ? 'bg-white/20' : 'hover:bg-white/10 text-zinc-300 hover:text-white'
          }`}
        >
          {muted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        {/* Date and Time */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onToggleCalendar();
          }}
          title={`${date} \n${time}`}
          className={`h-full px-2.5 flex flex-col justify-center items-end text-right transition-colors ${
            isCalendarOpen ? 'bg-white/20' : 'hover:bg-white/10'
          }`}
        >
          <span className="text-[11px] font-mono leading-tight">{time}</span>
          <span className="text-[10px] text-zinc-400 font-mono leading-tight">{date}</span>
        </button>

        {/* Action Center Icon */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onToggleActionCenter();
          }}
          title={`${unreadCount} new notifications`}
          className={`h-full px-3 relative transition-colors ${
            isActionCenterOpen ? 'bg-white/20' : 'hover:bg-white/10 text-zinc-300 hover:text-white'
          }`}
        >
          <MessageSquare size={16} />
          {unreadCount > 0 && (
            <span className="absolute bottom-1.5 right-1.5 bg-blue-600 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Peek at Desktop (Aero Peek) Bar */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onPeekDesktop();
          }}
          title="Show desktop"
          className="h-full w-2 border-l border-zinc-700/80 hover:bg-white/30 transition-colors shrink-0"
        />
      </div>
    </footer>
  );
};
