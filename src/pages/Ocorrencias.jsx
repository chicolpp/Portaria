import { useState, useEffect, useMemo } from "react";
import api from "../services/api";
import { formatDate, formatTime } from "../utils/formatters";
import "./Ocorrencias.css";

export default function Ocorrencias() {
  const [ocorrencias, setOcorrencias] = useState([]);
  const [activeTab, setActiveTab] = useState("cadastro");
  const [modalFiltro, setModalFiltro] = useState(false);
  const [filtros, setFiltros] = useState({
    motivo: "",
    dataInicio: "",
    dataFim: ""
  });
  const [filtrosTemporarios, setFiltrosTemporarios] = useState({ ...filtros });
  const [modalEditar, setModalEditar] = useState(null);
  const [modalVisualizar, setModalVisualizar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    data: "",
    hora: "",
    unidade_infratante: "",
    nome_morador: "",
    registrada_por: "Morador", // Padrão
    quem_registrou: "",
    motivo_ocorrencia: "",
  });
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    unidade_infratante: "",
    nome_morador: "",
    registrada_por: "Morador",
    quem_registrou: "",
    motivo_ocorrencia: "",
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
    const limpo = {
      motivo: "",
      dataInicio: "",
      dataFim: ""
    };
    setFiltrosTemporarios(limpo);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/ocorrencias", formData);
      toast.success("Ocorrência registrada!");
      setFormData({
        data: new Date().toISOString().split('T')[0],
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        unidade_infratante: "",
        nome_morador: "",
        registrada_por: "Morador",
        quem_registrou: "",
        motivo_ocorrencia: "",
      });
      fetchOcorrencias();
      setActiveTab("visualizacao");
    } catch (error) {
      toast.error("Erro ao registrar ocorrência");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openEditarModal = (o) => {
    setModalEditar(o);
    setEditFormData({
      data: o.data,
      hora: o.hora ? o.hora.substring(0, 5) : "",
      unidade_infratante: o.unidade_infratante,
      nome_morador: o.nome_morador,
      registrada_por: o.registrada_por,
      quem_registrou: o.quem_registrou,
      motivo_ocorrencia: o.motivo_ocorrencia,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/ocorrencias/${modalEditar.id}`, editFormData);
      toast.success("Ocorrência atualizada!");
      setModalEditar(null);
      fetchOcorrencias();
    } catch (error) {
      toast.error("Erro ao atualizar ocorrência");
      console.error(error);
    }
  };

  const ocorrenciasFiltradas = useMemo(() => {
    return ocorrencias.filter(o => {
      const matchMotivo = !filtros.motivo || o.motivo_ocorrencia.toLowerCase().includes(filtros.motivo.toLowerCase()) || o.nome_morador.toLowerCase().includes(filtros.motivo.toLowerCase());

      let matchData = true;
      if (filtros.dataInicio) matchData = matchData && o.data >= filtros.dataInicio;
      if (filtros.dataFim) matchData = matchData && o.data <= filtros.dataFim;

      return matchMotivo && matchData;
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
          <form className="cadastro-form" onSubmit={handleCreateSubmit}>
            <h2>Cadastro de Ocorrências</h2>
            <div className="form-group">
              <label>Data:</label>
              <input type="date" value={formData.data} onChange={(e) => setFormData({ ...formData, data: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Hora:</label>
              <input type="time" value={formData.hora} onChange={(e) => setFormData({ ...formData, hora: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Unidade Infratora:</label>
              <input type="text" value={formData.unidade_infratante} onChange={(e) => setFormData({ ...formData, unidade_infratante: e.target.value })} placeholder="Ex: Bloco A, 102" required />
            </div>
            <div className="form-group">
              <label>Nome do Morador:</label>
              <input type="text" value={formData.nome_morador} onChange={(e) => setFormData({ ...formData, nome_morador: e.target.value })} placeholder="Nome completo" required />
            </div>
            <div className="form-group">
              <label>Registrado Por:</label>
              <select value={formData.registrada_por} onChange={(e) => setFormData({ ...formData, registrada_por: e.target.value })}>
                <option value="Morador">Morador</option>
                <option value="Segurança">Segurança</option>
                <option value="Portaria">Portaria</option>
                <option value="Sindico">Síndico</option>
              </select>
            </div>
            <div className="form-group">
              <label>Quem registrou (Nome):</label>
              <input type="text" value={formData.quem_registrou} onChange={(e) => setFormData({ ...formData, quem_registrou: e.target.value })} placeholder="Seu nome" required />
            </div>
            <div className="form-group full-width">
              <label>Motivo / Descrição:</label>
              <textarea value={formData.motivo_ocorrencia} onChange={(e) => setFormData({ ...formData, motivo_ocorrencia: e.target.value })} placeholder="Descreva os detalhes da ocorrência..." required />
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Registrando..." : "Registrar Ocorrência"}
            </button>
          </form>
        )}
        {activeTab === "visualizacao" && (
          <div className="visualizacao">
            <div className="visualizacao-header">
              <h2>Visualização de Ocorrências</h2>
              <button
                className="admin-btn-small ver-btn header-filter-btn"
                onClick={() => setModalFiltro(true)}
              >
                <FilterIcon style={{ width: 16, height: 16 }} />
                <span>Filtrar</span>
              </button>
            </div>

            <div className="filter-standard-bar mobile-only-filter">
              <button
                className="admin-btn-small ver-btn"
                onClick={() => setModalFiltro(true)}
              >
                <FilterIcon style={{ width: 16, height: 16 }} />
                <span>Filtrar</span>
              </button>
              {Object.values(filtros).some(v => v !== "" && v !== "todos") && (
                <span className="filter-active-badge">Filtro Ativo</span>
              )}
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
                    <td>{o.unidade_infratante} - {o.nome_morador}</td>
                    <td>{formatDate(o.data)}</td>
                    <td>{formatTime(o.hora)}</td>
                    <td>
                      <div className="acoes-cell">
                        <button className="admin-btn-small ver-btn" onClick={() => setModalVisualizar(o)} title="Visualizar">
                          <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        </button>
                        <button className="admin-btn-small edit-btn" onClick={() => openEditarModal(o)} title="Editar">
                          <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        </button>
                      </div>
                    </td>
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
                <label className="modal-label">Pesquisar (Motivo ou Morador)</label>
                <input
                  type="text"
                  className="modal-input"
                  value={filtrosTemporarios.motivo}
                  onChange={(e) => setFiltrosTemporarios({ ...filtrosTemporarios, motivo: e.target.value })}
                  placeholder="Pesquisar..."
                />
              </div>

              <div className="modal-form-row">
                <div className="modal-field">
                  <label className="modal-label">Data Início</label>
                  <input
                    type="date"
                    className="modal-input"
                    value={filtrosTemporarios.dataInicio}
                    onChange={(e) => setFiltrosTemporarios({ ...filtrosTemporarios, dataInicio: e.target.value })}
                  />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Data Fim</label>
                  <input
                    type="date"
                    className="modal-input"
                    value={filtrosTemporarios.dataFim}
                    onChange={(e) => setFiltrosTemporarios({ ...filtrosTemporarios, dataFim: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  className="submit-btn"
                  onClick={() => {
                    setFiltros(filtrosTemporarios);
                    setModalFiltro(false);
                  }}
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

      {/* Modal Visualizar */}
      {modalVisualizar && (
        <div className="global-modal-overlay" onClick={() => setModalVisualizar(null)}>
          <div className="visualizar-modal" onClick={(e) => e.stopPropagation()}>
            <button className="foto-modal-close" onClick={() => setModalVisualizar(null)}>✕</button>
            <h3>Dados da Ocorrência</h3>
            <div className="visualizar-info">
              <p><strong>Unidade:</strong> {modalVisualizar.unidade_infratante}</p>
              <p><strong>Morador:</strong> {modalVisualizar.nome_morador}</p>
              <p><strong>Data/Hora:</strong> {formatDate(modalVisualizar.data)} às {formatTime(modalVisualizar.hora)}</p>
              <p><strong>Registrado por:</strong> {modalVisualizar.registrada_por} ({modalVisualizar.quem_registrou})</p>
              <div className="motivo-box" style={{ marginTop: '20px' }}>
                <label>Motivo / Descrição</label>
                <p className="motivo-texto">{modalVisualizar.motivo_ocorrencia}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {modalEditar && (
        <div className="global-modal-overlay" onClick={() => setModalEditar(null)}>
          <div className="global-modal" onClick={(e) => e.stopPropagation()}>
            <button className="global-modal-close" onClick={() => setModalEditar(null)}>✕</button>
            <div className="modal-header">
              <h3>Editar Ocorrência</h3>
            </div>
            <form onSubmit={handleEditSubmit} className="modal-form">
              <div className="modal-form-row">
                <div className="modal-field">
                  <label className="modal-label">Data</label>
                  <input type="date" className="modal-input" value={editFormData.data} onChange={(e) => setEditFormData({ ...editFormData, data: e.target.value })} required />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Hora</label>
                  <input type="time" className="modal-input" value={editFormData.hora} onChange={(e) => setEditFormData({ ...editFormData, hora: e.target.value })} required />
                </div>
              </div>

              <div className="modal-form-row">
                <div className="modal-field">
                  <label className="modal-label">Unidade</label>
                  <input type="text" className="modal-input" value={editFormData.unidade_infratante} onChange={(e) => setEditFormData({ ...editFormData, unidade_infratante: e.target.value })} required />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Morador</label>
                  <input type="text" className="modal-input" value={editFormData.nome_morador} onChange={(e) => setEditFormData({ ...editFormData, nome_morador: e.target.value })} required />
                </div>
              </div>

              <div className="modal-field">
                <label className="modal-label">Motivo</label>
                <textarea className="modal-input" style={{ minHeight: '100px' }} value={editFormData.motivo_ocorrencia} onChange={(e) => setEditFormData({ ...editFormData, motivo_ocorrencia: e.target.value })} required />
              </div>

              <button type="submit" className="submit-btn" style={{ width: '100%', marginTop: '15px' }}>Salvar Alterações</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}