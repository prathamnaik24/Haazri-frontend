import React, { useState, useEffect } from 'react';
import {
  getEmployeeCompensation,
  upsertSalaryStructure,
  addSalaryComponent,
  updateSalaryComponent,
  deleteSalaryComponent,
} from '../../services/compensation';

const COMPONENT_TYPES = [
  'BASIC',
  'HRA',
  'STANDARD_ALLOWANCE',
  'PERFORMANCE_BONUS',
  'LTA',
  'FIXED_ALLOWANCE',
  'STOCK_EQUITY',
];

export default function CompensationModal({ employee, onClose, onSaveSuccess }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [compensationData, setCompensationData] = useState(null);

  // Base structure form
  const [baseSalary, setBaseSalary] = useState('');
  const [allowances, setAllowances] = useState('0');

  // Add component form
  const [showAddComponent, setShowAddComponent] = useState(false);
  const [newComp, setNewComp] = useState({
    component_type: 'BASIC',
    calculation_type: 'FIXED',
    percentage_base: 'BASIC',
    configured_value: '',
  });

  const fetchCompensation = async () => {
    if (!employee || !employee.id) return;
    setLoading(true);
    setError('');
    try {
      const res = await getEmployeeCompensation(employee.id);
      const data = res.data || {};
      setCompensationData(data);

      if (data.salary_structure) {
        setBaseSalary(data.salary_structure.base_salary || '');
        setAllowances(data.salary_structure.allowances || '0');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load employee compensation structure');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompensation();
  }, [employee]);

  const handleUpdateStructure = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await upsertSalaryStructure(employee.id, {
        base_salary: parseFloat(baseSalary),
        allowances: parseFloat(allowances || 0),
      });
      setSuccess('Base salary structure updated successfully!');
      await fetchCompensation();
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update base salary structure');
    } finally {
      setSaving(false);
    }
  };

  const handleAddComponent = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await addSalaryComponent(employee.id, {
        ...newComp,
        configured_value: parseFloat(newComp.configured_value),
        percentage_base: newComp.calculation_type === 'PERCENTAGE' ? newComp.percentage_base : undefined,
      });
      setSuccess('Salary component added successfully!');
      setShowAddComponent(false);
      setNewComp({
        component_type: 'BASIC',
        calculation_type: 'FIXED',
        percentage_base: 'BASIC',
        configured_value: '',
      });
      await fetchCompensation();
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add salary component');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleComponent = async (componentId, currentStatus) => {
    try {
      await updateSalaryComponent(componentId, { is_active: !currentStatus });
      fetchCompensation();
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update component status');
    }
  };

  const handleDeleteComponent = async (componentId) => {
    if (!window.confirm('Are you sure you want to deactivate this component?')) return;
    try {
      await deleteSalaryComponent(componentId);
      fetchCompensation();
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete salary component');
    }
  };

  if (!employee) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
      zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: '#FFFFFF', borderRadius: 16, width: '100%', maxWidth: 720,
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden', maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid #E2E8F0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC',
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0F172A' }}>
              Manage Wage & Compensation Structure
            </h3>
            <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
              {employee.first_name} {employee.last_name} ({employee.employee_id || employee.email})
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748B' }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
              {success}
            </div>
          )}

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#64748B', fontSize: 14 }}>
              Loading compensation details...
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              {compensationData?.summary && (
                <div style={{
                  background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
                  borderRadius: 12, padding: 18, color: '#FFFFFF', marginBottom: 20,
                  display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, textAlign: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600 }}>Base Salary</div>
                    <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>₹{parseFloat(compensationData.summary.base_salary || 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600 }}>Allowances</div>
                    <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>₹{parseFloat(compensationData.summary.allowances || 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600 }}>Components</div>
                    <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>₹{parseFloat(compensationData.summary.components_total || 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#38BDF8', textTransform: 'uppercase', fontWeight: 700 }}>Total Wage</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#38BDF8', marginTop: 4 }}>
                      ₹{parseFloat(compensationData.summary.total_monthly_compensation || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}

              {/* Base Salary Structure Form */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 15, fontWeight: 700, color: '#1E293B' }}>
                  1. Base Salary & General Allowances
                </h4>
                <form onSubmit={handleUpdateStructure} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>Base Monthly Salary (₹) *</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      placeholder="e.g. 50000"
                      value={baseSalary}
                      onChange={(e) => setBaseSalary(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>Fixed Allowances (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={allowances}
                      onChange={(e) => setAllowances(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: 6,
                      padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    {saving ? 'Updating...' : 'Save Base'}
                  </button>
                </form>
              </div>

              {/* Salary Components Section */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1E293B' }}>
                    2. Salary Components Breakdown
                  </h4>
                  <button
                    onClick={() => setShowAddComponent(!showAddComponent)}
                    style={{
                      background: '#F1F5F9', color: '#0F172A', border: '1px solid #CBD5E1',
                      borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    {showAddComponent ? 'Cancel' : '+ Add Component'}
                  </button>
                </div>

                {/* Add Component Form */}
                {showAddComponent && (
                  <form onSubmit={handleAddComponent} style={{ background: '#F8FAFC', padding: 14, borderRadius: 8, border: '1px solid #E2E8F0', marginBottom: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>Component Type *</label>
                        <select
                          value={newComp.component_type}
                          onChange={(e) => setNewComp({ ...newComp, component_type: e.target.value })}
                          style={{ width: '100%', padding: '8px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 13 }}
                        >
                          {COMPONENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>Calculation Method *</label>
                        <select
                          value={newComp.calculation_type}
                          onChange={(e) => setNewComp({ ...newComp, calculation_type: e.target.value })}
                          style={{ width: '100%', padding: '8px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 13 }}
                        >
                          <option value="FIXED">FIXED (Amount in ₹)</option>
                          <option value="PERCENTAGE">PERCENTAGE (%)</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: newComp.calculation_type === 'PERCENTAGE' ? '1fr 1fr 1fr' : '1fr 1fr', gap: 10, marginBottom: 12 }}>
                      {newComp.calculation_type === 'PERCENTAGE' && (
                        <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>Percentage Base *</label>
                          <select
                            value={newComp.percentage_base}
                            onChange={(e) => setNewComp({ ...newComp, percentage_base: e.target.value })}
                            style={{ width: '100%', padding: '8px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 13 }}
                          >
                            <option value="BASIC">% of Base Salary</option>
                            <option value="WAGE">% of Total Monthly Wage</option>
                          </select>
                        </div>
                      )}

                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                          {newComp.calculation_type === 'PERCENTAGE' ? 'Percentage Value (%) *' : 'Configured Amount (₹) *'}
                        </label>
                        <input
                          type="number"
                          required
                          step="0.01"
                          placeholder={newComp.calculation_type === 'PERCENTAGE' ? 'e.g. 50' : 'e.g. 15000'}
                          value={newComp.configured_value}
                          onChange={(e) => setNewComp({ ...newComp, configured_value: e.target.value })}
                          style={{ width: '100%', padding: '8px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }}
                        />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'end' }}>
                        <button
                          type="submit"
                          disabled={saving}
                          style={{ width: '100%', background: '#059669', color: '#FFFFFF', border: 'none', borderRadius: 6, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                        >
                          {saving ? 'Adding...' : 'Add Component'}
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Components Table */}
                {(!compensationData?.salary_components || compensationData.salary_components.length === 0) ? (
                  <div style={{ padding: 20, textAlign: 'center', color: '#94A3B8', fontSize: 13, italic: 'true' }}>
                    No custom salary components configured yet.
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', background: '#F8FAFC' }}>
                        <th style={{ padding: '8px 10px' }}>Component</th>
                        <th style={{ padding: '8px 10px' }}>Calculation</th>
                        <th style={{ padding: '8px 10px' }}>Configured Value</th>
                        <th style={{ padding: '8px 10px' }}>Computed Amount</th>
                        <th style={{ padding: '8px 10px' }}>Status</th>
                        <th style={{ padding: '8px 10px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {compensationData.salary_components.map((comp) => (
                        <tr key={comp.id} style={{ borderBottom: '1px solid #F1F5F9', color: '#1E293B' }}>
                          <td style={{ padding: '10px', fontWeight: 600 }}>{comp.component_type}</td>
                          <td style={{ padding: '10px', color: '#64748B' }}>
                            {comp.calculation_type === 'PERCENTAGE' 
                              ? `${comp.configured_value}% of ${comp.percentage_base}` 
                              : 'FIXED'}
                          </td>
                          <td style={{ padding: '10px' }}>
                            {comp.calculation_type === 'PERCENTAGE' ? `${comp.configured_value}%` : `₹${parseFloat(comp.configured_value).toLocaleString()}`}
                          </td>
                          <td style={{ padding: '10px', fontWeight: 700, color: '#2563EB' }}>
                            ₹{parseFloat(comp.calculated_amount || 0).toLocaleString()}
                          </td>
                          <td style={{ padding: '10px' }}>
                            <span style={{
                              background: comp.is_active ? '#ECFDF5' : '#F1F5F9',
                              color: comp.is_active ? '#059669' : '#64748B',
                              padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                            }}>
                              {comp.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td style={{ padding: '10px', textAlign: 'right' }}>
                            <button
                              onClick={() => handleToggleComponent(comp.id, comp.is_active)}
                              style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: 12, cursor: 'pointer', marginRight: 8, fontWeight: 600 }}
                            >
                              {comp.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDeleteComponent(comp.id)}
                              style={{ background: 'none', border: 'none', color: '#DC2626', fontSize: 12, cursor: 'pointer' }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
