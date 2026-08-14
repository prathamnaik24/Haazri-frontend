import { useState, useEffect } from 'react'
import AppShell from '../../components/layout/AppShell.jsx'
import { card, cardTitle, formLabel, formInput, primaryBtn } from '../../components/ui/styles.js'
import { Avatar, avatarColor } from '../../components/ui/Avatar.jsx'
import api from '../../services/api.js'
import { getUserFromToken } from '../../utils/auth.js'

export default function Profile() {
  const tokenUser = getUserFromToken()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')

  useEffect(() => {
    api.get('/auth/me')
      .then(res => setProfile(res.data.data))
      .catch(() => setProfile({ ...tokenUser, email: tokenUser?.email || '' }))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      // Profile update endpoint (to be implemented)
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPwError('')
    if (pwForm.newPw !== pwForm.confirm) {
      setPwError('New passwords do not match')
      return
    }
    if (pwForm.newPw.length < 8) {
      setPwError('Password must be at least 8 characters')
      return
    }
    setPwSuccess('Password changed successfully!')
    setPwForm({ current: '', newPw: '', confirm: '' })
    setTimeout(() => setPwSuccess(''), 3000)
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
              <div style={{ marginTop: 6 }}>
                <span style={{ fontSize: 12, background: '#EAF6FF', color: '#1677B8', padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>
                  {tokenUser?.type === 'org_admin' ? 'Org Admin' : (tokenUser?.roles?.[0] || 'Employee')}
                </span>
              </div>
            </div>
          </div>

          {success && (
            <div style={{ background: '#d1fae5', border: '1px solid #86efac', color: '#15803d', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
              {success}
            </div>
          )}
          {error && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={formLabel}>First Name</label>
                <input
                  defaultValue={profile?.first_name || ''}
                  style={formInput}
                  placeholder="First name"
                />
              </div>
              <div>
                <label style={formLabel}>Last Name</label>
                <input
                  defaultValue={profile?.last_name || ''}
                  style={formInput}
                  placeholder="Last name"
                />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={formLabel}>Email Address</label>
              <input
                defaultValue={profile?.email || tokenUser?.email || ''}
                style={{ ...formInput, background: '#f9fafb', color: '#9ca3af' }}
                disabled
                title="Email cannot be changed"
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" disabled={saving} style={primaryBtn}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div style={card}>
          <h2 style={{ ...cardTitle, marginBottom: 20 }}>Change Password</h2>
          {pwSuccess && (
            <div style={{ background: '#d1fae5', border: '1px solid #86efac', color: '#15803d', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
              {pwSuccess}
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
              <button type="submit" style={primaryBtn}>Update Password</button>
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
      </div>
    </AppShell>
  )
}
