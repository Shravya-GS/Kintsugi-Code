import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import './SafeZoneMap.css';

const ZONES = [
  { id: 1, name: 'Phoenix MarketCity', type: 'mall', risk: 'medium', lat: 12.9958, lng: 77.6963, icon: '🏪', category: 'shopping' },
  { id: 2, name: 'Social Koramangala', type: 'restaurant', risk: 'low', lat: 12.9352, lng: 77.6245, icon: '🍜', category: 'dining' },
  { id: 3, name: 'Vapebar & Lounge', type: 'bar', risk: 'critical', lat: 12.9716, lng: 77.6412, icon: '🍺', category: 'entertainment' },
  { id: 4, name: 'Indiranagar Club', type: 'club', risk: 'critical', lat: 12.9784, lng: 77.6408, icon: '🎵', category: 'entertainment' },
  { id: 5, name: 'Starbucks MG Road', type: 'cafe', risk: 'low', lat: 12.9758, lng: 77.6064, icon: '☕', category: 'dining' },
  { id: 6, name: 'UB City Mall', type: 'luxury_retail', risk: 'medium', lat: 12.9721, lng: 77.5956, icon: '💎', category: 'shopping' },
  { id: 7, name: 'Manipal Hospital', type: 'hospital', risk: 'safe', lat: 12.9400, lng: 77.6020, icon: '🏥', category: 'medical' },
  { id: 8, name: 'HP Fuel Station', type: 'petrol_bunk', risk: 'safe', lat: 12.9250, lng: 77.6100, icon: '⛽', category: 'fuel' },
];

const RISK_COLORS = { safe: '#00d4aa', low: '#4299e1', medium: '#f6ad55', critical: '#fc5c7d' };
const RISK_LABELS = { safe: 'Safe', low: 'Low Risk', medium: 'Caution', critical: 'Critical' };

export default function SafeZoneMap() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (mapInstanceRef.current) return;

    import('leaflet').then(L => {
      const map = L.default.map(mapRef.current, {
        center: [12.9716, 77.6412],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      L.default.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map);

      ZONES.forEach(zone => {
        const color = RISK_COLORS[zone.risk];
        L.default.circle([zone.lat, zone.lng], {
          radius: 180,
          color: color,
          fillColor: color,
          fillOpacity: 0.12,
          weight: 2,
        }).addTo(map);

        const icon = L.default.divIcon({
          html: `<div class="mini-marker" style="--mc:${color}">${zone.icon}</div>`,
          className: '',
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        L.default.marker([zone.lat, zone.lng], { icon }).addTo(map)
          .bindPopup(`<b>${zone.name}</b><br/><span style="color:${color}">${RISK_LABELS[zone.risk]}</span>`);
      });

      L.default.circleMarker([12.9716, 77.6412], {
        radius: 6, color: '#fff', fillColor: '#00d4aa', fillOpacity: 1, weight: 2,
      }).addTo(map);

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="mini-map-container">
      <div ref={mapRef} className="mini-map-leaflet" />
      <div className="mini-map-overlay">
        <div className="label">SAFETY ZONES</div>
        <div className="mini-map-legend">
          {Object.entries(RISK_COLORS).map(([risk, color]) => (
            <div key={risk} className="legend-dot" style={{ background: color }} title={RISK_LABELS[risk]} />
          ))}
        </div>
      </div>
    </div>
  );
}
