import { useState, useEffect } from 'react'
import AppShell from '../../components/layout/AppShell.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { card, cardTitle } from '../../components/ui/styles.js'
import { CalendarIcon } from '../../components/ui/Icons.jsx'
import AttendanceCalendar from '../../components/dashboard/AttendanceCalendar.jsx'
import api from '../../services/api.js'
import { getUserFromToken } from '../../utils/auth.js'

const mockAttendance = [
  { date: '2026-08-13', checkIn: '09:02 AM', checkOut: '06:15 PM', hours: '9h 13m', status: 'Present' },
  { date: '2026-08-12', checkIn: '09:18 AM', checkOut: '06:30 PM', hours: '9h 12m', status: 'Present' },
  { date: '2026-08-11', checkIn: '—', checkOut: '—', hours: '—', status: 'On Leave' },
  { date: '2026-08-08', checkIn: '08:55 AM', checkOut: '06:10 PM', hours: '9h 15m', status: 'Present' },
]



// ─── Check In Widget ──────────────────────────────────────────────────────────
function CheckInWidget({ user }) {
  const [checkedIn, setCheckedIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [time, setTime] = useState('')
  const [elapsed, setElapsed] = useState('00:00:00')
  const [startTime, setStartTime] = useState(null)

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      if (startTime) {
        const diff = Math.floor((now - startTime) / 1000)
        const h = String(Math.floor(diff / 3600)).padStart(2, '0')
        const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0')
        const s = String(diff % 60).padStart(2, '0')
        setElapsed(`${h}:${m}:${s}`)
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [startTime])

  const handleCheckIn = async () => {
    setLoading(true)
    try {
      await api.post('/attendance/check-in', {})
      setCheckedIn(true)
      setStartTime(new Date())
    } catch {
      setCheckedIn(true)
      setStartTime(new Date())
    } finally {
      setLoading(false)
    }
  }

  const handleCheckOut = async () => {
    setLoading(true)
    try {
      await api.post('/attendance/check-out', {})
      setCheckedIn(false)
      setStartTime(null)
      setElapsed('00:00:00')
    } catch {
      setCheckedIn(false)
    } finally {
      setLoading(false)
    }
  }

  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.first_name || 'there'

  return (
    <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#172B3A', margin: 0 }}>{greeting}, {firstName} 👋</h2>
        <p style={{ fontSize: 13, color: '#526B7A', margin: '4px 0 0' }}>
          {now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ fontSize: 48, fontWeight: 700, color: '#172B3A', letterSpacing: '-0.03em' }}>{time}</div>
        {checkedIn && (
          <div style={{ fontSize: 14, color: '#6b7280', marginTop: 8 }}>
            Working time: <span style={{ fontWeight: 600, color: '#1677B8' }}>{elapsed}</span>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: checkedIn ? '#22c55e' : '#526B7A' }} />
          <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>
            {checkedIn ? 'Checked In' : 'Not checked in'}
          </span>
        </div>
        <button
          disabled={loading}
          onClick={checkedIn ? handleCheckOut : handleCheckIn}
          style={{
            padding: '10px 28px', borderRadius: 8, border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            background: checkedIn ? '#FEE2E2' : '#1677B8',
            color: checkedIn ? '#dc2626' : '#ffffff',
            fontSize: 14, fontWeight: 600,
          }}
        >
          {loading ? '...' : checkedIn ? 'Check Out' : 'Check In'}
        </button>
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function EmployeeDashboard() {
  const user = getUserFromToken()

  return (
    <AppShell>
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Top row: Check-in + Leave Balance */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <CheckInWidget user={user} />
          <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={cardTitle}>Leave Balance</h2>
            {[
              { type: 'Annual Leave', used: 2, total: 10, color: '#1677B8', bg: '#EAF6FF' },
              { type: 'Sick Leave',   used: 1, total: 7,  color: '#517891', bg: '#EDF3F6' },
              { type: 'Casual Leave', used: 0, total: 5,  color: '#f59e0b', bg: '#fef3c7' },
            ].map(leave => (
              <div key={leave.type}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#374151', fontWeight: 500, marginBottom: 6 }}>
                  <span>{leave.type}</span>
                  <span style={{ color: '#6b7280' }}>{leave.total - leave.used} of {leave.total} days left</span>
                </div>
                <div style={{ height: 8, borderRadius: 8, background: leave.bg, overflow: 'hidden' }}>
                  <div style={{ width: `${(leave.used / leave.total) * 100}%`, height: '100%', background: leave.color, borderRadius: 8 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Calendar */}
        <AttendanceCalendar />

        {/* Recent Attendance Table */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={cardTitle}>Recent Attendance</h2>
            <span style={{ fontSize: 12, color: '#526B7A', display: 'flex', alignItems: 'center' }}>
              <CalendarIcon />Last 7 days
            </span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Date', 'Check In', 'Check Out', 'Total Hours', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#374151', borderBottom: '1px solid #f3f4f6' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockAttendance.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f9fafb' }}>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#374151', fontWeight: 500 }}>{row.date}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#22c55e', fontWeight: 500 }}>{row.checkIn}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#ef4444', fontWeight: 500 }}>{row.checkOut}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#374151', fontWeight: 600 }}>{row.hours}</td>
                  <td style={{ padding: '12px 16px' }}><Badge status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}
