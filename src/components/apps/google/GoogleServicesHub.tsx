import React from 'react';
import {
  GoogleGIcon,
  YouTubeIcon,
  GmailIcon,
  GoogleDriveIcon,
  GoogleMapsIcon,
  GoogleGeminiIcon,
  GoogleTranslateIcon,
  GoogleKeepIcon,
} from './GoogleIcons';
import { GOOGLE_SERVICES_CONFIG } from '../../../config/googleServices';
import { soundEngine } from '../../../utils/sound';

interface GoogleServicesHubProps {
  onNavigate: (view: any, url: string, title: string) => void;
  onOpenAppsWaffle: () => void;
}

export const GoogleServicesHub: React.FC<GoogleServicesHubProps> = ({
  onNavigate,
  onOpenAppsWaffle,
}) => {
  const services = [
    {
      id: 'youtube',
      name: 'YouTube',
      subtitle: 'Video Streaming & Channels',
      desc: 'Browse trending tech, DirectX 12 demos, gaming videos, and music with interactive player controls and comments.',
      icon: <YouTubeIcon className="w-10 h-10" />,
      url: 'https://www.youtube.com',
      view: 'youtube',
      color: 'border-red-500/30 hover:border-red-500',
      badge: 'Popular',
    },
    {
      id: 'gmail',
      name: 'Gmail',
      subtitle: 'Secure Webmail Inbox',
      desc: 'Read developer announcements, compose new messages, organize inbox folders, and manage communications.',
      icon: <GmailIcon className="w-9 h-9" />,
      url: 'https://mail.google.com',
      view: 'gmail',
      color: 'border-red-400/30 hover:border-red-400',
      badge: '3 Unread',
    },
    {
      id: 'drive',
      name: 'Google Drive',
      subtitle: 'Cloud Storage & Sync',
      desc: 'Storage powered by Firebase Cloud Storage. Store project snapshots, wallpapers, and documents with instant downloading.',
      icon: <GoogleDriveIcon className="w-9 h-9" />,
      url: 'https://drive.google.com',
      view: 'drive',
      color: 'border-amber-400/30 hover:border-amber-400',
      badge: '1.42 GB Used',
    },
    {
      id: 'maps',
      name: 'Google Maps',
      subtitle: 'World Explorer & Navigation',
      desc: 'Interactive map viewer with satellite imagery, landmarks (Googleplex, Redmond campus, Times Square), and ETA routes.',
      icon: <GoogleMapsIcon className="w-9 h-9" />,
      url: 'https://maps.google.com',
      view: 'maps',
      color: 'border-emerald-500/30 hover:border-emerald-500',
      badge: 'Interactive',
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      subtitle: 'AI Conversational Assistant',
      desc: 'Ask technical questions about DirectX 12 architecture, generate code automation scripts, and get writing assistance.',
      icon: <GoogleGeminiIcon className="w-9 h-9" />,
      url: 'https://gemini.google.com',
      view: 'gemini',
      color: 'border-blue-500/30 hover:border-blue-500',
      badge: '2.5 Pro',
    },
    {
      id: 'search',
      name: 'Google Search',
      subtitle: 'Web, Images, News & Videos',
      desc: 'World leading search engine with voice search, image analysis, knowledge graph cards, and accordion answers.',
      icon: <GoogleGIcon className="w-9 h-9" />,
      url: 'https://www.google.com',
      view: 'google',
      color: 'border-blue-400/30 hover:border-blue-400',
    },
    {
      id: 'translate',
      name: 'Google Translate',
      subtitle: 'Neural Machine Translation',
      desc: 'Translate words and sentences across 10+ languages with built-in voice playback and instant copy.',
      icon: <GoogleTranslateIcon className="w-9 h-9" />,
      url: 'https://translate.google.com',
      view: 'translate',
      color: 'border-sky-400/30 hover:border-sky-400',
    },
    {
      id: 'keep',
      name: 'Google Keep',
      subtitle: 'Notes & Productivity',
      desc: 'Color-coded sticky notes, checklists, and project scratchpads saved directly in memory.',
      icon: <GoogleKeepIcon className="w-9 h-9" />,
      url: 'https://keep.google.com',
      view: 'keep',
      color: 'border-amber-500/30 hover:border-amber-500',
    },
  ];

  return (
    <div className="min-h-full flex flex-col bg-[#f8f9fa] dark:bg-[#18191a] text-zinc-800 dark:text-zinc-200 font-sans select-none pb-16">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-700 text-white px-6 sm:px-12 py-10 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <GoogleGIcon className="w-7 h-7 bg-white rounded-full p-1 shadow" />
              <span className="font-mono text-xs uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full font-semibold">
                Google Services on Edge
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Google Services Ecosystem
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl mt-1 leading-relaxed">
              Integrated Google Services hub for Microsoft Edge in Windows 10, configured with your Firebase project credentials.
            </p>
          </div>

          {/* Quick status pill */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col gap-1 text-xs text-white">
            <div className="flex items-center gap-2 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Services Status: Operational</span>
            </div>
            <div className="text-[11px] text-blue-100 font-mono truncate max-w-xs">
              Project: {GOOGLE_SERVICES_CONFIG.projectId}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-6 sm:px-12 pt-8">
        {/* 2. Firebase Credentials & Configuration Card */}
        <div className="bg-white dark:bg-[#242526] rounded-2xl border border-zinc-200 dark:border-zinc-700 p-5 shadow-sm mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-700/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-lg">
                🔥
              </div>
              <div>
                <h2 className="font-bold text-sm text-zinc-900 dark:text-white">
                  Firebase & Google Services Configuration
                </h2>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Loaded from <span className="font-mono text-zinc-700 dark:text-zinc-300">/public/assets/aistudio/google-services_10cb5c35.json</span>
                </p>
              </div>
            </div>

            <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
              <span>✓</span> Connected & Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4 text-xs">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block mb-0.5">
                Project ID
              </span>
              <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                {GOOGLE_SERVICES_CONFIG.projectId}
              </span>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block mb-0.5">
                Project Number
              </span>
              <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                {GOOGLE_SERVICES_CONFIG.projectNumber}
              </span>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block mb-0.5">
                Storage Bucket
              </span>
              <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 truncate block">
                {GOOGLE_SERVICES_CONFIG.storageBucket}
              </span>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block mb-0.5">
                Android Package
              </span>
              <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                {GOOGLE_SERVICES_CONFIG.packageName}
              </span>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block mb-0.5">
                Mobile SDK App ID
              </span>
              <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 truncate block">
                {GOOGLE_SERVICES_CONFIG.mobileSdkAppId}
              </span>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block mb-0.5">
                API Key
              </span>
              <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                {GOOGLE_SERVICES_CONFIG.apiKey.slice(0, 14)}... (Active)
              </span>
            </div>
          </div>
        </div>

        {/* 3. Google Services Launcher Grid */}
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
          All Google Apps & Services
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                soundEngine.playClick();
                onNavigate(item.view, item.url, item.name);
              }}
              className={`group p-5 bg-white dark:bg-[#242526] rounded-2xl border ${item.color} shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 group-hover:scale-110 transition-transform shadow-2xs">
                    {item.icon}
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                      {item.badge}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {item.name}
                </h3>
                <h4 className="text-[11px] font-medium text-zinc-500 mb-2">
                  {item.subtitle}
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                <span>Launch App</span>
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
