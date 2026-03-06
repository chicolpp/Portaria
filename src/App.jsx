import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./routes/PrivateRoute";
import Header from "./pages/Header";
import Encomendas from "./pages/Encomendas";
import Portaria from "./pages/Portaria";
import CadastroUsuarios from "./pages/CadastroUsuarios";
import Ocorrencias from "./pages/Ocorrencias";
import LivroDeOcorrencia from "./pages/Livrodeocorrencia";
import EspacosServicos from "./pages/EspacosServicos";
import { Toaster } from 'sonner';
import "./App.css";

function Layout({ children }) {
  return (
    <div className="app-layout">
      <Header />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function App() {
  const [isNetworkError, setIsNetworkError] = useState(false);

  useEffect(() => {
    // Escuta o evento customizado disparado pelo interceptor do Axios
    const handleNetworkError = () => {
      setIsNetworkError(true);

      // Tenta pingar o servidor a cada 3 segundos para ver se voltou
      const checkConnection = setInterval(async () => {
        try {
          const response = await fetch(import.meta.env.VITE_API_URL + "/health");
          if (response.ok) {
            setIsNetworkError(false);
            clearInterval(checkConnection);
            // Opcional: window.location.reload() para recarregar o estado limpo
          }
        } catch (e) {
          // Continua caido
        }
      }, 5000);
    };

    window.addEventListener('networkError', handleNetworkError);

    return () => {
      window.removeEventListener('networkError', handleNetworkError);
    };
  }, []);

  return (
    <BrowserRouter>
      {/* OVERLAY DE ERRO DE CONEXÃO GLOBAL */}
      {isNetworkError && (
        <div className="global-network-error-overlay">
          <div className="network-error-card">
            <div className="network-error-icon">📡❌</div>
            <h2>Conexão Perdida</h2>
            <p>Não foi possível conectar ao servidor ou banco de dados.</p>
            <p className="network-pulse">Aguardando reconexão automática...</p>
            <div className="network-spinner"></div>
          </div>
        </div>
      )}

      <Toaster position="top-right" richColors />
      <Routes>
        {/* Redireciona a raiz "/" para "/login" */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Rota pública */}
        <Route path="/login" element={<Login />} />

        {/* Rotas protegidas */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout><Dashboard /></Layout>
            </PrivateRoute>
          }
        />

        <Route path="/encomendas"
          element={
            <PrivateRoute>
              <Layout><Encomendas /></Layout>
            </PrivateRoute>
          }
        />

        <Route path="/portaria"
          element={
            <PrivateRoute>
              <Layout><Portaria /></Layout>
            </PrivateRoute>
          }
        />

        <Route path="/cadastro-usuarios"
          element={
            <PrivateRoute>
              <Layout><CadastroUsuarios /></Layout>
            </PrivateRoute>
          }
        />

        <Route path="/Ocorrencias"
          element={
            <PrivateRoute>
              <Layout><Ocorrencias /></Layout>
            </PrivateRoute>
          }
        />

        <Route path="/livroocorrencias"
          element={
            <PrivateRoute>
              <Layout><LivroDeOcorrencia /></Layout>
            </PrivateRoute>
          }
        />

        <Route path="/espacosservicos"
          element={
            <PrivateRoute>
              <Layout><EspacosServicos /></Layout>
            </PrivateRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
