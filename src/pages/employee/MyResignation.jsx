import React, { useEffect, useState } from 'react'
import AppShell from '../../components/layout/AppShell.jsx'
import NoticePeriodCountdown from '../../components/resignation/NoticePeriodCountdown.jsx'
import ResignationTimeline, { resignationStatusLabel, getStatusBadgeStyle } from '../../components/resignation/ResignationTimeline.jsx'
import { resignationService, getResignations } from '../../services/resignation.js'
import { card, cardTitle, formInput, formLabel, primaryBtn, secondaryBtn } from '../../components/ui/styles.js'

const activeStatuses = ['PENDING_MANAGER_REVIEW', 'MANAGER_APPROVED', 'HR_REVIEW', 'APPROVED', 'NOTICE_PERIOD']

export default function MyResignation() {
  const [resignations, setResignations] = useState([])
  const [form, setForm] = useState({ proposed_last_working_day: '', reason: '', comments: '' })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedHistory, setSelectedHistory] = useState(null)

  const load = async () => {
    try {
      setError('')
      const res = await resignationService.mine()
      setResignations(getResignations(res))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load resignation information.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const current = resignations.find(item => activeStatuses.includes(item.status))

  // Date validation: minimum 1 day in the future
  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const submit = async event => {
    event.preventDefault()
    if (submitting) return

    if (!form.proposed_last_working_day || !form.reason.trim()) {
      setError('Please fill in all required fields.')
      return
    }

    const minDate = getMinDate()
    if (form.proposed_last_working_day < minDate) {
      setError('Proposed last working day must be in the future.')
      return
    }

    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      await resignationService.submit({
        proposed_last_working_day: form.proposed_last_working_day,
        reason: form.reason.trim(),
        comments: form.comments.trim() || undefined,
      })
      setForm({ proposed_last_working_day: '', reason: '', comments: '' })
      setSuccess('Your resignation request has been submitted successfully.')
      await load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit resignation request.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppShell>
      <div style={{ padding: '28px 32px', maxWidth: 1050, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Header */}
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1E293B', margin: 0 }}>My Resignation</h1>
          <p style={{ color: '#64748B', fontSize: 14, margin: '4px 0 0' }}>
            Submit, track, and view the progress of your resignation workflow.
          </p>
        </div>

        {/* Feedback alerts */}
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '12px 16px', borderRadius: 8, fontSize: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{error}</span>
            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
          </div>
        )}
        {success && (
          <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#065F46', padding: '12px 16px', borderRadius: 8, fontSize: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{success}</span>
            <button onClick={() => setSuccess('')} style={{ background: 'none', border: 'none', color: '#065F46', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
          </div>
        )}

        {/* Content area */}
        {loading ? (
          <div style={{ ...card, color: '#64748B', textAlign: 'center', padding: '40px 20px' }}>
            Loading resignation records...
          </div>
        ) : current ? (
          /* STATE B: ACTIVE RESIGNATION DASHBOARD */
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 24 }}>
            {/* Overview Card */}
            <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Active Request
                  </div>
                  <h2 style={{ ...cardTitle, margin: '2px 0 0', fontSize: 18 }}>Resignation Overview</h2>
                </div>
                {(() => {
                  const badge = getStatusBadgeStyle(current.status)
                  return (
                    <span style={{
                      background: badge.bg,
                      color: badge.color,
                      border: `1px solid ${badge.border}`,
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                    }}>
                      {resignationStatusLabel(current.status)}
                    </span>
                  )
                })()}
              </div>

              <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 8, border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#64748B' }}>Submission Date:</span>
                  <strong style={{ color: '#1E293B' }}>
                    {new Date(current.submission_date || current.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#64748B' }}>Proposed Last Working Day:</span>
                  <strong style={{ color: '#1E293B' }}>
                    {new Date(current.proposed_last_working_day).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </strong>
                </div>

                {current.approved_last_working_day && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, background: '#E0F2FE', padding: '6px 10px', borderRadius: 6 }}>
                    <span style={{ color: '#0369A1', fontWeight: 600 }}>Approved Last Working Day:</span>
                    <strong style={{ color: '#0369A1' }}>
                      {new Date(current.approved_last_working_day).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </strong>
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#64748B', display: 'block', marginBottom: 4 }}>Reason for Resignation</label>
                <div style={{ fontSize: 13.5, color: '#334155', background: '#FFFFFF', border: '1px solid #E2E8F0', padding: 12, borderRadius: 8, whiteSpace: 'pre-wrap' }}>
                  {current.reason}
                </div>
              </div>

              {current.comments && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#64748B', display: 'block', marginBottom: 4 }}>Additional Comments</label>
                  <div style={{ fontSize: 13, color: '#475569', background: '#FFFFFF', border: '1px solid #E2E8F0', padding: 10, borderRadius: 8, fontStyle: 'italic' }}>
                    "{current.comments}"
                  </div>
                </div>
              )}

              {/* Countdown Component */}
              <NoticePeriodCountdown resignation={current} />
            </div>

            {/* Timeline Card */}
            <div style={card}>
              <h2 style={{ ...cardTitle, marginBottom: 16, fontSize: 18 }}>Workflow Progress</h2>
              <ResignationTimeline resignation={current} />
            </div>
          </div>
        ) : (
          /* STATE A: NO ACTIVE RESIGNATION - FORM */
          <div style={card}>
            <div style={{ marginBottom: 18, borderBottom: '1px solid #E2E8F0', paddingBottom: 14 }}>
              <h2 style={{ ...cardTitle, fontSize: 18, margin: 0 }}>Submit Resignation Request</h2>
              <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0' }}>
                Please provide your proposed last working day and reason for leaving. Your request will be routed to your direct manager for review.
              </p>
            </div>

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={formLabel}>
                  Proposed Last Working Day <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="date"
                  required
                  min={getMinDate()}
                  value={form.proposed_last_working_day}
                  onChange={e => setForm({ ...form, proposed_last_working_day: e.target.value })}
                  style={{ ...formInput, maxWidth: 320 }}
                />
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                  Select a future date as your requested last day with the organisation.
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label style={formLabel}>
                    Reason for Resignation <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <span style={{ fontSize: 11, color: form.reason.length >= 2000 ? '#DC2626' : '#94A3B8' }}>
                    {form.reason.length}/2000
                  </span>
                </div>
                <textarea
                  required
                  maxLength={2000}
                  placeholder="Please state your primary reason for resignation..."
                  value={form.reason}
                  onChange={e => setForm({ ...form, reason: e.target.value })}
                  style={{ ...formInput, minHeight: 110, resize: 'vertical' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label style={formLabel}>Additional Comments (Optional)</label>
                  <span style={{ fontSize: 11, color: form.comments.length >= 2000 ? '#DC2626' : '#94A3B8' }}>
                    {form.comments.length}/2000
                  </span>
                </div>
                <textarea
                  maxLength={2000}
                  placeholder="Any handover notes or additional context..."
                  value={form.comments}
                  onChange={e => setForm({ ...form, comments: e.target.value })}
                  style={{ ...formInput, minHeight: 80, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    ...primaryBtn,
                    opacity: submitting ? 0.7 : 1,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    padding: '10px 24px',
                    fontSize: 14,
                  }}
                >
                  {submitting ? 'Submitting Request...' : 'Submit Resignation'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* HISTORICAL RESIGNATIONS */}
        {!loading && resignations.length > 0 && (
          <div style={{ ...card, marginTop: 8 }}>
            <h2 style={{ ...cardTitle, marginBottom: 14, fontSize: 16 }}>Resignation Records & History</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {resignations.map(item => {
                const badge = getStatusBadgeStyle(item.status)
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedHistory(item)}
                    style={{
                      display: 'flex',
                      justify: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      border: '1px solid #E2E8F0',
                      borderRadius: 8,
                      fontSize: 13,
                      background: '#F8FAFC',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
                    onMouseLeave={e => e.currentTarget.style.background = '#F8FAFC'}
                  >
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <span style={{ color: '#64748B', fontWeight: 500 }}>
                        Submitted {new Date(item.submission_date || item.created_at).toLocaleDateString()}
                      </span>
                      <span style={{ color: '#334155' }}>
                        Last Day: {new Date(item.approved_last_working_day || item.proposed_last_working_day).toLocaleDateString()}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{
                        background: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.border}`,
                        padding: '3px 10px',
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 600,
                      }}>
                        {resignationStatusLabel(item.status)}
                      </span>
                      <span style={{ color: '#2563EB', fontWeight: 600, fontSize: 12 }}>View details →</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* History Detail Modal */}
        {selectedHistory && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
            <div style={{ background: '#FFFFFF', borderRadius: 12, padding: 24, width: 560, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 18, color: '#1E293B' }}>Resignation Request Details</h3>
                <button onClick={() => setSelectedHistory(null)} style={{ background: 'none', border: 'none', fontSize: 18, color: '#64748B', cursor: 'pointer' }}>✕</button>
              </div>

              <div style={{ marginBottom: 16 }}>
                <ResignationTimeline resignation={selectedHistory} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #E2E8F0', paddingTop: 14 }}>
                <button type="button" onClick={() => setSelectedHistory(null)} style={secondaryBtn}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}

