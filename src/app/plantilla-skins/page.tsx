'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import CustomCursor from '@/components/CustomCursor'
import Navbar from '@/components/Navbar'
import { useLocale } from '@/hooks/useLocale'
import { skinTemplateCopy } from '@/lib/copy'
import { downloadPath, homePath, marketplaceSubmitPath } from '@/lib/i18n'
import { marketplaceAvailabilityCopy } from '@/lib/marketplaceAvailability'
import styles from './page.module.css'

const TEMPLATE_URL = 'https://github.com/AdrianLargoGit/WhiteMirrorLab/releases/download/v1.0.3/marketplace-template.zip'
const BMC_CREATOR_ID = 'whitemirrorlab'
const BMC_WIDGET_URL = `https://www.buymeacoffee.com/widget/page/${BMC_CREATOR_ID}?description=Support%20the%20WML%20creator%20kit&color=%23f7d65a`

type DeviceType = 'computer' | 'mobile' | 'tv' | 'unknown'
type NavigatorWithUserAgentData = Navigator & {
  userAgentData?: {
    platform?: string
  }
}

const characters = [
  { src: '/skins/chrome-character.png', alt: 'Chrome creator character', className: styles.chromeFigure },
  { src: '/skins/frog-character.png', alt: 'Soft illustrated creator character', className: styles.frogFigure },
  { src: '/skins/illustration-character.png', alt: 'Hand drawn creator character', className: styles.illustrationFigure },
  { src: '/skins/pixel-dog.png', alt: 'Pixel art creator character', className: styles.pixelFigure },
]

const IconDownload = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M12 3v12" />
    <path d="m7 10 5 5 5-5" />
    <path d="M4 21h16" />
  </svg>
)

const IconUpload = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M12 21V9" />
    <path d="m7 14 5-5 5 5" />
    <path d="M4 3h16" />
  </svg>
)

const IconArrow = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
)

const IconCheck = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
    <path d="m5 12 4 4L19 6" />
  </svg>
)

const getDeviceType = (): DeviceType => {
  const ua = navigator.userAgent.toLowerCase()
  const userAgentData = (navigator as NavigatorWithUserAgentData).userAgentData
  const platform = userAgentData?.platform?.toLowerCase() || navigator.platform.toLowerCase()
  const hasCoarsePointer = window.matchMedia('(any-pointer: coarse)').matches
  const hasFinePointer = window.matchMedia('(any-pointer: fine)').matches
  const isTouchOnly = hasCoarsePointer && !hasFinePointer
  const isTablet =
    /ipad|tablet|kindle|silk/.test(ua) ||
    (/android/.test(ua) && !/mobi/.test(ua)) ||
    (platform === 'macintel' && navigator.maxTouchPoints > 1) ||
    (/win/.test(platform) && isTouchOnly)

  if (/smart-tv|smarttv|hbbtv|appletv|google tv|googletv|tizen|webos|netcast|viera|aquos|bravia|roku|aftt|aftm|fire tv/.test(ua)) {
    return 'tv'
  }

  if (isTablet || /mobi|iphone|ipod|android/.test(ua)) {
    return 'mobile'
  }

  if (/win|mac|linux|cros|x11/.test(platform) && !isTouchOnly) {
    return 'computer'
  }

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !hasCoarsePointer) {
    return 'computer'
  }

  return 'unknown'
}

