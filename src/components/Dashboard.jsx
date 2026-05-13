import React, { useState } from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, Cell } from 'recharts';
import { useApp } from '../context/AppContext';
import './Dashboard.css';

function fmt(n) { return '₹' + Number(n).toLocaleString('en-IN'); }
function pct(a, b) { return b > 0 ? Math.min(100, Math.round((a / b) * 100)) : 0; }

const CAT_ICONS = { dining: '🍽️', shopping: '🛍️', transport: '🚕', fuel: '⛽', entertainment: '🎭' };
const CAT_COLORS = { dining: '#00d4aa', shopping: '#4299e1', transport: '#f6ad55', fuel: '#9f7aea', entertainment: '#fc5c7d' };

function SavingsRing({ locked, total }) {
  const p = pct(locked, total);
  return (
    <div className="savings-ring-wrap">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r="58" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
        <circle cx="70" cy="70" r="58" fill="none" stroke="url(#tealGrad)" strokeWidth="14"
          strokeDasharray={`${(p / 100) * 364.4} 364.4`}
          strokeLinecap="round" strokeDashoffset="91.1"
          style={{ transition: 'stroke-dasharray 1s ease' }} />
        <defs>
          <linearGradient id="tealGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00d4aa" />
            <stop offset="100%" stopColor="#0096ff" />
          </linearGradient>
        </defs>
      </svg>
      <div className="savings-ring-center">
        <div className="savings-ring-pct">{p}%</div>
        <div className="savings-ring-label">LOCKED</div>
      </div>
    </div>
  );
}

function CategoryBar({ name, spent, budget, color, icon }) {
  const p = pct(spent, budget);
  const remaining = Math.max(0, budget - spent);
  const over = spent > budget;
  return (
    <div className="cat-bar-row">
      <div className="cat-bar-icon">{icon}</div>
      <div className="cat-bar-content">
        <div className="cat-bar-header">
          <span className="cat-bar-name">{name}</span>
          <span className="cat-bar-nums">{fmt(spent)} <span className="cat-bar-of">/ {fmt(budget)}</span></span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${p}%`, background: over ? 'var(--red)' : color, boxShadow: `0 0 8px ${color}60` }} />
        </div>
        <div className="cat-bar-remaining" style={{ color: over ? 'var(--red)' : 'var(--text-muted)' }}>
          {over ? `₹${(spent - budget).toLocaleString('en-IN')} over budget` : `₹${remaining.toLocaleString('en-IN')} left`}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { profile, spent } = useApp();
  const savings = profile.monthlySalary * 0.5;
  const spendable = profile.monthlySalary - savings;
  const dailyPct = pct(spent.daily, profile.dailyLimit);
  const dailyOver = spent.daily > profile.dailyLimit;

  return (
    <div className="page anim-fade">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="label" style={{ marginBottom: 4 }}>GOOD MORNING</div>
          <div className="page-title">Hi, <span>{profile.name}</span> 👋</div>
        </div>
        <div className="header-shield">🛡️</div>
      </div>

      {/* Savings Card */}
      <div className="card savings-card" style={{ marginBottom: 16 }}>
        <div className="savings-top">
          <div className="savings-info">
            <div className="label" style={{ marginBottom: 8 }}>MONTHLY SAVINGS (50% LOCKED)</div>
            <div className="savings-amount">{fmt(savings)}</div>
            <div className="savings-sub">of {fmt(profile.monthlySalary)} salary · auto-locked</div>
            <div className="badge badge-teal" style={{ marginTop: 12 }}>🔒 Non-negotiable rule</div>
          </div>
          <SavingsRing locked={savings} total={profile.monthlySalary} />
        </div>
        <div className="divider" />
        <div className="grid-2">
          <div className="savings-stat">
            <div className="label">SPENDABLE</div>
            <div className="savings-stat-val" style={{ color: 'var(--teal)' }}>{fmt(spendable)}</div>
          </div>
          <div className="savings-stat">
            <div className="label">LOCKED</div>
            <div className="savings-stat-val" style={{ color: 'var(--blue)' }}>{fmt(savings)}</div>
          </div>
        </div>
      </div>

      {/* Daily Limit */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="daily-header">
          <div>
            <div className="label" style={{ marginBottom: 6 }}>TODAY'S SPENDING</div>
            <div className="daily-amount" style={{ color: dailyOver ? 'var(--red)' : 'var(--text-primary)' }}>
              {fmt(spent.daily)}
              <span className="daily-limit"> / {fmt(profile.dailyLimit)}</span>
            </div>
          </div>
          <div className={`daily-badge ${dailyOver ? 'badge badge-red' : 'badge badge-teal'}`}>
            {dailyOver ? '⚠️ Over limit' : '✅ On track'}
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <div className="progress-track" style={{ height: 10 }}>
            <div className="progress-fill" style={{
              width: `${dailyPct}%`,
              background: dailyOver ? 'var(--red)' : dailyPct > 80 ? 'var(--amber)' : 'var(--teal)',
              boxShadow: dailyOver ? '0 0 12px var(--red-glow)' : '0 0 12px var(--teal-glow)',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
            <span>{dailyPct}% used</span>
            <span>{fmt(Math.max(0, profile.dailyLimit - spent.daily))} left</span>
          </div>
        </div>
      </div>

      {/* Category Budgets */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="label" style={{ marginBottom: 16 }}>CATEGORY BUDGETS</div>
        <div className="stack" style={{ gap: 16 }}>
          {Object.entries(profile.categoryBudgets).map(([cat, budget]) => (
            <CategoryBar key={cat} name={cat.charAt(0).toUpperCase() + cat.slice(1)}
              spent={spent.categories[cat] || 0} budget={budget}
              color={CAT_COLORS[cat]} icon={CAT_ICONS[cat]} />
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="label" style={{ marginBottom: 14 }}>RECENT TRANSACTIONS</div>
        <div className="stack" style={{ gap: 0 }}>
          {spent.transactions.map((tx, i) => (
            <div key={tx.id} className="tx-row" style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
              <div className="tx-icon">{tx.icon}</div>
              <div className="tx-info">
                <div className="tx-merchant">{tx.merchant}</div>
                <div className="tx-meta">{tx.time} · {tx.category}</div>
              </div>
              <div className="tx-amount">-{fmt(tx.amount)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
