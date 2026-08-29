import api from './api.js';

export async function getCurrentSubscription() {
  const response = await api.get('/subscriptions/current');
  return response.data;
}

export async function getSubscriptionPlans() {
  const response = await api.get('/subscriptions/plans');
  return response.data;
}

export async function changeSubscriptionPlan(planId) {
  const response = await api.post('/subscriptions/change-plan', { plan_id: planId });
  return response.data;
}

export async function getSubscriptionHistory() {
  const response = await api.get('/subscriptions/history');
  return response.data;
}

export async function getFinanceSummary() {
  const response = await api.get('/finance/summary');
  return response.data;
}

export async function getFinancialSnapshots(filters = {}) {
  const params = new URLSearchParams();
  if (filters.from) params.append('from', filters.from);
  if (filters.to) params.append('to', filters.to);
  if (filters.department_id) params.append('department_id', filters.department_id);

  const response = await api.get(`/finance/snapshots?${params.toString()}`);
  return response.data;
}

export async function generateSnapshot(date) {
  const response = await api.post('/finance/snapshots/generate', { date });
  return response.data;
}
