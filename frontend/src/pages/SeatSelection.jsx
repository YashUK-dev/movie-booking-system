import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { showService } from '../services/showService';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner, ErrorMessage } from '../components/common/UIStates';
import './SeatSelection.css';

const SeatSelection = () => {
  const { id: showId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [showDetails, setShowDetails] = useState(null);
  const [seatData, setSeatData] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locking, setLocking] = useState(false);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    fetchData();
    // Poll for seat updates every 30s
    const interval = setInterval(fetchSeatData, 30000);
    return () => clearInterval(interval);
  }, [showId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [detailsRes, seatsRes] = await Promise.all([
        showService.getShowDetails(showId),
        showService.getShowSeats(showId)
      ]);

      if (detailsRes?.success) {
        setShowDetails(detailsRes.data);
      }
      if (seatsRes?.success) {
        setSeatData(seatsRes.data);
      }
    } catch (err) {
      setError(err.message || 'Error loading seat data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSeatData = async () => {
    try {
      const res = await showService.getShowSeats(showId);
      if (res?.success) {
        setSeatData(res.data);
        // Clear any selected seats that are no longer available
        setSelectedSeats(prev =>
          prev.filter(sel => {
            const found = res.data.rows
              .flatMap(r => r.seats)
              .find(s => s.showSeatId === sel.showSeatId);
            return found && found.status === 'AVAILABLE';
          })
        );
      }
    } catch {
      // Silent fail for background refresh
    }
  };

  const toggleSeat = (seat, row) => {
    if (seat.status !== 'AVAILABLE') return;
    
    const isSelected = selectedSeats.some(s => s.showSeatId === seat.showSeatId);
    
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => s.showSeatId !== seat.showSeatId));
      setActionError(null);
    } else {
      if (selectedSeats.length >= 10) {
        setActionError('Maximum 10 seats can be selected.');
        return;
      }
      setSelectedSeats([...selectedSeats, { ...seat, row }]);
      setActionError(null);
    }
  };

  const handleContinue = async () => {
    if (selectedSeats.length === 0) return;
    
    if (!user) {
      navigate('/login', { state: { returnTo: `/shows/${showId}/seats` } });
      return;
    }

    try {
      setLocking(true);
      setActionError(null);
      // Lock seats using physical seatId
      const seatIds = selectedSeats.map(s => s.seatId);
      const res = await showService.lockSeats(showId, seatIds);
      
      if (res?.success) {
        // Navigate to payment page with selected seat info
        navigate(`/booking/${showId}/payment`, {
          state: {
            showDetails,
            selectedSeats,
            lockExpiresAt: res.data.expiresAt
          }
        });
      }
    } catch (err) {
      setActionError(err.message || 'Failed to lock seats. Some seats may have just been taken.');
      fetchSeatData(); // Refresh seats
    } finally {
      setLocking(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="container" style={{ padding: 'var(--spacing-16) 0' }}><ErrorMessage message={error} /></div>;
  if (!showDetails || !seatData) return <div className="container" style={{ padding: 'var(--spacing-16) 0' }}><ErrorMessage message="Show not found" /></div>;

  const { show, movie, theatre, screen } = showDetails;
  const startTime = new Date(show.startTime);
  const timeStr = startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = startTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="seat-page">
      <div className="container">
        {/* Header Info */}
        <div className="seat-header">
          <h1 className="seat-movie-title">{movie.title}</h1>
          <p className="seat-show-info">
            {theatre.name} • {screen.name} • {dateStr} @ {timeStr} • {show.format}
          </p>
        </div>

        {actionError && <ErrorMessage message={actionError} />}

        {/* Screen Indicator */}
        <div className="screen-area">
          <div className="screen-curve"></div>
          <div className="screen-glow"></div>
          <p className="screen-label">ALL EYES THIS WAY</p>
        </div>

        {/* Seat Grid */}
        <div className="seat-grid-wrapper">
          <div className="seat-grid">
            {seatData.rows.map(rowData => (
              <div key={rowData.row} className="seat-row">
                <div className="row-label">{rowData.row}</div>
                <div className="row-seats">
                  {rowData.seats.map(seat => {
                    const isSelected = selectedSeats.some(s => s.showSeatId === seat.showSeatId);
                    let seatClass = 'seat seat-available';
                    
                    if (seat.status === 'BOOKED') seatClass = 'seat seat-booked';
                    else if (seat.status === 'LOCKED') seatClass = 'seat seat-locked';
                    else if (isSelected) seatClass = 'seat seat-selected';

                    return (
                      <button
                        key={seat.showSeatId}
                        disabled={seat.status !== 'AVAILABLE' && !isSelected}
                        onClick={() => toggleSeat(seat, rowData.row)}
                        className={seatClass}
                        title={`${rowData.row}${seat.seatNumber} - ${seat.type} (₹${seat.price})`}
                      >
                        <span className="seat-num">{seat.seatNumber}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="row-label">{rowData.row}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="seat-legend">
          <div className="legend-item">
            <div className="seat-mini seat-available"></div>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <div className="seat-mini seat-selected"></div>
            <span>Selected</span>
          </div>
          <div className="legend-item">
            <div className="seat-mini seat-locked"></div>
            <span>Reserved</span>
          </div>
          <div className="legend-item">
            <div className="seat-mini seat-booked"></div>
            <span>Booked</span>
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      {selectedSeats.length > 0 && (
        <div className="action-bar glass">
          <div className="container action-bar-content">
            <div className="action-info">
              <p className="action-count">
                {selectedSeats.length} Seat{selectedSeats.length > 1 ? 's' : ''} Selected
              </p>
              <p className="action-seats">
                {selectedSeats.map(s => `${s.row}${s.seatNumber}`).join(', ')}
              </p>
              <p className="action-price">₹ {totalPrice}</p>
            </div>
            
            <button 
              onClick={handleContinue}
              disabled={locking}
              className="btn-primary action-btn"
            >
              {locking ? (
                <span className="btn-spinner"></span>
              ) : (
                'Continue'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatSelection;
