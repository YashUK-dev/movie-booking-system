// BookingSummary.jsx — modal/bottom-sheet shown after a successful seat lock.
// Props: show, seats (full seat objects), total, onContinue, onClose.

import { useEffect } from 'react';

export default function BookingSummary({ show, seats, total, onContinue, onClose }) {
  // Close on Escape key
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const seatLabels = seats.map((s) => `${s.row}${s.number}`).join(', ');

  return (
    // Backdrop — closes on click outside the card
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="summary-title"
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Card — stop propagation so clicks inside don't close it */}
      <div
        className="w-full max-w-md mx-auto rounded-t-2xl sm:rounded-2xl bg-[#0e0f17] border border-white/10 p-6 pb-8 sm:pb-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Show details ── */}
        <h2 id="summary-title" className="text-lg font-semibold text-white mb-1">
          {show.movieTitle}
        </h2>
        <p className="text-xs text-white/40 mb-3 line-clamp-3 leading-relaxed">
          {show.description}
        </p>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-white/60 mb-5">
          <span><span className="text-white/30">Theatre</span><br />{show.theatre}</span>
          <span><span className="text-white/30">Date & Time</span><br />{show.date} · {show.time}</span>
          <span><span className="text-white/30">Language</span><br />{show.language}</span>
          <span><span className="text-white/30">Format</span><br />{show.format}</span>
        </div>

        {/* ── Seat & price summary ── */}
        <div className="rounded-xl bg-white/5 border border-white/8 px-4 py-3 mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] text-white/30 mb-0.5">
              {seats.length} seat{seats.length !== 1 ? 's' : ''}
            </p>
            <p className="text-sm font-medium text-white">{seatLabels}</p>
          </div>
          <p className="text-xl font-bold text-indigo-400 shrink-0">₹{total}</p>
        </div>

        {/* ── Actions ── */}
        <button
          onClick={onContinue}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors mb-2"
        >
          Continue to payment
        </button>
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 text-sm transition-colors"
        >
          Change seats
        </button>
      </div>
    </div>
  );
}
