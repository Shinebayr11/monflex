"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { tmdbImage, formatYear } from "@/lib/format";
import type { Movie } from "@/types/tmdb";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: Props) {
  const [q, setQ] = useState("");
  const debounced = useDebounce(q, 250);
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setQ("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onOpenChange(false);
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!debounced.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    fetch(`/api/tmdb/search/movie?query=${encodeURIComponent(debounced)}`)
      .then((r) => r.json())
      .then((data) => setResults((data.results ?? []).slice(0, 10)))
      .finally(() => setLoading(false));
  }, [debounced]);

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 grid place-items-start justify-center pt-24",
        "bg-black/70 backdrop-blur-md animate-in fade-in",
      )}
      onClick={() => onOpenChange(false)}
    >
      <div
        className="glass-strong w-[92vw] max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <Search className="size-5 text-white/60" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search movies…"
            className="flex-1 bg-transparent outline-none placeholder:text-white/40"
          />
          <button type="button" onClick={() => onOpenChange(false)} aria-label="Close">
            <X className="size-5 text-white/60 hover:text-white" />
          </button>
        </div>

        <ul className="max-h-[60vh] overflow-y-auto scrollbar-hide">
          {loading && <li className="p-6 text-center text-white/50">Searching…</li>}
          {!loading && q && results.length === 0 && (
            <li className="p-6 text-center text-white/50">No matches.</li>
          )}
          {results.map((m) => (
            <li key={m.id}>
              <Link
                href={`/movie/${m.id}`}
                onClick={() => onOpenChange(false)}
                className="flex gap-3 p-3 hover:bg-white/5 transition-colors"
              >
                <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded">
                  {m.poster_path && (
                    <Image
                      src={tmdbImage(m.poster_path, "w185")!}
                      alt={m.title}
                      fill
                      sizes="56px"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{m.title}</p>
                  <p className="text-xs text-white/50">
                    {formatYear(m.release_date)} · ★ {m.vote_average.toFixed(1)}
                  </p>
                  <p className="text-xs text-white/40 line-clamp-2 mt-1">{m.overview}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
