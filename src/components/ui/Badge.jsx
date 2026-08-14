// Status badge component
const configs = {
  Active:    { bg: '#d1fae5', color: '#15803d' },
  Inactive:  { bg: '#fee2e2', color: '#dc2626' },
  Present:   { bg: '#d1fae5', color: '#15803d' },
  Absent:    { bg: '#fee2e2', color: '#dc2626' },
  'On Leave':{ bg: '#fef3c7', color: '#92400e' },
  Pending:   { bg: '#fef3c7', color: '#92400e' },
  Approved:  { bg: '#d1fae5', color: '#15803d' },
  Rejected:  { bg: '#fee2e2', color: '#dc2626' },
  'Checked In':  { bg: '#dbeafe', color: '#1d4ed8' },
  'Checked Out': { bg: '#f3f4f6', color: '#374151' },
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
