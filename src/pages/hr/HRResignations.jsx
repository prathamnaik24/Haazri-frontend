import React, { useEffect, useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import { getHRResignations, hrAction, completeResignation } from '../../services/resignation';

export default function HRResignations() {
  const [resignations, setResignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [selectedResignation, setSelectedResignation] = useState(null);
  const [modalMode, setModalMode] = useState(''); // 'HR_APPROVE' or 'COMPLETE'
  const [approvedLwd, setApprovedLwd] = useState('');
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchResignations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getHRResignations(statusFilter ? { status: statusFilter } : {});
      setResignations(res.data.resignations || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch HR resignation records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResignations();
  }, [statusFilter]);

  const openModal = (resignation, mode) => {
    setSelectedResignation(resignation);
    setModalMode(mode);
    setApprovedLwd(resignation.proposed_last_working_day ? new Date(resignation.proposed_last_working_day).toISOString().split('T')[0] : '');
    setComment('');
  };

  const closeModal = () => {
    setSelectedResignation(null);
    setModalMode('');
    setComment('');
  };

  const handleSubmitModal = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      if (modalMode === 'HR_APPROVE') {
        await hrAction(selectedResignation.id, {
          approved_last_working_day: approvedLwd,
          comment,
        });
        setSuccess(`HR approval granted for ${selectedResignation.first_name} ${selectedResignation.last_name}. Notice period initiated.`);
      } else if (modalMode === 'COMPLETE') {
        await completeResignation(selectedResignation.id, { comment });
        setSuccess(`Resignation completed successfully. ${selectedResignation.first_name} ${selectedResignation.last_name}'s employment status is now RESIGNED.`);
      }
      closeModal();
      await fetchResignations();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING_MANAGER_REVIEW: { bg: '#FEF3C7', color: '#92400E', label: 'Pending Manager' },
      MANAGER_APPROVED: { bg: '#DBEAFE', color: '#1E40AF', label: 'Manager Approved' },
      HR_REVIEW: { bg: '#E0E7FF', color: '#3730A3', label: 'HR Review' },
      APPROVED: { bg: '#D1FAE5', color: '#065F46', label: 'Approved' },
      NOTICE_PERIOD: { bg: '#FCE7F3', color: '#9D174D', label: 'Notice Period' },
      COMPLETED: { bg: '#D1D5DB', color: '#1F2937', label: 'Completed (Resigned)' },
      REJECTED: { bg: '#FEE2E2', color: '#991B1B', label: 'Rejected' },
    };
    const s = styles[status] || { bg: '#F3F4F6', color: '#374151', label: status };
    return (
      <span style={{
        backgroundColor: s.bg,
        color: s.color,
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-block',
      }}>
        {s.label}
      </span>
    );
  };

  return (
    <AppShell>
      <div style={{ padding: '24px 32px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1E293B', marginBottom: '4px' }}>
              HR Resignation Administration
            </h1>
            <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
              Review manager-approved exit requests, set last working days, and execute formal offboarding.
            </p>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', backgroundColor: '#FFF', color: '#334155', fontWeight: '500' }}
            >
              <option value="">All Statuses</option>
              <option value="PENDING_MANAGER_REVIEW">Pending Manager Review</option>
              <option value="HR_REVIEW">HR Review</option>
              <option value="NOTICE_PERIOD">Notice Period</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ padding: '12px 16px', backgroundColor: '#ECFDF5', border: '1px solid #6EE7B7', color: '#065F46', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
            {success}
          </div>
        )}

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E2E8F0' }}>
          {loading ? (
            <p style={{ color: '#64748B', fontSize: '14px' }}>Loading resignation records...</p>
          ) : resignations.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1E293B', marginBottom: '4px' }}>
                No Resignation Records Found
              </h3>
              <p style={{ fontSize: '13px', margin: 0 }}>
                {statusFilter ? `No resignation records matching filter "${statusFilter}".` : 'No employee resignation requests found.'}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', color: '#475569' }}>
                    <th style={{ padding: '12px 16px' }}>Employee</th>
                    <th style={{ padding: '12px 16px' }}>Emp Status</th>
                    <th style={{ padding: '12px 16px' }}>Proposed LWD</th>
                    <th style={{ padding: '12px 16px' }}>Approved LWD</th>
                    <th style={{ padding: '12px 16px' }}>Manager Reviewer</th>
                    <th style={{ padding: '12px 16px' }}>Resignation Status</th>
                    <th style={{ padding: '12px 16px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resignations.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '600', color: '#0F172A' }}>
                        {r.first_name} {r.last_name}
                        <span style={{ display: 'block', fontSize: '12px', color: '#64748B', fontWeight: '400' }}>{r.email}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
                          backgroundColor: r.employment_status === 'RESIGNED' ? '#FEF2F2' : '#ECFDF5',
                          color: r.employment_status === 'RESIGNED' ? '#991B1B' : '#065F46'
                        }}>
                          {r.employment_status || 'ACTIVE'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#0F172A' }}>
                        {new Date(r.proposed_last_working_day).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#0F172A', fontWeight: '500' }}>
                        {r.approved_last_working_day ? new Date(r.approved_last_working_day).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>
                        {r.manager_first_name ? `${r.manager_first_name} ${r.manager_last_name}` : '-'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>{getStatusBadge(r.status)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {['HR_REVIEW', 'MANAGER_APPROVED'].includes(r.status) && (
                          <button
                            onClick={() => openModal(r, 'HR_APPROVE')}
                            style={{ backgroundColor: '#4F46E5', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}
                          >
                            HR Approve
                          </button>
                        )}

                        {['NOTICE_PERIOD', 'APPROVED'].includes(r.status) && (
                          <button
                            onClick={() => openModal(r, 'COMPLETE')}
                            style={{ backgroundColor: '#059669', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}
                          >
                            Complete Exit
                          </button>
                        )}

                        {['COMPLETED', 'REJECTED'].includes(r.status) && (
                          <span style={{ fontSize: '12px', color: '#94A3B8' }}>Finalized</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Action Modal */}
        {selectedResignation && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
            <div style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '520px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                  {modalMode === 'HR_APPROVE' ? 'HR Approval & Notice Period Setup' : 'Complete Employee Exit Formalities'}
                </h2>
                <button onClick={closeModal} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>✕</button>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', border: '1px solid #F1F5F9' }}>
                <div style={{ marginBottom: '4px' }}><strong>Employee:</strong> {selectedResignation.first_name} {selectedResignation.last_name} ({selectedResignation.email})</div>
                <div style={{ marginBottom: '4px' }}><strong>Proposed Last Working Day:</strong> {new Date(selectedResignation.proposed_last_working_day).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                <div style={{ marginBottom: '4px' }}><strong>Manager Reviewer:</strong> {selectedResignation.manager_first_name ? `${selectedResignation.manager_first_name} ${selectedResignation.manager_last_name}` : 'N/A'}</div>
                {selectedResignation.manager_comment && <div><strong>Manager Comment:</strong> {selectedResignation.manager_comment}</div>}
              </div>

              <form onSubmit={handleSubmitModal}>
                {modalMode === 'HR_APPROVE' && (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                      Approved Last Working Day *
                    </label>
                    <input
                      type="date"
                      required
                      value={approvedLwd}
                      onChange={(e) => setApprovedLwd(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                    />
                  </div>
                )}

                {modalMode === 'COMPLETE' && (
                  <div style={{ padding: '14px', backgroundColor: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', color: '#92400E' }}>
                    ⚠️ <strong>Important Confirmation:</strong> Completing this resignation will update the employee's status to <strong>RESIGNED</strong> and end their primary position assignment. The position itself remains intact in the org hierarchy.
                  </div>
                )}

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    HR Comments / Audit Notes
                  </label>
                  <textarea
                    rows="3"
                    maxLength={2000}
                    placeholder="Provide any HR administrative notes..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={closeModal}
                    style={{ backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    style={{
                      backgroundColor: modalMode === 'HR_APPROVE' ? '#4F46E5' : '#059669',
                      color: '#FFF',
                      border: 'none',
                      padding: '8px 18px',
                      borderRadius: '6px',
                      cursor: actionLoading ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                    }}
                  >
                    {actionLoading ? 'Processing...' : modalMode === 'HR_APPROVE' ? 'Approve & Start Notice Period' : 'Confirm Complete Exit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
