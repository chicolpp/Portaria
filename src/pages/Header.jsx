import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout, getUser } from "../services/auth";
import "./Header.css";

export default function Header() {
  const navigate = useNavigate();
  const user = getUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const quickLinks = [
    { path: "/encomendas", label: "Encomendas" },
    { path: "/portaria", label: "Portaria" },
    { path: "/livroocorrencias", label: "Livro de Ocorrências" },
    { path: "/espacosservicos", label: "Espaços e Serviços" },
  ];

  return (
    <header>
      {/* Sidebar esquerda */}
      <div className="header-sidebar">
        {/* Logo e nome do sistema */}
        <div className="header-brand">
          <Link to="/dashboard" className="header-logo">
            <img src="/icons/logo.png" alt="Logo" />
          </Link>
          
          {/* Perfil mobile - aparece só no celular */}
          <div className="mobile-user-profile">
            {user?.foto ? (
              <img src={`/uploads/${user.foto}`} alt="Avatar" />
            ) : (
              <div className="mobile-avatar-placeholder">👤</div>
            )}
            <span>{user?.nome || "Usuário"}</span>
          </div>
          
          <span className="header-system-name">Protheus</span>
        </div>

        {/* Pesquisa */}
        <div className="header-search">
          <input type="text" placeholder="Pesquisar..." />
          <button>🔍</button>
        </div>

        {/* Links rápidos */}
        <nav className="header-quick-links">
          {quickLinks.map((link) => (
            <Link key={link.path} to={link.path} className="quick-link">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Área direita - Perfil */}
      <div className="header-right">
        <div className="user-profile">
          {user?.foto ? (
            <img src={`/uploads/${user.foto}`} alt="Avatar" />
          ) : (
            <div className="user-avatar-placeholder">👤</div>
          )}
          <span>{user?.nome || "Usuário"}</span>
        </div>

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

      {/* Botão hamburger mobile */}
      <button 
        className="mobile-menu-btn" 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Menu"
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      {/* Menu mobile dropdown */}
      <div className={`mobile-dropdown ${mobileMenuOpen ? 'open' : ''}`}>
        <Link to="/cadastro-usuarios" onClick={() => setMobileMenuOpen(false)}>
          Cadastro de Usuários
        </Link>
        <Link to="/monitoramento" onClick={() => setMobileMenuOpen(false)}>
          Monitoração
        </Link>
        <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
          Sair
        </button>
      </div>
    </header>
  );
}
