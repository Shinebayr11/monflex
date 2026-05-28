"use client";
import Image from "next/image";
import Link from "next/link";
import { Check, Play, Plus, Star } from "lucide-react";
import type { Movie } from "@/types/tmdb";
import { tmdbImage, formatYear } from "@/lib/format";
import { useWatchlist } from "@/providers/WatchlistProvider";
import { cn } from "@/lib/utils";

interface Props {
  movie: Movie;
  priority?: boolean;
}

export function MovieCard({ movie, priority }: Props) {
  const { inWatchlist, toggleWatchlist } = useWatchlist();
  const saved = inWatchlist(movie.id);

  return (
    <div className="group relative aspect-[2/3] w-[160px] sm:w-[180px] md:w-[200px] shrink-0 overflow-hidden rounded-lg bg-white/5 transition-transform duration-300 hover:scale-[1.05] hover:z-10">
      {movie.poster_path ? (
        <Image
          src={tmdbImage(movie.poster_path, "w500")!}
          alt={movie.title}
          fill
          priority={priority}
          sizes="(max-width:768px) 50vw, 200px"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-white/40 text-xs p-3 text-center">
          {movie.title}
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <h3 className="text-sm font-semibold line-clamp-2">{movie.title}</h3>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-white/70">
          <span className="flex items-center gap-1">
            <Star className="size-3 fill-yellow-400 text-yellow-400" />
            {movie.vote_average.toFixed(1)}
          </span>
          <span>·</span>
          <span>{formatYear(movie.release_date)}</span>
        </div>
        <div className="mt-3 flex gap-2">
          <Link
            href={`/movie/${movie.id}/watch`}
            className="grid place-items-center size-8 rounded-full bg-white text-black hover:bg-primary hover:text-white transition"
            aria-label="Play"
          >
            <Play className="size-3.5 fill-current" />
          </Link>
          <button
            type="button"
            onClick={() => toggleWatchlist(movie)}
            aria-label={saved ? "Remove from list" : "Add to list"}
            className={cn(
              "grid place-items-center size-8 rounded-full border transition",
              saved
                ? "bg-primary text-white border-primary"
                : "bg-white/10 hover:bg-white/20 border-white/20",
            )}
          >
            {saved ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
          </button>
          <Link
            href={`/movie/${movie.id}`}
            className="ml-auto text-[11px] text-white/70 hover:text-white self-center"
          >
            Details
          </Link>
        </div>
      </div>

      <div className="absolute top-2 left-2 glass px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1 group-hover:opacity-0 transition">
        <Star className="size-3 fill-yellow-400 text-yellow-400" />
        {movie.vote_average.toFixed(1)}
      </div>
    </div>
  );
}
