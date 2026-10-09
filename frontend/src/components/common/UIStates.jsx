import './UIStates.css';

/* ── Loading Skeleton Grid ─────────────────────────────────────────── */
export const LoadingSpinner = () => (
  <div className="skeleton-grid">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="skeleton-card">
        <div className="skeleton-poster shimmer" />
        <div className="skeleton-body">
          <div className="skeleton-line shimmer" style={{ width: '75%' }} />
          <div className="skeleton-line shimmer" style={{ width: '50%' }} />
        </div>
      </div>
    ))}
  </div>
);

/* ── Error Message ─────────────────────────────────────────────────── */
export const ErrorMessage = ({ message, onRetry }) => (
  <div className="ui-error">
    <span className="ui-error-icon">⚠️</span>
    <p className="ui-error-text">{message || 'Something went wrong. Please try again.'}</p>
    {onRetry && (
      <button className="ui-retry-btn" onClick={onRetry}>
        Try Again
      </button>
    )}
  </div>
);

/* ── Empty State ───────────────────────────────────────────────────── */
export const EmptyState = ({ message, icon: Icon }) => (
  <div className="ui-empty">
    {Icon && <Icon size={56} className="ui-empty-icon" />}
    <p className="ui-empty-text">{message || 'No data available.'}</p>
  </div>
);
