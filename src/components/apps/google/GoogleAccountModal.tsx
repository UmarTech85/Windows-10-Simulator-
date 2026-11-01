import React from 'react';
import { GOOGLE_SERVICES_CONFIG } from '../../../config/googleServices';
import { soundEngine } from '../../../utils/sound';

interface GoogleAccountModalProps {
  onClose: () => void;
  onNavigate: (view: any, url: string, title: string) => void;
}

export const GoogleAccountModal: React.FC<GoogleAccountModalProps> = ({
  onClose,
  onNavigate,
}) => {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#2e2f31] rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-700 text-center font-sans text-zinc-800 dark:text-zinc-200"
      >
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-semibold text-zinc-500">
            Google Account
          </span>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white text-xs p-1"
          >
            ✕
          </button>
        </div>

        {/* User Avatar */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-2xl mx-auto flex items-center justify-center shadow-md mb-3">
          W
        </div>

        <h3 className="font-bold text-base text-zinc-900 dark:text-white">
          {GOOGLE_SERVICES_CONFIG.connectedAccount.name}
        </h3>
        <p className="text-xs text-zinc-500 font-mono mt-0.5">
          {GOOGLE_SERVICES_CONFIG.connectedAccount.email}
        </p>

        {/* Firebase Project Badge */}
        <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-left text-xs space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">
            <span>Linked Firebase Project:</span>
            <span className="text-emerald-600 font-bold">Active</span>
          </div>
          <div className="font-mono text-zinc-800 dark:text-zinc-200 font-medium truncate">
            {GOOGLE_SERVICES_CONFIG.projectId}
          </div>
          <div className="text-[11px] text-zinc-400 font-mono truncate">
            Bucket: {GOOGLE_SERVICES_CONFIG.storageBucket}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 space-y-2 text-xs">
          <button
            onClick={() => {
              onClose();
              onNavigate('googleServices', 'edge://google-services', 'Google Services Config');
              soundEngine.playClick();
            }}
            className="w-full py-2.5 px-4 rounded-full border border-zinc-300 dark:border-zinc-600 font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
          >
            Manage Google Services & Cloud Config
          </button>
          <button
            onClick={() => {
              onClose();
              onNavigate('drive', 'https://drive.google.com', 'Google Drive');
              soundEngine.playClick();
            }}
            className="w-full py-2 px-4 rounded-full text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            View Cloud Storage (1.42 GB of 15 GB)
          </button>
        </div>
      </div>
    </div>
  );
};
