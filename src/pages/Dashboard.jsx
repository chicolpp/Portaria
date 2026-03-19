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

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const cargo = user?.cargo?.toLowerCase() || "";
  const isAdmin = user?.is_admin || false;

  const porteiroActions = [
    {
      image: "/icons/delivery.png",
      label: "Encomendas",
      onClick: () => navigate("/encomendas")
    },
    {
      image: "/icons/doorman.png",
      label: "Portaria",
      onClick: () => navigate("/portaria")
    },
    {
      image: "/icons/loft-building.png",
      label: "Livro de Ocorrências",
      onClick: () => navigate("/livroocorrencias")
    },
    {
      image: "/icons/amenities.png",
      label: "Espaços e Serviços",
      onClick: () => navigate("/espacosservicos")
    }
  ];

  const moradorActions = [
    {
      image: "/icons/amenities.png", // acao9.png não existe no repositório, usando amenities como fallback
      label: "Liberação de Acessos",
      onClick: () => navigate("/liberacao-acessos")
    },
    {
      image: "/icons/delivery.png",
      label: "Visualização de Encomendas",
      onClick: () => navigate("/visualizacao-encomendas")
    },
    {
      image: "/icons/loft-building.png",
      label: "Visualização de Ocorrências",
      onClick: () => { }
    },
    {
      image: "/icons/amenities.png", // acao9.png não existe no repositório, usando amenities como fallback
      label: "Visualização de Chaves",
      onClick: () => { }
    }
  ];

  const showPortaria = cargo === "porteiro" || isAdmin;
  const showMorador = cargo === "morador" || isAdmin;

  return (
    <div className="dashboard-container">
      {showPortaria && (
        <div className="dashboard-section">
          <h2 className="section-title">Área da Portaria</h2>
          <div className="dashboard-grid">
            {porteiroActions.map((action, index) => (
              <ActionCard
                key={index}
                image={action.image}
                label={action.label}
                onClick={action.onClick}
              />
            ))}
          </div>
        </div>
      )}

      {showMorador && (
        <div className="dashboard-section">
          <h2 className="section-title">Área dos Moradores</h2>
          <div className="dashboard-grid">
            {moradorActions.map((action, index) => (
              <ActionCard
                key={index}
                image={action.image}
                label={action.label}
                onClick={action.onClick}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
