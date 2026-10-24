import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Music,
  Disc3,
  ListMusic,
  Heart,
  Shuffle,
  Repeat,
  Repeat1,
  Sliders,
  Upload,
  Search,
  Plus,
  User,
  Radio,
  Sparkles,
} from 'lucide-react';
import { GrooveTrack, MusicPlayerState } from '../../types/music';
import { musicGenerator, EQ_FREQUENCIES, EQ_PRESETS } from '../../utils/musicSynth';
import { soundEngine } from '../../utils/sound';

interface GrooveMusicProps {
  player: MusicPlayerState;
}

type ViewMode = 'songs' | 'artists' | 'albums' | 'playlists' | 'nowPlaying' | 'equalizer';

export const GrooveMusic: React.FC<GrooveMusicProps> = ({ player }) => {
  const [activeView, setActiveView] = useState<ViewMode>('songs');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Playlists
  const [playlists, setPlaylists] = useState<{ id: string; name: string; trackIds: string[] }[]>([
    { id: 'pl-fav', name: 'Favorites', trackIds: ['gt-1', 'gt-3'] },
    { id: 'pl-chill', name: 'Chill Sessions', trackIds: ['gt-1', 'gt-3', 'gt-5'] },
    { id: 'pl-energy', name: 'Upbeat Focus', trackIds: ['gt-2', 'gt-4'] },
  ]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState<string>('');
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState<boolean>(false);

  // Equalizer
  const [eqGains, setEqGains] = useState<number[]>(() => musicGenerator.getEqGains());
  const [activeEqPreset, setActiveEqPreset] = useState<string>('Flat');

  // Visualizer
  const [visualizerType, setVisualizerType] = useState<'spectrum' | 'wave' | 'halo'>('spectrum');
  const [spectrumData, setSpectrumData] = useState<number[]>(Array(24).fill(10));
  const [waveData, setWaveData] = useState<number[]>(Array(48).fill(128));

  const animFrameRef = useRef<number | null>(null);
  const currentTrack = player.tracks[player.currentTrackIndex] || player.tracks[0];

  // Visualizer Animation Loop (Music keeps running in background on unmount!)
  useEffect(() => {
    const updateVisualizer = () => {
      if (musicGenerator.analyser && player.isPlaying) {
        // Frequency data
        const freqArray = new Uint8Array(musicGenerator.analyser.frequencyBinCount);
        musicGenerator.analyser.getByteFrequencyData(freqArray);
        const bars: number[] = [];
        for (let i = 0; i < 24; i++) {
          const val = freqArray[i * 2] || 0;
          bars.push(Math.max(6, (val / 255) * 85));
        }
        setSpectrumData(bars);

        // Time domain wave data
        const timeArray = new Uint8Array(musicGenerator.analyser.fftSize);
        musicGenerator.analyser.getByteTimeDomainData(timeArray);
        const waveSamples: number[] = [];
        for (let i = 0; i < 48; i++) {
          waveSamples.push(timeArray[Math.floor(i * (timeArray.length / 48))]);
        }
        setWaveData(waveSamples);
      } else if (!player.isPlaying) {
        setSpectrumData((prev) => prev.map((v) => Math.max(4, v * 0.92)));
      }
      animFrameRef.current = requestAnimationFrame(updateVisualizer);
    };

    animFrameRef.current = requestAnimationFrame(updateVisualizer);
    return () => {
      // DO NOT pause music here so background desktop playback remains active!
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [player.isPlaying]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sec = parseFloat(e.target.value);
    player.seek(sec);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    player.setVolume(val);
  };

  // Custom Audio File Import
  const handleImportAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const newTrack: GrooveTrack = {
      id: `custom-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Local Artist',
      album: 'Imported Tracks',
      genre: 'User Audio',
      year: 2026,
      duration: 180,
      trackKey: 'custom',
      isFavorite: false,
      coverGradient: 'from-emerald-600 to-teal-800',
      isCustom: true,
      audioUrl: url,
    };

    player.addTrack(newTrack);
    soundEngine.playNotification();
  };

  // Playlist Management
  const handleCreatePlaylist = () => {
    const name = newPlaylistName.trim();
    if (!name) {
      setIsCreatingPlaylist(false);
      return;
    }
    soundEngine.playClick();
    const newPl = {
      id: `pl-${Date.now()}`,
      name,
      trackIds: [],
    };
    setPlaylists((prev) => [...prev, newPl]);
    setNewPlaylistName('');
    setIsCreatingPlaylist(false);
    setSelectedPlaylistId(newPl.id);
  };

  const handleEqualizerChange = (idx: number, gainDb: number) => {
    musicGenerator.setEqBand(idx, gainDb);
    setEqGains(musicGenerator.getEqGains());
    setActiveEqPreset('Custom');
  };

  const handleApplyPreset = (presetName: string) => {
    soundEngine.playClick();
    musicGenerator.applyEqPreset(presetName);
    setEqGains(musicGenerator.getEqGains());
    setActiveEqPreset(presetName);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Filtered tracks for current view & search query
  const filteredTracks = player.tracks.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.album.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;

    if (activeView === 'playlists' && selectedPlaylistId) {
      const pl = playlists.find((p) => p.id === selectedPlaylistId);
      return pl ? pl.trackIds.includes(t.id) : true;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-[#121212] text-white select-none font-sans overflow-hidden">
      {/* Top Search & Nav Bar */}
      <div className="h-12 bg-[#181818] border-b border-zinc-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-blue-400 font-semibold">
            <Disc3 size={20} className={player.isPlaying ? 'animate-spin' : ''} />
            <span className="text-sm font-semibold tracking-wide">Groove Music</span>
          </div>
          <span className="hidden sm:inline-block text-[11px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-medium">
            Background Playback Active
          </span>
        </div>

        {/* Search Input */}
        <div className="flex items-center bg-zinc-800/80 border border-zinc-700/80 rounded-full px-3 py-1 w-64 text-xs">
          <Search size={14} className="text-zinc-400 mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search music, artists, albums..."
            className="w-full bg-transparent outline-none text-zinc-200 placeholder:text-zinc-500 text-xs"
          />
        </div>

        {/* Quick Toolbar Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Equalizer Toggle */}
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveView(activeView === 'equalizer' ? 'songs' : 'equalizer');
            }}
            title="Graphic Equalizer"
            className={`p-1.5 rounded transition-colors ${
              activeView === 'equalizer'
                ? 'bg-blue-600 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Sliders size={16} />
          </button>

          {/* Now Playing Visualizer Full View */}
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveView(activeView === 'nowPlaying' ? 'songs' : 'nowPlaying');
            }}
            title="Now Playing Screen & Visualizer"
            className={`p-1.5 rounded transition-colors ${
              activeView === 'nowPlaying'
                ? 'bg-blue-600 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Radio size={16} />
          </button>

          {/* Import Audio File */}
          <label
            title="Import Audio File (MP3/WAV)"
            className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded text-xs cursor-pointer transition-colors border border-zinc-700"
          >
            <Upload size={13} className="text-blue-400" />
            <span>Import MP3</span>
            <input type="file" accept="audio/*" onChange={handleImportAudio} className="hidden" />
          </label>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <div className="w-52 bg-[#181818] border-r border-zinc-800/80 p-3 flex flex-col gap-1 text-xs shrink-0 overflow-y-auto">
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-3 py-1">
            My Music
          </div>

          <button
            onClick={() => {
              setActiveView('songs');
              setSelectedPlaylistId(null);
              soundEngine.playClick();
            }}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-md font-medium text-left transition-colors ${
              activeView === 'songs' && !selectedPlaylistId
                ? 'bg-blue-600/30 text-blue-300 font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Music size={15} />
            <span>Songs ({player.tracks.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveView('artists');
              setSelectedPlaylistId(null);
              soundEngine.playClick();
            }}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-md font-medium text-left transition-colors ${
              activeView === 'artists'
                ? 'bg-blue-600/30 text-blue-300 font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <User size={15} />
            <span>Artists</span>
          </button>

          <button
            onClick={() => {
              setActiveView('albums');
              setSelectedPlaylistId(null);
              soundEngine.playClick();
            }}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-md font-medium text-left transition-colors ${
              activeView === 'albums'
                ? 'bg-blue-600/30 text-blue-300 font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Disc3 size={15} />
            <span>Albums</span>
          </button>

          <div className="border-t border-zinc-800 my-2" />

          {/* Playlists Section */}
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-3 py-1">
            <span>Playlists</span>
            <button
              onClick={() => setIsCreatingPlaylist(!isCreatingPlaylist)}
              title="New Playlist"
              className="p-1 hover:text-white hover:bg-zinc-800 rounded"
            >
              <Plus size={13} />
            </button>
          </div>

          {/* Add Playlist Input Prompt */}
          {isCreatingPlaylist && (
            <div className="p-2 bg-zinc-800 rounded mb-1 flex flex-col gap-1.5">
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
                placeholder="Playlist name..."
                autoFocus
                className="bg-zinc-900 border border-zinc-700 text-white text-xs px-2 py-1 rounded outline-none"
              />
              <div className="flex gap-1 justify-end">
                <button
                  onClick={handleCreatePlaylist}
                  className="px-2 py-0.5 bg-blue-600 text-white rounded text-[11px]"
                >
                  Create
                </button>
                <button
                  onClick={() => setIsCreatingPlaylist(false)}
                  className="px-2 py-0.5 bg-zinc-700 text-zinc-300 rounded text-[11px]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {playlists.map((pl) => {
            const isSelected = activeView === 'playlists' && selectedPlaylistId === pl.id;
            return (
              <button
                key={pl.id}
                onClick={() => {
                  setActiveView('playlists');
                  setSelectedPlaylistId(pl.id);
                  soundEngine.playClick();
                }}
                className={`flex items-center justify-between px-3 py-2 rounded-md font-medium text-left transition-colors ${
                  isSelected
                    ? 'bg-blue-600/30 text-blue-300 font-semibold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <ListMusic size={14} className="shrink-0 text-blue-400" />
                  <span className="truncate">{pl.name}</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {pl.trackIds.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#121212]">
          {/* VIEW 1: Songs List View */}
          {(activeView === 'songs' || activeView === 'playlists') && (
            <div>
              {/* Header Banner */}
              <div className="flex items-center gap-6 mb-6 bg-gradient-to-r from-blue-950/40 via-indigo-950/20 to-transparent p-5 rounded-2xl border border-blue-500/20">
                <div
                  className={`w-24 h-24 bg-gradient-to-tr ${currentTrack.coverGradient} rounded-xl flex items-center justify-center shadow-2xl shrink-0`}
                >
                  <Disc3 size={52} className={`text-white/90 ${player.isPlaying ? 'animate-spin' : ''}`} />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                    {activeView === 'playlists'
                      ? playlists.find((p) => p.id === selectedPlaylistId)?.name || 'Playlist'
                      : 'All Songs Library'}
                  </span>
                  <h2 className="text-2xl font-bold mt-1 text-white tracking-tight">
                    {currentTrack.title}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    {currentTrack.artist} · {currentTrack.album} ({currentTrack.year})
                  </p>

                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={player.togglePlay}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-semibold flex items-center gap-2 shadow-md transition-all hover:scale-105"
                    >
                      {player.isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                      <span>{player.isPlaying ? 'Pause' : 'Play All'}</span>
                    </button>
                    <button
                      onClick={() => player.toggleFavorite(currentTrack.id)}
                      className="p-1.5 bg-zinc-800/80 hover:bg-zinc-700 rounded-full text-zinc-300 transition-colors"
                    >
                      <Heart
                        size={16}
                        className={
                          currentTrack.isFavorite ? 'text-rose-500 fill-rose-500' : 'text-zinc-400'
                        }
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Tracks Table */}
              <div className="text-xs">
                <div className="grid grid-cols-12 text-zinc-500 border-b border-zinc-800/80 pb-2 mb-2 px-3 font-medium">
                  <span className="col-span-1">#</span>
                  <span className="col-span-4">Title</span>
                  <span className="col-span-3">Artist</span>
                  <span className="col-span-2">Album</span>
                  <span className="col-span-1 text-center">Fav</span>
                  <span className="col-span-1 text-right">Time</span>
                </div>

                {filteredTracks.length === 0 ? (
                  <div className="text-center py-16 text-zinc-500 text-xs">
                    No songs match your selection.
                  </div>
                ) : (
                  filteredTracks.map((t) => {
                    const originalIdx = player.tracks.findIndex((trk) => trk.id === t.id);
                    const isSelected = originalIdx === player.currentTrackIndex;
                    return (
                      <div
                        key={t.id}
                        onClick={() => player.playTrack(originalIdx)}
                        className={`grid grid-cols-12 items-center p-3 rounded-lg cursor-pointer transition-colors group ${
                          isSelected
                            ? 'bg-blue-600/20 text-blue-300 font-medium border border-blue-500/30'
                            : 'hover:bg-zinc-800/50 text-zinc-300'
                        }`}
                      >
                        <span className="col-span-1 flex items-center">
                          {isSelected && player.isPlaying ? (
                            <span className="text-blue-400 font-bold">▶</span>
                          ) : (
                            <span className="text-zinc-500 group-hover:text-white">
                              {originalIdx + 1}
                            </span>
                          )}
                        </span>
                        <div className="col-span-4 flex items-center gap-2.5 truncate">
                          <div
                            className={`w-7 h-7 rounded bg-gradient-to-tr ${t.coverGradient} flex items-center justify-center shrink-0 shadow-xs`}
                          >
                            <Music size={12} className="text-white/80" />
                          </div>
                          <span className="truncate text-white font-medium">{t.title}</span>
                        </div>
                        <span className="col-span-3 truncate text-zinc-400">{t.artist}</span>
                        <span className="col-span-2 truncate text-zinc-500">{t.album}</span>
                        <div className="col-span-1 flex justify-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              player.toggleFavorite(t.id);
                            }}
                            className="p-1 hover:scale-125 transition-transform"
                          >
                            <Heart
                              size={14}
                              className={
                                t.isFavorite ? 'text-rose-500 fill-rose-500' : 'text-zinc-600 hover:text-rose-400'
                              }
                            />
                          </button>
                        </div>
                        <span className="col-span-1 text-right font-mono text-zinc-400">
                          {formatSeconds(t.duration)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* VIEW 2: Artists Directory */}
          {activeView === 'artists' && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-white">Artists</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array.from(new Set(player.tracks.map((t) => t.artist))).map((artistName) => {
                  const artistTracks = player.tracks.filter((t) => t.artist === artistName);
                  const firstTrack = artistTracks[0];
                  return (
                    <div
                      key={artistName}
                      onClick={() => {
                        const idx = player.tracks.findIndex((t) => t.artist === artistName);
                        if (idx >= 0) player.playTrack(idx);
                      }}
                      className="p-4 bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/40 rounded-xl flex flex-col items-center text-center cursor-pointer transition-all hover:scale-105 group"
                    >
                      <div
                        className={`w-20 h-20 rounded-full bg-gradient-to-tr ${firstTrack?.coverGradient || 'from-blue-600 to-indigo-600'} flex items-center justify-center mb-3 shadow-lg group-hover:shadow-blue-500/20`}
                      >
                        <User size={32} className="text-white" />
                      </div>
                      <h3 className="font-semibold text-sm text-white truncate max-w-full">
                        {artistName}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {artistTracks.length} song{artistTracks.length > 1 ? 's' : ''}
                      </p>
                      <span className="text-[10px] text-blue-400 mt-2 font-medium">
                        {firstTrack?.genre}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 3: Albums Showcase */}
          {activeView === 'albums' && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-white">Albums</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array.from(new Set(player.tracks.map((t) => t.album))).map((albumName) => {
                  const albumTracks = player.tracks.filter((t) => t.album === albumName);
                  const firstTrack = albumTracks[0];
                  return (
                    <div
                      key={albumName}
                      onClick={() => {
                        const idx = player.tracks.findIndex((t) => t.album === albumName);
                        if (idx >= 0) player.playTrack(idx);
                      }}
                      className="p-3 bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/40 rounded-xl cursor-pointer transition-all hover:scale-105 group"
                    >
                      <div
                        className={`w-full aspect-square rounded-lg bg-gradient-to-tr ${firstTrack?.coverGradient} flex items-center justify-center mb-2 shadow-md`}
                      >
                        <Disc3 size={48} className="text-white/80 group-hover:animate-spin" />
                      </div>
                      <h3 className="font-semibold text-xs text-white truncate mt-1">
                        {albumName}
                      </h3>
                      <p className="text-[11px] text-zinc-400 truncate">{firstTrack?.artist}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        {albumTracks.length} track{albumTracks.length > 1 ? 's' : ''} · {firstTrack?.year}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 4: Immersive Now Playing & Audio Visualizer Screen */}
          {activeView === 'nowPlaying' && (
            <div className="flex flex-col items-center justify-center h-full text-center relative py-6">
              {/* Visualizer Type Switcher Tabs */}
              <div className="flex gap-2 mb-6 bg-zinc-900 border border-zinc-800 p-1 rounded-full text-xs">
                {(['spectrum', 'wave', 'halo'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setVisualizerType(type);
                      soundEngine.playClick();
                    }}
                    className={`px-3 py-1 rounded-full capitalize font-medium transition-colors ${
                      visualizerType === type
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {type} Mode
                  </button>
                ))}
              </div>

              {/* Large Album Artwork */}
              <div className="relative mb-6">
                <div
                  className={`w-48 h-48 sm:w-56 sm:h-56 rounded-2xl bg-gradient-to-tr ${currentTrack.coverGradient} flex items-center justify-center shadow-2xl transition-transform ${
                    player.isPlaying ? 'scale-105' : 'scale-100 opacity-80'
                  }`}
                >
                  <Disc3 size={84} className={`text-white/85 ${player.isPlaying ? 'animate-spin' : ''}`} />
                </div>

                {/* Halo Pulse Mode */}
                {visualizerType === 'halo' && player.isPlaying && (
                  <div className="absolute inset-0 -m-4 border-2 border-blue-400/40 rounded-3xl animate-ping pointer-events-none" />
                )}
              </div>

              {/* Track Metadata */}
              <h1 className="text-2xl font-bold text-white tracking-tight">{currentTrack.title}</h1>
              <p className="text-sm text-zinc-400 mt-1">
                {currentTrack.artist} — {currentTrack.album}
              </p>
              <span className="text-xs text-blue-400 mt-1 font-medium">{currentTrack.genre}</span>

              {/* Audio Visualizer Graphics */}
              <div className="w-full max-w-md h-24 mt-6 flex items-center justify-center">
                {visualizerType === 'spectrum' && (
                  <div className="flex items-end gap-1.5 h-20 w-full justify-center">
                    {spectrumData.map((h, i) => (
                      <div
                        key={i}
                        className="w-2.5 bg-gradient-to-t from-blue-600 via-indigo-400 to-cyan-300 rounded-t-xs transition-all duration-75"
                        style={{ height: `${h}px` }}
                      />
                    ))}
                  </div>
                )}

                {visualizerType === 'wave' && (
                  <div className="w-full h-20 bg-zinc-900/60 rounded-xl p-2 border border-zinc-800 flex items-center">
                    <svg className="w-full h-full" viewBox="0 0 48 255" preserveAspectRatio="none">
                      <polyline
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="3"
                        strokeLinecap="round"
                        points={waveData.map((v, i) => `${i},${v}`).join(' ')}
                      />
                    </svg>
                  </div>
                )}

                {visualizerType === 'halo' && (
                  <div className="flex items-center gap-2 text-xs text-blue-400 font-mono">
                    <Sparkles size={16} className="animate-spin" />
                    <span>Real-time Audio Resonance Syncing</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW 5: Real Graphic Equalizer */}
          {activeView === 'equalizer' && (
            <div className="max-w-xl mx-auto py-4">
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-zinc-800">
                <div>
                  <h2 className="text-xl font-bold text-white">Graphic Equalizer</h2>
                  <p className="text-xs text-zinc-400">
                    Adjust audio frequency response using real Web Audio API Biquad Filters
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-zinc-500 mr-2">Preset:</span>
                  <div className="flex flex-wrap gap-1">
                    {Object.keys(EQ_PRESETS).map((p) => (
                      <button
                        key={p}
                        onClick={() => handleApplyPreset(p)}
                        className={`px-2.5 py-1 rounded text-xs transition-colors ${
                          activeEqPreset === p
                            ? 'bg-blue-600 text-white font-medium'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5 Vertical EQ Sliders */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-4 px-2">
                  <span>+12 dB</span>
                  <span>0 dB</span>
                  <span>-12 dB</span>
                </div>

                <div className="flex justify-around items-center h-48 py-2">
                  {EQ_FREQUENCIES.map((freq, idx) => {
                    const gain = eqGains[idx] || 0;
                    return (
                      <div key={freq} className="flex flex-col items-center h-full">
                        <span className="text-[11px] font-mono text-blue-400 mb-2">
                          {gain > 0 ? `+${gain}` : gain} dB
                        </span>
                        <input
                          type="range"
                          min="-12"
                          max="12"
                          step="1"
                          value={gain}
                          onChange={(e) =>
                            handleEqualizerChange(idx, parseInt(e.target.value, 10))
                          }
                          className="h-32 w-1.5 appearance-none bg-zinc-700 rounded-lg cursor-pointer accent-blue-500"
                          style={{
                            writingMode: 'vertical-lr',
                            direction: 'rtl',
                          }}
                        />
                        <span className="text-xs font-semibold text-zinc-300 mt-2">
                          {freq >= 1000 ? `${freq / 1000}k` : `${freq}`} Hz
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sticky Audio Controller Bar */}
      <div className="h-20 bg-[#181818] border-t border-zinc-800/80 px-6 flex items-center justify-between z-20 shrink-0">
        {/* Left: Track Information */}
        <div className="w-1/4 flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-lg bg-gradient-to-tr ${currentTrack.coverGradient} flex items-center justify-center shadow-md shrink-0`}
          >
            <Music size={18} className="text-white" />
          </div>
          <div className="truncate">
            <div className="text-xs font-semibold text-white truncate">{currentTrack.title}</div>
            <div className="text-[11px] text-zinc-400 truncate">{currentTrack.artist}</div>
          </div>
          <button
            onClick={() => player.toggleFavorite(currentTrack.id)}
            className="p-1 text-zinc-400 hover:text-rose-500 transition-colors"
          >
            <Heart
              size={16}
              className={currentTrack.isFavorite ? 'text-rose-500 fill-rose-500' : ''}
            />
          </button>
        </div>

        {/* Center: Playback Controls & Progress Scrubber */}
        <div className="flex-1 max-w-lg flex flex-col items-center">
          <div className="flex items-center gap-4 mb-1.5">
            {/* Shuffle */}
            <button
              onClick={() => {
                soundEngine.playClick();
                // toggle shuffle
              }}
              title="Shuffle"
              className={`p-1.5 rounded-full transition-colors ${
                player.isShuffle ? 'text-blue-400 bg-blue-600/20' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Shuffle size={15} />
            </button>

            {/* Previous */}
            <button
              onClick={player.prevTrack}
              title="Previous Track"
              className="p-1.5 hover:bg-zinc-700/60 rounded-full text-zinc-300 hover:text-white transition-colors"
            >
              <SkipBack size={18} />
            </button>

            {/* Play/Pause Main Button */}
            <button
              onClick={player.togglePlay}
              className="w-10 h-10 bg-white hover:bg-zinc-200 text-black rounded-full flex items-center justify-center transition-transform hover:scale-105 shadow-md"
            >
              {player.isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>

            {/* Next */}
            <button
              onClick={player.nextTrack}
              title="Next Track"
              className="p-1.5 hover:bg-zinc-700/60 rounded-full text-zinc-300 hover:text-white transition-colors"
            >
              <SkipForward size={18} />
            </button>

            {/* Repeat Mode */}
            <button
              onClick={() => {
                soundEngine.playClick();
              }}
              title={`Repeat: ${player.repeatMode}`}
              className={`p-1.5 rounded-full transition-colors ${
                player.repeatMode !== 'off'
                  ? 'text-blue-400 bg-blue-600/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {player.repeatMode === 'one' ? <Repeat1 size={15} /> : <Repeat size={15} />}
            </button>
          </div>

          {/* Scrubber Timeline Bar */}
          <div className="w-full flex items-center gap-3 text-[11px] font-mono text-zinc-400">
            <span>{formatSeconds(player.currentTime)}</span>
            <input
              type="range"
              min="0"
              max={player.duration || 180}
              step="1"
              value={player.currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:h-1.5 transition-all"
            />
            <span>{formatSeconds(player.duration || 180)}</span>
          </div>
        </div>

        {/* Right: Master Volume & Audio Settings */}
        <div className="w-1/4 flex items-center justify-end gap-3">
          <button
            onClick={() => {
              setActiveView(activeView === 'nowPlaying' ? 'songs' : 'nowPlaying');
              soundEngine.playClick();
            }}
            title="Now Playing Screen"
            className="p-1 text-zinc-400 hover:text-white"
          >
            <Radio size={16} />
          </button>

          <button onClick={player.toggleMute} className="text-zinc-400 hover:text-white">
            {player.isMuted || player.volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={player.isMuted ? 0 : player.volume}
            onChange={handleVolumeChange}
            className="w-24 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      </div>
    </div>
  );
};
