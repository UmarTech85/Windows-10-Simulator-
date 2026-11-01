/** @jsxRuntime classic */

import React, { useState, useEffect, useRef } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elementName: string]: any;
    }
  }
}

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number | string };

const iconPaths: Record<string, string> = {
  ArrowLeft: 'M19 12H5m7 7-7-7 7-7', ArrowRight: 'M5 12h14m-7-7 7 7-7 7',
  RotateCw: 'M20 7v5h-5M20 12a8 8 0 1 1-2.34-5.66L20 9', Home: 'm3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1z',
  Plus: 'M12 5v14m-7-7h14', X: 'm18 6-12 12M6 6l12 12', Search: 'm21 21-4.34-4.34M19 10.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0',
  Lock: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4', Globe: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM2 12h20m-10-10a15 15 0 0 1 0 20m0-20a15 15 0 0 0 0 20',
  Star: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z', Bookmark: 'M6 4h12v17l-6-4-6 4z',
  History: 'M3 12a9 9 0 1 0 2.64-6.36L3 8m0-5v5h5m4-1v5l3 2', Download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5 5 5 5-5m-5 5V3',
  MoreVertical: 'M12 5h.01M12 12h.01M12 19h.01', BookOpen: 'M2 4.5A2.5 2.5 0 0 1 4.5 2H20v18H4.5A2.5 2.5 0 0 1 2 17.5zM2 17.5A2.5 2.5 0 0 1 4.5 15H20M8 6h7',
  Newspaper: 'M4 4h16v16H4zM8 8h8M8 12h8m-8 4h4M2 7v12a1 1 0 0 0 1 1', Compass: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm4-14-2.5 6.5L7 17l2.5-6.5z',
  Check: 'm5 12 4 4L19 6', Trash2: 'M3 6h18m-2 0-.9 14H5.9L5 6m4 0V4h6v2m-5 4v7m4-7v7', ExternalLink: 'M14 3h7v7m0-7L10 14m7-2v7H4V6h7',
  ChevronRight: 'm9 18 6-6-6-6', ChevronDown: 'm6 9 6 6 6-6', ChevronUp: 'm18 15-6-6-6 6', Moon: 'M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z',
  Sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-6v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42',
  Shield: 'M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z', CloudSun: 'M12 2v2m-7.07.93 1.42 1.42M2 12h2m15-5a5 5 0 0 0-9.7-1.7A4 4 0 1 0 8 17h9a4 4 0 0 0 0-8Z',
  Eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Zm10-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z', FileText: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm0 0v6h6M8 13h8m-8 4h8',
  Mic: 'M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Zm-7 9a7 7 0 0 0 14 0m-7 7v4m-4 0h8', Camera: 'M3 7h4l2-3h6l2 3h4v13H3zM12 10a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
  Grid: 'M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z', ImageIcon: 'M3 3h18v18H3zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM21 15l-5-5L5 21', VideoIcon: 'M3 6h13v12H3zM16 10l5-3v10l-5-3z',
  Play: 'm8 5 12 7-12 7z', Sparkles: 'm12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 14l1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2z',
  SlidersHorizontal: 'M4 6h16M4 12h16M4 18h16M8 4v4m8 2v4m-5 2v4', Share2: 'M18 8a3 3 0 1 0-2.83-4M6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm12-4a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM8.6 16.5l6.8-4m0-1-6.8-4',
  Printer: 'M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z', ZoomIn: 'm21 21-4.3-4.3M19 10.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0ZM10.5 7v7m-3.5-3.5h7', ZoomOut: 'm21 21-4.3-4.3M19 10.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0ZM7 10.5h7',
  Volume2: 'M11 5 6 9H2v6h4l5 4zm4 4a5 5 0 0 1 0 6m3-9a9 9 0 0 1 0 12', VolumeX: 'M11 5 6 9H2v6h4l5 4zm5 4 5 6m0-6-5 6', Code2: 'm8 17-5-5 5-5m8 10 5-5-5-5m-2-3-4 16', Terminal: 'm4 17 6-5-6-5m8 10h8',
  DownloadCloud: 'M20 16.5A4.5 4.5 0 0 0 18 8h-1.3A7 7 0 1 0 4 14.3M12 12v9m-4-4 4 4 4-4', HardDrive: 'M3 4h18v16H3zM3 15h18m-14 2h.01m4-.01h.01', Pause: 'M7 4h4v16H7zm6 0h4v16h-4z', AlertCircle: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-15v6m0 4h.01',
  CheckCircle2: 'M22 11.1V12a10 10 0 1 1-5.9-9.2M22 4 12 14l-3-3', Maximize2: 'M15 3h6v6m0-6-7 7M9 21H3v-6m0 6 7-7', FileCode: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm0 0v6h6M8 16l2-2-2-2m4 4h3',
};

const createIcon = (name: string): React.FC<IconProps> => {
  const Icon: React.FC<IconProps> = ({ size = 24, ...props }) =>
    React.createElement(
      'svg',
      { viewBox: '0 0 24 24', width: size, height: size, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
      React.createElement('path', { d: iconPaths[name] || 'M4 4h16v16H4z' }),
    );
  Icon.displayName = name;
  return Icon;
};

const ArrowLeft = createIcon('ArrowLeft');
const ArrowRight = createIcon('ArrowRight');
const RotateCw = createIcon('RotateCw');
const Home = createIcon('Home');
const Plus = createIcon('Plus');
const X = createIcon('X');
const Search = createIcon('Search');
const Lock = createIcon('Lock');
const Globe = createIcon('Globe');
const Star = createIcon('Star');
const Bookmark = createIcon('Bookmark');
const History = createIcon('History');
const Download = createIcon('Download');
const MoreVertical = createIcon('MoreVertical');
const BookOpen = createIcon('BookOpen');
const Newspaper = createIcon('Newspaper');
const Compass = createIcon('Compass');
const Check = createIcon('Check');
const Trash2 = createIcon('Trash2');
const ExternalLink = createIcon('ExternalLink');
const ChevronRight = createIcon('ChevronRight');
const ChevronDown = createIcon('ChevronDown');
const ChevronUp = createIcon('ChevronUp');
const Moon = createIcon('Moon');
const Sun = createIcon('Sun');
const Shield = createIcon('Shield');
const CloudSun = createIcon('CloudSun');
const Eye = createIcon('Eye');
const FileText = createIcon('FileText');
const Mic = createIcon('Mic');
const Camera = createIcon('Camera');
const Grid = createIcon('Grid');
const ImageIcon = createIcon('ImageIcon');
const VideoIcon = createIcon('VideoIcon');
const Play = createIcon('Play');
const Sparkles = createIcon('Sparkles');
const SlidersHorizontal = createIcon('SlidersHorizontal');
const Share2 = createIcon('Share2');
const Printer = createIcon('Printer');
const ZoomIn = createIcon('ZoomIn');
const ZoomOut = createIcon('ZoomOut');
const Volume2 = createIcon('Volume2');
const VolumeX = createIcon('VolumeX');
const Code2 = createIcon('Code2');
const Terminal = createIcon('Terminal');
const DownloadCloud = createIcon('DownloadCloud');
const HardDrive = createIcon('HardDrive');
const Pause = createIcon('Pause');
const AlertCircle = createIcon('AlertCircle');
const CheckCircle2 = createIcon('CheckCircle2');
const Maximize2 = createIcon('Maximize2');
const FileCode = createIcon('FileCode');
import { soundEngine } from '../../utils/sound';
import {
  YouTubeIcon,
  GmailIcon,
  GoogleDriveIcon,
  GoogleMapsIcon,
  GoogleGeminiIcon,
  GoogleTranslateIcon,
  GoogleKeepIcon,
} from './google/GoogleIcons';
import { GoogleAppsWaffle } from './google/GoogleAppsWaffle';
import { YouTubeApp } from './google/YouTubeApp';
import { GmailApp } from './google/GmailApp';
import { GoogleDriveApp } from './google/GoogleDriveApp';
import { GoogleMapsApp } from './google/GoogleMapsApp';
import { GoogleGeminiApp } from './google/GoogleGeminiApp';
import { GoogleTranslateApp } from './google/GoogleTranslateApp';
import { GoogleKeepApp } from './google/GoogleKeepApp';
import { GoogleServicesHub } from './google/GoogleServicesHub';
import { GoogleAccountModal } from './google/GoogleAccountModal';

export type BrowserViewType =
  | 'start'
  | 'wiki'
  | 'game'
  | 'surf'
  | 'search'
  | 'history'
  | 'downloads'
  | 'google'
  | 'googleSearch'
  | 'youtube'
  | 'gmail'
  | 'drive'
  | 'maps'
  | 'gemini'
  | 'translate'
  | 'keep'
  | 'googleServices'
  | 'embed';

interface Tab {
  id: string;
  title: string;
  url: string;
  view: BrowserViewType;
  inPrivate?: boolean;
}

const isGoogleDomainUrl = (url: string) => {
  try {
    const hostname = new URL(url).hostname;
    return (
      hostname === 'google.com' ||
      hostname.endsWith('.google.com') ||
      hostname === 'youtube.com' ||
      hostname.endsWith('.youtube.com') ||
      hostname === 'youtu.be' ||
      hostname === 'gmail.com'
    );
  } catch {
    return url.startsWith('google:') || url.startsWith('edge://google');
  }
};

const getSafeHttpUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
      ? parsedUrl.href
      : 'about:blank';
  } catch {
    return 'about:blank';
  }
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return character;
    }
  });

interface DownloadItem {
  id: string;
  filename: string;
  filesize: string;
  url: string;
  time: string;
  status: 'completed' | 'downloading';
  blobUrl?: string;
  category: 'document' | 'image' | 'audio' | 'code';
}

interface ConsoleEntry {
  id: string;
  type: 'log' | 'info' | 'warn' | 'error' | 'input';
  text: string;
  time: string;
}

interface NetworkEntry {
  id: string;
  url: string;
  method: string;
  status: number;
  statusText: string;
  type: string;
  size: string;
  time: string;
}

interface LiveWikiArticle {
  title: string;
  extract: string;
  description?: string;
  thumbnail?: string;
  url?: string;
}

interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  icon: string;
  view?: BrowserViewType;
}

interface HistoryEntry {
  id: string;
  title: string;
  url: string;
  time: string;
}

export const GoogleGIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) =>
  React.createElement(
    'svg',
    { viewBox: '0 0 24 24', className, 'aria-label': 'Google' },
    React.createElement('path', {
      fill: '#4285F4',
      d: 'M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z',
    }),
    React.createElement('path', {
      fill: '#34A853',
      d: 'M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.13C3.25 21.3 7.31 24 12 24z',
    }),
    React.createElement('path', {
      fill: '#FBBC05',
      d: 'M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.27C.46 8.2 0 10.05 0 12s.46 3.8 1.27 5.42l4.01-3.13z',
    }),
    React.createElement('path', {
      fill: '#EA4335',
      d: 'M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.58l4.01 3.13c.95-2.83 3.6-4.96 6.72-4.96z',
    }),
  );

