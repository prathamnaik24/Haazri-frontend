import api from './api.js';

// Employee self-view compensation details
export async function getMyCompensation() {
  const response = await api.get('/compensation/me');
  return response.data;
}

// Admin / HR view employee compensation details
export async function getEmployeeCompensation(personId) {
  const response = await api.get(`/compensation/person/${personId}`);
  return response.data;
}

// Upsert base salary structure for an employee
export async function upsertSalaryStructure(personId, data) {
  const response = await api.post(`/compensation/person/${personId}/structure`, data);
  return response.data;
}

// Get salary components for an employee
export async function getSalaryComponents(personId) {
  const response = await api.get(`/compensation/person/${personId}/components`);
  return response.data;
}

// Add a salary component for an employee
export async function addSalaryComponent(personId, data) {
  const response = await api.post(`/compensation/person/${personId}/components`, data);
  return response.data;
}

// Update a salary component
export async function updateSalaryComponent(componentId, data) {
  const response = await api.patch(`/compensation/components/${componentId}`, data);
  return response.data;
}

// Deactivate/Delete a salary component
export async function deleteSalaryComponent(componentId) {
  const response = await api.delete(`/compensation/components/${componentId}`);
  return response.data;
}

// Admin / HR list salary increments
export async function getIncrements(filters = {}) {
  const params = new URLSearchParams();
  if (filters.person_id) params.append('person_id', filters.person_id);
  if (filters.status) params.append('status', filters.status);
  if (filters.proposed_by) params.append('proposed_by', filters.proposed_by);

  const response = await api.get(`/compensation/increments?${params.toString()}`);
  return response.data;
}

// Employee self-view increment history
export async function getMyIncrements() {
  const response = await api.get('/compensation/increments/me');
  return response.data;
}

// Propose a salary increment
export async function proposeIncrement(data) {
  const response = await api.post('/compensation/increments', data);
  return response.data;
}

// Review a salary increment (Approve / Reject / Cancel)
export async function reviewIncrement(incrementId, data) {
  const response = await api.patch(`/compensation/increments/${incrementId}/status`, data);
  return response.data;
}
