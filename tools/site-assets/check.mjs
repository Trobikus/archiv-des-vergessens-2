import fs from "node:fs";
const i = fs.readFileSync("site/index.html", "utf8");
console.log("title:", /<title>(.*?)<\/title>/.exec(i)?.[1]);
console.log("ueber link:", i.includes("Mehr über das Studio"));
console.log("og:site_name:", i.includes("og:site_name"));
console.log("favicon-32:", i.includes("favicon-32"));
console.log("picture:", i.includes("<picture>"));
console.log("preload:", i.includes("rel=\"preload\""));
const d = fs.readFileSync("site/datenschutz.html", "utf8");
console.log("analytics:", d.includes("Web Analytics"));
console.log("schrift:", d.includes("Schriftarten"));
const g = fs.readFileSync("site/spiele/archiv-des-vergessens.html", "utf8");
console.log("VideoGame:", g.includes("VideoGame"));
console.log("data-webp:", (g.match(/data-webp/g) || []).length);
console.log("support:", g.includes("support.html"));
const f = fs.readFileSync("site/faq.html", "utf8");
console.log("faq footer ueber:", f.includes("ueber.html"));
console.log("faq icons complete:", f.includes("favicon-32") && f.includes("manifest"));
const g2 = fs.readFileSync("site/spiele/archiv-des-vergessens.html", "utf8");
console.log("gallery pictures:", (g2.match(/<picture>/g) || []).length);
console.log("lightbox webp:", g2.includes("derived/shot-"));
const c = fs.readFileSync("site/styles.css", "utf8");
console.log("hero webp css:", c.includes("derived/hero.webp"));
console.log("about-doc css:", c.includes(".about-doc"));
const h = fs.readFileSync("site/_headers", "utf8");
console.log("CSP:", h.includes("Content-Security-Policy"));
console.log("insights:", h.includes("cloudflareinsights"));
console.log("pages:", [
  "ueber.html",
  "presse.html",
  "support.html",
  "404.html",
  "feed.xml",
  "site.webmanifest",
  "devlog/alpha-oeffentlich.html",
].every((p) => fs.existsSync("site/" + p)));
