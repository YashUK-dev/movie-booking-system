import { useState, useEffect } from 'react';
import { movieService } from '../services/movieService';
import MovieCard from '../components/movie/MovieCard';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../components/common/UIStates';
import { Search, Film } from 'lucide-react';
import './Home.css';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await movieService.getMovies({ status: 'NOW_SHOWING' });
      if (res?.success) {
        setMovies(res.data);
      } else {
        throw new Error('Failed to load movies');
      }
    } catch (err) {
      setError(err.message || 'Error fetching movies');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      return fetchMovies();
    }
    try {
      setLoading(true);
      setError(null);
      // Backend uses ?search= query param for text search
      const res = await movieService.getMovies({ search: searchQuery });
      if (res?.success) {
        setMovies(res.data);
      } else {
        throw new Error('Search failed');
      }
    } catch (err) {
      setError(err.message || 'Error searching movies');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content container">
          <h1 className="hero-title">
            Experience <span className="text-accent">Cinema</span> Like Never Before
          </h1>
          <p className="hero-subtitle">
            Book tickets for the latest blockbusters in premium theaters. Immerse yourself in the ultimate movie experience.
          </p>
          
          <form onSubmit={handleSearch} className="search-bar glass">
            <input 
              type="text" 
              placeholder="Search movies, genres..." 
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn-primary search-btn">
              <Search size={18} /> Search
            </button>
          </form>
        </div>
      </section>

      {/* Movies Section */}
      <section className="container movies-section">
        <div className="section-header">
          <h2 className="section-title">Now Showing</h2>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : movies.length === 0 ? (
          <EmptyState message="No movies found." icon={Film} />
        ) : (
          <div className="movies-grid">
            {movies.map(movie => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
