# KI-Lizenzpartner Quiz Funnel

## Overview

A German-language lead generation quiz funnel for AI license partnerships. The application qualifies leads through a multi-step quiz before collecting contact information and redirecting to a Video Sales Letter (VSL) page.

**Purpose:** Convert Meta Ads traffic into qualified leads for an AI license partner program by:
1. Qualifying visitors through a 5-question quiz with disqualification logic
2. Collecting Name + Email from qualified leads
3. Redirecting to VSL page with video content and booking CTA

**Target Audience:** German-speaking professionals interested in earning commissions through AI product sales.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework:** React 18 with TypeScript
- **Routing:** Wouter (lightweight client-side router)
- **State Management:** TanStack React Query for server state, React useState for local UI state
- **Styling:** Tailwind CSS with shadcn/ui component library (New York style, dark theme with gold/amber accents)
- **Forms:** React Hook Form with Zod validation
- **Build Tool:** Vite

**Design Pattern:** Quiz funnel with progressive disclosure:
- `/` - Quiz landing page with hero, multi-step quiz, and lead capture form
- `/vsl` - Video sales letter page with application form

**Key Components:**
- `Quiz.tsx` - Multi-step qualification quiz with progress bar and disqualification handling
- `LeadForm.tsx` - Simple Name + Email capture after quiz completion
- `DisqualifiedMessage.tsx` - Shown when user selects disqualifying answers
- `VSLPlayer.tsx` - Video player component using react-player

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