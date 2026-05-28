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
