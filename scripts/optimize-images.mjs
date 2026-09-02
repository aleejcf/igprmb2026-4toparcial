#!/usr/bin/env node
/**
 * FASE 5 (auditoría) — pipeline de imágenes.
 *
 * Este script NO se ejecutó como parte de la auditoría: el entorno donde
 * se hizo el resto del trabajo no tiene Node instalado, así que esto
 * queda listo para correr en tu máquina cuando tengas Node 18+.
 *
 * Qué hace, por cada imagen en imagenes/:
 *   1. Genera 3 anchos (480 / 960 / 1600px) en AVIF y WebP, más un JPEG
 *      de respaldo en el ancho original — sin tocar los originales.
 *   2. Genera una miniatura de 400px de ancho para galeria.html.
 *   3. Extrae el color dominante y lo guarda en un JSON
 *      (imagenes-dominante.json) para usarlo como background-color del
 *      contenedor mientras la imagen carga.
 *   4. Escribe un reporte (optimize-report.json) con el ahorro real.
 *
 * Uso:
 *   npm install sharp
 *   node scripts/optimize-images.mjs
 *
 * Los archivos salen a imagenes-optim/<misma-ruta-relativa>/, en paralelo
 * a imagenes/, para que puedas revisar el resultado antes de decidir
 * cómo integrarlo (sustituir imagenes/ o mantener las dos carpetas y
 * apuntar el sitio a la nueva con <picture> + srcset).
 */

import { readdir, mkdir, stat, writeFile } from "node:fs/promises";
import { join, dirname, relative, extname, basename } from "node:path";
import sharp from "sharp";

const SRC_DIR = "imagenes";
const OUT_DIR = "imagenes-optim";
const WIDTHS = [480, 960, 1600];
const THUMB_WIDTH = 400;
const VALID_EXT = new Set([".jpg", ".jpeg", ".png"]);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (VALID_EXT.has(extname(entry.name).toLowerCase())) {
      files.push(full);
    }
  }
  return files;
}

async function dominantColor(image) {
  const { dominant } = await image.stats();
  const toHex = (n) => n.toString(16).padStart(2, "0");
  return `#${toHex(dominant.r)}${toHex(dominant.g)}${toHex(dominant.b)}`;
}

async function processImage(srcPath, dominantMap, report) {
  const rel = relative(SRC_DIR, srcPath);
  const outSubdir = join(OUT_DIR, dirname(rel));
  await mkdir(outSubdir, { recursive: true });

  const name = basename(rel, extname(rel));
  const image = sharp(srcPath);
  const meta = await image.metadata();
  const originalKB = (await stat(srcPath)).size / 1024;

  dominantMap[rel.replace(/\\/g, "/")] = await dominantColor(sharp(srcPath));

  let producedKB = 0;

  for (const width of WIDTHS) {
    if (meta.width && meta.width < width) continue; // no ampliar

    const avifPath = join(outSubdir, `${name}-${width}.avif`);
    const webpPath = join(outSubdir, `${name}-${width}.webp`);
    const jpgPath = join(outSubdir, `${name}-${width}.jpg`);

    await sharp(srcPath).resize({ width }).avif({ quality: 55 }).toFile(avifPath);
    await sharp(srcPath).resize({ width }).webp({ quality: 68 }).toFile(webpPath);
    await sharp(srcPath).resize({ width }).jpeg({ quality: 72, mozjpeg: true }).toFile(jpgPath);

    producedKB += (await stat(avifPath)).size / 1024;
    producedKB += (await stat(webpPath)).size / 1024;
    producedKB += (await stat(jpgPath)).size / 1024;
  }

  // Miniatura para galeria.html — WebP únicamente, calidad más baja.
  const thumbPath = join(outSubdir, `${name}-thumb.webp`);
  await sharp(srcPath).resize({ width: THUMB_WIDTH }).webp({ quality: 60 }).toFile(thumbPath);
  producedKB += (await stat(thumbPath)).size / 1024;

  report.push({
    file: rel.replace(/\\/g, "/"),
    originalKB: Math.round(originalKB),
    variantsKB: Math.round(producedKB),
  });
}

async function main() {
  console.log(`Buscando imágenes en ${SRC_DIR}/ ...`);
  const files = await walk(SRC_DIR);
  console.log(`${files.length} imágenes encontradas. Procesando...`);

  const dominantMap = {};
  const report = [];
  let done = 0;

  for (const file of files) {
    try {
      await processImage(file, dominantMap, report);
    } catch (err) {
      console.error(`  ! Error con ${file}: ${err.message}`);
    }
    done++;
    if (done % 50 === 0) console.log(`  ${done}/${files.length}`);
  }

  await writeFile("imagenes-dominante.json", JSON.stringify(dominantMap, null, 2));
  await writeFile("optimize-report.json", JSON.stringify(report, null, 2));

  const totalOriginal = report.reduce((s, r) => s + r.originalKB, 0);
  const totalVariants = report.reduce((s, r) => s + r.variantsKB, 0);

  console.log("\nListo.");
  console.log(`Originales: ${(totalOriginal / 1024).toFixed(1)} MB`);
  console.log(`Variantes generadas (todos los anchos + miniatura): ${(totalVariants / 1024).toFixed(1)} MB`);
  console.log(`\nEsto NO reemplaza imagenes/ automáticamente — revisa imagenes-optim/`);
  console.log(`y decide cómo migrar cada <img> a <picture> con srcset (o pide que te`);
  console.log(`ayude con eso una vez tengas los archivos generados).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
