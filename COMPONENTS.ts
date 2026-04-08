/* ═══════════════════════════════════════════════════════════
   types/index.ts
═══════════════════════════════════════════════════════════ */

export type EventCategory = 'holiday' | 'work' | 'personal' | 'travel';

export interface CalendarEvent {
  id: string;
  time: string;         // "HH:MM"
  text: string;
  cat: EventCategory;
  date: string;         // "YYYY-MM-DD"
}

export interface Note {
  key: string;          // "YYYY-MM-DD"
  text: string;
  updatedAt: number;
}

export interface RangeState {
  start: Date | null;
  end:   Date | null;
}

export interface CalendarState {
  today:         Date;
  current:       Date;          // displayed month
  selectedDate:  Date | null;
  range:         RangeState;
  events:        Record<string, CalendarEvent[]>;   // keyed by dateKey
  notes:         Record<string, string>;
  theme:         'light' | 'dark';
  activeFilters: Set<EventCategory>;
}

export interface DayCellMeta {
  date:      Date;
  key:       string;
  isToday:   boolean;
  isOther:   boolean;
  isWeekend: boolean;
  isHoliday: string | null;
  isRangeStart: boolean;
  isRangeEnd:   boolean;
  isInRange:    boolean;
  events:    CalendarEvent[];
}


/* ═══════════════════════════════════════════════════════════
   lib/dates.ts
═══════════════════════════════════════════════════════════ */

export const dateKey = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

export const parseKey = (k: string): Date => {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const isSameDay = (a: Date | null, b: Date | null): boolean =>
  !!a && !!b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth()    === b.getMonth()    &&
  a.getDate()     === b.getDate();

export const isBetween = (d: Date, start: Date | null, end: Date | null): boolean => {
  if (!start || !end) return false;
  const t = d.getTime();
  return t > Math.min(start.getTime(), end.getTime()) &&
         t < Math.max(start.getTime(), end.getTime());
};

export const getDaysInMonth = (year: number, month: number): number =>
  new Date(year, month + 1, 0).getDate();

export const buildGridDates = (year: number, month: number): Date[] => {
  const firstDow   = new Date(year, month, 1).getDay();
  const daysInMonth = getDaysInMonth(year, month);
  const prevDays   = getDaysInMonth(year, month - 1);
  const totalCells = Math.ceil((firstDow + daysInMonth) / 7) * 7;
  return Array.from({ length: totalCells }, (_, i) => {
    if (i < firstDow)
      return new Date(year, month - 1, prevDays - firstDow + i + 1);
    if (i >= firstDow + daysInMonth)
      return new Date(year, month + 1, i - firstDow - daysInMonth + 1);
    return new Date(year, month, i - firstDow + 1);
  });
};


/* ═══════════════════════════════════════════════════════════
   lib/categories.ts
═══════════════════════════════════════════════════════════ */

import { EventCategory } from '@/types';

export const CAT_META: Record<EventCategory, {
  icon:  string;
  color: string;
  bg:    string;
  label: string;
  animation: string;
}> = {
  holiday: {
    icon: '🌴', color: '#e05c5c', bg: '#fff5f5',
    label: 'Holiday', animation: 'wave 2s ease-in-out infinite'
  },
  work: {
    icon: '💼', color: '#4a7fc1', bg: '#f5f8ff',
    label: 'Work', animation: 'pulse 1.5s ease-in-out infinite'
  },
  personal: {
    icon: '💚', color: '#7cb87e', bg: '#f5fff6',
    label: 'Personal', animation: 'heartbeat 1.8s ease-in-out infinite'
  },
  travel: {
    icon: '✈️', color: '#d4a843', bg: '#fffdf5',
    label: 'Travel', animation: 'fly 2.5s ease-in-out infinite'
  },
};


/* ═══════════════════════════════════════════════════════════
   hooks/useRangeSelection.ts
═══════════════════════════════════════════════════════════ */

import { useState, useCallback } from 'react';
import { isSameDay } from '@/lib/dates';

export function useRangeSelection() {
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd,   setRangeEnd  ] = useState<Date | null>(null);

  const handleRangeClick = useCallback((date: Date) => {
    if (!rangeStart || rangeEnd) {
      // Begin new range
      setRangeStart(date);
      setRangeEnd(null);
      return 'started';
    }
    if (isSameDay(date, rangeStart)) {
      // Clicked same start → cancel
      setRangeStart(null);
      return 'cancelled';
    }
    // Complete range — auto-correct if backwards
    if (date < rangeStart) {
      setRangeEnd(rangeStart);
      setRangeStart(date);
    } else {
      setRangeEnd(date);
    }
    return 'completed';
  }, [rangeStart, rangeEnd]);

  const clearRange = useCallback(() => {
    setRangeStart(null);
    setRangeEnd(null);
  }, []);

  return { rangeStart, rangeEnd, handleRangeClick, clearRange };
}


