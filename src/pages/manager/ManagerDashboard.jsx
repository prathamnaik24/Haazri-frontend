import { useState, useEffect } from 'react'
import AppShell from '../../components/layout/AppShell.jsx'
import { Avatar, avatarColor } from '../../components/ui/Avatar.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { card, cardTitle } from '../../components/ui/styles.js'
import api from '../../services/api.js'
import { getUserFromToken } from '../../utils/auth.js'

// ─── Check In Widget (For Manager Attendance Self-Service) ─────────────────────────
function CheckInWidget({ user }) {
  const [checkedIn, setCheckedIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [time, setTime] = useState('')
  const [elapsed, setElapsed] = useState('00:00:00')
  const [startTime, setStartTime] = useState(null)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get('/attendance/me?limit=1')
        const logs = res.data.data.history
        if (logs.length > 0) {
          const lastLog = logs[0]
          const todayStr = new Date().toISOString().split('T')[0]
          const logDateStr = new Date(lastLog.work_date).toISOString().split('T')[0]
          if (logDateStr === todayStr && !lastLog.check_out_time) {
            setCheckedIn(true)
            setStartTime(new Date(lastLog.check_in_time))
          }
        }
      } catch (err) {
        console.error('Failed to fetch check-in status:', err)
      }
    }
    fetchStatus()
  }, [])

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
    } catch (err) {
      alert(err.response?.data?.message || 'Check-in failed')
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
    } catch (err) {
      alert(err.response?.data?.message || 'Check-out failed')
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
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#172B3A', margin: 0 }}>{greeting}, {firstName} 👋</h2>
        <p style={{ fontSize: 12, color: '#526B7A', margin: '4px 0 0' }}>
          {now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
      <div style={{ textAlign: 'center', padding: '12px 0' }}>
        <div style={{ fontSize: 40, fontWeight: 700, color: '#172B3A', letterSpacing: '-0.03em' }}>{time}</div>
        {checkedIn && (
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>
            Working time: <span style={{ fontWeight: 600, color: '#1677B8' }}>{elapsed}</span>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: checkedIn ? '#22c55e' : '#526B7A' }} />
          <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>
            {checkedIn ? 'Checked In' : 'Not checked in'}
          </span>
        </div>
        <button
          disabled={loading}
          onClick={checkedIn ? handleCheckOut : handleCheckIn}
          style={{
            padding: '8px 24px', borderRadius: 8, border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            background: checkedIn ? '#FEE2E2' : '#1677B8',
            color: checkedIn ? '#dc2626' : '#ffffff',
            fontSize: 13, fontWeight: 600,
          }}
        >
          {loading ? '...' : checkedIn ? 'Check Out' : 'Check In'}
        </button>
      </div>
    </div>
  )
}

