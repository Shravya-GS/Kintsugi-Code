/**
 * FinGuard AI — API Client
 * All calls go through Vite's proxy (/api → http://localhost:8000)
 * so no CORS issues in development.
 */

const BASE = '/api';

async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API ${method} ${path} → ${res.status}: ${err}`);
  }
  return res.json();
}

// ── Core evaluate (all 4 rules) ──
export const evaluateEvent = (payload) => request('POST', '/evaluate', payload);

// ── Profile ──
export const getProfile = () => request('GET', '/profile');
export const saveProfile = (data) => request('PUT', '/profile', data);

// ── Dashboard ──
export const getDashboard = () => request('GET', '/dashboard');

// ── Transactions ──
export const getTransactions = () => request('GET', '/transactions');
export const addTransaction = (tx) => request('POST', '/transactions', tx);

// ── Event log ──
export const getEvents = () => request('GET', '/events');

// ── Health check ──
export const healthCheck = () => request('GET', '/health');
