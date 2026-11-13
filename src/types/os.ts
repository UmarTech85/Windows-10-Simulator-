export type AppId =
  | 'explorer'
  | 'notepad'
  | 'calc'
  | 'cmd'
  | 'paint'
  | 'edge'
  | 'settings'
  | 'minesweeper'
  | 'photos'
  | 'groove'
  | 'taskmanager'
  | 'recyclebin';

export interface WindowState {
  id: string;
  appId: AppId;
  title: string;
  icon: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  isMinimized: boolean;
  isMaximized: boolean;
  snappedPosition?: 'left' | 'right' | null;
  prevBounds?: { x: number; y: number; width: number; height: number };
  zIndex: number;
  customData?: any;
}

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  extension?: 'txt' | 'png' | 'jpg' | 'doc' | 'pdf' | 'mp3' | 'exe';
  content?: string; // text content or base64/url for images
  size?: string;
  date: string;
  parentId: string | null; // null for root virtual locations
  location: 'desktop' | 'documents' | 'pictures' | 'downloads' | 'music' | 'recyclebin';
  isRecycled?: boolean;
}

export interface DesktopIcon {
  id: string;
  title: string;
  icon: string;
  appId?: AppId;
  fileId?: string;
  action?: 'open_app' | 'open_file' | 'open_recycle_bin';
  x?: number;
  y?: number;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  source: string;
  read: boolean;
  actionApp?: AppId;
}

export interface SystemSettings {
  wallpaper: string;
  accentColor: string;
  theme: 'dark' | 'light';
  nightLight: boolean;
  volume: number;
  muted: boolean;
  wifiConnected: boolean;
  networkName: string;
  soundEffects: boolean;
  lockScreenEnabled: boolean;
}
