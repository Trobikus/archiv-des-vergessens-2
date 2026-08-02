/**
 * Generate favicons, OG share images, WebP derivatives, and press-kit copies.
 * Run: node tools/site-assets/build-assets.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const assets = path.join(root, "site/assets");
const presse = path.join(assets, "presse");
const derived = path.join(assets, "derived");

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function writePng(pipeline, outPath) {
  await pipeline.png({ compressionLevel: 9, quality: 90 }).toFile(outPath);
  console.log("wrote", path.relative(root, outPath));
}

async function writeWebp(input, outPath, width) {
  let img = sharp(input).rotate();
  if (width) img = img.resize({ width, withoutEnlargement: true });
  await img.webp({ quality: 78 }).toFile(outPath);
  console.log("wrote", path.relative(root, outPath));
}

async function main() {
  await ensureDir(presse);
  await ensureDir(derived);
  await ensureDir(path.join(assets, "gallery"));

  const icon = path.join(assets, "studio-icon.png");
  const mark = path.join(assets, "studio-mark.png");
  const banner = path.join(assets, "game-banner-archiv.png");
  const cover = path.join(assets, "archiv-cover.png");
  const hero = path.join(assets, "hero.png");
  const keyart = path.join(assets, "keyart.png");

  // Favicons
  const sizes = [16, 32, 48, 180, 192, 512];
  const icoBuffers = [];
  for (const size of sizes) {
    const buf = await sharp(icon)
      .resize(size, size, { fit: "cover" })
      .png()
      .toBuffer();
    if (size === 16 || size === 32 || size === 48) icoBuffers.push(buf);
    const name =
      size === 180
        ? "apple-touch-icon.png"
        : size === 192
          ? "icon-192.png"
          : size === 512
            ? "icon-512.png"
            : `favicon-${size}.png`;
    await fs.writeFile(path.join(assets, name), buf);
    console.log("wrote", `site/assets/${name}`);
  }
  await fs.writeFile(path.join(assets, "favicon.ico"), await pngToIco(icoBuffers));
  console.log("wrote site/assets/favicon.ico");

  // Press kit PNG copies (optimized)
  await writePng(sharp(icon).resize(1024, 1024), path.join(presse, "grimoire-icon-1024.png"));
  await writePng(sharp(mark).resize({ width: 1600, withoutEnlargement: true }), path.join(presse, "grimoire-mark.png"));
  await writePng(sharp(cover).resize({ width: 900, withoutEnlargement: true }), path.join(presse, "archiv-cover.png"));
  await writePng(sharp(banner).resize({ width: 1600, withoutEnlargement: true }), path.join(presse, "archiv-key-banner.png"));
  await writePng(sharp(keyart).resize({ width: 1600, withoutEnlargement: true }), path.join(presse, "archiv-keyart.png"));

  // OG 1200×630 — studio
  {
    const bg = await sharp({
      create: {
        width: 1200,
        height: 630,
        channels: 3,
        background: { r: 5, g: 5, b: 7 },
      },
    })
      .png()
      .toBuffer();

    const markBuf = await sharp(mark)
      .resize({ width: 720, withoutEnlargement: true })
      .png()
      .toBuffer();
    const markMeta = await sharp(markBuf).metadata();
    const left = Math.round((1200 - markMeta.width) / 2);
    const top = Math.round((630 - markMeta.height) / 2);

    await sharp(bg)
      .composite([
        {
          input: Buffer.from(
            `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="g" cx="50%" cy="35%" r="60%">
                  <stop offset="0%" stop-color="#c5a059" stop-opacity="0.18"/>
                  <stop offset="100%" stop-color="#050507" stop-opacity="0"/>
                </radialGradient>
              </defs>
              <rect width="1200" height="630" fill="url(#g)"/>
              <rect x="24" y="24" width="1152" height="582" fill="none" stroke="#c5a059" stroke-opacity="0.28" stroke-width="1"/>
            </svg>`
          ),
          top: 0,
          left: 0,
        },
        { input: markBuf, left, top },
      ])
      .jpeg({ quality: 86, mozjpeg: true })
      .toFile(path.join(assets, "og-studio.jpg"));
    console.log("wrote site/assets/og-studio.jpg");
  }

  // OG game — banner cover crop
  await sharp(banner)
    .resize(1200, 630, { fit: "cover", position: "centre" })
    .composite([
      {
        input: Buffer.from(
          `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#050507" stop-opacity="0.25"/>
                <stop offset="55%" stop-color="#050507" stop-opacity="0.15"/>
                <stop offset="100%" stop-color="#050507" stop-opacity="0.72"/>
              </linearGradient>
            </defs>
            <rect width="1200" height="630" fill="url(#v)"/>
            <rect x="24" y="24" width="1152" height="582" fill="none" stroke="#c5a059" stroke-opacity="0.35" stroke-width="1"/>
            <text x="60" y="540" fill="#e9e2d0" font-family="Georgia, serif" font-size="42" letter-spacing="4">ARCHIV DES VERGESSENS</text>
            <text x="60" y="578" fill="#c5a059" font-family="Georgia, serif" font-size="20" letter-spacing="6">FRÜHE ALPHA · GRIMOIRE INTERACTIVE</text>
          </svg>`
        ),
        top: 0,
        left: 0,
      },
    ])
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(path.join(assets, "og-archiv.jpg"));
  console.log("wrote site/assets/og-archiv.jpg");

  // WebP derivatives for performance
  await writeWebp(hero, path.join(derived, "hero.webp"), 1920);
  await writeWebp(cover, path.join(derived, "archiv-cover.webp"), 900);
  await writeWebp(banner, path.join(derived, "game-banner-archiv.webp"), 1600);
  await writeWebp(mark, path.join(derived, "studio-mark.webp"), 1200);
  await writeWebp(keyart, path.join(derived, "keyart.webp"), 1400);

  const galleryDir = path.join(assets, "gallery");
  try {
    const shots = (await fs.readdir(galleryDir)).filter((f) => /\.png$/i.test(f));
    for (const shot of shots) {
      const base = shot.replace(/\.png$/i, "");
      await writeWebp(path.join(galleryDir, shot), path.join(derived, `${base}.webp`), 1280);
    }
  } catch {
    console.log("no gallery pngs to convert");
  }

  console.log("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
