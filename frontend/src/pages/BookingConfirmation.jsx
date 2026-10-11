import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { LoadingSpinner, ErrorMessage } from '../components/common/UIStates';
import {
  CheckCircle,
  Home,
  Download,
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Hash,
  Film,
  Sparkles,
  Copy,
  Check,
  Crown,
} from 'lucide-react';
import './BookingConfirmation.css';

/* ── Utility: generate a visual barcode pattern from a string ── */
const generateBarcode = (str = '') => {
  if (!str) return [];
  const bars = [];
  const chars = str.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  // Each char maps to 5 alternating bar widths (narrow / wide)
  const WIDTHS = [1, 2, 1, 3, 1, 2, 2, 1, 3, 1];
  for (let i = 0; i < chars.length; i++) {
    const code = chars.charCodeAt(i);
    for (let j = 0; j < 5; j++) {
      const wIdx = (code + j * 3) % WIDTHS.length;
      bars.push({ width: WIDTHS[wIdx], isGap: j % 2 !== 0 });
    }
  }
  return bars;
};

/* ── Confetti & Corner Cannons Component ── */
const Confetti = () => {
  const COLOURS = [
    '#ef4444', '#dc2626', '#f87171', // Reds
    '#fbbf24', '#f59e0b', '#d97706', // Golds
    '#10b981', '#059669',             // Emeralds
    '#38bdf8', '#0284c7',             // Cyans
    '#a855f7', '#7c3aed',             // Purples
    '#f43f5e', '#fb7185',             // Roses
  ];

  // Rain particles falling from overall header/top across entire screen width
  const rainParticles = Array.from({ length: 65 }, (_, i) => {
    const shape = i % 4; // 0: rect, 1: circle, 2: strip/ribbon, 3: diamond
    const size = 7 + (i % 5) * 2.5;
    return {
      id: `rain-${i}`,
      color: COLOURS[i % COLOURS.length],
      left: `${(i / 65) * 100 + (Math.sin(i * 1.5) * 3)}%`,
      delay: `${(Math.random() * 2.2).toFixed(2)}s`,
      duration: `${1.8 + Math.random() * 1.6}s`,
      size,
      shape,
      drift: `${(Math.random() * 80 - 40).toFixed(0)}px`,
    };
  });

  // Left Corner Cannon: bursts from bottom-left corner shooting upwards & into center
  const leftCannonParticles = Array.from({ length: 28 }, (_, i) => {
    const angle = 30 + Math.random() * 45; // 30-75 degrees shooting up-right
    const distance = 350 + Math.random() * 450;
    const rad = (angle * Math.PI) / 180;
    const tx = Math.cos(rad) * distance;
    const ty = -Math.sin(rad) * distance;
    return {
      id: `cannon-left-${i}`,
      color: COLOURS[(i + 3) % COLOURS.length],
      delay: `${(i * 0.035).toFixed(3)}s`,
      duration: `${1.4 + Math.random() * 0.8}s`,
      size: 8 + (i % 4) * 2.5,
      tx: `${tx.toFixed(0)}px`,
      ty: `${ty.toFixed(0)}px`,
      shape: i % 3,
    };
  });

  // Right Corner Cannon: bursts from bottom-right corner shooting upwards & into center
  const rightCannonParticles = Array.from({ length: 28 }, (_, i) => {
    const angle = 30 + Math.random() * 45; // shooting up-left
    const distance = 350 + Math.random() * 450;
    const rad = (angle * Math.PI) / 180;
    const tx = -Math.cos(rad) * distance;
    const ty = -Math.sin(rad) * distance;
    return {
      id: `cannon-right-${i}`,
      color: COLOURS[(i + 5) % COLOURS.length],
      delay: `${(i * 0.035).toFixed(3)}s`,
      duration: `${1.4 + Math.random() * 0.8}s`,
      size: 8 + (i % 4) * 2.5,
      tx: `${tx.toFixed(0)}px`,
      ty: `${ty.toFixed(0)}px`,
      shape: i % 3,
    };
  });

  return (
    <div className="bc-confetti" aria-hidden="true">
      {/* 1. Rain falling from entire header */}
      {rainParticles.map((p) => (
        <div
          key={p.id}
          className={`bc-rain-particle bc-shape-${p.shape}`}
          style={{
            left: p.left,
            backgroundColor: p.color,
            animationDuration: p.duration,
            animationDelay: p.delay,
            width: p.shape === 2 ? `${p.size * 2.2}px` : `${p.size}px`,
            height: p.shape === 2 ? '4px' : `${p.size}px`,
            '--drift': p.drift,
          }}
        />
      ))}

      {/* 2. Bottom-left corner cannon burst */}
      <div className="bc-cannon-origin bc-cannon-left">
        {leftCannonParticles.map((p) => (
          <div
            key={p.id}
            className={`bc-cannon-particle bc-shape-${p.shape}`}
            style={{
              backgroundColor: p.color,
              animationDuration: p.duration,
              animationDelay: p.delay,
              width: `${p.size}px`,
              height: p.shape === 2 ? '4px' : `${p.size}px`,
              '--tx': p.tx,
              '--ty': p.ty,
            }}
          />
        ))}
      </div>

      {/* 3. Bottom-right corner cannon burst */}
      <div className="bc-cannon-origin bc-cannon-right">
        {rightCannonParticles.map((p) => (
          <div
            key={p.id}
            className={`bc-cannon-particle bc-shape-${p.shape}`}
            style={{
              backgroundColor: p.color,
              animationDuration: p.duration,
              animationDelay: p.delay,
              width: `${p.size}px`,
              height: p.shape === 2 ? '4px' : `${p.size}px`,
              '--tx': p.tx,
              '--ty': p.ty,
            }}
          />
        ))}
      </div>
    </div>
  );
};

