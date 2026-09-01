import React from 'react';

const STAGES = [
  { key: 'SUBMITTED', label: 'Resignation Submitted' },
  { key: 'MANAGER_REVIEW', label: 'Manager Approved' },
  { key: 'HR_REVIEW', label: 'HR Approved' },
  { key: 'NOTICE_PERIOD', label: 'Notice Period' },
  { key: 'COMPLETED', label: 'Completed' },
];

export function ResignationTimeline({ status, rejectionReason, managerComment, hrComment }) {
  const isRejected = status === 'REJECTED';

  const getStepState = (stageKey) => {
    if (isRejected) {
      if (stageKey === 'SUBMITTED') return 'completed';
      return 'rejected';
    }

    switch (status) {
      case 'PENDING_MANAGER_REVIEW':
        if (stageKey === 'SUBMITTED') return 'current';
        return 'upcoming';
      case 'MANAGER_APPROVED':
      case 'HR_REVIEW':
        if (stageKey === 'SUBMITTED' || stageKey === 'MANAGER_REVIEW') return 'completed';
        if (stageKey === 'HR_REVIEW') return 'current';
        return 'upcoming';
      case 'APPROVED':
      case 'NOTICE_PERIOD':
        if (['SUBMITTED', 'MANAGER_REVIEW', 'HR_REVIEW'].includes(stageKey)) return 'completed';
        if (stageKey === 'NOTICE_PERIOD') return 'current';
        return 'upcoming';
      case 'COMPLETED':
        return 'completed';
      default:
        return 'upcoming';
    }
  };

  return (
    <div style={{ margin: '24px 0', padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
      <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1E293B', marginBottom: '16px' }}>
        Resignation Progress Timeline
      </h3>

      {isRejected ? (
        <div style={{ padding: '14px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991B1B', fontWeight: '600', fontSize: '14px' }}>
            <span>❌ Resignation Request Rejected</span>
          </div>
          {rejectionReason && (
            <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#7F1D1D' }}>
              <strong>Reason:</strong> {rejectionReason}
            </p>
          )}
        </div>
      ) : null}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflowX: 'auto', padding: '10px 0' }}>
        {STAGES.map((stage, idx) => {
          const stepState = getStepState(stage.key);

          let circleBg = '#E2E8F0';
          let circleColor = '#64748B';
          let icon = idx + 1;

          if (stepState === 'completed') {
            circleBg = '#10B981';
            circleColor = '#FFFFFF';
            icon = '✓';
          } else if (stepState === 'current') {
            circleBg = '#3B82F6';
            circleColor = '#FFFFFF';
            icon = '●';
          } else if (stepState === 'rejected') {
            circleBg = '#EF4444';
            circleColor = '#FFFFFF';
            icon = '✕';
          }

          return (
            <div key={stage.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', minWidth: '110px' }}>
              {/* Connector line */}
              {idx < STAGES.length - 1 && (
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  left: '50%',
                  width: '100%',
                  height: '3px',
                  backgroundColor: stepState === 'completed' ? '#10B981' : '#E2E8F0',
                  zIndex: 1,
                }} />
              )}

              {/* Circle Badge */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: circleBg,
                color: circleColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '13px',
                zIndex: 2,
                boxShadow: stepState === 'current' ? '0 0 0 4px rgba(59, 130, 246, 0.2)' : 'none',
                transition: 'all 0.3s ease',
              }}>
                {icon}
              </div>

              {/* Label */}
              <span style={{
                marginTop: '8px',
                fontSize: '12px',
                fontWeight: stepState === 'current' ? '600' : '400',
                color: stepState === 'completed' ? '#059669' : stepState === 'current' ? '#2563EB' : stepState === 'rejected' ? '#DC2626' : '#64748B',
                textAlign: 'center',
              }}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
