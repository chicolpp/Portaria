import { Link, useNavigate } from "react-router-dom";
import { logout } from "../services/auth";
import "./Header.css";



export default function Header({ user }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header>
      <nav>
        {/* Esquerda: Logo ou nome do sistema */}
        <div className="nav-left">
          <Link to="/dashboard">Meu Sistema</Link>
        </div>

        {/* Centro: Pesquisa */}
        <div className="nav-center">
          <input type="text" placeholder="Pesquisar..." />
          <button>Buscar</button>
        </div>

        {/* Direita: Perfil + Menu suspenso */}
        <div className="nav-right">
          {/* Foto e nome do usuário */}
          <div className="user-profile">
            <img src={user?.avatar || "/default-avatar.png"} alt="Avatar" />
            <span>{user?.name || "Usuário"}</span>
          </div>

          {/* Botão suspenso */}
          <div className="dropdown">
            <button>Menu ▾</button>
            <ul className="dropdown-menu">
              <li>
                <Link to="/cadastro-usuarios">Cadastro de Usuários</Link>
              </li>
              <li>
                <Link to="/monitoramento">Monitoração</Link>
              </li>
              <li>
                <button onClick={handleLogout}>Sair</button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
