import api from './api.js';

// Employee self-view payroll history
export async function getMyPayrollHistory(filters = {}) {
  const params = new URLSearchParams();
  if (filters.year) params.append('year', filters.year);
  if (filters.month) params.append('month', filters.month);

  const response = await api.get(`/payroll/me?${params.toString()}`);
  return response.data;
}

// Admin / HR list payroll records
export async function getPayrollRecords(filters = {}) {
  const params = new URLSearchParams();
  if (filters.person_id) params.append('person_id', filters.person_id);
  if (filters.month) params.append('month', filters.month);
  if (filters.year) params.append('year', filters.year);
  if (filters.status) params.append('status', filters.status);

  const response = await api.get(`/payroll/records?${params.toString()}`);
  return response.data;
}

// Get single payroll record detail by ID
export async function getPayrollRecordById(payrollId) {
  const response = await api.get(`/payroll/records/${payrollId}`);
  return response.data;
}

// Generate or calculate monthly payroll for an employee
export async function generateMonthlyPayroll(data) {
  const response = await api.post('/payroll/generate', data);
  return response.data;
}

// Update payroll status (Pending, Processed, Paid)
export async function updatePayrollStatus(payrollId, data) {
  const response = await api.patch(`/payroll/records/${payrollId}/status`, data);
  return response.data;
}

// Employee self-view payslips
export async function getMyPayslips(year = null) {
  const params = new URLSearchParams();
  if (year) params.append('year', year);

  const response = await api.get(`/payroll/payslips/me?${params.toString()}`);
  return response.data;
}

// Admin / HR view payslips for a specific employee
export async function getPersonPayslips(personId, year = null) {
  const params = new URLSearchParams();
  if (year) params.append('year', year);

  const response = await api.get(`/payroll/payslips/person/${personId}?${params.toString()}`);
  return response.data;
}

// Create/Upload payslip PDF metadata
export async function uploadPayslip(data) {
  const response = await api.post('/payroll/payslips', data);
  return response.data;
}
