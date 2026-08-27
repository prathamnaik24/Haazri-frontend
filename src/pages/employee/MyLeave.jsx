import { useState, useEffect } from 'react'
import AppShell from '../../components/layout/AppShell.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { card, cardTitle, formLabel, formInput } from '../../components/ui/styles.js'
import api from '../../services/api.js'

export default function MyLeave() {
  const [leaveTypes, setLeaveTypes] = useState([])
  const [balances, setBalances] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [cancellingId, setCancellingId] = useState(null)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    leave_type_id: '',
    start_date: '',
    end_date: '',
    reason: '',
  })

  const loadData = async () => {
    try {
      const [typesRes, meRes] = await Promise.all([
        api.get('/leaves/types'),
        api.get('/leaves/me'),
      ])
      
      const types = typesRes.data?.data || []
      setLeaveTypes(types)
      setBalances(meRes.data?.data?.balances || [])
      setHistory(meRes.data?.data?.requests || [])
      
      if (types.length > 0) {
        setForm(f => ({ ...f, leave_type_id: types[0].id }))
      }
    } catch (err) {
      console.error('Failed to load leave data:', err)
      setError(err.response?.data?.message || 'Failed to load leave data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await api.post('/leaves/request', form)
      setSuccess('Leave request submitted successfully!')
      setShowForm(false)
      if (leaveTypes.length > 0) {
        setForm({ leave_type_id: leaveTypes[0].id, start_date: '', end_date: '', reason: '' })
      }
      loadData()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave request')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelLeave = async (leaveId) => {
    if (!window.confirm('Are you sure you want to cancel this pending leave request?')) return
    setCancellingId(leaveId)
    setError('')
    try {
      await api.delete(`/leaves/request/${leaveId}`)
      setSuccess('Leave request cancelled and days restored to your balance.')
      loadData()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel leave request')
    } finally {
      setCancellingId(null)
    }
  }

  // Calculate stats dynamically for cards
  const renderedBalances = leaveTypes.map(lt => {
    const balRecord = balances.find(b => b.leave_type_id === lt.id)
    const totalDays = parseFloat(lt.days_allowed || 15.0)
    const balanceVal = balRecord ? parseFloat(balRecord.balance) : totalDays
    const usedDays = Math.max(0, totalDays - balanceVal)

    let color = '#517891'
    let bg = '#EAF6FF'
    if (lt.name.toLowerCase().includes('sick')) {
      color = '#22c55e'
      bg = '#d1fae5'
    } else if (lt.name.toLowerCase().includes('casual')) {
      color = '#f59e0b'
      bg = '#fef3c7'
    } else if (lt.name.toLowerCase().includes('emergency')) {
      color = '#ef4444'
      bg = '#fee2e2'
    }

    return {
      type: lt.name,
      used: usedDays,
      total: totalDays,
      color,
      bg,
      balance: balanceVal
    }
  })

  return (
    <AppShell>
      <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#172B3A', margin: 0 }}>My Leave</h1>
            <p style={{ fontSize: 14, color: '#526B7A', margin: '4px 0 0' }}>
              Request time off, track allowances, and monitor review status
            </p>
          </div>
          <button onClick={() => setShowForm(true)}
            style={{ background: '#517891', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 4px rgba(81, 120, 145, 0.2)' }}>
            + Request Leave
          </button>
        </div>

        {error && (
          <div style={{ background: '#FFF5F5', border: '1px solid #FED7D7', color: '#C53030', padding: '12px 16px', borderRadius: 8, fontSize: 14 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: '#d1fae5', border: '1px solid #86efac', color: '#15803d', padding: '12px 16px', borderRadius: 8, fontSize: 14 }}>
            {success}
          </div>
        )}

        {/* Balance Cards */}
        {loading ? (
          <div style={{ color: '#526B7A', fontSize: 14 }}>Loading balances...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {renderedBalances.map(lb => (
              <div key={lb.type} style={card}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#526B7A', marginBottom: 10, textTransform: 'uppercase' }}>{lb.type}</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#172B3A', letterSpacing: '-0.03em', marginBottom: 6 }}>
                  {lb.balance}
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#9ca3af' }}> / {lb.total}</span>
                </div>
                <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 12 }}>Days remaining</div>
                <div style={{ height: 6, borderRadius: 6, background: lb.bg, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, (lb.used / lb.total) * 100)}%`, height: '100%', background: lb.color, borderRadius: 6 }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Leave History */}
        <div style={card}>
          <h2 style={{ ...cardTitle, marginBottom: 16 }}>Leave Requests</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  {['Type', 'From', 'To', 'Days', 'Reason', 'Reviewer Remark', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#374151' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#6b7280', fontSize: 14 }}>
                      Loading request history...
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#6b7280', fontSize: 14 }}>
                      No leave requests found.
                    </td>
                  </tr>
                ) : (
                  history.map((row) => {
                    const start = new Date(row.start_date)
                    const end = new Date(row.end_date)
                    const days = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1
                    const isPending = row.status === 'Pending'

                    return (
                      <tr key={row.id}
                        style={{ borderBottom: '1px solid #f3f4f6' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}
                      >
                        <td style={{ padding: '13px 16px', fontSize: 13, color: '#374151', fontWeight: 600 }}>{row.leave_type_name}</td>
                        <td style={{ padding: '13px 16px', fontSize: 13, color: '#6b7280' }}>{start.toLocaleDateString()}</td>
                        <td style={{ padding: '13px 16px', fontSize: 13, color: '#6b7280' }}>{end.toLocaleDateString()}</td>
                        <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 600, color: '#374151' }}>{days} {days === 1 ? 'day' : 'days'}</td>
                        <td style={{ padding: '13px 16px', fontSize: 13, color: '#6b7280', maxWidth: 180 }}>{row.reason || '—'}</td>
                        <td style={{ padding: '13px 16px', fontSize: 13, color: '#4A5568', fontStyle: row.reviewer_remark ? 'italic' : 'normal' }}>
                          {row.reviewer_remark || '—'}
                        </td>
                        <td style={{ padding: '13px 16px' }}><Badge status={row.status} /></td>
                        <td style={{ padding: '13px 16px' }}>
                          {isPending && (
                            <button
                              onClick={() => handleCancelLeave(row.id)}
                              disabled={cancellingId === row.id}
                              style={{
                                background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA',
                                borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer'
                              }}
                            >
                              {cancellingId === row.id ? 'Cancelling...' : 'Cancel'}
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Request Leave Modal */}
        {showForm && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)',
          }}
            onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}
          >
            <div style={{ background: '#fff', borderRadius: 16, width: 560, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
              <div style={{ background: '#517891', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                    <select value={form.leave_type_id} onChange={e => setForm(f => ({ ...f, leave_type_id: e.target.value }))}
                      style={{ ...formInput, cursor: 'pointer' }} required>
                      {leaveTypes.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
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
                    style={{ padding: '9px 24px', borderRadius: 8, border: 'none', background: '#517891', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
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
