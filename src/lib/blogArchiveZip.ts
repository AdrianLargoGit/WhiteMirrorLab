import { existsSync, readdirSync, readFileSync, statSync } from 'fs'
import { createHash } from 'crypto'
import { dirname, join, relative, sep } from 'path'
import { getCaseMapPoints, localizeCaseMapPoint } from './blogCaseMapPoints'
import { getCaseDetails, getCaseTimeline, localizeText } from './blogCaseDetails'
import { getSuspectNotes, localizeSuspectNote } from './blogSuspectNotes'
import { getVictimSceneNotes, localizeVictimScene } from './blogVictimScenes'
import type { UnsolvedSerialCase } from './unsolvedSerialCases'

type ZipEntry = {
  name: string
  content: Uint8Array
  hash: string
}

const encoder = new TextEncoder()
const MIN_MARKETABLE_FILES = 5
const MIN_MARKETABLE_SOURCE_DOCUMENTS = 4
const MIN_MARKETABLE_BYTES = 800 * 1024
const MIN_VISUAL_EVIDENCE_SCORE = 8

const imagePattern = /\.(?:avif|gif|jpe?g|png|webp)$/i
const htmlPattern = /\.html?$/i
const pdfPattern = /\.pdf$/i
const sourceDocumentPattern = /\.(?:html?|pdf|txt|csv|json)$/i

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff

  for (const byte of bytes) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
    }
  }

  return (crc ^ 0xffffffff) >>> 0
}

function pushUint16(target: number[], value: number) {
  target.push(value & 0xff, (value >>> 8) & 0xff)
}

function pushUint32(target: number[], value: number) {
  target.push(value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff)
}

function pushBytes(target: number[], bytes: Uint8Array) {
  for (const byte of bytes) target.push(byte)
}

function hashBytes(bytes: Uint8Array) {
  return createHash('sha256').update(bytes).digest('hex')
}

export function getDownloadedEvidenceEntries(caseFile: UnsolvedSerialCase) {
  const evidenceRoot = join(process.cwd(), 'public', 'blog-evidence', caseFile.slug)
  if (!existsSync(evidenceRoot)) return []

  const entries: ZipEntry[] = []
  const visit = (dir: string) => {
    for (const item of readdirSync(dir)) {
      if (item.endsWith('.download')) continue

      const filePath = join(dir, item)
      const stats = statSync(filePath)

      if (stats.isDirectory()) {
        visit(filePath)
        continue
      }

      const content = readFileSync(filePath)
      entries.push({
        name: relative(evidenceRoot, filePath).split(sep).join('/'),
        content,
        hash: hashBytes(content),
      })
    }
  }

  visit(evidenceRoot)
  const uniqueByContent = new Map<string, ZipEntry>()
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const existing = uniqueByContent.get(entry.hash)
    if (!existing || entry.name.length < existing.name.length) {
      uniqueByContent.set(entry.hash, entry)
    }
  }

  return [...uniqueByContent.values()].sort((a, b) => a.name.localeCompare(b.name))
}

function csvCell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`
}

function textEntry(name: string, value: string): ZipEntry {
  const content = encoder.encode(value.trimStart())
  return {
    name,
    content,
    hash: hashBytes(content),
  }
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${bytes} B`
}

function base64(bytes: Uint8Array) {
  return Buffer.from(bytes).toString('base64')
}

function mediaType(fileName: string) {
  const lower = fileName.toLowerCase()
  if (lower.endsWith('.avif')) return 'image/avif'
  if (lower.endsWith('.gif')) return 'image/gif'
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg'
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.webp')) return 'image/webp'
  if (lower.endsWith('.pdf')) return 'application/pdf'
  return 'application/octet-stream'
}

function dataUrl(entry: ZipEntry) {
  return `data:${mediaType(entry.name)};base64,${base64(entry.content)}`
}

function normalizeZipPath(value: string) {
  const output: string[] = []
  for (const part of value.replaceAll('\\', '/').split('/')) {
    if (!part || part === '.') continue
    if (part === '..') output.pop()
    else output.push(part)
  }

  return output.join('/')
}

function resolveZipPath(fromFile: string, value: string) {
  if (!value || value.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(value)) return ''
  const cleanValue = value.split('#')[0].split('?')[0]
  return normalizeZipPath(`${dirname(fromFile).replaceAll('\\', '/')}/${cleanValue}`)
}

function escapeHtml(value: string | number) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function escapeJs(value: unknown) {
  return JSON.stringify(value).replaceAll('<', '\\u003c')
}

export function getEvidenceArchiveStatus(caseFile: UnsolvedSerialCase) {
  if (caseFile.hasEvidenceArchive === false) {
    return {
      isMarketable: false,
      entries: [] as ZipEntry[],
      fileCount: 0,
      pdfCount: 0,
      imageCount: 0,
      sourceDocumentCount: 0,
      totalBytes: 0,
      reasons: ['Archive disabled for this case.'],
    }
  }

  const entries = getDownloadedEvidenceEntries(caseFile)
  const meaningfulEntries = entries.filter((entry) => entry.content.byteLength >= 1024)
  const pdfCount = entries.filter((entry) => pdfPattern.test(entry.name)).length
  const imageCount = entries.filter((entry) => imagePattern.test(entry.name)).length
  const sourceDocumentCount = entries.filter((entry) => sourceDocumentPattern.test(entry.name)).length
  const totalBytes = entries.reduce((total, entry) => total + entry.content.byteLength, 0)
  const visualEvidenceScore = imageCount + pdfCount * 3
  const hasStrongDocumentBase = pdfCount >= 2 || sourceDocumentCount >= 8
  const reasons: string[] = []

  if (meaningfulEntries.length < MIN_MARKETABLE_FILES) {
    reasons.push(`Needs at least ${MIN_MARKETABLE_FILES} substantial downloaded files.`)
  }
  if (sourceDocumentCount < MIN_MARKETABLE_SOURCE_DOCUMENTS) {
    reasons.push(`Needs at least ${MIN_MARKETABLE_SOURCE_DOCUMENTS} source documents.`)
  }
  if (totalBytes < MIN_MARKETABLE_BYTES) {
    reasons.push(`Needs at least ${formatBytes(MIN_MARKETABLE_BYTES)} of downloaded evidence.`)
  }
  if (visualEvidenceScore < MIN_VISUAL_EVIDENCE_SCORE) {
    reasons.push('Needs real PDF evidence or a stronger image set.')
  }
  if (!hasStrongDocumentBase) {
    reasons.push('Needs at least 2 substantial PDFs or a deep public-source HTML record.')
  }

  return {
    isMarketable: reasons.length === 0,
    entries,
    fileCount: entries.length,
    pdfCount,
    imageCount,
    sourceDocumentCount,
    totalBytes,
    uniqueContentCount: entries.length,
    reasons,
  }
}

