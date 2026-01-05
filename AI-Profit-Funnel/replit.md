# KI-Lizenzpartner Quiz Funnel

## Overview

A German-language lead generation quiz funnel for AI license partnerships. The application qualifies leads through a multi-step quiz before showing a Video Sales Letter (VSL). Built as a full-stack TypeScript application with React frontend and Express backend.

**Purpose:** Convert Meta Ads traffic into qualified leads for an AI license partner program by qualifying visitors through a quiz, then collecting Name + Email for access to an exclusive video training.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework:** React 18 with TypeScript
- **Routing:** Wouter (lightweight React router)
- **State Management:** TanStack React Query for server state
- **Styling:** Tailwind CSS with shadcn/ui component library
- **Forms:** React Hook Form with Zod validation
- **Build Tool:** Vite with custom plugins for Replit integration

**Design Pattern:** Quiz funnel architecture with multi-step qualification flow:
1. Landing page with hero + quiz trigger
2. Quiz component (5-6 questions with disqualification logic)
3. Lead form (Name + Email only)
4. Redirect to VSL page with video + CTA

**Pages:**
- `/` - Quiz landing page (hero, quiz, stats, 3-steps, story placeholder)
- `/vsl` - Video sales letter page with "Termin vereinbaren" CTA

**Key Components:**
- Quiz.tsx - Multi-step quiz with progress bar and disqualification
- LeadForm.tsx - Simple Name + Email form
- DisqualifiedMessage.tsx - Shown when user selects disqualifying answers

### Backend Architecture
- **Framework:** Express.js with TypeScript
- **API Design:** RESTful endpoints under `/api` prefix
- **Current Endpoint:** `POST /api/leads` for lead capture with Zod validation

**Request Flow:** Client submits form → Express validates with Zod schema → Storage layer persists data → Returns success/error response

### Data Storage
- **ORM:** Drizzle ORM with PostgreSQL dialect
- **Schema Location:** `shared/schema.ts` (shared between frontend and backend)
- **Current Implementation:** In-memory storage (MemStorage class) for development
- **Production Ready:** PostgreSQL schema defined, requires DATABASE_URL environment variable

**Data Models:**
- `leads` table: name, email, phone, UTM tracking parameters (source, medium, campaign, content, term), timestamps
- `users` table: Basic auth structure (username, password, id)

### Build System
- **Development:** Vite dev server with HMR, proxied through Express
- **Production:** Vite builds client to `dist/public`, esbuild bundles server to `dist/index.cjs`
- **TypeScript:** Strict mode, path aliases configured (`@/` for client, `@shared/` for shared code)

## External Dependencies

### UI Components
- **shadcn/ui:** Full component library installed (Radix UI primitives)
- **Styling:** Tailwind CSS with CSS variables for theming (light mode configured)

### Third-Party Integrations
- **Meta Pixel:** Frontend includes Facebook pixel tracking hooks (PageView, Lead events)
- **Video Player:** react-player for VSL playback
- **Font Loading:** Google Fonts (DM Sans, Space Grotesk, Fira Code, Geist Mono)

### Database
- **PostgreSQL:** Required for production (Drizzle configured)
- **Session Store:** connect-pg-simple available for session management

### Key NPM Packages
- Form handling: @hookform/resolvers, react-hook-form, zod
- Data fetching: @tanstack/react-query
- Database: drizzle-orm, drizzle-zod, pg
- UI: Full Radix UI primitive suite, embla-carousel-react, lucide-react icons