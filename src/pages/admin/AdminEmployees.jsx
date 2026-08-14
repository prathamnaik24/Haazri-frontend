import { useState } from 'react'
import AppShell from '../../components/layout/AppShell.jsx'
import { Avatar, avatarColor } from '../../components/ui/Avatar.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { card } from '../../components/ui/styles.js'
import { SearchIcon } from '../../components/ui/Icons.jsx'
import api from '../../services/api.js'

const mockEmployees = [
  { id: 1, name: 'John Admin',   email: 'john.admin@acme-corp.com',  dept: 'Engineering',   position: 'CEO',              role: 'Org Admin', status: 'Active' },
  { id: 2, name: 'Aisha Khan',   email: 'aisha@acme-corp.com',       dept: 'Engineering',   position: 'Senior Developer', role: 'Employee',  status: 'Active' },
  { id: 3, name: 'Rohan Mehta',  email: 'rohan@acme-corp.com',       dept: 'Engineering',   position: 'Junior Developer', role: 'Employee',  status: 'Active' },
  { id: 4, name: 'Sara Ahmed',   email: 'sara@acme-corp.com',        dept: 'Human Resources',position: 'HR Director',     role: 'HR Manager',status: 'Active' },
  { id: 5, name: 'James Wilson', email: 'james@acme-corp.com',       dept: 'Finance',        position: 'CTO',             role: 'Employee',  status: 'Inactive' },
]

const depts = ['All', 'Engineering', 'Human Resources', 'Finance']

export default function AdminEmployees() {
  const [employees, setEmployees] = useState(mockEmployees)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState('')
  const [inviteError, setInviteError] = useState('')
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', department: '', position_title: '',
  })

  const filtered = employees.filter(emp => {
    const matchSearch = emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase())
    const matchDept = deptFilter === 'All' || emp.dept === deptFilter
    return matchSearch && matchDept
  })

  const handleInvite = async (e) => {
    e.preventDefault()
    setInviting(true)
    setInviteError('')
    try {
      await api.post('/org/employees', form)
      setInviteSuccess(`Invitation sent to ${form.email}!`)
      setShowModal(false)
      setForm({ first_name: '', last_name: '', email: '', department: '', position_title: '' })
      setTimeout(() => setInviteSuccess(''), 4000)
    } catch (err) {
      setInviteError(err.response?.data?.message || 'Failed to send invitation')
    } finally {
      setInviting(false)
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
            <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0, flex: 1 }}>Employees</h1>
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
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              + Invite Employee
            </button>
          </div>

          {/* Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Name', 'Email', 'Department', 'Position', 'Role', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '11px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#374151', borderBottom: '1px solid #f3f4f6' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp, i) => (
                <tr key={emp.id}
                  style={{ borderBottom: '1px solid #f9fafb' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={emp.name} size={34} bgColor={avatarColor(i)} />
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{emp.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#6b7280' }}>{emp.email}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#6b7280' }}>{emp.dept}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#6b7280' }}>{emp.position}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ fontSize: 12, background: '#eff6ff', color: '#2563eb', padding: '3px 10px', borderRadius: 20, fontWeight: 500 }}>{emp.role}</span>
                  </td>
                  <td style={{ padding: '14px 20px' }}><Badge status={emp.status} /></td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button title="View" style={{ background: '#eff6ff', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 12, color: '#2563eb', cursor: 'pointer', fontWeight: 500 }}>View</button>
                      <button title="Edit" style={{ background: '#f9fafb', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 12, color: '#6b7280', cursor: 'pointer', fontWeight: 500 }}>Edit</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Invite Modal */}
        {showModal && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(2px)',
          }}
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}
          >
            <div style={{ background: '#fff', borderRadius: 16, width: 600, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
              <div style={{ background: '#2563eb', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>Invite Employee</h2>
                <button onClick={() => setShowModal(false)}
                  style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', color: '#fff', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={formLabel}>Department</label>
                      <input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                        placeholder="e.g. Engineering" style={formInput} />
                    </div>
                    <div>
                      <label style={formLabel}>Position Title</label>
                      <input value={form.position_title} onChange={e => setForm(f => ({ ...f, position_title: e.target.value }))}
                        placeholder="e.g. Backend Developer" style={formInput} />
                    </div>
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
                    style={{ padding: '9px 24px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    {inviting ? 'Sending...' : 'Send Invitation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
