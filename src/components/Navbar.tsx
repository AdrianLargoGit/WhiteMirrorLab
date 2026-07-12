'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { landingCopy } from '@/lib/copy'
import {
  LOCALE_COOKIE,
  alternateLocalePath,
  downloadPath,
  localizedHashPath,
  questionnairePath,
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
  const progressRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const t = landingCopy[lang]

  const navLinks = [
    { href: localizedHashPath(lang, '#experiments'), label: t.navExperiments },
    { href: localizedHashPath(lang, '#how'), label: t.navMethodology },
    { href: localizedHashPath(lang, '#apps'), label: t.navAreas },
    { href: localizedHashPath(lang, '#ethics'), label: t.navEthics },
    { href: questionnairePath(lang), label: t.navQuestionnaire },
    { href: downloadPath(lang), label: t.navDownload },
    { href: wmlPath(lang, '/consent'), label: t.navWml },
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

  const closeMenu = () => setMenuOpen(false)

  const changeLang = (nextLang: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${nextLang}; path=/; max-age=31536000; samesite=lax`
    onLangChange?.(nextLang)
    closeMenu()
    router.push(alternateLocalePath(pathname, nextLang))
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
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </header>
    </>
  )
}
