import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./routes/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redireciona a raiz "/" para "/login" */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Rota pública */}
        <Route path="/login" element={<Login />} />

        {/* Rota protegida */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard /> {/* pode trocar para <Home /> se quiser página leve */}
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
