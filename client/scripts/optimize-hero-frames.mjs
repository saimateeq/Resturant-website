import { readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC_DIR = path.join(ROOT, 'src/assets/animation');
const OUT_DIR = path.join(ROOT, 'src/assets/animation-optimized');
const MAX_WIDTH = 1920; // ceiling only — source is native 1280x720, so this doesn't upscale today
const WEBP_QUALITY = 84;

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const files = (await readdir(SRC_DIR))
    .filter((f) => /^frame_\d+\.(jpe?g|png)$/i.test(f))
    .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));

  if (files.length === 0) {
    console.error(`No frame_*.(jpg|png) files found in ${SRC_DIR}`);
    process.exit(1);
  }

  console.log(`Optimizing ${files.length} frames -> ${OUT_DIR} (webp, q${WEBP_QUALITY}, max width ${MAX_WIDTH}px)`);

  let done = 0;
  for (const file of files) {
    const num = file.match(/\d+/)[0];
    const outFile = path.join(OUT_DIR, `frame_${num}.webp`);
    await sharp(path.join(SRC_DIR, file))
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY, effort: 6 })
      .toFile(outFile);
    done += 1;
    if (done % 25 === 0 || done === files.length) {
      process.stdout.write(`  ${done}/${files.length}\n`);
    }
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
