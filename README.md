<div align="center">
  <img width="1200" alt="Creative agency website banner" src="./t.jpg" />
</div>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-0.2.0-2f6fed" />
<img alt="Status" src="https://img.shields.io/badge/status-active-18a058" />
<img alt="React" src="https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black" />
<img alt="Vite" src="https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white" />
<img alt="Tailwind CSS" src="https://img.shields.io/badge/TailwindCSS-06B6D4?logo=tailwindcss&logoColor=white" />
<img alt="Python" src="https://img.shields.io/badge/python-3.11+-3776AB?logo=python&logoColor=white" />
<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" />
<img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black" />
  
</p>

# ConvertandCo

## Creative Agency Portfolio

A responsive, motion-led agency website for Shopify development, AI automation, product advertising.
## Founder : Mohammed Febin CEO
## Co-Founder : Mohammed Kahab K CTO
## Highlights

- Interactive image-trail hero
- Responsive featured-project banner
- Recent Shopify and ecommerce work showcase
- Animated partner-logo marquee
- Service, process, automation, and case-study sections
- Animated Figma-style capability graphic
- Holographic promotional ticket (display-only demo)
- Supabase-backed enquiry form with validation and spam protection
- Private admin dashboard for reviewing saved form responses
- Mobile layouts and reduced-motion support
- High qulty primum web

## Tech stack
- React 19
- TypeScript
- Vite 6
- Tailwind CSS 4
- CSS animations and responsive layouts

## Enquiry admin setup

The contact form saves responses through `/api/enquiries` into Supabase. The
browser never receives the Supabase service-role key or direct table access.

1. Run [`supabase/enquiries.sql`](supabase/enquiries.sql) in Supabase SQL Editor.
2. Enable Email/Password in Firebase Authentication.
3. Create the Firebase user `kahabhns@gmail.com`, choose a strong unique
   password, and verify that email address.
4. Configure the server variables from `.env.example`, especially
   `FIREBASE_PROJECT_ID`, `SUPABASE_URL`, a Supabase
   `SUPABASE_SECRET_KEY` (or the legacy `SUPABASE_SERVICE_ROLE_KEY`), and
   `ADMIN_EMAIL`. Set `ADMIN_FIREBASE_UID` to the UID shown for that Firebase
   user to lock access to one exact account. `RATE_LIMIT_SALT` may be set to a
   separate random server secret; otherwise the Supabase server key is used for
   the HMAC.
5. Open `/admin` and sign in. Passwords are managed by Firebase and are never
   stored in this repository or Supabase.

The enquiry endpoint accepts same-origin JSON only, rejects oversized or
malformed fields, applies atomic per-IP and per-email limits, and stores only
HMAC hashes for rate limiting. Supabase RLS and explicit grants deny the
`anon` and `authenticated` roles; elevated keys stay server-side.
  
## Run locally

Prerequisite: Node.js 18 or newer.

```bash
npm install
npm run dev
```

The development server runs at `http://localhost:3000`.

## Validation and production build

```bash
npm run lint
npm run build
npm run preview
```

Production files are generated in `dist/`.

## Project structure

```text
src/
  components/
    PolaroidTrailHero.tsx     Interactive hero and image trail
    PostHeroSections.tsx      Portfolio, services, process, and contact
    FigmaServiceCard.tsx      Animated capability graphic
    PromoTicket.tsx           Display-only promotional ticket
imgeasset/                    Hero and campaign artwork
web_aset/                     Recent-work screenshots
logos/                        Partner-logo marquee assets
t.jpg                         Featured banner image
```

## Content and assets

- Change the featured banner in `PostHeroSections.tsx`.
- Add or update recent-work screenshots in `web_aset/`, then update the `PROJECTS` list.
- Add partner logos in `logos/`, then update the `LOGOS` list.
- Hero trail imagery is configured in `PolaroidTrailHero.tsx`.
