import fs from "node:fs/promises";
import path from "node:path";

const site = "site";

async function main() {
  // Index OG completeness
  let index = await fs.readFile(path.join(site, "index.html"), "utf8");
  if (!index.includes("og:site_name")) {
    index = index.replace(
      `<meta property="og:image" content="https://grimoire-interactive.de/assets/og-studio.jpg" />`,
      `<meta property="og:site_name" content="Grimoire Interactive" />
  <meta property="og:image" content="https://grimoire-interactive.de/assets/og-studio.jpg" />`
    );
  }
  if (!index.includes("twitter:title")) {
    index = index.replace(
      `<meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="https://grimoire-interactive.de/assets/og-studio.jpg" />`,
      `<meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Grimoire Interactive — Unabhängiges Game Studio" />
  <meta name="twitter:description" content="Atmosphärische Spiele aus Erinnerung und Mythos — Solo-Studio, frühe Alpha von Archiv des Vergessens." />
  <meta name="twitter:image" content="https://grimoire-interactive.de/assets/og-studio.jpg" />`
    );
  }
  // Align og:title with page title
  index = index.replace(
    `<meta property="og:title" content="Grimoire Interactive" />`,
    `<meta property="og:title" content="Grimoire Interactive — Unabhängiges Game Studio" />`
  );
  await fs.writeFile(path.join(site, "index.html"), index, "utf8");

  // Gallery → picture + webp lightbox source
  let game = await fs.readFile(path.join(site, "spiele/archiv-des-vergessens.html"), "utf8");
  game = game.replace(
    /<span class="media-gallery__frame">\s*<img\s+src="\.\.\/assets\/gallery\/(shot-[a-z0-9-]+)\.png" data-webp="\.\.\/assets\/derived\/\1\.webp"\s+alt="([^"]*)"\s+width="(\d+)"\s+height="(\d+)"\s+loading="lazy"\s+decoding="async"\s*\/>\s*<\/span>/g,
    `<span class="media-gallery__frame">
                  <picture>
                    <source srcset="../assets/derived/$1.webp" type="image/webp" />
                    <img
                      src="../assets/gallery/$1.png"
                      alt="$2"
                      width="$3"
                      height="$4"
                      loading="lazy"
                      decoding="async"
                    />
                  </picture>
                </span>`
  );
  // Prefer webp in lightbox trigger when available
  game = game.replace(
    /data-lightbox="\.\.\/assets\/gallery\/(shot-[a-z0-9-]+)\.png"/g,
    'data-lightbox="../assets/derived/$1.webp"'
  );
  await fs.writeFile(path.join(site, "spiele/archiv-des-vergessens.html"), game, "utf8");

  // robots.txt
  await fs.writeFile(
    path.join(site, "robots.txt"),
    `User-agent: *
Allow: /

Sitemap: https://grimoire-interactive.de/sitemap.xml
`
  );

  // CSS: hero/detail webp + press/about docs + footer density
  let css = await fs.readFile(path.join(site, "styles.css"), "utf8");
  css = css.replace(
    `.hero__bg {
  position: absolute;
  inset: 0;
  z-index: -3;
  background: url("assets/hero.png") center 30% / cover no-repeat;
  transform: scale(1.06);
  animation: heroDrift 32s ease-in-out infinite alternate;
}`,
    `.hero__bg {
  position: absolute;
  inset: 0;
  z-index: -3;
  background-color: #050507;
  background-image:
    image-set(
      url("assets/derived/hero.webp") type("image/webp"),
      url("assets/hero.png") type("image/png")
    );
  background-position: center 30%;
  background-size: cover;
  background-repeat: no-repeat;
  transform: scale(1.06);
  animation: heroDrift 32s ease-in-out infinite alternate;
}`
  );
  css = css.replace(
    `  background: url("assets/game-banner-archiv.png") center / cover no-repeat;`,
    `  background-color: #050507;
  background-image:
    image-set(
      url("assets/derived/game-banner-archiv.webp") type("image/webp"),
      url("assets/game-banner-archiv.png") type("image/png")
    );
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;`
  );

  if (!css.includes(".about-doc")) {
    css += `
/* ---- about / press / support docs ------------------------------------- */
.about-doc,
.press-doc,
.support-doc {
  max-width: 42rem;
  font-size: 1.02rem;
}
.about-doc h2,
.press-doc h2 {
  font-size: clamp(1.35rem, 3vw, 1.9rem);
  max-width: 20ch;
  margin: 0 0 1.1rem;
}
.press-doc h2 { margin-top: 2.4rem; }
.press-doc h2:first-of-type { margin-top: 0; }
.about-doc p,
.press-doc p,
.support-doc .faq-item__body p {
  color: rgba(233, 226, 208, 0.86);
  margin: 0 0 1.05rem;
}
.press-facts,
.press-assets {
  list-style: none;
  margin: 0 0 0.5rem;
  padding: 0;
  border-top: 1px solid var(--line);
}
.press-facts li,
.press-assets li {
  padding: 0.85rem 0;
  border-bottom: 1px solid var(--line-soft);
  color: rgba(233, 226, 208, 0.86);
}
.press-facts li strong {
  display: inline-block;
  min-width: 7.5rem;
  font-family: var(--font-display);
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--gold);
  margin-right: 0.75rem;
}
.press-note {
  margin: 0 0 1rem !important;
  color: var(--dust) !important;
  font-size: 0.95rem;
}
.press-assets a {
  font-family: var(--font-display);
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.footer-col { gap: 0.45rem; }
@media (min-width: 900px) {
  .footer-grid { grid-template-columns: 1.2fr 1.1fr 0.9fr; }
}
`;
  }
  await fs.writeFile(path.join(site, "styles.css"), css, "utf8");

  // Soft CSP + long-cache for derived/og
  let headers = await fs.readFile(path.join(site, "_headers"), "utf8");
  if (!headers.includes("Content-Security-Policy")) {
    headers = headers.replace(
      `  Cross-Origin-Opener-Policy: same-origin

/assets/*`,
      `  Cross-Origin-Opener-Policy: same-origin
  Content-Security-Policy: default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' https://static.cloudflareinsights.com; font-src 'self'; connect-src 'self' https://cloudflareinsights.com; media-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'

/assets/*`
    );
  }
  if (!headers.includes("og-studio")) {
    headers += `
/assets/og-*.jpg
  Cache-Control: public, max-age=604800

/assets/derived/*
  Cache-Control: public, max-age=31536000, immutable

/feed.xml
  Content-Type: application/rss+xml; charset=utf-8
`;
  }
  await fs.writeFile(path.join(site, "_headers"), headers, "utf8");

  console.log("finalize ok");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
