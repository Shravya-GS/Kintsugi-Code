import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import './MapView.css';

const ZONES = [
  { id: 1, name: 'Phoenix MarketCity', type: 'mall', risk: 'medium', lat: 12.9958, lng: 77.6963, icon: '🏪', category: 'shopping' },
  { id: 2, name: 'Social Koramangala', type: 'restaurant', risk: 'low', lat: 12.9352, lng: 77.6245, icon: '🍜', category: 'dining' },
  { id: 3, name: 'Vapebar & Lounge', type: 'bar', risk: 'critical', lat: 12.9716, lng: 77.6412, icon: '🍺', category: 'entertainment' },
  { id: 4, name: 'Indiranagar Club', type: 'club', risk: 'critical', lat: 12.9784, lng: 77.6408, icon: '🎵', category: 'entertainment' },
  { id: 5, name: 'Starbucks MG Road', type: 'cafe', risk: 'low', lat: 12.9758, lng: 77.6064, icon: '☕', category: 'dining' },
  { id: 6, name: 'UB City Mall', type: 'luxury_retail', risk: 'medium', lat: 12.9721, lng: 77.5956, icon: '💎', category: 'shopping' },
  { id: 7, name: 'Manipal Hospital', type: 'hospital', risk: 'safe', lat: 12.9400, lng: 77.6020, icon: '🏥', category: 'medical' },
  { id: 8, name: 'HP Fuel Station', type: 'petrol_bunk', risk: 'safe', lat: 12.9250, lng: 77.6100, icon: '⛽', category: 'fuel' },
  { id: 9, name: 'Toit Brewpub', type: 'pub', risk: 'critical', lat: 12.9800, lng: 77.6310, icon: '🍻', category: 'entertainment' },
  { id: 10, name: 'Lulu Mall', type: 'mall', risk: 'medium', lat: 12.9130, lng: 77.6530, icon: '🛍️', category: 'shopping' },
];

const RISK_COLORS = {
  safe: '#00d4aa',
  low: '#4299e1',
  medium: '#f6ad55',
  critical: '#fc5c7d',
};

const RISK_LABELS = {
  safe: '✅ Safe Zone',
  low: '📍 Low Risk',
  medium: '⚠️ Caution',
  critical: '🚨 Critical',
};

export default function MapView() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const { profile, spent } = useApp();

  useEffect(() => {
    if (mapInstanceRef.current) return;

    // Dynamically import Leaflet
    import('leaflet').then(L => {
      const map = L.default.map(mapRef.current, {
        center: [12.9716, 77.6412],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      L.default.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO',
        maxZoom: 19,
      }).addTo(map);

      L.default.control.zoom({ position: 'bottomright' }).addTo(map);

      ZONES.forEach(zone => {
        const color = RISK_COLORS[zone.risk];

        // Circle geofence
        L.default.circle([zone.lat, zone.lng], {
          radius: 180,
          color: color,
          fillColor: color,
          fillOpacity: 0.12,
          weight: 2,
          opacity: 0.6,
        }).addTo(map);

        // Custom marker
        const icon = L.default.divIcon({
          html: `<div class="map-marker" style="--mc:${color}">
            <span class="map-marker-icon">${zone.icon}</span>
            ${zone.risk === 'critical' ? '<span class="map-marker-pulse"></span>' : ''}
          </div>`,
          className: '',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const marker = L.default.marker([zone.lat, zone.lng], { icon }).addTo(map);

        marker.bindPopup(`
          <div class="map-popup">
            <div class="map-popup-name">${zone.icon} ${zone.name}</div>
            <div class="map-popup-type">${zone.type.replace('_', ' ')}</div>
            <div class="map-popup-risk" style="color:${color}">${RISK_LABELS[zone.risk]}</div>
          </div>
        `, { className: 'map-popup-wrap' });
      });

      // User location dot
      L.default.circleMarker([12.9716, 77.6412], {
        radius: 8,
        color: '#fff',
        fillColor: '#00d4aa',
        fillOpacity: 1,
        weight: 2,
      }).addTo(map).bindPopup('<b>📍 You are here</b>');

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const criticalCount = ZONES.filter(z => z.risk === 'critical').length;
  const mediumCount = ZONES.filter(z => z.risk === 'medium').length;

  return (
    <div className="map-page anim-fade">
      {/* Header */}
      <div className="map-header">
        <div>
          <div className="label" style={{ marginBottom: 4 }}>GEOFENCE MONITOR</div>
          <div className="page-title">Safe <span>Zones</span> Map</div>
        </div>
        <div className="badge badge-teal">🛰️ Live</div>
      </div>

      {/* Stats row */}
      <div className="grid-2" style={{ marginBottom: 12 }}>
        <div className="card map-stat-card" style={{ borderColor: 'rgba(252,92,125,0.3)' }}>
          <div className="map-stat-num" style={{ color: 'var(--red)' }}>{criticalCount}</div>
          <div className="label">CRITICAL ZONES</div>
        </div>
        <div className="card map-stat-card" style={{ borderColor: 'rgba(246,173,85,0.3)' }}>
          <div className="map-stat-num" style={{ color: 'var(--amber)' }}>{mediumCount}</div>
          <div className="label">CAUTION ZONES</div>
        </div>
      </div>

      {/* Map container */}
      <div className="map-container card" style={{ padding: 0, overflow: 'hidden', marginBottom: 12 }}>
        <div ref={mapRef} className="map-leaflet" />
      </div>

      {/* Legend */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="label" style={{ marginBottom: 12 }}>ZONE LEGEND</div>
        <div className="map-legend">
          {Object.entries(RISK_LABELS).map(([risk, label]) => (
            <div key={risk} className="map-legend-item">
              <span className="map-legend-dot" style={{ background: RISK_COLORS[risk] }} />
              <span className="map-legend-text">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Zone list */}
      <div className="card" style={{ marginBottom: 80 }}>
        <div className="label" style={{ marginBottom: 14 }}>MONITORED LOCATIONS</div>
        <div className="stack" style={{ gap: 0 }}>
          {ZONES.map((zone, i) => (
            <div key={zone.id} className="zone-row" style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
              <div className="zone-icon">{zone.icon}</div>
              <div className="zone-info">
                <div className="zone-name">{zone.name}</div>
                <div className="zone-type">{zone.type.replace(/_/g, ' ')} · {zone.category}</div>
              </div>
              <div className="zone-risk" style={{ color: RISK_COLORS[zone.risk] }}>
                {zone.risk === 'critical' && '🚨'}
                {zone.risk === 'medium' && '⚠️'}
                {zone.risk === 'low' && '📍'}
                {zone.risk === 'safe' && '✅'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
