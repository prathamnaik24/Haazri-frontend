import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

export default function EmployeeLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ org_slug: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/employee/login', formData);
      localStorage.setItem('token', res.data.data.tokens.accessToken);
      navigate('/app');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px', border: '1.5px solid #d1d9e0',
    borderRadius: 12, fontSize: 13, color: '#172B3A', outline: 'none',
    marginBottom: 18, boxSizing: 'border-box', background: '#f8fafc',
    transition: 'border 0.15s, background 0.15s',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #172B3A 0%, #1e3a4f 50%, #517891 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: 24,
        width: '100%',
        maxWidth: 420,
        padding: '40px 36px 32px',
        boxShadow: '0 24px 80px rgba(22,119,184,0.18)',
      }}>
        {/* Logo */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#1677B8', fontWeight: 900, fontSize: 28, letterSpacing: '-0.03em' }}>B</span>
            <svg width="16" height="20" viewBox="0 0 18 22" fill="none" style={{ marginLeft: -4, marginTop: -4 }}>
              <path d="M9 2 L16 9 L9 9" stroke="#1677B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ color: '#1677B8', fontWeight: 900, fontSize: 28, letterSpacing: '-0.03em', marginLeft: -2 }}>URRAA</span>
            <span style={{ color: '#9ca3af', fontSize: 11, marginTop: 2 }}>™</span>
          </div>
          <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, marginTop: 4, display: 'block' }}>Employee Portal</span>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#172B3A', margin: '0 0 4px' }}>Welcome back</h1>
        <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 28px' }}>Sign in to your workspace.</p>

        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
            padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 20,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Organization ID</label>
          <input
            type="text" name="org_slug" placeholder="e.g. acme-corp"
            value={formData.org_slug} onChange={handleChange} required
            style={inputStyle}
            onFocus={e => { e.target.style.borderColor = '#1677B8'; e.target.style.background = '#fff'; }}
            onBlur={e => { e.target.style.borderColor = '#d1d9e0'; e.target.style.background = '#f8fafc'; }}
          />

          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Work Email</label>
          <input
            type="email" name="email" placeholder="Enter your work email"
            value={formData.email} onChange={handleChange} required
            style={inputStyle}
            onFocus={e => { e.target.style.borderColor = '#1677B8'; e.target.style.background = '#fff'; }}
            onBlur={e => { e.target.style.borderColor = '#d1d9e0'; e.target.style.background = '#f8fafc'; }}
          />

          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Password</label>
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <input
              type={showPass ? 'text' : 'password'} name="password" placeholder="Enter your password"
              value={formData.password} onChange={handleChange} required
              style={{ ...inputStyle, marginBottom: 0, paddingRight: 42 }}
              onFocus={e => { e.target.style.borderColor = '#1677B8'; e.target.style.background = '#fff'; }}
              onBlur={e => { e.target.style.borderColor = '#d1d9e0'; e.target.style.background = '#f8fafc'; }}
            />
            <button type="button" onClick={() => setShowPass(!showPass)} style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0,
            }}>
              {showPass ? (
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                </svg>
              )}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6b7280', cursor: 'pointer' }}>
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ accentColor: '#1677B8' }} />
              Remember me
            </label>
            <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#1677B8', fontWeight: 500 }}>
              Forgot password?
            </button>
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px', borderRadius: 14, border: 'none',
            background: loading ? '#57B9FF' : '#1677B8',
            color: '#ffffff', fontSize: 14, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 20,
          }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: '#f3f4f6' }} />
          <span style={{ fontSize: 12, color: '#9ca3af' }}>Or sign in with</span>
          <div style={{ flex: 1, height: 1, background: '#f3f4f6' }} />
        </div>

        {/* Biometric Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Face ID', icon: (
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="#9ca3af" strokeWidth="1.5" />
                <path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="12" cy="14" r="1.5" fill="#9ca3af" />
              </svg>
            )},
            { label: 'Fingerprint', icon: (
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path d="M12 2a4 4 0 014 4c0 1.5-.8 2.8-2 3.5" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M8 6a4 4 0 014-4" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M6 10c0 4 2 7 6 8M18 10c0 4-2 7-6 8" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M10 10c0 2 .5 4 2 5M14 10c0 2-.5 4-2 5" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )},
          ].map(({ label, icon }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <button type="button" title={`${label} — Coming Soon`} style={{
                width: 54, height: 54, borderRadius: 14, border: '1.5px solid #e5e7eb',
                background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'not-allowed', opacity: 0.55,
              }}>{icon}</button>
              <span style={{ fontSize: 10, color: '#9ca3af', display: 'block', marginTop: 4 }}>Coming soon</span>
            </div>
          ))}
        </div>

        {/* Link to Admin */}
        <div style={{ textAlign: 'center' }}>
          <Link to="/login" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>
            Organization Admin? <span style={{ color: '#1677B8', fontWeight: 500 }}>Sign in here →</span>
          </Link>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 28, marginBottom: 0 }}>
          Powered by <span style={{ fontWeight: 600, color: '#6b7280' }}>Burraa</span>
        </p>
      </div>
    </div>
  );
}
