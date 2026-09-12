import { TMDB_IMG } from "./constants";

export const tmdbImage = (
  path: string | null | undefined,
  size: string = "w500",
) => (path ? `${TMDB_IMG}/${size}${path}` : null);

export const formatRuntime = (minutes?: number | null) => {
  if (!minutes) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
};

export const formatYear = (date?: string | null) =>
  date ? new Date(date).getFullYear().toString() : "—";

export const formatRating = (vote?: number | null) =>
  vote ? vote.toFixed(1) : "N/A";

const pad2 = (n: number) => String(Math.floor(n)).padStart(2, "0");

/** Playback position as `m:ss`, widening to `h:mm:ss` past an hour. */
export const formatClock = (sec: number) => {
  const s = Math.max(0, sec);
  const rest = `${pad2((s % 3600) / 60)}:${pad2(s % 60)}`;
  const h = Math.floor(s / 3600);
  return h ? `${h}:${rest}` : rest;
};

/** Inverse of formatClock: `45`, `1:23` and `1:02:03` all parse. */
export const parseClock = (raw: string): number | null => {
  const parts = raw.trim().split(":");
  if (parts.length > 3 || parts.some((p) => !/^\d{1,3}$/.test(p))) return null;
  return parts.reduce((total, p) => total * 60 + Number(p), 0);
};
