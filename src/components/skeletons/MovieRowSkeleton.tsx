import { MovieCardSkeleton } from "./MovieCardSkeleton";

export function MovieRowSkeleton({ title }: { title?: boolean }) {
  return (
    <section className="py-6">
      <div className="mx-auto max-w-[1600px] px-6 md:px-12">
        {title && (
          <div className="mb-4 h-7 w-40 rounded bg-white/5 animate-pulse" />
        )}
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 7 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
