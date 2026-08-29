import React, { useEffect, useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import {
  getCurrentSubscription,
  getSubscriptionPlans,
  changeSubscriptionPlan,
  getSubscriptionHistory,
} from '../../services/subscriptions';

export default function BillingPortal() {
  const [currentSub, setCurrentSub] = useState(null);
  const [plans, setPlans] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [capacityError, setCapacityError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Modal State
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [changing, setChanging] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [subRes, plansRes, historyRes] = await Promise.all([
        getCurrentSubscription().catch(() => null),
        getSubscriptionPlans().catch(() => null),
        getSubscriptionHistory().catch(() => null),
      ]);

      if (subRes && subRes.data) {
        setCurrentSub(subRes.data);
      }
      if (plansRes && plansRes.data && plansRes.data.plans) {
        setPlans(plansRes.data.plans);
      }
      if (historyRes && historyRes.data && historyRes.data.history) {
        setHistory(historyRes.data.history);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConfirmChange = async () => {
    if (!selectedPlan) return;
    try {
      setChanging(true);
      setError('');
      setCapacityError(null);
      const res = await changeSubscriptionPlan(selectedPlan.id);
      setSuccessMsg(res.message || `Successfully changed subscription to ${selectedPlan.name}`);
      setSelectedPlan(null);
      await fetchData();
    } catch (err) {
      const errData = err.response?.data;
      if (errData && errData.error === 'PLAN_CHANGE_EXCEEDS_MAX_EMPLOYEES') {
        setCapacityError(errData);
      } else {
        setError(errData?.message || 'Failed to change subscription plan');
      }
    } finally {
      setChanging(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const featureLabels = {
    basic_attendance: 'Basic Attendance Tracking',
    basic_leaves: 'Leave & Absence Management',
    financial_dashboard: 'CEO & Admin Financial Overview',
    billing_portal: 'Subscription & Billing Portal',
    subscription_management: 'Self-Service Plan Upgrades',
    advanced_analytics: 'Advanced Performance Analytics',
    custom_roles: 'Custom RBAC Role Definitions',
    api_access: 'Developer API Access',
  };

  return (
    <AppShell>
      <div style={{ padding: '28px 36px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#172B3A', margin: 0, letterSpacing: '-0.02em' }}>
            Billing & Subscription Management
          </h1>
          <p style={{ fontSize: 14, color: '#526B7A', marginTop: 4, margin: 0 }}>
            Manage your organization's subscription tier, employee capacity, feature entitlements, and audit history.
          </p>
        </div>

        {/* Notifications */}
        {error && (
          <div style={{
            background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B',
            padding: '12px 16px', borderRadius: 10, fontSize: 14, marginBottom: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span>{error}</span>
            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: '#991B1B' }}>✕</button>
          </div>
        )}

        {capacityError && (
          <div style={{
            background: '#FFFBEB', border: '1px solid #FCD34D', color: '#92400E',
            padding: '16px 20px', borderRadius: 12, fontSize: 14, marginBottom: 20,
          }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
              Plan Change Rejected: Employee Limit Exceeded
            </div>
            <div>{capacityError.message}</div>
            <div style={{ marginTop: 8, fontSize: 13, color: '#B45309' }}>
              • Active Employees: <strong>{capacityError.current_employee_count}</strong>
              <br />
              • Selected Plan Limit: <strong>{capacityError.plan_max_employees}</strong>
            </div>
            <button
              onClick={() => setCapacityError(null)}
              style={{ marginTop: 12, background: '#92400E', color: '#FFFFFF', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >
              Dismiss
            </button>
          </div>
        )}

        {successMsg && (
          <div style={{
            background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534',
            padding: '12px 16px', borderRadius: 10, fontSize: 14, marginBottom: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: '#166534' }}>✕</button>
          </div>
        )}

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#526B7A', fontSize: 15 }}>
            Loading subscription portal...
          </div>
        ) : (
          <>
            {/* Current Active Plan Section */}
            {currentSub && (
              <div style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #F0F7FF 100%)',
                border: '1px solid #D7E6EF', borderRadius: 16, padding: 24, marginBottom: 32,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1677B8' }}>
                        Active Organization Plan
                      </span>
                      <span style={{
                        background: '#DCFCE7', color: '#15803D', fontSize: 12, fontWeight: 600,
                        padding: '3px 10px', borderRadius: 20, textTransform: 'capitalize',
                      }}>
                        ● {currentSub.status || 'Active'}
                      </span>
                    </div>

                    <h2 style={{ fontSize: 28, fontWeight: 800, color: '#172B3A', margin: 0 }}>
                      {currentSub.plan?.name || 'Growth Plan'}
                    </h2>
                    <p style={{ fontSize: 14, color: '#526B7A', margin: '4px 0 0 0' }}>
                      Up to <strong>{currentSub.plan?.max_employees || 100}</strong> employees allowed
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 26, fontWeight: 800, color: '#172B3A' }}>
                      {currentSub.plan?.price_cents === 0 ? 'Free' : `$${(currentSub.plan?.price_cents / 100).toFixed(2)}`}
                      <span style={{ fontSize: 14, fontWeight: 400, color: '#526B7A' }}> / year</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#8AA0AD', marginTop: 4 }}>
                      Current period: {formatDate(currentSub.current_period?.start)} – {formatDate(currentSub.current_period?.end)}
                    </div>
                  </div>
                </div>

                {/* Features Badges */}
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #E2E8F0', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {(currentSub.features || []).map((feat, idx) => (
                    <span key={idx} style={{
                      background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#334155',
                      fontSize: 12, fontWeight: 500, padding: '4px 12px', borderRadius: 6,
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      <span style={{ color: '#1677B8', fontWeight: 700 }}>✓</span>
                      {featureLabels[feat] || feat.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Available Subscription Plans Section */}
            <div style={{ marginBottom: 36 }}>
              <div style={{ marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#172B3A', margin: 0 }}>
                  Available Subscription Tiers
                </h2>
                <p style={{ fontSize: 13, color: '#526B7A', margin: '2px 0 0 0' }}>
                  Select a tier that suits your organization size and feature requirements.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                {plans.map((plan) => {
                  const isCurrent = currentSub?.plan?.id === plan.id || currentSub?.plan?.slug === plan.slug;
                  return (
                    <div key={plan.id} style={{
                      background: '#FFFFFF',
                      border: isCurrent ? '2px solid #1677B8' : '1px solid #E2E8F0',
                      borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column',
                      position: 'relative', boxShadow: isCurrent ? '0 8px 24px rgba(22, 119, 184, 0.12)' : '0 2px 8px rgba(0,0,0,0.02)',
                    }}>
                      {isCurrent && (
                        <div style={{
                          position: 'absolute', top: -12, right: 20,
                          background: '#1677B8', color: '#FFFFFF',
                          fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
                          textTransform: 'uppercase', padding: '3px 10px', borderRadius: 12,
                        }}>
                          Current Plan
                        </div>
                      )}

                      <h3 style={{ fontSize: 20, fontWeight: 700, color: '#172B3A', margin: 0 }}>
                        {plan.name}
                      </h3>
                      <div style={{ fontSize: 13, color: '#526B7A', marginTop: 4 }}>
                        Max {plan.max_employees} employees
                      </div>

                      <div style={{ margin: '16px 0 20px 0' }}>
                        <span style={{ fontSize: 32, fontWeight: 800, color: '#172B3A' }}>
                          {plan.price_cents === 0 ? '$0' : `$${(plan.price_cents / 100).toFixed(2)}`}
                        </span>
                        <span style={{ fontSize: 14, color: '#64748B' }}> / year</span>
                      </div>

                      <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 16, marginBottom: 24, flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: 12 }}>
                          Included Features
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {(plan.features || []).map((feat, i) => (
                            <li key={i} style={{ fontSize: 13, color: '#334155', display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ color: '#22C55E', fontWeight: 'bold' }}>✓</span>
                              {featureLabels[feat] || feat.replace(/_/g, ' ')}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        onClick={() => setSelectedPlan(plan)}
                        disabled={isCurrent}
                        style={{
                          width: '100%', padding: '10px 16px', borderRadius: 10, border: 'none',
                          fontWeight: 600, fontSize: 14, cursor: isCurrent ? 'default' : 'pointer',
                          transition: 'all 0.15s',
                          background: isCurrent ? '#E2E8F0' : '#1677B8',
                          color: isCurrent ? '#94A3B8' : '#FFFFFF',
                        }}
                      >
                        {isCurrent ? 'Active Plan' : 'Select Plan'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Plan History Audit Timeline */}
            <div style={{
              background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: 24, marginBottom: 32,
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#172B3A', margin: '0 0 16px 0' }}>
                Subscription Change History
              </h3>

              {history.length === 0 ? (
                <div style={{ fontSize: 14, color: '#64748B', textAlign: 'center', padding: '20px 0' }}>
                  No plan changes recorded yet.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                        <th style={{ padding: '10px 12px' }}>Date & Time</th>
                        <th style={{ padding: '10px 12px' }}>Changed By</th>
                        <th style={{ padding: '10px 12px' }}>Previous Plan</th>
                        <th style={{ padding: '10px 12px' }}>New Plan</th>
                        <th style={{ padding: '10px 12px' }}>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((item) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9', color: '#334155' }}>
                          <td style={{ padding: '12px' }}>{formatDateTime(item.changed_at)}</td>
                          <td style={{ padding: '12px', fontWeight: 600 }}>{item.changed_by?.name || item.changed_by?.email || 'Admin'}</td>
                          <td style={{ padding: '12px', color: '#64748B' }}>{item.old_plan?.name || '—'}</td>
                          <td style={{ padding: '12px', fontWeight: 700, color: '#1677B8' }}>{item.new_plan?.name}</td>
                          <td style={{ padding: '12px', color: '#64748B' }}>{item.reason || 'Self-service plan update'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Payment Integration Readiness */}
            <div style={{
              background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: 24,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: '#EFF6FF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1D4ED8', fontWeight: 700,
                }}>
                  💳
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#172B3A', margin: 0 }}>
                    Payment Provider Integration
                  </h3>
                  <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
                    Schema fields for Stripe & Paddle subscriptions are active.
                  </p>
                </div>
              </div>

              <div style={{
                background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: 12,
                padding: '20px', textAlign: 'center', color: '#64748B', fontSize: 13,
              }}>
                Database architecture is pre-configured with <code>provider_customer_id</code> and <code>provider_subscription_id</code> fields.
                When you are ready to connect a payment gateway, live invoices and checkout will work seamlessly without schema changes.
              </div>
            </div>
          </>
        )}

        {/* Change Plan Confirmation Modal */}
        {selectedPlan && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: 20,
          }}>
            <div style={{
              background: '#FFFFFF', borderRadius: 16, padding: 28, maxWidth: 440, width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#172B3A', margin: 0 }}>
                Confirm Subscription Change
              </h3>
              <p style={{ fontSize: 14, color: '#64748B', marginTop: 8 }}>
                Are you sure you want to switch your organization to the <strong>{selectedPlan.name}</strong> plan?
              </p>

              <div style={{
                background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10,
                padding: 16, margin: '20px 0', fontSize: 13, color: '#334155',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: '#64748B' }}>Max Employees:</span>
                  <strong>{selectedPlan.max_employees}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Price:</span>
                  <strong>{selectedPlan.price_cents === 0 ? 'Free' : `$${(selectedPlan.price_cents / 100).toFixed(2)} / yr`}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setSelectedPlan(null)}
                  disabled={changing}
                  style={{
                    padding: '10px 18px', borderRadius: 8, border: '1px solid #CBD5E1',
                    background: '#FFFFFF', color: '#334155', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmChange}
                  disabled={changing}
                  style={{
                    padding: '10px 18px', borderRadius: 8, border: 'none',
                    background: '#1677B8', color: '#FFFFFF', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {changing ? 'Updating...' : 'Confirm Plan Change'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
