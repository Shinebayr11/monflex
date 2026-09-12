"use client";
import {
  Captions,
  CaptionsOff,
  Loader2,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SubtitleClock } from "@/hooks/useSubtitleClock";
import { formatClock, parseClock } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SubtitleCue, SubtitleTrack } from "@/services/subtitles";

/** Remembered across movies — a viewer's subtitle language rarely changes. */
const LANG_KEY = "cs.sublang";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "mn", label: "Монгол" },
  { code: "ru", label: "Русский" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
];

interface Props {
  movieId: number | string;
  clock: SubtitleClock;
  enabled: boolean;
  onEnabledChange: (v: boolean) => void;
  cueCount: number;
  onCues: (cues: SubtitleCue[]) => void;
}

export function SubtitlePanel({
  movieId,
  clock,
  enabled,
  onEnabledChange,
  cueCount,
  onCues,
}: Props) {
  // Null until the stored preference is read, so the first search is not fired
  // against "en" only to be redone against the viewer's actual language.
  const [lang, setLang] = useState<string | null>(null);
  const [tracks, setTracks] = useState<SubtitleTrack[]>([]);
  const [activeTrack, setActiveTrack] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [seekTo, setSeekTo] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Held in refs so a parent re-render cannot re-create loadFile/search and
  // retrigger the auto-search effect below.
  const onCuesRef = useRef(onCues);
  const onEnabledRef = useRef(onEnabledChange);
  useEffect(() => {
    onCuesRef.current = onCues;
    onEnabledRef.current = onEnabledChange;
  });

  const loadFile = useCallback(async (fileUrl: string, trackId?: string) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/subtitles?url=${encodeURIComponent(fileUrl)}`,
      );
      const body = await res.json();
      if (!res.ok)
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      onCuesRef.current(body.cues as SubtitleCue[]);
      setActiveTrack(trackId ?? null);
      onEnabledRef.current(true);
    } catch (e) {
      onCuesRef.current([]);
      setError(e instanceof Error ? e.message : "Could not load subtitles");
    } finally {
      setBusy(false);
    }
  }, []);

  const search = useCallback(
    async (code: string) => {
      setBusy(true);
      setError(null);
      setTracks([]);
      try {
        const res = await fetch(`/api/subtitles?tmdb=${movieId}&lang=${code}`);
        const body = await res.json();
        if (!res.ok)
          throw new Error(body?.error ?? `Request failed (${res.status})`);
        const found = (body.tracks ?? []) as SubtitleTrack[];
        setTracks(found);
        if (found.length === 0)
          setError(`No ${code.toUpperCase()} subtitles found.`);
        else await loadFile(found[0].url, found[0].id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Search failed");
      } finally {
        setBusy(false);
      }
    },
    [movieId, loadFile],
  );

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(LANG_KEY);
    } catch {
      // Private mode or blocked storage — fall through to the default.
    }
    setLang(stored ?? "en");
  }, []);

  // Have cues ready before the viewer goes looking for them.
  useEffect(() => {
    if (lang) search(lang);
  }, [lang, search]);

  const chooseLang = (code: string) => {
    setLang(code);
    try {
      localStorage.setItem(LANG_KEY, code);
    } catch {
      // Preference just won't persist; the picker still works this session.
    }
  };

  return (
    <div className="space-y-3 rounded-xl glass p-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onEnabledChange(!enabled)}
          disabled={cueCount === 0}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs border transition disabled:opacity-40",
            enabled && cueCount > 0
              ? "bg-primary text-white border-primary glow-primary"
              : "glass hover:bg-white/10 border-white/10",
          )}
        >
          {enabled && cueCount > 0 ? (
            <Captions className="size-3.5" />
          ) : (
            <CaptionsOff className="size-3.5" />
          )}
          Subtitles
        </button>

        <select
          value={lang ?? "en"}
          onChange={(e) => chooseLang(e.target.value)}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code} className="bg-neutral-900">
              {l.label}
            </option>
          ))}
        </select>

        {busy && <Loader2 className="size-4 animate-spin text-white/50" />}

        {cueCount > 0 && (
          <span className="text-xs text-white/40">{cueCount} cues loaded</span>
        )}
      </div>

      {tracks.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {tracks.slice(0, 8).map((t) => (
            <button
              type="button"
              key={t.id}
              onClick={() => loadFile(t.url, t.id)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] transition",
                activeTrack === t.id
                  ? "border-primary bg-primary/20 text-white"
                  : "border-white/10 glass hover:bg-white/10 text-white/70",
              )}
            >
              {t.label}
              {t.hearingImpaired && (
                <span className="ml-1 text-white/40">SDH</span>
              )}
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-amber-400/90">{error}</p>}

      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="…or paste a .vtt / .srt URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && url.trim()) loadFile(url.trim());
          }}
          className="w-full rounded bg-white/5 px-2 py-1 text-sm text-white/80 placeholder:text-white/30"
        />
        <button
          type="button"
          onClick={() => url.trim() && loadFile(url.trim())}
          disabled={!url.trim() || busy}
          className="rounded bg-white/10 px-3 py-1 text-sm hover:bg-white/20 disabled:opacity-40"
        >
          Load
        </button>
      </div>

      {cueCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
          <span className="text-xs uppercase tracking-widest text-white/50">
            Sync
          </span>
          <button
            type="button"
            onClick={clock.toggle}
            className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs hover:bg-white/10"
          >
            {clock.running ? (
              <Pause className="size-3.5" />
            ) : (
              <Play className="size-3.5" />
            )}
            {clock.running ? "Pause" : "Start"}
          </button>

          <span className="tabular-nums text-xs text-white/70">
            {formatClock(clock.time)}
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => clock.nudge(-0.5)}
              className="rounded glass px-2 py-1 text-xs hover:bg-white/10"
            >
              −0.5s
            </button>
            <button
              type="button"
              onClick={() => clock.nudge(0.5)}
              className="rounded glass px-2 py-1 text-xs hover:bg-white/10"
            >
              +0.5s
            </button>
            {clock.offset !== 0 && (
              <span className="ml-1 text-xs text-white/40">
                {clock.offset > 0 ? "+" : ""}
                {clock.offset.toFixed(1)}s
              </span>
            )}
          </div>

          <form
            className="flex items-center gap-1"
            onSubmit={(e) => {
              e.preventDefault();
              const sec = parseClock(seekTo);
              if (sec === null) return;
              clock.seek(sec);
              clock.start();
              setSeekTo("");
            }}
          >
            <input
              type="text"
              inputMode="numeric"
              value={seekTo}
              onChange={(e) => setSeekTo(e.target.value)}
              placeholder="12:30"
              aria-label="Match the position shown in the player"
              className="w-20 rounded bg-white/5 px-2 py-1 text-xs text-white/80 placeholder:text-white/30"
            />
            <button
              type="submit"
              disabled={parseClock(seekTo) === null}
              className="rounded glass px-2 py-1 text-xs hover:bg-white/10 disabled:opacity-40"
            >
              Match
            </button>
          </form>

          <button
            type="button"
            onClick={clock.reset}
            className="inline-flex items-center gap-1 rounded glass px-2 py-1 text-xs hover:bg-white/10"
          >
            <RotateCcw className="size-3" /> Reset
          </button>

          <p className="w-full text-[11px] text-white/35">
            The film plays in a sandboxed frame, so its clock is not readable
            from here. Press Start as the film begins — or type the position the
            player itself shows and hit Match — then trim with ±0.5s. The same
            controls sit on the video, so they stay reachable in fullscreen.
          </p>
        </div>
      )}
    </div>
  );
}
