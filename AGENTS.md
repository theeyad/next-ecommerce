<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:note -->

VERY IMPORTANT NOTE: ALWAYS DISCUSS WITH ME BEFORE IMPLEMENTING ANY THING, AND DO NOT IMPLEMENT ANY THING WITHOUT MY APPROVAL.

<!-- END:note -->

<!-- BEGIN:design-rules -->

# Design System rules

---
name: master-ecommerce-design
description: >
  Master design skill for Next.js TypeScript e-commerce projects.
  Synthesized from: designer-skills (ui-design), motion-design (LottieFiles),
  color-expert (meodai), google-fonts (sliday), responsive-craft (kylezantos),
  and frontend-design (Anthropic). Apply to customer pages, admin panels, and
  auth flows. Use when designing, reviewing, or implementing any UI in the project.
version: "1.0.0"
target: Next.js + TypeScript e-commerce (customer, admin, auth)
---

# Master E-Commerce Design Skill

> Apply this skill to every UI decision in the project — layout, color, typography,
> motion, responsiveness, and accessibility. It is the single source of truth.
> When rules conflict, the section marked **[CRITICAL]** wins.

---

## PART 1 — IDENTITY & BRIEF CONTRACT

Before writing any code or picking any color, confirm:

1. **What is the product?** Name it. Know the brand tone (premium, friendly, trustworthy, bold).
2. **Who is the user?** Customer (shopping), Admin (managing), or Auth (onboarding).
3. **What is the primary job of each page?**
   - Customer: convert browsers to buyers.
   - Admin: surface data, enable fast action.
   - Auth: reduce friction, build trust.

Design choices must serve those jobs. If a visual decision cannot be traced back to one of them, cut it.

