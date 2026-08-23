import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, dirname, extname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const evidenceRoot = join(root, 'public', 'blog-evidence')
const headers = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
}

const entityMap = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  rsquo: "'",
  lsquo: "'",
  rdquo: '"',
  ldquo: '"',
  ndash: '-',
  mdash: '-',
}

const investigationTerms = [
  'reward',
  'homicide',
  'murder',
  'murders',
  'abducted',
  'victim',
  'victims',
  'suspect',
  'suspects',
  'composite',
  'sketch',
  'forensic',
  'evidence',
  'investigation',
  'cold case',
  'missing',
  'unidentified',
  'police',
  'detective',
  'body',
  'bodies',
]

const decorativeImageTerms = [
  'avatar',
  'banner',
  'brand',
  'cmp4ech',
  'facebook',
  'favicon',
  'gravatar',
  'header',
  'icon',
  'instagram',
  'linkedin',
  'logo',
  'mayor',
  'ott-rightrail',
  'police-cars-sirens',
  'social',
  'twitter',
  'youtube',
]

const unrelatedArchiveCards = [
  'great-train',
  'identity-parade',
  'kings-bench',
  'recruiting',
  'telephone-crackers',
  'theft-worl',
]

function decodeEntities(value) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(Number.parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (_, name) => entityMap[name] ?? `&${name};`)
}

function fixMojibake(value) {
  return value
    .replaceAll('â€œ', '“')
    .replaceAll('â€', '”')
    .replaceAll('â€\u009d', '”')
    .replaceAll('â€™', '’')
    .replaceAll('â€˜', '‘')
    .replaceAll('â€“', '-')
    .replaceAll('â€”', '-')
    .replaceAll('Â©', '©')
    .replaceAll('Â®', '®')
    .replaceAll('Â', '')
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function attrValue(tag, attr) {
  const match = tag.match(new RegExp(`${attr}\\s*=\\s*["']([^"']+)["']`, 'i'))
  return match ? decodeEntities(match[1]) : ''
}

function safeFileName(value, fallback = 'image') {
  const clean = decodeURIComponent(value)
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 86)
  return clean || fallback
}

function absoluteUrl(value, baseUrl) {
  if (!value || value.startsWith('data:') || value.startsWith('mailto:') || value.startsWith('tel:')) return value
  try {
    return new URL(value, baseUrl).toString()
  } catch {
    return value
  }
}

function extractTitle(html, fallback) {
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]
  const title = h1 ?? html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? fallback
  return fixMojibake(decodeEntities(stripTags(title))).replace(/\s+/g, ' ').trim()
}

function extractCanonical(html) {
  return html.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i)?.[0]
    ? attrValue(html.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i)[0], 'href')
    : ''
}

function shouldKeepImage({ url, alt }, slug) {
  const lower = `${url} ${alt}`.toLowerCase()
  if (!url || lower.includes('.svg')) return false
  if (decorativeImageTerms.some((term) => lower.includes(term))) return false
  if (slug === 'jack-the-ripper' && unrelatedArchiveCards.some((term) => lower.includes(term))) return false
  if (slug === 'west-mesa' && !/(dig2|barela|candelaria|chavez|cloven|edwards|elks|marquez|nieto|romero|salazar|valdez|west.?mesa|bone.?collector)/i.test(lower)) return false
  if (slug === 'chillicothe-six' && /(traffic stop|drug abuse instruments|secure\.gravatar|lights-caravan)/i.test(lower)) return false
  if (slug === 'freeway-phantom' && /mpd[_-]?shield|logo/i.test(lower)) return false
  if (slug === 'the-doodler' && !/(doodler|sfpd|sketch|reward|cold.?case|screen.?shot.*2019|age.?progression)/i.test(lower)) return false
  if (slug === 'monster-of-florence' && /(scrivi|components2\.corriereobjects|files\/image_572_320\/uploads\/2026)/i.test(lower)) return false
  return true
}

