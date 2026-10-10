import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { movieService } from '../services/movieService';
import { LoadingSpinner, ErrorMessage } from '../components/common/UIStates';
import { Star, Clock, Calendar, Globe, Film, Play, X } from 'lucide-react';
import './MovieDetails.css';

const extractYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [movie, setMovie] = useState(null);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    let ignore = false;
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        const res = await movieService.getMovieById(id);
        if (!ignore) {
          if (res?.success) {
            setMovie(res.data);
            // Fetch related movies by finding any movie with overlapping genres
            if (res.data.genres?.length > 0) {
              const allMoviesRes = await movieService.getMovies({ limit: 20 });
              if (allMoviesRes?.success) {
                const related = allMoviesRes.data
                  .filter(m => m._id !== res.data._id && m.genres?.some(g => res.data.genres.includes(g)))
                  .slice(0, 4);
                setRelatedMovies(related);
              }
            }
          } else {
            throw new Error('Failed to load movie details');
          }
        }
      } catch (err) {
        if (!ignore) setError(err.message || 'Error fetching movie');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchMovieData();
    // Close modal if open on movie change
    setShowTrailerModal(false);
    return () => { ignore = true; };
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="container" style={{ padding: 'var(--spacing-16) 0' }}><ErrorMessage message={error} /></div>;
  if (!movie) return <div className="container" style={{ padding: 'var(--spacing-16) 0' }}><ErrorMessage message="Movie not found" /></div>;

  const trailerId = extractYouTubeId(movie.trailerUrl);

  return (
    <div className="movie-details-page">
      {/* Cinematic Hero Section */}
      <div className="movie-hero">
        <div className="movie-hero-backdrop">
          {trailerId && !prefersReducedMotion ? (
            <div className="video-background-wrapper">
              <iframe
                className="hero-background-video"
                src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerId}&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3`}
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title="Trailer Background"
              ></iframe>
            </div>
          ) : (
            <img 
              src={movie.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070'} 
              alt="backdrop" 
            />
          )}
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
            
            <p className="movie-description line-clamp-4">{movie.description}</p>
            
            <div className="hero-actions">
              <button 
                className="btn btn-primary book-now-btn"
                onClick={() => navigate(`/movies/${movie._id}/shows`)}
              >
                Book Now
              </button>
              {trailerId && (
                <button 
                  className="btn btn-outline watch-trailer-btn"
                  onClick={() => setShowTrailerModal(true)}
                >
                  <Play size={18} fill="currentColor" /> Watch Trailer
                </button>
              )}
            </div>
            
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

      {/* Main Content Areas */}
      <div className="container movie-content-sections">
        
        {/* Cast & Crew - API limitation */}
        <section className="detail-section">
          <h2 className="section-title">Cast & Crew</h2>
          <div className="empty-state glass">
            <p>Cast & crew information is currently unavailable for this movie.</p>
          </div>
        </section>
        
        {/* Reviews - API limitation */}
        <section className="detail-section">
          <h2 className="section-title">Reviews</h2>
          <div className="empty-state glass">
            <p>Reviews are temporarily unavailable.</p>
          </div>
          
          <div className="write-review-section glass">
            <h3>Write a Review</h3>
            <form className="review-form">
              <textarea 
                placeholder="Share your thoughts about the movie..." 
                disabled 
                rows="4"
              ></textarea>
              <button type="button" className="btn btn-primary" disabled>
                Submit Review
              </button>
              <p className="form-help-text">Review submissions are currently disabled.</p>
            </form>
          </div>
        </section>
        
        {/* Related Movies */}
        {relatedMovies.length > 0 && (
          <section className="detail-section">
            <h2 className="section-title">Related Movies</h2>
            <div className="related-movies-grid">
              {relatedMovies.map(rm => (
                <Link to={`/movies/${rm._id}`} key={rm._id} className="related-movie-card">
                  <div className="related-poster-wrapper">
                    <img src={rm.posterUrl} alt={rm.title} />
                  </div>
                  <h3 className="related-movie-title">{rm.title}</h3>
                  <p className="related-movie-genre">{rm.genres?.[0]}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Trailer Modal */}
      {showTrailerModal && trailerId && (
        <div className="trailer-modal-overlay" onClick={() => setShowTrailerModal(false)}>
          <div className="trailer-modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setShowTrailerModal(false)}>
              <X size={24} />
            </button>
            <div className="video-responsive">
              <iframe
                src={`https://www.youtube.com/embed/${trailerId}?autoplay=1`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Movie Trailer"
              ></iframe>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default MovieDetails;
