import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const BG = '#EBF4FF';
const BLUE = '#1677B8';
const NAVY = '#172B3A';

const inputStyle = {
  width: '100%', padding: '11px 14px', border: '1.5px solid #D6E8F7',
  borderRadius: 10, fontSize: 13, color: NAVY, outline: 'none',
  background: '#F7FBFF', boxSizing: 'border-box', transition: 'border 0.15s',
};
const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#526B7A', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' };

export default function OrgRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    org_name: '',
    org_slug: '',
    org_type: 'Corporate',
    admin_first_name: '',
    admin_last_name: '',
    admin_email: '',
    admin_password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    let value = e.target.value;
    // Auto-generate slug from org name
    if (e.target.name === 'org_name') {
      setFormData({
        ...formData,
        org_name: value,
        org_slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      });
      return;
    }
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/org/register', formData);
      localStorage.setItem('token', res.data.data.tokens.accessToken);
      navigate('/app');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const focus = e => { e.target.style.borderColor = BLUE; e.target.style.background = '#fff'; };
  const blur = e => { e.target.style.borderColor = '#D6E8F7'; e.target.style.background = '#F7FBFF'; };

  return (
    <div style={{
      minHeight: '100vh',
      background: BG,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: 520 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: BLUE, fontWeight: 900, fontSize: 30, letterSpacing: '-0.04em' }}>Haazri</span>
          </div>
          <p style={{ color: '#517891', fontSize: 13, margin: '6px 0 0', letterSpacing: '0.05em', fontWeight: 500 }}>
            ATTENDANCE MANAGEMENT PLATFORM
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: 24,
          boxShadow: '0 4px 32px rgba(22,119,184,0.12)',
          border: '1px solid #D6E8F7',
          overflow: 'hidden',
        }}>
          {/* Header bar */}
          <div style={{ background: BLUE, padding: '22px 32px' }}>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: 0 }}>Register Your Organization</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: '4px 0 0' }}>
              Set up your account in under a minute
            </p>
          </div>

          <div style={{ padding: '28px 32px 32px' }}>
            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
                padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 20,
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Section: Organization */}
              <p style={{ fontSize: 11, fontWeight: 700, color: BLUE, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 14px' }}>
                Organization Details
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Organization Name</label>
                  <input
                    name="org_name" placeholder="e.g. Acme Corp"
                    value={formData.org_name} onChange={handleChange} required
                    style={inputStyle}
                    onFocus={focus} onBlur={blur}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Workspace Code</label>
                  <input
                    name="org_slug" placeholder="acme-corp"
                    value={formData.org_slug} onChange={handleChange} required
                    style={{ ...inputStyle, color: '#526B7A' }}
                    onFocus={e => { focus(e); e.target.style.color = NAVY; }}
                    onBlur={e => { blur(e); e.target.style.color = '#526B7A'; }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 22 }}>
                <label style={labelStyle}>Organization Type</label>
                <select
                  name="org_type" value={formData.org_type} onChange={handleChange}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  onFocus={focus} onBlur={blur}
                >
                  {['Corporate', 'Startup', 'Non-Profit', 'Government', 'Education', 'Other'].map(t => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: '#f3f4f6', margin: '4px 0 20px' }} />

              {/* Section: Admin */}
              <p style={{ fontSize: 11, fontWeight: 700, color: BLUE, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 14px' }}>
                Administrator Account
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>First Name</label>
                  <input
                    name="admin_first_name" placeholder="First name"
                    value={formData.admin_first_name} onChange={handleChange} required
                    style={inputStyle}
                    onFocus={focus} onBlur={blur}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Last Name</label>
                  <input
                    name="admin_last_name" placeholder="Last name"
                    value={formData.admin_last_name} onChange={handleChange} required
                    style={inputStyle}
                    onFocus={focus} onBlur={blur}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Admin Email</label>
                <input
                  type="email" name="admin_email" placeholder="admin@company.com"
                  value={formData.admin_email} onChange={handleChange} required
                  style={inputStyle}
                  onFocus={focus} onBlur={blur}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Password</label>
                <input
                  type="password" name="admin_password" placeholder="Min. 8 characters"
                  value={formData.admin_password} onChange={handleChange} required minLength={8}
                  style={inputStyle}
                  onFocus={focus} onBlur={blur}
                />
              </div>

              <button
                type="submit" disabled={loading}
                style={{
                  width: '100%', padding: '14px', borderRadius: 14, border: 'none',
                  background: loading ? '#57B9FF' : BLUE,
                  color: '#fff', fontSize: 14, fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Creating Organization...' : 'Create Organization'}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: 13, color: '#9ca3af', marginTop: 20, marginBottom: 0 }}>
              Already registered?{' '}
              <Link to="/login" style={{ color: BLUE, fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
            </p>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 24 }}>
          Powered by <span style={{ color: '#517891', fontWeight: 600 }}>Haazri</span>
        </p>
      </div>
    </div>
  );
}
