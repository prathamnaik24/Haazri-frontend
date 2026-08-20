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
      const typesRes = await api.get('/leaves/types')
      const meRes = await api.get('/leaves/me')
      
      setLeaveTypes(typesRes.data.data)
      setBalances(meRes.data.data.balances)
      setHistory(meRes.data.data.requests)
      
      if (typesRes.data.data.length > 0) {
        setForm(f => ({ ...f, leave_type_id: typesRes.data.data[0].id }))
      }
    } catch (err) {
      console.error('Failed to load leave data:', err)
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
      } else {
        setForm({ leave_type_id: '', start_date: '', end_date: '', reason: '' })
      }
      loadData()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave request')
    } finally {
      setSubmitting(false)
    }
  }

  // Calculate stats dynamically for cards
  const renderedBalances = leaveTypes.map(lt => {
    const balRecord = balances.find(b => b.leave_type_id === lt.id)
    const totalDays = parseFloat(lt.days_allowed || 15.0)
    const balanceVal = balRecord ? parseFloat(balRecord.balance) : totalDays
    const usedDays = totalDays - balanceVal

    let color = '#57B9FF'
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
        {loading ? (
          <div style={{ color: '#526B7A', fontSize: 14 }}>Loading balances...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {renderedBalances.map(lb => (
              <div key={lb.type} style={card}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#6b7280', marginBottom: 12 }}>{lb.type}</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#172B3A', letterSpacing: '-0.03em', marginBottom: 8 }}>
                  {lb.balance}
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#9ca3af' }}> / {lb.total}</span>
                </div>
                <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>Days remaining</div>
                <div style={{ height: 6, borderRadius: 6, background: lb.bg, overflow: 'hidden' }}>
                  <div style={{ width: `${(lb.used / lb.total) * 100}%`, height: '100%', background: lb.color, borderRadius: 6 }} />
                </div>
              </div>
            ))}
          </div>
        )}

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
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#6b7280', fontSize: 14 }}>
                    Loading request history...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#6b7280', fontSize: 14 }}>
                    No leave requests found.
                  </td>
                </tr>
              ) : (
                history.map((row, i) => {
                  const days = Math.round((new Date(row.end_date) - new Date(row.start_date)) / (1000 * 60 * 60 * 24)) + 1
                  return (
                    <tr key={row.id}
                      style={{ borderBottom: '1px solid #f9fafb' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <td style={{ padding: '13px 16px', fontSize: 13, color: '#374151', fontWeight: 500 }}>{row.leave_type_name}</td>
                      <td style={{ padding: '13px 16px', fontSize: 13, color: '#6b7280' }}>{new Date(row.start_date).toLocaleDateString()}</td>
                      <td style={{ padding: '13px 16px', fontSize: 13, color: '#6b7280' }}>{new Date(row.end_date).toLocaleDateString()}</td>
                      <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 600, color: '#374151' }}>{days}</td>
                      <td style={{ padding: '13px 16px', fontSize: 13, color: '#6b7280', maxWidth: 200 }}>{row.reason}</td>
                      <td style={{ padding: '13px 16px' }}><Badge status={row.status} /></td>
                    </tr>
                  )
                })
              )}
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
