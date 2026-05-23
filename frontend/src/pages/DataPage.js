import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid
} from 'recharts';
import './DataPage.css';

const API_BASE = process.env.REACT_APP_API_URL || '/api';
const API = `${API_BASE}/live`;

const COUNTRIES = [
  { code: 'USA', name: 'United States' },
  { code: 'GBR', name: 'United Kingdom' },
  { code: 'DEU', name: 'Germany' },
  { code: 'FRA', name: 'France' },
  { code: 'ITA', name: 'Italy' },
  { code: 'ESP', name: 'Spain' },
  { code: 'CHN', name: 'China' },
  { code: 'JPN', name: 'Japan' },
  { code: 'IND', name: 'India' },
  { code: 'BRA', name: 'Brazil' },
  { code: 'CAN', name: 'Canada' },
  { code: 'AUS', name: 'Australia' },
  { code: 'RUS', name: 'Russia' },
  { code: 'ZAF', name: 'South Africa' },
  { code: 'MEX', name: 'Mexico' },
  { code: 'KOR', name: 'South Korea' },
  { code: 'TUR', name: 'Turkey' },
  { code: 'ARG', name: 'Argentina' },
  { code: 'NGA', name: 'Nigeria' },
  { code: 'EGY', name: 'Egypt' },
  { code: 'PAK', name: 'Pakistan' },
  { code: 'IDN', name: 'Indonesia' },
  { code: 'ALB', name: 'Albania' },
];

const CustomTooltip = ({ active, payload, label, yLabel }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="tooltip-label">{label}</div>
      <div className="tooltip-value">
        {payload[0]?.value?.toFixed(2)}% <span>{yLabel}</span>
      </div>
    </div>
  );
};

