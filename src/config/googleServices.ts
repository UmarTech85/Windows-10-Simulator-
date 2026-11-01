export interface GoogleServicesConfig {
  projectNumber: string;
  projectId: string;
  storageBucket: string;
  mobileSdkAppId: string;
  packageName: string;
  apiKey: string;
  serviceStatus: 'active' | 'connecting' | 'verified';
  connectedAccount: {
    name: string;
    email: string;
    avatar: string;
    role: string;
    storageUsedGb: number;
    storageTotalGb: number;
  };
}

export const GOOGLE_SERVICES_CONFIG: GoogleServicesConfig = {
  projectNumber: '461344985768',
  projectId: 'windows-10-simulator-d01e3',
  storageBucket: 'windows-10-simulator-d01e3.firebasestorage.app',
  mobileSdkAppId: '1:461344985768:android:95de1583ebae749ca4289d',
  packageName: 'com.company.windows10simulator',
  apiKey: 'AIzaSyDsNNneAG08Dy3eZeK2XWxmV75cCq-x5Gs',
  serviceStatus: 'active',
  connectedAccount: {
    name: 'Windows 10 Developer',
    email: 'developer@windows10simulator.com',
    avatar: 'W',
    role: 'Project Owner & Developer',
    storageUsedGb: 1.42,
    storageTotalGb: 15.0,
  },
};

export interface GoogleServiceItem {
  id: string;
  name: string;
  description: string;
  url: string;
  view:
    | 'google'
    | 'googleSearch'
    | 'youtube'
    | 'gmail'
    | 'drive'
    | 'maps'
    | 'gemini'
    | 'translate'
    | 'keep'
    | 'googleServices';
  color: string;
  badge?: string;
  category: 'core' | 'productivity' | 'media' | 'tools';
}

export const GOOGLE_SERVICES_CATALOG: GoogleServiceItem[] = [
  {
    id: 'search',
    name: 'Search',
    description: 'Find information, web pages, images, and videos',
    url: 'https://www.google.com',
    view: 'google',
    color: '#4285F4',
    category: 'core',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Watch, browse, and search videos, live streams, and channels',
    url: 'https://www.youtube.com',
    view: 'youtube',
    color: '#FF0000',
    badge: 'Popular',
    category: 'media',
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Secure, fast, and organized webmail inbox & messaging',
    url: 'https://mail.google.com',
    view: 'gmail',
    color: '#EA4335',
    badge: '3 New',
    category: 'productivity',
  },
  {
    id: 'drive',
    name: 'Drive',
    description: 'Cloud storage and file sync backed by Firebase Storage',
    url: 'https://drive.google.com',
    view: 'drive',
    color: '#34A853',
    badge: '1.4 GB',
    category: 'productivity',
  },
  {
    id: 'maps',
    name: 'Maps',
    description: 'Explore satellite views, terrain, landmarks, and routes',
    url: 'https://maps.google.com',
    view: 'maps',
    color: '#34A853',
    category: 'tools',
  },
  {
    id: 'gemini',
    name: 'Gemini AI',
    description: 'Next-generation AI assistant for coding, writing, and answers',
    url: 'https://gemini.google.com',
    view: 'gemini',
    color: '#1A73E8',
    badge: '2.5 Pro',
    category: 'tools',
  },
  {
    id: 'translate',
    name: 'Translate',
    description: 'Instantly translate text, speech, and dictionary lookups',
    url: 'https://translate.google.com',
    view: 'translate',
    color: '#4285F4',
    category: 'tools',
  },
  {
    id: 'keep',
    name: 'Keep Notes',
    description: 'Capture notes, checklists, and ideas in sticky cards',
    url: 'https://keep.google.com',
    view: 'keep',
    color: '#FBBC04',
    category: 'productivity',
  },
  {
    id: 'services_hub',
    name: 'Services Hub',
    description: 'Manage linked Firebase project credentials & storage',
    url: 'edge://google-services',
    view: 'googleServices',
    color: '#4285F4',
    badge: 'Configured',
    category: 'core',
  },
];
