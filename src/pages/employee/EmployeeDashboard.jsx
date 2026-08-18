import { useState, useEffect } from 'react'
import AppShell from '../../components/layout/AppShell.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { card, cardTitle } from '../../components/ui/styles.js'
import { CalendarIcon } from '../../components/ui/Icons.jsx'
import api from '../../services/api.js'
import { getUserFromToken } from '../../utils/auth.js'

const mockAttendance = [
  { date: '2026-08-13', checkIn: '09:02 AM', checkOut: '06:15 PM', hours: '9h 13m', status: 'Present' },
  { date: '2026-08-12', checkIn: '09:18 AM', checkOut: '06:30 PM', hours: '9h 12m', status: 'Present' },
  { date: '2026-08-11', checkIn: '—', checkOut: '—', hours: '—', status: 'On Leave' },
  { date: '2026-08-08', checkIn: '08:55 AM', checkOut: '06:10 PM', hours: '9h 15m', status: 'Present' },
]

// ─── Attendance Calendar ──────────────────────────────────────────────────────
const STATUS_COLOR = {
  present: { bg: '#1677B8', text: '#ffffff' },
  late:    { bg: '#f59e0b', text: '#ffffff' },
  leave:   { bg: '#517891', text: '#ffffff' },
  absent:  { bg: '#ef4444', text: '#ffffff' },
  weekend: { bg: 'transparent', text: '#d1d5db' },
  future:  { bg: 'transparent', text: '#9ca3af' },
  today:   { bg: '#172B3A', text: '#ffffff' },
}

// Mock status map: day -> status (in a real app, this comes from the API)
const MOCK_STATUS_MAP = {
  1: 'present', 2: 'present', 3: 'present', 4: 'present',
  7: 'present', 8: 'late',    9: 'present', 10: 'leave',
  11: 'present', 14: 'present', 15: 'absent', 16: 'present',
  17: 'present', 18: 'present',
}

function AttendanceCalendar() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth()) // 0-indexed

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const DAY_LABELS = ['S','M','T','W','T','F','S']

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = now.getDate()
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()

  const getDayStatus = (day) => {
    const date = new Date(year, month, day)
    const dow = date.getDay()
    if (dow === 0 || dow === 6) return 'weekend'
    if (isCurrentMonth && day === today) return 'today'
    if (isCurrentMonth && day > today) return 'future'
    return MOCK_STATUS_MAP[day] || 'present'
  }

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  // Stats
  const stats = [
    { label: 'Present', color: '#1677B8', count: Object.values(MOCK_STATUS_MAP).filter(s => s === 'present').length },
    { label: 'Late',    color: '#f59e0b', count: Object.values(MOCK_STATUS_MAP).filter(s => s === 'late').length },
    { label: 'Leave',   color: '#517891', count: Object.values(MOCK_STATUS_MAP).filter(s => s === 'leave').length },
    { label: 'Absent',  color: '#ef4444', count: Object.values(MOCK_STATUS_MAP).filter(s => s === 'absent').length },
  ]

  const cells = []
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div style={card}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={cardTitle}>Attendance Calendar</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={prevMonth} style={{ background: '#f3f4f6', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}>‹</button>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', minWidth: 110, textAlign: 'center' }}>
            {MONTHS[month]} {year}
          </span>
          <button onClick={nextMonth} style={{ background: '#f3f4f6', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}>›</button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
        {stats.map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 4, height: 32, borderRadius: 4, background: s.color }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#172B3A' }}>{s.count}</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Day labels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
        {DAY_LABELS.map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', fontWeight: 600, padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px 0' }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} />
          const status = getDayStatus(day)
          const colors = STATUS_COLOR[status]
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3px 0' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: colors.bg,
                color: colors.text,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: status === 'future' || status === 'weekend' ? 400 : 600,
                cursor: status !== 'future' && status !== 'weekend' && day ? 'pointer' : 'default',
                border: isCurrentMonth && day === today ? '2px solid #172B3A' : 'none',
              }}>
                {day}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginTop: 16, paddingTop: 14, borderTop: '1px solid #f3f4f6' }}>
        {[
          { label: 'Present', color: '#1677B8' },
          { label: 'Late',    color: '#f59e0b' },
          { label: 'Leave',   color: '#517891' },
          { label: 'Absent',  color: '#ef4444' },
          { label: 'Today',   color: '#172B3A' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
            <span style={{ fontSize: 11, color: '#6b7280' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

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
