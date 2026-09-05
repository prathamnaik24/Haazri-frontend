import React, { useEffect, useState } from 'react'
import AppShell from '../../components/layout/AppShell.jsx'
import NoticePeriodCountdown from '../../components/resignation/NoticePeriodCountdown.jsx'
import ResignationTimeline, { resignationStatusLabel, getStatusBadgeStyle } from '../../components/resignation/ResignationTimeline.jsx'
import { resignationService, getResignations } from '../../services/resignation.js'
import { card, cardTitle, formInput, formLabel, primaryBtn, secondaryBtn } from '../../components/ui/styles.js'

// Confirmation modal specifically tailored for Manager Approval or Rejection
function ManagerActionModal({ item, mode, onClose, onSubmit, saving }) {
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  const isApprove = mode === 'APPROVE'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isApprove && !comment.trim()) {
      setError('A rejection reason is required.')
      return
    }
    onSubmit({
      action: mode,
      comment: comment.trim() || undefined,
    })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
      <form onSubmit={handleSubmit} style={{ background: '#FFFFFF', borderRadius: 12, padding: 24, width: 480, maxWidth: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: isApprove ? '#1E293B' : '#991B1B' }}>
            {isApprove ? 'Approve Resignation Request?' : 'Reject Resignation Request?'}
          </h3>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, color: '#64748B', cursor: 'pointer' }}>✕</button>
        </div>

        <p style={{ color: '#475569', fontSize: 13.5, margin: '0 0 16px', lineHeight: 1.5 }}>
          {isApprove ? (
            <>
              You are approving the resignation for <strong>{item.first_name} {item.last_name}</strong> (Proposed Last Working Day: <strong>{new Date(item.proposed_last_working_day).toLocaleDateString()}</strong>). This will forward the request to HR for final notice period approval.
            </>
          ) : (
            <>
              You are rejecting the resignation request for <strong>{item.first_name} {item.last_name}</strong>. Please provide a clear explanation for the rejection.
            </>
          )}
        </p>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: 8, borderRadius: 6, fontSize: 13, marginBottom: 12 }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={formLabel}>
            {isApprove ? 'Comments (Optional)' : 'Rejection Reason (Required)'}
          </label>
          <textarea
            required={!isApprove}
            maxLength={2000}
            placeholder={isApprove ? 'Add any notes for HR...' : 'Specify the reason for rejecting this request...'}
            value={comment}
            onChange={e => { setComment(e.target.value); setError('') }}
            style={{ ...formInput, minHeight: 90, resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" onClick={onClose} style={secondaryBtn} disabled={saving}>Cancel</button>
          <button
            type="submit"
            disabled={saving}
            style={{
              ...primaryBtn,
              background: isApprove ? '#2563EB' : '#DC2626',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Processing...' : isApprove ? 'Approve & Send to HR' : 'Reject Request'}
          </button>
        </div>
      </form>
    </div>
  )
}

// Modal for viewing full details & timeline
function ResignationDetailModal({ item, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
      <div style={{ background: '#FFFFFF', borderRadius: 12, padding: 24, width: 600, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, color: '#1E293B' }}>
              {item.first_name} {item.last_name}
            </h3>
            <span style={{ fontSize: 12, color: '#64748B' }}>
              {item.position_title || 'Direct Report'}{item.employee_id ? ` • ${item.employee_id}` : ''} • {item.email}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, color: '#64748B', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 8, border: '1px solid #E2E8F0', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 13 }}><strong>Proposed Last Working Day:</strong> {new Date(item.proposed_last_working_day).toLocaleDateString()}</div>
          {item.approved_last_working_day && (
            <div style={{ fontSize: 13, color: '#0369A1' }}><strong>Approved Last Working Day:</strong> {new Date(item.approved_last_working_day).toLocaleDateString()}</div>
          )}
          <div style={{ fontSize: 13 }}><strong>Reason:</strong> {item.reason || 'Not provided'}</div>
          {item.comments && <div style={{ fontSize: 13, color: '#475569' }}><strong>Comments:</strong> {item.comments}</div>}
        </div>

        <h4 style={{ margin: '0 0 12px', fontSize: 15, color: '#1E293B' }}>Workflow Timeline</h4>
        <ResignationTimeline resignation={item} />

        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #E2E8F0', paddingTop: 14, marginTop: 16 }}>
          <button type="button" onClick={onClose} style={secondaryBtn}>Close</button>
        </div>
      </div>
    </div>
  )
}

