'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { coderCategories, type CoderCategory } from '@/data/coder-repositories'
import { prioritizeRepositories, type GithubRepository } from '@/lib/github-repositories'
import { homePath, type Locale } from '@/lib/i18n'
import Link from 'next/link'
import styles from './coder.module.css'

const copy = {
  es: {
    eyebrow: 'Tools / Biblioteca de repositorios',
    intro: 'Buen código. Grandes posibilidades.',
    description: 'Una selección de repositorios públicos de GitHub que merece la pena tener a mano. Herramientas para construir, automatizar y aprender.',
    explore: 'Explorar biblioteca',
    repos: 'Repositorios', categories: 'Categorías', curated: 'Selección manual',
    search: 'Buscar repositorios', placeholder: 'Busca una herramienta, un tema, un lenguaje…',
    clear: 'Borrar búsqueda', all: 'Todos', filters: 'Filtrar por categoría',
    library: 'La biblioteca', showing: 'repositorios disponibles', results: 'resultados',
    open: 'Ver en GitHub', newTab: 'se abre en una pestaña nueva',
    empty: 'Aquí todavía no hay resultados.', emptyHelp: 'Prueba otra búsqueda o explora todas las categorías.',
    reset: 'Restablecer filtros',
    footer: 'Código compartido. Ideas que se multiplican.', home: 'Volver al laboratorio',
    note: 'Cada proyecto cuenta su historia en GitHub. Allí encontrarás su documentación, licencia y requisitos.',
    terminalComment: '// tu próxima idea empieza aquí', terminalResult: 'posibilidades por explorar',
    recommended: 'Recomendado', recommendedOnly: 'Recomendados', stars: 'Estrellas', forks: 'Forks', watchers: 'Seguidores', issues: 'Issues + PRs abiertos',
    language: 'Lenguaje', license: 'Licencia', updated: 'Último push', created: 'Creado', branch: 'Rama principal', website: 'Web del proyecto',
    archived: 'Archivado', fork: 'Es un fork', noDescription: 'Este repositorio no tiene descripción en GitHub.', unknown: 'Sin especificar',
    unavailable: 'No se pudieron cargar los datos de GitHub.', stale: 'Mostrando la última información disponible.', missing: 'Repositorio privado o no encontrado.', invalid: 'El enlace no corresponde a un repositorio de GitHub.',
    retry: 'Volver a comprobar', checking: 'Comprobando…', automatic: 'Datos de GitHub · actualización automática cada hora.', topics: 'Temas', more: 'Más información',
  },
  en: {
    eyebrow: 'Tools / Repository library',
    intro: 'Good code. Great possibilities.',
    description: 'A selection of public GitHub repositories worth keeping close. Tools to build, automate and learn.',
    explore: 'Explore the library',
    repos: 'Repositories', categories: 'Categories', curated: 'Handpicked',
    search: 'Search repositories', placeholder: 'Find a tool, a topic, a language…',
    clear: 'Clear search', all: 'All', filters: 'Filter by category',
    library: 'The library', showing: 'repositories available', results: 'results',
    open: 'View on GitHub', newTab: 'opens in a new tab',
    empty: 'No results here yet.', emptyHelp: 'Try another search or explore all categories.',
    reset: 'Reset filters',
    footer: 'Shared code. Ideas that multiply.', home: 'Back to the lab',
    note: 'Every project tells its story on GitHub. Find its documentation, license and requirements there.',
    terminalComment: '// your next idea starts here', terminalResult: 'possibilities to explore',
    recommended: 'Recommended', recommendedOnly: 'Recommended', stars: 'Stars', forks: 'Forks', watchers: 'Watchers', issues: 'Open issues + PRs',
    language: 'Language', license: 'License', updated: 'Last push', created: 'Created', branch: 'Default branch', website: 'Project website',
    archived: 'Archived', fork: 'Fork', noDescription: 'This repository has no description on GitHub.', unknown: 'Not specified',
    unavailable: 'Could not load GitHub data.', stale: 'Showing the latest available information.', missing: 'Repository private or not found.', invalid: 'This is not a GitHub repository URL.',
    retry: 'Check again', checking: 'Checking…', automatic: 'GitHub data · automatically updated every hour.', topics: 'Topics', more: 'More information',
  },
}

function SearchIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
}

function ArrowIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12" /></svg>
}

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function RepositoryAvatar({ repo }: { repo: GithubRepository }) {
  const [failed, setFailed] = useState(false)
  return <div className={styles.avatar}>{repo.avatar && !failed
    ? <Image src={repo.avatar} alt={repo.owner} width={48} height={48} unoptimized onError={() => setFailed(true)} />
    : <span aria-hidden="true">{repo.name.slice(0, 2).toUpperCase()}</span>}</div>
}

