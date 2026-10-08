import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/bookingService';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../components/common/UIStates';
import { 
  User, Mail, Phone, Calendar, Shield, Ticket, 
  Clock, MapPin, AlertTriangle, CheckCircle2, XCircle, ArrowRight
} from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login?redirect=/profile');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await bookingService.getUserBookings();
      if (res?.success) {
        setBookings(res.data || []);
      } else {
        throw new Error('Failed to load bookings');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Error loading bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      setCancellingId(bookingId);
      setActionMessage(null);
      const res = await bookingService.cancelBooking(bookingId);
      if (res?.success) {
        setActionMessage({ type: 'success', text: 'Booking successfully cancelled. Refund processed!' });
        setCancelModalBooking(null);
        await fetchBookings();
      } else {
        throw new Error(res?.message || 'Failed to cancel booking');
      }
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err?.response?.data?.message || err.message || 'Unable to cancel booking'
      });
    } finally {
      setCancellingId(null);
    }
  };

  if (authLoading || (!user && loading)) {
    return <LoadingSpinner text="Loading profile..." />;
  }

  if (!user) {
    return null;
  }

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === 'ALL') return true;
    return b.status === statusFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="badge badge-success"><CheckCircle2 size={13} /> Confirmed</span>;
      case 'PENDING':
        return <span className="badge badge-warning"><Clock size={13} /> Pending</span>;
      case 'CANCELLED':
        return <span className="badge badge-danger"><XCircle size={13} /> Cancelled</span>;
      default:
        return <span className="badge badge-secondary">{status}</span>;
    }
  };

  const canCancel = (booking) => {
    if (booking.status !== 'CONFIRMED') return false;
    if (!booking.showId?.startTime) return false;
    const showTime = new Date(booking.showId.startTime).getTime();
    const now = Date.now();
    // Cancellation allowed if > 2 hours before show
    return (showTime - now) > (2 * 60 * 60 * 1000);
  };

  return (
    <div className="profile-page">
      <div className="container">
        {/* Profile Card Header */}
        <div className="profile-card">
          <div className="profile-header-main">
            <div className="avatar-circle">
              {user.name ? user.name.charAt(0).toUpperCase() : <User size={36} />}
            </div>
            <div className="profile-user-info">
              <div className="profile-name-row">
                <h1 className="profile-name">{user.name}</h1>
                <span className={`role-badge ${user.role === 'ADMIN' ? 'admin' : 'user'}`}>
                  {user.role === 'ADMIN' ? <Shield size={12} /> : null}
                  {user.role}
                </span>
              </div>
              <div className="profile-details-grid">
                <div className="profile-detail-item">
                  <Mail size={16} className="text-secondary" />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="profile-detail-item">
                    <Phone size={16} className="text-secondary" />
                    <span>{user.phone}</span>
                  </div>
                )}
                <div className="profile-detail-item">
                  <Calendar size={16} className="text-secondary" />
                  <span>Member since {new Date(user.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>

          {user.role === 'ADMIN' && (
            <div className="admin-shortcut">
              <div>
                <h4>Admin Access</h4>
                <p>Manage system metrics, movies, theatres and shows</p>
              </div>
              <Link to="/admin" className="btn-admin-cta">
                <Shield size={16} />
                <span>Admin Dashboard</span>
              </Link>
            </div>
          )}
        </div>

        {/* Action feedback */}
        {actionMessage && (
          <div className={`action-alert ${actionMessage.type}`}>
            {actionMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{actionMessage.text}</span>
            <button className="alert-close" onClick={() => setActionMessage(null)}>×</button>
          </div>
        )}

        {/* Bookings Section */}
        <div className="bookings-section">
          <div className="bookings-header">
            <div>
              <h2 className="section-title">My Bookings</h2>
              <p className="section-subtitle">View your ticket history and upcoming movies</p>
            </div>
            
            {/* Filter Tabs */}
            <div className="filter-tabs">
              <button 
                className={`tab-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setStatusFilter('ALL')}
              >
                All ({bookings.length})
              </button>
              <button 
                className={`tab-btn ${statusFilter === 'CONFIRMED' ? 'active' : ''}`}
                onClick={() => setStatusFilter('CONFIRMED')}
              >
                Confirmed ({bookings.filter(b => b.status === 'CONFIRMED').length})
              </button>
              <button 
                className={`tab-btn ${statusFilter === 'CANCELLED' ? 'active' : ''}`}
                onClick={() => setStatusFilter('CANCELLED')}
              >
                Cancelled ({bookings.filter(b => b.status === 'CANCELLED').length})
              </button>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading booking history..." />
          ) : error ? (
            <ErrorMessage message={error} onRetry={fetchBookings} />
          ) : filteredBookings.length === 0 ? (
            <EmptyState 
              icon={Ticket}
              title="No bookings found"
              message={statusFilter === 'ALL' ? "You haven't booked any movie tickets yet. Start exploring now!" : `No ${statusFilter.toLowerCase()} bookings found.`}
              actionText="Explore Movies"
              actionLink="/"
            />
          ) : (
            <div className="bookings-grid">
              {filteredBookings.map((booking) => {
                const movie = booking.showId?.movieId;
                const screen = booking.showId?.screenId;
                const theatre = screen?.theatreId;
                const showTime = booking.showId?.startTime ? new Date(booking.showId.startTime) : null;
                const cancelEligible = canCancel(booking);

                return (
                  <div key={booking._id} className="booking-card">
                    <div className="booking-card-main">
                      {/* Movie poster */}
                      <div className="booking-poster">
                        {movie?.posterUrl ? (
                          <img src={movie.posterUrl} alt={movie.title || 'Movie'} />
                        ) : (
                          <div className="poster-fallback"><Ticket size={32} /></div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="booking-info">
                        <div className="booking-top-row">
                          <h3 className="booking-movie-title">{movie?.title || 'Movie Title'}</h3>
                          {getStatusBadge(booking.status)}
                        </div>

                        <div className="booking-meta-row">
                          <div className="booking-meta-item">
                            <Calendar size={14} />
                            <span>
                              {showTime 
                                ? showTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
                                : 'Date N/A'}
                            </span>
                          </div>
                          <div className="booking-meta-item">
                            <Clock size={14} />
                            <span>
                              {showTime 
                                ? showTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : 'Time N/A'}
                            </span>
                          </div>
                        </div>

                        <div className="booking-venue">
                          <MapPin size={14} className="text-secondary" />
                          <span>
                            {theatre?.name || 'Cinema'}, {screen?.name || 'Screen'} {theatre?.city ? `(${theatre.city})` : ''}
                          </span>
                        </div>

                        <div className="booking-details-box">
                          <div className="detail-item">
                            <span className="detail-label">Booking No</span>
                            <span className="detail-value mono">{booking.bookingNumber}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Seats</span>
                            <span className="detail-value seat-tags">
                              {booking.seats?.map((s, idx) => (
                                <span key={idx} className="seat-tag">{s.row}{s.seatNumber}</span>
                              ))}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Total Paid</span>
                            <span className="detail-value text-accent font-bold">₹{booking.totalAmount}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions footer */}
                    <div className="booking-card-footer">
                      <Link 
                        to={`/booking/${booking._id}/confirmation`} 
                        className="btn-view-ticket"
                      >
                        <Ticket size={16} />
                        <span>View Ticket</span>
                        <ArrowRight size={14} />
                      </Link>

                      {cancelEligible && (
                        <button 
                          className="btn-cancel-booking"
                          onClick={() => setCancelModalBooking(booking)}
                          disabled={cancellingId === booking._id}
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {cancelModalBooking && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <AlertTriangle size={24} className="text-danger" />
              <h3>Cancel Booking?</h3>
            </div>
            <p className="modal-text">
              Are you sure you want to cancel your booking for{' '}
              <strong>{cancelModalBooking.showId?.movieId?.title}</strong> (Booking #{cancelModalBooking.bookingNumber})?
            </p>
            <p className="modal-subtext">
              Your seats will be released immediately and a refund of ₹{cancelModalBooking.totalAmount} will be processed.
            </p>
            <div className="modal-actions">
              <button 
                className="btn-modal-cancel" 
                onClick={() => setCancelModalBooking(null)}
                disabled={Boolean(cancellingId)}
              >
                Keep Booking
              </button>
              <button 
                className="btn-modal-confirm" 
                onClick={() => handleCancelBooking(cancelModalBooking._id)}
                disabled={Boolean(cancellingId)}
              >
                {cancellingId === cancelModalBooking._id ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
