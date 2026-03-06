import { useState, useEffect, useMemo } from "react";
import api from "../services/api";
import { formatDate, formatTime } from "../utils/formatters";
import "./Ocorrencias.css";

export default function Ocorrencias() {
  const [ocorrencias, setOcorrencias] = useState([]);
  const [activeTab, setActiveTab] = useState("cadastro");
  const [modalFiltro, setModalFiltro] = useState(false);
  const [filtros, setFiltros] = useState({
    descricao: "",
    dataInicio: "",
    dataFim: ""
  });

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

  const clearFiltros = () => {
    setFiltros({
      descricao: "",
      dataInicio: "",
      dataFim: ""
    });
  };

  const ocorrenciasFiltradas = useMemo(() => {
    return ocorrencias.filter(o => {
      const matchDesc = !filtros.descricao || o.descricao.toLowerCase().includes(filtros.descricao.toLowerCase());

      let matchData = true;
      if (filtros.dataInicio) matchData = matchData && o.data >= filtros.dataInicio;
      if (filtros.dataFim) matchData = matchData && o.data <= filtros.dataFim;

      return matchDesc && matchData;
    });
  }, [ocorrencias, filtros]);

  const FilterIcon = ({ className, style }) => (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );

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
            <div className="visualizacao-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Visualização de Ocorrencias</h2>
              <button
                className="admin-btn-small"
                onClick={() => setModalFiltro(true)}
                style={{ width: 'auto', padding: '0 15px', gap: '8px', background: '#3b82f6' }}
              >
                <FilterIcon style={{ width: 16, height: 16 }} />
                <span>Filtrar</span>
              </button>
            </div>
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
                {ocorrenciasFiltradas.map((o) => (
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

      {/* Modal de Filtro */}
      {modalFiltro && (
        <div className="global-modal-overlay" onClick={() => setModalFiltro(false)}>
          <div className="global-modal" onClick={(e) => e.stopPropagation()}>
            <button className="global-modal-close" onClick={() => setModalFiltro(false)}>✕</button>
            <div className="modal-header">
              <FilterIcon style={{ width: 20, height: 20, marginRight: '10px' }} />
              <h3>Filtrar Ocorrências</h3>
            </div>

            <div className="modal-form">
              <div className="modal-field">
                <label className="modal-label">Descrição</label>
                <input
                  type="text"
                  className="modal-input"
                  value={filtros.descricao}
                  onChange={(e) => setFiltros({ ...filtros, descricao: e.target.value })}
                  placeholder="Pesquisar na descrição..."
                />
              </div>

              <div className="modal-form-row">
                <div className="modal-field">
                  <label className="modal-label">Data Início</label>
                  <input
                    type="date"
                    className="modal-input"
                    value={filtros.dataInicio}
                    onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
                  />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Data Fim</label>
                  <input
                    type="date"
                    className="modal-input"
                    value={filtros.dataFim}
                    onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  className="submit-btn"
                  onClick={() => setModalFiltro(false)}
                  style={{ flex: 1 }}
                >
                  Aplicar Filtros
                </button>
                <button
                  className="photo-action-btn gallery-btn"
                  onClick={clearFiltros}
                  style={{ flex: 1, background: '#475569' }}
                >
                  Limpar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}