import { useState } from 'react'
import AppShell from '../../components/layout/AppShell.jsx'
import { Avatar, avatarColor } from '../../components/ui/Avatar.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import api from '../../services/api.js'

const mockRequests = [
  { id: 'lr-001', name: 'Aisha Khan',   type: 'Annual Leave', from: '2026-08-18', to: '2026-08-20', days: 3, reason: 'Family vacation trip',  balance: 8,  status: 'Pending' },
  { id: 'lr-002', name: 'Rohan Mehta',  type: 'Sick Leave',   from: '2026-08-15', to: '2026-08-15', days: 1, reason: 'Feeling unwell (fever)', balance: 5,  status: 'Pending' },
  { id: 'lr-003', name: 'Sara Ahmed',   type: 'Casual Leave', from: '2026-08-16', to: '2026-08-16', days: 1, reason: 'Personal errand',        balance: 4,  status: 'Pending' },
]

export default function LeaveApprovals() {
  const [requests, setRequests] = useState(mockRequests)
  const [loading, setLoading] = useState({})
  const [message, setMessage] = useState('')

  const handleAction = async (id, action) => {
    setLoading(l => ({ ...l, [id]: action }))
    try {
      await api.patch(`/leaves/request/${id}/action`, { action })
      setRequests(prev => prev.filter(r => r.id !== id))
      setMessage(`Leave request ${action === 'approve' ? 'approved' : 'rejected'} successfully.`)
      setTimeout(() => setMessage(''), 3000)
    } catch {
      // On error with mock data, just update UI
      setRequests(prev => prev.filter(r => r.id !== id))
      setMessage(`Request ${action}d.`)
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
