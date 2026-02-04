import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  const ActionCard = ({ image, label, onClick }) => (
    <button className="action-card" onClick={onClick}>
      <img src={image} alt={label} />
      {label}
    </button>
  );

  return (
    <div className="dashboard-container">
      <h1>Bem-vindo!</h1>
      <p>Login realizado com sucesso. Você está autenticado.</p>

      <div className="dashboard-grid">
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
          label="Livro de Ocorrências"
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
