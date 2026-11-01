import React, { useState, useRef, useEffect } from 'react';
import { YouTubeIcon } from './GoogleIcons';
import { soundEngine } from '../../../utils/sound';

interface VideoItem {
  id: string;
  title: string;
  channel: string;
  channelAvatar: string;
  subscribers: string;
  views: string;
  timeAgo: string;
  duration: string;
  thumbnailColor: string;
  category: 'all' | 'windows' | 'gaming' | 'tech' | 'music';
  badge?: string;
  description: string;
  likes: number;
}

const INITIAL_VIDEOS: VideoItem[] = [
  {
    id: 'v-1',
    title: 'Windows 10 Official Launch & Continuum Demo: The Future of Desktop Computing',
    channel: 'Microsoft Windows',
    channelAvatar: '🪟',
    subscribers: '3.4M',
    views: '12.8M views',
    timeAgo: '9 years ago',
    duration: '14:20',
    thumbnailColor: 'from-blue-700 via-sky-600 to-indigo-900',
    category: 'windows',
    badge: 'Classic',
    description:
      'Experience the debut of Windows 10, introducing the hybrid Start Menu, virtual desktops, Cortana assistant, DirectX 12 hardware acceleration, and the revolutionary Continuum desktop mode.',
    likes: 428000,
  },
  {
    id: 'v-2',
    title: 'DirectX 12 Ultimate Benchmark & Real-time Ray Tracing Showcase (60 FPS 4K)',
    channel: 'DirectX Graphics Lab',
    channelAvatar: '⚡',
    subscribers: '890K',
    views: '2.4M views',
    timeAgo: '1 year ago',
    duration: '09:45',
    thumbnailColor: 'from-purple-800 via-violet-600 to-slate-900',
    category: 'gaming',
    badge: '4K HDR',
    description:
      'In-depth graphics benchmark comparing DirectX 12 Ultimate, DXR ray tracing pipelines, variable rate shading, and mesh shaders with ultra-low latency CPU driver draw-calls.',
    likes: 182000,
  },
  {
    id: 'v-3',
    title: 'Building an Authentic Windows 10 Desktop OS Simulator in React 19 & TypeScript',
    channel: 'FullStack Developer HQ',
    channelAvatar: '💻',
    subscribers: '1.2M',
    views: '740K views',
    timeAgo: '2 months ago',
    duration: '22:15',
    thumbnailColor: 'from-emerald-700 via-teal-600 to-slate-900',
    category: 'tech',
    badge: 'Code Demo',
    description:
      'Architecting a pixel-perfect Windows 10 operating system in the browser using React 19, Tailwind CSS, Web Audio synthesis, interactive File Explorer, Edge browser, and authentic Live Tiles.',
    likes: 95400,
  },
  {
    id: 'v-4',
    title: 'Lofi Hip Hop Radio - Relaxing Study / Coding Beats [24/7 Live Stream]',
    channel: 'ChillHop Beats',
    channelAvatar: '🎧',
    subscribers: '14.1M',
    views: '54.2M views',
    timeAgo: 'Live Now',
    duration: 'LIVE',
    thumbnailColor: 'from-amber-700 via-orange-600 to-rose-950',
    category: 'music',
    badge: 'LIVE',
    description:
      'Smooth beats and warm analog jazz progressions to boost your focus while developing applications, browsing the web, or relaxing.',
    likes: 2450000,
  },
  {
    id: 'v-5',
    title: 'The Evolution of Microsoft Windows: From Windows 1.0 (1985) to Windows 10',
    channel: 'Tech Nostalgia Vault',
    channelAvatar: '📼',
    subscribers: '2.1M',
    views: '8.9M views',
    timeAgo: '3 years ago',
    duration: '18:50',
    thumbnailColor: 'from-cyan-800 via-blue-700 to-indigo-950',
    category: 'windows',
    badge: 'History',
    description:
      'A chronological visual documentary covering 30+ years of GUI design: Windows 3.1, Windows 95, Windows 98, Windows XP Luna, Windows 7 Aero Glass, and Windows 10 Fluent Design.',
    likes: 310000,
  },
  {
    id: 'v-6',
    title: 'Google I/O Keynote: Firebase Cloud Storage, AI Models & Android Ecosystem',
    channel: 'Google Developers',
    channelAvatar: '🌐',
    subscribers: '5.8M',
    views: '4.1M views',
    timeAgo: '6 months ago',
    duration: '31:10',
    thumbnailColor: 'from-red-700 via-rose-600 to-slate-900',
    category: 'tech',
    badge: 'Keynote',
    description:
      'Explore the latest developer tooling from Google, including Firebase App SDKs, real-time database syncing, Cloud Storage buckets, and responsive web application integrations.',
    likes: 215000,
  },
];

