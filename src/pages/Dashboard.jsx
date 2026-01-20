import { useNavigate } from "react-router-dom";
import { logout } from "../services/auth";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();          // remove o token
    navigate("/login"); // redireciona para login
  };

  return (
    <div style={{ padding: 50, fontFamily: "sans-serif" }}>
      <h1>Bem-vindo!</h1>
      <p>Login realizado com sucesso. Você está autenticado.</p>
      
      <button
        onClick={handleLogout}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          backgroundColor: "#ff4d4f",
          color: "white",
          border: "none",
          borderRadius: 5,
          cursor: "pointer",
          fontSize: 16
        }}
      >
        Logout
      </button>
    </div>
  );
}