export default function ManagerResignations() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [actionModal, setActionModal] = useState(null) // { item, mode: 'APPROVE' | 'REJECT' }
  const [detailModal, setDetailModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await resignationService.manager()
      setItems(getResignations(response))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load manager resignation queue.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleActionSubmit = async payload => {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await resignationService.managerAction(actionModal.item.id, payload)
      setMessage(`Resignation request successfully ${payload.action === 'APPROVE' ? 'approved' : 'rejected'}.`)
      setActionModal(null)
      await load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process manager action.')
    } finally {
      setSaving(false)
    }
  }

  const filteredItems = items.filter(item => statusFilter ? item.status === statusFilter : true)

  return (
    <AppShell>
      <div style={{ padding: '28px 32px', maxWidth: 1150, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1E293B', margin: 0 }}>Manager Resignations</h1>
            <p style={{ color: '#64748B', fontSize: 14, margin: '4px 0 0' }}>
              Review and act on resignation requests from direct reports in your reporting hierarchy.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Filter:</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ ...formInput, maxWidth: 220, padding: '6px 12px' }}
            >
              <option value="">All Statuses</option>
              <option value="PENDING_MANAGER_REVIEW">Pending Manager Review</option>
              <option value="MANAGER_APPROVED">Manager Approved</option>
              <option value="HR_REVIEW">Under HR Review</option>
              <option value="NOTICE_PERIOD">Notice Period</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '12px 16px', borderRadius: 8, fontSize: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{error}</span>
            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
          </div>
        )}
        {message && (
          <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#065F46', padding: '12px 16px', borderRadius: 8, fontSize: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{message}</span>
            <button onClick={() => setMessage('')} style={{ background: 'none', border: 'none', color: '#065F46', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
          </div>
        )}

        {/* Content list */}
        {loading ? (
          <div style={{ ...card, color: '#64748B', textAlign: 'center', padding: '40px 20px' }}>
            Loading team resignation requests...
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ ...card, color: '#64748B', textAlign: 'center', padding: '40px 20px' }}>
            {statusFilter ? 'No resignation requests match the selected status filter.' : 'No resignation requests require your review.'}
          </div>
        ) : (
          filteredItems.map(item => {
            const badge = getStatusBadgeStyle(item.status)
            const isActionable = item.status === 'PENDING_MANAGER_REVIEW'

            return (
              <div key={item.id} style={{ ...card, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Employee Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 17, color: '#1E293B', fontWeight: 600 }}>
                      {item.first_name} {item.last_name}
                    </h2>
                    <div style={{ color: '#64748B', fontSize: 13, marginTop: 2 }}>
                      {item.position_title || 'Team Member'}{item.employee_id ? ` • ${item.employee_id}` : ''} • {item.email}
                    </div>
                  </div>
                  <span style={{
                    background: badge.bg,
                    color: badge.color,
                    border: `1px solid ${badge.border}`,
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                  }}>
                    {resignationStatusLabel(item.status)}
                  </span>
                </div>

                {/* Grid details */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 12,
                  background: '#F8FAFC',
                  padding: 12,
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Submission Date</div>
                    <div style={{ fontSize: 13.5, color: '#1E293B', fontWeight: 500, marginTop: 2 }}>
                      {new Date(item.submission_date || item.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Proposed Last Day</div>
                    <div style={{ fontSize: 13.5, color: '#1E293B', fontWeight: 500, marginTop: 2 }}>
                      {new Date(item.proposed_last_working_day).toLocaleDateString()}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Approved Last Day</div>
                    <div style={{ fontSize: 13.5, color: item.approved_last_working_day ? '#0369A1' : '#94A3B8', fontWeight: 500, marginTop: 2 }}>
                      {item.approved_last_working_day ? new Date(item.approved_last_working_day).toLocaleDateString() : 'Pending HR'}
                    </div>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, marginBottom: 4 }}>Reason for Resignation</div>
                  <div style={{ fontSize: 13, color: '#334155', background: '#FFFFFF', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 6 }}>
                    {item.reason || 'No reason specified'}
                  </div>
                </div>

                {/* Notice Countdown if in Notice Period */}
                {['NOTICE_PERIOD', 'APPROVED', 'COMPLETED'].includes(item.status) && (
                  <NoticePeriodCountdown resignation={item} />
                )}

                {/* Actions Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: 14, marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => setDetailModal(item)}
                    style={{ ...secondaryBtn, fontSize: 13 }}
                  >
                    View Workflow Details & Timeline
                  </button>

                  {isActionable && (
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        type="button"
                        onClick={() => setActionModal({ item, mode: 'REJECT' })}
                        style={{
                          ...secondaryBtn,
                          color: '#DC2626',
                          borderColor: '#FCA5A5',
                          background: '#FEF2F2',
                        }}
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => setActionModal({ item, mode: 'APPROVE' })}
                        style={{ ...primaryBtn, background: '#2563EB' }}
                      >
                        Approve Request
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}

        {/* Modals */}
        {actionModal && (
          <ManagerActionModal
            item={actionModal.item}
            mode={actionModal.mode}
            onClose={() => setActionModal(null)}
            onSubmit={handleActionSubmit}
            saving={saving}
          />
        )}

        {detailModal && (
          <ResignationDetailModal
            item={detailModal}
            onClose={() => setDetailModal(null)}
          />
        )}
      </div>
    </AppShell>
  )
}

