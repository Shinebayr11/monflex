# CineStream

A premium cinematic movie streaming platform built with Next.js 16 App Router, React 19, TypeScript, Tailwind v4, and TMDB.

## Setup

```bash
# 1. Install dependencies
npm install        # or pnpm install / yarn install

# 2. Create .env.local with your TMDB v4 read access token
cp .env.example .env.local
# then edit .env.local and paste your TMDB token

# 3. Run dev server
npm run dev
```

Open http://localhost:3000

## Getting a TMDB token

1. Create a free account at https://www.themoviedb.org
2. Go to Settings → API
3. Copy the **API Read Access Token** (v4 auth, long JWT)
4. Paste into `TMDB_API_KEY=` in `.env.local`

### Subtitles (optional)

Automatic subtitle search needs a free key:

1. Claim one at https://store.wyzie.io/redeem
2. Add `WYZIE_API_KEY=...` to `.env.local`

Without it the player still takes a pasted `.vtt` / `.srt` URL — only the
per-movie search is disabled.

Note that the movie itself plays inside a third-party iframe whose clock is not
readable from this app, so overlay subtitles are started and offset by hand from
the player's Sync controls.

## Routes

- `/`                       Homepage (hero + trending + popular + top rated + upcoming + continue watching)
- `/movie/[id]`             Cinematic detail page with cast, recommendations, trailer modal
- `/movie/[id]/watch`       Embedded streaming player with source switcher and subtitle overlay
- `/watchlist`              Saved titles
- `/genre/[id]`             Browse by genre
- `/login`, `/signup`       Auth pages (localStorage-backed)

## Keyboard shortcuts

- `⌘K` / `Ctrl+K`           Open search
- `F` (on watch page)       Fullscreen
- `N` (on watch page)       Next movie
- `Esc`                     Close modals

## Architecture

```
src/
├── app/                   App Router pages (RSC by default)
│   ├── (main)/            Public layout with navbar
│   ├── (auth)/            Auth layout (centered card)
│   └── api/tmdb/          Token-safe TMDB proxy
├── components/
│   ├── layout/            Navbar, SearchModal, Footer
│   ├── movie/             HeroBanner, MovieCard, MovieRow, CastList, etc.
│   ├── player/            MoviePlayer, SourceSwitcher, TrailerModal
│   ├── ui/                shadcn primitives
│   └── skeletons/         Loading skeletons
├── services/              TMDB API + streaming-source registry
├── providers/             AuthProvider, WatchlistProvider (localStorage)
├── hooks/                 useDebounce, useKeyboardShortcut
├── types/                 Strong TMDB + auth types
└── lib/                   utils, constants, format helpers
```

## Notes

- **Auth** is currently localStorage-backed. The `AuthProvider` interface
  matches NextAuth/Clerk/Supabase shapes — swap implementation when ready.
- **Streaming sources** are third-party embed services in `services/streamingSources.ts`.
  Verify their terms of use or replace with your own licensed HLS endpoints for production.
- **All data fetching** runs server-side in RSC with `revalidate` caching.
  The TMDB token never reaches the browser.
# monflex
