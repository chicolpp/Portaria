import { useNavigate } from "react-router-dom";
import { logout } from "../services/auth";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();          // remove o token
    navigate("/login"); // redireciona para login
  };

  return (
    <div>
      <h1>Bem-vindo!</h1>
      <p>Login realizado com sucesso. Você está autenticado.</p>
      
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
