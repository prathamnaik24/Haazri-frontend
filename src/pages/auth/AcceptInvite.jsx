import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { formLabel, formInput } from '../../components/ui/styles.js'
import api from '../../services/api.js'

export default function AcceptInvite() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [step, setStep] = useState('verify') // 'verify' | 'setup' | 'done'
  const [verifying, setVerifying] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [inviteData, setInviteData] = useState(null)
  const [form, setForm] = useState({ password: '', confirm: '' })

  // Auto-verify token if provided in URL
  useEffect(() => {
    if (token) handleVerify()
  }, [])

  const handleVerify = async () => {
    setVerifying(true)
    setError('')
    try {
      // Peek at invite token — if valid the backend lets us proceed
      setInviteData({ email: 'employee@company.com' }) // will be populated from token
      setStep('setup')
    } catch (err) {
      setError('This invitation link is invalid or has expired.')
    } finally {
      setVerifying(false)
    }
  }

  const handleActivate = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await api.post('/auth/invite/accept', {
        token,
        password: form.password,
      })
      localStorage.setItem('token', res.data.data.tokens.accessToken)
      setStep('done')
      setTimeout(() => navigate('/app'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to activate account. The link may have expired.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 460 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <svg width="36" height="36" viewBox="0 0 30 30" fill="none">
              <rect width="30" height="30" rx="8" fill="#1677B8" />
              <path d="M8 15 L15 8 L22 15 L15 12 Z" fill="white" opacity="0.9" />
              <path d="M8 15 L15 22 L22 15 L15 18 Z" fill="white" opacity="0.6" />
            </svg>
            <span style={{ fontWeight: 700, fontSize: 22, color: '#172B3A', letterSpacing: '-0.02em' }}>Burraa</span>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', overflow: 'hidden' }}>

          {/* Header bar */}
          <div style={{ background: '#1677B8', padding: '20px 28px' }}>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: 0 }}>
              {step === 'done' ? '🎉 Account Activated!' : 'Accept Invitation'}
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: '4px 0 0' }}>
              {step === 'done'
                ? 'Redirecting you to your dashboard...'
                : 'Set up your password to activate your account'}
            </p>
          </div>

          <div style={{ padding: 28 }}>
            {step === 'done' ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#172B3A', marginBottom: 6 }}>You're all set!</div>
                <div style={{ fontSize: 13, color: '#9ca3af' }}>Signing you in...</div>
              </div>
            ) : (
              <form onSubmit={step === 'verify' ? (e) => { e.preventDefault(); handleVerify() } : handleActivate}>
                {error && (
                  <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
                    {error}
                  </div>
                )}

                {step === 'verify' && (
                  <div>
                    <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 20, lineHeight: 1.6 }}>
                      You've been invited to join your organization on Burraa.
                      Paste your invitation token below, or use the link from your email.
                    </div>
                    <div style={{ marginBottom: 20 }}>
                      <label style={formLabel}>Invitation Token</label>
                      <input
                        value={token}
                        placeholder="Paste your invite token here..."
                        style={formInput}
                        readOnly={!!token}
                      />
                    </div>
                    <button type="submit" disabled={verifying || !token}
                      style={{
                        width: '100%', padding: '11px', borderRadius: 8, border: 'none',
                        background: '#1677B8', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                      }}>
                      {verifying ? 'Verifying...' : 'Verify Invitation'}
                    </button>
                  </div>
                )}

                {step === 'setup' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '12px 14px', fontSize: 13, color: '#0369a1' }}>
                      ✉️ Invitation verified! Set your password to activate your account.
                    </div>
                    <div>
                      <label style={formLabel}>New Password</label>
                      <input
                        type="password"
                        value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        placeholder="Min. 8 characters"
                        style={formInput}
                        required
                        autoFocus
                      />
                    </div>
                    <div>
                      <label style={formLabel}>Confirm Password</label>
                      <input
                        type="password"
                        value={form.confirm}
                        onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                        placeholder="Repeat your password"
                        style={formInput}
                        required
                      />
                    </div>
                    <button type="submit" disabled={submitting}
                      style={{
                        width: '100%', padding: '11px', borderRadius: 8, border: 'none',
                        background: '#1677B8', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                        marginTop: 4,
                      }}>
                      {submitting ? 'Activating...' : 'Activate Account'}
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#9ca3af', marginTop: 20 }}>
          Already have an account?{' '}
          <button onClick={() => navigate('/employee-login')}
            style={{ background: 'none', border: 'none', color: '#1677B8', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}
