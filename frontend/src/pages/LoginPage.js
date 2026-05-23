import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const LoginPage = () => {
  const { login, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => { if (isAuthenticated) navigate('/dashboard'); }, [isAuthenticated, navigate]);
  useEffect(() => { clearError(); }, [clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!email || !password) { setLocalError('Please enter your email and password.'); return; }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result?.success) setLocalError(result?.message || 'Login failed.');
  };

  const displayError = localError || error;

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <span className="brand-icon-lg">⊕</span>
          <h1>OncoClear</h1>
          <p>Knowledge that protects lives.</p>
        </div>
        <div className="auth-stats-preview">
          <div className="stat-pill"><span className="stat-number">1 in 5</span><span className="stat-label">people will develop cancer in their lifetime</span></div>
          <div className="stat-pill"><span className="stat-number">50%</span><span className="stat-label">of cancers are preventable</span></div>
        </div>
        <blockquote className="auth-quote">{t('auth.quote2')}</blockquote>
        <cite>{t('auth.quote2Source')}</cite>
      </div>

      <div className="auth-right">
        <div className="auth-form-card fade-in-up">
          <h2>{t('auth.loginTitle')}</h2>
          <p className="auth-subtitle">{t('auth.loginSubtitle')}</p>

          {displayError && (
            <div className="alert alert-error" style={{ marginBottom: 20 }}>
              <span>⚠</span> {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">{t('auth.email')}</label>
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); setLocalError(''); }} className="form-input" placeholder="jane@example.com" required autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">{t('auth.password')}</label>
              <input type="password" value={password} onChange={e => { setPassword(e.target.value); setLocalError(''); }} className="form-input" placeholder="Your password" required />
            </div>
            <button type="submit" className="btn btn-primary full-width" disabled={loading}>
              {loading ? <span className="spinner" /> : t('auth.loginButton')}
            </button>
          </form>

          <div className="auth-footer">
            <span>{t('auth.noAccount')}</span>
            <Link to="/register" className="auth-link">{t('auth.createOne')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
