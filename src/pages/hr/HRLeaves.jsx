import React, { useState, useEffect } from 'react'
import AppShell from '../../components/layout/AppShell'
import api from '../../services/api'

export default function HRLeaves() {
  const [leaves, setLeaves] = useState([])
  const [leaveTypes, setLeaveTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [status, setStatus] = useState('')
  const [leaveTypeId, setLeaveTypeId] = useState('')
  const [personName, setPersonName] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const fetchLeaves = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (status) params.append('status', status)
      if (leaveTypeId) params.append('leave_type_id', leaveTypeId)
      if (personName) params.append('person_name', personName)
      if (fromDate) params.append('from', fromDate)
      if (toDate) params.append('to', toDate)

      const res = await api.get(`/leaves/hr?${params.toString()}`)
      setLeaves(res.data?.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load leaves for HR')
    } finally {
      setLoading(false)
    }
  }

  const fetchLeaveTypes = async () => {
    try {
      const res = await api.get('/leaves/types')
      setLeaveTypes(res.data?.data || [])
    } catch (err) {
      console.error('Failed to load leave types:', err)
    }
  }

  useEffect(() => {
    fetchLeaveTypes()
  }, [])

  useEffect(() => {
    fetchLeaves()
  }, [status, leaveTypeId, personName, fromDate, toDate])

  const statusBadges = {
    Pending: { bg: '#FEFCBF', color: '#B7791F', border: '#FAF089' },
    Approved: { bg: '#C6F6D5', color: '#22543D', border: '#9AE6B4' },
    Rejected: { bg: '#FED7D7', color: '#742A2A', border: '#FEB2B2' },
    Cancelled: { bg: '#E2E8F0', color: '#4A5568', border: '#CBD5E0' },
  }

  return (
    <AppShell>
      <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Title */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#172B3A', margin: 0 }}>
            HR Leave Overview
          </h1>
          <p style={{ fontSize: 14, color: '#526B7A', margin: '4px 0 0' }}>
            Organisation-wide leave visibility and records (employee personal reasons are kept confidential)
          </p>
        </div>

        {error && (
          <div style={{ background: '#FFF5F5', border: '1px solid #FED7D7', color: '#C53030', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
            {error}
          </div>
        )}

        {/* Filter Bar */}
        <div style={{ background: '#FFFFFF', border: '1px solid #D7E6EF', borderRadius: 12, padding: 16, marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search employee name..."
            value={personName}
            onChange={e => setPersonName(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #CBD5E0', borderRadius: 6, fontSize: 14, minWidth: 200 }}
          />

          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #CBD5E0', borderRadius: 6, fontSize: 14, background: '#FFFFFF' }}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={leaveTypeId}
            onChange={e => setLeaveTypeId(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #CBD5E0', borderRadius: 6, fontSize: 14, background: '#FFFFFF' }}
          >
            <option value="">All Leave Types</option>
            {leaveTypes.map(lt => (
              <option key={lt.id} value={lt.id}>{lt.name}</option>
            ))}
          </select>

          <input
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #CBD5E0', borderRadius: 6, fontSize: 14 }}
          />
          <span style={{ color: '#718096', fontSize: 13 }}>to</span>
          <input
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #CBD5E0', borderRadius: 6, fontSize: 14 }}
          />

          <div style={{ flex: 1 }} />
          <button
            onClick={() => {
              setStatus('')
              setLeaveTypeId('')
              setPersonName('')
              setFromDate('')
              setToDate('')
            }}
            style={{ background: '#EDF2F7', border: 'none', borderRadius: 6, padding: '8px 14px', fontSize: 13, cursor: 'pointer', color: '#4A5568' }}
          >
            Reset
          </button>
        </div>

        {/* Table */}
        <div style={{ background: '#FFFFFF', border: '1px solid #D7E6EF', borderRadius: 12, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#526B7A', fontSize: 14 }}>
              Loading leaves...
            </div>
          ) : leaves.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#526B7A', fontSize: 14 }}>
              No leave records found matching your filters.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #D7E6EF', fontSize: 13, color: '#526B7A' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Employee</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Leave Type</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Start Date</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>End Date</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Duration</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Reviewer Remark</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map(item => {
                  const badge = statusBadges[item.status] || statusBadges.Pending
                  const start = new Date(item.start_date)
                  const end = new Date(item.end_date)
                  const days = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1

                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #EDF2F7', fontSize: 14, color: '#172B3A' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 600 }}>{item.first_name} {item.last_name}</div>
                        <div style={{ fontSize: 12, color: '#718096' }}>{item.email}</div>
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 500 }}>{item.leave_type_name}</td>
                      <td style={{ padding: '14px 18px', color: '#4A5568' }}>{new Date(item.start_date).toLocaleDateString()}</td>
                      <td style={{ padding: '14px 18px', color: '#4A5568' }}>{new Date(item.end_date).toLocaleDateString()}</td>
                      <td style={{ padding: '14px 18px', fontWeight: 600 }}>{days} {days === 1 ? 'day' : 'days'}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
                          padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600
                        }}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#718096', fontSize: 13 }}>
                        {item.reviewer_remark || '—'}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#718096', fontSize: 13 }}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppShell>
  )
}