export default function SkinTemplatePage() {
  const lang = useLocale()
  const t = skinTemplateCopy[lang]
  const availability = marketplaceAvailabilityCopy[lang]
  const hasTemplate = Boolean(TEMPLATE_URL)
  const [deviceType, setDeviceType] = useState<DeviceType>('unknown')
  const [isCoffeeLoaded, setIsCoffeeLoaded] = useState(false)
  const canDownloadTemplate = deviceType === 'computer'

  useEffect(() => {
    const detectDevice = window.setTimeout(() => {
      setDeviceType(getDeviceType())
    }, 0)

    return () => window.clearTimeout(detectDevice)
  }, [])

  return (
    <div className="landing-page">
      <CustomCursor />
      <Navbar lang={lang} />

      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <div className={styles.kicker}>{t.eyebrow}</div>
            <h1>{t.title}</h1>
            <p>{t.lead}</p>

            <div className={styles.actions}>
              {hasTemplate && canDownloadTemplate ? (
                <a className={styles.primaryButton} href={TEMPLATE_URL} download>
                  <IconDownload />
                  <span>{t.downloadCta}</span>
                </a>
              ) : (
                <button className={styles.primaryButton} type="button" disabled>
                  <IconDownload />
                  <span>{t.downloadCta}</span>
                </button>
              )}

              <Link className={styles.secondaryButton} href={downloadPath(lang)}>
                <span>{t.widgetCta}</span>
                <IconArrow />
              </Link>

              <Link className={styles.submitButton} href={marketplaceSubmitPath(lang)}>
                <IconUpload />
                <span>{lang === 'es' ? 'Subir mi skin' : 'Submit my skin'}</span>
              </Link>
            </div>

            <p className={styles.hint}>
              {deviceType !== 'unknown' && !canDownloadTemplate ? t.desktopOnlyHint : `${t.downloadHint} ${availability.body}`}
            </p>
          </div>

          <div className={styles.heroGallery} aria-label={t.galleryLabel}>
            <div className={styles.galleryCard}>
              <Image
                src={characters[0].src}
                alt={characters[0].alt}
                width={360}
                height={360}
                priority
                className={characters[0].className}
              />
              <span>{t.characterTones[0]}</span>
            </div>
            <div className={styles.galleryCard}>
              <Image
                src={characters[1].src}
                alt={characters[1].alt}
                width={360}
                height={360}
                priority
                className={characters[1].className}
              />
              <span>{t.characterTones[1]}</span>
            </div>
            <div className={styles.galleryCardWide}>
              <div>
                <span>{t.galleryLabel}</span>
                <h2>{t.galleryTitle}</h2>
                <p>{t.galleryText}</p>
              </div>
              <Image
                src={characters[3].src}
                alt={characters[3].alt}
                width={280}
                height={280}
                priority
                className={characters[3].className}
              />
            </div>
          </div>
        </section>

        <section className={styles.dropRail} aria-label={t.galleryTitle}>
          {t.swatches.map((item, index) => (
            <span key={item}>{String(index + 1).padStart(2, '0')} / {item}</span>
          ))}
        </section>

        <section className={styles.showcase}>
          <div className={styles.showcaseImage}>
            <Image
              src={characters[2].src}
              alt={characters[2].alt}
              width={420}
              height={420}
              className={characters[2].className}
            />
          </div>

          <div className={styles.showcaseCopy}>
            <span>{t.widgetTitle}</span>
            <h2>{t.widgetText}</h2>
            <p>{t.widgetBody}</p>
            <p className={styles.marketplaceNotice}>{availability.body}</p>
            <Link href={downloadPath(lang)}>
              {t.widgetCta}
              <IconArrow />
            </Link>
            <Link className={styles.showcaseSubmitLink} href={marketplaceSubmitPath(lang)}>
              {lang === 'es' ? 'Subir ZIP a revision' : 'Upload ZIP for review'}
              <IconUpload />
            </Link>
          </div>
        </section>

        <section className={styles.creatorGrid}>
          <div className={styles.workflow}>
            <h2>{t.stepsTitle}</h2>
            <div className={styles.steps}>
              {t.steps.map((step, index) => (
                <article key={step.title}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className={styles.kitCard}>
            <div>
              <span>{t.statusLabel}</span>
              <strong>{t.statusValue}</strong>
            </div>
            <h2>{t.detailsTitle}</h2>
            <ul>
              {t.details.map((item) => (
                <li key={item}>
                  <IconCheck />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </aside>
        </section>

        <section className={styles.supportSection}>
          <div className={styles.supportArt}>
            <Image
              src={characters[1].src}
              alt={characters[1].alt}
              width={300}
              height={300}
              className={styles.supportFigure}
            />
          </div>
          <div className={styles.supportCard}>
            <span>Buy Me a Coffee</span>
            <h2>{t.coffeeTitle}</h2>
            <p>{t.coffeeText}</p>
            <div className={styles.coffeeWidgetHost}>
              {!isCoffeeLoaded && (
                <span className={styles.coffeeWidgetStatus}>
                  {lang === 'es' ? 'Cargando Buy Me a Coffee...' : 'Loading Buy Me a Coffee...'}
                </span>
              )}
              <iframe
                src={BMC_WIDGET_URL}
                title="Buy Me a Coffee"
                allow="payment"
                height="560"
                onLoad={() => setIsCoffeeLoaded(true)}
                className={styles.coffeeWidgetFrame}
              />
            </div>
          </div>
        </section>

        <div className={styles.footerActions}>
          <Link href={homePath(lang)}>{t.backHome}</Link>
        </div>
      </main>
    </div>
  )
}
