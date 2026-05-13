# HookAI — UI/UX Specification

---

## 1. Design Principles

1. **Speed to value** — User must see a generated hook within 30 seconds of landing on /generate. No unnecessary friction.
2. **Results feel premium** — Hook cards look polished enough that users want to screenshot and share them.
3. **Limits feel fair, not hostile** — The free tier limit message reads as "you're getting close to your daily limit" not "pay up."
4. **One clear action per screen** — Every page has one primary CTA. Nothing competes with it.
5. **Dark mode is not an afterthought** — Both modes are designed simultaneously, not ported after the fact.

---

## 2. Colour System

### Primary Palette
```
Purple (brand primary)
  50:  #F5F3FF
  100: #EDE9FE
  200: #DDD6FE
  400: #A78BFA
  600: #7C3AED  ← primary action colour
  700: #6D28D9
  800: #5B21B6
  900: #4C1D95

Emerald (success / positive)
  500: #10B981
  600: #059669

Red (danger / error)
  500: #EF4444
  600: #DC2626

Amber (warning)
  500: #F59E0B
  600: #D97706
```

### Semantic Tokens
```css
--color-primary:        #7C3AED;
--color-primary-hover:  #6D28D9;
--color-success:        #10B981;
--color-danger:         #EF4444;
--color-warning:        #F59E0B;

/* Light mode */
--bg-base:      #FFFFFF;
--bg-surface:   #F9FAFB;
--bg-elevated:  #F3F4F6;
--text-primary: #111827;
--text-muted:   #6B7280;
--text-faint:   #9CA3AF;
--border:       #E5E7EB;

/* Dark mode */
--bg-base:      #0F0F0F;
--bg-surface:   #1A1A1A;
--bg-elevated:  #262626;
--text-primary: #F9FAFB;
--text-muted:   #9CA3AF;
--text-faint:   #6B7280;
--border:       #2D2D2D;
```

---

## 3. Typography

### Fonts
- **Inter** — all UI text (loaded from Google Fonts or Fontsource)
- **JetBrains Mono** — hook text display only

### Scale
```
Display (landing hero): 48px / 700 weight / tight letter-spacing
H1 (page title):        30px / 600 weight
H2 (section heading):   22px / 600 weight
H3 (card heading):      16px / 500 weight
Body:                   15px / 400 weight / 1.6 line-height
Small:                  13px / 400 weight
Caption/label:          11px / 500 weight / 0.05em letter-spacing / uppercase
Hook text:              16px / JetBrains Mono / 400 weight / 1.7 line-height
```

---

## 4. Component Specifications

### Sidebar (Desktop)
```
Width:          240px expanded, 64px collapsed
Background:     var(--bg-surface)
Border-right:   1px solid var(--border)
Transition:     width 200ms ease

Logo area:      H: 64px, padding: 0 20px
Nav items:      H: 44px, padding: 0 12px, border-radius: 8px
Active item:    bg: purple-50 (light) / purple-900/20 (dark), text: purple-600
Icon size:      20px
Label:          14px / 500 weight
Collapsed:      show icons only, tooltip on hover with label

Sections:
  Main:         Generate, Library, Analytics
  Tools:        Captions, Calendar, Repurpose, Brand Voice, A/B Test, Competitor Spy
  Account:      Affiliate, Settings
  Bottom:       Plan badge + Upgrade button (if not Pro/Agency)
```

### Hook Card
```
Container:      border-radius: 16px
                border: 1px solid var(--border)
                background: var(--bg-base)
                padding: 20px
                transition: box-shadow 150ms ease
                hover: box-shadow: 0 4px 20px rgba(0,0,0,0.08)

Hook text:      font-family: JetBrains Mono
                font-size: 15px
                line-height: 1.7
                color: var(--text-primary)
                margin-bottom: 16px

Viral score badge:
                position: top-right of card
                shape: pill (border-radius: 20px)
                padding: 3px 10px
                font-size: 12px / 600 weight
                Score 1-4:  bg: red-100,    text: red-700
                Score 5-7:  bg: amber-100,  text: amber-700
                Score 8-10: bg: green-100,  text: green-700

"Why it works":
                12px / italic / text-muted
                shown below hook text
                icon: lightbulb (14px) + text inline
                tooltip on desktop, inline on mobile

Platform fit icons:
                row of platform icons (16px each)
                opacity 0.4 for platforms hook does NOT fit
                opacity 1.0 for platforms it DOES fit

Action row:     display: flex / gap: 8px / margin-top: 16px
                [Copy] [Save] [Generate Caption] [Create Variant]
                Thumbs up / down on right
                All buttons: 32px height, 12px font, ghost style

Blurred state (free user, cards 4-10):
                filter: blur(4px)
                pointer-events: none
                overlay: "Upgrade to see 7 more hooks"
                          purple button: "Upgrade Free →"
```

