import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './common.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-left">
          <Link to="/feed" className="nav-logo">
            <h2>LinkedIn</h2>
          </Link>
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search..." />
          </div>
        </div>
        
        <div className="nav-center">
          <Link to="/feed" className={`nav-item ${isActive('/feed') ? 'active' : ''}`}>
            <span className="nav-icon">🏠</span>
            <span>Home</span>
          </Link>
          <Link to="/connections" className={`nav-item ${isActive('/connections') ? 'active' : ''}`}>
            <span className="nav-icon">👥</span>
            <span>Network</span>
          </Link>
          <Link to={`/profile/${user?.id}`} className={`nav-item ${isActive(`/profile/${user?.id}`) ? 'active' : ''}`}>
            <span className="nav-icon">👤</span>
            <span>Profile</span>
          </Link>
          <Link to="/messages" className={`nav-item ${isActive('/messages') ? 'active' : ''}`}>
            <span className="nav-icon">✉️</span>
            <span>Messages</span>
          </Link>
          <Link to="/notifications" className={`nav-item ${isActive('/notifications') ? 'active' : ''}`}>
            <span className="nav-icon">🔔</span>
            <span>Notifications</span>
          </Link>
        </div>

        <div className="nav-right">
          <button onClick={handleLogout} className="logout-btn">Sign Out</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;