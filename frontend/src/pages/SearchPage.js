import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCancerData } from '../hooks/useCancerData';
import './SearchPage.css';

const QUICK_KEYS = ['lung','breast','skin','colorectal','prostate','liver','stomach','cervical','leukemia','pancreatic'];

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
  const { t, i18n } = useTranslation();
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  const QUICK_SEARCHES = QUICK_KEYS.map(k => ({ key: k, label: t(`cancerTypes.${k}`) }));

  useEffect(() => {
    getSearchHistory().then(res => { if (res?.history) setHistory(res.history.slice(0, 5)); });
  }, [getSearchHistory]);

  useEffect(() => {
    if (initialQ) handleSearch(initialQ);
  // eslint-disable-next-line
  }, []);

  // Re-search when language changes to get translated content
  useEffect(() => {
    if (result && query) handleSearch(query);
  // eslint-disable-next-line
  }, [i18n.language]);

  const handleSearch = async (term) => {
    const q = (term || query).trim();
    if (!q || q.length < 2) return;
    setError(''); setSuggestions([]); setResult(null);
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

  const handleQuick = (term) => { setQuery(term); handleSearch(term); };

  const info = result?.cancer_info;
  const whoStats = result?.who_stats;

  return (
    <div className="search-page">
      <div className="container">
        <div className="search-hero">
          <h1>{t('search.title')}</h1>
          <p>{t('search.subtitle')}</p>

          <div className="search-box">
            <span className="search-icon">⊕</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder={t('search.placeholder')}
              className="search-input"
              autoFocus
            />
            <button className="btn btn-primary search-btn" onClick={() => handleSearch()} disabled={loading || !query.trim()}>
              {loading ? <span className="spinner" /> : t('search.button')}
            </button>
          </div>

          <div className="quick-searches">
            <span className="quick-label">{t('search.quick')}</span>
            {QUICK_SEARCHES.map(({ key, label }) => (
              <button key={key} className={`quick-tag ${query.toLowerCase() === key ? 'active' : ''}`} onClick={() => handleQuick(key)}>
                {label}
              </button>
            ))}
          </div>

          {history.length > 0 && !result && (
            <div className="recent-searches">
              <span className="quick-label">{t('search.recent')}</span>
              {history.map((h, i) => (
                <button key={i} className="quick-tag history" onClick={() => handleQuick(h.term)}>{h.term}</button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="search-error fade-in">
            <div className="alert alert-error">
              <span>⊘</span>
              <div>
                <strong>{error}</strong>
                {suggestions.length > 0 && (
                  <div className="error-suggestions">
                    {suggestions.map((s, i) => (
                      <button key={i} className="suggestion-btn" onClick={() => handleQuick(s.split(' ')[0])}>{s}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {result && info && (
          <div ref={resultsRef} className="search-results fade-in-up">
            <div className="result-header card">
              <div className="result-title-row">
                <div>
                  <span className="badge badge-teal" style={{ marginBottom: 8 }}>{t('search.icd10Label')} {info.icd10}</span>
                  <h2>{info.name}</h2>
                  <p className="result-desc">{info.description}</p>
                </div>
                <div className="result-stat-badge">
                  <div className="big-stat-label">{t('search.survivalLabel')}</div>
                  <div className="big-stat-value">{info.survival_rate_5yr}</div>
                </div>
              </div>
            </div>

            {whoStats && (
              <div className="stats-row">
                {whoStats.global_new_cases && (
                  <div className="card stat-mini">
                    <div className="stat-mini-icon" style={{ background: '#e6f7fa', color: '#0b7285' }}>◉</div>
                    <div className="stat-mini-value">{fmt(whoStats.global_new_cases)}</div>
                    <div className="stat-mini-label">{t('search.globalCases')}</div>
                    <div className="stat-source">{whoStats.source}</div>
                  </div>
                )}
                {whoStats.global_deaths && (
                  <div className="card stat-mini">
                    <div className="stat-mini-icon" style={{ background: '#fdf2f2', color: '#c0392b' }}>✕</div>
                    <div className="stat-mini-value">{fmt(whoStats.global_deaths)}</div>
                    <div className="stat-mini-label">{t('search.globalDeaths')}</div>
                    <div className="stat-source">{whoStats.source}</div>
                  </div>
                )}
                {whoStats.world_rank && (
                  <div className="card stat-mini">
                    <div className="stat-mini-icon" style={{ background: '#fffbeb', color: '#d97706' }}>⊞</div>
                    <div className="stat-mini-value">#{whoStats.world_rank}</div>
                    <div className="stat-mini-label">{t('search.worldRank')}</div>
                    <div className="stat-source">{whoStats.source}</div>
                  </div>
                )}
                {whoStats.global_new_cases && whoStats.global_deaths && (
                  <div className="card stat-mini">
                    <div className="stat-mini-icon" style={{ background: '#f0faf5', color: '#2e7d52' }}>⚕</div>
                    <div className="stat-mini-value">{((whoStats.global_deaths / whoStats.global_new_cases) * 100).toFixed(1)}%</div>
                    <div className="stat-mini-label">{t('search.fatalityRate')}</div>
                    <div className="stat-source">{t('search.calculated')}</div>
                  </div>
                )}
              </div>
            )}

            <div className="info-grid">
              <div className="card info-card">
                <div className="info-card-header risk">
                  <span className="info-icon">⚠</span>
                  <h4>{t('search.riskFactors')}</h4>
                </div>
                <ul className="info-list">
                  {(info.risk_factors || []).map((r, i) => (
                    <li key={i} className="info-item risk-item"><span className="item-dot" />{r}</li>
                  ))}
                </ul>
              </div>

              <div className="card info-card prevention-card">
                <div className="info-card-header prevention">
                  <span className="info-icon">✓</span>
                  <h4>{t('search.prevention')}</h4>
                </div>
                <ul className="info-list">
                  {(info.prevention || []).map((p, i) => (
                    <li key={i} className="info-item prevention-item">
                      <span className="prevention-num">{i + 1}</span>{p}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card info-card">
                <div className="info-card-header signs">
                  <span className="info-icon">◉</span>
                  <h4>{t('search.earlySigns')}</h4>
                </div>
                <ul className="info-list">
                  {(info.early_signs || []).map((s, i) => (
                    <li key={i} className="info-item sign-item"><span className="item-dot warning" />{s}</li>
                  ))}
                </ul>
                <div className="divider" style={{ margin: '16px 0' }} />
                <div className="screening-box">
                  <div className="screening-label">{t('search.screening')}</div>
                  <p className="screening-text">{info.screening}</p>
                </div>
              </div>
            </div>

            {result?.bigquery_data && (
              <div className="card bq-card">
                <div className="bq-header">
                  <div>
                    <h4>{t('search.liveData')}</h4>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                      {result.bigquery_data.note || t('search.liveSource')}
                    </p>
                  </div>
                  <span className="badge badge-teal">BigQuery Live</span>
                </div>
                {result.bigquery_data.data?.length > 0 && (
                  <div className="bq-table-wrapper">
                    <table className="data-table" style={{ fontSize: 12 }}>
                      <thead>
                        <tr>{Object.keys(result.bigquery_data.data[0]).slice(0, 5).map(k => <th key={k}>{k.replace(/_/g, ' ')}</th>)}</tr>
                      </thead>
                      <tbody>
                        {result.bigquery_data.data.slice(0, 8).map((row, i) => (
                          <tr key={i}>{Object.values(row).slice(0, 5).map((v, j) => <td key={j}>{typeof v === 'number' ? v.toFixed(2) : String(v ?? '—')}</td>)}</tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {result.bigquery_data.error && (
                  <div className="alert alert-info" style={{ marginTop: 12, fontSize: 13 }}>
                    <span>ℹ</span> {t('search.bqNotConfigured')} {t('search.bqSetupNote')} <code>backend/.env</code>
                  </div>
                )}
              </div>
            )}

            <div className="disclaimer">
              <span>⚕</span>
              <p>{t('search.disclaimer')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
