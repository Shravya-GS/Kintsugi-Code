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
  const { profile, fireNotification, events, apiStatus, paymentMethod, setPaymentMethod } = useApp();
  const [lastResult, setLastResult] = useState(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchTarget, setLaunchTarget] = useState(null);
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
        result = await apiEvaluate({ ...mockEvt.event, payment_source: paymentMethod });
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

  const launchApp = (target) => {
    setPaymentMethod(target);
    setLaunchTarget(target);
    setIsLaunching(true);
    setTimeout(() => setIsLaunching(false), 2000);
  };

  return (
    <div className="page anim-fade">
      <div className="page-header">
        <div>
          <div className="label" style={{ marginBottom: 4 }}>LIVE TESTING</div>
          <div className="page-title">Simulation <span>Environment</span></div>
        </div>
        <div className={`badge ${apiStatus === 'online' ? 'badge-teal' : apiStatus === 'offline' ? 'badge-red' : 'badge-amber'}`}>
          {apiStatus === 'online' ? '🟢 API Online' : apiStatus === 'offline' ? '🔴 Offline (local)' : '🟡 Connecting…'}
        </div>
      </div>

      {/* Payment Method Selector */}
      <div className="card" style={{ marginBottom: 16, padding: '12px 16px' }}>
        <div className="label" style={{ marginBottom: 10 }}>PAYMENT SOURCE</div>
        <div className="payment-toggle">
          <button 
            className={`pay-opt ${paymentMethod === 'GPay' ? 'active' : ''}`}
            onClick={() => launchApp('GPay')}
          >
            <span className="pay-icon">🇬</span> GPay
          </button>
          <button 
            className={`pay-opt ${paymentMethod === 'PhonePe' ? 'active' : ''}`}
            onClick={() => launchApp('PhonePe')}
          >
            <span className="pay-icon">🇵</span> PhonePe
          </button>
        </div>
      </div>

      {/* Launch Animation Overlay */}
      {isLaunching && (
        <div className={`launch-overlay ${launchTarget.toLowerCase()}-bg anim-fade`}>
          <div className="launch-content anim-pop">
            <div className="launch-logo">
              {launchTarget === 'GPay' ? '🇬' : '🇵'}
            </div>
            <div className="launch-text">Opening {launchTarget}...</div>
            <div className="launch-loader" />
          </div>
        </div>
      )}


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
