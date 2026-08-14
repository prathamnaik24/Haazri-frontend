import AppShell from '../../components/layout/AppShell.jsx'
import { Avatar, avatarColor } from '../../components/ui/Avatar.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { card } from '../../components/ui/styles.js'

const teamStats = [
  { label: 'Team Members', value: 12, color: '#1677B8', bg: '#EAF6FF' },
  { label: 'Present Today', value: 9,  color: '#22c55e', bg: '#d1fae5' },
  { label: 'On Leave',      value: 2,  color: '#f59e0b', bg: '#fef3c7' },
  { label: 'Pending Leaves',value: 3,  color: '#ef4444', bg: '#fee2e2' },
]

const pendingLeaves = [
  { name: 'Aisha Khan',   type: 'Annual Leave', from: '2026-08-18', to: '2026-08-20', days: 3, reason: 'Family trip', balance: 8, status: 'Pending' },
  { name: 'Rohan Mehta',  type: 'Sick Leave',   from: '2026-08-15', to: '2026-08-15', days: 1, reason: 'Fever',       balance: 5, status: 'Pending' },
  { name: 'Sara Ahmed',   type: 'Casual Leave', from: '2026-08-16', to: '2026-08-16', days: 1, reason: 'Personal',   balance: 4, status: 'Pending' },
]

const todayTeam = [
  { name: 'Aisha Khan',   position: 'Backend Dev',  checkIn: '09:05 AM', checkOut: '—',       status: 'Checked In' },
  { name: 'Rohan Mehta',  position: 'Frontend Dev', checkIn: '09:22 AM', checkOut: '—',       status: 'Checked In' },
  { name: 'Sara Ahmed',   position: 'QA Engineer',  checkIn: '—',        checkOut: '—',       status: 'On Leave' },
  { name: 'James Wilson', position: 'DevOps',       checkIn: '08:50 AM', checkOut: '06:00 PM',status: 'Checked Out' },
]

export default function ManagerDashboard() {
  return (
    <AppShell>
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#172B3A', margin: 0 }}>Manager Dashboard</h1>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {teamStats.map(s => (
            <div key={s.label} style={{ ...card }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</span>
                </div>
              </div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#172B3A', letterSpacing: '-0.03em', marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Pending Leave Requests */}
          <div style={card}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#172B3A', margin: '0 0 16px' }}>Pending Leave Requests</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pendingLeaves.map((req, i) => (
                <div key={i} style={{ background: '#f9fafb', borderRadius: 10, padding: '12px 14px', border: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar name={req.name} size={30} bgColor={avatarColor(i)} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#172B3A' }}>{req.name}</span>
                    </div>
                    <Badge status={req.status} />
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
                    {req.type} · {req.from} → {req.to} ({req.days}d) · Balance: {req.balance}d
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ flex: 1, padding: '6px 0', borderRadius: 6, border: 'none', background: '#d1fae5', color: '#15803d', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      ✓ Approve
                    </button>
                    <button style={{ flex: 1, padding: '6px 0', borderRadius: 6, border: 'none', background: '#fee2e2', color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      ✕ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Team Attendance */}
          <div style={card}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#172B3A', margin: '0 0 16px' }}>Today's Team</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {todayTeam.map((emp, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < todayTeam.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <Avatar name={emp.name} size={34} bgColor={avatarColor(i)} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#172B3A' }}>{emp.name}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>{emp.position}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: '#22c55e', fontWeight: 500 }}>{emp.checkIn}</div>
                    <div style={{ fontSize: 12, color: '#ef4444', fontWeight: 500 }}>{emp.checkOut}</div>
                  </div>
                  <Badge status={emp.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
