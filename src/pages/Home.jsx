import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#EBF4FF',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Brand */}
      <div style={{ marginBottom: 48, textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 8 }}>
          <span style={{ color: '#1677B8', fontWeight: 900, fontSize: 38, letterSpacing: '-0.04em' }}>Haazri</span>
        </div>
        <p style={{ color: '#517891', fontSize: 13, margin: 0, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
          Attendance Management Platform
        </p>
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, width: '100%', maxWidth: 640 }}>

        {/* Organizations */}
        <div style={{
          background: '#ffffff', border: '1px solid #D6E8F7', borderRadius: 20,
          padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 12,
          boxShadow: '0 2px 16px rgba(22,119,184,0.08)',
        }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EBF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#1677B8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 22V12h6v10" stroke="#1677B8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#172B3A', margin: 0 }}>For Organizations</h2>
          <p style={{ fontSize: 13, color: '#526B7A', margin: 0, lineHeight: 1.6 }}>
            Register your organization or log in as an administrator to manage your team.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            <Link to="/register" style={{
              display: 'block', textAlign: 'center', padding: '12px',
              background: '#1677B8', color: '#fff', borderRadius: 12,
              fontWeight: 600, fontSize: 14, textDecoration: 'none',
            }}>Register Organization</Link>
            <Link to="/login" style={{
              display: 'block', textAlign: 'center', padding: '12px',
              background: '#EBF4FF', color: '#1677B8', borderRadius: 12,
              fontWeight: 600, fontSize: 14, textDecoration: 'none',
              border: '1px solid #D6E8F7',
            }}>Admin Login</Link>
          </div>
        </div>

        {/* Employees */}
        <div style={{
          background: '#ffffff', border: '1px solid #D6E8F7', borderRadius: 20,
          padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 12,
          boxShadow: '0 2px 16px rgba(22,119,184,0.08)',
        }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EBF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#1677B8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="7" r="4" stroke="#1677B8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#1677B8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#172B3A', margin: 0 }}>For Employees</h2>
          <p style={{ fontSize: 13, color: '#526B7A', margin: 0, lineHeight: 1.6 }}>
            Sign in using your Workspace Code, Employee ID, and password to access your dashboard.
          </p>
          <div style={{ marginTop: 8 }}>
            <Link to="/employee-login" style={{
              display: 'block', textAlign: 'center', padding: '12px',
              background: '#1677B8', color: '#fff', borderRadius: 12,
              fontWeight: 600, fontSize: 14, textDecoration: 'none',
            }}>Employee Login</Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p style={{ color: '#9ca3af', fontSize: 12, marginTop: 48 }}>
        Powered by <span style={{ color: '#517891', fontWeight: 600 }}>Burraa</span>
      </p>
    </div>
  )
}
