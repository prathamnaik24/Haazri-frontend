import React, { useEffect, useMemo, useState } from "react"
import AppShell from "../../components/layout/AppShell.jsx"
import { OrgIcon } from "../../components/ui/Icons.jsx"
import api from "../../services/api.js"
import { canManageHierarchy, canViewHierarchy } from "../../utils/auth.js"

const BLUE = "#1677B8"

const NAVY = "#172B3A"

function errorMessage(error, fallback) {
  return error.response?.data?.message || error.message || fallback
}

function collectNodes(nodes, result = []) {
  nodes.forEach(node => { result.push(node); collectNodes(node.children || [], result) })
  return result
}

// ── Generic Modal Wrapper ────────────────────────────────────────────────────
function Modal({ title, onClose, children, maxWidth = 500 }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 50, backdropFilter: "blur(4px)", padding: 16,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          background: "#fff", borderRadius: 14, width: "100%", maxWidth,
          boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.25)", overflow: "hidden",
          border: "1px solid #E2E8F0",
        }}
      >
        <div
          style={{
            background: "#F8FAFC", padding: "14px 20px", display: "flex",
            alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #E2E8F0",
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: 0 }}>{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              background: "none", border: "none", fontSize: 22, cursor: "pointer",
              color: "#94A3B8", lineHeight: 1, padding: "2px 6px", borderRadius: 4,
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  )
}

