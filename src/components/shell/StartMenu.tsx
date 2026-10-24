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
      className="fixed bottom-[44px] left-0 w-full sm:w-[640px] md:w-[720px] h-[540px] bg-[#1f1f1f]/95 backdrop-blur-2xl text-white border-t border-r border-zinc-700/60 shadow-2xl z-50 flex font-sans select-none animate-slideUp overflow-hidden"
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
      <div className="w-56 sm:w-60 bg-black/10 overflow-y-auto py-3 px-2 flex flex-col gap-1 border-r border-zinc-800/80 text-xs shrink-0">
        <div className="px-3 py-1 font-semibold text-zinc-400 uppercase text-[11px] tracking-wider">
          All apps
        </div>
        {appsList.map((app) => (
          <button
            key={app.id}
            onClick={() => handleAppClick(app.id)}
            className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-xs transition-colors text-left group"
          >
            <div className="group-hover:scale-110 transition-transform">
              <AppIcon appId={app.id} size={20} />
            </div>
            <span className="truncate text-zinc-200 group-hover:text-white">
              {app.name}
            </span>
          </button>
        ))}
      </div>

      {/* 3. Right Column: Windows 10 Live Tiles Matrix */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        {/* Group 1: Life at a glance */}
        <div>
          <div className="text-xs font-semibold text-zinc-400 mb-2.5">
            Life at a glance
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {/* Live Flipping Weather Tile (Wide) */}
            <div
              onClick={() => handleAppClick('edge')}
              className="col-span-2 h-24 bg-gradient-to-br from-blue-600 to-sky-700 p-3 rounded-xs cursor-pointer relative overflow-hidden transition-transform hover:scale-[1.02] shadow-sm"
            >
              <div className="h-full flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">New York</span>
                  <CloudSun size={20} className="text-yellow-300" />
                </div>
                <div>
                  <div className="text-2xl font-light font-mono">72°F</div>
                  <div className="text-[11px] text-blue-100">Partly Sunny · High 76°</div>
                </div>
              </div>
              <span className="absolute bottom-1 right-2 text-[10px] text-blue-200">Weather</span>
            </div>

            {/* Edge Tile */}
            <div
              onClick={() => handleAppClick('edge')}
              className="h-24 bg-blue-600 p-2.5 rounded-xs cursor-pointer flex flex-col justify-between hover:scale-[1.02] transition-transform shadow-sm"
            >
              <AppIcon appId="edge" size={28} />
              <span className="text-xs font-medium">Microsoft Edge</span>
            </div>

            {/* Photos Live Tile */}
            <div
              onClick={() => handleAppClick('photos')}
              className="h-24 bg-cyan-700 p-2.5 rounded-xs cursor-pointer flex flex-col justify-between hover:scale-[1.02] transition-transform shadow-sm relative overflow-hidden"
            >
              <AppIcon appId="photos" size={28} />
              <span className="text-xs font-medium">Photos</span>
            </div>

            {/* Calculator Tile */}
            <div
              onClick={() => handleAppClick('calc')}
              className="h-24 bg-slate-700 p-2.5 rounded-xs cursor-pointer flex flex-col justify-between hover:scale-[1.02] transition-transform shadow-sm"
            >
              <AppIcon appId="calc" size={28} />
              <span className="text-xs font-medium">Calculator</span>
            </div>

            {/* File Explorer Tile */}
            <div
              onClick={() => handleAppClick('explorer')}
              className="h-24 bg-amber-600 p-2.5 rounded-xs cursor-pointer flex flex-col justify-between hover:scale-[1.02] transition-transform shadow-sm"
            >
              <AppIcon appId="explorer" size={28} />
              <span className="text-xs font-medium">Explorer</span>
            </div>

            {/* Notepad Tile */}
            <div
              onClick={() => handleAppClick('notepad')}
              className="h-24 bg-sky-700 p-2.5 rounded-xs cursor-pointer flex flex-col justify-between hover:scale-[1.02] transition-transform shadow-sm"
            >
              <AppIcon appId="notepad" size={28} />
              <span className="text-xs font-medium">Notepad</span>
            </div>

            {/* Settings Tile */}
            <div
              onClick={() => handleAppClick('settings')}
              className="h-24 bg-blue-700 p-2.5 rounded-xs cursor-pointer flex flex-col justify-between hover:scale-[1.02] transition-transform shadow-sm"
            >
              <AppIcon appId="settings" size={28} />
              <span className="text-xs font-medium">Settings</span>
            </div>
          </div>
        </div>

        {/* Group 2: Play and explore */}
        <div>
          <div className="text-xs font-semibold text-zinc-400 mb-2.5">
            Play and explore
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {/* Groove Music Tile (Wide) */}
            <div
              onClick={() => handleAppClick('groove')}
              className="col-span-2 h-24 bg-gradient-to-br from-indigo-700 to-purple-800 p-3 rounded-xs cursor-pointer flex flex-col justify-between hover:scale-[1.02] transition-transform shadow-sm"
            >
              <div className="flex items-center justify-between">
                <AppIcon appId="groove" size={26} />
                <span className="text-[10px] text-indigo-200">
                  {musicNowPlaying?.isPlaying ? 'Now Playing' : 'Groove Music'}
                </span>
              </div>
              <div>
                <div className="text-xs font-semibold truncate">
                  {musicNowPlaying?.title || 'Lofi Chill Sunset Chords'}
                </div>
                <div className="text-[10px] text-zinc-300">
                  {musicNowPlaying?.artist || 'Groove Virtual Synth'}
                </div>
              </div>
            </div>

            {/* Minesweeper Tile */}
            <div
              onClick={() => handleAppClick('minesweeper')}
              className="h-24 bg-emerald-700 p-2.5 rounded-xs cursor-pointer flex flex-col justify-between hover:scale-[1.02] transition-transform shadow-sm"
            >
              <AppIcon appId="minesweeper" size={28} />
              <span className="text-xs font-medium">Minesweeper</span>
            </div>

            {/* Paint Tile */}
            <div
              onClick={() => handleAppClick('paint')}
              className="h-24 bg-rose-700 p-2.5 rounded-xs cursor-pointer flex flex-col justify-between hover:scale-[1.02] transition-transform shadow-sm"
            >
              <AppIcon appId="paint" size={28} />
              <span className="text-xs font-medium">Paint</span>
            </div>

            {/* Command Prompt */}
            <div
              onClick={() => handleAppClick('cmd')}
              className="h-24 bg-zinc-900 border border-zinc-700 p-2.5 rounded-xs cursor-pointer flex flex-col justify-between hover:scale-[1.02] transition-transform shadow-sm"
            >
              <AppIcon appId="cmd" size={28} />
              <span className="text-xs font-medium font-mono text-green-400">Terminal</span>
            </div>

            {/* Task Manager */}
            <div
              onClick={() => handleAppClick('taskmanager')}
              className="h-24 bg-teal-800 p-2.5 rounded-xs cursor-pointer flex flex-col justify-between hover:scale-[1.02] transition-transform shadow-sm"
            >
              <AppIcon appId="taskmanager" size={28} />
              <span className="text-xs font-medium">Task Manager</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
