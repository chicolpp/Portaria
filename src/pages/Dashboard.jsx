import { useNavigate } from "react-router-dom";
import { logout } from "../services/auth";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Componente reutilizável de botão/card
  const ActionCard = ({ image, label }) => (
    <button
      style={{
        height: 160,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        borderRadius: 12,
        border: "1px solid #124375",
        cursor: "pointer",
        backgroundColor: "#357abd",
        fontSize: 16,
        fontWeight: 600,
        color: "white",
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
    <div style={{ paddingTop: 80, padding: 40 }}>
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
        <ActionCard image="/icons/delivery.png" label="Encomendas" />
        <ActionCard image="/icons/doorman.png" label="Portaria" />
        <ActionCard image="/icons/loft-building.png" label="Livro de Ocorrencias" />
        <ActionCard image="/icons/acao9.png" label="Espaços e Serviços" />

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
