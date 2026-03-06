// v2.0.0 - Modal Standardization + Admin Delete + Date/Time Checkbox: 2026-03-06
import React, { useState, useEffect, useRef, useMemo } from "react";
import api from "../services/api";
import { toast } from "sonner";
import { formatDate, formatDateTime, formatTime } from "../utils/formatters";
import "./Encomendas.css";

// Ícones SVG inline
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

const ImageIcon = ({ style }) => (
  <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <polyline points="21 15 16 10 5 21" />
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

const BoxIcon = PackageIcon;

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
  const [isViewingSignature, setIsViewingSignature] = useState(false);
  const [temLivroRegistro, setTemLivroRegistro] = useState(false);
  const [modalWebcam, setModalWebcam] = useState(false);
  const [modalEditar, setModalEditar] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [modalRetirada, setModalRetirada] = useState(null);
  const [nomeRetirada, setNomeRetirada] = useState("");
  const [modalFiltro, setModalFiltro] = useState(false);
  const [filtros, setFiltros] = useState({
    nome: "",
    unidade: "",
    documento: "",
    status: "todos", // todos, pendentes, retirados
    dataInicio: "",
    dataFim: ""
  });
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSignatureZoomed, setIsSignatureZoomed] = useState(false);
  const [storedSignature, setStoredSignature] = useState(null);
  const [isEditDataHora, setIsEditDataHora] = useState(false);
  const isEditDataHoraRef = useRef(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Checar se o usuário logado é admin
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = userData.is_admin === true;

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchEncomendas();

    // Relógio em Tempo Real (Hora Local Brasil)
    const timer = setInterval(() => {
      const agora = new Date();

      const an = agora.getFullYear();
      const ms = String(agora.getMonth() + 1).padStart(2, '0');
      const di = String(agora.getDate()).padStart(2, '0');
      const dataLocal = `${an}-${ms}-${di}`;

      const horaLocal = agora.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      setFormData(prev => {
        if (isEditDataHoraRef.current) return prev;
        return {
          ...prev,
          dataRecebimento: dataLocal,
          horaRecebimento: horaLocal
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchEncomendas = async () => {
    setFetchLoading(true);
    try {
      const response = await api.get("/encomendas");
      const data = response.data.encomendas || [];
      setEncomendas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro na API:", error);
      toast.error("Erro ao carregar encomendas");
      setEncomendas([]);
    } finally {
      setFetchLoading(false);
    }
  };

  const clearFiltros = () => {
    setFiltros({
      nome: "",
      unidade: "",
      documento: "",
      status: "todos",
      dataInicio: "",
      dataFim: ""
    });
  };

  const encomendasFiltradas = useMemo(() => {
    return encomendas.filter(e => {
      const matchNome = !filtros.nome || e.nome.toLowerCase().includes(filtros.nome.toLowerCase());
      const matchUnidade = !filtros.unidade || e.unidade.toLowerCase().includes(filtros.unidade.toLowerCase());
      const matchDoc = !filtros.documento || e.documento.toLowerCase().includes(filtros.documento.toLowerCase());

      let matchStatus = true;
      if (filtros.status === "pendentes") matchStatus = !e.retirado;
      else if (filtros.status === "retirados") matchStatus = e.retirado;

      let matchData = true;
      if (filtros.dataInicio) matchData = matchData && e.data_recebimento >= filtros.dataInicio;
      if (filtros.dataFim) matchData = matchData && e.data_recebimento <= filtros.dataFim;

      return matchNome && matchUnidade && matchDoc && matchStatus && matchData;
    });
  }, [encomendas, filtros]);

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
          fotoFile: file
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditDataHoraToggle = (e) => {
    const checked = e.target.checked;
    setIsEditDataHora(checked);
    isEditDataHoraRef.current = checked;
  };

  // Funções de Webcam
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
    } catch (err) {
      console.error("Erro ao acessar a câmera: ", err);
      toast.error("Não foi possível acessar a câmera do dispositivo.");
      setModalWebcam(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");

      fetch(dataUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "webcam_photo.jpg", { type: "image/jpeg" });
          setFormData({
            ...formData,
            foto: dataUrl,
            fotoFile: file
          });
          closeWebcamModal();
        });
    }
  };

  const openWebcamModal = () => {
    const isTouchDevice = window.matchMedia("(any-pointer: coarse)").matches;
    if (isTouchDevice) {
      cameraInputRef.current?.click();
    } else {
      setModalWebcam(true);
      startCamera();
    }
  };

  const closeWebcamModal = () => {
    stopCamera();
    setModalWebcam(false);
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

      if (formData.fotoFile) {
        submitData.append("foto", formData.fotoFile);
      }

      await api.post("/encomendas", submitData);
      toast.success("Encomenda cadastrada com sucesso!");
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
      setTemLivroRegistro(false);
      setIsEditDataHora(false);
      isEditDataHoraRef.current = false;
      fetchEncomendas();
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || "Erro desconhecido";
      console.error(error);
      toast.error(`Erro ao cadastrar encomenda: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const openFotoModal = (fotoUrl, isSignature = false) => {
    setModalFoto(fotoUrl);
    setIsViewingSignature(isSignature);
  };
  const closeFotoModal = () => {
    setModalFoto(null);
    setIsViewingSignature(false);
  };

  const openEditarModal = (encomenda) => {
    setModalEditar(encomenda);
    setEditFormData({
      nome: encomenda.nome,
      unidade: encomenda.unidade,
      documento: encomenda.documento,
      pagina: encomenda.pagina,
      dataRecebimento: encomenda.data_recebimento,
      horaRecebimento: encomenda.hora_recebimento || "",
    });
  };

  const closeEditarModal = () => setModalEditar(null);

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditFormData({
        ...editFormData,
        fotoFile: file,
        fotoPreview: URL.createObjectURL(file)
      });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("nome", editFormData.nome);
      data.append("unidade", editFormData.unidade);
      data.append("documento", editFormData.documento);
      data.append("pagina", editFormData.pagina || "");
      data.append("dataRecebimento", editFormData.dataRecebimento);
      data.append("horaRecebimento", editFormData.horaRecebimento);

      if (editFormData.fotoFile) {
        data.append("foto", editFormData.fotoFile);
      }

      await api.put(`/encomendas/${modalEditar.id}`, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Encomenda atualizada!");
      closeEditarModal();
      fetchEncomendas();
    } catch (error) {
      toast.error("Erro ao atualizar encomenda");
      console.error(error);
    }
  };

  const handleDeletar = async (id) => {
    if (!window.confirm("ATENÇÃO: Deseja realmente excluir esta encomenda? Esta ação não pode ser desfeita.")) {
      return;
    }
    try {
      await api.delete(`/encomendas/${id}`);
      toast.success("Encomenda excluída com sucesso!");
      fetchEncomendas();
    } catch (error) {
      toast.error("Erro ao excluir encomenda");
      console.error(error);
    }
  };

  const openRetiradaModal = (encomenda) => {
    setModalRetirada(encomenda);
    setNomeRetirada("");
    setStoredSignature(null);
  };

  const closeRetiradaModal = () => {
    setModalRetirada(null);
    setStoredSignature(null);
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const startDraw = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#000000";
    ctx.shadowBlur = 1;
    ctx.shadowColor = "#000000";
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

  const stopDraw = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setStoredSignature(null);
  };

  const handleConcluirZoom = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const signatureData = canvas.toDataURL("image/png");
      setStoredSignature(signatureData);
      setIsSignatureZoomed(false);
    } else {
      setIsSignatureZoomed(false);
    }
  };

  const confirmarRetirada = async () => {
    if (!storedSignature) {
      toast.error("A assinatura é obrigatória");
      return;
    }
    if (!nomeRetirada) {
      toast.error("O nome de quem retira é obrigatório");
      return;
    }
    try {
      await api.post(`/encomendas/${modalRetirada.id}/retirada`, {
        nome_retirada: nomeRetirada,
        assinatura: storedSignature,
      });
      toast.success("Retirada confirmada!");
      closeRetiradaModal();
      fetchEncomendas();
    } catch (error) {
      toast.error("Erro ao confirmar retirada");
      console.error(error);
    }
  };

  return (
    <div className="encomendas-container">

      {/* ═══════════════════════════════════════════
          MODAL — VISUALIZAR FOTO / ASSINATURA
      ═══════════════════════════════════════════ */}
      {modalFoto && (
        <div className="global-modal-overlay" onClick={closeFotoModal}>
          <div
            className={`global-modal enc-foto-modal-inner ${isViewingSignature ? 'is-signature-modal' : 'is-photo-modal'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="global-modal-close" onClick={closeFotoModal}>✕</button>

            {isViewingSignature ? (
              <>
                <div className="modal-header">
                  <span className="modal-header-icon">✍️</span>
                  <h3>Assinatura do Morador</h3>
                </div>
                <div className="modal-signature-view">
                  <img src={modalFoto} alt="Assinatura" className="signature-img-zoom" />
                </div>
              </>
            ) : (
              <>
                <div className="modal-header">
                  <span className="modal-header-icon">📦</span>
                  <h3>Foto da Encomenda</h3>
                </div>
                <div className="modal-photo-view">
                  <img src={modalFoto} alt="Foto da encomenda" />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          MODAL — EDITAR ENCOMENDA
      ═══════════════════════════════════════════ */}
      {modalEditar && (
        <div className="global-modal-overlay" onClick={closeEditarModal}>
          <div className="global-modal enc-modal-wide" onClick={(e) => e.stopPropagation()}>
            <button className="global-modal-close" onClick={closeEditarModal}>✕</button>

            <div className="modal-header">
              <span className="modal-header-icon">✏️</span>
              <h3>Editar Encomenda</h3>
            </div>
            <div className="modal-badge">#{modalEditar.id} — {modalEditar.nome}</div>

            <form onSubmit={handleEditSubmit} className="modal-form">
              <div className="modal-form-row">
                <div className="modal-field">
                  <label className="modal-label">Nome do Destinatário</label>
                  <input
                    type="text"
                    name="nome"
                    value={editFormData.nome}
                    onChange={handleEditChange}
                    className="modal-input"
                    placeholder="Nome completo"
                    required
                  />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Unidade</label>
                  <input
                    type="text"
                    name="unidade"
                    value={editFormData.unidade}
                    onChange={handleEditChange}
                    className="modal-input"
                    placeholder="Ex: 101"
                    required
                  />
                </div>
              </div>

              <div className="modal-field">
                <label className="modal-label">Código de Rastreamento</label>
                <input
                  type="text"
                  name="documento"
                  value={editFormData.documento}
                  onChange={handleEditChange}
                  className="modal-input"
                  placeholder="Código de rastreamento"
                  required
                />
              </div>

              <div className="modal-field">
                <label className="custom-checkbox-wrapper">
                  <input
                    type="checkbox"
                    className="custom-checkbox-input"
                    checked={editFormData.pagina ? true : false}
                    onChange={(e) => {
                      if (!e.target.checked) setEditFormData({ ...editFormData, pagina: "" });
                      else setEditFormData({ ...editFormData, pagina: "1" });
                    }}
                  />
                  <span className="custom-checkbox-box"></span>
                  <span className="custom-checkbox-text">Tem livro de registro?</span>
                </label>
              </div>

              {editFormData.pagina !== undefined && editFormData.pagina !== "" && editFormData.pagina !== null && (
                <div className="modal-field slide-down">
                  <label className="modal-label">Página</label>
                  <input
                    type="text"
                    name="pagina"
                    value={editFormData.pagina}
                    onChange={handleEditChange}
                    className="modal-input"
                    placeholder="Número da página"
                  />
                </div>
              )}

              <div className="modal-divider">
                <ClockIcon style={{ width: 14, height: 14 }} />
                <span>Data e Hora de Recebimento</span>
              </div>

              <div className="modal-form-row">
                <div className="modal-field">
                  <label className="modal-label">Data</label>
                  <input
                    type="date"
                    name="dataRecebimento"
                    value={editFormData.dataRecebimento}
                    onChange={handleEditChange}
                    className="modal-input"
                    required
                  />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Hora</label>
                  <input
                    type="time"
                    name="horaRecebimento"
                    value={editFormData.horaRecebimento}
                    onChange={handleEditChange}
                    className="modal-input"
                    required
                  />
                </div>
              </div>

              <div className="modal-field">
                <label className="modal-label">Nova Foto <span className="modal-label-optional">(opcional)</span></label>
                <div className="edit-photo-selection">
                  {editFormData.fotoPreview && (
                    <div className="modal-photo-preview-small">
                      <img src={editFormData.fotoPreview} alt="Preview" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditFotoChange}
                    className="modal-file-input"
                  />
                </div>
              </div>

              <button type="submit" className="modal-btn modal-btn-primary">
                <CheckIcon style={{ width: 16, height: 16 }} />
                Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          MODAL — CONFIRMAR RETIRADA
      ═══════════════════════════════════════════ */}
      {modalRetirada && (
        <div className="global-modal-overlay" onClick={closeRetiradaModal}>
          <div className="global-modal" onClick={(e) => e.stopPropagation()}>
            <button className="global-modal-close" onClick={closeRetiradaModal}>✕</button>

            <div className="modal-header">
              <span className="modal-header-icon">📬</span>
              <h3>Confirmar Retirada</h3>
            </div>
            <div className="modal-badge">#{modalRetirada.id} — {modalRetirada.nome}</div>

            <div className="modal-field" style={{ marginTop: '20px' }}>
              <label className="modal-label">Assinatura Digital</label>
              <div className="signature-status-container">
                {storedSignature ? (
                  <div className="signature-preview-signed" onClick={() => setIsSignatureZoomed(true)}>
                    <img src={storedSignature} alt="Assinatura" />
                    <span className="change-sig-hint">Clique para alterar</span>
                  </div>
                ) : (
                  <button type="button" className="zoom-btn-large" onClick={() => setIsSignatureZoomed(true)}>
                    ✍️ CLIQUE AQUI PARA ASSINAR
                  </button>
                )}
              </div>
            </div>

            <div className="modal-field" style={{ marginTop: '20px' }}>
              <label className="modal-label">Nome de quem está retirando</label>
              <input
                type="text"
                value={nomeRetirada}
                onChange={(e) => setNomeRetirada(e.target.value)}
                placeholder="Digite o nome completo"
                className="modal-input"
              />
            </div>

            <button type="button" className="modal-btn modal-btn-success" style={{ marginTop: '24px' }} onClick={confirmarRetirada}>
              <CheckIcon style={{ width: 16, height: 16 }} />
              Confirmar Retirada
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          MODAL — ASSINATURA TELA CHEIA
      ═══════════════════════════════════════════ */}
      {isSignatureZoomed && (
        <div className="signature-zoom-overlay">
          <div className="orientation-warning">
            <div className="warning-content">
              <span className="warning-icon">🔄</span>
              <h3>Gire o celular para assinar</h3>
              <p>O modo de assinatura exige a tela na horizontal</p>
            </div>
          </div>

          <div className="signature-zoom-fullscreen">
            <canvas
              ref={canvasRef}
              width={windowSize.width}
              height={windowSize.height}
              className="assinatura-canvas zoomed-full"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
            />

            <div className="zoom-floating-actions">
              <button className="float-btn clear" onClick={clearCanvas} title="Limpar">
                🗑️ <span className="pc-only-text">Limpar</span>
              </button>
              <button className="float-btn close" onClick={() => setIsSignatureZoomed(false)} title="Cancelar">
                ✕ <span className="pc-only-text">Sair sem Salvar</span>
              </button>
              <button className="float-btn save" onClick={handleConcluirZoom} title="Confirmar">
                ✅ <span className="pc-only-text">Confirmar Assinatura</span>
                <span className="mobile-only-text">Concluído</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          MODAL — WEBCAM
      ═══════════════════════════════════════════ */}
      {modalWebcam && (
        <div className="global-modal-overlay" onClick={closeWebcamModal}>
          <div className="global-modal enc-modal-wide" onClick={(e) => e.stopPropagation()}>
            <button className="global-modal-close" onClick={closeWebcamModal}>✕</button>

            <div className="modal-header">
              <span className="modal-header-icon">📸</span>
              <h3>Tirar Foto (Webcam)</h3>
            </div>

            <div className="webcam-container" style={{ marginTop: '20px' }}>
              <video ref={videoRef} autoPlay playsInline muted className="webcam-video" />
            </div>

            <button type="button" className="modal-btn modal-btn-primary" style={{ marginTop: '20px' }} onClick={capturePhoto}>
              📸 Capturar Imagem
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          TABS NAVIGATION
      ═══════════════════════════════════════════ */}
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

      {/* ═══════════════════════════════════════════
          TAB CONTENT
      ═══════════════════════════════════════════ */}
      <div className="tab-content" key={activeTab}>

        {/* ─── ABA: CADASTRO ─── */}
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

            {/* Livro de registro */}
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label className="custom-checkbox-wrapper">
                <input
                  type="checkbox"
                  className="custom-checkbox-input"
                  checked={temLivroRegistro}
                  onChange={(e) => {
                    setTemLivroRegistro(e.target.checked);
                    if (!e.target.checked) setFormData({ ...formData, pagina: "" });
                  }}
                />
                <span className="custom-checkbox-box"></span>
                <span className="custom-checkbox-text">Tem livro de registro?</span>
              </label>
            </div>

            {temLivroRegistro && (
              <div className="form-group slide-down">
                <label>Página:</label>
                <input
                  type="text"
                  name="pagina"
                  value={formData.pagina}
                  onChange={handleChange}
                  placeholder="Ex: 12"
                  autoFocus
                />
              </div>
            )}

            {/* ── Checkbox: editar data/hora ── */}
            <div className="form-group datetime-edit-toggle">
              <label className="custom-checkbox-wrapper">
                <input
                  type="checkbox"
                  className="custom-checkbox-input"
                  checked={isEditDataHora}
                  onChange={handleEditDataHoraToggle}
                />
                <span className="custom-checkbox-box"></span>
                <span className="custom-checkbox-text">Deseja editar o horário e a data?</span>
              </label>
              {!isEditDataHora && (
                <p className="datetime-auto-hint">
                  <ClockIcon style={{ width: 12, height: 12, display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                  Preenchido automaticamente pelo relógio do sistema
                </p>
              )}
            </div>

            {/* Data de Recebimento */}
            <div className="form-group">
              <label>Data de Recebimento:</label>
              <input
                type="date"
                name="dataRecebimento"
                value={formData.dataRecebimento}
                onChange={handleChange}
                readOnly={!isEditDataHora}
                className={!isEditDataHora ? "readonly-input" : ""}
              />
            </div>

            {/* Hora de Recebimento */}
            <div className="form-group">
              <label>Hora de Recebimento:</label>
              <input
                type="text"
                name="horaRecebimento"
                value={formData.horaRecebimento}
                onChange={handleChange}
                readOnly={!isEditDataHora}
                className={!isEditDataHora ? "readonly-input" : ""}
              />
            </div>

            {/* Foto */}
            <div className="form-group full-width photo-selection-group">
              <label>Foto da Encomenda:</label>

              <div className="photo-buttons-container">
                <button
                  type="button"
                  className="photo-action-btn camera-btn"
                  onClick={openWebcamModal}
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

        {/* ─── ABA: VISUALIZAÇÃO ─── */}
        {activeTab === "visualizacao" && (
          <div className="visualizacao">
            <div className="visualizacao-header">
              <h2><BoxIcon className="section-icon" style={{ width: 22, height: 22 }} /> Visualização de Encomendas</h2>
            </div>

            <div className="filter-standard-bar">
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
                    {encomendasFiltradas.map((e) => (
                      <tr key={e.id}>
                        <td>{e.id}</td>
                        <td>{e.nome}</td>
                        <td>{e.unidade}</td>
                        <td>{e.documento}</td>
                        <td>{e.pagina}</td>
                        <td>{formatDate(e.data_recebimento)} {formatTime(e.hora_recebimento)}</td>
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
                            "—"
                          )}
                        </td>
                        <td>
                          {e.retirado ? (
                            <span className="status-retirado">✓ Retirado</span>
                          ) : (
                            <span className="status-aguardando">⏳ Aguardando</span>
                          )}
                        </td>
                        <td>
                          {e.retirado ? (
                            <div className="retirada-info-cell">
                              <span>{e.nome_retirada}</span>
                              <span>{formatDate(e.data_retirada)} {formatTime(e.hora_retirada)}</span>
                              {e.assinatura && (
                                <button
                                  type="button"
                                  className="admin-btn-small ver-btn"
                                  onClick={() => openFotoModal(e.assinatura, true)}
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
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <button
                              type="button"
                              className="admin-btn-small edit-btn"
                              onClick={() => openEditarModal(e)}
                              data-tooltip="Editar"
                            >
                              <PencilIcon style={{ width: 14, height: 14 }} />
                            </button>

                            {isAdmin && (
                              <button
                                type="button"
                                className="admin-btn-small delete-btn"
                                onClick={() => handleDeletar(e.id)}
                                data-tooltip="Excluir (Admin)"
                              >
                                <TrashIcon style={{ width: 14, height: 14 }} />
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
          </div>
        )}
      </div>
      {/* ═══════════════════════════════════════════
          MODAL — FILTRO
      ═══════════════════════════════════════════ */}
      {modalFiltro && (
        <div className="global-modal-overlay" onClick={() => setModalFiltro(false)}>
          <div className="global-modal" onClick={(e) => e.stopPropagation()}>
            <button className="global-modal-close" onClick={() => setModalFiltro(false)}>✕</button>
            <div className="modal-header">
              <FilterIcon style={{ width: 20, height: 20, marginRight: '10px' }} />
              <h3>Filtrar Encomendas</h3>
            </div>

            <div className="modal-form">
              <div className="modal-form-row">
                <div className="modal-field">
                  <label className="modal-label">Nome do Destinatário</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={filtros.nome}
                    onChange={(e) => setFiltros({ ...filtros, nome: e.target.value })}
                    placeholder="Filtrar por nome..."
                  />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Unidade</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={filtros.unidade}
                    onChange={(e) => setFiltros({ ...filtros, unidade: e.target.value })}
                    placeholder="Ex: 101"
                  />
                </div>
              </div>

              <div className="modal-field">
                <label className="modal-label">Status</label>
                <select
                  className="modal-input"
                  value={filtros.status}
                  onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                >
                  <option value="todos">Todos</option>
                  <option value="pendentes">Pendentes (Aguardando Retirada)</option>
                  <option value="retirados">Retirados</option>
                </select>
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
