import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  const [data, setData] = useState(null);

  useEffect(() => {
    getOverview().then(res => {
      if (res?.success) setData(res.data);
    });
  }, [getOverview]);

  const who = data?.who_globocan;
  const topCancers = who?.global?.most_common_cancers || [];
  const regions = who?.global?.regional_data || [];

  const chartData = topCancers.map(c => ({
    name: c.name,
    cases: Math.round(c.new_cases / 1000),
    deaths: Math.round(c.deaths / 1000),
  }));

  const pieData = regions.map(r => ({
    name: r.region,
    value: r.new_cases,
    share: r.share_pct
  }));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="dashboard fade-in">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-greeting">
              {greeting}, {user?.firstName}.
            </h1>
            <p>Here's the global cancer landscape — data sourced from WHO/IARC GLOBOCAN 2022.</p>
          </div>
          <Link to="/search" className="btn btn-primary">
            Search a cancer type →
          </Link>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="spinner" style={{ width: 32, height: 32 }} />
            <span>Loading cancer data...</span>
          </div>
        )}

        {data && (
          <>
            {/* KPI Cards */}
            <div className="kpi-grid">
              <div className="kpi-card card">
                <div className="kpi-icon" style={{ background: '#e6f7fa', color: '#0b7285' }}>⊕</div>
                <div>
                  <div className="kpi-value">{fmt(who?.global?.new_cases)}</div>
                  <div className="kpi-label">New cases in 2022</div>
                </div>
              </div>
              <div className="kpi-card card">
                <div className="kpi-icon" style={{ background: '#fdf2f2', color: '#c0392b' }}>✕</div>
                <div>
                  <div className="kpi-value">{fmt(who?.global?.deaths)}</div>
                  <div className="kpi-label">Deaths in 2022</div>
                </div>
              </div>
              <div className="kpi-card card">
                <div className="kpi-icon" style={{ background: '#f0faf5', color: '#2e7d52' }}>◎</div>
                <div>
                  <div className="kpi-value">{fmt(who?.global?.prevalence_5yr)}</div>
                  <div className="kpi-label">Living with cancer (5yr)</div>
                </div>
              </div>
              <div className="kpi-card card">
                <div className="kpi-icon" style={{ background: '#fffbeb', color: '#d97706' }}>⚑</div>
                <div>
                  <div className="kpi-value">50%</div>
                  <div className="kpi-label">of cancers preventable</div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="charts-row">
              {/* Bar Chart */}
              <div className="chart-card card">
                <div className="chart-header">
                  <h3>Top 10 Cancers by Cases vs Deaths</h3>
                  <span className="badge badge-teal">2022 data · thousands</span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#8896ab' }}
                      angle={-40}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#8896ab' }} />
                    <Tooltip
                      formatter={(v, n) => [`${v}K`, n === 'cases' ? 'New Cases' : 'Deaths']}
                      contentStyle={{
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        fontSize: 12
                      }}
                    />
                    <Bar dataKey="cases" fill="#1a9aad" radius={[4,4,0,0]} name="cases" />
                    <Bar dataKey="deaths" fill="#e07070" radius={[4,4,0,0]} name="deaths" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="chart-legend">
                  <span className="legend-item"><span className="dot teal" />New Cases</span>
                  <span className="legend-item"><span className="dot red" />Deaths</span>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="chart-card card">
                <div className="chart-header">
                  <h3>Cases by World Region</h3>
                  <span className="badge badge-teal">GLOBOCAN 2022</span>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      nameKey="name"
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v, n, p) => [`${fmt(v)} cases (${p.payload.share}%)`, '']}
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                    />
                    <Legend
                      formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>}
                      iconSize={8}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Cancers Table */}
            <div className="card table-card">
              <div className="chart-header">
                <h3>Global Cancer Rankings</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className="badge badge-teal">WHO/IARC</span>
                  <span className="badge badge-amber">GLOBOCAN 2022</span>
                </div>
              </div>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Cancer Type</th>
                      <th>ICD-10</th>
                      <th>New Cases (2022)</th>
                      <th>Deaths (2022)</th>
                      <th>Fatality Rate</th>
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
                          <td>
                            <span className={`badge ${severity}`}>{fatalityRate}%</span>
                          </td>
                          <td>
                            <Link
                              to={`/search?q=${c.name.toLowerCase().split(' ')[0]}`}
                              className="table-link"
                            >
                              Learn →
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="table-footer">
                <span>Source: IARC/WHO GLOBOCAN 2022 — <a href="https://gco.iarc.fr" target="_blank" rel="noopener noreferrer">gco.iarc.fr</a></span>
              </div>
            </div>

            {/* CTA */}
            <div className="cta-banner">
              <div>
                <h3>Search any cancer type</h3>
                <p>Get prevention tips, risk factors, and live global statistics from BigQuery.</p>
              </div>
              <Link to="/search" className="btn btn-primary">Start searching →</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
