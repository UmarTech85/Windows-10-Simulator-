import React, { useState } from 'react';
import {
  Monitor,
  Palette,
  ShieldCheck,
  HardDrive,
  Volume2,
  Moon,
  Sun,
  Check,
  RefreshCw,
  ArrowLeft,
  Search,
} from 'lucide-react';
import { SystemSettings } from '../../types/os';
import { soundEngine } from '../../utils/sound';

interface SettingsProps {
  settings: SystemSettings;
  onUpdateSettings: (newSettings: Partial<SystemSettings>) => void;
}

export const WALLPAPER_OPTIONS = [
  {
    id: 'hero',
    name: 'Windows 10 Hero (Default)',
    url: '/src/assets/images/win10_hero_wallpaper_1792832156235.jpg',
  },
  {
    id: 'nature',
    name: 'Moraine Alpine Lake Spotlight',
    url: '/src/assets/images/win10_nature_wallpaper_1792832156468.jpg',
  },
  {
    id: 'abstract',
    name: 'Dark Abstract Ribbon',
    url: '/src/assets/images/win10_abstract_wallpaper_1792832157031.jpg',
  },
];

export const ACCENT_COLORS = [
  { name: 'Windows Blue', value: '#0078d7' },
  { name: 'Emerald', value: '#107c41' },
  { name: 'Crimson', value: '#e81123' },
  { name: 'Royal Purple', value: '#744da9' },
  { name: 'Sunset Orange', value: '#d83b01' },
  { name: 'Modern Charcoal', value: '#2d3748' },
];

