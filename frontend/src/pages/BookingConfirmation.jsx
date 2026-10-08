import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { LoadingSpinner, ErrorMessage } from '../components/common/UIStates';
import { CheckCircle, Download, Home } from 'lucide-react';
import './BookingConfirmation.css';

const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const res = await bookingService.getBookingById(bookingId);
      if (res?.success) {
        setBooking(res.data);
      } else {
        throw new Error('Failed to load booking');
      }
    } catch (err) {
      setError(err.message || 'Error fetching booking details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="container" style={{ padding: '64px 0' }}><ErrorMessage message={error} /></div>;
  if (!booking) return <div className="container" style={{ padding: '64px 0' }}><ErrorMessage message="Booking not found" /></div>;

  // booking.showId is populated with { movieId, screenId { name, theatreId { name, city } } }
  const show = booking.showId;
  const movie = show?.movieId;
  const screen = show?.screenId;
  const theatre = screen?.theatreId;
  const startTime = show ? new Date(show.startTime) : null;

  return (
    <div className="confirmation-page">
      <div className="confirmation-card glass">
        {/* Success Header */}
        <div className="confirmation-header">
          <div className="success-icon-wrapper">
            <CheckCircle size={56} />
          </div>
          <h1 className="confirmation-title">Booking Confirmed!</h1>
          <p className="confirmation-subtitle">Your tickets have been booked successfully</p>
        </div>

        {/* Digital Ticket */}
        <div className="ticket">
          <div className="ticket-top">
            {movie?.posterUrl && (
              <img src={movie.posterUrl} alt={movie?.title} className="ticket-poster" />
            )}
            <div className="ticket-movie-info">
              <h2 className="ticket-movie-title">{movie?.title || 'Movie'}</h2>
              <p className="ticket-format">{show?.format} • {movie?.language}</p>
            </div>
          </div>

          <div className="ticket-divider">
            <div className="ticket-notch ticket-notch-left"></div>
            <div className="ticket-dashes"></div>
            <div className="ticket-notch ticket-notch-right"></div>
          </div>

          <div className="ticket-details">
            <div className="ticket-detail-grid">
              <div className="ticket-detail">
                <span className="ticket-label">Theatre</span>
                <span className="ticket-value">{theatre?.name || 'N/A'}</span>
              </div>
              <div className="ticket-detail">
                <span className="ticket-label">Screen</span>
                <span className="ticket-value">{screen?.name || 'N/A'}</span>
              </div>
              <div className="ticket-detail">
                <span className="ticket-label">Date</span>
                <span className="ticket-value">
                  {startTime ? startTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                </span>
              </div>
              <div className="ticket-detail">
                <span className="ticket-label">Time</span>
                <span className="ticket-value">
                  {startTime ? startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A'}
                </span>
              </div>
              <div className="ticket-detail">
                <span className="ticket-label">Seats</span>
                <span className="ticket-value ticket-seats">
                  {booking.seats?.map(s => `${s.row}${s.seatNumber}`).join(', ')}
                </span>
              </div>
              <div className="ticket-detail">
                <span className="ticket-label">Tickets</span>
                <span className="ticket-value">{booking.seats?.length}</span>
              </div>
            </div>

            <div className="ticket-booking-info">
              <div className="booking-number">
                <span className="ticket-label">Booking ID</span>
                <span className="booking-id">{booking.bookingNumber}</span>
              </div>
              <div className="booking-amount">
                <span className="ticket-label">Total Amount</span>
                <span className="amount-value">₹{booking.totalAmount}</span>
              </div>
            </div>

            <div className="ticket-status">
              <span className={`status-badge-lg status-${booking.status?.toLowerCase()}`}>
                {booking.status}
              </span>
              <span className={`status-badge-lg status-pay-${booking.paymentStatus?.toLowerCase()}`}>
                Payment: {booking.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="confirmation-actions">
          <Link to="/" className="btn-outline">
            <Home size={18} /> Back to Home
          </Link>
          <Link to="/profile" className="btn-primary">
            <Download size={18} /> My Bookings
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
