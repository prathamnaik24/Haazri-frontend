import React, { useEffect, useState } from 'react'
import AppShell from '../../components/layout/AppShell.jsx'
import NoticePeriodCountdown from '../../components/resignation/NoticePeriodCountdown.jsx'
import ResignationTimeline, { resignationStatusLabel, getStatusBadgeStyle } from '../../components/resignation/ResignationTimeline.jsx'
import { resignationService, getResignations } from '../../services/resignation.js'
import { card, cardTitle, formInput, formLabel, primaryBtn, secondaryBtn } from '../../components/ui/styles.js'

// Modal for HR Approval (Setting Approved Last Working Day & Comment) or Completion
function HRActionModal({ item, mode, onClose, onSubmit, saving }) {
  const isComplete = mode === 'COMPLETE'
  const isReject = mode === 'REJECT'
  const isApprove = mode === 'APPROVE'

  const [approvedDate, setApprovedDate] = useState(() => {
    if (item.approved_last_working_day) return item.approved_last_working_day.slice(0, 10)
    if (item.proposed_last_working_day) return item.proposed_last_working_day.slice(0, 10)
    return ''
  })
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (isReject && !comment.trim()) {
      setError('A rejection reason is required.')
      return
    }

    if (isApprove && !approvedDate) {
      setError('Please specify the approved last working day.')
      return
    }

    if (isComplete) {
      onSubmit({
        mode,
        payload: { comment: comment.trim() || undefined },
      })
    } else {
      onSubmit({
        mode,
        payload: {
          action: isReject ? 'REJECT' : 'APPROVE',
          approved_last_working_day: isApprove ? approvedDate : undefined,
          comment: comment.trim() || undefined,
        },
      })
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
      <form onSubmit={handleSubmit} style={{ background: '#FFFFFF', borderRadius: 12, padding: 24, width: 500, maxWidth: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: isReject ? '#991B1B' : '#1E293B' }}>
            {isComplete ? 'Complete Resignation & Offboard Employee?' : isApprove ? 'Approve HR Review & Notice Period?' : 'Reject Resignation Request?'}
          </h3>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, color: '#64748B', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ color: '#475569', fontSize: 13.5, margin: '0 0 16px', lineHeight: 1.5 }}>
          {isComplete ? (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', padding: 12, borderRadius: 8, color: '#991B1B' }}>
              <strong>Caution:</strong> Completing this resignation will mark the resignation status as <strong>COMPLETED</strong> and transition employee <strong>{item.first_name} {item.last_name}</strong> to <strong>RESIGNED</strong> status.
            </div>
          ) : isApprove ? (
            <>
              You are approving the resignation for <strong>{item.first_name} {item.last_name}</strong>. This will transition the request into the official <strong>Notice Period</strong>.
            </>
          ) : (
            <>
              You are rejecting the resignation request for <strong>{item.first_name} {item.last_name}</strong>.
            </>
          )}
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: 8, borderRadius: 6, fontSize: 13, marginBottom: 12 }}>
            {error}
          </div>
        )}

        {isApprove && (
          <div style={{ marginBottom: 14 }}>
            <label style={formLabel}>
              Approved Last Working Day <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              type="date"
              required
              value={approvedDate}
              onChange={e => setApprovedDate(e.target.value)}
              style={formInput}
            />
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
              Employee proposed: {new Date(item.proposed_last_working_day).toLocaleDateString()}
            </div>
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={formLabel}>
            {isReject ? 'Rejection Reason (Required)' : 'Comments / Handover Notes (Optional)'}
          </label>
          <textarea
            required={isReject}
            maxLength={2000}
            placeholder={isReject ? 'Specify reason for rejection...' : 'Add any remarks or offboarding notes...'}
            value={comment}
            onChange={e => setComment(e.target.value)}
            style={{ ...formInput, minHeight: 85, resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" onClick={onClose} style={secondaryBtn} disabled={saving}>Cancel</button>
          <button
            type="submit"
            disabled={saving}
            style={{
              ...primaryBtn,
              background: isReject ? '#DC2626' : isComplete ? '#059669' : '#2563EB',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Processing...' : isComplete ? 'Finalize Completion' : isApprove ? 'Approve & Start Notice' : 'Reject Request'}
          </button>
        </div>
      </form>
    </div>
  )
}

// Full detail modal for HR review
function HRResignationDetailModal({ item, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
      <div style={{ background: '#FFFFFF', borderRadius: 12, padding: 24, width: 620, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, color: '#1E293B' }}>
              {item.first_name} {item.last_name}
            </h3>
            <span style={{ fontSize: 12, color: '#64748B' }}>
              {item.position_title || 'Employee'}{item.employee_id ? ` • ID: ${item.employee_id}` : ''} • {item.email}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, color: '#64748B', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 8, border: '1px solid #E2E8F0', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 13 }}><strong>Submission Date:</strong> {new Date(item.submission_date || item.created_at).toLocaleDateString()}</div>
          <div style={{ fontSize: 13 }}><strong>Proposed Last Working Day:</strong> {new Date(item.proposed_last_working_day).toLocaleDateString()}</div>
          {item.approved_last_working_day && (
            <div style={{ fontSize: 13, color: '#0369A1' }}><strong>Approved Last Working Day:</strong> {new Date(item.approved_last_working_day).toLocaleDateString()}</div>
          )}
          <div style={{ fontSize: 13 }}><strong>Reason:</strong> {item.reason || 'Not provided'}</div>
          {item.comments && <div style={{ fontSize: 13, color: '#475569' }}><strong>Employee Comments:</strong> {item.comments}</div>}
        </div>

        <h4 style={{ margin: '0 0 12px', fontSize: 15, color: '#1E293B' }}>Full Resignation Timeline & Audit</h4>
        <ResignationTimeline resignation={item} />

        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #E2E8F0', paddingTop: 14, marginTop: 16 }}>
          <button type="button" onClick={onClose} style={secondaryBtn}>Close</button>
        </div>
      </div>
    </div>
  )
}

const HR_STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING_MANAGER_REVIEW', label: 'Pending Manager Review' },
  { value: 'MANAGER_APPROVED', label: 'Manager Approved' },
  { value: 'HR_REVIEW', label: 'Under HR Review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'NOTICE_PERIOD', label: 'Notice Period' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'REJECTED', label: 'Rejected' },
]

export default function HRResignations() {
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [actionModal, setActionModal] = useState(null) // { item, mode: 'APPROVE' | 'REJECT' | 'COMPLETE' }
  const [detailModal, setDetailModal] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await resignationService.hr(status)
      setItems(getResignations(res))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load HR resignation queue.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [status])

  const handleActionSubmit = async ({ mode, payload }) => {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      if (mode === 'COMPLETE') {
        await resignationService.complete(actionModal.item.id, payload)
        setMessage('Resignation completed successfully. Employee offboarded.')
      } else {
        await resignationService.hrAction(actionModal.item.id, payload)
        setMessage(`HR action successfully saved (${payload.action === 'APPROVE' ? 'Approved' : 'Rejected'}).`)
      }
      setActionModal(null)
      await load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to execute HR action.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell>
      <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1E293B', margin: 0 }}>HR Resignations</h1>
            <p style={{ color: '#64748B', fontSize: 14, margin: '4px 0 0' }}>
              Manage organisation-wide resignation requests, approve notice periods, and finalize employee offboarding.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Filter Status:</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              style={{ ...formInput, maxWidth: 240, padding: '6px 12px' }}
            >
              {HR_STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Feedback alerts */}
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
            Loading HR resignation queue...
          </div>
        ) : items.length === 0 ? (
          <div style={{ ...card, color: '#64748B', textAlign: 'center', padding: '40px 20px' }}>
            {status ? 'No resignation requests match this status filter.' : 'No resignation requests found.'}
          </div>
        ) : (
          items.map(item => {
            const badge = getStatusBadgeStyle(item.status)

            const canHRApprove = ['HR_REVIEW', 'MANAGER_APPROVED'].includes(item.status)
            const canComplete = ['NOTICE_PERIOD', 'APPROVED'].includes(item.status)

            return (
              <div key={item.id} style={{ ...card, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Employee Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 17, color: '#1E293B', fontWeight: 600 }}>
                      {item.first_name} {item.last_name}
                    </h2>
                    <div style={{ color: '#64748B', fontSize: 13, marginTop: 2 }}>
                      {item.position_title || 'Employee'}{item.employee_id ? ` • ID: ${item.employee_id}` : ''} • {item.email}
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

                {/* Grid stats */}
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
                    <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Submitted</div>
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
                      {item.approved_last_working_day ? new Date(item.approved_last_working_day).toLocaleDateString() : 'Not set yet'}
                    </div>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, marginBottom: 4 }}>Reason</div>
                  <div style={{ fontSize: 13, color: '#334155', background: '#FFFFFF', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 6 }}>
                    {item.reason || 'No reason provided'}
                  </div>
                </div>

                {/* Countdown display */}
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
                    View Details & Timeline
                  </button>

                  <div style={{ display: 'flex', gap: 10 }}>
                    {canHRApprove && (
                      <>
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
                          Approve & Start Notice
                        </button>
                      </>
                    )}

                    {canComplete && (
                      <button
                        type="button"
                        onClick={() => setActionModal({ item, mode: 'COMPLETE' })}
                        style={{ ...primaryBtn, background: '#059669' }}
                      >
                        Complete Resignation
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}

        {/* Action Modal */}
        {actionModal && (
          <HRActionModal
            item={actionModal.item}
            mode={actionModal.mode}
            onClose={() => setActionModal(null)}
            onSubmit={handleActionSubmit}
            saving={saving}
          />
        )}

        {/* Detail Modal */}
        {detailModal && (
          <HRResignationDetailModal
            item={detailModal}
            onClose={() => setDetailModal(null)}
          />
        )}
      </div>
    </AppShell>
  )
}

