import { useState, useEffect, useMemo } from "react";
import api from "../services/api";
import { formatDate, formatTime } from "../utils/formatters";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { Portuguese } from "flatpickr/dist/l10n/pt.js";
import { toast } from "sonner";
import "./Ocorrencias.css";

// EXTERNAL FLATPICKR CONFIGURATIONS (Prevents re-render destruction loops)
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

const ListIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const EditIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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

const ClockIcon = ({ style }) => (
  <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
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


export default function Ocorrencias() {
  const [ocorrencias, setOcorrencias] = useState([]);
  const [activeTab, setActiveTab] = useState("cadastro");
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
  const [modalEditar, setModalEditar] = useState(null);
  const [modalVisualizar, setModalVisualizar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  const [modalExcluir, setModalExcluir] = useState(null);
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
      unidade: "",
      morador: "",
      registrada_por: "todos",
      quem_registrou: "",
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


  return (
    <div className="ocorrencias-container">
      {/* TABS NAVIGATION */}
      <div className="ocorrencias-tabs">
        <button
          className={`ocorrencias-tab-btn ${activeTab === "cadastro" ? "active" : ""}`}
          onClick={() => handleTabClick("cadastro")}
        >
          <PencilIcon style={{ width: 22, height: 22 }} />
          <span>Cadastro de Ocorrências</span>
        </button>
        <button
          className={`ocorrencias-tab-btn ${activeTab === "visualizacao" ? "active" : ""}`}
          onClick={() => handleTabClick("visualizacao")}
        >
          <ListIcon style={{ width: 22, height: 22 }} />
          <span>Visualização de Ocorrências</span>
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="tab-content">
        {activeTab === "cadastro" && (
          <form className="cadastro-form" onSubmit={handleCreateSubmit}>
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
                value={formData.unidade_infratante}
                onChange={(e) => setFormData({ ...formData, unidade_infratante: e.target.value })}
                placeholder="Ex: Bloco A, 102"
                required
              />
            </div>
            <div className="form-group">
              <label>Nome do Morador <span className="color-danger">*</span></label>
              <input
                type="text"
                value={formData.nome_morador}
                onChange={(e) => setFormData({ ...formData, nome_morador: e.target.value })}
                placeholder="Ex: João Silva"
                required
              />
            </div>
            <div className="form-group">
              <label>Registrado Por <span className="color-danger">*</span></label>
              <select
                value={formData.registrada_por}
                onChange={(e) => setFormData({ ...formData, registrada_por: e.target.value })}
              >
                <option value="Morador">Morador</option>
                <option value="Segurança">Segurança</option>
                <option value="Portaria">Portaria</option>
                <option value="Sindico">Síndico</option>
              </select>
            </div>
            <div className="form-group">
              <label>Quem registrou (Nome) <span className="color-danger">*</span></label>
              <input
                type="text"
                value={formData.quem_registrou}
                onChange={(e) => setFormData({ ...formData, quem_registrou: e.target.value })}
                placeholder="Ex: Porteiro Carlos"
                required
              />
            </div>
            <div className="form-group full-width">
              <label>Motivo / Descrição <span className="color-danger">*</span></label>
              <textarea
                value={formData.motivo_ocorrencia}
                onChange={(e) => setFormData({ ...formData, motivo_ocorrencia: e.target.value })}
                placeholder="Descreva os detalhes da ocorrência..."
                maxLength={500}
                required
              />
              <span className="char-count">{formData.motivo_ocorrencia.length}/500</span>
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
              <h2>Visualização de Ocorrências</h2>
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
                  {ocorrenciasFiltradas.map((o) => (
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
                            onClick={() => setModalVisualizar(o)}
                            title="Visualizar"
                          >
                            <EyeIcon style={{ width: 14, height: 14 }} />
                          </button>
                          <button
                            className="admin-btn-small edit-btn"
                            onClick={() => openEditarModal(o)}
                            title="Editar"
                          >
                            <PencilIcon style={{ width: 14, height: 14 }} />
                          </button>
                          <button
                            className="admin-btn-small delete-btn"
                            onClick={() => handleDeletar(o.id)}
                            title="Excluir"
                          >
                            <TrashIcon style={{ width: 14, height: 14 }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
                        onClick={() => setModalVisualizar(o)}
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
                        onClick={() => handleDeletar(o.id)}
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
      {
        modalFiltro && (
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
        )
      }

      {/* Modal Visualizar */}
      {
        modalVisualizar && (
          <div className="global-modal-overlay" onClick={() => setModalVisualizar(null)}>
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
        )
      }

      {/* Modal Editar */}
      {
        modalEditar && (
          <div className="global-modal-overlay" onClick={() => setModalEditar(null)}>
            <div className="global-modal" onClick={(e) => e.stopPropagation()}>
              <button className="global-modal-close" onClick={() => setModalEditar(null)}>✕</button>
              <div className="modal-header">
                <span className="modal-header-icon">✏️</span>
                <h3>Editar Ocorrência</h3>
              </div>
              <div className="modal-badge">#{modalEditar.id} — {modalEditar.unidade_infratante}</div>

              <form onSubmit={handleEditSubmit} className="modal-form">
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
                      className="modal-input"
                      value={editFormData.unidade_infratante}
                      onChange={(e) => setEditFormData({ ...editFormData, unidade_infratante: e.target.value })}
                      placeholder="Ex: Bloco A, 102"
                      required
                    />
                  </div>
                  <div className="modal-field">
                    <label className="modal-label">Morador <span className="color-danger">*</span></label>
                    <input
                      type="text"
                      className="modal-input"
                      value={editFormData.nome_morador}
                      onChange={(e) => setEditFormData({ ...editFormData, nome_morador: e.target.value })}
                      placeholder="Ex: João Silva"
                      required
                    />
                  </div>
                </div>

                <div className="modal-field">
                  <label className="modal-label">Motivo <span className="color-danger">*</span></label>
                  <textarea
                    className="modal-input"
                    style={{ minHeight: '120px', resize: 'vertical' }}
                    value={editFormData.motivo_ocorrencia}
                    onChange={(e) => setEditFormData({ ...editFormData, motivo_ocorrencia: e.target.value })}
                    maxLength={500}
                    required
                  />
                  <span className="char-count">{editFormData.motivo_ocorrencia.length}/500</span>
                </div>

                <button type="submit" className="modal-btn modal-btn-primary">
                  <CheckIcon style={{ width: 16, height: 16 }} />
                  Salvar Alterações
                </button>
              </form>
            </div>
          </div>
        )
      }
    </div >
  );
}