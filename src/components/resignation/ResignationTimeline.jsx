import React from 'react'

export const RESIGNATION_STATUS_LABELS = {
  PENDING_MANAGER_REVIEW: 'Pending Manager Review',
  MANAGER_APPROVED: 'Manager Approved',
  HR_REVIEW: 'Under HR Review',
  APPROVED: 'Approved',
  NOTICE_PERIOD: 'Notice Period',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
}

export function resignationStatusLabel(status) {
  return RESIGNATION_STATUS_LABELS[status] || status || 'Unknown'
}

export function getStatusBadgeStyle(status) {
  switch (status) {
    case 'PENDING_MANAGER_REVIEW':
      return { bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' }
    case 'MANAGER_APPROVED':
      return { bg: '#E0E7FF', color: '#3730A3', border: '#C7D2FE' }
    case 'HR_REVIEW':
      return { bg: '#E0F2FE', color: '#075985', border: '#BAE6FD' }
    case 'APPROVED':
      return { bg: '#DBEAFE', color: '#1E40AF', border: '#BFDBFE' }
    case 'NOTICE_PERIOD':
      return { bg: '#E0F2FE', color: '#0369A1', border: '#BAE6FD' }
    case 'COMPLETED':
      return { bg: '#D1FAE5', color: '#065F46', border: '#A7F3D0' }
    case 'REJECTED':
      return { bg: '#FEE2E2', color: '#991B1B', border: '#FCA5A5' }
    default:
      return { bg: '#F3F4F6', color: '#374151', border: '#E5E7EB' }
  }
}

export default function ResignationTimeline({ resignation }) {
  if (!resignation) return null

  const status = resignation.status
  const isRejected = status === 'REJECTED'

  // Define steps
  // 1. Submitted
  // 2. Manager Review
  // 3. HR Review
  // 4. Notice Period
  // 5. Completed

  const steps = [
    {
      key: 'submitted',
      title: 'Submitted',
      timestamp: resignation.submission_date || resignation.created_at,
      actor: null,
      description: 'Resignation request submitted by employee',
    },
    {
      key: 'manager_review',
      title: 'Manager Review',
      timestamp: resignation.manager_reviewed_at,
      actor: resignation.manager_name || (resignation.manager_id ? `Manager #${resignation.manager_id}` : null),
      comment: resignation.manager_comment,
      description: 'Reviewed by direct manager',
    },
    {
      key: 'hr_review',
      title: 'HR Review',
      timestamp: resignation.hr_reviewed_at,
      actor: resignation.hr_actor_name || (resignation.hr_actor_id ? `HR #${resignation.hr_actor_id}` : null),
      comment: resignation.hr_comment,
      description: 'Reviewed and approved by HR',
    },
    {
      key: 'notice_period',
      title: 'Notice Period',
      timestamp: resignation.notice_start_date || resignation.hr_reviewed_at,
      actor: null,
      description: resignation.approved_last_working_day 
        ? `Notice period active until ${new Date(resignation.approved_last_working_day).toLocaleDateString()}` 
        : 'Notice period active',
    },
    {
      key: 'completed',
      title: 'Completed',
      timestamp: resignation.completed_at,
      actor: resignation.completed_by_name || null,
      description: 'Resignation completed & employee offboarded',
    },
  ]

  // Determine state of each step
  // Order of progression:
  // 0: PENDING_MANAGER_REVIEW -> step 0 completed, step 1 current (pending)
  // 1: MANAGER_APPROVED / HR_REVIEW -> step 0, 1 completed, step 2 current
  // 2: APPROVED / NOTICE_PERIOD -> step 0, 1, 2 completed, step 3 current
  // 3: COMPLETED -> step 0, 1, 2, 3, 4 completed

  let activeIndex = 0
  if (status === 'PENDING_MANAGER_REVIEW') activeIndex = 1
  else if (status === 'MANAGER_APPROVED' || status === 'HR_REVIEW') activeIndex = 2
  else if (status === 'APPROVED' || status === 'NOTICE_PERIOD') activeIndex = 3
  else if (status === 'COMPLETED') activeIndex = 5 // all 5 completed
  else if (isRejected) {
    // If manager commented or hr_reviewed_at is missing, rejection happened at manager level
    activeIndex = resignation.manager_reviewed_at ? 1 : 1
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: '4px 0' }}>
      {steps.map((step, index) => {
        let stepState = 'pending' // 'completed', 'current', 'pending', 'rejected'
        
        if (isRejected && index === activeIndex) {
          stepState = 'rejected'
        } else if (index < activeIndex) {
          stepState = 'completed'
        } else if (index === activeIndex && !isRejected) {
          stepState = 'current'
        }

        const isLast = index === steps.length - 1

        let dotBg = '#CBD5E1'
        let dotBorder = '#CBD5E1'
        let dotIcon = null
        let textColor = '#64748B'
        let titleColor = '#64748B'

        if (stepState === 'completed') {
          dotBg = '#2563EB'
          dotBorder = '#2563EB'
          dotIcon = '✓'
          titleColor = '#1E293B'
          textColor = '#475569'
        } else if (stepState === 'current') {
          dotBg = '#FFFFFF'
          dotBorder = '#2563EB'
          dotIcon = '●'
          titleColor = '#2563EB'
          textColor = '#334155'
        } else if (stepState === 'rejected') {
          dotBg = '#DC2626'
          dotBorder = '#DC2626'
          dotIcon = '✕'
          titleColor = '#DC2626'
          textColor = '#991B1B'
        }

        return (
          <div key={step.key} style={{ display: 'flex', gap: 14, minHeight: 64 }}>
            {/* Timeline Column */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: dotBg,
                border: `2px solid ${dotBorder}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
                color: stepState === 'completed' || stepState === 'rejected' ? '#FFFFFF' : '#2563EB',
                flexShrink: 0,
                boxShadow: stepState === 'current' ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : 'none',
              }}>
                {dotIcon}
              </div>
              {!isLast && (
                <div style={{
                  width: 2,
                  flex: 1,
                  background: index < activeIndex ? '#2563EB' : '#E2E8F0',
                  margin: '4px 0',
                }} />
              )}
            </div>

            {/* Content Column */}
            <div style={{ paddingBottom: 16, flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 6 }}>
                <span style={{ fontSize: 14, fontWeight: stepState === 'current' || stepState === 'completed' ? 600 : 500, color: titleColor }}>
                  {step.title}
                </span>
                {step.timestamp && (
                  <span style={{ fontSize: 12, color: '#64748B', fontWeight: 400 }}>
                    {new Date(step.timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>

              {stepState === 'pending' && !step.timestamp && (
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Pending</div>
              )}

              {step.actor && (
                <div style={{ fontSize: 12, color: '#475569', marginTop: 2, fontWeight: 500 }}>
                  Reviewed by: <span style={{ color: '#1E293B' }}>{step.actor}</span>
                </div>
              )}

              {stepState === 'rejected' && (
                <div style={{
                  marginTop: 6,
                  padding: '8px 12px',
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  borderRadius: 6,
                  fontSize: 13,
                  color: '#991B1B',
                }}>
                  <strong>Rejection Note:</strong> {step.comment || 'No comment provided.'}
                </div>
              )}

              {step.comment && stepState !== 'rejected' && (
                <div style={{ fontSize: 12.5, color: '#475569', marginTop: 4, fontStyle: 'italic', background: '#F8FAFC', padding: '6px 10px', borderRadius: 4, borderLeft: '3px solid #CBD5E1' }}>
                  "{step.comment}"
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