const DataPage = () => {
  const { t } = useTranslation();

  const PRESET_QUERIES = [
    { id: 'top-countries', label: t('data.queries.topCountries'), icon: '⊞', description: t('data.queries.topCountriesDesc'), paramType: 'year', chartType: 'bar', color: '#0b7285', xKey: 'country_name', yKey: 'mortality_rate', yLabel: 'Mortality Rate (%)' },
    { id: 'country-trend', label: t('data.queries.countryTrend'), icon: '◉', description: t('data.queries.countryTrendDesc'), paramType: 'country', chartType: 'line', color: '#2e7d52', xKey: 'year', yKey: 'mortality_rate', yLabel: 'Mortality Rate (%)' },
    { id: 'year-comparison', label: t('data.queries.yearComparison'), icon: '⊕', description: t('data.queries.yearComparisonDesc'), paramType: 'year', chartType: 'bar', color: '#7b3fa0', xKey: 'region', yKey: 'mortality_rate', yLabel: 'Mortality Rate (%)' },
    { id: 'global-trend', label: t('data.queries.globalTrend'), icon: '⚕', description: t('data.queries.globalTrendDesc'), paramType: 'none', chartType: 'line', color: '#c0392b', xKey: 'year', yKey: 'avg_mortality_rate', yLabel: 'Avg Mortality Rate (%)' },
  ];

  const [selectedQuery, setSelectedQuery] = useState(PRESET_QUERIES[0] || null);
  const [year, setYear] = useState(2019);
  const [country, setCountry] = useState('USA');
  const [availableYears, setAvailableYears] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasRun, setHasRun] = useState(false);

  // Set default after PRESET_QUERIES is defined
  useEffect(() => {
    // Ensure selectedQuery is initialized if translations changed
    if (!selectedQuery && PRESET_QUERIES.length) setSelectedQuery(PRESET_QUERIES[0]);
  // eslint-disable-next-line
  }, [/* intentionally empty to run once */]);

  useEffect(() => {
    axios.get(`${API}/available-years`)
      .then(res => { if (res.data.success) setAvailableYears(res.data.years); })
      .catch(() => setAvailableYears([2021,2020,2019,2018,2017,2016,2015,2014,2013,2012,2010,2008,2005,2000]));
  }, []);

  const runQuery = useCallback(async (query, yr, ct) => {
    setLoading(true);
    setError('');
    setResult(null);
    setHasRun(true);
    try {
      let url = `${API}/${query.id}`;
      if (query.paramType === 'year') url += `?year=${yr}`;
      if (query.paramType === 'country') url += `?country=${ct}`;
      const { data } = await axios.get(url);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'BigQuery query failed.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQuerySelect = (q) => {
    setSelectedQuery(q);
    setResult(null);
    setError('');
    setHasRun(false);
  };

  const chartData = result?.data || [];

  const renderChart = () => {
    if (!chartData.length) return null;
    if (!selectedQuery) return null;
    const { chartType, xKey, yKey, yLabel, color } = selectedQuery;
    const tickFormatter = (val) => typeof val === 'string' && val.length > 14 ? val.slice(0, 13) + '…' : val;

    if (chartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#8896ab' }} angle={-40} textAnchor="end" interval={0} tickFormatter={tickFormatter} />
            <YAxis tick={{ fontSize: 11, fill: '#8896ab' }} unit="%" />
            <Tooltip content={<CustomTooltip yLabel={yLabel} />} />
            <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }
    return (
      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#8896ab' }} />
          <YAxis tick={{ fontSize: 11, fill: '#8896ab' }} unit="%" />
          <Tooltip content={<CustomTooltip yLabel={yLabel} />} />
          <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2.5} dot={{ r: 3, fill: color }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="data-page">
      <div className="container">
        <div className="data-hero">
          <h1>{t('data.title')}</h1>
          <p>{t('data.subtitle')}</p>
          <div className="bq-badge">
            <span className="bq-dot" />
            bigquery-public-data.world_bank_health_population
          </div>
        </div>

        <div className="live-layout">
          {/* Sidebar */}
          <div className="query-sidebar">
            <div className="sidebar-label">{t('data.presetLabel')}</div>
            {PRESET_QUERIES.map(q => (
              <button
                key={q.id}
                className={`query-option ${selectedQuery?.id === q.id ? 'active' : ''}`}
                onClick={() => handleQuerySelect(q)}
              >
                <span className="query-option-icon">{q.icon}</span>
                <div>
                  <div className="query-option-name">{q.label}</div>
                  <div className="query-option-desc">{q.description}</div>
                </div>
              </button>
            ))}

            <div className="sidebar-info">
              <div className="info-title">{t('data.aboutTitle')}</div>
              <p>{t('data.aboutText')}</p>
              <a href="https://data.worldbank.org/indicator/SH.DYN.NCOM.ZS" target="_blank" rel="noopener noreferrer" className="info-link">{t('data.worldBankLink')}</a>
            </div>
          </div>

          {/* Main */}
          <div className="query-main">
            <div className="query-header card">
              <div>
                <h3>{selectedQuery?.label}</h3>
                <p>{selectedQuery?.description}</p>
              </div>
              <div className="query-params">
                {selectedQuery?.paramType === 'year' && (
                  <div className="param-group">
                    <label className="param-label">{t('data.yearLabel')}</label>
                    <select className="param-select" value={year} onChange={e => setYear(parseInt(e.target.value))}>
                      {(availableYears.length ? availableYears : [2021,2020,2019,2018,2017,2016,2015]).map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                )}
                {selectedQuery?.paramType === 'country' && (
                  <div className="param-group">
                    <label className="param-label">{t('data.countryLabel')}</label>
                    <select className="param-select" value={country} onChange={e => setCountry(e.target.value)}>
                      {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                    </select>
                  </div>
                )}
                {selectedQuery?.paramType === 'none' && (
                  <div className="param-none">{t('data.noParams')}No parameters — queries all available years globally</div>
                )}
                <button className="btn btn-primary run-btn" onClick={() => runQuery(selectedQuery, year, country)} disabled={loading || !selectedQuery}>
                  {loading ? <><span className="spinner" /> {t('data.running')}</> : t('data.runButton')}
                </button>
              </div>
            </div>

            {!hasRun && (
              <div className="empty-state card">
                <div className="empty-icon">⊞</div>
                <h4>Select a query and hit Run</h4>
                <p>Results will appear here as a live chart pulled directly from BigQuery.</p>
              </div>
            )}

            {loading && (
              <div className="loading-state card">
                <div className="spinner" style={{ width: 32, height: 32 }} />
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>Querying BigQuery...</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Running live SQL against the World Bank dataset</div>
                </div>
              </div>
            )}

            {error && !loading && (
              <div className="alert alert-error fade-in">
                <span>⚠</span>
                <div>
                  <strong>Query failed</strong>
                  <p style={{ marginTop: 4, fontSize: 13 }}>{error}</p>
                  <p style={{ marginTop: 6, fontSize: 12 }}>Make sure BigQuery credentials are set in <code>backend/.env</code></p>
                </div>
              </div>
            )}

            {result?.success && !loading && (
              <div className="result-card card fade-in-up">
                <div className="result-meta-bar">
                  <div>
                    <div className="result-meta-title">{result.label}</div>
                    <div className="result-meta-source">
                      {result.source} · {chartData.length} {t('data.rows')}{chartData.length} rows
                      {result.year ? ` · ${result.year}` : ''}
                      {result.country ? ` · ${result.country}` : ''}
                    </div>
                  </div>
                  <span className="badge badge-green">{t('data.liveLabel')}</span>
                </div>

                <div className="chart-area">{renderChart()}</div>

                <div className="result-table-section">
                  <div className="table-toggle-label">{t('data.rawData')}</div>
                  <div className="result-table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>{Object.keys(chartData[0] || {}).map(k => <th key={k}>{k.replace(/_/g, ' ')}</th>)}</tr>
                      </thead>
                      <tbody>
                        {chartData.map((row, i) => (
                          <tr key={i}>
                            {Object.values(row).map((v, j) => (
                              <td key={j}>{typeof v === 'number' ? v.toFixed(2) : String(v ?? '—')}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataPage;
