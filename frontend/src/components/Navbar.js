import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">⊕</span>
          <span className="brand-text">OncoClear</span>
        </Link>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <span />
          <span />
          <span />
        </button>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                Overview
              </Link>
              <Link
                to="/search"
                className={`nav-link ${isActive('/search') ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                Search
              </Link>
              <Link
                to="/data"
                className={`nav-link ${isActive('/data') ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                Live Data
              </Link>

              <div className="navbar-user">
                <span className="user-avatar">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
                <span className="user-name">{user?.firstName}</span>
                <button className="btn btn-ghost nav-logout" onClick={logout}>
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className={`nav-link ${isActive('/login') ? 'active' : ''}`}>
                Sign in
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ fontSize: 13, padding: '8px 16px' }}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
