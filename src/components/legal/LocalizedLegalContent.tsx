'use client'

import type { ReactNode } from 'react'
import { useLocale } from '@/hooks/useLocale'
import { legalPath, type LegalPage } from '@/lib/i18n'

const contact = 'support@whitemirrorlab.com'

function LegalNoticeEn() {
  return (
    <>
      <h1>Legal notice</h1>
      <p className="legal-updated">Last updated: September 7, 2026 - Spanish Law 34/2002 on Information Society Services and E-commerce.</p>
      <p>This notice identifies the owner of White Mirror Lab and the basic terms for using the website, WML X.X.0 download pages, the creator marketplace and the WML 1.0 results archive.</p>

      <h2>1. Website owner</h2>
      <ul>
        <li><strong>Name:</strong> White Mirror Lab</li>
        <li><strong>Activity:</strong> Digital product and experimentation lab</li>
        <li><strong>Registered address:</strong> Spain, European Union</li>
        <li><strong>Contact email:</strong> {contact}</li>
        <li><strong>Website:</strong> whitemirrorlab.com</li>
      </ul>

      <h2>2. Purpose</h2>
      <p>The website presents White Mirror Lab projects, provides access to WML X.X.0, lets creators submit or sell compatible skin packs, publishes editorial content and keeps an archive page for WML 1.0 results.</p>
      <p>Use of the website implies acceptance of this notice, the <a href={legalPath('en', 'privacy')}>Privacy Policy</a>, the <a href={legalPath('en', 'cookies')}>Cookie Policy</a> and, where applicable, the <a href={legalPath('en', 'terms')}>Terms</a>.</p>

      <h2>3. Intellectual property and user content</h2>
      <p>Texts, design, code, logos, images, databases and interactive elements belong to White Mirror Lab or its licensors. Creator skin packs and user-submitted materials remain owned by their authors, who grant White Mirror Lab the limited rights needed to review, display, distribute or sell them through the marketplace when accepted.</p>

      <h2>4. Liability</h2>
      <p>White Mirror Lab does not guarantee uninterrupted availability of the website, downloads, marketplace or third-party services. WML X.X.0 is experimental software and should not replace professional security, maintenance or antivirus tools.</p>
      <p>To report illegal, abusive or rights-infringing content, email <strong>{contact}</strong> with enough information to locate and assess it.</p>

      <h2>5. Governing law</h2>
      <p>This website is governed by Spanish law and applicable EU law. EU consumers may use the European Commission ODR platform at <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">ec.europa.eu/consumers/odr</a>.</p>

      <div className="legal-contact-box">
        <p><strong>Legal contact:</strong> {contact}</p>
      </div>
    </>
  )
}

function PrivacyEn() {
  return (
    <>
      <h1>Privacy policy</h1>
      <p className="legal-updated">Last updated: September 7, 2026 - GDPR (EU) 2016/679 - Spanish Organic Law 3/2018.</p>
      <p>White Mirror Lab processes personal data in accordance with GDPR and Spanish data protection law. The active product focus is WML X.X.0, a Windows desktop pet designed around local processing and clear user control.</p>

      <h2>1. Controller</h2>
      <ul>
        <li><strong>Controller:</strong> White Mirror Lab</li>
        <li><strong>Email:</strong> {contact}</li>
        <li><strong>Location:</strong> Spain, European Union</li>
        <li><strong>Website:</strong> whitemirrorlab.com</li>
      </ul>

      <h2>2. Purposes, legal bases and retention</h2>
      <h3>2.1. Newsletter and download access</h3>
      <ul>
        <li><strong>Data:</strong> email address, subscription date and source.</li>
        <li><strong>Purpose:</strong> send WML X.X.0 download information, product updates, skin releases and important project notices.</li>
        <li><strong>Legal basis:</strong> consent. You may withdraw it at any time.</li>
        <li><strong>Processor:</strong> Brevo.</li>
      </ul>

      <h3>2.2. Marketplace and creator submissions</h3>
      <ul>
        <li><strong>Data:</strong> creator contact details, submitted files, product descriptions, pricing data, review status and payment-provider references where applicable.</li>
        <li><strong>Purpose:</strong> review packs, publish approved products, process downloads or purchases, prevent abuse and provide support.</li>
        <li><strong>Legal bases:</strong> contract performance, consent where needed, legitimate interest for security and legal compliance.</li>
      </ul>

      <h3>2.3. WML X.X.0 widget</h3>
      <p>The website explains the widget before download. The widget is designed to work locally with device signals such as activity, battery, points, common apps and basic safe-process information. It does not send personal files, typed text in other apps or window contents to local AI.</p>

      <h3>2.4. Analytics and technical logs</h3>
      <p>PostHog may process page views and interaction events only according to analytics consent. Server and security logs may include IP address, device/browser information and request metadata for maintenance, fraud prevention and security.</p>

      <h2>3. Recipients and transfers</h2>
      <p>We use processors such as Supabase, PostHog, Brevo, Vercel, Cloudflare/R2 and payment or checkout providers where applicable. Where data is transferred outside the European Economic Area, appropriate safeguards are used.</p>

      <h2>4. Your rights</h2>
      <p>You may exercise access, rectification, deletion, restriction, portability, objection and withdrawal of consent by emailing <strong>{contact}</strong>. You may lodge a complaint with the Spanish Data Protection Agency at <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">www.aepd.es</a>.</p>

      <h2>5. Minors and safety</h2>
      <p>The website, creator marketplace and WML X.X.0 download are intended for people aged 18 or older. We apply technical and organizational security measures including TLS, restricted production access and provider-level access controls.</p>

      <h2>6. WML 1.0 archive</h2>
      <p>WML 1.0 is no longer presented as the active experiment. Its page is reserved for future results and contextual information. Any published results should be aggregated or anonymized.</p>

      <div className="legal-contact-box">
        <p><strong>Privacy contact:</strong> {contact}</p>
      </div>
    </>
  )
}