function extractImages(html, baseUrl, slug) {
  const urls = new Map()
  const ogTags = html.match(/<meta\b[^>]*(?:property|name)=["']og:image(?::secure_url)?["'][^>]*>/gi) ?? []
  for (const tag of ogTags) {
    const url = absoluteUrl(attrValue(tag, 'content'), baseUrl)
    const image = { url, alt: attrValue(tag, 'alt') || 'Open graph image' }
    if (shouldKeepImage(image, slug)) urls.set(url, image.alt)
  }

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0]
    const src = absoluteUrl(attrValue(tag, 'src') || attrValue(tag, 'data-src'), baseUrl)
    if (!src) continue
    const alt = attrValue(tag, 'alt')
    const image = { url: src, alt: alt || 'Source image' }
    if (!shouldKeepImage(image, slug)) continue
    urls.set(src, image.alt)
  }

  return [...urls.entries()].map(([url, alt]) => ({ url, alt }))
}

function evidenceImageCaption(image, slug) {
  const text = `${image.alt} ${image.source} ${image.src}`.toLowerCase()
  const cleanAlt = image.alt && image.alt !== 'Source image' ? image.alt : 'Original public-source image from the case file.'

  const patterns = [
    {
      test: /ripper-letter|jack-the-rippe|letter handwritten|detective offices|scotland yard|brown envelope/,
      es: 'Documento visual del expediente de The National Archives: carta o sobre atribuido a la correspondencia firmada como Jack the Ripper.',
      en: 'Visual document from The National Archives: letter or envelope tied to correspondence signed as Jack the Ripper.',
    },
    {
      test: /doodler|screen shot.*2019|sfpdnewsreleaseimage|age progression/,
      es: 'Retrato o imagen oficial asociada a las actualizaciones de SFPD sobre el sospechoso conocido como The Doodler.',
      en: 'Official sketch or case image tied to SFPD updates on the suspect known as The Doodler.',
    },
    {
      test: /torso|kingsbury|ness|gerber|shanty|tub|remains|reconstructed/,
      es: 'Fotografia historica del archivo Cleveland Memory relacionada con la investigacion de Kingsbury Run, sus escenas, indicios o actuaciones policiales.',
      en: 'Historical Cleveland Memory photograph connected to the Kingsbury Run investigation, scenes, evidence, or police actions.',
    },
    {
      test: /charlotte|trego|namus|tattoo|original/,
      es: 'Imagen publica de Charlotte Trego/NamUs o de fichas de desaparicion vinculadas al ciclo de Chillicothe.',
      en: 'Public Charlotte Trego/NamUs image or missing-person file material connected to the Chillicothe cycle.',
    },
    {
      test: /barela|candelaria|chavez|cloven|edwards|elks|marquez|nieto|romero|salazar|valdez|dig2/,
      es: 'Imagen publicada por Albuquerque Police/City of Albuquerque dentro del expediente West Mesa; corresponde a victimas, busqueda o escena investigativa.',
      en: 'Image published by Albuquerque Police/City of Albuquerque in the West Mesa file; it corresponds to victims, search activity, or investigative scene context.',
    },
    {
      test: /bible john|1969-2/,
      es: 'Imagen del expediente publico de Bible John usada para contextualizar victimas, sospechoso o reconstrucciones del caso.',
      en: 'Public Bible John case image used to contextualize victims, suspect material, or case reconstructions.',
    },
    {
      test: /servant|girl|police-calls|weed house|ancientgallery|pich/,
      es: 'Material visual del archivo Servant Girl Murders: recorte, ilustracion historica o elemento contextual del Austin de la epoca.',
      en: 'Visual material from the Servant Girl Murders archive: clipping, historical illustration, or period Austin context.',
    },
    {
      test: /mostro|firenze|florence|omicidi/,
      es: 'Imagen periodistica relacionada con la cronologia del Mostro di Firenze y los homicidios investigados.',
      en: 'Press image related to the Monster of Florence chronology and the investigated homicides.',
    },
    {
      test: /jennings|jeff|davis|90\.jpg|poster/,
      es: 'Imagen asociada a la cobertura publica de Jennings 8/Jeff Davis 8 y a la investigacion de esas muertes.',
      en: 'Image associated with public Jennings 8/Jeff Davis 8 coverage and the investigation into those deaths.',
    },
  ]

  const match = patterns.find((pattern) => pattern.test.test(text))
  return {
    es: match?.es ?? `Imagen original incorporada al expediente publico. Descripcion de la fuente: ${cleanAlt}`,
    en: match?.en ?? `Original image included in the public case file. Source description: ${cleanAlt}`,
  }
}

