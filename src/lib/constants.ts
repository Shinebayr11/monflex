export const TMDB_BASE = "https://api.themoviedb.org/3";
export const TMDB_IMG = "https://image.tmdb.org/t/p";

export const IMG_SIZES = {
  poster: { sm: "w342", md: "w500", lg: "w780", original: "original" },
  backdrop: { sm: "w780", md: "w1280", lg: "original" },
  profile: { sm: "w185", md: "h632" },
} as const;

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "CineStream";
