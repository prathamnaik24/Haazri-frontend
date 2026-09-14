import React, { useState, useEffect, useRef } from 'react';
import { getPayslipDetail, downloadPayslipPdf } from '../../services/payroll';
import { PrintIcon, DownloadIcon, XIcon, BuildingIcon, BankIcon, UserIcon } from '../ui/Icons';

export default function PayslipModal({ payslip, payroll, onClose }) {
  const targetObj = payslip || payroll;
  const targetId = targetObj?.id || targetObj?.payslip_id || targetObj?.payroll_id;

  const modalBodyRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [detail, setDetail] = useState(null);

  // Auto reset scroll position to top whenever modal opens or detail changes
  useEffect(() => {
    if (modalBodyRef.current) {
      modalBodyRef.current.scrollTop = 0;
    }
  }, [targetId, detail]);

  useEffect(() => {
    let isMounted = true;
    const fetchDetail = async () => {
      if (!targetId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const res = await getPayslipDetail(targetId);
        if (isMounted) {
          setDetail(res.data || res);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to load detailed payslip data');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetail();
    return () => { isMounted = false; };
  }, [targetId]);

  if (!targetObj) return null;

  // Fallbacks if detail endpoint fails or during load
  const org = detail?.organization || {};
  const emp = detail?.employee || {};
  const bank = detail?.bank || {};
  const pr = detail?.payroll || {};

  const companyName = org.name || 'Haazri Organization';
  const companyLogo = org.logo_url;
  const companyAddress = org.address;
  const companyPhone = org.phone;
  const companyEmail = org.email;

  const employeeName = emp.full_name || (targetObj.first_name && targetObj.last_name ? `${targetObj.first_name} ${targetObj.last_name}` : 'Employee');
  const empId = emp.employee_id || targetObj.employee_id || 'N/A';
  const workdayId = emp.workday_id || targetObj.workday_id;
  const designation = emp.designation || 'Staff Member';
  const department = emp.department || 'Operations';
  const empEmail = emp.email || targetObj.email || '';

  const monthNum = pr.month || targetObj.month;
  const yearNum = pr.year || targetObj.year;
  const monthName = monthNum ? new Date(2000, monthNum - 1, 1).toLocaleString('default', { month: 'long' }) : '';
  const periodText = monthName && yearNum ? `${monthName} ${yearNum}` : 'Salary Statement';

  const workingDays = pr.working_days ?? targetObj.working_days ?? 0;
  const paidDays = pr.paid_days ?? targetObj.paid_days ?? 0;

  const netSalary = pr.net_salary ?? parseFloat(targetObj.net_salary || 0);
  const amountInWords = pr.amount_in_words || targetObj.amount_in_words || '';
  const isPaid = (pr.status || targetObj.status || '').toLowerCase() === 'paid';

  // Earnings
  const earningsList = detail?.earnings || [
    { name: 'Basic Salary', amount: parseFloat(targetObj.basic_salary || 0) },
    { name: 'House Rent Allowance (HRA)', amount: parseFloat(targetObj.hra || 0) },
    { name: 'Standard Allowance', amount: parseFloat(targetObj.standard_allowance || 0) },
    { name: 'Performance Bonus', amount: parseFloat(targetObj.performance_bonus || 0) },
    { name: 'Leave Travel Allowance (LTA)', amount: parseFloat(targetObj.leave_travel_allowance || 0) },
    { name: 'Fixed Allowance', amount: parseFloat(targetObj.fixed_allowance || 0) },
    { name: 'Stock / Equity', amount: parseFloat(targetObj.stock_equity || 0) },
  ].filter(e => e.amount > 0);

  const totalEarnings = pr.total_earnings ?? parseFloat(targetObj.total_earnings || earningsList.reduce((s, e) => s + e.amount, 0));

  // Deductions
  const deductionsList = detail?.deductions || [
    { name: 'Provident Fund (PF)', amount: parseFloat(targetObj.provident_fund || 0) },
    { name: 'Professional Tax (PT)', amount: parseFloat(targetObj.professional_tax || 0) },
    { name: 'Tax Deducted at Source (TDS)', amount: parseFloat(targetObj.tds || 0) },
    { name: 'Other Deductions', amount: parseFloat(targetObj.other_deductions || 0) },
  ].filter(d => d.amount > 0);

  const totalDeductions = pr.total_deductions ?? parseFloat(targetObj.total_deductions || deductionsList.reduce((s, d) => s + d.amount, 0));

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!targetId) return;
    setDownloadingPdf(true);
    try {
      const response = await downloadPayslipPdf(targetId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payslip_${empId}_${yearNum}_${monthNum}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to download payslip PDF');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const formatCurrency = (val) => {
    return '₹' + parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div 
      className="payslip-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .payslip-modal-content, .payslip-modal-content * {
            visibility: visible !important;
          }
          .payslip-modal-backdrop {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            display: block !important;
          }
          .payslip-modal-content {
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            max-width: 100% !important;
            max-height: none !important;
            height: auto !important;
            border-radius: 0 !important;
            overflow: visible !important;
          }
          .payslip-modal-body {
            max-height: none !important;
            overflow: visible !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div 
        className="payslip-modal-content"
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '820px',
          maxHeight: 'calc(100vh - 40px)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          border: '1px solid #E2E8F0',
        }}
      >
        {/* Top Action Header */}
        <div 
          className="no-print"
          style={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            borderBottom: '1px solid #F1F5F9',
            background: '#FAFCFF',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 16, fontWeight: 700, color: '#1E293B' }}>
            <PrintIcon size={18} color="#4F46E5" />
            <span>Salary Pay Slip</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              style={{
                background: '#FFFFFF',
                color: '#4F46E5',
                border: '1px solid #C7D2FE',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s',
              }}
            >
              <DownloadIcon size={15} color="#4F46E5" />
              {downloadingPdf ? 'Downloading...' : 'Download PDF'}
            </button>

            <button
              onClick={handlePrint}
              style={{
                background: '#4F46E5',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 18px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#4338CA')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#4F46E5')}
            >
              <PrintIcon size={15} color="#FFFFFF" />
              Print Slip
            </button>

            <button
              onClick={onClose}
              style={{
                background: '#F1F5F9',
                color: '#64748B',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <XIcon size={16} color="#64748B" />
            </button>
          </div>
        </div>

        <div 
          ref={modalBodyRef}
          className="payslip-modal-body"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 28px',
            minHeight: 0,
          }}
        >
          
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 13 }}>
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748B', fontSize: 14 }}>
              Loading payslip details...
            </div>
          ) : (
            <>
              {/* Header Branding Banner */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, borderBottom: '1px solid #F1F5F9', pb: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  {companyLogo ? (
                    <img src={companyLogo} alt={companyName} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'contain' }} />
                  ) : (
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)',
                    }}>
                      <BuildingIcon size={24} color="#FFFFFF" />
                    </div>
                  )}
                  <div>
                    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                      {companyName}
                    </h2>
                    {(companyAddress || companyPhone || companyEmail) && (
                      <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                        {[companyAddress, companyPhone, companyEmail].filter(Boolean).join(' • ')}
                      </div>
                    )}
                    <div style={{ fontSize: 12, color: '#475569', marginTop: 3, fontWeight: 600 }}>
                      Salary Pay Slip — {periodText}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    background: isPaid ? '#ECFDF5' : '#FFFBEB',
                    color: isPaid ? '#059669' : '#D97706',
                    border: `1px solid ${isPaid ? '#A7F3D0' : '#FDE68A'}`,
                    padding: '5px 12px',
                    borderRadius: '999px',
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    display: 'inline-block',
                  }}>
                    {isPaid ? 'Payment Confirmed' : `Status: ${pr.status || targetObj.status || 'Pending'}`}
                  </span>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 6 }}>
                    Pay Period: {periodText}
                  </div>
                </div>
              </div>

              {/* Employee & Bank Details Grid */}
              <div style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 12,
                padding: '16px 20px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 20,
                marginBottom: 24,
              }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.05em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <UserIcon size={14} color="#64748B" />
                    <span>Employee Details</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>
                    {employeeName}
                  </div>
                  <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
                    <span style={{ color: '#94A3B8' }}>Employee ID: </span>
                    <span style={{ fontWeight: 600 }}>{empId}</span>
                    {workdayId && <span style={{ color: '#94A3B8' }}> • Workday ID: <strong style={{ color: '#475569' }}>{workdayId}</strong></span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
                    <span style={{ color: '#94A3B8' }}>Role / Dept: </span>
                    <span style={{ fontWeight: 500 }}>{designation} ({department})</span>
                  </div>
                  {empEmail && (
                    <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
                      <span style={{ color: '#94A3B8' }}>Email: </span>
                      {empEmail}
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
                    <span style={{ color: '#94A3B8' }}>Payable / Working Days: </span>
                    <strong style={{ color: '#059669' }}>{paidDays}</strong> / <strong>{workingDays}</strong>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.05em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <BankIcon size={14} color="#64748B" />
                    <span>Bank & Tax Information</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.7 }}>
                    <div>
                      <span style={{ color: '#94A3B8' }}>Bank Name: </span>
                      <strong style={{ color: '#0F172A' }}>{bank.bank_name || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#94A3B8' }}>Account No: </span>
                      <strong style={{ color: '#0F172A' }}>{bank.masked_account_number || 'XXXX XXXX 1001'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#94A3B8' }}>IFSC Code: </span>
                      <strong style={{ color: '#0F172A' }}>{bank.ifsc_code || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#94A3B8' }}>PAN: </span>
                      <strong style={{ color: '#0F172A' }}>{bank.pan_number || 'N/A'}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Earnings vs Deductions Dual Tables */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                
                {/* GROSS EARNINGS TABLE */}
                <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '16px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #CBD5E1', paddingBottom: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Gross Earnings
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#0F172A' }}>
                      Amount (₹)
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: '#334155' }}>
                    {earningsList.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{item.name}</span>
                        <span style={{ fontWeight: 600 }}>{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                    {earningsList.length === 0 && (
                      <div style={{ color: '#94A3B8', fontSize: 12, fontStyle: 'italic' }}>
                        No earnings components configured.
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #CBD5E1', paddingTop: 10, marginTop: 16, fontWeight: 800, fontSize: 13, color: '#0F172A' }}>
                    <span>Total Earnings</span>
                    <span>{formatCurrency(totalEarnings)}</span>
                  </div>
                </div>

                {/* DEDUCTIONS TABLE */}
                <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '16px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #CBD5E1', paddingBottom: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Deductions
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#0F172A' }}>
                      Amount (₹)
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: '#334155' }}>
                    {deductionsList.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{item.name}</span>
                        <span style={{ fontWeight: 600, color: '#DC2626' }}>{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                    {deductionsList.length === 0 && (
                      <div style={{ color: '#94A3B8', fontSize: 12, fontStyle: 'italic' }}>
                        No deductions applied for this period.
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #CBD5E1', paddingTop: 10, marginTop: 16, fontWeight: 800, fontSize: 13, color: '#DC2626' }}>
                    <span>Total Deductions</span>
                    <span>{formatCurrency(totalDeductions)}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Net Take-Home Salary Banner */}
              <div style={{
                background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
                borderRadius: 14,
                padding: '20px 24px',
                color: '#FFFFFF',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.4)',
              }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#C7D2FE' }}>
                    Net Take-Home Salary
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 900, marginTop: 4, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                    {formatCurrency(netSalary)} <span style={{ fontSize: 14, fontWeight: 500, color: '#E0E7FF' }}>/ Month</span>
                  </div>
                  {amountInWords && (
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#E0E7FF', marginTop: 4 }}>
                      Amount in Words: {amountInWords}
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'right', fontSize: 12, color: '#E0E7FF' }}>
                  <div style={{ fontSize: 11, color: '#C7D2FE', opacity: 0.9 }}>
                    Computer generated payslip — no signature required.
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

