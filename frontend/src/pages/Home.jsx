import { useState, useEffect, useRef } from 'react';
import { movieService } from '../services/movieService';
import MovieCard from '../components/movie/MovieCard';
import MovieReelGallery from '../components/movie/MovieReelGallery';
import { LoadingSkeleton, ErrorMessage, EmptyState } from '../components/common/UIStates';
import { Search, Film, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import './Home.css';

const GENRES = [
  { label: 'Action',      value: 'ACTION' },
  { label: 'Drama',       value: 'DRAMA' },
  { label: 'Comedy',      value: 'COMEDY' },
  { label: 'Thriller',    value: 'THRILLER' },
  { label: 'Horror',      value: 'HORROR' },
  { label: 'Sci-Fi',      value: 'SCI_FI' },
  { label: 'Romance',     value: 'ROMANCE' },
  { label: 'Animation',   value: 'ANIMATION' },
  { label: 'Documentary', value: 'DOCUMENTARY' },
];

const LANGUAGES = [
  'English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada',
];

// Status values mapped to backend Movie model enum: ['UPCOMING', 'NOW_SHOWING', 'ENDED', 'INACTIVE']
const STATUS_TABS = [
  { label: 'All',         value: '' },
  { label: 'Now Showing', value: 'NOW_SHOWING' },
  { label: 'Coming Soon', value: 'UPCOMING' },
  { label: 'Archived',    value: 'ENDED' },
];

const LIMIT = 12;
const SEARCH_DEBOUNCE_MS = 350;

/* ── Home Component ──────────────────────────────────────────────── */
const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search input and applied debounced search
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  // Filters
  const [status, setStatus] = useState('NOW_SHOWING');
  const [genre, setGenre] = useState('');
  const [language, setLanguage] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Refs for tracking active request and debounce timer
  const debounceTimerRef = useRef(null);
  const latestRequestIdRef = useRef(0);
  const moviesSectionRef = useRef(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  /* ── Debounced Search Handling ─────────────────────────────────── */
  const handleSearchInputChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setActiveSearch(val.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setActiveSearch(searchInput.trim());
    setPage(1);
    moviesSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClearSearch = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setSearchInput('');
    setActiveSearch('');
    setPage(1);
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setPage(1);
  };

  const handleGenreChange = (newGenre) => {
    setGenre(newGenre);
    setPage(1);
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setPage(1);
  };

  const handleClearFilters = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setStatus('');
    setGenre('');
    setLanguage('');
    setSearchInput('');
    setActiveSearch('');
    setPage(1);
  };

  const handleRetry = () => {
    setRetryTrigger((prev) => prev + 1);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    setPage(newPage);
    moviesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  /* ── Movie Data Fetching ────────────────────────────────────────── */
  useEffect(() => {
    let isCancelled = false;
    const currentRequestId = ++latestRequestIdRef.current;

    const executeFetch = async () => {
      try {
        setError(null);
        setLoading(true);

        const params = { page, limit: LIMIT };
        if (status) params.status = status;
        if (genre) params.genre = genre;
        if (language) params.language = language;
        if (activeSearch) params.search = activeSearch;

        const res = await movieService.getMovies(params);

        if (isCancelled || currentRequestId !== latestRequestIdRef.current) {
          return;
        }

        if (res?.success) {
          const list = Array.isArray(res.data) ? res.data : [];
          setMovies(list);

          const calculatedPages =
            res.pagination?.totalPages ??
            res.pagination?.pages ??
            (res.pagination?.total ? Math.ceil(res.pagination.total / LIMIT) : 1);

          setTotalPages(calculatedPages || 1);
          setTotalCount(res.pagination?.total ?? list.length);
        } else {
          throw new Error(res?.message || 'Failed to load movies');
        }
      } catch (err) {
        if (!isCancelled && currentRequestId === latestRequestIdRef.current) {
          setError(err?.response?.data?.message || err.message || 'Error fetching movies. Please try again.');
        }
      } finally {
        if (!isCancelled && currentRequestId === latestRequestIdRef.current) {
          setLoading(false);
        }
      }
    };

    executeFetch();

    return () => {
      isCancelled = true;
    };
  }, [status, genre, language, activeSearch, page, retryTrigger]);

  const hasActiveFilters = Boolean(status || genre || language || activeSearch);

  /* ── Render ──────────────────────────────────────────────────────── */
  return (
    <div className="home-page">
      {/* ── HERO SECTION ───────────────────────────────────────────── */}
      <section className="hero" aria-label="Hero banner and movie search">
        {/* Animated cinematic reel gallery background */}
        <MovieReelGallery movies={movies} />

        <div className="hero-bg" aria-hidden="true" />
        <div className="hero-orb hero-orb-1" aria-hidden="true" />
        <div className="hero-orb hero-orb-2" aria-hidden="true" />

        <div className="hero-content container">
          <p className="hero-eyebrow">🎬 Your Cinematic Gateway</p>
          <h1 className="hero-title">
            Experience <span className="text-accent">Cinema</span> Like Never Before
          </h1>
          <p className="hero-subtitle">
            Discover blockbusters, critically acclaimed features, and upcoming releases. Book tickets effortlessly.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="search-bar glass" role="search">
            <Search size={18} className="search-icon" aria-hidden="true" />
            <input
              id="movie-search-input"
              type="search"
              placeholder="Search movies by title..."
              className="search-input"
              value={searchInput}
              onChange={handleSearchInputChange}
              aria-label="Search movies"
            />
            {searchInput && (
              <button
                type="button"
                className="search-clear"
                onClick={handleClearSearch}
                aria-label="Clear search query"
              >
                <X size={16} aria-hidden="true" />
              </button>
            )}
            <button
              id="search-submit-btn"
              type="submit"
              className="search-btn btn-primary"
              aria-label="Submit search"
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
            {STATUS_TABS.map((tab) => {
              const isSelected = status === tab.value;
              return (
                <button
                  key={tab.value}
                  id={`status-tab-${tab.value || 'all'}`}
                  role="tab"
                  aria-selected={isSelected}
                  className={`status-tab ${isSelected ? 'status-tab--active' : ''}`}
                  onClick={() => handleStatusChange(tab.value)}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Dropdown controls */}
          <div className="filter-controls">
            {/* Genre dropdown */}
            <div className="select-wrapper">
              <label htmlFor="genre-filter" className="sr-only">Filter by genre</label>
              <select
                id="genre-filter"
                className="filter-select"
                value={genre}
                onChange={(e) => handleGenreChange(e.target.value)}
                aria-label="Filter by genre"
              >
                <option value="">All Genres</option>
                {GENRES.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="select-arrow" aria-hidden="true" />
            </div>

            {/* Language dropdown */}
            <div className="select-wrapper">
              <label htmlFor="language-filter" className="sr-only">Filter by language</label>
              <select
                id="language-filter"
                className="filter-select"
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                aria-label="Filter by language"
              >
                <option value="">All Languages</option>
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              <ChevronDown size={14} className="select-arrow" aria-hidden="true" />
            </div>

            {/* Clear filters button */}
            {hasActiveFilters && (
              <button
                id="clear-filters-btn"
                type="button"
                className="clear-filters-btn"
                onClick={handleClearFilters}
                aria-label="Clear all applied filters"
              >
                <X size={14} aria-hidden="true" /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── MOVIES SECTION ───────────────────────────────────────── */}
      <main className="container movies-section" aria-label="Movies discovery listing">
        <div className="section-header">
          <div className="section-title-group">
            <h2 className="section-title">
              {status === 'NOW_SHOWING' && 'Now Showing'}
              {status === 'UPCOMING'    && 'Coming Soon'}
              {status === 'ENDED'       && 'Archived Movies'}
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
              {totalCount > 0 ? `${totalCount} movie${totalCount !== 1 ? 's' : ''}` : `${movies.length} movies`}
              {totalPages > 1 && ` · Page ${page} of ${totalPages}`}
            </p>
          )}
        </div>

        {/* State rendering: Loading -> Error -> Empty -> Grid */}
        {loading ? (
          <LoadingSkeleton count={LIMIT} />
        ) : error ? (
          <ErrorMessage message={error} onRetry={handleRetry} />
        ) : movies.length === 0 ? (
          <EmptyState
            message={
              activeSearch
                ? `No movies found matching "${activeSearch}".`
                : hasActiveFilters
                ? 'No movies found matching the selected filters.'
                : 'No movies are currently available.'
            }
            icon={Film}
            onClear={hasActiveFilters ? handleClearFilters : undefined}
            clearText="Clear Filters & Search"
          />
        ) : (
          <>
            <div className="movies-grid" id="movies-grid">
              {movies.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>

            {/* ── PAGINATION CONTROLS ───────────────────────────── */}
            {totalPages > 1 && (
              <nav className="pagination" aria-label="Movie pages navigation">
                <button
                  id="pagination-prev"
                  type="button"
                  className="page-btn page-btn-nav"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  aria-label="Go to previous page"
                >
                  <ChevronLeft size={16} aria-hidden="true" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  if (
                    p === 1 ||
                    p === totalPages ||
                    (p >= page - 1 && p <= page + 1)
                  ) {
                    return (
                      <button
                        key={p}
                        id={`page-btn-${p}`}
                        type="button"
                        className={`page-btn ${p === page ? 'page-btn--active' : ''}`}
                        onClick={() => handlePageChange(p)}
                        aria-label={`Page ${p}`}
                        aria-current={p === page ? 'page' : undefined}
                      >
                        {p}
                      </button>
                    );
                  }
                  if (p === page - 2 || p === page + 2) {
                    return <span key={p} className="page-ellipsis" aria-hidden="true">…</span>;
                  }
                  return null;
                })}

                <button
                  id="pagination-next"
                  type="button"
                  className="page-btn page-btn-nav"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  aria-label="Go to next page"
                >
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              </nav>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Home;
