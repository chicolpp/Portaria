import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout, getUser } from "../services/auth";
import { getUploadUrl } from "../services/api";
import logoImg from '../assets/logo.png';
import "./Header.css";

export default function Header() {
  const navigate = useNavigate();
  const user = getUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const cargo = user?.cargo?.toLowerCase() || "";
  const isAdmin = user?.is_admin || false;

  const porteiroLinks = [
    { path: "/encomendas", label: "Encomendas" },
    { path: "/portaria", label: "Portaria" },
    { path: "/livroocorrencias", label: "Livro de Ocorrências" },
    { path: "/espacosservicos", label: "Espaços e Serviços" },
  ];

  const moradorLinks = [
    { path: "/dashboard", label: "Liberação de Acessos" },
    { path: "/dashboard", label: "Visualização de Encomendas" },
    { path: "/dashboard", label: "Visualização de Ocorrências" },
    { path: "/dashboard", label: "Visualização de Chaves" },
  ];

  const quickLinks = [
    ...(cargo === "porteiro" || isAdmin ? porteiroLinks : []),
    ...(cargo === "morador" || isAdmin ? moradorLinks : [])
  ];

  // Áreas pesquisáveis do sistema
  const allSearchableAreas = [
    ...porteiroLinks,
    ...moradorLinks,
    { path: "/cadastro-usuarios", label: "Cadastro de Usuários", adminOnly: true },
    { path: "/monitoramento", label: "Monitoramento", adminOnly: true },
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim().length > 0) {
      const filtered = allSearchableAreas.filter(area => {
        if (area.adminOnly && !isAdmin) return false;
        
        // Check if the area belongs to the user's role
        const isPorteiroArea = porteiroLinks.some(link => link.path === area.path);
        const isMoradorArea = moradorLinks.some(link => link.path === area.path);

        if (isAdmin) return true;
        if (cargo === "porteiro" && isPorteiroArea) return true;
        if (cargo === "morador" && isMoradorArea) return true;
        
        return false;
      }).filter(area => area.label.toLowerCase().includes(value.toLowerCase()));
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (suggestions.length > 0) {
      navigate(suggestions[0].path);
      setSearchTerm("");
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (path) => {
    navigate(path);
    setSearchTerm("");
    setSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    } else if (e.key === "Escape") {
      setSuggestions([]);
      setSearchTerm("");
    }
  };

  const handleBlur = () => {
    // Pequeno delay para permitir o clique na sugestão antes de fechar
    setTimeout(() => {
      setSuggestions([]);
    }, 200);
  };

  return (
    <header>
      {/* Sidebar esquerda */}
      <div className="header-sidebar">
        {/* Logo e nome do sistema */}
        <div className="header-brand">
          <Link to="/dashboard" className="header-logo">
            <img src={logoImg} alt="Logo" />
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
          <input
            type="text"
            placeholder="Pesquisar..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
          />
          <button onClick={handleSearchSubmit}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>

          {/* Sugestões de busca */}
          {suggestions.length > 0 && (
            <ul className="search-suggestions">
              {suggestions.map((s) => (
                <li key={s.path} onClick={() => handleSuggestionClick(s.path)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                  {s.label}
                </li>
              ))}
            </ul>
          )}
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
