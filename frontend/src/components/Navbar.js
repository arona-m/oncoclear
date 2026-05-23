import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
  const currentLang = i18n.language;

  const toggleLang = () => {
    const next = currentLang === 'en' ? 'sq' : 'en';
    i18n.changeLanguage(next);
    localStorage.setItem('oncoclear_lang', next);
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">⊕</span>
          <span className="brand-text">OncoClear</span>
        </Link>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
                {t('nav.overview')}
              </Link>
              <Link to="/search" className={`nav-link ${isActive('/search') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
                {t('nav.search')}
              </Link>
              <Link to="/data" className={`nav-link ${isActive('/data') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
                {t('nav.liveData')}
              </Link>
              <div className="navbar-user">
                <span className="user-avatar">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                <span className="user-name">{user?.firstName}</span>
                <button className="btn btn-ghost nav-logout" onClick={logout}>{t('nav.signOut')}</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className={`nav-link ${isActive('/login') ? 'active' : ''}`}>{t('nav.signIn')}</Link>
              <Link to="/register" className="btn btn-primary" style={{ fontSize: 13, padding: '8px 16px' }}>{t('nav.getStarted')}</Link>
            </>
          )}

          {/* Language Toggle */}
          <button className="lang-toggle" onClick={toggleLang} title="Switch language">
            {currentLang === 'en' ? (
              <><span className="lang-flag">🇦🇱</span><span className="lang-label">SQ</span></>
            ) : (
              <><span className="lang-flag">🇬🇧</span><span className="lang-label">EN</span></>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
