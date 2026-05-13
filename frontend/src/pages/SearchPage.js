import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCancerData } from '../hooks/useCancerData';
import './SearchPage.css';

const QUICK_SEARCHES = [
  'Lung', 'Breast', 'Skin', 'Colorectal', 'Prostate',
  'Liver', 'Stomach', 'Cervical', 'Leukemia', 'Pancreatic'
];

const fmt = (n) => {
  if (!n) return 'N/A';
  if (n >= 1000000) return `${(n/1000000).toFixed(2)}M`;
  if (n >= 1000) return `${Math.round(n/1000)}K`;
  return n.toLocaleString();
};

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQ);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [history, setHistory] = useState([]);
  const { searchCancer, getSearchHistory, loading } = useCancerData();
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  // Load history
  useEffect(() => {
    getSearchHistory().then(res => {
      if (res?.history) setHistory(res.history.slice(0, 5));
    });
  }, [getSearchHistory]);

  // Auto-search from URL param
  useEffect(() => {
    if (initialQ) {
      handleSearch(initialQ);
    }
  // eslint-disable-next-line
  }, []);

  const handleSearch = async (term) => {
    const q = (term || query).trim();
    if (!q || q.length < 2) return;

    setError('');
    setSuggestions([]);
    setResult(null);
    setSearchParams({ q });

    const res = await searchCancer(q);

    if (!res) return;
    if (!res.success) {
      setError(res.message || 'No results found.');
      if (res.suggestions) setSuggestions(res.suggestions);
    } else {
      setResult(res.data);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleQuick = (term) => {
    setQuery(term);
    handleSearch(term);
  };

  const info = result?.cancer_info;
  const whoStats = result?.who_stats;

  return (
    <div className="search-page">
      <div className="container">

        {/* Search Hero */}
        <div className="search-hero">
          <h1>Search Cancer Information</h1>
          <p>
            Enter a cancer type to get global statistics, risk factors,
            and evidence-based prevention strategies.
          </p>

          <div className="search-box">
            <span className="search-icon">⊕</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Try "lung", "breast", "skin cancer"...'
              className="search-input"
              autoFocus
            />
            <button
              className="btn btn-primary search-btn"
              onClick={() => handleSearch()}
              disabled={loading || !query.trim()}
            >
              {loading ? <span className="spinner" /> : 'Search'}
            </button>
          </div>

          {/* Quick searches */}
          <div className="quick-searches">
            <span className="quick-label">Quick:</span>
            {QUICK_SEARCHES.map(t => (
              <button
                key={t}
                className={`quick-tag ${query.toLowerCase() === t.toLowerCase() ? 'active' : ''}`}
                onClick={() => handleQuick(t)}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Recent history */}
          {history.length > 0 && !result && (
            <div className="recent-searches">
              <span className="quick-label">Recent:</span>
              {history.map((h, i) => (
                <button
                  key={i}
                  className="quick-tag history"
                  onClick={() => handleQuick(h.term)}
                >
                  {h.term}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="search-error fade-in">
            <div className="alert alert-error">
              <span>⊘</span>
              <div>
                <strong>{error}</strong>
                {suggestions.length > 0 && (
                  <div className="error-suggestions">
                    Try: {suggestions.map((s, i) => (
                      <button key={i} className="suggestion-btn" onClick={() => handleQuick(s.split(' ')[0])}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && info && (
          <div ref={resultsRef} className="search-results fade-in-up">

            {/* Header */}
            <div className="result-header card">
              <div className="result-title-row">
                <div>
                  <span className="badge badge-teal" style={{ marginBottom: 8 }}>
                    ICD-10: {info.icd10}
                  </span>
                  <h2>{info.name}</h2>
                  <p className="result-desc">{info.description}</p>
                </div>
                <div className="result-stat-badge">
                  <div className="big-stat-label">5-Year Survival</div>
                  <div className="big-stat-value">{info.survival_rate_5yr}</div>
                </div>
              </div>
            </div>

            {/* WHO Stats */}
            {whoStats && (
              <div className="stats-row">
                {whoStats.global_new_cases && (
                  <div className="card stat-mini">
                    <div className="stat-mini-icon" style={{ background: '#e6f7fa', color: '#0b7285' }}>◉</div>
                    <div className="stat-mini-value">{fmt(whoStats.global_new_cases)}</div>
                    <div className="stat-mini-label">New Cases Globally (2022)</div>
                    <div className="stat-source">{whoStats.source}</div>
                  </div>
                )}
                {whoStats.global_deaths && (
                  <div className="card stat-mini">
                    <div className="stat-mini-icon" style={{ background: '#fdf2f2', color: '#c0392b' }}>✕</div>
                    <div className="stat-mini-value">{fmt(whoStats.global_deaths)}</div>
                    <div className="stat-mini-label">Deaths Globally (2022)</div>
                    <div className="stat-source">{whoStats.source}</div>
                  </div>
                )}
                {whoStats.world_rank && (
                  <div className="card stat-mini">
                    <div className="stat-mini-icon" style={{ background: '#fffbeb', color: '#d97706' }}>⊞</div>
                    <div className="stat-mini-value">#{whoStats.world_rank}</div>
                    <div className="stat-mini-label">World Rank by Incidence</div>
                    <div className="stat-source">{whoStats.source}</div>
                  </div>
                )}
                {whoStats.global_new_cases && whoStats.global_deaths && (
                  <div className="card stat-mini">
                    <div className="stat-mini-icon" style={{ background: '#f0faf5', color: '#2e7d52' }}>⚕</div>
                    <div className="stat-mini-value">
                      {((whoStats.global_deaths / whoStats.global_new_cases) * 100).toFixed(1)}%
                    </div>
                    <div className="stat-mini-label">Case Fatality Rate</div>
                    <div className="stat-source">Calculated</div>
                  </div>
                )}
              </div>
            )}

            {/* 3-column info grid */}
            <div className="info-grid">

              {/* Risk Factors */}
              <div className="card info-card">
                <div className="info-card-header risk">
                  <span className="info-icon">⚠</span>
                  <h4>Risk Factors</h4>
                </div>
                <ul className="info-list">
                  {info.risk_factors.map((r, i) => (
                    <li key={i} className="info-item risk-item">
                      <span className="item-dot" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Prevention */}
              <div className="card info-card prevention-card">
                <div className="info-card-header prevention">
                  <span className="info-icon">✓</span>
                  <h4>How to Protect Yourself</h4>
                </div>
                <ul className="info-list">
                  {info.prevention.map((p, i) => (
                    <li key={i} className="info-item prevention-item">
                      <span className="prevention-num">{i + 1}</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Warning Signs */}
              <div className="card info-card">
                <div className="info-card-header signs">
                  <span className="info-icon">◉</span>
                  <h4>Early Warning Signs</h4>
                </div>
                <ul className="info-list">
                  {info.early_signs.map((s, i) => (
                    <li key={i} className="info-item sign-item">
                      <span className="item-dot warning" />
                      {s}
                    </li>
                  ))}
                </ul>

                <div className="divider" style={{ margin: '16px 0' }} />

                <div className="screening-box">
                  <div className="screening-label">Recommended Screening</div>
                  <p className="screening-text">{info.screening}</p>
                </div>
              </div>
            </div>

            {/* BigQuery Data note */}
            {result?.bigquery_data && (
              <div className="card bq-card">
                <div className="bq-header">
                  <div>
                    <h4>Live BigQuery Data</h4>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                      {result.bigquery_data.note || 'Sourced from Google BigQuery public datasets'}
                    </p>
                  </div>
                  <span className="badge badge-teal">BigQuery Live</span>
                </div>
                {result.bigquery_data.data?.length > 0 && (
                  <div className="bq-table-wrapper">
                    <table className="data-table" style={{ fontSize: 12 }}>
                      <thead>
                        <tr>
                          {Object.keys(result.bigquery_data.data[0]).slice(0, 5).map(k => (
                            <th key={k}>{k.replace(/_/g, ' ')}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.bigquery_data.data.slice(0, 8).map((row, i) => (
                          <tr key={i}>
                            {Object.values(row).slice(0, 5).map((v, j) => (
                              <td key={j}>{typeof v === 'number' ? v.toFixed(2) : String(v ?? '—')}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {result.bigquery_data.error && (
                  <div className="alert alert-info" style={{ marginTop: 12, fontSize: 13 }}>
                    <span>ℹ</span>
                    BigQuery not yet configured — showing WHO/GLOBOCAN 2022 data above.
                    Follow the setup guide in <code>/server/.env.example</code> to enable live queries.
                  </div>
                )}
              </div>
            )}

            {/* Disclaimer */}
            <div className="disclaimer">
              <span>⚕</span>
              <p>
                This information is for educational purposes only and is sourced from WHO, IARC GLOBOCAN 2022,
                and Google BigQuery public health datasets. It does not replace professional medical advice.
                Always consult a qualified healthcare professional for personal health decisions.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
