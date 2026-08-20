import React, { useState, useEffect } from 'react'
import AppShell from '../../components/layout/AppShell.jsx'
import { Avatar, avatarColor } from '../../components/ui/Avatar.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { SearchIcon } from '../../components/ui/Icons.jsx'
import api from '../../services/api.js'

const depts = ['All', 'General', 'Engineering', 'Marketing', 'Sales', 'Design', 'Operations']

export default function AdminEmployees() {
  const [employees, setEmployees] = useState([])
  const [positionsList, setPositionsList] = useState([])
  const [rolesList, setRolesList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState('')
  const [inviteError, setInviteError] = useState('')
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', employee_id: '', department: '', position_id: '', role_id: '',
  })

  const fetchEmployees = () => {
    setLoading(true)
    Promise.all([
      api.get('/org/employees'),
      api.get('/admin/org-structure/positions').catch(() => ({ data: [] })),
      api.get('/admin/roles').catch(() => ({ data: { data: [] } })),
    ])
      .then(([empRes, posRes, rolesRes]) => {
        const formatted = (empRes.data?.data?.employees || []).map(emp => ({
          id: emp.id,
          name: `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
          email: emp.email,
          dept: emp.department || 'General',
          position: emp.primary_position ? emp.primary_position.title : 'No Position',
          position_id: emp.primary_position ? emp.primary_position.id : '',
          role: emp.role || 'Employee',
          role_id: emp.role_id || '',
          status: emp.is_active ? 'Active' : 'Inactive',
          employee_id: emp.employee_id || '—'
        }))
        setEmployees(formatted)
        setPositionsList(posRes.data || [])
        setRolesList(rolesRes.data?.data || rolesRes.data || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch employees:', err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  const filtered = employees.filter(emp => {
    const matchSearch = emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase())
    const matchDept = deptFilter === 'All' || emp.dept === deptFilter
    return matchSearch && matchDept
  })

  const [viewModal, setViewModal] = useState({ show: false, employee: null })
  const [editModal, setEditModal] = useState({ show: false, employee: null })
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', employee_id: '', position_id: '', role_id: '', is_active: true })
  const [updating, setUpdating] = useState(false)

  const openEditModal = (emp) => {
    const names = emp.name.split(' ')
    setEditForm({
      first_name: names[0] || '',
      last_name: names.slice(1).join(' ') || '',
      employee_id: emp.employee_id === '—' ? '' : emp.employee_id,
      position_id: emp.position_id || '',
      role_id: emp.role_id || '',
      is_active: emp.status === 'Active'
    })
    setEditModal({ show: true, employee: emp })
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setUpdating(true)
    try {
      await api.patch(`/org/employees/${editModal.employee.id}`, editForm)
      setEditModal({ show: false, employee: null })
      setInviteSuccess('Employee updated successfully!')
      setTimeout(() => setInviteSuccess(''), 4000)
      fetchEmployees()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update employee')
    } finally {
      setUpdating(false)
    }
  }

  const [inviteResult, setInviteResult] = useState(null) // { email, employee_id, invite_link }

  const handleInvite = async (e) => {
    e.preventDefault()
    setInviting(true)
    setInviteError('')
    try {
      const res = await api.post('/org/employees', form)
      const inviteData = res.data?.data?.invite || {}
      setInviteResult({
        email: form.email,
        employee_id: form.employee_id,
        invite_link: inviteData.invite_link
      })
      setShowModal(false)
      setForm({ first_name: '', last_name: '', email: '', employee_id: '', department: '', position_id: '', role_id: '' })
      fetchEmployees()
    } catch (err) {
      setInviteError(err.response?.data?.message || 'Failed to send invitation')
    } finally {
      setInviting(false)
    }
  }

  const handleResendInvite = async (employeeId) => {
    if (!window.confirm('Are you sure you want to resend the invitation? The previous link will be invalidated.')) return
    try {
      const res = await api.post(`/org/employees/${employeeId}/resend-invite`)
      const inviteData = res.data?.data?.invite || {}
      setInviteResult({
        email: employees.find(e => e.id === employeeId)?.email || 'Employee',
        invite_link: inviteData.invite_link
      })
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resend invitation')
    }
  }

  const formLabel = { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }
  const formInput = { width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#374151', outline: 'none', background: '#fff', boxSizing: 'border-box' }

  return (
    <AppShell>
      <div style={{ padding: '20px 24px' }}>
        {inviteSuccess && (
          <div style={{ background: '#d1fae5', border: '1px solid #86efac', color: '#15803d', padding: '12px 16px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
            {inviteSuccess}
          </div>
        )}

        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: '#172B3A', margin: 0, flex: 1 }}>Employees</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px' }}>
              <SearchIcon />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search employees..."
                style={{ border: 'none', outline: 'none', fontSize: 13, background: 'transparent', color: '#374151', width: 160 }} />
            </div>
            <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
              style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#374151', outline: 'none', cursor: 'pointer' }}>
              {depts.map(d => <option key={d}>{d}</option>)}
            </select>
            <button onClick={() => setShowModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1677B8', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              + Invite Employee
            </button>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Name', 'Employee ID', 'Email', 'Department', 'Position', 'Role', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '11px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#374151', borderBottom: '1px solid #f3f4f6' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '40px 20px', textAlign: 'center', color: '#6b7280', fontSize: 14 }}>
                      Loading employees...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '40px 20px', textAlign: 'center', color: '#6b7280', fontSize: 14 }}>
                      No employees found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((emp, i) => (
                    <tr key={emp.id}
                      style={{ borderBottom: '1px solid #f9fafb' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={emp.name} size={34} bgColor={avatarColor(i)} />
                          <span style={{ fontSize: 13, fontWeight: 500, color: '#172B3A', whiteSpace: 'nowrap' }}>{emp.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontSize: 12, background: '#EBF4FF', color: '#1677B8', padding: '3px 10px', borderRadius: 20, fontWeight: 600, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{emp.employee_id}</span>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: '#6b7280', whiteSpace: 'nowrap' }}>{emp.email}</td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: '#6b7280', whiteSpace: 'nowrap' }}>{emp.dept}</td>
                      <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          fontSize: 12,
                          padding: '3px 10px',
                          borderRadius: 20,
                          fontWeight: 500,
                          background: emp.position === 'No Position' ? '#FFFBEB' : '#F1F5F9',
                          color: emp.position === 'No Position' ? '#D97706' : '#334155',
                          border: `1px solid ${emp.position === 'No Position' ? '#FDE68A' : '#E2E8F0'}`
                        }}>
                          {emp.position}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: 12, background: '#EAF6FF', color: '#1677B8', padding: '3px 10px', borderRadius: 20, fontWeight: 600, whiteSpace: 'nowrap' }}>{emp.role}</span>
                      </td>
                      <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}><Badge status={emp.status} /></td>
                      <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => setViewModal({ show: true, employee: emp })} title="View" style={{ background: '#EAF6FF', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 12, color: '#1677B8', cursor: 'pointer', fontWeight: 500 }}>View</button>
                          <button onClick={() => openEditModal(emp)} title="Edit" style={{ background: '#f9fafb', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 12, color: '#6b7280', cursor: 'pointer', fontWeight: 500 }}>Edit</button>
                          <button onClick={() => handleResendInvite(emp.id)} title="Resend Invite" style={{ background: '#fef3c7', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 12, color: '#d97706', cursor: 'pointer', fontWeight: 500 }}>Resend</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invite Result Modal (Fallback Link) */}
        {inviteResult && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, backdropFilter: 'blur(2px)',
          }}>
            <div style={{ background: '#fff', borderRadius: 16, width: 500, maxWidth: '90vw', padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#d1fae5', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>✓</div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, color: '#172B3A' }}>Invitation Queued!</h3>
                  <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>An email is being sent to <strong>{inviteResult.email}</strong></p>
                </div>
              </div>
              
              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 20 }}>
                <p style={{ margin: '0 0 10px', fontSize: 13, color: '#4b5563', fontWeight: 500 }}>Manual Fallback Link</p>
                <p style={{ margin: '0 0 10px', fontSize: 12, color: '#6b7280' }}>If the email fails to arrive, you can securely share this link with the employee:</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input readOnly value={inviteResult.invite_link} style={{ ...formInput, fontFamily: 'monospace', fontSize: 12 }} />
                  <button onClick={() => navigator.clipboard.writeText(inviteResult.invite_link)} style={{ background: '#1677B8', color: '#fff', border: 'none', borderRadius: 6, padding: '0 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>Copy</button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setInviteResult(null)} style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, padding: '9px 24px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Done</button>
              </div>
            </div>
          </div>
        )}

        {/* Invite Employee Modal */}
        {showModal && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(2px)',
          }}
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}
          >
            <div style={{ background: '#fff', borderRadius: 16, width: 540, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
              <div style={{ background: '#f9fafb', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb' }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#172B3A', margin: 0 }}>Invite New Employee</h2>
                <button onClick={() => setShowModal(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ×
                </button>
              </div>
              <form onSubmit={handleInvite}>
                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {inviteError && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>{inviteError}</div>}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={formLabel}>First Name</label>
                      <input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                        placeholder="First name" style={formInput} required />
                    </div>
                    <div>
                      <label style={formLabel}>Last Name</label>
                      <input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                        placeholder="Last name" style={formInput} required />
                    </div>
                  </div>
                  <div>
                    <label style={formLabel}>Email Address</label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="employee@company.com" style={formInput} required />
                  </div>
                  <div>
                    <label style={formLabel}>Employee ID <span style={{ color: '#ef4444' }}>*</span></label>
                    <input value={form.employee_id} onChange={e => setForm(f => ({ ...f, employee_id: e.target.value }))}
                      placeholder="e.g. EMP-001, STU-2024-045, HR-012" style={{ ...formInput, fontFamily: 'monospace' }} required />
                    <p style={{ fontSize: 11, color: '#9ca3af', margin: '4px 0 0' }}>This ID is what the employee will use to log in. You assign and manage it.</p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={formLabel}>Department</label>
                      <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                        style={{ ...formInput, cursor: 'pointer' }}>
                        <option value="">General</option>
                        {depts.filter(d => d !== 'All').map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={formLabel}>Hierarchy Position</label>
                      <select
                        value={form.position_id}
                        onChange={e => setForm(f => ({ ...f, position_id: e.target.value }))}
                        style={{ ...formInput, cursor: 'pointer' }}
                      >
                        <option value="">None (Unassigned)</option>
                        {positionsList.map(pos => (
                          <option key={pos.id} value={pos.id}>
                            {pos.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={formLabel}>System Role (Permissions)</label>
                    <select
                      value={form.role_id}
                      onChange={e => setForm(f => ({ ...f, role_id: e.target.value }))}
                      style={{ ...formInput, cursor: 'pointer' }}
                    >
                      <option value="">Default (Employee)</option>
                      {rolesList.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ background: '#f0f9ff', borderRadius: 8, padding: '12px 14px', fontSize: 13, color: '#0369a1', border: '1px solid #bae6fd' }}>
                    ℹ️ An email invitation will be sent to the employee with a secure link to set up their account.
                  </div>
                </div>
                <div style={{ padding: '0 24px 24px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button type="button" onClick={() => setShowModal(false)}
                    style={{ padding: '9px 24px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={inviting}
                    style={{ padding: '9px 24px', borderRadius: 8, border: 'none', background: '#1677B8', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    {inviting ? 'Sending...' : 'Send Invitation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Employee Modal */}
        {editModal.show && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(2px)',
          }}
            onClick={e => { if (e.target === e.currentTarget) setEditModal({ show: false, employee: null }) }}
          >
            <div style={{ background: '#fff', borderRadius: 16, width: 540, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
              <div style={{ background: '#f9fafb', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb' }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#172B3A', margin: 0 }}>Edit Employee</h2>
                <button onClick={() => setEditModal({ show: false, employee: null })}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ×
                </button>
              </div>
              <form onSubmit={handleUpdate}>
                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={formLabel}>First Name</label>
                      <input value={editForm.first_name} onChange={e => setEditForm(f => ({ ...f, first_name: e.target.value }))}
                        placeholder="First name" style={formInput} required />
                    </div>
                    <div>
                      <label style={formLabel}>Last Name</label>
                      <input value={editForm.last_name} onChange={e => setEditForm(f => ({ ...f, last_name: e.target.value }))}
                        placeholder="Last name" style={formInput} required />
                    </div>
                  </div>
                  <div>
                    <label style={formLabel}>Employee ID</label>
                    <input value={editForm.employee_id} onChange={e => setEditForm(f => ({ ...f, employee_id: e.target.value }))}
                      placeholder="e.g. EMP-001" style={{ ...formInput, fontFamily: 'monospace' }} required />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={formLabel}>Assigned Position</label>
                      <select
                        value={editForm.position_id}
                        onChange={e => setEditForm(f => ({ ...f, position_id: e.target.value }))}
                        style={{ ...formInput, cursor: 'pointer' }}
                      >
                        <option value="">None (Unassigned)</option>
                        {positionsList.map(pos => (
                          <option key={pos.id} value={pos.id}>
                            {pos.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={formLabel}>System Role</label>
                      <select
                        value={editForm.role_id}
                        onChange={e => setEditForm(f => ({ ...f, role_id: e.target.value }))}
                        style={{ ...formInput, cursor: 'pointer' }}
                      >
                        <option value="">Default (Employee)</option>
                        {rolesList.map(r => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, padding: '12px 16px', background: editForm.is_active ? '#f0fdf4' : '#fef2f2', border: `1px solid ${editForm.is_active ? '#bbf7d0' : '#fecaca'}`, borderRadius: 8 }}>
                    <input 
                      type="checkbox" 
                      id="isActiveToggle" 
                      checked={editForm.is_active} 
                      onChange={e => setEditForm(f => ({ ...f, is_active: e.target.checked }))} 
                      style={{ width: 16, height: 16, cursor: 'pointer' }}
                    />
                    <label htmlFor="isActiveToggle" style={{ fontSize: 13, fontWeight: 500, color: editForm.is_active ? '#15803d' : '#b91c1c', cursor: 'pointer', margin: 0 }}>
                      {editForm.is_active ? 'Active Employee (Has access to log in)' : 'Deactivated (Access Revoked)'}
                    </label>
                  </div>
                </div>
                <div style={{ padding: '0 24px 24px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button type="button" onClick={() => setEditModal({ show: false, employee: null })}
                    style={{ padding: '9px 24px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={updating}
                    style={{ padding: '9px 24px', borderRadius: 8, border: 'none', background: '#1677B8', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    {updating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal */}
        {viewModal.show && viewModal.employee && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(2px)',
          }}
            onClick={e => { if (e.target === e.currentTarget) setViewModal({ show: false, employee: null }) }}
          >
            <div style={{ background: '#fff', borderRadius: 16, width: 420, maxWidth: '90vw', padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <Avatar name={viewModal.employee.name} size={64} bgColor="#1677B8" />
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#172B3A', margin: '0 0 4px' }}>{viewModal.employee.name}</h2>
                  <Badge status={viewModal.employee.status} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: 8 }}>
                  <span style={{ color: '#6b7280', fontSize: 13 }}>Employee ID</span>
                  <span style={{ color: '#172B3A', fontSize: 13, fontWeight: 600, fontFamily: 'monospace' }}>{viewModal.employee.employee_id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: 8 }}>
                  <span style={{ color: '#6b7280', fontSize: 13 }}>Email</span>
                  <span style={{ color: '#172B3A', fontSize: 13, fontWeight: 500 }}>{viewModal.employee.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: 8 }}>
                  <span style={{ color: '#6b7280', fontSize: 13 }}>Role</span>
                  <span style={{ color: '#1677B8', fontSize: 13, fontWeight: 600 }}>{viewModal.employee.role}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: 8 }}>
                  <span style={{ color: '#6b7280', fontSize: 13 }}>Department</span>
                  <span style={{ color: '#172B3A', fontSize: 13, fontWeight: 500 }}>{viewModal.employee.dept}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: 8 }}>
                  <span style={{ color: '#6b7280', fontSize: 13 }}>Position</span>
                  <span style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: viewModal.employee.position === 'No Position' ? '#D97706' : '#1677B8'
                  }}>
                    {viewModal.employee.position}
                  </span>
                </div>
              </div>
              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setViewModal({ show: false, employee: null })}
                  style={{ padding: '9px 24px', borderRadius: 8, background: '#f3f4f6', color: '#374151', border: 'none', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  )
}
