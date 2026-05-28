import Image from "next/image";
import { tmdbImage } from "@/lib/format";
import type { CastMember } from "@/types/tmdb";

export function CastList({ cast }: { cast: CastMember[] }) {
  if (!cast?.length) return null;
  return (
    <section className="space-y-4">
      <h2 className="text-xl md:text-2xl font-bold">Cast</h2>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {cast.slice(0, 12).map((p) => (
          <div key={p.id} className="w-28 shrink-0 text-center">
            <div className="relative aspect-square w-28 overflow-hidden rounded-full bg-white/5">
              {p.profile_path && (
                <Image
                  src={tmdbImage(p.profile_path, "w185")!}
                  alt={p.name}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              )}
            </div>
            <p className="mt-2 text-sm font-medium truncate">{p.name}</p>
            <p className="text-xs text-white/50 truncate">{p.character}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
