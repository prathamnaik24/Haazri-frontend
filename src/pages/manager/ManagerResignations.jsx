import React, { useEffect, useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import { getManagerResignations, managerAction } from '../../services/resignation';

export default function ManagerResignations() {
  const [resignations, setResignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [selectedResignation, setSelectedResignation] = useState(null);
  const [actionType, setActionType] = useState('APPROVE'); // APPROVE or REJECT
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchResignations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getManagerResignations();
      setResignations(res.data.resignations || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch team resignation requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResignations();
  }, []);

  const openActionModal = (resignation, type) => {
    setSelectedResignation(resignation);
    setActionType(type);
    setComment('');
  };

  const closeModal = () => {
    setSelectedResignation(null);
    setComment('');
  };

  const handleAction = async (e) => {
    e.preventDefault();
    if (actionType === 'REJECT' && (!comment || !comment.trim())) {
      setError('A valid rejection comment is required when rejecting a resignation.');
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await managerAction(selectedResignation.id, {
        action: actionType,
        comment,
      });
      setSuccess(`Resignation request for ${selectedResignation.first_name} ${selectedResignation.last_name} ${actionType === 'APPROVE' ? 'approved and forwarded to HR' : 'rejected'}.`);
      closeModal();
      await fetchResignations();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${actionType.toLowerCase()} resignation request`);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING_MANAGER_REVIEW: { bg: '#FEF3C7', color: '#92400E', label: 'Pending Manager Review' },
      MANAGER_APPROVED: { bg: '#DBEAFE', color: '#1E40AF', label: 'Manager Approved' },
      HR_REVIEW: { bg: '#E0E7FF', color: '#3730A3', label: 'HR Review' },
      APPROVED: { bg: '#D1FAE5', color: '#065F46', label: 'Approved' },
      NOTICE_PERIOD: { bg: '#FCE7F3', color: '#9D174D', label: 'Notice Period' },
      COMPLETED: { bg: '#D1D5DB', color: '#1F2937', label: 'Completed' },
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
      <div style={{ padding: '24px 32px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1E293B', marginBottom: '4px' }}>
            Team Resignation Approvals
          </h1>
          <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
            Review and manage formal resignation requests submitted by your direct reports.
          </p>
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
            <p style={{ color: '#64748B', fontSize: '14px' }}>Loading team resignation requests...</p>
          ) : resignations.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1E293B', marginBottom: '4px' }}>
                No Resignation Requests Found
              </h3>
              <p style={{ fontSize: '13px', margin: 0 }}>
                None of your direct reporting team members currently have active resignation requests requiring your review.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', color: '#475569' }}>
                    <th style={{ padding: '12px 16px' }}>Employee</th>
                    <th style={{ padding: '12px 16px' }}>Position</th>
                    <th style={{ padding: '12px 16px' }}>Submission Date</th>
                    <th style={{ padding: '12px 16px' }}>Proposed LWD</th>
                    <th style={{ padding: '12px 16px' }}>Reason</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {resignations.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '600', color: '#0F172A' }}>
                        {r.first_name} {r.last_name}
                        <span style={{ display: 'block', fontSize: '12px', color: '#64748B', fontWeight: '400' }}>{r.email}</span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>{r.position_title || 'Unassigned Position'}</td>
                      <td style={{ padding: '12px 16px', color: '#64748B' }}>
                        {new Date(r.submission_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#0F172A', fontWeight: '500' }}>
                        {new Date(r.proposed_last_working_day).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#475569', maxWidth: '200px' }}>{r.reason}</td>
                      <td style={{ padding: '12px 16px' }}>{getStatusBadge(r.status)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {r.status === 'PENDING_MANAGER_REVIEW' ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => openActionModal(r, 'APPROVE')}
                              style={{ backgroundColor: '#10B981', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => openActionModal(r, 'REJECT')}
                              style={{ backgroundColor: '#EF4444', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#94A3B8' }}>Reviewed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Action Review Modal */}
        {selectedResignation && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
            <div style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '520px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                  {actionType === 'APPROVE' ? 'Approve Resignation Request' : 'Reject Resignation Request'}
                </h2>
                <button onClick={closeModal} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>✕</button>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', border: '1px solid #F1F5F9' }}>
                <div style={{ marginBottom: '4px' }}><strong>Employee:</strong> {selectedResignation.first_name} {selectedResignation.last_name} ({selectedResignation.email})</div>
                <div style={{ marginBottom: '4px' }}><strong>Position:</strong> {selectedResignation.position_title || 'N/A'}</div>
                <div style={{ marginBottom: '4px' }}><strong>Proposed Last Working Day:</strong> {new Date(selectedResignation.proposed_last_working_day).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                <div><strong>Reason:</strong> {selectedResignation.reason}</div>
              </div>

              <form onSubmit={handleAction}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    {actionType === 'REJECT' ? 'Rejection Reason (Required) *' : 'Manager Feedback / Comments (Optional)'}
                  </label>
                  <textarea
                    rows="3"
                    required={actionType === 'REJECT'}
                    maxLength={2000}
                    placeholder={actionType === 'REJECT' ? 'Provide clear reason for rejection...' : 'Add notes for HR review...'}
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
                      backgroundColor: actionType === 'APPROVE' ? '#10B981' : '#EF4444',
                      color: '#FFF',
                      border: 'none',
                      padding: '8px 18px',
                      borderRadius: '6px',
                      cursor: actionLoading ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                    }}
                  >
                    {actionLoading ? 'Processing...' : actionType === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
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
