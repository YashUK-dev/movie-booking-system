// SeatMap3D.jsx — 3D perspective view of the seat map.
// Pure display component; reuses <Seat> for all seat logic and styling.

import Seat from './Seat.jsx';

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

// Return sorted row keys so rows always render A → Z.
function sortedRowKeys(map) {
  return Object.keys(map).sort();
}

export default function SeatMap3D({ seats, selectedIds, onToggleSeat }) {
  const rowMap = groupByRow(seats);
  const rows   = sortedRowKeys(rowMap);

  return (
    // 3D illusion wrapper — perspective + tilt applied here, nowhere else.
    <div className="transform perspective-[1200px] rotate-x-[40deg] scale-105 origin-bottom pb-20">

      {/* ── Glowing screen ──────────────────────────────────────────────── */}
      <div className="w-3/4 h-32 mx-auto bg-blue-900/40 rounded-t-3xl shadow-[0_-50px_100px_rgba(59,130,246,0.15)] border-t-2 border-blue-500/50 mb-16 flex items-center justify-center">
        <span className="text-blue-400/50 text-sm tracking-widest uppercase">
          Screen
        </span>
      </div>

      {/* ── Seat rows ───────────────────────────────────────────────────── */}
      {rows.map((rowLetter) => {
        const rowSeats = rowMap[rowLetter];
        const left  = rowSeats.filter((s) => s.number <= 6);
        const right = rowSeats.filter((s) => s.number > 6);

        return (
          <div key={rowLetter} className="flex justify-center gap-3 mb-4">

            {/* Left block (seats 1-6) */}
            {left.map((seat) => (
              <Seat
                key={seat.id}
                seat={seat}
                isSelected={selectedIds.has(seat.id)}
                onToggle={onToggleSeat}
              />
            ))}

            {/* Aisle gap */}
            <div className="w-5" aria-hidden="true" />

            {/* Right block (seats 7-12) */}
            {right.map((seat) => (
              <Seat
                key={seat.id}
                seat={seat}
                isSelected={selectedIds.has(seat.id)}
                onToggle={onToggleSeat}
              />
            ))}

          </div>
        );
      })}
    </div>
  );
}
