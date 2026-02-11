import { useState, useEffect, useRef } from "react";
import api from "../services/api";
import { toast } from "sonner";
import "./Encomendas.css";

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

const PackageIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.89 1.45l8 4.6a2 2 0 0 1 1 1.73v9.24a2 2 0 0 1-1 1.73l-8 4.6a2 2 0 0 1-2 0l-8-4.6a2 2 0 0 1-1-1.73V7.78a2 2 0 0 1 1-1.73l8-4.6a2 2 0 0 1 2 0z" />
    <polyline points="3.29 7 12 12 20.71 7" />
    <line x1="12" y1="22.5" x2="12" y2="12" />
  </svg>
);

const BoxIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="21 8 21 21 3 21 3 8" />
    <rect x="1" y="3" width="22" height="5" />
    <line x1="10" y1="12" x2="14" y2="12" />
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

export default function Encomendas() {
  const [activeTab, setActiveTab] = useState("cadastro");
  const [encomendas, setEncomendas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fotoFile, setFotoFile] = useState(null);
  const [modalFoto, setModalFoto] = useState(null);
  const [modalRetirada, setModalRetirada] = useState(null);
  const [modalEditar, setModalEditar] = useState(null);
  const [editFotoFile, setEditFotoFile] = useState(null);
  const [nomeRetirada, setNomeRetirada] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);
  const [editFormData, setEditFormData] = useState({
    nome: "",
    unidade: "",
    documento: "",
    pagina: "",
    dataRecebimento: "",
    horaRecebimento: "",
  });
  const [formData, setFormData] = useState({
    nome: "",
    unidade: "",
    documento: "",
    pagina: "",
    dataRecebimento: "",
    horaRecebimento: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditFotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setEditFotoFile(e.target.files[0]);
    }
  };

  const handleFotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFotoFile(e.target.files[0]);
    }
  };

  const fetchEncomendas = async () => {
    try {
      const response = await api.get("/encomendas");
      setEncomendas(response.data.encomendas);
    } catch (error) {
      console.error("Erro ao buscar encomendas:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "visualizacao") {
      fetchEncomendas();
    }
  }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nome.trim()) { toast.warning("Preencha o campo Nome."); return; }
    if (!formData.unidade.trim()) { toast.warning("Preencha o campo Unidade."); return; }
    if (!formData.documento.trim()) { toast.warning("Preencha o campo Código de Rastreamento."); return; }
    if (!formData.dataRecebimento) { toast.warning("Preencha a Data de Recebimento."); return; }
    if (!formData.horaRecebimento) { toast.warning("Preencha a Hora de Recebimento."); return; }

    setLoading(true);

    try {
      const data = new FormData();
      data.append("nome", formData.nome);
      data.append("unidade", formData.unidade);
      data.append("documento", formData.documento);
      data.append("pagina", formData.pagina);
      data.append("dataRecebimento", formData.dataRecebimento);
      data.append("horaRecebimento", formData.horaRecebimento);
      if (fotoFile) {
        data.append("foto", fotoFile);
      }

      await api.post("/encomendas", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Encomenda cadastrada com sucesso!");
      setFormData({
        nome: "",
        unidade: "",
        documento: "",
        pagina: "",
        dataRecebimento: "",
        horaRecebimento: "",
      });
      setFotoFile(null);
      document.getElementById("foto-input").value = "";
    } catch (error) {
      toast.error("Erro ao cadastrar encomenda");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openFotoModal = (fotoPath) => {
    setModalFoto(`/uploads/${fotoPath}`);
  };

  const closeFotoModal = () => {
    setModalFoto(null);
  };

  const openRetiradaModal = (encomenda) => {
    setModalRetirada(encomenda);
    setNomeRetirada("");
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }, 100);
  };

  const closeRetiradaModal = () => {
    setModalRetirada(null);
    setNomeRetirada("");
  };

  const openEditarModal = (encomenda) => {
    setModalEditar(encomenda);
    setEditFormData({
      nome: encomenda.nome,
      unidade: encomenda.unidade,
      documento: encomenda.documento,
      pagina: encomenda.pagina,
      dataRecebimento: encomenda.data_recebimento,
      horaRecebimento: encomenda.hora_recebimento,
    });
    setEditFotoFile(null);
  };

  const closeEditarModal = () => {
    setModalEditar(null);
    setEditFotoFile(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      data.append("nome", editFormData.nome);
      data.append("unidade", editFormData.unidade);
      data.append("documento", editFormData.documento);
      data.append("pagina", editFormData.pagina);
      data.append("dataRecebimento", editFormData.dataRecebimento);
      data.append("horaRecebimento", editFormData.horaRecebimento);
      if (editFotoFile) {
        data.append("foto", editFotoFile);
      }

      await api.put(`/encomendas/${modalEditar.id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Encomenda atualizada com sucesso!");
      closeEditarModal();
      fetchEncomendas();
    } catch (error) {
      toast.error("Erro ao atualizar encomenda");
      console.error(error);
    }
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000000";
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const confirmarRetirada = async () => {
    if (!nomeRetirada.trim()) {
      toast.warning("Por favor, preencha o nome de quem está retirando.");
      return;
    }

    const canvas = canvasRef.current;
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("nome_retirada", nomeRetirada);
      formData.append("assinatura", blob, "assinatura.png");

      try {
        await api.post(`/encomendas/${modalRetirada.id}/retirar`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Retirada confirmada com sucesso!");
        closeRetiradaModal();
        fetchEncomendas();
      } catch (error) {
        toast.error("Erro ao confirmar retirada");
        console.error(error);
      }
    }, "image/png");
  };

  return (
    <div className="encomendas-container">
      {/* MODAL FOTO */}
      {modalFoto && (
        <div className="foto-modal-overlay" onClick={closeFotoModal}>
          <div className="foto-modal" onClick={(e) => e.stopPropagation()}>
            <button className="foto-modal-close" onClick={closeFotoModal}>✕</button>
            <img src={modalFoto} alt="Foto da encomenda" />
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {modalEditar && (
        <div className="foto-modal-overlay" onClick={closeEditarModal}>
          <div className="editar-modal" onClick={(e) => e.stopPropagation()}>
            <button className="foto-modal-close" onClick={closeEditarModal}>✕</button>
            <h3>Editar Encomenda #{modalEditar.id}</h3>

            <form onSubmit={handleEditSubmit} className="editar-form">
              <div className="editar-form-group">
                <label>Nome:</label>
                <input
                  type="text"
                  name="nome"
                  value={editFormData.nome}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="editar-form-group">
                <label>Unidade:</label>
                <input
                  type="text"
                  name="unidade"
                  value={editFormData.unidade}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="editar-form-group">
                <label>Codigo de Rastreamento:</label>
                <input
                  type="text"
                  name="documento"
                  value={editFormData.documento}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="editar-form-group">
                <label>Página:</label>
                <input
                  type="text"
                  name="pagina"
                  value={editFormData.pagina}
                  onChange={handleEditChange}
                />
              </div>

              <div className="editar-form-group">
                <label>Data de Recebimento:</label>
                <input
                  type="date"
                  name="dataRecebimento"
                  value={editFormData.dataRecebimento}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="editar-form-group">
                <label>Hora de Recebimento:</label>
                <input
                  type="time"
                  name="horaRecebimento"
                  value={editFormData.horaRecebimento}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="editar-form-group">
                <label>Nova Foto (opcional):</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditFotoChange}
                />
              </div>

              <button type="submit" className="salvar-edicao-btn">
                💾 Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RETIRADA */}
      {modalRetirada && (
        <div className="foto-modal-overlay" onClick={closeRetiradaModal}>
          <div className="retirada-modal" onClick={(e) => e.stopPropagation()}>
            <button className="foto-modal-close" onClick={closeRetiradaModal}>✕</button>
            <h3>Confirmar Retirada</h3>
            <p className="retirada-info">Encomenda #{modalRetirada.id} - {modalRetirada.nome}</p>

            <div className="retirada-form-group">
              <label>Assinatura:</label>
              <canvas
                ref={canvasRef}
                width={400}
                height={200}
                className="assinatura-canvas"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
              <button type="button" className="limpar-btn" onClick={clearCanvas}>
                Limpar Assinatura
              </button>
            </div>

            <div className="retirada-form-group">
              <label>Nome de quem está retirando:</label>
              <input
                type="text"
                value={nomeRetirada}
                onChange={(e) => setNomeRetirada(e.target.value)}
                placeholder="Digite o nome completo"
              />
            </div>

            <button type="button" className="confirmar-retirada-btn" onClick={confirmarRetirada}>
              ✓ Confirmar Retirada
            </button>
          </div>
        </div>
      )}

      {/* TABS NAVIGATION */}
      <div className="encomendas-tabs">
        <button
          type="button"
          className={`encomendas-tab-btn ${activeTab === "cadastro" ? "active" : ""}`}
          onClick={() => setActiveTab("cadastro")}
        >
          <PencilIcon className="section-icon" style={{ width: 22, height: 22 }} /> Cadastro de Encomendas
        </button>
        <button
          type="button"
          className={`encomendas-tab-btn ${activeTab === "visualizacao" ? "active" : ""}`}
          onClick={() => setActiveTab("visualizacao")}
        >
          <ListIcon className="section-icon" style={{ width: 22, height: 22 }} /> Visualização de Encomendas
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="tab-content">
        {activeTab === "cadastro" && (
          <form className="cadastro-form" onSubmit={handleSubmit} noValidate>
            <h2><PackageIcon className="section-icon" /> Cadastro de Encomendas</h2>

            <div className="form-group">
              <label>Nome:</label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Unidade:</label>
              <input
                type="text"
                name="unidade"
                value={formData.unidade}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Código de Rastreamento:</label>
              <input
                type="text"
                name="documento"
                value={formData.documento}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Página:</label>
              <input
                type="text"
                name="pagina"
                value={formData.pagina}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Data de Recebimento:</label>
              <input
                type="date"
                name="dataRecebimento"
                value={formData.dataRecebimento}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Hora de Recebimento:</label>
              <input
                type="time"
                name="horaRecebimento"
                value={formData.horaRecebimento}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Foto:</label>
              <input
                type="file"
                id="foto-input"
                accept="image/*"
                onChange={handleFotoChange}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Cadastrando..." : "Cadastrar Encomenda"}
            </button>
          </form>
        )}

        {activeTab === "visualizacao" && (
          <div className="visualizacao">
            <h2><BoxIcon className="section-icon" /> Visualização de Encomendas</h2>
            {encomendas.length === 0 ? (
              <p>Nenhuma encomenda cadastrada ainda.</p>
            ) : (
              <table className="encomendas-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Unidade</th>
                    <th>Documento</th>
                    <th>Página</th>
                    <th>Data/Hora Recebimento</th>
                    <th>Foto</th>
                    <th>Status</th>
                    <th>Retirada</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {encomendas.map((e) => (
                    <tr key={e.id}>
                      <td>{e.id}</td>
                      <td>{e.nome}</td>
                      <td>{e.unidade}</td>
                      <td>{e.documento}</td>
                      <td>{e.pagina}</td>
                      <td>{e.data_recebimento} {e.hora_recebimento}</td>
                      <td>
                        {e.foto ? (
                          <button
                            type="button"
                            className="admin-btn-small ver-btn"
                            onClick={() => openFotoModal(e.foto)}
                            data-tooltip="Ver Foto"
                          >
                            <EyeIcon style={{ width: 14, height: 14 }} />
                          </button>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        {e.retirado ? (
                          <span className="status-retirado">✓ Retirado</span>
                        ) : (
                          <span className="status-aguardando">⏳ Aguardando Retirada</span>
                        )}
                      </td>
                      <td>
                        {e.retirado ? (
                          <div className="retirada-info-cell">
                            <span>{e.nome_retirada}</span>
                            <span>{e.data_retirada} {e.hora_retirada}</span>
                            {e.assinatura && (
                              <button
                                type="button"
                                className="admin-btn-small ver-btn"
                                onClick={() => openFotoModal(e.assinatura)}
                                data-tooltip="Ver Assinatura"
                              >
                                <PencilIcon style={{ width: 14, height: 14 }} />
                              </button>
                            )}
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="admin-btn-small edit-btn"
                            onClick={() => openRetiradaModal(e)}
                            data-tooltip="Retirar Encomenda"
                          >
                            <PackageIcon style={{ width: 14, height: 14 }} />
                          </button>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="admin-btn-small edit-btn"
                          onClick={() => openEditarModal(e)}
                          data-tooltip="Editar"
                        >
                          <PencilIcon style={{ width: 14, height: 14 }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
