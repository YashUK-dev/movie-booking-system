import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { movieService } from '../services/movieService';
import { showService } from '../services/showService';
import { LoadingSpinner, ErrorMessage } from '../components/common/UIStates';
import { Star, Clock, Calendar, Globe, Film } from 'lucide-react';
import './MovieDetails.css';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showsLoading, setShowsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Generate next 7 days for date selection
  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });
  
  const [selectedDate, setSelectedDate] = useState(dates[0]);

  useEffect(() => {
    fetchMovie();
  }, [id]);

  useEffect(() => {
    if (movie) {
      fetchShows();
    }
  }, [selectedDate, movie]);

  const fetchMovie = async () => {
    try {
      setLoading(true);
      const res = await movieService.getMovieById(id);
      if (res?.success) {
        setMovie(res.data);
      } else {
        throw new Error('Failed to load movie details');
      }
    } catch (err) {
      setError(err.message || 'Error fetching movie');
    } finally {
      setLoading(false);
    }
  };

  const fetchShows = async () => {
    try {
      setShowsLoading(true);
      // GET /shows?movieId=X&date=Y
      const res = await showService.getShows({ movieId: id, date: selectedDate });
      if (res?.success) {
        setShows(res.data);
      }
    } catch (err) {
      // Non-fatal: just show empty shows
      setShows([]);
    } finally {
      setShowsLoading(false);
    }
  };

  const handleShowSelect = (showId) => {
    navigate(`/shows/${showId}/seats`);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="container" style={{ padding: 'var(--spacing-16) 0' }}><ErrorMessage message={error} /></div>;
  if (!movie) return <div className="container" style={{ padding: 'var(--spacing-16) 0' }}><ErrorMessage message="Movie not found" /></div>;

  // Group shows by screen -> theatre (shows are populated with screenId.theatreId)
  const groupedShows = {};
  shows.forEach(show => {
    // show has screenId populated with { name, theatreId: { name, city } }
    const screen = show.screenId;
    const theatre = screen?.theatreId;
    if (!theatre) return;
    const theatreId = theatre._id;
    if (!groupedShows[theatreId]) {
      groupedShows[theatreId] = {
        theatre,
        showList: []
      };
    }
    groupedShows[theatreId].showList.push({
      ...show,
      screenName: screen.name
    });
  });

  return (
    <div className="movie-details-page">
      {/* Cinematic Hero Section */}
      <div className="movie-hero">
        <div className="movie-hero-backdrop">
          <img 
            src={movie.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070'} 
            alt="backdrop" 
          />
          <div className="hero-gradient"></div>
        </div>
        
        <div className="container movie-hero-content">
          <div className="poster-wrapper">
            <img 
              src={movie.posterUrl || 'https://via.placeholder.com/300x450/1a1a1a/666?text=No+Poster'} 
              alt={movie.title} 
            />
          </div>
          
          <div className="movie-info">
            <div className="movie-badges">
              {movie.certificate && <span className="badge badge-accent">{movie.certificate}</span>}
              {movie.rating > 0 && (
                <span className="rating-badge">
                  <Star size={16} fill="currentColor" /> {movie.rating.toFixed(1)}
                </span>
              )}
              {movie.status && <span className="status-badge">{movie.status.replace('_', ' ')}</span>}
            </div>
            
            <h1 className="movie-detail-title">{movie.title}</h1>
            
            <p className="movie-description">{movie.description}</p>
            
            <div className="movie-meta-grid">
              <div className="meta-card glass">
                <Film size={20} className="meta-icon" />
                <div className="meta-label">Genre</div>
                <div className="meta-value">{movie.genres?.join(', ')}</div>
              </div>
              <div className="meta-card glass">
                <Globe size={20} className="meta-icon" />
                <div className="meta-label">Language</div>
                <div className="meta-value">{movie.language}</div>
              </div>
              <div className="meta-card glass">
                <Clock size={20} className="meta-icon" />
                <div className="meta-label">Duration</div>
                <div className="meta-value">{movie.duration} min</div>
              </div>
              <div className="meta-card glass">
                <Calendar size={20} className="meta-icon" />
                <div className="meta-label">Release</div>
                <div className="meta-value">{new Date(movie.releaseDate).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Showtimes Section */}
      <div className="container showtimes-section">
        <h2 className="section-title">Book Tickets</h2>
        
        {/* Date Selector */}
        <div className="date-selector">
          {dates.map((date, idx) => {
            const d = new Date(date);
            const isSelected = date === selectedDate;
            const dayName = idx === 0 ? 'Today' : idx === 1 ? 'Tmw' : d.toLocaleDateString('en-US', { weekday: 'short' });
            
            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`date-btn ${isSelected ? 'date-btn-active' : ''}`}
              >
                <span className="date-day">{dayName}</span>
                <span className="date-num">{d.getDate()}</span>
                <span className="date-month">{d.toLocaleDateString('en-US', { month: 'short' })}</span>
              </button>
            );
          })}
        </div>

        {/* Theatres and Shows */}
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
                      >
                        <span className="showtime-time">{timeStr}</span>
                        <span className="showtime-meta">{show.format} • {show.screenName}</span>
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

export default MovieDetails;
