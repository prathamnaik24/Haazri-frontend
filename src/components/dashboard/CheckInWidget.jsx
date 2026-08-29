import { useState, useEffect } from 'react'
import { card } from '../ui/styles.js'
import api from '../../services/api.js'
import { getUserFromToken } from '../../utils/auth.js'

export default function CheckInWidget() {
  const user = getUserFromToken()
  const [checkedIn, setCheckedIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [time, setTime] = useState('')
  const [elapsed, setElapsed] = useState('00:00:00')
  const [startTime, setStartTime] = useState(null)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get('/attendance/me?limit=1')
        const logs = res.data?.data?.history || []
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
            {checkedIn && (
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>
                Working time: <span style={{ fontWeight: 600, color: '#1677B8' }}>{elapsed}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: checkedIn ? '#22c55e' : '#526B7A' }} />
              <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>
                {checkedIn ? 'Checked In' : 'Not checked in'}
              </span>
            </div>
            <button
              disabled={loading}
              onClick={checkedIn ? handleCheckOut : handleCheckIn}
              style={{
                padding: '10px 26px', borderRadius: 8, border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                background: checkedIn ? '#FEE2E2' : '#1677B8',
                color: checkedIn ? '#dc2626' : '#ffffff',
                fontSize: 14, fontWeight: 600,
                boxShadow: checkedIn ? 'none' : '0 2px 8px rgba(22,119,184,0.25)',
                transition: 'all 0.15s'
              }}
            >
              {loading ? '...' : checkedIn ? 'Check Out' : 'Check In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
