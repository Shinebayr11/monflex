"use client";
import { Check, Plus } from "lucide-react";
import type { Movie } from "@/types/tmdb";
import { useWatchlist } from "@/providers/WatchlistProvider";
import { Button } from "@/components/ui/button";

export function WatchlistButton({ movie }: { movie: Movie }) {
  const { inWatchlist, toggleWatchlist } = useWatchlist();
  const on = inWatchlist(movie.id);
  return (
    <Button
      variant={on ? "default" : "secondary"}
      size="lg"
      onClick={() => toggleWatchlist(movie)}
      className="gap-2"
    >
      {on ? <Check className="size-4" /> : <Plus className="size-4" />}
      {on ? "In My List" : "My List"}
    </Button>
  );
}
