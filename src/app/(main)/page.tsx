import { Suspense } from "react";
import { HeroBanner } from "@/components/movie/HeroBanner";
import { MovieRow } from "@/components/movie/MovieRow";
import { ContinueWatchingRow } from "@/components/movie/ContinueWatchingRow";
import { MovieRowSkeleton } from "@/components/skeletons/MovieRowSkeleton";
import { getMovieList, getTrending } from "@/services/tmdb";

export const revalidate = 600;

async function TrendingRow() {
  const { results } = await getTrending("week");
  return <MovieRow title="Trending Now" movies={results} />;
}
async function PopularRow() {
  const { results } = await getMovieList("popular");
  return <MovieRow title="Popular on CineStream" movies={results} />;
}
async function TopRatedRow() {
  const { results } = await getMovieList("top_rated");
  return <MovieRow title="Top Rated" movies={results} />;
}
async function UpcomingRow() {
  const { results } = await getMovieList("upcoming");
  return <MovieRow title="Upcoming" movies={results} />;
}

export default async function HomePage() {
  const { results: hero } = await getTrending("day");
  return (
    <>
      <HeroBanner movies={hero} />
      <ContinueWatchingRow />
      <Suspense fallback={<MovieRowSkeleton title />}>
        <TrendingRow />
      </Suspense>
      <Suspense fallback={<MovieRowSkeleton title />}>
        <PopularRow />
      </Suspense>
      <Suspense fallback={<MovieRowSkeleton title />}>
        <TopRatedRow />
      </Suspense>
      <Suspense fallback={<MovieRowSkeleton title />}>
        <UpcomingRow />
      </Suspense>
    </>
  );
}