interface CommentItem {
  id: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
}

interface YouTubeAppProps {
  onNavigate: (view: any, url: string, title: string) => void;
  onOpenAppsWaffle: () => void;
}

export const YouTubeApp: React.FC<YouTubeAppProps> = ({
  onNavigate,
  onOpenAppsWaffle,
}) => {
  const [videos] = useState<VideoItem[]>(INITIAL_VIDEOS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'windows' | 'gaming' | 'tech' | 'music'
  >('all');
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  // Player Controls
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoProgress, setVideoProgress] = useState(15);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasDisliked, setHasDisliked] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState<CommentItem[]>([
    {
      id: 'c-1',
      author: 'Alex Carter',
      avatar: 'A',
      text: 'The nostalgia hits so hard! Windows 10 with Edge and DirectX 12 running right inside this simulator is incredible.',
      time: '2 hours ago',
      likes: 42,
    },
    {
      id: 'c-2',
      author: 'Sara Chen',
      avatar: 'S',
      text: 'Crisp audio playback, smooth UI transitions, and authentic video player controls. Top tier work!',
      time: '1 day ago',
      likes: 19,
    },
    {
      id: 'c-3',
      author: 'DirectX Dev',
      avatar: 'D',
      text: 'DirectX 12 feature levels 12_1 and 12_2 allow high-throughput GPU task scheduling without stalling the main thread.',
      time: '3 days ago',
      likes: 85,
    },
  ]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Filtered list
  const filteredVideos = videos.filter((v) => {
    const matchesCategory =
      selectedCategory === 'all' || v.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.channel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Simulated visual canvas for active video player
  useEffect(() => {
    if (!activeVideo || !isPlaying) return;

    let animId: number;
    let t = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      t += 0.04;
      ctx.fillStyle = '#0f0f0f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dynamic color wave gradient background
      const grad = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );
      if (activeVideo.category === 'windows') {
        grad.addColorStop(0, '#0078d7');
        grad.addColorStop(0.5, '#0284c7');
        grad.addColorStop(1, '#1e1b4b');
      } else if (activeVideo.category === 'gaming') {
        grad.addColorStop(0, '#7c3aed');
        grad.addColorStop(0.5, '#4f46e5');
        grad.addColorStop(1, '#09090b');
      } else if (activeVideo.category === 'music') {
        grad.addColorStop(0, '#d97706');
        grad.addColorStop(0.5, '#e11d48');
        grad.addColorStop(1, '#18181b');
      } else {
        grad.addColorStop(0, '#059669');
        grad.addColorStop(0.5, '#0d9488');
        grad.addColorStop(1, '#172554');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Oscilloscope sound bars / audio visualization
      const bars = 48;
      const barWidth = canvas.width / bars;
      for (let i = 0; i < bars; i++) {
        const h =
          Math.sin(t + i * 0.25) * 40 +
          Math.cos(t * 1.5 + i * 0.4) * 35 +
          50;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(
          i * barWidth + 2,
          canvas.height / 2 - h / 2,
          barWidth - 4,
          h
        );
      }

      // Title watermark in video canvas
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
      ctx.textAlign = 'center';
      ctx.fillText(activeVideo.title.slice(0, 48) + '...', canvas.width / 2, 40);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '12px sans-serif';
      ctx.fillText(
        `${activeVideo.channel} • HD 1080p 60fps`,
        canvas.width / 2,
        65
      );

      // Play head increment
      setVideoProgress((prev) => (prev >= 100 ? 0 : prev + 0.15));

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [activeVideo, isPlaying]);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    soundEngine.playClick();
    const newComment: CommentItem = {
      id: `c-${Date.now()}`,
      author: 'Windows 10 User',
      avatar: 'W',
      text: commentInput.trim(),
      time: 'Just now',
      likes: 1,
    };
    setComments([newComment, ...comments]);
    setCommentInput('');
  };

  return (
    <div className="min-h-full flex flex-col bg-[#0f0f0f] text-white font-sans select-none">
      {/* 1. YouTube Header */}
      <header className="sticky top-0 z-30 bg-[#0f0f0f]/95 backdrop-blur-md px-4 py-2.5 flex items-center justify-between border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <div
            onClick={() => {
              setActiveVideo(null);
              soundEngine.playClick();
            }}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <YouTubeIcon className="w-7 h-7 text-red-600" />
            <span className="font-bold text-lg tracking-tighter">YouTube</span>
            <span className="text-[10px] text-zinc-400 font-medium ml-0.5">
              US
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              soundEngine.playClick();
            }}
            className="flex items-center"
          >
            <div className="flex-1 flex items-center bg-[#121212] border border-zinc-700 rounded-l-full px-4 py-1.5 focus-within:border-blue-500">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search YouTube videos, topics, or channels"
                className="w-full bg-transparent outline-none text-xs text-white placeholder-zinc-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-zinc-400 hover:text-white mr-1 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              className="bg-zinc-800 hover:bg-zinc-700 px-5 py-2 rounded-r-full border border-l-0 border-zinc-700 text-zinc-300 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </form>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAppsWaffle}
            title="Google Apps"
            className="p-2 hover:bg-zinc-800 rounded-full text-zinc-300 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
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

          <div
            title="Signed in: Windows 10 User"
            className="w-8 h-8 rounded-full bg-blue-600 text-white font-medium flex items-center justify-center text-xs cursor-pointer shadow-xs"
          >
            W
          </div>
        </div>
      </header>

      {/* 2. Main Content: Video Watch View OR Feed Grid */}
      {activeVideo ? (
        /* WATCH / THEATER MODE */
        <div className="flex-1 max-w-7xl mx-auto w-full p-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Video Player & Info */}
          <div className="lg:col-span-8 flex flex-col gap-3">
            {/* Interactive Player Frame */}
            <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-zinc-800 group">
              <canvas
                ref={canvasRef}
                width={800}
                height={450}
                className="w-full h-full object-cover"
              />

              {/* Player Overlay Controls */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-white truncate max-w-md">
                    {activeVideo.title}
                  </span>
                  <button
                    onClick={() => setActiveVideo(null)}
                    className="p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white"
                  >
                    ✕
                  </button>
                </div>

                <div>
                  {/* Progress Scrubber */}
                  <div
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pos = (e.clientX - rect.left) / rect.width;
                      setVideoProgress(Math.max(0, Math.min(100, pos * 100)));
                    }}
                    className="w-full h-1.5 bg-white/30 rounded-full cursor-pointer relative mb-3 hover:h-2.5 transition-all"
                  >
                    <div
                      className="h-full bg-red-600 rounded-full relative"
                      style={{ width: `${videoProgress}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full shadow" />
                    </div>
                  </div>

                  {/* Buttons Toolbar */}
                  <div className="flex items-center justify-between text-xs text-white">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-2 hover:bg-white/20 rounded-full text-white transition-colors"
                      >
                        {isPlaying ? '⏸' : '▶'}
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsMuted(!isMuted)}
                          className="hover:text-red-400"
                        >
                          {isMuted || volume === 0 ? '🔇' : '🔊'}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={isMuted ? 0 : volume}
                          onChange={(e) => {
                            setVolume(Number(e.target.value));
                            setIsMuted(false);
                          }}
                          className="w-20 accent-red-600 cursor-pointer"
                        />
                      </div>

                      <span className="text-[11px] text-zinc-300 font-mono">
                        {Math.floor((videoProgress / 100) * 12)}:
                        {String(
                          Math.floor(((videoProgress / 100) * 60) % 60)
                        ).padStart(2, '0')}{' '}
                        / {activeVideo.duration}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="bg-red-600/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        HD 1080p
                      </span>
                      <button
                        onClick={() => {
                          const elem = canvasRef.current;
                          if (elem?.requestFullscreen) elem.requestFullscreen();
                        }}
                        className="p-1.5 hover:bg-white/20 rounded"
                        title="Fullscreen"
                      >
                        ⛶
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Details Bar */}
            <h1 className="text-base sm:text-lg font-bold text-white mt-1 leading-snug">
              {activeVideo.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-xl font-bold shadow-xs">
                  {activeVideo.channelAvatar}
                </div>
                <div>
                  <h3 className="font-semibold text-xs text-white">
                    {activeVideo.channel}
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    {activeVideo.subscribers} subscribers
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsSubscribed(!isSubscribed);
                    soundEngine.playDing();
                  }}
                  className={`ml-3 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isSubscribed
                      ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      : 'bg-white text-black hover:bg-zinc-200'
                  }`}
                >
                  {isSubscribed ? '✓ Subscribed' : 'Subscribe'}
                </button>
              </div>

              {/* Action Buttons: Like / Dislike / Share */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-zinc-800 rounded-full overflow-hidden text-xs">
                  <button
                    onClick={() => {
                      setHasLiked(!hasLiked);
                      if (!hasLiked) setHasDisliked(false);
                      soundEngine.playClick();
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 hover:bg-zinc-700 transition-colors ${
                      hasLiked ? 'text-blue-400 font-bold' : 'text-zinc-200'
                    }`}
                  >
                    <span>👍</span>
                    <span>
                      {(
                        (activeVideo.likes + (hasLiked ? 1 : 0)) /
                        1000
                      ).toFixed(1)}
                      k
                    </span>
                  </button>
                  <div className="w-px h-4 bg-zinc-700" />
                  <button
                    onClick={() => {
                      setHasDisliked(!hasDisliked);
                      if (!hasDisliked) setHasLiked(false);
                      soundEngine.playClick();
                    }}
                    className={`px-3 py-1.5 hover:bg-zinc-700 transition-colors ${
                      hasDisliked ? 'text-red-400' : 'text-zinc-200'
                    }`}
                  >
                    <span>👎</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    soundEngine.playClick();
                    navigator.clipboard?.writeText(window.location.href);
                  }}
                  className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <span>🔗</span>
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-zinc-900/80 p-3.5 rounded-xl text-xs text-zinc-300 leading-relaxed border border-zinc-800">
              <div className="flex items-center gap-3 font-semibold text-white mb-1.5">
                <span>{activeVideo.views}</span>
                <span>•</span>
                <span>{activeVideo.timeAgo}</span>
                {activeVideo.badge && (
                  <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded text-[10px]">
                    {activeVideo.badge}
                  </span>
                )}
              </div>
              <p>{activeVideo.description}</p>
            </div>

            {/* Comments Section */}
            <div className="mt-4">
              <h3 className="font-bold text-sm text-white mb-3">
                {comments.length} Comments
              </h3>

              {/* Add comment box */}
              <form onSubmit={handlePostComment} className="flex gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-medium flex items-center justify-center text-xs shrink-0">
                  W
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Add a comment as Windows 10 User..."
                    className="w-full bg-transparent border-b border-zinc-700 focus:border-white outline-none pb-1 text-xs text-white placeholder-zinc-500"
                  />
                  {commentInput && (
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setCommentInput('')}
                        className="px-3 py-1 rounded-full text-xs text-zinc-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 rounded-full text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                      >
                        Comment
                      </button>
                    </div>
                  )}
                </div>
              </form>

              {/* Comment list */}
              <div className="space-y-4">
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-3 text-xs">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 text-white font-semibold flex items-center justify-center text-xs shrink-0">
                      {c.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-white">
                          {c.author}
                        </span>
                        <span className="text-[11px] text-zinc-500">{c.time}</span>
                      </div>
                      <p className="text-zinc-300 leading-normal">{c.text}</p>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-zinc-400">
                        <button className="hover:text-white">👍 {c.likes}</button>
                        <button className="hover:text-white">👎</button>
                        <button className="hover:text-white font-medium">
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Related Videos */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="font-semibold text-xs text-zinc-400 uppercase tracking-wider mb-2">
              Up Next
            </h3>
            {videos
              .filter((v) => v.id !== activeVideo.id)
              .map((v) => (
                <div
                  key={v.id}
                  onClick={() => {
                    setActiveVideo(v);
                    setVideoProgress(0);
                    soundEngine.playClick();
                  }}
                  className="flex gap-2.5 p-2 rounded-xl hover:bg-zinc-800/70 cursor-pointer transition-colors group"
                >
                  <div
                    className={`w-36 aspect-video rounded-lg bg-gradient-to-br ${v.thumbnailColor} relative shrink-0 overflow-hidden flex items-center justify-center shadow-xs`}
                  >
                    <span className="text-xl opacity-80 group-hover:scale-110 transition-transform">
                      {v.channelAvatar}
                    </span>
                    <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] text-white px-1 py-0.2 rounded font-mono">
                      {v.duration}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-medium text-white line-clamp-2 leading-snug group-hover:text-blue-400">
                      {v.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-1 truncate">
                      {v.channel}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      {v.views} • {v.timeAgo}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : (
        /* HOME FEED GRID */
        <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6">
          {/* Category Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 text-xs scrollbar-none">
            {[
              { id: 'all', label: 'All' },
              { id: 'windows', label: 'Windows 10' },
              { id: 'gaming', label: 'DirectX 12 Gaming' },
              { id: 'tech', label: 'Developer & OS' },
              { id: 'music', label: 'Lofi Music' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id as any);
                  soundEngine.playClick();
                }}
                className={`px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-white text-black'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Videos Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => {
                  setActiveVideo(video);
                  setVideoProgress(0);
                  soundEngine.playClick();
                }}
                className="group cursor-pointer flex flex-col gap-2.5 transition-transform hover:-translate-y-0.5"
              >
                {/* Thumbnail Card */}
                <div
                  className={`w-full aspect-video rounded-xl bg-gradient-to-br ${video.thumbnailColor} relative overflow-hidden flex items-center justify-center shadow-lg border border-zinc-800`}
                >
                  <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center text-white text-2xl group-hover:scale-115 transition-transform shadow-md">
                    ▶
                  </div>

                  {video.badge && (
                    <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                      {video.badge}
                    </span>
                  )}

                  <span className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-xs text-white text-[11px] font-mono px-1.5 py-0.5 rounded">
                    {video.duration}
                  </span>
                </div>

                {/* Video Info Row */}
                <div className="flex gap-3 px-0.5">
                  <div className="w-9 h-9 rounded-full bg-zinc-800 text-white text-base flex items-center justify-center shrink-0 shadow-xs">
                    {video.channelAvatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs sm:text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-blue-400">
                      {video.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 truncate">
                      {video.channel}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      {video.views} • {video.timeAgo}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