**Anti-defaults [CRITICAL]:** The following are forbidden as defaults — use only if the brief explicitly requires them:
- Warm cream background (#F4F1EA range) + terracotta accent
- Near-black background + single acid-green/vermilion accent
- Identical rounded cards with soft `rgba(0,0,0,.1)` shadows on everything
- ALL-CAPS tracked-out eyebrow labels above every heading
- `→` appended to all CTA text
- Numbered markers (01/02/03) unless content is genuinely sequential
- Accenting a single word in a headline with a different colo
- WE DO NOT USE CURSOR POINTER ANYMORE

---

## PART 2 — COLOR SYSTEM

### 2.1 Architecture (Three Layers)

Always use three token layers. Never use raw hex values in components.

```
Reference tokens  →  Semantic tokens  →  Component usage
(palette.red-600)     (color.danger)       (button.destructive.bg)
```

### 2.2 Building the Palette (OKLCH First)

Use OKLCH for all newly defined tokens. It is perceptually uniform — consistent lightness across hues, no muddy mid-tones.

```css
/* Correct */
--brand-500: oklch(62% 0.18 250);

/* Wrong — HSL lightness is not perceptual */
--brand-500: hsl(220, 70%, 50%);
```

**CSS native tools to use before reaching for JS:**
```css
color-mix(in oklab, var(--brand-500) 30%, white)   /* tint */
oklch(from var(--brand-500) calc(l * 0.85) c h)    /* darken hover */
linear-gradient(in oklch, var(--from), var(--to))  /* no gray mid-point */
light-dark(var(--surface-light), var(--surface-dark)) /* theme switch */
```

### 2.3 Required Palette Sections

**Brand palette** — Primary, secondary, accent. Full tonal scale 50–950.

**Neutral palette** — For text, backgrounds, borders, surfaces. Never pure black or white; use near-black and off-white.

**Semantic palette:**
```
success  → background, foreground, border, icon variants
warning  → background, foreground, border, icon variants
error    → background, foreground, border, icon variants
info     → background, foreground, border, icon variants
```

### 2.4 Semantic Token Mapping (E-Commerce Roles)

```
surface.page          → page background
surface.card          → product card, admin table row
surface.overlay       → modal, drawer backdrop
surface.input         → form field background

text.primary          → headings, body
text.secondary        → labels, captions, metadata
text.disabled         → inactive states
text.onBrand          → text on brand-colored backgrounds

border.default        → card borders, dividers
border.focus          → focus ring (never remove this)
border.input          → form field borders

status.inStock        → green semantic
status.lowStock       → warning semantic
status.outOfStock     → error semantic
status.sale           → accent variant

action.primary.bg     → main CTA (Add to Cart, Checkout, Save)
action.primary.hover  → oklch(from var(--action.primary.bg) calc(l * 0.9) c h)
action.secondary.bg   → ghost/outline variant
action.destructive.bg → delete, cancel, remove
```

### 2.5 Dark Mode

Dark mode is not inversion — it is a redesign of surfaces.

Surface elevation in dark mode uses **lighter shades**, not shadows:
```
Background:  darkest  (~oklch(15% 0.01 250))
Surface 1:   slightly lighter (cards)
Surface 2:   lighter (modals, dropdowns)
Surface 3:   lightest dark (tooltips)
```

Rules:
- Desaturate brand colors 10–20% for dark backgrounds
- Body text: off-white (~oklch(90% 0 0)), not pure white
- Borders: low-opacity white (`oklch(100% 0 0 / 0.12)`)
- Always use `prefers-color-scheme` + manual toggle

Use semantic tokens — dark mode requires zero component changes if tokens are correct.

### 2.6 Accessibility [CRITICAL]

| Use case | Minimum contrast |
|----------|-----------------|
| Body text (normal) | 4.5:1 (WCAG AA) |
| Large text (18px+ or 14px bold) | 3:1 |
| UI components (borders, icons) | 3:1 |
| Body text preferred | 7:1 (WCAG AAA) |

**Never convey meaning by color alone.** Always pair with icon, label, or pattern.

**Chart elements:** Instead of requiring 3:1 between every chart color (near impossible at scale), add a border on chart elements and require 3:1 between each fill and its border only.

**Accessibility numbers to know:**
- Only 11.98% of all hex color pairs pass WCAG AA (4.5:1)
- Only 3.64% pass WCAG AAA (7:1)
- Random color selection will almost always fail — test every pair

### 2.7 Color Harmony Rules

- **Character-first, not hue-first.** Chroma and lightness drive perceived mood more than hue. A muted palette reads as calm across many hues.
- **60-30-10 rule.** 60% dominant, 30% secondary, 10% accent. One color dominates.
- Grayscale check: convert the palette to grayscale. If elements become indistinguishable, the design fails without color.

---

## PART 3 — TYPOGRAPHY

### 3.1 Font Selection (Google Fonts)

For e-commerce (Next.js): use **pair mode** with **minor-third scale (ratio 1.2)**.

Decision guide for this project:
```
E-Commerce  →  pair  →  minor-third  →  "clean friendly conversion"
```

**Pairing contrast types (pick one):**
- Structure: Serif heading + Sans body — safest, most contrast
- Proportion: Geometric sans + Humanist sans — modern, subtle
- Weight: Single variable font family, different weights — simplest

**Quality rules:**
- Prefer variable fonts (fewer HTTP requests, full weight flexibility)
- Never use a single-weight font for body text
- Body font must be marked `Body_Suitable: Yes`
- Use Tier A fonts first, then B, then C
- Max 3 font families total (heading + body + optional mono for code/SKUs)

**Always include in `<head>`:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
```
Always use `display=swap` in Google Fonts embed URL.

### 3.2 Type Scale (Minor Third — ratio 1.2)

```
xs:   12px  / line-height: 1.5  / letter-spacing: 0.01em
sm:   14px  / line-height: 1.5  / letter-spacing: 0.01em
base: 16px  / line-height: 1.6  / letter-spacing: 0
lg:   19px  / line-height: 1.5  / letter-spacing: -0.01em
xl:   23px  / line-height: 1.4  / letter-spacing: -0.01em
2xl:  28px  / line-height: 1.3  / letter-spacing: -0.02em
3xl:  34px  / line-height: 1.2  / letter-spacing: -0.02em
4xl:  41px  / line-height: 1.1  / letter-spacing: -0.03em
5xl:  49px  / line-height: 1.05 / letter-spacing: -0.03em
```

Use `clamp()` for fluid scaling between breakpoints:
```css
--text-hero: clamp(2rem, 5vw + 1rem, 3.5rem);
```

### 3.3 Typography Rules

- Line length: **max 75 characters** for body text. Use `max-width: 65ch` on prose containers.
- Serif fonts: slightly longer line length + slightly more `line-height` than sans.
- **Never use iOS input font-size below 16px** — Safari zooms the viewport. Use `font-size: max(16px, 1rem)` on all inputs.
- Sentence case everywhere. Avoid ALL CAPS except where semantically required (e.g., currency codes).
- Typography carries personality. Use weight, spacing, and size as active design elements, not neutral delivery.

### 3.4 Copy Rules

Words are design content. Apply the same minimalism as spacing and color.

- **CTAs:** state exactly what happens. "Add to Cart" not "Submit." "Place Order" not "Continue."
- **Active voice.** The action keeps the same name end-to-end: button says "Publish" → toast says "Published."
- **Errors:** never vague, never apologetic. State what failed and how to fix it.
- **Empty states:** invitation to act, not a dead end.
- **User perspective:** "Your orders" not "Orders database." Name things by what users understand.

---

## PART 4 — SPACING SYSTEM

Base unit: **4px**. Build on multiples of 4.

```
2xs:  2px   — hairline separators only
xs:   4px   — icon padding, tight inline
sm:   8px   — component internal padding, icon-to-label gap
md:   16px  — card padding, form field padding
lg:   24px  — section internal spacing
xl:   32px  — card gap, between groups
2xl:  48px  — between sections
3xl:  64px  — page-level vertical rhythm
4xl:  96px  — hero padding, major section breaks
```

**Application rules:**
- Related items: sm/md
- Distinct sections: xl/2xl
- Page margins: responsive, consistent per breakpoint
- Always use the scale. Never arbitrary values.

**Density modes:**
- Compact (admin tables, data-dense views): reduce one step
- Comfortable (default): standard scale
- Spacious (checkout, reading-focused): increase one step

---

## PART 5 — LAYOUT & RESPONSIVE DESIGN

### 5.1 Escalation Model [CRITICAL]

Resolve layout in this order — stop at the first layer that solves it:

```
1. Intrinsic CSS (auto-fit, flex-wrap, clamp())  ← try first
2. Container queries (@container)                 ← component-level
3. Media queries (@media min-width)               ← page-level only
```

Never reach for a media query if intrinsic CSS or a container query solves it.

### 5.2 Breakpoints

Mobile-first. Always `min-width`. Never `max-width`.

```
sm:  640px   — tablets portrait
md:  768px   — tablets landscape
lg:  1024px  — laptops
xl:  1280px  — desktops
2xl: 1536px  — wide desktops
```

### 5.3 Three-Layer System

| Layer | Tool | Handles |
|-------|------|---------|
| Continuous | `clamp()`, fluid tokens | Smooth scaling — font, padding, gap |
| Component | `@container` | Card layout, nav item reflow |
| Structural | `@media min-width` | Grid columns, nav transform, sidebar |

### 5.4 E-Commerce Page Patterns

**Product grid:**
```css
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
  gap: var(--space-xl);
}
```

**Checkout layout:**
```css
/* Single column on mobile, two-column (content + summary) on lg+ */
@media (min-width: 1024px) {
  .checkout-layout { display: grid; grid-template-columns: 1fr 380px; }
}
```

**Admin dashboard:**
```css
/* Sidebar collapses to top nav on mobile */
.admin-layout {
  display: grid;
  grid-template-columns: 240px 1fr; /* lg+ */
}
```

### 5.5 Critical CSS Gotchas [CRITICAL]

These break silently. Check every output:

| Problem | Cause | Fix |
|---------|-------|-----|
| Mobile overflow | `100vh` | Use `svh`/`dvh` with `vh` fallback |
| Sticky broken | Ancestor has `overflow: hidden` | Use `overflow: clip` for visual clipping |
| Fixed element mispositioned | Ancestor has `transform` | Remove transform or restructure |
| iOS input zoom | `font-size < 16px` | `font-size: max(16px, 1rem)` |
| Flex child overflow | Missing `min-width: 0` | Add `min-width: 0` to flex children with dynamic content |
| Sticky doesn't stick | Missing `align-self: start` in flex/grid parent | Add `align-self: start` |
| Safe area missing | Notched devices | `env(safe-area-inset-*)`, requires `viewport-fit=cover` |
| Z-index chaos | Arbitrary `9999` values | Use `isolation: isolate` + tiered z-index scale |

**Test by dragging:** Slowly resize from 280px to 2560px. Don't only check named breakpoints. This catches in-between failures.

---

## PART 6 — VISUAL HIERARCHY & GESTALT

Apply these principles in order when composing any screen:

**Proximity** — Spatial closeness groups elements more strongly than any other cue. Use it before adding borders or backgrounds.

**Similarity** — Shared color, shape, or size signals elements belong to one category. Use for product states (in stock, sale, new).

**Common Region** — A shared container groups elements regardless of spacing. Use when grouping must survive tight layout.

**Figure-Ground** — Establish which layer is foreground (actionable) vs background. Critical for modals, drawers, dropdowns.

**Visual Hierarchy** — Size > Weight > Color > Spacing > Position. The eye lands in intended order. Never let two elements compete for the same weight.

**Von Restorff Effect** — The element that differs is remembered. Use for one primary CTA per screen. Don't make everything stand out.

**Aesthetic-Usability Effect** — Polished, consistent interfaces are perceived as more usable. Visual quality is a functional investment.

**Visual Structure rules:**
- Borders, dividers, and numbering encode information, not decoration.
- Numbered markers (01/02/03) only when content is genuinely a sequence.
- White space is structure. Use it before adding visual separators.

---

## PART 7 — MOTION DESIGN

### 7.1 Motion Personality for E-Commerce

Default to **Corporate** archetype for UI. Use **Playful** for success states and illustrations only.

| Archetype | Duration | Easing | Overshoot | Use |
|-----------|----------|--------|-----------|-----|
| Corporate | 200-400ms | `cubic-bezier(0.2,0,0,1)` | 0-3% | All UI transitions |
| Playful | 150-300ms | `ease-out-back` | 10-20% | Success states, empty state illustrations |

**Brand Motion Identity (define these three constants and apply consistently):**
1. Signature easing: `cubic-bezier(0.2, 0, 0, 1)` (Material Design 3 default)
2. Duration palette: 150ms (quick) / 250ms (standard) / 400ms (slow)
3. Entrance pattern: translate Y + opacity fade (20px below, opacity 0 → position, opacity 1)

### 7.2 Duration Reference

| Element | Duration |
|---------|----------|
| Button press / toggle | 120-180ms |
| Icon transition | 150-250ms |
| Card enter / exit | 200-350ms |
| Modal / drawer | 300-400ms |
| Page transition | 400-600ms |
| Hover feedback | < 100ms |
| Success state | 300-400ms |
| Error shake | 300-400ms |

**Enter > Exit:** Entrances 30-50% longer than exits. Users care about what appears.

### 7.3 Easing Reference

```css
/* Entrance — decelerate */
cubic-bezier(0.2, 0, 0, 1)

