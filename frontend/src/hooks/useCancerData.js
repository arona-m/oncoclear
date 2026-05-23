import { useState, useCallback } from 'react';
import axios from 'axios';
import i18n from '../i18n/i18n';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

export const useCancerData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getOverview = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await axios.get(`${API_BASE}/cancer/overview`);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cancer overview.');
      return null;
    } finally { setLoading(false); }
  }, []);

  const searchCancer = useCallback(async (query) => {
    if (!query || query.trim().length < 2) return null;
    setLoading(true); setError(null);
    try {
      const lang = i18n.language || 'en';
      const { data } = await axios.get(`${API_BASE}/cancer/search`, {
        params: { q: query.trim(), lang }
      });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Search failed.';
      const suggestions = err.response?.data?.suggestions;
      setError(msg);
      return { success: false, message: msg, suggestions };
    } finally { setLoading(false); }
  }, []);

  const getCancerTypes = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/cancer/types`);
      return data;
    } catch { setError('Failed to load cancer types.'); return null; }
    finally { setLoading(false); }
  }, []);

  const getSearchHistory = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/cancer/user/history`);
      return data;
    } catch { return null; }
  }, []);

  const getBigQueryStats = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/cancer/stats/bigquery`);
      return data;
    } catch (err) { return { success: false, error: err.response?.data }; }
    finally { setLoading(false); }
  }, []);

  return { loading, error, setError, getOverview, searchCancer, getCancerTypes, getSearchHistory, getBigQueryStats };
};
