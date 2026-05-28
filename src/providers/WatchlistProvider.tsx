"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Movie } from "@/types/tmdb";
import type { WatchProgress } from "@/types/auth";

const KEY_WL = "cs.watchlist";
const KEY_FAV = "cs.favorites";
const KEY_CW = "cs.continue";

interface Ctx {
  watchlist: Movie[];
  favorites: Movie[];
  continueWatching: WatchProgress[];
  toggleWatchlist: (m: Movie) => void;
  toggleFavorite: (m: Movie) => void;
  inWatchlist: (id: number) => boolean;
  isFavorite: (id: number) => boolean;
  updateProgress: (p: WatchProgress) => void;
  removeProgress: (id: number) => void;
}

const C = createContext<Ctx | null>(null);

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [continueWatching, setCW] = useState<WatchProgress[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setWatchlist(load(KEY_WL, []));
    setFavorites(load(KEY_FAV, []));
    setCW(load(KEY_CW, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY_WL, JSON.stringify(watchlist));
  }, [watchlist, hydrated]);
  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY_FAV, JSON.stringify(favorites));
  }, [favorites, hydrated]);
  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY_CW, JSON.stringify(continueWatching));
  }, [continueWatching, hydrated]);

  const toggleWatchlist = useCallback(
    (m: Movie) =>
      setWatchlist((curr) =>
        curr.some((x) => x.id === m.id)
          ? curr.filter((x) => x.id !== m.id)
          : [m, ...curr],
      ),
    [],
  );

  const toggleFavorite = useCallback(
    (m: Movie) =>
      setFavorites((curr) =>
        curr.some((x) => x.id === m.id)
          ? curr.filter((x) => x.id !== m.id)
          : [m, ...curr],
      ),
    [],
  );

  const inWatchlist = useCallback(
    (id: number) => watchlist.some((m) => m.id === id),
    [watchlist],
  );

  const isFavorite = useCallback(
    (id: number) => favorites.some((m) => m.id === id),
    [favorites],
  );

  const updateProgress = useCallback(
    (p: WatchProgress) =>
      setCW((curr) => {
        const next = curr.filter((x) => x.movieId !== p.movieId);
        return [p, ...next].slice(0, 20);
      }),
    [],
  );

  const removeProgress = useCallback(
    (id: number) => setCW((curr) => curr.filter((x) => x.movieId !== id)),
    [],
  );

  const value = useMemo(
    () => ({
      watchlist,
      favorites,
      continueWatching,
      toggleWatchlist,
      toggleFavorite,
      inWatchlist,
      isFavorite,
      updateProgress,
      removeProgress,
    }),
    [
      watchlist,
      favorites,
      continueWatching,
      toggleWatchlist,
      toggleFavorite,
      inWatchlist,
      isFavorite,
      updateProgress,
      removeProgress,
    ],
  );

  return <C.Provider value={value}>{children}</C.Provider>;
}

export const useWatchlist = () => {
  const c = useContext(C);
  if (!c) throw new Error("useWatchlist must be inside <WatchlistProvider>");
  return c;
};
