import { useState, useEffect, useRef, useCallback } from 'react';
import { GrooveTrack, MusicPlayerState } from '../types/music';
import { musicGenerator } from './musicSynth';
import { soundEngine } from './sound';

export const DEFAULT_TRACKS: GrooveTrack[] = [
  {
    id: 'gt-1',
    title: 'Lofi Chill Sunset Chords',
    artist: 'Groove Virtual Ensemble',
    album: 'Windows 10 Ambient Sessions',
    genre: 'Lo-Fi / Chillhop',
    year: 2026,
    duration: 210,
    trackKey: 'track_lofi',
    isFavorite: true,
    coverGradient: 'from-amber-500 to-rose-600',
  },
  {
    id: 'gt-2',
    title: 'Neon Cyber Synthwave 80s',
    artist: 'Digital Dreamer',
    album: 'Retro Pulse Anthology',
    genre: 'Synthwave / Retrowave',
    year: 2026,
    duration: 170,
    trackKey: 'track_synth',
    isFavorite: false,
    coverGradient: 'from-fuchsia-600 to-indigo-600',
  },
  {
    id: 'gt-3',
    title: 'Ambient Peaceful Piano',
    artist: 'Clara Vance',
    album: 'Quiet Reflections',
    genre: 'Classical / Ambient',
    year: 2025,
    duration: 195,
    trackKey: 'track_piano',
    isFavorite: true,
    coverGradient: 'from-teal-500 to-blue-700',
  },
  {
    id: 'gt-4',
    title: '8-Bit Arcade Hero Quest',
    artist: 'Pixel Pulse',
    album: 'Retro Bit Arcade',
    genre: 'Chiptune / Arcade',
    year: 2026,
    duration: 155,
    trackKey: 'track_8bit',
    isFavorite: false,
    coverGradient: 'from-emerald-500 to-cyan-600',
  },
  {
    id: 'gt-5',
    title: 'Deep Space Odyssey',
    artist: 'Starlight Observatory',
    album: 'Cosmic Drift',
    genre: 'Ambient Space',
    year: 2026,
    duration: 240,
    trackKey: 'track_cosmic',
    isFavorite: false,
    coverGradient: 'from-purple-900 to-blue-950',
  },
];

export function useMusicPlayer(): MusicPlayerState {
  const [tracks, setTracks] = useState<GrooveTrack[]>(DEFAULT_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(210);
  const [volume, setVolumeState] = useState<number>(0.65);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('all');

  const tracksRef = useRef(tracks);
  tracksRef.current = tracks;
  const currentIdxRef = useRef(currentTrackIndex);
  currentIdxRef.current = currentTrackIndex;
  const isShuffleRef = useRef(isShuffle);
  isShuffleRef.current = isShuffle;
  const repeatModeRef = useRef(repeatMode);
  repeatModeRef.current = repeatMode;
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  // Listen to audio time updates from music generator
  useEffect(() => {
    musicGenerator.setTimeUpdateCallback((curr, dur) => {
      setCurrentTime(curr);
      setDuration(dur);

      // Auto-advance track on finish
      if (curr >= dur - 1 && dur > 0 && isPlayingRef.current) {
        if (repeatModeRef.current === 'one') {
          musicGenerator.seek(0);
          return;
        }
        let next = currentIdxRef.current + 1;
        if (isShuffleRef.current) {
          next = Math.floor(Math.random() * tracksRef.current.length);
        } else if (next >= tracksRef.current.length) {
          if (repeatModeRef.current === 'off') {
            setIsPlaying(false);
            musicGenerator.pause();
            return;
          }
          next = 0;
        }
        playTrackInternal(next);
      }
    });
  }, []);

  const playTrackInternal = useCallback((index: number) => {
    const list = tracksRef.current;
    const target = list[index];
    if (!target) return;

    setCurrentTrackIndex(index);
    setCurrentTime(0);
    setDuration(target.duration);

    if (target.isCustom && target.audioUrl) {
      musicGenerator.playCustomAudio(target.audioUrl);
    } else {
      musicGenerator.play(target.trackKey, 0);
    }
    setIsPlaying(true);
  }, []);

  const playTrack = useCallback(
    (index: number) => {
      soundEngine.playClick();
      playTrackInternal(index);
    },
    [playTrackInternal]
  );

  const togglePlay = useCallback(() => {
    soundEngine.playClick();
    if (isPlayingRef.current) {
      musicGenerator.pause();
      setIsPlaying(false);
    } else {
      const target = tracksRef.current[currentIdxRef.current];
      if (target?.isCustom && target.audioUrl) {
        musicGenerator.playCustomAudio(target.audioUrl);
      } else if (target) {
        musicGenerator.play(target.trackKey, currentTime);
      }
      setIsPlaying(true);
    }
  }, [currentTime]);

  const nextTrack = useCallback(() => {
    soundEngine.playClick();
    const list = tracksRef.current;
    let nextIdx = currentIdxRef.current + 1;
    if (isShuffleRef.current) {
      nextIdx = Math.floor(Math.random() * list.length);
    } else if (nextIdx >= list.length) {
      nextIdx = repeatModeRef.current === 'off' ? currentIdxRef.current : 0;
    }
    playTrackInternal(nextIdx);
  }, [playTrackInternal]);

  const prevTrack = useCallback(() => {
    soundEngine.playClick();
    const list = tracksRef.current;
    if (currentTime > 3) {
      musicGenerator.seek(0);
      setCurrentTime(0);
      return;
    }
    const prevIdx = (currentIdxRef.current - 1 + list.length) % list.length;
    playTrackInternal(prevIdx);
  }, [currentTime, playTrackInternal]);

  const seek = useCallback((seconds: number) => {
    setCurrentTime(seconds);
    musicGenerator.seek(seconds);
  }, []);

  const setVolume = useCallback(
    (vol: number) => {
      setVolumeState(vol);
      musicGenerator.setVolume(isMuted ? 0 : vol);
    },
    [isMuted]
  );

  const toggleMute = useCallback(() => {
    soundEngine.playClick();
    setIsMuted((prev) => {
      const next = !prev;
      musicGenerator.setVolume(next ? 0 : volume);
      return next;
    });
  }, [volume]);

  const toggleFavorite = useCallback((trackId: string) => {
    soundEngine.playClick();
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, isFavorite: !t.isFavorite } : t))
    );
  }, []);

  const addTrack = useCallback(
    (newTrack: GrooveTrack) => {
      setTracks((prev) => [newTrack, ...prev]);
      playTrackInternal(0);
    },
    [playTrackInternal]
  );

  return {
    tracks,
    currentTrackIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    togglePlay,
    playTrack,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleMute,
    toggleFavorite,
    addTrack,
  };
}