/* Exit — accelerate */
cubic-bezier(0.3, 0, 1, 1)

/* On-screen state change */
cubic-bezier(0.4, 0, 0.2, 1)

/* Success / playful overshoot */
cubic-bezier(0.175, 0.885, 0.32, 1.275)
```

### 7.4 E-Commerce Motion Patterns

**Product card hover:**
- Scale: 1 → 1.02 (100ms, ease-out)
- Shadow: lifts (box-shadow increases)
- Secondary: "Add to Cart" button slides up from bottom

**Add to Cart success:**
- Icon: checkmark draws in (scale pop, ease-out-back)
- Color: brand → success green
- Duration: 300ms
- Reset: 1500ms delay, then return to default

**Cart count update:**
- Scale: 1 → 1.3 → 1 (spring, 200ms)
- Never use opacity-only for cart badge changes

**Page transition (Next.js):**
- Exit: opacity 1 → 0 (150ms, ease-in)
- Enter: opacity 0 → 1, translateY 10px → 0 (250ms, ease-out)

**Modal / drawer:**
- Backdrop: opacity 0 → 0.5 (300ms)
- Panel: translateX/Y into view (300-400ms, ease-out)
- Close: reverse, exit faster than entrance

**Error shake:**
- Position oscillates ±10px horizontal, 2-3 times
- Duration: 300-400ms
- Easing: ease-in-out for sharp stops
- No overshoot — errors feel firm

**Loading skeleton:**
- Shimmer: gradient sweeps left to right
- Duration: 1.5s, loop with sine ease-in-out
- Never use spinner for content that loads under 1s

### 7.5 Motion Quality Rules [CRITICAL]

1. **Never use linear easing for spatial movement** — always use curves. Linear only for spinners and progress bars.
2. **Never opacity-only** for important state changes — combine with position or scale.
3. **Three motion layers** — primary (main action) + secondary (shadows, supporting elements) + ambient (background life). Flat animation = missing layers.
4. **1/3 Rule:** No motion travels more than 1/3 of screen without a keyframe change. No more than 1/3 of elements in simultaneous motion.
5. **Honor `prefers-reduced-motion`:** Wrap all non-essential motion:
```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```
6. **One orchestrated moment per page** — not scattered effects on every section. Fade-and-slide-up on every card is the AI-generated default. Avoid it.

### 7.6 Framer Motion (Next.js)

Preferred motion library for this stack. Use `AnimatePresence` for mount/unmount:

```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={route}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
  />
