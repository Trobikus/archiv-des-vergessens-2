# Grimoire Interactive — Studio Site

A small, production-ready static website for the solo-dev studio **Grimoire Interactive** (aesthetic: candlelit grimoire / sealed archive — dark ink + parchment gold).

## Open locally

No build step is required. Open `index.html` directly in a browser, or serve the folder with any static server for correct relative-path behaviour, e.g. `python -m http.server` from inside `site/` and visit `http://localhost:8000`. All asset, style, and page links are relative, so the site runs identically from the filesystem, a local server, or a hosting root.

## Deploy

Deploy static assets with Cloudflare Pages (`npx wrangler pages deploy` from the repo root). Pages Functions in `/functions` 301-redirect `www` → apex. The contact form posts to `/api/contact`, handled by the Worker in `workers/contact/` (`npx wrangler deploy` there).

## Structure

- `index.html` — studio landing (full-bleed hero + featured title)
- `spiele.html` — games index
- `spiele/archiv-des-vergessens.html` — game info, alpha notes, media gallery, download
- `devlog.html` — development log (transparent alpha updates)
- `roadmap.html` — public roadmap (topics, no date promises)
- `kontakt.html` — contact form (posts to `/api/contact`)
- `impressum.html` / `datenschutz.html` — legal pages (§ 5 DDG / DSGVO)
- `styles.css` — shared stylesheet; fonts self-hosted under `assets/fonts/`
- `main.js` — progressive enhancement (scroll reveal, mobile nav, contact form)
- `assets/studio-mark.png` — canonical studio logo (full mark with name)
- `assets/studio-icon.png` — compact studio mark (nav, favicon, apple-touch)
- `assets/hero.png`, `assets/keyart.png`, `assets/archiv-cover.png` — atmosphere / game art
- `_headers`, `robots.txt`, `sitemap.xml` — ops / SEO
