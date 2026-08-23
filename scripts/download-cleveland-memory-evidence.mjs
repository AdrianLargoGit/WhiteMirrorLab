import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const caseDir = join(root, 'public', 'blog-evidence', 'cleveland-torso')
const assetsDir = join(caseDir, 'assets')
const ids = [30, 52, 54, 56, 59, 61, 67, 69, 72]

const headers = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  accept: 'application/json,image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function field(item, key) {
  return item.fields?.find((entry) => entry.key === key)?.value ?? ''
}

function safeFileName(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 82)
}

function spanishDescription(item) {
  const title = field(item, 'title')
  const date = field(item, 'date')
  const subject = field(item, 'subjec')
  const description = field(item, 'descri')
  return [
    `Ficha fotografica publica del Cleveland Memory Project relacionada con los Torso Murders/Kingsbury Run.`,
    title ? `Titulo archivistico: ${title}.` : '',
    date ? `Fecha original indicada por el archivo: ${date}.` : '',
    subject ? `Materias archivisticas: ${subject}.` : '',
    description ? `Descripcion del archivo: ${description}` : '',
  ].filter(Boolean).join(' ')
}

function buildHtml(item, imageFile) {
  const title = field(item, 'title') || `Cleveland Memory record ${item.id}`
  const description = field(item, 'descri')
  const date = field(item, 'date')
  const subject = field(item, 'subjec')
  const identifier = field(item, 'identi')
  const sourceUrl = `https://clevelandmemory.contentdm.oclc.org/digital/collection/press/id/${item.id}/`
  const spanish = spanishDescription(item)

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${escapeHtml(title)}</title>
  <style>
    :root{color-scheme:dark;--bg:#080808;--paper:#111;--ink:#f5f2ee;--muted:#aaa39a;--line:#303030;--accent:#c8ff00}
    *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:Arial,Helvetica,sans-serif;line-height:1.72}
    main{width:min(920px,calc(100% - 32px));margin:0 auto;padding:42px 0 72px}
    header{border-bottom:1px solid var(--line);padding-bottom:24px;margin-bottom:30px}
    .kicker,.lang-label{font:11px/1.4 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--accent)}
    h1{font-size:clamp(36px,6vw,76px);line-height:.96;margin:12px 0 18px;letter-spacing:0}
    p,li{font-size:18px;color:#d2cbc1}.source{overflow-wrap:anywhere;color:var(--muted);font-size:14px}.source a,a{color:var(--accent)}
    figure{margin:0 0 28px;border:1px solid var(--line);background:#0c0c0c;padding:12px}img{max-width:100%;height:auto;display:block;margin:auto}
    figcaption{margin-top:8px;color:var(--muted);font-size:13px}
    dl{display:grid;grid-template-columns:170px 1fr;gap:8px 16px;border-top:1px solid var(--line);padding-top:18px}dt{color:var(--accent);font:12px ui-monospace,SFMono-Regular,Consolas,monospace;text-transform:uppercase}dd{margin:0;color:#d2cbc1}
    @media(max-width:560px){main{width:min(100% - 24px,920px);padding-top:28px}p,li{font-size:16px}dl{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <main>
    <header>
      <div class="kicker">Cleveland Memory public evidence record</div>
      <h1>${escapeHtml(title)}</h1>
      <div class="source">Original source: <a href="${escapeHtml(sourceUrl)}">${escapeHtml(sourceUrl)}</a></div>
    </header>
    <figure>
      <img src="assets/${escapeHtml(imageFile)}" alt="${escapeHtml(title)}"/>
      <figcaption><strong>ES:</strong> ${escapeHtml(spanish)}<br/><strong>EN:</strong> ${escapeHtml(description || title)}</figcaption>
    </figure>
    <section>
      <div class="lang-label">Español / lectura de la prueba</div>
      <p>${escapeHtml(spanish)}</p>
    </section>
    <section>
      <div class="lang-label">English / archive metadata</div>
      <p>${escapeHtml(description || 'No long description was exposed by the public archive API.')}</p>
      <dl>
        <dt>Identifier</dt><dd>${escapeHtml(identifier)}</dd>
        <dt>Date</dt><dd>${escapeHtml(date)}</dd>
        <dt>Subject</dt><dd>${escapeHtml(subject)}</dd>
        <dt>Repository</dt><dd>${escapeHtml(field(item, 'reposi'))}</dd>
      </dl>
    </section>
  </main>
</body>
</html>`
}

mkdirSync(assetsDir, { recursive: true })

for (const id of ids) {
  const apiUrl = `https://clevelandmemory.contentdm.oclc.org/digital/api/singleitem/collection/press/id/${id}`
  const item = await fetch(apiUrl, { headers }).then((response) => {
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
    return response.json()
  })
  item.id = id

  const title = field(item, 'title') || `cleveland-memory-${id}`
  const baseName = `${id}-${safeFileName(title)}`
  const imageFile = `${baseName}.jpg`
  const imageResponse = await fetch(item.imageUri, { headers })
  if (!imageResponse.ok) throw new Error(`image ${id}: ${imageResponse.status} ${imageResponse.statusText}`)

  writeFileSync(join(assetsDir, imageFile), new Uint8Array(await imageResponse.arrayBuffer()))
  writeFileSync(join(caseDir, `${baseName}.html`), buildHtml(item, imageFile), 'utf8')
  console.log(`saved Cleveland Memory ${id}`)
}