</AnimatePresence>
```

---

## PART 8 — COMPONENT STANDARDS

### 8.1 Buttons

**Hierarchy (max 2 visible per action group):**
1. Primary — filled, brand color, main action ("Add to Cart", "Place Order")
2. Secondary — outlined or tinted, supporting action
3. Tertiary — ghost/text-only, least prominent

**Sizes:**
- Small: 32-36px height — admin, dense UI
- Medium: 40-44px height — default
- Large: 48-56px height — CTAs, checkout

**Touch targets:** minimum 44×44px. Non-negotiable.

**States (define all, always):**
- Default / Hover / Active (pressed) / Focus / Disabled / Loading

**Loading state:** show spinner inside button, disable pointer events, maintain width.

### 8.2 Forms (Auth + Checkout)

```
Label (above field, never placeholder-only)
  ↓
Input (font-size: max(16px, 1rem))
  ↓
Helper text or inline error (below field)
```

- Visible labels. Placeholders are hints, not labels.
- Error messages below the field, associated via `aria-describedby`.
- Required indicator: asterisk (*) + legend explaining it, not color alone.
- Tab order follows visual reading order.
- "Submit" → always state the specific action: "Create Account", "Pay Now", "Save Address."

### 8.3 Product Cards

Required states:
- Default / Hover / Out of Stock / Sale / Loading skeleton

Required elements:
- Product image (with `alt` text from product name)
- Product name
- Price (with sale price variant)
- Stock status (not color alone — add text or icon)
- Primary CTA

### 8.4 Data Tables (Admin)

- Native `<table>` with `<thead>`, `<tbody>`, `<th scope="col">`.
- Responsive: horizontal scroll container at sm, not collapsed rows.
- Sticky header for long tables.
- Sort indicators: icon + `aria-sort` attribute.
- Row actions: right-aligned, icon + text label, not icon-only.

### 8.5 Modals & Drawers

**On open:**
- Move focus to first focusable element inside
- Trap focus (Tab cycles only within modal)
- Backdrop: `pointer-events: all`, click closes

**On close:**
- Return focus to the trigger element
- Escape key always closes

**Never:** `overflow: hidden` on modal ancestor (breaks sticky). Use `overflow: clip`.

---

## PART 9 — ACCESSIBILITY

### 9.1 Non-Negotiable Baseline [CRITICAL]

- Semantic HTML first. ARIA only when native semantics cannot express the contract.
- Every interactive element is reachable via Tab.
- Focus order matches visual reading order.
- **Focus indicator:** minimum 2px solid outline, 3:1 contrast against adjacent background. Never `outline: none` without a visible replacement.
- Minimum contrast: 4.5:1 for body text, 3:1 for large text and UI components.
- `prefers-reduced-motion` respected.
- `prefers-color-scheme` supported (+ manual toggle).

### 9.2 Keyboard Navigation

| Component | Keyboard behavior |
|-----------|------------------|
| Navigation menu | Tab = top-level items, Arrow keys = dropdown items, Escape = close |
| Modal | Tab = cycle inside only, Escape = close, focus returns to trigger |
| Tabs | Arrow keys = switch tabs, Tab = move to panel |
| Dropdown select | Arrow keys = options, Enter = select, Escape = close |
| Carousel | Arrow keys = items, pause autoplay on focus |
| Form | Enter on last field or submit button = submit |

**Skip link:** First focusable element on every page. Visible on focus.
```html
<a href="#main" class="skip-link">Skip to main content</a>
```

### 9.3 Content Accessibility

- Alt text on all images. Decorative images: `alt=""`.
- Product images: alt = product name + key visual detail.
- Links: text must make sense out of context. No "click here" or "read more."
- Error messages: state what failed + how to fix it. Never vague.
- Page must be fully functional at 200% zoom.

---

## PART 10 — DESIGN PROCESS

### 10.1 Before Writing Any Code

Work in two passes:

**Pass 1 — Design Plan (tokens first):**
```
Color:      4-6 named hex/oklch values with roles
Type:       Font families and their roles
Layout:     One-sentence layout concept + ASCII wireframe
Principles: 2-3 sentences on what makes this specific screen unique
```

**Pass 2 — Anti-default Review:**
- Does any part of the plan look like a default you'd produce for any similar project?
- Check each: background, accent, type choice, layout pattern, motion approach.
- If yes → revise that element specifically. State what changed and why.

Only after Pass 2 is confirmed: write code.

### 10.2 During Implementation

- Build mobile-first. Start at 320px.
- Define CSS specificity carefully. Type-based selectors (`.section`) and element-based selectors (`.cta`) cancel each other on padding/margin. Test early.
- Test by dragging the viewport from 280px to 2560px, not jumping between breakpoints.
- Screenshot your own output and critique it before delivering.

### 10.3 Self-Critique Checklist

Before marking a screen done:

**Visual:**
- [ ] One dominant element per screen. Not two fighting for attention.
- [ ] Color conveys hierarchy, not decoration.
- [ ] Typography scale is consistent. No arbitrary sizes.
- [ ] Spacing from the system only. No arbitrary values.
- [ ] Focus indicator visible on every interactive element.

**Responsive:**
- [ ] Works at 320px, 768px portrait, 1024px, 1440px, 2560px.
- [ ] No `100vh` — using `svh`/`dvh`.
- [ ] All flex children have `min-width: 0` where content is dynamic.
- [ ] No sticky broken by `overflow: hidden` ancestor.

**Motion:**
- [ ] `prefers-reduced-motion` handled.
- [ ] No linear easing on spatial movement.
- [ ] Enter slower than exit.
- [ ] Three motion layers where animation exists.

**Accessibility:**
- [ ] All interactive elements keyboard reachable.
- [ ] Focus order follows visual order.
- [ ] Contrast checked for every text/background pair.
- [ ] No meaning conveyed by color alone.
- [ ] Modal focus trap and return-focus implemented.

---

## PART 11 — NEXT.JS SPECIFIC

### 11.1 Fonts

Use `next/font/google` — zero layout shift, self-hosted automatically:

```tsx
import { Inter, Playfair_Display } from 'next/font/google'

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const heading = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})
```

### 11.2 Images

Use `next/image` — automatic optimization, prevents layout shift:

```tsx
<Image
  src={product.image}
  alt={product.name}           // never empty for product images
  width={400}
  height={400}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  priority={isAboveFold}
