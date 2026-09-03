// Convert large PNG images in src/imports/ to WebP format
// and update all import statements in src/ from .png to .webp
import sharp from 'sharp';
import { readdirSync, statSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { join, extname, basename, dirname } from 'path';

const IMPORTS_DIR = 'src/imports';
const SRC_DIR = 'src';

// Only convert PNG files larger than 50KB (small icons stay PNG)
const MIN_SIZE = 50 * 1024;

function walkPngs(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const st = statSync(fullPath);
    if (st.isDirectory()) {
      walkPngs(fullPath, files);
    } else if (extname(fullPath).toLowerCase() === '.png' && st.size > MIN_SIZE) {
      files.push({ path: fullPath, size: st.size });
    }
  }
  return files;
}

async function convertAll() {
  const pngs = walkPngs(IMPORTS_DIR);
  console.log(`Found ${pngs.length} PNG files > 50KB to convert:`);

  const converted = [];
  for (const { path: pngPath, size } of pngs) {
    const webpPath = pngPath.replace(/\.png$/i, '.webp');
    const relPath = pngPath.replace(/\\/g, '/');
    console.log(`  ${relPath} (${Math.round(size / 1024)}KB) → WebP`);

    try {
      const info = await sharp(pngPath)
        .webp({ quality: 85, effort: 4 })
        .toFile(webpPath);

      const ratio = ((1 - info.size / size) * 100).toFixed(1);
      console.log(`    → ${Math.round(info.size / 1024)}KB (saved ${ratio}%)`);
      converted.push({ pngPath, webpPath, basename: basename(pngPath) });
    } catch (e) {
      console.error(`    FAILED: ${e.message}`);
    }
  }

  // Update import statements in all .tsx/.ts files under src/
  console.log(`\nUpdating import statements in source files...`);
  let totalUpdated = 0;

  function walkSrc(dir) {
    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry);
      const st = statSync(fullPath);
      if (st.isDirectory()) {
        walkSrc(fullPath);
      } else if (/\.(tsx?|ts)$/.test(extname(fullPath))) {
        let content = readFileSync(fullPath, 'utf8');
        let modified = false;

        for (const { basename: bn } of converted) {
          const webpBasename = bn.replace(/\.png$/i, '.webp');
          // Match import paths like ../../imports/xxx.png or ../../../imports/xxx.png
          const pngImportRegex = new RegExp(
            `(imports/[^"']*?)${bn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
            'g'
          );
          if (pngImportRegex.test(content)) {
            content = content.replace(
              new RegExp(
                `(imports/[^"']*?)${bn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
                'g'
              ),
              `$1${webpBasename}`
            );
            modified = true;
          }
        }

        if (modified) {
          writeFileSync(fullPath, content, 'utf8');
          totalUpdated++;
          console.log(`  Updated: ${fullPath.replace(/\\/g, '/')}`);
        }
      }
    }
  }

  walkSrc(SRC_DIR);
  console.log(`\nDone! Converted ${converted.length} images, updated ${totalUpdated} source files.`);
}

convertAll().catch(console.error);
