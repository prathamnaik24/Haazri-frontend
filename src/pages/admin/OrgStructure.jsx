import React, { useState, useEffect } from 'react'
import AppShell from '../../components/layout/AppShell.jsx'
import { card, cardTitle } from '../../components/ui/styles.js'
import { OrgIcon, PlusIcon } from '../../components/ui/Icons.jsx'

export default function OrgStructure() {
  const [hierarchy, setHierarchy] = useState([])
  const [loading, setLoading] = useState(true)

  // Temporarily use mock data
  useEffect(() => {
    setTimeout(() => {
      setHierarchy([
        {
          id: 'ceo',
          title: 'CEO',
          name: 'John Admin',
          children: [
            {
              id: 'cto',
              title: 'CTO',
              name: 'Vacant',
              children: [
                { id: 'senior_dev', title: 'Senior Developer', name: 'Vacant', children: [] },
                { id: 'junior_dev', title: 'Junior Developer', name: 'Vacant', children: [] }
              ]
            },
            {
              id: 'hr_dir',
              title: 'HR Director',
              name: 'Vacant',
              children: []
            }
          ]
        }
      ])
      setLoading(false)
    }, 500)
  }, [])

  const renderTree = (nodes) => {
    return (
      <ul style={{ listStyleType: 'none', paddingLeft: 24, margin: 0, position: 'relative' }}>
        {nodes.map((node, i) => (
          <li key={node.id} style={{ position: 'relative', padding: '12px 0 0 16px' }}>
            {/* Tree lines */}
            <div style={{ position: 'absolute', top: 32, left: -8, width: 24, height: 1, background: '#D7E6EF' }} />
            <div style={{ position: 'absolute', top: 0, bottom: i === nodes.length - 1 ? 'auto' : 0, height: i === nodes.length - 1 ? 32 : '100%', left: -8, width: 1, background: '#D7E6EF' }} />
            
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', background: '#FFFFFF', border: '1px solid #D7E6EF',
              borderRadius: 8, width: 300, boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#172B3A' }}>{node.title}</div>
                <div style={{ fontSize: 12, color: node.name === 'Vacant' ? '#f59e0b' : '#526B7A', marginTop: 2 }}>
                  {node.name}
                </div>
              </div>
              <button style={{ background: 'none', border: 'none', color: '#1677B8', cursor: 'pointer' }}>Edit</button>
            </div>
            
            {node.children && node.children.length > 0 && renderTree(node.children)}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <AppShell>
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#172B3A', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <OrgIcon size={24} color="#1677B8" /> Organization Structure
            </h1>
            <p style={{ fontSize: 14, color: '#526B7A', margin: '4px 0 0' }}>Manage departments and reporting hierarchy.</p>
          </div>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
            background: '#1677B8', color: '#fff', border: 'none', borderRadius: 8,
            fontSize: 14, fontWeight: 600, cursor: 'pointer'
          }}>
            <PlusIcon size={16} /> Add Position
          </button>
        </div>

        <div style={{ ...card, background: '#F7FAFC' }}>
          <h2 style={cardTitle}>Hierarchy Tree</h2>
          <div style={{ marginTop: 20 }}>
            {loading ? <div style={{ color: '#526B7A' }}>Loading structure...</div> : (
              <div style={{ marginLeft: -24 }}>
                {renderTree(hierarchy)}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
