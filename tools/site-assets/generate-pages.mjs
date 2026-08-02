/**
 * Generate / refresh shared chrome across the static studio site.
 * Creates new pages and patches existing ones for favicons, OG, footer, cache bust.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const site = path.resolve(__dirname, "../../site");
const V = "20260802i";

const FOOTER_LINKS = [
  { href: "spiele.html", label: "Spiele", id: "spiele" },
  { href: "devlog.html", label: "Devlog", id: "devlog" },
  { href: "roadmap.html", label: "Roadmap", id: "roadmap" },
  { href: "faq.html", label: "FAQ", id: "faq" },
  { href: "ueber.html", label: "Über", id: "ueber" },
  { href: "presse.html", label: "Presse", id: "presse" },
  { href: "support.html", label: "Support", id: "support" },
  { href: "kontakt.html", label: "Kontakt", id: "kontakt" },
];

function assetPrefix(depth) {
  return depth === 0 ? "assets/" : "../assets/";
}
function pagePrefix(depth) {
  return depth === 0 ? "" : "../";
}

function icons(depth) {
  const a = assetPrefix(depth);
  const p = pagePrefix(depth);
  return `  <link rel="icon" href="${a}favicon.ico" sizes="any" />
  <link rel="icon" href="${a}favicon-32.png" type="image/png" sizes="32x32" />
  <link rel="apple-touch-icon" href="${a}apple-touch-icon.png" sizes="180x180" />
  <link rel="manifest" href="${p}site.webmanifest" />`;
}

function nav(depth, current) {
  const p = pagePrefix(depth);
  const items = [
    { href: "index.html", label: "Studio", id: "studio" },
    { href: "spiele.html", label: "Spiele", id: "spiele" },
    { href: "devlog.html", label: "Devlog", id: "devlog" },
    { href: "kontakt.html", label: "Kontakt", id: "kontakt" },
  ];
  return items
    .map((it) => {
      const cur = it.id === current ? ' aria-current="page"' : "";
      return `          <li><a href="${p}${it.href}"${cur}>${it.label}</a></li>`;
    })
    .join("\n");
}

function header(depth, current) {
  const p = pagePrefix(depth);
  const a = assetPrefix(depth);
  return `  <header class="site-nav" data-site-nav>
    <div class="wrap">
      <a class="brand-mark" href="${p}index.html" aria-label="Grimoire Interactive — Startseite">
        <img class="brand-mark__logo" src="${a}studio-icon.png" alt="" width="30" height="30" decoding="async" />
        <span>Grimoire</span>
      </a>
      <button class="nav-toggle" data-nav-toggle aria-label="Navigation umschalten" aria-expanded="false" aria-controls="primary-nav">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
      </button>
      <nav aria-label="Hauptnavigation">
        <ul class="nav-links" id="primary-nav">
${nav(depth, current)}
        </ul>
      </nav>
    </div>
  </header>`;
}

function footer(depth, current) {
  const p = pagePrefix(depth);
  const studio = FOOTER_LINKS.map((it) => {
    const cur = it.id === current ? ' aria-current="page"' : "";
    return `        <a href="${p}${it.href}"${cur}>${it.label}</a>`;
  }).join("\n");
  const legalCurrent = (id) => (id === current ? ' aria-current="page"' : "");
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
        <a href="${p}impressum.html"${legalCurrent("impressum")}>Impressum</a>
        <a href="${p}datenschutz.html"${legalCurrent("datenschutz")}>Datenschutz</a>
      </nav>
    </div>
  </footer>`;
}

function ogBlock({ title, description, url, image, type = "website" }) {
  return `  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:type" content="${type}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:locale" content="de_DE" />
  <meta property="og:site_name" content="Grimoire Interactive" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />`;
}

function shell({
  depth,
  current,
  title,
  description,
  canonical,
  ogImage,
  ogType,
  robots,
  headExtra,
  main,
  rss,
}) {
  const p = pagePrefix(depth);
  const a = assetPrefix(depth);
  const robotsLine = robots ? `  <meta name="robots" content="${robots}" />\n` : "";
  const rssLine = rss
    ? `  <link rel="alternate" type="application/rss+xml" title="Grimoire Interactive Devlog" href="${p}feed.xml" />\n`
    : "";
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
${robotsLine}  <meta name="theme-color" content="#050507" />
  <link rel="canonical" href="${canonical}" />
${ogBlock({
  title,
  description,
  url: canonical,
  image: ogImage,
  type: ogType || "website",
})}
${icons(depth)}
${rssLine}  <link rel="stylesheet" href="${p}styles.css?v=${V}" />
${headExtra || ""}</head>
<body>
  <a class="skip-link" href="#main">Zum Inhalt springen</a>

${header(depth, current)}

  <main id="main">
${main}
  </main>

${footer(depth, current)}

  <script src="${p}main.js?v=${V}" defer></script>
</body>
</html>
`;
}

const OG_STUDIO = "https://grimoire-interactive.de/assets/og-studio.jpg";
const OG_ARCHIV = "https://grimoire-interactive.de/assets/og-archiv.jpg";

const DEVLOG_POSTS = [
  {
    slug: "alpha-oeffentlich",
    date: "2026-08-02",
    dateLabel: "02. August 2026",
    meta: "02. August 2026 · Archiv des Vergessens",
    title: "Die Alpha ist öffentlich",
    description:
      "Die frühe Alpha von Archiv des Vergessens ist öffentlich — unfertig, fehleranfällig und bewusst so kommuniziert.",
    body: `
          <p>
            Ab sofort liegt eine frühe Alpha zum Download bereit. Das ist kein Soft-Launch und
            kein verstecktes Early Access — es ist genau der Stand der Arbeit, den ich jetzt habe.
          </p>
          <p>
            Erwartet Unfertiges: fehlende Inhalte, Systeme im Umbau, Balancing im Fluss und Fehler.
            Speicherstände können sich mit Updates ändern. Wer mitspielt, begleitet die Entwicklung,
            nicht den Launch eines fertigen Produkts.
          </p>
          <p>
            Feedback ist willkommen über das
            <a href="../kontakt.html">Kontaktformular</a>.
            Die grobe Richtung steht auf der
            <a href="../roadmap.html">Roadmap</a> —
            ohne Datumsversprechen. Download und Einblicke:
            <a href="../spiele/archiv-des-vergessens.html">Archiv des Vergessens</a>.
          </p>`,
  },
  {
    slug: "launcher",
    date: "2026-07-15",
    dateLabel: "Juli 2026",
    meta: "Juli 2026 · Technik",
    title: "Launcher, Siegel-Portal, erste Builds",
    description:
      "Der portable Windows-Launcher (Siegel-Portal) holt die Alpha von GitHub Releases — ohne Store-Account.",
    body: `
          <p>
            Der portable Windows-Launcher („Siegel-Portal“) holt die aktuelle Alpha von den
            GitHub Releases. Ziel war ein schlanker Weg zum Spielen — ohne Store-Account,
            ohne Installations-Theater.
          </p>
          <p>
            Das bedeutet auch: Updates können abrupt wirken, Signierung und Verteilwege werden
            noch verbessert, und Edge-Cases (Firewall, Antivirus-Fehlalarme, alte Windows-Stände)
            tauchen erst jetzt im echten Feld auf.
          </p>
          <p>
            Wer den Launcher nutzt, sollte die
            <a href="https://github.com/Trobikus/archiv-des-vergessens-2/releases/latest">Release-Seite</a>
            im Blick behalten — dort liegen Changelog und Dateien offen.
            Tipps bei Problemen: <a href="../support.html">Support</a>.
          </p>`,
  },
  {
    slug: "stand",
    date: "2026-06-15",
    dateLabel: "Juni 2026",
    meta: "Juni 2026 · Spielstand",
    title: "Was schon trägt — und was noch bricht",
    description:
      "Ehrlicher Stand der Alpha: Idle-Kern und Atmosphäre tragen — Inhaltstiefe und Feinschliff fehlen noch.",
    body: `
          <p>
            <strong>Trägt bereits:</strong> die Kernschleife aus Idle-Fortschritt und Archiv-Atmosphäre,
            erste Systeme rund um den Mneme-Bund, Story-/Kampf-Ansätze, ein dunkles UI-Gerüst und
            der Studio-Intro-Moment.
          </p>
          <p>
            <strong>Bricht oder fehlt noch:</strong> Inhaltstiefe, Feinschliff, stabile Progression
            über lange Zeiträume, Onboarding, Audio-Polishing, viele QoL-Details und alles, was ein
            „fertiges“ Spiel ausmacht. Manches sieht fertiger aus, als es unter der Haube ist —
            genau deshalb steht die Alpha-Kennzeichnung so deutlich.
          </p>
          <p>
            Einblicke zum aktuellen Look liegen auf der
            <a href="../spiele/archiv-des-vergessens.html#einblicke">Game-Seite unter Einblicke</a>.
          </p>`,
  },
  {
    slug: "transparenz",
    date: "2026-05-15",
    dateLabel: "Mai 2026",
    meta: "Mai 2026 · Studio",
    title: "Warum wir ohne Marketing-Nebel starten",
    description:
      "Warum Grimoire Interactive mit sichtbarer Arbeit und klaren Grenzen startet — ohne Fake-Featurelisten.",
    body: `
          <p>
            Viele Studios verkaufen Hoffnung vor Substanz. Als Ein-Personen-Studio mache ich das
            Gegenteil: sichtbare Arbeit, klare Grenzen, keine Fake-Featurelisten.
          </p>
          <p>
            Transparenz heißt nicht, jedes interne Detail auszubreiten. Sie heißt: ehrlich sagen,
            wo das Spiel steht — und wo nicht. Wenn etwas verschoben, gestrichen oder umgebaut wird,
            soll das hier nachvollziehbar bleiben.
          </p>
          <p>
            Der Devlog bleibt deshalb kurz und konkret. Lieber ein nüchterner Absatz als eine
            Hochglanz-Ankündigung ohne Boden darunter. Mehr zum Studio:
            <a href="../ueber.html">Über Grimoire Interactive</a>.
          </p>`,
  },
];

async function write(rel, content) {
  const full = path.join(site, rel);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, content, "utf8");
  console.log("wrote", rel);
}

async function main() {
  // --- static ops files ---
  await write(
    "site.webmanifest",
    JSON.stringify(
      {
        name: "Grimoire Interactive",
        short_name: "Grimoire",
        description: "Independent Game Studio — atmosphärische Welten aus Erinnerung und Mythos.",
        start_url: "/",
        display: "standalone",
        background_color: "#050507",
        theme_color: "#050507",
        lang: "de",
        icons: [
          { src: "/assets/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/assets/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/assets/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
        ],
      },
      null,
      2
    ) + "\n"
  );

  await write(
    "sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://grimoire-interactive.de/</loc><changefreq>weekly</changefreq><priority>1</priority></url>
  <url><loc>https://grimoire-interactive.de/spiele</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://grimoire-interactive.de/spiele/archiv-des-vergessens</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://grimoire-interactive.de/devlog</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>
${DEVLOG_POSTS.map(
  (p) =>
    `  <url><loc>https://grimoire-interactive.de/devlog/${p.slug}</loc><lastmod>${p.date}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`
).join("\n")}
  <url><loc>https://grimoire-interactive.de/roadmap</loc><changefreq>weekly</changefreq><priority>0.75</priority></url>
  <url><loc>https://grimoire-interactive.de/faq</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>https://grimoire-interactive.de/ueber</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>https://grimoire-interactive.de/presse</loc><changefreq>monthly</changefreq><priority>0.65</priority></url>
  <url><loc>https://grimoire-interactive.de/support</loc><changefreq>monthly</changefreq><priority>0.65</priority></url>
  <url><loc>https://grimoire-interactive.de/kontakt</loc><changefreq>yearly</changefreq><priority>0.6</priority></url>
</urlset>
`
  );

  const rssItems = DEVLOG_POSTS.map(
    (p) => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>https://grimoire-interactive.de/devlog/${p.slug}</link>
      <guid isPermaLink="true">https://grimoire-interactive.de/devlog/${p.slug}</guid>
      <pubDate>${toRfc822(p.date)}</pubDate>
      <description>${escapeXml(p.description)}</description>
    </item>`
  ).join("\n");

  await write(
    "feed.xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Grimoire Interactive — Devlog</title>
    <link>https://grimoire-interactive.de/devlog</link>
    <atom:link href="https://grimoire-interactive.de/feed.xml" rel="self" type="application/rss+xml"/>
    <description>Ehrliche Entwicklungsnotizen zu Archiv des Vergessens und dem Studio.</description>
    <language>de-de</language>
    <lastBuildDate>${toRfc822(DEVLOG_POSTS[0].date)}</lastBuildDate>
${rssItems}
  </channel>
</rss>
`
  );

  // Fix redirects (no hash rules — not supported)
  await write(
    "_redirects",
    `# Extensionless canonical URLs
/index.html           /                       301
/spiele.html          /spiele                 301
/devlog.html          /devlog                 301
/roadmap.html         /roadmap                301
/faq.html             /faq                    301
/kontakt.html         /kontakt                301
/ueber.html           /ueber                  301
/presse.html          /presse                 301
/support.html         /support                301
/impressum.html       /impressum              301
/datenschutz.html     /datenschutz            301
/spiele/archiv-des-vergessens.html  /spiele/archiv-des-vergessens  301
/devlog/alpha-oeffentlich.html  /devlog/alpha-oeffentlich  301
/devlog/launcher.html           /devlog/launcher           301
/devlog/stand.html              /devlog/stand              301
/devlog/transparenz.html        /devlog/transparenz        301
`
  );

  // --- 404 ---
  await write(
    "404.html",
    shell({
      depth: 0,
      current: "",
      title: "Seite nicht gefunden — Grimoire Interactive",
      description: "Die angeforderte Seite existiert nicht oder wurde verschoben.",
      canonical: "https://grimoire-interactive.de/404",
      ogImage: OG_STUDIO,
      robots: "noindex,follow",
      main: `    <header class="page-head">
      <div class="wrap">
        <p class="eyebrow" data-rise style="justify-content:center">404</p>
        <h1 data-rise data-rise-delay="1">Siegel nicht gefunden</h1>
        <p class="lede" data-rise data-rise-delay="2">
          Diese Seite gibt es hier nicht — vielleicht wurde sie verschoben oder nie versiegelt.
        </p>
        <div class="page-links" data-rise data-rise-delay="3" style="justify-content:center">
          <a class="btn btn-primary" href="index.html">Zur Startseite <span class="arrow" aria-hidden="true">→</span></a>
          <a class="btn btn-ghost" href="spiele.html">Spiele</a>
          <a class="btn btn-ghost" href="kontakt.html">Kontakt</a>
        </div>
      </div>
    </header>`,
    })
  );

  // --- Über ---
  await write(
    "ueber.html",
    shell({
      depth: 0,
      current: "ueber",
      title: "Über das Studio — Grimoire Interactive",
      description:
        "Grimoire Interactive ist das Solo-Studio von Max Jotanovic — atmosphärische Spiele aus Erinnerung und Mythos, ohne Publisher-Druck.",
      canonical: "https://grimoire-interactive.de/ueber",
      ogImage: OG_STUDIO,
      headExtra: `  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "Über Grimoire Interactive",
    "url": "https://grimoire-interactive.de/ueber",
    "mainEntity": {
      "@type": "Organization",
      "name": "Grimoire Interactive",
      "url": "https://grimoire-interactive.de/",
      "founder": {
        "@type": "Person",
        "name": "Max Jotanovic",
        "jobTitle": "Independent Game Developer",
        "url": "https://grimoire-interactive.de/ueber"
      },
      "sameAs": ["https://github.com/Trobikus"]
    }
  }
  </script>
`,
      main: `    <header class="page-head">
      <div class="wrap">
        <p class="eyebrow" data-rise style="justify-content:center">Studio</p>
        <h1 data-rise data-rise-delay="1">Über uns</h1>
        <p class="lede" data-rise data-rise-delay="2">
          Ein Ein-Personen-Studio. Kein Publisher, kein Live-Service — Handwerk im Halbdunkel.
        </p>
      </div>
    </header>

    <section class="section section--tight" aria-labelledby="about-studio">
      <div class="wrap split">
        <div class="framed framed--studio" data-rise>
          <picture>
            <source srcset="assets/derived/studio-mark.webp" type="image/webp" />
            <img
              src="assets/studio-mark.png"
              alt="Logo von Grimoire Interactive: ein leuchtendes Grimoire mit dem Studionamen darunter."
              loading="lazy"
              width="1200"
              height="900"
              decoding="async"
            />
          </picture>
        </div>
        <div>
          <p class="eyebrow" data-rise>Grimoire Interactive</p>
          <h2 id="about-studio" data-rise data-rise-delay="1">Handwerk im Halbdunkel</h2>
          <p class="lede" data-rise data-rise-delay="2">
            Hier entstehen ruhige, dichte Spiele über das Erinnern und Vergessen — von der ersten
            Zeile Code bis zum letzten Farbton des Nebels in einer Hand. Sorgfältig versiegelte
            Welten, die darauf warten, geöffnet zu werden.
          </p>
        </div>
      </div>
    </section>

    <section class="section section--tight" aria-labelledby="about-person">
      <div class="wrap about-doc" data-rise>
        <p class="eyebrow">Person</p>
        <h2 id="about-person">Max Jotanovic</h2>
        <p>
          Ich bin Solo-Entwickler hinter Grimoire Interactive, ansässig in Ratingen (Deutschland).
          Design, Code, Atmosphäre und Kommunikation liegen in einer Hand — das begrenzt Tempo und
          Scope, hält aber Ton und Verantwortung klar.
        </p>
        <p>
          Der aktuelle Fokus liegt auf
          <a href="spiele/archiv-des-vergessens.html">Archiv des Vergessens</a>:
          einem atmosphärischen Idle-RPG, das bewusst als frühe Alpha öffentlich ist. Fortschritt
          und Richtung stehen im <a href="devlog.html">Devlog</a> und auf der
          <a href="roadmap.html">Roadmap</a> — ohne Fake-Deadlines.
        </p>
        <p>
          Fragen, Feedback oder Presse-Anfragen:
          <a href="kontakt.html">Kontakt</a> ·
          <a href="mailto:kontakt@grimoire-interactive.de">kontakt@grimoire-interactive.de</a>.
          Assets für Berichterstattung: <a href="presse.html">Presse</a>.
        </p>
        <div class="page-links">
          <a class="release-link" href="spiele.html">Zu den Spielen →</a>
          <a class="release-link" href="presse.html">Presse-Kit →</a>
          <a class="release-link" href="https://github.com/Trobikus">GitHub →</a>
        </div>
      </div>
    </section>`,
    })
  );

  // --- Presse ---
  await write(
    "presse.html",
    shell({
      depth: 0,
      current: "presse",
      title: "Presse — Grimoire Interactive",
      description:
        "Presse-Kit von Grimoire Interactive: Boilerplate, Logos, Key Art und Kontakt für Berichterstattung.",
      canonical: "https://grimoire-interactive.de/presse",
      ogImage: OG_STUDIO,
      main: `    <header class="page-head">
      <div class="wrap">
        <p class="eyebrow" data-rise style="justify-content:center">Medien</p>
        <h1 data-rise data-rise-delay="1">Presse</h1>
        <p class="lede" data-rise data-rise-delay="2">
          Kurztexte, Logos und Key Art für Berichterstattung — ohne Hochglanz-Theater.
        </p>
      </div>
    </header>

    <section class="section section--tight" aria-labelledby="boilerplate">
      <div class="wrap press-doc" data-rise>
        <p class="eyebrow">Boilerplate</p>
        <h2 id="boilerplate">Grimoire Interactive</h2>
        <p>
          <strong>Grimoire Interactive</strong> ist ein unabhängiges Solo-Entwicklerstudio aus
          Deutschland. Es entwickelt atmosphärische Spiele über Erinnerung, Mythos und Bewahrung —
          aktuell den Idle-RPG-Titel <em>Archiv des Vergessens</em>, bewusst als frühe Alpha
          veröffentlicht.
        </p>
        <p>
          Studio-Website:
          <a href="https://grimoire-interactive.de/">https://grimoire-interactive.de/</a><br />
          Presse-Kontakt:
          <a href="mailto:kontakt@grimoire-interactive.de">kontakt@grimoire-interactive.de</a>
        </p>

        <h2 id="factsheet">Factsheet — Archiv des Vergessens</h2>
        <ul class="press-facts">
          <li><strong>Genre</strong> Idle / Progression-RPG, atmosphärisch</li>
          <li><strong>Plattform</strong> Windows (portable Alpha-Launcher)</li>
          <li><strong>Status</strong> Frühe Alpha — unfertig, öffentlich, transparent</li>
          <li><strong>Preis Alpha</strong> Kostenlos über GitHub Releases</li>
          <li><strong>Studio</strong> Grimoire Interactive (Solo, Max Jotanovic)</li>
          <li><strong>Sprache</strong> Deutsch (UI/Website); weitere Sprachen später möglich</li>
          <li><strong>Download</strong> <a href="spiele/archiv-des-vergessens.html">Spielseite</a> · <a href="https://github.com/Trobikus/archiv-des-vergessens-2/releases/latest">Releases</a></li>
        </ul>

        <h2 id="assets">Downloadbare Assets</h2>
        <p class="press-note">PNG, frei für redaktionelle Berichterstattung mit Quellenangabe „Grimoire Interactive“.</p>
        <ul class="press-assets">
          <li><a href="assets/presse/grimoire-mark.png" download>Studio-Logo (Mark)</a></li>
          <li><a href="assets/presse/grimoire-icon-1024.png" download>Studio-Icon 1024×1024</a></li>
          <li><a href="assets/presse/archiv-cover.png" download>Cover — Archiv des Vergessens</a></li>
          <li><a href="assets/presse/archiv-key-banner.png" download>Key Banner</a></li>
          <li><a href="assets/presse/archiv-keyart.png" download>Key Art</a></li>
          <li><a href="assets/og-studio.jpg" download>Share-Bild Studio (1200×630)</a></li>
          <li><a href="assets/og-archiv.jpg" download>Share-Bild Spiel (1200×630)</a></li>
        </ul>

        <div class="page-links">
          <a class="release-link" href="kontakt.html">Presse-Anfrage senden →</a>
          <a class="release-link" href="spiele/archiv-des-vergessens.html">Zur Alpha →</a>
          <a class="release-link" href="ueber.html">Über das Studio →</a>
        </div>
      </div>
    </section>`,
    })
  );

  // --- Support ---
  await write(
    "support.html",
    shell({
      depth: 0,
      current: "support",
      title: "Support — Grimoire Interactive",
      description:
        "Hilfe zur Alpha von Archiv des Vergessens: Download, Launcher, Antivirus und Feedback-Weg.",
      canonical: "https://grimoire-interactive.de/support",
      ogImage: OG_ARCHIV,
      main: `    <header class="page-head">
      <div class="wrap">
        <p class="eyebrow" data-rise style="justify-content:center">Hilfe</p>
        <h1 data-rise data-rise-delay="1">Support</h1>
        <p class="lede" data-rise data-rise-delay="2">
          Kurze Hinweise zur Alpha — und der Weg zu uns, wenn etwas hakt.
        </p>
      </div>
    </header>

    <section class="section section--tight" aria-labelledby="support-title">
      <div class="wrap support-doc">
        <h2 id="support-title" class="visually-hidden">Support-Themen</h2>

        <div class="faq-list" data-rise>
          <details class="faq-item" open>
            <summary>Download &amp; Start</summary>
            <div class="faq-item__body">
              <p>
                Lade den Windows-Launcher von der
                <a href="spiele/archiv-des-vergessens.html">Spielseite</a>
                oder der
                <a href="https://github.com/Trobikus/archiv-des-vergessens-2/releases/latest">Release-Seite</a>.
                Die Alpha ist portabel: entpacken bzw. starten, ohne klassischen Store-Installer.
              </p>
            </div>
          </details>
          <details class="faq-item">
            <summary>Windows meldet SmartScreen oder Antivirus</summary>
            <div class="faq-item__body">
              <p>
                Frühe Builds können von SmartScreen oder Antivirus als unbekannt eingestuft werden —
                besonders bei neuen Signaturen oder kleinen Vertriebszahlen. Prüfe, ob die Datei
                von der offiziellen GitHub-Release-Seite stammt. Wenn du unsicher bist: nicht starten
                und kurz über den <a href="kontakt.html">Kontakt</a> nachfragen.
              </p>
            </div>
          </details>
          <details class="faq-item">
            <summary>Launcher findet kein Update / Start schlägt fehl</summary>
            <div class="faq-item__body">
              <p>
                Firewall oder Proxy können den Download blockieren. Versuche es erneut, prüfe die
                Release-Seite auf eine neuere Datei, und notiere die genaue Fehlermeldung fürs
                Feedback. Die Alpha ist bewusst unfertig — Abstürze und Kanten sind in dieser Phase normal.
              </p>
            </div>
          </details>
          <details class="faq-item">
            <summary>Spielstand weg oder nach Update kaputt</summary>
            <div class="faq-item__body">
              <p>
                In der frühen Alpha sind Speicherstände nicht garantiert. Updates können Systeme
                ändern. Das ist Teil der transparenten Alpha — Details in der
                <a href="faq.html">FAQ</a>.
              </p>
            </div>
          </details>
          <details class="faq-item">
            <summary>Feedback oder Bug melden</summary>
            <div class="faq-item__body">
              <p>
                Am hilfreichsten: Was hast du getan, was ist passiert, was hast du erwartet?
                Optional: Windows-Version und ob der Launcher oder das Spiel betroffen ist.
                <a href="kontakt.html">Kontaktformular</a> oder
                <a href="mailto:kontakt@grimoire-interactive.de">kontakt@grimoire-interactive.de</a>.
              </p>
            </div>
          </details>
        </div>

        <div class="page-links" data-rise>
          <a class="release-link" href="faq.html">Zur FAQ →</a>
          <a class="release-link" href="kontakt.html">Kontakt →</a>
          <a class="release-link" href="spiele/archiv-des-vergessens.html">Zur Alpha →</a>
        </div>
      </div>
    </section>`,
    })
  );

  // --- Devlog index ---
  const listItems = DEVLOG_POSTS.map(
    (p) => `          <li>
            <a href="devlog/${p.slug}.html">
              <span class="devlog-list__date">${p.dateLabel}</span>
              <span class="devlog-list__title">${p.title}</span>
              <span class="devlog-list__more">Lesen →</span>
            </a>
          </li>`
  ).join("\n");

  await write(
    "devlog.html",
    shell({
      depth: 0,
      current: "devlog",
      title: "Devlog — Grimoire Interactive",
      description:
        "Devlog von Grimoire Interactive — ehrliche Einblicke in die frühe Alpha von Archiv des Vergessens.",
      canonical: "https://grimoire-interactive.de/devlog",
      ogImage: OG_STUDIO,
      rss: true,
      main: `    <header class="page-head">
      <div class="wrap">
        <p class="eyebrow" data-rise style="justify-content:center">Arbeit sichtbar</p>
        <h1 data-rise data-rise-delay="1">Devlog</h1>
        <p class="lede" data-rise data-rise-delay="2">
          Kurze, ehrliche Notizen zur Entwicklung — was steht, was fehlt, was als Nächstes kommt.
          Keine Launch-Versprechen, keine Hochglanz-Roadshow.
          <a href="feed.xml">RSS-Feed</a>
        </p>
      </div>
    </header>

    <section class="section section--tight" aria-label="Devlog-Einträge">
      <div class="wrap" style="max-width:42rem">
        <ol class="devlog-list" data-rise>
${listItems}
        </ol>
      </div>
    </section>`,
    })
  );

  for (const p of DEVLOG_POSTS) {
    const others = DEVLOG_POSTS.filter((x) => x.slug !== p.slug)
      .slice(0, 3)
      .map((x) => `<a class="release-link" href="${x.slug}.html">${x.title} →</a>`)
      .join("\n          ");
    await write(
      `devlog/${p.slug}.html`,
      shell({
        depth: 1,
        current: "devlog",
        title: `${p.title} — Devlog — Grimoire Interactive`,
        description: p.description,
        canonical: `https://grimoire-interactive.de/devlog/${p.slug}`,
        ogImage: OG_STUDIO,
        ogType: "article",
        rss: true,
        headExtra: `  <meta property="article:published_time" content="${p.date}" />
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": ${JSON.stringify(p.title)},
    "datePublished": "${p.date}",
    "description": ${JSON.stringify(p.description)},
    "author": { "@type": "Person", "name": "Max Jotanovic" },
    "publisher": {
      "@type": "Organization",
      "name": "Grimoire Interactive",
      "logo": { "@type": "ImageObject", "url": "https://grimoire-interactive.de/assets/studio-mark.png" }
    },
    "mainEntityOfPage": "https://grimoire-interactive.de/devlog/${p.slug}"
  }
  </script>
`,
        main: `    <header class="page-head page-head--legal">
      <div class="wrap">
        <p class="eyebrow" data-rise style="justify-content:center"><a href="../devlog.html" style="color:inherit">Devlog</a></p>
        <h1 data-rise data-rise-delay="1">${p.title}</h1>
        <p class="lede" data-rise data-rise-delay="2">${p.meta}</p>
      </div>
    </header>

    <section class="section section--tight">
      <div class="wrap">
        <article class="devlog-article" data-rise style="border-top:0;padding-top:0">
${p.body}
        </article>
        <div class="page-links" data-rise>
          <a class="release-link" href="../devlog.html">Alle Einträge →</a>
          ${others}
        </div>
      </div>
    </section>`,
      })
    );
  }

  console.log("generated core new pages");
}

function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function toRfc822(isoDate) {
  // midday UTC for stable pubDate
  return new Date(`${isoDate}T12:00:00.000Z`).toUTCString();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
