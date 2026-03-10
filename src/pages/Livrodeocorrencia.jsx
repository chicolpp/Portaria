import { useState, useEffect, useMemo } from "react";
import api from "../services/api";
import { toast } from "sonner";
import { formatDate, formatTime } from "../utils/formatters";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { Portuguese } from "flatpickr/dist/l10n/pt.js";
import "./Ocorrencias.css";

// EXTERNAL FLATPICKR CONFIGURATIONS
const flatpickrDateOptions = {
  locale: Portuguese,
  dateFormat: "Y-m-d",
  altInput: true,
  altFormat: "d/m/Y",
  disableMobile: "true"
};

const flatpickrTimeOptions = {
  enableTime: true,
  noCalendar: true,
  dateFormat: "H:i",
  time_24hr: true,
  disableMobile: "true"
};

// Ícones SVG inline
const PencilIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const TrashIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
  </svg>
);

const EyeIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const ListIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const UserPlusIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="17" y1="11" x2="23" y2="11" />
  </svg>
);

const SortIcon = ({ direction, active }) => {
  if (!active) {
    return (
      <svg style={{ width: 14, height: 14, marginLeft: 6, opacity: 0.3 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 15l5 5 5-5" />
        <path d="M7 9l5-5 5 5" />
      </svg>
    );
  }
  return direction === 'asc' ? (
    <svg style={{ width: 14, height: 14, marginLeft: 6, color: 'var(--primary-light)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 15l-6-6-6 6" />
    </svg>
  ) : (
    <svg style={{ width: 14, height: 14, marginLeft: 6, color: 'var(--primary-light)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
};


const CheckIcon = ({ style }) => (
  <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const FilterIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const ClockIcon = ({ style }) => (
  <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default function LivroDeOcorrencia() {
  const [activeTab, setActiveTab] = useState("cadastro");
  const [ocorrencias, setOcorrencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  const [modalVisualizar, setModalVisualizar] = useState(null);
  const [modalEditar, setModalEditar] = useState(null);
  const [modalFiltro, setModalFiltro] = useState(false);
  const [filtros, setFiltros] = useState({
    motivo: "",
    unidade: "",
    morador: "",
    registrada_por: "todos",
    quem_registrou: "",
    dataInicio: "",
    dataFim: ""
  });
  const [filtrosTemporarios, setFiltrosTemporarios] = useState({ ...filtros });

  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    unidadeInfratante: "",
    nomeMorador: "",
    registradaPor: "Morador",
    quemRegistrou: "",
    motivoOcorrencia: "",
  });

  const [editFormData, setEditFormData] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const clearFiltros = () => {
    const limpo = {
      motivo: "",
      unidade: "",
      morador: "",
      registrada_por: "todos",
      quem_registrou: "",
      dataInicio: "",
      dataFim: ""
    };
    setFiltrosTemporarios(limpo);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const ocorrenciasFiltradas = useMemo(() => {
    const filtradas = ocorrencias.filter(o => {
      const matchMotivo = !filtros.motivo || o.motivo_ocorrencia.toLowerCase().includes(filtros.motivo.toLowerCase());
      const matchUnidade = !filtros.unidade || o.unidade_infratante.toLowerCase().includes(filtros.unidade.toLowerCase());
      const matchMorador = !filtros.morador || o.nome_morador.toLowerCase().includes(filtros.morador.toLowerCase());
      const matchRegistradaPor = filtros.registrada_por === "todos" || o.registrada_por === filtros.registrada_por;
      const matchQuemRegistrou = !filtros.quem_registrou || o.quem_registrou.toLowerCase().includes(filtros.quem_registrou.toLowerCase());

      let matchData = true;
      if (filtros.dataInicio) matchData = matchData && o.data >= filtros.dataInicio;
      if (filtros.dataFim) matchData = matchData && o.data <= filtros.dataFim;

      return matchMotivo && matchUnidade && matchMorador && matchRegistradaPor && matchQuemRegistrou && matchData;
    });

    if (sortConfig.key) {
      filtradas.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (valA === null || valA === undefined) valA = '';
        if (valB === null || valB === undefined) valB = '';

        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
          if (sortConfig.direction === 'asc') {
            return valA.localeCompare(valB);
          } else {
            return valB.localeCompare(valA);
          }
        } else {
          if (sortConfig.direction === 'asc') {
            return valA > valB ? 1 : -1;
          } else {
            return valA < valB ? 1 : -1;
          }
        }
      });
    }
    return filtradas;
  }, [ocorrencias, filtros, sortConfig]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    return <SortIcon active={sortConfig.key === key} direction={sortConfig.direction} />;
  };


  const fetchOcorrencias = async () => {
    try {
      const response = await api.get("/ocorrencias");
      setOcorrencias(response.data.ocorrencias || []);
    } catch (error) {
      console.error("Erro ao buscar ocorrências:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "visualizacao") {
      fetchOcorrencias();
    }
  }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/ocorrencias", {
        data: formData.data,
        hora: formData.hora,
        unidade_infratante: formData.unidadeInfratante,
        nome_morador: formData.nomeMorador,
        registrada_por: formData.registradaPor,
        quem_registrou: formData.quemRegistrou,
        motivo_ocorrencia: formData.motivoOcorrencia,
      });

      toast.success("Ocorrência cadastrada com sucesso!");
      setFormData({
        data: new Date().toISOString().split('T')[0],
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        unidadeInfratante: "",
        nomeMorador: "",
        registradaPor: "Morador",
        quemRegistrou: "",
        motivoOcorrencia: "",
      });
      fetchOcorrencias();
      setActiveTab("visualizacao");
    } catch (error) {
      toast.error("Erro ao cadastrar ocorrência");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openVisualizarModal = (ocorrencia) => setModalVisualizar(ocorrencia);
  const closeVisualizarModal = () => setModalVisualizar(null);

  const openEditarModal = (ocorrencia) => {
    setModalEditar(ocorrencia);
    setEditFormData({
      data: ocorrencia.data,
      hora: ocorrencia.hora ? ocorrencia.hora.substring(0, 5) : "",
      unidadeInfratante: ocorrencia.unidade_infratante,
      nomeMorador: ocorrencia.nome_morador,
      registradaPor: ocorrencia.registrada_por,
      quemRegistrou: ocorrencia.quem_registrou,
      motivoOcorrencia: ocorrencia.motivo_ocorrencia,
    });
  };

  const closeEditarModal = () => setModalEditar(null);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/ocorrencias/${modalEditar.id}`, {
        data: editFormData.data,
        hora: editFormData.hora,
        unidade_infratante: editFormData.unidadeInfratante,
        nome_morador: editFormData.nomeMorador,
        registrada_por: editFormData.registradaPor,
        quem_registrou: editFormData.quemRegistrou,
        motivo_ocorrencia: editFormData.motivoOcorrencia,
      });

      toast.success("Ocorrência atualizada com sucesso!");
      closeEditarModal();
      fetchOcorrencias();
    } catch (error) {
      toast.error("Erro ao atualizar ocorrência");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja apagar esta ocorrência?")) return;
    try {
      await api.delete(`/ocorrencias/${id}`);
      toast.success("Ocorrência apagada com sucesso!");
      fetchOcorrencias();
    } catch (error) {
      toast.error("Erro ao apagar ocorrência");
      console.error(error);
    }
  };

  return (
    <div className="ocorrencias-container">
      {/* MODAL VISUALIZAR */}
      {modalVisualizar && (
        <div className="global-modal-overlay" onClick={closeVisualizarModal}>
          <div className="global-modal" onClick={(e) => e.stopPropagation()}>
            <button className="global-modal-close" onClick={closeVisualizarModal}>✕</button>
            <div className="modal-header">
              <span className="modal-header-icon">⚠️</span>
              <h3>Dados da Ocorrência</h3>
            </div>
            <div className="modal-badge">#{modalVisualizar.id} — {modalVisualizar.unidade_infratante}</div>

            <div className="visualizar-info">
              <p><strong>Unidade</strong> {modalVisualizar.unidade_infratante}</p>
              <p><strong>Morador</strong> {modalVisualizar.nome_morador}</p>
              <p><strong>Data/Hora</strong> {formatDate(modalVisualizar.data)} às {formatTime(modalVisualizar.hora)}</p>
              <p><strong>Registrado por</strong> {modalVisualizar.registrada_por} ({modalVisualizar.quem_registrou})</p>

              <div className="motivo-box" style={{ marginTop: '12px' }}>
                <label>Motivo / Descrição</label>
                <p className="motivo-texto">{modalVisualizar.motivo_ocorrencia}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {modalEditar && (
        <div className="global-modal-overlay" onClick={closeEditarModal}>
          <div className="global-modal" onClick={(e) => e.stopPropagation()}>
            <button className="global-modal-close" onClick={closeEditarModal}>✕</button>
            <div className="modal-header">
              <span className="modal-header-icon">✏️</span>
              <h3>Editar Ocorrência</h3>
            </div>
            <div className="modal-badge">#{modalEditar.id} — {modalEditar.unidade_infratante}</div>

            <form className="modal-form" onSubmit={handleEditSubmit}>
              <div className="modal-divider">
                <ClockIcon style={{ width: 14, height: 14 }} />
                <span>Data e Hora da Ocorrência</span>
              </div>

              <div className="modal-form-row">
                <div className="modal-field">
                  <label className="modal-label">Data</label>
                  <Flatpickr
                    value={editFormData.data}
                    onChange={([date]) => {
                      if (date) {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        setEditFormData({ ...editFormData, data: `${year}-${month}-${day}` });
                      }
                    }}
                    options={flatpickrDateOptions}
                    className="modal-input flatpickr-input-custom"
                  />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Hora</label>
                  <Flatpickr
                    value={editFormData.hora}
                    onChange={([date]) => {
                      if (date) {
                        const hours = String(date.getHours()).padStart(2, '0');
                        const minutes = String(date.getMinutes()).padStart(2, '0');
                        setEditFormData({ ...editFormData, hora: `${hours}:${minutes}` });
                      }
                    }}
                    options={flatpickrTimeOptions}
                    className="modal-input flatpickr-input-custom"
                  />
                </div>
              </div>

              <div className="modal-divider">Informações da Unidade</div>

              <div className="modal-form-row">
                <div className="modal-field">
                  <label className="modal-label">Unidade <span className="color-danger">*</span></label>
                  <input
                    type="text"
                    name="unidadeInfratante"
                    className="modal-input"
                    value={editFormData.unidadeInfratante}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Morador <span className="color-danger">*</span></label>
                  <input
                    type="text"
                    name="nomeMorador"
                    className="modal-input"
                    value={editFormData.nomeMorador}
                    onChange={handleEditChange}
                    required
                  />
                </div>
              </div>

              <div className="modal-field">
                <label className="modal-label">Motivo <span className="color-danger">*</span></label>
                <textarea
                  name="motivoOcorrencia"
                  className="modal-input"
                  style={{ minHeight: '120px', resize: 'vertical' }}
                  value={editFormData.motivoOcorrencia}
                  onChange={handleEditChange}
                  maxLength={500}
                  required
                />
                <span className="char-count">{editFormData.motivoOcorrencia.length}/500</span>
              </div>

              <button type="submit" className="modal-btn modal-btn-primary">
                <CheckIcon style={{ width: 16, height: 16 }} />
                Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TABS NAVIGATION */}
      <div className="ocorrencias-tabs">
        <button
          className={`ocorrencias-tab-btn ${activeTab === "cadastro" ? "active" : ""}`}
          onClick={() => setActiveTab("cadastro")}
        >
          <PencilIcon style={{ width: 22, height: 22 }} />
          <span>Cadastro de Ocorrências</span>
        </button>
        <button
          className={`ocorrencias-tab-btn ${activeTab === "visualizacao" ? "active" : ""}`}
          onClick={() => setActiveTab("visualizacao")}
        >
          <ListIcon style={{ width: 22, height: 22 }} />
          <span>Visualização de Ocorrências</span>
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="tab-content">
        {activeTab === "cadastro" && (
          <form className="cadastro-form" onSubmit={handleSubmit}>
            <h2>
              <UserPlusIcon style={{ width: 24, height: 24 }} />
              Cadastro de Ocorrências
            </h2>

            <div className="form-group">
              <label>Data</label>
              <Flatpickr
                value={formData.data}
                onChange={([date]) => {
                  if (date) {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    setFormData({ ...formData, data: `${year}-${month}-${day}` });
                  }
                }}
                options={flatpickrDateOptions}
                className="flatpickr-input-custom"
                required
              />
            </div>

            <div className="form-group">
              <label>Hora</label>
              <Flatpickr
                value={formData.hora}
                onChange={([date]) => {
                  if (date) {
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    setFormData({ ...formData, hora: `${hours}:${minutes}` });
                  }
                }}
                options={flatpickrTimeOptions}
                className="flatpickr-input-custom"
                required
              />
            </div>

            <div className="form-group">
              <label>Unidade Infratora <span className="color-danger">*</span></label>
              <input
                type="text"
                name="unidadeInfratante"
                value={formData.unidadeInfratante}
                onChange={handleChange}
                placeholder="Número da unidade"
                required
              />
            </div>

            <div className="form-group">
              <label>Nome do Morador <span className="color-danger">*</span></label>
              <input
                type="text"
                name="nomeMorador"
                value={formData.nomeMorador}
                onChange={handleChange}
                placeholder="Ex: João Silva"
                required
              />
            </div>

            <div className="form-group">
              <label>Registrado por <span className="color-danger">*</span></label>
              <select
                name="registradaPor"
                value={formData.registradaPor}
                onChange={handleChange}
                required
              >
                <option value="Morador">Morador</option>
                <option value="Segurança">Segurança</option>
                <option value="Portaria">Portaria</option>
                <option value="Sindico">Síndico</option>
              </select>
            </div>

            <div className="form-group">
              <label>Quem Registrou <span className="color-danger">*</span></label>
              <input
                type="text"
                name="quemRegistrou"
                value={formData.quemRegistrou}
                onChange={handleChange}
                placeholder="Nome do responsável"
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Motivo da Ocorrência <span className="color-danger">*</span></label>
              <textarea
                name="motivoOcorrencia"
                value={formData.motivoOcorrencia}
                onChange={handleChange}
                maxLength={500}
                placeholder="Descreva o motivo da ocorrência..."
                required
              />
              <span className="char-count">{formData.motivoOcorrencia.length}/500</span>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              <CheckIcon style={{ width: 18, height: 18, marginRight: 8 }} />
              {loading ? "Registrando..." : "Registrar Ocorrência"}
            </button>
          </form>
        )}

        {activeTab === "visualizacao" && (
          <div className="visualizacao">
            <div className="visualizacao-header">
              <h2>
                <ListIcon style={{ width: 24, height: 24 }} />
                Visualização de Ocorrências
              </h2>
              <button
                className="admin-btn-small ver-btn header-filter-btn"
                onClick={() => setModalFiltro(true)}
              >
                <FilterIcon style={{ width: 16, height: 16 }} />
                <span>Filtrar</span>
              </button>
              {Object.values(filtros).some(v => v !== "" && v !== "todos") && (
                <span className="filter-active-badge" style={{ marginLeft: '10px' }}>Filtro Ativo</span>
              )}
            </div>
            <div className="responsive-table-container desktop-only-table">
              <table className="ocorrencias-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('id')} className="sortable-th">
                      <div className="th-content">ID {getSortIcon('id')}</div>
                    </th>
                    <th onClick={() => handleSort('data')} className="sortable-th">
                      <div className="th-content">DATA {getSortIcon('data')}</div>
                    </th>
                    <th onClick={() => handleSort('hora')} className="sortable-th">
                      <div className="th-content">HORA {getSortIcon('hora')}</div>
                    </th>
                    <th onClick={() => handleSort('unidade_infratante')} className="sortable-th">
                      <div className="th-content">UNIDADE {getSortIcon('unidade_infratante')}</div>
                    </th>
                    <th onClick={() => handleSort('nome_morador')} className="sortable-th">
                      <div className="th-content">MORADOR {getSortIcon('nome_morador')}</div>
                    </th>
                    <th onClick={() => handleSort('registrada_por')} className="sortable-th">
                      <div className="th-content">REGISTRADA POR {getSortIcon('registrada_por')}</div>
                    </th>
                    <th onClick={() => handleSort('quem_registrou')} className="sortable-th">
                      <div className="th-content">QUEM REGISTROU {getSortIcon('quem_registrou')}</div>
                    </th>
                    <th>AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {ocorrenciasFiltradas.length > 0 ? (
                    ocorrenciasFiltradas.map((o) => (
                      <tr key={o.id}>
                        <td>{o.id}</td>
                        <td>{formatDate(o.data)}</td>
                        <td>{formatTime(o.hora)}</td>
                        <td>{o.unidade_infratante}</td>
                        <td>{o.nome_morador}</td>
                        <td>{o.registrada_por}</td>
                        <td>{o.quem_registrou}</td>
                        <td>
                          <div className="acoes-cell">
                            <button
                              className="admin-btn-small ver-btn"
                              onClick={() => openVisualizarModal(o)}
                            >
                              <EyeIcon style={{ width: 14, height: 14 }} />
                            </button>
                            <button
                              className="admin-btn-small edit-btn"
                              onClick={() => openEditarModal(o)}
                            >
                              <PencilIcon style={{ width: 14, height: 14 }} />
                            </button>
                            <button
                              className="admin-btn-small delete-btn"
                              onClick={() => handleDelete(o.id)}
                            >
                              <TrashIcon style={{ width: 14, height: 14 }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                        Nenhuma ocorrência encontrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="mobile-cards-container mobile-only-cards">
              {ocorrenciasFiltradas.length > 0 ? (
                ocorrenciasFiltradas.map((o) => (
                  <div key={o.id} className="mobile-access-card">
                    <div className="card-header">
                      <span className="card-id">#{o.id}</span>
                      <span className="card-date">{formatDate(o.data)} - {formatTime(o.hora)}</span>
                    </div>
                    <div className="card-body">
                      <div className="card-row">
                        <label>Unidade:</label>
                        <span>{o.unidade_infratante}</span>
                      </div>
                      <div className="card-row">
                        <label>Morador:</label>
                        <span>{o.nome_morador}</span>
                      </div>
                      <div className="card-row">
                        <label>Registrada por:</label>
                        <span>{o.registrada_por}</span>
                      </div>
                      <div className="card-row">
                        <label>Quem Registrou:</label>
                        <span>{o.quem_registrou}</span>
                      </div>
                    </div>
                    <div className="card-actions">
                      <button
                        className="admin-btn-small ver-btn mobile-action-btn"
                        onClick={() => openVisualizarModal(o)}
                      >
                        <EyeIcon style={{ width: 18, height: 18 }} />
                        <span>Ver</span>
                      </button>
                      <button
                        className="admin-btn-small edit-btn mobile-action-btn"
                        onClick={() => openEditarModal(o)}
                      >
                        <PencilIcon style={{ width: 18, height: 18 }} />
                        <span>Editar</span>
                      </button>
                      <button
                        className="admin-btn-small delete-btn mobile-action-btn"
                        onClick={() => handleDelete(o.id)}
                      >
                        <TrashIcon style={{ width: 18, height: 18 }} />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  Nenhuma ocorrência encontrada.
                </div>
              )}
            </div>
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
                <label className="modal-label">Motivo (Busca Livre)</label>
                <input
                  type="text"
                  className="modal-input"
                  value={filtrosTemporarios.motivo}
                  onChange={(e) => setFiltrosTemporarios({ ...filtrosTemporarios, motivo: e.target.value })}
                  placeholder="Pesquisar por motivo..."
                />
              </div>

              <div className="modal-form-row">
                <div className="modal-field">
                  <label className="modal-label">Unidade</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={filtrosTemporarios.unidade}
                    onChange={(e) => setFiltrosTemporarios({ ...filtrosTemporarios, unidade: e.target.value })}
                    placeholder="Ex: Bloco A, 102"
                  />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Morador</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={filtrosTemporarios.morador}
                    onChange={(e) => setFiltrosTemporarios({ ...filtrosTemporarios, morador: e.target.value })}
                    placeholder="Ex: João Silva"
                  />
                </div>
              </div>

              <div className="modal-form-row">
                <div className="modal-field">
                  <label className="modal-label">Registrada Por</label>
                  <select
                    className="modal-input"
                    value={filtrosTemporarios.registrada_por}
                    onChange={(e) => setFiltrosTemporarios({ ...filtrosTemporarios, registrada_por: e.target.value })}
                  >
                    <option value="todos">Todos</option>
                    <option value="Morador">Morador</option>
                    <option value="Segurança">Segurança</option>
                    <option value="Portaria">Portaria</option>
                    <option value="Sindico">Síndico</option>
                  </select>
                </div>
                <div className="modal-field">
                  <label className="modal-label">Quem Registrou</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={filtrosTemporarios.quem_registrou}
                    onChange={(e) => setFiltrosTemporarios({ ...filtrosTemporarios, quem_registrou: e.target.value })}
                    placeholder="Ex: Porteiro Carlos"
                  />
                </div>
              </div>

              <div className="modal-form-row">
                <div className="modal-field">
                  <label className="modal-label">Data Início</label>
                  <Flatpickr
                    value={filtrosTemporarios.dataInicio}
                    onChange={([date]) => {
                      if (date) {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        setFiltrosTemporarios({ ...filtrosTemporarios, dataInicio: `${year}-${month}-${day}` });
                      } else {
                        setFiltrosTemporarios({ ...filtrosTemporarios, dataInicio: "" });
                      }
                    }}
                    options={flatpickrDateOptions}
                    className="modal-input flatpickr-input-custom"
                    placeholder="Data inicial"
                  />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Data Fim</label>
                  <Flatpickr
                    value={filtrosTemporarios.dataFim}
                    onChange={([date]) => {
                      if (date) {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        setFiltrosTemporarios({ ...filtrosTemporarios, dataFim: `${year}-${month}-${day}` });
                      } else {
                        setFiltrosTemporarios({ ...filtrosTemporarios, dataFim: "" });
                      }
                    }}
                    options={flatpickrDateOptions}
                    className="modal-input flatpickr-input-custom"
                    placeholder="Data final"
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
    </div>
  );
}
