import { useState, useEffect } from "react";
import api from "../services/api";
import { formatDate, formatTime } from "../utils/formatters";
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
      {/* TABS NAVIGATION */}
      <div className="ocorrencias-tabs">
        <button
          className={`ocorrencias-tab-btn ${activeTab === "cadastro" ? "active" : ""}`}
          onClick={() => handleTabClick("cadastro")}
        >
          <svg style={{ width: 22, height: 22, marginRight: 8 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg> Cadastro de Ocorrências
        </button>
        <button
          className={`ocorrencias-tab-btn ${activeTab === "visualizacao" ? "active" : ""}`}
          onClick={() => handleTabClick("visualizacao")}
        >
          <svg style={{ width: 22, height: 22, marginRight: 8 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg> Visualização de Ocorrências
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="tab-content">
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
                    <td>{formatDate(o.data)}</td>
                    <td>{formatTime(o.hora)}</td>
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