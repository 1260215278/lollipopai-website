// Convert 10 generated covers to 16:9 webp for public/blog-images/
// Crops from the TOP (preserving title text) and drops the bottom strip,
// which also removes the generator watermark in the bottom-right corner.
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW = path.join(__dirname, '..', 'tmp', 'covers_raw');
const OUT = path.join(__dirname, '..', 'public', 'blog-images');
const TS = 'Pixar_style_3D_anime_render__w_2026-09-20T';

const MAP = [
  ['06-46-46', 'creator-story-taiwan-solo-daily'],
  ['06-47-14', 'creator-story-topic-selection'],
  ['06-47-32', 'creator-story-script-licensing'],
  ['06-47-50', 'creator-story-cost-breakdown'],
  ['06-48-12', 'creator-story-student-graduation'],
  ['06-48-36', 'creator-story-warm-story-formula'],
  ['06-49-02', 'creator-story-side-hustle-income'],
  ['06-49-27', 'creator-story-ai-compliance'],
  ['06-49-47', 'creator-story-tool-pipeline-comparison'],
  ['06-50-08', 'creator-story-character-bible'],
];

const TARGET_W = 1600, TARGET_H = 900;

for (const [ts, slug] of MAP) {
  const src = path.join(RAW, `${TS}${ts}.png`);
  const dst = path.join(OUT, `${slug}-new.webp`);
  const meta = await sharp(src).metadata();
  const cropH = Math.min(meta.height, Math.round(meta.width * TARGET_H / TARGET_W));
  await sharp(src)
    .extract({ left: 0, top: 0, width: meta.width, height: cropH })
    .resize(TARGET_W, TARGET_H, { fit: 'cover' })
    .webp({ quality: 82 })
    .toFile(dst);
  const out = await sharp(dst).metadata();
  console.log(`${slug}: src ${meta.width}x${meta.height} -> ${out.width}x${out.height} (${out.format})`);
}
console.log('DONE');
