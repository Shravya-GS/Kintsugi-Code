import React from 'react';
import { useApp } from './context/AppContext';
import Dashboard from './components/Dashboard';
import MapView from './components/MapView';
import Simulator from './components/Simulator';
import Settings from './components/Settings';
import NotificationOverlay from './components/NotificationOverlay';
import './App.css';

const NAV = [
  { id: 'dashboard', label: 'Home', icon: HomeIcon },
  { id: 'map',       label: 'Map',  icon: MapIcon },
  { id: 'simulator', label: 'Demo', icon: ZapIcon },
  { id: 'settings',  label: 'Settings', icon: SettingsIcon },
];

function HomeIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}
function MapIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
      <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
    </svg>
  );
}
function ZapIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  );
}
function SettingsIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}

export default function App() {
  const { activeTab, setActiveTab, notification } = useApp();

  return (
    <div className="app-shell">
      {/* App Header */}
      <header className="app-header">
        <div className="app-logo">
          <span className="app-logo-icon">🛡️</span>
          <span className="app-logo-text">FinGuard <span className="app-logo-ai">AI</span></span>
        </div>
        <div className="app-header-right">
          {notification && notification.rule === 4 && (
            <span className="header-alert-dot" />
          )}
          <div className="badge badge-teal" style={{ fontSize: 11 }}>🔴 Live</div>
        </div>
      </header>

      {/* Page Content */}
      <main className="app-main">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'map'       && <MapView />}
        {activeTab === 'simulator' && <Simulator />}
        {activeTab === 'settings'  && <Settings />}
      </main>

      {/* Bottom Tab Nav */}
      <nav className="tab-nav">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            id={`tab-${id}`}
            className={`tab-btn ${activeTab === id ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            <Icon active={activeTab === id} />
            {label}
          </button>
        ))}
      </nav>

      {/* Global Notification Overlay */}
      <NotificationOverlay />
    </div>
  );
}
