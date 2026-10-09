import { useState, useEffect, useRef } from 'react';
import SeatMap from '../components/SeatMap.jsx';
import FirstPersonView from '../components/FirstPersonView.jsx';
import BookingSummary from '../components/BookingSummary.jsx';
import TermsModal from '../components/TermsModal.jsx';
import { fetchSeats, lockSeats } from '../api/seats.js';
import { getShowDetails } from '../api/shows.js';

const MAX_SEATS = 6;

// ── small helpers kept out of the component body ────────────────────────────

// Formats an array of seat IDs into a readable label, e.g. "A1, B3"
function formatSeatLabels(seats, selectedIds) {
    return seats
        .filter((s) => selectedIds.includes(s.id))
        .map((s) => `${s.row}${s.number}`)
        .join(', ');
}

// Sums the price of every selected seat
function calcTotal(seats, selectedIds) {
    return seats
        .filter((s) => selectedIds.includes(s.id))
        .reduce((sum, s) => sum + s.price, 0);
}

// ── component ────────────────────────────────────────────────────────────────

// showId prop: pass the real ID from a parent router; defaults to "demo".
// TODO (router): replace prop default with useParams once react-router-dom is installed.
export default function SeatSelection({ showId = '6ac8f078659871f919bcfd6b' }) {
    const [is3DView, setIs3DView] = useState(false);
    const [seats, setSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [locking, setLocking] = useState(false);
    const [statusMsg, setStatusMsg] = useState(null); // { type: 'success'|'warn', text }
    const [showSummary, setShowSummary] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [showDetails, setShowDetails] = useState(null);

    // Keep a stable ref so Retry and the 409 handler can call load without
    // re-declaring it inside an effect (avoids react-hooks/set-state-in-effect).
    const loadSeatsRef = useRef(null);

    // Fetch show details once; falls back to mock when no route state is available.
    // TODO: pass location.state?.show from react-router once the router is installed.
    useEffect(() => {
        getShowDetails(showId, null).then(setShowDetails);
    }, [showId]);

    useEffect(() => {
        async function load() {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchSeats(showId);
                setSeats(data);
            } catch (err) {
                setError(err.message || 'Failed to load seats.');
            } finally {
                setLoading(false);
            }
        }
        loadSeatsRef.current = load; // expose to Retry / 409 handler
        load();
    }, [showId]);

    // Toggles one seat; enforces the 6-seat maximum
    function handleToggle(id) {
        setStatusMsg(null);
        setSelectedIds((prev) => {
            if (prev.includes(id)) return prev.filter((x) => x !== id);
            if (prev.length >= MAX_SEATS) {
                setStatusMsg({ type: 'warn', text: `Max ${MAX_SEATS} seats per booking.` });
                return prev;
            }
            return [...prev, id];
        });
    }

    // Calls lockSeats; handles success, 409 conflict, and generic errors.
    async function handleLock() {
        setLocking(true);
        setStatusMsg(null);
        try {
            await lockSeats(showId, selectedIds);
            setShowSummary(true); // success → open the booking summary panel
        } catch (err) {
            if (err.status === 409) {
                // Seats taken: inform user, wipe selection, refetch — do NOT open summary.
                setStatusMsg({ type: 'warn', text: 'Some seats were just taken. Please choose again.' });
                setSelectedIds([]);
                await loadSeatsRef.current?.();
            } else {
                setStatusMsg({ type: 'warn', text: err.message || 'Locking failed. Try again.' });
            }
        } finally {
            setLocking(false);
        }
    }

    // Accepts the terms: dismiss modal and trigger the seat locking process.
    function handleAcceptTerms() {
        setShowTerms(false);
        handleLock();
    }

    // Closes the summary and clears the selection so the user can pick again.
    // TODO: call an unlock endpoint here once the backend exposes one;
    //       right now locked seats expire automatically on the server.
    function handleCloseSummary() {
        setShowSummary(false);
        setSelectedIds([]);
    }

    // Called when the user taps "Continue to payment" in the summary.
    // TODO: replace with navigate('/payment', { state: { showId, seatIds, seats, total } })
    //       once the payment route exists.
    function handleContinue() {
        const lockedSeats = seats.filter((s) => selectedIds.includes(s.id));
        const bookingPayload = { showId, seatIds: selectedIds, seats: lockedSeats, total };
        console.log('[BookingSummary] Continue to payment:', bookingPayload);
        setStatusMsg({ type: 'success', text: 'Payment page is not connected yet.' });
        setShowSummary(false);
    }

    // ── derived values ─────────────────────────────────────────────────────────
    const total = calcTotal(seats, selectedIds);
    const seatLabels = selectedIds.length ? formatSeatLabels(seats, selectedIds) : 'None selected';
    const canLock = selectedIds.length > 0 && !locking;

    // ── render ─────────────────────────────────────────────────────────────────
    return (
        <div className="relative h-dvh w-full overflow-hidden bg-[#04050a]">

            {/* 1. TOP HEADER (Brand & Toggle) */}
            <header className="pointer-events-none absolute inset-x-0 top-0 z-20">
                <div className="relative mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
                    <span className="text-lg font-semibold tracking-tight text-white">
                        GetIT<span className="text-indigo-500">YAY!!</span>
                    </span>
                    <div className="pointer-events-auto flex gap-4">
                        <button
                            onClick={() => setIs3DView(!is3DView)}
                            className="rounded-full px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all"
                        >
                            {is3DView ? 'Exit' : 'Preview 1st-Person'}
                        </button>
                    </div>
                </div>
            </header>

            {/* 2. MAIN VIEWPORT */}
            <div className="absolute inset-0 flex flex-col items-center pt-24 overflow-y-auto">
                {is3DView ? (
                    /* 1ST-PERSON PREVIEW — updates live as seats are selected */
                    <FirstPersonView selectedIds={selectedIds} />
                ) : (
                    /* STANDARD 2D MAP */
                    <>
                        {loading && (
                            <p className="text-zinc-400 animate-pulse">Loading seats…</p>
                        )}
                        {error && !loading && (
                            <div className="flex flex-col items-center gap-3 text-center">
                                <p className="text-red-400 text-sm">{error}</p>
                                <button
                                    onClick={() => loadSeatsRef.current?.()}
                                    className="rounded-lg px-4 py-1.5 text-xs font-semibold bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
                                >
                                    Retry
                                </button>
                            </div>
                        )}
                        {!loading && !error && (
                            <SeatMap
                                seats={seats}
                                selectedIds={new Set(selectedIds)}
                                onToggleSeat={handleToggle}
                            />
                        )}
                    </>
                )}

                {/* Uncollapsible bottom spacer to clear fixed glassmorphic toolbar */}
                <div className="h-64 w-full shrink-0" />
            </div>

            {/* 3. BOTTOM TOOLBAR (Glassmorphism) */}
            <div className="pointer-events-none fixed inset-x-0 bottom-6 flex flex-col items-center gap-3 z-50">

                {/* Status / feedback line */}
                {statusMsg && (
                    <span className={`text-[11px] font-medium ${statusMsg.type === 'success' ? 'text-green-400' : 'text-amber-400'}`}>
                        {statusMsg.text}
                    </span>
                )}

                {/* Selection summary */}
                <span className="text-[11px] text-white/50">
                    {seatLabels}{total > 0 && <> &nbsp;·&nbsp; ₹{total}</>}
                </span>

                <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-white/10 bg-black/60 p-1.5 backdrop-blur-md">

                    {/* Lock Seat button */}
                    <button
                        onClick={() => setShowTerms(true)}
                        disabled={!canLock}
                        aria-label="Lock selected seats and proceed"
                        className="px-4 py-2 bg-green-500/20 text-green-400 text-sm font-semibold rounded-xl hover:bg-green-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {locking ? 'Locking…' : 'Lock Seat'}
                    </button>
                </div>
            </div>

            {/* 4. BOOKING SUMMARY PANEL — rendered after a successful lock */}
            {showSummary && showDetails && (
                <BookingSummary
                    show={showDetails}
                    seats={seats.filter((s) => selectedIds.includes(s.id))}
                    total={total}
                    onContinue={handleContinue}
                    onClose={handleCloseSummary}
                />
            )}

            {/* 5. TERMS & CONDITIONS MODAL — shown before locking seats */}
            {showTerms && !showSummary && (
                <TermsModal
                    onAccept={handleAcceptTerms}
                    onCancel={() => setShowTerms(false)}
                />
            )}

        </div>
    );
}