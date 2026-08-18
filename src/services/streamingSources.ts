/**
 * Streaming source registry. Each provider returns an iframe URL for a given
 * TMDB movie id. Swap providers freely; the UI uses whichever the user picks.
 *
 * NOTE: These are third-party community embed services. Verify their ToS and
 * your jurisdiction's rules before shipping to production. For licensed
 * streaming, replace this module with your own DRM/HLS endpoints.
 *
 * SUBTITLES: the provider renders its own player inside a cross-origin iframe,
 * so we cannot attach tracks to it. The most we can do is ask, via a query
 * param, for a preferred subtitle language — and only vidsrc documents one.
 * A provider that ignores the param simply plays without subtitles, which is
 * why SubtitleOverlay exists as the fallback that does not depend on any of this.
 */
export interface StreamingSource {
  id: string;
  label: string;
  quality?: string;
  language?: string;
  /** True when the embed URL accepts a preferred-subtitle-language hint. */
  supportsSubtitleLang: boolean;
  getEmbedUrl: (
    tmdbId: number | string,
    opts?: { subtitleLang?: string },
  ) => string;
}

const withParams = (base: string, params: Record<string, string>) => {
  const url = new URL(base);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return url.toString();
};

export const STREAMING_SOURCES: StreamingSource[] = [
  {
    id: "vidsrc",
    label: "VidSrc",
    quality: "HD",
    // `ds_lang` is vidsrc's documented default-subtitle-language param. It could
    // not be re-verified here (the docs domain no longer resolves), but an
    // unrecognised query param is ignored, so the cost of being wrong is nil.
    supportsSubtitleLang: true,
    getEmbedUrl: (id, opts) =>
      opts?.subtitleLang
        ? withParams(`https://vidsrc.to/embed/movie/${id}`, {
            ds_lang: opts.subtitleLang,
          })
        : `https://vidsrc.to/embed/movie/${id}`,
  },
  {
    id: "2embed",
    label: "2Embed",
    quality: "HD",
    supportsSubtitleLang: false,
    getEmbedUrl: (id) => `https://www.2embed.cc/embed/${id}`,
  },
  {
    id: "superembed",
    label: "SuperEmbed",
    quality: "HD",
    supportsSubtitleLang: false,
    getEmbedUrl: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
  },
];

export const getSourceById = (id: string) =>
  STREAMING_SOURCES.find((s) => s.id === id) ?? STREAMING_SOURCES[0];
