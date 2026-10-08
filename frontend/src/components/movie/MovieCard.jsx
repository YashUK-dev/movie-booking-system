import { Link } from 'react-router-dom';
import { Star, Clock } from 'lucide-react';
import './MovieCard.css';

const MovieCard = ({ movie }) => {
  return (
    <Link to={`/movies/${movie._id}`} className="movie-card">
      <div className="movie-poster-container">
        <img 
          src={movie.posterUrl || 'https://via.placeholder.com/300x450/1a1a1a/666?text=No+Poster'} 
          alt={movie.title} 
          className="movie-poster"
        />
        <div className="movie-overlay">
          <div className="movie-overlay-top">
            {movie.certificate && (
              <span className="badge badge-accent">{movie.certificate}</span>
            )}
            {movie.rating > 0 && (
              <span className="movie-rating">
                <Star size={14} fill="currentColor" /> {movie.rating.toFixed(1)}
              </span>
            )}
          </div>
          <div className="movie-overlay-bottom">
            <h3 className="movie-title">{movie.title}</h3>
            <p className="movie-meta">
              <span className="movie-genres">{movie.genres?.join(', ')}</span>
              <span className="movie-dot">•</span>
              <span className="movie-duration"><Clock size={12}/> {movie.duration}m</span>
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
