import API from '../api/axiosInstance';

const api = {
  get: (url, config) => API.get(url, config).then(res => res.data),
  post: (url, data, config) => API.post(url, data, config).then(res => res.data),
  patch: (url, data, config) => API.patch(url, data, config).then(res => res.data),
  delete: (url, config) => API.delete(url, config).then(res => res.data),
};

export default api;
