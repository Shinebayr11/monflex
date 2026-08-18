"use client";
import { cuesAt, type SubtitleCue } from "@/services/subtitles";

interface Props {
  cues: SubtitleCue[];
  time: number;
  visible: boolean;
}

/**
 * Draws cues on top of the provider iframe. Sits inside the fullscreen element
 * so captions survive going fullscreen, and stays pointer-transparent so clicks
 * still reach the player underneath.
 */
export function SubtitleOverlay({ cues, time, visible }: Props) {
  if (!visible || cues.length === 0) return null;

  const active = cuesAt(cues, time);
  if (active.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-16 z-20 flex flex-col items-center gap-1 px-6">
      {active.map((cue) => (
        <p
          key={`${cue.start}-${cue.text}`}
          className="whitespace-pre-line rounded bg-black/60 px-3 py-1 text-center font-medium leading-snug text-white text-[clamp(0.9rem,2.2vw,2rem)]"
          style={{ textShadow: "0 2px 4px rgba(0,0,0,0.9)" }}
        >
          {cue.text}
        </p>
      ))}
    </div>
  );
}