const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const ticketRef = useRef(null);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const res = await bookingService.getBookingById(bookingId);
      if (res?.success) {
        setBooking(res.data);
        // Trigger confetti celebration after data loads
        setTimeout(() => setShowConfetti(true), 250);
        setTimeout(() => setShowConfetti(false), 5500);
      } else {
        throw new Error('Failed to load booking details');
      }
    } catch (err) {
      setError(err.message || 'Error fetching booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    window.print();
  };

  const triggerCelebration = () => {
    setShowConfetti(false);
    setTimeout(() => setShowConfetti(true), 50);
    setTimeout(() => setShowConfetti(false), 5500);
  };

  const handleCopyOrderId = (id) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return (
    <div className="container" style={{ padding: '64px 0' }}>
      <ErrorMessage message={error} />
    </div>
  );
  if (!booking) return (
    <div className="container" style={{ padding: '64px 0' }}>
      <ErrorMessage message="Booking not found" />
    </div>
  );

  const show      = booking.showId;
  const movie     = show?.movieId;
  const screen    = show?.screenId;
  const theatre   = screen?.theatreId;
  const startTime = show ? new Date(show.startTime) : null;

  const dateStr = startTime
    ? startTime.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    : 'N/A';
  const timeStr = startTime
    ? startTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    : 'N/A';
  const seatList = booking.seats?.map(s => `${s.row}${s.seatNumber}`).join(', ') || 'N/A';

  const orderNumber = booking.bookingNumber || bookingId?.slice(0, 8).toUpperCase();
  const barcodeBars = generateBarcode(orderNumber);

  // Google Calendar URL
  const getGoogleCalendarUrl = () => {
    if (!startTime) return '#';
    const title = encodeURIComponent(`🎬 Movie: ${movie?.title || 'Cinema'}`);
    const details = encodeURIComponent(`Seats: ${seatList}\nTheatre: ${theatre?.name || ''}\nScreen: ${screen?.name || ''}\nOrder ID: ${orderNumber}`);
    const location = encodeURIComponent(`${theatre?.name || ''}, ${theatre?.city || ''}`);
    const startISO = startTime.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endTime = new Date(startTime.getTime() + 2.5 * 60 * 60 * 1000);
    const endISO = endTime.toISOString().replace(/-|:|\.\d\d\d/g, '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startISO}/${endISO}&details=${details}&location=${location}`;
  };

  return (
    <div className="bc-page">
      {/* ── Dynamic Ambient Movie Backdrop ── */}
      <div
        className="bc-backdrop"
        style={{
          backgroundImage: movie?.posterUrl ? `url("${movie.posterUrl}")` : undefined,
        }}
      >
        <div className="bc-backdrop-glow" />
        <div className="bc-backdrop-overlay" />
      </div>

      {showConfetti && <Confetti />}

      <div className="bc-wrapper">

        {/* ── Success Header ── */}
        <div className="bc-header">
          <div className="bc-success-ring" onClick={triggerCelebration} title="Click to replay celebration!">
            <div className="bc-success-ring-inner">
              <CheckCircle className="bc-check-icon" size={48} />
            </div>
            <span className="bc-ring-badge">VERIFIED</span>
          </div>
          <h1 className="bc-title">Booking Confirmed!</h1>
          <p className="bc-subtitle">
            Your e-ticket has been generated and sent to your registered email.
          </p>
          <button
            type="button"
            className="bc-replay-pill"
            onClick={triggerCelebration}
          >
            <Sparkles size={14} /> Replay Celebration
          </button>
        </div>

        {/* ── THE VIP TICKET ── */}
        <div className="bc-ticket" ref={ticketRef} id="printable-ticket">

          {/* Golden VIP Top Bar */}
          <div className="bc-vip-banner">
            <div className="bc-vip-left">
              <Sparkles size={13} className="bc-vip-sparkle" />
              <span>CINERED VIP ACCESS &bull; ADMIT {booking.seats?.length || 1}</span>
            </div>
            <div className="bc-vip-right">
              <Crown size={14} />
              <span>PREMIUM</span>
            </div>
          </div>

          {/* Ticket Top — movie info */}
          <div className="bc-ticket-top">
            {/* Film strip decorative perforations */}
            <div className="bc-filmstrip" aria-hidden="true">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="bc-filmhole" />
              ))}
            </div>

            <div className="bc-ticket-top-content">
              {movie?.posterUrl ? (
                <div className="bc-ticket-poster-wrap">
                  <img
                    src={movie.posterUrl}
                    alt={movie?.title}
                    className="bc-ticket-poster"
                  />
                  <div className="bc-poster-overlay" />
                </div>
              ) : (
                <div className="bc-ticket-poster-fallback">
                  <Film size={28} />
                  <span>CINEMA</span>
                </div>
              )}

              <div className="bc-ticket-movie-info">
                <div className="bc-tags-row">
                  <span className="bc-eticket-label">
                    <Ticket size={11} />
                    <span>E-TICKET</span>
                  </span>
                  {show?.format && (
                    <span className="bc-format-tag">{show.format}</span>
                  )}
                  {movie?.language && (
                    <span className="bc-lang-tag">{movie.language}</span>
                  )}
                </div>

                <h2 className="bc-ticket-movie-title">
                  {movie?.title || 'Movie Experience'}
                </h2>

                <p className="bc-ticket-theatre">
                  <MapPin size={13} />
                  <span>
                    <strong>{theatre?.name || 'CineRed Multiplex'}</strong>
                    {theatre?.city ? ` &bull; ${theatre.city}` : ''}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Ticket Tear Divider 1 */}
          <div className="bc-divider">
            <div className="bc-notch bc-notch-left" />
            <div className="bc-dashes">
              <span className="bc-tear-text">TEAR ALONG DOTTED LINE</span>
            </div>
            <div className="bc-notch bc-notch-right" />
          </div>

          {/* Ticket Details Grid */}
          <div className="bc-ticket-details">
            <div className="bc-details-grid">
              <div className="bc-detail-cell">
                <span className="bc-detail-label">
                  <Calendar size={12} /> DATE
                </span>
                <span className="bc-detail-value">{dateStr}</span>
              </div>
              <div className="bc-detail-cell">
                <span className="bc-detail-label">
                  <Clock size={12} /> TIME
                </span>
                <span className="bc-detail-value bc-detail-time">{timeStr}</span>
              </div>
              <div className="bc-detail-cell bc-seat-cell">
                <span className="bc-detail-label">
                  <Ticket size={12} /> SEATS ({booking.seats?.length || 0})
                </span>
                <div className="bc-seat-badges">
                  {booking.seats?.map((s) => (
                    <span key={s.seatId || `${s.row}${s.seatNumber}`} className="bc-seat-chip">
                      {s.row}{s.seatNumber}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bc-detail-cell">
                <span className="bc-detail-label">
                  <Hash size={12} /> ORDER ID
                </span>
                <button
                  type="button"
                  className="bc-order-id-btn"
                  onClick={() => handleCopyOrderId(orderNumber)}
                  title="Click to copy order ID"
                >
                  <span className="bc-booking-id">{orderNumber}</span>
                  {copiedId ? <Check size={13} className="bc-copy-icon copied" /> : <Copy size={13} className="bc-copy-icon" />}
                </button>
              </div>
            </div>

            {/* Screen & Amount Row */}
            <div className="bc-amount-row">
              <div className="bc-screen-info">
                <span className="bc-detail-label"><Film size={12} /> AUDITORIUM</span>
                <span className="bc-screen-name">{screen?.name || 'Main Screen'}</span>
              </div>
              <div className="bc-amount-right">
                <span className="bc-detail-label">TOTAL PAID</span>
                <span className="bc-amount">₹{booking.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Status Badges */}
            <div className="bc-status-row">
              <span className={`bc-badge bc-badge-${booking.status?.toLowerCase() || 'confirmed'}`}>
                ● {booking.status || 'CONFIRMED'}
              </span>
              <span className={`bc-badge bc-badge-pay-${booking.paymentStatus?.toLowerCase() || 'success'}`}>
                ✓ Payment: {booking.paymentStatus || 'SUCCESS'}
              </span>
            </div>
          </div>

          {/* Ticket Tear Divider 2 */}
          <div className="bc-divider">
            <div className="bc-notch bc-notch-left" />
            <div className="bc-dashes" />
            <div className="bc-notch bc-notch-right" />
          </div>

          {/* Barcode – Full Width + Red Laser Scan */}
          <div className="bc-barcode-section">
            <span className="bc-scan-text">SCAN AT ENTRANCE GATE &bull; FAST PASS</span>
            <div className="bc-barcode-outer" aria-label={`Barcode for ${orderNumber}`}>
              {/* Red laser line scanning left → right */}
              <div className="bc-laser-line" />

              {/* Barcode bars */}
              <div className="bc-barcode">
                <div className="bc-bar" style={{ width: 4, background: '#111' }} />
                <div className="bc-bar bc-gap" style={{ width: 3 }} />
                <div className="bc-bar" style={{ width: 4, background: '#111' }} />

                {barcodeBars.map((bar, idx) => (
                  <div
                    key={idx}
                    className={bar.isGap ? 'bc-bar bc-gap' : 'bc-bar'}
                    style={{
                      width: `${bar.width * 3}px`,
                      background: bar.isGap ? 'transparent' : '#111',
                    }}
                  />
                ))}

                <div className="bc-bar" style={{ width: 4, background: '#111' }} />
                <div className="bc-bar bc-gap" style={{ width: 3 }} />
                <div className="bc-bar" style={{ width: 4, background: '#111' }} />
              </div>
            </div>
            <p className="bc-barcode-text">{orderNumber}</p>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="bc-actions">
          <button
            id="download-ticket-btn"
            className="bc-btn-download btn-primary"
            onClick={handleDownload}
          >
            <Download size={18} />
            Download / Print e-Ticket
          </button>

          <div className="bc-actions-row">
            <a
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="bc-btn-secondary"
              id="add-to-calendar-btn"
            >
              <Calendar size={16} />
              Add to Calendar
            </a>

            <Link to="/" id="return-home-link" className="bc-btn-secondary">
              <Home size={16} />
              Browse More Movies
            </Link>
          </div>
        </div>

        {/* ── Footer Note ── */}
        <p className="bc-note">
          Keep this e-ticket on your phone. A digital copy has also been sent to your email.
        </p>
      </div>
    </div>
  );
};

export default BookingConfirmation;
