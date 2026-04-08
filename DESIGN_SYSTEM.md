# 🎨 DeskPad Calendar — System Design & UI/UX Specification

---

## 1. SYSTEM DESIGN

### Component Hierarchy

```
<CalendarProvider>              ← Global state via useReducer + Context
  <AppShell>                    ← Split layout orchestrator
    <HeroPanel>                 ← Left third
      <SpiralBinder>            ← SVG spiral holes effect
      <HeroSection>             ← Image, overlay, upload
      <HeroQuote>               ← Monthly quote (Caveat font)
      <HeroStats>               ← Events / Notes / Days-left pills
    </HeroPanel>
    <CalendarPanel>             ← Right two-thirds
      <CalendarHeader>          ← Nav + title + legend + controls
        <CategoryLegend>        ← Filter chips
        <ThemeToggle>
      </CalendarHeader>
      <DowRow>                  ← Sun–Sat labels
      <CalendarGrid>            ← 7-col CSS Grid
        <RangeTrail>            ← Animated SVG path overlay
        <DayCell> × N           ← Interactive date tiles
      </CalendarGrid>
      <NotesSection>            ← Textarea + saved notes list
    </CalendarPanel>
  </AppShell>
  <DailyOverlay>                ← Fixed fullscreen flip panel
    <DailyHeader>
    <AISuggestion>
    <AddEventForm>
    <Timeline>
      <EventChip> × N
  </DailyOverlay>
  <Toast>                       ← Bottom notification
</CalendarProvider>
```

---

### Data Flow

```
User Interaction
     │
     ▼
Component dispatch(action)
     │
     ▼
CalendarReducer (pure function)
     │
     ▼
New CalendarState
     │
     ├──▶ localStorage.setItem() [side effect via useEffect]
     │
     └──▶ Re-render affected components
```

### State Shape

```typescript
{
  today:         Date,
  current:       Date,              // month being displayed
  selectedDate:  Date | null,       // for notes panel
  range: {
    start: Date | null,
    end:   Date | null,
  },
  events: {
    "2025-04-12": [
      { id, time, text, cat, date }
    ]
  },
  notes: {
    "2025-04-12": "Remember to call mom"
  },
  theme: "light" | "dark",
  activeFilters: Set<EventCategory>
}
```

---

## 2. UI/UX DECISIONS

