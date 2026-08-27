import React, { useState, useEffect } from 'react'
import AppShell from '../../components/layout/AppShell.jsx'
import api from '../../services/api.js'

export default function Reports() {
  // Office settings
  const [reportingTime, setReportingTime] = useState('09:30')
  const [timezone, setTimezone] = useState('Asia/Kolkata')
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsMsg, setSettingsMsg] = useState('')

  // Daily report
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [dailyData, setDailyData] = useState(null)
  const [loadingDaily, setLoadingDaily] = useState(true)

  // Range report
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [rangeData, setRangeData] = useState([])
  const [loadingRange, setLoadingRange] = useState(false)

  const [activeTab, setActiveTab] = useState('daily') // 'daily' | 'range' | 'settings'
  const [error, setError] = useState('')

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings/reporting-time')
      if (res.data?.data) {
        setReportingTime(res.data.data.reporting_time || '09:30')
        setTimezone(res.data.data.timezone || 'Asia/Kolkata')
      }
    } catch (err) {
      console.error('Failed to load reporting settings:', err)
    }
  }

  const saveSettings = async (e) => {
    e.preventDefault()
    setSavingSettings(true)
    setSettingsMsg('')
    setError('')
    try {
      await api.put('/settings/reporting-time', { reporting_time: reportingTime, timezone })
      setSettingsMsg('Reporting schedule updated successfully!')
      setTimeout(() => setSettingsMsg(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update reporting schedule')
    } finally {
      setSavingSettings(false)
    }
  }

  const fetchDailyReport = async () => {
    setLoadingDaily(true)
    setError('')
    try {
      const res = await api.get(`/attendance/reports/daily?date=${selectedDate}`)
      setDailyData(res.data?.data || null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch daily report')
    } finally {
      setLoadingDaily(false)
    }
  }

  const fetchRangeReport = async () => {
    setLoadingRange(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (fromDate) params.append('from', fromDate)
      if (toDate) params.append('to', toDate)
      const res = await api.get(`/attendance/reports/range?${params.toString()}`)
      setRangeData(res.data?.data?.records || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch range report')
    } finally {
      setLoadingRange(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  useEffect(() => {
    if (activeTab === 'daily') fetchDailyReport()
  }, [selectedDate, activeTab])

  useEffect(() => {
    if (activeTab === 'range') fetchRangeReport()
  }, [activeTab])

  const punctualityStyles = {
    ON_TIME: { bg: '#DEF7EC', color: '#03543F', label: 'On Time' },
    LATE: { bg: '#FEF08A', color: '#713F12', label: 'Late' },
    EARLY: { bg: '#E1EFFE', color: '#1E429F', label: 'Early' },
    HALF_DAY: { bg: '#FDE8E8', color: '#9B1C1C', label: 'Half Day' },
    ABSENT: { bg: '#FEE2E2', color: '#991B1B', label: 'Absent' },
  }

  return (
    <AppShell>
      <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#172B3A', margin: 0 }}>
            Attendance & Punctuality Reports
          </h1>
          <p style={{ fontSize: 14, color: '#526B7A', margin: '4px 0 0' }}>
            Daily summaries, employee punctuality analytics, and official reporting schedules
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid #D7E6EF', marginBottom: 24 }}>
          {[
            { id: 'daily', label: 'Daily Status Report' },
            { id: 'range', label: 'Period Performance Analytics' },
            { id: 'settings', label: 'Reporting Schedule Settings' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none', border: 'none', padding: '10px 18px', fontSize: 14,
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? '#517891' : '#526B7A',
                borderBottom: activeTab === tab.id ? '2px solid #517891' : '2px solid transparent',
                cursor: 'pointer', marginBottom: -1,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ background: '#FFF5F5', border: '1px solid #FED7D7', color: '#C53030', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
            {error}
          </div>
        )}

        {/* TAB 1: DAILY REPORT */}
        {activeTab === 'daily' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#172B3A' }}>Select Date:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  style={{ padding: '8px 12px', border: '1px solid #CBD5E0', borderRadius: 6, fontSize: 14 }}
                />
              </div>
            </div>

            {/* Summary Cards */}
            {dailyData?.summary && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
                <div style={{ background: '#FFFFFF', border: '1px solid #D7E6EF', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#526B7A' }}>TOTAL HEADCOUNT</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#172B3A', marginTop: 4 }}>{dailyData.summary.total_employees}</div>
                </div>
                <div style={{ background: '#FFFFFF', border: '1px solid #D7E6EF', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#03543F' }}>ON TIME</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#03543F', marginTop: 4 }}>{dailyData.summary.on_time}</div>
                </div>
                <div style={{ background: '#FFFFFF', border: '1px solid #D7E6EF', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#713F12' }}>LATE</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#713F12', marginTop: 4 }}>{dailyData.summary.late}</div>
                </div>
                <div style={{ background: '#FFFFFF', border: '1px solid #D7E6EF', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1E429F' }}>EARLY</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#1E429F', marginTop: 4 }}>{dailyData.summary.early}</div>
                </div>
                <div style={{ background: '#FFFFFF', border: '1px solid #D7E6EF', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#991B1B' }}>ABSENT</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#991B1B', marginTop: 4 }}>{dailyData.summary.absent}</div>
                </div>
              </div>
            )}

            {/* Daily Records Table */}
            <div style={{ background: '#FFFFFF', border: '1px solid #D7E6EF', borderRadius: 12, overflow: 'hidden' }}>
              {loadingDaily ? (
                <div style={{ padding: 48, textAlign: 'center', color: '#526B7A' }}>Loading daily records...</div>
              ) : !dailyData?.records?.length ? (
                <div style={{ padding: 48, textAlign: 'center', color: '#526B7A' }}>No records found for this date.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #D7E6EF', fontSize: 13, color: '#526B7A' }}>
                      <th style={{ padding: '14px 18px', fontWeight: 600 }}>Employee</th>
                      <th style={{ padding: '14px 18px', fontWeight: 600 }}>Position</th>
                      <th style={{ padding: '14px 18px', fontWeight: 600 }}>Check In</th>
                      <th style={{ padding: '14px 18px', fontWeight: 600 }}>Check Out</th>
                      <th style={{ padding: '14px 18px', fontWeight: 600 }}>Work Hours</th>
                      <th style={{ padding: '14px 18px', fontWeight: 600 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyData.records.map(row => {
                      const badge = punctualityStyles[row.final_status] || punctualityStyles.ABSENT
                      const formatTime = ts => ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'

                      return (
                        <tr key={row.person_id} style={{ borderBottom: '1px solid #EDF2F7', fontSize: 14 }}>
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ fontWeight: 600, color: '#172B3A' }}>{row.first_name} {row.last_name}</div>
                            <div style={{ fontSize: 12, color: '#718096' }}>{row.email}</div>
                          </td>
                          <td style={{ padding: '14px 18px', color: '#526B7A' }}>{row.position_title || '—'}</td>
                          <td style={{ padding: '14px 18px', color: '#03543F', fontWeight: 500 }}>{formatTime(row.check_in_time)}</td>
                          <td style={{ padding: '14px 18px', color: '#991B1B', fontWeight: 500 }}>{formatTime(row.check_out_time)}</td>
                          <td style={{ padding: '14px 18px', color: '#4A5568' }}>
                            {row.working_minutes ? `${(row.working_minutes / 60).toFixed(1)} hrs` : '—'}
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <span style={{
                              background: badge.bg, color: badge.color,
                              padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600
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
        )}

        {/* TAB 2: RANGE REPORT */}
        {activeTab === 'range' && (
          <div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid #CBD5E0', borderRadius: 6, fontSize: 14 }}
              />
              <span style={{ color: '#718096' }}>to</span>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid #CBD5E0', borderRadius: 6, fontSize: 14 }}
              />
              <button
                onClick={fetchRangeReport}
                style={{ background: '#517891', color: '#FFFFFF', border: 'none', borderRadius: 6, padding: '9px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
                Apply Range Filter
              </button>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #D7E6EF', borderRadius: 12, overflow: 'hidden' }}>
              {loadingRange ? (
                <div style={{ padding: 48, textAlign: 'center', color: '#526B7A' }}>Loading analytics...</div>
              ) : rangeData.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center', color: '#526B7A' }}>No attendance activity in this date range.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #D7E6EF', fontSize: 13, color: '#526B7A' }}>
                      <th style={{ padding: '14px 18px', fontWeight: 600 }}>Employee</th>
                      <th style={{ padding: '14px 18px', fontWeight: 600 }}>Total Days</th>
                      <th style={{ padding: '14px 18px', fontWeight: 600 }}>On Time</th>
                      <th style={{ padding: '14px 18px', fontWeight: 600 }}>Late</th>
                      <th style={{ padding: '14px 18px', fontWeight: 600 }}>Early</th>
                      <th style={{ padding: '14px 18px', fontWeight: 600 }}>Avg Late Mins</th>
                      <th style={{ padding: '14px 18px', fontWeight: 600 }}>Avg Daily Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rangeData.map(r => (
                      <tr key={r.person_id} style={{ borderBottom: '1px solid #EDF2F7', fontSize: 14 }}>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ fontWeight: 600, color: '#172B3A' }}>{r.first_name} {r.last_name}</div>
                          <div style={{ fontSize: 12, color: '#718096' }}>{r.email}</div>
                        </td>
                        <td style={{ padding: '14px 18px', fontWeight: 600 }}>{r.total_days}</td>
                        <td style={{ padding: '14px 18px', color: '#03543F', fontWeight: 600 }}>{r.on_time}</td>
                        <td style={{ padding: '14px 18px', color: '#713F12', fontWeight: 600 }}>{r.late}</td>
                        <td style={{ padding: '14px 18px', color: '#1E429F', fontWeight: 600 }}>{r.early}</td>
                        <td style={{ padding: '14px 18px', color: '#718096' }}>{r.avg_late_minutes ? `${r.avg_late_minutes}m` : '—'}</td>
                        <td style={{ padding: '14px 18px', color: '#172B3A', fontWeight: 600 }}>{r.avg_working_hours ? `${r.avg_working_hours} hrs` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: REPORTING TIME SETTINGS */}
        {activeTab === 'settings' && (
          <div style={{ maxWidth: 600, background: '#FFFFFF', border: '1px solid #D7E6EF', borderRadius: 12, padding: 28 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#172B3A' }}>
              Office Reporting Time Configuration
            </h3>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: '#526B7A' }}>
              Check-in punctuality (On-Time / Late / Early) is automatically computed against this threshold. Check-ins &gt;15 mins after this time are marked <strong>LATE</strong>.
            </p>

            {settingsMsg && (
              <div style={{ background: '#d1fae5', border: '1px solid #86efac', color: '#15803d', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
                {settingsMsg}
              </div>
            )}

            <form onSubmit={saveSettings}>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A5568', marginBottom: 6 }}>
                  Default Reporting Time (24h HH:MM)
                </label>
                <input
                  type="time"
                  required
                  value={reportingTime}
                  onChange={e => setReportingTime(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E0', borderRadius: 6, fontSize: 16, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A5568', marginBottom: 6 }}>
                  Office Timezone
                </label>
                <select
                  value={timezone}
                  onChange={e => setTimezone(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E0', borderRadius: 6, fontSize: 14, background: '#FFFFFF' }}
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                  <option value="UTC">UTC (+0:00)</option>
                  <option value="America/New_York">America/New_York (EST/EDT)</option>
                  <option value="Europe/London">Europe/London (GMT/BST)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST +4:00)</option>
                  <option value="Asia/Singapore">Asia/Singapore (SGT +8:00)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                style={{
                  background: '#517891', color: '#FFFFFF', border: 'none', borderRadius: 8,
                  padding: '11px 24px', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(81, 120, 145, 0.2)'
                }}
              >
                {savingSettings ? 'Saving Settings...' : 'Save Reporting Schedule'}
              </button>
            </form>
          </div>
        )}
      </div>
    </AppShell>
  )
}
