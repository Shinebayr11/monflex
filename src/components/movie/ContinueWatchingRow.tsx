"use client";
import Image from "next/image";
import Link from "next/link";
import { Play, X } from "lucide-react";
import { useWatchlist } from "@/providers/WatchlistProvider";
import { tmdbImage } from "@/lib/format";

export function ContinueWatchingRow() {
  const { continueWatching, removeProgress } = useWatchlist();
  if (!continueWatching.length) return null;

  return (
    <section className="py-6">
      <div className="mx-auto max-w-[1600px] px-6 md:px-12">
        <h2 className="mb-4 text-xl md:text-2xl font-bold">Continue Watching</h2>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {continueWatching.map((p) => (
            <div
              key={p.movieId}
              className="relative group/cw aspect-video w-[280px] shrink-0 overflow-hidden rounded-lg bg-white/5"
            >
              {p.backdrop_path && (
                <Image
                  src={tmdbImage(p.backdrop_path, "w780")!}
                  alt={p.title}
                  fill
                  sizes="280px"
                  className="object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <Link
                href={`/movie/${p.movieId}/watch`}
                className="absolute inset-0 grid place-items-center opacity-0 group-hover/cw:opacity-100 transition"
              >
                <div className="grid size-12 place-items-center rounded-full bg-white/90 text-black">
                  <Play className="size-5 fill-current" />
                </div>
              </Link>
              <button
                type="button"
                onClick={() => removeProgress(p.movieId)}
                className="absolute right-2 top-2 grid size-7 place-items-center rounded-full glass-strong hover:bg-white/20"
                aria-label="Remove"
              >
                <X className="size-3.5" />
              </button>
              <div className="absolute inset-x-0 bottom-0 p-3">
                <p className="text-sm font-medium truncate">{p.title}</p>
                <div className="mt-2 h-1 w-full overflow-hidden rounded bg-white/15">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${p.progress * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
