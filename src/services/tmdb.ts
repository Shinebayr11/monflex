import "server-only";
import type {
  Credits,
  Genre,
  Movie,
  MovieDetails,
  MovieListEndpoint,
  TmdbListResponse,
  VideosResponse,
} from "@/types/tmdb";
import { TMDB_BASE } from "@/lib/constants";

const TOKEN = process.env.TMDB_API_KEY;
if (!TOKEN) {
  console.warn("[tmdb] TMDB_API_KEY missing — requests will fail.");
}

async function tmdb<T>(
  path: string,
  params: Record<string, string | number> = {},
  revalidate = 60 * 60,
): Promise<T> {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("language", "en-US");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json;charset=utf-8",
    },
    next: { revalidate },
  });

  if (!res.ok) {
    throw new Error(`TMDB ${res.status} on ${path}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

/* Lists */
export const getMovieList = (
  endpoint: Exclude<MovieListEndpoint, "trending">,
  page = 1,
) => tmdb<TmdbListResponse<Movie>>(`/movie/${endpoint}`, { page });

export const getTrending = (window: "day" | "week" = "week") =>
  tmdb<TmdbListResponse<Movie>>(`/trending/movie/${window}`, {}, 60 * 10);

/* Details */
export const getMovieDetails = (id: number | string) =>
  tmdb<MovieDetails>(`/movie/${id}`);

export const getMovieCredits = (id: number | string) =>
  tmdb<Credits>(`/movie/${id}/credits`);

export const getMovieVideos = (id: number | string) =>
  tmdb<VideosResponse>(`/movie/${id}/videos`);

export const getSimilarMovies = (id: number | string) =>
  tmdb<TmdbListResponse<Movie>>(`/movie/${id}/similar`);

export const getMovieRecommendations = (id: number | string) =>
  tmdb<TmdbListResponse<Movie>>(`/movie/${id}/recommendations`);

/* Search / Genres */
export const searchMovies = (query: string, page = 1) =>
  tmdb<TmdbListResponse<Movie>>("/search/movie", { query, page }, 60);

export const getGenres = () =>
  tmdb<{ genres: Genre[] }>("/genre/movie/list", {}, 60 * 60 * 24);

export const discoverByGenre = (genreId: number, page = 1) =>
  tmdb<TmdbListResponse<Movie>>("/discover/movie", {
    with_genres: genreId,
    sort_by: "popularity.desc",
    page,
  });

/* Pick best YouTube trailer */
export const pickTrailerKey = async (id: number | string) => {
  const { results } = await getMovieVideos(id);
  const trailer =
    results.find(
      (v) => v.site === "YouTube" && v.type === "Trailer" && v.official,
    ) ??
    results.find((v) => v.site === "YouTube" && v.type === "Trailer") ??
    results.find((v) => v.site === "YouTube" && v.type === "Teaser");
  return trailer?.key ?? null;
};
