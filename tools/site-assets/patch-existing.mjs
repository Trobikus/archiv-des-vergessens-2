/**
 * Patch existing HTML pages: favicons, OG, footer, cache bust, schema, picture tags.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const site = path.resolve(__dirname, "../../site");
const V = "20260802h";

const FOOTER_IDS = [
  ["spiele.html", "Spiele", "spiele"],
  ["devlog.html", "Devlog", "devlog"],
  ["roadmap.html", "Roadmap", "roadmap"],
  ["faq.html", "FAQ", "faq"],
  ["ueber.html", "Über", "ueber"],
  ["presse.html", "Presse", "presse"],
  ["support.html", "Support", "support"],
  ["kontakt.html", "Kontakt", "kontakt"],
];

function footer(depth, current) {
  const p = depth === 0 ? "" : "../";
  const studio = FOOTER_IDS.map(([href, label, id]) => {
    const cur = id === current ? ' aria-current="page"' : "";
    return `        <a href="${p}${href}"${cur}>${label}</a>`;
  }).join("\n");
  const lc = (id) => (id === current ? ' aria-current="page"' : "");
  return `  <footer class="site-footer">
    <div class="wrap footer-grid">
      <div>
        <div class="footer-brand">Grimoire Interactive</div>
        <p class="footer-meta">© <span data-year>2026</span> · Independent Game Studio</p>
      </div>
      <nav class="footer-col" aria-label="Studio">
        <span class="footer-label">Studio</span>
${studio}
      </nav>
      <nav class="footer-col" aria-label="Rechtliches">
        <span class="footer-label">Rechtliches</span>
        <a href="${p}impressum.html"${lc("impressum")}>Impressum</a>
        <a href="${p}datenschutz.html"${lc("datenschutz")}>Datenschutz</a>
      </nav>
    </div>
  </footer>`;
}

function icons(depth) {
  const a = depth === 0 ? "assets/" : "../assets/";
  const p = depth === 0 ? "" : "../";
  return `  <link rel="icon" href="${a}favicon.ico" sizes="any" />
  <link rel="icon" href="${a}favicon-32.png" type="image/png" sizes="32x32" />
  <link rel="apple-touch-icon" href="${a}apple-touch-icon.png" sizes="180x180" />
  <link rel="manifest" href="${p}site.webmanifest" />`;
}

function replaceFooter(html, depth, current) {
  return html.replace(/<footer class="site-footer">[\s\S]*?<\/footer>/, footer(depth, current));
}

function replaceIcons(html, depth) {
  // Remove old icon links then insert after theme-color or viewport block
  let out = html.replace(/\s*<link rel="icon"[^>]*>/g, "");
  out = out.replace(/\s*<link rel="apple-touch-icon"[^>]*>/g, "");
  out = out.replace(/\s*<link rel="manifest"[^>]*>/g, "");
  if (out.includes('rel="manifest"')) return out;
  // Insert before stylesheet
  return out.replace(
    /(\s*)(<link rel="stylesheet")/,
    `$1${icons(depth).trim()}\n$1$2`
  );
}

function bumpAssets(html, depth) {
  const p = depth === 0 ? "" : "../";
  return html
    .replace(/styles\.css\?v=[^"]+/g, `styles.css?v=${V}`)
    .replace(/main\.js\?v=[^"]+/g, `main.js?v=${V}`)
    .replace(/href="styles\.css"/g, `href="${p}styles.css?v=${V}"`.replace(`${p}${p}`, p))
    .replace(/src="main\.js"/g, `src="main.js?v=${V}"`);
}

function ensureOg(html, { title, description, url, image }) {
  if (html.includes('property="og:url"')) {
    // refresh image if studio-mark used as og
    return html
      .replace(
        /content="https:\/\/grimoire-interactive\.de\/assets\/studio-mark\.png"/g,
        `content="${image}"`
      )
      .replace(
        /(<meta property="og:image" content="[^"]+" \/>)/,
        `$1\n  <meta property="og:image:width" content="1200" />\n  <meta property="og:image:height" content="630" />`
      );
  }
  const block = `  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${url}" />
  <meta property="og:locale" content="de_DE" />
  <meta property="og:site_name" content="Grimoire Interactive" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
`;
  // If partial og exists, strip og/twitter then inject
  let out = html.replace(/\s*<meta property="og:[^"]+" content="[^"]*" \/>/g, "");
  out = out.replace(/\s*<meta name="twitter:[^"]+" content="[^"]*" \/>/g, "");
  return out.replace(/(<link rel="canonical"[^>]*>)/, `$1\n${block.trimEnd()}`);
}

async function patchFile(rel, depth, current, og) {
  const full = path.join(site, rel);
  let html = await fs.readFile(full, "utf8");
  html = replaceFooter(html, depth, current);
  html = replaceIcons(html, depth);
  html = bumpAssets(html, depth);
  if (og) html = ensureOg(html, og);
  await fs.writeFile(full, html, "utf8");
  console.log("patched", rel);
  return html;
}

async function main() {
  const OG_S = "https://grimoire-interactive.de/assets/og-studio.jpg";
  const OG_A = "https://grimoire-interactive.de/assets/og-archiv.jpg";

  // index — special content + schema
  let index = await patchFile("index.html", 0, "studio", {
    title: "Grimoire Interactive — Unabhängiges Game Studio",
    description:
      "Grimoire Interactive ist ein unabhängiges Solo-Entwicklerstudio, das atmosphärische Welten aus Erinnerung und Mythos erschafft.",
    url: "https://grimoire-interactive.de/",
    image: OG_S,
  });

  index = index
    .replace(
      /<title>[^<]*<\/title>/,
      "<title>Grimoire Interactive — Unabhängiges Game Studio</title>"
    )
    .replace(
      /"sameAs":\s*\[\s*\]/,
      `"sameAs": ["https://github.com/Trobikus"],
    "founder": {
      "@type": "Person",
      "name": "Max Jotanovic",
      "url": "https://grimoire-interactive.de/ueber"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "kontakt@grimoire-interactive.de",
      "contactType": "customer support",
      "availableLanguage": ["German"]
    }`
    );

  // Enrich JSON-LD with WebSite
  if (!index.includes('"@type": "WebSite"')) {
    index = index.replace(
      /<script type="application\/ld\+json">\s*\{/,
      `<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "name": "Grimoire Interactive",
        "url": "https://grimoire-interactive.de/",
        "inLanguage": "de-DE",
        "publisher": { "@id": "https://grimoire-interactive.de/#organization" }
      },
      {
        "@id": "https://grimoire-interactive.de/#organization",`
    );
    // Fix the organization block - the replace may have broken structure
  }

  // Safer: rewrite entire ld+json for index
  index = index.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "name": "Grimoire Interactive",
        "url": "https://grimoire-interactive.de/",
        "inLanguage": "de-DE",
        "publisher": { "@id": "https://grimoire-interactive.de/#organization" }
      },
      {
        "@type": "Organization",
        "@id": "https://grimoire-interactive.de/#organization",
        "name": "Grimoire Interactive",
        "url": "https://grimoire-interactive.de/",
        "email": "kontakt@grimoire-interactive.de",
        "logo": "https://grimoire-interactive.de/assets/studio-mark.png",
        "sameAs": ["https://github.com/Trobikus"],
        "founder": {
          "@type": "Person",
          "name": "Max Jotanovic",
          "url": "https://grimoire-interactive.de/ueber"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "email": "kontakt@grimoire-interactive.de",
          "contactType": "customer support",
          "availableLanguage": ["German"]
        }
      }
    ]
  }
  </script>`
  );

  // Studio section CTA + picture + featured links
  index = index.replace(
    `<img
            src="assets/studio-mark.png"
            alt="Logo von Grimoire Interactive: ein leuchtendes Grimoire mit dem Studionamen darunter."
            loading="lazy"
            width="2048"
            height="1536"
            decoding="async"
          />`,
    `<picture>
            <source srcset="assets/derived/studio-mark.webp" type="image/webp" />
            <img
              src="assets/studio-mark.png"
              alt="Logo von Grimoire Interactive: ein leuchtendes Grimoire mit dem Studionamen darunter."
              loading="lazy"
              width="1200"
              height="900"
              decoding="async"
            />
          </picture>`
  );

  index = index.replace(
    `in einer Hand. Kein Publisher, keine Live-Service-Maschine: nur sorgfältig versiegelte Welten,
            die darauf warten, geöffnet zu werden.
          </p>
        </div>
      </div>
    </section>`,
    `in einer Hand. Kein Publisher, keine Live-Service-Maschine: nur sorgfältig versiegelte Welten,
            die darauf warten, geöffnet zu werden.
          </p>
          <div class="page-links" data-rise data-rise-delay="3">
            <a class="release-link" href="ueber.html">Mehr über das Studio →</a>
            <a class="release-link" href="presse.html">Presse-Kit →</a>
          </div>
        </div>
      </div>
    </section>`
  );

  index = index.replace(
    `Fortschritt im
              <span class="muted">Devlog</span>, Richtung in der <span class="muted">Roadmap</span>.`,
    `Fortschritt im
              <a href="devlog.html">Devlog</a>, Richtung in der <a href="roadmap.html">Roadmap</a>.`
  );

  index = index.replace(
    `<img
              src="assets/archiv-cover.png"
              alt="Cover zu Archiv des Vergessens: ein leuchtendes Runensiegel über einem Archiv aus zerfallenden Erinnerungen."
              loading="lazy"
              width="1152"
              height="1536"
              decoding="async"
            />`,
    `<picture>
              <source srcset="assets/derived/archiv-cover.webp" type="image/webp" />
              <img
                src="assets/archiv-cover.png"
                alt="Cover zu Archiv des Vergessens: ein leuchtendes Runensiegel über einem Archiv aus zerfallenden Erinnerungen."
                loading="lazy"
                width="900"
                height="1200"
                decoding="async"
              />
            </picture>`
  );

  // Font preload
  if (!index.includes("cinzel-latin-600")) {
    index = index.replace(
      `<link rel="stylesheet" href="styles.css?v=${V}" />`,
      `<link rel="preload" href="assets/fonts/cinzel-latin-600-normal.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="assets/fonts/source-serif-4-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="stylesheet" href="styles.css?v=${V}" />`
    );
  }

  await fs.writeFile(path.join(site, "index.html"), index, "utf8");
  console.log("enriched index.html");

  await patchFile("spiele.html", 0, "spiele", {
    title: "Spiele — Grimoire Interactive",
    description: "Die Spiele von Grimoire Interactive — atmosphärische Welten aus Erinnerung und Mythos.",
    url: "https://grimoire-interactive.de/spiele",
    image: OG_A,
  });

  let spiele = await fs.readFile(path.join(site, "spiele.html"), "utf8");
  spiele = spiele.replace(
    `<img
                src="assets/archiv-cover.png"
                alt="Cover zu Archiv des Vergessens"
                width="450"
                height="600"
                loading="lazy"
                decoding="async"
              />`,
    `<picture>
                <source srcset="assets/derived/archiv-cover.webp" type="image/webp" />
                <img
                  src="assets/archiv-cover.png"
                  alt="Cover zu Archiv des Vergessens"
                  width="450"
                  height="600"
                  loading="lazy"
                  decoding="async"
                />
              </picture>`
  );
  await fs.writeFile(path.join(site, "spiele.html"), spiele, "utf8");

  await patchFile("roadmap.html", 0, "roadmap", {
    title: "Roadmap — Grimoire Interactive",
    description: "Öffentliche Roadmap zur frühen Alpha von Archiv des Vergessens — Themen statt Datumsversprechen.",
    url: "https://grimoire-interactive.de/roadmap",
    image: OG_S,
  });

  await patchFile("faq.html", 0, "faq", {
    title: "FAQ — Grimoire Interactive",
    description:
      "Häufige Fragen zu Grimoire Interactive und zur frühen Alpha von Archiv des Vergessens — klar, ohne Marketing-Nebelschwade.",
    url: "https://grimoire-interactive.de/faq",
    image: OG_S,
  });

  await patchFile("kontakt.html", 0, "kontakt", {
    title: "Kontakt — Grimoire Interactive",
    description: "Schreib an Grimoire Interactive — Fragen, Feedback und Anliegen zum Studio und zu den Spielen.",
    url: "https://grimoire-interactive.de/kontakt",
    image: OG_S,
  });

  await patchFile("impressum.html", 0, "impressum", null);
  await patchFile("datenschutz.html", 0, "datenschutz", null);

  // Datenschutz: Web Analytics section
  let privacy = await fs.readFile(path.join(site, "datenschutz.html"), "utf8");
  if (!privacy.includes("Web Analytics")) {
    privacy = privacy.replace(
      `<h2>5. Schriftarten</h2>`,
      `<h2>5. Reichweitenmessung (optional)</h2>
        <p>
          Zur anonymen Reichweitenmessung kann <strong>Cloudflare Web Analytics</strong>
          eingesetzt werden (aktiviert über das Cloudflare-Dashboard). Dabei werden keine
          Analyse-Cookies zu Werbe- oder Profiling-Zwecken gesetzt; die Auswertung erfolgt
          privacy-orientiert über den Hosting-/CDN-Betrieb.
        </p>
        <p>
          Rechtsgrundlage: Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;f DSGVO (berechtigtes Interesse an
          der statistischen Auswertung der Website-Nutzung in aggregierter Form).
        </p>

        <h2>6. Schriftarten</h2>`
    );
    // Renumber subsequent sections 6->7 etc if still old numbers
    privacy = privacy
      .replace("<h2>6. Downloads", "<h2>7. Downloads")
      .replace("<h2>7. Spiel", "<h2>8. Spiel")
      .replace("<h2>8. Ihre Rechte", "<h2>9. Ihre Rechte")
      .replace("<h2>9. Keine automatisierte", "<h2>10. Keine automatisierte");
    await fs.writeFile(path.join(site, "datenschutz.html"), privacy, "utf8");
    console.log("updated datenschutz analytics section");
  }

  // Game page
  let game = await patchFile("spiele/archiv-des-vergessens.html", 1, "spiele", {
    title: "Archiv des Vergessens — Grimoire Interactive",
    description:
      "Archiv des Vergessens — frühe Alpha eines atmosphärischen Idle-RPGs. Noch unfertig, offen kommuniziert. Launcher für Windows.",
    url: "https://grimoire-interactive.de/spiele/archiv-des-vergessens",
    image: OG_A,
  });

  if (!game.includes("VideoGame")) {
    game = game.replace(
      /(<link rel="stylesheet"[^>]*>)/,
      `$1
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "name": "Archiv des Vergessens",
    "description": "Atmosphärisches Idle-RPG über den Mneme-Bund — frühe Alpha.",
    "url": "https://grimoire-interactive.de/spiele/archiv-des-vergessens",
    "image": "https://grimoire-interactive.de/assets/og-archiv.jpg",
    "genre": ["Idle", "RPG"],
    "gamePlatform": "PC",
    "operatingSystem": "Windows",
    "applicationCategory": "Game",
    "author": {
      "@type": "Organization",
      "name": "Grimoire Interactive",
      "url": "https://grimoire-interactive.de/"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR",
      "availability": "https://schema.org/OnlineOnly",
      "url": "https://github.com/Trobikus/archiv-des-vergessens-2/releases/latest"
    }
  }
  </script>`
    );
  }

  // Support link in page-links
  if (!game.includes("../support.html")) {
    game = game.replace(
      `<a class="release-link" href="../faq.html">FAQ →</a>`,
      `<a class="release-link" href="../faq.html">FAQ →</a>
            <a class="release-link" href="../support.html">Support →</a>`
    );
  }

  // Gallery picture/webp — replace img src patterns inside gallery
  game = game.replace(
    /src="\.\.\/assets\/gallery\/(shot-[a-z0-9-]+)\.png"/g,
    'src="../assets/gallery/$1.png" data-webp="../assets/derived/$1.webp"'
  );

  // Cover on game page if any
  game = game.replace(
    /src="\.\.\/assets\/archiv-cover\.png"/g,
    'src="../assets/archiv-cover.png"'
  );

  await fs.writeFile(path.join(site, "spiele/archiv-des-vergessens.html"), game, "utf8");

  // FAQ: add support link in page-links if missing
  let faq = await fs.readFile(path.join(site, "faq.html"), "utf8");
  faq = replaceFooter(faq, 0, "faq");
  if (!faq.includes("support.html")) {
    faq = faq.replace(
      `<a class="release-link" href="kontakt.html">Kontakt →</a>`,
      `<a class="release-link" href="support.html">Support →</a>
          <a class="release-link" href="kontakt.html">Kontakt →</a>`
    );
  }
  // Ensure RSS not needed; ensure og image
  faq = faq.replace(/assets\/studio-mark\.png/g, "assets/og-studio.jpg");
  faq = bumpAssets(faq, 0);
  faq = replaceIcons(faq, 0);
  await fs.writeFile(path.join(site, "faq.html"), faq, "utf8");

  console.log("all patches done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
