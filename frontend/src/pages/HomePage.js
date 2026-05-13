import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const FEATURES = [
  {
    icon: '◉',
    title: 'Real WHO Data',
    desc: 'Cancer statistics sourced directly from WHO/IARC GLOBOCAN 2022 — 20 million+ cases across 185 countries.'
  },
  {
    icon: '⊞',
    title: 'BigQuery Analytics',
    desc: 'Live queries against Google BigQuery public health datasets, including World Bank Health Population data.'
  },
  {
    icon: '✓',
    title: 'Prevention Guides',
    desc: 'Evidence-based prevention strategies, early warning signs, and screening recommendations per cancer type.'
  },
  {
    icon: '⊕',
    title: '10 Cancer Types',
    desc: 'Detailed profiles for lung, breast, colorectal, prostate, skin, liver, stomach, cervical, leukemia, and pancreatic cancers.'
  }
];

const STATS = [
  { value: '20M+', label: 'New cancer cases in 2022' },
  { value: '9.7M', label: 'Deaths from cancer in 2022' },
  { value: '53.5M', label: 'People living with cancer (5yr)' },
  { value: '50%', label: 'Cancers that are preventable' },
];

const HomePage = () => (
  <div className="home-page">
    {/* Hero */}
    <section className="hero">
      <div className="container">
        <div className="hero-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge badge-teal">WHO/IARC · BigQuery · GLOBOCAN 2022</span>
            </div>
            <h1 className="hero-title">
              Understand cancer.<br />
              <em>Protect yourself.</em>
            </h1>
            <p className="hero-desc">
              OncoClear brings real global cancer data from WHO, IARC, and Google BigQuery
              into one platform, so you can understand the numbers, know the risks,
              and take action to protect your health.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary hero-cta">
                Get started free →
              </Link>
              <Link to="/login" className="btn btn-outline">
                Sign in
              </Link>
            </div>
            <p className="hero-note">
              Free to use · No credit card · Data from WHO &amp; Google BigQuery
            </p>
          </div>

          <div className="hero-visual">
            <div className="visual-card">
              <div className="visual-stat">
                <span className="vs-num">20M+</span>
                <span className="vs-label">new cases/year</span>
              </div>
              <div className="visual-divider" />
              <div className="visual-list">
                {['Lung', 'Breast', 'Colorectal', 'Prostate', 'Skin'].map((c, i) => (
                  <div key={c} className="visual-item">
                    <span className="vi-rank">#{i + 1}</span>
                    <span className="vi-name">{c}</span>
                    <div className="vi-bar">
                      <div className="vi-fill" style={{ width: `${100 - i * 16}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="visual-source">WHO/IARC GLOBOCAN 2022</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Stats Strip */}
    <section className="stats-strip">
      <div className="container">
        <div className="stats-inner">
          {STATS.map(s => (
            <div key={s.value} className="strip-stat">
              <span className="strip-num">{s.value}</span>
              <span className="strip-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="features">
      <div className="container">
        <div className="section-header">
          <h2>Built on real data</h2>
          <p>We combine official health databases with Google BigQuery to give you accurate, up-to-date cancer information.</p>
        </div>
        <div className="features-grid">
          {FEATURES.map(f => (
            <div key={f.title} className="feature-card card">
              <div className="feature-icon">{f.icon}</div>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA section */}
    <section className="home-cta">
      <div className="container">
        <div className="cta-inner">
          <h2>Start exploring cancer data today</h2>
          <p>Create a free account to access global statistics, search any cancer type, and get personalized prevention guides.</p>
          <Link to="/register" className="btn btn-primary" style={{ fontSize: 15, padding: '12px 28px' }}>
            Create free account →
          </Link>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="home-footer">
      <div className="container">
        <div className="footer-inner">
          <div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>⊕ OncoClear</span>
            <p>Educational platform. Not a substitute for medical advice.</p>
          </div>
          <div className="footer-sources">
            <span>Data sources:</span>
            <a href="https://gco.iarc.fr" target="_blank" rel="noopener noreferrer">WHO/IARC GLOBOCAN</a>
            <a href="https://cloud.google.com/bigquery/public-data" target="_blank" rel="noopener noreferrer">Google BigQuery</a>
            <a href="https://www.who.int/news-room/fact-sheets/detail/cancer" target="_blank" rel="noopener noreferrer">WHO Cancer Facts</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
);

export default HomePage;
