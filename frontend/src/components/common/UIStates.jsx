import { Link } from 'react-router-dom';
import './UIStates.css';

/* ── Loading Spinner (standard spinner used across other teammate pages) ── */
export const LoadingSpinner = ({ text }) => (
  <div className="flex flex-col justify-center items-center py-16 gap-3" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '4rem 0', gap: '0.75rem' }}>
    <div
      className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
      style={{
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        border: '3px solid transparent',
        borderTopColor: 'var(--color-primary, #dc2626)',
        borderBottomColor: 'var(--color-primary, #dc2626)',
        animation: 'spin 1s linear infinite',
      }}
    />
    {text && <p style={{ color: 'var(--color-text-secondary, #94a3b8)', fontSize: '0.875rem' }}>{text}</p>}
  </div>
);

/* ── Loading Skeleton Grid (used for Home movie cards) ──────────────── */
export const LoadingSkeleton = ({ count = 8 }) => (
  <div className="skeleton-grid" aria-label="Loading movies..." aria-busy="true">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="skeleton-card" aria-hidden="true">
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
  <div className="ui-error" role="alert">
    <span className="ui-error-icon" aria-hidden="true">⚠️</span>
    <p className="ui-error-text">{message || 'Something went wrong. Please try again.'}</p>
    {onRetry && (
      <button type="button" className="ui-retry-btn" onClick={onRetry}>
        Try Again
      </button>
    )}
  </div>
);

/* ── Empty State ───────────────────────────────────────────────────── */
export const EmptyState = ({
  title,
  message,
  icon: Icon,
  actionText,
  actionLink,
  onClear,
  clearText = 'Clear Filters',
}) => (
  <div className="ui-empty" role="status">
    {Icon && <Icon size={56} className="ui-empty-icon" aria-hidden="true" />}
    {title && <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-primary, #f8fafc)', margin: 0 }}>{title}</h3>}
    <p className="ui-empty-text">{message || 'No data available.'}</p>
    {actionText && actionLink && (
      <Link to={actionLink} className="ui-clear-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
        {actionText}
      </Link>
    )}
    {onClear && (
      <button type="button" className="ui-clear-btn" onClick={onClear}>
        {clearText}
      </button>
    )}
  </div>
);