function buildReadme(caseFile: UnsolvedSerialCase, status: ReturnType<typeof getEvidenceArchiveStatus>) {
  return `White Mirror Lab evidence dossier
${caseFile.title}
${caseFile.dossierCode}

Este ZIP contiene material documental real descargado de fuentes publicas verificables: PDFs oficiales cuando existen, capturas HTML limpias, imagenes publicas de archivo y un indice generado para navegarlo.

Regla editorial: este paquete solo se vende porque supera el umbral minimo de calidad del archivo. Si un caso no tiene suficientes pruebas reales descargadas, la web no muestra compra.

Contenido real descargado:
- Archivos: ${status.fileCount}
- PDFs: ${status.pdfCount}
- Imagenes: ${status.imageCount}
- Documentos fuente HTML/PDF/TXT/CSV/JSON: ${status.sourceDocumentCount}
- Peso descargado: ${formatBytes(status.totalBytes)}

Como leerlo:
1. Empieza por 01-case-overview.md.
2. Abre 02-source-index.csv para ver las fuentes publicas originales.
3. Usa 03-evidence-inventory.csv para revisar cada archivo incluido.
4. Abre 04-case-board.html para ver el tablon interactivo con fotos, fichas de informacion real, hilos, circulos y notas.
5. Abre 05-case-map.html para ver los puntos importantes sobre mapa real de OpenStreetMap. Los mismos puntos estan en 05-case-map-points.csv y 05-case-map.geojson.
6. Trata sospechosos, retratos y teorias como material contextual salvo que una fuente oficial lo presente como prueba.

English note: this archive is a curated public-source dossier. It preserves source documents and images where available, plus generated navigation files. It does not claim to solve the case.`
}

function buildCaseOverview(caseFile: UnsolvedSerialCase) {
  const details = getCaseDetails(caseFile.slug)
  const timeline = getCaseTimeline(caseFile.slug)
  const suspects = getSuspectNotes(caseFile.slug).map((note) => localizeSuspectNote(note, 'es'))
  const mapPoints = getCaseMapPoints(caseFile.slug).map((point) => localizeCaseMapPoint(point, 'es'))
  const lines = [
    `# ${caseFile.title}`,
    '',
    `Dossier: ${caseFile.dossierCode}`,
    `Location: ${caseFile.location}`,
    `Active years: ${caseFile.activeYears}`,
    `Victims: ${caseFile.victims}`,
    `Status: ${caseFile.status}`,
    '',
    '## Summary',
    caseFile.summary,
    '',
    '## Article notes',
    ...caseFile.article.flatMap((section) => [
      '',
      `### ${section.heading}`,
      ...section.paragraphs,
    ]),
    '',
    '## Timeline',
    ...timeline.map((event) => `- ${event.date}: ${localizeText(event.title, 'es')} - ${localizeText(event.body, 'es')}`),
    '',
    '## Mapa documental',
    ...(mapPoints.length > 0
      ? mapPoints.map((point) => `- ${point.date}: ${point.title} (${point.latitude}, ${point.longitude}) - ${point.location}. Precision: ${point.precision}. Fuente: ${point.sourceLabel}.`)
      : ['No hay puntos geograficos suficientemente verificables para este dossier local.']),
    '',
    '## Archive includes',
    ...caseFile.archiveNotes.map((note) => `- ${note}`),
    ...(details?.dossierOnly ?? []).map((note) => `- ${localizeText(note, 'es')}`),
    '',
    '## Sospechosos, descartes y limites probatorios',
    ...(suspects.length > 0
      ? suspects.flatMap((suspect) => [
        `### ${suspect.name}`,
        `Estado documentado: ${suspect.status}`,
        `Base de la sospecha: ${suspect.basis}`,
        `Por que no cierra el caso / limite probatorio: ${suspect.limits}`,
        suspect.source ? `Fuente de apoyo: ${suspect.source}` : '',
        '',
      ])
      : ['No hay un sospechoso publico suficientemente documentado en el dossier local.']),
    '',
    '## Editorial caution',
    'This dossier separates public evidence from speculation. A name, sketch, suspect line, or media theory is not treated as proof unless the cited source supports it.',
  ]

  return lines.join('\n')
}

function buildSourceIndex(caseFile: UnsolvedSerialCase, status: ReturnType<typeof getEvidenceArchiveStatus>) {
  const downloadedSources = status.entries
    .filter((entry) => htmlPattern.test(entry.name))
    .map((entry) => ({
      label: `Downloaded source: ${titleFromHtml(entry)}`,
      url: sourceFromHtml(entry),
    }))
    .filter((source) => source.url)
  const mapSources = getLocalizedMapPoints(caseFile).map((point) => ({
    label: `Map point: ${point.title} / ${point.sourceLabel}`,
    url: point.sourceUrl,
  }))
  const sources = [...caseFile.sources]
  for (const source of [...downloadedSources, ...mapSources]) {
    if (!sources.some((existing) => existing.url === source.url && existing.label === source.label)) {
      sources.push(source)
    }
  }

  return [
    ['label', 'url'].map(csvCell).join(','),
    ...sources.map((source) => [source.label, source.url].map(csvCell).join(',')),
  ].join('\n')
}

function buildEvidenceInventory(entries: ZipEntry[]) {
  return [
    ['file', 'type', 'bytes'].map(csvCell).join(','),
    ...entries.map((entry) => {
      const type = pdfPattern.test(entry.name)
        ? 'pdf'
        : imagePattern.test(entry.name)
          ? 'image'
          : sourceDocumentPattern.test(entry.name)
            ? 'source-document'
            : 'other'

      return [entry.name, type, entry.content.byteLength].map(csvCell).join(',')
    }),
  ].join('\n')
}

