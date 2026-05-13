import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import './Auth.css';

export default function Auth() {
  const { setIsAuthenticated, profile } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate auth delay
    setTimeout(() => {
      setIsAuthenticated(true);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="auth-container">
      <div className="auth-glass anim-pop">
        <div className="auth-header">
          <div className="auth-logo">🛡️</div>
          <h1 className="auth-title">FinGuard <span>AI</span></h1>
          <p className="auth-subtitle">Your Financial Safety Shield</p>
        </div>

        <form className="auth-form" onSubmit={handleAuth}>
          {!isLogin && (
            <div className="auth-field anim-slide">
              <label>FULL NAME</label>
              <input type="text" placeholder="Enter your name" defaultValue={profile.name} required />
            </div>
          )}
          
          <div className="auth-field anim-slide">
            <label>{isLogin ? 'SECURE PIN' : 'SET SECURE PIN'}</label>
            <input 
              type="password" 
              placeholder="••••" 
              maxLength={4} 
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="pin-input"
              required 
            />
          </div>

          <button className="btn btn-teal auth-btn" disabled={loading}>
            {loading ? <span className="sim-spinner" /> : (isLogin ? 'Secure Login' : 'Create Account')}
          </button>
        </form>

        <div className="auth-footer">
          <button className="auth-toggle" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
          </button>
        </div>

        <div className="auth-biometric">
          <div className="bio-icon">👤</div>
          <span>Biometric unlock enabled</span>
        </div>
      </div>
      
      <div className="auth-bg-blobs">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
      </div>
    </div>
  );
}
