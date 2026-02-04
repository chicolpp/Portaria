import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor: envia token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper para URL de uploads
export const getUploadUrl = (filename) => {
  if (!filename) return null;
  return `${API_URL}/uploads/${filename}`;
};

export default api;
