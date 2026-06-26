import { api } from './api'

export const batchesService = {
  create: (data)       => api.post('/batches', data),
  getAll: ()           => api.get('/batches'),
  getById: (id)        => api.get(`/batches/${id}`),
  advance: (id, data)  => api.post(`/batches/${id}/advance`, data),
}