function buildEvidenceDigest(caseFile: UnsolvedSerialCase, status: ReturnType<typeof getEvidenceArchiveStatus>) {
  const documents = status.entries.filter((entry) => sourceDocumentPattern.test(entry.name) && !imagePattern.test(entry.name))
  const images = status.entries.filter((entry) => imagePattern.test(entry.name))
  const mapPoints = getCaseMapPoints(caseFile.slug).map((point) => localizeCaseMapPoint(point, 'es'))
  const suspects = getSuspectNotes(caseFile.slug).map((note) => localizeSuspectNote(note, 'es'))
  const scenes = getVictimSceneNotes(caseFile.slug).map((note) => localizeVictimScene(note, 'es'))

  return [
    `# Digest documental ampliado - ${caseFile.title}`,
    '',
    'Este archivo no sustituye a las fuentes originales. Resume que prueba contiene el ZIP y donde comprobarla.',
    '',
    '## Pruebas descargadas',
    `- Documentos fuente: ${documents.length}`,
    `- Imagenes unicas: ${images.length}`,
    `- Peso descargado unico: ${formatBytes(status.totalBytes)}`,
    '',
    '## Documentos principales',
    ...documents.map((entry) => {
      const source = htmlPattern.test(entry.name) ? sourceFromHtml(entry) : ''
      const label = htmlPattern.test(entry.name) ? titleFromHtml(entry) : entryTitle(entry)
      return `- ${label} (${entry.name}, ${formatBytes(entry.content.byteLength)})${source ? ` - Fuente original: ${source}` : ''}`
    }),
    '',
    '## Imagenes y material visual',
    ...images.map((entry) => `- ${entryTitle(entry)} (${entry.name}) - ${evidenceImageKind(entry.name)} - ${formatBytes(entry.content.byteLength)}`),
    '',
    '## Puntos de mapa incluidos',
    ...(mapPoints.length > 0
      ? mapPoints.map((point) => `- ${point.date}: ${point.title} / ${point.location} / ${point.category} / ${point.latitude}, ${point.longitude} / Fuente: ${point.sourceLabel}`)
      : ['No hay puntos de mapa verificados para este caso.']),
    '',
    '## Escenas y victimas',
    ...scenes.map((scene) => `- ${scene.date}: ${scene.victim}. ${scene.location}. ${scene.scene} ${scene.investigation}`),
    '',
    '## Sospechosos y limites',
    ...(suspects.length > 0
      ? suspects.map((suspect) => `- ${suspect.name}: ${suspect.status}. Base: ${suspect.basis} Limite: ${suspect.limits}${suspect.source ? ` Fuente: ${suspect.source}.` : ''}`)
      : ['No hay sospechosos publicos suficientemente documentados en el dossier local.']),
    '',
    '## Regla de lectura',
    'Un punto en el mapa, una foto, un retrato robot o un nombre citado no equivalen a culpabilidad. Cada elemento debe leerse junto a su fuente y a su limite probatorio.',
  ].join('\n')
}

function getLocalizedMapPoints(caseFile: UnsolvedSerialCase) {
  return getCaseMapPoints(caseFile.slug).map((point) => localizeCaseMapPoint(point, 'es'))
}

function buildMapPointsCsv(caseFile: UnsolvedSerialCase) {
  const rows = getLocalizedMapPoints(caseFile)
  return [
    ['date', 'title', 'category', 'location', 'latitude', 'longitude', 'precision', 'note', 'source_label', 'source_url'].map(csvCell).join(','),
    ...rows.map((point) => [
      point.date,
      point.title,
      point.category,
      point.location,
      point.latitude,
      point.longitude,
      point.precision,
      point.note,
      point.sourceLabel,
      point.sourceUrl,
    ].map(csvCell).join(',')),
  ].join('\n')
}

function buildMapGeoJson(caseFile: UnsolvedSerialCase) {
  const features = getLocalizedMapPoints(caseFile).map((point) => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [point.longitude, point.latitude],
    },
    properties: {
      date: point.date,
      title: point.title,
      category: point.category,
      location: point.location,
      precision: point.precision,
      note: point.note,
      sourceLabel: point.sourceLabel,
      sourceUrl: point.sourceUrl,
    },
  }))

  return JSON.stringify({
    type: 'FeatureCollection',
    name: `${caseFile.slug}-case-map`,
    features,
  }, null, 2)
}

