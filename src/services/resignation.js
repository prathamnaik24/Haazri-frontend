import api from './api.js';

export const submitResignation = async (data) => {
  const response = await api.post('/resignation', data);
  return response.data;
};

export const getOwnResignations = async () => {
  const response = await api.get('/resignation/my');
  return response.data;
};

export const getManagerResignations = async () => {
  const response = await api.get('/resignation/manager');
  return response.data;
};

export const managerAction = async (id, data) => {
  const response = await api.post(`/resignation/${id}/manager-action`, data);
  return response.data;
};

export const getHRResignations = async (params = {}) => {
  const response = await api.get('/resignation/hr', { params });
  return response.data;
};

export const hrAction = async (id, data) => {
  const response = await api.post(`/resignation/${id}/hr-action`, data);
  return response.data;
};

export const completeResignation = async (id, data) => {
  const response = await api.post(`/resignation/${id}/complete`, data);
  return response.data;
};

export const getResignationById = async (id) => {
  const response = await api.get(`/resignation/${id}`);
  return response.data;
};
