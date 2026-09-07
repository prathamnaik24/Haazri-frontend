import React, { useEffect, useState } from 'react'

function getRemainingDays(targetDateStr) {
  if (!targetDateStr) return 0
  const target = new Date(targetDateStr)
  // Set target to end of day to give full credit for target day
  target.setHours(23, 59, 59, 999)
  const now = new Date()
  const diffTime = target.getTime() - now.getTime()
  if (diffTime <= 0) return 0
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export default function NoticePeriodCountdown({ resignation }) {
  const target = resignation?.approved_last_working_day || resignation?.proposed_last_working_day
  const status = resignation?.status

  const [remainingDays, setRemainingDays] = useState(() => getRemainingDays(target))

  useEffect(() => {
    if (!target) return undefined
    setRemainingDays(getRemainingDays(target))
    const timer = window.setInterval(() => setRemainingDays(getRemainingDays(target)), 60000)
    return () => window.clearInterval(timer)
  }, [target])

  if (!resignation) return null

  // If completed
  if (status === 'COMPLETED') {
    return (
      <div style={{
        background: '#ECFDF5',
        border: '1px solid #6EE7B7',
        borderRadius: 10,
        padding: 16,
        marginTop: 12,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: '#047857', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Resignation Completed
          </div>
          <span style={{
            background: '#047857',
            color: '#FFFFFF',
            padding: '3px 8px',
            borderRadius: 12,
            fontSize: 11,
            fontWeight: 600,
          }}>
            Employment Status: RESIGNED
          </span>
        </div>
        <div style={{ fontSize: 13, color: '#065F46', marginTop: 6 }}>
          All offboarding steps completed. Employment record has been transitioned to resigned.
        </div>
      </div>
    )
  }

  // Only render notice period box if in NOTICE_PERIOD or APPROVED
  if (status !== 'NOTICE_PERIOD' && status !== 'APPROVED') {
    return null
  }

  const formattedTargetDate = target
    ? new Date(target).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
    : 'Not set'

  let countdownText = `${remainingDays} ${remainingDays === 1 ? 'day' : 'days'} remaining`
  if (remainingDays === 0) {
    countdownText = 'Last working day is today'
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
      border: '1px solid #7DD3FC',
      borderRadius: 10,
      padding: 16,
      marginTop: 14,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontSize: 12, color: '#0369A1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Notice Period Tracker
        </div>
        <span style={{
          background: '#0284C7',
          color: '#FFFFFF',
          padding: '3px 10px',
          borderRadius: 12,
          fontSize: 11,
          fontWeight: 600,
        }}>
          Employment Status: ACTIVE
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
        <strong style={{ fontSize: 32, color: '#0369A1', lineHeight: 1 }}>{remainingDays}</strong>
        <span style={{ fontSize: 15, color: '#0C4A6E', fontWeight: 600 }}>{countdownText}</span>
      </div>

      <div style={{ fontSize: 13, color: '#334155', marginTop: 8, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <span style={{ color: '#64748B' }}>Approved Last Working Day:</span>{' '}
          <strong style={{ color: '#0F172A' }}>{formattedTargetDate}</strong>
        </div>
      </div>

      <div style={{
        marginTop: 10,
        paddingTop: 8,
        borderTop: '1px solid #BAE6FD',
        fontSize: 12,
        color: '#0369A1',
        fontStyle: 'italic',
      }}>
        Note: Employment status remains <strong>ACTIVE</strong> during the notice period until HR formally completes offboarding.
      </div>
    </div>
  )
}