function buildCaseMapHtml(caseFile: UnsolvedSerialCase) {
  const points = getLocalizedMapPoints(caseFile)
  const center = points.length > 0
    ? {
      latitude: points.reduce((total, point) => total + point.latitude, 0) / points.length,
      longitude: points.reduce((total, point) => total + point.longitude, 0) / points.length,
    }
    : { latitude: 0, longitude: 0 }

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${escapeHtml(caseFile.title)} - mapa documental</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <style>
    *{box-sizing:border-box}body{margin:0;background:#111;color:#f8f1e6;font-family:Arial,Helvetica,sans-serif}.shell{display:grid;grid-template-columns:minmax(280px,380px) 1fr;min-height:100vh}.panel{padding:18px;background:#17130f;border-right:1px solid #3b2c20;overflow:auto;max-height:100vh}h1{font-size:20px;line-height:1.1;margin:0 0 8px}p{color:#d8c9b7;line-height:1.45}.map{min-height:100vh}.point{border:1px solid #5a4330;background:#211810;border-radius:6px;padding:10px;margin:10px 0}.point button{width:100%;text-align:left;border:0;background:transparent;color:#fff7e7;padding:0;cursor:pointer}.eyebrow{color:#f0c25b;font:11px ui-monospace,SFMono-Regular,Consolas,monospace;text-transform:uppercase}.title{font-weight:700;margin:4px 0}.meta{font-size:12px;color:#cbbba7}.source{font-size:12px;word-break:break-word}.source a{color:#8ecbff}.legend{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0}.tag{font-size:11px;border:1px solid #5a4330;border-radius:999px;padding:5px 8px;color:#f8f1e6}@media(max-width:820px){.shell{grid-template-columns:1fr}.panel{max-height:none}.map{min-height:70vh}}
  </style>
</head>
<body>
  <main class="shell">
    <aside class="panel">
      <h1>${escapeHtml(caseFile.title)}</h1>
      <p>Mapa real con teselas de OpenStreetMap. Los puntos proceden de fuentes publicas citadas; cuando la fuente da una zona o carretera en lugar de una direccion exacta, el punto se marca como aproximado.</p>
      <div class="legend"><span class="tag">Escena</span><span class="tag">Ultima vez vista</span><span class="tag">Hallazgo</span><span class="tag">Linea de sospechoso</span></div>
      <div id="list"></div>
    </aside>
    <section id="map" class="map" aria-label="Mapa documental"></section>
  </main>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const points = ${escapeJs(points)};
    const center = ${escapeJs(center)};
    const colors = { scene: '#d43d2f', 'last-seen': '#f0c25b', 'body-recovery': '#8ecbff', 'suspect-lead': '#d889ff', context: '#97e4a6' };
    const list = document.getElementById('list');
    function esc(value){ return String(value || '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])); }
    if (!points.length) {
      document.getElementById('map').innerHTML = '<p style="padding:24px">No hay puntos verificados para este caso.</p>';
    } else if (!window.L) {
      document.getElementById('map').innerHTML = '<p style="padding:24px">No se pudo cargar OpenStreetMap/Leaflet. Usa 05-case-map.geojson o 05-case-map-points.csv.</p>';
    } else {
      const map = L.map('map', { scrollWheelZoom: true }).setView([center.latitude, center.longitude], points.length > 4 ? 11 : 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      const bounds = [];
      const markers = points.map((point, index) => {
        const marker = L.circleMarker([point.latitude, point.longitude], {
          radius: 9,
          color: '#1b120b',
          weight: 2,
          fillColor: colors[point.category] || '#fff',
          fillOpacity: 0.92
        }).addTo(map);
        marker.bindPopup('<strong>' + esc(point.title) + '</strong><br>' + esc(point.date) + '<br>' + esc(point.location) + '<br><em>' + esc(point.precision) + '</em><br><a href="' + esc(point.sourceUrl) + '" target="_blank" rel="noreferrer">Fuente</a>');
        bounds.push([point.latitude, point.longitude]);
        return marker;
      });
      if (bounds.length > 1) map.fitBounds(bounds, { padding: [38, 38] });
      points.forEach((point, index) => {
        const row = document.createElement('article');
        row.className = 'point';
        row.innerHTML = '<button type="button"><div class="eyebrow">' + esc(point.category) + ' / ' + esc(point.date) + '</div><div class="title">' + esc(point.title) + '</div><div class="meta">' + esc(point.location) + ' · ' + point.latitude + ', ' + point.longitude + '</div><p>' + esc(point.note) + '</p><div class="source">Fuente: <a href="' + esc(point.sourceUrl) + '" target="_blank" rel="noreferrer">' + esc(point.sourceLabel) + '</a></div></button>';
        row.querySelector('button').onclick = () => { map.setView([point.latitude, point.longitude], 15); markers[index].openPopup(); };
        list.appendChild(row);
      });
    }
  </script>
</body>
</html>`
}

function inlineLocalImages(entry: ZipEntry, entriesByName: Map<string, ZipEntry>) {
  if (!htmlPattern.test(entry.name)) return entry

  const html = new TextDecoder().decode(entry.content)
  const inlined = html.replace(/\bsrc=(["'])([^"']+)\1/gi, (match, quote: string, source: string) => {
    const imageName = resolveZipPath(entry.name, source)
    const imageEntry = imageName ? entriesByName.get(imageName) : undefined
    if (!imageEntry || !imagePattern.test(imageEntry.name)) return match

    return `src=${quote}${dataUrl(imageEntry)}${quote} data-original-src=${quote}${escapeHtml(source)}${quote}`
  })

  return {
    ...entry,
    content: encoder.encode(inlined),
  }
}

function entryTitle(entry: ZipEntry) {
  const name = entry.name.split('/').at(-1) ?? entry.name
  return name
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/^\d+-/, '')
    .replaceAll('-', ' ')
}

function readableTextFromHtml(entry: ZipEntry) {
  return new TextDecoder().decode(entry.content)
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 520)
}

function titleFromHtml(entry: ZipEntry) {
  const html = new TextDecoder().decode(entry.content)
  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]
    ?? html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]
    ?? entryTitle(entry)

  return title.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function sourceFromHtml(entry: ZipEntry) {
  const html = new TextDecoder().decode(entry.content)
  return html.match(/Original source:\s*<a\b[^>]*href=["']([^"']+)["']/i)?.[1] ?? ''
}

function buildDocumentInfoCards(entries: ZipEntry[]) {
  return entries
    .filter((entry) => sourceDocumentPattern.test(entry.name) && !imagePattern.test(entry.name))
    .map((entry, index) => {
      const isHtml = htmlPattern.test(entry.name)
      const isPdf = pdfPattern.test(entry.name)

      return {
        kind: 'source',
        title: isHtml ? titleFromHtml(entry) : entryTitle(entry),
        eyebrow: isPdf ? 'Informacion de PDF oficial' : 'Informacion de fuente publica',
        text: isHtml
          ? readableTextFromHtml(entry)
          : `Archivo real incluido en el dossier: ${entry.name}. Peso: ${formatBytes(entry.content.byteLength)}.`,
        path: entry.name,
        source: isHtml ? sourceFromHtml(entry) : '',
        x: 760 + (index % 3) * 250,
        y: 90 + Math.floor(index / 3) * 178,
      }
    })
}

function isSensitiveEvidenceImage(fileName: string) {
  return /victim|victima|body|bodies|remains|restos|murder|homicide|torso|crime|scene|evidence|trego|charlotte|barela|candelaria|chavez|cloven|edwards|elks|marquez|nieto|romero|salazar|valdez|doodler|sketch|reconstructed|head|tattoo/i.test(fileName)
}

function evidenceImageKind(fileName: string) {
  if (/doodler|sketch|sfpdnewsreleaseimage|screen-shot/i.test(fileName)) return 'Retrato / sospechoso'
  if (/trego|charlotte|barela|candelaria|chavez|cloven|edwards|elks|marquez|nieto|romero|salazar|valdez/i.test(fileName)) return 'Victima / persona desaparecida'
  if (/body|bodies|remains|restos|torso|murder|homicide|crime|scene|evidence|reconstructed|head|tattoo/i.test(fileName)) return 'Escena o prueba sensible'
  return 'Imagen de archivo'
}

function buildCaseBoardHtml(caseFile: UnsolvedSerialCase, status: ReturnType<typeof getEvidenceArchiveStatus>) {
  const imageEntries = status.entries.filter((entry) => imagePattern.test(entry.name))
  const details = getCaseDetails(caseFile.slug)
  const timeline = getCaseTimeline(caseFile.slug)
  const victimScenes = getVictimSceneNotes(caseFile.slug).map((note) => localizeVictimScene(note, 'es'))
  const suspectNotes = getSuspectNotes(caseFile.slug).map((note) => localizeSuspectNote(note, 'es'))
  const mapPoints = getLocalizedMapPoints(caseFile)
  const documentCards = buildDocumentInfoCards(status.entries)
  const boardItems = [
    ...imageEntries.map((entry, index) => ({
      kind: 'image',
      title: entryTitle(entry),
      path: entry.name,
      src: dataUrl(entry),
      sensitive: isSensitiveEvidenceImage(entry.name),
      eyebrow: evidenceImageKind(entry.name),
      bytes: entry.content.byteLength,
      x: 60 + (index % 5) * 210,
      y: 90 + Math.floor(index / 5) * 235,
    })),
    ...victimScenes.map((scene, index) => ({
      kind: 'scene',
      title: scene.victim,
      eyebrow: `Escena / ${scene.date}`,
      text: `${scene.location}. ${scene.scene} ${scene.investigation}`,
      x: 70 + (index % 3) * 250,
      y: 620 + Math.floor(index / 3) * 178,
    })),
    ...suspectNotes.map((suspect, index) => ({
      kind: 'suspect',
      title: suspect.name,
      eyebrow: suspect.status,
      text: `${suspect.basis} Limite probatorio: ${suspect.limits}${suspect.source ? ` Fuente: ${suspect.source}.` : ''}`,
      x: 845 + (index % 2) * 260,
      y: 620 + Math.floor(index / 2) * 178,
    })),
    ...mapPoints.map((point, index) => ({
      kind: 'map',
      title: point.title,
      eyebrow: `Mapa / ${point.category} / ${point.date}`,
      text: `${point.location}. Coordenadas: ${point.latitude}, ${point.longitude}. Precision: ${point.precision} Nota: ${point.note} Fuente: ${point.sourceLabel}.`,
      source: point.sourceUrl,
      x: 330 + (index % 3) * 250,
      y: 900 + Math.floor(index / 3) * 178,
    })),
    ...timeline.map((event, index) => ({
      kind: 'timeline',
      title: localizeText(event.title, 'es'),
      eyebrow: `Cronologia / ${event.date}`,
      text: localizeText(event.body, 'es'),
      x: 1185,
      y: 90 + index * 132,
    })),
    ...documentCards,
  ]

  const notes = [
    `Estado: ${caseFile.status}`,
    `Lugar: ${caseFile.location}`,
    `Periodo: ${caseFile.activeYears}`,
    `Victimas: ${caseFile.victims}`,
    ...caseFile.archiveNotes,
    ...(details?.dossierOnly ?? []).map((note) => localizeText(note, 'es')),
  ]

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${escapeHtml(caseFile.title)} - interactive evidence board</title>
  <style>
    :root{--bg:#16110b;--cork:#9f6a39;--cork2:#b77d46;--ink:#17120c;--paper:#fff7e7;--muted:#6f5132;--line:#4b3019;--accent:#b41018;--pin:#e6c94a}
    *{box-sizing:border-box}body{margin:0;background:#0c0a08;color:var(--paper);font-family:Arial,Helvetica,sans-serif;overflow:hidden}
    header{height:72px;display:flex;align-items:center;gap:16px;padding:10px 18px;background:#100d0a;border-bottom:1px solid #2d2117}
    h1{font-size:18px;line-height:1.1;margin:0;min-width:230px;max-width:420px}small{display:block;color:#c9bca7;font-size:12px;margin-top:4px}
    .toolbar{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.toolbar button{border:1px solid #5d4733;background:#20170f;color:#fff7e7;border-radius:6px;padding:9px 11px;cursor:pointer}.toolbar button.active{background:var(--accent);border-color:#ff6b70}
    .board-wrap{height:calc(100vh - 72px);overflow:auto;background:radial-gradient(circle at 20px 20px,rgba(255,255,255,.12) 1px,transparent 1px),linear-gradient(135deg,var(--cork),var(--cork2));background-size:22px 22px,auto}
    .board{position:relative;width:1600px;height:1150px;min-width:100%;min-height:100%;box-shadow:inset 0 0 80px rgba(0,0,0,.3)}
    svg.wires{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}.wire{stroke:#b7111b;stroke-width:4;filter:drop-shadow(0 2px 1px rgba(0,0,0,.28))}
    .card,.note{position:absolute;touch-action:none;user-select:none;cursor:grab}.card:active,.note:active{cursor:grabbing}.card.selected,.note.selected{outline:3px solid #f5e372}
    .hidden{display:none!important}
    .card{width:180px;background:var(--paper);color:var(--ink);padding:10px 10px 12px;border-radius:4px;box-shadow:0 10px 24px rgba(0,0,0,.32);transform:rotate(var(--tilt))}
    .card.info{width:230px;min-height:138px;background:#fff9ed}
    .card:before,.note:before{content:"";position:absolute;top:6px;left:50%;width:13px;height:13px;border-radius:50%;background:var(--pin);box-shadow:0 2px 0 rgba(0,0,0,.28);transform:translateX(-50%)}
    .thumb{height:128px;background:#1c1711;display:grid;place-items:center;overflow:hidden;border:1px solid #dcc8a8}.thumb img{width:100%;height:100%;object-fit:contain;display:block}
    .thumb.sensitive img{filter:blur(12px) saturate(.65);transform:scale(1.04)}.thumb.revealed img{filter:none;transform:none}.reveal{position:absolute;left:12px;right:12px;top:56px;min-height:34px;border:1px solid #f5e372;background:rgba(10,8,6,.86);color:#fff7e7;border-radius:4px;font-size:11px;cursor:pointer}
    .info-block{min-height:118px;display:grid;gap:8px;align-content:start}.eyebrow{color:#8f1d17;font:10px ui-monospace,SFMono-Regular,Consolas,monospace;text-transform:uppercase;letter-spacing:.08em}.info-block p{font-size:12px;line-height:1.38;margin:0;color:#4d3b2a;max-height:112px;overflow:auto}
    .title{font-weight:700;font-size:12px;line-height:1.22;margin-top:8px;word-break:break-word}.path{font-size:10px;color:var(--muted);word-break:break-word;margin-top:4px}
    .note{width:210px;min-height:105px;background:#fff0a8;color:#241808;border-radius:3px;padding:24px 12px 12px;box-shadow:0 8px 20px rgba(0,0,0,.28);font-size:15px;line-height:1.35;white-space:pre-wrap}
    .circle{position:absolute;border:4px solid #d4151f;border-radius:50%;pointer-events:none;box-shadow:0 0 0 2px rgba(255,255,255,.25)}
    .hint{margin-left:auto;color:#c9bca7;font-size:12px;max-width:360px;line-height:1.35}
    .modal{position:fixed;inset:0;background:rgba(0,0,0,.74);display:none;align-items:center;justify-content:center;padding:24px;z-index:10}.modal.open{display:flex}.modal-inner{max-width:min(980px,96vw);max-height:92vh;background:#120f0b;border:1px solid #5d4733;padding:14px;overflow:auto}.modal img{max-width:100%;height:auto;display:block}.modal button{float:right;margin-bottom:10px}
  </style>
</head>
<body>
  <header>
    <div><h1>${escapeHtml(caseFile.title)}</h1><small>${escapeHtml(caseFile.dossierCode)} / ${escapeHtml(status.fileCount)} archivos de prueba</small></div>
    <div class="toolbar">
      <button id="selectMode" class="active" type="button">Mover</button>
      <button id="wireMode" type="button">Hilo</button>
      <button id="circleMode" type="button">Rodear</button>
      <button id="addNote" type="button">Texto</button>
      <button id="deleteSelected" type="button">Borrar</button>
      <button id="undoBoard" type="button">Deshacer</button>
      <button id="resetBoard" type="button">Reset</button>
    </div>
    <div class="hint">Arrastra fotos, escenas, sospechosos y notas. Selecciona una pista y pulsa Borrar si molesta. Deshacer vuelve un movimiento atras.</div>
  </header>
  <div class="board-wrap"><main id="board" class="board"><svg id="wires" class="wires"></svg></main></div>
  <div id="modal" class="modal"><div class="modal-inner"><button id="closeModal" type="button">Cerrar</button><div id="modalBody"></div></div></div>
  <script>
    const items = ${escapeJs(boardItems)};
    const starterNotes = ${escapeJs(notes.slice(0, 10))};
    const board = document.getElementById('board');
    const wiresSvg = document.getElementById('wires');
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    let mode = 'move';
    let selected = null;
    let drag = null;
    let wireStart = null;
    let circleStart = null;
    let wirePairs = [];
    let undoStack = [];
    const saved = JSON.parse(localStorage.getItem('wml-board-${caseFile.slug}') || '{}');

    function esc(value){
      return String(value || '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
    }
    function save(){
      const positions = {};
      document.querySelectorAll('[data-id]').forEach(el => positions[el.dataset.id] = { x: parseFloat(el.style.left), y: parseFloat(el.style.top), text: el.textContent });
      const hiddenIds = [...document.querySelectorAll('[data-id].hidden')].map(el => el.dataset.id);
      localStorage.setItem('wml-board-${caseFile.slug}', JSON.stringify({ positions, hiddenIds, wirePairs, circles: [...document.querySelectorAll('.circle')].map(el => ({ x: parseFloat(el.style.left), y: parseFloat(el.style.top), w: parseFloat(el.style.width), h: parseFloat(el.style.height), id: el.dataset.circleId })) }));
    }
    function snapshot(){
      return localStorage.getItem('wml-board-${caseFile.slug}') || JSON.stringify({
        positions: {},
        hiddenIds: [...document.querySelectorAll('[data-id].hidden')].map(el => el.dataset.id),
        wirePairs,
        circles: [...document.querySelectorAll('.circle')].map(el => ({ x: parseFloat(el.style.left), y: parseFloat(el.style.top), w: parseFloat(el.style.width), h: parseFloat(el.style.height), id: el.dataset.circleId }))
      });
    }
    function pushUndo(){
      save();
      undoStack.push(snapshot());
      if (undoStack.length > 40) undoStack.shift();
    }
    function restore(stateText){
      const state = JSON.parse(stateText);
      document.querySelectorAll('[data-id]').forEach(el => {
        el.classList.toggle('hidden', state.hiddenIds?.includes(el.dataset.id));
        const pos = state.positions?.[el.dataset.id];
        if (pos) {
          el.style.left = pos.x + 'px';
          el.style.top = pos.y + 'px';
          if (el.classList.contains('note')) el.textContent = pos.text || '';
        }
      });
      document.querySelectorAll('.circle').forEach(el => el.remove());
      (state.circles || []).forEach(circle => addCircle(circle));
      wirePairs = state.wirePairs || [];
      selected = null;
      document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
      save();
      drawWires();
    }
    function setMode(next){
      mode = next;
      document.querySelectorAll('.toolbar button').forEach(button => button.classList.remove('active'));
      document.getElementById(next === 'wire' ? 'wireMode' : next === 'circle' ? 'circleMode' : 'selectMode').classList.add('active');
    }
    function centerOf(el){ return { x: parseFloat(el.style.left) + el.offsetWidth / 2, y: parseFloat(el.style.top) + el.offsetHeight / 2 }; }
    function drawWires(){
      wiresSvg.innerHTML = '';
      for (const pair of wirePairs) {
        const a = document.querySelector('[data-id="' + pair[0] + '"]');
        const b = document.querySelector('[data-id="' + pair[1] + '"]');
        if (!a || !b) continue;
        if (a.classList.contains('hidden') || b.classList.contains('hidden')) continue;
        const ca = centerOf(a), cb = centerOf(b);
        const line = document.createElementNS('http://www.w3.org/2000/svg','line');
        line.setAttribute('x1', ca.x); line.setAttribute('y1', ca.y); line.setAttribute('x2', cb.x); line.setAttribute('y2', cb.y); line.setAttribute('class','wire');
        wiresSvg.appendChild(line);
      }
    }
    function makeCard(item, index){
      const el = document.createElement('article');
      el.className = 'card';
      el.dataset.id = 'item-' + index;
      el.style.setProperty('--tilt', ((index % 7) - 3) + 'deg');
      const pos = saved.positions?.[el.dataset.id] || item;
      el.style.left = pos.x + 'px'; el.style.top = pos.y + 'px';
      if (item.kind === 'image') {
        el.innerHTML = '<div class="eyebrow">' + esc(item.eyebrow) + '</div><div class="thumb ' + (item.sensitive ? 'sensitive' : '') + '"><img src="' + item.src + '" alt="' + esc(item.title) + '"></div>' + (item.sensitive ? '<button class="reveal" type="button">Ver imagen sensible</button>' : '') + '<div class="title">' + esc(item.title) + '</div><div class="path">' + esc(item.path) + '</div>';
        const reveal = el.querySelector('.reveal');
        if (reveal) reveal.onpointerdown = event => event.stopPropagation();
        if (reveal) reveal.onclick = event => { event.stopPropagation(); el.querySelector('.thumb').classList.add('revealed'); reveal.remove(); };
        el.ondblclick = () => { modalBody.innerHTML = '<img src="' + item.src + '" alt=""><p>' + esc(item.path) + '</p>'; modal.classList.add('open'); };
      } else {
        el.classList.add('info');
        el.innerHTML = '<div class="info-block"><div class="eyebrow">' + esc(item.eyebrow) + '</div><p>' + esc(item.text) + '</p></div><div class="title">' + esc(item.title) + '</div>' + (item.path ? '<div class="path">' + esc(item.path) + '</div>' : '');
      }
      bindBoardElement(el);
      if (saved.hiddenIds?.includes(el.dataset.id)) el.classList.add('hidden');
      board.appendChild(el);
    }
    function makeNote(text, x, y, id){
      const el = document.createElement('div');
      el.className = 'note';
      el.dataset.id = id || 'note-' + Date.now();
      const pos = saved.positions?.[el.dataset.id] || { x, y, text };
      el.style.left = pos.x + 'px'; el.style.top = pos.y + 'px';
      el.textContent = pos.text || text;
      el.contentEditable = 'true';
      el.addEventListener('input', save);
      bindBoardElement(el);
      if (saved.hiddenIds?.includes(el.dataset.id)) el.classList.add('hidden');
      board.appendChild(el);
    }
    function addCircle(circle){
      const el = document.createElement('div');
      el.className = 'circle';
      el.dataset.circleId = circle.id || 'circle-' + Date.now() + '-' + Math.random().toString(16).slice(2);
      el.style.left = circle.x + 'px';
      el.style.top = circle.y + 'px';
      el.style.width = circle.w + 'px';
      el.style.height = circle.h + 'px';
      board.appendChild(el);
      return el;
    }
    function bindBoardElement(el){
      el.addEventListener('pointerdown', event => {
        event.stopPropagation();
        document.querySelectorAll('.selected').forEach(item => item.classList.remove('selected'));
        el.classList.add('selected');
        selected = el;
        if (mode === 'wire') {
          if (!wireStart) wireStart = el;
          else if (wireStart !== el) { pushUndo(); wirePairs.push([wireStart.dataset.id, el.dataset.id]); wireStart = null; drawWires(); save(); }
          return;
        }
        if (mode !== 'move') return;
        pushUndo();
        el.setPointerCapture(event.pointerId);
        drag = { el, dx: event.clientX - parseFloat(el.style.left), dy: event.clientY - parseFloat(el.style.top) };
      });
    }
    board.addEventListener('pointerdown', event => {
      if (mode !== 'circle') return;
      pushUndo();
      const rect = board.getBoundingClientRect();
      circleStart = { x: event.clientX - rect.left + board.parentElement.scrollLeft, y: event.clientY - rect.top + board.parentElement.scrollTop };
      const el = document.createElement('div');
      el.className = 'circle';
      el.dataset.circleId = 'circle-' + Date.now();
      el.style.left = circleStart.x + 'px'; el.style.top = circleStart.y + 'px'; el.style.width = '1px'; el.style.height = '1px';
      board.appendChild(el);
      circleStart.el = el;
    });
    window.addEventListener('pointermove', event => {
      if (drag) {
        drag.el.style.left = Math.max(0, event.clientX - drag.dx) + 'px';
        drag.el.style.top = Math.max(0, event.clientY - drag.dy) + 'px';
        drawWires();
      }
      if (circleStart) {
        const rect = board.getBoundingClientRect();
        const x = event.clientX - rect.left + board.parentElement.scrollLeft;
        const y = event.clientY - rect.top + board.parentElement.scrollTop;
        circleStart.el.style.left = Math.min(circleStart.x, x) + 'px';
        circleStart.el.style.top = Math.min(circleStart.y, y) + 'px';
        circleStart.el.style.width = Math.abs(x - circleStart.x) + 'px';
        circleStart.el.style.height = Math.abs(y - circleStart.y) + 'px';
      }
    });
    window.addEventListener('pointerup', () => { if (drag || circleStart) save(); drag = null; circleStart = null; });
    document.getElementById('selectMode').onclick = () => setMode('move');
    document.getElementById('wireMode').onclick = () => setMode('wire');
    document.getElementById('circleMode').onclick = () => setMode('circle');
    document.getElementById('addNote').onclick = () => { pushUndo(); makeNote('', 80, 80); save(); };
    document.getElementById('deleteSelected').onclick = () => {
      if (!selected) return;
      pushUndo();
      const id = selected.dataset.id;
      selected.classList.add('hidden');
      selected.classList.remove('selected');
      wirePairs = wirePairs.filter(pair => pair[0] !== id && pair[1] !== id);
      selected = null;
      save();
      drawWires();
    };
    document.getElementById('undoBoard').onclick = () => {
      const previous = undoStack.pop();
      if (previous) restore(previous);
    };
    document.getElementById('resetBoard').onclick = () => { localStorage.removeItem('wml-board-${caseFile.slug}'); location.reload(); };
    document.getElementById('closeModal').onclick = () => modal.classList.remove('open');
    wirePairs = saved.wirePairs || [];
    items.forEach(makeCard);
    starterNotes.forEach((text, index) => makeNote(text, 1160, 90 + index * 116, 'starter-note-' + index));
    (saved.circles || []).forEach(circle => addCircle(circle));
    const maxBottom = Math.max(1150, ...[...document.querySelectorAll('[data-id]')].map(el => parseFloat(el.style.top) + el.offsetHeight + 80));
    board.style.height = maxBottom + 'px';
    drawWires();
  </script>
</body>
</html>`
}

function buildManifest(caseFile: UnsolvedSerialCase, status: ReturnType<typeof getEvidenceArchiveStatus>) {
  const mapPoints = getLocalizedMapPoints(caseFile)

  return JSON.stringify({
    title: caseFile.title,
    slug: caseFile.slug,
    dossierCode: caseFile.dossierCode,
    generatedBy: 'White Mirror Lab',
    editorialRule: 'Only cases with enough downloaded public-source evidence expose paid ZIP checkout.',
    qualityGate: {
      passed: status.isMarketable,
      minimums: {
        substantialFiles: MIN_MARKETABLE_FILES,
        sourceDocuments: MIN_MARKETABLE_SOURCE_DOCUMENTS,
        downloadedBytes: MIN_MARKETABLE_BYTES,
        visualEvidenceScore: MIN_VISUAL_EVIDENCE_SCORE,
      },
      counts: {
        files: status.fileCount,
        pdfs: status.pdfCount,
        images: status.imageCount,
        sourceDocuments: status.sourceDocumentCount,
        downloadedBytes: status.totalBytes,
      },
    },
    files: status.entries.map((entry) => ({
      path: entry.name,
      bytes: entry.content.byteLength,
    })),
    downloadedSources: status.entries
      .filter((entry) => htmlPattern.test(entry.name))
      .map((entry) => ({
        path: entry.name,
        title: titleFromHtml(entry),
        originalSource: sourceFromHtml(entry),
      }))
      .filter((source) => source.originalSource),
    map: {
      pointCount: mapPoints.length,
      files: ['05-case-map.html', '05-case-map-points.csv', '05-case-map.geojson'],
      points: mapPoints.map((point) => ({
        title: point.title,
        category: point.category,
        date: point.date,
        latitude: point.latitude,
        longitude: point.longitude,
        precision: point.precision,
        sourceLabel: point.sourceLabel,
        sourceUrl: point.sourceUrl,
      })),
    },
    sources: caseFile.sources,
  }, null, 2)
}

function getDossierEntries(caseFile: UnsolvedSerialCase, status: ReturnType<typeof getEvidenceArchiveStatus>) {
  return [
    textEntry('00-READ-ME-FIRST.txt', buildReadme(caseFile, status)),
    textEntry('00-manifest.json', buildManifest(caseFile, status)),
    textEntry('01-case-overview.md', buildCaseOverview(caseFile)),
    textEntry('02-source-index.csv', buildSourceIndex(caseFile, status)),
    textEntry('03-evidence-inventory.csv', buildEvidenceInventory(status.entries)),
    textEntry('04-case-board.html', buildCaseBoardHtml(caseFile, status)),
    textEntry('05-case-map.html', buildCaseMapHtml(caseFile)),
    textEntry('05-case-map-points.csv', buildMapPointsCsv(caseFile)),
    textEntry('05-case-map.geojson', buildMapGeoJson(caseFile)),
    textEntry('06-evidence-digest.md', buildEvidenceDigest(caseFile, status)),
  ]
}

export function buildCaseArchive(caseFile: UnsolvedSerialCase) {
  const status = getEvidenceArchiveStatus(caseFile)
  if (!status.isMarketable) {
    throw new Error(`Evidence archive for ${caseFile.slug} does not meet the paid dossier threshold.`)
  }

  const entriesByName = new Map(status.entries.map((entry) => [entry.name, entry]))
  const evidenceEntries = status.entries.map((entry) => inlineLocalImages(entry, entriesByName))
  const archiveEntries = [...getDossierEntries(caseFile, status), ...evidenceEntries]

  const bytes: number[] = []
  const centralDirectory: number[] = []

  for (const entry of archiveEntries) {
    const nameBytes = encoder.encode(entry.name)
    const contentBytes = entry.content
    const checksum = crc32(contentBytes)
    const localHeaderOffset = bytes.length

    pushUint32(bytes, 0x04034b50)
    pushUint16(bytes, 20)
    pushUint16(bytes, 0)
    pushUint16(bytes, 0)
    pushUint16(bytes, 0)
    pushUint16(bytes, 0)
    pushUint32(bytes, checksum)
    pushUint32(bytes, contentBytes.length)
    pushUint32(bytes, contentBytes.length)
    pushUint16(bytes, nameBytes.length)
    pushUint16(bytes, 0)
    pushBytes(bytes, nameBytes)
    pushBytes(bytes, contentBytes)

    pushUint32(centralDirectory, 0x02014b50)
    pushUint16(centralDirectory, 20)
    pushUint16(centralDirectory, 20)
    pushUint16(centralDirectory, 0)
    pushUint16(centralDirectory, 0)
    pushUint16(centralDirectory, 0)
    pushUint16(centralDirectory, 0)
    pushUint32(centralDirectory, checksum)
    pushUint32(centralDirectory, contentBytes.length)
    pushUint32(centralDirectory, contentBytes.length)
    pushUint16(centralDirectory, nameBytes.length)
    pushUint16(centralDirectory, 0)
    pushUint16(centralDirectory, 0)
    pushUint16(centralDirectory, 0)
    pushUint16(centralDirectory, 0)
    pushUint32(centralDirectory, 0)
    pushUint32(centralDirectory, localHeaderOffset)
    pushBytes(centralDirectory, nameBytes)
  }

  const centralDirectoryOffset = bytes.length
  pushBytes(bytes, Uint8Array.from(centralDirectory))

  pushUint32(bytes, 0x06054b50)
  pushUint16(bytes, 0)
  pushUint16(bytes, 0)
  pushUint16(bytes, archiveEntries.length)
  pushUint16(bytes, archiveEntries.length)
  pushUint32(bytes, centralDirectory.length)
  pushUint32(bytes, centralDirectoryOffset)
  pushUint16(bytes, 0)

  return Uint8Array.from(bytes)
}
