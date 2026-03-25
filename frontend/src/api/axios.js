import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  withCredentials: false, // Set to false for pure Bearer Token API auth
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Intercept requests to add the auth token if we use Bearer tokens
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept responses for global error handling (e.g. 401 logout)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Potential redirect or state clear could go here
    }
    return Promise.reject(error);
  }
);

export default apiClient;