async function downloadImages(images, htmlPath, slug) {
  if (images.length === 0) return []

  const assetsDir = join(dirname(htmlPath), 'assets')
  mkdirSync(assetsDir, { recursive: true })
  const saved = []

  for (const image of images.slice(0, 24)) {
    try {
      const response = await fetch(image.url, { headers, redirect: 'follow' })
      if (!response.ok) continue
      const contentType = response.headers.get('content-type') ?? ''
      if (!contentType.startsWith('image/')) continue
      const bytes = new Uint8Array(await response.arrayBuffer())
      if (bytes.length < 900) continue

      const urlPath = new URL(image.url).pathname
      const extension = extname(urlPath) || contentType.replace('image/', '.').replace('jpeg', 'jpg').split(';')[0]
      const fileName = `${String(saved.length + 1).padStart(2, '0')}-${safeFileName(basename(urlPath, extname(urlPath)), 'evidence-image')}${extension}`
      const target = join(assetsDir, fileName)
      writeFileSync(target, bytes)
      saved.push({ src: `assets/${fileName}`, alt: image.alt, source: image.url, caption: evidenceImageCaption({ ...image, src: `assets/${fileName}`, source: image.url }, slug) })
    } catch {
      // Keep the archive clean: failed image downloads are simply not included.
    }
  }

  return saved
}

function stripTags(value) {
  return value.replace(/<[^>]*>/g, ' ')
}

function pickContent(html) {
  const cleanedArticle = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1]
  if (html.includes('cleaned public-source capture') && cleanedArticle) return cleanedArticle

  const candidates = [
    ...html.matchAll(/<article\b[^>]*>[\s\S]*?<\/article>/gi),
    ...html.matchAll(/<main\b[^>]*>[\s\S]*?<\/main>/gi),
    ...html.matchAll(/<div\b[^>]*(?:class|id)=["'][^"']*(?:content|article|story|node|post|entry|main)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi),
  ].map((match) => match[0])

  if (candidates.length === 0) {
    return html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? html
  }

  return candidates.sort((a, b) => stripTags(b).length - stripTags(a).length)[0]
}

function cleanContent(rawContent, baseUrl) {
  let content = rawContent
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, '')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, '')
    .replace(/<iframe\b[\s\S]*?<\/iframe>/gi, '')
    .replace(/<(nav|header|footer|aside|form|button)\b[\s\S]*?<\/\1>/gi, '')
    .replace(/\s(?:class|id|style|data-[a-z0-9_-]+|aria-[a-z0-9_-]+|role|onclick|onload|target|rel)=("[^"]*"|'[^']*')/gi, '')

  content = content.replace(/<img\b[^>]*>/gi, (tag) => {
    const src = absoluteUrl(attrValue(tag, 'src'), baseUrl)
    const alt = attrValue(tag, 'alt')
    if (!src) return ''
    return `<figure><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"/><figcaption>${escapeHtml(alt)}</figcaption></figure>`
  })

  content = content.replace(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi, (_, href) => {
    const url = absoluteUrl(decodeEntities(href), baseUrl)
    return `<a href="${escapeHtml(url)}">`
  })

  content = content
    .replace(/<(\/?)(div|span|section|main|article|time|small|label|center|font)\b[^>]*>/gi, '')
    .replace(/<(h[1-6]|p|ul|ol|li|table|thead|tbody|tr|th|td|blockquote|figure|figcaption|strong|b|em|i|br|hr|a|img)\b([^>]*)>/gi, '<$1$2>')
    .replace(/<\/(h[1-6]|p|ul|ol|li|table|thead|tbody|tr|th|td|blockquote|figure|figcaption|strong|b|em|i|a)>/gi, '</$1>')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')

  return highlightTerms(paragraphize(content))
}

