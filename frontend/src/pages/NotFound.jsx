import { Link } from 'react-router-dom';
import { Film, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="container py-16 text-center flex flex-col items-center justify-center" style={{ minHeight: '60vh' }}>
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--border-radius-xl)',
        padding: 'var(--spacing-10) var(--spacing-8)',
        maxWidth: '480px',
        width: '100%',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: 'var(--border-radius-full)',
          background: 'rgba(220, 38, 38, 0.15)',
          color: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--spacing-6)'
        }}>
          <Film size={36} />
        </div>
        <h1 className="text-4xl font-bold mb-2 text-accent">404</h1>
        <h2 className="text-xl font-semibold mb-3">Scene Not Found</h2>
        <p className="text-secondary mb-6 text-sm">
          The page or movie you are looking for has been cut from the final reel or does not exist.
        </p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <Home size={16} />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
