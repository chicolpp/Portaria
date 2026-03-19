import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

// Importando os ícones para o Vite processar as URLs no build final (necessário para o Render)
import deliveryIcon from "../assets/delivery.png";
import doormanIcon from "../assets/doorman.png";
import loftBuildingIcon from "../assets/loft-building.png";
import amenitiesIcon from "../assets/amenities.png";
// acao9.png não existe no repositório, usando amenities como fallback
const acao9Icon = amenitiesIcon; 

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
      image: deliveryIcon,
      label: "Encomendas",
      onClick: () => navigate("/encomendas")
    },
    {
      image: doormanIcon,
      label: "Portaria",
      onClick: () => navigate("/portaria")
    },
    {
      image: loftBuildingIcon,
      label: "Livro de Ocorrências",
      onClick: () => navigate("/livroocorrencias")
    },
    {
      image: amenitiesIcon,
      label: "Espaços e Serviços",
      onClick: () => navigate("/espacosservicos")
    }
  ];

  const moradorActions = [
    {
      image: acao9Icon,
      label: "Liberação de Acessos",
      onClick: () => navigate("/liberacao-acessos")
    },
    {
      image: deliveryIcon,
      label: "Visualização de Encomendas",
      onClick: () => navigate("/visualizacao-encomendas")
    },
    {
      image: loftBuildingIcon,
      label: "Visualização de Ocorrências",
      onClick: () => {}
    },
    {
      image: acao9Icon,
      label: "Visualização de Chaves",
      onClick: () => {}
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
