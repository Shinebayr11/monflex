"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Info, Play } from "lucide-react";
import type { Movie } from "@/types/tmdb";
import { tmdbImage, formatYear } from "@/lib/format";
import { Button } from "@/components/ui/button";

export function HeroBanner({ movies }: { movies: Movie[] }) {
  const [idx, setIdx] = useState(0);
  const featured = movies.filter((m) => m.backdrop_path).slice(0, 5);

  useEffect(() => {
    if (featured.length <= 1) return;
    const t = setInterval(
      () => setIdx((i) => (i + 1) % featured.length),
      8000,
    );
    return () => clearInterval(t);
  }, [featured.length]);

  if (featured.length === 0) return null;
  const m = featured[idx];

  return (
    <section className="relative h-[80dvh] min-h-[560px] w-full overflow-hidden">
      {featured.map((movie, i) => (
        <div
          key={movie.id}
          aria-hidden={i !== idx}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === idx ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={tmdbImage(movie.backdrop_path, "original")!}
            alt={movie.title}
            fill
            priority={i === 0}
            className="object-cover"
            sizes="100vw"
          />
        </div>
      ))}

      <div className="absolute inset-0 hero-fade-left" />
      <div className="absolute inset-0 hero-fade-bottom" />

      <div className="relative z-10 flex h-full items-end pb-24">
        <div className="mx-auto w-full max-w-[1600px] px-6 md:px-12">
          <div
            key={m.id}
            className="max-w-2xl space-y-5 animate-in fade-in slide-in-from-bottom-8 duration-700"
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
              <span className="inline-block size-1.5 rounded-full bg-primary animate-pulse" />
              Featured · {formatYear(m.release_date)}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gradient leading-tight">
              {m.title}
            </h1>
            <p className="text-white/80 text-base md:text-lg line-clamp-3 max-w-xl">
              {m.overview}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href={`/movie/${m.id}/watch`}>
                <Button size="lg" className="gap-2 glow-primary">
                  <Play className="size-4 fill-current" /> Watch Now
                </Button>
              </Link>
              <Link href={`/movie/${m.id}`}>
                <Button
                  size="lg"
                  variant="secondary"
                  className="gap-2 bg-white/10 hover:bg-white/20 border border-white/10"
                >
                  <Info className="size-4" /> More Info
                </Button>
              </Link>
              <div className="ml-2 flex items-center gap-1 text-sm text-white/70">
                <span className="text-yellow-400">★</span>{" "}
                {m.vote_average.toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 right-8 z-10 flex gap-2">
        {featured.map((_, i) => (
          <button
            type="button"
            key={i}
            aria-label={`Slide ${i + 1}`}
            onClick={() => setIdx(i)}
            className={`h-1 rounded-full transition-all ${
              i === idx ? "w-8 bg-primary" : "w-4 bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
