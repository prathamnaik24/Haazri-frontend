import React, { useEffect, useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import { getOwnResignations, submitResignation } from '../../services/resignation';
import { ResignationTimeline } from '../../components/resignation/ResignationTimeline';
import { NoticePeriodCountdown } from '../../components/resignation/NoticePeriodCountdown';

export default function MyResignation() {
  const [resignations, setResignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [proposedDate, setProposedDate] = useState('');
  const [reason, setReason] = useState('');
  const [comments, setComments] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchResignations = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getOwnResignations();
      setResignations(data.data.resignations || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch resignation records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResignations();
  }, []);

  const activeResignation = resignations.find(r =>
    ['PENDING_MANAGER_REVIEW', 'MANAGER_APPROVED', 'HR_REVIEW', 'APPROVED', 'NOTICE_PERIOD'].includes(r.status)
  );

  const latestResignation = resignations[0];

  const handleOpenConfirm = (e) => {
    e.preventDefault();
    if (!proposedDate || !reason) {
      setError('Please fill in both proposed last working day and reason');
      return;
    }
    setError('');
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await submitResignation({
        proposed_last_working_day: proposedDate,
        reason,
        comments,
      });
      setSuccess('Your formal resignation request has been submitted successfully.');
      setProposedDate('');
      setReason('');
      setComments('');
      setShowForm(false);
      await fetchResignations();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit resignation request. Please check input details.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING_MANAGER_REVIEW: { bg: '#FEF3C7', color: '#92400E', label: 'Pending Manager Review' },
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
        padding: '4px 12px',
        borderRadius: '16px',
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1E293B', marginBottom: '4px' }}>
              My Resignation Workflow
            </h1>
            <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
              Initiate and track your formal resignation request and notice period progression.
            </p>
          </div>
          {!activeResignation && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              style={{
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                padding: '10px 18px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px',
                boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)',
              }}
            >
              + Initiate Resignation
            </button>
          )}
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

        {/* Active Resignation Section */}
        {activeResignation && (
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '32px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0F172A', margin: 0 }}>Active Resignation Request</h2>
                <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
                  Submitted on: {new Date(activeResignation.submission_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div>{getStatusBadge(activeResignation.status)}</div>
            </div>

            {/* Visual Timeline */}
            <ResignationTimeline
              status={activeResignation.status}
              managerComment={activeResignation.manager_comment}
              hrComment={activeResignation.hr_comment}
            />

            {/* Notice Period Countdown Display */}
            {activeResignation.status === 'NOTICE_PERIOD' && (
              <NoticePeriodCountdown
                approvedLastWorkingDay={activeResignation.approved_last_working_day}
                proposedLastWorkingDay={activeResignation.proposed_last_working_day}
              />
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '10px', marginBottom: '20px', border: '1px solid #F1F5F9' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#64748B', display: 'block', textTransform: 'uppercase', tracking: '0.05em' }}>Proposed Last Working Day</span>
                <strong style={{ fontSize: '15px', color: '#1E293B' }}>
                  {new Date(activeResignation.proposed_last_working_day).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: '#64748B', display: 'block', textTransform: 'uppercase', tracking: '0.05em' }}>Approved Last Working Day</span>
                <strong style={{ fontSize: '15px', color: '#1E293B' }}>
                  {activeResignation.approved_last_working_day ? new Date(activeResignation.approved_last_working_day).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Awaiting HR Approval'}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: '#64748B', display: 'block', textTransform: 'uppercase', tracking: '0.05em' }}>Manager Reviewer</span>
                <strong style={{ fontSize: '15px', color: '#1E293B' }}>
                  {activeResignation.manager_first_name ? `${activeResignation.manager_first_name} ${activeResignation.manager_last_name}` : 'Awaiting Review'}
                </strong>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <strong style={{ fontSize: '13px', color: '#475569' }}>Reason for Resignation:</strong>
              <p style={{ fontSize: '14px', color: '#334155', marginTop: '4px', background: '#F1F5F9', padding: '12px 14px', borderRadius: '8px', borderLeft: '4px solid #94A3B8' }}>
                {activeResignation.reason}
              </p>
            </div>

            {activeResignation.comments && (
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ fontSize: '13px', color: '#475569' }}>Employee Additional Comments:</strong>
                <p style={{ fontSize: '14px', color: '#334155', marginTop: '4px', background: '#F8FAFC', padding: '10px 14px', borderRadius: '6px' }}>
                  {activeResignation.comments}
                </p>
              </div>
            )}

            {activeResignation.manager_comment && (
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ fontSize: '13px', color: '#1E40AF' }}>Manager Feedback:</strong>
                <p style={{ fontSize: '13px', color: '#1E3A8A', marginTop: '4px', background: '#EFF6FF', padding: '10px 14px', borderRadius: '6px', borderLeft: '4px solid #3B82F6' }}>
                  {activeResignation.manager_comment}
                </p>
              </div>
            )}

            {activeResignation.hr_comment && (
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ fontSize: '13px', color: '#3730A3' }}>HR Feedback:</strong>
                <p style={{ fontSize: '13px', color: '#312E81', marginTop: '4px', background: '#EEF2FF', padding: '10px 14px', borderRadius: '6px', borderLeft: '4px solid #6366F1' }}>
                  {activeResignation.hr_comment}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty State when no active resignation */}
        {!activeResignation && !showForm && (
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '40px 24px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '32px', border: '1px dashed #CBD5E1' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>📄</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>
              No Active Resignation Request
            </h3>
            <p style={{ color: '#64748B', fontSize: '14px', maxWidth: '480px', margin: '0 auto 20px auto' }}>
              You currently do not have any active resignation request in progress. Click below if you wish to formally initiate a resignation.
            </p>
            <button
              onClick={() => setShowForm(true)}
              style={{
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Initiate Resignation Request
            </button>
          </div>
        )}

        {/* Submit Resignation Form */}
        {!activeResignation && showForm && (
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '32px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0F172A', margin: 0 }}>
                Submit Formal Resignation
              </h2>
              <button
                onClick={() => setShowForm(false)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '14px' }}
              >
                ✕ Cancel
              </button>
            </div>
            <form onSubmit={handleOpenConfirm}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>
                    Proposed Last Working Day *
                  </label>
                  <input
                    type="date"
                    required
                    value={proposedDate}
                    onChange={(e) => setProposedDate(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>
                    Reason for Resignation *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={2000}
                    placeholder="e.g. Higher education, career transition"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>
                  Additional Context / Handover Notes (Optional)
                </label>
                <textarea
                  rows="3"
                  maxLength={2000}
                  placeholder="Provide notes for your manager and HR..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    backgroundColor: '#DC2626',
                    color: '#FFFFFF',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '600',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Review & Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    backgroundColor: '#F1F5F9',
                    color: '#475569',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '16px',
          }}>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', width: '100%', maxWidth: '480px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
                Confirm Resignation Submission
              </h3>
              <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '16px', lineHeight: '1.5' }}>
                Are you sure you want to submit your formal resignation? Your manager and HR will be notified to begin the review workflow.
              </p>
              <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }}>
                <div><strong>Proposed Last Day:</strong> {proposedDate}</div>
                <div><strong>Reason:</strong> {reason}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
                >
                  Go Back
                </button>
                <button
                  onClick={handleConfirmSubmit}
                  disabled={submitting}
                  style={{ padding: '8px 18px', borderRadius: '6px', border: 'none', background: '#DC2626', color: '#FFFFFF', fontWeight: '600', cursor: submitting ? 'not-allowed' : 'pointer' }}
                >
                  {submitting ? 'Submitting...' : 'Yes, Confirm Resignation'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Resignation History Table */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E2E8F0' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0F172A', marginBottom: '16px' }}>
            Resignation Request History
          </h2>
          {loading ? (
            <p style={{ color: '#64748B', fontSize: '14px' }}>Loading resignation history...</p>
          ) : resignations.length === 0 ? (
            <p style={{ color: '#94A3B8', fontSize: '14px' }}>No resignation records found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', color: '#475569' }}>
                    <th style={{ padding: '12px 16px' }}>Submission Date</th>
                    <th style={{ padding: '12px 16px' }}>Proposed LWD</th>
                    <th style={{ padding: '12px 16px' }}>Approved LWD</th>
                    <th style={{ padding: '12px 16px' }}>Reason</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {resignations.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px', color: '#64748B' }}>
                        {new Date(r.submission_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#0F172A', fontWeight: '500' }}>
                        {new Date(r.proposed_last_working_day).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#0F172A' }}>
                        {r.approved_last_working_day ? new Date(r.approved_last_working_day).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748B' }}>{r.reason}</td>
                      <td style={{ padding: '12px 16px' }}>{getStatusBadge(r.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
