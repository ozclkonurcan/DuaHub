/**
 * Uygulama ikon seti üretimi — tasarım token'larıyla (gece yarısı + zümrüt + altın).
 * Marka işareti: zümrüt hilal + altın kandil yıldızı.
 *
 * Çalıştırma: npx tsx scripts/generate-icons.ts
 * Çıktılar: assets/images/{icon, android-icon-*, splash-icon, favicon}.png
 */
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const OUT = join(__dirname, "..", "assets", "images");

const MIDNIGHT = "#0A101C";
const MIDNIGHT_SOFT = "#16233C";
const EMERALD = "#20C58F";
const EMERALD_DEEP = "#0D9467";
const GOLD = "#E3B341";

/** Hilal: büyük daireden ofsetli daire maskeyle oyulur (kesik şeffaf kalır). */
function crescentSvg(opts: {
  size: number;
  fill: string;
  withStar?: boolean;
  background?: string;
  gradient?: boolean;
  /** İşaretin tuval içindeki oranı — Android adaptive güvenli alanı için ~0.66. */
  scale?: number;
}): string {
  const {
    size,
    fill,
    withStar = true,
    background,
    gradient = false,
    scale = 1,
  } = opts;
  const c = size / 2;
  const r = size * 0.3 * scale;
  const cutOffsetX = size * 0.115 * scale;
  const cutOffsetY = -size * 0.055 * scale;
  const starX = c + size * 0.16 * scale;
  const starY = c - size * 0.17 * scale;
  const s = size * 0.052 * scale; // yıldız yarıçapı

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="35%" cy="30%" r="90%">
      <stop offset="0%" stop-color="${MIDNIGHT_SOFT}"/>
      <stop offset="100%" stop-color="${MIDNIGHT}"/>
    </radialGradient>
    <linearGradient id="moon" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${EMERALD}"/>
      <stop offset="100%" stop-color="${EMERALD_DEEP}"/>
    </linearGradient>
    <mask id="crescent">
      <rect width="${size}" height="${size}" fill="black"/>
      <circle cx="${c - size * 0.03 * scale}" cy="${c}" r="${r}" fill="white"/>
      <circle cx="${c - size * 0.03 * scale + cutOffsetX}" cy="${c + cutOffsetY}" r="${r * 0.86}" fill="black"/>
    </mask>
  </defs>
  ${background ? `<rect width="${size}" height="${size}" fill="${background === "gradient" ? "url(#bg)" : background}"/>` : ""}
  <rect width="${size}" height="${size}" fill="${gradient ? "url(#moon)" : fill}" mask="url(#crescent)"/>
  ${
    withStar
      ? `<path fill="${GOLD}" d="M ${starX} ${starY - s} C ${starX + s * 0.22} ${starY - s * 0.22} ${starX + s * 0.22} ${starY - s * 0.22} ${starX + s} ${starY} C ${starX + s * 0.22} ${starY + s * 0.22} ${starX + s * 0.22} ${starY + s * 0.22} ${starX} ${starY + s} C ${starX - s * 0.22} ${starY + s * 0.22} ${starX - s * 0.22} ${starY + s * 0.22} ${starX - s} ${starY} C ${starX - s * 0.22} ${starY - s * 0.22} ${starX - s * 0.22} ${starY - s * 0.22} ${starX} ${starY - s} Z"/>`
      : ""
  }
</svg>`;
}

async function render(svg: string, file: string, size: number) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(join(OUT, file));
  console.log(`✔ ${file} (${size}x${size})`);
}

async function main() {
  mkdirSync(OUT, { recursive: true });

  // iOS ana ikon — opak zemin şart (Apple şeffaflık kabul etmez)
  await render(
    crescentSvg({ size: 1024, fill: EMERALD, gradient: true, background: "gradient" }),
    "icon.png",
    1024,
  );

  // Android adaptive: arka plan (opak), ön plan (şeffaf, güvenli alan ~%66),
  // monochrome (beyaz, şeffaf)
  await render(
    `<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="bg" cx="35%" cy="30%" r="90%">
        <stop offset="0%" stop-color="${MIDNIGHT_SOFT}"/>
        <stop offset="100%" stop-color="${MIDNIGHT}"/>
      </radialGradient></defs>
      <rect width="1024" height="1024" fill="url(#bg)"/>
    </svg>`,
    "android-icon-background.png",
    1024,
  );
  await render(
    crescentSvg({ size: 1024, fill: EMERALD, gradient: true, scale: 0.62 }),
    "android-icon-foreground.png",
    1024,
  );
  await render(
    crescentSvg({ size: 1024, fill: "#FFFFFF", withStar: false, scale: 0.62 }),
    "android-icon-monochrome.png",
    1024,
  );

  // Splash işareti (şeffaf zemin — plugin arka plan rengini kendisi basıyor)
  await render(crescentSvg({ size: 512, fill: EMERALD, gradient: true }), "splash-icon.png", 512);

  // Web favicon
  await render(
    crescentSvg({ size: 128, fill: EMERALD, background: MIDNIGHT }),
    "favicon.png",
    48,
  );

  console.log("✔ İkon seti hazır:", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
