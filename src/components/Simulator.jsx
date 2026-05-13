import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { evaluateEvent as apiEvaluate } from '../api/client';
import { evaluateEvent as localEvaluate } from '../engine/decisionEngine';
import { MOCK_EVENTS } from '../engine/mockEvents';
import './Simulator.css';

const COLOR_MAP = {
  teal:  { border: 'var(--teal)',  bg: 'var(--teal-dim)',  label: '#00d4aa' },
  amber: { border: 'var(--amber)', bg: 'var(--amber-dim)', label: '#f6ad55' },
  red:   { border: 'var(--red)',   bg: 'var(--red-dim)',   label: '#fc5c7d' },
  blue:  { border: 'rgba(66,153,225,0.4)', bg: 'rgba(66,153,225,0.1)', label: '#4299e1' },
};

export default function Simulator() {
  const { profile, fireNotification, events, apiStatus } = useApp();
  const [lastResult, setLastResult] = useState(null);
  const [lastEventId, setLastEventId] = useState(null);
  const [firing, setFiring] = useState(null);
  const [latency, setLatency] = useState(null);
  const [error, setError] = useState(null);

  const fire = async (mockEvt) => {
    setFiring(mockEvt.id);
    setError(null);
    const t0 = performance.now();

    try {
      let result;
      if (apiStatus === 'online') {
        // 🔥 Call the real FastAPI backend
        result = await apiEvaluate(mockEvt.event);
        setLatency(Math.round(performance.now() - t0));
      } else {
        // 🔁 Fallback to local engine if API is down
        result = localEvaluate(mockEvt.event, profile);
        setLatency(null);
      }
      setLastResult(result);
      setLastEventId(mockEvt.id);
      fireNotification(result, mockEvt.event);
    } catch (err) {
      setError(err.message);
      // Still try local fallback
      const result = localEvaluate(mockEvt.event, profile);
      setLastResult(result);
      setLastEventId(mockEvt.id);
      fireNotification(result, mockEvt.event);
    } finally {
      setFiring(null);
    }
  };

  return (
    <div className="page anim-fade">
      <div className="page-header">
        <div>
          <div className="label" style={{ marginBottom: 4 }}>HACKATHON DEMO</div>
          <div className="page-title">Event <span>Simulator</span></div>
        </div>
        <div className={`badge ${apiStatus === 'online' ? 'badge-teal' : apiStatus === 'offline' ? 'badge-red' : 'badge-amber'}`}>
          {apiStatus === 'online' ? '🟢 API Online' : apiStatus === 'offline' ? '🔴 Offline (local)' : '🟡 Connecting…'}
        </div>
      </div>

      {/* API Status Banner */}
      <div className="card sim-api-card" style={{ marginBottom: 16, borderColor: apiStatus === 'online' ? 'rgba(0,212,170,0.3)' : 'rgba(246,173,85,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>{apiStatus === 'online' ? '⚡' : '🔁'}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: apiStatus === 'online' ? 'var(--teal)' : 'var(--amber)' }}>
              {apiStatus === 'online' ? 'Connected to FastAPI Backend' : 'Running in offline mode'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {apiStatus === 'online'
                ? 'POST /api/evaluate → Python decision engine on :8000'
                : 'API unavailable — using in-browser JS engine as fallback'}
            </div>
          </div>
          {latency && <div className="sim-latency">{latency}ms</div>}
        </div>
        {error && <div className="sim-error">⚠️ {error}</div>}
      </div>

      {/* Event Buttons */}
      <div className="stack">
        {MOCK_EVENTS.map((evt) => {
          const c = COLOR_MAP[evt.color];
          const isActive = firing === evt.id;
          const wasLast = lastEventId === evt.id;
          return (
            <button
              key={evt.id}
              className={`sim-btn ${isActive ? 'sim-btn-firing' : ''}`}
              style={{ borderColor: c.border, background: wasLast ? c.bg : 'var(--bg-card)' }}
              onClick={() => fire(evt)}
              disabled={!!firing}
            >
              <div className="sim-btn-content">
                <div className="sim-btn-label" style={{ color: c.label }}>{evt.label}</div>
                <div className="sim-btn-desc">{evt.desc}</div>
              </div>
              <div className="sim-btn-arrow" style={{ color: c.label }}>
                {isActive ? <span className="sim-spinner" /> : '▶'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Engine Output */}
      {lastResult && (
        <div className="card sim-result anim-slide" style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div className="label">ENGINE OUTPUT</div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {latency && <span className="sim-latency">{latency}ms</span>}
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{apiStatus === 'online' ? 'via API' : 'local'}</span>
            </div>
          </div>
          <div className="sim-rule-badge">
            {lastResult.rule === 1 && <span className="badge badge-teal">Rule 1 — Silent ✓</span>}
            {lastResult.rule === 2 && <span className="badge badge-amber">Rule 2 — Daily Limit Alert ⚠️</span>}
            {lastResult.rule === 3 && <span className="badge badge-blue">Rule 3 — Geofence Pre-Alert 📍</span>}
            {lastResult.rule === 4 && <span className="badge badge-red">Rule 4 — Critical Override 🚨</span>}
          </div>
          <pre className="sim-json">{JSON.stringify(
            { ...lastResult, message: lastResult.message ? lastResult.message.slice(0, 90) + '…' : undefined },
            null, 2
          )}</pre>
        </div>
      )}

      {/* Event Log */}
      {events.length > 0 && (
        <div className="card" style={{ marginTop: 16, marginBottom: 16 }}>
          <div className="label" style={{ marginBottom: 14 }}>EVENT LOG</div>
          <div className="stack" style={{ gap: 8 }}>
            {events.slice(0, 8).map((ev, i) => (
              <div key={ev.id} className="log-row" style={{ animationDelay: `${i * 0.05}s` }}>
                <span className="log-rule">R{ev.rule}</span>
                <span className="log-notif">{ev.show_notification ? '🔔' : '🔕'}</span>
                <span className="log-msg">
                  {ev.eventMeta?.location?.name || ev.eventMeta?.transaction?.merchant || '—'}
                </span>
                <span className="log-time">
                  {new Date(ev.id).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
