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
  Tag,
  Check,
  Sparkles,
  Lock,
  Percent,
} from 'lucide-react';
import './BookingPayment.css';

const PAYMENT_METHODS = [
  {
    id: 'CARD',
    label: 'Credit / Debit Card',
    icon: CreditCard,
    desc: 'Visa, Mastercard, Rupay',
    badge: 'Popular',
    accentColor: '#6366f1',
  },
  {
    id: 'UPI',
    label: 'UPI Instant Pay',
    icon: Smartphone,
    desc: 'GPay, PhonePe, Paytm, BHIM',
    badge: 'Fast & Free',
    accentColor: '#10b981',
  },
  {
    id: 'NET_BANKING',
    label: 'Net Banking',
    icon: Landmark,
    desc: 'All major Indian banks',
    badge: 'Direct',
    accentColor: '#f59e0b',
  },
  {
    id: 'WALLET',
    label: 'Digital Wallet',
    icon: Wallet,
    desc: 'Paytm, Amazon Pay, Mobikwik',
    badge: 'Cashback',
    accentColor: '#06b6d4',
  },
];

const TAX_RATE = 0.10;
const BOOKING_FEE_PER_SEAT = 30;

const POPULAR_BANKS = ['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Bank'];
const POPULAR_UPI_APPS = ['Google Pay', 'PhonePe', 'Paytm UPI', 'BHIM'];

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

  // Promo Code State
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');

  // Interactive Payment Fields State
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState(user?.name || '');
  const [upiId, setUpiId] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState('Google Pay');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [selectedWallet, setSelectedWallet] = useState('Paytm');

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
  const dateStr = startTime.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  const subtotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const bookingFee = selectedSeats.length * BOOKING_FEE_PER_SEAT;
  const discountAmount = appliedPromo ? appliedPromo.discount : 0;
  const total = Math.max(0, subtotal + tax + bookingFee - discountAmount);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isExpired = timeLeft <= 0 && lockExpiresAt;
  const isUrgent = timeLeft <= 60 && timeLeft > 0;
  const timerPercentage = Math.min(100, Math.max(0, (timeLeft / 300) * 100)); // assumes 5 min (300s) default

  // Promo Code Validation
  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError('');
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'CINERED50' || code === 'MOVIE50') {
      setAppliedPromo({ code, discount: 50, label: '₹50 Instant Discount' });
      setPromoCode('');
    } else if (code === 'CINERED10' || code === 'FIRST10') {
      const disc = Math.round(subtotal * 0.1);
      setAppliedPromo({ code, discount: disc, label: `10% Off (-₹${disc})` });
      setPromoCode('');
    } else {
      setPromoError('Invalid promo code. Try "CINERED50"');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError('');
  };

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
      {/* ── Dynamic Ambient Movie Backdrop ── */}
      <div
        className="bp-backdrop"
        style={{
          backgroundImage: movie?.posterUrl ? `url("${movie.posterUrl}")` : undefined,
        }}
      >
        <div className="bp-backdrop-glow" />
        <div className="bp-backdrop-overlay" />
      </div>

      {/* Page Header (Breadcrumb + Back) */}
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
          <span className="bp-breadcrumb-done">1. Select Movie</span>
          <span className="bp-breadcrumb-sep">&rsaquo;</span>
          <span className="bp-breadcrumb-done">2. Choose Seats</span>
          <span className="bp-breadcrumb-sep">&rsaquo;</span>
          <span className="bp-breadcrumb-active">3. Payment &amp; Review</span>
        </div>
      </div>

      <div className="bp-page-title container">
        <div className="bp-title-wrapper">
          <h1 className="bp-title">Checkout &amp; Booking Summary</h1>
          <p className="bp-subtitle">Review your reservation details and complete payment to confirm your seats</p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="bp-layout container">

        {/* ─── LEFT COLUMN: Movie & Show Experience ─── */}
        <div className="bp-left">

          {/* Luxury Movie Card */}
          <div className="bp-movie-card glass">
            <div className="bp-card-glow" />

            <div className="bp-theatre-header">
              <div className="bp-theatre-badge">
                <MapPin size={13} />
                <span>{theatre.name.toUpperCase()}{theatre.city ? ` • ${theatre.city.toUpperCase()}` : ''}</span>
              </div>
              <span className="bp-screen-pill">{screen.name}</span>
            </div>

            <div className="bp-movie-row">
              <div className="bp-poster-wrap">
                {movie?.posterUrl ? (
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="bp-poster"
                  />
                ) : (
                  <div className="bp-poster-fallback">
                    <Film size={32} />
                    <span>CINEMA</span>
                  </div>
                )}
                <div className="bp-poster-shimmer" />
                <span className="bp-cert-badge">UA 16+</span>
              </div>

              <div className="bp-movie-meta">
                <div className="bp-movie-title-row">
                  <h2 className="bp-movie-title">{movie.title}</h2>
                  <div className="bp-format-badge-wrap">
                    <span className="bp-format-pill">{show.format || '2D'}</span>
                    <span className="bp-lang-pill">{show.language || 'English'}</span>
                  </div>
                </div>

                <div className="bp-show-details-grid">
                  <div className="bp-detail-box">
                    <CalendarDays size={16} className="bp-box-icon" />
                    <div>
                      <span className="bp-box-label">SHOW DATE</span>
                      <span className="bp-box-value">{dateStr}</span>
                    </div>
                  </div>

                  <div className="bp-detail-box">
                    <Clock size={16} className="bp-box-icon" />
                    <div>
                      <span className="bp-box-label">SHOWTIME</span>
                      <span className="bp-box-value bp-highlight-time">{timeStr}</span>
                    </div>
                  </div>
                </div>

                {/* Selected Seats Banner */}
                <div className="bp-seats-banner">
                  <div className="bp-seats-header">
                    <div className="bp-seats-info">
                      <Ticket size={15} />
                      <span>{selectedSeats.length} Reserved Seat{selectedSeats.length > 1 ? 's' : ''}</span>
                    </div>
                    <span className="bp-seat-category">PREMIUM EXECUTIVE</span>
                  </div>
                  <div className="bp-seat-chips">
                    {selectedSeats.map(s => (
                      <span key={s.showSeatId || s.seatId} className="bp-seat-chip">
                        <span className="bp-chip-num">{s.row}{s.seatNumber}</span>
                        <span className="bp-chip-price">₹{s.price}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* e-Ticket Instant Delivery Card */}
          <div className="bp-eticket-card glass">
            <div className="bp-eticket-header">
              <div className="bp-eticket-icon-wrap">
                <Mail size={20} />
              </div>
              <div className="bp-eticket-text">
                <div className="bp-eticket-title-row">
                  <h3 className="bp-eticket-title">Instant Digital e-Ticket Delivery</h3>
                  <span className="bp-verified-tag">✓ VERIFIED</span>
                </div>
                <p className="bp-eticket-desc">
                  Your ticket with high-res barcode &amp; entry gate pass will be delivered to:
                </p>
              </div>
            </div>
            <div className="bp-eticket-recipient">
              <Mail size={15} className="bp-recipient-icon" />
              <span className="bp-recipient-email">{user?.email || 'your registered email'}</span>
              <span className="bp-sms-badge">Free SMS Pass Active</span>
            </div>
          </div>

          {/* Reservation Countdown Timer */}
          {lockExpiresAt && (
            <div className={`bp-timer-card ${isUrgent ? 'bp-timer-urgent' : ''} ${isExpired ? 'bp-timer-expired' : ''}`}>
              <div className="bp-timer-content">
                <div className="bp-timer-icon-wrap">
                  <Timer size={20} />
                </div>
                <div className="bp-timer-text">
                  <span className="bp-timer-label">
                    {isExpired ? 'SEAT HOLD EXPIRED' : 'SEATS HELD EXCLUSIVELY FOR YOU'}
                  </span>
                  <span className="bp-timer-countdown">
                    {isExpired ? 'Reservation expired' : `Time Remaining: ${formatTime(timeLeft)}`}
                  </span>
                </div>
              </div>
              {!isExpired && (
                <div className="bp-timer-progress-track">
                  <div
                    className="bp-timer-progress-fill"
                    style={{ width: `${timerPercentage}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── RIGHT COLUMN: Payment Summary & Options ─── */}
        <div className="bp-right">
          <div className="bp-payment-card glass">
            <div className="bp-card-glow" />

            {/* Price Breakdown */}
            <div className="bp-price-section">
              <div className="bp-summary-header">
                <h2 className="bp-payment-title">Payment Breakdown</h2>
                <span className="bp-secure-tag">
                  <Lock size={12} /> 256-Bit SSL
                </span>
              </div>

              <div className="bp-price-rows">
                <div className="bp-price-row">
                  <span className="bp-price-label">
                    Tickets ({selectedSeats.length} &times; ₹{selectedSeats.length > 0 ? Math.round(subtotal / selectedSeats.length) : 0})
                  </span>
                  <span className="bp-price-val">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="bp-price-row">
                  <span className="bp-price-label">GST &amp; Taxes (10%)</span>
                  <span className="bp-price-val">₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="bp-price-row">
                  <span className="bp-price-label">Convenience Fee</span>
                  <span className="bp-price-val">₹{bookingFee.toLocaleString('en-IN')}</span>
                </div>

                {appliedPromo && (
                  <div className="bp-price-row bp-discount-row">
                    <span className="bp-discount-label">
                      <Tag size={13} /> {appliedPromo.code} ({appliedPromo.label})
                    </span>
                    <button type="button" className="bp-remove-promo" onClick={handleRemovePromo}>
                      Remove
                    </button>
                    <span className="bp-discount-val">-₹{appliedPromo.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              {/* Coupon / Promo Code Input */}
              <div className="bp-promo-box">
                {!appliedPromo ? (
                  <form onSubmit={handleApplyPromo} className="bp-promo-form">
                    <div className="bp-promo-input-wrap">
                      <Tag size={15} className="bp-promo-icon" />
                      <input
                        type="text"
                        placeholder="Promo code (try CINERED50)"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="bp-promo-input"
                      />
                    </div>
                    <button type="submit" className="bp-promo-apply-btn">
                      Apply
                    </button>
                  </form>
                ) : (
                  <div className="bp-promo-applied-badge">
                    <Sparkles size={14} className="bp-promo-sparkle" />
                    <span>Coupon applied! You saved ₹{appliedPromo.discount}</span>
                  </div>
                )}
                {promoError && <p className="bp-promo-error">{promoError}</p>}
              </div>

              {/* Total Payable Row */}
              <div className="bp-price-total">
                <div>
                  <span className="bp-total-label">TOTAL PAYABLE</span>
                  <span className="bp-tax-inclusive">Includes all taxes &amp; fees</span>
                </div>
                <div className="bp-total-price-wrap">
                  <span className="bp-total-currency">₹</span>
                  <span className="bp-total-amount">{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bp-method-section">
              <h3 className="bp-method-title">SELECT PAYMENT METHOD</h3>

              <div className="bp-methods">
                {PAYMENT_METHODS.map(method => {
                  const Icon = method.icon;
                  const isActive = selectedMethod === method.id;
                  return (
                    <div key={method.id} className="bp-method-container">
                      <button
                        type="button"
                        id={`payment-method-${method.id.toLowerCase()}`}
                        className={`bp-method-btn ${isActive ? 'bp-method-active' : ''}`}
                        onClick={() => setSelectedMethod(method.id)}
                        style={{
                          '--method-color': method.accentColor,
                        }}
                      >
                        <div
                          className={`bp-method-icon-wrap ${isActive ? 'bp-method-icon-active' : ''}`}
                          style={{
                            background: isActive ? method.accentColor : undefined,
                          }}
                        >
                          <Icon size={20} />
                        </div>

                        <div className="bp-method-text">
                          <div className="bp-method-label-row">
                            <span className="bp-method-label">{method.label}</span>
                            <span className="bp-method-tag">{method.badge}</span>
                          </div>
                          <span className="bp-method-desc">{method.desc}</span>
                        </div>

                        <div className={`bp-method-radio ${isActive ? 'bp-method-radio-active' : ''}`} />
                      </button>

                      {/* Interactive Drawer for each active method */}
                      {isActive && method.id === 'CARD' && (
                        <div className="bp-interactive-drawer">
                          <div className="bp-drawer-row">
                            <input
                              type="text"
                              placeholder="Card Number (4000 1234 5678 9010)"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              className="bp-input"
                              maxLength={19}
                            />
                          </div>
                          <div className="bp-drawer-cols">
                            <input
                              type="text"
                              placeholder="MM / YY"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              className="bp-input"
                              maxLength={5}
                            />
                            <input
                              type="password"
                              placeholder="CVV"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              className="bp-input"
                              maxLength={4}
                            />
                          </div>
                        </div>
                      )}

                      {isActive && method.id === 'UPI' && (
                        <div className="bp-interactive-drawer">
                          <div className="bp-upi-pills">
                            {POPULAR_UPI_APPS.map(app => (
                              <button
                                key={app}
                                type="button"
                                className={`bp-upi-pill ${selectedUpiApp === app ? 'active' : ''}`}
                                onClick={() => setSelectedUpiApp(app)}
                              >
                                {app}
                              </button>
                            ))}
                          </div>
                          <input
                            type="text"
                            placeholder="Enter UPI ID (e.g. yourname@oksbi)"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="bp-input"
                          />
                        </div>
                      )}

                      {isActive && method.id === 'NET_BANKING' && (
                        <div className="bp-interactive-drawer">
                          <span className="bp-drawer-label">Popular Banks:</span>
                          <div className="bp-bank-pills">
                            {POPULAR_BANKS.map(bank => (
                              <button
                                key={bank}
                                type="button"
                                className={`bp-bank-pill ${selectedBank === bank ? 'active' : ''}`}
                                onClick={() => setSelectedBank(bank)}
                              >
                                {bank}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {isActive && method.id === 'WALLET' && (
                        <div className="bp-interactive-drawer">
                          <span className="bp-drawer-label">Select Wallet Provider:</span>
                          <div className="bp-bank-pills">
                            {['Paytm Wallet', 'Amazon Pay', 'PhonePe Wallet'].map(wallet => (
                              <button
                                key={wallet}
                                type="button"
                                className={`bp-bank-pill ${selectedWallet === wallet ? 'active' : ''}`}
                                onClick={() => setSelectedWallet(wallet)}
                              >
                                {wallet}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Error Message */}
            {error && <ErrorMessage message={error} />}

            {/* Primary CTA Payment Button */}
            <button
              id="proceed-payment-btn"
              className="bp-pay-btn"
              onClick={handlePayment}
              disabled={loading || !!isExpired}
            >
              <div className="bp-pay-btn-shine" />
              {loading ? (
                <span className="btn-spinner" />
              ) : (
                <>
                  <ShieldCheck size={20} />
                  <span>Pay ₹{total.toLocaleString('en-IN')} Securely</span>
                </>
              )}
            </button>

            {/* Trust and Compliance Badges */}
            <div className="bp-trust-badges">
              <span className="bp-trust-item">
                <Lock size={12} /> PCI-DSS Compliant
              </span>
              <span className="bp-trust-sep">&bull;</span>
              <span className="bp-trust-item">
                <ShieldCheck size={12} /> Instant Ticket Confirmation
              </span>
            </div>

            <p className="bp-terms">
              By proceeding, you agree to CineRed&apos;s&nbsp;
              <Link to="/" className="bp-terms-link">Terms &amp; Cancellation Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPayment;
