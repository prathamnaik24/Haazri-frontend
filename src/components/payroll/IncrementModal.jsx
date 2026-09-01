import React, { useState } from 'react';
import { proposeIncrement, reviewIncrement } from '../../services/compensation';

export default function IncrementModal({ employee, increment, mode = 'propose', onClose, onSuccess }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Propose state
  const [proposedSalary, setProposedSalary] = useState('');
  const [reason, setReason] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().split('T')[0]);

  // Review state
  const [statusAction, setStatusAction] = useState('APPROVED');
  const [reviewerComment, setReviewerComment] = useState('');

  const handleProposeSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await proposeIncrement({
        person_id: employee.id,
        proposed_salary: parseFloat(proposedSalary),
        reason,
        effective_from: effectiveFrom,
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to propose salary increment');
    } finally {
      setSaving(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await reviewIncrement(increment.id, {
        status: statusAction,
        reviewer_comment: reviewerComment,
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to review salary increment');
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
        background: '#FFFFFF', borderRadius: 16, width: '100%', maxWidth: 520,
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px', borderBottom: '1px solid #E2E8F0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC',
        }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0F172A' }}>
            {mode === 'propose' ? 'Propose Salary Increment' : 'Review Increment Request'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748B' }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: 24 }}>
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
              {error}
            </div>
          )}

          {mode === 'propose' ? (
            <form onSubmit={handleProposeSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Employee</label>
                <input
                  type="text"
                  disabled
                  value={`${employee?.first_name || ''} ${employee?.last_name || ''} (${employee?.email || ''})`}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 6, background: '#F8FAFC', fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Proposed Base Salary (₹) *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    placeholder="e.g. 65000"
                    value={proposedSalary}
                    onChange={(e) => setProposedSalary(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Effective Date *</label>
                  <input
                    type="date"
                    required
                    value={effectiveFrom}
                    onChange={(e) => setEffectiveFrom(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Reason / Performance Notes</label>
                <textarea
                  rows={3}
                  placeholder="e.g., Annual performance review rating 5/5 or promotion to Senior Engineer"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 14, boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: 6, padding: '10px 16px', fontSize: 14, color: '#475569', fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={{ background: '#2563EB', border: 'none', borderRadius: 6, padding: '10px 20px', fontSize: 14, color: '#FFFFFF', fontWeight: 600, cursor: 'pointer' }}>
                  {saving ? 'Submitting...' : 'Submit Proposal'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleReviewSubmit}>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 13 }}>
                <div><strong>Employee:</strong> {increment?.first_name} {increment?.last_name}</div>
                <div><strong>Current Base:</strong> ₹{parseFloat(increment?.current_salary || 0).toLocaleString()}</div>
                <div><strong>Proposed Base:</strong> ₹{parseFloat(increment?.proposed_salary || 0).toLocaleString()} ({increment?.increment_percentage}% increment)</div>
                {increment?.reason && <div><strong>Reason:</strong> {increment.reason}</div>}
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Action *</label>
                <select
                  value={statusAction}
                  onChange={(e) => setStatusAction(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 14 }}
                >
                  <option value="APPROVED">APPROVE (Applies new base salary automatically)</option>
                  <option value="REJECTED">REJECT</option>
                  <option value="CANCELLED">CANCEL</option>
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Reviewer Comment</label>
                <textarea
                  rows={3}
                  placeholder="e.g., Approved based on Q3 department performance targets"
                  value={reviewerComment}
                  onChange={(e) => setReviewerComment(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 14, boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: 6, padding: '10px 16px', fontSize: 14, color: '#475569', fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={{ background: statusAction === 'APPROVED' ? '#059669' : '#DC2626', border: 'none', borderRadius: 6, padding: '10px 20px', fontSize: 14, color: '#FFFFFF', fontWeight: 600, cursor: 'pointer' }}>
                  {saving ? 'Processing...' : `Confirm ${statusAction}`}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
