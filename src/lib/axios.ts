import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to all requests
axiosInstance.interceptors.request.use((config) => {
  const authData = localStorage.getItem('user-auth');
  if (authData) {
    const { token } = JSON.parse(authData).state;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default axiosInstance;