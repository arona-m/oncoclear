import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Argentina','Australia','Austria','Bangladesh',
  'Belgium','Brazil','Canada','Chile','China','Colombia','Czech Republic','Denmark',
  'Egypt','Ethiopia','Finland','France','Germany','Ghana','Greece','Hungary','India',
  'Indonesia','Iran','Iraq','Ireland','Israel','Italy','Japan','Jordan','Kenya','Kosovo',
  'Malaysia','Mexico','Morocco','Netherlands','New Zealand','Nigeria','Norway',
  'Pakistan','Peru','Philippines','Poland','Portugal','Romania','Russia','Saudi Arabia',
  'South Africa','South Korea','Spain','Sweden','Switzerland','Thailand','Turkey',
  'Ukraine','United Kingdom','United States','Vietnam','Other'
];

const RegisterPage = () => {
  const { register, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '',
    password: '', confirmPassword: '', country: '', dateOfBirth: ''
  });
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setLocalError('');
  };

  const validateStep1 = () => {
    if (!formData.firstName.trim() || formData.firstName.length < 2)
      return 'First name must be at least 2 characters.';
    if (!formData.lastName.trim() || formData.lastName.length < 2)
      return 'Last name must be at least 2 characters.';
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email))
      return 'Please enter a valid email address.';
    return null;
  };

  const validateStep2 = () => {
    if (!formData.password || formData.password.length < 8)
      return 'Password must be at least 8 characters.';
    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(formData.password))
      return 'Password must contain at least one letter and one number.';
    if (formData.password !== formData.confirmPassword)
      return 'Passwords do not match.';
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) { setLocalError(err); return; }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateStep2();
    if (err) { setLocalError(err); return; }

    setLoading(true);
    const result = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      country: formData.country,
      dateOfBirth: formData.dateOfBirth || undefined
    });
    setLoading(false);

    if (!result?.success) {
      setLocalError(result?.message || 'Registration failed.');
    }
  };

  const displayError = localError || error;

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <span className="brand-icon-lg">⊕</span>
          <h1>OncoClear</h1>
          <p>Real cancer data. Real protection.</p>
        </div>

        <div className="auth-stats-preview">
          <div className="stat-pill">
            <span className="stat-number">20M+</span>
            <span className="stat-label">new cases/year</span>
          </div>
          <div className="stat-pill">
            <span className="stat-number">9.7M</span>
            <span className="stat-label">deaths in 2022</span>
          </div>
          <div className="stat-pill">
            <span className="stat-number">10+</span>
            <span className="stat-label">cancer types</span>
          </div>
        </div>

        <blockquote className="auth-quote">
          "Early detection saves lives. Knowledge is the first step to protection."
        </blockquote>
        <cite>— World Health Organization</cite>
      </div>

      <div className="auth-right">
        <div className="auth-form-card fade-in-up">
          <div className="auth-steps">
            <div className={`step-dot ${step >= 1 ? 'active' : ''}`} />
            <div className={`step-line ${step >= 2 ? 'active' : ''}`} />
            <div className={`step-dot ${step >= 2 ? 'active' : ''}`} />
          </div>

          <h2>Create your account</h2>
          <p className="auth-subtitle">
            {step === 1 ? 'Step 1 of 2 — Your details' : 'Step 2 of 2 — Set your password'}
          </p>

          {displayError && (
            <div className="alert alert-error">
              <span>⚠</span> {displayError}
            </div>
          )}

          <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit}>
            {step === 1 && (
              <div className="form-fields fade-in">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">First name</label>
                    <input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Jane"
                      required
                      autoFocus
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last name</label>
                    <input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Smith"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email address</label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="jane@example.com"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Country <span className="optional">(optional)</span></label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="form-input"
                    >
                      <option value="">Select country</option>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date of birth <span className="optional">(optional)</span></label>
                    <input
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="form-input"
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary full-width">
                  Continue →
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="form-fields fade-in">
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Min. 8 characters with a number"
                    required
                    autoFocus
                  />
                  <div className="password-strength">
                    {formData.password && (
                      <>
                        <div className={`strength-bar ${getStrength(formData.password)}`} />
                        <span className="strength-label">{getStrengthLabel(formData.password)}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm password</label>
                  <input
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`form-input ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'error' : ''}`}
                    placeholder="Repeat your password"
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>
                    ← Back
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? <span className="spinner" /> : 'Create account'}
                  </button>
                </div>

                <p className="terms-note">
                  By registering, you acknowledge this platform provides educational
                  information. Always consult a medical professional for personal health advice.
                </p>
              </div>
            )}
          </form>

          <div className="auth-footer">
            <span>Already have an account?</span>
            <Link to="/login" className="auth-link">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

function getStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return 'weak';
  if (score === 2) return 'fair';
  if (score === 3) return 'good';
  return 'strong';
}

function getStrengthLabel(pwd) {
  const s = getStrength(pwd);
  return { weak: 'Weak', fair: 'Fair', good: 'Good', strong: 'Strong' }[s];
}

export default RegisterPage;
