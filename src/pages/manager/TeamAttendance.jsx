import { useState } from 'react'
import AppShell from '../../components/layout/AppShell.jsx'
import { Avatar, avatarColor } from '../../components/ui/Avatar.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { card } from '../../components/ui/styles.js'
import { SearchIcon, CalendarIcon } from '../../components/ui/Icons.jsx'

const mockTeam = [
  { name: 'Aisha Khan',   position: 'Backend Developer',  date: '2026-08-14', checkIn: '09:05 AM', checkOut: '—',       hours: '—',    status: 'Checked In' },
  { name: 'Rohan Mehta',  position: 'Frontend Developer', date: '2026-08-14', checkIn: '09:22 AM', checkOut: '—',       hours: '—',    status: 'Checked In' },
  { name: 'Sara Ahmed',   position: 'QA Engineer',        date: '2026-08-14', checkIn: '—',        checkOut: '—',       hours: '—',    status: 'On Leave' },
  { name: 'James Wilson', position: 'DevOps Engineer',    date: '2026-08-14', checkIn: '08:50 AM', checkOut: '06:00 PM',hours: '9h 10m',status: 'Checked Out' },
  { name: 'Priya Singh',  position: 'Backend Developer',  date: '2026-08-14', checkIn: '—',        checkOut: '—',       hours: '—',    status: 'Absent' },
]

export default function TeamAttendance() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [date, setDate] = useState('2026-08-14')

  const filtered = mockTeam.filter(emp => {
    const matchSearch = emp.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || emp.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <AppShell>
      <div style={{ padding: '20px 24px' }}>
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

          {/* Header */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: '#172B3A', margin: 0, flex: 1 }}>Team Attendance</h1>

            {/* Date selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280' }}>
              <CalendarIcon />
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '7px 10px', fontSize: 13, color: '#374151', outline: 'none', cursor: 'pointer' }} />
            </div>

            {/* Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px' }}>
              <SearchIcon />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name..."
                style={{ border: 'none', outline: 'none', fontSize: 13, background: 'transparent', color: '#374151', width: 160 }} />
            </div>

            {/* Status Filter */}
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#374151', outline: 'none', cursor: 'pointer' }}>
              <option>All</option>
              <option>Checked In</option>
              <option>Checked Out</option>
              <option>On Leave</option>
              <option>Absent</option>
            </select>
          </div>

          {/* Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Employee', 'Position', 'Date', 'Check In', 'Check Out', 'Total Hours', 'Status'].map(h => (
                  <th key={h} style={{ padding: '11px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#374151', borderBottom: '1px solid #f3f4f6' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp, i) => (
                <tr key={i}
                  style={{ borderBottom: '1px solid #f9fafb' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={emp.name} size={32} bgColor={avatarColor(i)} />
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#172B3A' }}>{emp.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#6b7280' }}>{emp.position}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#6b7280' }}>{emp.date}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#22c55e', fontWeight: 500 }}>{emp.checkIn}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#ef4444', fontWeight: 500 }}>{emp.checkOut}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: '#374151' }}>{emp.hours}</td>
                  <td style={{ padding: '14px 20px' }}><Badge status={emp.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}
