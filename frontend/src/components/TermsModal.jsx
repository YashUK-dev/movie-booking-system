// TermsModal.jsx — confirmation dialog showing terms before seat locking.
import { useEffect } from 'react';

// TEMPORARY placeholder text - replace with the real terms.
const TERMS = [
  'Seat layouts shown are indicative; the actual auditorium layout may vary.',
  "Entry may be restricted by the film's age certificate.",
  'Outside food and beverages are not allowed.',
  'Large bags, helmets and prohibited items are not permitted inside the auditorium.',
  'Entry may be denied to patrons under the influence of alcohol or drugs.',
  'Tickets once purchased cannot be cancelled, transferred or modified.',
  'Seats are held for a limited time after locking; the booking must be completed before the hold expires.',
];

export default function TermsModal({ onAccept, onCancel }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onCancel();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-title"
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center bg-black/70 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md mx-auto rounded-t-2xl sm:rounded-2xl bg-[#0e0f17] border border-white/10 p-6 shadow-2xl flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="terms-title" className="text-lg font-semibold text-white mb-3">
          Terms &amp; Conditions
        </h2>

        {/* Scrollable terms body */}
        <ol className="max-h-[60vh] overflow-y-auto space-y-2.5 pr-2 text-xs leading-relaxed text-white/70 list-decimal list-inside">
          {TERMS.map((term, i) => (
            <li key={i} className="pl-1">
              <span>{term}</span>
            </li>
          ))}
        </ol>

        {/* Fixed footer with action buttons */}
        <div className="flex gap-3 pt-4 mt-2 border-t border-white/10 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-white/15 hover:bg-white/5 text-white/70 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-colors cursor-pointer"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
