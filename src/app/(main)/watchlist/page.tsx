"use client";
import Link from "next/link";
import { useWatchlist } from "@/providers/WatchlistProvider";
import { MovieCard } from "@/components/movie/MovieCard";
import { Button } from "@/components/ui/button";

export default function WatchlistPage() {
  const { watchlist } = useWatchlist();
  return (
    <div className="mx-auto max-w-[1600px] px-6 md:px-12 py-12">
      <h1 className="mb-8 text-3xl md:text-4xl font-bold">My List</h1>
      {watchlist.length === 0 ? (
        <div className="grid place-items-center gap-3 py-24 text-center">
          <p className="text-white/60">Your list is empty.</p>
          <Link href="/">
            <Button>Browse movies</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          {watchlist.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
      )}
    </div>
  );
}