/* ═══════════════════════════════════════════════════════════
   hooks/useEvents.ts
═══════════════════════════════════════════════════════════ */

import { useState, useCallback, useEffect } from 'react';
import { CalendarEvent } from '@/types';

type EventMap = Record<string, CalendarEvent[]>;

export function useEvents() {
  const [events, setEvents] = useState<EventMap>(() => {
    try {
      const raw = localStorage.getItem('deskpad_events');
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem('deskpad_events', JSON.stringify(events));
  }, [events]);

  const addEvent = useCallback((key: string, ev: Omit<CalendarEvent,'id'|'date'>) => {
    const newEvent: CalendarEvent = { ...ev, id: Date.now().toString(), date: key };
    setEvents(prev => {
      const existing = [...(prev[key] ?? []), newEvent];
      existing.sort((a, b) => a.time.localeCompare(b.time));
      return { ...prev, [key]: existing };
    });
  }, []);

  const deleteEvent = useCallback((key: string, id: string) => {
    setEvents(prev => {
      const filtered = (prev[key] ?? []).filter(e => e.id !== id);
      const next = { ...prev };
      filtered.length ? (next[key] = filtered) : delete next[key];
      return next;
    });
  }, []);

  return { events, addEvent, deleteEvent };
}


/* ═══════════════════════════════════════════════════════════
   hooks/useDailyView.ts
═══════════════════════════════════════════════════════════ */

import { useState, useCallback } from 'react';

export function useDailyView() {
  const [isOpen,      setIsOpen     ] = useState(false);
  const [isClosing,   setIsClosing  ] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  const open = useCallback((date: Date) => {
    setCurrentDate(date);
    setIsClosing(false);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 600);
  }, []);

  return { isOpen, isClosing, currentDate, open, close };
}


/* ═══════════════════════════════════════════════════════════
   components/calendar/DayCell.tsx
═══════════════════════════════════════════════════════════ */

'use client';
import { motion } from 'framer-motion';
import { DayCellMeta } from '@/types';
import { CAT_META } from '@/lib/categories';
import { useRef } from 'react';

interface Props {
  meta: DayCellMeta;
  onClick: (date: Date, key: string) => void;
}

