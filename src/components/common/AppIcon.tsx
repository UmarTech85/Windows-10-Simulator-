import React from 'react';
import {
  Folder,
  Globe,
  FileText,
  Calculator,
  Terminal,
  Palette,
  Bomb,
  Image as ImageIcon,
  Headphones,
  Activity,
  Settings as SettingsIcon,
  Trash2,
  File,
  Code,
  Music,
} from 'lucide-react';
import { AppId } from '../../types/os';

interface AppIconProps {
  appId?: AppId | string;
  name?: string;
  className?: string;
  size?: number;
  isEmptyRecycleBin?: boolean;
}

export const WindowsLogo: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`inline-block ${className}`}
  >
    <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.949-1.8" />
  </svg>
);

export const AppIcon: React.FC<AppIconProps> = ({
  appId,
  name,
  className = '',
  size = 24,
  isEmptyRecycleBin = false,
}) => {
  const iconId = appId || name;

  switch (iconId) {
    case 'explorer':
    case 'folder':
      return (
        <div className={`relative flex items-center justify-center text-amber-500 drop-shadow-sm ${className}`}>
          <Folder size={size} fill="currentColor" fillOpacity={0.25} strokeWidth={1.8} />
        </div>
      );

    case 'edge':
    case 'globe':
      return (
        <div className={`relative flex items-center justify-center text-blue-500 drop-shadow-sm ${className}`}>
          <Globe size={size} strokeWidth={1.8} />
        </div>
      );

    case 'notepad':
    case 'file-text':
    case 'txt':
      return (
        <div className={`relative flex items-center justify-center text-sky-600 drop-shadow-sm ${className}`}>
          <FileText size={size} strokeWidth={1.8} />
        </div>
      );

    case 'calc':
    case 'calculator':
      return (
        <div className={`relative flex items-center justify-center text-cyan-500 drop-shadow-sm ${className}`}>
          <Calculator size={size} strokeWidth={1.8} />
        </div>
      );

    case 'cmd':
    case 'terminal':
      return (
        <div className={`relative flex items-center justify-center bg-zinc-900 text-green-400 p-1 rounded-sm border border-zinc-700 shadow-sm ${className}`}>
          <Terminal size={size - 4} strokeWidth={2.2} />
        </div>
      );

    case 'paint':
    case 'palette':
      return (
        <div className={`relative flex items-center justify-center text-rose-500 drop-shadow-sm ${className}`}>
          <Palette size={size} strokeWidth={1.8} />
        </div>
      );

    case 'minesweeper':
    case 'bomb':
      return (
        <div className={`relative flex items-center justify-center text-emerald-500 drop-shadow-sm ${className}`}>
          <Bomb size={size} strokeWidth={1.8} />
        </div>
      );

    case 'photos':
    case 'image':
    case 'jpg':
    case 'png':
      return (
        <div className={`relative flex items-center justify-center text-teal-400 drop-shadow-sm ${className}`}>
          <ImageIcon size={size} strokeWidth={1.8} />
        </div>
      );

    case 'groove':
    case 'headphones':
    case 'mp3':
      return (
        <div className={`relative flex items-center justify-center text-indigo-400 drop-shadow-sm ${className}`}>
          {iconId === 'mp3' ? <Music size={size} strokeWidth={1.8} /> : <Headphones size={size} strokeWidth={1.8} />}
        </div>
      );

    case 'taskmanager':
    case 'activity':
      return (
        <div className={`relative flex items-center justify-center text-emerald-400 drop-shadow-sm ${className}`}>
          <Activity size={size} strokeWidth={2} />
        </div>
      );

    case 'settings':
      return (
        <div className={`relative flex items-center justify-center text-slate-300 drop-shadow-sm ${className}`}>
          <SettingsIcon size={size} strokeWidth={1.8} />
        </div>
      );

    case 'recyclebin':
    case 'trash':
      return (
        <div className={`relative flex items-center justify-center ${isEmptyRecycleBin ? 'text-slate-400' : 'text-blue-400'} drop-shadow-sm ${className}`}>
          <Trash2 size={size} strokeWidth={1.8} />
        </div>
      );

    case 'exe':
      return (
        <div className={`relative flex items-center justify-center text-purple-400 drop-shadow-sm ${className}`}>
          <Code size={size} strokeWidth={1.8} />
        </div>
      );

    default:
      return (
        <div className={`relative flex items-center justify-center text-slate-400 drop-shadow-sm ${className}`}>
          <File size={size} strokeWidth={1.8} />
        </div>
      );
  }
};
