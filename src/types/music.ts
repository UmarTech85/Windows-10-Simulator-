export interface GrooveTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  year: number;
  duration: number; // in seconds
  trackKey: string;
  isFavorite?: boolean;
  coverGradient: string;
  isCustom?: boolean;
  audioUrl?: string;
}

export interface MusicPlayerState {
  tracks: GrooveTrack[];
  currentTrackIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  togglePlay: () => void;
  playTrack: (index: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleFavorite: (trackId: string) => void;
  addTrack: (track: GrooveTrack) => void;
}
