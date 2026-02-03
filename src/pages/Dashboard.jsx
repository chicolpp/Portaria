import { useNavigate } from "react-router-dom";
import { logout } from "../services/auth";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Componente reutilizável de botão/card
  const ActionCard = ({ image, label, onClick }) => (
    <button
      onClick={onClick}
      style={{
        height: 160,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        borderRadius: 8,
        border: "none",
        cursor: "pointer",
        background: "linear-gradient(135deg, #3b82f6, #2563eb)",
        fontSize: 18,
        fontWeight: 600,
        color: "white",
        boxShadow: "0 4px 15px rgba(37, 99, 235, 0.4)",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "linear-gradient(135deg, #2563eb, #1d4ed8)";
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(37, 99, 235, 0.5)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "linear-gradient(135deg, #3b82f6, #2563eb)";
        e.currentTarget.style.boxShadow = "0 4px 15px rgba(37, 99, 235, 0.4)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <img
        src={image}
        alt={label}
        style={{
          width: 64,
          height: 64,
          objectFit: "contain",
        }}
      />
      {label}
    </button>
  );


  return (
    <div style={{ paddingTop: 40, padding: 40, paddingLeft: 280 }}>
      <h1>Bem-vindo!</h1>
      <p>Login realizado com sucesso. Você está autenticado.</p>

      {/* Área central de ações */}
      <div
        style={{
          marginTop: 40,
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 24,
          maxWidth: 900,
        }}
      >
        <ActionCard
          image="/icons/delivery.png"
          label="Encomendas"
          onClick={() => navigate("/encomendas")}
        />

        <ActionCard 
          image="/icons/doorman.png" 
          label="Portaria" 
          onClick={() => navigate("/portaria")}
        />
        <ActionCard 
          image="/icons/loft-building.png" 
          label="Livro de Ocorrencias"
          onClick={() => navigate("/livroocorrencias")}
        />
        <ActionCard 
          image="/icons/acao9.png"
          label="Espaços e Serviços"
          onClick={() => navigate("/espacosservicos")}
        />

        <ActionCard image="/icons/acao9.png" label="Ação 5" />
        <ActionCard image="/icons/acao9.png" label="Ação 6" />
        <ActionCard image="/icons/acao9.png" label="Ação 7" />
        <ActionCard image="/icons/acao9.png" label="Ação 8" />

        <ActionCard image="/icons/acao9.png" label="Ação 9" />
        <ActionCard image="/icons/acao9.png" label="Ação 10" />
        <ActionCard image="/icons/acao9.png" label="Ação 11" />
        <ActionCard image="/icons/acao9.png" label="Ação 12" />
      </div>


    </div>
  );
}
