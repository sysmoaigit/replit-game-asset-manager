import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(here, "..", "public");
const iconsDir = resolve(publicDir, "icons");

async function out(name, buf) {
  const p = resolve(iconsDir, name);
  await writeFile(p, buf);
  console.log("wrote", name);
}

async function main() {
  await mkdir(iconsDir, { recursive: true });

  const sourceMain = resolve(publicDir, "app-icon.svg");
  const sourceMaskable = resolve(publicDir, "app-icon-maskable.svg");

  const sizes = [
    { name: "icon-192.png", size: 192, src: sourceMain },
    { name: "icon-512.png", size: 512, src: sourceMain },
    { name: "icon-maskable-192.png", size: 192, src: sourceMaskable },
    { name: "icon-maskable-512.png", size: 512, src: sourceMaskable },
    { name: "apple-touch-icon.png", size: 180, src: sourceMain },
    { name: "apple-touch-icon-167.png", size: 167, src: sourceMain },
    { name: "apple-touch-icon-152.png", size: 152, src: sourceMain },
    { name: "favicon-32.png", size: 32, src: sourceMain },
    { name: "favicon-16.png", size: 16, src: sourceMain },
  ];

  for (const s of sizes) {
    const buf = await sharp(s.src, { density: 384 })
      .resize(s.size, s.size, { fit: "cover" })
      .png({ compressionLevel: 9 })
      .toBuffer();
    await out(s.name, buf);
  }

  // iOS splash screens (a few common sizes; iOS will pick closest)
  const splashes = [
    { name: "splash-2048x2732.png", w: 2048, h: 2732 }, // 12.9" iPad Pro
    { name: "splash-1668x2388.png", w: 1668, h: 2388 }, // 11" iPad Pro
    { name: "splash-1536x2048.png", w: 1536, h: 2048 }, // iPad
    { name: "splash-1284x2778.png", w: 1284, h: 2778 }, // iPhone Pro Max
    { name: "splash-1170x2532.png", w: 1170, h: 2532 }, // iPhone Pro
    { name: "splash-1125x2436.png", w: 1125, h: 2436 }, // iPhone X
    { name: "splash-828x1792.png",  w: 828,  h: 1792 }, // iPhone XR
    { name: "splash-750x1334.png",  w: 750,  h: 1334 }, // iPhone 8
    { name: "splash-1080x1920.png", w: 1080, h: 1920 }, // Android baseline
  ];

  const iconForSplash = await sharp(sourceMain, { density: 768 })
    .resize(512, 512)
    .png()
    .toBuffer();

  for (const sp of splashes) {
    const bg = sharp({
      create: {
        width: sp.w,
        height: sp.h,
        channels: 4,
        background: { r: 10, g: 6, b: 4, alpha: 1 },
      },
    });
    const composed = await bg
      .composite([{ input: iconForSplash, gravity: "center" }])
      .png({ compressionLevel: 9 })
      .toBuffer();
    await out(sp.name, composed);
  }

  console.log("✔ icons & splashes generated");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
