import { useState, useEffect } from 'react'
import { card } from '../ui/styles.js'
import api from '../../services/api.js'
import { getUserFromToken } from '../../utils/auth.js'

export default function CheckInWidget() {
  const user = getUserFromToken()
  const [attendanceRecord, setAttendanceRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [time, setTime] = useState('')
  const [elapsed, setElapsed] = useState('00:00:00')

  const fetchStatus = async () => {
    setLoading(true)
    try {
      const res = await api.get('/attendance/me?limit=5')
      const logs = res.data?.data?.history || []
      const today = new Date()
      
      const todayLog = logs.find(log => {
        const checkInDate = log.check_in_time ? new Date(log.check_in_time) : null
        const workDate = log.work_date ? new Date(log.work_date) : null
        const targetDate = checkInDate || workDate
        if (!targetDate) return false

        return targetDate.getFullYear() === today.getFullYear() &&
               targetDate.getMonth() === today.getMonth() &&
               targetDate.getDate() === today.getDate()
      })
      setAttendanceRecord(todayLog || null)
    } catch (err) {
      console.error('Failed to fetch check-in status:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  // Live clock & working duration timer
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      
      if (attendanceRecord?.check_in_time && !attendanceRecord?.check_out_time) {
        const start = new Date(attendanceRecord.check_in_time)
        const diff = Math.max(0, Math.floor((now - start) / 1000))
        const h = String(Math.floor(diff / 3600)).padStart(2, '0')
        const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0')
        const s = String(diff % 60).padStart(2, '0')
        setElapsed(`${h}:${m}:${s}`)
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [attendanceRecord])

  const handleCheckIn = async () => {
    setActionLoading(true)
    try {
      await api.post('/attendance/check-in', {})
      await fetchStatus()
    } catch (err) {
      alert(err.response?.data?.message || 'Check-in failed')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCheckOut = async () => {
    setActionLoading(true)
    try {
      await api.post('/attendance/check-out', {})
      await fetchStatus()
    } catch (err) {
      alert(err.response?.data?.message || 'Check-out failed')
    } finally {
      setActionLoading(false)
    }
  }

  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.first_name || 'there'

  const isCheckedIn = !!attendanceRecord?.check_in_time
  const isCheckedOut = !!attendanceRecord?.check_out_time

  return (
    <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#172B3A', margin: 0 }}>{greeting}, {firstName} 👋</h2>
          <p style={{ fontSize: 13, color: '#526B7A', margin: '4px 0 0' }}>
            {now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#172B3A', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{time}</div>
            {isCheckedIn && !isCheckedOut && (
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>
                Working time: <span style={{ fontWeight: 600, color: '#1677B8' }}>{elapsed}</span>
              </div>
            )}
            {isCheckedOut && (
              <div style={{ fontSize: 12, color: '#059669', marginTop: 3, fontWeight: 600 }}>
                Shift Completed ({attendanceRecord.working_minutes ? `${Math.floor(attendanceRecord.working_minutes / 60)}h ${attendanceRecord.working_minutes % 60}m` : 'Done'})
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: isCheckedOut ? '#6b7280' : isCheckedIn ? '#22c55e' : '#f59e0b'
              }} />
              <span style={{ fontSize: 13, color: '#4b5563', fontWeight: 500 }}>
                {loading ? 'Checking status...' : isCheckedOut ? 'Checked Out' : isCheckedIn ? 'Checked In' : 'Not checked in'}
              </span>
            </div>

            {isCheckedOut ? (
              <div style={{
                padding: '10px 20px', borderRadius: 8, background: '#f3f4f6', color: '#4b5563',
                fontSize: 13, fontWeight: 600, border: '1px solid #e5e7eb'
              }}>
                ✓ Completed for today
              </div>
            ) : isCheckedIn ? (
              <button
                disabled={actionLoading}
                onClick={handleCheckOut}
                style={{
                  padding: '10px 26px', borderRadius: 8, border: 'none',
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: 14, fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.25)',
                  transition: 'all 0.15s'
                }}
              >
                {actionLoading ? 'Checking out...' : '🚪 Check Out'}
              </button>
            ) : (
              <button
                disabled={actionLoading}
                onClick={handleCheckIn}
                style={{
                  padding: '10px 26px', borderRadius: 8, border: 'none',
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  background: '#1677B8',
                  color: '#ffffff',
                  fontSize: 14, fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(22,119,184,0.25)',
                  transition: 'all 0.15s'
                }}
              >
                {actionLoading ? 'Checking in...' : '🕒 Check In'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