### Viral Score Badge — Colour Reference
```
Score 1:  bg #FEE2E2 / text #991B1B
Score 2:  bg #FEE2E2 / text #991B1B
Score 3:  bg #FFEDD5 / text #9A3412
Score 4:  bg #FEF3C7 / text #92400E
Score 5:  bg #FEF3C7 / text #92400E
Score 6:  bg #FEF9C3 / text #854D0E
Score 7:  bg #DCFCE7 / text #166534
Score 8:  bg #DCFCE7 / text #166534
Score 9:  bg #BBF7D0 / text #14532D
Score 10: bg #BBF7D0 / text #14532D + ✨ prefix
```

### Upgrade Modal
```
Overlay:        rgba(0,0,0,0.5) backdrop
Modal:          width: 560px, max-width: 95vw
                border-radius: 20px
                background: var(--bg-base)
                padding: 32px

Header:         "🔒 [Feature Name] is a Pro feature"
                H2 size, centered
                Subtext: "Upgrade to unlock this and all Pro features"

Feature table:  3 columns: Feature / Free / Starter / Pro
                Highlighted row: the feature the user tried to access
                Checkmarks (✓) and dashes (—) per cell
                Purple highlight on Pro column header

CTA:            Primary button: "Upgrade to Pro — ₹1,299/month"
                Secondary: "Maybe later" (closes modal)
                Annual toggle: "Save 20% with annual billing"

Animation:      scale(0.95) → scale(1) + fade-in, 200ms
```

### Skeleton Loading Card
```
Same dimensions as HookCard
Background:     var(--bg-elevated)
Shimmer:        linear-gradient animation, 1.5s infinite
                light: white shimmer / dark: slightly lighter shimmer
Elements:       3 lines for hook text (widths: 100%, 80%, 60%)
                badge rectangle top-right
                4 small action button rectangles at bottom
```

### Generator Form
```
Layout:         2-column grid on desktop, 1-column on mobile
Topic input:    full-width, text area, 3 rows
                placeholder text cycles every 3s (per niche)
                character counter at bottom right (max 500)

Selectors:      custom styled select / button group
                Platform: horizontal pill buttons (toggle, multi-select for Pro)
                Others: standard select dropdown with icon

Generate button: full width on mobile
                 large, 48px height
                 text: "Generate Hooks →"
                 loading state: spinner + "Generating..."
                 disabled when topic is empty

Usage counter:  small text below button
                "5 hooks left today" / "87/100 hooks this month"
                colour changes to amber at 80%, red at 95%
```

### Toast Notifications
```
Position:       bottom-right, 16px from edges
Max visible:    3 stacked
Width:          320px
Border-radius:  12px
Duration:       3000ms (success), 5000ms (error), persistent (info)

Success: bg green-50, left border 4px green-500, icon ✓
Error:   bg red-50,   left border 4px red-500,   icon ✗
Info:    bg blue-50,  left border 4px blue-500,   icon ℹ
```

---

## 5. Page Layouts

### /generate (Hook Generator)
```
┌─ Sidebar ─┬──────────────────────────────────────────┐
│           │  TopBar: [Usage counter] [Notifications]  │
│  Nav      ├──────────────────────────────────────────┤
│  items    │                                           │
│           │  H1: "Generate Viral Hooks"               │
│           │                                           │
│           │  ┌─────────────────────────────────────┐ │
│           │  │  Generator Form                     │ │
│           │  │  [Topic textarea]                   │ │
│           │  │  [Platform] [Content Type] [Tone]   │ │
│           │  │  [Hook Style] [Audience] [Language] │ │
│           │  │  [Use brand voice toggle — Pro]     │ │
│           │  │  [Generate Hooks →]                 │ │
│           │  │  3/5 used today                     │ │
│           │  └─────────────────────────────────────┘ │
│           │                                           │
│           │  Results (10 cards, 2-column grid):        │
│           │  ┌──────────┐  ┌──────────┐             │
│           │  │ Hook 1   │  │ Hook 2   │             │
│           │  └──────────┘  └──────────┘             │
│           │  ┌──────────┐  ┌──────────┐             │
│           │  │ Hook 3   │  │ Blurred  │  (free)     │
│           │  └──────────┘  └──────────┘             │
│           │                                           │
│           │  [Regenerate] [Export CSV — Pro]          │
└───────────┴──────────────────────────────────────────┘
```

