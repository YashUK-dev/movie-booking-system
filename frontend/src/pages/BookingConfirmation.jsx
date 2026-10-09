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

/* ── Confetti Particle Component ── */
const Confetti = () => {
  const COLOURS = ['#dc2626', '#ef4444', '#eab308', '#16a34a', '#3b82f6', '#a855f7', '#f97316'];
  const particles = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    color: COLOURS[i % COLOURS.length],
    left: `${(i / 36) * 100}%`,
    delay: `${(i * 0.08).toFixed(2)}s`,
    duration: `${0.8 + Math.random() * 0.8}s`,
    size: 6 + (i % 4) * 3,
    shape: i % 3,          // 0=rect, 1=circle, 2=strip
  }));

  return (
    <div className="bc-confetti" aria-hidden="true">
      {particles.map(p => (
        <div
          key={p.id}
          className={`bc-particle bc-shape-${p.shape}`}
          style={{
            left: p.left,
            backgroundColor: p.color,
            animationDuration: p.duration,
            animationDelay: p.delay,
            width: p.shape === 2 ? `${p.size * 2}px` : `${p.size}px`,
            height: `${p.size}px`,
          }}
        />
      ))}
    </div>
  );
};

const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const ticketRef = useRef(null);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const res = await bookingService.getBookingById(bookingId);
      if (res?.success) {
        setBooking(res.data);
        // Trigger confetti after data loads
        setTimeout(() => setShowConfetti(true), 200);
        setTimeout(() => setShowConfetti(false), 4500);
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

  const show     = booking.showId;
  const movie    = show?.movieId;
  const screen   = show?.screenId;
  const theatre  = screen?.theatreId;
  const startTime = show ? new Date(show.startTime) : null;

  const dateStr = startTime
    ? startTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'N/A';
  const timeStr = startTime
    ? startTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    : 'N/A';
  const seatList = booking.seats?.map(s => `${s.row}${s.seatNumber}`).join(', ') || 'N/A';

  const barcodeBars = generateBarcode(booking.bookingNumber);

  return (
    <div className="bc-page">
      {showConfetti && <Confetti />}

      <div className="bc-wrapper">

        {/* ── Success Header ── */}
        <div className="bc-header">
          <div className="bc-success-ring">
            <div className="bc-success-ring-inner">
              <CheckCircle className="bc-check-icon" size={48} />
            </div>
          </div>
          <h1 className="bc-title">Booking Confirmed!</h1>
          <p className="bc-subtitle">
            Your ticket has been sent to your registered email address.
          </p>
        </div>

        {/* ── THE TICKET ── */}
        <div className="bc-ticket" ref={ticketRef} id="printable-ticket">

          {/* Ticket Top — movie info */}
          <div className="bc-ticket-top">
            {/* Decorative background film strip */}
            <div className="bc-filmstrip" aria-hidden="true">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bc-filmhole" />
              ))}
            </div>

            <div className="bc-ticket-top-content">
              {movie?.posterUrl && (
                <div className="bc-ticket-poster-wrap">
                  <img
                    src={movie.posterUrl}
                    alt={movie?.title}
                    className="bc-ticket-poster"
                  />
                  <div className="bc-poster-overlay" />
                </div>
              )}

              <div className="bc-ticket-movie-info">
                <div className="bc-eticket-label">
                  <Ticket size={12} />
                  <span>E-TICKET</span>
                </div>
                <h2 className="bc-ticket-movie-title">
                  {movie?.title || 'Movie'}
                </h2>
                {(show?.format || movie?.language) && (
                  <p className="bc-ticket-format">
                    <Film size={12} />
                    {[show?.format, movie?.language].filter(Boolean).join(' • ')}
                  </p>
                )}
                <p className="bc-ticket-theatre">
                  <MapPin size={12} />
                  {theatre?.name || 'Theatre'}{theatre?.city ? `, ${theatre.city}` : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Ticket Tear Divider */}
          <div className="bc-divider">
            <div className="bc-notch bc-notch-left" />
            <div className="bc-dashes" />
            <div className="bc-notch bc-notch-right" />
          </div>

          {/* Ticket Details Grid */}
          <div className="bc-ticket-details">
            <div className="bc-details-grid">
              <div className="bc-detail-cell">
                <span className="bc-detail-label">
                  <Calendar size={11} /> DATE
                </span>
                <span className="bc-detail-value">{dateStr}</span>
              </div>
              <div className="bc-detail-cell">
                <span className="bc-detail-label">
                  <Clock size={11} /> TIME
                </span>
                <span className="bc-detail-value">{timeStr}</span>
              </div>
              <div className="bc-detail-cell">
                <span className="bc-detail-label">
                  <Ticket size={11} /> SEATS
                </span>
                <span className="bc-detail-value bc-detail-seats">{seatList}</span>
              </div>
              <div className="bc-detail-cell">
                <span className="bc-detail-label">
                  <Hash size={11} /> ORDER ID
                </span>
                <span className="bc-detail-value bc-booking-id">
                  {booking.bookingNumber || bookingId?.slice(0, 8).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Amount row */}
            <div className="bc-amount-row">
              <div>
                <span className="bc-detail-label"><MapPin size={11} /> SCREEN</span>
                <span className="bc-detail-value">{screen?.name || 'N/A'}</span>
              </div>
              <div className="bc-amount-right">
                <span className="bc-detail-label">TOTAL PAID</span>
                <span className="bc-amount">₹{booking.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Status Badges */}
            <div className="bc-status-row">
              <span className={`bc-badge bc-badge-${booking.status?.toLowerCase()}`}>
                {booking.status}
              </span>
              <span className={`bc-badge bc-badge-pay-${booking.paymentStatus?.toLowerCase()}`}>
                Payment: {booking.paymentStatus}
              </span>
            </div>
          </div>

          {/* Ticket Tear Divider 2 */}
          <div className="bc-divider">
            <div className="bc-notch bc-notch-left" />
            <div className="bc-dashes" />
            <div className="bc-notch bc-notch-right" />
          </div>

          {/* Barcode Section */}
          <div className="bc-barcode-section">
            <p className="bc-scan-text">Scan at the entrance</p>
            <div className="bc-barcode" aria-label={`Barcode for ${booking.bookingNumber}`}>
              {/* Guard bars */}
              <div className="bc-bar" style={{ width: 3, background: '#000' }} />
              <div className="bc-bar bc-gap" style={{ width: 2 }} />
              <div className="bc-bar" style={{ width: 3, background: '#000' }} />

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

              {/* Guard bars */}
              <div className="bc-bar" style={{ width: 3, background: '#000' }} />
              <div className="bc-bar bc-gap" style={{ width: 2 }} />
              <div className="bc-bar" style={{ width: 3, background: '#000' }} />
            </div>
            <p className="bc-barcode-text">
              {booking.bookingNumber || bookingId?.slice(0, 12).toUpperCase()}
            </p>
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
            Download Ticket
          </button>
          <Link to="/" id="return-home-link" className="bc-btn-home">
            <Home size={18} />
            Return to Home
          </Link>
        </div>

        {/* ── Footer Note ── */}
        <p className="bc-note">
          Keep this ticket handy. A copy has been sent to your email.
        </p>
      </div>
    </div>
  );
};

export default BookingConfirmation;
