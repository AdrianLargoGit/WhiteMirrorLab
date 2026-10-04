import type { CoderCategory, CoderRepository } from '../data/coder-repositories'

export type GithubRepository = {
  url: string
  name: string
  fullName: string
  owner: string
  avatar: string | null
  description: string | null
  category: CoderCategory
  recommended: boolean
  stars: number | null
  forks: number | null
  subscribers: number | null
  issuesAndPullRequests: number | null
  language: string | null
  license: string | null
  topics: string[]
  homepage: string | null
  createdAt: string | null
  pushedAt: string | null
  defaultBranch: string | null
  archived: boolean
  isFork: boolean
  fetchedAt: string | null
  status: 'ready' | 'stale' | 'unavailable' | 'not-found' | 'invalid-url'
}

const HOUR = 60 * 60 * 1000

export function parseGithubUrl(value: string) {
  try {
    const url = new URL(value.trim())
    if (url.protocol !== 'https:' || url.hostname !== 'github.com' || url.username || url.password || url.port) return null
    const parts = url.pathname.replace(/\/+$/, '').split('/').filter(Boolean)
    if (parts.length !== 2 || !/^[a-zA-Z0-9-]{1,39}$/.test(parts[0])) return null
    const repo = parts[1].replace(/\.git$/, '')
    if (!/^[a-zA-Z0-9._-]{1,100}$/.test(repo) || repo === '.' || repo === '..') return null
    return { owner: parts[0], repo, url: `https://github.com/${parts[0]}/${repo}` }
  } catch { return null }
}

function website(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : null
  } catch { return null }
}

function date(value: unknown) {
  return typeof value === 'string' && Number.isFinite(Date.parse(value)) ? value : null
}

function count(value: unknown) {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : null
}

function text(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null
}

// Señales específicas pesan más que palabras genéricas. Los temas de GitHub
// describen el propósito del proyecto; el lenguaje no basta para inferirlo.
const categorySignals: { category: CoderCategory; topics: RegExp; description: RegExp; name: RegExp }[] = [
  { category: 'security', topics: /(?:^|[-_])(?:security|cybersecurity|pentest|penetration-testing|osint|red-teaming|bug-bounty)(?:$|[-_])/, description: /penetration test|pentest|\bosint\b|security analysts?|vulnerabilit|cybersecurity|ip reputation|red.team/i, name: /(?:^|[/-])(?:pentest|osint|security|geo-recon)(?:$|[-_])/ },
  { category: 'media', topics: /(?:^|[-_])(?:photo|photos|video|videos|media|media-server|streaming|watermark|image-processing)(?:$|[-_])/, description: /photo and video|photo management|video management|media (?:system|server|library)|streaming (?:server|platform)|watermarks?|image editor/i, name: /(?:^|[/-])(?:immich|jellyfin|watermarks-remover)(?:$|[-_])/ },
  { category: 'business', topics: /(?:^|[-_])(?:billing|payments?|ecommerce|logistics|supply-chain|erp)(?:$|[-_])/, description: /billing|payment platform|logistics|supply chain|e.commerce|merchant|invoic/i, name: /(?:^|[/-])(?:fleetbase|polar)(?:$|[-_])/ },
  { category: 'learning', topics: /(?:^|[-_])(?:education|tutorials?|curriculum|roadmaps?|learning-resources)(?:$|[-_])/, description: /developer roadmaps?|learn (?:to )?(?:code|program)|coding curriculum|programming courses?|educational content|tutorials?/i, name: /(?:^|[/-])(?:freecodecamp|developer-roadmap)(?:$|[-_])/ },
  { category: 'automation', topics: /(?:^|[-_])(?:automation|workflows?|orchestration|job-scheduler|synchronization|file-sync)(?:$|[-_])/, description: /workflow|automat(?:e|ion)|orchestrat|job schedul|sync(?:hroniz)? (?:files|folders)|continuous file synchronization|cron job/i, name: /(?:^|[/-])(?:n8n|syncthing|dagu)(?:$|[-_])/ },
  { category: 'infrastructure', topics: /(?:^|[-_])(?:infrastructure|deployment|devops|hosting|backend|backend-as-a-service|baas)(?:$|[-_])/, description: /cloud infrastructure|deployment platform|self.hosted deployment|backend (?:platform|in one file|as a service)|server infrastructure/i, name: /(?:^|[/-])(?:openship|pocketbase|appwrite)(?:$|[-_])/ },
  { category: 'data', topics: /(?:^|[-_])(?:postgres|postgresql|database|json|geospatial|spatial-data|data-analysis|data-science)(?:$|[-_])/, description: /postgres|\bjson\b|spatial intelligence|geospatial|data analys|data.science|database platform/i, name: /(?:^|[/-])(?:jq|supabase|gods-eye-view)(?:$|[-_])/ },
  { category: 'web', topics: /(?:^|[-_])(?:frontend|front-end|web-framework|whiteboard|diagramming|design-tool|react-framework)(?:$|[-_])/, description: /react framework|web framework|virtual whiteboard|hand.drawn diagrams?|web design tool|frontend framework/i, name: /(?:^|[/-])(?:excalidraw|next\.js)(?:$|[-_])/ },
  { category: 'ai', topics: /(?:^|[-_])(?:llm|large-language-model|ai-agent|ai-agents|machine-learning|deep-learning|artificial-intelligence|generative-ai)(?:$|[-_])/, description: /\bllms?\b|language models?|\bai agents?\b|coding agents?|machine learning|artificial intelligence|model endpoints?|generative ai/i, name: /(?:^|[/-])(?:ollama|transformers|langwatch|orca|multica|freellmapi)(?:$|[-_])/ },
  { category: 'development', topics: /(?:^|[-_])(?:developer-tools|code-editor|code-review|package-manager|github-actions|cli)(?:$|[-_])/, description: /code editor|package manager|github bot|developer tool|programming language/i, name: /(?:^|[/-])(?:vscode|uv|pullfrog)(?:$|[-_])/ },
]

