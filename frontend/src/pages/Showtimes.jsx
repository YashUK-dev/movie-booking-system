import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { movieService } from '../services/movieService';
import { showService } from '../services/showService';
import { LoadingSpinner, ErrorMessage } from '../components/common/UIStates';
import { ArrowLeft } from 'lucide-react';
import './Showtimes.css';

const Showtimes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showsLoading, setShowsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const today = new Date();
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  
  const [selectedDate, setSelectedDate] = useState(dates[0]);

  useEffect(() => {
    let ignore = false;
    const fetchMovie = async () => {
      try {
        setLoading(true);
        const res = await movieService.getMovieById(id);
        if (!ignore) {
          if (res?.success) setMovie(res.data);
          else throw new Error('Failed to load movie details');
        }
      } catch (err) {
        if (!ignore) setError(err.message || 'Error fetching movie');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchMovie();
    return () => { ignore = true; };
  }, [id]);

  useEffect(() => {
    let ignore = false;
    const fetchShows = async () => {
      try {
        setShowsLoading(true);
        const res = await showService.getShows({ movieId: id, date: selectedDate });
        if (!ignore) {
          if (res?.success) setShows(res.data);
          else setShows([]);
        }
      } catch {
        if (!ignore) setShows([]);
      } finally {
        if (!ignore) setShowsLoading(false);
      }
    };
    if (movie) fetchShows();
    return () => { ignore = true; };
  }, [selectedDate, movie, id]);

  const handleShowSelect = (showId) => {
    if (!showId) return;
    navigate(`/shows/${showId}/seats`);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="container" style={{ padding: 'var(--spacing-16) 0' }}><ErrorMessage message={error} /></div>;
  if (!movie) return <div className="container" style={{ padding: 'var(--spacing-16) 0' }}><ErrorMessage message="Movie not found" /></div>;

  const groupedShows = {};
  shows.forEach(show => {
    const screen = show.screenId;
    const theatre = screen?.theatreId;
    if (!theatre) return;
    const theatreId = theatre._id;
    if (!groupedShows[theatreId]) {
      groupedShows[theatreId] = { theatre, showList: [] };
    }
    groupedShows[theatreId].showList.push({
      ...show,
      screenName: screen.name
    });
  });

  return (
    <div className="showtimes-page">
      <div className="showtimes-header">
        <div className="container">
          <Link to={`/movies/${id}`} className="back-btn">
            <ArrowLeft size={20} /> Back to movie
          </Link>
          <div className="movie-summary">
            {movie.posterUrl && <img src={movie.posterUrl} alt={movie.title} className="thumbnail" />}
            <h2>{movie.title}</h2>
          </div>
        </div>
      </div>

      <div className="container showtimes-content">
        <h2 className="section-title">Select Date & Time</h2>
        
        <div className="date-selector">
          {dates.map((date, idx) => {
            const d = new Date(date + 'T00:00:00'); // parse correctly in local time
            const isSelected = date === selectedDate;
            const dayName = idx === 0 ? 'Today' : idx === 1 ? 'Tmw' : d.toLocaleDateString('en-US', { weekday: 'short' });
            
            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`date-btn ${isSelected ? 'date-btn-active' : ''}`}
                aria-label={`Select date ${date}`}
              >
                <span className="date-day">{dayName}</span>
                <span className="date-num">{d.getDate()}</span>
                <span className="date-month">{d.toLocaleDateString('en-US', { month: 'short' })}</span>
              </button>
            );
          })}
        </div>

        {showsLoading ? (
          <LoadingSpinner />
        ) : Object.keys(groupedShows).length === 0 ? (
          <div className="empty-shows glass">
            <p>No shows available for this date. Try selecting another date.</p>
          </div>
        ) : (
          <div className="theatres-list">
            {Object.values(groupedShows).map(({ theatre, showList }) => (
              <div key={theatre._id} className="theatre-card glass">
                <div className="theatre-header">
                  <div>
                    <h3 className="theatre-name">{theatre.name}</h3>
                    <p className="theatre-city">{theatre.city}</p>
                  </div>
                </div>
                
                <div className="showtimes-list">
                  {showList.map(show => {
                    const startTime = new Date(show.startTime);
                    const timeStr = startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                    
                    return (
                      <button
                        key={show._id}
                        onClick={() => handleShowSelect(show._id)}
                        className="showtime-btn"
                        aria-label={`Book ${timeStr} at ${theatre.name}`}
                      >
                        <span className="showtime-time">{timeStr}</span>
                        <span className="showtime-meta">{show.format || 'Standard'} • {show.screenName}</span>
                        <span className="showtime-price">₹{show.basePrice}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Showtimes;
