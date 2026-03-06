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
  return (
    <BrowserRouter>
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