export function inferCoderCategory(fullName: string, topics: string[], description: string | null, language: string | null): CoderCategory {
  const name = fullName.toLowerCase()
  const summary = description ?? ''
  let best: CoderCategory = 'development'
  let bestScore = 0
  for (const signal of categorySignals) {
    const topicHits = topics.filter(topic => signal.topics.test(topic.toLowerCase())).length
    const score = Math.min(topicHits, 3) * 5 + (signal.description.test(summary) ? 5 : 0) + (signal.name.test(name) ? 4 : 0)
      + (signal.category === 'web' && ['HTML', 'CSS'].includes(language ?? '') ? 1 : 0)
    if (score > bestScore) { best = signal.category; bestScore = score }
  }
  return best
}

export function prioritizeRepositories(repositories: GithubRepository[]) {
  // El sort estable conserva el orden editorial dentro de cada grupo.
  return [...repositories].sort((a, b) => Number(b.recommended) - Number(a.recommended))
}

function fallback(entry: CoderRepository, status: GithubRepository['status']): GithubRepository {
  const parsed = parseGithubUrl(entry.url)
  return {
    url: parsed?.url ?? '', name: parsed?.repo ?? 'GitHub',
    fullName: parsed ? `${parsed.owner}/${parsed.repo}` : entry.url,
    owner: parsed?.owner ?? '', avatar: null, description: null,
    category: entry.category ?? inferCoderCategory(parsed?.url ?? '', [], null, null), recommended: Boolean(entry.recommended),
    stars: null, forks: null, subscribers: null, issuesAndPullRequests: null,
    language: null, license: null, topics: [], homepage: null,
    createdAt: null, pushedAt: null, defaultBranch: null, archived: false, isFork: false,
    fetchedAt: null, status,
  }
}

