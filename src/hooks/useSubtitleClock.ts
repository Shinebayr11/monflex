"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export interface SubtitleClock {
  /** Effective subtitle time in seconds (elapsed + offset). */
  time: number;
  running: boolean;
  offset: number;
  start: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (sec: number) => void;
  nudge: (delta: number) => void;
  reset: () => void;
}

/**
 * A hand-driven playback clock.
 *
 * The movie plays inside a cross-origin iframe, so its `currentTime` is not
 * readable from here. The viewer starts this clock when playback starts and
 * trims the offset until the lines land; everything downstream just reads
 * `time`. Ticks at 10Hz, which is well under one subtitle frame.
 */
export function useSubtitleClock(): SubtitleClock {
  const baseRef = useRef(0);
  const startedAtRef = useRef<number | null>(null);
  const [running, setRunning] = useState(false);
  const [offset, setOffset] = useState(0);
  const [, tick] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => tick((t) => t + 1), 100);
    return () => clearInterval(id);
  }, [running]);

  const elapsed = () =>
    baseRef.current +
    (startedAtRef.current === null
      ? 0
      : (Date.now() - startedAtRef.current) / 1000);

  const start = useCallback(() => {
    if (startedAtRef.current !== null) return;
    startedAtRef.current = Date.now();
    setRunning(true);
  }, []);

  const pause = useCallback(() => {
    if (startedAtRef.current === null) return;
    baseRef.current += (Date.now() - startedAtRef.current) / 1000;
    startedAtRef.current = null;
    setRunning(false);
  }, []);

  const toggle = useCallback(() => {
    if (startedAtRef.current === null) start();
    else pause();
  }, [start, pause]);

  const seek = useCallback((sec: number) => {
    baseRef.current = Math.max(0, sec);
    if (startedAtRef.current !== null) startedAtRef.current = Date.now();
    tick((t) => t + 1);
  }, []);

  const nudge = useCallback((delta: number) => {
    setOffset((o) => Math.round((o + delta) * 10) / 10);
  }, []);

  const reset = useCallback(() => {
    baseRef.current = 0;
    startedAtRef.current = null;
    setRunning(false);
    setOffset(0);
    tick((t) => t + 1);
  }, []);

  return {
    time: elapsed() + offset,
    running,
    offset,
    start,
    pause,
    toggle,
    seek,
    nudge,
    reset,
  };
}
