import React from 'react';
import {
  Moon,
  Tablet,
  Wifi,
  Settings,
  BatteryCharging,
  Bluetooth,
  Bell,
  Trash2,
  Sliders,
  Crop,
} from 'lucide-react';
import { SystemNotification, SystemSettings, AppId } from '../../types/os';
import { soundEngine } from '../../utils/sound';

interface ActionCenterProps {
  notifications: SystemNotification[];
  settings: SystemSettings;
  onClearNotifications: () => void;
  onUpdateSettings: (newSettings: Partial<SystemSettings>) => void;
  onLaunchApp: (appId: AppId) => void;
  onClose: () => void;
}

export const ActionCenter: React.FC<ActionCenterProps> = ({
  notifications,
  settings,
  onClearNotifications,
  onUpdateSettings,
  onLaunchApp,
  onClose,
}) => {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed top-0 right-0 bottom-[44px] w-84 sm:w-96 bg-[#1f1f1f]/95 backdrop-blur-xl text-white border-l border-zinc-700/60 shadow-2xl z-50 flex flex-col font-sans select-none animate-slideLeft"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Action Center
        </span>
        {notifications.length > 0 && (
          <button
            onClick={() => {
              soundEngine.playClick();
              onClearNotifications();
            }}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            Clear all notifications
          </button>
        )}
      </div>

      {/* Notifications Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-xs">
            <Bell size={28} className="mb-2 opacity-40" />
            <p>No new notifications</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                if (notif.actionApp) {
                  onLaunchApp(notif.actionApp);
                  onClose();
                }
              }}
              className="p-3 bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/50 rounded-sm cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                <span className="font-semibold text-blue-400">{notif.source}</span>
                <span>{notif.time}</span>
              </div>
              <h4 className="text-xs font-semibold text-zinc-100">{notif.title}</h4>
              <p className="text-xs text-zinc-300 mt-0.5">{notif.message}</p>
            </div>
          ))
        )}
      </div>

      {/* Quick Action Tiles Grid */}
      <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/60">
        <div className="grid grid-cols-4 gap-2 text-[11px]">
          {/* Tablet Mode */}
          <button className="flex flex-col items-center justify-center p-2.5 rounded-sm bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-colors">
            <Tablet size={16} className="mb-1" />
            <span className="text-center truncate w-full">Tablet</span>
          </button>

          {/* Network */}
          <button
            onClick={() => {
              onUpdateSettings({ wifiConnected: !settings.wifiConnected });
              soundEngine.playClick();
            }}
            className={`flex flex-col items-center justify-center p-2.5 rounded-sm transition-colors ${
              settings.wifiConnected ? 'bg-blue-600 text-white' : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300'
            }`}
          >
            <Wifi size={16} className="mb-1" />
            <span className="text-center truncate w-full">Network</span>
          </button>

          {/* All Settings */}
          <button
            onClick={() => {
              onLaunchApp('settings');
              onClose();
            }}
            className="flex flex-col items-center justify-center p-2.5 rounded-sm bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            <Settings size={16} className="mb-1" />
            <span className="text-center truncate w-full">Settings</span>
          </button>

          {/* Night Light */}
          <button
            onClick={() => {
              onUpdateSettings({ nightLight: !settings.nightLight });
              soundEngine.playClick();
            }}
            className={`flex flex-col items-center justify-center p-2.5 rounded-sm transition-colors ${
              settings.nightLight ? 'bg-blue-600 text-white' : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300'
            }`}
          >
            <Moon size={16} className="mb-1" />
            <span className="text-center truncate w-full">Night light</span>
          </button>

          {/* Battery Saver */}
          <button className="flex flex-col items-center justify-center p-2.5 rounded-sm bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-colors">
            <BatteryCharging size={16} className="mb-1" />
            <span className="text-center truncate w-full">Battery</span>
          </button>

          {/* Bluetooth */}
          <button className="flex flex-col items-center justify-center p-2.5 rounded-sm bg-blue-600 text-white transition-colors">
            <Bluetooth size={16} className="mb-1" />
            <span className="text-center truncate w-full">Bluetooth</span>
          </button>

          {/* Focus Assist */}
          <button className="flex flex-col items-center justify-center p-2.5 rounded-sm bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-colors">
            <Sliders size={16} className="mb-1" />
            <span className="text-center truncate w-full">Focus</span>
          </button>

          {/* Snip */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onLaunchApp('paint');
              onClose();
            }}
            className="flex flex-col items-center justify-center p-2.5 rounded-sm bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            <Crop size={16} className="mb-1" />
            <span className="text-center truncate w-full">Snip</span>
          </button>
        </div>
      </div>
    </div>
  );
};
