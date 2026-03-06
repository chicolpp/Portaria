import { useState, useEffect } from "react";
import api from "../services/api";
import { useToast } from "../components/Toast";
import "./Ocorrencias.css";

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

      alert("Ocorrência cadastrada com sucesso!");
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
      alert("Erro ao cadastrar ocorrência");
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

      alert("Ocorrência atualizada com sucesso!");
      closeEditarModal();
      fetchOcorrencias();
    } catch (error) {
      alert("Erro ao atualizar ocorrência");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja apagar esta ocorrência?")) {
      return;
    }

    try {
      await api.delete(`/ocorrencias/${id}`);
      alert("Ocorrência apagada com sucesso!");
      fetchOcorrencias();
    } catch (error) {
      alert("Erro ao apagar ocorrência");
      console.error(error);
    }
  };

  return (
    <div className="ocorrencias-container">
      {/* MODAL VISUALIZAR */}
      {modalVisualizar && (
        <div className="global-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) closeVisualizarModal(); }}>
          <div className="global-modal" onMouseDown={(e) => e.stopPropagation()}>
            <button className="global-modal-close" onClick={closeVisualizarModal}>✕</button>
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
        <div className="global-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) closeEditarModal(); }}>
          <div className="global-modal" onMouseDown={(e) => e.stopPropagation()}>
            <button className="global-modal-close" onClick={closeEditarModal}>✕</button>
            <h3>Editar Ocorrência</h3>

            <form className="editar-form" onSubmit={handleEditSubmit}>
              <div className="editar-form-group">
                <label>Data:</label>
                <input
                  type="date"
                  name="data"
                  value={editFormData.data}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="editar-form-group">
                <label>Hora:</label>
                <input
                  type="time"
                  name="hora"
                  value={editFormData.hora}
                  onChange={handleEditChange}
                  required
                />
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
      <div className="tabs">
        <button
          type="button"
          className={activeTab === "cadastro" ? "active" : ""}
          onClick={() => setActiveTab("cadastro")}
        >
          📝 Cadastro de Ocorrências
        </button>
        <button
          type="button"
          className={activeTab === "visualizacao" ? "active" : ""}
          onClick={() => setActiveTab("visualizacao")}
        >
          📋 Visualização de Ocorrências
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="tab-content">
        {activeTab === "cadastro" && (
          <form className="cadastro-form" onSubmit={handleSubmit}>
            <h2>Cadastro de Ocorrências</h2>

            <div className="form-group">
              <label>Data:</label>
              <input
                type="date"
                name="data"
                value={formData.data}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Hora:</label>
              <input
                type="time"
                name="hora"
                value={formData.hora}
                onChange={handleChange}
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
            <h2>Visualização de Ocorrências</h2>
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
                            className="ver-btn"
                            onClick={() => openVisualizarModal(o)}
                            data-tooltip="Visualizar"
                          >
                            👁️ Ver
                          </button>
                          <button
                            type="button"
                            className="editar-btn"
                            onClick={() => openEditarModal(o)}
                            data-tooltip="Editar"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            type="button"
                            className="apagar-btn"
                            onClick={() => handleDelete(o.id)}
                            data-tooltip="Apagar"
                          >
                            🗑️ Apagar
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
