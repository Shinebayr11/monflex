"use client";
import { Loader2, Maximize, Minimize, SkipForward } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSubtitleClock } from "@/hooks/useSubtitleClock";
import { useWatchlist } from "@/providers/WatchlistProvider";
import { getSourceById, STREAMING_SOURCES } from "@/services/streamingSources";
import type { SubtitleCue } from "@/services/subtitles";
import type { Movie } from "@/types/tmdb";
import { CaptionControls } from "./CaptionControls";
import { SourceSwitcher } from "./SourceSwitcher";
import { SubtitleOverlay } from "./SubtitleOverlay";
import { SubtitlePanel } from "./SubtitlePanel";

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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { updateProgress } = useWatchlist();

  const [cues, setCues] = useState<SubtitleCue[]>([]);
  const [subsEnabled, setSubsEnabled] = useState(true);
  const clock = useSubtitleClock();

  // The clock object is rebuilt on every tick, so shortcut handlers read it
  // through a ref rather than re-binding the listener ten times a second.
  const clockRef = useRef(clock);
  useEffect(() => {
    clockRef.current = clock;
  });

  const embedUrl = getSourceById(sourceId).getEmbedUrl(movie.id);

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

  /**
   * Start the caption clock when the viewer presses play.
   *
   * The provider's play button is inside a cross-origin iframe, so the click
   * itself is invisible to us — but it moves focus into the frame, which blurs
   * this window. That pairing (window blurred *and* the frame now focused) is
   * the closest observable proxy for "playback just started", and it beats
   * making every viewer arm the clock by hand. Ads or a stray click can fire it
   * early, which is what the trim controls and Reset are for.
   */
  useEffect(() => {
    if (!cues.length) return;
    const onBlur = () => {
      if (document.activeElement !== iframeRef.current) return;
      if (clockRef.current.started) return;
      clockRef.current.start();
      setSubsEnabled(true);
    };
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, [cues.length]);

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
      if (e.key === "c" && cues.length) {
        // Before the clock has ever run, C means "captions, now" — it must not
        // toggle the (enabled by default) overlay off. After that it is a
        // plain show/hide that leaves the running clock alone.
        if (!clockRef.current.started) {
          setSubsEnabled(true);
          clockRef.current.start();
        } else {
          setSubsEnabled((v) => !v);
        }
      }
      if (e.key === "[") clockRef.current.nudge(-0.5);
      if (e.key === "]") clockRef.current.nudge(0.5);
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
          ref={iframeRef}
          src={embedUrl}
          title={movie.title}
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          referrerPolicy="no-referrer"
          onLoad={() => setLoading(false)}
          className="absolute inset-0 size-full"
        />

        <SubtitleOverlay cues={cues} time={clock.time} visible={subsEnabled} />

        {subsEnabled && cues.length > 0 && !clock.started && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex justify-center p-3">
            <p className="glass-strong rounded-full px-4 py-1.5 text-center text-[11px] text-white/80">
              {cues.length} caption lines ready — they start with the film. Out
              of step? Trim with{" "}
              <kbd className="rounded border border-white/20 px-1">[</kbd>{" "}
              <kbd className="rounded border border-white/20 px-1">]</kbd>.
            </p>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-center justify-between gap-2 p-3">
          <div className="pointer-events-auto">
            <CaptionControls
              clock={clock}
              enabled={subsEnabled}
              onEnabledChange={setSubsEnabled}
              cueCount={cues.length}
            />
          </div>
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
        captions ·{" "}
        <kbd className="rounded border border-white/15 px-1.5">[</kbd> /{" "}
        <kbd className="rounded border border-white/15 px-1.5">]</kbd> to nudge
        their timing
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
