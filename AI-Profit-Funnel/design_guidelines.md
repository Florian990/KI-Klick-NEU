# Design Guidelines: KI-Lizenzpartner Dark Quiz Funnel

## Design Approach
**Reference-Based:** High-converting quiz funnels (Typeform, Interact) meets dark premium SaaS (Linear, Raycast) with luxury finishes (gold accents). Optimized for German B2C AI opportunity seekers via Meta Ads.

**Core Principles:**
- Conversion through engagement: Quiz drives qualification before form
- Dark premium aesthetic: Serious opportunity, not gimmick
- High contrast hierarchy: Gold accents guide action
- Mobile-first: Touch-optimized quiz interactions

## Typography System
**Font Stack:** Inter (all uses)

**Hierarchy:**
- Hero Headline: Bold, 5xl-7xl, tight leading (-0.02em)
- Quiz Question: Bold, 3xl-4xl
- Section Headlines: Bold, 4xl-5xl
- Stats Numbers: Bold, 6xl-8xl, tabular-nums
- Body/Descriptions: Regular, lg, relaxed leading (1.7)
- CTAs: Semibold, xl, tracking-wide
- Quiz Answer Text: Medium, lg
- Fine Print: Regular, sm, muted opacity

**Dark Theme Considerations:** All text lighter weights for better rendering on dark backgrounds.

## Layout System
**Spacing Primitives:** Tailwind units of 4, 6, 8, 12, 16, 20, 24

**Container Strategy:**
- Max-width: 6xl for quiz/form, 7xl for content sections
- Section Padding: py-16 mobile → py-24 desktop
- Component Gaps: gap-6 to gap-12

## Component Specifications

### Hero Section
**Layout:** Centered, single column, min-h-screen with flex centering
**Elements:**
- Overline: Small badge ("Exklusives KI-Programm")
- Headline: 2-line bold promise
- Subheadline: Supporting benefit statement
- CTA Button: Large (px-12 py-6), gold accent, opens quiz
- Trust Line: Small text with checkmark icon ("2.847 aktive Lizenzpartner")
**Background:** Dark solid, no image. Subtle radial gradient overlay for depth.

### Quiz Section (Progressive Disclosure)
**Layout:** Centered card, max-w-4xl, step-by-step reveal
**Question Header:**
- Progress Bar: Top of card, gold fill
- Question Number: "Frage 1 von 5"
- Question Text: Bold, 3xl-4xl

**Answer Cards (3-4 per question):**
- Grid: 2-column (desktop) → 1-column (mobile)
- Card Size: p-8, rounded-2xl, border
- Icon: Top-left, h-10 w-10, gold accent
- Answer Text: Medium, lg
- State: Hover lift, selected state with gold border glow
- Click: Smooth transition to next question (300ms)

**Navigation:** "Zurück" text button, "Weiter" appears after selection

### Lead Capture Form (Post-Quiz)
**Trigger:** After final quiz answer
**Layout:** Modal overlay with dark backdrop blur, centered card max-w-xl
**Elements:**
- Headline: "Dein persönliches Angebot erstellen"
- Quiz Summary: Small recap pills showing selected answers
- Form Fields: Name, Email, Telefon (all full-width, py-4 px-6, rounded-xl)
- Submit Button: Full-width, gold accent, large
- Privacy Text: Small, below button with checkbox
**Validation:** Inline errors, success reveals VSL or next step

### Stats Section
**Layout:** 4-column grid (desktop) → 2-column (mobile), gap-8, py-24
**Stat Cards:**
- Number: Bold, 7xl-8xl, gold accent, tabular-nums
- Label: Regular, lg, muted
- Icon: Above number, h-12 w-12
- Cards: Centered text, p-8
**Stats:** Aktive Partner, Durchschn. Provision, Kundenzufriedenheit, Jahre Erfahrung

### Testimonials Section
**Layout:** 3-column grid (desktop) → 1-column (mobile), gap-6, py-20
**Testimonial Cards (6 total):**
- Card: p-8, rounded-2xl, bordered, dark card bg
- Quote: lg, leading-relaxed, italic
- Profile: Flex row, mt-6
- Avatar: Circular, h-14 w-14
- Name: Semibold, base
- Result: Regular, sm, gold accent ("€18.200 im ersten Monat")

### Story/Trust Section
**Layout:** 2-column (desktop) → 1-column (mobile), max-w-6xl, py-24
**Left Column:**
- Section Label: "Unsere Mission"
- Headline: Bold, 4xl
- Body: 3-4 paragraphs, lg, leading-relaxed
- Trust Badges: Row of certification/award icons

**Right Column:**
- Large stat callout or supporting image
- Key milestone timeline (3-4 points)

### Footer
**Elements:**
- Two-column: Links (Impressum, Datenschutz, AGB) + Copyright
- Social icons row
- Padding: py-12

## Images
**Testimonial Avatars:** 6 circular professional photos, diverse, authentic German professionals

**Icons:** Heroicons (outline style) for quiz answer cards, stats, and UI elements. Gold accent applied to icon containers/backgrounds.

**No hero background image** - dark gradient only for premium feel.

## Animations
**Purposeful Only:**
- Quiz transitions: Fade + slide between questions (300ms)
- Answer card hover: Subtle lift (translate-y-1)
- Modal/Lightbox: Fade + scale in (250ms)
- Stats: Count-up animation on scroll into view
- NO button hover customization

## Conversion Flow
1. Hero CTA → Opens Quiz
2. Quiz (5 questions) → Qualification + engagement
3. Form Capture → Unlocks VSL or booking
4. Social proof throughout → Trust building

**Mobile Optimization:** Touch targets minimum 44px, swipe gestures for quiz navigation on mobile.