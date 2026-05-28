"use client";
import { useEffect, useRef, useState } from "react";
import { Loader2, Maximize, Minimize, SkipForward } from "lucide-react";
import { STREAMING_SOURCES, getSourceById } from "@/services/streamingSources";
import { SourceSwitcher } from "./SourceSwitcher";
import { useWatchlist } from "@/providers/WatchlistProvider";
import type { Movie } from "@/types/tmdb";

interface Props {
  movie: Pick<Movie, "id" | "title" | "backdrop_path">;
  nextMovieId?: number;
}

export function MoviePlayer({ movie, nextMovieId }: Props) {
  const [sourceId, setSourceId] = useState(STREAMING_SOURCES[0].id);
  const [loading, setLoading] = useState(true);
  const [isFull, setIsFull] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { updateProgress } = useWatchlist();

  const source = getSourceById(sourceId);
  const embedUrl = source.getEmbedUrl(movie.id);

  useEffect(() => {
    const startedAt = Date.now();
    const interval = setInterval(() => {
      const minutes = (Date.now() - startedAt) / 60000;
      const progress = Math.min(minutes / 90, 0.95);
      updateProgress({
        movieId: movie.id,
        progress,
        durationSec: minutes * 60,
        updatedAt: Date.now(),
        title: movie.title,
        backdrop_path: movie.backdrop_path,
      });
    }, 30_000);
    return () => clearInterval(interval);
  }, [movie.id, movie.title, movie.backdrop_path, updateProgress]);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFull(true);
    } else {
      await document.exitFullscreen();
      setIsFull(false);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "f") toggleFullscreen();
      if (e.key === "n" && nextMovieId)
        window.location.href = `/movie/${nextMovieId}/watch`;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nextMovieId]);

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="relative aspect-video w-full overflow-hidden rounded-xl bg-black glass-strong"
      >
        {loading && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-black/80">
            <Loader2 className="size-10 animate-spin text-primary" />
          </div>
        )}
        <iframe
          key={embedUrl}
          src={embedUrl}
          title={movie.title}
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          referrerPolicy="no-referrer"
          onLoad={() => setLoading(false)}
          className="absolute inset-0 size-full"
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between p-3">
          <div className="pointer-events-auto" />
          <div className="pointer-events-auto flex items-center gap-2">
            {nextMovieId && (
              <a
                href={`/movie/${nextMovieId}/watch`}
                className="glass-strong rounded-full p-2 hover:bg-white/20"
                aria-label="Next movie"
              >
                <SkipForward className="size-4" />
              </a>
            )}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="glass-strong rounded-full p-2 hover:bg-white/20"
              aria-label="Fullscreen"
            >
              {isFull ? (
                <Minimize className="size-4" />
              ) : (
                <Maximize className="size-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      <SourceSwitcher
        sources={STREAMING_SOURCES}
        active={sourceId}
        onChange={(id) => {
          setLoading(true);
          setSourceId(id);
        }}
      />

      <p className="text-xs text-white/40">
        Tip: press{" "}
        <kbd className="rounded border border-white/15 px-1.5">F</kbd> for
        fullscreen
        {nextMovieId && (
          <>
            {" "}
            ·{" "}
            <kbd className="rounded border border-white/15 px-1.5">N</kbd> for
            next
          </>
        )}
        .
      </p>
    </div>
  );
}
