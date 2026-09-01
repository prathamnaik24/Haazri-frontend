import React from 'react';

export default function PayslipModal({ payslip, payroll, onClose }) {
  if (!payroll && !payslip) return null;

  const data = payroll || {};
  const employeeName = data.first_name && data.last_name 
    ? `${data.first_name} ${data.last_name}` 
    : data.employee_name || 'Employee';
  
  const empId = data.employee_id || 'N/A';
  const email = data.email || '';
  const monthName = data.month 
    ? new Date(2000, data.month - 1, 1).toLocaleString('default', { month: 'long' }) 
    : '';
  const periodText = monthName && data.year ? `${monthName} ${data.year}` : 'Salary Statement';

  const basicSalary = parseFloat(data.basic_salary || 0);
  const hra = parseFloat(data.hra || 0);
  const standardAllowance = parseFloat(data.standard_allowance || 0);
  const performanceBonus = parseFloat(data.performance_bonus || 0);
  const lta = parseFloat(data.leave_travel_allowance || 0);
  const fixedAllowance = parseFloat(data.fixed_allowance || 0);
  const stockEquity = parseFloat(data.stock_equity || 0);
  const totalEarnings = parseFloat(data.total_earnings || (basicSalary + hra + standardAllowance + performanceBonus + lta + fixedAllowance + stockEquity));

  const pf = parseFloat(data.provident_fund || 0);
  const pt = parseFloat(data.professional_tax || 0);
  const tds = parseFloat(data.tds || 0);
  const otherDeductions = parseFloat(data.other_deductions || 0);
  const totalDeductions = parseFloat(data.total_deductions || (pf + pt + tds + otherDeductions));

  const netSalary = parseFloat(data.net_salary || (totalEarnings - totalDeductions));
  const isPaid = (data.status || '').toLowerCase() === 'paid';

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (val) => {
    return '₹' + val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
        overflowY: 'auto',
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
            height: 100% !important;
            background: #ffffff !important;
            padding: 0 !important;
          }
          .payslip-modal-content {
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            max-width: 100% !important;
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
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 16, fontWeight: 700, color: '#1E293B' }}>
            <span>🖨️</span>
            <span>Salary Pay Slip</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={handlePrint}
              style={{
                background: '#4F46E5',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '999px',
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
              <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
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
                fontSize: 16,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Inner Body */}
        <div style={{ padding: '24px 28px' }}>
          
          {/* Header Branding Banner */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
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
                H
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                  HAAZRI HRMS
                </h2>
                <div style={{ fontSize: 13, color: '#64748B', marginTop: 2, fontWeight: 500 }}>
                  Official Employee Salary Statement
                </div>
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 1 }}>
                  Month: {periodText}
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
                {isPaid ? 'Payment Confirmed' : `Status: ${data.status || 'Pending'}`}
              </span>
              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 6 }}>
                Generated on: {new Date(data.updated_at || data.created_at || Date.now()).toLocaleDateString('en-GB')}
              </div>
            </div>
          </div>

          {/* Employee & Payment Information Box */}
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
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#94A3B8', letterSpacing: '0.05em', marginBottom: 8 }}>
                Employee Details
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>
                {employeeName}
              </div>
              <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
                <span style={{ color: '#94A3B8' }}>ID: </span>
                <span style={{ fontWeight: 600 }}>{empId}</span>
              </div>
              {email && (
                <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
                  <span style={{ color: '#94A3B8' }}>Email: </span>
                  {email}
                </div>
              )}
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#94A3B8', letterSpacing: '0.05em', marginBottom: 8 }}>
                Statement & Payment Details
              </div>
              <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
                <div><span style={{ color: '#94A3B8' }}>Pay Period: </span><strong style={{ color: '#0F172A' }}>{periodText}</strong></div>
                {data.payment_date && (
                  <div><span style={{ color: '#94A3B8' }}>Payment Date: </span><strong style={{ color: '#0F172A' }}>{new Date(data.payment_date).toLocaleDateString('en-GB')}</strong></div>
                )}
                {data.payment_reference && (
                  <div><span style={{ color: '#94A3B8' }}>Ref #: </span><strong style={{ color: '#0F172A' }}>{data.payment_reference}</strong></div>
                )}
                {data.working_days !== undefined && data.working_days !== null && (
                  <div><span style={{ color: '#94A3B8' }}>Days (Paid / Work): </span><strong style={{ color: '#0F172A' }}>{data.paid_days || data.working_days} / {data.working_days}</strong></div>
                )}
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
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Basic Salary</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(basicSalary)}</span>
                </div>
                {hra > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>House Rent Allowance (HRA)</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(hra)}</span>
                  </div>
                )}
                {standardAllowance > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Standard Allowance</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(standardAllowance)}</span>
                  </div>
                )}
                {performanceBonus > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Performance Bonus</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(performanceBonus)}</span>
                  </div>
                )}
                {lta > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Leave Travel Allowance (LTA)</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(lta)}</span>
                  </div>
                )}
                {fixedAllowance > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Fixed Allowance</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(fixedAllowance)}</span>
                  </div>
                )}
                {stockEquity > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Stock / Equity</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(stockEquity)}</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #CBD5E1', paddingTop: 10, marginTop: 16, fontWeight: 800, fontSize: 13, color: '#0F172A' }}>
                <span>Total Earnings (Wage)</span>
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
                {pf > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Provident Fund (PF)</span>
                    <span style={{ fontWeight: 600, color: '#DC2626' }}>{formatCurrency(pf)}</span>
                  </div>
                )}
                {pt > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Professional Tax (PT)</span>
                    <span style={{ fontWeight: 600, color: '#DC2626' }}>{formatCurrency(pt)}</span>
                  </div>
                )}
                {tds > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Income Tax (TDS)</span>
                    <span style={{ fontWeight: 600, color: '#DC2626' }}>{formatCurrency(tds)}</span>
                  </div>
                )}
                {otherDeductions > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Other Deductions</span>
                    <span style={{ fontWeight: 600, color: '#DC2626' }}>{formatCurrency(otherDeductions)}</span>
                  </div>
                )}
                {pf === 0 && pt === 0 && tds === 0 && otherDeductions === 0 && (
                  <div style={{ color: '#94A3B8', fontSize: 12, italic: 'true' }}>
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

          {/* Bottom Purple Net Take-Home Salary Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
            borderRadius: 14,
            padding: '20px 24px',
            color: '#FFFFFF',
            display: 'flex',
            justify: 'space-between',
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
            </div>

            <div style={{ textAlign: 'right', fontSize: 12, color: '#E0E7FF' }}>
              {pf > 0 && (
                <div style={{ fontWeight: 600, color: '#FFFFFF', marginBottom: 4 }}>
                  Employer PF Contribution: {formatCurrency(pf)}
                </div>
              )}
              <div style={{ fontSize: 11, color: '#C7D2FE', opacity: 0.9 }}>
                Computer generated payslip — no signature required.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
