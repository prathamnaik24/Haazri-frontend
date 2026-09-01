import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import api from '../../services/api';
import { getFinanceSummary, getFinancialSnapshots, generateSnapshot } from '../../services/subscriptions';
import {
  getMyCompensation,
  getIncrements,
  getMyIncrements,
} from '../../services/compensation';
import {
  getPayrollRecords,
  getMyPayrollHistory,
  updatePayrollStatus,
  getMyPayslips,
  getPersonPayslips,
} from '../../services/payroll';
import { getUserRole } from '../../utils/auth';

// Payroll Modals
import PayslipModal from '../../components/payroll/PayslipModal';
import CompensationModal from '../../components/payroll/CompensationModal';
import IncrementModal from '../../components/payroll/IncrementModal';
import GeneratePayrollModal from '../../components/payroll/GeneratePayrollModal';

const RECORD_TYPES = ['SALARY', 'BONUS', 'DEDUCTION', 'PAYSLIP', 'OTHER'];

export default function FinancePage() {
  const navigate = useNavigate();
  const role = getUserRole();
  const isPrivileged = role === 'org_admin' || role === 'ceo' || role === 'manager';

  // Navigation tab state
  const [activeTab, setActiveTab] = useState(isPrivileged ? 'payroll' : 'my_compensation');

  // Existing Ledger & Subscription State
  const [summaryData, setSummaryData] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [generatingSnapshot, setGeneratingSnapshot] = useState(false);
  const [ledgerRecords, setLedgerRecords] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Compensation & Payroll State
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [increments, setIncrements] = useState([]);
  const [payslipsList, setPayslipsList] = useState([]);
  const [myComp, setMyComp] = useState(null);

  // Common Filters
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [filterMonth, setFilterMonth] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modals state
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [selectedEmpComp, setSelectedEmpComp] = useState(null);
  const [selectedEmpPayrollGen, setSelectedEmpPayrollGen] = useState(null);
  const [selectedIncrementPropEmp, setSelectedIncrementPropEmp] = useState(null);
  const [selectedIncrementRev, setSelectedIncrementRev] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Ledger Filter states
  const [ledgerFilterType, setLedgerFilterType] = useState('');
  const [ledgerFilterYear, setLedgerFilterYear] = useState(new Date().getFullYear().toString());

  // 1. Fetch Subscription & Summary
  const fetchSummaryAndSnapshots = async () => {
    if (!isPrivileged) return;
    try {
      const [sumRes, snapRes] = await Promise.all([
        getFinanceSummary().catch(() => null),
        getFinancialSnapshots().catch(() => null),
      ]);
      if (sumRes && sumRes.data) setSummaryData(sumRes.data);
      if (snapRes && snapRes.data && snapRes.data.snapshots) setSnapshots(snapRes.data.snapshots);
    } catch (err) {
      console.error('Failed to load financial summary:', err);
    }
  };

  // 2. Fetch Employees list for management actions
  const fetchEmployees = async () => {
    if (!isPrivileged) return;
    try {
      const res = await api.get('/org/employees');
      const empData = res.data?.data?.employees || res.data?.data || [];
      setEmployees(Array.isArray(empData) ? empData : []);
    } catch (err) {
      console.error('Failed to load employees:', err);
    }
  };

  // 3. Fetch Payroll Records
  const fetchPayroll = async () => {
    setLoading(true);
    try {
      if (isPrivileged) {
        const res = await getPayrollRecords({ year: filterYear, month: filterMonth, status: filterStatus });
        setPayrollRecords(Array.isArray(res.data) ? res.data : []);
      } else {
        const res = await getMyPayrollHistory({ year: filterYear, month: filterMonth });
        setPayrollRecords(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error('Failed to fetch payroll records:', err);
    } finally {
      setLoading(false);
    }
  };

  // 4. Fetch Increments
  const fetchIncrementsData = async () => {
    try {
      if (isPrivileged) {
        const res = await getIncrements();
        setIncrements(Array.isArray(res.data) ? res.data : []);
      } else {
        const res = await getMyIncrements();
        setIncrements(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error('Failed to fetch increments:', err);
    }
  };

  // 5. Fetch Payslips
  const fetchPayslipsData = async () => {
    try {
      if (isPrivileged) {
        const res = await getPayrollRecords({ year: filterYear });
        setPayslipsList(Array.isArray(res.data) ? res.data : []);
      } else {
        const res = await getMyPayslips(filterYear);
        setPayslipsList(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error('Failed to fetch payslips:', err);
    }
  };

  // 6. Fetch Employee Self Compensation
  const fetchSelfCompensation = async () => {
    if (isPrivileged) return;
    try {
      const res = await getMyCompensation();
      setMyComp(res.data || null);
    } catch (err) {
      console.error('Failed to fetch my compensation:', err);
    }
  };

  // 7. Fetch Ledger Records
  const fetchLedger = async () => {
    try {
      if (isPrivileged) {
        const params = new URLSearchParams();
        if (ledgerFilterType) params.append('record_type', ledgerFilterType);
        if (ledgerFilterYear) params.append('period_year', ledgerFilterYear);
        const res = await api.get(`/finance/records?${params.toString()}`);
        setLedgerRecords(Array.isArray(res.data?.data) ? res.data.data : []);
      } else {
        const params = new URLSearchParams();
        if (ledgerFilterType) params.append('record_type', ledgerFilterType);
        if (ledgerFilterYear) params.append('period_year', ledgerFilterYear);
        const res = await api.get(`/finance/records/me?${params.toString()}`);
        setLedgerRecords(Array.isArray(res.data?.data) ? res.data.data : []);
      }
    } catch (err) {
      console.error('Failed to fetch ledger records:', err);
    }
  };

  useEffect(() => {
    fetchPayroll();
    fetchIncrementsData();
    fetchPayslipsData();
    fetchLedger();
    if (isPrivileged) {
      fetchSummaryAndSnapshots();
      fetchEmployees();
    } else {
      fetchSelfCompensation();
    }
  }, [filterYear, filterMonth, filterStatus, ledgerFilterType, ledgerFilterYear, isPrivileged]);

  const handleUpdatePayrollStatusAction = async (id, newStatus) => {
    try {
      await updatePayrollStatus(id, {
        status: newStatus,
        payment_date: newStatus === 'Paid' ? new Date().toISOString().split('T')[0] : undefined,
      });
      setSuccess(`Payroll status updated to ${newStatus}`);
      fetchPayroll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update payroll status');
    }
  };

  const handleGenerateSnapshotAction = async () => {
    try {
      setGeneratingSnapshot(true);
      const res = await generateSnapshot();
      setSuccess(res.message || 'Financial snapshot generated successfully!');
      await fetchSummaryAndSnapshots();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate snapshot');
    } finally {
      setGeneratingSnapshot(false);
    }
  };

  // Metrics calculation for Payroll Dashboard (Screenshot 3 style)
  const totalMonthlyPayroll = payrollRecords.reduce((sum, r) => sum + parseFloat(r.total_earnings || 0), 0);
  const totalNetPayouts = payrollRecords.reduce((sum, r) => sum + parseFloat(r.net_salary || 0), 0);
  const activeStaffCount = isPrivileged ? (employees.length || payrollRecords.length) : 1;

  const formatINR = (val) => '₹' + parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  return (
    <AppShell>
      <div style={{ padding: '28px 32px', maxWidth: 1280, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
        
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
              {isPrivileged ? 'Payroll & Salary Management' : 'My Salary & Compensation'}
            </h1>
            <p style={{ fontSize: 14, color: '#64748B', margin: '4px 0 0' }}>
              {isPrivileged
                ? 'Manage wage structures, automated component calculations, monthly payroll runs, and view printable pay slips.'
                : 'View your compensation structure, salary increments, payout statements, and official pay slips.'}
            </p>
          </div>

          {isPrivileged && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleGenerateSnapshotAction}
                disabled={generatingSnapshot}
                style={{
                  background: '#FFFFFF', color: '#2563EB', border: '1px solid #93C5FD', borderRadius: 8,
                  padding: '9px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                }}
              >
                {generatingSnapshot ? 'Snapshotting...' : '📸 Snapshot'}
              </button>

              <button
                onClick={() => navigate('/app/billing')}
                style={{
                  background: '#FFFFFF', color: '#1677B8', border: '1px solid #1677B8', borderRadius: 8,
                  padding: '9px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                }}
              >
                Billing & Plan
              </button>
            </div>
          )}
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
            {success}
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div style={{ display: 'flex', borderBottom: '2px solid #E2E8F0', marginBottom: 24, gap: 24 }}>
          {isPrivileged ? (
            <>
              <button
                onClick={() => setActiveTab('payroll')}
                style={{
                  padding: '12px 4px', border: 'none', background: 'none', cursor: 'pointer',
                  fontSize: 14, fontWeight: activeTab === 'payroll' ? 700 : 500,
                  color: activeTab === 'payroll' ? '#4F46E5' : '#64748B',
                  borderBottom: activeTab === 'payroll' ? '3px solid #4F46E5' : '3px solid transparent',
                  marginBottom: -2,
                }}
              >
                📊 Payroll & Salary Management
              </button>
              <button
                onClick={() => setActiveTab('increments')}
                style={{
                  padding: '12px 4px', border: 'none', background: 'none', cursor: 'pointer',
                  fontSize: 14, fontWeight: activeTab === 'increments' ? 700 : 500,
                  color: activeTab === 'increments' ? '#4F46E5' : '#64748B',
                  borderBottom: activeTab === 'increments' ? '3px solid #4F46E5' : '3px solid transparent',
                  marginBottom: -2,
                }}
              >
                📈 Salary Increments ({increments.filter(i => i.status === 'PENDING').length} Pending)
              </button>
              <button
                onClick={() => setActiveTab('payslips')}
                style={{
                  padding: '12px 4px', border: 'none', background: 'none', cursor: 'pointer',
                  fontSize: 14, fontWeight: activeTab === 'payslips' ? 700 : 500,
                  color: activeTab === 'payslips' ? '#4F46E5' : '#64748B',
                  borderBottom: activeTab === 'payslips' ? '3px solid #4F46E5' : '3px solid transparent',
                  marginBottom: -2,
                }}
              >
                🖨️ Payslips Archive
              </button>
              <button
                onClick={() => setActiveTab('ledger')}
                style={{
                  padding: '12px 4px', border: 'none', background: 'none', cursor: 'pointer',
                  fontSize: 14, fontWeight: activeTab === 'ledger' ? 700 : 500,
                  color: activeTab === 'ledger' ? '#4F46E5' : '#64748B',
                  borderBottom: activeTab === 'ledger' ? '3px solid #4F46E5' : '3px solid transparent',
                  marginBottom: -2,
                }}
              >
                🏛️ Company Ledger & Subscriptions
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('my_compensation')}
                style={{
                  padding: '12px 4px', border: 'none', background: 'none', cursor: 'pointer',
                  fontSize: 14, fontWeight: activeTab === 'my_compensation' ? 700 : 500,
                  color: activeTab === 'my_compensation' ? '#4F46E5' : '#64748B',
                  borderBottom: activeTab === 'my_compensation' ? '3px solid #4F46E5' : '3px solid transparent',
                  marginBottom: -2,
                }}
              >
                💼 My Salary Structure
              </button>
              <button
                onClick={() => setActiveTab('payroll')}
                style={{
                  padding: '12px 4px', border: 'none', background: 'none', cursor: 'pointer',
                  fontSize: 14, fontWeight: activeTab === 'payroll' ? 700 : 500,
                  color: activeTab === 'payroll' ? '#4F46E5' : '#64748B',
                  borderBottom: activeTab === 'payroll' ? '3px solid #4F46E5' : '3px solid transparent',
                  marginBottom: -2,
                }}
              >
                💵 My Payroll History
              </button>
              <button
                onClick={() => setActiveTab('increments')}
                style={{
                  padding: '12px 4px', border: 'none', background: 'none', cursor: 'pointer',
                  fontSize: 14, fontWeight: activeTab === 'increments' ? 700 : 500,
                  color: activeTab === 'increments' ? '#4F46E5' : '#64748B',
                  borderBottom: activeTab === 'increments' ? '3px solid #4F46E5' : '3px solid transparent',
                  marginBottom: -2,
                }}
              >
                📈 My Increments
              </button>
            </>
          )}
        </div>

        {/* ───────────────────────────────────────────────────────────────── */}
        {/* TAB 1: PAYROLL & SALARY MANAGEMENT (Styled after Screenshot 3)   */}
        {/* ───────────────────────────────────────────────────────────────── */}
        {activeTab === 'payroll' && (
          <div>
            {/* Stat Cards matching Screenshot 3 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
              
              {/* Card 1: Total Monthly Payroll */}
              <div style={{
                background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 14, padding: 20,
                display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: '#EEF2FF', color: '#4F46E5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700,
                }}>
                  $
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>Total Monthly Payroll</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginTop: 2 }}>
                    {formatINR(totalMonthlyPayroll)}
                  </div>
                </div>
              </div>

              {/* Card 2: Total Net Payouts */}
              <div style={{
                background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 14, padding: 20,
                display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: '#ECFDF5', color: '#059669',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700,
                }}>
                  📈
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>Total Net Payouts</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#059669', marginTop: 2 }}>
                    {formatINR(totalNetPayouts)}
                  </div>
                </div>
              </div>

              {/* Card 3: Active Salaried Staff */}
              <div style={{
                background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 14, padding: 20,
                display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: '#E0F2FE', color: '#0284C7',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700,
                }}>
                  🛡️
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>Active Salaried Staff</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginTop: 2 }}>
                    {activeStaffCount}
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div style={{
              background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: '12px 16px',
              marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
            }}>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 13 }}
              >
                {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
              </select>

              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 13 }}
              >
                <option value="">All Months</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>

              {isPrivileged && (
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{ padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 13 }}
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Processed">Processed</option>
                  <option value="Paid">Paid</option>
                </select>
              )}
            </div>

            {/* Staff Payroll & Salary Table matching Screenshot 3 */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
              {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#64748B', fontSize: 14 }}>
                  Loading payroll records...
                </div>
              ) : isPrivileged ? (
                /* Admin View: Staff Table */
                employees.length === 0 && payrollRecords.length === 0 ? (
                  <div style={{ padding: 40, textAlign: 'center', color: '#64748B', fontSize: 14 }}>
                    No staff or payroll records found.
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                        <th style={{ padding: '14px 16px', fontWeight: 700 }}>Employee</th>
                        <th style={{ padding: '14px 16px', fontWeight: 700 }}>Monthly Wage</th>
                        <th style={{ padding: '14px 16px', fontWeight: 700 }}>Basic</th>
                        <th style={{ padding: '14px 16px', fontWeight: 700 }}>HRA</th>
                        <th style={{ padding: '14px 16px', fontWeight: 700 }}>Deductions</th>
                        <th style={{ padding: '14px 16px', fontWeight: 700 }}>Net Salary</th>
                        <th style={{ padding: '14px 16px', fontWeight: 700 }}>Status</th>
                        <th style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp) => {
                        const pr = payrollRecords.find(p => p.person_id === emp.id) || {};
                        const monthlyWage = parseFloat(pr.total_earnings || 0);
                        const basic = parseFloat(pr.basic_salary || 0);
                        const hraVal = parseFloat(pr.hra || 0);
                        const deductions = parseFloat(pr.total_deductions || 0);
                        const netSal = parseFloat(pr.net_salary || 0);

                        return (
                          <tr key={emp.id} style={{ borderBottom: '1px solid #F1F5F9', color: '#0F172A' }}>
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                  width: 34, height: 34, borderRadius: '50%', background: '#E2E8F0',
                                  color: '#334155', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
                                }}>
                                  {(emp.first_name || 'E')[0]}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 700, color: '#0F172A' }}>{emp.first_name} {emp.last_name}</div>
                                  <div style={{ fontSize: 11, color: '#64748B' }}>{emp.employee_id || emp.email}</div>
                                </div>
                              </div>
                            </td>

                            <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                              {monthlyWage > 0 ? formatINR(monthlyWage) : '—'}
                            </td>
                            <td style={{ padding: '14px 16px', color: '#475569' }}>
                              {basic > 0 ? formatINR(basic) : '—'}
                            </td>
                            <td style={{ padding: '14px 16px', color: '#475569' }}>
                              {hraVal > 0 ? formatINR(hraVal) : '—'}
                            </td>
                            <td style={{ padding: '14px 16px', color: '#DC2626' }}>
                              {deductions > 0 ? formatINR(deductions) : '—'}
                            </td>
                            <td style={{ padding: '14px 16px', fontWeight: 800, color: '#059669' }}>
                              {netSal > 0 ? formatINR(netSal) : '—'}
                            </td>

                            <td style={{ padding: '14px 16px' }}>
                              <span style={{
                                background: pr.status === 'Paid' ? '#ECFDF5' : pr.status === 'Processed' ? '#EFF6FF' : '#FFFBEB',
                                color: pr.status === 'Paid' ? '#059669' : pr.status === 'Processed' ? '#2563EB' : '#D97706',
                                padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                              }}>
                                {pr.status || 'Pending'}
                              </span>
                            </td>

                            <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => setSelectedEmpComp(emp)}
                                  style={{
                                    background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#0F172A',
                                    padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                  }}
                                >
                                  Edit Wage
                                </button>

                                <button
                                  onClick={() => setSelectedEmpPayrollGen(emp)}
                                  style={{
                                    background: '#EEF2FF', border: '1px solid #C7D2FE', color: '#4F46E5',
                                    padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                  }}
                                >
                                  Generate
                                </button>

                                {pr.id && (
                                  <button
                                    onClick={() => setSelectedPayroll(pr)}
                                    style={{
                                      background: '#4F46E5', border: 'none', color: '#FFFFFF',
                                      padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                    }}
                                  >
                                    Pay Slip
                                  </button>
                                )}

                                {pr.id && pr.status !== 'Paid' && (
                                  <button
                                    onClick={() => handleUpdatePayrollStatusAction(pr.id, 'Paid')}
                                    style={{
                                      background: '#059669', border: 'none', color: '#FFFFFF',
                                      padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                    }}
                                  >
                                    Mark Paid
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )
              ) : (
                /* Employee View: Payroll Payouts Table */
                payrollRecords.length === 0 ? (
                  <div style={{ padding: 40, textAlign: 'center', color: '#64748B', fontSize: 14 }}>
                    No payroll payout records found for the selected period.
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                        <th style={{ padding: '14px 16px', fontWeight: 700 }}>Period</th>
                        <th style={{ padding: '14px 16px', fontWeight: 700 }}>Gross Earnings</th>
                        <th style={{ padding: '14px 16px', fontWeight: 700 }}>Deductions</th>
                        <th style={{ padding: '14px 16px', fontWeight: 700 }}>Net Take-Home</th>
                        <th style={{ padding: '14px 16px', fontWeight: 700 }}>Status</th>
                        <th style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payrollRecords.map((pr) => {
                        const monthStr = new Date(2000, pr.month - 1, 1).toLocaleString('default', { month: 'long' });
                        return (
                          <tr key={pr.id} style={{ borderBottom: '1px solid #F1F5F9', color: '#0F172A' }}>
                            <td style={{ padding: '14px 16px', fontWeight: 700 }}>{monthStr} {pr.year}</td>
                            <td style={{ padding: '14px 16px', color: '#0F172A', fontWeight: 600 }}>{formatINR(pr.total_earnings)}</td>
                            <td style={{ padding: '14px 16px', color: '#DC2626' }}>{formatINR(pr.total_deductions)}</td>
                            <td style={{ padding: '14px 16px', fontWeight: 800, color: '#059669' }}>{formatINR(pr.net_salary)}</td>
                            <td style={{ padding: '14px 16px' }}>
                              <span style={{
                                background: pr.status === 'Paid' ? '#ECFDF5' : '#FFFBEB',
                                color: pr.status === 'Paid' ? '#059669' : '#D97706',
                                padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                              }}>
                                {pr.status}
                              </span>
                            </td>
                            <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                              <button
                                onClick={() => setSelectedPayroll(pr)}
                                style={{
                                  background: '#4F46E5', border: 'none', color: '#FFFFFF',
                                  padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                }}
                              >
                                View Pay Slip
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )
              )}
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────────── */}
        {/* TAB 2: INCREMENTS & COMPENSATION                                 */}
        {/* ───────────────────────────────────────────────────────────────── */}
        {activeTab === 'increments' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0F172A' }}>
                Salary Increments & Revisions Workflow
              </h3>
              {isPrivileged && (
                <button
                  onClick={() => setSelectedIncrementPropEmp(employees[0] || {})}
                  style={{
                    background: '#4F46E5', color: '#FFFFFF', border: 'none', borderRadius: 8,
                    padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  + Propose Increment
                </button>
              )}
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
              {increments.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#64748B', fontSize: 14 }}>
                  No increment records found.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                      {isPrivileged && <th style={{ padding: '12px 16px', fontWeight: 700 }}>Employee</th>}
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Current Base</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Proposed Base</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Increment %</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Reason</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Status</th>
                      {isPrivileged && <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {increments.map((inc) => (
                      <tr key={inc.id} style={{ borderBottom: '1px solid #F1F5F9', color: '#0F172A' }}>
                        {isPrivileged && (
                          <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                            {inc.first_name} {inc.last_name} ({inc.email})
                          </td>
                        )}
                        <td style={{ padding: '12px 16px', color: '#64748B' }}>{formatINR(inc.current_salary)}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#059669' }}>{formatINR(inc.proposed_salary)}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#4F46E5' }}>+{inc.increment_percentage}%</td>
                        <td style={{ padding: '12px 16px', color: '#64748B', maxWidth: 200 }}>{inc.reason || '—'}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            background: inc.status === 'APPROVED' ? '#ECFDF5' : inc.status === 'REJECTED' ? '#FEF2F2' : '#FFFBEB',
                            color: inc.status === 'APPROVED' ? '#059669' : inc.status === 'REJECTED' ? '#DC2626' : '#D97706',
                            padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                          }}>
                            {inc.status}
                          </span>
                        </td>
                        {isPrivileged && (
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            {inc.status === 'PENDING' && (
                              <button
                                onClick={() => setSelectedIncrementRev(inc)}
                                style={{
                                  background: '#2563EB', border: 'none', color: '#FFFFFF',
                                  padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                }}
                              >
                                Review Request
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────────── */}
        {/* TAB: MY COMPENSATION STRUCTURE (EMPLOYEE SELF VIEW)               */}
        {/* ───────────────────────────────────────────────────────────────── */}
        {activeTab === 'my_compensation' && !isPrivileged && (
          <div>
            <div style={{
              background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
              borderRadius: 16, padding: 24, color: '#FFFFFF', marginBottom: 24,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#38BDF8', letterSpacing: '0.05em' }}>
                Official Compensation Structure
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800, margin: '6px 0 0', color: '#FFFFFF' }}>
                Total Monthly Compensation: {formatINR(myComp?.summary?.total_monthly_compensation)}
              </h2>
              <div style={{ fontSize: 13, color: '#CBD5E1', marginTop: 6 }}>
                Base Salary: {formatINR(myComp?.summary?.base_salary)} • Allowances: {formatINR(myComp?.summary?.allowances)} • Components: {formatINR(myComp?.summary?.components_total)}
              </div>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 20 }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 700, color: '#0F172A' }}>
                Active Salary Components Breakdown
              </h3>
              {(!myComp?.salary_components || myComp.salary_components.length === 0) ? (
                <div style={{ color: '#64748B', fontSize: 14 }}>No components configured.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', background: '#F8FAFC' }}>
                      <th style={{ padding: '10px 14px' }}>Component</th>
                      <th style={{ padding: '10px 14px' }}>Calculation</th>
                      <th style={{ padding: '10px 14px' }}>Configured Value</th>
                      <th style={{ padding: '10px 14px' }}>Computed Monthly Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myComp.salary_components.map((comp) => (
                      <tr key={comp.id} style={{ borderBottom: '1px solid #F1F5F9', color: '#0F172A' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 600 }}>{comp.component_type}</td>
                        <td style={{ padding: '12px 14px', color: '#64748B' }}>{comp.calculation_type}</td>
                        <td style={{ padding: '12px 14px' }}>{comp.calculation_type === 'PERCENTAGE' ? `${comp.configured_value}%` : formatINR(comp.configured_value)}</td>
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: '#4F46E5' }}>{formatINR(comp.calculated_amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────────── */}
        {/* TAB 3: PAYSLIPS ARCHIVE                                          */}
        {/* ───────────────────────────────────────────────────────────────── */}
        {activeTab === 'payslips' && (
          <div>
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
              {payslipsList.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#64748B', fontSize: 14 }}>
                  No generated payslips available.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                      {isPrivileged && <th style={{ padding: '12px 16px', fontWeight: 700 }}>Employee</th>}
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Period</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Earnings</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Deductions</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Net Take-Home</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payslipsList.map((ps) => (
                      <tr key={ps.id} style={{ borderBottom: '1px solid #F1F5F9', color: '#0F172A' }}>
                        {isPrivileged && (
                          <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                            {ps.first_name} {ps.last_name} ({ps.employee_id || ps.email})
                          </td>
                        )}
                        <td style={{ padding: '12px 16px', fontWeight: 700 }}>
                          {new Date(2000, ps.month - 1, 1).toLocaleString('default', { month: 'long' })} {ps.year}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#0F172A' }}>{formatINR(ps.total_earnings)}</td>
                        <td style={{ padding: '12px 16px', color: '#DC2626' }}>{formatINR(ps.total_deductions)}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 800, color: '#059669' }}>{formatINR(ps.net_salary)}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <button
                            onClick={() => setSelectedPayroll(ps)}
                            style={{
                              background: '#4F46E5', border: 'none', color: '#FFFFFF',
                              padding: '5px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            }}
                          >
                            Open Pay Slip
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────────── */}
        {/* TAB 4: COMPANY FINANCIAL LEDGER & SUBSCRIPTIONS (PRESERVED)      */}
        {/* ───────────────────────────────────────────────────────────────── */}
        {activeTab === 'ledger' && isPrivileged && (
          <div>
            {/* Active Plan Subscription Card */}
            {summaryData && (
              <div style={{
                background: 'linear-gradient(135deg, #172B3A 0%, #2A4356 100%)',
                borderRadius: 16, padding: 24, color: '#FFFFFF', marginBottom: 24,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#90D5FF' }}>
                      Active Subscription Capacity
                    </span>
                    <h2 style={{ fontSize: 24, fontWeight: 800, margin: '4px 0 0 0', color: '#FFFFFF' }}>
                      {summaryData.current_plan?.name || 'Growth'} Plan
                    </h2>
                    <div style={{ fontSize: 13, color: '#CBD5E1', marginTop: 4 }}>
                      Max {summaryData.current_plan?.max_employees || 100} employees allowed
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 24, background: 'rgba(255, 255, 255, 0.1)', padding: '12px 20px', borderRadius: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600 }}>Active Headcount</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: '#FFFFFF', marginTop: 2 }}>{summaryData.employee_count || 0}</div>
                    </div>
                    <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: 24 }}>
                      <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600 }}>Total Expenditure</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: '#4ADE80', marginTop: 2 }}>
                        ${((summaryData.total_expenditure_cents || 0) / 100).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Snapshots Table */}
            {snapshots.length > 0 && (
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: '0 0 14px 0' }}>
                  📈 Periodic Expenditure Snapshots
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', background: '#F8FAFC' }}>
                      <th style={{ padding: '10px 12px' }}>Snapshot Date</th>
                      <th style={{ padding: '10px 12px' }}>Active Plan</th>
                      <th style={{ padding: '10px 12px' }}>Employee Count</th>
                      <th style={{ padding: '10px 12px' }}>Total Expenditure</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snapshots.map((snap) => (
                      <tr key={snap.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{new Date(snap.snapshot_date).toLocaleDateString()}</td>
                        <td style={{ padding: '10px 12px' }}>{snap.metadata?.plan_name || 'Growth'}</td>
                        <td style={{ padding: '10px 12px' }}>{snap.metadata?.employee_count || '—'}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#2563EB' }}>
                          ${((snap.total_expenditure_cents || 0) / 100).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Financial Ledger Records */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 20 }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 700, color: '#0F172A' }}>
                Financial Records Ledger
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                    <th style={{ padding: '12px 14px' }}>Employee</th>
                    <th style={{ padding: '12px 14px' }}>Record Type</th>
                    <th style={{ padding: '12px 14px' }}>Period</th>
                    <th style={{ padding: '12px 14px' }}>Amount</th>
                    <th style={{ padding: '12px 14px' }}>Recorded On</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerRecords.map((rec) => (
                    <tr key={rec.id} style={{ borderBottom: '1px solid #F1F5F9', color: '#0F172A' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 600 }}>{rec.first_name} {rec.last_name}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ background: '#EEF2FF', color: '#4F46E5', padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                          {rec.record_type}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>{rec.period_month ? `${rec.period_month}/${rec.period_year}` : rec.period_year}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 700 }}>₹{parseFloat(rec.amount).toLocaleString()}</td>
                      <td style={{ padding: '12px 14px', color: '#64748B' }}>{new Date(rec.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Render Modals */}
      {selectedPayroll && (
        <PayslipModal
          payroll={selectedPayroll}
          onClose={() => setSelectedPayroll(null)}
        />
      )}

      {selectedEmpComp && (
        <CompensationModal
          employee={selectedEmpComp}
          onClose={() => setSelectedEmpComp(null)}
          onSaveSuccess={fetchPayroll}
        />
      )}

      {selectedEmpPayrollGen && (
        <GeneratePayrollModal
          employee={selectedEmpPayrollGen}
          onClose={() => setSelectedEmpPayrollGen(null)}
          onSuccess={fetchPayroll}
        />
      )}

      {selectedIncrementPropEmp && (
        <IncrementModal
          employee={selectedIncrementPropEmp}
          mode="propose"
          onClose={() => setSelectedIncrementPropEmp(null)}
          onSuccess={fetchIncrementsData}
        />
      )}

      {selectedIncrementRev && (
        <IncrementModal
          increment={selectedIncrementRev}
          mode="review"
          onClose={() => setSelectedIncrementRev(null)}
          onSuccess={fetchIncrementsData}
        />
      )}
    </AppShell>
  );
}