export default function ManagerDashboard() {
  const user = getUserFromToken()
  const [loading, setLoading] = useState(true)
  const [pendingLeaves, setPendingLeaves] = useState([])
  const [todayTeam, setTodayTeam] = useState([])
  const [stats, setStats] = useState({
    teamMembers: 0,
    presentToday: 0,
    onLeaveToday: 0,
    pendingLeavesCount: 0,
  })

  const loadDashboardData = async () => {
    try {
      const leavesRes = await api.get('/leaves/team/pending')
      const attRes = await api.get('/attendance/team?limit=100')

      const pending = leavesRes.data.data.map(req => {
        const days = Math.round((new Date(req.end_date) - new Date(req.start_date)) / (1000 * 60 * 60 * 24)) + 1
        return {
          id: req.id,
          name: `${req.employee.first_name || ''} ${req.employee.last_name || ''}`.trim(),
          type: req.leave_type.name,
          from: new Date(req.start_date).toLocaleDateString(),
          to: new Date(req.end_date).toLocaleDateString(),
          days,
          balance: 15,
          status: req.status,
          reason: req.reason || 'No reason'
        }
      })

      const teamHist = attRes.data.data.team_history
      const todayStr = new Date().toISOString().split('T')[0]
      const todayLogs = teamHist.filter(x => new Date(x.work_date).toISOString().split('T')[0] === todayStr)

      const formattedTodayTeam = todayLogs.map(log => {
        const checkIn = log.check_in_time ? new Date(log.check_in_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'
        const checkOut = log.check_out_time ? new Date(log.check_out_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'
        return {
          name: `${log.employee.first_name || ''} ${log.employee.last_name || ''}`.trim(),
          position: log.employee.position?.title || 'Team Member',
          checkIn,
          checkOut,
          status: log.status,
        }
      })

      const uniqueEmpIds = new Set(teamHist.map(x => x.employee.id))
      const presentCount = todayLogs.filter(x => x.status === 'Present').length
      const onLeaveCount = todayLogs.filter(x => x.status === 'On Leave').length

      setPendingLeaves(pending)
      setTodayTeam(formattedTodayTeam)
      setStats({
        teamMembers: uniqueEmpIds.size || 0,
        presentToday: presentCount,
        onLeaveToday: onLeaveCount,
        pendingLeavesCount: pending.length,
      })
    } catch (err) {
      console.error('Failed to load manager dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const handleAction = async (id, action) => {
    const backendAction = action === 'approve' ? 'Approved' : 'Rejected'
    try {
      await api.patch(`/leaves/request/${id}/action`, { action: backendAction })
      loadDashboardData()
    } catch (err) {
      console.error('Failed to action leave request:', err)
      alert('Failed to update leave request.')
    }
  }

  const teamStatsList = [
    { label: 'Team Members', value: stats.teamMembers, color: '#1677B8', bg: '#EAF6FF' },
    { label: 'Present Today', value: stats.presentToday,  color: '#22c55e', bg: '#d1fae5' },
    { label: 'On Leave',      value: stats.onLeaveToday,  color: '#f59e0b', bg: '#fef3c7' },
    { label: 'Pending Leaves',value: stats.pendingLeavesCount, color: '#ef4444', bg: '#fee2e2' },
  ]

  return (
    <AppShell>
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#172B3A', margin: 0 }}>Manager Dashboard</h1>

        {/* Top row: Check-in + Summary Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 20 }}>
          <CheckInWidget user={user} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {teamStatsList.map(s => (
              <div key={s.label} style={{ ...card, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.value}</span>
                  </div>
                  <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{s.label}</span>
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#172B3A', letterSpacing: '-0.03em' }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Pending Leave Requests */}
          <div style={card}>
            <h2 style={{ ...cardTitle, margin: '0 0 16px' }}>Pending Leave Requests</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {loading ? (
                <div style={{ fontSize: 13, color: '#6b7280' }}>Loading requests...</div>
              ) : pendingLeaves.length === 0 ? (
                <div style={{ fontSize: 13, color: '#9ca3af', padding: '12px 0' }}>No pending leave requests.</div>
              ) : (
                pendingLeaves.map((req, i) => (
                  <div key={req.id} style={{ background: '#f9fafb', borderRadius: 10, padding: '12px 14px', border: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar name={req.name} size={30} bgColor={avatarColor(i)} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#172B3A' }}>{req.name}</span>
                      </div>
                      <Badge status={req.status} />
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                      {req.type} · {req.from} → {req.to} ({req.days}d)
                    </div>
                    <div style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic', marginBottom: 8 }}>
                      Reason: "{req.reason}"
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button 
                        onClick={() => handleAction(req.id, 'approve')}
                        style={{ flex: 1, padding: '6px 0', borderRadius: 6, border: 'none', background: '#d1fae5', color: '#15803d', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        ✓ Approve
                      </button>
                      <button 
                        onClick={() => handleAction(req.id, 'reject')}
                        style={{ flex: 1, padding: '6px 0', borderRadius: 6, border: 'none', background: '#fee2e2', color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Today's Team Attendance */}
          <div style={card}>
            <h2 style={{ ...cardTitle, margin: '0 0 16px' }}>Today's Team Attendance</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {loading ? (
                <div style={{ fontSize: 13, color: '#6b7280' }}>Loading attendance...</div>
              ) : todayTeam.length === 0 ? (
                <div style={{ fontSize: 13, color: '#9ca3af', padding: '12px 0' }}>No team activity recorded today.</div>
              ) : (
                todayTeam.map((emp, i) => (
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
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
