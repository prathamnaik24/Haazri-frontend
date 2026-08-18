import React, { useState, useEffect } from 'react'
import AppShell from '../../components/layout/AppShell.jsx'
import { card, cardTitle, table, th, td } from '../../components/ui/styles.js'
import { RolesIcon, PlusIcon } from '../../components/ui/Icons.jsx'
import api from '../../services/api.js'

export default function RolesPermissions() {
  const [roles, setRoles] = useState([])
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)

  // Temporarily use mock data until backend is fully wired
  useEffect(() => {
    // We will replace this with an API call: api.get('/roles')
    setTimeout(() => {
      setPermissions([
        { id: 1, name: 'manage_org', description: 'Can manage organization settings' },
        { id: 2, name: 'manage_roles', description: 'Can create and assign roles' },
        { id: 3, name: 'manage_employees', description: 'Can create, update, deactivate employees' },
        { id: 4, name: 'view_attendance', description: 'Can view attendance records' },
        { id: 5, name: 'manage_attendance', description: 'Can edit and correct attendance records' },
        { id: 6, name: 'approve_leaves', description: 'Can approve or reject leave requests' },
        { id: 7, name: 'view_payroll', description: 'Can view payroll data' }
      ])
      
      setRoles([
        { id: 1, name: 'Org Admin', permissions: ['manage_org', 'manage_roles', 'manage_employees', 'view_attendance', 'manage_attendance', 'approve_leaves', 'view_payroll'] },
        { id: 2, name: 'HR Manager', permissions: ['manage_employees', 'view_attendance', 'approve_leaves'] },
        { id: 3, name: 'Employee', permissions: ['view_attendance'] }
      ])
      
      setLoading(false)
    }, 500)
  }, [])

  const hasPermission = (role, permName) => role.permissions.includes(permName)

  return (
    <AppShell>
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#172B3A', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <RolesIcon size={24} color="#1677B8" /> Roles & Permissions
            </h1>
            <p style={{ fontSize: 14, color: '#526B7A', margin: '4px 0 0' }}>Define roles and manage access levels across the organization.</p>
          </div>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
            background: '#1677B8', color: '#fff', border: 'none', borderRadius: 8,
            fontSize: 14, fontWeight: 600, cursor: 'pointer'
          }}>
            <PlusIcon size={16} /> New Role
          </button>
        </div>

        {/* Permissions Matrix */}
        <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#526B7A' }}>Loading...</div>
          ) : (
            <table style={table}>
              <thead>
                <tr style={{ background: '#F7FAFC' }}>
                  <th style={{ ...th, width: 250 }}>Permission</th>
                  {roles.map(role => (
                    <th key={role.id} style={{ ...th, textAlign: 'center' }}>{role.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissions.map(perm => (
                  <tr key={perm.id} style={{ borderBottom: '1px solid #EDF3F6' }}>
                    <td style={{ ...td }}>
                      <div style={{ fontWeight: 600, color: '#172B3A', fontSize: 13 }}>{perm.name}</div>
                      <div style={{ color: '#8AA0AD', fontSize: 12, marginTop: 2 }}>{perm.description}</div>
                    </td>
                    {roles.map(role => {
                      const active = hasPermission(role, perm.name)
                      return (
                        <td key={role.id} style={{ ...td, textAlign: 'center' }}>
                          <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
                            <input 
                              type="checkbox" 
                              checked={active} 
                              readOnly 
                              style={{ width: 16, height: 16, accentColor: '#1677B8' }}
                            />
                          </label>
                        </td>
                      )
                    })}
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
