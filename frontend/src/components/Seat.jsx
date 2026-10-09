// Seat.jsx — renders a single seat button with optional hover animation.
import { useState } from 'react';
import { SEAT_EFFECTS, SEAT_COVER_BG } from '../data/constants';
import './seatHover.css';

// ── CSS custom-property values that mirror the Tailwind classes below ─────────
// h-8 w-8 → 2rem; rounded-t-md → 0.375rem 0.375rem 0 0
const SEAT_SIZE   = '2rem';
const SEAT_RADIUS = '0.375rem 0.375rem 0 0';
// Resting colours for the "available" state.
// --seat-bg MUST be a solid opaque colour (the page background) so that the
// seat-expand ::before green layer is hidden at rest. Using "transparent" here
// lets the green bleed through on composited renders.
const AVAIL_BG   = SEAT_COVER_BG; // '#04050a' — matches root page background
const AVAIL_RING = 'rgb(113 113 122)'; // zinc-500

export default function Seat({ seat, isSelected, onToggle }) {
  const { id, row, number, status } = seat;
  const isDisabled = status === 'locked' || status === 'booked';

  // Pick ONE effect per seat at mount; stable across re-renders/refetches.
  const [effect] = useState(
    () => SEAT_EFFECTS[Math.floor(Math.random() * SEAT_EFFECTS.length)]
  );

  // True only for seats that should animate on hover.
  const isAvailableUnselected = status === 'available' && !isSelected;

  // ── visual classes ─────────────────────────────────────────────────────────
  function getStatusClasses() {
    if (status === 'booked') {
      return 'bg-zinc-700 border border-zinc-600 text-zinc-500 cursor-not-allowed';
    }
    if (status === 'locked') {
      return 'bg-amber-900/60 border border-amber-500/60 text-amber-400 cursor-not-allowed';
    }
    if (isSelected) {
      return 'bg-indigo-600 border border-indigo-400 text-white ring-2 ring-indigo-300/50';
    }
    // available — border is drawn by the CSS effect, NOT by Tailwind border-*
    return 'text-zinc-300';
  }

  // ── inline CSS vars for the animation (only set when the effect is active) ─
  const animStyle = isAvailableUnselected
    ? {
        '--seat-size':   SEAT_SIZE,
        '--seat-radius': SEAT_RADIUS,
        '--seat-bg':     AVAIL_BG,
        '--seat-ring':   AVAIL_RING,
      }
    : undefined;

  return (
    <button
      id={`seat-${id}`}
      type="button"
      disabled={isDisabled}
      aria-label={`Row ${row} seat ${number}, ${isSelected ? 'selected' : status}`}
      aria-pressed={isSelected}
      onClick={() => !isDisabled && onToggle(id)}
      style={animStyle}
      className={[
        'flex h-8 w-8 items-center justify-center rounded-t-md text-[11px] font-semibold',
        'select-none shrink-0',
        // animation wrapper + chosen effect (available & unselected only)
        isAvailableUnselected ? `seat-fx ${effect}` : '',
        getStatusClasses(),
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* span keeps the label above the ::before / ::after animation layers */}
      <span>{number}</span>
    </button>
  );
}
