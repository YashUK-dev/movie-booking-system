import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { movieService } from '../services/movieService';
import { showService } from '../services/showService';
import { theatreService } from '../services/theatreService';
import { LoadingSpinner, ErrorMessage } from '../components/common/UIStates';
import { Star, Clock, Calendar, Globe, Film, Pencil, X, Trash2, AlertTriangle } from 'lucide-react';
import './MovieDetails.css';

const movieStatuses = ['UPCOMING', 'NOW_SHOWING', 'ENDED', 'INACTIVE'];
const showStatuses = ['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED'];
const showStatusLabels = {
  SCHEDULED: 'Scheduled',
  ONGOING: 'Now Showing',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};
const initialShowForm = {
  theatreId: '',
  screenId: '',
  startTime: '',
  endTime: '',
  language: '',
  format: '2D',
  basePrice: '',
};

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showsLoading, setShowsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editor, setEditor] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editMessage, setEditMessage] = useState(null);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [deletingMovie, setDeletingMovie] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [isCreateShowOpen, setIsCreateShowOpen] = useState(false);
  const [createShowForm, setCreateShowForm] = useState(initialShowForm);
  const [createShowError, setCreateShowError] = useState(null);
  const [createShowLoading, setCreateShowLoading] = useState(false);
  const [savingShow, setSavingShow] = useState(false);
  const [theatres, setTheatres] = useState([]);
  const [screens, setScreens] = useState([]);
  
  // Generate next 7 days for date selection
  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });
  
  const [selectedDate, setSelectedDate] = useState(dates[0]);

  const fetchMovie = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
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
  }, [id]);

  const fetchShows = useCallback(async () => {
    try {
      setShowsLoading(true);
      const res = await showService.getShows({ movieId: id, date: selectedDate });
      if (res?.success) {
        setShows(res.data);
      }
    } catch (err) {
      console.error('Failed to load showtimes', err);
      setShows([]);
    } finally {
      setShowsLoading(false);
    }
  }, [id, selectedDate]);

  useEffect(() => {
    Promise.resolve().then(fetchMovie);
  }, [fetchMovie]);

  useEffect(() => {
    if (movie) {
      Promise.resolve().then(fetchShows);
    }
  }, [selectedDate, movie, fetchShows]);

  const openMovieEditor = () => {
    setEditForm({
      title: movie.title || '',
      description: movie.description || '',
      language: movie.language || '',
      genres: movie.genres?.join(', ') || '',
      duration: movie.duration ?? '',
      releaseDate: movie.releaseDate ? new Date(movie.releaseDate).toISOString().slice(0, 10) : '',
      certificate: movie.certificate || '',
      posterUrl: movie.posterUrl || '',
      trailerUrl: movie.trailerUrl || '',
      rating: movie.rating ?? '',
      status: movie.status || 'UPCOMING',
    });
    setEditError(null);
    setEditMessage(null);
    setEditor({ type: 'movie', id: movie._id });
  };

  const openShowEditor = (show) => {
    setEditForm({ status: show.status || 'SCHEDULED' });
    setEditError(null);
    setEditMessage(null);
    setEditor({ type: 'show', id: show._id });
  };

  const openCreateShowForm = async () => {
    if (!isAdmin) return;
    setCreateShowForm({
      ...initialShowForm,
      language: movie.language || '',
    });
    setScreens([]);
    setCreateShowError(null);
    setIsCreateShowOpen(true);
    setCreateShowLoading(true);

    try {
      const res = await theatreService.getTheatres({ limit: 100 });
      if (!res?.success) {
        throw new Error(res?.message || 'Failed to load theatres');
      }
      setTheatres((res.data || []).filter((theatre) => theatre.isActive !== false));
    } catch (err) {
      setCreateShowError(err?.response?.data?.message || err.message || 'Unable to load theatres');
    } finally {
      setCreateShowLoading(false);
    }
  };

  const closeCreateShowForm = () => {
    if (!savingShow) {
      setIsCreateShowOpen(false);
      setCreateShowError(null);
    }
  };

  const handleCreateShowFormChange = async (event) => {
    const { name, value } = event.target;
    setCreateShowForm((form) => ({ ...form, [name]: value }));

    if (name === 'theatreId') {
      setCreateShowForm((form) => ({ ...form, screenId: '' }));
      setScreens([]);
      setCreateShowError(null);
      if (!value) return;

      setCreateShowLoading(true);
      try {
        const res = await theatreService.getScreensByTheatre(value);
        if (!res?.success) {
          throw new Error(res?.message || 'Failed to load screens');
        }
        setScreens(res.data || []);
      } catch (err) {
        setCreateShowError(err?.response?.data?.message || err.message || 'Unable to load screens for this theatre');
      } finally {
        setCreateShowLoading(false);
      }
    }
  };

  const handleCreateShow = async (event) => {
    event.preventDefault();
    if (!isAdmin || !movie) return;

    const startTime = new Date(createShowForm.startTime);
    const endTime = new Date(createShowForm.endTime);
    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime()) || startTime >= endTime) {
      setCreateShowError('Show end time must be after its start time.');
      return;
    }

    setSavingShow(true);
    setCreateShowError(null);
    try {
      const res = await showService.createShow({
        movieId: movie._id,
        screenId: createShowForm.screenId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        language: createShowForm.language.trim(),
        format: createShowForm.format,
        basePrice: Number(createShowForm.basePrice),
      });
      if (!res?.success) {
        throw new Error(res?.message || 'Failed to create show');
      }

      const showDate = createShowForm.startTime.slice(0, 10);
      setIsCreateShowOpen(false);
      setEditMessage('Show timing added successfully.');
      if (showDate === selectedDate) {
        await fetchShows();
      } else {
        setSelectedDate(showDate);
      }
    } catch (err) {
      setCreateShowError(err?.response?.data?.message || err.message || 'Unable to create show');
    } finally {
      setSavingShow(false);
    }
  };

  const closeEditor = () => {
    if (!editSaving) {
      setEditor(null);
      setEditError(null);
    }
  };

  const handleEditFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setEditForm((form) => ({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!isAdmin || !editor) return;

    setEditSaving(true);
    setEditError(null);
    try {
      let res;
      if (editor.type === 'movie') {
        const movieUpdate = {
          ...editForm,
          duration: Number(editForm.duration),
          genres: editForm.genres.split(',').map((genre) => genre.trim()).filter(Boolean),
          rating: editForm.rating === '' ? undefined : Number(editForm.rating),
        };
        if (!movieUpdate.posterUrl) delete movieUpdate.posterUrl;
        if (!movieUpdate.trailerUrl) delete movieUpdate.trailerUrl;
        res = await movieService.updateMovie(editor.id, movieUpdate);
      } else if (editor.type === 'show') {
        res = await showService.updateShowStatus(editor.id, editForm.status);
      }

      if (!res?.success) {
        throw new Error(res?.message || 'Failed to save changes');
      }

      const editorType = editor.type;
      setEditor(null);
      setEditMessage(`${editorType === 'movie' ? 'Movie' : 'Show'} details updated.`);
      if (editorType === 'movie') {
        await fetchMovie();
      } else {
        await fetchShows();
      }
    } catch (err) {
      setEditError(err?.response?.data?.message || err.message || 'Unable to save changes');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteMovie = async () => {
    if (!isAdmin || !movie || deletingMovie) return;

    setDeletingMovie(true);
    setDeleteError(null);
    try {
      await movieService.deleteMovie(movie._id);
      navigate('/');
    } catch (err) {
      setDeleteError(err?.response?.data?.message || err.message || 'Unable to delete movie');
      setDeletingMovie(false);
    }
  };

  useEffect(() => {
    if (!editor && !isDeleteConfirmationOpen && !isCreateShowOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !editSaving && !deletingMovie && !savingShow) {
        setEditor(null);
        setEditError(null);
        setIsDeleteConfirmationOpen(false);
        setDeleteError(null);
        setIsCreateShowOpen(false);
        setCreateShowError(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editor, editSaving, isDeleteConfirmationOpen, deletingMovie, isCreateShowOpen, savingShow]);

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
            {isAdmin && (
              <button className="admin-edit-button" type="button" onClick={openMovieEditor}>
                <Pencil size={15} /> Edit movie details
              </button>
            )}
            {isAdmin && (
              <button
                className="admin-delete-button"
                type="button"
                onClick={() => {
                  setDeleteError(null);
                  setIsDeleteConfirmationOpen(true);
                }}
              >
                <Trash2 size={15} /> Delete movie
              </button>
            )}
            {isAdmin && (
              <button className="admin-edit-button" type="button" onClick={openCreateShowForm}>
                <Calendar size={15} /> Add show timing
              </button>
            )}
            
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
        <div className="showtimes-title-row">
          <h2 className="section-title">Book Tickets</h2>
          {editMessage && <p className="edit-success-message" role="status">{editMessage}</p>}
        </div>
        
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
                      <div className="showtime-admin-wrapper" key={show._id}>
                        <button
                          type="button"
                          onClick={() => handleShowSelect(show._id)}
                          className="showtime-btn"
                        >
                          <span className="showtime-time">{timeStr}</span>
                          <span className="showtime-meta">{show.format} • {show.screenName}</span>
                          <span className="showtime-price">₹{show.basePrice}</span>
                        </button>
                        {isAdmin && (
                          <button
                            className="admin-edit-button show-edit-button"
                            type="button"
                            onClick={() => openShowEditor(show)}
                          >
                            <Pencil size={14} /> Edit show
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isAdmin && editor && (
        <div
          className="details-editor-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeEditor();
          }}
        >
          <section className="details-editor" role="dialog" aria-modal="true" aria-labelledby="details-editor-title">
            <header className="details-editor-header">
              <div>
                <h2 id="details-editor-title">
                  {editor.type === 'movie' ? 'Edit Movie Details' : 'Edit Show Details'}
                </h2>
                <p>Changes are restricted to administrator accounts.</p>
              </div>
              <button className="details-editor-close" type="button" onClick={closeEditor} disabled={editSaving} aria-label="Close editor">
                <X size={20} />
              </button>
            </header>

            {editError && <div className="details-editor-error" role="alert">{editError}</div>}
            <form className="details-editor-form" onSubmit={handleEditSubmit}>
                {editor.type === 'movie' && (
                  <>
                    <label>Title<input name="title" value={editForm.title} onChange={handleEditFormChange} required /></label>
                    <label>Description<textarea name="description" value={editForm.description} onChange={handleEditFormChange} rows="3" required /></label>
                    <div className="details-editor-grid">
                      <label>Language<input name="language" value={editForm.language} onChange={handleEditFormChange} required /></label>
                      <label>Genres (comma-separated)<input name="genres" value={editForm.genres} onChange={handleEditFormChange} required /></label>
                      <label>Duration (minutes)<input name="duration" type="number" min="1" value={editForm.duration} onChange={handleEditFormChange} required /></label>
                      <label>Release date<input name="releaseDate" type="date" value={editForm.releaseDate} onChange={handleEditFormChange} required /></label>
                      <label>Certificate<input name="certificate" value={editForm.certificate} onChange={handleEditFormChange} required /></label>
                      <label>Rating (0–10)<input name="rating" type="number" min="0" max="10" step="0.1" value={editForm.rating} onChange={handleEditFormChange} /></label>
                      <label>Status<select name="status" value={editForm.status} onChange={handleEditFormChange}>{movieStatuses.map((status) => <option key={status} value={status}>{status.replace('_', ' ')}</option>)}</select></label>
                      <label>Poster URL<input name="posterUrl" type="url" value={editForm.posterUrl} onChange={handleEditFormChange} /></label>
                      <label className="details-editor-full-width">Trailer URL<input name="trailerUrl" type="url" value={editForm.trailerUrl} onChange={handleEditFormChange} /></label>
                    </div>
                  </>
                )}
                {editor.type === 'show' && (
                  <label>
                    Show status
                    <select name="status" value={editForm.status} onChange={handleEditFormChange} required>
                      {showStatuses.map((status) => (
                        <option key={status} value={status}>{showStatusLabels[status]}</option>
                      ))}
                    </select>
                  </label>
                )}
                <div className="details-editor-actions">
                  <button className="details-editor-cancel" type="button" onClick={closeEditor} disabled={editSaving}>Cancel</button>
                  <button className="admin-edit-button" type="submit" disabled={editSaving}>
                    {editSaving ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
            </form>
          </section>
        </div>
      )}

      {isAdmin && isCreateShowOpen && (
        <div
          className="details-editor-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeCreateShowForm();
          }}
        >
          <section className="details-editor" role="dialog" aria-modal="true" aria-labelledby="create-show-title">
            <header className="details-editor-header">
              <div>
                <h2 id="create-show-title">Add Show Timing</h2>
                <p>Create a show for {movie.title} at a selected theatre and screen.</p>
              </div>
              <button
                className="details-editor-close"
                type="button"
                onClick={closeCreateShowForm}
                disabled={savingShow}
                aria-label="Close add show form"
              >
                <X size={20} />
              </button>
            </header>

            {createShowError && <div className="details-editor-error" role="alert">{createShowError}</div>}
            {createShowLoading && theatres.length === 0 ? (
              <LoadingSpinner text="Loading theatres..." />
            ) : (
              <form className="details-editor-form" onSubmit={handleCreateShow}>
                <div className="details-editor-grid">
                  <label className="details-editor-full-width">
                    Theatre
                    <select name="theatreId" value={createShowForm.theatreId} onChange={handleCreateShowFormChange} required>
                      <option value="">Select a theatre</option>
                      {theatres.map((theatre) => (
                        <option key={theatre._id} value={theatre._id}>{theatre.name} — {theatre.city}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Screen
                    <select
                      name="screenId"
                      value={createShowForm.screenId}
                      onChange={handleCreateShowFormChange}
                      required
                      disabled={!createShowForm.theatreId || createShowLoading}
                    >
                      <option value="">{createShowLoading ? 'Loading screens...' : 'Select a screen'}</option>
                      {screens.map((screen) => (
                        <option key={screen._id} value={screen._id}>{screen.name} (Screen {screen.screenNumber})</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Language
                    <input name="language" value={createShowForm.language} onChange={handleCreateShowFormChange} required />
                  </label>
                  <label>
                    Start time
                    <input name="startTime" type="datetime-local" value={createShowForm.startTime} onChange={handleCreateShowFormChange} required />
                  </label>
                  <label>
                    End time
                    <input name="endTime" type="datetime-local" value={createShowForm.endTime} onChange={handleCreateShowFormChange} required />
                  </label>
                  <label>
                    Format
                    <select name="format" value={createShowForm.format} onChange={handleCreateShowFormChange}>
                      <option value="2D">2D</option>
                      <option value="3D">3D</option>
                      <option value="IMAX">IMAX</option>
                      <option value="4DX">4DX</option>
                    </select>
                  </label>
                  <label>
                    Base ticket price
                    <input name="basePrice" type="number" min="0" step="0.01" value={createShowForm.basePrice} onChange={handleCreateShowFormChange} required />
                  </label>
                </div>
                <div className="details-editor-actions">
                  <button className="details-editor-cancel" type="button" onClick={closeCreateShowForm} disabled={savingShow}>Cancel</button>
                  <button className="admin-edit-button" type="submit" disabled={savingShow || createShowLoading}>
                    {savingShow ? 'Creating show...' : 'Create Show'}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}

      {isAdmin && isDeleteConfirmationOpen && (
        <div
          className="details-editor-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deletingMovie) {
              setIsDeleteConfirmationOpen(false);
              setDeleteError(null);
            }
          }}
        >
          <section className="movie-delete-confirmation" role="alertdialog" aria-modal="true" aria-labelledby="delete-movie-title">
            <div className="delete-confirmation-icon"><AlertTriangle size={24} /></div>
            <h2 id="delete-movie-title">Delete “{movie.title}”?</h2>
            <p>This will permanently remove the movie from the catalog. This action cannot be undone.</p>
            {deleteError && <div className="details-editor-error" role="alert">{deleteError}</div>}
            <div className="details-editor-actions">
              <button
                className="details-editor-cancel"
                type="button"
                onClick={() => {
                  setIsDeleteConfirmationOpen(false);
                  setDeleteError(null);
                }}
                disabled={deletingMovie}
              >
                Cancel
              </button>
              <button className="admin-delete-button" type="button" onClick={handleDeleteMovie} disabled={deletingMovie}>
                <Trash2 size={15} /> {deletingMovie ? 'Deleting...' : 'Delete movie'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default MovieDetails;
