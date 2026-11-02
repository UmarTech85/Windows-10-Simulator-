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
  ShieldCheck,
  X,
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
  onCloseWindow?: (id: string) => void;
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
  onCloseWindow,
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
      className="fixed bottom-0 left-0 right-0 h-[40px] bg-[#0c0c0c]/85 backdrop-blur-2xl border-t border-white/10 text-white z-40 flex items-center justify-between font-sans select-none shadow-[0_-2px_10px_rgba(0,0,0,0.5)]"
    >
      {/* Left Zone: Start Button + Search Bar + Task View */}
      <div className="flex items-center h-full">
        {/* Windows Start Button with authentic Windows 10 glow */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onToggleStart();
          }}
          title="Start"
          className={`h-full w-12 flex items-center justify-center transition-colors group relative ${
            isStartOpen
              ? 'bg-[#0078d7] text-white shadow-inner'
              : 'hover:bg-white/10 text-zinc-300 hover:text-[#0078d7]'
          }`}
          style={isStartOpen && accentColor ? { backgroundColor: accentColor } : undefined}
        >
          <WindowsLogo size={17} className="group-hover:scale-105 transition-transform drop-shadow" />
        </button>

        {/* Cortana / Search Box */}
        <div
          onClick={() => {
            soundEngine.playClick();
            onToggleSearch();
          }}
          className={`hidden sm:flex items-center h-full px-3 w-60 bg-black/40 hover:bg-black/60 cursor-text transition-colors border-r border-white/5 ${
            isSearchOpen ? 'ring-1 ring-[#0078d7] bg-black/70' : ''
          }`}
        >
          <Search size={14} className="text-zinc-400 mr-2 shrink-0" />
          <span className="text-xs text-zinc-400 truncate">Type here to search</span>
        </div>

        {/* Task View button */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onPeekDesktop();
          }}
          title="Task View"
          className="h-full px-3 hover:bg-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-colors border-r border-white/5"
        >
          <Layers size={15} />
        </button>

        {/* Pinned & Running Apps */}
        <div className="flex items-center h-full px-1 gap-0.5 overflow-x-auto scrollbar-none">
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
                      const activeIdx = appWindows.findIndex((w) => w.id === activeWindowId);
                      const next = appWindows[(activeIdx + 1) % appWindows.length];
                      onWindowClick(next);
                    }
                  }}
                  title={APP_REGISTRY[appId]?.name}
                  className={`h-full w-11 flex flex-col items-center justify-center transition-colors relative group ${
                    hasActiveWindow
                      ? 'bg-white/15'
                      : isRunning
                      ? 'hover:bg-white/10'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <AppIcon appId={appId} size={19} className="group-hover:scale-105 transition-transform" />

                  {/* Active / Running underline indicator */}
                  {isRunning && (
                    <div
                      className={`absolute bottom-0 h-0.5 transition-all duration-150 ${
                        hasActiveWindow
                          ? 'w-full bg-[#0078d7]'
                          : 'w-4 bg-zinc-400 group-hover:w-8 group-hover:bg-zinc-200'
                      }`}
                      style={hasActiveWindow && accentColor ? { backgroundColor: accentColor } : undefined}
                    />
                  )}
                </button>

                {/* Authentic Windows 10 Live Window Thumbnail Hover Preview */}
                {hoveredAppId === appId && isRunning && (
                  <div
                    onMouseEnter={() => setHoveredAppId(appId)}
                    onMouseLeave={() => setHoveredAppId(null)}
                    className="absolute bottom-[44px] left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-[#1b1b1b]/95 backdrop-blur-2xl border border-white/15 rounded-xs shadow-2xl z-50 pointer-events-auto animate-fadeIn"
                  >
                    {appWindows.map((win) => {
                      const isWinActive = win.id === activeWindowId && !win.isMinimized;
                      return (
                        <div
                          key={win.id}
                          onClick={() => {
                            soundEngine.playClick();
                            onWindowClick(win);
                          }}
                          className={`w-48 bg-[#242424] hover:bg-[#2e2e2e] border transition-all rounded-xs overflow-hidden cursor-pointer group/card flex flex-col ${
                            isWinActive ? 'border-[#0078d7] shadow-lg shadow-black/50' : 'border-white/10'
                          }`}
                        >
                          {/* Mini Window Titlebar */}
                          <div className="flex items-center justify-between px-2 py-1 bg-black/40 border-b border-white/5 text-[11px]">
                            <div className="flex items-center gap-1.5 truncate max-w-[140px]">
                              <AppIcon appId={appId} size={13} />
                              <span className="truncate font-medium text-zinc-200">{win.title}</span>
                            </div>
                            {onCloseWindow && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  soundEngine.playClick();
                                  onCloseWindow(win.id);
                                }}
                                title="Close window"
                                className="w-5 h-4 flex items-center justify-center hover:bg-[#e81123] text-zinc-400 hover:text-white rounded-xs transition-colors"
                              >
                                <X size={11} strokeWidth={2.2} />
                              </button>
                            )}
                          </div>

                          {/* Mini Preview Snapshot Representation */}
                          <div className="h-28 bg-[#181818] p-2 flex flex-col justify-center items-center text-zinc-400 group-hover/card:bg-[#202020] transition-colors relative overflow-hidden">
                            <div className="absolute inset-x-2 top-2 h-2 bg-white/5 rounded-xs" />
                            <div className="flex items-center gap-2">
                              <AppIcon appId={appId} size={28} className="drop-shadow-md opacity-80 group-hover/card:scale-110 transition-transform" />
                            </div>
                            <span className="text-[10px] text-zinc-400 mt-2 truncate max-w-full px-2 text-center">
                              {win.isMinimized ? '(Minimized)' : win.title}
                            </span>
                          </div>
                        </div>
                      );
                    })}
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

        {/* Windows Defender Shield Icon */}
        <div
          title="Windows Defender: PC status protected"
          className="h-full px-2 hover:bg-white/10 text-emerald-400 flex items-center justify-center cursor-default transition-colors relative"
        >
          <ShieldCheck size={15} />
          <span className="absolute top-2 right-1.5 w-1.5 h-1.5 bg-emerald-400 rounded-full ring-1 ring-black" />
        </div>

        {/* Battery Indicator */}
        <div
          title="Battery status: 100% fully charged (plugged in)"
          className="h-full px-2 hover:bg-white/10 text-zinc-300 flex items-center justify-center cursor-default transition-colors"
        >
          <BatteryCharging size={15} className="text-emerald-400" />
        </div>

        {/* Wi-Fi Icon */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onToggleWifi();
          }}
          title={wifiConnected ? 'Internet access: Connected' : 'Not connected'}
          className={`h-full px-2 transition-colors ${
            isWifiOpen ? 'bg-white/20' : 'hover:bg-white/10 text-zinc-300 hover:text-white'
          }`}
        >
          <Wifi size={15} className={wifiConnected ? 'text-zinc-200' : 'text-zinc-500'} />
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
          {muted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>

        {/* Date and Time (Segoe UI style) */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onToggleCalendar();
          }}
          title={`${date}\n${time}`}
          className={`h-full px-2.5 flex flex-col justify-center items-end text-right transition-colors ${
            isCalendarOpen ? 'bg-white/20' : 'hover:bg-white/10'
          }`}
        >
          <span className="text-[11px] leading-tight font-normal text-zinc-100">{time}</span>
          <span className="text-[10px] text-zinc-400 leading-tight">{date}</span>
        </button>

        {/* Action Center Icon with notification badge */}
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
          <MessageSquare size={15} />
          {unreadCount > 0 && (
            <span className="absolute bottom-1.5 right-1.5 bg-[#0078d7] text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold shadow-xs">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Aero Peek bar */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onPeekDesktop();
          }}
          title="Show desktop"
          className="h-full w-2.5 border-l border-white/15 hover:bg-white/30 transition-colors shrink-0"
        />
      </div>
    </footer>
  );
};

