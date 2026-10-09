import { useState, useEffect, useCallback, useRef } from 'react';
import { movieService } from '../services/movieService';
import MovieCard from '../components/movie/MovieCard';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../components/common/UIStates';
import { Search, Film, ChevronDown, ChevronLeft, ChevronRight, X, SlidersHorizontal } from 'lucide-react';
import './Home.css';

/* ── Constants ───────────────────────────────────────────────────── */
const GENRES = [
  'Action', 'Drama', 'Comedy', 'Thriller', 'Horror',
  'Sci-Fi', 'Romance', 'Animation', 'Documentary', 'Adventure', 'Fantasy',
];
const LANGUAGES = [
  'English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada',
];
const STATUS_TABS = [
  { label: 'All',          value: '' },
  { label: 'Now Showing',  value: 'NOW_SHOWING' },
  { label: 'Coming Soon',  value: 'COMING_SOON' },
];
const LIMIT = 12;

/* ── Home Component ──────────────────────────────────────────────── */
const Home = () => {
  const [movies,      setMovies]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  // Filters
  const [status,   setStatus]   = useState('NOW_SHOWING');
  const [genre,    setGenre]    = useState('');
  const [language, setLanguage] = useState('');

  // Pagination
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // UI
  const [showFilters,  setShowFilters]  = useState(false);
  const moviesSectionRef = useRef(null);

  /* ── Fetch ──────────────────────────────────────────────────────── */
  const fetchMovies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: LIMIT };
      if (status)       params.status   = status;
      if (genre)        params.genre    = genre;
      if (language)     params.language = language;
      if (activeSearch) params.search   = activeSearch;

      const res = await movieService.getMovies(params);
      if (res?.success) {
        setMovies(res.data ?? []);
        setTotalPages(res.pagination?.pages ?? 1);
      } else {
        throw new Error('Failed to load movies');
      }
    } catch (err) {
      setError(err.message || 'Error fetching movies');
    } finally {
      setLoading(false);
    }
  }, [status, genre, language, activeSearch, page]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  /* ── Handlers ────────────────────────────────────────────────────── */
  const handleSearch = (e) => {
    e.preventDefault();
    setActiveSearch(searchQuery.trim());
    setPage(1);
    moviesSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const clearSearch = () => {
    setSearchQuery('');
    setActiveSearch('');
    setPage(1);
  };

  const handleFilterChange = (setter) => (val) => {
    setter(val);
    setPage(1);
  };

  const clearFilters = () => {
    setStatus('');
    setGenre('');
    setLanguage('');
    setActiveSearch('');
    setSearchQuery('');
    setPage(1);
  };

  const hasActiveFilters = status || genre || language || activeSearch;

  const changePage = (newPage) => {
    setPage(newPage);
    moviesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /* ── Render ──────────────────────────────────────────────────────── */
  return (
    <div className="home-page">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="hero" aria-label="Search movies">
        <div className="hero-bg" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />

        <div className="hero-content container">
          <p className="hero-eyebrow">🎬 Your Cinematic Gateway</p>
          <h1 className="hero-title">
            Experience <span className="text-accent">Cinema</span>{' '}
            Like Never Before
          </h1>
          <p className="hero-subtitle">
            Discover blockbusters, indie films and more.
            Book your seats in seconds.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="search-bar glass" role="search">
            <Search size={18} className="search-icon" />
            <input
              id="movie-search-input"
              type="text"
              placeholder="Search by title, genre, director…"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search movies"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear"
                onClick={clearSearch}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
            <button
              id="search-submit-btn"
              type="submit"
              className="search-btn btn-primary"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* ── FILTER BAR ───────────────────────────────────────────── */}
      <div className="filter-wrapper" ref={moviesSectionRef}>
        <div className="container filter-bar">
          {/* Status tabs */}
          <div className="status-tabs" role="tablist" aria-label="Movie status filter">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                id={`status-tab-${tab.value || 'all'}`}
                role="tab"
                aria-selected={status === tab.value}
                className={`status-tab ${status === tab.value ? 'status-tab--active' : ''}`}
                onClick={() => handleFilterChange(setStatus)(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="filter-controls">
            {/* Genre dropdown */}
            <div className="select-wrapper">
              <select
                id="genre-filter"
                className="filter-select"
                value={genre}
                onChange={(e) => handleFilterChange(setGenre)(e.target.value)}
                aria-label="Filter by genre"
              >
                <option value="">All Genres</option>
                {GENRES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <ChevronDown size={14} className="select-arrow" />
            </div>

            {/* Language dropdown */}
            <div className="select-wrapper">
              <select
                id="language-filter"
                className="filter-select"
                value={language}
                onChange={(e) => handleFilterChange(setLanguage)(e.target.value)}
                aria-label="Filter by language"
              >
                <option value="">All Languages</option>
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              <ChevronDown size={14} className="select-arrow" />
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                id="clear-filters-btn"
                className="clear-filters-btn"
                onClick={clearFilters}
                aria-label="Clear all filters"
              >
                <X size={14} /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── MOVIES SECTION ───────────────────────────────────────── */}
      <section className="container movies-section" aria-label="Movie listing">
        <div className="section-header">
          <div className="section-title-group">
            <h2 className="section-title">
              {status === 'NOW_SHOWING'  && 'Now Showing'}
              {status === 'COMING_SOON'  && 'Coming Soon'}
              {!status                  && 'All Movies'}
            </h2>
            {activeSearch && (
              <span className="search-result-label">
                Results for "<strong>{activeSearch}</strong>"
              </span>
            )}
          </div>
          {!loading && !error && movies.length > 0 && (
            <p className="movie-count" aria-live="polite">
              {movies.length} movie{movies.length !== 1 ? 's' : ''}
              {totalPages > 1 && ` · Page ${page} of ${totalPages}`}
            </p>
          )}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchMovies} />
        ) : movies.length === 0 ? (
          <EmptyState
            message={activeSearch ? `No results for "${activeSearch}".` : 'No movies found for this filter.'}
            icon={Film}
          />
        ) : (
          <>
            <div className="movies-grid">
              {movies.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>

            {/* ── PAGINATION ─────────────────────────────────── */}
            {totalPages > 1 && (
              <nav className="pagination" aria-label="Movie listing pages">
                <button
                  id="pagination-prev"
                  className="page-btn page-btn-nav"
                  onClick={() => changePage(page - 1)}
                  disabled={page === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  // Show first, last, current ±1, and ellipsis
                  if (
                    p === 1 || p === totalPages ||
                    (p >= page - 1 && p <= page + 1)
                  ) {
                    return (
                      <button
                        key={p}
                        id={`page-btn-${p}`}
                        className={`page-btn ${p === page ? 'page-btn--active' : ''}`}
                        onClick={() => changePage(p)}
                        aria-label={`Page ${p}`}
                        aria-current={p === page ? 'page' : undefined}
                      >
                        {p}
                      </button>
                    );
                  }
                  if (p === page - 2 || p === page + 2) {
                    return <span key={p} className="page-ellipsis">…</span>;
                  }
                  return null;
                })}

                <button
                  id="pagination-next"
                  className="page-btn page-btn-nav"
                  onClick={() => changePage(page + 1)}
                  disabled={page === totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </nav>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default Home;
