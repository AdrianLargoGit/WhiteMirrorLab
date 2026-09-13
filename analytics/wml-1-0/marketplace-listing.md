# Marketplace Listing Draft

## Title

WML 1.0 Aggregated Product Analytics Dataset

## Short Description

Aggregated analytics from a 92-day Spanish-language micro social experiment measuring consent, signups, voting, profile/ranking attention, sharing, geography, device mix and acquisition channels.

## Long Description

WML 1.0 was an experimental web product by White Mirror Lab. The product tested whether a small public reputation mechanic could turn curiosity into explicit participation through a consent gate, profiles, rankings, voting and sharing.

This data product contains privacy-preserving aggregate tables only. It is intended for product teams, UX researchers, founders and analysts studying early-stage consumer-product behavior, consent friction, social mechanics and Spanish-language traffic patterns.

The dataset covers activity from 2026-06-10 to 2026-09-09:

- 45,077 total events.
- 2,253 distinct anonymous identifiers.
- 2,979 sessions.
- 7,609 pageviews.
- 36 event types.
- 293 consent users.
- 139 signup users.
- 343 persisted profile votes in Supabase: 244 positive and 99 negative.
- 71.14% of persisted profile votes were positive.
- 49 posts and 47 pulses, with pulse replies present but no persisted votes on posts or pulses.

## Files Included

- `monthly_summary.csv`
- `section_summary.csv`
- `key_actions.csv`
- `region_summary.csv`
- `posthog-aggregate-summary.json`
- Methodology and commercial notes.

## Privacy And Compliance

No raw event rows are included. No emails, names, usernames, IP addresses, profile URLs, device IDs, session IDs, PostHog `distinct_id` values, free-text searches, uploads, stories, post content, pulse content or session recordings are included.

Rows with small populations are suppressed or marked for internal/rounded-only use. Buyers are prohibited from reidentification, individual targeting, enrichment against identity datasets, resale as profiles or attempts to infer individual behavior.

## Suggested Categories

- Product analytics
- Consumer insights
- UX research
- Mobile and web behavior
- Privacy and consent research
- Spanish-language digital products

## Suggested Price

- EUR 490 starter license.
- EUR 1,500 research license with methodology and commercial use rights.
- EUR 3,000-5,000 exclusive analysis package.
