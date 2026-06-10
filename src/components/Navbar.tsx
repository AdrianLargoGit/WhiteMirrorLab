'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import styles from './Navbar.module.css'

// ── Lucide-style inline SVGs (no emoji, no external icon library dependency) ──
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

const NAV_LINKS = [
  { href: '#experiments', labelEs: 'Experimentos', labelEn: 'Experiments' },
  { href: '#how', labelEs: 'Metodología', labelEn: 'Methodology' },
  { href: '#apps', labelEs: 'Áreas', labelEn: 'Areas' },
  { href: '#ethics', labelEs: 'Ética', labelEn: 'Ethics' },
]

interface NavbarProps {
  lang?: 'es' | 'en'
  onLangChange?: (lang: 'es' | 'en') => void
}

export default function Navbar({ lang = 'es', onLangChange }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const progressRef = useRef<HTMLDivElement>(null)

  // Scroll handler — nav style + progress bar
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50)
      if (progressRef.current) {
        const max = document.body.scrollHeight - window.innerHeight
        const pct = max > 0 ? (window.scrollY / max) * 100 : 0
        progressRef.current.style.width = pct + '%'
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  const label = (item: (typeof NAV_LINKS)[0]) =>
    lang === 'es' ? item.labelEs : item.labelEn

  return (
    <>
      {/* Progress bar */}
      <div ref={progressRef} className={styles.progressBar} aria-hidden="true" />

      {/* Mobile full-screen menu */}
      <div
        className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}
        aria-hidden={!menuOpen}
      >
        <nav aria-label="Mobile navigation">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.mobileLink}
              onClick={closeMenu}
            >
              {label(item)}
            </Link>
          ))}
          <Link href="/web/consent" className={styles.mobileLink} onClick={closeMenu}>
            {lang === 'es' ? 'Participar' : 'Join'}
          </Link>
        </nav>

        <div className={styles.mobileLang}>
          <button
            className={`${styles.langBtn} ${lang === 'es' ? styles.langBtnActive : ''}`}
            onClick={() => onLangChange?.('es')}
            aria-pressed={lang === 'es'}
          >
            ES
          </button>
          <button
            className={`${styles.langBtn} ${lang === 'en' ? styles.langBtnActive : ''}`}
            onClick={() => onLangChange?.('en')}
            aria-pressed={lang === 'en'}
          >
            EN
          </button>
        </div>
      </div>

      {/* Main nav bar */}
      <header
        id="mainNav"
        className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}
        role="banner"
      >
        {/* Logo */}
        <Link href="/" className={styles.logo} aria-label="White Mirror Lab — Home">
          <span className={styles.logoDot} aria-hidden="true" />
          White Mirror Lab
        </Link>

        {/* Desktop links */}
        <ul className={styles.desktopLinks} role="list">
          {NAV_LINKS.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={styles.navLink}>
                {label(item)}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right controls */}
        <div className={styles.navRight}>
          {/* Language toggle */}
          <div className={styles.langToggle} role="group" aria-label="Language selector">
            <button
              className={`${styles.langBtn} ${lang === 'es' ? styles.langBtnActive : ''}`}
              onClick={() => onLangChange?.('es')}
              aria-pressed={lang === 'es'}
            >
              ES
            </button>
            <button
              className={`${styles.langBtn} ${lang === 'en' ? styles.langBtnActive : ''}`}
              onClick={() => onLangChange?.('en')}
              aria-pressed={lang === 'en'}
            >
              EN
            </button>
          </div>

          {/* CTA */}
          <Link href="/web/consent" className={styles.navCta}>
            {lang === 'es' ? 'Participar' : 'Join'}
          </Link>

          {/* Hamburger */}
          <button
            className={styles.hamburger}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
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