export default function CoderLibrary({ lang, catalog }: { lang: Locale; catalog: GithubRepository[] }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CoderCategory | 'all'>('all')
  const [recommendedOnly, setRecommendedOnly] = useState(false)
  const [refreshing, startTransition] = useTransition()
  const router = useRouter()
  const t = copy[lang]
  const coderRepositories = prioritizeRepositories(catalog)
  const formatter = new Intl.NumberFormat(lang === 'es' ? 'es-ES' : 'en-US')
  const formatCount = (value: number | null) => value === null ? '—' : formatter.format(value)
  const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat(lang === 'es' ? 'es-ES' : 'en-US', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(value)) : '—'
  const categories = Object.keys(coderCategories) as CoderCategory[]
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean)
  const repositories = coderRepositories.filter(repo => {
    const searchable = normalize([repo.name, repo.fullName, repo.description, repo.language, repo.license, coderCategories[repo.category][lang], ...repo.topics].join(' '))
    return (!recommendedOnly || repo.recommended) && (category === 'all' || repo.category === category) && terms.every(term => searchable.includes(term))
  })

  function resetFilters() {
    setQuery('')
    setCategory('all')
    setRecommendedOnly(false)
  }

  return (
    <div className={styles.page}>
      <Navbar lang={lang} />
      <main className={styles.main}>
        <section className={styles.hero} aria-labelledby="coder-title">
          <div>
            <p className={styles.eyebrow}><span aria-hidden="true">{'</>'}</span>{t.eyebrow}</p>
            <h1 id="coder-title" className={styles.title}>Coder<span>.</span></h1>
            <h2 className={styles.intro}>{t.intro}</h2>
            <p className={styles.description}>{t.description}</p>
            <a className={styles.explore} href="#library">{t.explore}<span aria-hidden="true">↓</span></a>
          </div>
          <div className={styles.terminal} aria-hidden="true">
            <div className={styles.terminalBar}><div><i /><i /><i /></div><span>coder / library</span><span>{'{ }'}</span></div>
            <div className={styles.terminalBody}>
              <p className={styles.comment}>{t.terminalComment}</p>
              <p><span className={styles.pink}>const</span> nextIdea = {'{'}</p>
              <p className={styles.indent}>build: <span className={styles.yellow}>&quot;something useful&quot;</span>,</p>
              <p className={styles.indent}>source: <span className={styles.yellow}>&quot;github.com&quot;</span>,</p>
              <p className={styles.indent}>possibilities: <span className={styles.blue}>Infinity</span></p>
              <p>{'}'};</p>
              <div className={styles.terminalOutput}><span>→</span> {coderRepositories.length} {t.terminalResult}<b>_</b></div>
            </div>
          </div>
        </section>

        <dl className={styles.stats}>
          <div><dt>{t.repos}</dt><dd>{String(coderRepositories.length).padStart(2, '0')}</dd></div>
          <div><dt>{t.categories}</dt><dd>{String(categories.length).padStart(2, '0')}</dd></div>
          <div className={styles.curated}><dt>White Mirror Lab</dt><dd><span aria-hidden="true">✳</span> {t.curated}</dd></div>
        </dl>

        <section id="library" className={styles.library} aria-labelledby="library-title">
          <div className={styles.libraryHeading}><h2 id="library-title">{t.library}<span aria-hidden="true"> /</span></h2><p>{coderRepositories.length} {t.showing}</p></div>
          <div className={styles.searchBox}>
            <SearchIcon />
            <label className={styles.srOnly} htmlFor="coder-search">{t.search}</label>
            <input id="coder-search" type="search" placeholder={t.placeholder} value={query} onChange={event => setQuery(event.target.value)} autoComplete="off" />
            {query && <button type="button" onClick={() => setQuery('')} aria-label={t.clear}>×</button>}
          </div>
          <div className={styles.filters} role="group" aria-label={t.filters}>
            <button type="button" aria-pressed={category === 'all'} onClick={() => setCategory('all')}>{t.all}<span>{coderRepositories.length}</span></button>
            {categories.map(key => <button key={key} type="button" aria-pressed={category === key} onClick={() => setCategory(key)}>{coderCategories[key][lang]}<span>{coderRepositories.filter(repo => repo.category === key).length}</span></button>)}
            <button type="button" aria-pressed={recommendedOnly} onClick={() => setRecommendedOnly(value => !value)}><span aria-hidden="true">🔥</span>{t.recommendedOnly}<span>{coderRepositories.filter(repo => repo.recommended).length}</span></button>
          </div>
          <div className={styles.dataNotice}><p>{t.automatic}</p>{coderRepositories.some(repo => repo.status === 'unavailable' || repo.status === 'stale') && <button type="button" disabled={refreshing} onClick={() => startTransition(() => router.refresh())}>{refreshing ? t.checking : t.retry}</button>}</div>
          <p className={styles.results} role="status" aria-live="polite" aria-atomic="true"><span>{String(repositories.length).padStart(2, '0')}</span> {t.results}<span className={styles.resultLine} aria-hidden="true" /></p>
          {repositories.length ? <div className={styles.grid}>
            {repositories.map(repo => <article key={repo.fullName} className={`${styles.card} ${styles[repo.category]} ${repo.recommended ? styles.recommendedCard : ''}`}>
              <div className={styles.cardTop}><span className={styles.category}>{coderCategories[repo.category][lang]}</span>{repo.recommended && <span className={styles.recommendedBadge}><span aria-hidden="true">🔥</span>{t.recommended}</span>}</div>
              <div className={styles.identity}><RepositoryAvatar repo={repo} /><div><p className={styles.repoPath}>{repo.fullName}</p><h3>{repo.name}</h3></div></div>
              {(repo.archived || repo.isFork) && <p className={styles.badges}>{repo.archived && <span>{t.archived}</span>}{repo.isFork && <span>{t.fork}</span>}</p>}
              <p className={styles.cardDescription}>{repo.description ?? (repo.status === 'ready' ? t.noDescription : '')}</p>
              {repo.status !== 'ready' && <p className={styles.fetchStatus}>{repo.status === 'stale' ? t.stale : repo.status === 'not-found' ? t.missing : repo.status === 'invalid-url' ? t.invalid : t.unavailable}</p>}
              <dl className={styles.repoMetrics}>
                <div><dt><span aria-hidden="true">☆</span> {t.stars}</dt><dd>{formatCount(repo.stars)}</dd></div>
                <div><dt>{t.forks}</dt><dd>{formatCount(repo.forks)}</dd></div>
                <div><dt>{t.watchers}</dt><dd>{formatCount(repo.subscribers)}</dd></div>
              </dl>
              <div className={styles.repoMetadata}><span>{repo.language ?? t.unknown}</span><span title={repo.license ?? t.unknown}>{repo.license ?? t.unknown}</span></div>
              <p className={styles.activity}>{t.updated}: <time dateTime={repo.pushedAt ?? undefined}>{formatDate(repo.pushedAt)}</time></p>
              {repo.topics.length > 0 && <ul className={styles.tags} aria-label={t.topics}>{repo.topics.slice(0, 6).map(tag => <li key={tag}>{tag}</li>)}</ul>}
              <details className={styles.details}><summary>{t.more}</summary><dl>
                <div><dt>{t.issues}</dt><dd>{formatCount(repo.issuesAndPullRequests)}</dd></div>
                <div><dt>{t.language}</dt><dd>{repo.language ?? t.unknown}</dd></div>
                <div><dt>{t.license}</dt><dd>{repo.license ?? t.unknown}</dd></div>
                <div><dt>{t.created}</dt><dd><time dateTime={repo.createdAt ?? undefined}>{formatDate(repo.createdAt)}</time></dd></div>
                <div><dt>{t.branch}</dt><dd>{repo.defaultBranch ?? '—'}</dd></div>
              </dl>{repo.topics.length > 6 && <ul className={styles.tags} aria-label={t.topics}>{repo.topics.slice(6).map(tag => <li key={tag}>{tag}</li>)}</ul>}{repo.homepage && <a href={repo.homepage} target="_blank" rel="noopener noreferrer">{t.website} ↗</a>}</details>
              {repo.url && <a className={styles.repoLink} href={repo.url} target="_blank" rel="noopener noreferrer" aria-label={`${repo.name}: ${t.open} (${t.newTab})`}>{t.open}<ArrowIcon /></a>}
            </article>)}
          </div> : <div className={styles.empty}><span aria-hidden="true">{'{ }'}</span><h3>{t.empty}</h3><p>{t.emptyHelp}</p><button type="button" onClick={resetFilters}>{t.reset} ↗</button></div>}
          <p className={styles.note}>{t.note}</p>
        </section>
      </main>
      <footer className={styles.footer}><p><strong>Coder.</strong>{t.footer}</p><Link href={homePath(lang)}>{t.home}<span aria-hidden="true">↗</span></Link></footer>
    </div>
  )
}
