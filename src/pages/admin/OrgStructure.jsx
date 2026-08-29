import React, { useEffect, useMemo, useState } from 'react'
import AppShell from '../../components/layout/AppShell.jsx'
import { OrgIcon } from '../../components/ui/Icons.jsx'
import api from '../../services/api.js'
import { canManageHierarchy, canViewHierarchy } from '../../utils/auth.js'

const BLUE = '#1677B8'

function errorMessage(error, fallback) { return error.response?.data?.message || error.message || fallback }

function collectNodes(nodes, result = []) {
  nodes.forEach(node => { result.push(node); collectNodes(node.children || [], result) })
  return result
}

function EmployeeHistory({ employee, onClose }) {
  const [history, setHistory] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    api.get(`/org/hierarchy/mobility/${employee.id}`)
      .then(response => { if (active) setHistory(response.data.data || []) })
      .catch(requestError => { if (active) setError(errorMessage(requestError, 'Unable to load mobility history.')) })
    return () => { active = false }
  }, [employee.id])

  return <div className="hierarchy-modal-backdrop" onClick={event => event.target === event.currentTarget && onClose()}>
    <section className="hierarchy-modal" role="dialog" aria-modal="true" aria-labelledby="history-title">
      <div className="hierarchy-modal-header"><div><span className="eyebrow">Read-only record</span><h2 id="history-title">{employee.first_name} {employee.last_name}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close history">×</button></div>
      {error && <div className="alert error">{error}</div>}
      {!history && !error && <p className="state">Loading mobility history...</p>}
      {history && history.length === 0 && <p className="state">No organizational moves recorded.</p>}
      {history && history.length > 0 && <div className="history-list">{history.map(record => { const oldData = record.old_data || {}; const newData = record.new_data || {}; return <article className="history-entry" key={record.id}><time>{new Date(record.created_at).toLocaleString()}</time><strong>{oldData.position_title || 'Unassigned'} → {newData.position_title || 'Unassigned'}</strong><span>{oldData.department_name || 'No department'} → {newData.department_name || 'No department'}</span><span>Manager: {oldData.manager_name || 'None'} → {newData.manager_name || 'None'}</span>{record.reason && <small>{record.reason}</small>}</article> })}</div>}
    </section>
  </div>
}

function TreeNode({ node, departments, canManage, onPositionDrop, onEmployeeDrop, onHistory, onDepartmentChange }) {
  const [collapsed, setCollapsed] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [dropState, setDropState] = useState('')
  const children = node.children || []
  const employee = node.employee
    const allowDrop = event => { if (!canManage) return; event.preventDefault(); setDropState('valid') }
  const handleDrop = event => {
    event.preventDefault(); setDropState('')
    if (!canManage) return
    const payload = JSON.parse(event.dataTransfer.getData('application/json') || '{}')
    if (payload.kind === 'position' && payload.id !== node.id) onPositionDrop(payload.id, node.id)
    if (payload.kind === 'employee' && payload.id && payload.positionId !== node.id) onEmployeeDrop(payload.id, node.id)
  }

  return <div className="tree-branch">
    <div className={`tree-node ${dropState} ${dragging ? 'dragging' : ''}`} draggable={canManage} onDragStart={event => { if (!canManage) return; event.dataTransfer.setData('application/json', JSON.stringify({ kind: 'position', id: node.id })); event.dataTransfer.effectAllowed = 'move'; setDragging(true) }} onDragEnd={() => setDragging(false)} onDragOver={allowDrop} onDragLeave={() => setDropState('')} onDrop={handleDrop}>
      <div className="tree-node-main"><div className="tree-node-title"><strong>{node.title}</strong><span>{node.department?.name || 'No department'}</span></div>{employee ? <div className="employee-chip" draggable={canManage} onDragStart={event => { event.stopPropagation(); event.dataTransfer.setData('application/json', JSON.stringify({ kind: 'employee', id: employee.id, positionId: node.id })); event.dataTransfer.effectAllowed = 'move' }}><span>{employee.first_name} {employee.last_name}</span><button onClick={event => { event.stopPropagation(); onHistory(employee) }}>History</button></div> : <span className="vacant">Vacant position</span>}</div>
      <div className="tree-node-actions">{canManage && <select aria-label={`Department for ${node.title}`} value={node.department?.id || ''} onChange={event => onDepartmentChange(node, event.target.value || null)}><option value="">No department</option>{departments.map(department => <option key={department.id} value={department.id}>{department.name}</option>)}</select>}{children.length > 0 && <button className="collapse-button" onClick={() => setCollapsed(value => !value)} aria-label={`${collapsed ? 'Expand' : 'Collapse'} ${node.title}`}>{collapsed ? '+' : '−'}</button>}</div>
    </div>
    {!collapsed && children.length > 0 && <div className="tree-children">{children.map(child => <TreeNode key={child.id} node={child} departments={departments} canManage={canManage} onPositionDrop={onPositionDrop} onEmployeeDrop={onEmployeeDrop} onHistory={onHistory} onDepartmentChange={onDepartmentChange} />)}</div>}
  </div>
}

