// Shared constants for the seat-selection screen.

// Five hover-animation variants applied randomly to available seats.
export const SEAT_EFFECTS = [
  'seat-fill',
  'seat-enter',
  'seat-expand',
  'seat-collapse',
  'seat-rotate',
];

// Solid colour that matches the root page background (set on <html> / body in
// seat-selection.jsx). Used as --seat-bg so the seat-expand effect's green
// ::before layer is fully covered at rest. Must never be "transparent" —
// a transparent cover lets the green through on most composited browsers.
export const SEAT_COVER_BG = '#04050a';
