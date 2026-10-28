import axios from 'axios';

// Gunakan relative path '/api' di browser agar Next.js rewrite mem-proxy ke port 5000.
// Memastikan aplikasi bisa diakses dari HP / internet tanpa terhalang CORS atau Mixed-Content HTTPS->HTTP.
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' ? '/api' : 'http://localhost:5000/api');

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('pmb_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        // localStorage.removeItem('pmb_token');
      }
    }
    return Promise.reject(error);
  },
);

export default api;
