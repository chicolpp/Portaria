import { useState, useEffect } from "react";
import api from "../services/api";
import { toast } from "sonner";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { Portuguese } from "flatpickr/dist/l10n/pt.js";
import "./Ocorrencias.css";

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

export default function LivroDeOcorrencia() {
  const [activeTab, setActiveTab] = useState("cadastro");
  const [ocorrencias, setOcorrencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisualizar, setModalVisualizar] = useState(null);
  const [modalEditar, setModalEditar] = useState(null);

  const [formData, setFormData] = useState({
    data: "",
    hora: "",
    unidadeInfratante: "",
    nomeMorador: "",
    registradaPor: "",
    quemRegistrou: "",
    motivoOcorrencia: "",
  });

  const [editFormData, setEditFormData] = useState({
    data: "",
    hora: "",
    unidadeInfratante: "",
    nomeMorador: "",
    registradaPor: "",
    quemRegistrou: "",
    motivoOcorrencia: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "registradaPor") {
      setFormData({
        ...formData,
        [name]: value,
        quemRegistrou: value === "condominio" ? "Condomínio" : ""
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    if (name === "registradaPor") {
      setEditFormData({
        ...editFormData,
        [name]: value,
        quemRegistrou: value === "condominio" ? "Condomínio" : ""
      });
    } else {
      setEditFormData({ ...editFormData, [name]: value });
    }
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
        data: "",
        hora: "",
        unidadeInfratante: "",
        nomeMorador: "",
        registradaPor: "",
        quemRegistrou: "",
        motivoOcorrencia: "",
      });
    } catch (error) {
      toast.error("Erro ao cadastrar ocorrência");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openVisualizarModal = (ocorrencia) => {
    setModalVisualizar(ocorrencia);
  };

  const closeVisualizarModal = () => {
    setModalVisualizar(null);
  };

  const openEditarModal = (ocorrencia) => {
    setModalEditar(ocorrencia);
    setEditFormData({
      data: ocorrencia.data,
      hora: ocorrencia.hora,
      unidadeInfratante: ocorrencia.unidade_infratante,
      nomeMorador: ocorrencia.nome_morador,
      registradaPor: ocorrencia.registrada_por,
      quemRegistrou: ocorrencia.quem_registrou,
      motivoOcorrencia: ocorrencia.motivo_ocorrencia,
    });
  };

  const closeEditarModal = () => {
    setModalEditar(null);
  };

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
    if (!window.confirm("Tem certeza que deseja apagar esta ocorrência?")) {
      return;
    }

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
        <div className="foto-modal-overlay" onClick={closeVisualizarModal}>
          <div className="visualizar-modal" onClick={(e) => e.stopPropagation()}>
            <button className="foto-modal-close" onClick={closeVisualizarModal}>✕</button>
            <h3>Detalhes da Ocorrência</h3>

            <div className="visualizar-info">
              <p><strong>Data:</strong> {modalVisualizar.data}</p>
              <p><strong>Hora:</strong> {modalVisualizar.hora}</p>
              <p><strong>Unidade Infratante:</strong> {modalVisualizar.unidade_infratante}</p>
              <p><strong>Nome do Morador:</strong> {modalVisualizar.nome_morador}</p>
              <p><strong>Registrada por:</strong> {modalVisualizar.registrada_por === "unidade" ? "Unidade" : "Condomínio"}</p>
              <p><strong>Quem Registrou:</strong> {modalVisualizar.quem_registrou}</p>
            </div>

            <div className="motivo-box">
              <label>Motivo da Ocorrência:</label>
              <p className="motivo-texto">{modalVisualizar.motivo_ocorrencia}</p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {modalEditar && (
        <div className="foto-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) closeEditarModal(); }}>
          <div className="editar-modal" onMouseDown={(e) => e.stopPropagation()}>
            <button className="foto-modal-close" onClick={closeEditarModal}>✕</button>
            <h3>Editar Ocorrência</h3>

            <form className="editar-form" onSubmit={handleEditSubmit}>
              <div className="editar-form-group">
                <label>Data:</label>
                <div className="flatpickr-interactive-wrapper" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
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
                    options={{
                      locale: Portuguese,
                      dateFormat: "Y-m-d",
                      altInput: true,
                      altFormat: "d/m/Y",
                      disableMobile: "true",
                      static: true,
                      clickOpens: true
                    }}
                    className="modal-input flatpickr-input-custom"
                  />
                </div>
              </div>

              <div className="editar-form-group">
                <label>Hora:</label>
                <div className="flatpickr-interactive-wrapper" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                  <Flatpickr
                    value={editFormData.hora}
                    onChange={([date]) => {
                      if (date) {
                        const hours = String(date.getHours()).padStart(2, '0');
                        const minutes = String(date.getMinutes()).padStart(2, '0');
                        setEditFormData({ ...editFormData, hora: `${hours}:${minutes}` });
                      }
                    }}
                    options={{
                      enableTime: true,
                      noCalendar: true,
                      dateFormat: "H:i",
                      time_24hr: true,
                      disableMobile: "true",
                      static: true,
                      clickOpens: true
                    }}
                    className="modal-input flatpickr-input-custom"
                  />
                </div>
              </div>

              <div className="editar-form-group">
                <label>Unidade Infratante:</label>
                <input
                  type="text"
                  name="unidadeInfratante"
                  value={editFormData.unidadeInfratante}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="editar-form-group">
                <label>Nome do Morador:</label>
                <input
                  type="text"
                  name="nomeMorador"
                  value={editFormData.nomeMorador}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="editar-form-group">
                <label>Registrada por:</label>
                <select
                  name="registradaPor"
                  value={editFormData.registradaPor}
                  onChange={handleEditChange}
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="unidade">Unidade</option>
                  <option value="condominio">Condomínio</option>
                </select>
              </div>

              {editFormData.registradaPor && (
                <div className="editar-form-group">
                  <label>Quem Registrou:</label>
                  {editFormData.registradaPor === "condominio" ? (
                    <input
                      type="text"
                      name="quemRegistrou"
                      value="Condomínio"
                      readOnly
                    />
                  ) : (
                    <input
                      type="text"
                      name="quemRegistrou"
                      value={editFormData.quemRegistrou}
                      onChange={handleEditChange}
                      placeholder="Nome do morador"
                      required
                    />
                  )}
                </div>
              )}

              <div className="editar-form-group">
                <label>Motivo da Ocorrência:</label>
                <textarea
                  name="motivoOcorrencia"
                  value={editFormData.motivoOcorrencia}
                  onChange={handleEditChange}
                  maxLength={500}
                  required
                  rows={5}
                />
                <span className="char-count">{editFormData.motivoOcorrencia.length}/500</span>
              </div>

              <button type="submit" className="salvar-edicao-btn">
                💾 Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TABS NAVIGATION */}
      <div className="ocorrencias-tabs">
        <button
          type="button"
          className={`ocorrencias-tab-btn ${activeTab === "cadastro" ? "active" : ""}`}
          onClick={() => setActiveTab("cadastro")}
        >
          <PencilIcon className="section-icon" style={{ width: 22, height: 22 }} /> Cadastro de Ocorrências
        </button>
        <button
          type="button"
          className={`ocorrencias-tab-btn ${activeTab === "visualizacao" ? "active" : ""}`}
          onClick={() => setActiveTab("visualizacao")}
        >
          <ListIcon className="section-icon" style={{ width: 22, height: 22 }} /> Visualização de Ocorrências
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="tab-content">
        {activeTab === "cadastro" && (
          <form className="cadastro-form" onSubmit={handleSubmit}>
            <h2><UserPlusIcon className="section-icon" /> Cadastro de Ocorrências</h2>

            <div className="form-group">
              <label>Data:</label>
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
                options={{
                  locale: Portuguese,
                  dateFormat: "Y-m-d",
                  altInput: true,
                  altFormat: "d/m/Y",
                  disableMobile: "true",
                  static: true
                }}
                className="flatpickr-input-custom"
                required
              />
            </div>

            <div className="form-group">
              <label>Hora:</label>
              <Flatpickr
                value={formData.hora}
                onChange={([date]) => {
                  if (date) {
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    setFormData({ ...formData, hora: `${hours}:${minutes}` });
                  }
                }}
                options={{
                  enableTime: true,
                  noCalendar: true,
                  dateFormat: "H:i",
                  time_24hr: true,
                  disableMobile: "true",
                  static: true
                }}
                className="flatpickr-input-custom"
                required
              />
            </div>

            <div className="form-group">
              <label>Unidade Infratante:</label>
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
              <label>Nome do Morador:</label>
              <input
                type="text"
                name="nomeMorador"
                value={formData.nomeMorador}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Registrada por:</label>
              <select
                name="registradaPor"
                value={formData.registradaPor}
                onChange={handleChange}
                required
              >
                <option value="">Selecione...</option>
                <option value="unidade">Unidade</option>
                <option value="condominio">Condomínio</option>
              </select>
            </div>

            {formData.registradaPor && (
              <div className="form-group">
                <label>Quem Registrou:</label>
                {formData.registradaPor === "condominio" ? (
                  <input
                    type="text"
                    name="quemRegistrou"
                    value="Condomínio"
                    readOnly
                  />
                ) : (
                  <input
                    type="text"
                    name="quemRegistrou"
                    value={formData.quemRegistrou}
                    onChange={handleChange}
                    placeholder="Nome do morador"
                    required
                  />
                )}
              </div>
            )}

            <div className="form-group full-width">
              <label>Motivo da Ocorrência:</label>
              <textarea
                name="motivoOcorrencia"
                value={formData.motivoOcorrencia}
                onChange={handleChange}
                maxLength={500}
                placeholder="Descreva o motivo da ocorrência (máximo 500 caracteres)"
                required
                rows={5}
              />
              <span className="char-count">{formData.motivoOcorrencia.length}/500</span>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Cadastrando..." : "Cadastrar Ocorrência"}
            </button>
          </form>
        )}

        {activeTab === "visualizacao" && (
          <div className="visualizacao">
            <h2><ListIcon className="section-icon" /> Visualização de Ocorrências</h2>
            {ocorrencias.length === 0 ? (
              <p>Nenhuma ocorrência cadastrada ainda.</p>
            ) : (
              <div className="responsive-table-container">
                <table className="ocorrencias-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Data</th>
                      <th>Hora</th>
                      <th>Unidade</th>
                      <th>Morador</th>
                      <th>Registrada por</th>
                      <th>Quem Registrou</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ocorrencias.map((o) => (
                      <tr key={o.id}>
                        <td>{o.id}</td>
                        <td>{o.data}</td>
                        <td>{o.hora}</td>
                        <td>{o.unidade_infratante}</td>
                        <td>{o.nome_morador}</td>
                        <td>{o.registrada_por === "unidade" ? "Unidade" : "Condomínio"}</td>
                        <td>{o.quem_registrou}</td>
                        <td className="acoes-cell">
                          <button
                            type="button"
                            className="admin-btn-small ver-btn"
                            onClick={() => openVisualizarModal(o)}
                            data-tooltip="Visualizar"
                          >
                            <EyeIcon style={{ width: 14, height: 14 }} />
                          </button>
                          <button
                            type="button"
                            className="admin-btn-small edit-btn"
                            onClick={() => openEditarModal(o)}
                            data-tooltip="Editar"
                          >
                            <PencilIcon style={{ width: 14, height: 14 }} />
                          </button>
                          <button
                            type="button"
                            className="admin-btn-small delete-btn"
                            onClick={() => handleDelete(o.id)}
                            data-tooltip="Apagar"
                          >
                            <TrashIcon style={{ width: 14, height: 14 }} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
