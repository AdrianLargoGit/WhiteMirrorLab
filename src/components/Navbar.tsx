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
  downloadPath,
  localizedHashPath,
  marketplacePath,
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
  const [wmlMenuOpen, setWmlMenuOpen] = useState(false)
  const progressRef = useRef<HTMLDivElement>(null)
  const wmlMenuRef = useRef<HTMLLIElement>(null)
  const pathname = usePathname()
  const t = landingCopy[lang]

  const navLinks = [
    { href: blogPath(lang), label: t.navBlog },
    { href: localizedHashPath(lang, '#experiments'), label: t.navExperiments },
    { href: localizedHashPath(lang, '#how'), label: t.navMethodology },
    { href: localizedHashPath(lang, '#ethics'), label: t.navEthics },
    { href: contactPath(lang), label: t.navContact },
  ]

  const wmlLinks = [
    {
      section: t.navWmlOneSection,
      items: [
        { href: wmlPath(lang, '/consent'), label: t.navWml },
      ],
    },
    {
      section: t.navWmlExperimentalSection,
      items: [
        { href: downloadPath(lang), label: t.navDownload },
        { href: marketplacePath(lang), label: t.navMarketplace },
        { href: skinTemplatePath(lang), label: t.navCreators },
      ],
    },
  ]

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
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  useEffect(() => {
    if (!wmlMenuOpen || menuOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!wmlMenuRef.current?.contains(event.target as Node)) {
        setWmlMenuOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setWmlMenuOpen(false)
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen, wmlMenuOpen])

  const closeMenu = () => {
    setMenuOpen(false)
    setWmlMenuOpen(false)
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
      >
        <nav aria-label={lang === 'es' ? 'Navegacion movil' : 'Mobile navigation'}>
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
          <div className={styles.mobileWmlGroup}>
            <button
              type="button"
              className={styles.mobileWmlToggle}
              aria-expanded={wmlMenuOpen}
              onClick={() => setWmlMenuOpen((value) => !value)}
            >
              {t.navWmlMenu}
              <span className={styles.chevron} aria-hidden="true" />
            </button>
            <div className={`${styles.mobileWmlPanel} ${wmlMenuOpen ? styles.mobileWmlPanelOpen : ''}`}>
              {wmlLinks.map((group) => (
                <div key={group.section} className={styles.mobileWmlSection}>
                  <span>{group.section}</span>
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={styles.mobileWmlLink}
                      onClick={closeMenu}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
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

        <ul className={styles.desktopLinks} role="list">
          {navLinks.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={styles.navLink}>
                {item.label}
              </Link>
            </li>
          ))}
          <li
            className={styles.wmlMenu}
            ref={wmlMenuRef}
            onMouseEnter={() => setWmlMenuOpen(true)}
            onMouseLeave={() => setWmlMenuOpen(false)}
          >
            <button
              type="button"
              className={styles.navLinkButton}
              aria-expanded={wmlMenuOpen}
              aria-haspopup="menu"
              onClick={() => setWmlMenuOpen((value) => !value)}
            >
              {t.navWmlMenu}
              <span className={styles.chevron} aria-hidden="true" />
            </button>
            <div className={`${styles.wmlDropdown} ${wmlMenuOpen ? styles.wmlDropdownOpen : ''}`} role="menu">
              {wmlLinks.map((group) => (
                <div key={group.section} className={styles.wmlDropdownSection}>
                  <span>{group.section}</span>
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={styles.wmlDropdownLink}
                      role="menuitem"
                      onClick={() => setWmlMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </li>
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

          <Link href={wmlPath(lang, '/consent')} className={styles.navCta}>
            {t.navJoin}
          </Link>

          <button
            type="button"
            className={styles.hamburger}
            aria-label={menuOpen ? (lang === 'es' ? 'Cerrar menu' : 'Close menu') : (lang === 'es' ? 'Abrir menu' : 'Open menu')}
            aria-expanded={menuOpen}
            onClick={() => {
              setMenuOpen((v) => !v)
              setWmlMenuOpen(false)
            }}
          >
            {menuOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </header>
    </>
  )
}
