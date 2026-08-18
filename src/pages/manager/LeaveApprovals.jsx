import { useState, useEffect } from 'react'
import AppShell from '../../components/layout/AppShell.jsx'
import { Avatar, avatarColor } from '../../components/ui/Avatar.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import api from '../../services/api.js'

export default function LeaveApprovals() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState({})
  const [message, setMessage] = useState('')

  const fetchPending = () => {
    api.get('/leaves/team/pending')
      .then(res => {
        const formatted = res.data.data.map(req => {
          const days = Math.round((new Date(req.end_date) - new Date(req.start_date)) / (1000 * 60 * 60 * 24)) + 1
          return {
            id: req.id,
            name: `${req.employee.first_name || ''} ${req.employee.last_name || ''}`.trim(),
            type: req.leave_type.name,
            from: new Date(req.start_date).toLocaleDateString(),
            to: new Date(req.end_date).toLocaleDateString(),
            days,
            reason: req.reason || 'No reason provided',
            balance: 15, // fallback total
            status: req.status
          }
        })
        setRequests(formatted)
      })
      .catch(err => {
        console.error('Failed to fetch pending leaves:', err)
      })
  }

  useEffect(() => {
    fetchPending()
  }, [])

  const handleAction = async (id, action) => {
    setLoading(l => ({ ...l, [id]: action }))
    const backendAction = action === 'approve' ? 'Approved' : 'Rejected'
    try {
      await api.patch(`/leaves/request/${id}/action`, { action: backendAction })
      setRequests(prev => prev.filter(r => r.id !== id))
      setMessage(`Leave request ${action === 'approve' ? 'approved' : 'rejected'} successfully.`)
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.error('Failed to action leave request:', err)
      setMessage('Failed to update leave request.')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setLoading(l => ({ ...l, [id]: null }))
    }
  }

  return (
    <AppShell>
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#172B3A', margin: 0 }}>Leave Approvals</h1>
          <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: 13, fontWeight: 600, padding: '4px 14px', borderRadius: 20 }}>
            {requests.length} pending
          </span>
        </div>

        {message && (
          <div style={{ background: '#d1fae5', border: '1px solid #86efac', color: '#15803d', padding: '12px 16px', borderRadius: 8, fontSize: 13 }}>
            {message}
          </div>
        )}

        {requests.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #f3f4f6', padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>All caught up!</div>
            <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>No pending leave requests to review.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {requests.map((req, i) => (
              <div key={req.id} style={{
                background: '#fff', borderRadius: 14, border: '1px solid #f3f4f6',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: '20px 24px',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar name={req.name} size={42} bgColor={avatarColor(i)} />
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#172B3A' }}>{req.name}</div>
                      <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>{req.type}</div>
                    </div>
                  </div>
                  <Badge status={req.status} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                  {[
                    { label: 'Start Date', value: req.from },
                    { label: 'End Date',   value: req.to },
                    { label: 'Duration',   value: `${req.days} day${req.days > 1 ? 's' : ''}` },
                    { label: 'Balance',    value: `${req.balance} days` },
                  ].map(item => (
                    <div key={item.label} style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 14px' }}>
                      <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, marginBottom: 3 }}>{item.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, marginBottom: 3 }}>Reason</div>
                  <div style={{ fontSize: 13, color: '#374151' }}>{req.reason}</div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    disabled={!!loading[req.id]}
                    onClick={() => handleAction(req.id, 'approve')}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 8, border: 'none',
                      background: '#d1fae5', color: '#15803d',
                      fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    }}>
                    {loading[req.id] === 'approve' ? 'Approving...' : '✓ Approve'}
                  </button>
                  <button
                    disabled={!!loading[req.id]}
                    onClick={() => handleAction(req.id, 'reject')}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 8, border: 'none',
                      background: '#fee2e2', color: '#dc2626',
                      fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    }}>
                    {loading[req.id] === 'reject' ? 'Rejecting...' : '✕ Reject'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
