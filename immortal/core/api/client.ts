import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to get current user from localStorage
function getCurrentUser() {
  const stored = localStorage.getItem('battle_arena_user');
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

// Request interceptor - attach token to every request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const user = getCurrentUser();
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return just the data for successful responses
    return response.data;
  },
  (error: AxiosError) => {
    // Handle different error scenarios
    if (error.response?.status === 401) {
      // Unauthorized - logout and redirect
      localStorage.removeItem('battle_arena_user');
      localStorage.removeItem('current_admin_session');
      window.location.href = '/';
      return Promise.reject(new Error('Session expired. Please login again.'));
    }

    if (error.response?.status === 403) {
      return Promise.reject(new Error('You do not have permission to perform this action.'));
    }

    if (error.response?.status === 429) {
      return Promise.reject(new Error('Too many requests. Please slow down.'));
    }

    if (error.response?.status === 500) {
      return Promise.reject(new Error('Server error. Please try again later.'));
    }

    if (!error.response) {
      // Network error
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    // Return the error message from server if available
    const message = (error.response.data as any)?.message || error.message;
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
