/**
 * Streaming source registry. Each provider returns an iframe URL for a given
 * TMDB movie id. Swap providers freely; the UI uses whichever the user picks.
 *
 * NOTE: These are third-party community embed services. Verify their ToS and
 * your jurisdiction's rules before shipping to production. For licensed
 * streaming, replace this module with your own DRM/HLS endpoints.
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