/>
```

### 11.3 CSS Architecture

Use CSS Modules or Tailwind. If Tailwind:
- Define design tokens in `tailwind.config.ts`, not inline classes.
- Use `@layer components` for reusable component styles.
- Never use arbitrary values (`w-[347px]`) for spacing or color — map to the system.

### 11.4 Theme Tokens in CSS Custom Properties

```css
:root {
  /* Spacing */
  --space-sm:  0.5rem;
  --space-md:  1rem;
  --space-lg:  1.5rem;
  --space-xl:  2rem;
  --space-2xl: 3rem;

  /* Typography */
  --text-sm:   0.875rem;
  --text-base: 1rem;
  --text-lg:   1.1875rem;
  --text-xl:   1.4375rem;
  --text-2xl:  1.75rem;

  /* Motion */
  --ease-out:    cubic-bezier(0.2, 0, 0, 1);
  --ease-in:     cubic-bezier(0.3, 0, 1, 1);
  --ease-inout:  cubic-bezier(0.4, 0, 0.2, 1);
  --duration-sm: 150ms;
  --duration-md: 250ms;
  --duration-lg: 400ms;
}
```

---

## QUICK REFERENCE — DECISION TREES

### "What color should I use here?"
```
Is it a component color? → Use semantic token (text.primary, action.primary.bg)
Is it a new palette color? → Define in OKLCH, add to reference tokens
Is it a one-off? → You shouldn't have one-offs. Fit it to the system.
```

### "What font size?"
```
Body text?      → text-base (16px)
Caption/label?  → text-sm (14px)
Section heading? → text-2xl or text-3xl
Hero heading?   → clamp(2rem, 5vw + 1rem, 3.5rem)
Input field?    → max(16px, 1rem) — iOS zoom prevention
```

### "How should this animate?"
```
Is it a user action response? → < 250ms, ease-out, translate + opacity
Is it a page-level transition? → 400-600ms, opacity + translateY
Is it a success state? → scale pop, ease-out-back, 300ms
Is it an error? → position shake ±10px, 300-400ms, no overshoot
Is it decorative? → Ask if it serves a function. If not, cut it.
```

### "Is this responsive enough?"
```
Does it work at 320px without overflow? → Must: yes
Does it work at 768px portrait? → Must: yes
Did I use min-width media queries? → Must: yes
Did I test by dragging, not jumping? → Must: yes
Does any input have font-size < 16px? → Must: no
```

<!-- END:design-rules -->