function highlightTerms(html) {
  const pattern = new RegExp(`\\b(${investigationTerms.map((term) => term.replaceAll(' ', '\\s+')).join('|')})\\b`, 'gi')
  return html
    .split(/(<[^>]+>)/g)
    .map((part) => part.startsWith('<') ? part : part.replace(pattern, '<mark>$1</mark>'))
    .join('')
}

function paragraphize(html) {
  let text = decodeEntities(stripTags(html))
  text = fixMojibake(text)
  text = text
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/Image Screen Shot .*?\d{1,2}:\d{2}\s*(AM|PM)/gi, ' ')
    .replace(/Image [A-Z][^.]{0,140}?(January|February|March|April|May|June|July|August|September|October|November|December)/g, '$1')
    .replace(/([a-z0-9.)])([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-z])\.([A-Z])/g, '$1. $2')
    .replace(/([a-z])(\d{4})/g, '$1 $2')
    .replace(/(View PDF|Share:|facebook|twitter|linkedin|email)/gi, ' ')
    .replace(/Featured News[\s\S]*$/i, '')
    .replace(/Related (News|Articles|Stories)[\s\S]*$/i, '')
    .replace(/Popular Search Terms:[\s\S]*$/i, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (!text) return '<p>Document content could not be extracted cleanly from this public-source capture.</p>'

  const sentences = text
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)

  const paragraphs = []
  let buffer = []
  let length = 0

  for (const sentence of sentences) {
    buffer.push(sentence)
    length += sentence.length
    if (buffer.length >= 3 || length > 420) {
      paragraphs.push(buffer.join(' '))
      buffer = []
      length = 0
    }
  }

  if (buffer.length > 0) paragraphs.push(buffer.join(' '))

  return paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('\n')
}

function toSpanishEvidenceBrief(text) {
  const clean = fixMojibake(decodeEntities(stripTags(text
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, '')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, '')
  ))).replace(/\s+/g, ' ').trim()
  const sentences = clean
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .filter((sentence) => investigationTerms.some((term) => sentence.toLowerCase().includes(term.replace('\\s+', ' '))))
    .slice(0, 8)

  if (sentences.length === 0) {
    return '<p>Este documento conserva una captura limpia de una fuente publica relacionada con el expediente. Revisa la seccion en ingles y las imagenes incluidas para consultar la prueba original.</p>'
  }

  return `<ul>${sentences.map((sentence) => `<li>${escapeHtml(toSpanishBriefSentence(sentence))}</li>`).join('')}</ul>`
}

