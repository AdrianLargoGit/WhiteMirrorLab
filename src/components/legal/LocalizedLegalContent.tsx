'use client'

import type { ReactNode } from 'react'
import { useLocale } from '@/hooks/useLocale'
import { legalPath, type LegalPage } from '@/lib/i18n'

const contact = 'whitemirrorlab.info@gmail.com'

function LegalNoticeEn() {
  return (
    <>
      <h1>Legal notice</h1>
      <p className="legal-updated">Last updated: June 10, 2026 - In compliance with Spanish Law 34/2002 on Information Society Services and E-commerce.</p>
      <p>This legal notice identifies the owner of this website and sets the basic conditions for accessing White Mirror Lab and the WML 1.0 experiment.</p>

      <h2>1. Website owner</h2>
      <ul>
        <li><strong>Name:</strong> White Mirror Lab</li>
        <li><strong>Activity:</strong> Digital social experimentation lab</li>
        <li><strong>Registered address:</strong> Spain, European Union</li>
        <li><strong>Contact email:</strong> {contact}</li>
        <li><strong>Website:</strong> whitemirrorlab.com</li>
      </ul>

      <h2>2. Purpose and scope</h2>
      <p>The website informs users about White Mirror Lab experiments, allows subscription to informational communications and enables voluntary participation in WML 1.0, also known as Karma Score.</p>
      <p>Accessing or using this website implies acceptance of this notice, the <a href={legalPath('en', 'privacy')}>Privacy Policy</a>, the <a href={legalPath('en', 'cookies')}>Cookie Policy</a> and, where applicable, the <a href={legalPath('en', 'terms')}>Terms of Participation</a>.</p>

      <h2>3. Age restriction</h2>
      <p>This website and WML 1.0 are intended only for people aged 18 or older with full legal capacity. If we become aware of an account created by a minor, it will be removed.</p>

      <h2>4. Intellectual property</h2>
      <p>Texts, design, source code, logos, images, databases and interactive elements belong to White Mirror Lab or its licensors and are protected by Spanish and EU intellectual property law. User-generated content remains owned by its authors, who grant White Mirror Lab a limited license to display it within the experiment and to include aggregated, anonymized results in publications.</p>

      <h2>5. Liability</h2>
      <p>White Mirror Lab does not guarantee uninterrupted availability of the website or the experiment platform. It is not responsible for user-generated content, but it provides reporting and removal channels for illegal or abusive content.</p>
      <p>To report illegal or abusive content, contact <strong>{contact}</strong> with enough information to locate and assess the content.</p>

      <h2>6. Governing law</h2>
      <p>This website is governed by Spanish law and, where applicable, European Union law. EU consumers may use the European Commission ODR platform at <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">ec.europa.eu/consumers/odr</a>.</p>

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
      <p className="legal-updated">Last updated: June 10, 2026 - GDPR (EU) 2016/679 - Spanish Organic Law 3/2018.</p>
      <p>White Mirror Lab processes personal data in accordance with the GDPR and applicable Spanish data protection law. If you have questions, contact <strong>{contact}</strong> before providing data.</p>

      <h2>1. Controller</h2>
      <ul>
        <li><strong>Controller:</strong> White Mirror Lab</li>
        <li><strong>Email:</strong> {contact}</li>
        <li><strong>Location:</strong> Spain, European Union</li>
        <li><strong>Website:</strong> whitemirrorlab.com</li>
      </ul>

      <h2>2. Purposes, legal bases and retention</h2>
      <h3>2.1. Waiting list and newsletter</h3>
      <ul>
        <li><strong>Data:</strong> email address, subscription date and source.</li>
        <li><strong>Purpose:</strong> send informational communications about White Mirror Lab and its experiments.</li>
        <li><strong>Legal basis:</strong> consent. You may withdraw it at any time.</li>
        <li><strong>Processor:</strong> Brevo.</li>
      </ul>

      <h3>2.2. WML 1.0 account and participation</h3>
      <ul>
        <li><strong>Registration data:</strong> email, encrypted password, username, display name, age, country and preferred language.</li>
        <li><strong>Participation data:</strong> voluntarily published photos, stories and text pulses, votes cast internally, votes received, karma score, consent version, account creation date and activity.</li>
        <li><strong>Purposes:</strong> manage access, calculate karma and rankings, secure the platform, moderate abuse, analyze aggregated behavior and comply with legal duties.</li>
        <li><strong>Legal bases:</strong> explicit informed consent, performance of the participation agreement, legitimate interest for security and legal compliance where required.</li>
        <li><strong>Retention:</strong> active account data is kept during the experiment; post-experiment data is kept for up to 90 days unless deletion is requested earlier; security logs may be kept for up to 12 months; published results are anonymized or pseudonymized.</li>
      </ul>

      <h3>2.3. Product analytics</h3>
      <p>PostHog may process page views and interaction events only according to the user&apos;s analytics consent. Analytics are used to improve the experiment and publish aggregated results. White Mirror Lab does not sell, rent or transfer personal data to third parties for commercial purposes.</p>

      <h2>3. Recipients and international transfers</h2>
      <p>We use processors such as Supabase, PostHog, Brevo and Vercel. Where data is transferred outside the European Economic Area, appropriate safeguards such as Standard Contractual Clauses or EU-hosted services are used.</p>

      <h2>4. Your rights</h2>
      <p>You may exercise access, rectification, deletion, restriction, portability, objection, withdrawal of consent and rights relating to automated decisions by emailing <strong>{contact}</strong>. We will answer within one month, extendable where legally permitted.</p>
      <p>You may lodge a complaint with the Spanish Data Protection Agency at <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">www.aepd.es</a>.</p>

      <h2>5. Minors and safety</h2>
      <p>WML 1.0 is restricted to adults aged 18 or older. We apply technical and organizational security measures including TLS, secure password handling, row-level security and restricted production access.</p>

      <h2>6. Cookies</h2>
      <p>For detailed information, read the <a href={legalPath('en', 'cookies')}>Cookie Policy</a>.</p>

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
      <p className="legal-updated">Last updated: June 10, 2026 - ePrivacy Directive and AEPD cookie guidance.</p>
      <p>This policy explains how White Mirror Lab uses cookies and similar local storage technologies. Strictly necessary cookies do not require consent; analytics cookies require prior consent.</p>

      <h2>1. What cookies are</h2>
      <p>Cookies are small text files stored by the browser. Similar technologies such as localStorage and sessionStorage help remember language, authentication and user preferences.</p>

      <h2>2. Technologies we use</h2>
      <ul>
        <li><strong>wml-1-0-auth:</strong> local storage for authenticated WML 1.0 session tokens.</li>
        <li><strong>wml_consent_v1:</strong> cookie/local storage recording informed consent for experiment participation.</li>
        <li><strong>wml_locale:</strong> language preference.</li>
        <li><strong>wml_session_hash:</strong> anonymous session hash before login.</li>
        <li><strong>ph_*:</strong> PostHog analytics cookies, only when analytics consent is granted.</li>
      </ul>

      <h2>3. Managing consent</h2>
      <p>The cookie banner lets you accept or reject non-essential analytics. You may withdraw analytics consent at any time through cookie preferences or browser settings.</p>

      <h2>4. Browser controls</h2>
      <p>You can block or delete cookies in Chrome, Firefox, Safari, Edge and other browsers. Blocking technical cookies may prevent login or core WML 1.0 functionality.</p>

      <h2>5. PostHog opt-out</h2>
      <p>You can reject analytics in the cookie panel or use PostHog&apos;s opt-out mechanism described in its official documentation at <a href="https://posthog.com/docs/libraries/js#opt-out" target="_blank" rel="noopener noreferrer">posthog.com</a>.</p>

      <div className="legal-contact-box">
        <p><strong>Cookie questions:</strong> {contact}</p>
      </div>
    </>
  )
}

