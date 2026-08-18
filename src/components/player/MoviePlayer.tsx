"use client";
import { Loader2, Maximize, Minimize, SkipForward } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSubtitleClock } from "@/hooks/useSubtitleClock";
import { useWatchlist } from "@/providers/WatchlistProvider";
import { getSourceById, STREAMING_SOURCES } from "@/services/streamingSources";
import type { SubtitleCue } from "@/services/subtitles";
import type { Movie } from "@/types/tmdb";
import { SourceSwitcher } from "./SourceSwitcher";
import { SubtitleOverlay } from "./SubtitleOverlay";
import { SubtitlePanel } from "./SubtitlePanel";

/**
 * Asked of the provider's own player via the embed URL. Kept fixed rather than
 * following the overlay's language picker: changing it rebuilds the iframe src,
 * which restarts playback.
 */
const EMBED_SUBTITLE_LANG = "en";

interface Props {
  movie: Pick<Movie, "id" | "title" | "backdrop_path">;
  nextMovieId?: number;
}

/** Keyboard shortcuts must not fire while the viewer is typing in the panel. */
const isTypingTarget = (el: EventTarget | null) =>
  el instanceof HTMLElement &&
  (el.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));

export function MoviePlayer({ movie, nextMovieId }: Props) {
  const [sourceId, setSourceId] = useState(STREAMING_SOURCES[0].id);
  const [loading, setLoading] = useState(true);
  const [isFull, setIsFull] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { updateProgress } = useWatchlist();

  const [cues, setCues] = useState<SubtitleCue[]>([]);
  const [subsEnabled, setSubsEnabled] = useState(true);
  const clock = useSubtitleClock();

  const source = getSourceById(sourceId);
  const embedUrl = source.getEmbedUrl(movie.id, {
    subtitleLang: source.supportsSubtitleLang ? EMBED_SUBTITLE_LANG : undefined,
  });

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

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFull(true);
    } else {
      await document.exitFullscreen();
      setIsFull(false);
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      if (e.key === "f") toggleFullscreen();
      if (e.key === "c" && cues.length) setSubsEnabled((v) => !v);
      if (e.key === "n" && nextMovieId)
        window.location.href = `/movie/${nextMovieId}/watch`;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nextMovieId, toggleFullscreen, cues.length]);

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

        <SubtitleOverlay cues={cues} time={clock.time} visible={subsEnabled} />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-center justify-between p-3">
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

      <SubtitlePanel
        movieId={movie.id}
        clock={clock}
        enabled={subsEnabled}
        onEnabledChange={setSubsEnabled}
        cueCount={cues.length}
        onCues={setCues}
      />

      <p className="text-xs text-white/40">
        Tip: press{" "}
        <kbd className="rounded border border-white/15 px-1.5">F</kbd> for
        fullscreen ·{" "}
        <kbd className="rounded border border-white/15 px-1.5">C</kbd> for
        captions
        {nextMovieId && (
          <>
            {" "}
            · <kbd className="rounded border border-white/15 px-1.5">N</kbd> for
            next
          </>
        )}
        .
      </p>
    </div>
  );
}