export function DayCell({ meta, onClick }: Props) {
  const {
    date, key, isToday, isOther, isWeekend,
    isHoliday, isRangeStart, isRangeEnd, isInRange, events
  } = meta;

  const cellRef = useRef<HTMLDivElement>(null);

  // Dominant category
  const dominantCat = events.length
    ? events.reduce((acc, ev) => {
        const count = events.filter(e => e.cat === ev.cat).length;
        return count > (events.filter(e => e.cat === acc).length) ? ev.cat : acc;
      }, events[0].cat)
    : null;

  const handleClick = (e: React.MouseEvent) => {
    if (isOther) return;
    // Create ripple
    const rect = cellRef.current!.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    ripple.style.cssText = `
      position:absolute;border-radius:50%;background:rgba(200,133,90,0.3);
      width:${size}px;height:${size}px;pointer-events:none;
      left:${e.clientX - rect.left - size/2}px;
      top:${e.clientY - rect.top - size/2}px;
      animation:rippleAnim 0.6s linear forwards;
    `;
    cellRef.current!.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);
    onClick(date, key);
  };

  return (
    <motion.div
      ref={cellRef}
      className={[
        'day-cell relative overflow-hidden cursor-pointer rounded-xl p-2',
        'flex flex-col border-[1.5px] transition-all duration-200',
        isOther    ? 'opacity-40 bg-transparent border-transparent' : 'bg-white border-transparent',
        isToday    ? 'border-accent shadow-accent/25 shadow-md' : '',
        isWeekend && !isOther ? 'text-accent-dark' : '',
        isRangeStart || isRangeEnd ? 'bg-accent border-accent-dark' : '',
        isInRange  ? 'bg-accent/20 border-accent/50' : '',
      ].join(' ')}
      whileHover={isOther ? {} : { y: -3, scale: 1.03, zIndex: 5 }}
      whileTap={isOther ? {} : { scale: 0.97 }}
      onClick={handleClick}
      layout
    >
      {/* Holiday bar */}
      {isHoliday && (
        <div className="absolute top-0 inset-x-0 h-[3px] bg-red-400 rounded-t-xl" title={isHoliday}/>
      )}

      {/* Day number */}
      <span className={[
        'font-display text-lg font-bold leading-none z-10',
        isRangeStart || isRangeEnd ? 'text-white' : isToday ? 'text-accent' : 'text-ink',
      ].join(' ')}>
        {date.getDate()}
      </span>

      {isRangeStart && <span className="text-[0.55rem] font-semibold text-white/80 uppercase tracking-wide">Start</span>}
      {isRangeEnd   && <span className="text-[0.55rem] font-semibold text-white/80 uppercase tracking-wide">End</span>}

      {/* Event dots */}
      {events.length > 0 && (
        <div className="mt-auto flex gap-[3px] flex-wrap z-10">
          {events.map(ev => (
            <span
              key={ev.id}
              className="w-[6px] h-[6px] rounded-full flex-shrink-0"
              style={{ background: CAT_META[ev.cat].color }}
            />
          ))}
        </div>
      )}

      {/* Dominant category icon */}
      {dominantCat && (
        <span
          className="absolute bottom-[6px] right-[6px] text-[0.85rem] opacity-70 z-20"
          style={{ animation: CAT_META[dominantCat].animation }}
        >
          {CAT_META[dominantCat].icon}
        </span>
      )}
    </motion.div>
  );
}


/* ═══════════════════════════════════════════════════════════
   components/daily/DailyOverlay.tsx
═══════════════════════════════════════════════════════════ */

'use client';
import { AnimatePresence, motion } from 'framer-motion';

interface Props {
  isOpen:    boolean;
  isClosing: boolean;
  date:      Date | null;
  onClose:   () => void;
  children:  React.ReactNode;
}