function toSpanishBriefSentence(sentence) {
  let value = fixMojibake(sentence)
    .replace(/\bHome News\b/gi, '')
    .replace(/\bShare:\b.*?\bView PDF\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  const rules = [
    [/On Wednesday February 6, 2019 at 2:00 PM, the San Francisco Police Department held a news conference at Police Headquarters to provide the community and the news media with an update on the “Doodler” cold case investigation\./i, 'El 6 de febrero de 2019, el Departamento de Policía de San Francisco dio una rueda de prensa en su sede para actualizar públicamente la investigación del caso sin resolver conocido como “The Doodler”.'],
    [/During the news conference, SFPD homicide investigators released new information including a \$100,000 reward, an age progression sketch of the suspect based on a 1975 forensic sketch and audio from a January 27, 1974 call to SFPD dispatch reporting a body along Ocean Beach\./i, 'Los investigadores de homicidios publicaron nueva información: una recompensa de 100.000 dólares, un retrato envejecido del sospechoso basado en un retrato forense de 1975 y audio de una llamada de 1974 que informaba de un cuerpo en Ocean Beach.'],
    [/In the mid-1970s, the San Francisco Police Department investigated several violent assaults of gay white male victims\./i, 'A mediados de los años setenta, SFPD investigó varias agresiones violentas contra hombres gays blancos.'],
    [/At least one victim provided information that led to a forensic sketch of the suspect\./i, 'Al menos una víctima proporcionó información que permitió elaborar un retrato forense del sospechoso.'],
    [/The San Francisco Police Department’s forensic sketch artist completed an age progression sketch that depicts what the suspect may look like today\./i, 'El artista forense de SFPD elaboró un retrato envejecido que mostraba cómo podría verse el sospechoso en la actualidad.'],
    [/Those sketches are part of an SFPD Crime Bulletin announcing a \$100,000 reward for information leading to the arrest and conviction of the assault suspect\./i, 'Los retratos forman parte de un boletín criminal de SFPD que anuncia una recompensa de 100.000 dólares por información que lleve al arresto y condena del sospechoso.'],
    [/One of the assault victims provided information to police that the suspect said he was a cartoonist and was doodling while conversing with the victim in a late night diner\./i, 'Una de las víctimas de agresión declaró a la policía que el sospechoso dijo ser dibujante y que hacía garabatos mientras hablaba con la víctima en un diner nocturno.'],
    [/This information led to the suspect being deemed “The Doodler\.”/i, 'Esa información dio origen al apodo “The Doodler”.'],
    [/A suspect was detained in 1976, but was never charged\./i, 'Un sospechoso fue detenido en 1976, pero nunca fue acusado formalmente.'],
    [/During the same period of time, five gay, white male victims were found murdered in the Ocean Beach \/ Golden Gate Park area\./i, 'En el mismo periodo, cinco hombres gays blancos fueron encontrados asesinados en la zona de Ocean Beach y Golden Gate Park.'],
    [/Connections between the “Doodler” attacks and the five homicides led investigators in the SFPD Homicide \/ Cold Case Unit to believe the same suspect is responsible for both sets of crimes\./i, 'Las conexiones entre las agresiones atribuidas al Doodler y los cinco homicidios llevaron a la unidad de homicidios/casos fríos de SFPD a considerar que el mismo sospechoso podía ser responsable de ambos grupos de delitos.'],
  ]

  for (const [pattern, replacement] of rules) {
    if (pattern.test(value)) return replacement
  }

  const translated = value
    .replace(/\bPolice Department\b/gi, 'Departamento de Policía')
    .replace(/\bpolice\b/gi, 'policía')
    .replace(/\bPolice\b/g, 'Policía')
    .replace(/\bhomicide investigators\b/gi, 'investigadores de homicidios')
    .replace(/\bhomicide\b/gi, 'homicidio')
    .replace(/\bcold case investigation\b/gi, 'investigación de caso sin resolver')
    .replace(/\bcold case\b/gi, 'caso sin resolver')
    .replace(/\binvestigation\b/gi, 'investigación')
    .replace(/\binvestigators\b/gi, 'investigadores')
    .replace(/\breward\b/gi, 'recompensa')
    .replace(/\bage progression sketch\b/gi, 'retrato envejecido')
    .replace(/\bforensic sketch\b/gi, 'retrato forense')
    .replace(/\bsketch\b/gi, 'retrato')
    .replace(/\bsuspect\b/gi, 'sospechoso')
    .replace(/\bvictims\b/gi, 'víctimas')
    .replace(/\bvictim\b/gi, 'víctima')
    .replace(/\bbody\b/gi, 'cuerpo')
    .replace(/\bbodies\b/gi, 'cuerpos')
    .replace(/\bunidentified\b/gi, 'no identificado')
    .replace(/\bmissing\b/gi, 'desaparecido')

  const englishWords = translated.match(/\b(the|and|was|were|with|from|that|this|what|today|provided|completed|during|same|period|time)\b/gi)?.length ?? 0
  if (englishWords > 4) {
    return `Dato relevante del documento original: ${value}`
  }

  return translated
}

function buildEvidenceHtml({ title, sourceUrl, content, images, spanishBrief }) {
  const gallery = images.length > 0
    ? `<section class="gallery"><h2>Evidence images / Imagenes de prueba</h2>${images.map((image) => `<figure><img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}"/><figcaption><strong>ES:</strong> ${escapeHtml(image.caption.es)}<br/><strong>EN:</strong> ${escapeHtml(image.caption.en)}<br/><span>Fuente / Source: <a href="${escapeHtml(image.source)}">${escapeHtml(image.source)}</a></span></figcaption></figure>`).join('')}</section>`
    : ''

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
    .kicker{font:11px/1.4 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--accent)}
    h1{font-size:clamp(36px,6vw,76px);line-height:.96;margin:12px 0 18px;letter-spacing:0}
    .source{display:inline-flex;max-width:100%;overflow-wrap:anywhere;color:var(--muted);font-size:14px}
    .source a{color:var(--accent)}
    article,.spanish-brief{display:grid;gap:18px}
    .lang-label{font:11px/1.4 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin:28px 0 8px}
    h2,h3,h4{margin:28px 0 4px;line-height:1.12}h2{font-size:30px}h3{font-size:23px}
    p,li,td,th,blockquote{font-size:18px;color:#d2cbc1}
    p{margin:0}ul,ol{padding-left:22px}li+li{margin-top:8px}
    a{color:var(--accent)}mark{background:rgba(200,255,0,.18);color:var(--ink);padding:.08em .18em;border:1px solid rgba(200,255,0,.28)}
    .gallery{display:grid;gap:14px;margin:0 0 34px}.gallery h2{color:var(--accent);font:13px ui-monospace,SFMono-Regular,Consolas,monospace;text-transform:uppercase;letter-spacing:.14em}
    figure{margin:0;border:1px solid var(--line);background:#0c0c0c;padding:12px}img{max-width:100%;height:auto;display:block;margin:auto}
    figcaption{margin-top:8px;color:var(--muted);font-size:13px}
    table{width:100%;border-collapse:collapse;display:block;overflow-x:auto}td,th{border:1px solid var(--line);padding:10px;text-align:left}
    blockquote{border-left:3px solid var(--accent);padding-left:16px;margin-left:0;color:#e8e2d8}
    @media(max-width:560px){main{width:min(100% - 24px,920px);padding-top:28px}p,li,td,th,blockquote{font-size:16px}h2{font-size:25px}}
  </style>
</head>
<body>
  <main>
    <header>
      <div class="kicker">Clean public-source evidence document</div>
      <h1>${escapeHtml(title)}</h1>
      ${sourceUrl ? `<div class="source">Original source: <a href="${escapeHtml(sourceUrl)}">${escapeHtml(sourceUrl)}</a></div>` : ''}
    </header>
    ${gallery}
    <section class="spanish-brief">
      <div class="lang-label">Español / lectura de la prueba</div>
      ${spanishBrief}
    </section>
    <div class="lang-label">English / original extracted source text</div>
    <article>
${content}
    </article>
  </main>
</body>
</html>`
}

async function walk(dir) {
  for (const item of readdirSync(dir)) {
    const filePath = join(dir, item)
    const stats = statSync(filePath)
    if (stats.isDirectory()) {
      if (item === 'assets') continue
      await walk(filePath)
      continue
    }
    if (!filePath.endsWith('.html')) continue

    const raw = readFileSync(filePath, 'utf8')

    const sourceUrl = extractCanonical(raw)
    const baseUrl = sourceUrl || 'https://example.com/'
    const title = extractTitle(raw, relative(evidenceRoot, filePath))
    const picked = pickContent(raw)
    const slug = relative(evidenceRoot, dirname(filePath)).split(/[\\/]/)[0]
    const images = await downloadImages(extractImages(picked, baseUrl, slug), filePath, slug)
    const content = cleanContent(picked, baseUrl)
    const spanishBrief = toSpanishEvidenceBrief(picked)
    writeFileSync(filePath, buildEvidenceHtml({ title, sourceUrl, content, images, spanishBrief }), 'utf8')
  }
}

if (existsSync(evidenceRoot)) {
  await walk(evidenceRoot)
}
