# AINTRIX Global — Product Requirements Document

## Original Problem Statement
Build a complete production-ready world-class monochrome corporate website for **AINTRIX Global Private Limited** — a future-driven multi-sector innovation company. The experience must be cinematic, premium, editorial, minimal, and technologically advanced — comparable to Awwwards Site of the Day, Apple, Nothing, Stripe, Linear, and Pentagram. Every interaction must have purpose. No templates. Everything handcrafted.

Pages: Home, About, Ecosystem (8 divisions), Research, Internships, Careers, News, Contact, Admin Login, Admin Dashboard.

## Tech Stack (agreed with user)
- **Frontend:** React 18 + CRACO + Tailwind + Framer Motion + GSAP + Lenis + Three.js (react-three-fiber + drei) + Zustand + React Hook Form + Lucide-React
- **Backend:** FastAPI + Motor (async MongoDB) + PyJWT + bcrypt + Reportlab (PDF)
- **Auth:** Custom JWT bearer token (admin only, single admin seeded)
- **Email:** Skipped per user choice — leads stored in MongoDB + surfaced in Admin dashboard
- **Investor Deck:** Generated on-the-fly via Reportlab (email-gated download)

## User Personas
1. **Investor** — visits `/contact`, submits email, downloads investor deck PDF.
2. **Candidate** — browses `/careers` or `/internships`, submits application with resume upload.
3. **Researcher / Journalist** — reads `/news`, `/research`, `/about`, `/ecosystem`.
4. **Admin** — logs into `/admin`, manages all submissions + publishes news + posts jobs.

## Core Requirements — Delivered

### Cinematic Frontend Experience
- WebGL hero (Three.js chrome floating icosahedron + particles + Environment lighting) reacts to mouse
- Lenis smooth scroll on all public pages (native scroll for admin)
- GSAP ScrollTrigger progressive-bold text (font-weight 200 → 900) on Manifesto, Vision, Mission
- Split-text word-mask reveals on every H1
- Magnetic buttons (all CTAs) + custom dot+ring cursor with mix-blend-difference
- Film grain SVG noise overlay (opacity 0.055)
- Animated statistics ticker (GSAP scrub)
- Marquee wordmark strip
- Editorial monochrome design system per `/app/design_guidelines.json`

### Public Pages (all data-testid instrumented)
- `/` Home — hero + marquee + manifesto + ecosystem preview + stats + philosophy quote + timeline + CTA
- `/about` — vision, mission, philosophy, full timeline, leadership philosophy
- `/ecosystem` — all 8 divisions with alternating layouts (RYZE featured)
- `/research` — dynamic list from `/api/research`, roadmap grid
- `/internships` — why-join, FAQ accordion, application form with resume upload
- `/careers` — job listings from `/api/jobs`, slide-in drawer with apply form
- `/news` — category filter, featured article, grid
- `/news/:slug` — full article view
- `/contact` — contact form + investor deck email gate + Google Maps embed

### Admin Dashboard (`/admin`)
- Split-layout login (`/admin/login`)
- Dashboard tabs: Overview (stats grid), Contacts, Investor Leads, Career Apps, Internships, News CMS, Jobs
- News CMS: create / delete articles with slug + category + cover image + body
- Jobs: create / delete job listings (feeds `/careers` page)

### Backend APIs (`/api/*`) — all tested green
- Auth: `POST /auth/login`, `GET /auth/me`
- Public reads: `GET /jobs`, `/articles`, `/articles/:slug`, `/research`
- Public writes: `POST /contacts`, `/investor-leads`, `/internships`, `/career-applications`
- Investor deck: `GET /investor-deck/download` (generated PDF via Reportlab)
- File upload: `POST /uploads/resume` (PDF/DOC/DOCX, extension validated)
- Admin: `GET /admin/stats`, `GET /admin/{collection}`, full CRUD on articles + jobs
- Startup seeds admin user (idempotent), 5 demo jobs, 3 demo articles, 4 research posts

## What's Been Implemented (2026-07-20)
- ✅ Full frontend scaffold (React 18 + CRACO + Tailwind) from scratch
- ✅ 11 pages with cinematic monochrome design, editorial typography, WebGL hero
- ✅ Full FastAPI backend (~670 lines) with JWT auth, all CRUD endpoints, PDF generator
- ✅ MongoDB integration via Motor, all documents ObjectId-safe serialized
- ✅ Admin dashboard with 7 tabs + CMS
- ✅ Seeded demo data (jobs, articles, research)
- ✅ 34/34 backend tests passing (`/app/test_reports/iteration_1.json`)
- ✅ SEO meta + OpenGraph + Twitter cards in `public/index.html`
- ✅ Design tokens honor `/app/design_guidelines.json`

## Backlog (P1)
- Wire SendGrid email notifications when API key is provided (currently `skipped for now`)
- Rate-limiting / brute-force lockout on `/api/auth/login` (5 fails → 15 min)
- Duplicate-slug guard on `PUT /admin/articles/:id`
- Sitemap.xml + robots.txt endpoints
- Docker / Nginx / GitHub Actions config files (documented, not runtime)

## Backlog (P2)
- Split `server.py` into `routers/` + `services/pdf.py`
- Migrate to FastAPI lifespan handlers
- Signed URLs / auth gate on `/api/uploads/resume/:fid`
- Prerender / SSR for SEO crawler support
- Analytics wiring (Plausible or self-hosted)
- Real leadership team photos + bios once provided

## Next Action Items
- User to test the full site & confirm content voice
- Provide SendGrid API key + verified sender to activate email notifications
- Provide real investor deck PDF (currently placeholder generated on-the-fly)
- Provide leadership photos and bios for `/about`
