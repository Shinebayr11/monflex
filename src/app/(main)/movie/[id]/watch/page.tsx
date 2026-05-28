import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getMovieDetails, getSimilarMovies } from "@/services/tmdb";
import { MoviePlayer } from "@/components/player/MoviePlayer";
import { MovieRow } from "@/components/movie/MovieRow";

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [movie, similar] = await Promise.all([
    getMovieDetails(id).catch(() => null),
    getSimilarMovies(id).catch(() => ({ results: [] as never[] })),
  ]);
  if (!movie) notFound();

  const nextMovieId = similar.results[0]?.id;

  return (
    <div className="mx-auto max-w-[1600px] px-4 md:px-8 py-8 space-y-8">
      <Link
        href={`/movie/${id}`}
        className="inline-flex items-center gap-1 text-sm text-white/60 hover:text-white"
      >
        <ChevronLeft className="size-4" /> Back to details
      </Link>

      <header className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold">{movie.title}</h1>
        <p className="text-sm text-white/50">
          {movie.tagline || `${movie.overview.slice(0, 120)}…`}
        </p>
      </header>

      <MoviePlayer
        movie={{
          id: movie.id,
          title: movie.title,
          backdrop_path: movie.backdrop_path,
        }}
        nextMovieId={nextMovieId}
      />

      <MovieRow title="Up Next" movies={similar.results} />
    </div>
  );
}
