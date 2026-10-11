// SeatMap.jsx — groups seats by row and renders the full cinema layout.
// Pure display component; all state lives in the parent (seat-selection).

import { useRef, Fragment } from 'react';
import Seat from './Seat.jsx';
import useSeatRepel from '../hooks/useSeatRepel.js';

// ── helpers ──────────────────────────────────────────────────────────────────

// Group a flat seats array into { A: [...], B: [...], ... } using a plain loop.
function groupByRow(seats) {
  const map = {};
  for (let i = 0; i < seats.length; i++) {
    const seat = seats[i];
    if (!map[seat.row]) map[seat.row] = [];
    map[seat.row].push(seat);
  }
  return map;
}

// Sort a group-map's keys so rows always appear A → Z.
function sortedRowKeys(map) {
  return Object.keys(map).sort();
}

const BALCONY_ROW_SET = new Set(['K', 'L', 'M']);

// ── legend item ──────────────────────────────────────────────────────────────

function LegendDot({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-4 w-4 rounded-t-sm border shrink-0 ${color}`} />
      <span className="text-[11px] text-zinc-400">{label}</span>
    </div>
  );
}

// ── seat cell wrapper ─────────────────────────────────────────────────────────
// Holds its place in the layout grid; only the inner <button> is transformed.
// The data-seat-cell attribute is the DOM hook used by useSeatRepel.
function SeatCell({ seat, isSelected, onToggle }) {
  return (
    <div
      data-seat-cell
      className="h-8 w-8 shrink-0 flex items-center justify-center"
    >
      <Seat seat={seat} isSelected={isSelected} onToggle={onToggle} />
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function SeatMap({ seats, selectedIds, onToggleSeat }) {
  const mapRef = useRef(null);
  useSeatRepel(mapRef);

  const rowMap = groupByRow(seats);
  const rows   = sortedRowKeys(rowMap);

  const mainRows    = rows.filter((r) => !BALCONY_ROW_SET.has(r));
  const balconyRows = rows.filter((r) => BALCONY_ROW_SET.has(r));

  return (
    <div className="flex flex-col items-center gap-6 w-full">

      {/* ── Screen bar ─────────────────────────────────────────────────── */}
      <div className="w-full max-w-xl px-4">
        {/* Curved glow strip */}
        <div
          className="mx-auto h-2 w-4/5 rounded-b-[50%] bg-indigo-400/70
                     shadow-[0_6px_30px_6px_rgba(99,102,241,0.45)]"
        />
        <p className="mt-1 text-center text-[11px] uppercase tracking-[0.2em] text-indigo-300/70">
          Screen
        </p>
      </div>

      {/* ── Seat grid (horizontally scrollable on small screens) ────────── */}
      <div className="w-full overflow-x-auto p-4">
        {/* ref lives here — all [data-seat-cell] elements are descendants */}
        <div
          ref={mapRef}
          className="w-max mx-auto grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 items-center"
        >
          {/* Main Rows (A-J) */}
          {mainRows.map((rowLetter) => {
            const rowSeats = rowMap[rowLetter];

            // Split into two halves for the aisle gap after seat 6.
            const left  = rowSeats.filter((s) => s.number <= 6);
            const right = rowSeats.filter((s) => s.number > 6);

            return (
              <Fragment key={rowLetter}>
                {/* 1st grid item: Row letter */}
                <div className="text-white/50 text-sm font-bold text-right">
                  {rowLetter}
                </div>

                {/* 2nd grid item: Centering container for seats */}
                <div className="flex justify-center gap-2 sm:gap-3">
                  {/* Left block (seats 1-6) */}
                  <div className="flex gap-1.5">
                    {left.map((seat) => (
                      <SeatCell
                        key={seat.id}
                        seat={seat}
                        isSelected={selectedIds.has(seat.id)}
                        onToggle={onToggleSeat}
                      />
                    ))}
                  </div>

                  {/* Aisle gap */}
                  <div className="w-5 shrink-0" aria-hidden="true" />

                  {/* Right block (seats 7-12) */}
                  <div className="flex gap-1.5">
                    {right.map((seat) => (
                      <SeatCell
                        key={seat.id}
                        seat={seat}
                        isSelected={selectedIds.has(seat.id)}
                        onToggle={onToggleSeat}
                      />
                    ))}
                  </div>
                </div>
              </Fragment>
            );
          })}

          {/* Premium Balcony Rows (K-M) */}
          {balconyRows.length > 0 && (
            <>
              <div className="col-span-2 mt-8 mb-4 border-t border-white/10 pt-6 text-center text-xs font-bold tracking-[0.2em] text-indigo-400/80 uppercase">
                Premium Balcony
              </div>
              {balconyRows.map((rowLetter) => {
                const rowSeats = rowMap[rowLetter];

                return (
                  <Fragment key={rowLetter}>
                    {/* 1st grid item: Row letter */}
                    <div className="text-white/50 text-sm font-bold text-right">
                      {rowLetter}
                    </div>

                    {/* 2nd grid item: Centering container for balcony seats */}
                    <div className="flex justify-center gap-2 sm:gap-3">
                      <div className="flex items-center gap-1.5">
                        {rowSeats.map((seat) => (
                          <Fragment key={seat.id}>
                            <SeatCell
                              seat={seat}
                              isSelected={selectedIds.has(seat.id)}
                              onToggle={onToggleSeat}
                            />
                            {seat.number === 10 && (
                              <div className="w-24 shrink-0" aria-hidden="true" />
                            )}
                          </Fragment>
                        ))}
                      </div>
                    </div>
                  </Fragment>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* ── Legend ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 px-4">
        <LegendDot
          color="border-zinc-500 bg-transparent"
          label="Available"
        />
        <LegendDot
          color="border-indigo-400 bg-indigo-600"
          label="Selected"
        />
        <LegendDot
          color="border-amber-500/60 bg-amber-900/60"
          label="Locked"
        />
        <LegendDot
          color="border-zinc-600 bg-zinc-700"
          label="Booked"
        />
      </div>

    </div>
  );
}
