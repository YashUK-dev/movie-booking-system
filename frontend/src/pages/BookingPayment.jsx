import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/bookingService';
import { paymentService } from '../services/paymentService';
import { LoadingSpinner, ErrorMessage } from '../components/common/UIStates';
import {
  CreditCard,
  Smartphone,
  Landmark,
  Wallet,
  Clock,
  ChevronLeft,
  MapPin,
  CalendarDays,
  Timer,
  Ticket,
  Mail,
  ShieldCheck,
  Film,
} from 'lucide-react';
import './BookingPayment.css';

const PAYMENT_METHODS = [
  { id: 'CARD', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, Rupay' },
  { id: 'UPI', label: 'UPI Payment', icon: Smartphone, desc: 'GPay, PhonePe, Paytm' },
  { id: 'NET_BANKING', label: 'Net Banking', icon: Landmark, desc: 'All major banks' },
  { id: 'WALLET', label: 'Wallet', icon: Wallet, desc: 'Paytm, Amazon Pay' },
];

const TAX_RATE = 0.10;
const BOOKING_FEE_PER_SEAT = 30;

const BookingPayment = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const { showDetails, selectedSeats, lockExpiresAt } = location.state || {};

  const [selectedMethod, setSelectedMethod] = useState('CARD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // Redirect if no state passed from SeatSelection
  useEffect(() => {
    if (!showDetails || !selectedSeats || !user) {
      navigate('/');
    }
  }, [showDetails, selectedSeats, user, navigate]);

  // Countdown timer for seat lock expiry
  useEffect(() => {
    if (!lockExpiresAt) return;

    const updateTimer = () => {
      const diff = Math.max(0, Math.floor((new Date(lockExpiresAt) - Date.now()) / 1000));
      setTimeLeft(diff);
      if (diff <= 0) {
        setError('Your seat reservation has expired. Please go back and select seats again.');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lockExpiresAt]);

  if (!showDetails || !selectedSeats) return <LoadingSpinner />;

  const { show, movie, theatre, screen } = showDetails;
  const startTime = new Date(show.startTime);
  const timeStr = startTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = startTime.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const subtotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const bookingFee = selectedSeats.length * BOOKING_FEE_PER_SEAT;
  const total = subtotal + tax + bookingFee;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isExpired = timeLeft <= 0 && lockExpiresAt;
  const isUrgent = timeLeft <= 60 && timeLeft > 0;

  const handlePayment = async () => {
    if (isExpired) {
      setError('Seat reservation expired. Please go back and select seats again.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Step 1: Create booking
      const seatIds = selectedSeats.map(s => s.seatId);
      const bookingRes = await bookingService.createBooking(showId, seatIds);

      if (!bookingRes?.success) {
        throw new Error(bookingRes?.message || 'Failed to create booking. Please try again.');
      }

      const booking = bookingRes.data;

      // Step 2: Process payment (mockSuccess = true for demo)
      const paymentRes = await paymentService.processPayment(booking._id, selectedMethod, true);

      if (!paymentRes?.success) {
        throw new Error(paymentRes?.message || 'Payment failed. Please try a different method.');
      }

      // Step 3: Navigate to confirmation
      navigate(`/booking/${booking._id}/confirmation`, { replace: true });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bp-page">
      {/* Page Header */}
      <div className="bp-page-header container">
        <button
          onClick={() => navigate(-1)}
          className="bp-back-btn"
          id="back-to-seats-btn"
        >
          <ChevronLeft size={18} />
          Back to Seats
        </button>
        <div className="bp-breadcrumb">
          <span className="bp-breadcrumb-done">Select Movie</span>
          <span className="bp-breadcrumb-sep">›</span>
          <span className="bp-breadcrumb-done">Choose Seats</span>
          <span className="bp-breadcrumb-sep">›</span>
          <span className="bp-breadcrumb-active">Payment</span>
        </div>
      </div>

      <div className="bp-page-title container">
        <h1 className="bp-title">Booking Summary</h1>
        <div className="bp-title-divider" />
      </div>

      {/* Main Layout */}
      <div className="bp-layout container">

        {/* ─── LEFT: Booking Info ─── */}
        <div className="bp-left">

          {/* Movie Card */}
          <div className="bp-movie-card glass">
            <div className="bp-theatre-badge">
              <MapPin size={12} />
              <span>{theatre.name.toUpperCase()}</span>
            </div>

            <div className="bp-movie-row">
              <div className="bp-poster-wrap">
                <img
                  src={movie.posterUrl || 'https://via.placeholder.com/100x150/141414/404040?text=No+Poster'}
                  alt={movie.title}
                  className="bp-poster"
                />
                <div className="bp-poster-shimmer" />
              </div>

              <div className="bp-movie-meta">
                <h2 className="bp-movie-title">{movie.title}</h2>
                <p className="bp-movie-format">
                  <Film size={13} />
                  {show.format} &bull; {show.language}
                </p>

                <div className="bp-show-details">
                  <div className="bp-detail-item">
                    <CalendarDays size={14} className="bp-detail-icon" />
                    <div>
                      <span className="bp-detail-label">DATE &amp; TIME</span>
                      <span className="bp-detail-value">
                        {startTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        &nbsp;&mdash;&nbsp;{timeStr}
                      </span>
                    </div>
                  </div>
                  <div className="bp-detail-item">
                    <MapPin size={14} className="bp-detail-icon" />
                    <div>
                      <span className="bp-detail-label">SCREEN</span>
                      <span className="bp-detail-value">{screen.name}</span>
                    </div>
                  </div>
                </div>

                <div className="bp-tickets-row">
                  <div className="bp-tickets-info">
                    <Ticket size={14} />
                    <span>{selectedSeats.length} Ticket{selectedSeats.length > 1 ? 's' : ''}</span>
                  </div>
                  <div className="bp-seat-chips">
                    {selectedSeats.map(s => (
                      <span key={s.showSeatId || s.seatId} className="bp-seat-chip">
                        {s.row}{s.seatNumber}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* e-Ticket Delivery */}
          <div className="bp-eticket-card glass">
            <div className="bp-eticket-header">
              <Mail size={18} className="bp-eticket-icon" />
              <div>
                <h3 className="bp-eticket-title">e-Ticket Delivery</h3>
                <p className="bp-eticket-desc">
                  Your ticket will be sent to your registered email address upon successful payment.
                </p>
              </div>
            </div>
            <div className="bp-eticket-email">
              <Mail size={14} />
              <span>{user?.email || 'your registered email'}</span>
            </div>
          </div>

          {/* Timer */}
          {lockExpiresAt && (
            <div className={`bp-timer ${isUrgent ? 'bp-timer-urgent' : ''} ${isExpired ? 'bp-timer-expired' : ''}`}>
              <Timer size={16} />
              <span>
                {isExpired
                  ? 'Reservation expired'
                  : `Seats reserved for ${formatTime(timeLeft)}`}
              </span>
            </div>
          )}
        </div>

        {/* ─── RIGHT: Payment Summary ─── */}
        <div className="bp-right">
          <div className="bp-payment-card glass">

            {/* Price Breakdown */}
            <div className="bp-price-section">
              <h2 className="bp-payment-title">Payment Summary</h2>
              <div className="bp-price-rows">
                <div className="bp-price-row">
                  <span>Tickets ({selectedSeats.length} &times; ₹{selectedSeats.length > 0 ? Math.round(subtotal / selectedSeats.length) : 0})</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="bp-price-row">
                  <span>Taxes (10%)</span>
                  <span>₹{tax}</span>
                </div>
                <div className="bp-price-row">
                  <span>Booking Fee</span>
                  <span>₹{bookingFee}</span>
                </div>
              </div>
              <div className="bp-price-total">
                <span className="bp-total-label">TOTAL PAYABLE</span>
                <span className="bp-total-amount">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bp-method-section">
              <h3 className="bp-method-title">Payment Method</h3>
              <div className="bp-methods">
                {PAYMENT_METHODS.map(method => {
                  const Icon = method.icon;
                  const isActive = selectedMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      id={`payment-method-${method.id.toLowerCase()}`}
                      className={`bp-method-btn ${isActive ? 'bp-method-active' : ''}`}
                      onClick={() => setSelectedMethod(method.id)}
                    >
                      <div className={`bp-method-icon-wrap ${isActive ? 'bp-method-icon-active' : ''}`}>
                        <Icon size={20} />
                      </div>
                      <div className="bp-method-text">
                        <span className="bp-method-label">{method.label}</span>
                        <span className="bp-method-desc">{method.desc}</span>
                      </div>
                      <div className={`bp-method-radio ${isActive ? 'bp-method-radio-active' : ''}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error */}
            {error && <ErrorMessage message={error} />}

            {/* CTA */}
            <button
              id="proceed-payment-btn"
              className="bp-pay-btn btn-primary"
              onClick={handlePayment}
              disabled={loading || !!isExpired}
            >
              {loading ? (
                <span className="btn-spinner" />
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Pay ₹{total.toLocaleString('en-IN')}
                </>
              )}
            </button>
            <p className="bp-terms">
              By proceeding, you agree to our&nbsp;
              <Link to="/" className="bp-terms-link">Terms &amp; Conditions</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPayment;