export const Settings: React.FC<SettingsProps> = ({ settings, onUpdateSettings }) => {
  const [activePage, setActivePage] = useState<'home' | 'personalization' | 'system' | 'update'>('home');
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [lastChecked, setLastChecked] = useState('Just now');

  const handleCheckUpdates = () => {
    soundEngine.playClick();
    setIsCheckingUpdate(true);
    setTimeout(() => {
      setIsCheckingUpdate(false);
      setLastChecked('Just now');
      soundEngine.playNotification();
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#f3f3f3] text-zinc-900 select-none font-sans overflow-hidden">
      {/* Top Search & Nav Header */}
      <div className="px-6 py-4 bg-white border-b border-zinc-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {activePage !== 'home' && (
            <button
              onClick={() => {
                setActivePage('home');
                soundEngine.playClick();
              }}
              className="p-1 rounded-full hover:bg-zinc-100 text-zinc-600 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <h1 className="text-xl font-light text-zinc-900">
            {activePage === 'home'
              ? 'Windows Settings'
              : activePage.charAt(0).toUpperCase() + activePage.slice(1)}
          </h1>
        </div>

        <div className="relative w-64">
          <input
            type="text"
            placeholder="Find a setting"
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-zinc-100 border border-zinc-300 rounded focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
          />
          <Search size={14} className="absolute left-2.5 top-2.5 text-zinc-400" />
        </div>
      </div>

      {/* Main Settings Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* HOMEPAGE VIEW */}
        {activePage === 'home' && (
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* System */}
              <button
                onClick={() => {
                  setActivePage('system');
                  soundEngine.playClick();
                }}
                className="flex items-start gap-4 p-4 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg text-left transition-shadow hover:shadow-xs group cursor-pointer"
              >
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-105 transition-transform">
                  <Monitor size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-zinc-900">System</h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Display, sound, notifications, power
                  </p>
                </div>
              </button>

              {/* Personalization */}
              <button
                onClick={() => {
                  setActivePage('personalization');
                  soundEngine.playClick();
                }}
                className="flex items-start gap-4 p-4 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg text-left transition-shadow hover:shadow-xs group cursor-pointer"
              >
                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg group-hover:scale-105 transition-transform">
                  <Palette size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-zinc-900">Personalization</h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Background, colors, lock screen, themes
                  </p>
                </div>
              </button>

              {/* Update & Security */}
              <button
                onClick={() => {
                  setActivePage('update');
                  soundEngine.playClick();
                }}
                className="flex items-start gap-4 p-4 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg text-left transition-shadow hover:shadow-xs group cursor-pointer"
              >
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg group-hover:scale-105 transition-transform">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-zinc-900">Update & Security</h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Windows Update, recovery, backup
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* PERSONALIZATION PAGE */}
        {activePage === 'personalization' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white p-5 rounded-lg border border-zinc-200">
              <h2 className="font-semibold text-sm text-zinc-900 mb-3">Background Wallpaper</h2>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {WALLPAPER_OPTIONS.map((wp) => (
                  <button
                    key={wp.id}
                    onClick={() => {
                      onUpdateSettings({ wallpaper: wp.url });
                      soundEngine.playClick();
                    }}
                    className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                      settings.wallpaper === wp.url ? 'border-blue-600 ring-2 ring-blue-400' : 'border-zinc-200'
                    }`}
                  >
                    <img
                      src={wp.url}
                      alt={wp.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-24 object-cover"
                    />
                    <div className="p-1.5 text-[11px] font-medium text-center truncate bg-white/90">
                      {wp.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-lg border border-zinc-200">
              <h2 className="font-semibold text-sm text-zinc-900 mb-3">Windows Accent Color</h2>
              <div className="flex flex-wrap gap-3">
                {ACCENT_COLORS.map((col) => (
                  <button
                    key={col.value}
                    onClick={() => {
                      onUpdateSettings({ accentColor: col.value });
                      soundEngine.playClick();
                    }}
                    style={{ backgroundColor: col.value }}
                    className={`w-9 h-9 rounded-md flex items-center justify-center text-white transition-transform ${
                      settings.accentColor === col.value ? 'scale-110 shadow-md ring-2 ring-black' : 'hover:scale-105'
                    }`}
                    title={col.name}
                  >
                    {settings.accentColor === col.value && <Check size={16} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-lg border border-zinc-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-zinc-900">Color Mode</h3>
                <p className="text-xs text-zinc-500">Choose between dark or light system surfaces</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onUpdateSettings({ theme: 'light' });
                    soundEngine.playClick();
                  }}
                  className={`px-3 py-1.5 text-xs rounded flex items-center gap-1.5 ${
                    settings.theme === 'light' ? 'bg-zinc-800 text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
                  }`}
                >
                  <Sun size={14} />
                  <span>Light</span>
                </button>
                <button
                  onClick={() => {
                    onUpdateSettings({ theme: 'dark' });
                    soundEngine.playClick();
                  }}
                  className={`px-3 py-1.5 text-xs rounded flex items-center gap-1.5 ${
                    settings.theme === 'dark' ? 'bg-zinc-800 text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
                  }`}
                >
                  <Moon size={14} />
                  <span>Dark</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SYSTEM PAGE */}
        {activePage === 'system' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Night Light Toggle */}
            <div className="bg-white p-5 rounded-lg border border-zinc-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-zinc-900">Night Light</h3>
                <p className="text-xs text-zinc-500">
                  Reduces blue light at night to help you sleep
                </p>
              </div>
              <button
                onClick={() => {
                  onUpdateSettings({ nightLight: !settings.nightLight });
                  soundEngine.playClick();
                }}
                className={`w-12 h-6 rounded-full transition-colors p-0.5 relative ${
                  settings.nightLight ? 'bg-blue-600' : 'bg-zinc-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.nightLight ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Sound & Effects Toggle */}
            <div className="bg-white p-5 rounded-lg border border-zinc-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-zinc-900">System Sound Effects</h3>
                <p className="text-xs text-zinc-500">
                  Play synthetic chimes for startup, notifications, and clicks
                </p>
              </div>
              <button
                onClick={() => {
                  const next = !settings.soundEffects;
                  onUpdateSettings({ soundEffects: next });
                  soundEngine.enabled = next;
                  if (next) soundEngine.playClick();
                }}
                className={`w-12 h-6 rounded-full transition-colors p-0.5 relative ${
                  settings.soundEffects ? 'bg-blue-600' : 'bg-zinc-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.soundEffects ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Display Specs */}
            <div className="bg-white p-5 rounded-lg border border-zinc-200">
              <h3 className="font-semibold text-sm text-zinc-900 mb-2">Display Specification</h3>
              <div className="space-y-1 text-xs text-zinc-600">
                <div>Resolution: <strong>1920 x 1080 (Recommended)</strong></div>
                <div>Scale: <strong>100%</strong></div>
                <div>Refresh rate: <strong>60.000 Hz</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* UPDATE & SECURITY PAGE */}
        {activePage === 'update' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-lg border border-zinc-200 text-left">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Check size={22} />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-zinc-900">You're up to date</h3>
                  <p className="text-xs text-zinc-500">Last checked: {lastChecked}</p>
                </div>
              </div>

              <button
                onClick={handleCheckUpdates}
                disabled={isCheckingUpdate}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-xs font-medium flex items-center gap-2 shadow-xs transition-colors"
              >
                <RefreshCw size={14} className={isCheckingUpdate ? 'animate-spin' : ''} />
                <span>{isCheckingUpdate ? 'Checking for updates...' : 'Check for updates'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