export function DailyOverlay({ isOpen, isClosing, date, onClose, children }: Props) {
  if (!isOpen && !isClosing) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center"
        style={{ background: 'rgba(30,22,14,0.65)', backdropFilter: 'blur(6px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="w-[min(680px,95vw)] max-h-[90vh]"
          style={{ perspective: '1200px' }}
          initial={{ rotateY: 90 }}
          animate={{ rotateY: isClosing ? -90 : 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="bg-paper rounded-2xl overflow-y-auto max-h-[88vh]
                          shadow-[0_30px_80px_rgba(0,0,0,0.3)]">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}


/* ═══════════════════════════════════════════════════════════
   components/calendar/RangeTrail.tsx  (SVG overlay)
═══════════════════════════════════════════════════════════ */

'use client';
import { useEffect, useRef } from 'react';

interface Props {
  startEl: HTMLElement | null;
  endEl:   HTMLElement | null;
  wrapperEl: HTMLElement | null;
}

export function RangeTrail({ startEl, endEl, wrapperEl }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !startEl || !endEl || !wrapperEl) {
      svg && (svg.innerHTML = '');
      return;
    }
    const wr = wrapperEl.getBoundingClientRect();
    const sr = startEl.getBoundingClientRect();
    const er = endEl.getBoundingClientRect();
    const x1 = sr.left - wr.left + sr.width / 2;
    const y1 = sr.top  - wr.top  + sr.height / 2;
    const x2 = er.left - wr.left + er.width / 2;
    const y2 = er.top  - wr.top  + er.height / 2;
    const cx1 = x1 + (x2-x1)*0.25, cy1 = y1 - 30;
    const cx2 = x1 + (x2-x1)*0.75, cy2 = y2 + 30;

    svg.innerHTML = `
      <path d="M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}"
            fill="none" stroke="var(--accent)" stroke-width="2.5"
            stroke-linecap="round" opacity="0.7"
            filter="drop-shadow(0 0 6px rgba(200,133,90,0.5))"
            style="stroke-dasharray:1000;stroke-dashoffset:1000;
                   animation:drawTrail 1.2s cubic-bezier(0.4,0,0.2,1) forwards"/>
      <circle cx="${x1}" cy="${y1}" r="5" fill="var(--accent)" opacity="0.8"/>
      <circle cx="${x2}" cy="${y2}" r="5" fill="var(--accent)" opacity="0.8"/>
    `;
  }, [startEl, endEl, wrapperEl]);

  return (
    <svg ref={svgRef}
         className="absolute inset-0 pointer-events-none z-20 overflow-visible"
         style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}/>
  );
}


/* ═══════════════════════════════════════════════════════════
   components/providers/CalendarProvider.tsx
═══════════════════════════════════════════════════════════ */

'use client';
import { createContext, useContext, useReducer, useEffect } from 'react';
import { CalendarState, CalendarEvent, EventCategory } from '@/types';
import { dateKey } from '@/lib/dates';

type Action =
  | { type: 'SET_MONTH';     payload: Date }
  | { type: 'SELECT_DATE';   payload: Date }
  | { type: 'SET_RANGE';     payload: { start: Date | null; end: Date | null } }
  | { type: 'ADD_EVENT';     payload: { key: string; event: CalendarEvent } }
  | { type: 'DEL_EVENT';     payload: { key: string; id: string } }
  | { type: 'SET_NOTE';      payload: { key: string; text: string } }
  | { type: 'DEL_NOTE';      payload: string }
  | { type: 'TOGGLE_FILTER'; payload: EventCategory }
  | { type: 'TOGGLE_THEME' }
  | { type: 'HYDRATE';       payload: Partial<CalendarState> };

function reducer(state: CalendarState, action: Action): CalendarState {
  switch (action.type) {
    case 'SET_MONTH':     return { ...state, current: action.payload };
    case 'SELECT_DATE':   return { ...state, selectedDate: action.payload };
    case 'SET_RANGE':     return { ...state, range: { start: action.payload.start, end: action.payload.end }};
    case 'ADD_EVENT': {
      const { key, event } = action.payload;
      const existing = [...(state.events[key] ?? []), event].sort((a,b)=>a.time.localeCompare(b.time));
      return { ...state, events: { ...state.events, [key]: existing }};
    }
    case 'DEL_EVENT': {
      const { key, id } = action.payload;
      const filtered = (state.events[key] ?? []).filter(e => e.id !== id);
      const events = { ...state.events };
      filtered.length ? (events[key] = filtered) : delete events[key];
      return { ...state, events };
    }
    case 'SET_NOTE': {
      const notes = { ...state.notes };
      action.payload.text.trim()
        ? (notes[action.payload.key] = action.payload.text)
        : delete notes[action.payload.key];
      return { ...state, notes };
    }
    case 'DEL_NOTE': {
      const notes = { ...state.notes };
      delete notes[action.payload];
      return { ...state, notes };
    }
    case 'TOGGLE_FILTER': {
      const filters = new Set(state.activeFilters);
      filters.has(action.payload) ? filters.delete(action.payload) : filters.add(action.payload);
      return { ...state, activeFilters: filters };
    }
    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'light' ? 'dark' : 'light' };
    case 'HYDRATE':
      return { ...state, ...action.payload };
    default: return state;
  }
}

const today = new Date();
const initialState: CalendarState = {
  today,
  current:       new Date(today.getFullYear(), today.getMonth(), 1),
  selectedDate:  null,
  range:         { start: null, end: null },
  events:        {},
  notes:         {},
  theme:         'light',
  activeFilters: new Set(),
};

