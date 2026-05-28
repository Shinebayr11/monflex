import { discoverByGenre, getGenres } from "@/services/tmdb";
import { MovieCard } from "@/components/movie/MovieCard";

export default async function GenrePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ results }, { genres }] = await Promise.all([
    discoverByGenre(Number(id)),
    getGenres(),
  ]);
  const name = genres.find((g) => g.id === Number(id))?.name ?? "Genre";
  return (
    <div className="mx-auto max-w-[1600px] px-6 md:px-12 py-12">
      <h1 className="mb-8 text-3xl md:text-4xl font-bold">{name}</h1>
      <div className="flex flex-wrap gap-4">
        {results.map((m) => (
          <MovieCard key={m.id} movie={m} />
        ))}
      </div>
    </div>
  );
}
