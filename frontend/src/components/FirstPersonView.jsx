import { useState, useRef, useEffect } from 'react';

// TEMPORARY - replace with the real trailer URL from the show details.
const DEMO_VIDEO_SRC = '/videos/demo.mp4';

// ── sections config ───────────────────────────────────────────────────────────

const SECTIONS = {
  classic: {
    id: 'classic',
    name: 'Standard',
    rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
    seatsPerRow: 12,
  },
  balcony: {
    id: 'balcony',
    name: 'Premium Balcony',
    rows: ['K', 'L', 'M'],
    seatsPerRow: 20,
  },
};

const ALL_ROWS = [...SECTIONS.classic.rows, ...SECTIONS.balcony.rows];
const DEFAULT_SEAT = 'F6'; // fallback when nothing is selected

// ── transform constants ───────────────────────────────────────────────────────

// Classic (Standard) section constants
const CLASSIC_CENTER = 6.5;
const CLASSIC_SHIFT_PX = 30;
const CLASSIC_YAW_DEG = 4;
const CLASSIC_BASE_SCALE = 0.8;
const CLASSIC_SCALE_STEP = 0.15;
const CLASSIC_FRONT_BASE_SCALE = 1.55;
const CLASSIC_FRONT_STEP = 0.03;
const CLASSIC_MAX_YAW_DEG = 8;

// Premium Balcony section constants
const MAX_SHIFT_PX = 165;
const MAX_YAW_DEG = 22;
const MIN_SCALE = 0.8;
const SCALE_RANGE = 1.35;

// ── helpers ───────────────────────────────────────────────────────────────────

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Find which section a row belongs to
function getSectionForSeat(row, sections = SECTIONS) {
  return Object.values(sections).find((sec) => sec.rows.includes(row)) ?? sections.classic;
}

// Parse a seat ID like "G11" or "K20" → { row, seatNumber, rowIndex, section }
function parseSeatId(id, sections = SECTIONS) {
  const row = id[0].toUpperCase();
  const seatNumber = parseInt(id.slice(1), 10);
  const section = getSectionForSeat(row, sections);
  const classicIdx = sections.classic.rows.indexOf(row);
  const rowIndex = classicIdx === -1 ? 5 : classicIdx;

  return {
    row,
    seatNumber: isNaN(seatNumber) ? 6 : seatNumber,
    rowIndex,
    section,
  };
}

// ── section-specific pure transform functions ─────────────────────────────────

// Classic / Standard section transform (rows A-J, 12 seats)
function getClassicTransform(seat) {
  const { rowIndex, seatNumber } = seat;
  const scale =
    rowIndex >= 4
      ? CLASSIC_BASE_SCALE + (9 - rowIndex) * CLASSIC_SCALE_STEP
      : CLASSIC_FRONT_BASE_SCALE + (4 - rowIndex) * CLASSIC_FRONT_STEP;
  const offsetX = (CLASSIC_CENTER - seatNumber) * CLASSIC_SHIFT_PX;
  const rawYaw = (seatNumber - CLASSIC_CENTER) * -CLASSIC_YAW_DEG;
  const yaw = clamp(rawYaw, -CLASSIC_MAX_YAW_DEG, CLASSIC_MAX_YAW_DEG);

  return { scale, offsetX, yaw };
}

// Premium Balcony section transform (rows K-M, 20 seats)
function getBalconyTransform(seat, sections = SECTIONS) {
  const seatsPerRow = sections.balcony.seatsPerRow;
  const totalRows = sections.classic.rows.length + sections.balcony.rows.length;
  const globalRowIndex = ALL_ROWS.indexOf(seat.row);

  const sideways = (seat.seatNumber - (seatsPerRow + 1) / 2) / (seatsPerRow / 2);
  const depth = globalRowIndex / (totalRows - 1);

  const offsetX = -sideways * MAX_SHIFT_PX;
  const yaw = -sideways * MAX_YAW_DEG;
  const scale = MIN_SCALE + (1 - depth) * SCALE_RANGE;

  return { scale, offsetX, yaw };
}

// Choose section transform using seat's section config (never by hardcoded row letters)
function getScreenTransform(seat, sections = SECTIONS) {
  const section = seat.section || getSectionForSeat(seat.row, sections);
  if (section?.id === 'balcony' || section?.name === 'Premium Balcony') {
    return getBalconyTransform(seat, sections);
  }
  return getClassicTransform(seat);
}

// ── main component ────────────────────────────────────────────────────────────

