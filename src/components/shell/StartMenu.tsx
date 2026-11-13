import React, { useState, useEffect } from 'react';
import {
  Menu,
  User,
  Folder,
  Image as ImageIcon,
  Settings,
  Power,
  Sun,
  CloudSun,
  Newspaper,
  Compass,
} from 'lucide-react';
import { AppId, FileItem } from '../../types/os';
import { APP_REGISTRY, AppDefinition } from '../../utils/appRegistry';
import { AppIcon } from '../common/AppIcon';
import { soundEngine } from '../../utils/sound';

interface StartMenuProps {
  onLaunchApp: (appId: AppId) => void;
  onOpenFolder: (loc: FileItem['location']) => void;
  onPowerAction: (action: 'shutdown' | 'restart' | 'sleep' | 'lock') => void;
  onClose: () => void;
  musicNowPlaying?: { title: string; artist: string; isPlaying: boolean };
}

export const StartMenu: React.FC<StartMenuProps> = ({
  onLaunchApp,
  onOpenFolder,
  onPowerAction,
  onClose,
  musicNowPlaying,
}) => {
  const [isRailExpanded, setIsRailExpanded] = useState(false);
  const [showPowerMenu, setShowPowerMenu] = useState(false);
  const [tileFlipState, setTileFlipState] = useState(false);

  // Periodic tile flipping animation
  useEffect(() => {
    const timer = setInterval(() => {
      setTileFlipState((prev) => !prev);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const appsList = Object.values(APP_REGISTRY).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const handleAppClick = (appId: AppId) => {
    soundEngine.playClick();
    onLaunchApp(appId);
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setShowPowerMenu(false);
      }}
      className="fixed bottom-[40px] left-0 w-full sm:w-[640px] md:w-[720px] h-[550px] bg-[#181818]/94 backdrop-blur-3xl text-white border-t border-r border-white/15 shadow-2xl z-50 flex font-sans select-none animate-slideUp overflow-hidden"
    >
      {/* 1. Left Narrow Action Rail */}
      <div
        className={`bg-black/30 flex flex-col justify-between py-2 border-r border-zinc-800 transition-all duration-200 z-20 ${
          isRailExpanded ? 'w-48' : 'w-12'
        }`}
      >
        <div className="flex flex-col gap-1">
          <button
            onClick={() => {
              setIsRailExpanded(!isRailExpanded);
              soundEngine.playClick();
            }}
            title="START"
            className="flex items-center gap-4 px-3.5 py-2 hover:bg-white/10 rounded-xs transition-colors text-left"
          >
            <Menu size={17} className="shrink-0" />
            {isRailExpanded && <span className="text-xs font-semibold">START</span>}
          </button>
        </div>

        <div className="flex flex-col gap-1 relative">
          {/* User Profile */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onPowerAction('lock');
              onClose();
            }}
            title="User Profile"
            className="flex items-center gap-4 px-3.5 py-2 hover:bg-white/10 rounded-xs transition-colors text-left"
          >
            <User size={17} className="shrink-0 text-blue-400" />
            {isRailExpanded && <span className="text-xs truncate">User</span>}
          </button>

          {/* Documents */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenFolder('documents');
              onClose();
            }}
            title="Documents"
            className="flex items-center gap-4 px-3.5 py-2 hover:bg-white/10 rounded-xs transition-colors text-left"
          >
            <Folder size={17} className="shrink-0 text-amber-400" />
            {isRailExpanded && <span className="text-xs truncate">Documents</span>}
          </button>

          {/* Pictures */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenFolder('pictures');
              onClose();
            }}
            title="Pictures"
            className="flex items-center gap-4 px-3.5 py-2 hover:bg-white/10 rounded-xs transition-colors text-left"
          >
            <ImageIcon size={17} className="shrink-0 text-teal-400" />
            {isRailExpanded && <span className="text-xs truncate">Pictures</span>}
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              handleAppClick('settings');
            }}
            title="Settings"
            className="flex items-center gap-4 px-3.5 py-2 hover:bg-white/10 rounded-xs transition-colors text-left"
          >
            <Settings size={17} className="shrink-0 text-zinc-300" />
            {isRailExpanded && <span className="text-xs truncate">Settings</span>}
          </button>

          {/* Power Button */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPowerMenu(!showPowerMenu);
                soundEngine.playClick();
              }}
              title="Power"
              className="w-full flex items-center gap-4 px-3.5 py-2 hover:bg-white/10 rounded-xs transition-colors text-left"
            >
              <Power size={17} className="shrink-0 text-red-400" />
              {isRailExpanded && <span className="text-xs truncate">Power</span>}
            </button>

            {/* Power Menu Popover */}
            {showPowerMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-full left-12 mb-1 w-44 bg-zinc-800 border border-zinc-700 shadow-xl rounded-sm py-1 z-50 text-xs"
              >
                <button
                  onClick={() => {
                    onPowerAction('sleep');
                    onClose();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-blue-600 transition-colors"
                >
                  Sleep
                </button>
                <button
                  onClick={() => {
                    onPowerAction('shutdown');
                    onClose();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-blue-600 transition-colors"
                >
                  Shut down
                </button>
                <button
                  onClick={() => {
                    onPowerAction('restart');
                    onClose();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-blue-600 transition-colors"
                >
                  Restart
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Middle Column: Alphabetical All Apps List */}
      <div className="w-56 sm:w-60 bg-black/15 overflow-y-auto py-3 px-2 flex flex-col gap-1 border-r border-white/5 text-xs shrink-0 scrollbar-thin">
        <div className="px-3 py-1 font-semibold text-zinc-400 uppercase text-[10px] tracking-wider">
          All apps
        </div>
        {appsList.map((app, idx) => {
          const firstLetter = app.name[0].toUpperCase();
          const prevFirstLetter = idx > 0 ? appsList[idx - 1].name[0].toUpperCase() : null;
          const showHeader = firstLetter !== prevFirstLetter;

          return (
            <React.Fragment key={app.id}>
              {showHeader && (
                <div className="px-3 pt-2 pb-0.5 text-[11px] font-bold text-[#0078d7] uppercase">
                  {firstLetter}
                </div>
              )}
              <button
                onClick={() => handleAppClick(app.id)}
                className="flex items-center gap-3 px-3 py-1.5 hover:bg-white/10 rounded-xs transition-colors text-left group"
              >
                <div className="group-hover:scale-110 transition-transform">
                  <AppIcon appId={app.id} size={18} />
                </div>
                <span className="truncate text-zinc-200 group-hover:text-white">
                  {app.name}
                </span>
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* 3. Right Column: Windows 10 Live Tiles Matrix */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 scrollbar-thin">
        {/* Group 1: Life at a glance */}
        <div>
          <div className="text-xs font-semibold text-zinc-400 mb-2">
            Life at a glance
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {/* Live Flipping Weather Tile (Wide) */}
            <div
              onClick={() => handleAppClick('edge')}
              className="col-span-2 h-24 bg-gradient-to-br from-[#005a9e] to-[#0078d7] p-3 rounded-xs cursor-pointer relative overflow-hidden transition-transform hover:scale-[1.01] shadow-sm group"
            >
              <div className="h-full flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">New York</span>
                  <CloudSun size={20} className="text-yellow-300 group-hover:rotate-12 transition-transform" />
                </div>
                <div>
                  <div className="text-2xl font-light font-mono">72°F</div>
                  <div className="text-[11px] text-blue-100">Partly Sunny · High 76° · Low 62°</div>
                </div>
              </div>
              <span className="absolute bottom-1 right-2 text-[10px] text-blue-200/80">Weather</span>
            </div>

            {/* Google Services Live Tile (Wide) */}
            <div
              onClick={() => handleAppClick('edge')}
              className="col-span-2 h-24 bg-gradient-to-r from-red-600 via-amber-500 to-blue-600 p-2.5 rounded-xs cursor-pointer flex flex-col justify-between hover:scale-[1.01] transition-transform shadow-sm relative overflow-hidden group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-black text-[11px] font-bold shadow-xs">
                    G
                  </span>
                  <span className="text-xs font-semibold text-white drop-shadow">Google Suite</span>
                </div>
                <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded text-white/90">
                  YouTube · Gmail · Maps
                </span>
              </div>
              <div className="text-[11px] text-white/90 drop-shadow line-clamp-1">
                Access YouTube, Drive & Gemini in Microsoft Edge
              </div>
              <span className="text-[9px] text-white/80">Click to launch Google Hub</span>
            </div>

            {/* Edge Tile */}
            <div
              onClick={() => handleAppClick('edge')}
              className="h-24 bg-[#0078d7] p-2.5 rounded-xs cursor-pointer flex flex-col justify-between hover:scale-[1.01] transition-transform shadow-sm"
            >
              <AppIcon appId="edge" size={26} />
              <span className="text-xs font-medium">Microsoft Edge</span>
            </div>

            {/* Photos Live Tile */}
            <div
              onClick={() => handleAppClick('photos')}
              className="h-24 bg-[#008272] p-2.5 rounded-xs cursor-pointer flex flex-col justify-between hover:scale-[1.01] transition-transform shadow-sm relative overflow-hidden"
            >
              <AppIcon appId="photos" size={26} />
              <span className="text-xs font-medium">Photos</span>
            </div>

            {/* Calculator Tile */}
            <div
              onClick={() => handleAppClick('calc')}
              className="h-24 bg-[#4a5568] p-2.5 rounded-xs cursor-pointer flex flex-col justify-between hover:scale-[1.01] transition-transform shadow-sm"
            >
              <AppIcon appId="calc" size={26} />
              <span className="text-xs font-medium">Calculator</span>
            </div>

            {/* File Explorer Tile */}
            <div
              onClick={() => handleAppClick('explorer')}
              className="h-24 bg-[#ca5010] p-2.5 rounded-xs cursor-pointer flex flex-col justify-between hover:scale-[1.01] transition-transform shadow-sm"
            >
              <AppIcon appId="explorer" size={26} />
              <span className="text-xs font-medium">Explorer</span>
            </div>
          </div>
        </div>

        {/* Group 2: Play and explore */}
        <div>
          <div className="text-xs font-semibold text-zinc-400 mb-2">
            Play and explore
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {/* Groove Music Tile (Wide) with animated visualizer */}
            <div
              onClick={() => handleAppClick('groove')}
              className="col-span-2 h-24 bg-gradient-to-br from-[#4f2d7f] to-[#744da9] p-3 rounded-xs cursor-pointer flex flex-col justify-between hover:scale-[1.01] transition-transform shadow-sm relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AppIcon appId="groove" size={24} />
                  <span className="text-xs font-semibold">Groove Music</span>
                </div>
                {/* Audio visualizer bars animation */}
                <div className="flex items-end gap-1 h-4">
                  <span className="w-1 bg-white/80 rounded-xs animate-bounce h-3" />
                  <span className="w-1 bg-white/90 rounded-xs animate-pulse h-4" />
                  <span className="w-1 bg-white/70 rounded-xs animate-bounce h-2" />
                  <span className="w-1 bg-white/90 rounded-xs animate-pulse h-3.5" />
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold truncate text-white">
                  {musicNowPlaying?.title || 'Lofi Chill Sunset Chords'}
                </div>
                <div className="text-[10px] text-purple-200">
                  {musicNowPlaying?.artist || 'Groove Virtual Synth'}
                </div>
              </div>
            </div>

            {/* Minesweeper Tile */}
            <div
              onClick={() => handleAppClick('minesweeper')}
              className="h-24 bg-[#107c41] p-2.5 rounded-xs cursor-pointer flex flex-col justify-between hover:scale-[1.01] transition-transform shadow-sm"
            >
              <AppIcon appId="minesweeper" size={26} />
              <span className="text-xs font-medium">Minesweeper</span>
            </div>

            {/* Paint Tile */}
            <div
              onClick={() => handleAppClick('paint')}
              className="h-24 bg-[#d13438] p-2.5 rounded-xs cursor-pointer flex flex-col justify-between hover:scale-[1.01] transition-transform shadow-sm"
            >
              <AppIcon appId="paint" size={26} />
              <span className="text-xs font-medium">Paint</span>
            </div>

            {/* Command Prompt */}
            <div
              onClick={() => handleAppClick('cmd')}
              className="h-24 bg-black/80 border border-zinc-700 p-2.5 rounded-xs cursor-pointer flex flex-col justify-between hover:scale-[1.01] transition-transform shadow-sm"
            >
              <AppIcon appId="cmd" size={26} />
              <span className="text-xs font-medium font-mono text-emerald-400">Terminal</span>
            </div>

            {/* Settings */}
            <div
              onClick={() => handleAppClick('settings')}
              className="h-24 bg-[#0078d7] p-2.5 rounded-xs cursor-pointer flex flex-col justify-between hover:scale-[1.01] transition-transform shadow-sm"
            >
              <AppIcon appId="settings" size={26} />
              <span className="text-xs font-medium">Settings</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
