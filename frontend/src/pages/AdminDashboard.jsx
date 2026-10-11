import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';
import { theatreService } from '../services/theatreService';
import { LoadingSpinner, ErrorMessage } from '../components/common/UIStates';
import { 
  Users, Film, Building2, Calendar, Ticket, 
  CheckCircle2, XCircle, IndianRupee, RefreshCw, 
  ShieldAlert, ShieldCheck, Clock, MapPin, ArrowLeft, Plus, X
} from 'lucide-react';
import './AdminDashboard.css';

const initialMovieForm = {
  title: '',
  description: '',
  language: '',
  genres: '',
  duration: '',
  releaseDate: '',
  certificate: '',
  posterUrl: '',
  trailerUrl: '',
  rating: '',
  status: 'UPCOMING',
};

const initialTheatreForm = {
  name: '',
  description: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  latitude: '',
  longitude: '',
  facilities: [],
  isActive: true,
};

const initialScreenForm = {
  name: '',
  screenNumber: '',
  totalSeats: '',
  isActive: true,
};

const theatreFacilityOptions = ['PARKING', 'FOOD', 'WIFI', 'RECLINER', 'DOLBY', 'ACCESSIBILITY'];

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isMovieFormOpen, setIsMovieFormOpen] = useState(false);
  const [movieForm, setMovieForm] = useState(initialMovieForm);
  const [movieFormError, setMovieFormError] = useState(null);
  const [savingMovie, setSavingMovie] = useState(false);
  const [movieCreated, setMovieCreated] = useState(false);
  const [isTheatreFormOpen, setIsTheatreFormOpen] = useState(false);
  const [theatreForm, setTheatreForm] = useState(initialTheatreForm);
  const [theatreFormError, setTheatreFormError] = useState(null);
  const [savingTheatre, setSavingTheatre] = useState(false);
  const [theatreCreated, setTheatreCreated] = useState(false);
  const [theatres, setTheatres] = useState([]);
  const [theatresLoading, setTheatresLoading] = useState(false);
  const [theatresError, setTheatresError] = useState(null);
  const [expandedTheatreId, setExpandedTheatreId] = useState(null);
  const [theatreScreens, setTheatreScreens] = useState({});
  const [screensLoading, setScreensLoading] = useState(false);
  const [screensError, setScreensError] = useState(null);
  const [screenEditor, setScreenEditor] = useState(null);
  const [screenForm, setScreenForm] = useState(initialScreenForm);
  const [screenFormError, setScreenFormError] = useState(null);
  const [savingScreen, setSavingScreen] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const res = await adminService.getDashboardStats();
      if (res?.success) {
        setStats(res.data);
      } else {
        throw new Error(res?.message || 'Failed to fetch admin statistics');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Error loading dashboard metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchTheatres = useCallback(async () => {
    setTheatresLoading(true);
    setTheatresError(null);
    try {
      const firstPage = await theatreService.getTheatres({ page: 1, limit: 100 });
      if (!firstPage?.success) {
        throw new Error(firstPage?.message || 'Failed to fetch theatres');
      }
      const allTheatres = [...(firstPage.data || [])];
      const totalPages = firstPage.pagination?.totalPages || 1;

      for (let page = 2; page <= totalPages; page += 1) {
        const pageRes = await theatreService.getTheatres({ page, limit: 100 });
        if (!pageRes?.success) {
          throw new Error(pageRes?.message || `Failed to fetch theatres page ${page}`);
        }
        allTheatres.push(...(pageRes.data || []));
      }

      setTheatres(allTheatres);
    } catch (err) {
      setTheatresError(err?.response?.data?.message || err.message || 'Unable to load theatres');
    } finally {
      setTheatresLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login?redirect=/admin');
      } else if (user.role === 'ADMIN') {
        Promise.resolve().then(fetchStats);
        Promise.resolve().then(fetchTheatres);
      }
    }
  }, [user, authLoading, navigate, fetchStats, fetchTheatres]);

  const newMovieForm = () => {
    setMovieForm(initialMovieForm);
    setMovieFormError(null);
    setMovieCreated(false);
    setIsMovieFormOpen(true);
  };

  const closeMovieForm = () => {
    if (!savingMovie) {
      setIsMovieFormOpen(false);
      setMovieFormError(null);
    }
  };

  const handleMovieFormChange = (event) => {
    const { name, value } = event.target;
    setMovieForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleMovieSubmit = async (event) => {
    event.preventDefault();
    setMovieFormError(null);
    setSavingMovie(true);

    const movie = {
      title: movieForm.title.trim(),
      description: movieForm.description.trim(),
      language: movieForm.language.trim(),
      genres: movieForm.genres.split(',').map((genre) => genre.trim()).filter(Boolean),
      duration: Number(movieForm.duration),
      releaseDate: movieForm.releaseDate,
      certificate: movieForm.certificate.trim(),
      status: movieForm.status,
    };

    if (movieForm.posterUrl.trim()) movie.posterUrl = movieForm.posterUrl.trim();
    if (movieForm.trailerUrl.trim()) movie.trailerUrl = movieForm.trailerUrl.trim();
    if (movieForm.rating !== '') movie.rating = Number(movieForm.rating);

    try {
      const res = await adminService.createMovie(movie);
      if (!res?.success) {
        throw new Error(res?.message || 'Failed to add movie');
      }

      setIsMovieFormOpen(false);
      setMovieCreated(true);
      await fetchStats();
    } catch (err) {
      setMovieFormError(
        err?.response?.data?.message || err.message || 'Unable to add movie'
      );
    } finally {
      setSavingMovie(false);
    }
  };

  const newTheatreForm = () => {
    setTheatreForm(initialTheatreForm);
    setTheatreFormError(null);
    setTheatreCreated(false);
    setIsTheatreFormOpen(true);
  };

  const closeTheatreForm = () => {
    if (!savingTheatre) {
      setIsTheatreFormOpen(false);
      setTheatreFormError(null);
    }
  };

  const handleTheatreFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setTheatreForm((form) => ({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFacilityChange = (facility, checked) => {
    setTheatreForm((form) => ({
      ...form,
      facilities: checked
        ? [...form.facilities, facility]
        : form.facilities.filter((item) => item !== facility),
    }));
  };

  const handleTheatreSubmit = async (event) => {
    event.preventDefault();
    setTheatreFormError(null);
    setSavingTheatre(true);

    try {
      const theatre = {
        name: theatreForm.name.trim(),
        description: theatreForm.description.trim(),
        address: theatreForm.address.trim(),
        city: theatreForm.city.trim(),
        state: theatreForm.state.trim(),
        pincode: theatreForm.pincode.trim(),
        facilities: theatreForm.facilities,
        isActive: theatreForm.isActive,
      };
      if (theatreForm.latitude !== '') theatre.latitude = Number(theatreForm.latitude);
      if (theatreForm.longitude !== '') theatre.longitude = Number(theatreForm.longitude);

      const res = await theatreService.createTheatre(theatre);
      if (!res?.success) {
        throw new Error(res?.message || 'Failed to add theatre');
      }

      setIsTheatreFormOpen(false);
      setTheatreCreated(true);
      await Promise.all([fetchStats(), fetchTheatres()]);
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Unable to add theatre';
      setTheatreFormError(message);
    } finally {
      setSavingTheatre(false);
    }
  };

  const loadTheatreScreens = async (theatreId) => {
    setScreensLoading(true);
    setScreensError(null);
    try {
      const res = await theatreService.getScreensByTheatre(theatreId);
      if (!res?.success) {
        throw new Error(res?.message || 'Failed to fetch theatre screens');
      }
      setTheatreScreens((screens) => ({ ...screens, [theatreId]: res.data || [] }));
    } catch (err) {
      setScreensError(err?.response?.data?.message || err.message || 'Unable to load screens');
    } finally {
      setScreensLoading(false);
    }
  };

  const toggleTheatreScreens = async (theatreId) => {
    if (expandedTheatreId === theatreId) {
      setExpandedTheatreId(null);
      return;
    }
    setExpandedTheatreId(theatreId);
    setScreensError(null);
    if (theatreScreens[theatreId]) return;

    await loadTheatreScreens(theatreId);
  };

  const openScreenEditor = (theatreId, screen = null) => {
    setScreenForm(screen ? {
      name: screen.name || '',
      screenNumber: String(screen.screenNumber ?? ''),
      totalSeats: String(screen.totalSeats ?? 0),
      isActive: screen.isActive ?? true,
    } : initialScreenForm);
    setScreenFormError(null);
    setScreenEditor({ theatreId, screenId: screen?._id || null });
  };

  const handleScreenFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setScreenForm((form) => ({ ...form, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleScreenSubmit = async (event) => {
    event.preventDefault();
    if (!screenEditor) return;

    setSavingScreen(true);
    setScreenFormError(null);
    try {
      const screenData = {
        name: screenForm.name.trim(),
        screenNumber: Number(screenForm.screenNumber),
        totalSeats: Number(screenForm.totalSeats),
        isActive: screenForm.isActive,
      };
      const res = screenEditor.screenId
        ? await theatreService.updateScreen(screenEditor.screenId, screenData)
        : await theatreService.createScreen(screenEditor.theatreId, screenData);
      if (!res?.success) {
        throw new Error(res?.message || 'Failed to save screen');
      }
      const resScreens = await theatreService.getScreensByTheatre(screenEditor.theatreId);
      setTheatreScreens((screens) => ({
        ...screens,
        [screenEditor.theatreId]: resScreens.data || [],
      }));
      setScreenEditor(null);
    } catch (err) {
      setScreenFormError(err?.response?.data?.message || err.message || 'Unable to save screen');
    } finally {
      setSavingScreen(false);
    }
  };

  useEffect(() => {
    if (!isMovieFormOpen && !isTheatreFormOpen && !screenEditor && !expandedTheatreId) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (isMovieFormOpen && !savingMovie) {
          setIsMovieFormOpen(false);
          setMovieFormError(null);
        }
        if (isTheatreFormOpen && !savingTheatre) {
          setIsTheatreFormOpen(false);
          setTheatreFormError(null);
        }
        if (screenEditor && !savingScreen) {
          setScreenEditor(null);
          setScreenFormError(null);
        }
        if (expandedTheatreId) setExpandedTheatreId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMovieFormOpen, savingMovie, isTheatreFormOpen, savingTheatre, screenEditor, savingScreen, expandedTheatreId]);

  if (authLoading || (user?.role === 'ADMIN' && loading)) {
    return <LoadingSpinner text="Loading admin analytics..." />;
  }

  if (user && user.role !== 'ADMIN') {
    return (
      <div className="admin-unauthorized container">
        <div className="unauthorized-card">
          <ShieldAlert size={56} className="text-danger" />
          <h2>Access Restricted</h2>
          <p>You do not have administrative privileges to view this section.</p>
          <div className="unauthorized-actions">
            <Link to="/" className="btn-primary">Return to Home</Link>
            <Link to="/profile" className="btn-secondary">My Profile</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">
      <div className="container">
        {/* Header */}
        <div className="admin-header">
          <div>
            <div className="admin-badge-row">
              <span className="admin-badge">
                <ShieldCheck size={14} />
                ADMIN CONSOLE
              </span>
            </div>
            <h1 className="admin-title">System Overview</h1>
            <p className="admin-subtitle">Live analytics, bookings metrics, and scheduled shows</p>
          </div>

          <div className="admin-header-actions">
            <button 
              className="btn-refresh" 
              onClick={fetchStats}
              disabled={refreshing}
            >
              <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
              <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
            </button>
            <Link to="/profile" className="btn-back">
              <ArrowLeft size={16} />
              <span>Back to Profile</span>
            </Link>
          </div>
        </div>

        {error ? (
          <ErrorMessage message={error} onRetry={fetchStats} />
        ) : stats ? (
          <>
            {/* Primary KPI Grid */}
            <div className="stats-grid">
              <div className="stat-card revenue-card">
                <div className="stat-header">
                  <span className="stat-title">Total Revenue</span>
                  <div className="stat-icon-wrapper revenue">
                    <IndianRupee size={22} />
                  </div>
                </div>
                <div className="stat-value">₹{(stats.revenue || 0).toLocaleString('en-IN')}</div>
                <span className="stat-note">Confirmed booking collections</span>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-title">Total Bookings</span>
                  <div className="stat-icon-wrapper bookings">
                    <Ticket size={22} />
                  </div>
                </div>
                <div className="stat-value">{stats.totalBookings || 0}</div>
                <div className="stat-breakdown">
                  <span className="breakdown-item text-success">
                    <CheckCircle2 size={12} /> {stats.confirmedBookings || 0} confirmed
                  </span>
                  <span className="breakdown-item text-danger">
                    <XCircle size={12} /> {stats.cancelledBookings || 0} cancelled
                  </span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-title">Active Movies</span>
                  <div className="stat-icon-wrapper movies">
                    <Film size={22} />
                  </div>
                </div>
                <div className="stat-value">{stats.totalMovies || 0}</div>
                <span className="stat-note">Catalog titles in database</span>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-title">Theatres</span>
                  <div className="stat-icon-wrapper theatres">
                    <Building2 size={22} />
                  </div>
                </div>
                <div className="stat-value">{stats.totalTheatres || 0}</div>
                <span className="stat-note">Partner cinema complexes</span>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-title">Total Shows</span>
                  <div className="stat-icon-wrapper shows">
                    <Calendar size={22} />
                  </div>
                </div>
                <div className="stat-value">{stats.totalShows || 0}</div>
                <span className="stat-note">Scheduled showtimes</span>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-title">Registered Users</span>
                  <div className="stat-icon-wrapper users">
                    <Users size={22} />
                  </div>
                </div>
                <div className="stat-value">{stats.totalUsers || 0}</div>
                <span className="stat-note">User customer accounts</span>
              </div>
            </div>

            <div className="add-movie-button">
              <button className="btn btn-add-movie" onClick={newMovieForm}>
                <Plus size={18} />
                Add New Movie
              </button>
              <button className="btn btn-add-movie" onClick={newTheatreForm}>
                <Plus size={18} />
                Add Theatre
              </button>
            </div>

            {movieCreated && (
              <div className="movie-success-message" role="status">
                Movie added successfully.
              </div>
            )}
            {theatreCreated && (
              <div className="movie-success-message" role="status">
                Theatre added successfully.
              </div>
            )}

            <section className="theatre-board-section">
              <div className="section-header-row theatre-board-header">
                <div>
                  <h2 className="section-title">Theatre Directory</h2>
                  <p className="section-subtitle">View theatres and manage their screens</p>
                </div>
                <button className="btn-refresh" type="button" onClick={fetchTheatres} disabled={theatresLoading}>
                  <RefreshCw size={15} className={theatresLoading ? 'spin' : ''} />
                  {theatresLoading ? 'Loading...' : 'Refresh theatres'}
                </button>
              </div>

              {theatresError && <ErrorMessage message={theatresError} onRetry={fetchTheatres} />}
              {theatresLoading && theatres.length === 0 ? (
                <LoadingSpinner text="Loading theatres..." />
              ) : theatres.length === 0 ? (
                <div className="empty-shows-card">
                  <Building2 size={32} className="text-muted" />
                  <p>No theatres have been added yet.</p>
                </div>
              ) : (
                <div className="theatre-board">
                  {theatres.map((theatre) => (
                    <article className="theatre-board-card" key={theatre._id}>
                      <div className="theatre-board-summary">
                        <div>
                          <h3>{theatre.name}</h3>
                          <p>{theatre.city}, {theatre.state}</p>
                          <span className={`theatre-board-status ${theatre.isActive ? 'active' : 'inactive'}`}>
                            {theatre.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <button
                          className="btn-refresh"
                          type="button"
                          onClick={() => toggleTheatreScreens(theatre._id)}
                        >
                          <Building2 size={15} />
                          Manage screens
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {expandedTheatreId && (
              <div
                className="movie-modal-backdrop"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) setExpandedTheatreId(null);
                }}
              >
                <section className="movie-modal theatre-screens-modal" role="dialog" aria-modal="true" aria-labelledby="theatre-screens-title">
                  <div className="movie-modal-header">
                    <div>
                      <h2 id="theatre-screens-title">
                        Manage Screens — {theatres.find((theatre) => theatre._id === expandedTheatreId)?.name}
                      </h2>
                      <p>Screen capacity changes update the bookable seats.</p>
                    </div>
                    <button className="movie-modal-close" type="button" onClick={() => setExpandedTheatreId(null)} aria-label="Close screen management">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="theatre-screen-list-header">
                    <h4>Screens</h4>
                    <button className="btn btn-add-movie" type="button" onClick={() => openScreenEditor(expandedTheatreId)}>
                      <Plus size={15} /> Add screen
                    </button>
                  </div>
                  {screensError && <ErrorMessage message={screensError} onRetry={() => loadTheatreScreens(expandedTheatreId)} />}
                  {screensLoading && !theatreScreens[expandedTheatreId] ? (
                    <LoadingSpinner text="Loading screens..." />
                  ) : (theatreScreens[expandedTheatreId] || []).length === 0 ? (
                    <p className="theatre-no-screens">No screens found for this theatre.</p>
                  ) : (
                    <div className="theatre-screen-items">
                      {theatreScreens[expandedTheatreId].map((screen) => (
                        <div className="theatre-screen-item" key={screen._id}>
                          <div>
                            <strong>{screen.name}</strong>
                            <span>Screen {screen.screenNumber} · {screen.totalSeats || 0} seats</span>
                            <span className={screen.isActive ? 'screen-active' : 'screen-inactive'}>
                              {screen.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <button className="btn-refresh" type="button" onClick={() => openScreenEditor(expandedTheatreId, screen)}>
                            Edit screen
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* Upcoming Shows Table */}
            <div className="upcoming-shows-section">
              <div className="section-header-row">
                <div>
                  <h2 className="section-title">Upcoming Shows</h2>
                  <p className="section-subtitle">Next scheduled screenings across venues</p>
                </div>
              </div>

              {stats.upcomingShows && stats.upcomingShows.length > 0 ? (
                <div className="shows-table-card">
                  <div className="table-responsive">
                    <table className="shows-table">
                      <thead>
                        <tr>
                          <th>Movie</th>
                          <th>Theatre & Screen</th>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.upcomingShows.map((show) => {
                          const startTime = new Date(show.startTime);
                          return (
                            <tr key={show._id}>
                              <td className="movie-cell font-semibold">
                                {show.movieId?.title || 'Unknown Title'}
                              </td>
                              <td>
                                <div className="theatre-cell">
                                  <MapPin size={14} className="text-secondary" />
                                  <span>
                                    {show.screenId?.theatreId?.name || 'Cinema'}, {show.screenId?.name || 'Screen'}
                                  </span>
                                </div>
                              </td>
                              <td>
                                {startTime.toLocaleDateString(undefined, { 
                                  weekday: 'short', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </td>
                              <td>
                                <div className="time-cell">
                                  <Clock size={13} className="text-secondary" />
                                  <span>
                                    {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <span className="badge badge-success">
                                  Scheduled
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="empty-shows-card">
                  <Calendar size={36} className="text-muted" />
                  <p>No upcoming shows found.</p>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>

      {isMovieFormOpen && (
        <div
          className="movie-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeMovieForm();
          }}
        >
          <section
            className="movie-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="movie-modal-title"
          >
            <div className="movie-modal-header">
              <div>
                <h2 id="movie-modal-title">Add New Movie</h2>
                <p>Enter the movie details to add it to the catalog.</p>
              </div>
              <button
                className="movie-modal-close"
                type="button"
                onClick={closeMovieForm}
                disabled={savingMovie}
                aria-label="Close add movie form"
              >
                <X size={20} />
              </button>
            </div>

            {movieFormError && (
              <div className="movie-form-error" role="alert">{movieFormError}</div>
            )}

            <form className="movie-form" onSubmit={handleMovieSubmit}>
              <label>
                Movie title
                <input name="title" value={movieForm.title} onChange={handleMovieFormChange} required />
              </label>
              <label>
                Description
                <textarea name="description" value={movieForm.description} onChange={handleMovieFormChange} required rows="3" />
              </label>
              <div className="movie-form-grid">
                <label>
                  Language
                  <input name="language" value={movieForm.language} onChange={handleMovieFormChange} required />
                </label>
                <label>
                  Genres <span>(comma-separated)</span>
                  <input name="genres" value={movieForm.genres} onChange={handleMovieFormChange} placeholder="Action, Drama" required />
                </label>
                <label>
                  Duration (minutes)
                  <input name="duration" type="number" min="1" value={movieForm.duration} onChange={handleMovieFormChange} required />
                </label>
                <label>
                  Release date
                  <input name="releaseDate" type="date" value={movieForm.releaseDate} onChange={handleMovieFormChange} required />
                </label>
                <label>
                  Certificate
                  <input name="certificate" value={movieForm.certificate} onChange={handleMovieFormChange} placeholder="UA" required />
                </label>
                <label>
                  Status
                  <select name="status" value={movieForm.status} onChange={handleMovieFormChange}>
                    <option value="UPCOMING">Upcoming</option>
                    <option value="NOW_SHOWING">Now showing</option>
                    <option value="ENDED">Ended</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </label>
                <label>
                  Rating <span>(0–10, optional)</span>
                  <input name="rating" type="number" min="0" max="10" step="0.1" value={movieForm.rating} onChange={handleMovieFormChange} />
                </label>
                <label>
                  Poster URL <span>(optional)</span>
                  <input name="posterUrl" type="url" value={movieForm.posterUrl} onChange={handleMovieFormChange} />
                </label>
                <label className="movie-form-full-width">
                  Trailer URL <span>(optional)</span>
                  <input name="trailerUrl" type="url" value={movieForm.trailerUrl} onChange={handleMovieFormChange} />
                </label>
              </div>

              <div className="movie-form-actions">
                <button className="btn-back" type="button" onClick={closeMovieForm} disabled={savingMovie}>
                  Cancel
                </button>
                <button className="btn btn-add-movie" type="submit" disabled={savingMovie}>
                  {savingMovie ? 'Adding movie...' : 'Add Movie'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
      {isTheatreFormOpen && (
        <div
          className="movie-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeTheatreForm();
          }}
        >
          <section className="movie-modal" role="dialog" aria-modal="true" aria-labelledby="theatre-modal-title">
            <div className="movie-modal-header">
              <div>
                <h2 id="theatre-modal-title">Add Theatre</h2>
                <p>Enter the theatre details and available facilities.</p>
              </div>
              <button
                className="movie-modal-close"
                type="button"
                onClick={closeTheatreForm}
                disabled={savingTheatre}
                aria-label="Close add theatre form"
              >
                <X size={20} />
              </button>
            </div>

            {theatreFormError && <div className="movie-form-error" role="alert">{theatreFormError}</div>}
            <form className="movie-form" onSubmit={handleTheatreSubmit}>
              <label>
                Theatre name
                <input name="name" value={theatreForm.name} onChange={handleTheatreFormChange} required />
              </label>
              <label>
                Description <span>(optional)</span>
                <textarea name="description" value={theatreForm.description} onChange={handleTheatreFormChange} rows="2" />
              </label>
              <div className="movie-form-grid">
                <label className="movie-form-full-width">
                  Address
                  <input name="address" value={theatreForm.address} onChange={handleTheatreFormChange} required />
                </label>
                <label>
                  City
                  <input name="city" value={theatreForm.city} onChange={handleTheatreFormChange} required />
                </label>
                <label>
                  State
                  <input name="state" value={theatreForm.state} onChange={handleTheatreFormChange} required />
                </label>
                <label>
                  Pincode
                  <input name="pincode" value={theatreForm.pincode} onChange={handleTheatreFormChange} required />
                </label>
                <label>
                  Latitude <span>(optional)</span>
                  <input name="latitude" type="number" step="any" value={theatreForm.latitude} onChange={handleTheatreFormChange} />
                </label>
                <label>
                  Longitude <span>(optional)</span>
                  <input name="longitude" type="number" step="any" value={theatreForm.longitude} onChange={handleTheatreFormChange} />
                </label>
              </div>

              <fieldset className="theatre-facility-options">
                <legend>Facilities</legend>
                {theatreFacilityOptions.map((facility) => (
                  <label key={facility}>
                    <input
                      type="checkbox"
                      checked={theatreForm.facilities.includes(facility)}
                      onChange={(event) => handleFacilityChange(facility, event.target.checked)}
                    />
                    {facility}
                  </label>
                ))}
              </fieldset>
              <label className="theatre-active-toggle">
                <input type="checkbox" name="isActive" checked={theatreForm.isActive} onChange={handleTheatreFormChange} />
                Theatre is active
              </label>

              <div className="movie-form-actions">
                <button className="btn-back" type="button" onClick={closeTheatreForm} disabled={savingTheatre}>
                  Cancel
                </button>
                <button className="btn btn-add-movie" type="submit" disabled={savingTheatre}>
                  {savingTheatre ? 'Adding theatre...' : 'Add Theatre'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
      {screenEditor && (
        <div
          className="movie-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !savingScreen) setScreenEditor(null);
          }}
        >
          <section className="movie-modal screen-modal" role="dialog" aria-modal="true" aria-labelledby="screen-modal-title">
            <div className="movie-modal-header">
              <div>
                <h2 id="screen-modal-title">{screenEditor.screenId ? 'Edit Screen Details' : 'Add Screen'}</h2>
                <p>Manage the screen name, number, and availability.</p>
              </div>
              <button className="movie-modal-close" type="button" onClick={() => setScreenEditor(null)} disabled={savingScreen} aria-label="Close screen form">
                <X size={20} />
              </button>
            </div>
            {screenFormError && <div className="movie-form-error" role="alert">{screenFormError}</div>}
            <form className="movie-form" onSubmit={handleScreenSubmit}>
              <div className="movie-form-grid">
                <label>
                  Screen name
                  <input name="name" value={screenForm.name} onChange={handleScreenFormChange} required />
                </label>
                <label>
                  Screen number
                  <input name="screenNumber" type="number" min="1" step="1" value={screenForm.screenNumber} onChange={handleScreenFormChange} required />
                </label>
                <label>
                  Number of seats
                  <input name="totalSeats" type="number" min="1" max="1000" step="1" value={screenForm.totalSeats} onChange={handleScreenFormChange} required />
                  {screenEditor.screenId && <span className="screen-capacity-hint">When reducing capacity, seats already used by shows or bookings cannot be removed.</span>}
                </label>
              </div>
              <label className="theatre-active-toggle">
                <input type="checkbox" name="isActive" checked={screenForm.isActive} onChange={handleScreenFormChange} />
                Screen is active
              </label>
              <div className="movie-form-actions">
                <button className="btn-back" type="button" onClick={() => setScreenEditor(null)} disabled={savingScreen}>Cancel</button>
                <button className="btn btn-add-movie" type="submit" disabled={savingScreen}>
                  {savingScreen ? 'Saving screen...' : screenEditor.screenId ? 'Save Screen' : 'Add Screen'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
