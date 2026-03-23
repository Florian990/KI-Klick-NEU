# KI-Klick Methode – VSL-first Funnel

## Overview

A German-language VSL-first lead generation funnel for AI license partnerships. The application shows a video first, unlocks a booking CTA after 50% watch-time, then qualifies leads through a 3-question mini-funnel before opening a Calendly booking popup.

**Purpose:** Convert Meta Ads traffic into qualified Calendly appointments by:
1. Showing the VSL video on the homepage (YouTube embed with seek protection)
2. Unlocking the "Jetzt Termin buchen" CTA after 50% of video is watched (with countdown timer)
3. Qualifying leads through a 3-question mini-funnel (disqualify on wrong answers)
4. Opening Calendly popup directly after passing all 3 questions

**Funnel Flow:**
- `/` - Homepage: Headline → Video → Timer → CTA (unlocks at 50%) → Mini-Funnel → Calendly popup
- `/vsl` - Legacy VSL page (kept for backwards compatibility, not actively linked)

**Target Audience:** German-speaking professionals interested in earning commissions through AI product sales.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework:** React 18 with TypeScript
- **Routing:** Wouter (lightweight client-side router)
- **State Management:** TanStack React Query for server state, React useState for local UI state
- **Styling:** Tailwind CSS with shadcn/ui component library (New York style, light theme with gold/amber accents)
- **Build Tool:** Vite

**Design:** Light theme (white background), gold primary color (`38 92% 45%`), text-highlighter effect via `.highlight` and `.highlight-strong` CSS classes.

**Key Components:**
- `MiniFunnel.tsx` - 3-question mini-funnel after CTA click (Zeit / Budget / Alter)

### Backend Architecture
- **Framework:** Express.js with TypeScript
- **API Design:** RESTful endpoints under `/api` prefix
- **Validation:** Zod schemas shared between frontend and backend
- **Development Server:** Vite middleware for HMR in development, static file serving in production

**API Endpoints:**
- `POST /api/leads` - Lead capture with email duplicate checking

### Data Storage
- **ORM:** Drizzle ORM with PostgreSQL dialect
- **Schema Location:** `shared/schema.ts` (shared types between frontend and backend)
- **Tables:** `users` (auth), `leads` (funnel captures with UTM tracking)
- **Current State:** In-memory storage (MemStorage) for development; PostgreSQL schema ready for production

**Lead Schema Fields:** name, email, phone (optional), UTM parameters (source, medium, campaign, content, term), createdAt

## External Dependencies

### Third-Party Libraries
- **UI Components:** Radix UI primitives via shadcn/ui
- **Video Player:** react-player for VSL playback
- **Carousel:** embla-carousel-react for testimonials

### External Services
- **Database:** PostgreSQL (requires DATABASE_URL environment variable)
- **Analytics:** Meta Pixel integration ready (fbq tracking calls in code)

### Build & Development
- **Replit Plugins:** vite-plugin-runtime-error-modal, vite-plugin-cartographer, vite-plugin-dev-banner
- **Session Storage:** connect-pg-simple for PostgreSQL session storage (ready but not active)