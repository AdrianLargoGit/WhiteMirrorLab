import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import Module from 'node:module'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const filename = fileURLToPath(new URL('../src/lib/github-repositories.ts', import.meta.url))
const compiled = ts.transpileModule(readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText
const implementation = new Module(filename)
implementation._compile(compiled, filename)
const { createGithubRepositoryLoader, parseGithubUrl, inferCoderCategory } = implementation.exports

const fixture = (name = 'widget', overrides = {}) => ({
  private: false, visibility: 'public', name, html_url: `https://github.com/example/${name}`,
  owner: { login: 'example', avatar_url: 'https://avatars.githubusercontent.com/u/123?v=4' },
  description: 'A development tool', stargazers_count: 12500, forks_count: 400,
  watchers_count: 12500, subscribers_count: 72, open_issues_count: 18,
  topics: ['python', 'cli'], language: 'Python', license: { spdx_id: 'MIT', name: 'MIT License' },
  homepage: 'https://example.com', created_at: '2020-01-01T00:00:00Z',
  pushed_at: '2026-09-20T12:00:00Z', default_branch: 'main', archived: false, fork: false,
  ...overrides,
})
const entry = (name = 'widget', extra = {}) => ({ url: `https://github.com/example/${name}`, ...extra })
const ok = (data) => new Response(JSON.stringify(data), { status: 200 })

test('accepts repository URLs and rejects arbitrary hosts, credentials and subpaths', () => {
  assert.equal(parseGithubUrl('https://github.com/example/widget.git/').url, entry().url)
  for (const url of ['http://github.com/example/widget', 'https://github.com.evil.com/example/widget', 'https://secret@github.com/example/widget', 'https://github.com/example/widget/tree/main', 'https://github.com/example', 'https://127.0.0.1/a/b', 'javascript:alert(1)']) {
    assert.equal(parseGithubUrl(url), null, url)
  }
})

test('loads metadata from the URL and uses actual subscribers rather than star-based watchers_count', async () => {
  let calls = 0
  const load = createGithubRepositoryLoader({ request: async (url, options) => {
    calls++
    assert.equal(url, 'https://api.github.com/repos/example/widget')
    assert.equal(options.next.revalidate, 3600)
    return ok(fixture())
  } })
  const [repo] = await load([entry()])
  assert.equal(calls, 1)
  assert.equal(repo.name, 'widget')
  assert.equal(repo.stars, 12500)
  assert.equal(repo.subscribers, 72)
  assert.equal(repo.issuesAndPullRequests, 18)
  assert.equal(repo.avatar, 'https://avatars.githubusercontent.com/u/123?v=4')
  assert.equal(repo.language, 'Python')
  assert.equal(repo.license, 'MIT')
  assert.equal(repo.status, 'ready')
})

test('puts recommended entries first while preserving editorial order and deduplicating URLs', async () => {
  const load = createGithubRepositoryLoader({ request: async url => ok(fixture(url.split('/').at(-1))) })
  const repos = await load([entry('a'), entry('b', { recommended: true }), entry('c'), entry('d', { recommended: true }), entry('a')])
  assert.deepEqual(repos.map(repo => repo.name), ['b', 'd', 'a', 'c'])
})

test('caches successful metadata for an hour without caching the editorial recommendation', async () => {
  let clock = 0, calls = 0
  const load = createGithubRepositoryLoader({ now: () => clock, request: async () => { calls++; return ok(fixture()) } })
  await load([entry()])
  clock = 3599999
  const [recommended] = await load([entry('widget', { recommended: true, category: 'ai' })])
  assert.equal(calls, 1)
  assert.equal(recommended.recommended, true)
  assert.equal(recommended.category, 'ai')
  clock = 3600001
  await load([entry()])
  assert.equal(calls, 2)
})

test('keeps stale metadata on transient errors but never invents counts on first-load failures', async () => {
  let clock = 0, broken = false
  const load = createGithubRepositoryLoader({ now: () => clock, request: async () => {
    if (broken) throw new Error('Network unavailable')
    return ok(fixture())
  } })
  await load([entry()])
  clock = 3600001; broken = true
  const [stale] = await load([entry()])
  assert.equal(stale.status, 'stale')
  assert.equal(stale.stars, 12500)
  const [missing] = await load([entry('unknown')])
  assert.equal(missing.status, 'unavailable')
  assert.equal(missing.stars, null)
})

test('rejects private metadata, drops prior data on a 404, and sanitizes unsafe external links', async () => {
  let clock = 0, response = ok(fixture())
  const load = createGithubRepositoryLoader({ now: () => clock, request: async () => response.clone() })
  await load([entry()]); clock = 3600001
  response = new Response('{}', { status: 404 })
  const [deleted] = await load([entry()])
  assert.equal(deleted.status, 'not-found')
  assert.equal(deleted.stars, null)
  response = ok(fixture('private', { private: true }))
  const [privateRepo] = await load([entry('private')])
  assert.equal(privateRepo.status, 'not-found')
  assert.equal(privateRepo.description, null)
  response = ok(fixture('unsafe', { homepage: 'javascript:alert(1)', owner: { login: 'example', avatar_url: 'https://evil.example/avatar.png' } }))
  const [safe] = await load([entry('unsafe')])
  assert.equal(safe.homepage, null)
  assert.equal(safe.avatar, null)
})

test('honors rate-limit reset and does not repeat blocked requests', async () => {
  let clock = 1000000, calls = 0
  const load = createGithubRepositoryLoader({ now: () => clock, request: async () => {
    calls++
    return new Response('{}', { status: 429, headers: { 'x-ratelimit-reset': '2000' } })
  } })
  const [repo] = await load([entry()])
  assert.equal(repo.status, 'unavailable')
  clock += 60001
  await load([entry(), entry('another')])
  assert.equal(calls, 1)
  clock = 2000001
  await load([entry()])
  assert.equal(calls, 2)
})

test('handles renamed URLs, automatic categories, empty metadata and invalid catalogue entries', async () => {
  const load = createGithubRepositoryLoader({ request: async () => ok(fixture('new-name', {
    description: 'Run language models locally', topics: ['llm'],
    license: null, language: null, pushed_at: null, stargazers_count: -1,
  })) })
  const [renamed] = await load([entry('old-name')])
  assert.equal(renamed.url, 'https://github.com/example/new-name')
  assert.equal(renamed.category, 'ai')
  assert.equal(renamed.license, null)
  assert.equal(renamed.pushedAt, null)
  assert.equal(renamed.stars, null)
  const [invalid] = await load([{ url: 'https://example.com/a/b' }])
  assert.equal(invalid.status, 'invalid-url')
  assert.equal(invalid.url, '')
})

test('classifies real catalogue use cases by purpose, including security, media, business and infrastructure', () => {
  const cases = [
    ['langwatch/langwatch', 'The platform for LLM evaluations and AI agent testing', 'ai'],
    ['stablyai/orca', 'ADE for working with a fleet of parallel coding agents', 'ai'],
    ['multica-ai/multica', 'Make humans and AI agents work as one team', 'ai'],
    ['tashfeenahmed/freellmapi', '34 free LLM providers and hundreds of model endpoints', 'ai'],
    ['usestrix/strix', 'Open-source AI penetration testing tool to find vulnerabilities', 'security'],
    ['radioactivetobi/geo-recon', 'OSINT CLI tool for IP Reputation lookup for Security Analysts', 'security'],
    ['immich-app/immich', 'High performance self-hosted photo and video management solution', 'media'],
    ['jellyfin/jellyfin', 'The Free Software Media System - Server Backend & API', 'media'],
    ['guillaumemeyer/watermarks-remover', 'App that strips AI watermarks from content you own', 'media'],
    ['fleetbase/fleetbase', 'Modular logistics and supply chain operating system', 'business'],
    ['polarsource/polar', 'A billing platform for the intelligence era', 'business'],
    ['oblien/openship', 'Self-hosted deployment platform', 'infrastructure'],
    ['pocketbase/pocketbase', 'Open source realtime backend in 1 file', 'infrastructure'],
    ['appwrite/appwrite', 'Complete cloud infrastructure for web, mobile and AI apps including databases', 'infrastructure'],
    ['dagucloud/dagu', 'Self-hostable workflow orchestrator for teams', 'automation'],
    ['n8n-io/n8n', 'Fair-code workflow automation platform with native AI capabilities', 'automation'],
    ['syncthing/syncthing', 'Open Source Continuous File Synchronization', 'automation'],
    ['bilawalsidhu/gods-eye-view', 'Live open source spatial intelligence on a 3D globe', 'data'],
    ['supabase/supabase', 'The Postgres development platform', 'data'],
    ['jqlang/jq', 'Command-line JSON processor', 'data'],
    ['excalidraw/excalidraw', 'Virtual whiteboard for sketching hand-drawn diagrams', 'web'],
    ['vercel/next.js', 'The React Framework', 'web'],
    ['freeCodeCamp/freeCodeCamp', 'Open-source coding curriculum', 'learning'],
    ['nilbuild/developer-roadmap', 'Interactive roadmaps for developers', 'learning'],
    ['pullfrog/pullfrog', 'Model-agnostic GitHub bot that runs in GitHub Actions', 'development'],
    ['microsoft/vscode', 'Open-source code editor', 'development'],
    ['astral-sh/uv', 'Python package manager written in Rust', 'development'],
  ]
  for (const [name, description, expected] of cases) {
    assert.equal(inferCoderCategory(name, [], description, null), expected, name)
  }
})

test('specific security topics beat generic AI topics; HTML alone does not override a clear purpose', () => {
  assert.equal(inferCoderCategory('example/pentest', ['ai', 'ai-security', 'penetration-testing'], 'AI penetration testing for web apps', 'Python'), 'security')
  assert.equal(inferCoderCategory('example/logistics', ['web', 'logistics'], 'Supply chain operating system', 'HTML'), 'business')
  assert.equal(inferCoderCategory('example/app', [], 'A web page', 'HTML'), 'web')
})

test('mixed real GitHub topics do not misclassify the catalogue', () => {
  assert.equal(inferCoderCategory('stablyai/orca', ['agent-ide', 'ai-agents', 'cli', 'orchestration', 'parallel-agents'], 'Orca is the ADE for working with a fleet of parallel agents. Run any coding agent with your own subscription.', 'TypeScript'), 'ai')
  assert.equal(inferCoderCategory('dagucloud/dagu', ['agentic-workflows', 'ai-agents', 'ai-workflows', 'llm', 'task-automation', 'workflow-engine', 'workflow-orchestration'], 'Self-hostable workflow orchestrator for teams.', 'Go'), 'automation')
  assert.equal(inferCoderCategory('appwrite/appwrite', ['backend', 'backend-as-a-service', 'hosting', 'nextjs', 'supabase', 'web'], 'Complete cloud infrastructure for web, mobile and AI apps, including databases.', 'PHP'), 'infrastructure')
  assert.equal(inferCoderCategory('fleetbase/fleetbase', ['infrastructure', 'logistics', 'supply-chain-management', 'route-optimization'], 'Modular logistics and supply chain operating system.', 'JavaScript'), 'business')
  assert.equal(inferCoderCategory('usestrix/strix', ['ai-security', 'artificial-intelligence', 'cybersecurity', 'penetration-testing', 'security-automation'], 'Open-source AI penetration testing tool to find vulnerabilities.', 'Python'), 'security')
})
