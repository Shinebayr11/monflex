/**
 * Streaming source registry. Each provider returns an iframe URL for a given
 * TMDB movie id. Swap providers freely; the UI uses whichever the user picks.
 *
 * NOTE: These are third-party community embed services. Verify their ToS and
 * your jurisdiction's rules before shipping to production. For licensed
 * streaming, replace this module with your own DRM/HLS endpoints.
 *
 * SUBTITLES: the provider renders its own player inside a cross-origin iframe,
 * so we cannot attach tracks to it — SubtitleOverlay draws them over the frame
 * instead. Asking the provider for a subtitle language via a query param was
 * tried and removed: see the vidsrc entry. Keep these URLs bare.
 */
export interface StreamingSource {
  id: string;
  label: string;
  quality?: string;
  language?: string;
  getEmbedUrl: (tmdbId: number | string) => string;
}

export const STREAMING_SOURCES: StreamingSource[] = [
  {
    id: "vidsrc",
    label: "VidSrc",
    quality: "HD",
    // Do NOT pass `ds_lang` here. It was assumed to be an unrecognised param
    // that the provider would ignore; it is not. With it, vidsrc's shell page
    // builds its inner frame as `/embed/movie//` — the id is dropped — and the
    // player answers "This media is unavailable at the moment." for every film.
    // We draw our own captions over the frame anyway, so nothing is lost.
    getEmbedUrl: (id) => `https://vidsrc.to/embed/movie/${id}`,
  },
  {
    id: "2embed",
    label: "2Embed",
    quality: "HD",
    getEmbedUrl: (id) => `https://www.2embed.cc/embed/${id}`,
  },
  {
    id: "superembed",
    label: "SuperEmbed",
    quality: "HD",
    getEmbedUrl: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
  },
];

export const getSourceById = (id: string) =>
  STREAMING_SOURCES.find((s) => s.id === id) ?? STREAMING_SOURCES[0];
