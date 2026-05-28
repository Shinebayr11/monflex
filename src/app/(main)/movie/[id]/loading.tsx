export default function Loading() {
  return (
    <>
      <div className="h-[80dvh] bg-white/5 animate-pulse" />
      <div className="mx-auto max-w-[1600px] px-6 md:px-12 py-12 space-y-8">
        <div className="h-7 w-40 bg-white/5 rounded animate-pulse" />
        <div className="flex gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="size-28 rounded-full bg-white/5 animate-pulse"
            />
          ))}
        </div>
      </div>
    </>
  );
}
