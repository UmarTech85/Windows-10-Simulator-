import React, { useState } from 'react';
import { GoogleMapsIcon } from './GoogleIcons';
import { soundEngine } from '../../../utils/sound';

interface MapLocation {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  address: string;
  rating: number;
  reviewsCount: number;
  openStatus: string;
  description: string;
  drivingEta: string;
  transitEta: string;
  walkingEta: string;
  bgColor: string;
  landmarkEmoji: string;
}

const PRESET_LOCATIONS: MapLocation[] = [
  {
    id: 'googleplex',
    name: 'Googleplex Headquarters',
    category: 'Corporate Campus',
    lat: 37.422,
    lng: -122.0841,
    address: '1600 Amphitheatre Pkwy, Mountain View, CA 94043',
    rating: 4.8,
    reviewsCount: 14200,
    openStatus: 'Open • Closes 6 PM',
    description:
      'The global headquarters of Google and Alphabet Inc., featuring Android lawn statues, cutting-edge software engineering labs, and sustainable green architecture.',
    drivingEta: '18 min (14.2 mi)',
    transitEta: '35 min (Caltrain)',
    walkingEta: '3 hr 20 min',
    bgColor: 'from-blue-600 to-indigo-900',
    landmarkEmoji: '🌐',
  },
  {
    id: 'microsoft',
    name: 'Microsoft Redmond Campus',
    category: 'Technology Headquarters',
    lat: 47.6423,
    lng: -122.1391,
    address: 'One Microsoft Way, Redmond, WA 98052',
    rating: 4.7,
    reviewsCount: 9800,
    openStatus: 'Open • Closes 5 PM',
    description:
      'The sprawling corporate headquarters of Microsoft Corporation where Windows 10, DirectX 12, Microsoft Edge, and Azure cloud computing are developed.',
    drivingEta: '22 min (16.8 mi)',
    transitEta: '40 min (Sound Transit)',
    walkingEta: '4 hr 10 min',
    bgColor: 'from-sky-600 to-blue-900',
    landmarkEmoji: '🪟',
  },
  {
    id: 'timessquare',
    name: 'Times Square & Midtown',
    category: 'Entertainment Hub',
    lat: 40.758,
    lng: -73.9855,
    address: 'Manhattan, New York, NY 10036',
    rating: 4.7,
    reviewsCount: 320000,
    openStatus: 'Open 24 hours',
    description:
      'Major commercial intersection and tourist destination in Midtown Manhattan, illuminated by massive electronic billboards and Broadway theaters.',
    drivingEta: '12 min (2.4 mi)',
    transitEta: '8 min (Subway N/Q/R/W)',
    walkingEta: '25 min',
    bgColor: 'from-amber-600 to-red-900',
    landmarkEmoji: '🗽',
  },
  {
    id: 'eiffel',
    name: 'Eiffel Tower',
    category: 'Historic Monument',
    lat: 48.8584,
    lng: 2.2945,
    address: 'Champ de Mars, 5 Av. Anatole France, 75007 Paris, France',
    rating: 4.9,
    reviewsCount: 420000,
    openStatus: 'Open • Closes 11:45 PM',
    description:
      'Wrought-iron lattice tower on the Champ de Mars, constructed in 1889 as the centerpiece of the 1889 World Fair. Global cultural icon of France.',
    drivingEta: '15 min (4.1 km)',
    transitEta: '18 min (Metro Line 6)',
    walkingEta: '45 min',
    bgColor: 'from-rose-600 to-indigo-950',
    landmarkEmoji: '🗼',
  },
  {
    id: 'tokyo',
    name: 'Shibuya Crossing & Tokyo Tower',
    category: 'Urban Landmark',
    lat: 35.6595,
    lng: 139.7005,
    address: 'Shibuya City, Tokyo 150-8010, Japan',
    rating: 4.8,
    reviewsCount: 180000,
    openStatus: 'Open 24 hours',
    description:
      'The world famous scramble pedestrian crossing outside Shibuya Station, surrounded by giant video screens and neon lights.',
    drivingEta: '20 min (6.8 km)',
    transitEta: '12 min (Yamanote Line)',
    walkingEta: '55 min',
    bgColor: 'from-purple-700 to-pink-900',
    landmarkEmoji: '🗾',
  },
];

