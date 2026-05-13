import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import './NotificationOverlay.css';

const RULE_CONFIG = {
  4: { bg: 'notif-critical', icon: '🚨', label: 'CRITICAL ALERT' },
  2: { bg: 'notif-warning', icon: '⚠️', label: 'SPENDING ALERT' },
  3: { bg: 'notif-info', icon: '📍', label: 'GEOFENCE ALERT' },
};

function formatINR(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

export default function NotificationOverlay() {
  const { notification, dismissNotification } = useApp();
  const audioRef = useRef(null);

  useEffect(() => {
    if (!notification) return;
    // Auto-dismiss non-critical alerts after 8s
    if (notification.rule !== 4) {
      const t = setTimeout(dismissNotification, 8000);
      return () => clearTimeout(t);
    }
  }, [notification]);

  if (!notification) return null;

  const cfg = RULE_CONFIG[notification.rule] || RULE_CONFIG[2];
  const isCritical = notification.rule === 4;

  return (
    <div className={`notif-backdrop ${isCritical ? 'notif-backdrop-critical' : ''}`} onClick={isCritical ? undefined : dismissNotification}>
      <div className={`notif-card ${cfg.bg} ${isCritical ? 'notif-shake' : 'notif-slide'}`} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="notif-header">
          <div className="notif-icon-wrap">
            <span className="notif-icon">{cfg.icon}</span>
            {isCritical && <span className="notif-pulse-ring" />}
          </div>
          <div>
            <div className="notif-label">{cfg.label}</div>
            {notification.trigger_high_volume_alert && (
              <div className="notif-override">🔊 HIGH VOLUME OVERRIDE</div>
            )}
          </div>
          <button className="notif-close" onClick={dismissNotification}>✕</button>
        </div>

        {/* Rule 4 — Critical */}
        {notification.rule === 4 && (
          <div className="notif-body">
            <div className="notif-location">📍 {notification.location_name}</div>
            <p className="notif-message">{notification.message}</p>
            <div className="notif-actions">
              <button className="btn btn-red" onClick={dismissNotification}>I'm aware, proceed</button>
              <button className="btn btn-outline" onClick={dismissNotification}>Leave now 🚪</button>
            </div>
          </div>
        )}

        {/* Rule 2 — Overspend */}
        {notification.rule === 2 && (
          <div className="notif-body">
            <div className="notif-amount-row">
              <div>
                <div className="label">OVERSPENT BY</div>
                <div className="notif-big-num">{formatINR(notification.overspend_amount)}</div>
              </div>
              <div>
                <div className="label">TODAY'S TOTAL</div>
                <div className="notif-big-num notif-amber">{formatINR(notification.daily_spent)}</div>
              </div>
            </div>
            {notification.merchant && <div className="notif-merchant">Last: {notification.merchant} · {formatINR(notification.transaction_amount)}</div>}
            <p className="notif-message">{notification.message}</p>
            <div className="notif-actions">
              <button className="btn btn-amber" onClick={dismissNotification}>Got it, I'll be careful</button>
            </div>
          </div>
        )}

        {/* Rule 3 — Geofence Pre-Alert */}
        {notification.rule === 3 && (
          <div className="notif-body">
            <div className="notif-location">📍 {notification.location_name}</div>
            <div className="notif-budget-row">
              <div>
                <div className="label">REMAINING BUDGET</div>
                <div className="notif-big-num notif-teal">{formatINR(notification.remaining_category_budget)}</div>
              </div>
              <div>
                <div className="label">CATEGORY</div>
                <div className="notif-category">{notification.category}</div>
              </div>
            </div>
            <div className="notif-progress-track">
              <div className="notif-progress-fill" style={{ width: `${Math.min(notification.spent_percent, 100)}%`, background: notification.spent_percent > 80 ? 'var(--red)' : 'var(--teal)' }} />
            </div>
            <div className="notif-progress-labels">
              <span>{formatINR(notification.spent_so_far)} spent</span>
              <span>{formatINR(notification.total_budget)} total</span>
            </div>
            <p className="notif-message">{notification.message}</p>
            <div className="notif-actions">
              <button className="btn btn-teal" onClick={dismissNotification}>Thanks, noted! 👍</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
