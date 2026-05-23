import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useCancerData } from '../hooks/useCancerData';
import './Dashboard.css';

const COLORS = ['#0b7285','#1a9aad','#2ec4b6','#3d8b9e','#5fb4c2','#7ecad4','#9ddde6','#b2ebf2','#c8f0f5','#e0f7fa'];

const fmt = (n) => {
  if (!n) return 'N/A';
  if (n >= 1000000) return `${(n/1000000).toFixed(2)}M`;
  if (n >= 1000) return `${(n/1000).toFixed(0)}K`;
  return n.toString();
};

const DashboardPage = () => {
  const { user } = useAuth();
  const { getOverview, loading } = useCancerData();
  const { t } = useTranslation();
  const [data, setData] = useState(null);

  useEffect(() => {
    getOverview().then(res => { if (res?.success) setData(res.data); });
  }, [getOverview]);

  const who = data?.who_globocan;
  const topCancers = who?.global?.most_common_cancers || [];
  const regions = who?.global?.regional_data || [];

  const chartData = topCancers.map(c => ({
    name: c.name,
    cases: Math.round(c.new_cases / 1000),
    deaths: Math.round(c.deaths / 1000),
  }));

  const pieData = regions.map(r => ({ name: r.region, value: r.new_cases, share: r.share_pct }));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('dashboard.greeting') : hour < 17 ? t('dashboard.greetingAfternoon') : t('dashboard.greetingEvening');

  return (
    <div className="dashboard fade-in">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-greeting">{greeting}, {user?.firstName}.</h1>
            <p>{t('dashboard.subtitle')}</p>
          </div>
          <Link to="/search" className="btn btn-primary">{t('dashboard.searchButton')}</Link>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="spinner" style={{ width: 32, height: 32 }} />
            <span>{t('dashboard.loading')}</span>
          </div>
        )}

        {data && (
          <>
            <div className="kpi-grid">
              <div className="kpi-card card"><div className="kpi-icon" style={{ background: '#e6f7fa', color: '#0b7285' }}>⊕</div><div><div className="kpi-value">{fmt(who?.global?.new_cases)}</div><div className="kpi-label">{t('dashboard.kpi.cases')}</div></div></div>
              <div className="kpi-card card"><div className="kpi-icon" style={{ background: '#fdf2f2', color: '#c0392b' }}>✕</div><div><div className="kpi-value">{fmt(who?.global?.deaths)}</div><div className="kpi-label">{t('dashboard.kpi.deaths')}</div></div></div>
              <div className="kpi-card card"><div className="kpi-icon" style={{ background: '#f0faf5', color: '#2e7d52' }}>◎</div><div><div className="kpi-value">{fmt(who?.global?.prevalence_5yr)}</div><div className="kpi-label">{t('dashboard.kpi.living')}</div></div></div>
              <div className="kpi-card card"><div className="kpi-icon" style={{ background: '#fffbeb', color: '#d97706' }}>⚑</div><div><div className="kpi-value">50%</div><div className="kpi-label">{t('dashboard.kpi.preventable')}</div></div></div>
            </div>

            <div className="charts-row">
              <div className="chart-card card">
                <div className="chart-header">
                  <h3>{t('dashboard.chart1Title')}</h3>
                  <span className="badge badge-teal">{t('dashboard.chart1Badge')}</span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8896ab' }} angle={-40} textAnchor="end" interval={0} />
                    <YAxis tick={{ fontSize: 11, fill: '#8896ab' }} />
                    <Tooltip formatter={(v, n) => [`${v}K`, n === 'cases' ? t('dashboard.newCases') : t('dashboard.deaths')]} contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="cases" fill="#1a9aad" radius={[4,4,0,0]} name="cases" />
                    <Bar dataKey="deaths" fill="#e07070" radius={[4,4,0,0]} name="deaths" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="chart-legend">
                  <span className="legend-item"><span className="dot teal" />{t('dashboard.newCases')}</span>
                  <span className="legend-item"><span className="dot red" />{t('dashboard.deaths')}</span>
                </div>
              </div>

              <div className="chart-card card">
                <div className="chart-header">
                  <h3>{t('dashboard.chart2Title')}</h3>
                  <span className="badge badge-teal">{t('dashboard.chart2Badge')}</span>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" nameKey="name">
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v, n, p) => [`${fmt(v)} cases (${p.payload.share}%)`, '']} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                    <Legend formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} iconSize={8} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card table-card">
              <div className="chart-header">
                <h3>{t('dashboard.tableTitle')}</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className="badge badge-teal">WHO/IARC</span>
                  <span className="badge badge-amber">GLOBOCAN 2022</span>
                </div>
              </div>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('dashboard.tableRank')}</th>
                      <th>{t('dashboard.tableCancer')}</th>
                      <th>{t('dashboard.tableICD')}</th>
                      <th>{t('dashboard.tableCases')}</th>
                      <th>{t('dashboard.tableDeaths')}</th>
                      <th>{t('dashboard.tableFatality')}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCancers.map((c) => {
                      const fatalityRate = ((c.deaths / c.new_cases) * 100).toFixed(1);
                      const severity = fatalityRate > 70 ? 'badge-red' : fatalityRate > 40 ? 'badge-amber' : 'badge-green';
                      return (
                        <tr key={c.rank}>
                          <td><span className="rank-num">#{c.rank}</span></td>
                          <td className="cancer-name-cell">{c.name}</td>
                          <td><code className="icd-code">{c.icd10}</code></td>
                          <td className="number-cell">{fmt(c.new_cases)}</td>
                          <td className="number-cell death-num">{fmt(c.deaths)}</td>
                          <td><span className={`badge ${severity}`}>{fatalityRate}%</span></td>
                          <td><Link to={`/search?q=${c.name.toLowerCase().split(' ')[0]}`} className="table-link">{t('dashboard.learnLink')}</Link></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="table-footer">
                <span>{t('dashboard.tableSource')} <a href="https://gco.iarc.fr" target="_blank" rel="noopener noreferrer">gco.iarc.fr</a></span>
              </div>
            </div>

            <div className="cta-banner">
              <div>
                <h3>{t('dashboard.ctaTitle')}</h3>
                <p>{t('dashboard.ctaSubtitle')}</p>
              </div>
              <Link to="/search" className="btn btn-primary">{t('dashboard.ctaButton')}</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
