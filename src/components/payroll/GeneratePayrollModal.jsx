import React, { useState } from 'react';
import { generateMonthlyPayroll } from '../../services/payroll';

export default function GeneratePayrollModal({ employee, onClose, onSuccess }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [workingDays, setWorkingDays] = useState(22);
  const [paidDays, setPaidDays] = useState(22);

  // Deductions
  const [tds, setTds] = useState('0');
  const [providentFund, setProvidentFund] = useState('0');
  const [professionalTax, setProfessionalTax] = useState('200');
  const [otherDeductions, setOtherDeductions] = useState('0');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await generateMonthlyPayroll({
        person_id: employee.id,
        month: parseInt(month, 10),
        year: parseInt(year, 10),
        working_days: parseInt(workingDays, 10),
        paid_days: parseInt(paidDays, 10),
        tds: parseFloat(tds || 0),
        provident_fund: parseFloat(providentFund || 0),
        professional_tax: parseFloat(professionalTax || 0),
        other_deductions: parseFloat(otherDeductions || 0),
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate monthly payroll');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
      zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: '#FFFFFF', borderRadius: 16, width: '100%', maxWidth: 560,
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px', borderBottom: '1px solid #E2E8F0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC',
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0F172A' }}>
              Compute & Generate Monthly Payroll
            </h3>
            <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
              Target: {employee?.first_name} {employee?.last_name} ({employee?.employee_id || employee?.email})
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748B' }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: 24 }}>
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Period Selection */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Month *</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 14 }}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Year *</label>
                <input
                  type="number"
                  required
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Attendance Days */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Total Working Days</label>
                <input
                  type="number"
                  value={workingDays}
                  onChange={(e) => setWorkingDays(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Paid Days</label>
                <input
                  type="number"
                  value={paidDays}
                  onChange={(e) => setPaidDays(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Deductions Input Grid */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: 14, marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 10 }}>Deductions Configuration (₹)</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>Provident Fund (PF)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={providentFund}
                    onChange={(e) => setProvidentFund(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>Professional Tax (PT)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={professionalTax}
                    onChange={(e) => setProfessionalTax(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>Income Tax (TDS)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={tds}
                    onChange={(e) => setTds(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>Other Deductions</label>
                  <input
                    type="number"
                    step="0.01"
                    value={otherDeductions}
                    onChange={(e) => setOtherDeductions(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="button" onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: 6, padding: '10px 16px', fontSize: 14, color: '#475569', fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="submit" disabled={saving} style={{ background: '#4F46E5', border: 'none', borderRadius: 6, padding: '10px 20px', fontSize: 14, color: '#FFFFFF', fontWeight: 600, cursor: 'pointer' }}>
                {saving ? 'Computing...' : 'Generate Payroll'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
