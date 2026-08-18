import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #172B3A 0%, #1e3a4f 50%, #517891 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Logo / Brand */}
      <div style={{ marginBottom: 48, textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
          <span style={{ color: '#57B9FF', fontWeight: 900, fontSize: 36, letterSpacing: '-0.03em' }}>B</span>
          <svg width="18" height="22" viewBox="0 0 18 22" fill="none" style={{ marginLeft: -4, marginTop: -6 }}>
            <path d="M9 2 L16 9 L9 9" stroke="#57B9FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ color: '#57B9FF', fontWeight: 900, fontSize: 36, letterSpacing: '-0.03em', marginLeft: -2 }}>URRAA</span>
          <span style={{ color: '#57B9FF', fontSize: 13, marginTop: 4, opacity: 0.7 }}>™</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: 0, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>
          Attendance Management Platform
        </p>
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, width: '100%', maxWidth: 640 }}>
        {/* Organizations Card */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(87,185,255,0.2)',
          borderRadius: 20,
          padding: '32px 28px',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(22,119,184,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#57B9FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 22V12h6v10" stroke="#57B9FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', margin: 0 }}>For Organizations</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.6 }}>
            Register your organization or log in as an administrator to manage your team.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            <Link to="/register" style={{
              display: 'block', textAlign: 'center', padding: '12px',
              background: '#1677B8', color: '#ffffff', borderRadius: 12,
              fontWeight: 600, fontSize: 14, textDecoration: 'none',
              transition: 'background 0.2s',
            }}>
              Register Organization
            </Link>
            <Link to="/login" style={{
              display: 'block', textAlign: 'center', padding: '12px',
              background: 'rgba(255,255,255,0.08)', color: '#EAF6FF', borderRadius: 12,
              fontWeight: 500, fontSize: 14, textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.12)',
            }}>
              Admin Login
            </Link>
          </div>
        </div>

        {/* Employees Card */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(87,185,255,0.2)',
          borderRadius: 20,
          padding: '32px 28px',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(22,119,184,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#57B9FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="7" r="4" stroke="#57B9FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#57B9FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', margin: 0 }}>For Employees</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.6 }}>
            Log in to your workspace to mark attendance, request leaves, and view your records.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            <Link to="/employee-login" style={{
              display: 'block', textAlign: 'center', padding: '12px',
              background: '#1677B8', color: '#ffffff', borderRadius: 12,
              fontWeight: 600, fontSize: 14, textDecoration: 'none',
            }}>
              Employee Login
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, marginTop: 48 }}>
        Powered by <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Burraa</span>
      </p>
    </div>
  )
}