// Inyectar fetch y reloj permite comprobar fallos, caché y límites sin llamadas reales.
export function createGithubRepositoryLoader({
  request = fetch,
  token,
  now = Date.now,
}: { request?: typeof fetch; token?: string; now?: () => number } = {}) {
  const cache = new Map<string, { repo: GithubRepository; expires: number }>()
  const pending = new Map<string, Promise<GithubRepository>>()
  let cooldownUntil = 0

  async function fetchRepository(entry: CoderRepository): Promise<GithubRepository> {
    const parsed = parseGithubUrl(entry.url)
    if (!parsed) return fallback(entry, 'invalid-url')
    const key = parsed.url.toLowerCase()
    const cached = cache.get(key)
    if (cached && cached.expires > now()) return { ...cached.repo, recommended: Boolean(entry.recommended), category: entry.category ?? inferCoderCategory(cached.repo.fullName, cached.repo.topics, cached.repo.description, cached.repo.language) }
    if (pending.has(key)) {
      const result = await pending.get(key)!
      return { ...result, recommended: Boolean(entry.recommended), category: entry.category ?? inferCoderCategory(result.fullName, result.topics, result.description, result.language) }
    }
    const work = (async () => {
      let blocked = false
      try {
        if (now() < cooldownUntil) throw new Error('GitHub cooldown')
        const headers: Record<string, string> = {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2026-03-10',
          'User-Agent': 'WhiteMirrorLab-Coder',
        }
        if (token) headers.Authorization = `Bearer ${token}`
        const response = await request(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`, {
          headers, signal: AbortSignal.timeout(8000), next: { revalidate: 3600 },
        } as RequestInit & { next: { revalidate: number } })
        if (response.status === 404) {
          blocked = true
          throw new Error('Not public')
        }
        if (response.status === 429 || response.status === 403) {
          const reset = Number(response.headers.get('x-ratelimit-reset')) * 1000
          const retry = Number(response.headers.get('retry-after')) * 1000
          cooldownUntil = Math.max(now() + 60_000, Number.isFinite(reset) ? reset : 0, now() + (Number.isFinite(retry) ? retry : 0))
        }
        if (!response.ok) throw new Error('GitHub unavailable')
        const data = await response.json()
        if (data.private !== false || data.visibility === 'private') {
          blocked = true
          throw new Error('Not public')
        }
        const canonical = typeof data.html_url === 'string' ? parseGithubUrl(data.html_url) : null
        if (!canonical || typeof data.name !== 'string' || typeof data.owner?.login !== 'string') throw new Error('Invalid GitHub data')
        const topics = Array.isArray(data.topics) ? data.topics.filter((item: unknown): item is string => typeof item === 'string') : []
        const description = text(data.description)
        const language = text(data.language)
        const avatar = website(data.owner.avatar_url)
        const license = data.license?.spdx_id && data.license.spdx_id !== 'NOASSERTION' ? text(data.license.spdx_id) : text(data.license?.name)
        const repo: GithubRepository = {
          url: canonical.url, name: data.name, fullName: `${canonical.owner}/${canonical.repo}`,
          owner: data.owner.login,
          avatar: avatar && new URL(avatar).hostname === 'avatars.githubusercontent.com' ? avatar : null,
          description, category: inferCoderCategory(canonical.url, topics, description, language),
          recommended: Boolean(entry.recommended),
          stars: count(data.stargazers_count), forks: count(data.forks_count),
          subscribers: count(data.subscribers_count), issuesAndPullRequests: count(data.open_issues_count),
          language, license, topics, homepage: website(data.homepage),
          createdAt: date(data.created_at), pushedAt: date(data.pushed_at),
          defaultBranch: text(data.default_branch), archived: data.archived === true, isFork: data.fork === true,
          fetchedAt: new Date(now()).toISOString(), status: 'ready',
        }
        cache.set(key, { repo, expires: now() + HOUR })
        return { ...repo, category: entry.category ?? repo.category }
      } catch {
        const result = blocked ? fallback(entry, 'not-found')
          : cached?.repo.fetchedAt ? { ...cached.repo, status: 'stale' as const }
          : fallback(entry, 'unavailable')
        cache.set(key, { repo: result, expires: now() + 60_000 })
        return { ...result, recommended: Boolean(entry.recommended), category: entry.category ?? inferCoderCategory(result.fullName, result.topics, result.description, result.language) }
      }
    })()
    pending.set(key, work)
    try { return await work } finally { pending.delete(key) }
  }

  return async (entries: CoderRepository[]): Promise<GithubRepository[]> => {
    const unique = [...new Map(entries.map(entry => [parseGithubUrl(entry.url)?.url.toLowerCase() ?? entry.url, entry])).values()]
    const results: GithubRepository[] = []
    // Cuatro peticiones simultáneas como máximo; las siguientes respetan el cooldown.
    for (let i = 0; i < unique.length; i += 4) {
      results.push(...await Promise.all(unique.slice(i, i + 4).map(fetchRepository)))
    }
    return prioritizeRepositories(results)
  }
}
