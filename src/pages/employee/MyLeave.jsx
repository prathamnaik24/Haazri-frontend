import { useState } from 'react'
import AppShell from '../../components/layout/AppShell.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { card, cardTitle, formLabel, formInput } from '../../components/ui/styles.js'
import api from '../../services/api.js'

const leaveBalances = [
  { type: 'Annual Leave', used: 2, total: 10, color: '#57B9FF', bg: '#EAF6FF' },
  { type: 'Sick Leave',   used: 1, total: 7,  color: '#22c55e', bg: '#d1fae5' },
  { type: 'Casual Leave', used: 0, total: 5,  color: '#f59e0b', bg: '#fef3c7' },
]

const mockLeaveHistory = [
  { type: 'Annual Leave', from: '2026-08-11', to: '2026-08-11', days: 1, reason: 'Personal work', status: 'Approved' },
  { type: 'Sick Leave',   from: '2026-07-22', to: '2026-07-22', days: 1, reason: 'Not feeling well', status: 'Approved' },
  { type: 'Annual Leave', from: '2026-07-01', to: '2026-07-03', days: 3, reason: 'Family event', status: 'Rejected' },
]

export default function MyLeave() {
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    leave_type: 'Annual Leave',
    start_date: '',
    end_date: '',
    reason: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await api.post('/leaves/request', form)
      setSuccess('Leave request submitted successfully!')
      setShowForm(false)
      setForm({ leave_type: 'Annual Leave', start_date: '', end_date: '', reason: '' })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppShell>
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#172B3A', margin: 0 }}>My Leave</h1>
          <button onClick={() => setShowForm(true)}
            style={{ background: '#57B9FF', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            + Request Leave
          </button>
        </div>

        {success && (
          <div style={{ background: '#d1fae5', border: '1px solid #86efac', color: '#15803d', padding: '12px 16px', borderRadius: 8, fontSize: 13 }}>
            {success}
          </div>
        )}

        {/* Balance Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {leaveBalances.map(lb => (
            <div key={lb.type} style={card}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#6b7280', marginBottom: 12 }}>{lb.type}</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#172B3A', letterSpacing: '-0.03em', marginBottom: 8 }}>
                {lb.total - lb.used}
                <span style={{ fontSize: 14, fontWeight: 500, color: '#9ca3af' }}> / {lb.total}</span>
              </div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>Days remaining</div>
              <div style={{ height: 6, borderRadius: 6, background: lb.bg, overflow: 'hidden' }}>
                <div style={{ width: `${(lb.used / lb.total) * 100}%`, height: '100%', background: lb.color, borderRadius: 6 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Leave History */}
        <div style={card}>
          <h2 style={{ ...cardTitle, marginBottom: 16 }}>Leave Requests</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Type', 'From', 'To', 'Days', 'Reason', 'Status'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#374151', borderBottom: '1px solid #f3f4f6' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockLeaveHistory.map((row, i) => (
                <tr key={i}
                  style={{ borderBottom: '1px solid #f9fafb' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <td style={{ padding: '13px 16px', fontSize: 13, color: '#374151', fontWeight: 500 }}>{row.type}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: '#6b7280' }}>{row.from}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: '#6b7280' }}>{row.to}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 600, color: '#374151' }}>{row.days}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: '#6b7280', maxWidth: 200 }}>{row.reason}</td>
                  <td style={{ padding: '13px 16px' }}><Badge status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Request Leave Modal */}
        {showForm && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(2px)',
          }}
            onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}
          >
            <div style={{ background: '#fff', borderRadius: 16, width: 560, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
              <div style={{ background: '#57B9FF', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>Request Leave</h2>
                <button onClick={() => setShowForm(false)}
                  style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', color: '#fff', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>{error}</div>}
                  <div>
                    <label style={formLabel}>Leave Type</label>
                    <select value={form.leave_type} onChange={e => setForm(f => ({ ...f, leave_type: e.target.value }))}
                      style={{ ...formInput, cursor: 'pointer' }} required>
                      <option>Annual Leave</option>
                      <option>Sick Leave</option>
                      <option>Casual Leave</option>
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={formLabel}>Start Date</label>
                      <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                        style={formInput} required />
                    </div>
                    <div>
                      <label style={formLabel}>End Date</label>
                      <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                        style={formInput} required />
                    </div>
                  </div>
                  <div>
                    <label style={formLabel}>Reason</label>
                    <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                      placeholder="Briefly describe the reason for your leave..."
                      rows={3}
                      style={{ ...formInput, resize: 'vertical' }} required />
                  </div>
                </div>
                <div style={{ padding: '0 24px 24px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button type="button" onClick={() => setShowForm(false)}
                    style={{ padding: '9px 24px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    style={{ padding: '9px 24px', borderRadius: 8, border: 'none', background: '#57B9FF', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
