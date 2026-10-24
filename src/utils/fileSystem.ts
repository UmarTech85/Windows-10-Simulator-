import { FileItem } from '../types/os';

const STORAGE_KEY = 'win10_virtual_fs_v1';

export const INITIAL_FILES: FileItem[] = [
  {
    id: 'f-welcome',
    name: 'Welcome to Windows 10.txt',
    type: 'file',
    extension: 'txt',
    location: 'desktop',
    parentId: null,
    size: '1.2 KB',
    date: '2026-10-24 09:00 AM',
    content: `Welcome to the Windows 10 Simulator!
========================================

Explore a faithful recreation of the Windows 10 experience:

★ Key Features:
- Start Menu with Live Flipping Tiles & All-Apps list
- Real Windows 10 Aero Snap (drag windows to top or sides)
- Working File Explorer with folder navigation & file upload/download
- Microsoft Edge web browser with search & live articles
- Full-featured MS Paint with drawing tools & save directly to Pictures
- Functional Notepad with auto-save & status bar
- Fluent Calculator with history memory
- Classic Command Prompt (cmd.exe) with real interactive commands (try 'help', 'systeminfo', 'ping', 'color 0a', 'matrix', 'bsod')
- Authentic Minesweeper game with 3 difficulty modes
- Groove Music player with real Web Audio synthesizer & visualizer
- Task Manager with real running processes & live activity graphs
- Settings app with custom wallpapers, accent colors, and Night Light
- Action Center with quick toggles and notifications
- Web Audio sound effects (Ding, Startup, Notifications, Recycler)

Have fun exploring and customizing your desktop!`,
  },
  {
    id: 'f-project-roadmap',
    name: 'Project Roadmap.txt',
    type: 'file',
    extension: 'txt',
    location: 'desktop',
    parentId: null,
    size: '840 B',
    date: '2026-10-23 04:15 PM',
    content: `Q4 2026 Engineering Roadmap
----------------------------
[X] Fluent Design System Rollout
[X] Virtual Audio Synthesizer Engine
[X] Aero Snap window docking mechanics
[ ] Cloud sync integration
[ ] DirectX 12 3D graphics benchmark`,
  },
  {
    id: 'f-hero-pic',
    name: 'Hero Wallpaper.jpg',
    type: 'file',
    extension: 'jpg',
    location: 'pictures',
    parentId: null,
    size: '2.4 MB',
    date: '2026-10-20 11:30 AM',
    content: '/src/assets/images/win10_hero_wallpaper_1792832156235.jpg',
  },
  {
    id: 'f-lake-pic',
    name: 'Moraine Alpine Lake.jpg',
    type: 'file',
    extension: 'jpg',
    location: 'pictures',
    parentId: null,
    size: '3.1 MB',
    date: '2026-10-21 02:45 PM',
    content: '/src/assets/images/win10_nature_wallpaper_1792832156468.jpg',
  },
  {
    id: 'f-abstract-pic',
    name: 'Dark Abstract Ribbon.jpg',
    type: 'file',
    extension: 'jpg',
    location: 'pictures',
    parentId: null,
    size: '2.8 MB',
    date: '2026-10-22 06:10 PM',
    content: '/src/assets/images/win10_abstract_wallpaper_1792832157031.jpg',
  },
  {
    id: 'f-secret-memo',
    name: 'Confidential Notes.txt',
    type: 'file',
    extension: 'txt',
    location: 'documents',
    parentId: null,
    size: '420 B',
    date: '2026-10-18 10:12 AM',
    content: `TOP SECRET - EYES ONLY
---------------------
Simulation Core: Online.
Cortana subsystem: Ready.
Windows Defender: All systems nominal.
Kernel version: 10.0.19045 Build 19045`,
  },
  {
    id: 'f-specs',
    name: 'System Specs.txt',
    type: 'file',
    extension: 'txt',
    location: 'documents',
    parentId: null,
    size: '610 B',
    date: '2026-10-19 03:00 PM',
    content: `Device name: DESKTOP-WIN10SIM
Processor: Intel(R) Core(TM) i9-14900K @ 3.20GHz
Installed RAM: 32.0 GB (31.8 GB usable)
System type: 64-bit operating system, x64-based processor
Edition: Windows 10 Pro
Version: 22H2
OS build: 19045.3803
Experience: Windows Feature Experience Pack 1000.19045.1000.0`,
  },
  {
    id: 'f-sample-track1',
    name: 'Lofi Chill Beats.mp3',
    type: 'file',
    extension: 'mp3',
    location: 'music',
    parentId: null,
    size: '4.2 MB',
    date: '2026-10-15 08:00 PM',
    content: 'track_lofi',
  },
  {
    id: 'f-sample-track2',
    name: 'Retro 80s Synth.mp3',
    type: 'file',
    extension: 'mp3',
    location: 'music',
    parentId: null,
    size: '3.8 MB',
    date: '2026-10-16 09:20 PM',
    content: 'track_synth',
  },
  {
    id: 'f-downloads-setup',
    name: 'Edge_Browser_Installer.exe',
    type: 'file',
    extension: 'exe',
    location: 'downloads',
    parentId: null,
    size: '88.4 MB',
    date: '2026-10-24 07:15 AM',
    content: 'binary',
  },
];

export function getFileSystem(): FileItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load virtual FS from localStorage', e);
  }
  saveFileSystem(INITIAL_FILES);
  return INITIAL_FILES;
}

export function saveFileSystem(files: FileItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  } catch (e) {
    console.warn('Failed to save virtual FS to localStorage', e);
  }
}