const CalendarContext = createContext<{
  state:    CalendarState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const events = JSON.parse(localStorage.getItem('deskpad_events') || '{}');
      const notes  = JSON.parse(localStorage.getItem('deskpad_notes')  || '{}');
      const theme  = (localStorage.getItem('deskpad_theme') || 'light') as 'light' | 'dark';
      dispatch({ type: 'HYDRATE', payload: { events, notes, theme }});
    } catch {}
  }, []);

  // Persist
  useEffect(() => {
    localStorage.setItem('deskpad_events', JSON.stringify(state.events));
    localStorage.setItem('deskpad_notes',  JSON.stringify(state.notes));
    localStorage.setItem('deskpad_theme',  state.theme);
  }, [state.events, state.notes, state.theme]);

  return (
    <CalendarContext.Provider value={{ state, dispatch }}>
      {children}
    </CalendarContext.Provider>
  );
}

export const useCalendarContext = () => {
  const ctx = useContext(CalendarContext);
  if (!ctx) throw new Error('useCalendarContext must be inside CalendarProvider');
  return ctx;
};


/* ═══════════════════════════════════════════════════════════
   tailwind.config.ts
═══════════════════════════════════════════════════════════ */

import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent:      '#c8855a',
        'accent-light':'#e8b08a',
        'accent-dark': '#9e5c38',
        paper:       '#f5f0e8',
        'paper-dark':'#ede6d6',
        ink:         '#2a2118',
        'ink-muted': '#6b5d4f',
        'ink-faint': '#a89880',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans:    ['"DM Sans"', 'sans-serif'],
        hand:    ['"Caveat"', 'cursive'],
      },
      animation: {
        'wave':      'wave 2s ease-in-out infinite',
        'fly':       'fly 2.5s ease-in-out infinite',
        'heartbeat': 'heartbeat 1.8s ease-in-out infinite',
        'draw-trail':'drawTrail 1.2s cubic-bezier(0.4,0,0.2,1) forwards',
        'slide-in':  'slideIn 0.3s cubic-bezier(0.25,0.46,0.45,0.94)',
        'fade-up':   'fadeUp 0.5s ease forwards',
      },
      keyframes: {
        wave:      { '0%,100%':{ transform:'rotate(-10deg) translateY(0)' }, '50%':{ transform:'rotate(10deg) translateY(-2px)' } },
        fly:       { '0%,100%':{ transform:'translate(0,0)' }, '25%':{ transform:'translate(2px,-2px)' }, '75%':{ transform:'translate(-1px,1px)' } },
        heartbeat: { '0%,100%':{ transform:'scale(1)' }, '15%':{ transform:'scale(1.2)' }, '30%':{ transform:'scale(1)' }, '45%':{ transform:'scale(1.15)' } },
        drawTrail: { to:{ strokeDashoffset:'0' } },
        slideIn:   { from:{ opacity:'0', transform:'translateX(-10px)' }, to:{ opacity:'1', transform:'translateX(0)' } },
        fadeUp:    { from:{ opacity:'0', transform:'translateY(8px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
      },
      backgroundImage: {
        'paper-lines': 'repeating-linear-gradient(transparent 0px, transparent 27px, rgba(200,133,90,0.08) 27px, rgba(200,133,90,0.08) 28px)',
        'paper-noise':  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
export default config;


/* ═══════════════════════════════════════════════════════════
   app/layout.tsx
═══════════════════════════════════════════════════════════ */

import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans, Caveat } from 'next/font/google';
import { CalendarProvider } from '@/components/providers/CalendarProvider';
import './globals.css';

const playfair = Playfair_Display({ subsets:['latin'], variable:'--font-display', display:'swap' });
const dmSans   = DM_Sans({ subsets:['latin'], variable:'--font-sans', display:'swap' });
const caveat   = Caveat({ subsets:['latin'], variable:'--font-hand', display:'swap' });

export const metadata: Metadata = {
  title: 'DeskPad — Premium Calendar',
  description: 'A tactile, intelligent, delightful desk-pad calendar',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${caveat.variable}`}>
      <body className="bg-paper-dark font-sans text-ink antialiased">
        <CalendarProvider>
          {children}
        </CalendarProvider>
      </body>
    </html>
  );
}
