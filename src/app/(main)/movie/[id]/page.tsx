import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Play, Star } from "lucide-react";
import { notFound } from "next/navigation";
import {
  getMovieCredits,
  getMovieDetails,
  getMovieRecommendations,
  getSimilarMovies,
  pickTrailerKey,
} from "@/services/tmdb";
import {
  formatRating,
  formatRuntime,
  formatYear,
  tmdbImage,
} from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MovieRow } from "@/components/movie/MovieRow";
import { CastList } from "@/components/movie/CastList";
import { WatchlistButton } from "@/components/movie/WatchlistButton";
import { TrailerLauncher } from "./TrailerLauncher";

interface Params {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Params) {
  const { id } = await params;
  try {
    const m = await getMovieDetails(id);
    return { title: m.title, description: m.overview };
  } catch {
    return { title: "Movie" };
  }
}

export default async function MoviePage({ params }: Params) {
  const { id } = await params;

  const movie = await getMovieDetails(id).catch(() => null);
  if (!movie) notFound();

  const [credits, similar, recs, trailerKey] = await Promise.all([
    getMovieCredits(id),
    getSimilarMovies(id),
    getMovieRecommendations(id),
    pickTrailerKey(id),
  ]);

  return (
    <>
      <section className="relative min-h-[80dvh] w-full overflow-hidden">
        {movie.backdrop_path && (
          <Image
            src={tmdbImage(movie.backdrop_path, "original")!}
            alt={movie.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 hero-fade-left" />
        <div className="absolute inset-0 hero-fade-bottom" />

        <div className="relative z-10 mx-auto flex min-h-[80dvh] max-w-[1600px] items-end px-6 md:px-12 pb-16 pt-32">
          <div className="grid w-full gap-10 md:grid-cols-[260px_1fr]">
            <div className="hidden md:block relative aspect-[2/3] w-[260px] overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10">
              {movie.poster_path && (
                <Image
                  src={tmdbImage(movie.poster_path, "w500")!}
                  alt={movie.title}
                  fill
                  sizes="260px"
                  className="object-cover"
                />
              )}
            </div>

            <div className="space-y-5 max-w-3xl">
              {movie.tagline && (
                <p className="text-primary text-sm uppercase tracking-widest">
                  {movie.tagline}
                </p>
              )}
              <h1 className="text-4xl md:text-6xl font-bold text-gradient leading-tight">
                {movie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
                <span className="flex items-center gap-1">
                  <Star className="size-4 fill-yellow-400 text-yellow-400" />
                  {formatRating(movie.vote_average)}
                </span>
                <span>·</span>
                <span>{formatYear(movie.release_date)}</span>
                <span>·</span>
                <span>{formatRuntime(movie.runtime)}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {movie.genres.map((g) => (
                  <Badge
                    key={g.id}
                    variant="outline"
                    className="border-white/15 bg-white/5"
                  >
                    {g.name}
                  </Badge>
                ))}
              </div>

              <p className="text-white/80 text-base md:text-lg max-w-2xl">
                {movie.overview}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href={`/movie/${movie.id}/watch`}>
                  <Button size="lg" className="gap-2 glow-primary">
                    <Play className="size-4 fill-current" /> Play
                  </Button>
                </Link>
                <TrailerLauncher youtubeKey={trailerKey} />
                <WatchlistButton
                  movie={{
                    ...movie,
                    genre_ids: movie.genres.map((g) => g.id),
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1600px] space-y-12 px-6 md:px-12 py-12">
        <CastList cast={credits.cast} />
      </div>

      <Suspense>
        <MovieRow title="Recommended" movies={recs.results} />
        <MovieRow title="More Like This" movies={similar.results} />
      </Suspense>
    </>
  );
}
