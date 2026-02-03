import { useState, useEffect } from "react";
import api from "../services/api";
import "./Ocorrencias.css";

export default function Ocorrencias() {
  const [ocorrencias, setOcorrencias] = useState([]);
  const [activeTab, setActiveTab] = useState("cadastro");

  const fetchOcorrencias = async () => {
    try {
      const response = await api.get("/ocorrencias");
      setOcorrencias(response.data.ocorrencias);
    } catch (error) {
      console.error("Erro ao buscar ocorrencias:", error);
    }
  };

  useEffect(() => {
    fetchOcorrencias();
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="ocorrencias-container">
      <div className="tab-content">
        <div className="tabs">
          <button
            className={activeTab === "cadastro" ? "active" : ""}
            onClick={() => handleTabClick("cadastro")}
          >
            Cadastro de Ocorrencias
          </button>
          <button
            className={activeTab === "visualizacao" ? "active" : ""}
            onClick={() => handleTabClick("visualizacao")}
          >
            Visualização de Ocorrencias
          </button>
        </div>
        {activeTab === "cadastro" && (
          <div className="cadastro-form">
            <h2>Cadastro de Ocorrencias</h2>
            {/* Aqui você pode adicionar o formulário de cadastro de ocorrencias */}
          </div>
        )}
        {activeTab === "visualizacao" && (
          <div className="visualizacao">
            <h2>Visualização de Ocorrencias</h2>
            <table className="ocorrencias-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Descrição</th>
                  <th>Data</th>
                  <th>Hora</th>
                </tr>
              </thead>
              <tbody>
                {ocorrencias.map((o) => (
                  <tr key={o.id}>
                    <td>{o.id}</td>
                    <td>{o.descricao}</td>
                    <td>{o.data}</td>
                    <td>{o.hora}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}