import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Globe } from 'lucide-react';
import './MovieCard.css';

const FALLBACK_POSTER = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop';

const MovieCard = ({ movie }) => {
  const [imgSrc, setImgSrc] = useState(movie?.posterUrl || FALLBACK_POSTER);

  if (!movie) return null;

  const handleImageError = () => {
    if (imgSrc !== FALLBACK_POSTER) {
      setImgSrc(FALLBACK_POSTER);
    }
  };

  const statusLabel = 
    movie.status === 'UPCOMING' ? 'Upcoming' :
    movie.status === 'ENDED' ? 'Archived' : null;

  return (
    <article className="movie-card-wrapper">
      <Link
        to={`/movies/${movie._id}`}
        className="movie-card"
        id={`movie-card-${movie._id}`}
        aria-label={`View details and book tickets for ${movie.title}`}
      >
        <div className="movie-poster-container">
          <img
            src={imgSrc}
            alt={`${movie.title || 'Movie'} poster`}
            className="movie-poster"
            loading="lazy"
            onError={handleImageError}
          />

          {/* Top badges */}
          <div className="movie-overlay-top">
            <div className="movie-badges-left">
              {movie.certificate && (
                <span className="badge badge-cert">{movie.certificate}</span>
              )}
              {statusLabel && (
                <span className="badge badge-status">{statusLabel}</span>
              )}
            </div>
            {typeof movie.rating === 'number' && movie.rating > 0 && (
              <span className="movie-rating" aria-label={`Rating: ${movie.rating.toFixed(1)} out of 10`}>
                <Star size={13} fill="currentColor" aria-hidden="true" /> {movie.rating.toFixed(1)}
              </span>
            )}
          </div>

          {/* Bottom info */}
          <div className="movie-overlay-bottom">
            <h3 className="movie-title" title={movie.title}>{movie.title}</h3>
            
            <p className="movie-meta">
              {Array.isArray(movie.genres) && movie.genres.length > 0 && (
                <span className="movie-genres">
                  {movie.genres
                    .slice(0, 2)
                    .map((g) => (g === 'SCI_FI' ? 'Sci-Fi' : g.charAt(0).toUpperCase() + g.slice(1).toLowerCase()))
                    .join(' · ')}
                </span>
              )}
              {movie.duration && (
                <>
                  <span className="movie-dot" aria-hidden="true">•</span>
                  <span className="movie-duration">
                    <Clock size={11} aria-hidden="true" /> {movie.duration}m
                  </span>
                </>
              )}
            </p>

            {movie.language && (
              <p className="movie-language">
                <Globe size={11} aria-hidden="true" /> {movie.language}
              </p>
            )}

            {/* CTA action */}
            <div className="movie-cta">
              <span className="movie-cta-btn">Book Now</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default MovieCard;

