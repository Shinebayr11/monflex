"use client";
import { Captions, CaptionsOff, Pause, Play } from "lucide-react";
import type { SubtitleClock } from "@/hooks/useSubtitleClock";
import { formatClock } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Props {
  clock: SubtitleClock;
  enabled: boolean;
  onEnabledChange: (v: boolean) => void;
  cueCount: number;
}

const btn =
  "grid size-7 place-items-center rounded-full text-white/80 transition hover:bg-white/20 hover:text-white";

/**
 * Caption controls drawn *inside* the player frame. The panel below the video
 * leaves the screen the moment the viewer goes fullscreen, which is exactly
 * when captions need starting and trimming — so the essentials live here too.
 */
export function CaptionControls({
  clock,
  enabled,
  onEnabledChange,
  cueCount,
}: Props) {
  if (cueCount === 0) return null;

  return (
    <div className="flex items-center gap-0.5 rounded-full glass-strong p-1 text-xs">
      <button
        type="button"
        onClick={() => onEnabledChange(!enabled)}
        aria-pressed={enabled}
        aria-label={enabled ? "Hide captions" : "Show captions"}
        className={cn(btn, enabled && "bg-primary text-white")}
      >
        {enabled ? (
          <Captions className="size-4" />
        ) : (
          <CaptionsOff className="size-4" />
        )}
      </button>

      {enabled && (
        <>
          <button
            type="button"
            onClick={clock.toggle}
            aria-label={clock.running ? "Pause captions" : "Start captions"}
            className={cn(btn, !clock.started && "text-primary")}
          >
            {clock.running ? (
              <Pause className="size-4" />
            ) : (
              <Play className="size-4" />
            )}
          </button>
          <button
            type="button"
            onClick={() => clock.nudge(-0.5)}
            aria-label="Captions half a second earlier"
            className={cn(btn, "w-auto px-1.5")}
          >
            −0.5s
          </button>
          <span className="px-1 tabular-nums text-white/60">
            {formatClock(clock.time)}
          </span>
          <button
            type="button"
            onClick={() => clock.nudge(0.5)}
            aria-label="Captions half a second later"
            className={cn(btn, "w-auto px-1.5")}
          >
            +0.5s
          </button>
        </>
      )}
    </div>
  );
}