function TermsEn() {
  return (
    <>
      <h1>Terms of participation</h1>
      <p className="legal-updated">WML 1.0 Karma Score - Version 1.0 - Effective from June 10, 2026.</p>
      <p>These terms govern voluntary participation in WML 1.0, a social reputation experiment run by White Mirror Lab. By accepting the consent form and creating an account, you confirm that you are 18 or older, have read and understood these terms and accept them.</p>

      <h2>1. Nature of the experiment</h2>
      <p>WML 1.0 studies how behavior changes when participants have a public score based on anonymous collective judgment. The experience may create emotional discomfort, including negative votes and a public karma score. Do not participate if this may affect you significantly.</p>

      <h2>2. Requirements</h2>
      <ul>
        <li>You must be 18 or older and legally capable.</li>
        <li>You must provide truthful registration information.</li>
        <li>You must accept the informed consent, these Terms, the <a href={legalPath('en', 'ethics')}>Ethical Framework</a> and the <a href={legalPath('en', 'privacy')}>Privacy Policy</a>.</li>
        <li>Multiple accounts are not allowed.</li>
      </ul>

      <h2>3. Conduct rules</h2>
      <p>You may not publish illegal, violent, pornographic, discriminatory, defamatory or rights-infringing content; harass or threaten others; use bots or scripts; manipulate votes or rankings; attempt to identify voters; scrape the platform; or publish third-party personal data without consent.</p>

      <h2>4. User content</h2>
      <p>You are responsible for the content you publish. You grant White Mirror Lab a limited, non-exclusive license to display that content within the experiment and to include aggregated anonymized data in result publications.</p>

      <h2>5. Voting and karma</h2>
      <ul>
        <li>Each participant can cast one positive or negative vote per profile, photo or pulse.</li>
        <li>Votes are anonymous by technical design.</li>
        <li>Received votes and karma score are public inside the platform.</li>
        <li>Self-voting, bots and artificial manipulation are prohibited.</li>
      </ul>

      <h2>6. Withdrawal and account deletion</h2>
      <p>You may stop participating at any time or request full account and data deletion by emailing <strong>{contact}</strong>. Withdrawal does not affect processing already lawfully carried out or anonymized results already produced.</p>

      <h2>7. Reports, moderation and results</h2>
      <p>Report illegal or abusive content to <strong>{contact}</strong>. White Mirror Lab may moderate, suspend or remove accounts that breach these terms. At the end of the experiment, results will be published using aggregated, anonymized or pseudonymized data.</p>

      <h2>8. Governing law</h2>
      <p>These terms are governed by Spanish law and applicable EU law.</p>

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
      <p className="legal-updated">WML 1.0 Karma Score - Version 1.0 - Last updated: June 10, 2026.</p>
      <p>White Mirror Lab works from the principle that experimental discomfort can be legitimate when it produces verifiable public-interest knowledge, but foreseeable real harm to people is not. This framework describes the ethical commitments and safeguards for WML 1.0.</p>

      <h2>1. Core principles</h2>
      <ul>
        <li><strong>Informed consent:</strong> no one participates without explicit acceptance of the experiment conditions and emotional-impact warning.</li>
        <li><strong>Voluntary participation:</strong> users may withdraw at any time without penalty.</li>
        <li><strong>Harm minimization:</strong> technical and procedural safeguards reduce harassment, doxxing, manipulation and disproportionate emotional harm.</li>
        <li><strong>Transparency:</strong> methodology, aggregated results and conclusions are intended to be published after the experiment.</li>
        <li><strong>Data minimization:</strong> only data needed for the declared purposes is collected.</li>
      </ul>

      <h2>2. Research design</h2>
      <p>WML 1.0 studies how publication, interaction and self-presentation patterns change under a public reputation score created by anonymous collective voting.</p>
      <p>Measures include karma score, aggregated voting patterns, content activity, engagement metrics and behavioral variation over time.</p>

      <h2>3. Safeguards</h2>
      <ul>
        <li>Voter anonymity by technical design and row-level security.</li>
        <li>Technical prevention of self-voting.</li>
        <li>Adult-only participation with explicit declaration.</li>
        <li>Ephemeral stories and limits on photo accumulation.</li>
        <li>Report channels, moderation and anti-bot rules.</li>
        <li>No automated decisions with legal or similarly significant effects.</li>
      </ul>

      <h2>4. Risks and support</h2>
      <p>Identified risks include emotional discomfort from negative votes, coordinated harassment, ranking manipulation and privacy incidents. Safeguards include informed consent, withdrawal rights, moderation, technical controls and incident response procedures.</p>
      <p>If the experiment causes emotional distress, consider contacting psychological support services available in your country.</p>

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
