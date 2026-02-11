import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout, getUser } from "../services/auth";
import { getUploadUrl } from "../services/api";
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

          <span className="header-system-name">Prothax</span>

          {/* Perfil mobile - aparece só no celular (à direita) */}
          <div className="mobile-user-profile">
            <span>{user?.nome || "Usuário"}</span>
            {user?.foto ? (
              <img
                src={getUploadUrl(user.foto)}
                alt="Avatar"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
            ) : null}
            <div className="mobile-avatar-placeholder" style={{ display: user?.foto ? 'none' : 'flex' }}>👤</div>
          </div>
        </div>

        {/* Pesquisa */}
        <div className="header-search">
          <input type="text" placeholder="Pesquisar..." />
          <button>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>
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
            <img
              src={getUploadUrl(user.foto)}
              alt="Avatar"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
          ) : null}
          <div className="user-avatar-placeholder" style={{ display: user?.foto ? 'none' : 'flex' }}>👤</div>
          <span>{user?.nome || "Usuário"}</span>
        </div>

        <div className="dropdown">
          <button>Menu ▾</button>
          <ul className="dropdown-menu">
            {user?.is_admin && (
              <>
                <li>
                  <Link to="/cadastro-usuarios">Cadastro de Usuários</Link>
                </li>
                <li>
                  <Link to="/monitoramento">Monitoração</Link>
                </li>
              </>
            )}
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
        {user?.is_admin && (
          <>
            <Link to="/cadastro-usuarios" onClick={() => setMobileMenuOpen(false)}>
              Cadastro de Usuários
            </Link>
            <Link to="/monitoramento" onClick={() => setMobileMenuOpen(false)}>
              Monitoração
            </Link>
          </>
        )}
        <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
          Sair
        </button>
      </div>
    </header>
  );
}
