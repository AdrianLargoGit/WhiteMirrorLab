'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { landingCopy } from '@/lib/copy'
import {
  LOCALE_COOKIE,
  alternateLocalePath,
  blogPath,
  contactPath,
  coderPath,
  downloadPath,
  experimentsPath,
  faroPath,
  localizedHashPath,
  marketplacePath,
  safefilePath,
  skinTemplatePath,
  wmlPath,
  type Locale,
} from '@/lib/i18n'
import styles from './Navbar.module.css'

const IconMenu = () => (
  <svg width="22" height="14" viewBox="0 0 22 14" fill="none" aria-hidden="true">
    <rect width="22" height="1" fill="currentColor" />
    <rect y="6.5" width="22" height="1" fill="currentColor" />
    <rect y="13" width="22" height="1" fill="currentColor" />
  </svg>
)

const IconClose = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <line x1="1" y1="1" x2="17" y2="17" stroke="currentColor" strokeWidth="1.2" />
    <line x1="17" y1="1" x2="1" y2="17" stroke="currentColor" strokeWidth="1.2" />
  </svg>
)

interface NavbarProps {
  lang: Locale
  onLangChange?: (lang: Locale) => void
}

export default function Navbar({ lang, onLangChange }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [openGroup, setOpenGroup] = useState<'archive' | 'tools' | null>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const groupsRef = useRef<HTMLUListElement>(null)
  const pathname = usePathname()
  const t = landingCopy[lang]

  const navLinks = [
    { href: contactPath(lang), label: t.navContact },
    { href: experimentsPath(lang), label: t.navExperiments },
    { href: blogPath(lang), label: t.navBlog },
  ]
  const navigationGroups = [
    { id: 'archive', label: lang === 'es' ? 'Archivo' : 'Archive', sections: [
      { section: lang === 'es' ? 'Experimentos finalizados' : 'Completed experiments', items: [{ href: wmlPath(lang), label: 'WML 1.0' }] },
    ] },
    { id: 'tools', label: 'TOOLS', sections: [
      { section: 'WML X.X.0', items: [
        { href: downloadPath(lang), label: 'WML X.X.0' },
        { href: marketplacePath(lang), label: t.navMarketplace },
        { href: skinTemplatePath(lang), label: t.navCreators },
      ] },
      { section: lang === 'es' ? 'Herramientas' : 'Tools', items: [
        { href: safefilePath(lang), label: 'SafeFile' },
        { href: faroPath(lang), label: 'FARO' },
        { href: coderPath(lang), label: 'Coder' },
      ] },
    ] },
  ] as const

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50)
      if (progressRef.current) {
        const max = document.body.scrollHeight - window.innerHeight
        const pct = max > 0 ? (window.scrollY / max) * 100 : 0
        progressRef.current.style.width = `${pct}%`
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [menuOpen])

  useEffect(() => {
    if (!openGroup && !menuOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuOpen && !groupsRef.current?.contains(event.target as Node)) {
        setOpenGroup(null)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpenGroup(null); setMenuOpen(false) }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen, openGroup])

  const closeMenu = () => {
    setMenuOpen(false)
    setOpenGroup(null)
  }

  const changeLang = (nextLang: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${nextLang}; path=/; max-age=31536000; samesite=lax`
    onLangChange?.(nextLang)
    closeMenu()
    const currentPath = window.location.pathname || pathname
    const nextPath = alternateLocalePath(currentPath, nextLang)
    window.location.assign(`${nextPath}${window.location.search}${window.location.hash}`)
  }

  return (
    <>
      <div ref={progressRef} className={styles.progressBar} aria-hidden="true" />

      <div
        className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        <nav aria-label={lang === 'es' ? 'Navegación móvil' : 'Mobile navigation'}>
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.mobileLink}
              onClick={closeMenu}
            >
              {item.label}
            </Link>
          ))}
          {navigationGroups.map(group => <div key={group.id} className={styles.mobileWmlGroup}>
            <button type="button" className={styles.mobileWmlToggle} aria-expanded={openGroup === group.id} aria-controls={'mobile-' + group.id} onClick={() => setOpenGroup(value => value === group.id ? null : group.id)}>{group.label}<span className={styles.chevron} aria-hidden="true" /></button>
            {openGroup === group.id && <div id={'mobile-' + group.id} className={styles.mobileGroupContent}>
              {group.sections.map(section => <div key={section.section} className={styles.mobileWmlSection}><span>{section.section}</span>{section.items.map(item => <Link key={item.href} href={item.href} className={`${styles.mobileWmlLink} ${group.id === 'tools' && item.href === downloadPath(lang) ? styles.featuredTool : ''}`} onClick={closeMenu}>{item.label}</Link>)}</div>)}
            </div>}
          </div>)}

        </nav>

        <div className={styles.mobileLang}>
          <button
            type="button"
            className={`${styles.langBtn} ${lang === 'es' ? styles.langBtnActive : ''}`}
            onClick={() => changeLang('es')}
            aria-pressed={lang === 'es'}
          >
            ES
          </button>
          <button
            type="button"
            className={`${styles.langBtn} ${lang === 'en' ? styles.langBtnActive : ''}`}
            onClick={() => changeLang('en')}
            aria-pressed={lang === 'en'}
          >
            EN
          </button>
        </div>
      </div>

      <header
        id="mainNav"
        className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}
        role="banner"
      >
        <Link href={localizedHashPath(lang, '')} className={styles.logo} aria-label="White Mirror Lab">
          <span className={styles.logoDot} aria-hidden="true" />
          White Mirror Lab
        </Link>

        <ul className={styles.desktopLinks} role="list" ref={groupsRef}>
          {navLinks.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={styles.navLink}>
                {item.label}
              </Link>
            </li>
          ))}
          {navigationGroups.map(group => <li key={group.id} className={`${styles.wmlMenu} ${group.sections.length === 1 ? styles.wmlMenuSingleColumn : ''} ${openGroup === group.id ? styles.wmlMenuOpen : ''}`} onMouseLeave={() => setOpenGroup(null)} onFocus={() => setOpenGroup(group.id)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpenGroup(null) }}>
            <button type="button" className={styles.navLinkButton} onMouseEnter={() => setOpenGroup(group.id)} aria-expanded={openGroup === group.id} aria-controls={'desktop-' + group.id} onClick={() => setOpenGroup(group.id)}>{group.label}<span className={styles.chevron} aria-hidden="true" /></button>
            <div id={'desktop-' + group.id} className={styles.wmlDropdown + (openGroup === group.id ? ' ' + styles.wmlDropdownOpen : '')} inert={openGroup !== group.id} aria-hidden={openGroup !== group.id}>
              {group.sections.map(section => <div key={section.section} className={styles.wmlDropdownSection}><span>{section.section}</span>{section.items.map(item => <Link key={item.href} href={item.href} className={`${styles.wmlDropdownLink} ${group.id === 'tools' && item.href === downloadPath(lang) ? styles.featuredTool : ''}`} onClick={closeMenu}>{item.label}</Link>)}</div>)}
            </div>
          </li>)}

        </ul>

        <div className={styles.navRight}>
          <div className={styles.langToggle} role="group" aria-label={lang === 'es' ? 'Selector de idioma' : 'Language selector'}>
            <button
              type="button"
              className={`${styles.langBtn} ${lang === 'es' ? styles.langBtnActive : ''}`}
              onClick={() => changeLang('es')}
              aria-pressed={lang === 'es'}
            >
              ES
            </button>
            <button
              type="button"
              className={`${styles.langBtn} ${lang === 'en' ? styles.langBtnActive : ''}`}
              onClick={() => changeLang('en')}
              aria-pressed={lang === 'en'}
            >
              EN
            </button>
          </div>

          <Link href={downloadPath(lang)} className={styles.navCta}>
            {t.navJoin}
          </Link>

          <button
            type="button"
            className={styles.hamburger}
            aria-label={menuOpen ? (lang === 'es' ? 'Cerrar menú' : 'Close menu') : (lang === 'es' ? 'Abrir menú' : 'Open menu')}
            aria-expanded={menuOpen}
            onClick={() => {
              setMenuOpen((v) => !v)
              setOpenGroup(null)
            }}
          >
            {menuOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </header>
    </>
  )
}
