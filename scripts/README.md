# scripts/

Estado: **ya se corrió todo esto sobre el sitio real** (2 de septiembre,
2026, con Node v24 instalado localmente). Este README queda como
referencia para volver a correrlo si se agregan fotos o videos nuevos.

## optimize-images.mjs

Genera, por cada imagen en `imagenes/`, 3 anchos (480/960/1600px) en
AVIF + WebP + JPEG de respaldo, una miniatura de 400px, y extrae el
color dominante. No toca los originales — todo sale a `imagenes-optim/`.

```bash
npm install sharp
node scripts/optimize-images.mjs
```

Con las 1137 imágenes del sitio tardó varios minutos. Salida:
`imagenes-optim/` (568 MB de variantes), `imagenes-dominante.json`,
`optimize-report.json`.

## migrate-to-picture.pl

Reescribe cada `<img>` de contenido en las 22 páginas como
`<picture>` con `<source type="image/avif">` + `<source
type="image/webp">` + `<img>` de respaldo (JPEG del mayor ancho
disponible), usando las variantes de `imagenes-optim/`. No toca
`imagenes/` — los originales siguen ahí intactos.

```bash
perl scripts/migrate-to-picture.pl
```

593 de 596 `<img>` quedaron migradas (las 3 restantes son imágenes ya
más chicas que el ancho mínimo generado, no lo necesitaban). Las fotos
referenciadas desde JavaScript (los datos de la galería en
`extracurriculares.html`, `actividades.html`) no se tocaron — eso
necesitaría una migración a nivel de JS, no de HTML estático.

Requiere `css/estilos.css` con la regla `picture { display: contents; }`
(ya está) para que envolver el `<img>` en `<picture>` no cambie ningún
layout existente.

## Videos

Se recomprimieron con `ffmpeg-static` (el binario de ffmpeg vía npm,
sin necesitar instalarlo aparte en el sistema):

```bash
npm install ffmpeg-static
node_modules/ffmpeg-static/ffmpeg.exe -i entrada.mp4 \
  -vf "scale='min(1280,iw)':-2:flags=lanczos" \
  -c:v libx264 -crf 26 -preset slow -c:a aac -b:a 96k \
  -movflags +faststart salida.mp4
```

`scale='min(1280,iw)':-2` es importante — nunca agranda un video que ya
es más chico que 1280px (una versión anterior de este comando sí lo
hacía, y el video de voleibol terminó más pesado que el original).

Resultados aplicados a los 3 videos que el sitio realmente usa:

| Video | Antes | Después |
|---|---|---|
| `video_promo.mp4` | 18.47 MB | 7.27 MB |
| `logo_micheletti.mp4` | 1.39 MB | 0.52 MB |
| `voleibol.mp4` | 5.62 MB | 4.35 MB |

Los otros 11 archivos de `video/` no están referenciados en ninguna
página — no se tocaron porque nadie los descarga.

## Nota sobre el tamaño del repositorio

`imagenes-optim/` agrega ~568 MB al repositorio (además de los ~390 MB
de `imagenes/` originales y ~130 MB de `video/` que ya estaban). El
`.git/` completo ronda ahora ~1.1 GB. GitHub no bloquea esto, pero es
bastante más grande de lo recomendado para un repo normal. Si en algún
momento pesa, las opciones son: mover `imagenes/` (los originales, ya
no referenciados directamente salvo por el fallback antiguo) a Git LFS,
o borrar del historial las versiones más pesadas de fotos que ya no se
usan. No lo hice porque es una decisión de mantenimiento del repo, no
de rendimiento del sitio — nadie que visite el sitio descarga ese peso
extra, solo quien clona el repositorio completo.

## node_modules/

Quedó en `.gitignore`. Si vuelves a correr estos scripts en otra
máquina, `npm install` reinstala `sharp` y `ffmpeg-static` a partir de
`package.json`.
