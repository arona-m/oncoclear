import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './HomePage.css';

const HomePage = () => {
  const { t } = useTranslation();

  const FEATURES = [
    { icon: '◉', title: t('home.features.f1title'), desc: t('home.features.f1desc') },
    { icon: '⊞', title: t('home.features.f2title'), desc: t('home.features.f2desc') },
    { icon: '✓', title: t('home.features.f3title'), desc: t('home.features.f3desc') },
    { icon: '⊕', title: t('home.features.f4title'), desc: t('home.features.f4desc') },
  ];

  const STATS = [
    { value: '20M+', label: t('home.stats.cases') },
    { value: '9.7M', label: t('home.stats.deaths') },
    { value: '53.5M', label: t('home.stats.living') },
    { value: '50%', label: t('home.stats.preventable') },
  ];

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container">
          <div className="hero-inner">
            <div className="hero-content">
              <div className="hero-badge">
                <span className="badge badge-teal">{t('home.badge')}</span>
              </div>
              <h1 className="hero-title">
                {t('home.heroTitle1')}<br />
                <em>{t('home.heroTitle2')}</em>
              </h1>
              <p className="hero-desc">{t('home.heroDesc')}</p>
              <div className="hero-actions">
                <Link to="/register" className="btn btn-primary hero-cta">{t('home.getStarted')}</Link>
                <Link to="/login" className="btn btn-outline">{t('home.signIn')}</Link>
              </div>
              <p className="hero-note">{t('home.heroNote')}</p>
            </div>

            <div className="hero-visual">
              <div className="visual-card">
                <div className="visual-stat">
                  <span className="vs-num">20M+</span>
                  <span className="vs-label">{t('home.newCasesYear')}</span>
                </div>
                <div className="visual-divider" />
                <div className="visual-list">
                  {['Lung', 'Breast', 'Colorectal', 'Prostate', 'Skin'].map((c, i) => (
                    <div key={c} className="visual-item">
                      <span className="vi-rank">#{i + 1}</span>
                      <span className="vi-name">{c}</span>
                      <div className="vi-bar"><div className="vi-fill" style={{ width: `${100 - i * 16}%` }} /></div>
                    </div>
                  ))}
                </div>
                <div className="visual-source">{t('home.whoSource')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

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

      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2>{t('home.features.title')}</h2>
            <p>{t('home.features.subtitle')}</p>
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

      <section className="home-cta">
        <div className="container">
          <div className="cta-inner">
            <h2>{t('home.cta.title')}</h2>
            <p>{t('home.cta.subtitle')}</p>
            <Link to="/register" className="btn btn-primary" style={{ fontSize: 15, padding: '12px 28px' }}>
              {t('home.cta.button')}
            </Link>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <div className="container">
          <div className="footer-inner">
            <div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>⊕ OncoClear</span>
              <p>{t('home.footer.disclaimer')}</p>
            </div>
            <div className="footer-sources">
              <span>{t('home.footer.sources')}</span>
              <a href="https://gco.iarc.fr" target="_blank" rel="noopener noreferrer">WHO/IARC GLOBOCAN</a>
              <a href="https://cloud.google.com/bigquery/public-data" target="_blank" rel="noopener noreferrer">Google BigQuery</a>
              <a href="https://www.who.int/news-room/fact-sheets/detail/cancer" target="_blank" rel="noopener noreferrer">WHO Cancer Facts</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
