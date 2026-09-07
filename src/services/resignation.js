import api from './api.js'

export const RESIGNATION_STATUSES = {
  PENDING_MANAGER_REVIEW: 'PENDING_MANAGER_REVIEW', MANAGER_APPROVED: 'MANAGER_APPROVED', HR_REVIEW: 'HR_REVIEW',
  APPROVED: 'APPROVED', NOTICE_PERIOD: 'NOTICE_PERIOD', COMPLETED: 'COMPLETED', REJECTED: 'REJECTED',
}

export const resignationService = {
  submit: payload => api.post('/resignation', payload),
  mine: () => api.get('/resignation/my'),
  manager: () => api.get('/resignation/manager'),
  managerAction: (id, payload) => api.post(`/resignation/${id}/manager-action`, payload),
  hr: status => api.get('/resignation/hr', { params: status ? { status } : {} }),
  hrAction: (id, payload) => api.post(`/resignation/${id}/hr-action`, payload),
  complete: (id, payload) => api.post(`/resignation/${id}/complete`, payload),
  detail: id => api.get(`/resignation/${id}`),
}

export function getResignations(response) {
  return response.data?.data?.resignations || []
}
