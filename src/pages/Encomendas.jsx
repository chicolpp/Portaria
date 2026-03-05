import React, { useState, useEffect, useRef } from "react";
import api from "../services/api";
import { toast } from "sonner";
import "./Encomendas.css";

// Ícones SVG inline para evitar dependência de lucide-react
const PackageIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m7.5 4.27 9 5.15" />
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </svg>
);

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
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const EyeIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const BoxIcon = PackageIcon; // Reutilizando PackageIcon como BoxIcon

export default function Encomendas() {
  const [activeTab, setActiveTab] = useState("cadastro");
  const lastPointRef = useRef(null);
  const [encomendas, setEncomendas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    unidade: "",
    documento: "",
    pagina: "",
    dataRecebimento: "",
    horaRecebimento: "",
    foto: "",
    fotoFile: null
  });
  const [modalFoto, setModalFoto] = useState(null);
  const [modalEditar, setModalEditar] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [modalRetirada, setModalRetirada] = useState(null);
  const [nomeRetirada, setNomeRetirada] = useState("");
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  useEffect(() => {
    fetchEncomendas();

    // Relógio em Tempo Real (Hora Local Brasil)
    const timer = setInterval(() => {
      const agora = new Date();

      // Formata data YYYY-MM-DD
      const an = agora.getFullYear();
      const ms = String(agora.getMonth() + 1).padStart(2, '0');
      const di = String(agora.getDate()).padStart(2, '0');
      const dataLocal = `${an}-${ms}-${di}`;

      // Formata hora HH:mm:ss para ver a "contabilização"
      const horaLocal = agora.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      setFormData(prev => ({
        ...prev,
        dataRecebimento: dataLocal,
        horaRecebimento: horaLocal
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchEncomendas = async () => {
    setFetchLoading(true);
    try {
      const response = await api.get("/encomendas");
      // O backend retorna { "encomendas": [...] }
      const data = response.data.encomendas || [];
      console.log("Encomendas carregadas:", data);
      setEncomendas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro na API:", error);
      toast.error("Erro ao carregar encomendas");
      setEncomendas([]);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          foto: reader.result,
          fotoFile: file // Salva o arquivo real para envio via FormData
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append("nome", formData.nome);
      submitData.append("unidade", formData.unidade);
      submitData.append("documento", formData.documento);
      submitData.append("pagina", formData.pagina);
      // Data e Hora removidas, o backend preencherá sozinho

      if (formData.fotoFile) {
        submitData.append("foto", formData.fotoFile);
      }

      await api.post("/encomendas", submitData);
      alert("Encomenda cadastrada com sucesso!");
      setFormData({
        nome: "",
        unidade: "",
        documento: "",
        pagina: "",
        dataRecebimento: new Date().toISOString().split('T')[0],
        horaRecebimento: new Date().toTimeString().split(' ')[0].substring(0, 5),
        foto: "",
        fotoFile: null
      });
      fetchEncomendas();
      const errorMsg = error.response?.data?.error || error.message || "Erro desconhecido";
      console.error(error);
      alert(`Erro ao cadastrar encomenda: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const openFotoModal = (foto) => setModalFoto(foto);
  const closeFotoModal = () => setModalFoto(null);

  const openEditarModal = (encomenda) => {
    setModalEditar(encomenda);
    setEditFormData({
      nome: encomenda.nome,
      unidade: encomenda.unidade,
      documento: encomenda.documento,
      pagina: encomenda.pagina,
      dataRecebimento: encomenda.data_recebimento,
      horaRecebimento: encomenda.hora_recebimento || "", // Fallback
    });
  };

  const closeEditarModal = () => setModalEditar(null);

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditFormData({ ...editFormData, foto: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/encomendas/${modalEditar.id}`, editFormData);
      toast.success("Encomenda atualizada!");
      closeEditarModal();
      fetchEncomendas();
    } catch (error) {
      toast.error("Erro ao atualizar encomenda");
      console.error(error);
    }
  };

  const openRetiradaModal = (encomenda) => {
    setModalRetirada(encomenda);
    setNomeRetirada("");
  };

  const closeRetiradaModal = () => setModalRetirada(null);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    // Scale coordinates based on buffer vs visual size
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = getCoordinates(e);
    const ctx = canvas.getContext("2d");

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#ffffff";

    lastPointRef.current = { x, y };
    setIsDrawing(true);
    if (e.touches) e.preventDefault();
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = getCoordinates(e);
    const ctx = canvas.getContext("2d");
    const lastPoint = lastPointRef.current;

    if (lastPoint) {
      const midPoint = { x: (lastPoint.x + x) / 2, y: (lastPoint.y + y) / 2 };
      ctx.quadraticCurveTo(lastPoint.x, lastPoint.y, midPoint.x, midPoint.y);
      ctx.stroke();
    }

    lastPointRef.current = { x, y };
    if (e.touches) e.preventDefault();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const confirmarRetirada = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const assinaturaData = reader.result;
        try {
          await api.post(`/encomendas/${modalRetirada.id}/retirada`, {
            nome_retirada: nomeRetirada,
            assinatura: assinaturaData,
          });
          toast.success("Retirada confirmada!");
          closeRetiradaModal();
          fetchEncomendas();
        } catch (error) {
          toast.error("Erro ao confirmar retirada");
          console.error(error);
        }
      };
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
              <label>Assinatura Digital:</label>
              <div className="canvas-wrapper">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={400}
                  className="assinatura-canvas"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>
              <button type="button" className="limpar-btn" onClick={clearCanvas}>
                🧹 Limpar Assinatura
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
      <div className="tab-content" key={activeTab}>
        {activeTab === "cadastro" && (
          <form className="cadastro-form" onSubmit={handleSubmit} noValidate>
            <h2><PackageIcon className="section-icon" style={{ width: 22, height: 22 }} /> Cadastro de Encomendas</h2>

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
                readOnly
                className="readonly-input"
              />
            </div>

            <div className="form-group">
              <label>Hora de Recebimento:</label>
              <input
                type="text"
                name="horaRecebimento"
                value={formData.horaRecebimento}
                readOnly
                className="readonly-input"
              />
            </div>

            <div className="form-group full-width photo-selection-group">
              <label>Foto da Encomenda:</label>

              <div className="photo-buttons-container">
                <button
                  type="button"
                  className="photo-action-btn camera-btn"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  📸 Tirar Foto
                </button>
                <button
                  type="button"
                  className="photo-action-btn gallery-btn"
                  onClick={() => galleryInputRef.current?.click()}
                >
                  🖼️ Escolher Foto
                </button>
              </div>

              {/* Inputs Ocultos */}
              <input
                type="file"
                ref={cameraInputRef}
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={handleFotoChange}
              />
              <input
                type="file"
                ref={galleryInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFotoChange}
              />

              {/* Preview da Foto */}
              {formData.foto && (
                <div className="photo-preview-container">
                  <img src={formData.foto} alt="Preview" className="photo-preview-img" />
                  <button
                    type="button"
                    className="remove-photo-btn"
                    onClick={() => setFormData({ ...formData, foto: "", fotoFile: null })}
                  >
                    ✕ Remover
                  </button>
                </div>
              )}
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Cadastrando..." : "Cadastrar Encomenda"}
            </button>
          </form>
        )}

        {activeTab === "visualizacao" && (
          <div className="visualizacao">
            <h2><BoxIcon className="section-icon" style={{ width: 22, height: 22 }} /> Visualização de Encomendas</h2>
            {fetchLoading ? (
              <div className="loading-container" style={{ textAlign: 'center', padding: '40px' }}>
                <p>Carregando encomendas...</p>
              </div>
            ) : encomendas.length === 0 ? (
              <p>Nenhuma encomenda cadastrada ainda.</p>
            ) : (
              <div className="responsive-table-container">
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
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
