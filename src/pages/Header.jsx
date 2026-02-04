import { Link, useNavigate, useLocation } from "react-router-dom";
import { logout, getUser } from "../services/auth";
import { useState } from "react";
import "./Header.css";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/dashboard", label: "Início", icon: "🏠" },
    { path: "/encomendas", label: "Encomendas", icon: "📦" },
    { path: "/portaria", label: "Portaria", icon: "🚗" },
    { path: "/livroocorrencias", label: "Ocorrências", icon: "📋" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Header Superior - Mobile */}
      <header className="top-header">
        <Link to="/dashboard" className="header-logo">
          <img src="/icons/logo.png" alt="Logo" />
          <span className="header-title">Protheus</span>
        </Link>
        
        <div className="header-actions">
          <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            {user?.foto ? (
              <img src={`/uploads/${user.foto}`} alt="Avatar" className="avatar-mini" />
            ) : (
              <span className="avatar-placeholder">👤</span>
            )}
          </button>
        </div>
      </header>

      {/* Menu Dropdown */}
      {menuOpen && (
        <div className="menu-overlay" onClick={() => setMenuOpen(false)}>
          <div className="menu-dropdown" onClick={(e) => e.stopPropagation()}>
            <div className="menu-user-info">
              {user?.foto ? (
                <img src={`/uploads/${user.foto}`} alt="Avatar" />
              ) : (
                <div className="menu-avatar-placeholder">👤</div>
              )}
              <div className="menu-user-details">
                <span className="menu-user-name">{user?.nome || "Usuário"}</span>
                <span className="menu-user-email">{user?.email}</span>
              </div>
            </div>
            
            <div className="menu-divider"></div>
            
            <Link to="/cadastro-usuarios" className="menu-item" onClick={() => setMenuOpen(false)}>
              <span className="menu-icon">👥</span>
              Cadastro de Usuários
            </Link>
            <Link to="/monitoramento" className="menu-item" onClick={() => setMenuOpen(false)}>
              <span className="menu-icon">📊</span>
              Monitoração
            </Link>
            <Link to="/espacosservicos" className="menu-item" onClick={() => setMenuOpen(false)}>
              <span className="menu-icon">🏢</span>
              Espaços e Serviços
            </Link>
            
            <div className="menu-divider"></div>
            
            <button className="menu-item menu-logout" onClick={handleLogout}>
              <span className="menu-icon">🚪</span>
              Sair da conta
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation - Estilo Instagram */}
      <nav className="bottom-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${isActive(item.path) ? "active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
