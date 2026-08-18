/**
 * Subtitle parsing + lookup.
 *
 * The player is a cross-origin iframe, so we cannot hand cues to the provider's
 * video element. Instead we parse cues here and draw them ourselves on top of
 * the frame (see SubtitleOverlay). Both WebVTT and SRT are accepted because
 * subtitle hosts serve either one, often with the wrong extension.
 */
export interface SubtitleCue {
  start: number;
  end: number;
  text: string;
}

export interface SubtitleTrack {
  id: string;
  label: string;
  language: string;
  url: string;
  hearingImpaired?: boolean;
}

/** `[HH:]MM:SS[.,]mmm` — VTT uses a dot, SRT a comma. */
function parseTimestamp(raw: string): number | null {
  const m = raw.trim().match(/^(?:(\d+):)?(\d{1,2}):(\d{1,2})[.,](\d{1,3})$/);
  if (!m) return null;
  const [, h, min, sec, ms] = m;
  return (
    Number(h ?? 0) * 3600 +
    Number(min) * 60 +
    Number(sec) +
    Number(ms.padEnd(3, "0")) / 1000
  );
}

/** Strip VTT markup (`<i>`, `<v Name>`) and ASS overrides (`{\an8}`). */
const cleanCueText = (s: string) =>
  s
    .replace(/<[^>]*>/g, "")
    .replace(/\{\\[^}]*\}/g, "")
    .trim();

export function parseSubtitles(raw: string): SubtitleCue[] {
  const normalized = raw.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const cues: SubtitleCue[] = [];

  for (const block of normalized.split(/\n{2,}/)) {
    const lines = block.split("\n");
    const timingIdx = lines.findIndex((l) => l.includes("-->"));
    if (timingIdx === -1) continue;

    const [left, right = ""] = lines[timingIdx].split("-->");
    const start = parseTimestamp(left);
    // The end timestamp may be followed by cue settings (`align:start position:50%`).
    const end = parseTimestamp(right.trim().split(/\s+/)[0] ?? "");
    if (start === null || end === null || end <= start) continue;

    const text = cleanCueText(lines.slice(timingIdx + 1).join("\n"));
    if (text) cues.push({ start, end, text });
  }

  return cues.sort((a, b) => a.start - b.start);
}

/**
 * Active cues at `time` (seconds). Cues may overlap, so this returns every
 * match rather than the first. Assumes `cues` is sorted by start.
 */
export function cuesAt(cues: SubtitleCue[], time: number): SubtitleCue[] {
  // First cue that could still be on screen.
  let lo = 0;
  let hi = cues.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cues[mid].end <= time) lo = mid + 1;
    else hi = mid;
  }

  const active: SubtitleCue[] = [];
  for (let i = lo; i < cues.length && cues[i].start <= time; i++) {
    if (cues[i].end > time) active.push(cues[i]);
  }
  return active;
}
