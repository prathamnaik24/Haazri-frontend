import React, { useState, useEffect } from 'react'
import AppShell from '../../components/layout/AppShell.jsx'
import { card, cardTitle, table, th, td } from '../../components/ui/styles.js'
import { AuditIcon, SearchIcon } from '../../components/ui/Icons.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import api from '../../services/api.js'

export default function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/audit')
      .then(res => {
        setLogs(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load audit logs:', err)
        setLoading(false)
      })
  }, [])

  return (
    <AppShell>
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#172B3A', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <AuditIcon size={24} color="#1677B8" /> Audit Logs
            </h1>
            <p style={{ fontSize: 14, color: '#526B7A', margin: '4px 0 0' }}>Track all system activity and changes.</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FFFFFF', border: '1px solid #D7E6EF', borderRadius: 8, padding: '8px 14px', width: 250 }}>
            <SearchIcon size={16} color="#8AA0AD" />
            <input placeholder="Search logs..." style={{ border: 'none', outline: 'none', fontSize: 14, width: '100%' }} />
          </div>
        </div>

        <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
          {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#526B7A' }}>Loading logs...</div> : (
            <table style={table}>
              <thead>
                <tr style={{ background: '#F7FAFC' }}>
                  <th style={th}>Date & Time</th>
                  <th style={th}>Action</th>
                  <th style={th}>Entity</th>
                  <th style={th}>User</th>
                  <th style={th}>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #EDF3F6' }}>
                    <td style={{ ...td, color: '#526B7A', fontSize: 13 }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td style={{ ...td }}>
                      <span style={{ 
                        fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                        background: log.action === 'DELETE' ? '#FEE2E2' : log.action === 'CREATE' ? '#DCFCE7' : '#E0F2FE',
                        color: log.action === 'DELETE' ? '#DC2626' : log.action === 'CREATE' ? '#16A34A' : '#0284C7'
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ ...td, fontWeight: 600, color: '#172B3A' }}>
                      {log.entity_type ? log.entity_type.toUpperCase() : ''}
                    </td>
                    <td style={{ ...td }}>
                      {log.first_name ? `${log.first_name} ${log.last_name}` : 'System'}
                    </td>
                    <td style={{ ...td, color: '#526B7A' }}>{log.reason || 'No description provided'}</td>
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
