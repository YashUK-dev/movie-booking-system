import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Film, User, LogOut, Shield } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="container flex justify-between items-center navbar-content">
        <Link to="/" className="navbar-logo flex items-center gap-2">
          <Film className="text-accent" size={28} />
          <span className="font-bold text-xl">CineRed</span>
        </Link>
        
        <div className="navbar-links flex items-center gap-6">
          <Link to="/" className="nav-link">Home</Link>
          {user ? (
            <>
              {user.role === 'ADMIN' && (
                <Link to="/admin" className="nav-link flex items-center gap-1 text-accent">
                  <Shield size={16} />
                  <span>Admin</span>
                </Link>
              )}
              <Link to="/profile" className="nav-link flex items-center gap-2">
                <User size={18} />
                <span>{user.name}</span>
              </Link>
              <button onClick={logout} className="nav-link flex items-center gap-2 text-danger hover-danger">
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary">Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