export default function OrgStructure() {
  const [hierarchy, setHierarchy] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [moving, setMoving] = useState(false)
  const [historyEmployee, setHistoryEmployee] = useState(null)
  const viewAllowed = canViewHierarchy()
  const manageAllowed = canManageHierarchy()
  const nodes = useMemo(() => collectNodes(hierarchy), [hierarchy])
  const departments = useMemo(() => Array.from(new Map(nodes.filter(node => node.department).map(node => [node.department.id, node.department])).values()), [nodes])

  const loadHierarchy = async () => { setLoading(true); setError(''); try { const response = await api.get('/org/hierarchy'); setHierarchy(response.data.data || []) } catch (requestError) { setError(errorMessage(requestError, 'Unable to load organization hierarchy.')) } finally { setLoading(false) } }
  useEffect(() => { if (viewAllowed) loadHierarchy(); else setLoading(false) }, [viewAllowed])
  const move = async payload => { if (moving) return; setMoving(true); setError(''); setNotice(''); try { await api.patch('/org/hierarchy/move', payload); await loadHierarchy(); setNotice('Hierarchy updated successfully.') } catch (requestError) { setError(errorMessage(requestError, 'The hierarchy could not be updated. Nothing was changed.')) } finally { setMoving(false) } }

  return <AppShell><div className="hierarchy-page"><header className="hierarchy-heading"><div><span className="eyebrow">People & reporting</span><h1><OrgIcon size={24} color={BLUE} /> Organizational structure</h1><p>Explore the reporting relationships across your organization.</p></div><div className="hierarchy-status">{manageAllowed ? 'Management enabled' : 'View only'}{moving && ' · Saving...'}</div></header>{notice && <div className="alert success">{notice}</div>}{error && <div className="alert error">{error}</div>}{!viewAllowed && <div className="state-panel"><h2>Hierarchy unavailable</h2><p>Your account does not have permission to view this organization structure.</p></div>}{viewAllowed && <section className="hierarchy-card"><div className="card-heading"><div><h2>Reporting hierarchy</h2><p>{nodes.length} positions · {manageAllowed ? 'Drag a position or employee to reorganize.' : 'Read-only organizational view.'}</p></div>{moving && <span className="saving">Saving changes...</span>}</div>{loading && <p className="state">Loading organization hierarchy...</p>}{!loading && hierarchy.length === 0 && <p className="state">No active positions are configured for this organization.</p>}{!loading && hierarchy.length > 0 && <div className="tree-scroll"><div className="tree-root">{hierarchy.map(node => <TreeNode key={node.id} node={node} departments={departments} canManage={manageAllowed} onPositionDrop={(positionId, targetParentPositionId) => move({ type: 'position', positionId, targetParentPositionId })} onEmployeeDrop={(employeeId, targetPositionId) => move({ type: 'employee', employeeId, targetPositionId })} onHistory={setHistoryEmployee} onDepartmentChange={(node, targetDepartmentId) => move({ type: 'position', positionId: node.id, targetDepartmentId })} />)}</div></div>}</section>}{historyEmployee && <EmployeeHistory employee={historyEmployee} onClose={() => setHistoryEmployee(null)} />}</div></AppShell>
}
