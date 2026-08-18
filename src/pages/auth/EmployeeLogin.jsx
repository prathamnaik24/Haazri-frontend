import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const BG = '#EBF4FF';
const BLUE = '#1677B8';
const NAVY = '#172B3A';

const inputStyle = {
  width: '100%', padding: '12px 14px', border: '1.5px solid #D6E8F7',
  borderRadius: 10, fontSize: 13, color: NAVY, outline: 'none',
  background: '#F7FBFF', boxSizing: 'border-box', transition: 'border 0.15s',
};
const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 };

export default function EmployeeLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ org_slug: '', employee_id: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      // employee_id sent as additional credential; backend will be updated to verify it
      const res = await api.post('/auth/employee/login', formData);
      localStorage.setItem('token', res.data.data.tokens.accessToken);
      navigate('/app');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally { setLoading(false); }
  };

  const focus = e => { e.target.style.borderColor = BLUE; e.target.style.background = '#fff'; };
  const blur  = e => { e.target.style.borderColor = '#D6E8F7'; e.target.style.background = '#F7FBFF'; };

  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 420, padding: '40px 36px 32px', boxShadow: '0 4px 32px rgba(22,119,184,0.12)', border: '1px solid #D6E8F7' }}>

        {/* Brand */}
        <div style={{ marginBottom: 32 }}>
          <span style={{ color: BLUE, fontWeight: 900, fontSize: 28, letterSpacing: '-0.03em' }}>Haazri</span>
          <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, marginTop: 4, display: 'block' }}>Employee Portal</span>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, color: NAVY, margin: '0 0 4px' }}>Welcome back</h1>
        <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 28px' }}>Sign in to your workspace.</p>

        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 20 }}>{error}</div>}

        {/* Info banner */}
        <div style={{ background: '#EBF4FF', border: '1px solid #D6E8F7', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#517891', marginBottom: 22, lineHeight: 1.6 }}>
          ℹ️ Your <strong>Workspace Code</strong> and <strong>Employee ID</strong> are provided by your organization admin.
        </div>

        <form onSubmit={handleSubmit}>
          {/* Workspace Code (org_slug) */}
          <label style={labelStyle}>Workspace Code</label>
          <input type="text" name="org_slug" placeholder="e.g. acme-corp or haazri-school" value={formData.org_slug} onChange={handleChange} required style={{ ...inputStyle, marginBottom: 18 }} onFocus={focus} onBlur={blur} />

          {/* Employee ID */}
          <label style={labelStyle}>Employee ID</label>
          <input type="text" name="employee_id" placeholder="e.g. EMP-001 or STU-2024-045" value={formData.employee_id} onChange={handleChange} required style={{ ...inputStyle, marginBottom: 18 }} onFocus={focus} onBlur={blur} />

          {/* Password */}
          <label style={labelStyle}>Password</label>
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <input type={showPass ? 'text' : 'password'} name="password" placeholder="Enter your password" value={formData.password} onChange={handleChange} required style={{ ...inputStyle, paddingRight: 42 }} onFocus={focus} onBlur={blur} />
            <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" /></svg>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6b7280', cursor: 'pointer' }}>
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ accentColor: BLUE }} /> Remember me
            </label>
            <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: BLUE, fontWeight: 500 }}>Forgot password?</button>
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: loading ? '#57B9FF' : BLUE, color: '#fff', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 20 }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: '#f3f4f6' }} />
          <span style={{ fontSize: 12, color: '#9ca3af' }}>Or sign in with</span>
          <div style={{ flex: 1, height: 1, background: '#f3f4f6' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
          {['Face ID', 'Fingerprint'].map(label => (
            <div key={label} style={{ textAlign: 'center' }}>
              <button type="button" title={`${label} — Coming Soon`} style={{ width: 54, height: 54, borderRadius: 14, border: '1.5px solid #D6E8F7', background: '#F7FBFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'not-allowed', opacity: 0.55 }}>
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#9ca3af" strokeWidth="1.5" /><path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" /><circle cx="12" cy="14" r="1.5" fill="#9ca3af" /></svg>
              </button>
              <span style={{ fontSize: 10, color: '#9ca3af', display: 'block', marginTop: 4 }}>Coming soon</span>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link to="/login" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>
            Organization Admin? <span style={{ color: BLUE, fontWeight: 500 }}>Sign in here →</span>
          </Link>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 28, marginBottom: 0 }}>
          Powered by <span style={{ fontWeight: 600, color: '#517891' }}>Burraa</span>
        </p>
      </div>
    </div>
  );
}
