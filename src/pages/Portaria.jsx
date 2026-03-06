import { useState, useEffect, useMemo } from "react";
import api from "../services/api";
import { toast } from "sonner";
import { formatDate } from "../utils/formatters";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { Portuguese } from "flatpickr/dist/l10n/pt.js";
import "./Portaria.css";

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

const LockIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const LogOutIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
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

const UnlockIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
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

const ShieldCheckIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const FilterIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

export default function Portaria() {
  const [activeTab, setActiveTab] = useState("cadastro");
  const [acessos, setAcessos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalFiltro, setModalFiltro] = useState(false);
  const [filtros, setFiltros] = useState({
    nome: "",
    documento: "",
    placa: "",
    status: "todos", // todos, presente, saiu
    dataInicio: "",
    dataFim: ""
  });
  const [filtrosTemporarios, setFiltrosTemporarios] = useState({ ...filtros });
  const [modalEditar, setModalEditar] = useState(null);
  const [editFormData, setEditFormData] = useState({
    nome: "",
    sobrenome: "",
    documento: "",
    placa: "",
    marca: "",
    modelo: "",
    cor: "",
  });
  const [formData, setFormData] = useState({
    nome: "",
    sobrenome: "",
    documento: "",
    placa: "",
    marca: "",
    modelo: "",
    cor: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fetchAcessos = async () => {
    try {
      const response = await api.get("/acessos");
      setAcessos(response.data.acessos);
    } catch (error) {
      console.error("Erro ao buscar acessos:", error);
    }
  };

  const registrarSaida = async (id) => {
    try {
      await api.post(`/ acessos / ${id}/saida`);
      toast.success("Saída registrada com sucesso!");
      fetchAcessos();
    } catch (error) {
      toast.error("Erro ao registrar saída");
      console.error(error);
    }
  };

  const openEditarModal = (acesso) => {
    setModalEditar(acesso);
    setEditFormData({
      nome: acesso.nome,
      sobrenome: acesso.sobrenome,
      documento: acesso.documento,
      placa: acesso.placa || "",
      marca: acesso.marca || "",
      modelo: acesso.modelo || "",
      cor: acesso.cor || "",
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/acessos/${modalEditar.id}`, editFormData);
      toast.success("Acesso atualizado!");
      setModalEditar(null);
      fetchAcessos();
    } catch (error) {
      toast.error("Erro ao atualizar acesso");
      console.error(error);
    }
  };

  const clearFiltros = () => {
    const limpo = {
      nome: "",
      documento: "",
      placa: "",
      status: "todos",
      dataInicio: "",
      dataFim: ""
    };
    setFiltrosTemporarios(limpo);
  };

  const acessosFiltrados = useMemo(() => {
    return acessos.filter(a => {
      const nomeCompleto = `${a.nome} ${a.sobrenome}`.toLowerCase();
      const matchNome = !filtros.nome || nomeCompleto.includes(filtros.nome.toLowerCase());
      const matchDoc = !filtros.documento || a.documento.toLowerCase().includes(filtros.documento.toLowerCase());
      const matchPlaca = !filtros.placa || (a.placa && a.placa.toLowerCase().includes(filtros.placa.toLowerCase()));

      let matchStatus = true;
      if (filtros.status === "presente") matchStatus = !a.data_saida;
      else if (filtros.status === "saiu") matchStatus = !!a.data_saida;

      let matchData = true;
      if (filtros.dataInicio) matchData = matchData && a.data_entrada >= filtros.dataInicio;
      if (filtros.dataFim) matchData = matchData && a.data_entrada <= filtros.dataFim;

      return matchNome && matchDoc && matchPlaca && matchStatus && matchData;
    });
  }, [acessos, filtros]);

  useEffect(() => {
    if (activeTab === "visualizacao") {
      fetchAcessos();
    }
  }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/acessos", formData);
      toast.success("Acesso cadastrado com sucesso!");
      setFormData({
        nome: "",
        sobrenome: "",
        documento: "",
        placa: "",
        marca: "",
        modelo: "",
        cor: "",
      });
    } catch (error) {
      toast.error("Erro ao cadastrar acesso");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portaria-container">
      {/* TABS NAVIGATION */}
      <div className="portaria-tabs">
        <button
          type="button"
          className={`portaria-tab-btn ${activeTab === "cadastro" ? "active" : ""}`}
          onClick={() => setActiveTab("cadastro")}
        >
          <PencilIcon className="section-icon" style={{ width: 22, height: 22 }} /> Cadastro de Acessos
        </button>
        <button
          type="button"
          className={`portaria-tab-btn ${activeTab === "visualizacao" ? "active" : ""}`}
          onClick={() => setActiveTab("visualizacao")}
        >
          <ListIcon className="section-icon" style={{ width: 22, height: 22 }} /> Visualização de Acessos
        </button>
        <button
          type="button"
          className={`portaria-tab-btn ${activeTab === "liberacao" ? "active" : ""}`}
          onClick={() => setActiveTab("liberacao")}
        >
          <UnlockIcon className="section-icon" style={{ width: 22, height: 22 }} /> Liberação de Acessos
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="tab-content">
        {activeTab === "cadastro" && (
          <form className="cadastro-form" onSubmit={handleSubmit}>
            <h2><UserPlusIcon className="section-icon" /> Cadastro de Acessos</h2>

            <div className="form-group">
              <label>Nome:</label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Ex: João"
                required
              />
            </div>

            <div className="form-group">
              <label>Sobrenome:</label>
              <input
                type="text"
                name="sobrenome"
                value={formData.sobrenome}
                onChange={handleChange}
                placeholder="Ex: Silva"
                required
              />
            </div>

            <div className="form-group">
              <label>Documento (RG/CPF):</label>
              <input
                type="text"
                name="documento"
                value={formData.documento}
                onChange={handleChange}
                placeholder="Ex: 12.345.678-9"
                required
              />
            </div>

            <div className="form-group">
              <label>Placa:</label>
              <input
                type="text"
                name="placa"
                value={formData.placa}
                onChange={handleChange}
                placeholder="Ex: ABC-1234"
              />
            </div>

            <div className="form-group">
              <label>Marca:</label>
              <input
                type="text"
                name="marca"
                value={formData.marca}
                onChange={handleChange}
                placeholder="Ex: Toyota"
              />
            </div>

            <div className="form-group">
              <label>Modelo:</label>
              <input
                type="text"
                name="modelo"
                value={formData.modelo}
                onChange={handleChange}
                placeholder="Ex: Corolla"
              />
            </div>

            <div className="form-group">
              <label>Cor:</label>
              <input
                type="text"
                name="cor"
                value={formData.cor}
                onChange={handleChange}
                placeholder="Ex: Prata"
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Cadastrando..." : "Cadastrar Acesso"}
            </button>
          </form>
        )}

        {activeTab === "visualizacao" && (
          <div className="visualizacao">
            <div className="visualizacao-header">
              <h2>Visualização de Acessos</h2>
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
            {acessos.length === 0 ? (
              <p>Nenhum acesso cadastrado ainda.</p>
            ) : (
              <div className="responsive-table-container">
                <table className="acessos-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nome</th>
                      <th>Sobrenome</th>
                      <th>Documento</th>
                      <th>Placa</th>
                      <th>Marca</th>
                      <th>Modelo</th>
                      <th>Cor</th>
                      <th>Entrada</th>
                      <th>Saída</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {acessosFiltrados.map((a) => (
                      <tr key={a.id}>
                        <td>{a.id}</td>
                        <td>{a.nome}</td>
                        <td>{a.sobrenome}</td>
                        <td>{a.documento}</td>
                        <td>{a.placa}</td>
                        <td>{a.marca}</td>
                        <td>{a.modelo}</td>
                        <td>{a.cor}</td>
                        <td>{formatDateTime(a.data_entrada)}</td>
                        <td>
                          {a.data_saida ? (
                            <span className="status-saida-registrada">
                              ✓ {formatDateTime(a.data_saida)}
                            </span>
                          ) : (
                            <span className="status-presente">🟢 Presente</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              className="admin-btn-small edit-btn"
                              onClick={() => openEditarModal(a)}
                              data-tooltip="Editar"
                            >
                              <PencilIcon style={{ width: 14, height: 14 }} />
                            </button>
                            {a.data_saida ? (
                              <span className="admin-btn-small delete-btn" style={{ opacity: 0.5 }} title="Saída registrada">
                                <LockIcon style={{ width: 14, height: 14 }} />
                              </span>
                            ) : (
                              <button
                                type="button"
                                className="admin-btn-small edit-btn"
                                onClick={() => registrarSaida(a.id)}
                                data-tooltip="Registrar Saída"
                              >
                                <LogOutIcon style={{ width: 14, height: 14 }} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "liberacao" && (
              <div className="liberacao">
                <h2><ShieldCheckIcon className="section-icon" /> Liberação de Acessos</h2>
                <p>Funcionalidade em desenvolvimento...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL EDITAR ACESSO */}
      {modalEditar && (
        <div className="global-modal-overlay" onClick={() => setModalEditar(null)}>
          <div className="global-modal" onClick={(e) => e.stopPropagation()}>
            <button className="global-modal-close" onClick={() => setModalEditar(null)}>✕</button>
            <div className="modal-header">
              <PencilIcon style={{ width: 22, height: 22, marginRight: '10px' }} />
              <h3>Editar Acesso</h3>
            </div>

            <form onSubmit={handleEditSubmit} className="modal-form">
              <div className="modal-form-row">
                <div className="modal-field">
                  <label className="modal-label">Nome</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={editFormData.nome}
                    onChange={(e) => setEditFormData({ ...editFormData, nome: e.target.value })}
                    placeholder="Ex: João"
                    required
                  />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Sobrenome</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={editFormData.sobrenome}
                    onChange={(e) => setEditFormData({ ...editFormData, sobrenome: e.target.value })}
                    placeholder="Ex: Silva"
                    required
                  />
                </div>
              </div>

              <div className="modal-field">
                <label className="modal-label">Documento</label>
                <input
                  type="text"
                  className="modal-input"
                  value={editFormData.documento}
                  onChange={(e) => setEditFormData({ ...editFormData, documento: e.target.value })}
                  placeholder="Ex: 12.345.678-9"
                  required
                />
              </div>

              <div className="modal-form-row">
                <div className="modal-field">
                  <label className="modal-label">Placa</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={editFormData.placa}
                    onChange={(e) => setEditFormData({ ...editFormData, placa: e.target.value })}
                    placeholder="Ex: ABC-1234"
                  />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Cor</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={editFormData.cor}
                    onChange={(e) => setEditFormData({ ...editFormData, cor: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-form-row">
                <div className="modal-field">
                  <label className="modal-label">Marca</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={editFormData.marca}
                    onChange={(e) => setEditFormData({ ...editFormData, marca: e.target.value })}
                  />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Modelo</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={editFormData.modelo}
                    onChange={(e) => setEditFormData({ ...editFormData, modelo: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="submit-btn" style={{ marginTop: '20px' }}>
                Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Filtro */}
      {modalFiltro && (
        <div className="global-modal-overlay" onClick={() => setModalFiltro(false)}>
          <div className="global-modal" onClick={(e) => e.stopPropagation()}>
            <button className="global-modal-close" onClick={() => setModalFiltro(false)}>✕</button>
            <div className="modal-header">
              <FilterIcon style={{ width: 20, height: 20, marginRight: '10px' }} />
              <h3>Filtrar Acessos</h3>
            </div>

            <div className="modal-form">
              <div className="modal-field">
                <label className="modal-label">Nome do Visitante</label>
                <input
                  type="text"
                  className="modal-input"
                  value={filtrosTemporarios.nome}
                  onChange={(e) => setFiltrosTemporarios({ ...filtrosTemporarios, nome: e.target.value })}
                  placeholder="Filtrar por nome..."
                />
              </div>

              <div className="modal-form-row">
                <div className="modal-field">
                  <label className="modal-label">Documento</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={filtrosTemporarios.documento}
                    onChange={(e) => setFiltrosTemporarios({ ...filtrosTemporarios, documento: e.target.value })}
                    placeholder="RG ou CPF"
                  />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Placa</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={filtrosTemporarios.placa}
                    onChange={(e) => setFiltrosTemporarios({ ...filtrosTemporarios, placa: e.target.value })}
                    placeholder="ABC-1234"
                  />
                </div>
              </div>

              <div className="modal-field">
                <label className="modal-label">Status</label>
                <select
                  className="modal-input"
                  value={filtrosTemporarios.status}
                  onChange={(e) => setFiltrosTemporarios({ ...filtrosTemporarios, status: e.target.value })}
                >
                  <option value="todos">Todos</option>
                  <option value="presente">Presente (No Condomínio)</option>
                  <option value="saiu">Saída Registrada</option>
                </select>
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
                    options={{
                      locale: Portuguese,
                      dateFormat: "Y-m-d",
                      altInput: true,
                      altFormat: "d/m/Y",
                      disableMobile: "true",
                      static: true
                    }}
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
                    options={{
                      locale: Portuguese,
                      dateFormat: "Y-m-d",
                      altInput: true,
                      altFormat: "d/m/Y",
                      disableMobile: "true",
                      static: true
                    }}
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
