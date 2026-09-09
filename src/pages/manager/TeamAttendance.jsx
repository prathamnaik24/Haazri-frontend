import { useState, useEffect } from 'react'
import AppShell from '../../components/layout/AppShell.jsx'
import { Avatar, avatarColor } from '../../components/ui/Avatar.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { card } from '../../components/ui/styles.js'
import { SearchIcon, CalendarIcon } from '../../components/ui/Icons.jsx'
import api from '../../services/api.js'

export default function TeamAttendance() {
  const todayStr = new Date().toISOString().split('T')[0]
  const yesterdayDate = new Date()
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0]

  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [date, setDate] = useState(todayStr) // Defaults to today so live cards show today's data immediately

  const fetchTeamAttendance = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/attendance/team?limit=100')
      const rawLogs = res.data?.data?.team_history || []
      
      const formatted = rawLogs.map(log => {
        const name = `${log.employee?.first_name || ''} ${log.employee?.last_name || ''}`.trim() || log.employee?.email || 'Team Member'
        const position = log.employee?.position?.title || 'Team Member'
        const rawDate = log.work_date ? new Date(log.work_date).toISOString().split('T')[0] : ''
        
        const checkIn = log.check_in_time
          ? new Date(log.check_in_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
          : '—'
        
        const checkOut = log.check_out_time
          ? new Date(log.check_out_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
          : (log.check_in_time ? 'In Progress' : '—')
        
        const hours = log.working_minutes
          ? `${Math.floor(log.working_minutes / 60)}h ${log.working_minutes % 60}m`
          : (log.check_in_time && !log.check_out_time ? 'In Progress' : '—')
        
        let displayStatus = log.status || 'Present'
        if (log.punctuality_status === 'LATE') {
          displayStatus = 'Late'
        } else if (log.check_in_time && !log.check_out_time) {
          displayStatus = 'Checked In'
        } else if (log.check_in_time && log.check_out_time) {
          displayStatus = 'Checked Out'
        } else if (log.status === 'Absent' || log.punctuality_status === 'ABSENT') {
          displayStatus = 'Absent'
        } else if (log.status === 'On Leave' || log.status === 'ON_LEAVE') {
          displayStatus = 'On Leave'
        }

        return {
          id: log.id,
          name,
          email: log.employee?.email || '',
          position,
          date: rawDate,
          checkIn,
          checkOut,
          hours,
          status: displayStatus,
          lateBy: log.late_by_minutes || 0,
        }
      })

      setLogs(formatted)
    } catch (err) {
      console.error('Failed to fetch team attendance:', err)
      setError(err.response?.data?.message || 'Failed to load team attendance records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeamAttendance()
  }, [])

  // Logs strictly filtered by the active timeframe (date selection)
  const timeframeLogs = date ? logs.filter(l => l.date === date) : logs

  // Filter logs further by search and status dropdown
  const filtered = timeframeLogs.filter(emp => {
    const matchSearch = emp.name.toLowerCase().includes(search.toLowerCase()) ||
                        emp.position.toLowerCase().includes(search.toLowerCase()) ||
                        emp.email.toLowerCase().includes(search.toLowerCase())
    
    let matchStatus = true
    if (statusFilter !== 'All') {
      if (statusFilter === 'Present') {
        matchStatus = emp.status === 'Present' || emp.status === 'Checked In' || emp.status === 'Checked Out'
      } else {
        matchStatus = emp.status === statusFilter
      }
    }

    return matchSearch && matchStatus
  })

  // Summary counts dynamically scoped to the selected timeframe
  const presentCount = timeframeLogs.filter(l => l.status === 'Present' || l.status === 'Checked In' || l.status === 'Checked Out').length
  const lateCount = timeframeLogs.filter(l => l.status === 'Late').length
  const onLeaveCount = timeframeLogs.filter(l => l.status === 'On Leave').length
  const absentCount = timeframeLogs.filter(l => l.status === 'Absent').length

  const timeframeLabel = !date
    ? 'All Dates'
    : date === todayStr
    ? 'Today'
    : date === yesterdayStr
    ? 'Yesterday'
    : new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <AppShell>
      <div style={{ padding: '24px 28px', maxWidth: 1300, margin: '0 auto' }}>
        
        {/* Header with Title & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#172B3A', margin: 0 }}>Team Attendance</h1>
            <p style={{ fontSize: 13, color: '#526B7A', margin: '4px 0 0' }}>
              Monitor live check-ins, punctuality, and attendance across your team
            </p>
          </div>
          <button
            onClick={fetchTeamAttendance}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#EAF6FF', color: '#1677B8', border: '1px solid #90D5FF',
              borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Refreshing...' : '↻ Refresh Data'}
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{ background: '#FFF5F5', border: '1px solid #FED7D7', color: '#C53030', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 13 }}>
            {error}
          </div>
        )}

        {/* Quick Timeframe Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#334E5C' }}>Active Period:</span>
          <button
            onClick={() => setDate(todayStr)}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
              background: date === todayStr ? '#1677B8' : '#e2e8f0',
              color: date === todayStr ? '#ffffff' : '#475569',
              transition: 'all 0.15s ease'
            }}
          >
            Today
          </button>
          <button
            onClick={() => setDate(yesterdayStr)}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
              background: date === yesterdayStr ? '#1677B8' : '#e2e8f0',
              color: date === yesterdayStr ? '#ffffff' : '#475569',
              transition: 'all 0.15s ease'
            }}
          >
            Yesterday
          </button>
          <button
            onClick={() => setDate('')}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
              background: !date ? '#1677B8' : '#e2e8f0',
              color: !date ? '#ffffff' : '#475569',
              transition: 'all 0.15s ease'
            }}
          >
            All Dates
          </button>
          <span style={{ fontSize: 12, color: '#64748b', marginLeft: 4 }}>
            (Metrics and table dynamically show: <strong>{timeframeLabel}</strong>)
          </span>
        </div>

        {/* Metric Summary Cards - Dynamic per Timeframe */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div style={{ ...card, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 18, color: '#166534', fontWeight: 700 }}>✓</span>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Present ({timeframeLabel})</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#172B3A', marginTop: 2 }}>{presentCount}</div>
            </div>
          </div>

          <div style={{ ...card, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 18, color: '#92400E', fontWeight: 700 }}>⏱</span>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Late ({timeframeLabel})</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#172B3A', marginTop: 2 }}>{lateCount}</div>
            </div>
          </div>

          <div style={{ ...card, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 18, color: '#075985', fontWeight: 700 }}>📅</span>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>On Leave ({timeframeLabel})</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#172B3A', marginTop: 2 }}>{onLeaveCount}</div>
            </div>
          </div>

          <div style={{ ...card, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 18, color: '#991B1B', fontWeight: 700 }}>✕</span>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Absent ({timeframeLabel})</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#172B3A', marginTop: 2 }}>{absentCount}</div>
            </div>
          </div>
        </div>

        {/* Filters & Table Container */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #D7E6EF', boxShadow: '0 1px 3px rgba(81, 120, 145, 0.08)', overflow: 'hidden' }}>

          {/* Filter Bar */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #edf2f7', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            
            {/* Search Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '7px 12px', flex: '1 1 200px', maxWidth: 320 }}>
              <SearchIcon />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search team member or position..."
                style={{ border: 'none', outline: 'none', fontSize: 13, background: 'transparent', color: '#1e293b', width: '100%' }}
              />
            </div>

            {/* Custom Date Picker */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b' }}>
              <CalendarIcon />
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 10px', fontSize: 13, color: '#1e293b', outline: 'none', background: '#f8fafc' }}
              />
              {date && (
                <button
                  onClick={() => setDate('')}
                  style={{ background: '#f1f5f9', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer', color: '#64748b' }}
                  title="Clear date filter"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '7px 12px', fontSize: 13, color: '#1e293b', outline: 'none', background: '#f8fafc', cursor: 'pointer' }}
            >
              <option value="All">All Statuses</option>
              <option value="Present">Present (All)</option>
              <option value="Checked In">Checked In</option>
              <option value="Checked Out">Checked Out</option>
              <option value="Late">Late</option>
              <option value="On Leave">On Leave</option>
              <option value="Absent">Absent</option>
            </select>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  {['Employee', 'Position', 'Date', 'Check In', 'Check Out', 'Total Hours', 'Status'].map(h => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '36px 20px', textAlign: 'center', color: '#64748b', fontSize: 13 }}>
                      Loading live team attendance...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '36px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                      {logs.length === 0 ? 'No team attendance records found for your team scope.' : `No records found for ${timeframeLabel}.`}
                    </td>
                  </tr>
                ) : (
                  filtered.map((emp, i) => (
                    <tr
                      key={emp.id || i}
                      style={{ borderBottom: '1px solid #f1f5f9' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={emp.name} size={32} bgColor={avatarColor(i)} />
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{emp.name}</div>
                            {emp.email && <div style={{ fontSize: 11, color: '#94a3b8' }}>{emp.email}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: '#475569' }}>{emp.position}</td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: '#64748b' }}>{emp.date}</td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: '#16a34a', fontWeight: 600 }}>{emp.checkIn}</td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: '#475569', fontWeight: 500 }}>{emp.checkOut}</td>
                      <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{emp.hours}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Badge status={emp.status} />
                          {emp.lateBy > 0 && emp.status === 'Late' && (
                            <span style={{ fontSize: 11, color: '#b45309', fontWeight: 600 }}>
                              +{emp.lateBy}m
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer stats count */}
          {!loading && (
            <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', background: '#fafbfc', fontSize: 12, color: '#64748b', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <span>Showing {filtered.length} record{filtered.length === 1 ? '' : 's'} for <strong>{timeframeLabel}</strong></span>
              <span>Total records in team history: {logs.length}</span>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
