import React, { useState, useEffect } from 'react'
import AppShell from '../../components/layout/AppShell.jsx'
import { RolesIcon, PlusIcon } from '../../components/ui/Icons.jsx'
import api from '../../services/api.js'

const BLUE = '#1677B8'
const NAVY = '#172B3A'

// ── Modal Wrapper ────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, maxWidth = 480 }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 50, backdropFilter: 'blur(3px)', padding: 16,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#fff', borderRadius: 16, width: '100%', maxWidth,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden',
      }}>
        <div style={{
          background: '#F8FAFC', padding: '16px 22px', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0',
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: 0 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#94A3B8', lineHeight: 1, padding: 4 }}
          >×</button>
        </div>
        <div style={{ padding: 22 }}>{children}</div>
      </div>
    </div>
  )
}

export default function RolesPermissions() {
  const [roles, setRoles] = useState([])
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingRoleId, setSavingRoleId] = useState(null)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editRoleModal, setEditRoleModal] = useState({ show: false, role: null })
  const [deleteRoleModal, setDeleteRoleModal] = useState({ show: false, role: null })

  // Create Form State
  const [newRoleName, setNewRoleName] = useState('')
  const [newRolePermIds, setNewRolePermIds] = useState([])
  const [modalSaving, setModalSaving] = useState(false)
  const [modalError, setModalError] = useState('')

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [rolesRes, permsRes] = await Promise.all([
        api.get('/admin/roles'),
        api.get('/admin/roles/permissions'),
      ])
      setRoles(rolesRes.data?.data || rolesRes.data || [])
      setPermissions(permsRes.data?.data || permsRes.data || [])
    } catch (err) {
      console.error('Failed to load roles and permissions:', err)
      setError(err.response?.data?.message || 'Failed to load roles and permissions.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // ── Permission Toggle Handler ───────────────────────────────────────────────
  const handleTogglePermission = async (role, permId) => {
    const currentPermIds = (role.permissions || []).map(p => p.id)
    const hasPerm = currentPermIds.includes(permId)
    const newPermIds = hasPerm
      ? currentPermIds.filter(id => id !== permId)
      : [...currentPermIds, permId]

    // Optimistic UI update
    setRoles(prev => prev.map(r => {
      if (r.id === role.id) {
        const updatedPerms = newPermIds.map(id => permissions.find(p => p.id === id)).filter(Boolean)
        return { ...r, permissions: updatedPerms }
      }
      return r
    }))

    setSavingRoleId(role.id)
    try {
      await api.post(`/admin/roles/${role.id}/permissions`, { permissionIds: newPermIds })
      setToast(`Updated permissions for "${role.name}"`)
      setTimeout(() => setToast(''), 3500)
    } catch (err) {
      console.error('Failed to update permissions:', err)
      setError(err.response?.data?.message || `Failed to update permissions for ${role.name}`)
      // Revert on error
      fetchData()
    } finally {
      setSavingRoleId(null)
    }
  }

  // ── Create New Role ─────────────────────────────────────────────────────────
  const handleCreateRole = async (e) => {
    e.preventDefault()
    if (!newRoleName.trim()) { setModalError('Role name is required'); return }
    setModalSaving(true)
    setModalError('')
    try {
      await api.post('/admin/roles', {
        name: newRoleName.trim(),
        permissionIds: newRolePermIds,
      })
      setShowCreateModal(false)
      setNewRoleName('')
      setNewRolePermIds([])
      setToast(`Created role "${newRoleName.trim()}" successfully!`)
      setTimeout(() => setToast(''), 4000)
      fetchData()
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to create role')
    } finally {
      setModalSaving(false)
    }
  }

  // ── Edit Role Name ──────────────────────────────────────────────────────────
  const handleUpdateRoleName = async (e) => {
    e.preventDefault()
    if (!newRoleName.trim()) { setModalError('Role name is required'); return }
    setModalSaving(true)
    setModalError('')
    try {
      await api.patch(`/admin/roles/${editRoleModal.role.id}`, {
        name: newRoleName.trim(),
      })
      setEditRoleModal({ show: false, role: null })
      setToast(`Role renamed to "${newRoleName.trim()}".`)
      setTimeout(() => setToast(''), 4000)
      fetchData()
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to rename role')
    } finally {
      setModalSaving(false)
    }
  }

  // ── Delete Role ─────────────────────────────────────────────────────────────
  const handleDeleteRole = async () => {
    setModalSaving(true)
    setModalError('')
    try {
      await api.delete(`/admin/roles/${deleteRoleModal.role.id}`)
      setDeleteRoleModal({ show: false, role: null })
      setToast(`Role "${deleteRoleModal.role.name}" deleted.`)
      setTimeout(() => setToast(''), 4000)
      fetchData()
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to delete role')
    } finally {
      setModalSaving(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', border: '1.5px solid #CBD5E1', borderRadius: 8,
    fontSize: 13.5, color: NAVY, outline: 'none', background: '#F8FAFC', boxSizing: 'border-box',
  }
  const btnPrimary = {
    padding: '9px 18px', borderRadius: 8, border: 'none', background: BLUE, color: '#fff',
    fontSize: 13.5, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
  }
  const btnSecondary = {
    padding: '9px 18px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#fff',
    color: '#334155', fontSize: 13.5, fontWeight: 500, cursor: 'pointer',
  }

  return (
    <AppShell>
      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1080, margin: '0 auto' }}>

        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: NAVY, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <RolesIcon size={22} color={BLUE} /> Roles & Permissions
            </h1>
            <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0' }}>
              Configure access levels, create custom roles, and assign granular permissions across your organization.
            </p>
          </div>
          <button
            onClick={() => {
              setNewRoleName('')
              setNewRolePermIds([])
              setModalError('')
              setShowCreateModal(true)
            }}
            style={btnPrimary}
          >
            <PlusIcon size={16} /> New Role
          </button>
        </div>

        {/* Toast / Notice Alert */}
        {toast && (
          <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500 }}>
            ✓ {toast}
          </div>
        )}
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', padding: '12px 16px', borderRadius: 8, fontSize: 13 }}>
            {error}
          </div>
        )}

        {/* Permissions Matrix Card */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: NAVY, margin: 0 }}>Permissions Matrix</h2>
              <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0' }}>Check or uncheck boxes to adjust permissions for any role in real-time.</p>
            </div>
            <span style={{ fontSize: 12, color: '#64748B', background: '#F1F5F9', padding: '3px 10px', borderRadius: 12, fontWeight: 500 }}>
              {roles.length} Roles • {permissions.length} Permissions
            </span>
          </div>

          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#94A3B8', fontSize: 14 }}>
              Loading roles and permissions matrix...
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0' }}>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: NAVY, width: '32%' }}>
                      Permission Capability
                    </th>
                    {roles.map(role => (
                      <th key={role.id} style={{ padding: '14px 16px', textAlign: 'center', minWidth: 140 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: 13.5, fontWeight: 700, color: NAVY }}>
                            {role.name}
                          </span>
                          <span style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>
                            {role.employee_count || 0} employee{role.employee_count !== 1 ? 's' : ''}
                          </span>
                          {/* Role Action links */}
                          {role.name !== 'Org Admin' && (
                            <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                              <button
                                onClick={() => {
                                  setNewRoleName(role.name)
                                  setModalError('')
                                  setEditRoleModal({ show: true, role })
                                }}
                                style={{ background: 'none', border: 'none', color: BLUE, fontSize: 11, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                              >
                                Rename
                              </button>
                              <span style={{ color: '#CBD5E1', fontSize: 11 }}>•</span>
                              <button
                                onClick={() => {
                                  setModalError('')
                                  setDeleteRoleModal({ show: true, role })
                                }}
                                style={{ background: 'none', border: 'none', color: '#DC2626', fontSize: 11, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((perm, idx) => (
                    <tr
                      key={perm.id}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        background: idx % 2 === 0 ? '#FFFFFF' : '#FAFCFF',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F0F9FF'}
                      onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#FFFFFF' : '#FAFCFF'}
                    >
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: 600, color: NAVY, fontSize: 13, fontFamily: 'monospace' }}>
                          {perm.name}
                        </div>
                        <div style={{ color: '#64748B', fontSize: 12, marginTop: 2, lineHeight: 1.4 }}>
                          {perm.description}
                        </div>
                      </td>

                      {roles.map(role => {
                        const isChecked = (role.permissions || []).some(p => p.id === perm.id)
                        const isSaving = savingRoleId === role.id
                        return (
                          <td key={role.id} style={{ padding: '14px 16px', textAlign: 'center' }}>
                            <label style={{
                              cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
                              justifyContent: 'center', padding: 6, borderRadius: 6,
                            }}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleTogglePermission(role, perm.id)}
                                disabled={isSaving}
                                style={{
                                  width: 18, height: 18, cursor: 'pointer',
                                  accentColor: BLUE,
                                }}
                              />
                            </label>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Create Role Modal ── */}
      {showCreateModal && (
        <Modal title="Create New Role" onClose={() => setShowCreateModal(false)} maxWidth={520}>
          <form onSubmit={handleCreateRole}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Role Name <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                autoFocus
                value={newRoleName}
                onChange={e => setNewRoleName(e.target.value)}
                placeholder="e.g. Department Supervisor, Branch Manager, Payroll Admin"
                style={inputStyle}
                required
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 8 }}>
                Assign Initial Permissions
              </label>
              <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 12px', background: '#F8FAFC' }}>
                {permissions.map(perm => {
                  const isChecked = newRolePermIds.includes(perm.id)
                  return (
                    <div
                      key={perm.id}
                      onClick={() => {
                        setNewRolePermIds(prev =>
                          prev.includes(perm.id) ? prev.filter(id => id !== perm.id) : [...prev, perm.id]
                        )
                      }}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 4px',
                        borderBottom: '1px solid #EEF2F6', cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        style={{ marginTop: 2, accentColor: BLUE, cursor: 'pointer' }}
                      />
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: NAVY }}>{perm.name}</div>
                        <div style={{ fontSize: 11.5, color: '#64748B' }}>{perm.description}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {modalError && <div style={{ color: '#DC2626', fontSize: 13, marginBottom: 12 }}>{modalError}</div>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" onClick={() => setShowCreateModal(false)} style={btnSecondary}>
                Cancel
              </button>
              <button type="submit" disabled={modalSaving} style={btnPrimary}>
                {modalSaving ? 'Creating...' : 'Create Role'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Edit Role Name Modal ── */}
      {editRoleModal.show && editRoleModal.role && (
        <Modal title={`Rename Role: ${editRoleModal.role.name}`} onClose={() => setEditRoleModal({ show: false, role: null })}>
          <form onSubmit={handleUpdateRoleName}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Role Name
              </label>
              <input
                autoFocus
                value={newRoleName}
                onChange={e => setNewRoleName(e.target.value)}
                placeholder="Role Name"
                style={inputStyle}
                required
              />
            </div>
            {modalError && <div style={{ color: '#DC2626', fontSize: 13, marginBottom: 12 }}>{modalError}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" onClick={() => setEditRoleModal({ show: false, role: null })} style={btnSecondary}>
                Cancel
              </button>
              <button type="submit" disabled={modalSaving} style={btnPrimary}>
                {modalSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Delete Role Modal ── */}
      {deleteRoleModal.show && deleteRoleModal.role && (
        <Modal title="Delete Role" onClose={() => setDeleteRoleModal({ show: false, role: null })}>
          <div style={{ fontSize: 14, color: '#334155', marginBottom: 14 }}>
            Are you sure you want to delete the role <strong>"{deleteRoleModal.role.name}"</strong>?
          </div>
          <p style={{ fontSize: 12.5, color: '#64748B', margin: '0 0 16px' }}>
            Employees assigned to this role must be reassigned before deleting.
          </p>
          {modalError && <div style={{ color: '#DC2626', fontSize: 13, marginBottom: 12 }}>{modalError}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" onClick={() => setDeleteRoleModal({ show: false, role: null })} style={btnSecondary}>
              Cancel
            </button>
            <button onClick={handleDeleteRole} disabled={modalSaving} style={{ ...btnPrimary, background: '#DC2626' }}>
              {modalSaving ? 'Deleting...' : 'Yes, Delete Role'}
            </button>
          </div>
        </Modal>
      )}

    </AppShell>
  )
}
