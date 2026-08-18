import type { NextRequest } from "next/server";
import type { SubtitleTrack } from "@/services/subtitles";
import { parseSubtitles } from "@/services/subtitles";

export const dynamic = "force-dynamic";

const MAX_BYTES = 4 * 1024 * 1024;
const MAX_REDIRECTS = 3;

/**
 * Subtitle files are fetched here rather than in the browser: the hosts rarely
 * send CORS headers. That makes this route an SSRF sink, so every hop — including
 * redirect targets — is checked against private address space before we fetch it.
 */
const BLOCKED_HOSTS = /^(localhost|.*\.localhost|.*\.local|.*\.internal)$/i;

function isPrivateAddress(host: string): boolean {
  const h = host.replace(/^\[|\]$/g, "").toLowerCase();
  if (BLOCKED_HOSTS.test(h)) return true;

  // IPv6 loopback / unique-local / link-local
  if (h === "::1" || h === "::") return true;
  if (/^f[cd][0-9a-f]{2}:/.test(h)) return true;
  if (/^fe[89ab][0-9a-f]:/.test(h)) return true;

  const v4 = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!v4) return false;
  const [a, b] = v4.slice(1).map(Number);
  if (v4.slice(1).some((n) => Number(n) > 255)) return true;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) || // cloud metadata
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127)
  );
}

function assertFetchable(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Malformed URL");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:")
    throw new Error("Only http(s) URLs are allowed");
  if (isPrivateAddress(url.hostname))
    throw new Error("Refusing to fetch a private address");
  return url;
}

/** Follows redirects manually so each hop can be re-validated. */
async function safeFetch(target: string): Promise<Response> {
  let url = assertFetchable(target);

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const res = await fetch(url, {
      redirect: "manual",
      headers: {
        "User-Agent": "CineStream/1.0",
        Accept: "text/vtt,text/plain,*/*",
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (res.status < 300 || res.status >= 400) return res;

    const location = res.headers.get("location");
    if (!location) return res;
    url = assertFetchable(new URL(location, url).toString());
  }
  throw new Error("Too many redirects");
}

async function readCapped(res: Response): Promise<string> {
  const declared = Number(res.headers.get("content-length") ?? 0);
  if (declared > MAX_BYTES) throw new Error("Subtitle file too large");

  const buf = await res.arrayBuffer();
  if (buf.byteLength > MAX_BYTES) throw new Error("Subtitle file too large");
  return new TextDecoder("utf-8").decode(buf);
}

const bad = (message: string, status: number) =>
  Response.json({ error: message }, { status });

/**
 * Normalises one search result. The upstream field names are not pinned down
 * (the API needs a key to inspect), so several plausible spellings are accepted.
 */
// biome-ignore lint/suspicious/noExplicitAny: upstream response shape is untyped
function toTrack(raw: any, i: number): SubtitleTrack | null {
  const url = raw?.url ?? raw?.link ?? raw?.download;
  if (typeof url !== "string" || !url) return null;
  return {
    id: String(raw?.id ?? raw?.encoding ?? i),
    label: String(
      raw?.display ?? raw?.title ?? raw?.language ?? `Track ${i + 1}`,
    ),
    language: String(raw?.language ?? raw?.lang ?? "und"),
    url,
    hearingImpaired: Boolean(raw?.isHearingImpaired ?? raw?.hearing_impaired),
  };
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const direct = q.get("url");
  const tmdb = q.get("tmdb");
  const lang = q.get("lang") ?? "en";

  // Mode 1 — fetch and parse one subtitle file. Needs no API key.
  if (direct) {
    try {
      const res = await safeFetch(direct);
      if (!res.ok) return bad(`Subtitle host returned ${res.status}`, 502);

      const cues = parseSubtitles(await readCapped(res));
      if (!cues.length)
        return bad("No cues found — is this a .vtt or .srt file?", 422);

      return Response.json({ cues });
    } catch (e) {
      return bad(e instanceof Error ? e.message : "Fetch failed", 400);
    }
  }

  // Mode 2 — search by TMDB id. Needs WYZIE_API_KEY.
  if (tmdb) {
    const key = process.env.WYZIE_API_KEY;
    if (!key)
      return bad(
        "Subtitle search is not configured. Add WYZIE_API_KEY to .env.local (free key at store.wyzie.io/redeem), or paste a .vtt URL instead.",
        501,
      );

    try {
      const url = new URL("https://sub.wyzie.io/search");
      url.searchParams.set("id", tmdb);
      url.searchParams.set("language", lang);
      url.searchParams.set("format", "srt");
      url.searchParams.set("key", key);

      const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
      if (!res.ok) return bad(`Subtitle search returned ${res.status}`, 502);

      const body = await res.json();
      const list = Array.isArray(body) ? body : (body?.results ?? []);
      const tracks = list
        .map(toTrack)
        .filter((t: SubtitleTrack | null): t is SubtitleTrack => t !== null);

      return Response.json({ tracks });
    } catch (e) {
      return bad(e instanceof Error ? e.message : "Search failed", 502);
    }
  }

  return bad("Pass ?url=<subtitle file> or ?tmdb=<id>", 400);
}
