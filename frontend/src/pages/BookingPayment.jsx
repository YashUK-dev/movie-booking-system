import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/bookingService';
import { paymentService } from '../services/paymentService';
import { LoadingSpinner, ErrorMessage } from '../components/common/UIStates';
import { CreditCard, Smartphone, Landmark, Wallet, Clock } from 'lucide-react';
import './BookingPayment.css';

const PAYMENT_METHODS = [
  { id: 'CARD', label: 'Credit / Debit Card', icon: CreditCard },
  { id: 'UPI', label: 'UPI Payment', icon: Smartphone },
  { id: 'NET_BANKING', label: 'Net Banking', icon: Landmark },
  { id: 'WALLET', label: 'Wallet', icon: Wallet },
];

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

  // Redirect if no state
  useEffect(() => {
    if (!showDetails || !selectedSeats || !user) {
      navigate('/');
    }
  }, [showDetails, selectedSeats, user]);

  // Countdown timer for seat lock expiry
  useEffect(() => {
    if (!lockExpiresAt) return;
    
    const updateTimer = () => {
      const diff = Math.max(0, Math.floor((new Date(lockExpiresAt) - Date.now()) / 1000));
      setTimeLeft(diff);
      if (diff <= 0) {
        setError('Seat lock has expired. Please go back and select seats again.');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lockExpiresAt]);

  if (!showDetails || !selectedSeats) return <LoadingSpinner />;

  const { show, movie, theatre, screen } = showDetails;
  const startTime = new Date(show.startTime);
  const timeStr = startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = startTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const subtotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  // Convenience fee is calculated by backend, estimate it here for display
  const convenienceFeeEstimate = selectedSeats.length * 30;
  const totalEstimate = subtotal + convenienceFeeEstimate;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handlePayment = async () => {
    if (timeLeft <= 0) {
      setError('Seat lock expired. Please go back and try again.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Create booking
      const seatIds = selectedSeats.map(s => s.seatId);
      const bookingRes = await bookingService.createBooking(showId, seatIds);
      
      if (!bookingRes?.success) {
        throw new Error(bookingRes?.message || 'Failed to create booking');
      }

      const booking = bookingRes.data;

      // 2. Process payment (mockSuccess = true for demo)
      const paymentRes = await paymentService.processPayment(booking._id, selectedMethod, true);
      
      if (!paymentRes?.success) {
        throw new Error(paymentRes?.message || 'Payment failed');
      }

      // 3. Navigate to confirmation
      navigate(`/booking/${booking._id}/confirmation`, { replace: true });

    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-page container">
      <div className="payment-layout">
        {/* Booking Summary */}
        <div className="summary-card glass">
          <h2 className="summary-title">Booking Summary</h2>
          
          <div className="summary-movie">
            <img 
              src={movie.posterUrl || 'https://via.placeholder.com/80x120/1a1a1a/666'} 
              alt={movie.title} 
              className="summary-poster"
            />
            <div>
              <h3 className="summary-movie-title">{movie.title}</h3>
              <p className="summary-meta">{show.format} • {show.language}</p>
            </div>
          </div>

          <div className="summary-details">
            <div className="summary-row">
              <span className="summary-label">Theatre</span>
              <span className="summary-value">{theatre.name}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Screen</span>
              <span className="summary-value">{screen.name}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Date</span>
              <span className="summary-value">{dateStr}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Time</span>
              <span className="summary-value">{timeStr}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Seats</span>
              <span className="summary-value summary-seats">
                {selectedSeats.map(s => `${s.row}${s.seatNumber}`).join(', ')}
              </span>
            </div>
          </div>

          <div className="summary-pricing">
            <div className="price-row">
              <span>Subtotal ({selectedSeats.length} ticket{selectedSeats.length > 1 ? 's' : ''})</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="price-row">
              <span>Convenience Fee</span>
              <span>₹{convenienceFeeEstimate}</span>
            </div>
            <div className="price-row price-total">
              <span>Total</span>
              <span>₹{totalEstimate}</span>
            </div>
          </div>

          {lockExpiresAt && (
            <div className={`lock-timer ${timeLeft < 60 ? 'timer-urgent' : ''}`}>
              <Clock size={16} />
              <span>Seats reserved for {formatTime(timeLeft)}</span>
            </div>
          )}
        </div>

        {/* Payment Section */}
        <div className="payment-card glass">
          <h2 className="payment-title">Payment Method</h2>

          {error && <ErrorMessage message={error} />}

          <div className="payment-methods">
            {PAYMENT_METHODS.map(method => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  className={`method-btn ${selectedMethod === method.id ? 'method-active' : ''}`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <Icon size={22} />
                  <span>{method.label}</span>
                </button>
              );
            })}
          </div>

          <button
            className="btn-primary pay-btn"
            onClick={handlePayment}
            disabled={loading || timeLeft <= 0}
          >
            {loading ? (
              <span className="btn-spinner"></span>
            ) : (
              `Pay ₹${totalEstimate}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingPayment;
