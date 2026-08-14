import { useState } from 'react'
import AppShell from '../../components/layout/AppShell.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { card, cardTitle } from '../../components/ui/styles.js'
import { CalendarIcon } from '../../components/ui/Icons.jsx'

const mockHistory = [
  { date: '2026-08-14', checkIn: '09:02 AM', checkOut: '06:15 PM', hours: '9h 13m', status: 'Present' },
  { date: '2026-08-13', checkIn: '09:18 AM', checkOut: '06:30 PM', hours: '9h 12m', status: 'Present' },
  { date: '2026-08-12', checkIn: '—',        checkOut: '—',        hours: '—',      status: 'On Leave' },
  { date: '2026-08-11', checkIn: '08:45 AM', checkOut: '06:00 PM', hours: '9h 15m', status: 'Present' },
  { date: '2026-08-08', checkIn: '09:30 AM', checkOut: '06:45 PM', hours: '9h 15m', status: 'Present' },
  { date: '2026-08-07', checkIn: '—',        checkOut: '—',        hours: '—',      status: 'Absent' },
  { date: '2026-08-06', checkIn: '09:05 AM', checkOut: '06:20 PM', hours: '9h 15m', status: 'Present' },
]

export default function MyAttendance() {
  const [dateFrom, setDateFrom] = useState('2026-08-01')
  const [dateTo, setDateTo]   = useState('2026-08-14')
  const [statusFilter, setStatusFilter] = useState('All')

  const filtered = mockHistory.filter(r => {
    const matchStatus = statusFilter === 'All' || r.status === statusFilter
    return matchStatus
  })

  const presentDays = filtered.filter(r => r.status === 'Present').length
  const absentDays  = filtered.filter(r => r.status === 'Absent').length
  const leaveDays   = filtered.filter(r => r.status === 'On Leave').length

  return (
    <AppShell>
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>My Attendance</h1>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { label: 'Days Present', value: presentDays, color: '#22c55e', bg: '#d1fae5' },
            { label: 'Days Absent',  value: absentDays,  color: '#ef4444', bg: '#fee2e2' },
            { label: 'Days on Leave',value: leaveDays,   color: '#f59e0b', bg: '#fef3c7' },
          ].map(s => (
            <div key={s.label} style={{ ...card, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#6b7280' }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Filters + Table */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <h2 style={{ ...cardTitle, flex: 1 }}>Attendance History</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280' }}>
              <CalendarIcon />
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 10px', fontSize: 13, color: '#374151', outline: 'none', cursor: 'pointer' }} />
              <span>—</span>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 10px', fontSize: 13, color: '#374151', outline: 'none', cursor: 'pointer' }} />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#374151', outline: 'none', cursor: 'pointer' }}>
              <option>All</option>
              <option>Present</option>
              <option>Absent</option>
              <option>On Leave</option>
            </select>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Date', 'Check In', 'Check Out', 'Total Hours', 'Status'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#374151', borderBottom: '1px solid #f3f4f6' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={i}
                  style={{ borderBottom: '1px solid #f9fafb' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <td style={{ padding: '13px 16px', fontSize: 13, color: '#374151', fontWeight: 500 }}>{row.date}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: '#22c55e', fontWeight: 500 }}>{row.checkIn}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: '#ef4444', fontWeight: 500 }}>{row.checkOut}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 600, color: '#374151' }}>{row.hours}</td>
                  <td style={{ padding: '13px 16px' }}><Badge status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}
