import { useState, useEffect } from 'react'
import AppShell from '../../components/layout/AppShell.jsx'
import { Avatar, avatarColor } from '../../components/ui/Avatar.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import api from '../../services/api.js'

export default function LeaveApprovals() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState({})
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Remark Modal
  const [modalData, setModalData] = useState(null) // { id, name, action: 'Approved' | 'Rejected' }
  const [remark, setRemark] = useState('')

  const fetchPending = () => {
    api.get('/leaves/team/pending')
      .then(res => {
        const raw = res.data?.data || []
        const formatted = raw.map(req => {
          const days = Math.round((new Date(req.end_date) - new Date(req.start_date)) / (1000 * 60 * 60 * 24)) + 1
          const emp = req.employee || {}
          return {
            id: req.id,
            name: `${emp.first_name || req.first_name || ''} ${emp.last_name || req.last_name || ''}`.trim() || 'Employee',
            type: req.leave_type_name || req.leave_type?.name || 'Leave',
            from: new Date(req.start_date).toLocaleDateString(),
            to: new Date(req.end_date).toLocaleDateString(),
            days,
            reason: req.reason || 'No reason provided',
            position: emp.position?.title || req.position_title || 'Team Member',
            status: req.status || 'Pending'
          }
        })
        setRequests(formatted)
      })
      .catch(err => {
        console.error('Failed to fetch pending leaves:', err)
        setError(err.response?.data?.message || 'Failed to fetch pending leaves')
      })
  }

  useEffect(() => {
    fetchPending()
  }, [])

  const openActionModal = (id, name, action) => {
    setModalData({ id, name, action })
    setRemark('')
  }

  const submitAction = async (e) => {
    e?.preventDefault()
    if (!modalData) return

    const { id, action } = modalData
    setLoading(l => ({ ...l, [id]: action }))
    setError('')
    try {
      await api.patch(`/leaves/request/${id}/action`, { action, remark: remark.trim() || undefined })
      setRequests(prev => prev.filter(r => r.id !== id))
      setMessage(`Leave request ${action.toLowerCase()} successfully.`)
      setModalData(null)
      setTimeout(() => setMessage(''), 4000)
    } catch (err) {
      console.error('Failed to action leave request:', err)
      setError(err.response?.data?.message || 'Failed to update leave request.')
    } finally {
      setLoading(l => ({ ...l, [id]: null }))
    }
  }

  return (
    <AppShell>
      <div style={{ padding: '28px 32px', maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#172B3A', margin: 0 }}>Leave Approvals</h1>
            <p style={{ fontSize: 14, color: '#526B7A', margin: '4px 0 0' }}>
              Review and decision leave requests from your direct and subordinate team
            </p>
          </div>
          <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: 13, fontWeight: 600, padding: '6px 16px', borderRadius: 20 }}>
            {requests.length} pending
          </span>
        </div>

        {error && (
          <div style={{ background: '#FFF5F5', border: '1px solid #FED7D7', color: '#C53030', padding: '12px 16px', borderRadius: 8, fontSize: 13 }}>
            {error}
          </div>
        )}
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
                background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: '20px 24px',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar name={req.name} size={42} bgColor={avatarColor(i)} />
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#172B3A' }}>{req.name}</div>
                      <div style={{ fontSize: 13, color: '#526B7A', marginTop: 2 }}>{req.position} • <strong style={{ color: '#517891' }}>{req.type}</strong></div>
                    </div>
                  </div>
                  <Badge status={req.status} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                  {[
                    { label: 'Start Date', value: req.from },
                    { label: 'End Date',   value: req.to },
                    { label: 'Duration',   value: `${req.days} day${req.days > 1 ? 's' : ''}` },
                  ].map(item => (
                    <div key={item.label} style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 14px' }}>
                      <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, marginBottom: 3 }}>{item.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ background: '#f9fafb', borderRadius: 8, padding: '12px 14px', marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase' }}>Reason</div>
                  <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.4 }}>{req.reason}</div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    disabled={!!loading[req.id]}
                    onClick={() => openActionModal(req.id, req.name, 'Approved')}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 8, border: 'none',
                      background: '#d1fae5', color: '#15803d',
                      fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    }}>
                    {loading[req.id] === 'Approved' ? 'Approving...' : '✓ Approve'}
                  </button>
                  <button
                    disabled={!!loading[req.id]}
                    onClick={() => openActionModal(req.id, req.name, 'Rejected')}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 8, border: 'none',
                      background: '#fee2e2', color: '#dc2626',
                      fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    }}>
                    {loading[req.id] === 'Rejected' ? 'Rejecting...' : '✕ Reject'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Confirmation & Remark Modal */}
        {modalData && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)'
          }}>
            <div style={{ background: '#fff', borderRadius: 14, width: 480, maxWidth: '90vw', padding: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 10px', fontSize: 18, fontWeight: 700, color: '#172B3A' }}>
                {modalData.action === 'Approved' ? 'Approve Leave Request' : 'Reject Leave Request'}
              </h3>
              <p style={{ margin: '0 0 16px', fontSize: 14, color: '#526B7A' }}>
                Confirm decision for <strong>{modalData.name}</strong>. You can optionally attach an official remark.
              </p>

              <form onSubmit={submitAction}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A5568', marginBottom: 6 }}>
                    Remark (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder={modalData.action === 'Approved' ? 'e.g., Approved, please ensure client handover is complete.' : 'e.g., Rejected due to critical project deadline.'}
                    value={remark}
                    onChange={e => setRemark(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E0', borderRadius: 6, fontSize: 14, boxSizing: 'border-box', fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setModalData(null)}
                    style={{ background: '#EDF2F7', border: 'none', borderRadius: 6, padding: '9px 18px', fontSize: 14, cursor: 'pointer', color: '#4A5568', fontWeight: 600 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      background: modalData.action === 'Approved' ? '#22c55e' : '#ef4444',
                      border: 'none', borderRadius: 6, padding: '9px 20px', fontSize: 14,
                      cursor: 'pointer', color: '#FFFFFF', fontWeight: 600
                    }}
                  >
                    Confirm {modalData.action}
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
