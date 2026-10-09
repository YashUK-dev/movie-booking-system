import { Link } from 'react-router-dom';
import { Star, Clock, Globe } from 'lucide-react';
import './MovieCard.css';

const MovieCard = ({ movie }) => {
  return (
    <Link to={`/movies/${movie._id}`} className="movie-card" id={`movie-card-${movie._id}`}>
      <div className="movie-poster-container">
        <img
          src={movie.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop'}
          alt={movie.title}
          className="movie-poster"
          loading="lazy"
        />

        {/* Top badges */}
        <div className="movie-overlay-top">
          {movie.certificate && (
            <span className="badge badge-cert">{movie.certificate}</span>
          )}
          {movie.rating > 0 && (
            <span className="movie-rating">
              <Star size={13} fill="currentColor" /> {movie.rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Bottom info */}
        <div className="movie-overlay-bottom">
          <h3 className="movie-title">{movie.title}</h3>
          <p className="movie-meta">
            {movie.genres?.length > 0 && (
              <span className="movie-genres">{movie.genres.slice(0, 2).join(' · ')}</span>
            )}
            {movie.duration && (
              <>
                <span className="movie-dot">•</span>
                <span className="movie-duration">
                  <Clock size={11} /> {movie.duration}m
                </span>
              </>
            )}
          </p>
          {movie.language && (
            <p className="movie-language">
              <Globe size={11} /> {movie.language}
            </p>
          )}
          {/* CTA on hover */}
          <div className="movie-cta">
            <span className="movie-cta-btn">Book Now</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
