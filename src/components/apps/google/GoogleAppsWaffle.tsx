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

interface GoogleAppsWaffleProps {
  onNavigate: (view: any, url: string, title: string) => void;
  onClose: () => void;
  onOpenAccountModal?: () => void;
}

export const GoogleAppsWaffle: React.FC<GoogleAppsWaffleProps> = ({
  onNavigate,
  onClose,
  onOpenAccountModal,
}) => {
  const apps = [
    {
      id: 'search',
      name: 'Search',
      url: 'https://www.google.com',
      view: 'google',
      icon: <GoogleGIcon className="w-8 h-8" />,
    },
    {
      id: 'youtube',
      name: 'YouTube',
      url: 'https://www.youtube.com',
      view: 'youtube',
      icon: <YouTubeIcon className="w-8 h-8" />,
      badge: 'Popular',
    },
    {
      id: 'gmail',
      name: 'Gmail',
      url: 'https://mail.google.com',
      view: 'gmail',
      icon: <GmailIcon className="w-8 h-8" />,
      badge: '3',
    },
    {
      id: 'drive',
      name: 'Drive',
      url: 'https://drive.google.com',
      view: 'drive',
      icon: <GoogleDriveIcon className="w-8 h-8" />,
    },
    {
      id: 'maps',
      name: 'Maps',
      url: 'https://maps.google.com',
      view: 'maps',
      icon: <GoogleMapsIcon className="w-8 h-8" />,
    },
    {
      id: 'gemini',
      name: 'Gemini AI',
      url: 'https://gemini.google.com',
      view: 'gemini',
      icon: <GoogleGeminiIcon className="w-8 h-8" />,
      badge: 'Pro',
    },
    {
      id: 'translate',
      name: 'Translate',
      url: 'https://translate.google.com',
      view: 'translate',
      icon: <GoogleTranslateIcon className="w-8 h-8" />,
    },
    {
      id: 'keep',
      name: 'Keep Notes',
      url: 'https://keep.google.com',
      view: 'keep',
      icon: <GoogleKeepIcon className="w-8 h-8" />,
    },
    {
      id: 'hub',
      name: 'Services Hub',
      url: 'edge://google-services',
      view: 'googleServices',
      icon: (
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-blue-600 font-bold text-xs">
          ⚙️
        </div>
      ),
      badge: 'Config',
    },
  ];

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#303134] border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl p-4 z-50 text-zinc-800 dark:text-zinc-200 animate-fadeIn"
    >
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100 dark:border-zinc-700/80">
        <div className="flex items-center gap-2">
          <GoogleGIcon className="w-4 h-4" />
          <span className="text-xs font-semibold">Google Services</span>
        </div>
        <div
          onClick={onOpenAccountModal}
          className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
          <span>{GOOGLE_SERVICES_CONFIG.projectId}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {apps.map((app) => (
          <button
            key={app.id}
            onClick={() => {
              onClose();
              onNavigate(app.view, app.url, app.name);
            }}
            className="group relative flex flex-col items-center justify-center p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
          >
            {app.badge && (
              <span className="absolute top-1 right-1 text-[9px] font-semibold bg-red-500 text-white px-1.5 py-0.2 rounded-full scale-90">
                {app.badge}
              </span>
            )}
            <div className="group-hover:scale-110 transition-transform mb-1.5 flex items-center justify-center">
              {app.icon}
            </div>
            <span className="text-xs text-zinc-700 dark:text-zinc-300 font-medium truncate max-w-full">
              {app.name}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-700 flex items-center justify-between text-[11px] text-zinc-500">
        <button
          onClick={() => {
            onClose();
            onNavigate('googleServices', 'edge://google-services', 'Google Services Config');
          }}
          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          View Firebase / SDK Details →
        </button>
        <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 font-mono">
          461344985768
        </span>
      </div>
    </div>
  );
};
