import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./routes/PrivateRoute";
import Header from "./pages/Header";
import Encomendas from "./pages/Encomendas";
import Portaria from "./pages/Portaria";
import CadastroUsuarios from "./pages/CadastroUsuarios";
import Ocorrencias from "./pages/Ocorrencias";

function App() {
  return (
    <BrowserRouter>
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
              <>
                <Header />
                <Dashboard />
              </>
            </PrivateRoute>
          }
        />

        <Route path="/encomendas"
          element={
            <PrivateRoute>
              <>
                <Header />
                <Encomendas />
              </>
            </PrivateRoute>
          }
        />

        <Route path="/portaria"
          element={
            <PrivateRoute>
              <>
                <Header />
                <Portaria />
              </>
            </PrivateRoute>
          }
        />

        <Route path="/cadastro-usuarios"
          element={
            <PrivateRoute>
              <>
                <Header />
                <CadastroUsuarios />
              </>
            </PrivateRoute>
          }
        />
        <Route path="/Ocorrencias" 
          element={
            <PrivateRoute >
              <>
                <Header />
                <Ocorrencias />
              </>

            </PrivateRoute>
            }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
