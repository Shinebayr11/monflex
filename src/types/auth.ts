export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isGuest: boolean;
}

export interface WatchProgress {
  movieId: number;
  progress: number;
  durationSec: number;
  updatedAt: number;
  title: string;
  backdrop_path: string | null;
}
