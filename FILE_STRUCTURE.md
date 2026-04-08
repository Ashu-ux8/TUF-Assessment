# 🗂️ DeskPad Calendar — Complete File Structure

```
deskpad-calendar/
├── app/
│   ├── layout.tsx                    # Root layout, fonts, metadata
│   ├── page.tsx                      # Home page — renders <CalendarApp/>
│   └── globals.css                   # Paper textures, CSS vars, animations
│
├── components/
│   ├── providers/
│   │   └── CalendarProvider.tsx      # Global React Context + state
│   │
│   ├── layout/
│   │   ├── AppShell.tsx              # Split layout orchestrator
│   │   ├── HeroPanel.tsx             # Binder, hero image, spiral holes
│   │   └── CalendarPanel.tsx         # Right panel container
│   │
│   ├── hero/
│   │   ├── HeroSection.tsx           # Image + overlay + upload btn
│   │   ├── HeroStats.tsx             # Events / Notes / Days-left pills
│   │   ├── HeroQuote.tsx             # Monthly quote strip
│   │   └── SpiralBinder.tsx          # SVG spiral holes animation
│   │
│   ├── calendar/
│   │   ├── CalendarHeader.tsx        # Month nav + today btn + theme toggle
│   │   ├── DowRow.tsx                # Sun–Sat label row
│   │   ├── CalendarGrid.tsx          # 7-col grid + range SVG overlay
│   │   ├── DayCell.tsx               # Individual day tile (ripple, flip)
│   │   └── RangeTrail.tsx            # Animated SVG path for range
│   │
│   ├── daily/
│   │   ├── DailyOverlay.tsx          # Full-screen flip overlay
│   │   ├── DailyHeader.tsx           # Date + close button
│   │   ├── Timeline.tsx              # Hourly slot list
│   │   ├── EventChip.tsx             # Single event pill (color-coded)
│   │   ├── AddEventForm.tsx          # time + text + category + submit
│   │   └── AISuggestion.tsx          # Context-aware suggestion banner
│   │
│   ├── notes/
│   │   ├── NotesSection.tsx          # Textarea + save btn + list
│   │   └── SavedNoteItem.tsx         # Individual note pill
│   │
│   ├── legend/
│   │   └── CategoryLegend.tsx        # Filter chips + colored dots
│   │
│   └── ui/
│       ├── Toast.tsx                 # Bottom notification
│       ├── RippleButton.tsx          # Reusable ripple-on-click wrapper
│       └── ThemeToggle.tsx           # Moon/Sun toggle button
│
├── hooks/
│   ├── useCalendar.ts                # Month navigation, grid generation
│   ├── useRangeSelection.ts          # Start/end click logic, auto-correct
│   ├── useDailyView.ts               # Open/close flip, currentDay state
│   ├── useEvents.ts                  # CRUD events + localStorage sync
│   ├── useNotes.ts                   # CRUD notes + localStorage sync
│   └── useTheme.ts                   # Dark/light toggle + persistence
│
├── lib/
│   ├── dates.ts                      # dateKey(), isSameDay(), isBetween()
│   ├── holidays.ts                   # US holiday map + getHoliday()
│   ├── quotes.ts                     # Monthly quote array
│   ├── categories.ts                 # Category metadata (icon, color, anim)
│   └── storage.ts                    # localStorage read/write wrappers
│
├── types/
│   └── index.ts                      # CalendarEvent, Note, RangeState, etc.
│
├── constants/
│   └── index.ts                      # MONTHS, DAYS, HOURS, CAT_META
│
├── public/
│   ├── hero-default.jpg              # Default mountain/landscape image
│   └── paper-texture.png             # Subtle paper grain
│
├── tailwind.config.ts                # Custom colors, fonts, animation config
├── next.config.ts                    # Next.js config
└── package.json
```

---

## 📦 package.json (key dependencies)

```json
{
  "dependencies": {
    "next": "14.2.0",
    "react": "18.3.0",
    "react-dom": "18.3.0",
    "framer-motion": "^11.2.0",
    "colorthief": "^2.4.0",
    "date-fns": "^3.6.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "tailwindcss": "^3.4.1",
    "@types/react": "^18",
    "@types/node": "^20"
  }
}
```
