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

// Interceptor: Lida com Erros de Rede/Queda do Servidor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se for erro de rede (Network Error) ou falha catastrófica (500/502/503)
    if (!error.response || error.code === 'ERR_NETWORK') {
      window.dispatchEvent(new CustomEvent('networkError'));
    } else if (error.response.status >= 500) {
      window.dispatchEvent(new CustomEvent('networkError'));
    }
    return Promise.reject(error);
  }
);

// Helper para URL de uploads
export const getUploadUrl = (filename) => {
  if (!filename) return null;
  // Em produção API_URL é vazio, então usa path relativo
  // Em dev, API_URL aponta para o backend
  return API_URL ? `${API_URL}/uploads/${filename}` : `/uploads/${filename}`;
};

export default api;