### Aesthetic Direction: "Warm Editorial / Analog Digital"
- **Playfair Display** serif for date numbers → premium, editorial feel
- **DM Sans** for UI chrome → clean, readable
- **Caveat** handwriting for notes/quotes → tactile, human
- Warm amber (#c8855a) as the single signature accent — evokes aged paper, sunlight
- Paper noise texture via SVG feTurbulence filter → no image dependency
- Horizontal rule lines in notes textarea → reinforces paper metaphor

### Animation Reasoning

| Animation | Purpose | Trigger |
|-----------|---------|---------|
| 3D card flip (rotateY) | "Opening" a page — signals mode change | Click date |
| Page flip (rotateX) | Month is literally a page turning | Nav arrows |
| SVG path draw | Range is a journey; connecting two points tells a story | Second date click |
| Ripple | Tactile feedback, confirms interaction registered | Any date click |
| Category icon micro-animation | Category feels alive; holiday waves, work pulses | Always on |
| Hero parallax zoom | Depth and life; prevents static feel | Hover |
| Hover lift + glow | Invites exploration, confirms interactivity | Hover any cell |
| Toast slide-up | Non-intrusive confirmation with spring physics | After actions |

### Interaction Design

**Date Click Flow:**
1. First click → ripple + set range start + open daily view (modal)
2. Second click (different date) → complete range + animate SVG trail + close daily view focus
3. Same date twice → cancel range

**Range Autocorrect:**
If user clicks end date before start date, swap them automatically. Never show error.

**Daily View:**
- Flip in at 0°, close at -90° (rotateY)
- Timeline shows 7am–9pm in 1-hr slots
- Events sorted by time
- AI suggestion appears after 0.3s delay (feels like a genuine thought)

**Notes:**
- Clicking a saved note in the list navigates to that month and selects the date
- Textarea has paper-line background-image for Caveat font harmony
- Auto-save could be added but manual "Save" gives satisfying confirmation

---

## 3. ADVANCED FEATURES IMPLEMENTED

### ✅ Core
- [x] Split layout with spiral binder (CSS + absolute positioned holes)
- [x] Paper texture via SVG noise filter (no external image needed)
- [x] Month navigation with page-flip animation (CSS perspective/rotateX)
- [x] Day grid with auto-sizing (aspect-ratio: 1)
- [x] Today highlight, weekend styling, other-month dimming

### ✅ Range Selection
- [x] Click-to-start, click-to-end
- [x] Auto-correct reversed range
- [x] In-range cells highlighted with amber wash
- [x] Range start/end badges
- [x] Clear range button (appears only when range active)
- [x] SVG cubic bezier path drawn between start and end cells
- [x] Path has glowing drop-shadow filter

### ✅ Daily View
- [x] 3D flip animation (rotateY 90° → 0°, close at -90°)
- [x] Backdrop blur overlay
- [x] Hourly timeline 7am–9pm
- [x] Add events with time + text + category
- [x] Events sorted by time
- [x] Color-coded chips with category border + background
- [x] Delete event with ✕ button

### ✅ Event Categories
- [x] Holiday 🌴 → wave animation
- [x] Work 💼 → pulse animation
- [x] Personal 💚 → heartbeat animation
- [x] Travel ✈️ → fly animation
- [x] Category filter legend (click to toggle filters)
- [x] Colored event dots on day cells
- [x] Dominant category icon shown on cell

### ✅ Persistent Storage
- [x] Events in localStorage ('deskpad_events')
- [x] Notes in localStorage ('deskpad_notes')
- [x] Theme in localStorage ('deskpad_theme')
- [x] Hydrated on mount via useEffect

### ✅ Notes
- [x] Tied to selected date
- [x] Paper-lined textarea (Caveat font)
- [x] Saved notes list (max 8 shown)
- [x] Click note → navigate to that month/date
- [x] Delete individual notes

### ✅ Creative Enhancements (Beyond Spec)

| Feature | Implementation |
|---------|---------------|
| US Holiday markers | Red 3px top border on holiday dates |
| Monthly quote strip | 12 curated quotes, rotated by month, Caveat font |
| Hero stats pills | Live event count, note count, days-left-in-month |
| AI suggestion banner | Context-aware text ("Schedule a planning session for Monday?") |
| Hero image upload | FileReader API, instant preview |
| Keyboard shortcuts | ←/→ months, T=today, D=dark mode, Esc=close/clear |
| Demo events | Pre-populated with sample events on first load |
| Print mode | CSS @media print hides UI chrome, shows clean grid |
| Dark mode | CSS variable override, moon/sun toggle |
| Spiral binder | 14 pseudo-3D holes via CSS box-shadow |
| Ripple effect | Dynamically injected spans on every click |
| Toast notifications | Bottom-center slide-up with spring curve |

---

## 4. PERFORMANCE CONSIDERATIONS

- **CSS-only textures**: Paper grain via inline SVG data URI, no HTTP request
- **No external animation library needed** for the HTML version: pure CSS keyframes
- **Framer Motion** (Next.js version) used only for layout and presence animations
- **localStorage** is synchronous but small payloads; no debounce needed
- **SVG path**: redrawn only on range completion, not on every hover
- **Event handler delegation**: Could optimize with event delegation on grid; current approach fine for 35–42 cells
- **Image lazy loading**: hero img has `loading="lazy"` in Next.js version
- **Reduced motion**: Wrap all animations in `@media (prefers-reduced-motion: no-preference)` in production

---

## 5. INSTALLATION (Next.js version)

```bash
npx create-next-app@latest deskpad --typescript --tailwind --app
cd deskpad
npm install framer-motion colorthief date-fns
# Copy component files from COMPONENTS.ts into their respective paths
# Copy globals.css animations into app/globals.css
npm run dev
```