function EmployeeHistory({ employee, onClose }) {
  const [history, setHistory] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    api.get(`/org/hierarchy/mobility/${employee.id}`)
      .then(response => { if (active) setHistory(response.data.data || []) })
      .catch(requestError => { if (active) setError(errorMessage(requestError, "Unable to load mobility history.")) })
    return () => { active = false }
  }, [employee.id])

  return (
    <Modal title={`Mobility History: ${employee.first_name} ${employee.last_name}`} onClose={onClose} maxWidth={580}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Internal Movement Audit Log
        </span>
        {history && (
          <span style={{ fontSize: 11, background: "#EFF6FF", color: BLUE, padding: "2px 8px", borderRadius: 12, fontWeight: 600 }}>
            {history.length} {history.length === 1 ? "record" : "records"}
          </span>
        )}
      </div>

      {error && <div className="alert error">{error}</div>}
      {!history && !error && (
        <div style={{ padding: "30px 0", textAlign: "center", color: "#64748B", fontSize: 13 }}>
          Loading mobility history...
        </div>
      )}
      {history && history.length === 0 && (
        <div style={{ padding: "30px 0", textAlign: "center", color: "#64748B", fontSize: 13, background: "#F8FAFC", borderRadius: 8 }}>
          No organizational moves recorded for this employee.
        </div>
      )}

      {history && history.length > 0 && (
        <div
          style={{
            maxHeight: 400,
            overflowY: "auto",
            paddingRight: 4,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {history.map((record, index) => {
            const oldData = record.old_data || {}
            const newData = record.new_data || {}
            const formattedDate = new Date(record.created_at).toLocaleString()

            return (
              <div
                key={record.id || index}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderLeft: `4px solid ${BLUE}`,
                  borderRadius: 8,
                  padding: "12px 14px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: "#64748B", fontWeight: 500 }}>
                    🕒 {formattedDate}
                  </span>
                  {record.reason && (
                    <span style={{ fontSize: 11, background: "#F1F5F9", color: "#475569", padding: "1px 6px", borderRadius: 4 }}>
                      {record.reason}
                    </span>
                  )}
                </div>

                <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", marginBottom: 6, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ color: oldData.position_title ? "#334155" : "#94A3B8" }}>
                    {oldData.position_title || "Unassigned"}
                  </span>
                  <span style={{ color: BLUE, fontWeight: 800 }}>→</span>
                  <span style={{ color: "#1D4ED8" }}>
                    {newData.position_title || "Unassigned"}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 12, color: "#475569", background: "#F8FAFC", padding: "6px 10px", borderRadius: 6 }}>
                  <div>
                    <span style={{ color: "#94A3B8", marginRight: 4 }}>Dept:</span>
                    <strong>{oldData.department_name || "None"}</strong> → <strong>{newData.department_name || "None"}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#94A3B8", marginRight: 4 }}>Manager:</span>
                    <strong>{oldData.manager_name || "None"}</strong> → <strong>{newData.manager_name || "None"}</strong>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Modal>
  )
}

function TreeNode({
  node,
  departments,
  canManage,
  onPositionDrop,
  onEmployeeDrop,
  onHistory,
  onDepartmentChange,
  onAddChild,
  onEdit,
  onDelete,
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [dropState, setDropState] = useState("")
  const children = node.children || []
  const employee = node.employee

  const allowDrop = event => {
    if (!canManage) return
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
    if (dropState !== "valid") setDropState("valid")
  }

  const handleDragEnter = event => {
    if (!canManage) return
    event.preventDefault()
    setDropState("valid")
  }

  const handleDragLeave = event => {
    if (event.currentTarget.contains(event.relatedTarget)) return
    setDropState("")
  }

  const handleDrop = event => {
    event.preventDefault()
    event.stopPropagation()
    setDropState("")
    if (!canManage) return
    try {
      const dataStr = event.dataTransfer.getData("application/json") || event.dataTransfer.getData("text/plain")
      if (!dataStr) return
      const payload = JSON.parse(dataStr)
      if (payload.kind === "position" && payload.id && payload.id !== node.id) {
        onPositionDrop(payload.id, node.id)
      }
      if (payload.kind === "employee" && payload.id && payload.positionId !== node.id) {
        onEmployeeDrop(payload.id, node.id)
      }
    } catch (err) {
      console.error("Drop parsing error:", err)
    }
  }

  return (
    <div className="tree-branch">
      <div
        className={`tree-node ${dropState} ${dragging ? "dragging" : ""}`}
        draggable={canManage}
        onDragStart={event => {
          if (!canManage) return
          // Prevent dragging position node if user is dragging an employee chip, button, or select
          if (event.target.closest('.employee-chip') || event.target.closest('button') || event.target.closest('select')) {
            event.stopPropagation()
            return
          }
          const data = JSON.stringify({ kind: "position", id: node.id })
          event.dataTransfer.setData("application/json", data)
          event.dataTransfer.setData("text/plain", data)
          event.dataTransfer.effectAllowed = "move"
          setDragging(true)
        }}
        onDragEnd={() => setDragging(false)}
        onDragEnter={handleDragEnter}
        onDragOver={allowDrop}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="tree-node-main">
          <div className="tree-node-title">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <strong>{node.title}</strong>
              {canManage && (
                <div style={{ display: "flex", gap: 3 }}>
                  <button
                    type="button"
                    onClick={() => onAddChild(node)}
                    title={`Add subordinate position under ${node.title}`}
                    style={{
                      background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 4,
                      padding: "2px 6px", fontSize: 11, color: BLUE, cursor: "pointer", fontWeight: 700,
                    }}
                  >
                    + Add
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(node)}
                    title={`Rename position ${node.title}`}
                    style={{
                      background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 4,
                      padding: "2px 6px", fontSize: 11, color: "#475569", cursor: "pointer", fontWeight: 500,
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(node)}
                    title={`Delete position ${node.title}`}
                    style={{
                      background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 4,
                      padding: "2px 6px", fontSize: 11, color: "#DC2626", cursor: "pointer", fontWeight: 500,
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            <span>{node.department?.name || "No department"}</span>
          </div>
          {employee ? (
            <div
              className="employee-chip"
              draggable={canManage}
              title={canManage ? "Drag employee to reassign to another position" : undefined}
              style={{
                cursor: canManage ? "grab" : "default",
                background: "#EFF6FF",
                border: "1px solid #BFDBFE",
                borderRadius: 6,
                padding: "5px 8px",
                marginTop: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 6,
              }}
              onDragStart={event => {
                event.stopPropagation()
                const data = JSON.stringify({ kind: "employee", id: employee.id, positionId: node.id })
                event.dataTransfer.setData("application/json", data)
                event.dataTransfer.setData("text/plain", data)
                event.dataTransfer.effectAllowed = "move"
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "#1E3A8A" }}>
                {canManage && <span style={{ color: "#93C5FD", cursor: "grab" }}>⋮⋮</span>}
                👤 {employee.first_name} {employee.last_name}
              </span>
              <button
                type="button"
                style={{
                  background: "#fff", border: "1px solid #BFDBFE", borderRadius: 4,
                  padding: "1px 5px", fontSize: 10, color: BLUE, cursor: "pointer", fontWeight: 500,
                }}
                onClick={event => { event.stopPropagation(); onHistory(employee) }}
              >
                History
              </button>
            </div>
          ) : (
            <span className="vacant">• Vacant position</span>
          )}
        </div>
        <div className="tree-node-actions">
          {canManage && (
            <select
              aria-label={`Department for ${node.title}`}
              value={node.department?.id || ""}
              onChange={event => onDepartmentChange(node, event.target.value || null)}
            >
              <option value="">No department</option>
              {departments.map(department => (
                <option key={department.id} value={department.id}>{department.name}</option>
              ))}
            </select>
          )}
          {children.length > 0 && (
            <button
              className="collapse-button"
              onClick={() => setCollapsed(value => !value)}
              aria-label={`${collapsed ? "Expand" : "Collapse"} ${node.title}`}
            >
              {collapsed ? "+" : "−"}
            </button>
          )}
        </div>
      </div>
      {!collapsed && children.length > 0 && (
        <div className="tree-children">
          {children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              departments={departments}
              canManage={canManage}
              onPositionDrop={onPositionDrop}
              onEmployeeDrop={onEmployeeDrop}
              onHistory={onHistory}
              onDepartmentChange={onDepartmentChange}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function OrgStructure() {
  const [hierarchy, setHierarchy] = useState([])
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [moving, setMoving] = useState(false)
  const [historyEmployee, setHistoryEmployee] = useState(null)

  // Modals state
  const [templateModal, setTemplateModal] = useState({ show: false, selectedKey: "corporate", replace: false })
  const [addModal, setAddModal] = useState({ show: false, parent: null })
  const [editModal, setEditModal] = useState({ show: false, node: null })
  const [deleteModal, setDeleteModal] = useState({ show: false, node: null })

  const [formTitle, setFormTitle] = useState("")
  const [saving, setSaving] = useState(false)
  const [modalError, setModalError] = useState("")

  const viewAllowed = canViewHierarchy()
  const manageAllowed = canManageHierarchy()

  const nodes = useMemo(() => collectNodes(hierarchy), [hierarchy])
  const departments = useMemo(() =>
    Array.from(
      new Map(nodes.filter(node => node.department).map(node => [node.department.id, node.department])).values()
    ),
    [nodes]
  )

  const hasMultipleRoots = !loading && hierarchy.length > 1
  const hasRoot = !loading && hierarchy.length >= 1

  const loadHierarchy = async () => {
    setLoading(true)
    setError("")
    try {
      const [hierRes, tempRes] = await Promise.all([
        api.get("/org/hierarchy"),
        api.get("/admin/org-structure/templates").catch(() => ({ data: { data: [] } })),
      ])
      setHierarchy(hierRes.data.data || [])
      setTemplates(tempRes.data?.data || [])
    } catch (requestError) {
      setError(errorMessage(requestError, "Unable to load organization hierarchy."))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (viewAllowed) loadHierarchy()
    else setLoading(false)
  }, [viewAllowed])

  // ── Drag and Drop Move Handler ─────────────────────────────────────────────
  const move = async payload => {
    if (moving) return
    setMoving(true)
    setError("")
    setNotice("")
    try {
      await api.patch("/org/hierarchy/move", payload)
      await loadHierarchy()
      setNotice("Hierarchy updated successfully.")
      setTimeout(() => setNotice(""), 4000)
    } catch (requestError) {
      const errCode = requestError.response?.data?.error
      if (errCode === "ORG_ALREADY_HAS_ROOT") {
        setError(
          "Only one root (CEO) position is allowed per organization. " +
          "To promote a position to root, the current root must first be assigned a parent."
        )
      } else {
        setError(errorMessage(requestError, "The hierarchy could not be updated. Nothing was changed."))
      }
    } finally {
      setMoving(false)
    }
  }

  // ── Template Application ───────────────────────────────────────────────────
  const handleApplyTemplate = async e => {
    e.preventDefault()
    setSaving(true)
    setModalError("")
    try {
      await api.post("/admin/org-structure/templates/apply", {
        templateKey: templateModal.selectedKey,
        replaceExisting: templateModal.replace || hierarchy.length === 0,
      })
      setTemplateModal({ show: false, selectedKey: "corporate", replace: false })
      setNotice("Starter template applied successfully!")
      setTimeout(() => setNotice(""), 4000)
      loadHierarchy()
    } catch (err) {
      setModalError(errorMessage(err, "Failed to apply template."))
    } finally {
      setSaving(false)
    }
  }

  // ── Add Position ───────────────────────────────────────────────────────────
  const openAdd = (parent = null) => {
    setFormTitle("")
    setModalError("")
    setAddModal({ show: true, parent })
  }

  const handleAdd = async e => {
    e.preventDefault()
    if (!formTitle.trim()) { setModalError("Position title is required"); return }
    setSaving(true)
    setModalError("")
    try {
      await api.post("/admin/org-structure/positions", {
        title: formTitle.trim(),
        parent_id: addModal.parent?.id || null,
      })
      setAddModal({ show: false, parent: null })
      setNotice(`Position "${formTitle.trim()}" created successfully.`)
      setTimeout(() => setNotice(""), 4000)
      loadHierarchy()
    } catch (err) {
      const errCode = err.response?.data?.error
      if (errCode === "ORG_ALREADY_HAS_ROOT") {
        setModalError("Only one root (CEO) position is allowed per organization. Please select a parent position.")
      } else {
        setModalError(errorMessage(err, "Failed to create position."))
      }
    } finally {
      setSaving(false)
    }
  }

  // ── Edit Position ──────────────────────────────────────────────────────────
  const openEdit = node => {
    setFormTitle(node.title)
    setModalError("")
    setEditModal({ show: true, node })
  }

  const handleEdit = async e => {
    e.preventDefault()
    if (!formTitle.trim()) { setModalError("Position title is required"); return }
    setSaving(true)
    setModalError("")
    try {
      await api.patch(`/admin/org-structure/positions/${editModal.node.id}`, { title: formTitle.trim() })
      setEditModal({ show: false, node: null })
      setNotice(`Position renamed to "${formTitle.trim()}".`)
      setTimeout(() => setNotice(""), 4000)
      loadHierarchy()
    } catch (err) {
      setModalError(errorMessage(err, "Failed to update position."))
    } finally {
      setSaving(false)
    }
  }

  // ── Delete Position ────────────────────────────────────────────────────────
  const openDelete = node => {
    setModalError("")
    setDeleteModal({ show: true, node })
  }

  const handleDelete = async () => {
    setSaving(true)
    setModalError("")
    try {
      await api.delete(`/admin/org-structure/positions/${deleteModal.node.id}`)
      setDeleteModal({ show: false, node: null })
      setNotice("Position removed successfully.")
      setTimeout(() => setNotice(""), 4000)
      loadHierarchy()
    } catch (err) {
      setModalError(errorMessage(err, "Failed to delete position."))
    } finally {
      setSaving(false)
    }
  }

  const selectedTemplateObj = templates.find(t => t.id === templateModal.selectedKey)

  const renderTemplatePreview = (node, depth = 0) => {
    if (!node) return null
    return (
      <div key={node.title} style={{ marginLeft: depth * 16, marginTop: 4 }}>
        <div style={{ fontSize: 12, color: depth === 0 ? NAVY : "#475569", fontWeight: depth === 0 ? 700 : 500 }}>
          {depth > 0 ? "↳ " : "👑 "}{node.title}
        </div>
        {node.children && node.children.map(child => renderTemplatePreview(child, depth + 1))}
      </div>
    )
  }

  const inputStyle = {
    width: "100%", padding: "10px 12px", border: "1.5px solid #CBD5E1", borderRadius: 8,
    fontSize: 13.5, color: NAVY, outline: "none", background: "#F8FAFC", boxSizing: "border-box",
  }
  const btnPrimary = {
    padding: "8px 15px", borderRadius: 7, border: "none", background: BLUE, color: "#fff",
    fontSize: 13, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
  }
  const btnSecondary = {
    padding: "8px 15px", borderRadius: 7, border: "1px solid #CBD5E1", background: "#fff",
    color: "#334155", fontSize: 13, fontWeight: 500, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
  }

  return (
    <AppShell>
      <div className="hierarchy-page">
        {/* Page Header */}
        <header className="hierarchy-heading">
          <div>
            <span className="eyebrow">People &amp; reporting</span>
            <h1><OrgIcon size={24} color={BLUE} /> Organizational structure</h1>
            <p>Explore reporting relationships, assign positions, or build the hierarchy tree.</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {manageAllowed && (
              <>
                <button
                  type="button"
                  onClick={() => setTemplateModal({ show: true, selectedKey: "corporate", replace: hierarchy.length > 0 })}
                  style={{ ...btnSecondary, background: "#F0F9FF", borderColor: "#BAE6FD", color: BLUE, fontWeight: 600 }}
                >
                  ⚡ Choose Template
                </button>
                <button
                  type="button"
                  onClick={() => openAdd(null)}
                  disabled={hasRoot}
                  title={hasRoot ? "Only one root (CEO) is allowed. Use '+ Add' on existing posts to add child positions." : "Add the top-level root position"}
                  style={{
                    ...btnPrimary,
                    opacity: hasRoot ? 0.5 : 1,
                    cursor: hasRoot ? "not-allowed" : "pointer",
                  }}
                >
                  + Add Root Position
                </button>
              </>
            )}
            <div className="hierarchy-status">
              {manageAllowed ? "Management enabled" : "View only"}
              {moving && " · Saving..."}
            </div>
          </div>
        </header>

        {/* Data integrity alerts */}
        {hasMultipleRoots && (
          <div className="alert error" role="alert">
            ⚠️ <strong>Data integrity issue:</strong> Organization has {hierarchy.length} root positions.
            Every organization must have exactly one root (CEO) position.
            Please contact support or drag redundant roots under the main CEO.
          </div>
        )}

        {notice && <div className="alert success">{notice}</div>}
        {error && <div className="alert error">{error}</div>}

        {!viewAllowed && (
          <div className="state-panel">
            <h2>Hierarchy unavailable</h2>
            <p>Your account does not have permission to view this organization structure.</p>
          </div>
        )}

        {viewAllowed && (
          <section className="hierarchy-card">
            <div className="card-heading">
              <div>
                <h2>Reporting hierarchy</h2>
                <p>
                  {nodes.length} position{nodes.length !== 1 ? "s" : ""} ·{" "}
                  {manageAllowed
                    ? "Drag positions/employees to reorganize, or use '+ Add' on any node to expand the structure."
                    : "Read-only organizational view."}
                </p>
              </div>
              {moving && <span className="saving">Saving changes...</span>}
            </div>

            {loading ? (
              <p className="state">Loading organization hierarchy...</p>
            ) : hierarchy.length === 0 ? (
              /* Empty State with Template Cards */
              <div style={{ textAlign: "center", padding: "32px 16px" }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>🏛️</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: NAVY, margin: "0 0 6px" }}>
                  No Positions Configured Yet
                </h3>
                <p style={{ fontSize: 13, color: "#64748B", maxWidth: 480, margin: "0 auto 24px" }}>
                  Get started in seconds by picking a pre-built hierarchy template for your industry, or manually add a root position.
                </p>

                {/* Template Quick Selection Grid */}
                <div
                  style={{
                    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: 14, maxWidth: 820, margin: "0 auto 24px", textAlign: "left",
                  }}
                >
                  {templates.map(t => (
                    <div
                      key={t.id}
                      onClick={() => setTemplateModal({ show: true, selectedKey: t.id, replace: false })}
                      style={{
                        border: "1.5px solid #E2E8F0", borderRadius: 12, padding: "16px",
                        background: "#F8FAFC", cursor: "pointer", transition: "all 0.15s ease",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = BLUE
                        e.currentTarget.style.background = "#F0F9FF"
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = "#E2E8F0"
                        e.currentTarget.style.background = "#F8FAFC"
                      }}
                    >
                      <div style={{ fontSize: 24, marginBottom: 8 }}>{t.icon}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: "#64748B", marginTop: 4, lineHeight: 1.4 }}>{t.description}</div>
                      <div style={{ marginTop: 12, fontSize: 12, color: BLUE, fontWeight: 600 }}>
                        Preview &amp; Apply →
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
                  <button type="button" onClick={() => openAdd(null)} style={btnSecondary}>
                    + Build From Scratch (Add Root)
                  </button>
                </div>
              </div>
            ) : (
              /* Active Hierarchy Tree Visualization */
              <div className="tree-scroll">
                <div className="tree-root">
                  {hierarchy.map(node => (
                    <TreeNode
                      key={node.id}
                      node={node}
                      departments={departments}
                      canManage={manageAllowed}
                      onPositionDrop={(positionId, targetParentPositionId) =>
                        move({ type: "position", positionId, targetParentPositionId })
                      }
                      onEmployeeDrop={(employeeId, targetPositionId) =>
                        move({ type: "employee", employeeId, targetPositionId })
                      }
                      onHistory={setHistoryEmployee}
                      onDepartmentChange={(node, targetDepartmentId) =>
                        move({ type: "position", positionId: node.id, targetDepartmentId })
                      }
                      onAddChild={openAdd}
                      onEdit={openEdit}
                      onDelete={openDelete}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── Choose Starter Template Modal ── */}
        {templateModal.show && (
          <Modal
            title="Choose an Organization Starter Template"
            onClose={() => setTemplateModal({ show: false, selectedKey: "corporate", replace: false })}
            maxWidth={640}
          >
            <form onSubmit={handleApplyTemplate}>
              <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 16px" }}>
                Select a standard structure tailored to your organization type. You can freely customize, add, or rename positions after applying.
              </p>

              {/* Template Selector Tabs */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
                {templates.map(t => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setTemplateModal(m => ({ ...m, selectedKey: t.id }))}
                    style={{
                      padding: "10px 8px", borderRadius: 8, textAlign: "center", cursor: "pointer",
                      border: `1.5px solid ${templateModal.selectedKey === t.id ? BLUE : "#E2E8F0"}`,
                      background: templateModal.selectedKey === t.id ? "#EFF6FF" : "#fff",
                      color: templateModal.selectedKey === t.id ? BLUE : "#334155",
                      fontSize: 12.5, fontWeight: templateModal.selectedKey === t.id ? 700 : 500,
                    }}
                  >
                    <div style={{ fontSize: 18, marginBottom: 2 }}>{t.icon}</div>
                    <div>{t.id.charAt(0).toUpperCase() + t.id.slice(1)}</div>
                  </button>
                ))}
              </div>

              {/* Live Preview Box */}
              {selectedTemplateObj && (
                <div
                  style={{
                    background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10,
                    padding: "14px 16px", marginBottom: 16, maxHeight: 220, overflowY: "auto",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 4 }}>
                    {selectedTemplateObj.icon} {selectedTemplateObj.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748B", marginBottom: 10 }}>
                    {selectedTemplateObj.description}
                  </div>
                  <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", marginBottom: 4 }}>
                      Included Hierarchy Preview:
                    </div>
                    {renderTemplatePreview(selectedTemplateObj.structure)}
                  </div>
                </div>
              )}

              {hierarchy.length > 0 && (
                <div
                  style={{
                    background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 8,
                    padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10,
                  }}
                >
                  <input
                    type="checkbox"
                    id="replaceCheck"
                    checked={templateModal.replace}
                    onChange={e => setTemplateModal(m => ({ ...m, replace: e.target.checked }))}
                    style={{ cursor: "pointer", width: 16, height: 16 }}
                  />
                  <label htmlFor="replaceCheck" style={{ fontSize: 12.5, color: "#92400E", cursor: "pointer", margin: 0, fontWeight: 500 }}>
                    Replace existing hierarchy (Reset structure)
                  </label>
                </div>
              )}

              {modalError && <div style={{ color: "#DC2626", fontSize: 13, marginBottom: 12 }}>{modalError}</div>}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setTemplateModal({ show: false, selectedKey: "corporate", replace: false })}
                  style={btnSecondary}
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={btnPrimary}>
                  {saving ? "Applying..." : "Apply This Template"}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* ── Add Position Modal ── */}
        {addModal.show && (
          <Modal
            title={addModal.parent ? `Add Position Under "${addModal.parent.title}"` : "Add Top-Level Root Position (CEO)"}
            onClose={() => setAddModal({ show: false, parent: null })}
          >
            <form onSubmit={handleAdd}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#334155", marginBottom: 6 }}>
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

              {addModal.parent ? (
                <div
                  style={{
                    background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 8,
                    padding: "10px 14px", fontSize: 12.5, color: "#1E40AF", marginBottom: 16,
                  }}
                >
                  📌 Reports directly to: <strong>{addModal.parent.title}</strong>
                </div>
              ) : (
                <div
                  style={{
                    background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 8,
                    padding: "10px 14px", fontSize: 12.5, color: "#92400E", marginBottom: 16,
                  }}
                >
                  👑 This will be created as the organization's single root position (CEO).
                </div>
              )}

              {modalError && <div style={{ color: "#DC2626", fontSize: 13, marginBottom: 12 }}>{modalError}</div>}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={() => setAddModal({ show: false, parent: null })} style={btnSecondary}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={btnPrimary}>
                  {saving ? "Creating..." : "Create Position"}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* ── Edit Position Modal ── */}
        {editModal.show && editModal.node && (
          <Modal
            title={`Edit Position: ${editModal.node.title}`}
            onClose={() => setEditModal({ show: false, node: null })}
          >
            <form onSubmit={handleEdit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#334155", marginBottom: 6 }}>
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
              <div
                style={{
                  background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8,
                  padding: "10px 14px", fontSize: 12.5, color: "#64748B", marginBottom: 16,
                }}
              >
                ℹ️ To move this position under a different manager, drag and drop it onto the desired parent card.
              </div>

              {modalError && <div style={{ color: "#DC2626", fontSize: 13, marginBottom: 12 }}>{modalError}</div>}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={() => setEditModal({ show: false, node: null })} style={btnSecondary}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={btnPrimary}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* ── Delete Confirmation Modal ── */}
        {deleteModal.show && deleteModal.node && (
          <Modal
            title="Delete Position"
            onClose={() => setDeleteModal({ show: false, node: null })}
          >
            <div style={{ fontSize: 14, color: "#334155", marginBottom: 14 }}>
              Are you sure you want to delete <strong>"{deleteModal.node.title}"</strong>?
            </div>
            <div
              style={{
                background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8,
                padding: "10px 14px", fontSize: 12.5, color: "#B91C1C", marginBottom: 18,
              }}
            >
              ⚠️ This will also remove any subordinate child positions under it. Positions with active assigned employees cannot be deleted until employees are reassigned.
            </div>

            {modalError && <div style={{ color: "#DC2626", fontSize: 13, marginBottom: 12 }}>{modalError}</div>}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" onClick={() => setDeleteModal({ show: false, node: null })} style={btnSecondary}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={saving} style={{ ...btnPrimary, background: "#DC2626" }}>
                {saving ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </Modal>
        )}

        {/* ── Employee Mobility History Modal ── */}
        {historyEmployee && (
          <EmployeeHistory employee={historyEmployee} onClose={() => setHistoryEmployee(null)} />
        )}
      </div>
    </AppShell>
  )
}

