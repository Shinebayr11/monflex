"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import type { Movie } from "@/types/tmdb";
import { MovieCard } from "./MovieCard";

interface Props {
  title: string;
  movies: Movie[];
  seeAllHref?: string;
}

export function MovieRow({ title, movies, seeAllHref }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    if (!ref.current) return;
    ref.current.scrollBy({
      left: dir * ref.current.clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  if (!movies.length) return null;

  return (
    <section className="group/row relative py-6">
      <div className="mx-auto max-w-[1600px] px-6 md:px-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
          {seeAllHref && (
            <a
              href={seeAllHref}
              className="text-sm text-white/60 hover:text-white"
            >
              See all →
            </a>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Previous"
            className="absolute -left-2 top-1/2 z-20 -translate-y-1/2 grid place-items-center size-10 rounded-full glass-strong opacity-0 group-hover/row:opacity-100 transition"
          >
            <ChevronLeft className="size-5" />
          </button>

          <div
            ref={ref}
            className="flex gap-3 overflow-x-auto scroll-smooth scrollbar-hide snap-x snap-mandatory pb-2"
          >
            {movies.map((m, i) => (
              <div key={m.id} className="snap-start">
                <MovieCard movie={m} priority={i < 4} />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Next"
            className="absolute -right-2 top-1/2 z-20 -translate-y-1/2 grid place-items-center size-10 rounded-full glass-strong opacity-0 group-hover/row:opacity-100 transition"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
