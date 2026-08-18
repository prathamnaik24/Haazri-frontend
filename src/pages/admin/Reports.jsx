import React, { useState, useEffect } from 'react'
import AppShell from '../../components/layout/AppShell.jsx'
import { card, cardTitle, table, th, td } from '../../components/ui/styles.js'
import { ReportsIcon, SearchIcon } from '../../components/ui/Icons.jsx'

export default function Reports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  // Temporarily use mock data
  useEffect(() => {
    setTimeout(() => {
      setReports([
        { id: 1, type: 'Monthly Attendance', period: 'July 2026', generatedOn: '2026-08-01', status: 'Ready' },
        { id: 2, type: 'Payroll Estimates', period: 'July 2026', generatedOn: '2026-08-01', status: 'Ready' },
        { id: 3, type: 'Leave Summary', period: 'Q2 2026', generatedOn: '2026-07-05', status: 'Ready' },
        { id: 4, type: 'Monthly Attendance', period: 'August 2026', generatedOn: '—', status: 'Processing...' },
      ])
      setLoading(false)
    }, 500)
  }, [])

  return (
    <AppShell>
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#172B3A', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <ReportsIcon size={24} color="#1677B8" /> Reports & Analytics
            </h1>
            <p style={{ fontSize: 14, color: '#526B7A', margin: '4px 0 0' }}>Generate and download organization-wide reports.</p>
          </div>
          <button style={{
            padding: '10px 16px', background: '#1677B8', color: '#fff', border: 'none', borderRadius: 8,
            fontSize: 14, fontWeight: 600, cursor: 'pointer'
          }}>
            Generate New Report
          </button>
        </div>

        {/* Analytics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
          {[
            { label: 'Avg. Attendance Rate', value: '94.2%', color: '#1677B8' },
            { label: 'Active Employees', value: '142', color: '#517891' },
            { label: 'Leaves Pending', value: '12', color: '#f59e0b' },
          ].map(stat => (
            <div key={stat.label} style={{ ...card, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#526B7A', fontWeight: 600 }}>{stat.label}</span>
              <span style={{ fontSize: 32, fontWeight: 700, color: stat.color, letterSpacing: '-0.02em' }}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Reports Table */}
        <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #EDF3F6' }}>
            <h2 style={cardTitle}>Recent Reports</h2>
          </div>
          {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#526B7A' }}>Loading reports...</div> : (
            <table style={table}>
              <thead>
                <tr style={{ background: '#F7FAFC' }}>
                  <th style={th}>Report Type</th>
                  <th style={th}>Period</th>
                  <th style={th}>Generated On</th>
                  <th style={th}>Status</th>
                  <th style={{ ...th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report.id} style={{ borderBottom: '1px solid #EDF3F6' }}>
                    <td style={{ ...td, fontWeight: 600, color: '#172B3A' }}>{report.type}</td>
                    <td style={{ ...td }}>{report.period}</td>
                    <td style={{ ...td, color: '#526B7A' }}>{report.generatedOn}</td>
                    <td style={{ ...td }}>
                      <span style={{ 
                        fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                        background: report.status === 'Ready' ? '#DCFCE7' : '#FEF9C3',
                        color: report.status === 'Ready' ? '#16A34A' : '#CA8A04'
                      }}>
                        {report.status}
                      </span>
                    </td>
                    <td style={{ ...td, textAlign: 'right' }}>
                      <button 
                        disabled={report.status !== 'Ready'}
                        style={{
                          background: 'none', border: 'none', color: report.status === 'Ready' ? '#1677B8' : '#D1D5DB', 
                          fontWeight: 600, cursor: report.status === 'Ready' ? 'pointer' : 'not-allowed'
                        }}
                      >
                        Download CSV
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppShell>
  )
}
