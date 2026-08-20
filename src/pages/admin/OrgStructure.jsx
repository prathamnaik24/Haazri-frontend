import React, { useState, useEffect } from 'react'
import AppShell from '../../components/layout/AppShell.jsx'
import { OrgIcon, PlusIcon } from '../../components/ui/Icons.jsx'
import api from '../../services/api.js'

// ── Helpers ──────────────────────────────────────────────────────────────────
const BLUE = '#1677B8'
const NAVY = '#172B3A'

function buildTree(positions) {
  const map = {}
  positions.forEach(pos => {
    map[pos.id] = { ...pos, children: [], name: pos.first_name ? `${pos.first_name} ${pos.last_name}` : null }
  })
  const roots = []
  positions.forEach(pos => {
    if (pos.parent_id && map[pos.parent_id]) {
      map[pos.parent_id].children.push(map[pos.id])
    } else {
      roots.push(map[pos.id])
    }
  })
  return roots
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(2px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: '#fff', borderRadius: 16, width: 440, maxWidth: '92vw', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', overflow: 'hidden' }}>
        <div style={{ background: '#f9fafb', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9ca3af', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  )
}

// ── Tree Node ─────────────────────────────────────────────────────────────────
function TreeNode({ node, allNodes, onEdit, onAddChild, onDelete, depth = 0 }) {
  const [collapsed, setCollapsed] = useState(false)
  const hasChildren = node.children && node.children.length > 0

  return (
    <div style={{ marginLeft: depth > 0 ? 32 : 0, position: 'relative' }}>
      {/* Vertical connector line */}
      {depth > 0 && (
        <div style={{ position: 'absolute', left: -17, top: 0, bottom: hasChildren && !collapsed ? '50%' : 0, width: 1, background: '#D7E6EF' }} />
      )}
      {depth > 0 && (
        <div style={{ position: 'absolute', left: -17, top: 24, width: 17, height: 1, background: '#D7E6EF' }} />
      )}

      <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, marginBottom: hasChildren && !collapsed ? 0 : 8 }}>
        {/* Collapse toggle */}
        {hasChildren ? (
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{ width: 28, minWidth: 28, background: '#EBF4FF', border: '1px solid #D7E6EF', borderRadius: '6px 0 0 6px', cursor: 'pointer', color: BLUE, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {collapsed ? '▶' : '▼'}
          </button>
        ) : (
          <div style={{ width: 28, minWidth: 28, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px 0 0 6px' }} />
        )}

        {/* Card */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '11px 16px',
          background: depth === 0 ? '#EBF4FF' : '#fff',
          border: `1px solid ${depth === 0 ? '#93C5FD' : '#D7E6EF'}`,
          borderLeft: 'none',
          borderRadius: '0 8px 8px 0',
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>{node.title}</div>
            {node.name
              ? <div style={{ fontSize: 12, color: '#526B7A', marginTop: 2 }}>👤 {node.name}</div>
              : <div style={{ fontSize: 12, color: '#f59e0b', marginTop: 2 }}>Vacant</div>
            }
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => onAddChild(node)}
              title="Add child position"
              style={{ background: '#EBF4FF', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 12, color: BLUE, cursor: 'pointer', fontWeight: 500 }}
            >+ Add</button>
            <button
              onClick={() => onEdit(node)}
              title="Edit position"
              style={{ background: '#f9fafb', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 12, color: '#374151', cursor: 'pointer', fontWeight: 500 }}
            >Edit</button>
            <button
              onClick={() => onDelete(node)}
              title="Delete position"
              style={{ background: '#fef2f2', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 12, color: '#dc2626', cursor: 'pointer', fontWeight: 500 }}
            >Delete</button>
          </div>
        </div>
      </div>

      {/* Children */}
      {hasChildren && !collapsed && (
        <div style={{ marginLeft: 28, marginTop: 4, marginBottom: 8, paddingLeft: 4, borderLeft: '1px solid #D7E6EF' }}>
          {node.children.map(child => (
            <TreeNode key={child.id} node={child} allNodes={allNodes} onEdit={onEdit} onAddChild={onAddChild} onDelete={onDelete} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function OrgStructure() {
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal state
  const [addModal, setAddModal] = useState({ show: false, parent: null }) // parent = null means root
  const [editModal, setEditModal] = useState({ show: false, node: null })
  const [deleteModal, setDeleteModal] = useState({ show: false, node: null })

  const [formTitle, setFormTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [modalError, setModalError] = useState('')

  const fetchPositions = () => {
    setLoading(true)
    api.get('/admin/org-structure/positions')
      .then(res => {
        setPositions(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load org structure:', err)
        setError('Failed to load organization structure. Please refresh.')
        setLoading(false)
      })
  }

  useEffect(() => { fetchPositions() }, [])

  const tree = buildTree(positions)

  // ── Add Position ──
  const openAdd = (parent = null) => {
    setFormTitle('')
    setModalError('')
    setAddModal({ show: true, parent })
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!formTitle.trim()) { setModalError('Title is required'); return }
    setSaving(true)
    setModalError('')
    try {
      await api.post('/admin/org-structure/positions', {
        title: formTitle.trim(),
        parent_id: addModal.parent?.id || null,
      })
      setAddModal({ show: false, parent: null })
      fetchPositions()
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to create position')
    } finally {
      setSaving(false)
    }
  }

  // ── Edit Position ──
  const openEdit = (node) => {
    setFormTitle(node.title)
    setModalError('')
    setEditModal({ show: true, node })
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    if (!formTitle.trim()) { setModalError('Title is required'); return }
    setSaving(true)
    setModalError('')
    try {
      await api.patch(`/admin/org-structure/positions/${editModal.node.id}`, { title: formTitle.trim() })
      setEditModal({ show: false, node: null })
      fetchPositions()
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to update position')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete Position ──
  const openDelete = (node) => {
    setModalError('')
    setDeleteModal({ show: true, node })
  }

  const handleDelete = async () => {
    setSaving(true)
    setModalError('')
    try {
      await api.delete(`/admin/org-structure/positions/${deleteModal.node.id}`)
      setDeleteModal({ show: false, node: null })
      fetchPositions()
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to delete position')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', border: '1.5px solid #D7E6EF', borderRadius: 8,
    fontSize: 14, color: NAVY, outline: 'none', background: '#F7FBFF', boxSizing: 'border-box',
  }
  const btnPrimary = {
    padding: '10px 24px', borderRadius: 8, border: 'none', background: BLUE, color: '#fff',
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
  }
  const btnSecondary = {
    padding: '10px 24px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff',
    color: '#374151', fontSize: 14, fontWeight: 500, cursor: 'pointer',
  }

  return (
    <AppShell>
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: NAVY, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <OrgIcon size={22} color={BLUE} /> Organization Structure
            </h1>
            <p style={{ fontSize: 13, color: '#526B7A', margin: '4px 0 0' }}>Manage positions and reporting hierarchy.</p>
          </div>
          <button onClick={() => openAdd(null)} style={btnPrimary}>
            <span style={{ marginRight: 6 }}>+</span> Add Root Position
          </button>
        </div>

        {/* Tree Card */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: NAVY, margin: 0 }}>Hierarchy Tree</h2>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>{positions.length} position{positions.length !== 1 ? 's' : ''} total</span>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', fontSize: 13, marginBottom: 16 }}>{error}</div>
          )}

          {loading ? (
            <div style={{ color: '#9ca3af', fontSize: 14, textAlign: 'center', padding: '40px 0' }}>Loading structure...</div>
          ) : tree.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏢</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>No positions yet</div>
              <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>Click "Add Root Position" to create your org hierarchy.</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              {tree.map(root => (
                <TreeNode
                  key={root.id}
                  node={root}
                  allNodes={positions}
                  onEdit={openEdit}
                  onAddChild={openAdd}
                  onDelete={openDelete}
                  depth={0}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Add Modal ── */}
      {addModal.show && (
        <Modal title={addModal.parent ? `Add Position under "${addModal.parent.title}"` : 'Add Root Position'} onClose={() => setAddModal({ show: false, parent: null })}>
          <form onSubmit={handleAdd}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Position Title</label>
              <input
                autoFocus
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                placeholder="e.g. Software Engineer"
                style={inputStyle}
                required
              />
            </div>
            {addModal.parent && (
              <div style={{ background: '#EBF4FF', border: '1px solid #D7E6EF', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#526B7A', marginBottom: 16 }}>
                📌 Will be placed under: <strong>{addModal.parent.title}</strong>
              </div>
            )}
            {modalError && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>{modalError}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" onClick={() => setAddModal({ show: false, parent: null })} style={btnSecondary}>Cancel</button>
              <button type="submit" disabled={saving} style={btnPrimary}>{saving ? 'Creating...' : 'Create Position'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Edit Modal ── */}
      {editModal.show && editModal.node && (
        <Modal title={`Edit Position: ${editModal.node.title}`} onClose={() => setEditModal({ show: false, node: null })}>
          <form onSubmit={handleEdit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Position Title</label>
              <input
                autoFocus
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                placeholder="e.g. Senior Engineer"
                style={inputStyle}
                required
              />
            </div>
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#92400e', marginBottom: 16 }}>
              ⚠️ Only the title can be changed. To move a position in the hierarchy, delete and re-create it.
            </div>
            {modalError && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>{modalError}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" onClick={() => setEditModal({ show: false, node: null })} style={btnSecondary}>Cancel</button>
              <button type="submit" disabled={saving} style={btnPrimary}>{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteModal.show && deleteModal.node && (
        <Modal title="Delete Position" onClose={() => setDeleteModal({ show: false, node: null })}>
          <div style={{ fontSize: 14, color: '#374151', marginBottom: 16 }}>
            Are you sure you want to delete <strong>"{deleteModal.node.title}"</strong>?
          </div>
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#b91c1c', marginBottom: 20 }}>
            ⚠️ This will also delete all child positions under it. This action cannot be undone.
          </div>
          {modalError && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>{modalError}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" onClick={() => setDeleteModal({ show: false, node: null })} style={btnSecondary}>Cancel</button>
            <button onClick={handleDelete} disabled={saving} style={{ ...btnPrimary, background: '#dc2626' }}>{saving ? 'Deleting...' : 'Yes, Delete'}</button>
          </div>
        </Modal>
      )}

    </AppShell>
  )
}
