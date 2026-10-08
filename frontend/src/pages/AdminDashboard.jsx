import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';
import { LoadingSpinner, ErrorMessage } from '../components/common/UIStates';
import { 
  Users, Film, Building2, Calendar, Ticket, 
  CheckCircle2, XCircle, IndianRupee, RefreshCw, 
  ShieldAlert, ShieldCheck, Clock, MapPin, ArrowLeft
} from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login?redirect=/admin');
      } else if (user.role === 'ADMIN') {
        fetchStats();
      }
    }
  }, [user, authLoading, navigate]);

  const fetchStats = async () => {
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
  };

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
    </div>
  );
};

export default AdminDashboard;
