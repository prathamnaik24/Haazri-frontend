import { useState, useEffect } from 'react'
import AppShell from '../components/layout/AppShell.jsx'
import { card, cardTitle, formLabel, formInput, primaryBtn } from '../components/ui/styles.js'
import { Avatar, avatarColor } from '../components/ui/Avatar.jsx'
import { LogoutIcon } from '../components/ui/Icons.jsx'
import api from '../services/api.js'
import { getUserFromToken, logout } from '../utils/auth.js'

export default function Profile() {
  const tokenUser = getUserFromToken()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Profile form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError] = useState('')

  // Password form state
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [savingPw, setSavingPw] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')

  const fetchProfile = () => {
    api.get('/auth/me')
      .then(res => {
        const user = res.data?.data?.user || {}
        setProfile(user)
        setFirstName(user.first_name || '')
        setLastName(user.last_name || '')
      })
      .catch(() => {
        const fallback = tokenUser || {}
        setProfile(fallback)
        setFirstName(fallback.first_name || '')
        setLastName(fallback.last_name || '')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  // ── Save Profile Details ──
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    setProfileError('')
    setProfileSuccess('')
    try {
      const res = await api.patch('/auth/profile', {
        first_name: firstName,
        last_name: lastName,
      })
      setProfileSuccess(res.data?.message || 'Profile updated successfully!')
      setTimeout(() => setProfileSuccess(''), 4000)
      fetchProfile()
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  // ── Change Password ──
  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPwError('')
    setPwSuccess('')

    if (pwForm.newPw !== pwForm.confirm) {
      setPwError('New passwords do not match.')
      return
    }
    if (pwForm.newPw.length < 8) {
      setPwError('New password must be at least 8 characters long.')
      return
    }

    setSavingPw(true)
    try {
      const res = await api.post('/auth/change-password', {
        currentPassword: pwForm.current,
        newPassword: pwForm.newPw,
      })
      setPwSuccess(res.data?.message || 'Password changed successfully!')
      setPwForm({ current: '', newPw: '', confirm: '' })
      setTimeout(() => setPwSuccess(''), 4000)
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password. Please verify your current password.')
    } finally {
      setSavingPw(false)
    }
  }

  const displayName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User'
    : 'User'

  return (
    <AppShell>
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 800 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#172B3A', margin: 0 }}>Profile & Settings</h1>

        {/* Profile Card */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid #f3f4f6' }}>
            <Avatar name={displayName} size={64} bgColor={avatarColor(0)} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#172B3A' }}>{displayName}</div>
              <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 3 }}>{profile?.email || tokenUser?.email || ''}</div>
              <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
                <span style={{ fontSize: 12, background: '#EAF6FF', color: '#1677B8', padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>
                  {tokenUser?.type === 'org_admin' ? 'Org Admin' : (tokenUser?.roles?.[0] || 'Employee')}
                </span>
                {profile?.employee_id && (
                  <span style={{ fontSize: 12, background: '#F1F5F9', color: '#475569', padding: '3px 10px', borderRadius: 20, fontWeight: 600, fontFamily: 'monospace' }}>
                    ID: {profile.employee_id}
                  </span>
                )}
              </div>
            </div>
          </div>

          {profileSuccess && (
            <div style={{ background: '#d1fae5', border: '1px solid #86efac', color: '#15803d', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
              ✓ {profileSuccess}
            </div>
          )}
          {profileError && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
              {profileError}
            </div>
          )}

          <form onSubmit={handleSaveProfile}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={formLabel}>First Name</label>
                <input
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  style={formInput}
                  placeholder="First name"
                  required
                />
              </div>
              <div>
                <label style={formLabel}>Last Name</label>
                <input
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  style={formInput}
                  placeholder="Last name"
                  required
                />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={formLabel}>Email Address</label>
              <input
                value={profile?.email || tokenUser?.email || ''}
                style={{ ...formInput, background: '#f9fafb', color: '#9ca3af', cursor: 'not-allowed' }}
                disabled
                title="Email address cannot be changed"
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" disabled={savingProfile} style={primaryBtn}>
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div style={card}>
          <h2 style={{ ...cardTitle, marginBottom: 20 }}>Change Password</h2>
          {pwSuccess && (
            <div style={{ background: '#d1fae5', border: '1px solid #86efac', color: '#15803d', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
              ✓ {pwSuccess}
            </div>
          )}
          {pwError && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
              {pwError}
            </div>
          )}
          <form onSubmit={handlePasswordChange}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={formLabel}>Current Password</label>
                <input
                  type="password"
                  value={pwForm.current}
                  onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
                  placeholder="Enter current password"
                  style={formInput}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={formLabel}>New Password</label>
                  <input
                    type="password"
                    value={pwForm.newPw}
                    onChange={e => setPwForm(f => ({ ...f, newPw: e.target.value }))}
                    placeholder="Min. 8 characters"
                    style={formInput}
                    required
                  />
                </div>
                <div>
                  <label style={formLabel}>Confirm New Password</label>
                  <input
                    type="password"
                    value={pwForm.confirm}
                    onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                    placeholder="Repeat new password"
                    style={formInput}
                    required
                  />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button type="submit" disabled={savingPw} style={primaryBtn}>
                {savingPw ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

        {/* Session Info */}
        <div style={{ ...card, background: '#f9fafb' }}>
          <h2 style={{ ...cardTitle, marginBottom: 12 }}>Session Info</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Organization ID', value: tokenUser?.organization_id || '—' },
              { label: 'Person ID',       value: tokenUser?.person_id || '—' },
              { label: 'Token Issued',    value: tokenUser?.iat ? new Date(tokenUser.iat * 1000).toLocaleString() : '—' },
              { label: 'Token Expires',   value: tokenUser?.exp ? new Date(tokenUser.exp * 1000).toLocaleString() : '—' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ color: '#6b7280', fontWeight: 500 }}>{item.label}</span>
                <span style={{ color: '#374151', fontFamily: 'monospace', fontSize: 12 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sign Out Card */}
        <div style={{ ...card, background: '#FFF5F5', border: '1px solid #FED7D7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ ...cardTitle, color: '#9B2C2C', margin: 0 }}>Sign Out</h2>
              <p style={{ fontSize: 13, color: '#742A2A', margin: '4px 0 0' }}>End your session and sign out of Haazri on this device.</p>
            </div>
            <button
              onClick={logout}
              style={{
                background: '#E53E3E', color: '#FFFFFF', border: 'none', borderRadius: 8,
                padding: '10px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#C53030'}
              onMouseLeave={e => e.currentTarget.style.background = '#E53E3E'}
            >
              <LogoutIcon size={16} color="#FFFFFF" />
              Sign Out Now
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