export default function FirstPersonView({ selectedIds }) {
  const [isMuted, setIsMuted] = useState(true);
  const [hasVideoError, setHasVideoError] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    const video = videoRef.current;
    return () => {
      if (video) {
        video.pause();
      }
    };
  }, []);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (videoRef.current) {
        videoRef.current.muted = next;
        if (videoRef.current.paused) {
          videoRef.current.play().catch(() => { });
        }
      }
      return next;
    });
  };

  // Resolve the active seat: last selected ID, or the default.
  const ids = Array.isArray(selectedIds) ? selectedIds : Array.from(selectedIds ?? []);
  const activeSeat = ids.length > 0 ? ids[ids.length - 1] : DEFAULT_SEAT;

  // Strip the "mock-" prefix that mockSeats adds (e.g. "mock-A3" → "A3")
  const cleanId = activeSeat.replace(/^mock-/, '');

  const parsed = parseSeatId(cleanId, SECTIONS);
  const { scale, offsetX, yaw } = getScreenTransform(parsed, SECTIONS);

  const screenTransform = `scale(${scale.toFixed(3)}) rotateY(${yaw.toFixed(1)}deg) translateX(${offsetX.toFixed(0)}px)`;

  return (
    /*
     * LAYOUT: no overflow clipping inside FirstPersonView at all.
     *
     * The outer shell uses absolute inset-0 with top/bottom padding to occupy
     * exactly the space between the header (h-14 = 56px, parent has pt-24 = 96px)
     * and the bottom toolbar (fixed bottom-6, ~140px total visual height).
     * No h-[60vh] → no fixed-height crop. No overflow-hidden → no clip.
     * The page root (h-dvh overflow-hidden) prevents page-level scrollbars.
     *
     * Screen width: min(60vw, 80dvh)
     *   — 60vw drives width on wide screens (landscape)
     *   — 80dvh caps it on short screens so the 21:9 height never overflows
     *     the available vertical space, even for front rows at scale 1.67.
     *
     * The perspective parent has overflow: visible (default) so the browser
     * never flattens the 3D scene before painting.
     */

    // Outer shell: fills header-to-toolbar gap, no overflow constraint, no perspective.
    <div className="absolute inset-0 pt-[80px] pb-[140px] flex items-center justify-center">

      {/* Perspective shell: perspective-[800px], overflow stays visible (default) */}
      <div className="relative w-full h-full flex items-center justify-center perspective-[800px]">

        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(59,130,246,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Transform wrapper: scale / rotateY / translateX — no size change, no overflow */}
        <div
          style={{ transform: screenTransform, transformOrigin: 'center center' }}
          className="flex items-center justify-center transition-transform duration-700 ease-out"
        >
          {/*
           * #cinema-screen — constant size for every seat; only the parent
           * transform changes. Width is min(60vw, 80dvh).
           */}
          <div
            id="cinema-screen"
            className="relative aspect-[21/9] w-[min(60vw,80dvh)] bg-black overflow-hidden rounded-sm shadow-[0_0_50px_rgba(99,102,241,0.2)]"
          >
            {!hasVideoError && (
              <video
                ref={videoRef}
                src={DEMO_VIDEO_SRC}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                onError={() => setHasVideoError(true)}
                className="h-full w-full object-cover"
              />
            )}

            {/* Screen frame / border */}
            <div className="absolute inset-0 rounded-sm border border-white/10 pointer-events-none" />
          </div>
        </div>

        {/* Seat position label — outside the transform, stays fixed in the corner */}
        <p className="absolute top-3 right-4 text-[11px] text-white/30 tracking-widest uppercase z-10">
          Viewing from {parsed.row}{parsed.seatNumber}
        </p>

        {/* Mute/unmute button — fixed in bottom-right of preview */}
        {!hasVideoError && (
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute trailer audio' : 'Mute trailer audio'}
            className="absolute bottom-65 right-4 z-20 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-5 py-5 text-xs font-medium text-white/80 backdrop-blur-md hover:bg-indigo-600/30 hover:border-indigo-500/50 hover:text-white transition-all cursor-pointer"
          >
            {isMuted ? (
              <svg className="w-3.5 h-3.5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-7.5L4.5 9.75H2.25v4.5H4.5l4.5 3V4.5z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H3.75A1.5 1.5 0 012.25 14.25v-4.5A1.5 1.5 0 013.75 8.25h3z" />
              </svg>
            )}
            <span>{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>
        )}

      </div>
    </div>
  );
}