### /library (Hook Library)
```
H1: "Hook Library"
Search bar (full width) + [Filters ▾] [Sort ▾] on right

Filter panel (collapsible):
  Platform checkboxes | Viral score slider | Date range | Content type

Grid: 3 columns desktop, 2 tablet, 1 mobile
Each card: hook text, viral score badge, platform icons, copy/delete actions
Folder sidebar (left on desktop, tabs on mobile): All Hooks, [folder names], + New Folder
```

### /analytics (Analytics Dashboard)
```
H1: "Your Analytics"
Subtext: "Last updated: [time]"

Metric cards row (4 cards):
  Total hooks | Avg viral score | Saved hooks | Current streak

Charts row:
  Hooks per day line chart (full width or 60%)
  Platform distribution donut (remaining width)

Second charts row:
  Viral score distribution bar chart
  Hook style performance horizontal bar

Insights section:
  "💡 Weekly Insight"
  AI-generated sentence in a highlighted card
```

---

## 6. Motion Design

All animations use Framer Motion.

### Page transitions
```javascript
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 }
};
transition: { duration: 0.2, ease: 'easeOut' }
```

### Hook card stagger
```javascript
const containerVariants = {
  animate: { transition: { staggerChildren: 0.06 } }
};
const cardVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 }
};
```

### Upgrade modal
```javascript
const modalVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit:    { opacity: 0, scale: 0.95 }
};
transition: { duration: 0.15 }
```

### Number counter (analytics)
```javascript
// Use framer-motion useMotionValue + useTransform
// Count from 0 to final value over 1.2s on mount
// easeOut timing
```

### Sidebar collapse
```javascript
// Animate width: 240px → 64px over 200ms
// Labels fade out (opacity 0) before width collapses
// Icons remain visible throughout
```

---

## 7. Responsive Breakpoints

```css
sm:  640px   (mobile → tablet boundary)
md:  768px   (tablet)
lg:  1024px  (tablet → desktop)
xl:  1280px  (desktop)
```

### Mobile-specific behaviour
- Sidebar replaced by bottom tab bar (5 items: Generate, Library, Analytics, Calendar, Account)
- Secondary pages accessible via hamburger menu in TopBar
- Generator form: single column, topic textarea full width
- Hook cards: single column, full width
- Upgrade modal: full-screen bottom sheet on mobile
- Charts: reduce to single column, simplified labels

---

## 8. Accessibility

- All interactive elements have visible focus rings (2px purple outline)
- Keyboard navigation: Tab through form, Enter to submit, Escape to close modals
- Hook card copy button announces "Copied!" via aria-live on success
- Viral score badge includes aria-label: "Viral score: 8 out of 10"
- Blurred cards include aria-label: "Hook hidden — upgrade to reveal"
- All icons that convey meaning have aria-label
- Decorative icons have aria-hidden="true"
- Colour is never the only way information is conveyed (score badge shows number + colour)
- Minimum contrast ratio 4.5:1 for all text
- Target: Lighthouse accessibility score 100

---

## 9. Onboarding UX

### Step indicator
```
● ● ○   (step 1 active)
● ● ●   (complete)
Dots connected by thin line, purple fill = complete/active
```

### Step 1 — Name + Niche
- Name: simple text input, autofocus
- Niche: 10-item grid of cards with icon + label
  - Fitness 💪, Finance 📈, Travel ✈️, Food 🍳, Tech 💻
  - Beauty 💄, Business 🏢, Personal Brand ⭐, Education 📚, Entertainment 🎬
- Single select, selected card gets purple border + bg

### Step 2 — Platforms
- 5 platform cards with logo + name
- Multi-select (toggle), selected = purple border
- "Select all that apply" subtext

### Step 3 — Plan
- Two cards: Free (selected by default) vs Starter (₹499/month)
- Free card: lists 5 limits
- Starter card: lists 5 upgrades, "Most chosen" badge
- "Continue for free" button below (skips payment)
- Clicking Starter card → proceed to Razorpay on "Get Started"

---

## 10. Empty States

Each empty state includes: illustration (SVG, simple line art), heading, 1-line subtext, primary CTA button.

| Page | Heading | Subtext | CTA |
|------|---------|---------|-----|
| Library | No saved hooks yet | Generate your first hook and save it here | Generate hooks |
| Calendar | No content planned | Generate a 30-day content plan in one click | Generate calendar |
| Analytics | No data yet | Your stats appear after your first generation | Generate hooks |
| Affiliate | Share your link to start earning | When someone signs up through your link, you earn 30% commission | Copy referral link |
| Folders | No folders yet | Organise your best hooks into collections | Create folder |
