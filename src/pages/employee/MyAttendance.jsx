import React, { useState, useEffect } from 'react'
import AppShell from '../../components/layout/AppShell.jsx'
import api from '../../services/api.js'

export default function MyAttendance() {
  const [history, setHistory] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [histRes, sumRes] = await Promise.all([
        api.get('/attendance/me?limit=50'),
        api.get('/attendance/me/summary'),
      ])
      setHistory(histRes.data?.data?.history || [])
      setSummary(sumRes.data?.data || null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load attendance records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCheckIn = async () => {
    setActionLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await api.post('/attendance/check-in', {})
      const lateMsg = res.data?.data?.punctuality_status === 'LATE'
        ? ` (Late by ${res.data.data.late_by_minutes} mins)`
        : ''
      setSuccess(`Checked in successfully! Status: ${res.data?.data?.punctuality_status || 'ON_TIME'}${lateMsg}`)
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Check-in failed')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCheckOut = async () => {
    setActionLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await api.post('/attendance/check-out', {})
      setSuccess(`Checked out successfully! Total duration: ${res.data?.data?.working_minutes || 0} mins`)
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Check-out failed')
    } finally {
      setActionLoading(false)
    }
  }

  // Check today's status
  const today = new Date()
  const todayRecord = history.find(r => {
    const checkInDate = r.check_in_time ? new Date(r.check_in_time) : null
    const workDate = r.work_date ? new Date(r.work_date) : null
    const targetDate = checkInDate || workDate
    if (!targetDate) return false

    return targetDate.getFullYear() === today.getFullYear() &&
           targetDate.getMonth() === today.getMonth() &&
           targetDate.getDate() === today.getDate()
  })
  const isCheckedIn = !!todayRecord?.check_in_time
  const isCheckedOut = !!todayRecord?.check_out_time

  const filtered = history.filter(r => {
    if (statusFilter !== 'All') {
      const matchPunct = r.punctuality_status === statusFilter || r.status === statusFilter
      if (!matchPunct) return false
    }
    const rDate = r.work_date?.split('T')[0]
    if (dateFrom && rDate < dateFrom) return false
    if (dateTo && rDate > dateTo) return false
    return true
  })

  const punctualityStyles = {
    ON_TIME: { bg: '#DEF7EC', color: '#03543F', label: 'On Time' },
    LATE: { bg: '#FEF08A', color: '#713F12', label: 'Late' },
    EARLY: { bg: '#E1EFFE', color: '#1E429F', label: 'Early' },
    HALF_DAY: { bg: '#FDE8E8', color: '#9B1C1C', label: 'Half Day' },
    ABSENT: { bg: '#FEE2E2', color: '#991B1B', label: 'Absent' },
    Present: { bg: '#DEF7EC', color: '#03543F', label: 'Present' },
  }

  return (
    <AppShell>
      <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Header & Quick Action */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#172B3A', margin: 0 }}>My Attendance</h1>
            <p style={{ fontSize: 14, color: '#526B7A', margin: '4px 0 0' }}>
              Check-in, track daily work hours, and review monthly punctuality
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            {!isCheckedIn ? (
              <button
                onClick={handleCheckIn}
                disabled={actionLoading}
                style={{
                  background: '#22c55e', color: '#FFFFFF', border: 'none', borderRadius: 8,
                  padding: '10px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(34, 197, 94, 0.2)'
                }}
              >
                {actionLoading ? 'Checking in...' : '🕒 Check In Now'}
              </button>
            ) : !isCheckedOut ? (
              <button
                onClick={handleCheckOut}
                disabled={actionLoading}
                style={{
                  background: '#ef4444', color: '#FFFFFF', border: 'none', borderRadius: 8,
                  padding: '10px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)'
                }}
              >
                {actionLoading ? 'Checking out...' : '🚪 Check Out'}
              </button>
            ) : (
              <div style={{ background: '#F3F4F6', color: '#4B5563', padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                ✓ Completed for today
              </div>
            )}
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{ background: '#FFF5F5', border: '1px solid #FED7D7', color: '#C53030', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: '#F0FFF4', border: '1px solid #C6F6D5', color: '#276749', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
            {success}
          </div>
        )}

        {/* Summary Metric Cards */}
        {summary && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
            <div style={{ background: '#FFFFFF', border: '1px solid #D7E6EF', borderRadius: 12, padding: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#03543F' }}>ON-TIME DAYS</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#03543F', marginTop: 6 }}>
                {summary.on_time_count || 0}
              </div>
            </div>
            <div style={{ background: '#FFFFFF', border: '1px solid #D7E6EF', borderRadius: 12, padding: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#713F12' }}>LATE DAYS</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#713F12', marginTop: 6 }}>
                {summary.late_count || 0}
                {summary.avg_late_minutes ? <span style={{ fontSize: 12, fontWeight: 400, color: '#A16207', marginLeft: 6 }}>avg {summary.avg_late_minutes}m</span> : null}
              </div>
            </div>
            <div style={{ background: '#FFFFFF', border: '1px solid #D7E6EF', borderRadius: 12, padding: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1E429F' }}>EARLY DAYS</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#1E429F', marginTop: 6 }}>
                {summary.early_count || 0}
              </div>
            </div>
            <div style={{ background: '#FFFFFF', border: '1px solid #D7E6EF', borderRadius: 12, padding: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#526B7A' }}>AVG WORKING HOURS</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#172B3A', marginTop: 6 }}>
                {summary.avg_working_hours ? `${summary.avg_working_hours} hrs` : '—'}
              </div>
            </div>
          </div>
        )}

        {/* Filters + Table */}
        <div style={{ background: '#FFFFFF', border: '1px solid #D7E6EF', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#172B3A', margin: 0, flex: 1 }}>Attendance Logs</h2>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              style={{ border: '1px solid #CBD5E0', borderRadius: 6, padding: '6px 10px', fontSize: 13 }}
            />
            <span style={{ color: '#718096' }}>—</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              style={{ border: '1px solid #CBD5E0', borderRadius: 6, padding: '6px 10px', fontSize: 13 }}
            />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ border: '1px solid #CBD5E0', borderRadius: 6, padding: '7px 12px', fontSize: 13, background: '#FFFFFF' }}
            >
              <option value="All">All Statuses</option>
              <option value="ON_TIME">On Time</option>
              <option value="LATE">Late</option>
              <option value="EARLY">Early</option>
              <option value="HALF_DAY">Half Day</option>
              <option value="ABSENT">Absent</option>
            </select>
          </div>

          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div style={{ padding: 36, textAlign: 'center', color: '#526B7A' }}>Loading attendance records...</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 36, textAlign: 'center', color: '#526B7A' }}>No attendance records found.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontSize: 13, color: '#4A5568' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Date</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Check In</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Check Out</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Duration</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Punctuality</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => {
                    const punctKey = row.punctuality_status || 'ON_TIME'
                    const badge = punctualityStyles[punctKey] || punctualityStyles.ON_TIME
                    const dateFormatted = row.work_date?.split('T')[0] || row.work_date

                    const formatTime = (ts) => {
                      if (!ts) return '—'
                      try {
                        return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      } catch {
                        return ts
                      }
                    }

                    const hoursDisplay = row.working_minutes
                      ? `${Math.floor(row.working_minutes / 60)}h ${row.working_minutes % 60}m`
                      : row.metadata?.total_hours ? `${row.metadata.total_hours} hrs` : '—'

                    return (
                      <tr key={row.id} style={{ borderBottom: '1px solid #EDF2F7', fontSize: 14 }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: '#172B3A' }}>{dateFormatted}</td>
                        <td style={{ padding: '12px 16px', color: '#03543F', fontWeight: 500 }}>{formatTime(row.check_in_time)}</td>
                        <td style={{ padding: '12px 16px', color: '#991B1B', fontWeight: 500 }}>{formatTime(row.check_out_time)}</td>
                        <td style={{ padding: '12px 16px', color: '#4A5568' }}>{hoursDisplay}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            background: badge.bg, color: badge.color,
                            padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4
                          }}>
                            {badge.label}
                            {row.late_by_minutes > 0 ? ` (+${row.late_by_minutes}m)` : ''}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
