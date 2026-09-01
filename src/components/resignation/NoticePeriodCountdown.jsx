import React from 'react';

export function NoticePeriodCountdown({ approvedLastWorkingDay, proposedLastWorkingDay }) {
  const targetDateStr = approvedLastWorkingDay || proposedLastWorkingDay;
  if (!targetDateStr) return null;

  const targetDate = new Date(targetDateStr);
  const today = new Date();

  // Reset time portions for accurate day count difference
  targetDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let badgeColor = '#2563EB';
  let badgeBg = '#EFF6FF';
  let borderColor = '#BFDBFE';
  let messageText = '';

  if (diffDays > 0) {
    messageText = `${diffDays} Day${diffDays === 1 ? '' : 's'} Remaining in Notice Period`;
    badgeColor = '#0369A1';
    badgeBg = '#E0F2FE';
    borderColor = '#BAE6FD';
  } else if (diffDays === 0) {
    messageText = '🎯 Today is your Last Working Day!';
    badgeColor = '#D97706';
    badgeBg = '#FEF3C7';
    borderColor = '#FDE68A';
  } else {
    messageText = `⌛ Notice period completed (${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'} ago) — Awaiting HR offboarding completion`;
    badgeColor = '#059669';
    badgeBg = '#ECFDF5';
    borderColor = '#A7F3D0';
  }

  return (
    <div style={{
      padding: '16px 20px',
      backgroundColor: badgeBg,
      border: `1px solid ${borderColor}`,
      borderRadius: '10px',
      margin: '16px 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    }}>
      <div>
        <div style={{ fontSize: '12px', textTransform: 'uppercase', tracking: '0.05em', color: '#64748B', fontWeight: '600' }}>
          Notice Period Countdown
        </div>
        <div style={{ fontSize: '18px', fontWeight: '700', color: badgeColor, marginTop: '4px' }}>
          {messageText}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '12px', color: '#64748B' }}>Approved Last Working Day</div>
        <div style={{ fontSize: '15px', fontWeight: '600', color: '#1E293B' }}>
          {new Date(targetDateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
      </div>
    </div>
  );
}
