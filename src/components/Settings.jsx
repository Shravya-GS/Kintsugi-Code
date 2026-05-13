import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import './Settings.css';

function fmt(n) { return Number(n).toLocaleString('en-IN'); }

export default function Settings() {
  const { profile, saveProfile } = useApp();
  const [form, setForm] = useState({ ...profile, categoryBudgets: { ...profile.categoryBudgets } });
  const [saved, setSaved] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setCat = (cat, val) => setForm(f => ({ ...f, categoryBudgets: { ...f.categoryBudgets, [cat]: Number(val) || 0 } }));

  const handleSave = () => {
    saveProfile({ ...form, monthlySalary: Number(form.monthlySalary), dailyLimit: Number(form.dailyLimit) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const savings = Number(form.monthlySalary) * 0.5;
  const spendable = Number(form.monthlySalary) - savings;

  const CAT_ICONS = { dining: '🍽️', shopping: '🛍️', transport: '🚕', fuel: '⛽', entertainment: '🎭' };

  return (
    <div className="page anim-fade">
      <div className="page-header">
        <div>
          <div className="label" style={{ marginBottom: 4 }}>PERSONALIZE</div>
          <div className="page-title">Your <span>Profile</span></div>
        </div>
        <div className="badge badge-teal">⚙️ Config</div>
      </div>

      {/* Profile Card */}
      <div className="card settings-card" style={{ marginBottom: 16 }}>
        <div className="label" style={{ marginBottom: 14 }}>PERSONAL INFO</div>
        <div className="settings-field">
          <label className="settings-label">Your Name</label>
          <input className="settings-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Enter your name" />
        </div>
      </div>

      {/* Salary Card */}
      <div className="card settings-card" style={{ marginBottom: 16 }}>
        <div className="label" style={{ marginBottom: 14 }}>💰 INCOME & SAVINGS</div>

        <div className="settings-field">
          <label className="settings-label">Monthly Salary (₹)</label>
          <input className="settings-input mono" type="number" value={form.monthlySalary}
            onChange={e => set('monthlySalary', e.target.value)} min={0} />
        </div>

        <div className="savings-preview">
          <div className="savings-preview-row">
            <span>🔒 Auto-locked savings (50%)</span>
            <span style={{ color: 'var(--teal)', fontWeight: 700 }}>₹{fmt(savings)}</span>
          </div>
          <div className="savings-preview-row">
            <span>💳 Spendable amount</span>
            <span style={{ color: 'var(--amber)', fontWeight: 700 }}>₹{fmt(spendable)}</span>
          </div>
          <div className="settings-rule-note">⚠️ 50% savings rule is non-negotiable and always enforced</div>
        </div>
      </div>

      {/* Daily Limit */}
      <div className="card settings-card" style={{ marginBottom: 16 }}>
        <div className="label" style={{ marginBottom: 14 }}>📅 DAILY LIMIT</div>
        <div className="settings-field">
          <label className="settings-label">Daily Spend Limit (₹)</label>
          <input className="settings-input mono" type="number" value={form.dailyLimit}
            onChange={e => set('dailyLimit', e.target.value)} min={0} />
        </div>
        <div className="settings-hint">Alerts fire when your daily spending exceeds this amount</div>
      </div>

      {/* Category Budgets */}
      <div className="card settings-card" style={{ marginBottom: 16 }}>
        <div className="label" style={{ marginBottom: 14 }}>📊 MONTHLY CATEGORY BUDGETS</div>
        <div className="stack" style={{ gap: 14 }}>
          {Object.entries(form.categoryBudgets).map(([cat, val]) => (
            <div key={cat} className="settings-cat-row">
              <div className="settings-cat-label">
                <span>{CAT_ICONS[cat]}</span>
                <span>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
              </div>
              <div className="settings-cat-input-wrap">
                <span className="settings-rupee">₹</span>
                <input className="settings-input mono settings-cat-input"
                  type="number" value={val} min={0}
                  onChange={e => setCat(cat, e.target.value)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <button className={`btn settings-save-btn ${saved ? 'btn-teal' : 'btn-teal'}`} onClick={handleSave}>
        {saved ? '✅ Saved successfully!' : '💾 Save Profile'}
      </button>

      {/* App Info */}
      <div className="card settings-info" style={{ marginTop: 16, marginBottom: 80 }}>
        <div className="settings-info-logo">🛡️ FinGuard AI</div>
        <div className="settings-info-sub">Intelligent Personal Financial Safety Assistant</div>
        <div className="settings-info-version">v1.0.0 · Hack4Change 2026 · Built with ❤️</div>
        <div className="divider" />
        <div className="settings-rules-list">
          <div className="settings-rule">✅ Rule 1 — Silent mode for in-limit transactions</div>
          <div className="settings-rule">⚠️ Rule 2 — Daily limit alert with category context</div>
          <div className="settings-rule">📍 Rule 3 — Geofence pre-alert before you spend</div>
          <div className="settings-rule">🚨 Rule 4 — Critical override for nightlife venues</div>
        </div>
      </div>
    </div>
  );
}
