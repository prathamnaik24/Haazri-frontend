import React, { useState, useEffect } from 'react'
import AppShell from '../../components/layout/AppShell'
import api from '../../services/api'
import { getUserRole } from '../../utils/auth'

const RECORD_TYPES = ['SALARY', 'BONUS', 'DEDUCTION', 'PAYSLIP', 'OTHER']

export default function FinancePage() {
  const role = getUserRole()
  const isPrivileged = role === 'org_admin' || role === 'ceo'

  const [records, setRecords] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Filters
  const [filterType, setFilterType] = useState('')
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString())
  const [filterMonth, setFilterMonth] = useState('')
  const [filterPerson, setFilterPerson] = useState('')

  // Create Modal State
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    person_id: '',
    record_type: 'SALARY',
    amount: '',
    period_month: new Date().getMonth() + 1,
    period_year: new Date().getFullYear(),
    currency: 'INR',
    description: '',
  })

  const fetchRecords = async () => {
    setLoading(true)
    setError('')
    try {
      if (isPrivileged) {
        const params = new URLSearchParams()
        if (filterType) params.append('record_type', filterType)
        if (filterYear) params.append('period_year', filterYear)
        if (filterMonth) params.append('period_month', filterMonth)
        if (filterPerson) params.append('person_id', filterPerson)

        const res = await api.get(`/finance/records?${params.toString()}`)
        const recData = res.data?.data
        setRecords(Array.isArray(recData) ? recData : [])
      } else {
        const params = new URLSearchParams()
        if (filterType) params.append('record_type', filterType)
        if (filterYear) params.append('period_year', filterYear)

        const res = await api.get(`/finance/records/me?${params.toString()}`)
        const recData = res.data?.data
        setRecords(Array.isArray(recData) ? recData : [])
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch financial records')
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    if (!isPrivileged) return
    try {
      const res = await api.get('/org/employees')
      const empData = res.data?.data?.employees || res.data?.data || []
      setEmployees(Array.isArray(empData) ? empData : [])
    } catch (err) {
      console.error('Failed to load employees for finance dropdown:', err)
      setEmployees([])
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [filterType, filterYear, filterMonth, filterPerson, isPrivileged])

  useEffect(() => {
    fetchEmployees()
  }, [isPrivileged])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await api.post('/finance/records', {
        ...form,
        amount: parseFloat(form.amount),
        period_month: parseInt(form.period_month, 10),
        period_year: parseInt(form.period_year, 10),
      })
      setSuccess('Financial record created successfully!')
      setShowModal(false)
      setForm({
        person_id: '',
        record_type: 'SALARY',
        amount: '',
        period_month: new Date().getMonth() + 1,
        period_year: new Date().getFullYear(),
        currency: 'INR',
        description: '',
      })
      fetchRecords()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create financial record')
    } finally {
      setSaving(false)
    }
  }

  // Aggregate stats
  const safeRecords = Array.isArray(records) ? records : []
  const totalAmount = safeRecords.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0)
  const salarySum = safeRecords.filter(r => r.record_type === 'SALARY').reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0)
  const bonusSum = safeRecords.filter(r => r.record_type === 'BONUS').reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0)
  const deductionSum = safeRecords.filter(r => r.record_type === 'DEDUCTION').reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0)

  const badgeColors = {
    SALARY: { bg: '#EBF8FF', color: '#2B6CB0', border: '#BEE3F8' },
    BONUS: { bg: '#F0FFF4', color: '#276749', border: '#C6F6D5' },
    DEDUCTION: { bg: '#FFF5F5', color: '#9B2C2C', border: '#FED7D7' },
    PAYSLIP: { bg: '#FAF5FF', color: '#6B46C1', border: '#E9D8FD' },
    OTHER: { bg: '#EDF2F7', color: '#4A5568', border: '#CBD5E0' },
  }

  return (
    <AppShell>
      <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#172B3A', margin: 0 }}>
              {isPrivileged ? 'Financial Management' : 'My Financial Records & Payslips'}
            </h1>
            <p style={{ fontSize: 14, color: '#526B7A', margin: '4px 0 0' }}>
              {isPrivileged
                ? 'Role-restricted financial records, compensations, bonuses, and salary ledger'
                : 'View your official salary payouts, bonuses, and tax/deduction statements'}
            </p>
          </div>
          {isPrivileged && (
            <button
              onClick={() => setShowModal(true)}
              style={{
                background: '#517891', color: '#FFFFFF', border: 'none', borderRadius: 8,
                padding: '10px 18px', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#406277'}
              onMouseLeave={e => e.currentTarget.style.background = '#517891'}
            >
              + Add Record
            </button>
          )}
        </div>

        {/* Feedback alerts */}
        {error && (
          <div style={{ background: '#FFF5F5', border: '1px solid #FED7D7', color: '#C53030', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: '#F0FFF4', border: '1px solid #C6F6D5', color: '#276749', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
            {success}
          </div>
        )}

        {/* Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #D7E6EF', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#526B7A', textTransform: 'uppercase' }}>
              {isPrivileged ? 'Total Value' : 'Net Total Recorded'}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#172B3A', marginTop: 8 }}>
              ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #D7E6EF', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#2B6CB0', textTransform: 'uppercase' }}>Salaries</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#2B6CB0', marginTop: 8 }}>
              ₹{salarySum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #D7E6EF', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#276749', textTransform: 'uppercase' }}>Bonuses</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#276749', marginTop: 8 }}>
              ₹{bonusSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #D7E6EF', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#9B2C2C', textTransform: 'uppercase' }}>Deductions</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#9B2C2C', marginTop: 8 }}>
              ₹{deductionSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{ background: '#FFFFFF', border: '1px solid #D7E6EF', borderRadius: 12, padding: 16, marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #CBD5E0', borderRadius: 6, fontSize: 14, background: '#FFFFFF' }}
          >
            <option value="">All Types</option>
            {RECORD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <select
            value={filterYear}
            onChange={e => setFilterYear(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #CBD5E0', borderRadius: 6, fontSize: 14, background: '#FFFFFF' }}
          >
            <option value="">All Years</option>
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          {isPrivileged && (
            <>
              <select
                value={filterMonth}
                onChange={e => setFilterMonth(e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid #CBD5E0', borderRadius: 6, fontSize: 14, background: '#FFFFFF' }}
              >
                <option value="">All Months</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>

              <select
                value={filterPerson}
                onChange={e => setFilterPerson(e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid #CBD5E0', borderRadius: 6, fontSize: 14, background: '#FFFFFF' }}
              >
                <option value="">All Employees</option>
                {(Array.isArray(employees) ? employees : []).map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name} ({emp.email})
                  </option>
                ))}
              </select>
            </>
          )}

          <div style={{ flex: 1 }} />
          <button
            onClick={() => {
              setFilterType('')
              setFilterYear(new Date().getFullYear().toString())
              setFilterMonth('')
              setFilterPerson('')
            }}
            style={{ background: '#EDF2F7', border: 'none', borderRadius: 6, padding: '8px 14px', fontSize: 13, cursor: 'pointer', color: '#4A5568' }}
          >
            Reset Filters
          </button>
        </div>

        {/* Records Table */}
        <div style={{ background: '#FFFFFF', border: '1px solid #D7E6EF', borderRadius: 12, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#526B7A', fontSize: 14 }}>
              Loading financial records...
            </div>
          ) : (!Array.isArray(records) || records.length === 0) ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#526B7A', fontSize: 14 }}>
              No financial records found for the selected filters.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #D7E6EF', fontSize: 13, color: '#526B7A' }}>
                  {isPrivileged && <th style={{ padding: '14px 18px', fontWeight: 600 }}>Employee</th>}
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Type</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Period</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Amount</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Description</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Recorded On</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(records) ? records : []).map((rec) => {
                  const style = badgeColors[rec.record_type] || badgeColors.OTHER
                  const period = rec.period_month && rec.period_year
                    ? `${new Date(2000, rec.period_month - 1, 1).toLocaleString('default', { month: 'short' })} ${rec.period_year}`
                    : rec.period_year ? `${rec.period_year}` : '—'

                  return (
                    <tr key={rec.id} style={{ borderBottom: '1px solid #EDF2F7', fontSize: 14, color: '#172B3A' }}>
                      {isPrivileged && (
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ fontWeight: 600 }}>{rec.first_name} {rec.last_name}</div>
                          <div style={{ fontSize: 12, color: '#718096' }}>{rec.email}</div>
                        </td>
                      )}
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          background: style.bg, color: style.color, border: `1px solid ${style.border}`,
                          padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600
                        }}>
                          {rec.record_type}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#4A5568' }}>{period}</td>
                      <td style={{ padding: '14px 18px', fontWeight: 700 }}>
                        {rec.currency === 'INR' ? '₹' : rec.currency} {parseFloat(rec.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#718096', maxWidth: 280 }}>
                        {rec.description || '—'}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#718096', fontSize: 13 }}>
                        {new Date(rec.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Add Record Modal */}
        {showModal && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
          }}>
            <div style={{ background: '#FFFFFF', borderRadius: 12, width: '100%', maxWidth: 500, padding: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#172B3A' }}>Add Financial Record</h3>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#718096' }}>✕</button>
              </div>

              <form onSubmit={handleCreate}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A5568', marginBottom: 6 }}>Employee *</label>
                  <select
                    required
                    value={form.person_id}
                    onChange={e => setForm({ ...form, person_id: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E0', borderRadius: 6, fontSize: 14 }}
                  >
                    <option value="">Select an employee...</option>
                    {(Array.isArray(employees) ? employees : []).map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name} ({emp.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A5568', marginBottom: 6 }}>Record Type *</label>
                    <select
                      value={form.record_type}
                      onChange={e => setForm({ ...form, record_type: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E0', borderRadius: 6, fontSize: 14 }}
                    >
                      {RECORD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A5568', marginBottom: 6 }}>Amount (INR) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="50000.00"
                      value={form.amount}
                      onChange={e => setForm({ ...form, amount: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E0', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A5568', marginBottom: 6 }}>Month</label>
                    <select
                      value={form.period_month}
                      onChange={e => setForm({ ...form, period_month: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E0', borderRadius: 6, fontSize: 14 }}
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A5568', marginBottom: 6 }}>Year</label>
                    <input
                      type="number"
                      value={form.period_year}
                      onChange={e => setForm({ ...form, period_year: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E0', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A5568', marginBottom: 6 }}>Description / Notes</label>
                  <textarea
                    rows={3}
                    placeholder="e.g., Monthly performance incentive or standard salary disbursement"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E0', borderRadius: 6, fontSize: 14, boxSizing: 'border-box', fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{ background: '#EDF2F7', border: 'none', borderRadius: 6, padding: '10px 18px', fontSize: 14, cursor: 'pointer', color: '#4A5568', fontWeight: 600 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{ background: '#517891', border: 'none', borderRadius: 6, padding: '10px 20px', fontSize: 14, cursor: 'pointer', color: '#FFFFFF', fontWeight: 600 }}
                  >
                    {saving ? 'Saving...' : 'Save Record'}
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
