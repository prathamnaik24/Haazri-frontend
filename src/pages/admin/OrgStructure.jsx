import React, { useState, useEffect } from 'react'
import AppShell from '../../components/layout/AppShell.jsx'
import { OrgIcon } from '../../components/ui/Icons.jsx'
import api from '../../services/api.js'

const BLUE = '#1677B8'
const NAVY = '#172B3A'

// ── Tree Construction ────────────────────────────────────────────────────────
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
        animation: 'fadeIn 0.15s ease-out',
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

// ── Tree Node Component ──────────────────────────────────────────────────────
function TreeNode({ node, onEdit, onAddChild, onDelete, depth = 0 }) {
  const [collapsed, setCollapsed] = useState(false)
  const hasChildren = node.children && node.children.length > 0

  return (
    <div style={{ marginLeft: depth > 0 ? 32 : 0, position: 'relative' }}>
      {depth > 0 && (
        <div style={{
          position: 'absolute', left: -16, top: 0,
          bottom: hasChildren && !collapsed ? '50%' : 0,
          width: 1, background: '#CBD5E1',
        }} />
      )}
      {depth > 0 && (
        <div style={{
          position: 'absolute', left: -16, top: 22,
          width: 16, height: 1, background: '#CBD5E1',
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'stretch', marginBottom: hasChildren && !collapsed ? 0 : 8 }}>
        {hasChildren ? (
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{
              width: 28, minWidth: 28, background: '#EFF6FF',
              border: '1px solid #BFDBFE', borderRight: 'none',
              borderRadius: '8px 0 0 8px', cursor: 'pointer', color: BLUE,
              fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {collapsed ? '▶' : '▼'}
          </button>
        ) : (
          <div style={{
            width: 12, minWidth: 12, background: depth === 0 ? BLUE : '#94A3B8',
            borderRadius: '8px 0 0 8px', opacity: 0.8,
          }} />
        )}

        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px',
          background: depth === 0 ? '#F0F9FF' : '#FFFFFF',
          border: `1px solid ${depth === 0 ? '#BAE6FD' : '#E2E8F0'}`,
          borderRadius: hasChildren ? '0 8px 8px 0' : '0 8px 8px 0',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: NAVY }}>{node.title}</div>
            {node.name ? (
              <div style={{ fontSize: 11.5, color: '#475569', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>👤</span> <strong>{node.name}</strong>
              </div>
            ) : (
              <div style={{ fontSize: 11, color: '#D97706', marginTop: 2, fontWeight: 500 }}>
                • Vacant (Unassigned)
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => onAddChild(node)}
              title="Add child position"
              style={{
                background: '#EBF4FF', border: 'none', borderRadius: 6,
                padding: '4px 9px', fontSize: 11.5, color: BLUE, cursor: 'pointer', fontWeight: 600,
              }}
            >+ Add</button>
            <button
              onClick={() => onEdit(node)}
              title="Edit position"
              style={{
                background: '#F1F5F9', border: 'none', borderRadius: 6,
                padding: '4px 9px', fontSize: 11.5, color: '#475569', cursor: 'pointer', fontWeight: 500,
              }}
            >Edit</button>
            <button
              onClick={() => onDelete(node)}
              title="Delete position"
              style={{
                background: '#FEF2F2', border: 'none', borderRadius: 6,
                padding: '4px 9px', fontSize: 11.5, color: '#DC2626', cursor: 'pointer', fontWeight: 500,
              }}
            >Delete</button>
          </div>
        </div>
      </div>

      {hasChildren && !collapsed && (
        <div style={{ marginLeft: 24, marginTop: 2, marginBottom: 8, paddingLeft: 4, borderLeft: '1px solid #CBD5E1' }}>
          {node.children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              onEdit={onEdit}
              onAddChild={onAddChild}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function OrgStructure() {
  const [positions, setPositions] = useState([])
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  // Modals
  const [templateModal, setTemplateModal] = useState({ show: false, selectedKey: 'corporate', replace: false })
  const [addModal, setAddModal] = useState({ show: false, parent: null })
  const [editModal, setEditModal] = useState({ show: false, node: null })
  const [deleteModal, setDeleteModal] = useState({ show: false, node: null })

  const [formTitle, setFormTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [modalError, setModalError] = useState('')

  const fetchStructure = async () => {
    setLoading(true)
    setError('')
    try {
      const [posRes, tempRes] = await Promise.all([
        api.get('/admin/org-structure/positions'),
        api.get('/admin/org-structure/templates').catch(() => ({ data: { data: [] } })),
      ])
      setPositions(posRes.data || [])
      setTemplates(tempRes.data?.data || [])
    } catch (err) {
      console.error('Failed to load org structure:', err)
      setError(err.response?.data?.message || 'Failed to load organization structure. Please sign in again if your session expired.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStructure()
  }, [])

  const tree = buildTree(positions)

  // ── Apply Template ──────────────────────────────────────────────────────────
  const handleApplyTemplate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setModalError('')
    try {
      await api.post('/admin/org-structure/templates/apply', {
        templateKey: templateModal.selectedKey,
        replaceExisting: templateModal.replace || positions.length === 0,
      })
      setTemplateModal({ show: false, selectedKey: 'corporate', replace: false })
      setNotice('Starter template applied successfully!')
      setTimeout(() => setNotice(''), 4000)
      fetchStructure()
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to apply template.')
    } finally {
      setSaving(false)
    }
  }

  // ── Add Position ────────────────────────────────────────────────────────────
  const openAdd = (parent = null) => {
    setFormTitle('')
    setModalError('')
    setAddModal({ show: true, parent })
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!formTitle.trim()) { setModalError('Position title is required'); return }
    setSaving(true)
    setModalError('')
    try {
      await api.post('/admin/org-structure/positions', {
        title: formTitle.trim(),
        parent_id: addModal.parent?.id || null,
      })
      setAddModal({ show: false, parent: null })
      setNotice(`Position "${formTitle.trim()}" created successfully.`)
      setTimeout(() => setNotice(''), 4000)
      fetchStructure()
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to create position')
    } finally {
      setSaving(false)
    }
  }

  // ── Edit Position ───────────────────────────────────────────────────────────
  const openEdit = (node) => {
    setFormTitle(node.title)
    setModalError('')
    setEditModal({ show: true, node })
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    if (!formTitle.trim()) { setModalError('Position title is required'); return }
    setSaving(true)
    setModalError('')
    try {
      await api.patch(`/admin/org-structure/positions/${editModal.node.id}`, { title: formTitle.trim() })
      setEditModal({ show: false, node: null })
      setNotice(`Position renamed to "${formTitle.trim()}".`)
      setTimeout(() => setNotice(''), 4000)
      fetchStructure()
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to update position')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete Position ─────────────────────────────────────────────────────────
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
      setNotice(`Position removed.`)
      setTimeout(() => setNotice(''), 4000)
      fetchStructure()
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to delete position.')
    } finally {
      setSaving(false)
    }
  }

  const selectedTemplateObj = templates.find(t => t.id === templateModal.selectedKey)

  const renderTemplatePreview = (node, depth = 0) => {
    if (!node) return null
    return (
      <div key={node.title} style={{ marginLeft: depth * 16, marginTop: 4 }}>
        <div style={{ fontSize: 12, color: depth === 0 ? NAVY : '#475569', fontWeight: depth === 0 ? 700 : 500 }}>
          {depth > 0 ? '↳ ' : '👑 '}{node.title}
        </div>
        {node.children && node.children.map(child => renderTemplatePreview(child, depth + 1))}
      </div>
    )
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', border: '1.5px solid #CBD5E1', borderRadius: 8,
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
      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 960, margin: '0 auto' }}>

        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: NAVY, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <OrgIcon size={22} color={BLUE} /> Organization Structure
            </h1>
            <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0' }}>
              Define reporting lines, management hierarchy, and organizational roles.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setTemplateModal({ show: true, selectedKey: 'corporate', replace: positions.length > 0 })}
              style={{ ...btnSecondary, background: '#F0F9FF', borderColor: '#BAE6FD', color: BLUE, fontWeight: 600 }}
            >
              ⚡ Choose Template
            </button>
            <button onClick={() => openAdd(null)} style={btnPrimary}>
              + Add Root Position
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {notice && (
          <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500 }}>
            ✓ {notice}
          </div>
        )}
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', padding: '12px 16px', borderRadius: 8, fontSize: 13 }}>
            {error}
          </div>
        )}

        {/* Main Card */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: NAVY, margin: 0 }}>Reporting Hierarchy Tree</h2>
            <span style={{ fontSize: 12, color: '#64748B', background: '#F1F5F9', padding: '3px 10px', borderRadius: 12, fontWeight: 500 }}>
              {positions.length} position{positions.length !== 1 ? 's' : ''} total
            </span>
          </div>

          {loading ? (
            <div style={{ color: '#94A3B8', fontSize: 14, textAlign: 'center', padding: '48px 0' }}>
              Loading organization hierarchy...
            </div>
          ) : tree.length === 0 ? (
            /* Empty State with Template Cards */
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>🏛️</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: NAVY, margin: '0 0 6px' }}>
                No Positions Configured Yet
              </h3>
              <p style={{ fontSize: 13, color: '#64748B', maxWidth: 480, margin: '0 auto 24px' }}>
                Get started in seconds by picking a pre-built hierarchy template for your industry, or manually add a root position.
              </p>

              {/* Template Quick Selection Grid */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 14, maxWidth: 820, margin: '0 auto 24px', textAlign: 'left',
              }}>
                {templates.map(t => (
                  <div
                    key={t.id}
                    onClick={() => setTemplateModal({ show: true, selectedKey: t.id, replace: false })}
                    style={{
                      border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '16px',
                      background: '#F8FAFC', cursor: 'pointer', transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = BLUE
                      e.currentTarget.style.background = '#F0F9FF'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#E2E8F0'
                      e.currentTarget.style.background = '#F8FAFC'
                    }}
                  >
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{t.icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 4, lineHeight: 1.4 }}>{t.description}</div>
                    <div style={{ marginTop: 12, fontSize: 12, color: BLUE, fontWeight: 600 }}>
                      Preview & Apply →
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                <button onClick={() => openAdd(null)} style={btnSecondary}>
                  + Build From Scratch (Add Root)
                </button>
              </div>
            </div>
          ) : (
            /* Active Hierarchy Tree */
            <div style={{ overflowX: 'auto', paddingTop: 8 }}>
              {tree.map(root => (
                <TreeNode
                  key={root.id}
                  node={root}
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

      {/* ── Choose Starter Template Modal ── */}
      {templateModal.show && (
        <Modal title="Choose an Organization Starter Template" onClose={() => setTemplateModal({ show: false, selectedKey: 'corporate', replace: false })} maxWidth={640}>
          <form onSubmit={handleApplyTemplate}>
            <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 16px' }}>
              Select a standard structure tailored to your organization type. You can freely customize, add, or rename positions after applying.
            </p>

            {/* Template Selector Pills */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
              {templates.map(t => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setTemplateModal(m => ({ ...m, selectedKey: t.id }))}
                  style={{
                    padding: '10px 8px', borderRadius: 8, textAlign: 'center', cursor: 'pointer',
                    border: `1.5px solid ${templateModal.selectedKey === t.id ? BLUE : '#E2E8F0'}`,
                    background: templateModal.selectedKey === t.id ? '#EFF6FF' : '#fff',
                    color: templateModal.selectedKey === t.id ? BLUE : '#334155',
                    fontSize: 12.5, fontWeight: templateModal.selectedKey === t.id ? 700 : 500,
                  }}
                >
                  <div style={{ fontSize: 18, marginBottom: 2 }}>{t.icon}</div>
                  <div>{t.id.charAt(0).toUpperCase() + t.id.slice(1)}</div>
                </button>
              ))}
            </div>

            {/* Preview Box */}
            {selectedTemplateObj && (
              <div style={{
                background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10,
                padding: '14px 16px', marginBottom: 16, maxHeight: 220, overflowY: 'auto',
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 4 }}>
                  {selectedTemplateObj.icon} {selectedTemplateObj.name}
                </div>
                <div style={{ fontSize: 12, color: '#64748B', marginBottom: 10 }}>
                  {selectedTemplateObj.description}
                </div>
                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 4 }}>
                    Included Hierarchy Preview:
                  </div>
                  {renderTemplatePreview(selectedTemplateObj.structure)}
                </div>
              </div>
            )}

            {positions.length > 0 && (
              <div style={{
                background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8,
                padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <input
                  type="checkbox"
                  id="replaceCheck"
                  checked={templateModal.replace}
                  onChange={e => setTemplateModal(m => ({ ...m, replace: e.target.checked }))}
                  style={{ cursor: 'pointer', width: 16, height: 16 }}
                />
                <label htmlFor="replaceCheck" style={{ fontSize: 12.5, color: '#92400E', cursor: 'pointer', margin: 0, fontWeight: 500 }}>
                  Replace existing hierarchy (Recommended if resetting structure)
                </label>
              </div>
            )}

            {modalError && <div style={{ color: '#DC2626', fontSize: 13, marginBottom: 12 }}>{modalError}</div>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" onClick={() => setTemplateModal({ show: false, selectedKey: 'corporate', replace: false })} style={btnSecondary}>
                Cancel
              </button>
              <button type="submit" disabled={saving} style={btnPrimary}>
                {saving ? 'Applying...' : 'Apply This Template'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Add Position Modal ── */}
      {addModal.show && (
        <Modal title={addModal.parent ? `Add Position Under "${addModal.parent.title}"` : 'Add Top-Level Root Position'} onClose={() => setAddModal({ show: false, parent: null })}>
          <form onSubmit={handleAdd}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>
                Position Title
              </label>
              <input
                autoFocus
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                placeholder="e.g. Lead Software Engineer"
                style={inputStyle}
                required
              />
            </div>
            {addModal.parent && (
              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '10px 14px', fontSize: 12.5, color: '#1E40AF', marginBottom: 16 }}>
                📌 Reports directly to: <strong>{addModal.parent.title}</strong>
              </div>
            )}
            {modalError && <div style={{ color: '#DC2626', fontSize: 13, marginBottom: 12 }}>{modalError}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" onClick={() => setAddModal({ show: false, parent: null })} style={btnSecondary}>Cancel</button>
              <button type="submit" disabled={saving} style={btnPrimary}>{saving ? 'Creating...' : 'Create Position'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Edit Position Modal ── */}
      {editModal.show && editModal.node && (
        <Modal title={`Edit Position: ${editModal.node.title}`} onClose={() => setEditModal({ show: false, node: null })}>
          <form onSubmit={handleEdit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>
                Position Title
              </label>
              <input
                autoFocus
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                style={inputStyle}
                required
              />
            </div>
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '10px 14px', fontSize: 12.5, color: '#92400E', marginBottom: 16 }}>
              ℹ️ To move a position to a different parent in the hierarchy, delete and re-add it under the desired parent.
            </div>
            {modalError && <div style={{ color: '#DC2626', fontSize: 13, marginBottom: 12 }}>{modalError}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" onClick={() => setEditModal({ show: false, node: null })} style={btnSecondary}>Cancel</button>
              <button type="submit" disabled={saving} style={btnPrimary}>{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteModal.show && deleteModal.node && (
        <Modal title="Delete Position" onClose={() => setDeleteModal({ show: false, node: null })}>
          <div style={{ fontSize: 14, color: '#334155', marginBottom: 14 }}>
            Are you sure you want to delete <strong>"{deleteModal.node.title}"</strong>?
          </div>
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontSize: 12.5, color: '#B91C1C', marginBottom: 18 }}>
            ⚠️ This will also remove any subordinate child positions under it. This action cannot be undone.
          </div>
          {modalError && <div style={{ color: '#DC2626', fontSize: 13, marginBottom: 12 }}>{modalError}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" onClick={() => setDeleteModal({ show: false, node: null })} style={btnSecondary}>Cancel</button>
            <button onClick={handleDelete} disabled={saving} style={{ ...btnPrimary, background: '#DC2626' }}>
              {saving ? 'Deleting...' : 'Yes, Delete'}
            </button>
          </div>
        </Modal>
      )}

    </AppShell>
  )
}