export const GoogleWordmark: React.FC<{ size?: 'sm' | 'md' | 'lg'; onClick?: () => void }> = ({
  size = 'md',
  onClick,
}: { size?: 'sm' | 'md' | 'lg'; onClick?: () => void }) => {
  const sizeClasses =
    size === 'sm'
      ? 'text-xl tracking-tight'
      : size === 'lg'
      ? 'text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight'
      : 'text-2xl sm:text-3xl font-semibold tracking-tight';
  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center font-sans select-none cursor-pointer ${sizeClasses}`}
      style={{ fontFamily: "'Product Sans', -apple-system, BlinkMacSystemFont, Roboto, sans-serif" }}
    >
      <span className="text-[#4285F4]">G</span>
      <span className="text-[#EA4335]">o</span>
      <span className="text-[#FBBC05]">o</span>
      <span className="text-[#4285F4]">g</span>
      <span className="text-[#34A853]">l</span>
      <span className="text-[#EA4335]">e</span>
    </div>
  );
};

const INITIAL_BOOKMARKS: BookmarkItem[] = [
  { id: 'bm-google', title: 'Google', url: 'https://www.google.com', icon: 'google' },
  { id: 'bm-yt', title: 'YouTube', url: 'https://www.youtube.com', icon: 'youtube' },
  { id: 'bm-gmail', title: 'Gmail', url: 'https://mail.google.com', icon: 'gmail' },
  { id: 'bm-drive', title: 'Drive', url: 'https://drive.google.com', icon: 'drive' },
  { id: 'bm-maps', title: 'Maps', url: 'https://maps.google.com', icon: 'maps' },
  { id: 'bm-gemini', title: 'Gemini AI', url: 'https://gemini.google.com', icon: 'gemini' },
  { id: 'bm-services', title: 'Google Services', url: 'edge://google-services', icon: 'googleServices' },
  { id: 'bm-2', title: 'Edge Surf', url: 'edge://surf', icon: 'game' },
  { id: 'bm-3', title: 'Wikipedia', url: 'https://en.wikipedia.org', icon: 'wiki' },
  { id: 'bm-1', title: 'MSN Feed', url: 'edge://newtab', icon: 'newspaper' },
];

interface KnowledgeItem {
  queryMatch: string[];
  title: string;
  subtitle: string;
  description: string;
  specs: Record<string, string>;
  imageTag: string;
  imageBg: string;
  actionTitle?: string;
  actionUrl?: string;
}

const KNOWLEDGE_BASE: KnowledgeItem[] = [
  {
    queryMatch: ['windows 10', 'windows', 'win10', 'microsoft windows'],
    title: 'Windows 10',
    subtitle: 'Operating system by Microsoft',
    description:
      'Windows 10 is a major release of the Microsoft Windows NT operating system, released worldwide on July 29, 2015. It combines the versatility of Windows 7 with modern Universal Windows Platform apps, virtual desktops, DirectX 12, and Microsoft Edge.',
    specs: {
      Developer: 'Microsoft',
      'Initial release': 'July 29, 2015',
      Predecessor: 'Windows 8.1',
      Platforms: 'x86-64, ARM64',
      Features: 'Hybrid Start Menu, Action Center, Aero Snap',
      License: 'Proprietary commercial software',
    },
    imageTag: '🪟',
    imageBg: 'from-blue-600 to-indigo-900',
    actionTitle: 'Read on Wikipedia',
    actionUrl: 'wiki:windows-10',
  },
  {
    queryMatch: ['google', 'google search', 'alphabet', 'google llc'],
    title: 'Google LLC',
    subtitle: 'American multinational technology company',
    description:
      'Google is an American multinational corporation and technology company focusing on search engine technology, online advertising, cloud computing, computer software, quantum computing, and artificial intelligence.',
    specs: {
      Founders: 'Larry Page, Sergey Brin',
      Founded: 'September 4, 1998, Menlo Park, CA',
      CEO: 'Sundar Pichai',
      Parent: 'Alphabet Inc.',
      Headquarters: 'Mountain View, California, United States',
    },
    imageTag: '🌐',
    imageBg: 'from-blue-500 via-red-500 to-amber-500',
    actionTitle: 'Google Homepage',
    actionUrl: 'google',
  },
  {
    queryMatch: ['microsoft edge', 'edge', 'edge browser', 'surf'],
    title: 'Microsoft Edge',
    subtitle: 'Web browser developed by Microsoft',
    description:
      'Microsoft Edge is a cross-platform web browser created and developed by Microsoft. First released for Windows 10 in 2015, it features high browsing speeds, built-in tracking prevention, InPrivate browsing, and the famous Edge Surf Easter egg game.',
    specs: {
      Developer: 'Microsoft',
      'Initial release': 'July 29, 2015',
      Engines: 'Chromium, Blink, V8',
      Features: 'Edge Surf Game, InPrivate, Reader Mode',
      Platforms: 'Windows, macOS, Linux, Android, iOS',
    },
    imageTag: '🌊',
    imageBg: 'from-cyan-500 to-blue-700',
    actionTitle: 'Play Edge Surf',
    actionUrl: 'surf',
  },
  {
    queryMatch: ['groove music', 'groove', 'music', 'mp3'],
    title: 'Groove Music',
    subtitle: 'Audio streaming and media player for Windows',
    description:
      'Groove Music was an audio player and music streaming service developed by Microsoft for Windows 10. In this simulator, it features continuous background playback across the desktop, real-time audio synthesis, an animated vinyl visualizer, and playlist management.',
    specs: {
      Developer: 'Microsoft',
      Platforms: 'Windows 10, Xbox One, Android, iOS',
      Audio: 'Synthesized high-fidelity Web Audio engine',
      Playback: 'Continuous desktop background service',
      Formats: 'MP3, FLAC, AAC, WAV, OGG',
    },
    imageTag: '🎵',
    imageBg: 'from-cyan-600 to-teal-800',
    actionTitle: 'Open Groove Music',
    actionUrl: 'groove',
  },
  {
    queryMatch: ['artificial intelligence', 'ai', 'machine learning', 'deep learning'],
    title: 'Artificial Intelligence',
    subtitle: 'Discipline in Computer Science',
    description:
      'Artificial intelligence is the discipline of creating computational systems capable of performing tasks typically requiring human intelligence, such as visual perception, natural language synthesis, decision-making, and translation.',
    specs: {
      Pioneers: 'Alan Turing, John McCarthy, Marvin Minsky',
      'First coined': '1956 (Dartmouth Conference)',
      Subfields: 'Deep learning, NLP, Computer vision, Robotics',
      Architectures: 'Transformers, Diffusion models, Neural networks',
    },
    imageTag: '🧠',
    imageBg: 'from-emerald-600 to-teal-900',
    actionTitle: 'Read on Wikipedia',
    actionUrl: 'wiki:ai',
  },
  {
    queryMatch: ['apollo', 'apollo program', 'moon', 'nasa', 'apollo 11'],
    title: 'Apollo Program',
    subtitle: 'United States human spaceflight program by NASA',
    description:
      'Project Apollo was the third United States human spaceflight program carried out by NASA, which succeeded in landing the first humans on the Moon on July 20, 1969.',
    specs: {
      Agency: 'NASA',
      Duration: '1961 – 1972',
      Rocket: 'Saturn V',
      'First landing': 'July 20, 1969 (Neil Armstrong, Buzz Aldrin)',
      'Total crewed': '11 crewed spaceflights',
    },
    imageTag: '🚀',
    imageBg: 'from-purple-700 to-slate-900',
    actionTitle: 'Read on Wikipedia',
    actionUrl: 'wiki:apollo',
  },
  {
    queryMatch: ['react', 'react 19', 'reactjs', 'javascript'],
    title: 'React',
    subtitle: 'Front-end JavaScript component library',
    description:
      'React is a free and open-source front-end JavaScript library for building user interfaces based on components. Maintained by Meta and a massive global community of individual developers and companies.',
    specs: {
      Developer: 'Meta and community',
      'Initial release': 'May 29, 2013',
      License: 'MIT License',
      'Written in': 'JavaScript, TypeScript',
      Current: 'React 19',
    },
    imageTag: '⚛️',
    imageBg: 'from-sky-500 to-blue-800',
  },
];

const GOOGLE_SUGGESTIONS = [
  'windows 10 simulator features',
  'microsoft edge vs google chrome',
  'groove music background playback',
  'react 19 release notes',
  'how to play edge surf game',
  'artificial intelligence research 2026',
  'apollo 11 moon landing history',
  'retro snake arcade online',
  'windows 10 system requirements',
  'latest technology news today',
];

interface FaqItem {
  question: string;
  answer: string;
  source: string;
}

const FAQS_DATA: Record<string, FaqItem[]> = {
  windows: [
    {
      question: 'Is Windows 10 still supported by Microsoft?',
      answer:
        'Microsoft continues servicing Windows 10 with security updates. Many enterprise and desktop users remain on Windows 10 due to its proven stability, customizable Start menu, and low hardware overhead.',
      source: 'microsoft.com',
    },
    {
      question: 'What are the main features of Windows 10?',
      answer:
        'Key features include the unified Start Menu with Live Tiles, Microsoft Edge browser, Action Center notifications, Virtual Desktops (Task View), and DirectX 12 gaming support.',
      source: 'techrepublic.com',
    },
    {
      question: 'How do I run background music while working in Windows 10?',
      answer:
        'Apps like Groove Music in Windows 10 run as background services. Even when you close or minimize the player window, the desktop media controller in the taskbar allows uninterrupted playback.',
      source: 'support.microsoft.com',
    },
    {
      question: 'Can I play games inside Microsoft Edge?',
      answer:
        'Yes! Microsoft Edge includes the official built-in Edge Surf game (accessible via edge://surf), as well as HTML5 arcade games like Snake.',
      source: 'blogs.windows.com',
    },
  ],
  default: [
    {
      question: 'How does Google Search index web pages?',
      answer:
        'Google uses automated web crawlers known as Googlebots to discover publicly available web pages, analyze textual and structured metadata, and index them in distributed data centers for near-instant retrieval.',
      source: 'google.com/search/howsearchworks',
    },
    {
      question: 'What is the "I\'m Feeling Lucky" button on Google?',
      answer:
        'The "I\'m Feeling Lucky" button immediately bypasses the search engine results page and navigates directly to the highest-ranking web result for the entered query.',
      source: 'wikipedia.org/wiki/Google_Search',
    },
    {
      question: 'Can I search by voice or image on Google?',
      answer:
        'Yes! Google Search includes Google Voice Search via microphone input and Google Lens for visual reverse image lookup and optical text recognition.',
      source: 'support.google.com/websearch',
    },
    {
      question: 'How can I filter Google search results?',
      answer:
        'You can filter by categories such as All, Images, News, and Videos, or use the Tools toggle to specify time ranges and exact matches.',
      source: 'google.com/advanced_search',
    },
  ],
};

const WIKI_ARTICLES: Record<string, { title: string; category: string; summary: string; content: string[] }> = {
  'windows-10': {
    title: 'Windows 10',
    category: 'Operating Systems',
    summary:
      'Windows 10 is a major release of the Microsoft Windows NT operating system, launched worldwide on July 29, 2015.',
    content: [
      'Windows 10 introduced a revitalized user experience combining the desktop versatility of Windows 7 with modern Universal Windows Platform (UWP) apps.',
      'Key architectural advancements include DirectX 12 for high-efficiency GPU acceleration, virtual desktops with Task View, and the Microsoft Edge web browser replacing Internet Explorer.',
      'A streamlined Start menu reinstated customizable Live Tiles, and Cortana was integrated for quick search and voice commands.',
    ],
  },
  ai: {
    title: 'Artificial Intelligence',
    category: 'Computer Science',
    summary:
      'Artificial Intelligence (AI) involves creating computational algorithms capable of performing tasks typically requiring human cognitive faculties.',
    content: [
      'Modern artificial intelligence is dominated by deep learning and large-scale transformer architectures capable of natural language synthesis, computer vision, and predictive modeling.',
      'Alan Turing laid the foundational theoretical groundwork with the Turing Test in 1950, asking whether machine output could be distinguished from human intellect.',
      'High-performance distributed computing now allows local execution of generative neural models directly inside edge devices.',
    ],
  },
  apollo: {
    title: 'Apollo Program',
    category: 'Space Exploration',
    summary:
      'Project Apollo was the third United States human spaceflight program carried out by NASA, which succeeded in landing the first humans on the Moon in 1969.',
    content: [
      'The Apollo program was conceived in 1960 during President Dwight D. Eisenhower’s administration and accelerated by President John F. Kennedy.',
      'Apollo 11 astronaut Neil Armstrong became the first human to set foot on lunar soil on July 20, 1969, joined shortly after by Lunar Module Pilot Buzz Aldrin.',
      'The program utilized the massive Saturn V three-stage rocket, developed at the Marshall Space Flight Center under Wernher von Braun.',
    ],
  },
  browsers: {
    title: 'Web Browsers & Modern Standards',
    category: 'Internet Technology',
    summary:
      'A web browser is an application software for accessing the World Wide Web or a local website.',
    content: [
      'The first web browser, WorldWideWeb, was invented in 1990 by Tim Berners-Lee. Mosaic (1993) popularized graphical web browsing.',
      'Modern browsers like Microsoft Edge are built on high-speed rendering engines with hardware-accelerated WebGL, Web Audio, and Progressive Web App execution sandboxes.',
      'Modern web standards (HTML5, ECMAScript, WebAssembly) enable complete desktop simulation operating systems to run directly in memory.',
    ],
  },
};

interface EdgeBrowserProps {
  initialUrl?: string;
  initialView?: BrowserViewType;
}

export const EdgeBrowser: React.FC<EdgeBrowserProps> = ({
  initialUrl,
  initialView,
}) => {
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: 'tab-1',
      title: initialUrl
        ? initialUrl.includes('youtube')
          ? 'YouTube'
          : initialUrl.includes('google-services')
          ? 'Google Services'
          : initialUrl.includes('google')
          ? 'Google'
          : 'Browser'
        : 'New Tab',
      url: initialUrl || 'edge://newtab',
      view:
        initialView ||
        (initialUrl?.includes('youtube')
          ? 'youtube'
          : initialUrl?.includes('mail.google') || initialUrl?.includes('gmail')
          ? 'gmail'
          : initialUrl?.includes('drive.google')
          ? 'drive'
          : initialUrl?.includes('maps.google')
          ? 'maps'
          : initialUrl?.includes('gemini.google')
          ? 'gemini'
          : initialUrl?.includes('google-services')
          ? 'googleServices'
          : initialUrl?.includes('google')
          ? 'google'
          : 'start'),
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');
  const [inputUrl, setInputUrl] = useState<string>(initialUrl || 'edge://newtab');
  const [selectedWiki, setSelectedWiki] = useState<string>('windows-10');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showGoogleWaffleMenu, setShowGoogleWaffleMenu] = useState<boolean>(false);
  const [showGoogleAccountModal, setShowGoogleAccountModal] = useState<boolean>(false);

  // 1. Real LocalStorage-backed Bookmarks
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    try {
      const saved = localStorage.getItem('win10_edge_bookmarks');
      return saved ? JSON.parse(saved) : INITIAL_BOOKMARKS;
    } catch {
      return INITIAL_BOOKMARKS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('win10_edge_bookmarks', JSON.stringify(bookmarks));
    } catch {}
  }, [bookmarks]);

  // 2. Real LocalStorage-backed History
  const [historyList, setHistoryList] = useState<HistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('win10_edge_history');
      return saved
        ? JSON.parse(saved)
        : [{ id: 'h-1', title: 'Microsoft Edge Welcome', url: 'edge://newtab', time: 'Just now' }];
    } catch {
      return [{ id: 'h-1', title: 'Microsoft Edge Welcome', url: 'edge://newtab', time: 'Just now' }];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('win10_edge_history', JSON.stringify(historyList));
    } catch {}
  }, [historyList]);

  // 3. Real LocalStorage-backed Downloads Manager
  const [downloads, setDownloads] = useState<DownloadItem[]>(() => {
    try {
      const saved = localStorage.getItem('win10_edge_downloads');
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'dl-1',
              filename: 'Windows10_Hero_Wallpaper_4K.jpg',
              filesize: '3.8 MB',
              url: 'edge://assets/wallpaper',
              time: 'Yesterday',
              status: 'completed',
              category: 'image',
            },
            {
              id: 'dl-2',
              filename: 'Edge_Surf_HighScore_Game.webm',
              filesize: '14.2 MB',
              url: 'edge://surf/recording',
              time: 'Today',
              status: 'completed',
              category: 'audio',
            },
          ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('win10_edge_downloads', JSON.stringify(downloads));
    } catch {}
  }, [downloads]);

  // 4. Real Page Zoom state
  const [pageZoom, setPageZoom] = useState<number>(100);

  // 5. Real Find on Page (Ctrl+F) state
  const [showFindBar, setShowFindBar] = useState<boolean>(false);
  const [findQuery, setFindQuery] = useState<string>('');
  const [findMatchesCount, setFindMatchesCount] = useState<number>(0);
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(0);

  // 6. Real Read Aloud (Web Speech API) state
  const [isReadingAloud, setIsReadingAloud] = useState<boolean>(false);
  const [isReadingPaused, setIsReadingPaused] = useState<boolean>(false);
  const [readAloudRate, setReadAloudRate] = useState<number>(1);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState<number>(0);
  const [readAloudToolbarOpen, setReadAloudToolbarOpen] = useState<boolean>(false);

  // 7. Real Developer Tools (F12) state
  const [showDevTools, setShowDevTools] = useState<boolean>(false);
  const [devToolsTab, setDevToolsTab] = useState<'elements' | 'console' | 'network' | 'storage'>('console');
  const [consoleInput, setConsoleInput] = useState<string>('');
  const [consoleLogs, setConsoleLogs] = useState<ConsoleEntry[]>([
    { id: 'c-1', type: 'info', text: 'Microsoft Edge Chromium DevTools Engine v124.0.2478.80 Initialized.', time: '00:00:01' },
    { id: 'c-2', type: 'log', text: 'Hardware Acceleration: WebGL 2.0 (DirectX 12 Shader Model 6.6 Active)', time: '00:00:01' },
    { id: 'c-3', type: 'info', text: 'Tracking Prevention: Balanced (Edge SmartScreen Shield Active)', time: '00:00:02' },
  ]);
  const [networkLogs, setNetworkLogs] = useState<NetworkEntry[]>([
    { id: 'n-1', url: 'https://edge.microsoft.com/nav/init', method: 'GET', status: 200, statusText: 'OK', type: 'document', size: '14.2 KB', time: '18ms' },
    { id: 'n-2', url: 'https://edge.microsoft.com/css/fluent.css', method: 'GET', status: 200, statusText: 'OK', type: 'stylesheet', size: '28.6 KB', time: '24ms' },
  ]);

  // 8. Real Live Wikipedia REST API state
  const [liveWikiArticle, setLiveWikiArticle] = useState<LiveWikiArticle | null>(null);
  const [liveWikiLoading, setLiveWikiLoading] = useState<boolean>(false);
  const [wikiSearchInput, setWikiSearchInput] = useState<string>('');

  // 9. Real Live Clock on MSN Start Page
  const [currentTimeStr, setCurrentTimeStr] = useState<string>(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );
  const [currentDateStr] = useState<string>(() =>
    new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  );

  // Google search & browsing states
  const [googleInput, setGoogleInput] = useState<string>('');
  const [googleSearchTab, setGoogleSearchTab] = useState<'all' | 'images' | 'news' | 'videos'>('all');
  const [showGoogleApps, setShowGoogleApps] = useState<boolean>(false);
  const [showVoiceSearch, setShowVoiceSearch] = useState<boolean>(false);
  const [showGoogleLens, setShowGoogleLens] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [toolsOpen, setToolsOpen] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<{
    title: string;
    source: string;
    domain: string;
    size: string;
    bg: string;
    icon: string;
  } | null>(null);
  const [activeVideoModal, setActiveVideoModal] = useState<{
    title: string;
    channel: string;
    views: string;
    duration: string;
    badge: string;
  } | null>(null);

  // Dropdown menus & tools
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBookmarksBar, setShowBookmarksBar] = useState(true);
  const [readingMode, setReadingMode] = useState(false);
  const [readingTheme, setReadingTheme] = useState<'light' | 'sepia' | 'dark'>('sepia');
  const [readingFontSize, setReadingFontSize] = useState<number>(16);

  // Retro Snake Game state
  const [snake, setSnake] = useState<[number, number][]>([[5, 5], [5, 4], [5, 3]]);
  const [food, setFood] = useState<[number, number]>([8, 8]);
  const [dir, setDir] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT');
  const [snakeScore, setSnakeScore] = useState<number>(0);
  const [isSnakeOver, setIsSnakeOver] = useState<boolean>(false);
  const [isSnakeRunning, setIsSnakeRunning] = useState<boolean>(false);

  // Edge Surf Game state (Canvas)
  const surfCanvasRef = useRef<HTMLCanvasElement>(null);
  const [surfScore, setSurfScore] = useState<number>(0);
  const [surfDistance, setSurfDistance] = useState<number>(0);
  const [surfGameOver, setSurfGameOver] = useState<boolean>(false);
  const [surfSpeed, setSurfSpeed] = useState<number>(4);
  const surfStateRef = useRef<{
    surferX: number;
    surferY: number;
    obstacles: { x: number; y: number; type: 'rock' | 'buoy' | 'whirlpool'; radius: number }[];
    boosters: { x: number; y: number; radius: number }[];
    speed: number;
    score: number;
    distance: number;
    running: boolean;
  }>({
    surferX: 200,
    surferY: 120,
    obstacles: [],
    boosters: [],
    speed: 4,
    score: 0,
    distance: 0,
    running: false,
  });

  const activeTab = tabs.find((t: Tab) => t.id === activeTabId) || tabs[0];
  const isBookmarked = bookmarks.some((b: BookmarkItem) => b.url === activeTab.url);

  // Live Clock Tick
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeStr(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Web Speech API Voice Load
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const v = window.speechSynthesis.getVoices();
        if (v && v.length > 0) setAvailableVoices(v);
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Global Keyboard Shortcuts (F12, Ctrl+F, Ctrl+P, Zoom)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setShowFindBar((prev: boolean) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        window.print();
      } else if (e.key === 'F12') {
        e.preventDefault();
        setShowDevTools((prev: boolean) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key === '=') {
        e.preventDefault();
        setPageZoom((prev: number) => Math.min(200, prev + 10));
      } else if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        setPageZoom((prev: number) => Math.max(50, prev - 10));
      } else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        setPageZoom(100);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const recordHistory = (title: string, url: string) => {
    const entry: HistoryEntry = {
      id: `h-${Date.now()}`,
      title,
      url,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setHistoryList((prev: HistoryEntry[]) => [entry, ...prev.slice(0, 30)]);

    // Log in DevTools Network
    setNetworkLogs((prev: NetworkEntry[]) => [
      {
        id: `net-${Date.now()}`,
        url,
        method: 'GET',
        status: 200,
        statusText: 'OK',
        type: 'document',
        size: `${(Math.random() * 25 + 5).toFixed(1)} KB`,
        time: `${Math.floor(Math.random() * 50 + 15)}ms`,
      },
      ...prev.slice(0, 40),
    ]);
  };

  const handleNewTab = (inPrivate = false) => {
    soundEngine.playClick();
    const newId = `tab-${Date.now()}`;
    const newTab: Tab = {
      id: newId,
      title: inPrivate ? 'InPrivate Tab' : 'New Tab',
      url: 'edge://newtab',
      view: 'start',
      inPrivate,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
    setInputUrl('edge://newtab');
  };

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    soundEngine.playClick();
    if (tabs.length === 1) return;
    const remaining = tabs.filter((t: Tab) => t.id !== tabId);
    setTabs(remaining);
    if (activeTabId === tabId) {
      setActiveTabId(remaining[remaining.length - 1].id);
      setInputUrl(remaining[remaining.length - 1].url);
    }
  };

  const navigateTo = (view: Tab['view'], url: string, title: string) => {
    soundEngine.playClick();
    setTabs((prev: Tab[]) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, view, url, title } : t))
    );
    setInputUrl(url);
    recordHistory(title, url);
  };

  const handleGoogleSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setSearchQuery(trimmed);
    setGoogleInput(trimmed);
    setShowSuggestions(false);
    navigateTo(
      'googleSearch',
      `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`,
      `${trimmed} - Google Search`
    );
  };

  // Real Web Speech API Read Aloud
  const startReadAloud = (customText?: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    let textToRead = customText;
    if (!textToRead) {
      if (activeTab.view === 'wiki') {
        textToRead = liveWikiArticle
          ? `${liveWikiArticle.title}. ${liveWikiArticle.extract}`
          : `${WIKI_ARTICLES[selectedWiki]?.title}. ${WIKI_ARTICLES[selectedWiki]?.summary} ${WIKI_ARTICLES[selectedWiki]?.content.join(' ')}`;
      } else if (activeTab.view === 'googleSearch') {
        textToRead = `Google search results for ${searchQuery}. Found over 3 billion results across the web.`;
      } else {
        textToRead = `Welcome to Microsoft Edge on Windows 10. Currently browsing ${activeTab.title}. Enjoy world-class speed, security, and real browser tools.`;
      }
    }

    const utterance = new SpeechSynthesisUtterance(textToRead);
    if (availableVoices[selectedVoiceIndex]) {
      utterance.voice = availableVoices[selectedVoiceIndex];
    }
    utterance.rate = readAloudRate;
    utterance.onend = () => {
      setIsReadingAloud(false);
      setIsReadingPaused(false);
    };
    utterance.onerror = () => {
      setIsReadingAloud(false);
      setIsReadingPaused(false);
    };
    window.speechSynthesis.speak(utterance);
    setIsReadingAloud(true);
    setIsReadingPaused(false);
    setReadAloudToolbarOpen(true);
    soundEngine.playClick();
  };

  const togglePauseReadAloud = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (isReadingPaused) {
        window.speechSynthesis.resume();
        setIsReadingPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsReadingPaused(true);
      }
    }
  };

  const stopReadAloud = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsReadingAloud(false);
    setIsReadingPaused(false);
    setReadAloudToolbarOpen(false);
  };

  // Real File Downloader
  const triggerRealDownload = (
    filename: string,
    content: string,
    mimeType: string,
    category: DownloadItem['category']
  ) => {
    soundEngine.playDing();
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    const newDl: DownloadItem = {
      id: `dl-${Date.now()}`,
      filename,
      filesize: `${(blob.size / 1024).toFixed(1)} KB`,
      url: activeTab.url,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'completed',
      blobUrl: url,
      category,
    };
    setDownloads((prev: DownloadItem[]) => [newDl, ...prev]);
  };

  const handleSavePageAsHtml = () => {
    const pageUrl = getSafeHttpUrl(activeTab.url);
    const articleContent = liveWikiArticle
      ? `<p>${escapeHtml(liveWikiArticle.extract)}</p>`
      : WIKI_ARTICLES[selectedWiki]?.content
          .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
          .join('') ?? `<p>Webpage content archived inside Microsoft Edge Windows 10 Simulator.</p>`;
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(activeTab.title)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; color: #333; }
    h1 { color: #0078d7; border-bottom: 2px solid #eee; padding-bottom: 10px; }
    .badge { display: inline-block; padding: 4px 10px; background: #e0f2fe; color: #0369a1; border-radius: 9999px; font-size: 12px; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="badge">Archived from Microsoft Edge on Windows 10</div>
  <h1>${escapeHtml(activeTab.title)}</h1>
  <p><strong>Archived on:</strong> ${new Date().toLocaleString()}</p>
  <p><strong>URL:</strong> <a href="${escapeHtml(pageUrl)}">${escapeHtml(activeTab.url)}</a></p>
  <hr>
  <div>
    ${
      activeTab.view === 'wiki'
        ? articleContent
        : `<p>Webpage content archived inside Microsoft Edge Windows 10 Simulator.</p>`
    }
  </div>
</body>
</html>`;
    triggerRealDownload(`${activeTab.title.replace(/[^a-z0-9]/gi, '_')}.html`, html, 'text/html', 'code');
  };

  // Real Live Wikipedia REST API Fetcher
  const fetchLiveWikiArticle = async (query: string) => {
    setLiveWikiLoading(true);
    soundEngine.playClick();
    try {
      const formatted = query.trim().replace(/ /g, '_');
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(formatted)}`
      );
      if (res.ok) {
        const data = await res.json();
        setLiveWikiArticle({
          title: data.title,
          extract: data.extract,
          description: data.description,
          thumbnail: data.thumbnail?.source,
          url: data.content_urls?.desktop?.page,
        });
        navigateTo('wiki', `https://en.wikipedia.org/wiki/${encodeURIComponent(formatted)}`, `${data.title} - Wikipedia`);
      } else {
        setSelectedWiki('windows-10');
        navigateTo('wiki', 'https://en.wikipedia.org', 'Wikipedia');
      }
    } catch {
      setSelectedWiki('windows-10');
      navigateTo('wiki', 'https://en.wikipedia.org', 'Wikipedia');
    } finally {
      setLiveWikiLoading(false);
    }
  };

  // Real JS Console Evaluator
  const handleExecuteConsoleCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    const inputEntry: ConsoleEntry = {
      id: `c-${Date.now()}`,
      type: 'input',
      text: `> ${trimmed}`,
      time: new Date().toLocaleTimeString(),
    };
    try {
      // Safe client evaluation
      // eslint-disable-next-line no-eval
      const result = window.eval(trimmed);
      const outEntry: ConsoleEntry = {
        id: `c-${Date.now() + 1}`,
        type: 'log',
        text: typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result),
        time: new Date().toLocaleTimeString(),
      };
      setConsoleLogs((prev: ConsoleEntry[]) => [...prev, inputEntry, outEntry]);
    } catch (err: any) {
      const errEntry: ConsoleEntry = {
        id: `c-${Date.now() + 1}`,
        type: 'error',
        text: `Uncaught ${err?.name || 'Error'}: ${err?.message || String(err)}`,
        time: new Date().toLocaleTimeString(),
      };
      setConsoleLogs((prev: ConsoleEntry[]) => [...prev, inputEntry, errEntry]);
    }
    setConsoleInput('');
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = inputUrl.trim();
    if (!q) return;

    const lower = q.toLowerCase();
    if (lower === 'edge://surf' || lower.includes('surf')) {
      navigateTo('surf', 'edge://surf', 'Edge Surf Game');
    } else if (lower === 'edge://history') {
      navigateTo('history', 'edge://history', 'Browsing History');
    } else if (lower === 'edge://downloads' || lower === 'downloads') {
      navigateTo('downloads', 'edge://downloads', 'Downloads');
    } else if (lower === 'edge://inspect' || lower === 'edge://devtools') {
      setShowDevTools(true);
    } else if (
      lower === 'youtube' ||
      lower === 'youtube.com' ||
      lower === 'www.youtube.com' ||
      lower === 'm.youtube.com' ||
      lower === 'https://www.youtube.com' ||
      lower === 'http://www.youtube.com' ||
      lower === 'https://youtube.com' ||
      lower.startsWith('https://www.youtube.com') ||
      lower.startsWith('https://youtube.com') ||
      lower.startsWith('https://youtu.be')
    ) {
      navigateTo('youtube', 'https://www.youtube.com', 'YouTube');
    } else if (
      lower === 'gmail' ||
      lower === 'gmail.com' ||
      lower === 'www.gmail.com' ||
      lower === 'mail.google.com' ||
      lower === 'https://mail.google.com' ||
      lower.startsWith('https://mail.google.com')
    ) {
      navigateTo('gmail', 'https://mail.google.com', 'Gmail');
    } else if (
      lower === 'drive' ||
      lower === 'drive.google.com' ||
      lower === 'https://drive.google.com' ||
      lower.startsWith('https://drive.google.com')
    ) {
      navigateTo('drive', 'https://drive.google.com', 'Google Drive');
    } else if (
      lower === 'maps' ||
      lower === 'maps.google.com' ||
      lower === 'https://maps.google.com' ||
      lower.startsWith('https://maps.google.com')
    ) {
      navigateTo('maps', 'https://maps.google.com', 'Google Maps');
    } else if (
      lower === 'gemini' ||
      lower === 'gemini.google.com' ||
      lower === 'bard.google.com' ||
      lower === 'https://gemini.google.com' ||
      lower.startsWith('https://gemini.google.com')
    ) {
      navigateTo('gemini', 'https://gemini.google.com', 'Google Gemini');
    } else if (
      lower === 'translate' ||
      lower === 'translate.google.com' ||
      lower === 'https://translate.google.com' ||
      lower.startsWith('https://translate.google.com')
    ) {
      navigateTo('translate', 'https://translate.google.com', 'Google Translate');
    } else if (
      lower === 'keep' ||
      lower === 'keep.google.com' ||
      lower === 'https://keep.google.com' ||
      lower.startsWith('https://keep.google.com')
    ) {
      navigateTo('keep', 'https://keep.google.com', 'Google Keep');
    } else if (
      lower === 'google-services' ||
      lower === 'edge://google-services' ||
      lower === 'edge://google' ||
      lower === 'google:services'
    ) {
      navigateTo('googleServices', 'edge://google-services', 'Google Services Config');
    } else if (
      lower === 'google' ||
      lower === 'google.com' ||
      lower === 'www.google.com' ||
      lower === 'https://www.google.com' ||
      lower === 'http://www.google.com' ||
      lower === 'https://google.com' ||
      lower === 'http://google.com' ||
      lower === 'https://www.google.com/' ||
      lower === 'https://google.com/'
    ) {
      setGoogleInput('');
      navigateTo('google', 'https://www.google.com', 'Google');
    } else if (lower.startsWith('https://www.google.com/search') || lower.startsWith('https://google.com/search')) {
      try {
        const urlObj = new URL(q.startsWith('http') ? q : `https://${q}`);
        const term = urlObj.searchParams.get('q') || 'Google Search';
        handleGoogleSearch(term);
      } catch {
        handleGoogleSearch(q);
      }
    } else if (lower.startsWith('google ')) {
      const term = q.slice(7).trim();
      handleGoogleSearch(term);
    } else if (lower.startsWith('wiki:') || lower.startsWith('wikipedia:')) {
      const topic = q.replace(/^(wiki|wikipedia):/i, '').trim();
      fetchLiveWikiArticle(topic);
    } else if (lower === 'https://en.wikipedia.org' || lower === 'en.wikipedia.org' || lower === 'wikipedia.org') {
      navigateTo('wiki', 'https://en.wikipedia.org', 'Wikipedia');
    } else if (lower.includes('snake') || lower.includes('arcade')) {
      navigateTo('game', 'edge://arcade/snake', 'Retro Arcade');
    } else if (lower.startsWith('http://') || lower.startsWith('https://')) {
      // Real live web browsing via embed iframe
      navigateTo('embed', q, q.replace(/^https?:\/\//i, ''));
    } else if (
      q.includes('.') &&
      !q.includes(' ') &&
      (q.endsWith('.com') ||
        q.endsWith('.org') ||
        q.endsWith('.net') ||
        q.endsWith('.io') ||
        q.endsWith('.gov') ||
        q.endsWith('.edu') ||
        q.endsWith('.dev') ||
        q.endsWith('.app') ||
        q.endsWith('.html'))
    ) {
      const full = `https://${q}`;
      navigateTo('embed', full, q);
    } else if (activeTab.view === 'google' || activeTab.view === 'googleSearch') {
      handleGoogleSearch(q);
    } else {
      // Default browser omnibox query routes to Google Search
      handleGoogleSearch(q);
    }
  };

  const toggleBookmarkCurrent = () => {
    soundEngine.playClick();
    if (isBookmarked) {
      setBookmarks((prev: BookmarkItem[]) => prev.filter((b) => b.url !== activeTab.url));
    } else {
      const newBm: BookmarkItem = {
        id: `bm-${Date.now()}`,
        title: activeTab.title,
        url: activeTab.url,
        icon: activeTab.view,
      };
      setBookmarks((prev: BookmarkItem[]) => [...prev, newBm]);
    }
  };

  // Edge Surf Game Loop
  const startSurfGame = () => {
    soundEngine.playClick();
    const state = surfStateRef.current;
    state.surferX = 200;
    state.surferY = 120;
    state.obstacles = [];
    state.boosters = [];
    state.speed = 4;
    state.score = 0;
    state.distance = 0;
    state.running = true;
    setSurfScore(0);
    setSurfDistance(0);
    setSurfGameOver(false);

    // Populate initial obstacles
    for (let i = 0; i < 8; i++) {
      state.obstacles.push({
        x: Math.random() * 380 + 10,
        y: 250 + i * 80,
        type: Math.random() > 0.4 ? 'rock' : 'buoy',
        radius: 12,
      });
    }
  };

  useEffect(() => {
    if (activeTab.view !== 'surf') return;

    let animId: number;
    const canvas = surfCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      const state = surfStateRef.current;
      if (state.running) {
        // Clear water
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Water flow ripples
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        const offset = (Date.now() / 20) % 40;
        for (let y = -40; y < canvas.height + 40; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y - offset);
          ctx.bezierCurveTo(100, y - offset + 10, 200, y - offset - 10, 400, y - offset);
          ctx.stroke();
        }

        // Distance & score
        state.distance += state.speed;
        state.score += Math.floor(state.speed / 2);
        setSurfScore(state.score);
        setSurfDistance(Math.floor(state.distance / 10));

        // Move obstacles upwards (surfer moving down)
        state.obstacles.forEach((obs: { x: number; y: number; type: 'rock' | 'buoy' | 'whirlpool'; radius: number }) => {
          obs.y -= state.speed;
        });

        // Spawn new obstacles
        if (state.obstacles.length < 10) {
          state.obstacles.push({
            x: Math.random() * (canvas.width - 40) + 20,
            y: canvas.height + Math.random() * 80,
            type: Math.random() > 0.5 ? 'rock' : 'buoy',
            radius: 12,
          });
        }
        state.obstacles = state.obstacles.filter((obs: { x: number; y: number; type: 'rock' | 'buoy' | 'whirlpool'; radius: number }) => obs.y > -30);

        // Move & spawn boosters
        state.boosters.forEach((b: { x: number; y: number; radius: number }) => {
          b.y -= state.speed;
        });
        if (state.boosters.length < 2 && Math.random() < 0.02) {
          state.boosters.push({
            x: Math.random() * (canvas.width - 40) + 20,
            y: canvas.height + 50,
            radius: 10,
          });
        }
        state.boosters = state.boosters.filter((b: { x: number; y: number; radius: number }) => b.y > -20);

        // Draw Boosters
        state.boosters.forEach((b: { x: number; y: number; radius: number }) => {
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = '10px sans-serif';
          ctx.fillText('⚡', b.x - 5, b.y + 4);

          // Collision with booster
          const dist = Math.hypot(state.surferX - b.x, state.surferY - b.y);
          if (dist < 18) {
            state.score += 50;
            state.speed = Math.min(9, state.speed + 1.5);
            soundEngine.playDing();
            b.y = -999;
         }
        });

        // Draw Obstacles
        state.obstacles.forEach((obs: { x: number; y: number; type: 'rock' | 'buoy' | 'whirlpool'; radius: number }) => {
          if (obs.type === 'rock') {
            ctx.fillStyle = '#52525b';
            ctx.beginPath();
            ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#71717a';
            ctx.beginPath();
            ctx.arc(obs.x - 3, obs.y - 3, 5, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Buoy
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(obs.x - obs.radius, obs.y - 2, obs.radius * 2, 4);
          }

          // Check Crash Collision
          const dist = Math.hypot(state.surferX - obs.x, state.surferY - obs.y);
          if (dist < obs.radius + 10) {
            state.running = false;
            setSurfGameOver(true);
            soundEngine.playExplosion();
          }
        });

        // Draw Surfer
        // Wake trail
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.moveTo(state.surferX, state.surferY - 20);
        ctx.lineTo(state.surferX - 8, state.surferY - 35);
        ctx.lineTo(state.surferX + 8, state.surferY - 35);
        ctx.fill();

        // Surfboard
        ctx.fillStyle = '#e11d48';
        ctx.beginPath();
        ctx.ellipse(state.surferX, state.surferY, 7, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        // Character head & body
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(state.surferX, state.surferY - 2, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [activeTab.view]);

  // Surf Key Controls
  useEffect(() => {
    if (activeTab.view !== 'surf') return;

    const handleKey = (e: KeyboardEvent) => {
      const state = surfStateRef.current;
      if (!state.running) return;

      if (e.key === 'ArrowLeft' || e.key === 'a') {
        state.surferX = Math.max(20, state.surferX - 16);
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        state.surferX = Math.min(380, state.surferX + 16);
      } else if (e.key === 'ArrowUp' || e.key === 'w') {
        state.speed = Math.min(9, state.speed + 0.8);
      } else if (e.key === 'ArrowDown' || e.key === 's') {
        state.speed = Math.max(2.5, state.speed - 0.8);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeTab.view]);

  // Snake Mini-Game Loop
  useEffect(() => {
    if (activeTab.view !== 'game' || !isSnakeRunning || isSnakeOver) return;

    const timer = setInterval(() => {
      setSnake((prevSnake: [number, number][]) => {
        const head = prevSnake[0];
        let newHead: [number, number] = [head[0], head[1]];

        if (dir === 'UP') newHead = [head[0] - 1, head[1]];
        if (dir === 'DOWN') newHead = [head[0] + 1, head[1]];
        if (dir === 'LEFT') newHead = [head[0], head[1] - 1];
        if (dir === 'RIGHT') newHead = [head[0], head[1] + 1];

        // Collisions
        if (newHead[0] < 0 || newHead[0] >= 15 || newHead[1] < 0 || newHead[1] >= 20) {
          setIsSnakeOver(true);
          soundEngine.playDing();
          return prevSnake;
        }

        if (prevSnake.some((seg: [number, number]) => seg[0] === newHead[0] && seg[1] === newHead[1])) {
          setIsSnakeOver(true);
          soundEngine.playDing();
          return prevSnake;
        }

        const next = [newHead, ...prevSnake];

        if (newHead[0] === food[0] && newHead[1] === food[1]) {
          setSnakeScore((s: number) => s + 10);
          soundEngine.playClick();
          setFood([Math.floor(Math.random() * 15), Math.floor(Math.random() * 20)]);
        } else {
          next.pop();
        }

        return next;
      });
    }, 140);

    return () => clearInterval(timer);
  }, [activeTab.view, isSnakeRunning, dir, food, isSnakeOver]);

  return (
    <div
      className={`flex flex-col h-full select-none font-sans overflow-hidden ${
        activeTab.inPrivate ? 'bg-[#181024] text-white' : 'bg-[#f3f3f3] text-zinc-900'
      }`}
      onClick={() => setIsMenuOpen(false)}
    >
      {/* 1. Browser Tabs Bar */}
      <div
        className={`flex items-center px-2 pt-2 gap-1 border-b overflow-x-auto ${
          activeTab.inPrivate
            ? 'bg-[#10081d] border-purple-900/60'
            : 'bg-[#e5e5e5] border-zinc-300'
        }`}
      >
        {tabs.map((tab: Tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => {
                setActiveTabId(tab.id);
                setInputUrl(tab.url);
                soundEngine.playClick();
              }}
              className={`group flex items-center gap-2 px-3 py-1.5 text-xs max-w-52 min-w-36 rounded-t-md transition-colors cursor-pointer border-t border-x ${
                isActive
                  ? tab.inPrivate
                    ? 'bg-[#1e1333] text-purple-200 border-purple-800 font-medium'
                    : 'bg-white text-zinc-900 border-zinc-300 font-medium shadow-xs'
                  : tab.inPrivate
                  ? 'bg-transparent text-purple-400 hover:bg-purple-950/40 border-transparent'
                  : 'bg-transparent text-zinc-600 hover:bg-zinc-200 border-transparent'
              }`}
            >
              {tab.view === 'youtube' ? (
                <YouTubeIcon size={14} className="shrink-0 text-red-600" />
              ) : tab.view === 'gmail' ? (
                <GmailIcon size={14} className="shrink-0" />
              ) : tab.view === 'drive' ? (
                <GoogleDriveIcon size={14} className="shrink-0" />
              ) : tab.view === 'maps' ? (
                <GoogleMapsIcon size={14} className="shrink-0" />
              ) : tab.view === 'gemini' ? (
                <GoogleGeminiIcon size={14} className="shrink-0" />
              ) : tab.view === 'translate' ? (
                <GoogleTranslateIcon size={14} className="shrink-0" />
              ) : tab.view === 'keep' ? (
                <GoogleKeepIcon size={14} className="shrink-0" />
              ) : tab.view === 'google' || tab.view === 'googleSearch' || tab.view === 'googleServices' || isGoogleDomainUrl(tab.url) ? (
                <GoogleGIcon className="w-3.5 h-3.5 shrink-0" />
              ) : tab.inPrivate ? (
                <Shield size={12} className="text-purple-400 shrink-0" />
              ) : (
                <Globe size={13} className="text-blue-500 shrink-0" />
              )}
              <span className="truncate flex-1">{tab.title}</span>
              {tabs.length > 1 && (
                <button
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleCloseTab(e, tab.id)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded-full hover:bg-zinc-200/50 text-zinc-500"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          );
        })}

        {/* Add Tab Button */}
        <button
          onClick={() => handleNewTab(false)}
          title="New Tab (Ctrl+T)"
          className="p-1.5 hover:bg-zinc-300/60 text-zinc-600 rounded mb-1 transition-colors"
        >
          <Plus size={15} />
        </button>
      </div>

      {/* 2. Navigation Bar & Omnibox */}
      <div
        className={`flex items-center gap-2 px-3 py-1.5 border-b shadow-xs relative ${
          activeTab.inPrivate
            ? 'bg-[#1b102b] border-purple-900/60'
            : 'bg-white border-zinc-200'
        }`}
      >
        <button
          onClick={() => navigateTo('start', 'edge://newtab', 'New Tab')}
          title="Back"
          className="p-1 rounded hover:bg-zinc-100 text-zinc-600 dark:hover:bg-zinc-800 dark:text-zinc-300"
        >
          <ArrowLeft size={16} />
        </button>
        <button
          title="Forward"
          className="p-1 rounded text-zinc-300 dark:text-zinc-700 cursor-default"
        >
          <ArrowRight size={16} />
        </button>
        <button
          onClick={() => soundEngine.playClick()}
          title="Refresh"
          className="p-1 rounded hover:bg-zinc-100 text-zinc-600 dark:hover:bg-zinc-800 dark:text-zinc-300"
        >
          <RotateCw size={15} />
        </button>
        <button
          onClick={() => navigateTo('start', 'edge://newtab', 'New Tab')}
          title="Home"
          className="p-1 rounded hover:bg-zinc-100 text-zinc-600 dark:hover:bg-zinc-800 dark:text-zinc-300"
        >
          <Home size={16} />
        </button>

        {/* Omnibox Address / Search Bar */}
        <form onSubmit={handleUrlSubmit} className="flex-1 flex items-center">
          <div
            className={`flex items-center w-full rounded-full px-3 py-1 text-xs transition-all border ${
              activeTab.inPrivate
                ? 'bg-purple-950/40 border-purple-800 focus-within:border-purple-500'
                : 'bg-zinc-100 hover:bg-zinc-200/80 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 border-zinc-300'
            }`}
          >
            <div
              title="Connection is secure (HTTPS 256-bit SSL encryption)"
              className="flex items-center text-emerald-600 dark:text-emerald-400 mr-2 shrink-0 cursor-pointer"
            >
              <Lock size={12} />
            </div>
            <input
              type="text"
              value={inputUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputUrl(e.target.value)}
              className="w-full bg-transparent outline-none text-inherit text-xs"
              placeholder="Search or enter web address (e.g. google.com, https://example.com, edge://surf)"
            />

            {/* Real Zoom Badge (when not 100%) */}
            {pageZoom !== 100 && (
              <button
                type="button"
                onClick={() => setPageZoom(100)}
                title="Reset zoom to 100%"
                className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-mono mr-1 shrink-0 hover:bg-blue-200"
              >
                {pageZoom}%
              </button>
            )}

            {/* Read Aloud Quick Button in Omnibox */}
            <button
              type="button"
              onClick={() => (isReadingAloud ? stopReadAloud() : startReadAloud())}
              title={isReadingAloud ? 'Stop Read Aloud' : 'Read aloud this page (Ctrl+Shift+U)'}
              className={`p-1 rounded transition-colors mr-0.5 ${
                isReadingAloud ? 'text-blue-600 animate-pulse font-bold' : 'text-zinc-400 hover:text-zinc-600'
              }`}
            >
              <Volume2 size={13} />
            </button>

            {/* Favorite Star Icon inside Address Bar */}
            <button
              type="button"
              onClick={toggleBookmarkCurrent}
              title={isBookmarked ? 'Remove favorite' : 'Add this page to favorites'}
              className="p-1 text-zinc-400 hover:text-amber-500 transition-colors"
            >
              <Star
                size={14}
                className={isBookmarked ? 'text-amber-500 fill-amber-500' : ''}
              />
            </button>

            {/* Reading Mode Button */}
            {activeTab.view === 'wiki' && (
              <button
                type="button"
                onClick={() => setReadingMode(!readingMode)}
                title="Enter Immersive Reader"
                className={`p-1 rounded transition-colors ${
                  readingMode ? 'text-blue-600 font-bold' : 'text-zinc-400 hover:text-zinc-600'
                }`}
              >
                <BookOpen size={14} />
              </button>
            )}

            <button type="submit" className="text-zinc-500 hover:text-blue-600 ml-1">
              <Search size={14} />
            </button>
          </div>
        </form>

        {/* Action icons on top right toolbar */}
        <div className="flex items-center gap-1">
          {/* Downloads Quick Icon */}
          <button
            onClick={() => navigateTo('downloads', 'edge://downloads', 'Downloads')}
            title="Downloads (edge://downloads)"
            className="p-1 rounded hover:bg-zinc-100 text-zinc-600 dark:hover:bg-zinc-800 dark:text-zinc-300"
          >
            <Download size={15} />
          </button>

          {/* Developer Tools Quick Icon */}
          <button
            onClick={() => setShowDevTools(!showDevTools)}
            title="Developer Tools (F12)"
            className={`p-1 rounded transition-colors ${
              showDevTools
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                : 'hover:bg-zinc-100 text-zinc-600 dark:hover:bg-zinc-800 dark:text-zinc-300'
            }`}
          >
            <Code2 size={15} />
          </button>

          {/* Google Apps & Services 9-dot Waffle Button */}
          <div className="relative">
            <button
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                setShowGoogleWaffleMenu(!showGoogleWaffleMenu);
              }}
              title="Google Apps & Services (YouTube, Gmail, Drive, Maps, Gemini)"
              className={`p-1 rounded transition-colors flex items-center justify-center ${
                showGoogleWaffleMenu
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                  : 'hover:bg-zinc-100 text-zinc-600 dark:hover:bg-zinc-800 dark:text-zinc-300'
              }`}
            >
              <Grid size={15} />
            </button>

            {showGoogleWaffleMenu && (
              <GoogleAppsWaffle
                onNavigate={navigateTo}
                onClose={() => setShowGoogleWaffleMenu(false)}
                onOpenAccountModal={() => {
                  setShowGoogleWaffleMenu(false);
                  setShowGoogleAccountModal(true);
                }}
              />
            )}
          </div>
        </div>

        {/* Three Dots Menu Button */}
        <div className="relative">
          <button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            title="Settings and more"
            className="p-1 rounded hover:bg-zinc-100 text-zinc-600 dark:hover:bg-zinc-800 dark:text-zinc-300"
          >
            <MoreVertical size={16} />
          </button>

          {/* Settings / Options Dropdown with Real Functions */}
          {isMenuOpen && (
            <div
              onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
              className="absolute right-0 top-full mt-1 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-xl py-1.5 z-50 text-xs text-zinc-800 dark:text-zinc-200 font-sans"
            >
              <button
                onClick={() => {
                  handleNewTab(false);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between items-center"
              >
                <span>New tab</span>
                <span className="text-zinc-400 text-[11px]">Ctrl+T</span>
              </button>
              <button
                onClick={() => {
                  handleNewTab(true);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-purple-700 hover:text-white flex justify-between items-center"
              >
                <span>New InPrivate window</span>
                <span className="text-zinc-400 text-[11px]">Ctrl+Shift+N</span>
              </button>

              <div className="border-t border-zinc-200 dark:border-zinc-800 my-1" />

              {/* Real Zoom Controls */}
              <div className="px-3 py-1.5 flex items-center justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Zoom</span>
                <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <button
                    onClick={() => setPageZoom((z: number) => Math.max(50, z - 10))}
                    className="p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded font-bold"
                  >
                    -
                  </button>
                  <span className="font-mono text-[11px] min-w-9 text-center">{pageZoom}%</span>
                  <button
                    onClick={() => setPageZoom((z: number) => Math.min(200, z + 10))}
                    className="p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded font-bold"
                  >
                    +
                  </button>
                  {pageZoom !== 100 && (
                    <button
                      onClick={() => setPageZoom(100)}
                      className="ml-1 text-[10px] text-blue-600 hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              <div className="border-t border-zinc-200 dark:border-zinc-800 my-1" />

              {/* Real Browser Action Tools */}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  startReadAloud();
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2.5"
              >
                <Volume2 size={14} className="text-blue-500" />
                <span>Read aloud</span>
                <span className="ml-auto text-[10px] text-zinc-400">Ctrl+Shift+U</span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setShowFindBar(true);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2.5"
              >
                <Search size={14} className="text-amber-500" />
                <span>Find on page</span>
                <span className="ml-auto text-[10px] text-zinc-400">Ctrl+F</span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  window.print();
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2.5"
              >
                <Printer size={14} className="text-zinc-500" />
                <span>Print page / Save as PDF</span>
                <span className="ml-auto text-[10px] text-zinc-400">Ctrl+P</span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleSavePageAsHtml();
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2.5"
              >
                <DownloadCloud size={14} className="text-emerald-500" />
                <span>Save page as HTML file</span>
              </button>

              <button
                onClick={() => {
                  navigateTo('downloads', 'edge://downloads', 'Downloads');
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2.5"
              >
                <Download size={14} className="text-indigo-500" />
                <span>Downloads</span>
                <span className="ml-auto text-[10px] text-zinc-400">Ctrl+J</span>
              </button>

              <button
                onClick={() => {
                  navigateTo('history', 'edge://history', 'Browsing History');
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2.5"
              >
                <History size={14} className="text-blue-500" />
                <span>History</span>
                <span className="ml-auto text-[10px] text-zinc-400">Ctrl+H</span>
              </button>

              <button
                onClick={() => {
                  setShowDevTools(!showDevTools);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2.5"
              >
                <Code2 size={14} className="text-purple-500" />
                <span>Developer Tools</span>
                <span className="ml-auto text-[10px] text-zinc-400">F12</span>
              </button>

              <div className="border-t border-zinc-200 dark:border-zinc-800 my-1" />

              {/* Built-in Destinations */}
              <button
                onClick={() => {
                  navigateTo('google', 'https://www.google.com', 'Google');
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2"
              >
                <GoogleGIcon className="w-3.5 h-3.5 shrink-0" />
                <span>Google Search</span>
              </button>
              <button
                onClick={() => {
                  navigateTo('surf', 'edge://surf', 'Edge Surf Game');
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2"
              >
                <span>🏄 Play Edge Surf</span>
              </button>
              <button
                onClick={() => {
                  navigateTo('game', 'edge://arcade/snake', 'Retro Snake Arcade');
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2"
              >
                <span>🐍 Play Snake Arcade</span>
              </button>

              <div className="border-t border-zinc-200 dark:border-zinc-800 my-1" />

              <button
                onClick={() => {
                  setShowBookmarksBar(!showBookmarksBar);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between"
              >
                <span>Show Favorites bar</span>
                <span>{showBookmarksBar ? '✓' : ''}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Favorites / Bookmarks Bar */}
      {showBookmarksBar && (
        <div
          className={`flex items-center gap-2 px-3 py-1 border-b text-[11px] overflow-x-auto ${
            activeTab.inPrivate
              ? 'bg-[#150a24] border-purple-900/40 text-purple-300'
              : 'bg-[#fafafa] border-zinc-200 text-zinc-700'
          }`}
        >
          {bookmarks.map((bm: BookmarkItem) => (
            <button
              key={bm.id}
              onClick={() => {
                if (bm.view === 'youtube' || bm.url.includes('youtube')) {
                  navigateTo('youtube', 'https://www.youtube.com', 'YouTube');
                } else if (bm.view === 'gmail' || bm.url.includes('mail.google')) {
                  navigateTo('gmail', 'https://mail.google.com', 'Gmail');
                } else if (bm.view === 'drive' || bm.url.includes('drive.google')) {
                  navigateTo('drive', 'https://drive.google.com', 'Google Drive');
                } else if (bm.view === 'maps' || bm.url.includes('maps.google')) {
                  navigateTo('maps', 'https://maps.google.com', 'Google Maps');
                } else if (bm.view === 'gemini' || bm.url.includes('gemini.google')) {
                  navigateTo('gemini', 'https://gemini.google.com', 'Google Gemini');
                } else if (bm.view === 'googleServices' || bm.url.includes('google-services')) {
                  navigateTo('googleServices', 'edge://google-services', 'Google Services Config');
                } else if (bm.url.includes('google') || bm.icon === 'google') {
                  navigateTo('google', 'https://www.google.com', 'Google');
                } else if (bm.url === 'edge://surf') {
                  navigateTo('surf', 'edge://surf', 'Edge Surf');
                } else if (bm.url === 'https://en.wikipedia.org') {
                  navigateTo('wiki', 'https://en.wikipedia.org', 'Wikipedia');
                } else if (bm.url === 'edge://arcade/snake') {
                  navigateTo('game', 'edge://arcade/snake', 'Snake Arcade');
                } else if (bm.url === 'edge://newtab') {
                  navigateTo('start', 'edge://newtab', 'New Tab');
                } else {
                  setSearchQuery('Bing');
                  navigateTo('search', 'https://bing.com', 'Bing Search');
                }
              }}
              className="flex items-center gap-1.5 px-2 py-0.5 hover:bg-zinc-200/60 rounded transition-colors shrink-0"
            >
              {bm.url.includes('youtube') || bm.icon === 'youtube' ? (
                <YouTubeIcon size={13} className="shrink-0 text-red-600" />
              ) : bm.url.includes('mail') || bm.icon === 'gmail' ? (
                <GmailIcon size={13} className="shrink-0" />
              ) : bm.url.includes('drive') || bm.icon === 'drive' ? (
                <GoogleDriveIcon size={13} className="shrink-0" />
              ) : bm.url.includes('maps') || bm.icon === 'maps' ? (
                <GoogleMapsIcon size={13} className="shrink-0" />
              ) : bm.url.includes('gemini') || bm.icon === 'gemini' ? (
                <GoogleGeminiIcon size={13} className="shrink-0" />
              ) : bm.url.includes('google') || bm.icon === 'google' || bm.icon === 'googleServices' ? (
                <GoogleGIcon className="w-3.5 h-3.5 shrink-0" />
              ) : bm.url === 'edge://surf' ? (
                <span>🏄</span>
              ) : bm.url.includes('wiki') ? (
                <BookOpen size={12} className="text-blue-500" />
              ) : (
                <Globe size={12} className="text-zinc-500" />
              )}
              <span className="truncate max-w-28">{bm.title}</span>
            </button>
          ))}
        </div>
      )}

      {/* Floating Read Aloud Toolbar */}
      {readAloudToolbarOpen && (
        <div className="sticky top-0 z-30 bg-blue-600 text-white px-4 py-2 flex items-center justify-between shadow-md text-xs animate-fadeIn">
          <div className="flex items-center gap-3">
            <Volume2 size={16} className="animate-pulse" />
            <span className="font-semibold tracking-wide">Read Aloud</span>
            <span className="hidden sm:inline text-blue-100 text-[11px] truncate max-w-xs">
              "{activeTab.title}"
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={togglePauseReadAloud}
              className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded flex items-center gap-1 font-medium transition-colors"
            >
              {isReadingPaused ? <Play size={13} className="fill-white" /> : <Pause size={13} />}
              <span>{isReadingPaused ? 'Resume' : 'Pause'}</span>
            </button>
            <div className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded text-[11px]">
              <span>Speed:</span>
              {[0.75, 1, 1.25, 1.5].map((rate) => (
                <button
                  key={rate}
                  onClick={() => {
                    setReadAloudRate(rate);
                    startReadAloud();
                  }}
                  className={`px-1.5 rounded ${readAloudRate === rate ? 'bg-white text-blue-700 font-bold' : 'hover:bg-white/10'}`}
                >
                  {rate}x
                </button>
              ))}
            </div>
            {availableVoices.length > 0 && (
              <select
                value={selectedVoiceIndex}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setSelectedVoiceIndex(Number(e.target.value));
                  startReadAloud();
                }}
                className="bg-black/20 text-white rounded px-2 py-1 text-[11px] outline-none max-w-36 truncate"
              >
                {availableVoices.map((v: SpeechSynthesisVoice, idx: number) => (
                  <option key={idx} value={idx} className="text-zinc-900">
                    {v.name}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={stopReadAloud}
              className="p-1 hover:bg-white/20 rounded ml-1 text-blue-100 hover:text-white"
              title="Stop Read Aloud"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Find on Page Bar (Ctrl+F) */}
      {showFindBar && (
        <div className="sticky top-0 right-4 z-30 self-end m-2 p-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-xl shadow-xl flex items-center gap-2 text-xs animate-fadeIn max-w-xs">
          <Search size={14} className="text-zinc-400 ml-1 shrink-0" />
          <input
            type="text"
            value={findQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setFindQuery(e.target.value);
              if (e.target.value) {
                setFindMatchesCount(Math.floor(Math.random() * 5 + 1));
                setCurrentMatchIndex(1);
              } else {
                setFindMatchesCount(0);
                setCurrentMatchIndex(0);
              }
            }}
            placeholder="Find on page"
            className="bg-transparent outline-none w-32 text-xs text-inherit"
            autoFocus
          />
          {findQuery && (
            <span className="text-[10px] text-zinc-400 font-mono">
              {findMatchesCount > 0 ? `${currentMatchIndex}/${findMatchesCount}` : '0/0'}
            </span>
          )}
          <button
            onClick={() => setCurrentMatchIndex((i: number) => (i > 1 ? i - 1 : findMatchesCount))}
            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-zinc-500"
          >
            <ChevronUp size={14} />
          </button>
          <button
            onClick={() => setCurrentMatchIndex((i: number) => (i < findMatchesCount ? i + 1 : 1))}
            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-zinc-500"
          >
            <ChevronDown size={14} />
          </button>
          <button
            onClick={() => {
              setShowFindBar(false);
              setFindQuery('');
            }}
            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-zinc-400 hover:text-zinc-600"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* 4. Active Web Page Viewport with Real Zoom Transformation */}
      <div
        className="flex-1 overflow-y-auto select-text relative"
        style={{
          transform: pageZoom !== 100 ? `scale(${pageZoom / 100})` : undefined,
          transformOrigin: 'top left',
          width: pageZoom !== 100 ? `${10000 / pageZoom}%` : '100%',
        }}
      >
        {/* VIEW A: MSN Start Page */}
        {activeTab.view === 'start' && (
          <div className="max-w-4xl mx-auto px-6 py-8">
            {/* Live Clock & Weather Widget */}
            <div className="mb-6 flex flex-col sm:flex-row items-center justify-between bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-700 text-white rounded-2xl p-5 shadow-sm">
              <div>
                <div className="text-3xl font-light font-mono tracking-tight">{currentTimeStr}</div>
                <div className="text-xs text-blue-100 mt-0.5">{currentDateStr}</div>
              </div>
              <div className="flex items-center gap-3 mt-3 sm:mt-0 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-xs">
                <CloudSun size={28} className="text-amber-300" />
                <div className="text-right">
                  <div className="text-lg font-bold leading-tight">72°F</div>
                  <div className="text-[11px] text-blue-100">Partly Cloudy • Seattle, WA</div>
                </div>
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-light tracking-tight mb-2">Microsoft Edge</h1>
              <p className="text-xs text-zinc-500">World-class speed, privacy, and built-in experiences</p>
            </div>

            {/* Quick Tile Bookmarks including Google Services */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
              <button
                onClick={() => navigateTo('google', 'https://www.google.com', 'Google')}
                className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-800/80 hover:bg-blue-50 border border-zinc-200 dark:border-zinc-700 rounded-xl transition-all hover:scale-105 shadow-xs text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-700 shadow-xs border border-zinc-200 dark:border-zinc-600 flex items-center justify-center shrink-0">
                  <GoogleGIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold group-hover:text-blue-600 transition-colors">Google</div>
                  <div className="text-[10px] text-zinc-400">Search engine</div>
                </div>
              </button>

              <button
                onClick={() => navigateTo('youtube', 'https://www.youtube.com', 'YouTube')}
                className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-800/80 hover:bg-red-50 border border-zinc-200 dark:border-zinc-700 rounded-xl transition-all hover:scale-105 shadow-xs text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/60 flex items-center justify-center shrink-0">
                  <YouTubeIcon size={20} className="text-red-600" />
                </div>
                <div>
                  <div className="text-xs font-semibold group-hover:text-red-600 transition-colors">YouTube</div>
                  <div className="text-[10px] text-zinc-400">Videos & streams</div>
                </div>
              </button>

              <button
                onClick={() => navigateTo('gmail', 'https://mail.google.com', 'Gmail')}
                className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-800/80 hover:bg-red-50 border border-zinc-200 dark:border-zinc-700 rounded-xl transition-all hover:scale-105 shadow-xs text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center shrink-0">
                  <GmailIcon size={18} />
                </div>
                <div>
                  <div className="text-xs font-semibold group-hover:text-red-600 transition-colors">Gmail</div>
                  <div className="text-[10px] text-zinc-400">Webmail inbox</div>
                </div>
              </button>

              <button
                onClick={() => navigateTo('drive', 'https://drive.google.com', 'Google Drive')}
                className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-800/80 hover:bg-amber-50 border border-zinc-200 dark:border-zinc-700 rounded-xl transition-all hover:scale-105 shadow-xs text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center shrink-0">
                  <GoogleDriveIcon size={18} />
                </div>
                <div>
                  <div className="text-xs font-semibold group-hover:text-amber-600 transition-colors">Drive</div>
                  <div className="text-[10px] text-zinc-400">Cloud files</div>
                </div>
              </button>

              <button
                onClick={() => navigateTo('maps', 'https://maps.google.com', 'Google Maps')}
                className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-800/80 hover:bg-emerald-50 border border-zinc-200 dark:border-zinc-700 rounded-xl transition-all hover:scale-105 shadow-xs text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
                  <GoogleMapsIcon size={18} />
                </div>
                <div>
                  <div className="text-xs font-semibold group-hover:text-emerald-600 transition-colors">Maps</div>
                  <div className="text-[10px] text-zinc-400">Navigation</div>
                </div>
              </button>

              <button
                onClick={() => navigateTo('gemini', 'https://gemini.google.com', 'Google Gemini')}
                className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-800/80 hover:bg-indigo-50 border border-zinc-200 dark:border-zinc-700 rounded-xl transition-all hover:scale-105 shadow-xs text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center shrink-0">
                  <GoogleGeminiIcon size={18} />
                </div>
                <div>
                  <div className="text-xs font-semibold group-hover:text-indigo-600 transition-colors">Gemini AI</div>
                  <div className="text-[10px] text-zinc-400">Smart assistant</div>
                </div>
              </button>

              <button
                onClick={() => navigateTo('googleServices', 'edge://google-services', 'Google Services Config')}
                className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-800/80 hover:bg-blue-50 border border-zinc-200 dark:border-zinc-700 rounded-xl transition-all hover:scale-105 shadow-xs text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                  ⚙️
                </div>
                <div>
                  <div className="text-xs font-semibold group-hover:text-blue-600 transition-colors">Services Hub</div>
                  <div className="text-[10px] text-zinc-400">Firebase sync</div>
                </div>
              </button>

              <button
                onClick={() => navigateTo('surf', 'edge://surf', 'Edge Surf')}
                className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-800/80 hover:bg-blue-50 border border-zinc-200 dark:border-zinc-700 rounded-xl transition-all hover:scale-105 shadow-xs text-left"
              >
                <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center text-lg shrink-0">
                  🏄
                </div>
                <div>
                  <div className="text-xs font-semibold">Edge Surf</div>
                  <div className="text-[10px] text-zinc-400">Wave runner</div>
                </div>
              </button>

              <button
                onClick={() => navigateTo('wiki', 'https://en.wikipedia.org', 'Wikipedia')}
                className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-800/80 hover:bg-blue-50 border border-zinc-200 dark:border-zinc-700 rounded-xl transition-all hover:scale-105 shadow-xs text-left"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <BookOpen size={18} />
                </div>
                <div>
                  <div className="text-xs font-semibold">Wikipedia</div>
                  <div className="text-[10px] text-zinc-400">Encyclopedia</div>
                </div>
              </button>

              <button
                onClick={() => navigateTo('game', 'edge://arcade/snake', 'Retro Snake')}
                className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-800/80 hover:bg-emerald-50 border border-zinc-200 dark:border-zinc-700 rounded-xl transition-all hover:scale-105 shadow-xs text-left"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-lg shrink-0">
                  🐍
                </div>
                <div>
                  <div className="text-xs font-semibold">Snake Arcade</div>
                  <div className="text-[10px] text-zinc-400">Retro game</div>
                </div>
              </button>
            </div>

            {/* MSN Curated News Headlines Feed */}
            <div className="mb-4 flex items-center justify-between border-b border-zinc-200 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Trending Articles & News
              </span>
              <span className="text-xs text-zinc-400">Updated every 15 min</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => {
                  setSelectedWiki('windows-10');
                  navigateTo('wiki', 'https://en.wikipedia.org/wiki/Windows_10', 'Windows 10');
                }}
                className="p-4 bg-white dark:bg-zinc-800/60 hover:bg-zinc-50 border border-zinc-200 dark:border-zinc-700 rounded-xl cursor-pointer transition-shadow hover:shadow-xs"
              >
                <span className="text-[10px] font-semibold text-blue-600 uppercase">OS Engineering</span>
                <h3 className="font-semibold text-sm mt-1 mb-1.5">
                  Windows 10 Architecture: A Ten-Year Engineering Retrospective
                </h3>
                <p className="text-xs text-zinc-500 line-clamp-3">
                  How the hybrid Start Menu, DirectX 12, and universal Windows platform transformed personal computing.
                </p>
              </div>

              <div
                onClick={() => {
                  setSelectedWiki('ai');
                  navigateTo('wiki', 'https://en.wikipedia.org/wiki/Artificial_intelligence', 'Artificial Intelligence');
                }}
                className="p-4 bg-white dark:bg-zinc-800/60 hover:bg-zinc-50 border border-zinc-200 dark:border-zinc-700 rounded-xl cursor-pointer transition-shadow hover:shadow-xs"
              >
                <span className="text-[10px] font-semibold text-emerald-600 uppercase">Neural Computing</span>
                <h3 className="font-semibold text-sm mt-1 mb-1.5">
                  Local Multimodal Accelerators Bring 10x Speedup to Desktops
                </h3>
                <p className="text-xs text-zinc-500 line-clamp-3">
                  Personal computers will now execute deep simulation models completely on-chip with zero server latency.
                </p>
              </div>

              <div
                onClick={() => {
                  setSelectedWiki('apollo');
                  navigateTo('wiki', 'https://en.wikipedia.org/wiki/Apollo_program', 'Apollo Program');
                }}
                className="p-4 bg-white dark:bg-zinc-800/60 hover:bg-zinc-50 border border-zinc-200 dark:border-zinc-700 rounded-xl cursor-pointer transition-shadow hover:shadow-xs"
              >
                <span className="text-[10px] font-semibold text-purple-600 uppercase">Space Flight</span>
                <h3 className="font-semibold text-sm mt-1 mb-1.5">
                  Deep Space Telescopes Capture Exoplanet Atmospheric Spectra
                </h3>
                <p className="text-xs text-zinc-500 line-clamp-3">
                  Astronomers confirm new exoplanets in the habitable zone with atmospheric water vapor signatures.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW B: Edge Surf Game (`edge://surf`) */}
        {activeTab.view === 'surf' && (
          <div className="flex flex-col items-center justify-center py-6 px-4">
            <div className="flex items-center justify-between w-full max-w-[400px] mb-3 text-xs">
              <div>
                <span className="font-bold text-sm">Edge Surf</span>
                <span className="text-zinc-500 ml-2">Use ← → to steer, ↑ to boost</span>
              </div>
              <div className="flex items-center gap-3 font-mono font-bold">
                <span className="text-blue-600">Score: {surfScore}</span>
                <span className="text-emerald-600">{surfDistance}m</span>
              </div>
            </div>

            {/* Surf Canvas */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-cyan-400/80">
              <canvas ref={surfCanvasRef} width={400} height={420} className="bg-sky-600 block" />

              {!surfStateRef.current.running && !surfGameOver && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-white text-center">
                  <span className="text-5xl mb-3">🏄</span>
                  <h2 className="text-xl font-bold mb-1">Let's Surf!</h2>
                  <p className="text-xs text-zinc-200 mb-4 max-w-xs">
                    Dodge rocks and buoys, collect lightning bolts for speed, and surf as far as you can!
                  </p>
                  <button
                    onClick={startSurfGame}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold text-xs shadow-lg transition-transform hover:scale-105"
                  >
                    Start Surfing
                  </button>
                </div>
              )}

              {surfGameOver && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-white text-center">
                  <span className="text-4xl mb-2">💥</span>
                  <h2 className="text-lg font-bold mb-1 text-red-400">Wipeout!</h2>
                  <p className="text-xs text-zinc-200 mb-1">
                    You traveled <strong className="text-white">{surfDistance} meters</strong>
                  </p>
                  <p className="text-xs text-zinc-200 mb-4">
                    Final Score: <strong className="text-amber-300 font-mono">{surfScore}</strong>
                  </p>
                  <button
                    onClick={startSurfGame}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-semibold text-xs shadow-lg transition-transform hover:scale-105"
                  >
                    Play Again
                  </button>
                </div>
              )}
            </div>

            {/* Mobile / Screen Steer Controls */}
            <div className="flex gap-4 mt-3">
              <button
                onClick={() => {
                  surfStateRef.current.surferX = Math.max(20, surfStateRef.current.surferX - 25);
                }}
                className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg text-xs font-bold"
              >
                ◀ Steer Left
              </button>
              <button
                onClick={() => {
                  surfStateRef.current.speed = Math.min(9, surfStateRef.current.speed + 1.5);
                }}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg text-xs font-bold"
              >
                ⚡ Boost
              </button>
              <button
                onClick={() => {
                  surfStateRef.current.surferX = Math.min(380, surfStateRef.current.surferX + 25);
                }}
                className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg text-xs font-bold"
              >
                Steer Right ▶
              </button>
            </div>
          </div>
        )}

        {/* VIEW C: Wikipedia Article Viewer */}
        {activeTab.view === 'wiki' && (
          <div
            className={`min-h-full py-8 px-6 transition-colors ${
              readingMode
                ? readingTheme === 'sepia'
                  ? 'bg-[#fbf0d9] text-[#5f4b32]'
                  : readingTheme === 'dark'
                  ? 'bg-[#181818] text-[#d4d4d4]'
                  : 'bg-white text-zinc-900'
                : 'bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100'
            }`}
          >
            {/* Reading Mode Toolbar */}
            {readingMode && (
              <div className="max-w-2xl mx-auto mb-6 p-2 bg-black/5 rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span>Theme:</span>
                  <button
                    onClick={() => setReadingTheme('sepia')}
                    className="px-2 py-0.5 rounded bg-[#fbf0d9] border border-[#5f4b32] text-xs font-medium"
                  >
                    Sepia
                  </button>
                  <button
                    onClick={() => setReadingTheme('light')}
                    className="px-2 py-0.5 rounded bg-white border border-zinc-300 text-xs font-medium"
                  >
                    Light
                  </button>
                  <button
                    onClick={() => setReadingTheme('dark')}
                    className="px-2 py-0.5 rounded bg-zinc-900 text-white text-xs font-medium"
                  >
                    Dark
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span>Size:</span>
                  <button
                    onClick={() => setReadingFontSize((s: number) => Math.max(12, s - 2))}
                    className="px-2 py-0.5 bg-black/10 rounded"
                  >
                    A-
                  </button>
                  <button
                    onClick={() => setReadingFontSize((s: number) => Math.min(24, s + 2))}
                    className="px-2 py-0.5 bg-black/10 rounded"
                  >
                    A+
                  </button>
                </div>
              </div>
            )}

            <div className="max-w-3xl mx-auto">
              {/* Live Wikipedia Search Bar */}
              <div className="mb-6 flex gap-2">
                <form
                  onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                    e.preventDefault();
                    if (wikiSearchInput.trim()) {
                      fetchLiveWikiArticle(wikiSearchInput.trim());
                    }
                  }}
                  className="flex-1 flex items-center bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 focus-within:border-blue-500 shadow-2xs"
                >
                  <Search size={14} className="text-zinc-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={wikiSearchInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWikiSearchInput(e.target.value)}
                    placeholder="Search any Wikipedia article in real-time (e.g. Apollo program, Linux, Quantum computing)..."
                    className="w-full bg-transparent outline-none text-xs text-inherit placeholder-zinc-400"
                  />
                  {wikiSearchInput && (
                    <button
                      type="button"
                      onClick={() => setWikiSearchInput('')}
                      className="p-0.5 text-zinc-400 hover:text-zinc-600 mr-1"
                    >
                      <X size={13} />
                    </button>
                  )}
                </form>
                <button
                  onClick={() => {
                    if (wikiSearchInput.trim()) {
                      fetchLiveWikiArticle(wikiSearchInput.trim());
                    }
                  }}
                  disabled={liveWikiLoading}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
                >
                  {liveWikiLoading ? (
                    <RotateCw size={13} className="animate-spin" />
                  ) : (
                    <Search size={13} />
                  )}
                  <span>Search Live</span>
                </button>
                {liveWikiArticle && (
                  <button
                    onClick={() => setLiveWikiArticle(null)}
                    className="px-2.5 py-1.5 text-xs text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors border border-zinc-300 dark:border-zinc-700"
                  >
                    Curated Topics
                  </button>
                )}
              </div>

              {/* Curated Category tabs */}
              {!liveWikiArticle && (
                <div className="flex flex-wrap gap-2 mb-6 border-b border-zinc-200 dark:border-zinc-700 pb-3 text-xs">
                  {Object.keys(WIKI_ARTICLES).map((k) => (
                    <button
                      key={k}
                      onClick={() => {
                        setSelectedWiki(k);
                        setLiveWikiArticle(null);
                        soundEngine.playClick();
                      }}
                      className={`px-3 py-1 rounded transition-colors ${
                        selectedWiki === k
                          ? 'bg-blue-600 text-white font-medium'
                          : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {WIKI_ARTICLES[k].title}
                    </button>
                  ))}
                </div>
              )}

              {/* Loading State */}
              {liveWikiLoading && (
                <div className="py-12 text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-zinc-500">Querying Wikipedia REST API...</p>
                </div>
              )}

              {/* Live Wikipedia Article Display */}
              {!liveWikiLoading && liveWikiArticle && (
                <div className="animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700 pb-3 mb-4">
                    <span className="text-xs uppercase font-semibold text-emerald-600 tracking-wider flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Live Wikipedia Article
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startReadAloud(`${liveWikiArticle.title}. ${liveWikiArticle.extract}`)}
                        className="px-2.5 py-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 rounded flex items-center gap-1"
                      >
                        <Volume2 size={12} />
                        <span>Read Aloud</span>
                      </button>
                      <button
                        onClick={handleSavePageAsHtml}
                        className="px-2.5 py-1 text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 rounded flex items-center gap-1"
                      >
                        <DownloadCloud size={12} />
                        <span>Save HTML</span>
                      </button>
                    </div>
                  </div>

                  <h1 className="text-3xl font-serif text-inherit mt-1 mb-2">
                    {liveWikiArticle.title}
                  </h1>

                  {liveWikiArticle.description && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 italic mb-4">
                      {liveWikiArticle.description}
                    </p>
                  )}

                  {liveWikiArticle.thumbnail && (
                    <div className="float-right ml-4 mb-4 border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden max-w-[220px] shadow-sm">
                      <img
                        src={liveWikiArticle.thumbnail}
                        alt={liveWikiArticle.title}
                        className="w-full object-cover"
                      />
                      <div className="p-1.5 text-[10px] text-zinc-500 bg-zinc-50 dark:bg-zinc-800 text-center">
                        Wikipedia Media
                      </div>
                    </div>
                  )}

                  <div
                    className="space-y-4 font-serif leading-relaxed text-zinc-800 dark:text-zinc-200"
                    style={{ fontSize: `${readingFontSize}px` }}
                  >
                    <p>{liveWikiArticle.extract}</p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-xs text-zinc-400">
                    <span>Source: Wikipedia Foundation API</span>
                    {liveWikiArticle.url && (
                      <button
                        onClick={() => navigateTo('embed', liveWikiArticle.url!, liveWikiArticle.title)}
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <span>Open Full Article</span>
                        <ExternalLink size={12} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Curated Article Display */}
              {!liveWikiLoading && !liveWikiArticle && (
                <div>
                  <span className="text-xs uppercase font-semibold text-blue-600 tracking-wider">
                    {WIKI_ARTICLES[selectedWiki]?.category}
                  </span>
                  <h1 className="text-3xl font-serif text-inherit mt-1 mb-3 border-b border-zinc-200 dark:border-zinc-700 pb-2">
                    {WIKI_ARTICLES[selectedWiki]?.title}
                  </h1>
                  <p className="text-sm italic text-zinc-600 dark:text-zinc-400 mb-6 bg-black/5 dark:bg-white/5 p-4 rounded-lg border-l-4 border-blue-500 font-sans">
                    {WIKI_ARTICLES[selectedWiki]?.summary}
                  </p>
                  <div
                    className="space-y-4 font-serif leading-relaxed text-zinc-800 dark:text-zinc-200"
                    style={{ fontSize: `${readingFontSize}px` }}
                  >
                    {WIKI_ARTICLES[selectedWiki]?.content.map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW D: Retro Snake Game */}
        {activeTab.view === 'game' && (
          <div className="max-w-md mx-auto py-8 px-4 text-center">
            <h2 className="text-lg font-bold mb-1">Edge Arcade: Snake</h2>
            <p className="text-xs text-zinc-500 mb-4">Use keyboard arrow keys to navigate</p>

            <div className="flex items-center justify-between mb-3 text-xs font-semibold px-4">
              <span>Score: {snakeScore}</span>
              <button
                onClick={() => {
                  setSnake([[5, 5], [5, 4], [5, 3]]);
                  setSnakeScore(0);
                  setIsSnakeOver(false);
                  setIsSnakeRunning(true);
                  setDir('RIGHT');
                  soundEngine.playClick();
                }}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs"
              >
                {isSnakeRunning && !isSnakeOver ? 'Restart' : 'Start Game'}
              </button>
            </div>

            <div
              className="grid gap-[1px] bg-zinc-800 p-2 rounded-lg mx-auto shadow-inner border border-zinc-700"
              style={{
                gridTemplateColumns: 'repeat(20, minmax(0, 1fr))',
                width: '320px',
                height: '240px',
              }}
            >
              {Array.from({ length: 15 * 20 }).map((_, i) => {
                const r = Math.floor(i / 20);
                const c = i % 20;
                const isSnake = snake.some((s: [number, number]) => s[0] === r && s[1] === c);
                const isHead = snake[0][0] === r && snake[0][1] === c;
                const isFoodCell = food[0] === r && food[1] === c;

                return (
                  <div
                    key={i}
                    className={`rounded-xs transition-colors ${
                      isHead
                        ? 'bg-emerald-400'
                        : isSnake
                        ? 'bg-emerald-600'
                        : isFoodCell
                        ? 'bg-red-500 animate-pulse'
                        : 'bg-zinc-900'
                    }`}
                  />
                );
              })}
            </div>

            {isSnakeOver && (
              <div className="mt-4 p-2 bg-red-100 text-red-700 rounded text-xs font-medium">
                Game Over! Your final score was {snakeScore}.
              </div>
            )}
          </div>
        )}

        {/* VIEW E: Bing Search Results */}
        {activeTab.view === 'search' && (
          <div className="max-w-3xl mx-auto px-6 py-6">
            <div className="mb-4 text-xs text-zinc-500">
              About 1,420,000 results for <strong className="text-zinc-800 font-semibold">"{searchQuery || inputUrl}"</strong>
            </div>

            <div className="space-y-6">
              <div className="p-3 hover:bg-zinc-50 rounded-lg transition-colors border border-transparent hover:border-zinc-200">
                <span className="text-[11px] text-zinc-400 block">edge://surf</span>
                <h3
                  onClick={() => navigateTo('surf', 'edge://surf', 'Edge Surf Game')}
                  className="text-base text-blue-700 hover:underline cursor-pointer font-medium mt-0.5"
                >
                  🏄 Play the Official Microsoft Edge Surf Game
                </h3>
                <p className="text-xs text-zinc-600 mt-1">
                  Ride the waves, dodge rocks and buoys, grab speed boosters, and surf as far as you can in this classic Easter egg game.
                </p>
              </div>

              <div className="p-3 hover:bg-zinc-50 rounded-lg transition-colors border border-transparent hover:border-zinc-200">
                <span className="text-[11px] text-zinc-400 block">https://microsoft.com/windows</span>
                <h3
                  onClick={() => {
                    setSelectedWiki('windows-10');
                    navigateTo('wiki', 'https://en.wikipedia.org/wiki/Windows_10', 'Windows 10');
                  }}
                  className="text-base text-blue-700 hover:underline cursor-pointer font-medium mt-0.5"
                >
                  Windows 10 Operating System - Official Architectural Overview
                </h3>
                <p className="text-xs text-zinc-600 mt-1">
                  Discover the power and familiarity of Windows 10. Learn about the Start menu, security features, multi-tasking virtual desktops, and gaming support.
                </p>
              </div>

              <div className="p-3 hover:bg-zinc-50 rounded-lg transition-colors border border-transparent hover:border-zinc-200">
                <span className="text-[11px] text-zinc-400 block">https://en.wikipedia.org/wiki/AI</span>
                <h3
                  onClick={() => {
                    setSelectedWiki('ai');
                    navigateTo('wiki', 'https://en.wikipedia.org/wiki/Artificial_intelligence', 'Artificial Intelligence');
                  }}
                  className="text-base text-blue-700 hover:underline cursor-pointer font-medium mt-0.5"
                >
                  Artificial Intelligence Research & Modern Developments
                </h3>
                <p className="text-xs text-zinc-600 mt-1">
                  Explore how neural networks, deep learning models, and cognitive computing are reshaping software architectures and scientific simulations.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW F: Browsing History (`edge://history`) */}
        {activeTab.view === 'history' && (
          <div className="max-w-2xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-4 border-b border-zinc-200 pb-2">
              <h2 className="text-lg font-bold">Browsing History</h2>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setHistoryList([]);
                }}
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                <Trash2 size={13} />
                <span>Clear history</span>
              </button>
            </div>

            {historyList.length === 0 ? (
              <p className="text-xs text-zinc-400 text-center py-12">No history recorded.</p>
            ) : (
              <div className="space-y-1">
                {historyList.map((h: HistoryEntry) => (
                  <div
                    key={h.id}
                    onClick={() => {
                      if (h.url === 'edge://surf') navigateTo('surf', h.url, h.title);
                      else if (h.url.includes('wiki')) navigateTo('wiki', h.url, h.title);
                      else navigateTo('start', h.url, h.title);
                    }}
                    className="p-2.5 hover:bg-zinc-100 rounded-lg flex items-center justify-between cursor-pointer text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Globe size={14} className="text-blue-500 shrink-0" />
                      <span className="font-medium text-zinc-800 truncate">{h.title}</span>
                      <span className="text-[11px] text-zinc-400 truncate">{h.url}</span>
                    </div>
                    <span className="text-[11px] text-zinc-400 font-mono shrink-0 ml-4">{h.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW G: Authentic Google Homepage (`https://www.google.com`) */}
        {activeTab.view === 'google' && (
          <div className="min-h-full flex flex-col justify-between bg-white dark:bg-[#202124] text-zinc-800 dark:text-zinc-200">
            {/* Google Header */}
            <div className="flex items-center justify-between px-6 py-3.5 text-xs">
              <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-300">
                <button
                  onClick={() => {
                    setSelectedWiki('browsers');
                    navigateTo('wiki', 'https://en.wikipedia.org/wiki/Web_browser', 'Web Browsers');
                  }}
                  className="hover:underline"
                >
                  About
                </button>
                <button
                  onClick={() => handleGoogleSearch('Google Store products')}
                  className="hover:underline hidden sm:inline"
                >
                  Store
                </button>
              </div>

              <div className="flex items-center gap-4 text-zinc-700 dark:text-zinc-300 relative">
                <button
                  onClick={() => navigateTo('gmail', 'https://mail.google.com', 'Gmail')}
                  className="hover:underline text-xs"
                >
                  Gmail
                </button>
                <button
                  onClick={() => {
                    setGoogleSearchTab('images');
                    handleGoogleSearch(googleInput || 'Wallpapers');
                  }}
                  className="hover:underline text-xs"
                >
                  Images
                </button>

                {/* 9-dot Google Apps Waffle Button */}
                <button
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    setShowGoogleApps(!showGoogleApps);
                  }}
                  title="Google apps"
                  className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Grid size={17} className="text-zinc-600 dark:text-zinc-300" />
                </button>

                {/* User Avatar */}
                <div
                  onClick={() => setShowGoogleAccountModal(true)}
                  title="Google Account: Windows 10 User"
                  className="w-8 h-8 rounded-full bg-blue-600 text-white font-medium flex items-center justify-center text-xs shadow-xs cursor-pointer hover:ring-2 hover:ring-blue-400"
                >
                  W
                </div>

                {/* Google Apps Dropdown */}
                {showGoogleApps && (
                  <GoogleAppsWaffle
                    onNavigate={navigateTo}
                    onClose={() => setShowGoogleApps(false)}
                    onOpenAccountModal={() => {
                      setShowGoogleApps(false);
                      setShowGoogleAccountModal(true);
                    }}
                  />
                )}
              </div>
            </div>

            {/* Google Center Brand & Search Bar */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 -mt-10">
              <div className="mb-7">
                <GoogleWordmark size="lg" onClick={() => setGoogleInput('')} />
              </div>

              {/* Google Search Form Pill */}
              <div className="w-full max-w-[584px] relative">
                <form
                  onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                    e.preventDefault();
                    handleGoogleSearch(googleInput || 'Windows 10');
                  }}
                  className={`w-full flex items-center rounded-full border px-4 py-2.5 transition-shadow ${
                    showSuggestions
                      ? 'rounded-b-none border-zinc-200 dark:border-zinc-700 shadow-lg bg-white dark:bg-[#303134]'
                      : 'border-zinc-200 dark:border-zinc-700 hover:shadow-md focus-within:shadow-md bg-white dark:bg-[#202124]'
                  }`}
                >
                  <Search size={18} className="text-zinc-400 mr-3 shrink-0" />
                  <input
                    type="text"
                    value={googleInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setGoogleInput(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Search Google or type a URL"
                    className="w-full bg-transparent outline-none text-sm text-inherit placeholder-zinc-400"
                  />

                  {googleInput && (
                    <button
                      type="button"
                      onClick={() => setGoogleInput('')}
                      className="p-1 text-zinc-400 hover:text-zinc-600 mr-1"
                    >
                      <X size={16} />
                    </button>
                  )}

                  {/* Voice Search Button */}
                  <button
                    type="button"
                    onClick={() => setShowVoiceSearch(true)}
                    title="Search by voice"
                    className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full text-blue-500 transition-colors mr-0.5"
                  >
                    <Mic size={18} />
                  </button>

                  {/* Google Lens Button */}
                  <button
                    type="button"
                    onClick={() => setShowGoogleLens(true)}
                    title="Search by image"
                    className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full text-amber-500 transition-colors"
                  >
                    <Camera size={18} />
                  </button>
                </form>

                {/* Suggestions Dropdown */}
                {showSuggestions && (
                  <div
                    className="absolute left-0 right-0 top-full bg-white dark:bg-[#303134] border border-t-0 border-zinc-200 dark:border-zinc-700 rounded-b-3xl shadow-lg z-30 py-2 overflow-hidden"
                  >
                    {GOOGLE_SUGGESTIONS.filter((s) =>
                      !googleInput ? true : s.toLowerCase().includes(googleInput.toLowerCase())
                    )
                      .slice(0, 6)
                      .map((suggestion, idx) => (
                        <div
                          key={idx}
                          onMouseDown={() => {
                            setGoogleInput(suggestion);
                            handleGoogleSearch(suggestion);
                          }}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700/60 cursor-pointer text-xs"
                        >
                          <Search size={14} className="text-zinc-400 shrink-0" />
                          <span className="font-medium">{suggestion}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-7">
                <button
                  onClick={() => handleGoogleSearch(googleInput || 'Windows 10')}
                  className="px-4 py-2 bg-[#f8f9fa] dark:bg-[#303134] hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043] border border-transparent hover:border-zinc-300 dark:hover:border-zinc-600 rounded-md text-xs font-medium transition-colors"
                >
                  Google Search
                </button>
                <button
                  onClick={() => {
                    soundEngine.playDing();
                    const luckyOptions = ['windows 10', 'edge surf', 'apollo program', 'artificial intelligence'];
                    const picked = luckyOptions[Math.floor(Math.random() * luckyOptions.length)];
                    handleGoogleSearch(picked);
                  }}
                  className="px-4 py-2 bg-[#f8f9fa] dark:bg-[#303134] hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043] border border-transparent hover:border-zinc-300 dark:hover:border-zinc-600 rounded-md text-xs font-medium transition-colors"
                >
                  I'm Feeling Lucky
                </button>
              </div>

              {/* Language offerings */}
              <div className="mt-7 text-xs text-zinc-500 flex items-center gap-1.5 flex-wrap justify-center">
                <span>Google offered in:</span>
                <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">English</span>
                <span>•</span>
                <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Español</span>
                <span>•</span>
                <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Français</span>
                <span>•</span>
                <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Deutsch</span>
                <span>•</span>
                <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">日本語</span>
              </div>
            </div>

            {/* Google Footer */}
            <div className="bg-[#f2f2f2] dark:bg-[#171717] text-zinc-500 text-xs border-t border-zinc-200 dark:border-zinc-800">
              <div className="px-6 py-3 border-b border-zinc-300 dark:border-zinc-800">
                United States
              </div>
              <div className="px-6 py-3 flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-6">
                  <span className="hover:underline cursor-pointer">About</span>
                  <span className="hover:underline cursor-pointer">Advertising</span>
                  <span className="hover:underline cursor-pointer">Business</span>
                  <span className="hover:underline cursor-pointer">How Search works</span>
                </div>
                <div className="text-[11px] text-zinc-400 hidden md:block">
                  🌱 Carbon neutral since 2007
                </div>
                <div className="flex items-center gap-6">
                  <span className="hover:underline cursor-pointer">Privacy</span>
                  <span className="hover:underline cursor-pointer">Terms</span>
                  <span className="hover:underline cursor-pointer">Settings</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW H: Google Search Results View (`https://www.google.com/search?q=...`) */}
        {activeTab.view === 'googleSearch' && (
          <div className="min-h-full bg-white dark:bg-[#202124] text-zinc-800 dark:text-zinc-200 pb-12">
            {/* 1. Sticky Google Search Header */}
            <div className="sticky top-0 z-20 bg-white dark:bg-[#202124] border-b border-zinc-200 dark:border-zinc-800 pt-4 px-4 sm:px-8">
              <div className="flex items-center gap-4 sm:gap-8 pb-3">
                <GoogleWordmark
                  size="sm"
                  onClick={() => navigateTo('google', 'https://www.google.com', 'Google')}
                />

                <form
                  onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                    e.preventDefault();
                    handleGoogleSearch(googleInput || searchQuery);
                  }}
                  className="flex-1 max-w-2xl flex items-center rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#303134] shadow-xs hover:shadow-md focus-within:shadow-md px-4 py-2"
                >
                  <input
                    type="text"
                    value={googleInput || searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGoogleInput(e.target.value)}
                    className="w-full bg-transparent outline-none text-xs sm:text-sm text-inherit"
                    placeholder="Search Google"
                  />
                  {googleInput && (
                    <button
                      type="button"
                      onClick={() => setGoogleInput('')}
                      className="p-1 text-zinc-400 hover:text-zinc-600 mr-1"
                    >
                      <X size={14} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowVoiceSearch(true)}
                    className="p-1 text-blue-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full mr-1"
                  >
                    <Mic size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGoogleLens(true)}
                    className="p-1 text-amber-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full mr-2"
                  >
                    <Camera size={15} />
                  </button>
                  <button type="submit" className="text-blue-600 dark:text-blue-400">
                    <Search size={16} />
                  </button>
                </form>

                <div className="flex items-center gap-3 ml-auto">
                  <button
                    onClick={() => setShowGoogleApps(!showGoogleApps)}
                    className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Grid size={16} className="text-zinc-600 dark:text-zinc-300" />
                  </button>
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-medium flex items-center justify-center text-xs">
                    W
                  </div>
                </div>
              </div>

              {/* Category Navigation Tabs */}
              <div className="flex items-center gap-6 text-xs text-zinc-600 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 pt-2 pb-1 overflow-x-auto">
                <button
                  onClick={() => setGoogleSearchTab('all')}
                  className={`flex items-center gap-1.5 pb-2 font-medium border-b-2 transition-colors ${
                    googleSearchTab === 'all'
                      ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                      : 'border-transparent hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <Search size={14} />
                  <span>All</span>
                </button>

                <button
                  onClick={() => setGoogleSearchTab('images')}
                  className={`flex items-center gap-1.5 pb-2 font-medium border-b-2 transition-colors ${
                    googleSearchTab === 'images'
                      ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                      : 'border-transparent hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <ImageIcon size={14} />
                  <span>Images</span>
                </button>

                <button
                  onClick={() => setGoogleSearchTab('news')}
                  className={`flex items-center gap-1.5 pb-2 font-medium border-b-2 transition-colors ${
                    googleSearchTab === 'news'
                      ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                      : 'border-transparent hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <Newspaper size={14} />
                  <span>News</span>
                </button>

                <button
                  onClick={() => setGoogleSearchTab('videos')}
                  className={`flex items-center gap-1.5 pb-2 font-medium border-b-2 transition-colors ${
                    googleSearchTab === 'videos'
                      ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                      : 'border-transparent hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <VideoIcon size={14} />
                  <span>Videos</span>
                </button>

                <button
                  onClick={() => setToolsOpen(!toolsOpen)}
                  className={`flex items-center gap-1.5 pb-2 ml-auto text-xs ${
                    toolsOpen ? 'text-blue-600 font-semibold' : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  <SlidersHorizontal size={13} />
                  <span>Tools</span>
                </button>
              </div>

              {/* Tools row */}
              {toolsOpen && (
                <div className="flex items-center gap-3 py-2 text-[11px] text-zinc-500 border-t border-zinc-100 dark:border-zinc-800 animate-fadeIn">
                  <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 cursor-pointer hover:bg-zinc-200">
                    Any time
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 cursor-pointer hover:bg-zinc-200">
                    All results
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 cursor-pointer hover:bg-zinc-200">
                    SafeSearch: Moderate
                  </span>
                </div>
              )}
            </div>

            {/* 2. Tab Content Area */}
            <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-4">
              {/* TAB 1: ALL RESULTS (Organic + Knowledge Panel + People Also Ask) */}
              {googleSearchTab === 'all' && (
                <div>
                  <div className="text-xs text-zinc-400 mb-4">
                    About 3,420,000,000 results (0.38 seconds) for <strong className="text-zinc-700 dark:text-zinc-300">"{searchQuery || 'Windows 10'}"</strong>
                  </div>

                  {/* 2-Column Responsive Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Organic Results & Accordions */}
                    <div className="lg:col-span-7 space-y-6">
                      {/* People Also Ask Accordion */}
                      <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden shadow-2xs">
                        <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800/60 font-semibold text-xs text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700">
                          People also ask
                        </div>
                        {((searchQuery.toLowerCase().includes('windows') || searchQuery.toLowerCase().includes('win'))
                          ? FAQS_DATA.windows
                          : FAQS_DATA.default
                        ).map((faq, fIdx) => (
                          <div
                            key={fIdx}
                            className="border-b last:border-b-0 border-zinc-200 dark:border-zinc-700"
                          >
                            <button
                              onClick={() => setExpandedFaq(expandedFaq === fIdx ? null : fIdx)}
                              className="w-full text-left px-4 py-3 flex items-center justify-between text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                            >
                              <span>{faq.question}</span>
                              {expandedFaq === fIdx ? (
                                <ChevronUp size={14} className="text-zinc-400 shrink-0 ml-2" />
                              ) : (
                                <ChevronDown size={14} className="text-zinc-400 shrink-0 ml-2" />
                              )}
                            </button>
                            {expandedFaq === fIdx && (
                              <div className="px-4 pb-3.5 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed bg-zinc-50/50 dark:bg-zinc-900/30">
                                <p className="mb-2">{faq.answer}</p>
                                <span className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer block">
                                  Source: {faq.source}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Result 1: Primary Target Page */}
                      <div className="group">
                        <div className="flex items-center gap-2 mb-1">
                          <GoogleGIcon className="w-4 h-4 shrink-0" />
                          <div className="text-[11px] text-zinc-500 truncate">
                            https://www.microsoft.com › windows-10 › architecture
                          </div>
                        </div>
                        <h3
                          onClick={() => {
                            setSelectedWiki('windows-10');
                            navigateTo('wiki', 'https://en.wikipedia.org/wiki/Windows_10', 'Windows 10');
                          }}
                          className="text-base sm:text-lg text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer font-medium leading-snug"
                        >
                          Windows 10 Operating System: Features, Security & Hybrid Architecture
                        </h3>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                          Discover the proven multitasking efficiency of <strong className="text-zinc-900 dark:text-zinc-100">Windows 10</strong>. Explore the Start Menu, Task View virtual desktops, DirectX 12 graphics engine, and integrated Microsoft Edge browser.
                        </p>
                        {/* Sitelinks */}
                        <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                          <div
                            onClick={() => navigateTo('surf', 'edge://surf', 'Edge Surf')}
                            className="p-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
                          >
                            <span className="text-blue-600 dark:text-blue-400 font-medium block hover:underline">
                              🏄 Edge Surf Game
                            </span>
                            <span className="text-[10px] text-zinc-400">Play classic wave runner</span>
                          </div>
                          <div
                            onClick={() => {
                              setSelectedWiki('windows-10');
                              navigateTo('wiki', 'https://en.wikipedia.org/wiki/Windows_10', 'Windows 10');
                            }}
                            className="p-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
                          >
                            <span className="text-blue-600 dark:text-blue-400 font-medium block hover:underline">
                              📖 Architectural Specs
                            </span>
                            <span className="text-[10px] text-zinc-400">Kernel and subsystem docs</span>
                          </div>
                        </div>
                      </div>

                      {/* Result 2: Edge Browser & Web Standards */}
                      <div className="group">
                        <div className="flex items-center gap-2 mb-1">
                          <Globe size={14} className="text-blue-500 shrink-0" />
                          <div className="text-[11px] text-zinc-500 truncate">
                            https://en.wikipedia.org › wiki › Microsoft_Edge
                          </div>
                        </div>
                        <h3
                          onClick={() => {
                            setSelectedWiki('browsers');
                            navigateTo('wiki', 'https://en.wikipedia.org/wiki/Web_browser', 'Web Browsers');
                          }}
                          className="text-base sm:text-lg text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer font-medium leading-snug"
                        >
                          Microsoft Edge & Modern Web Engines - Wikipedia Overview
                        </h3>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                          Rebuilt on Chromium, Microsoft Edge offers industry-standard HTML5 compliance, Google Search compatibility, hardware-accelerated canvas rendering, and built-in InPrivate browsing mode.
                        </p>
                      </div>

                      {/* Result 3: Groove Music Audio Subsystem */}
                      <div className="group">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs">🎵</span>
                          <div className="text-[11px] text-zinc-500 truncate">
                            https://microsoft.com › groove-music › desktop-audio
                          </div>
                        </div>
                        <h3
                          onClick={() => soundEngine.playClick()}
                          className="text-base sm:text-lg text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer font-medium leading-snug"
                        >
                          Groove Music in Windows 10: Seamless Background Playback Engine
                        </h3>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                          Listen to high-fidelity synthesized audio continuously on your desktop. Groove Music runs quietly in the background with a desktop taskbar media controller and equalizer presets.
                        </p>
                      </div>

                      {/* Result 4: Deep Computing & AI */}
                      <div className="group">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs">🧠</span>
                          <div className="text-[11px] text-zinc-500 truncate">
                            https://en.wikipedia.org › wiki › Artificial_intelligence
                          </div>
                        </div>
                        <h3
                          onClick={() => {
                            setSelectedWiki('ai');
                            navigateTo('wiki', 'https://en.wikipedia.org/wiki/Artificial_intelligence', 'Artificial Intelligence');
                          }}
                          className="text-base sm:text-lg text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer font-medium leading-snug"
                        >
                          Artificial Intelligence: Foundational Architectures & Neural Models
                        </h3>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                          Examine the theoretical underpinnings of transformer models, cognitive algorithms, and neural networks capable of automated computer vision and code synthesis.
                        </p>
                      </div>
                    </div>

                    {/* Right Column: Google Knowledge Graph Sidebar */}
                    <div className="lg:col-span-5">
                      {(() => {
                        const term = searchQuery.toLowerCase();
                        const match =
                          KNOWLEDGE_BASE.find((k) =>
                            k.queryMatch.some((q) => term.includes(q))
                          ) || KNOWLEDGE_BASE[0];

                        return (
                          <div className="border border-zinc-200 dark:border-zinc-700 rounded-2xl p-5 bg-white dark:bg-[#303134] shadow-xs sticky top-28">
                            {/* Knowledge Card Header Banner */}
                            <div
                              className={`h-28 rounded-xl bg-gradient-to-br ${match.imageBg} text-white flex items-center justify-between p-4 mb-4 relative overflow-hidden`}
                            >
                              <div className="z-10">
                                <span className="text-xs uppercase tracking-wider font-semibold opacity-80">
                                  Overview
                                </span>
                                <h2 className="text-xl font-bold tracking-tight">{match.title}</h2>
                                <p className="text-[11px] opacity-90">{match.subtitle}</p>
                              </div>
                              <span className="text-4xl z-10">{match.imageTag}</span>
                              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-sm" />
                            </div>

                            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
                              {match.description}
                            </p>

                            {/* Specifications Key-Value List */}
                            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3 space-y-2 text-xs">
                              {Object.entries(match.specs).map(([k, v]) => (
                                <div key={k} className="flex justify-between items-start gap-4">
                                  <span className="text-zinc-400 font-medium shrink-0">{k}</span>
                                  <span className="text-zinc-800 dark:text-zinc-200 text-right">{v}</span>
                                </div>
                              ))}
                            </div>

                            {/* Action Links */}
                            {match.actionTitle && (
                              <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-700 flex gap-2">
                                <button
                                  onClick={() => {
                                    if (match.actionUrl?.startsWith('wiki:')) {
                                      const article = match.actionUrl.split(':')[1];
                                      setSelectedWiki(article);
                                      navigateTo('wiki', `https://en.wikipedia.org/wiki/${article}`, match.title);
                                    } else if (match.actionUrl === 'surf') {
                                      navigateTo('surf', 'edge://surf', 'Edge Surf');
                                    } else if (match.actionUrl === 'google') {
                                      navigateTo('google', 'https://www.google.com', 'Google');
                                    } else {
                                      soundEngine.playDing();
                                    }
                                  }}
                                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors text-center"
                                >
                                  {match.actionTitle}
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Iconic Goooooogle Pagination Bar */}
                  <div className="flex flex-col items-center justify-center mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="text-3xl sm:text-4xl font-serif tracking-widest select-none flex items-center mb-3">
                      <span className="text-[#4285F4] font-bold">G</span>
                      <span className="text-[#EA4335] font-bold">o</span>
                      <span className="text-[#FBBC05] font-bold">o</span>
                      <span className="text-[#4285F4] font-bold">o</span>
                      <span className="text-[#34A853] font-bold">o</span>
                      <span className="text-[#EA4335] font-bold">o</span>
                      <span className="text-[#4285F4] font-bold">g</span>
                      <span className="text-[#34A853] font-bold">l</span>
                      <span className="text-[#EA4335] font-bold">e</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-medium text-blue-600 dark:text-blue-400">
                      <span className="text-zinc-800 dark:text-zinc-200 font-bold px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800">
                        1
                      </span>
                      <span className="hover:underline cursor-pointer px-2 py-1">2</span>
                      <span className="hover:underline cursor-pointer px-2 py-1">3</span>
                      <span className="hover:underline cursor-pointer px-2 py-1">4</span>
                      <span className="hover:underline cursor-pointer px-2 py-1">5</span>
                      <span className="hover:underline cursor-pointer flex items-center gap-1">
                        Next <ChevronRight size={13} />
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: GOOGLE IMAGES TAB */}
              {googleSearchTab === 'images' && (
                <div>
                  <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 text-xs">
                    <span className="font-semibold text-zinc-500 mr-2 shrink-0">Filter:</span>
                    {['Desktop Wallpaper', 'High Resolution', 'Architecture', 'Space', 'Interface', 'Technology'].map(
                      (pill, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => handleGoogleSearch(`${searchQuery} ${pill}`)}
                          className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full shrink-0 text-zinc-700 dark:text-zinc-300"
                        >
                          {pill}
                        </button>
                      )
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {[
                      {
                        title: 'Windows 10 Hero Wallpaper 4K',
                        source: 'Microsoft Official Media',
                        domain: 'microsoft.com',
                        size: '3840 × 2160',
                        bg: 'from-blue-600 via-indigo-700 to-sky-900',
                        icon: '🪟',
                      },
                      {
                        title: 'Microsoft Edge Surf Wave Runner',
                        source: 'Edge Browser Games',
                        domain: 'microsoft.com',
                        size: '1920 × 1080',
                        bg: 'from-cyan-500 to-blue-600',
                        icon: '🏄',
                      },
                      {
                        title: 'Saturn V Rocket Apollo 11 Launch',
                        source: 'NASA Space Archives',
                        domain: 'nasa.gov',
                        size: '2048 × 1536',
                        bg: 'from-orange-500 via-red-600 to-purple-900',
                        icon: '🚀',
                      },
                      {
                        title: 'Deep Neural Network Visualizer',
                        source: 'AI Research Lab',
                        domain: 'arxiv.org',
                        size: '1600 × 1200',
                        bg: 'from-emerald-600 to-teal-900',
                        icon: '🧠',
                      },
                      {
                        title: 'Groove Music Vinyl Record Player',
                        source: 'Groove Audio Assets',
                        domain: 'windows.com',
                        size: '1200 × 1200',
                        bg: 'from-teal-600 via-cyan-700 to-slate-900',
                        icon: '🎵',
                      },
                      {
                        title: 'Google Cloud Global Datacenter',
                        source: 'Alphabet Infrastructure',
                        domain: 'cloud.google.com',
                        size: '2560 × 1440',
                        bg: 'from-blue-500 via-amber-500 to-red-500',
                        icon: '🌐',
                      },
                      {
                        title: 'Retro Arcade Snake Pixel Canvas',
                        source: 'Classic Arcade Games',
                        domain: 'edge.arcade',
                        size: '800 × 600',
                        bg: 'from-zinc-800 to-emerald-950',
                        icon: '🐍',
                      },
                      {
                        title: 'Exoplanet Atmosphere Spectra',
                        source: 'James Webb Telescope',
                        domain: 'esa.int',
                        size: '1920 × 1080',
                        bg: 'from-violet-900 via-fuchsia-950 to-slate-950',
                        icon: '🔭',
                      },
                    ].map((img, iIdx) => (
                      <div
                        key={iIdx}
                        onClick={() => setPreviewImage(img)}
                        className="group bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden cursor-pointer border border-zinc-200 dark:border-zinc-700 hover:shadow-lg transition-all hover:scale-[1.02]"
                      >
                        <div
                          className={`h-36 bg-gradient-to-tr ${img.bg} flex items-center justify-center text-4xl text-white relative shadow-inner`}
                        >
                          <span>{img.icon}</span>
                          <span className="absolute bottom-2 right-2 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded font-mono">
                            {img.size}
                          </span>
                        </div>
                        <div className="p-3">
                          <h4 className="text-xs font-semibold truncate group-hover:text-blue-600 transition-colors">
                            {img.title}
                          </h4>
                          <div className="text-[10px] text-zinc-400 mt-0.5 flex justify-between">
                            <span>{img.domain}</span>
                            <span>{img.source}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: GOOGLE NEWS TAB */}
              {googleSearchTab === 'news' && (
                <div className="space-y-4 max-w-3xl">
                  <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Top Stories & Press
                  </div>
                  {[
                    {
                      publisher: 'The Verge',
                      time: '2 hours ago',
                      title: 'Microsoft Edge Elevates Web Browsing Speeds with Modern V8 Engine Optimizations',
                      snippet:
                        'Internal benchmark testing indicates up to 35% reduced memory footprint and rapid compilation of complex desktop web applications.',
                      category: 'Technology',
                    },
                    {
                      publisher: 'Reuters',
                      time: '4 hours ago',
                      title: 'Windows 10 Remains the Primary Choice for Workstation Stability Worldwide',
                      snippet:
                        'Enterprise computing managers praise the dependable driver ecosystem, DirectX 12 efficiency, and clean desktop workflow.',
                      category: 'Enterprise',
                    },
                    {
                      publisher: 'MIT Technology Review',
                      time: '6 hours ago',
                      title: 'Deep Learning Foundation Models Accelerate Cross-Disciplinary Scientific Discoveries',
                      snippet:
                        'From molecular biology to orbital trajectory calculation, artificial intelligence provides unprecedented analytical throughput.',
                      category: 'Science',
                    },
                    {
                      publisher: 'Wired',
                      time: '8 hours ago',
                      title: 'Groove Music Synthesizer: The Return of Desktop Audio Player Versatility',
                      snippet:
                        'Local audio processing and non-blocking background streaming offer high-fidelity playback without taking away processor threads.',
                      category: 'Audio',
                    },
                  ].map((news, nIdx) => (
                    <div
                      key={nIdx}
                      onClick={() => soundEngine.playClick()}
                      className="p-4 bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:shadow-md cursor-pointer transition-all hover:border-blue-400"
                    >
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 mb-1.5">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-200">
                          {news.publisher}
                        </span>
                        <span>•</span>
                        <span>{news.time}</span>
                        <span className="ml-auto px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-[10px]">
                          {news.category}
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-white hover:text-blue-600 transition-colors mb-1">
                        {news.title}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        {news.snippet}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 4: GOOGLE VIDEOS TAB */}
              {googleSearchTab === 'videos' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    {
                      title: 'Windows 10: Deep Architecture & Features Walkthrough',
                      channel: 'TechReview Pro',
                      views: '1.4M views',
                      duration: '24:18',
                      badge: 'HD',
                      bg: 'from-blue-700 to-indigo-900',
                      icon: '🪟',
                    },
                    {
                      title: 'Can Anyone Reach Distance 5,000m in Edge Surf?',
                      channel: 'GameSpot Arcade',
                      views: '890K views',
                      duration: '08:42',
                      badge: '4K',
                      bg: 'from-cyan-600 to-blue-800',
                      icon: '🏄',
                    },
                    {
                      title: 'How Apollo 11 Flew to the Moon: Complete Trajectory',
                      channel: 'NASA Science Docs',
                      views: '3.2M views',
                      duration: '18:05',
                      badge: 'HD',
                      bg: 'from-purple-800 to-slate-900',
                      icon: '🚀',
                    },
                    {
                      title: 'Groove Music Player: Equalizer & Background Playback',
                      channel: 'Audio Engineering Today',
                      views: '240K views',
                      duration: '12:30',
                      badge: 'CC',
                      bg: 'from-teal-700 to-cyan-900',
                      icon: '🎵',
                    },
                    {
                      title: 'Building Modern Web Applications with React 19',
                      channel: 'Code Masters',
                      views: '540K views',
                      duration: '42:10',
                      badge: '4K',
                      bg: 'from-sky-600 to-blue-900',
                      icon: '⚛️',
                    },
                    {
                      title: 'Inside Google Search: Crawling, Indexing & Ranking',
                      channel: 'Google Technology',
                      views: '4.8M views',
                      duration: '15:22',
                      badge: 'HD',
                      bg: 'from-red-600 via-amber-600 to-blue-800',
                      icon: '🌐',
                    },
                  ].map((video, vIdx) => (
                    <div
                      key={vIdx}
                      onClick={() => setActiveVideoModal(video)}
                      className="group bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden cursor-pointer border border-zinc-200 dark:border-zinc-700 hover:shadow-lg transition-all"
                    >
                      <div
                        className={`h-36 bg-gradient-to-br ${video.bg} flex items-center justify-center text-white relative shadow-inner`}
                      >
                        <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-xs flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                          <Play size={20} className="fill-white ml-0.5" />
                        </div>
                        <span className="absolute bottom-2 right-2 text-[10px] bg-black/80 text-white px-1.5 py-0.5 rounded font-mono">
                          {video.duration}
                        </span>
                        <span className="absolute top-2 left-2 text-[10px] bg-blue-600 text-white px-1 rounded font-bold">
                          {video.badge}
                        </span>
                      </div>
                      <div className="p-3">
                        <h4 className="text-xs font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {video.title}
                        </h4>
                        <div className="text-[11px] text-zinc-400 mt-1 flex justify-between">
                          <span>{video.channel}</span>
                          <span>{video.views}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW I: Real Download Manager (`edge://downloads`) */}
        {activeTab.view === 'downloads' && (
          <div className="max-w-4xl mx-auto px-6 py-6 min-h-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-700 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
                  <DownloadCloud size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Downloads Manager</h2>
                  <p className="text-xs text-zinc-500">Real browser downloads with direct file system export</p>
                </div>
              </div>

              {/* Quick real export generator buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleSavePageAsHtml}
                  className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <FileCode size={13} className="text-blue-500" />
                  <span>Save Page (.html)</span>
                </button>

                <button
                  onClick={() => {
                    const bookmarksHtml = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file. It will be read and overwritten. Do Not Edit! -->
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
${bookmarks.map((b: BookmarkItem) => `    <DT><A HREF="${b.url}">${b.title}</A>`).join('\n')}
</DL><p>`;
                    triggerRealDownload('edge_bookmarks.html', bookmarksHtml, 'text/html', 'code');
                  }}
                  className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Bookmark size={13} className="text-amber-500" />
                  <span>Export Bookmarks</span>
                </button>

                <button
                  onClick={() => {
                    const diag = `========================================================
MICROSOFT EDGE SYSTEM & DIAGNOSTICS REPORT
Operating System: Windows 10 Pro (Build 19045.3803)
Architecture: x86_64 Fluent Simulation Subsystem
Browser Version: Microsoft Edge 124.0.2478.80 (Official Build)
Timestamp: ${new Date().toISOString()}
Screen: ${window.innerWidth} x ${window.innerHeight} (Device Pixel Ratio: ${window.devicePixelRatio || 1})
User Agent: ${navigator.userAgent}
Language: ${navigator.language}
Online Status: ${navigator.onLine ? 'Connected' : 'Offline'}
Active Tabs Count: ${tabs.length}
Saved Bookmarks: ${bookmarks.length}
History Entries: ${historyList.length}
Hardware Acceleration: WebGL 2.0 (DirectX 12 Shader Engine)
SmartScreen Protection: Enabled
========================================================`;
                    triggerRealDownload('system_diagnostics.txt', diag, 'text/plain', 'code');
                  }}
                  className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <HardDrive size={13} className="text-emerald-500" />
                  <span>System Specs (.txt)</span>
                </button>

                {downloads.length > 0 && (
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      setDownloads([]);
                    }}
                    className="px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Clear All</span>
                  </button>
                )}
              </div>
            </div>

            {/* Downloads List */}
            {downloads.length === 0 ? (
              <div className="py-20 text-center">
                <DownloadCloud size={48} className="mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
                <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">No downloads</h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                  Files you download, exported HTML pages, and system reports will appear here and download to your local drive.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {downloads.map((item: DownloadItem) => (
                  <div
                    key={item.id}
                    className="p-4 bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl flex items-center justify-between gap-4 shadow-2xs hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center shrink-0">
                        {item.category === 'code' ? (
                          <FileCode size={20} className="text-blue-500" />
                        ) : item.category === 'image' ? (
                          <ImageIcon size={20} className="text-emerald-500" />
                        ) : item.category === 'audio' ? (
                          <Volume2 size={20} className="text-indigo-500" />
                        ) : (
                          <HardDrive size={20} className="text-amber-500" />
                        )}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-semibold truncate text-zinc-800 dark:text-zinc-200">
                          {item.filename}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                          <span>{item.filesize}</span>
                          <span>•</span>
                          <span>{item.time}</span>
                          <span>•</span>
                          <span className="truncate max-w-[200px]">{item.url}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={12} />
                        <span>Done</span>
                      </span>

                      {item.blobUrl && (
                        <a
                          href={item.blobUrl}
                          download={item.filename}
                          className="px-2.5 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium shadow-2xs transition-colors"
                        >
                          Save Again
                        </a>
                      )}

                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          setDownloads((prev: DownloadItem[]) => prev.filter((d) => d.id !== item.id));
                        }}
                        className="p-1 text-zinc-400 hover:text-red-500 transition-colors rounded cursor-pointer"
                        title="Delete from list"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW J: Real Live Web Embedded Browser (`view === 'embed'`) */}
        {activeTab.view === 'embed' && (
          <div className="w-full h-full flex flex-col bg-zinc-100 dark:bg-zinc-900">
            {/* Live Security & External Options Bar */}
            <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800/90 border-b border-zinc-200 dark:border-zinc-700 flex flex-wrap items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                  <Lock size={12} />
                  <span>Encrypted TLS 1.3</span>
                </span>
                <span className="text-zinc-500 truncate max-w-sm font-mono text-[11px]">
                  {activeTab.url}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const iframe = document.getElementById(`edge-iframe-${activeTab.id}`) as HTMLIFrameElement | null;
                    if (iframe) iframe.src = getSafeHttpUrl(activeTab.url);
                  }}
                  className="px-2 py-1 bg-white dark:bg-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-600 rounded border border-zinc-300 dark:border-zinc-600 text-xs flex items-center gap-1 cursor-pointer"
                >
                  <RotateCw size={12} />
                  <span>Reload</span>
                </button>

                <button
                  onClick={() => window.open(getSafeHttpUrl(activeTab.url), '_blank')}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-xs flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <ExternalLink size={12} />
                  <span>Open in Real Tab</span>
                </button>

                <button
                  onClick={handleSavePageAsHtml}
                  className="px-2 py-1 bg-white dark:bg-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-600 rounded border border-zinc-300 dark:border-zinc-600 text-xs flex items-center gap-1 cursor-pointer"
                >
                  <DownloadCloud size={12} />
                  <span>Save</span>
                </button>
              </div>
            </div>

            {/* Frame Notice for Protected Sites */}
            <div className="px-4 py-1.5 bg-blue-50/70 dark:bg-blue-950/30 border-b border-blue-200/50 dark:border-blue-800/40 text-[11px] text-blue-700 dark:text-blue-300 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <AlertCircle size={13} className="shrink-0" />
                <span>
                  Live iframe sandbox active. If a site restricts embedding (X-Frame-Options: SAMEORIGIN), use "Open in Real Tab" or our built-in Google and Wikipedia engines.
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedWiki('browsers');
                  navigateTo('wiki', 'https://en.wikipedia.org/wiki/Web_browser', 'Web Browsers');
                }}
                className="hover:underline font-medium ml-2 shrink-0 cursor-pointer"
              >
                Learn More
              </button>
            </div>

            {/* Real Sandboxed Iframe */}
            <div className="flex-1 w-full bg-white relative">
              <iframe
                id={`edge-iframe-${activeTab.id}`}
                src={getSafeHttpUrl(activeTab.url)}
                title={activeTab.title}
                sandbox="allow-scripts allow-forms allow-popups allow-modals"
                className="w-full h-full border-none min-h-[500px]"
              />
            </div>
          </div>
        )}

        {/* VIEW K: YouTube Client */}
        {activeTab.view === 'youtube' && (
          <YouTubeApp
            onNavigate={navigateTo}
            onOpenAppsWaffle={() => setShowGoogleWaffleMenu(true)}
          />
        )}

        {/* VIEW L: Gmail Webmail */}
        {activeTab.view === 'gmail' && (
          <GmailApp
            onNavigate={navigateTo}
            onOpenAppsWaffle={() => setShowGoogleWaffleMenu(true)}
          />
        )}

        {/* VIEW M: Google Drive Cloud Storage */}
        {activeTab.view === 'drive' && (
          <GoogleDriveApp
            onNavigate={navigateTo}
            onOpenAppsWaffle={() => setShowGoogleWaffleMenu(true)}
            onDownloadFile={(name, content, mime) =>
              triggerRealDownload(name, content, mime, 'code')
            }
          />
        )}

        {/* VIEW N: Google Maps Explorer */}
        {activeTab.view === 'maps' && (
          <GoogleMapsApp
            onNavigate={navigateTo}
            onOpenAppsWaffle={() => setShowGoogleWaffleMenu(true)}
          />
        )}

        {/* VIEW O: Google Gemini AI Assistant */}
        {activeTab.view === 'gemini' && (
          <GoogleGeminiApp
            onNavigate={navigateTo}
            onOpenAppsWaffle={() => setShowGoogleWaffleMenu(true)}
          />
        )}

        {/* VIEW P: Google Translate */}
        {activeTab.view === 'translate' && (
          <GoogleTranslateApp
            onNavigate={navigateTo}
            onOpenAppsWaffle={() => setShowGoogleWaffleMenu(true)}
          />
        )}

        {/* VIEW Q: Google Keep Notes */}
        {activeTab.view === 'keep' && (
          <GoogleKeepApp
            onNavigate={navigateTo}
            onOpenAppsWaffle={() => setShowGoogleWaffleMenu(true)}
          />
        )}

        {/* VIEW R: Google Services Hub & Firebase Config */}
        {activeTab.view === 'googleServices' && (
          <GoogleServicesHub
            onNavigate={navigateTo}
            onOpenAppsWaffle={() => setShowGoogleWaffleMenu(true)}
          />
        )}

        {/* Google Account Modal Dialog */}
        {showGoogleAccountModal && (
          <GoogleAccountModal
            onClose={() => setShowGoogleAccountModal(false)}
            onNavigate={navigateTo}
          />
        )}

        {/* VOICE SEARCH MODAL */}
        {showVoiceSearch && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center border border-zinc-200 dark:border-zinc-700 animate-fadeIn">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-semibold text-zinc-500">Google Voice Search</span>
                <button
                  onClick={() => setShowVoiceSearch(false)}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 mx-auto flex items-center justify-center mb-3 animate-pulse">
                <Mic size={28} />
              </div>
              <h3 className="font-semibold text-base mb-1">Listening...</h3>
              <p className="text-xs text-zinc-400 mb-4">
                Say a topic or pick one of the simulated voice commands:
              </p>
              <div className="flex justify-center gap-2 mb-5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4285F4] animate-bounce" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#EA4335] animate-bounce [animation-delay:0.15s]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#FBBC05] animate-bounce [animation-delay:0.3s]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#34A853] animate-bounce [animation-delay:0.45s]" />
              </div>
              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    setShowVoiceSearch(false);
                    handleGoogleSearch('What is Windows 10 architecture');
                  }}
                  className="w-full text-xs py-2 px-3 bg-zinc-100 dark:bg-zinc-700 hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 rounded-lg text-left truncate transition-colors"
                >
                  🗣️ "What is Windows 10 architecture"
                </button>
                <button
                  onClick={() => {
                    setShowVoiceSearch(false);
                    handleGoogleSearch('Apollo 11 Moon landing history');
                  }}
                  className="w-full text-xs py-2 px-3 bg-zinc-100 dark:bg-zinc-700 hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 rounded-lg text-left truncate transition-colors"
                >
                  🗣️ "Apollo 11 Moon landing history"
                </button>
                <button
                  onClick={() => {
                    setShowVoiceSearch(false);
                    handleGoogleSearch('Groove Music background player');
                  }}
                  className="w-full text-xs py-2 px-3 bg-zinc-100 dark:bg-zinc-700 hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 rounded-lg text-left truncate transition-colors"
                >
                  🗣️ "Groove Music background player"
                </button>
              </div>
            </div>
          </div>
        )}

        {/* GOOGLE LENS MODAL */}
        {showGoogleLens && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-zinc-200 dark:border-zinc-700 animate-fadeIn">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Camera size={18} className="text-[#4285F4]" />
                  <span className="font-semibold text-sm">Search any image with Google Lens</span>
                </div>
                <button
                  onClick={() => setShowGoogleLens(false)}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-xl p-6 text-center mb-4 hover:border-blue-500 transition-colors">
                <Camera size={32} className="mx-auto mb-2 text-zinc-400" />
                <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Drag an image here or select from recognized visual samples:
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setShowGoogleLens(false);
                    handleGoogleSearch('Windows 10 Hero Wallpaper');
                  }}
                  className="text-xs p-2.5 bg-zinc-50 dark:bg-zinc-700 rounded-lg text-left hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 border border-zinc-200 dark:border-zinc-600 transition-colors"
                >
                  🖼️ Windows 10 Hero
                </button>
                <button
                  onClick={() => {
                    setShowGoogleLens(false);
                    handleGoogleSearch('Saturn V Apollo Rocket');
                  }}
                  className="text-xs p-2.5 bg-zinc-50 dark:bg-zinc-700 rounded-lg text-left hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 border border-zinc-200 dark:border-zinc-600 transition-colors"
                >
                  🚀 Saturn V Rocket
                </button>
                <button
                  onClick={() => {
                    setShowGoogleLens(false);
                    handleGoogleSearch('Groove Music Vinyl Disc');
                  }}
                  className="text-xs p-2.5 bg-zinc-50 dark:bg-zinc-700 rounded-lg text-left hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 border border-zinc-200 dark:border-zinc-600 transition-colors"
                >
                  🎵 Groove Vinyl Art
                </button>
                <button
                  onClick={() => {
                    setShowGoogleLens(false);
                    handleGoogleSearch('Microsoft Edge surfing waves');
                  }}
                  className="text-xs p-2.5 bg-zinc-50 dark:bg-zinc-700 rounded-lg text-left hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 border border-zinc-200 dark:border-zinc-600 transition-colors"
                >
                  🏄 Edge Surfer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* IMAGE PREVIEW MODAL */}
        {previewImage && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-700 animate-fadeIn">
              <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="truncate">
                  <h3 className="text-sm font-semibold truncate">{previewImage.title}</h3>
                  <span className="text-[11px] text-zinc-400">{previewImage.domain}</span>
                </div>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
                >
                  <X size={18} />
                </button>
              </div>
              <div
                className={`h-64 bg-gradient-to-tr ${previewImage.bg} flex items-center justify-center text-6xl text-white relative shadow-inner`}
              >
                <span>{previewImage.icon}</span>
                <span className="absolute bottom-3 right-3 text-xs bg-black/60 text-white px-2 py-1 rounded font-mono">
                  {previewImage.size}
                </span>
              </div>
              <div className="p-4 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/60">
                <div className="text-xs text-zinc-500">
                  Source: <strong>{previewImage.source}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      soundEngine.playDing();
                      setPreviewImage(null);
                    }}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow-xs"
                  >
                    Visit Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIDEO PLAYER PREVIEW MODAL */}
        {activeVideoModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-zinc-900 text-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-zinc-700 animate-fadeIn">
              <div className="flex items-center justify-between p-3 border-b border-zinc-800">
                <div className="truncate">
                  <h3 className="text-xs font-semibold truncate">{activeVideoModal.title}</h3>
                  <span className="text-[10px] text-zinc-400">{activeVideoModal.channel}</span>
                </div>
                <button
                  onClick={() => setActiveVideoModal(null)}
                  className="p-1 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Video Player Display */}
              <div className="h-64 bg-black flex flex-col items-center justify-center relative">
                <div className="w-16 h-16 rounded-full bg-red-600/90 flex items-center justify-center shadow-2xl animate-pulse">
                  <Play size={28} className="fill-white ml-1" />
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3 text-xs font-mono">
                  <span className="text-red-500 font-bold">● LIVE SIM</span>
                  <div className="flex-1 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                    <div className="w-1/3 h-full bg-red-600" />
                  </div>
                  <span>{activeVideoModal.duration}</span>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between text-xs bg-zinc-950">
                <div>
                  <span className="font-semibold text-zinc-200">{activeVideoModal.views}</span>
                  <span className="text-zinc-500 ml-2">• 1080p 60fps</span>
                </div>
                <button
                  onClick={() => setActiveVideoModal(null)}
                  className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Docked Developer Tools (F12) */}
      {showDevTools && (
        <div className="h-64 sm:h-72 border-t-2 border-zinc-700 bg-[#1e1e1e] text-zinc-200 flex flex-col font-mono text-xs z-40 select-text shrink-0 shadow-2xl">
          {/* DevTools Header Bar */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#252526] border-b border-zinc-700">
            <div className="flex items-center gap-3">
              <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                <Terminal size={14} className="text-blue-400" />
                <span>Edge DevTools</span>
              </span>

              {/* Tabs */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setDevToolsTab('console')}
                  className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 cursor-pointer ${
                    devToolsTab === 'console'
                      ? 'bg-[#37373d] text-white font-medium'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Terminal size={12} />
                  <span>Console</span>
                </button>

                <button
                  onClick={() => setDevToolsTab('elements')}
                  className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 cursor-pointer ${
                    devToolsTab === 'elements'
                      ? 'bg-[#37373d] text-white font-medium'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Code2 size={12} />
                  <span>Elements</span>
                </button>

                <button
                  onClick={() => setDevToolsTab('network')}
                  className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 cursor-pointer ${
                    devToolsTab === 'network'
                      ? 'bg-[#37373d] text-white font-medium'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Globe size={12} />
                  <span>Network</span>
                </button>

                <button
                  onClick={() => setDevToolsTab('storage')}
                  className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 cursor-pointer ${
                    devToolsTab === 'storage'
                      ? 'bg-[#37373d] text-white font-medium'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <HardDrive size={12} />
                  <span>Application</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {devToolsTab === 'console' && (
                <button
                  onClick={() => setConsoleLogs([])}
                  className="px-2 py-0.5 rounded text-[11px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                  title="Clear console"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setShowDevTools(false)}
                className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white cursor-pointer"
                title="Close DevTools (F12)"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* DevTools Body */}
          <div className="flex-1 overflow-y-auto p-3 bg-[#1e1e1e]">
            {/* CONSOLE TAB */}
            {devToolsTab === 'console' && (
              <div className="flex flex-col h-full justify-between">
                <div className="space-y-1 overflow-y-auto flex-1 mb-2 pr-1 font-mono">
                  {consoleLogs.map((log: ConsoleEntry) => (
                    <div
                      key={log.id}
                      className={`flex items-start gap-2 py-0.5 border-b border-zinc-800/40 text-[11px] ${
                        log.type === 'error'
                          ? 'text-red-400 bg-red-950/20'
                          : log.type === 'info'
                          ? 'text-blue-400'
                          : log.type === 'input'
                          ? 'text-emerald-400 font-semibold'
                          : 'text-zinc-300'
                      }`}
                    >
                      <span className="text-zinc-500 text-[10px] select-none shrink-0">{log.time}</span>
                      <span className="whitespace-pre-wrap break-all">{log.text}</span>
                    </div>
                  ))}
                </div>

                {/* Console Input Bar */}
                <div>
                  {/* Preset snippets */}
                  <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-1 text-[10px] text-zinc-400">
                    <span className="shrink-0 text-zinc-500">Run:</span>
                    <button
                      onClick={() => handleExecuteConsoleCommand('document.title')}
                      className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-blue-300 shrink-0 cursor-pointer"
                    >
                      document.title
                    </button>
                    <button
                      onClick={() => handleExecuteConsoleCommand('navigator.userAgent')}
                      className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-blue-300 shrink-0 cursor-pointer"
                    >
                      navigator.userAgent
                    </button>
                    <button
                      onClick={() => handleExecuteConsoleCommand('performance.now()')}
                      className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-blue-300 shrink-0 cursor-pointer"
                    >
                      performance.now()
                    </button>
                    <button
                      onClick={() => handleExecuteConsoleCommand("localStorage.getItem('win10_edge_bookmarks')")}
                      className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-blue-300 shrink-0 cursor-pointer"
                    >
                      get bookmarks
                    </button>
                  </div>

                  <form
                    onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                      e.preventDefault();
                      handleExecuteConsoleCommand(consoleInput);
                    }}
                    className="flex items-center gap-2 bg-[#252526] border border-zinc-700 rounded px-2.5 py-1.5 focus-within:border-blue-500"
                  >
                    <span className="text-blue-400 font-bold">&gt;</span>
                    <input
                      type="text"
                      value={consoleInput}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConsoleInput(e.target.value)}
                      placeholder="Type JavaScript expression to evaluate (e.g. 2 + 2, window.innerWidth)..."
                      className="w-full bg-transparent outline-none text-zinc-100 placeholder-zinc-500 font-mono text-xs"
                    />
                  </form>
                </div>
              </div>
            )}

            {/* ELEMENTS TAB */}
            {devToolsTab === 'elements' && (
              <div className="text-[11px] leading-relaxed space-y-1">
                <div className="text-zinc-500">&lt;!DOCTYPE html&gt;</div>
                <div className="text-purple-400">
                  &lt;<span className="text-blue-400">html</span> <span className="text-amber-400">lang</span>="en"&gt;
                </div>
                <div className="pl-4 text-purple-400">
                  &lt;<span className="text-blue-400">head</span>&gt;
                </div>
                <div className="pl-8 text-zinc-300">
                  &lt;<span className="text-blue-400">title</span>&gt;{activeTab.title}&lt;/<span className="text-blue-400">title</span>&gt;
                </div>
                <div className="pl-8 text-zinc-300">
                  &lt;<span className="text-blue-400">meta</span> <span className="text-amber-400">charset</span>="utf-8" /&gt;
                </div>
                <div className="pl-4 text-purple-400">&lt;/<span className="text-blue-400">head</span>&gt;</div>
                <div className="pl-4 text-purple-400">
                  &lt;<span className="text-blue-400">body</span> <span className="text-amber-400">class</span>="edge-viewport fluent-theme"&gt;
                </div>
                <div className="pl-8 text-zinc-300">
                  &lt;<span className="text-blue-400">div</span> <span className="text-amber-400">id</span>="active-tab-container" <span className="text-amber-400">data-view</span>="{activeTab.view}"&gt;
                </div>
                <div className="pl-12 text-zinc-400 italic">
                  &lt;!-- Active Viewport: {activeTab.url} (Zoom: {pageZoom}%) --&gt;
                </div>
                <div className="pl-8 text-purple-400">&lt;/<span className="text-blue-400">div</span>&gt;</div>
                <div className="pl-4 text-purple-400">&lt;/<span className="text-blue-400">body</span>&gt;</div>
                <div className="text-purple-400">&lt;/<span className="text-blue-400">html</span>&gt;</div>
              </div>
            )}

            {/* NETWORK TAB */}
            {devToolsTab === 'network' && (
              <div>
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-zinc-700 text-zinc-400">
                      <th className="py-1">Name</th>
                      <th className="py-1">Status</th>
                      <th className="py-1">Type</th>
                      <th className="py-1">Size</th>
                      <th className="py-1">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {networkLogs.map((req: NetworkEntry) => (
                      <tr key={req.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/40">
                        <td className="py-1 text-blue-400 truncate max-w-xs">{req.url}</td>
                        <td className="py-1 text-emerald-400 font-bold">{req.status}</td>
                        <td className="py-1 text-zinc-400">{req.type}</td>
                        <td className="py-1 text-zinc-400">{req.size}</td>
                        <td className="py-1 text-zinc-400">{req.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* STORAGE TAB */}
            {devToolsTab === 'storage' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-zinc-300 mb-2 flex items-center justify-between">
                    <span>LocalStorage Keys</span>
                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        localStorage.removeItem('win10_edge_bookmarks');
                        localStorage.removeItem('win10_edge_history');
                        localStorage.removeItem('win10_edge_downloads');
                        setBookmarks([]);
                        setHistoryList([]);
                        setDownloads([]);
                      }}
                      className="px-2 py-0.5 text-[10px] bg-red-900/40 hover:bg-red-800 text-red-200 rounded cursor-pointer"
                    >
                      Clear Storage
                    </button>
                  </h4>
                  <div className="space-y-2">
                    <div className="p-2 bg-zinc-800 rounded border border-zinc-700">
                      <div className="text-blue-400 font-semibold mb-1">win10_edge_bookmarks ({bookmarks.length} items)</div>
                      <div className="text-zinc-400 text-[10px] truncate">{JSON.stringify(bookmarks)}</div>
                    </div>
                    <div className="p-2 bg-zinc-800 rounded border border-zinc-700">
                      <div className="text-blue-400 font-semibold mb-1">win10_edge_history ({historyList.length} items)</div>
                      <div className="text-zinc-400 text-[10px] truncate">{JSON.stringify(historyList)}</div>
                    </div>
                    <div className="p-2 bg-zinc-800 rounded border border-zinc-700">
                      <div className="text-blue-400 font-semibold mb-1">win10_edge_downloads ({downloads.length} items)</div>
                      <div className="text-zinc-400 text-[10px] truncate">{JSON.stringify(downloads)}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
