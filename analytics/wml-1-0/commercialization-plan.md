# WML 1.0 Data Commercialization Plan

Prepared on 2026-09-09 from PostHog project `196058`, using aggregated analytics only.

## Positioning

Sell this as a compact research asset, not as user-level behavioral data:

**WML 1.0: consent-led micro social experiment analytics.** A 92-day dataset about how visitors moved through a small experimental web product involving consent, profiles, rankings, voting, sharing and a later pivot toward a local desktop pet.

The strongest buyer story is product research: early-stage conversion, privacy/consent friction, geography of Spanish-language adoption, desktop-versus-mobile intent, and small-community engagement.

## What Can Be Sold

Package only aggregated tables:

- Daily and monthly totals: events, pageviews, sessions, distinct visitors.
- Event-level counts: consent, signup, vote, profile view, ranking view, share.
- Route groups: landing, download, WML 1.0 archive/app, marketplace, creator skins.
- Coarse geography: region and countries with at least 20 users.
- Device/browser/OS aggregates with at least 20 users.
- Referrer/channel aggregates with at least 20 users.
- Commentary explaining product context and collection limitations.

Do not sell raw rows, profile URLs, usernames, uploads, stories, search terms, free text, persistent IDs, session IDs, IPs or recordings.

## Release Rules

- Apply k-anonymity: publish a row only when `users >= 20`; use `users >= 10` only for internal review.
- Round small metrics where useful, for example nearest 5 or 10.
- Replace exact timestamps with day, week or month buckets.
- Keep geography at country or region level only.
- Combine long-tail referrers into `Other`.
- Include a data dictionary and a limitations note in every buyer sample.
- Contractually prohibit reidentification, enrichment against third-party identity graphs, resale as user profiles, and individual targeting.

## Current Aggregate Facts

- Range: 2026-06-10 to 2026-09-09.
- Total events: 45,077.
- Distinct identifiers: 2,253.
- Sessions: 2,979.
- Pageviews: 7,609.
- Event types: 36.
- Main WML 1.0/archive section: 4,237 pageviews from 829 users.
- Consent: 293 users.
- Signups: 139 users.
- Voting: 443 votes from 74 voters.
- Shares: 46 shares from 34 users.
- Upload-style events are too small/sensitive for row-level sale: 13 posts, 7 pulses, 1 story upload.
- Supabase contains 309 profiles, 49 posts, 47 pulses and 343 recorded votes.
- All recorded Supabase votes target profiles, not posts or pulses.
- Profile votes skew positive: 244 positive votes and 99 negative votes, or 71.14% positive versus 28.86% negative.
- 67 profiles received at least one vote; 39 of those received only positive votes, while 7 received more negative than positive votes.
- Pulses show reply behavior but not voting behavior: 24 root pulses, 23 replies and 17 pulses with at least one reply.
- Profiles with at least one post or pulse concentrated 303 of 343 persisted votes.
- Profiles with uploaded content received an average of 8.66 votes per profile, compared with 0.15 votes per profile for profiles without posts or pulses.
- Profiles with posts received 296 votes at 68.24% positive.
- Profiles with pulses received 124 votes at 81.45% positive. This overlaps with post profiles, so it should be interpreted as a profile-level content-presence signal, not as direct pulse voting.
- Profiles with both posts and pulses received 117 votes at 82.05% positive.
- Profiles with three or more content items received 159 votes at 81.13% positive.

## What The Experiment Says

WML 1.0 is best interpreted as an observational micro-experiment in social evaluation under an explicit consent gate.

The clearest finding is that users who reached the voting behavior tended to reward rather than punish: recorded profile votes were 71.14% positive. This does not mean people generally evaluate strangers positively, because the sample is self-selected and the interface shaped the behavior. It does mean that, inside this product, a lightweight public reputation mechanic generated more positive than negative feedback.

The second finding is conversion friction. Out of 1,466 users with pageviews, 293 users gave experiment consent and 139 users signed up. The consent gate did not kill participation, but it filtered the audience sharply.

The third finding is that content creation was much weaker than evaluation. There were 49 posts and 47 pulses, but votes concentrated on profiles. The product behaved more like a profile-judgment/ranking experiment than a media-rating or microblogging experiment.

The fourth finding is that uploaded content appears to attract attention. Profiles with posts or pulses concentrated 303 of 343 persisted votes. This cannot prove that a specific image or pulse caused a positive vote, because the vote target was the profile. It can support a careful claim: profiles that showed more of themselves or participated with content drew more evaluation, and profiles with both posts and pulses skewed strongly positive.

The fifth finding is market direction. The audience was overwhelmingly Spanish-language, strongly Spain/Latin America, and mostly desktop/Windows. That supports the pivot from WML 1.0 toward WML X.X.0 as a local desktop product.

## Pricing

Recommended starting prices:

- Public/free sample: one-page PDF plus 8-12 heavily rounded rows.
- Starter license: EUR 490 for CSV aggregates and a short methodology note.
- Research license: EUR 1,500 for full aggregate package, data dictionary, caveats and one update.
- Exclusive analysis/report: EUR 3,000-5,000 if a buyer wants interpretation, charts, and a call.

Do not price this like a large alternative-data feed. The value is niche context and product insight, not volume.

## Where To Sell

- Direct first: publish the WML 1.0 results page and add a contact CTA for product teams, UX researchers, AI/consumer app founders and privacy researchers.
- Datarade: good first marketplace because it supports provider listings and a commission-only tier. Datarade says providers must have rights/consent and cannot list unanonymized PII.
- Gumroad/Lemon Squeezy/Stripe Payment Links: best for a lightweight PDF/CSV report sold directly from your own audience.
- Kaggle: use only as free sample/lead magnet, not the paid asset.
- Snowflake Marketplace or AWS Data Exchange: only later, once the dataset grows or becomes recurring; setup and buyer expectations are heavier.

## Legal Checklist Before Sale

- Confirm the privacy policy/cookie consent allowed analytics use and commercial aggregate reporting.
- Confirm no special-category personal data is included.
- Document the lawful basis for processing and aggregation.
- Keep raw PostHog exports internal; sell only the aggregated derivative.
- Have a lawyer review the license if selling outside Spain/EU.
- Revoke or rotate temporary API keys after extraction.

Useful references:

- PostHog API documentation: https://posthog.com/docs/api
- PostHog batch exports: https://posthog.com/docs/cdp/batch-exports
- FTC note that hashing does not make data anonymous: https://www.ftc.gov/policy/advocacy-research/tech-at-ftc/2024/07/no-hashing-still-doesnt-make-your-data-anonymous
- AEPD FAQ on anonymized data: https://www.aepd.es/preguntas-frecuentes/0-conceptos-basicos/FAQ-0005-sobre-los-datos-anonimizados
- Datarade provider application: https://providers.datarade.ai/apply
- Snowflake Marketplace provider docs: https://docs.snowflake.com/en/collaboration/provider-becoming