function CookiesEn() {
  return (
    <>
      <h1>Cookie policy</h1>
      <p className="legal-updated">Last updated: September 7, 2026 - ePrivacy Directive and AEPD cookie guidance.</p>
      <p>This policy explains how White Mirror Lab uses cookies and similar local storage technologies. Strictly necessary cookies do not require consent; analytics cookies require prior consent.</p>

      <h2>1. Technologies we use</h2>
      <ul>
        <li><strong>wml_locale:</strong> remembers language preference.</li>
        <li><strong>wml_cookie_consent:</strong> stores cookie and analytics preferences.</li>
        <li><strong>ph_*:</strong> PostHog analytics cookies, only if analytics consent is granted.</li>
        <li><strong>Provider cookies:</strong> checkout, marketplace, advertising or embedded services may set cookies when their features are loaded.</li>
      </ul>

      <h2>2. Managing consent</h2>
      <p>The cookie banner lets you accept or reject non-essential analytics. You may withdraw analytics consent through cookie preferences or browser settings.</p>

      <h2>3. Browser controls and opt-out</h2>
      <p>You can block or delete cookies in Chrome, Firefox, Safari, Edge and other browsers. You can also reject analytics in the cookie panel or use PostHog&apos;s opt-out mechanism described at <a href="https://posthog.com/docs/libraries/js#opt-out" target="_blank" rel="noopener noreferrer">posthog.com</a>.</p>

      <div className="legal-contact-box">
        <p><strong>Cookie questions:</strong> {contact}</p>
      </div>
    </>
  )
}

function TermsEn() {
  return (
    <>
      <h1>Terms</h1>
      <p className="legal-updated">WML X.X.0 and White Mirror Lab services - Version 2.0 - Effective from September 7, 2026.</p>
      <p>These terms apply to the website, WML X.X.0 download flow, creator submissions, marketplace pages and the WML 1.0 results archive.</p>

      <h2>1. WML X.X.0</h2>
      <p>WML X.X.0 is experimental Windows software. It may react to local activity signals and suggest basic optimization, focus, battery or safety actions. Actions that may affect your system require confirmation. It is not a replacement for professional security, maintenance, antivirus or backup tools.</p>

      <h2>2. Accounts, downloads and communications</h2>
      <p>You must provide truthful information when subscribing, downloading, contacting us or submitting creator packs. Newsletter consent may be withdrawn at any time.</p>

      <h2>3. Creator packs and marketplace conduct</h2>
      <p>Creators are responsible for submitted packs and must have all necessary rights. Illegal, infringing, abusive, malicious or misleading content is prohibited. White Mirror Lab may reject, remove or suspend products that breach these terms or create security, quality or legal risks.</p>

      <h2>4. Payments, files and availability</h2>
      <p>Marketplace payments and downloads may depend on third-party providers. Availability is not guaranteed. Refunds, taxes and payment disputes are handled according to applicable law and the checkout/provider flow used for the purchase.</p>

      <h2>5. WML 1.0 archive</h2>
      <p>WML 1.0 is not the active participation flow. Its page is kept as a future results archive. Do not use old direct URLs to create, manipulate or revive participation.</p>

      <h2>6. Reports, termination and law</h2>
      <p>Report illegal or abusive content to <strong>{contact}</strong>. White Mirror Lab may suspend access, remove content or take technical and legal measures when these terms are breached. These terms are governed by Spanish law and applicable EU law.</p>

      <div className="legal-contact-box">
        <p><strong>Contact:</strong> {contact}</p>
      </div>
    </>
  )
}

function EthicsEn() {
  return (
    <>
      <h1>Ethical framework</h1>
      <p className="legal-updated">WML X.X.0 - Version 2.0 - Last updated: September 7, 2026.</p>
      <p>White Mirror Lab now centers its public work on WML X.X.0: a local desktop pet that may look unsettling, but must remain understandable, limited and controlled by the user.</p>

      <h2>1. Core principles</h2>
      <ul>
        <li><strong>Local first:</strong> prefer on-device processing and minimal local signals.</li>
        <li><strong>No content reading:</strong> do not read or transmit personal files, typed text in other apps or window contents to local AI.</li>
        <li><strong>Informed download:</strong> explain what the widget can do before installation.</li>
        <li><strong>Confirmed action:</strong> ask before running actions that can affect the device.</li>
        <li><strong>Separation of archive and product:</strong> WML 1.0 remains an archive for results, not the active story.</li>
      </ul>

      <h2>2. Risks and safeguards</h2>
      <p>Identified risks include misunderstanding local signals as invasive access, overtrusting optimization suggestions, installing unreviewed creator files and confusing the WML 1.0 archive with active participation. Safeguards include clear copy, consent before download, marketplace review, limited claims and user confirmation.</p>

      <h2>3. Transparency</h2>
      <p>We aim to keep product claims specific: what the widget can use, what it cannot access, when internet is needed and when the user must confirm an action.</p>

      <div className="legal-contact-box">
        <p><strong>Ethics contact:</strong> {contact}</p>
      </div>
    </>
  )
}

const ENGLISH_CONTENT: Record<LegalPage, ReactNode> = {
  legalNotice: <LegalNoticeEn />,
  privacy: <PrivacyEn />,
  cookies: <CookiesEn />,
  terms: <TermsEn />,
  ethics: <EthicsEn />,
}

export function LocalizedLegalContent({
  page,
  children,
}: {
  page: LegalPage
  children: ReactNode
}) {
  const locale = useLocale()
  return locale === 'en' ? ENGLISH_CONTENT[page] : <>{children}</>
}
