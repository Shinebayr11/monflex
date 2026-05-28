import type { NextRequest } from "next/server";
import { TMDB_BASE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const url = new URL(`${TMDB_BASE}/${path.join("/")}`);
  req.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v));
  if (!url.searchParams.has("language")) url.searchParams.set("language", "en-US");

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
    next: { revalidate: 60 },
  });
  return new Response(res.body, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