interface GoogleMapsAppProps {
  onNavigate: (view: any, url: string, title: string) => void;
  onOpenAppsWaffle: () => void;
}

export const GoogleMapsApp: React.FC<GoogleMapsAppProps> = ({
  onNavigate,
  onOpenAppsWaffle,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation>(
    PRESET_LOCATIONS[0]
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [mapLayer, setMapLayer] = useState<'roadmap' | 'satellite'>('roadmap');
  const [zoomLevel, setZoomLevel] = useState(15);
  const [showDirections, setShowDirections] = useState(false);

  const filteredLocations = PRESET_LOCATIONS.filter((loc) =>
    !searchQuery
      ? true
      : loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative w-full h-full flex flex-col bg-zinc-100 dark:bg-zinc-900 font-sans select-none overflow-hidden">
      {/* 1. Floating Map Search Bar */}
      <div className="absolute top-4 left-4 z-20 w-full max-w-sm">
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-700 p-2 flex items-center gap-2">
          <GoogleMapsIcon className="w-5 h-5 ml-1 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Google Maps"
            className="w-full bg-transparent outline-none text-xs text-zinc-800 dark:text-zinc-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-zinc-400 hover:text-zinc-600 text-xs px-1"
            >
              ✕
            </button>
          )}
          <button
            onClick={() => soundEngine.playClick()}
            className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
          >
            🔍
          </button>
        </div>

        {/* Search Results Dropdown */}
        {searchQuery && (
          <div className="mt-2 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden text-xs">
            {filteredLocations.map((loc) => (
              <div
                key={loc.id}
                onClick={() => {
                  setSelectedLocation(loc);
                  setSearchQuery('');
                  soundEngine.playClick();
                }}
                className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer flex items-center gap-3 border-b last:border-b-0 border-zinc-100 dark:border-zinc-700"
              >
                <span className="text-xl">{loc.landmarkEmoji}</span>
                <div className="truncate">
                  <div className="font-semibold text-zinc-900 dark:text-white">
                    {loc.name}
                  </div>
                  <div className="text-[11px] text-zinc-400 truncate">
                    {loc.address}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Top Right Google Apps Button */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          onClick={onOpenAppsWaffle}
          className="p-2.5 bg-white dark:bg-zinc-800 rounded-full shadow-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
          title="Google apps"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="5" cy="5" r="2" />
            <circle cx="12" cy="5" r="2" />
            <circle cx="19" cy="5" r="2" />
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
            <circle cx="5" cy="19" r="2" />
            <circle cx="12" cy="19" r="2" />
            <circle cx="19" cy="19" r="2" />
          </svg>
        </button>
      </div>

      {/* 3. Interactive Map Canvas Simulation */}
      <div
        className={`w-full h-full relative flex items-center justify-center transition-colors duration-500 ${
          mapLayer === 'satellite' ? 'bg-[#0f172a]' : 'bg-[#e5e7eb] dark:bg-[#18181b]'
        }`}
      >
        {/* Vector Grid / Street Pattern */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#4285F4_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Dynamic Landscape & Roads Simulation */}
        <div className="relative w-full max-w-4xl h-96 rounded-3xl overflow-hidden shadow-2xl border border-zinc-300 dark:border-zinc-700 bg-gradient-to-br from-emerald-100 via-sky-50 to-blue-100 dark:from-zinc-800 dark:via-zinc-900 dark:to-slate-900 flex items-center justify-center">
          {/* Street Arteries */}
          <div className="absolute w-full h-10 bg-amber-200 dark:bg-zinc-700/60 rotate-12 shadow-sm" />
          <div className="absolute w-12 h-full bg-amber-200 dark:bg-zinc-700/60 -rotate-25 shadow-sm" />

          {/* Location Pin */}
          <div className="relative z-10 flex flex-col items-center animate-bounce">
            <div className="px-3 py-1.5 bg-red-600 text-white rounded-full shadow-lg font-bold text-xs flex items-center gap-1.5">
              <span>{selectedLocation.landmarkEmoji}</span>
              <span>{selectedLocation.name}</span>
            </div>
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-red-600" />
            <div className="w-4 h-1.5 bg-black/30 rounded-full blur-[1px] mt-0.5" />
          </div>

          {/* Coordinate Watermark */}
          <div className="absolute bottom-3 left-4 text-[11px] font-mono text-zinc-500 dark:text-zinc-400 bg-white/70 dark:bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
            {selectedLocation.lat.toFixed(4)}° N, {Math.abs(selectedLocation.lng).toFixed(4)}° W • Zoom {zoomLevel}x
          </div>
        </div>

        {/* Zoom & Layer Controls */}
        <div className="absolute right-4 bottom-8 z-20 flex flex-col gap-2">
          {/* Satellite Toggle */}
          <button
            onClick={() => {
              setMapLayer(mapLayer === 'roadmap' ? 'satellite' : 'roadmap');
              soundEngine.playClick();
            }}
            className="p-3 bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-xs font-semibold flex items-center gap-1.5"
          >
            <span>{mapLayer === 'roadmap' ? '🛰️ Satellite' : '🗺️ Map'}</span>
          </button>

          {/* Zoom Buttons */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden flex flex-col">
            <button
              onClick={() => setZoomLevel((z) => Math.min(20, z + 1))}
              className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 font-bold text-sm border-b border-zinc-200 dark:border-zinc-700"
            >
              +
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(5, z - 1))}
              className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 font-bold text-sm"
            >
              −
            </button>
          </div>
        </div>
      </div>

      {/* 4. Left Location Details Card */}
      <div className="absolute bottom-6 left-4 z-20 w-full max-w-sm bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 p-4 animate-fadeIn">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              {selectedLocation.category}
            </span>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white leading-snug">
              {selectedLocation.name}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <span className="font-bold text-amber-500">
                ★ {selectedLocation.rating}
              </span>
              <span className="text-zinc-400">
                ({selectedLocation.reviewsCount.toLocaleString()})
              </span>
              <span className="text-emerald-600 font-medium">
                {selectedLocation.openStatus}
              </span>
            </div>
          </div>
          <span className="text-3xl">{selectedLocation.landmarkEmoji}</span>
        </div>

        <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-2.5 line-clamp-2 leading-relaxed">
          {selectedLocation.description}
        </p>
        <p className="text-[11px] text-zinc-400 mt-1 truncate">
          📍 {selectedLocation.address}
        </p>

        {/* Directions CTA Button */}
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-700 flex items-center justify-between">
          <button
            onClick={() => {
              setShowDirections(!showDirections);
              soundEngine.playDing();
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold text-xs flex items-center gap-1.5 shadow-md transition-colors"
          >
            <span>🧭</span>
            <span>Directions</span>
          </button>

          {/* Quick preset changer */}
          <div className="flex gap-1">
            {PRESET_LOCATIONS.slice(0, 4).map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedLocation(p);
                  soundEngine.playClick();
                }}
                title={p.name}
                className={`w-7 h-7 rounded-full text-xs flex items-center justify-center transition-all ${
                  selectedLocation.id === p.id
                    ? 'ring-2 ring-blue-500 scale-110'
                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-700'
                }`}
              >
                {p.landmarkEmoji}
              </button>
            ))}
          </div>
        </div>

        {/* Directions Drawer */}
        {showDirections && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 text-xs space-y-2 animate-fadeIn">
            <div className="font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-1">
              <span>🚗 Driving:</span>
              <span>{selectedLocation.drivingEta}</span>
            </div>
            <div className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
              <span>🚆 Transit:</span>
              <span>{selectedLocation.transitEta}</span>
            </div>
            <div className="font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
              <span>🚶 Walking:</span>
              <span>{selectedLocation.walkingEta}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
