// Status badge component
const configs = {
  // Success
  Active:       { bg: '#DCFCE7', color: '#166534' },
  Present:      { bg: '#DCFCE7', color: '#166534' },
  Approved:     { bg: '#DCFCE7', color: '#166534' },
  'Checked In': { bg: '#DCFCE7', color: '#166534' },
  // Pending
  Pending:      { bg: '#FEF3C7', color: '#92400E' },
  Late:         { bg: '#FEF3C7', color: '#92400E' },
  // Danger
  Inactive:     { bg: '#FEE2E2', color: '#991B1B' },
  Absent:       { bg: '#FEE2E2', color: '#991B1B' },
  Rejected:     { bg: '#FEE2E2', color: '#991B1B' },
  Error:        { bg: '#FEE2E2', color: '#991B1B' },
  // Informational
  'On Leave':   { bg: '#E0F2FE', color: '#075985' },
  // Neutral
  'Checked Out':{ bg: '#EDF3F6', color: '#526B7A' },
  Draft:        { bg: '#EDF3F6', color: '#526B7A' },
}

export function Badge({ status }) {
  const cfg = configs[status] || { bg: '#f3f4f6', color: '#374151' }
  return (
    <span style={{
      fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20,
      background: cfg.bg, color: cfg.color,
    }}>
      {status}
    </span>
  )
}

export function TagBadge({ label }) {
  return (
    <span style={{
      fontSize: 12, background: '#f3f4f6', color: '#374151',
      padding: '3px 10px', borderRadius: 20, fontWeight: 500,
    }}>
      {label}
    </span>
  )
}
