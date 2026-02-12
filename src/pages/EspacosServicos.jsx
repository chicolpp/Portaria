import { useEffect, useState, useMemo, useRef } from "react";
import api from "../services/api";
import { toast } from "sonner";
import "./EspacosServicos.css";

// --- ÍCONES (Simple SVGs) ---
const KeyIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" stroke="currentColor" strokeWidth="2" />
    <path d="M12 12l7-7 3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const ToolboxIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M10 7V5h4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M3 12h18" stroke="currentColor" strokeWidth="2" />
  </svg>
);
const CalendarIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M16 3v4M8 3v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const PencilIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);
const TrashIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export default function EspacosServicos() {


  // --- ESTADOS GLOBAIS ---
  const [activeTab, setActiveTab] = useState("chaves");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Verificação de Admin
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.is_admin;

  // --- DADOS ---
  const [chaves, setChaves] = useState([]);
  const [itens, setItens] = useState([]);
  const [reservas, setReservas] = useState([]);

  // --- MODAIS ---
  const [modalChaveOpen, setModalChaveOpen] = useState(false);
  const [selectedChave, setSelectedChave] = useState(null);

  // Canvas Ref
  const canvasRef = useRef(null);
  const lastPointRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const [modalItemOpen, setModalItemOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Estados para Histórico e Edição
  const [modalHistorico, setModalHistorico] = useState(null);
  const [historicoData, setHistoricoData] = useState([]);
  const [assinaturaVer, setAssinaturaVer] = useState(null);

  // --- FORMS ---
  // Form para Criar Nova Chave
  const [novaChave, setNovaChave] = useState({ area_nome: "" });

  // Form para Criar Novo Item
  const [novoItem, setNovoItem] = useState({ nome: "" });

  // Form para Retirar Chave
  const [retiradaChaveForm, setRetiradaChaveForm] = useState({ nome: "", unidade: "" });

  // Form para Retirar Item
  const [retiradaItemForm, setRetiradaItemForm] = useState({ nome_morador: "", apartamento: "", bloco: "" });

  // Link Item à Chave
  const [temItemEntrega, setTemItemEntrega] = useState(false);
  const [itemSearchQuery, setItemSearchQuery] = useState("");
  const [itensSelecionados, setItensSelecionados] = useState([]);

  // Modais de Edição (Custom)
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [editType, setEditType] = useState(""); // 'chave' ou 'item'
  const [editData, setEditData] = useState(null);
  const [editValue, setEditValue] = useState("");

  // Modais de Confirmação (Custom)
  const [modalConfirmOpen, setModalConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ title: "", text: "", onConfirm: null, type: "danger" });

  // --- FETCH DATA ---
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [resChaves, resItens, resReservas] = await Promise.all([
        api.get("/chaves"),
        api.get("/itens"),
        api.get("/reservas/hoje")
      ]);
      setChaves(resChaves.data.chaves || []);
      setItens(resItens.data.itens || []);
      setReservas(resReservas.data.reservas || []);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast.error("Erro ao carregar dados. Verifique a conexão.");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistorico = async (chaveId) => {
    try {
      const response = await api.get(`/chaves/${chaveId}/historico`);
      setHistoricoData(response.data.historico || []);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      toast.error("Erro ao carregar histórico.");
    }
  };

  const fetchHistoricoItem = async (itemId) => {
    try {
      const response = await api.get(`/itens/${itemId}/historico`);
      setHistoricoData(response.data.historico || []);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      toast.error("Erro ao carregar histórico.");
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // --- LOGICA CANVAS (Assinatura) ---
  const startDraw = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const dpr = window.devicePixelRatio || 1;
    const ctx = canvas.getContext("2d");

    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
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

    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;
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
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // --- AÇÕES: CHAVES ---

  const handleCriarChave = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error("Apenas administradores podem criar chaves.");
      return;
    }
    if (!novaChave.area_nome) {
      toast.warning("Preencha todos os campos da chave.");
      return;
    }

    try {
      await api.post("/chaves", novaChave);
      toast.success("Chave cadastrada com sucesso!");
      setNovaChave({ area_nome: "" });
      fetchAll();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao cadastrar chave.");
    }
  };

  const openRetirarChave = (chave) => {
    setSelectedChave(chave);
    setRetiradaChaveForm({ nome: "", unidade: "" });
    setTemItemEntrega(false);
    setItemSearchQuery("");
    setItensSelecionados([]);
    setModalChaveOpen(true);
    // Timeout para garantir que o modal renderize antes de limpar o canvas
    setTimeout(() => clearCanvas(), 100);
  };

  const handleConfirmarRetiradaChave = async () => {
    if (!selectedChave || !retiradaChaveForm.nome.trim() || !retiradaChaveForm.unidade.trim()) {
      toast.warning("Informe o nome e a unidade.");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("retirado_por", retiradaChaveForm.nome);
      formData.append("unidade", retiradaChaveForm.unidade);
      if (blob) {
        formData.append("assinatura", blob, "assinatura.png");
      }

      try {
        // 1. Retirar Chave
        const keyFormData = new FormData();
        keyFormData.append("retirado_por", retiradaChaveForm.nome);
        keyFormData.append("unidade", retiradaChaveForm.unidade);
        if (blob) {
          keyFormData.append("assinatura", blob, "assinatura.png");
        }

        // Adicionar todos os item_ids
        itensSelecionados.forEach(it => {
          keyFormData.append("item_id", it.id);
        });

        await api.post(`/chaves/${selectedChave.id}/retirar`, keyFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        // 2. Retirar cada item separadamente (para o modelo ItemPortaria)
        for (const it of itensSelecionados) {
          const itemFormData = new FormData();
          itemFormData.append("nome_morador", retiradaChaveForm.nome);
          itemFormData.append("apartamento", retiradaChaveForm.unidade);
          itemFormData.append("bloco", "");
          if (blob) {
            itemFormData.append("assinatura", blob, "assinatura_item.png");
          }

          await api.post(`/itens/${it.id}/retirar`, itemFormData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }

        toast.success(`Chave ${temItemEntrega ? 'e Item ' : ''}retirada(s) com sucesso!`);
        setModalChaveOpen(false);
        fetchAll();
      } catch (error) {
        console.error(error);
        toast.error("Erro ao registrar retirada.");
      }
    }, "image/png");
  };

  const handleDevolverChave = (chave) => {
    setConfirmConfig({
      title: "Confirmar Devolução",
      text: `Deseja registrar a devolução da chave: ${chave.area_nome}?`,
      type: "success",
      onConfirm: async () => {
        try {
          await api.post(`/chaves/${chave.id}/devolver`);
          toast.success("Chave devolvida com sucesso!");
          fetchAll();
        } catch (error) {
          console.error(error);
          toast.error("Erro ao devolver chave.");
        }
      }
    });
    setModalConfirmOpen(true);
  };

  const handleDeletarChave = (chave) => {
    if (!isAdmin) {
      toast.error("Ação permitida apenas para administradores.");
      return;
    }
    setConfirmConfig({
      title: "Excluir Chave",
      text: `Tem certeza que deseja excluir permanentemente a chave "${chave.area_nome}"? Esta ação não pode ser desfeita.`,
      type: "danger",
      onConfirm: async () => {
        try {
          await api.delete(`/chaves/${chave.id}`);
          toast.success("Chave excluída com sucesso.");
          fetchAll();
        } catch (error) {
          console.error(error);
          toast.error("Erro ao excluir chave.");
        }
      }
    });
    setModalConfirmOpen(true);
  };

  const handleEditarChave = (chave) => {
    if (!isAdmin) {
      toast.error("Ação permitida apenas para administradores.");
      return;
    }
    setEditType("chave");
    setEditData(chave);
    setEditValue(chave.area_nome);
    setModalEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editData || !editValue) return;

    try {
      if (editType === "chave") {
        await api.put(`/chaves/${editData.id}`, { area_nome: editValue });
        toast.success("Chave atualizada com sucesso.");
      } else if (editType === "item") {
        await api.put(`/itens/${editData.id}`, { nome: editValue });
        toast.success("Item atualizado com sucesso.");
      }
      setModalEditOpen(false);
      fetchAll();
    } catch (error) {
      console.error(error);
      toast.error(`Erro ao atualizar ${editType === 'chave' ? 'chave' : 'item'}.`);
    }
  };

  // --- AÇÕES: ITENS ---

  const handleCriarItem = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error("Apenas administradores podem criar itens.");
      return;
    }
    if (!novoItem.nome) {
      toast.warning("Informe o nome do item.");
      return;
    }

    try {
      await api.post("/itens", { nome: novoItem.nome, tipo: "Geral" });
      toast.success("Item cadastrado com sucesso!");
      setNovoItem({ nome: "" });
      fetchAll();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao cadastrar item.");
    }
  };

  const openRetirarItem = (item) => {
    setSelectedItem(item);
    setRetiradaItemForm({ nome_morador: "", apartamento: "", bloco: "" });
    setModalItemOpen(true);
    // Timeout para garantir que o modal renderize antes de limpar o canvas
    setTimeout(() => clearCanvas(), 100);
  };

  const handleConfirmarRetiradaItem = async () => {
    const { nome_morador, apartamento, bloco } = retiradaItemForm;
    if (!selectedItem || !nome_morador || !apartamento || !bloco) {
      toast.warning("Preencha todos os campos (Nome, Apto, Bloco).");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("nome_morador", nome_morador);
      formData.append("apartamento", apartamento);
      formData.append("bloco", bloco);
      if (blob) {
        formData.append("assinatura", blob, "assinatura_item.png");
      }

      try {
        await api.post(`/itens/${selectedItem.id}/retirar`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success(`Item retirado por ${nome_morador}`);
        setModalItemOpen(false);
        fetchAll();
      } catch (error) {
        console.error(error);
        toast.error("Erro ao registrar retirada de item.");
      }
    }, "image/png");
  };

  const handleDevolverItem = (item) => {
    setConfirmConfig({
      title: "Confirmar Devolução",
      text: `Confirmar devolução do item: ${item.nome}?`,
      type: "success",
      onConfirm: async () => {
        try {
          await api.post(`/itens/${item.id}/devolver`);
          toast.success("Item devolvido com sucesso!");
          fetchAll();
        } catch (error) {
          console.error(error);
          toast.error("Erro ao devolver item.");
        }
      }
    });
    setModalConfirmOpen(true);
  };

  const handleDeletarItem = (item) => {
    if (!isAdmin) {
      toast.error("Ação permitida apenas para administradores.");
      return;
    }
    setConfirmConfig({
      title: "Excluir Item",
      text: `Tem certeza que deseja excluir o item "${item.nome}"?`,
      type: "danger",
      onConfirm: async () => {
        try {
          await api.delete(`/itens/${item.id}`);
          toast.success("Item excluído com sucesso.");
          fetchAll();
        } catch (error) {
          console.error(error);
          toast.error("Erro ao excluir item.");
        }
      }
    });
    setModalConfirmOpen(true);
  };

  const handleEditarItem = (item) => {
    if (!isAdmin) {
      toast.error("Ação permitida apenas para administradores.");
      return;
    }
    setEditType("item");
    setEditData(item);
    setEditValue(item.nome);
    setModalEditOpen(true);
  };

  // --- FILTROS ---
  const filteredChaves = useMemo(() => {
    const q = query.toLowerCase();
    return chaves.filter(c =>
      c.area_nome?.toLowerCase().includes(q) ||
      c.codigo?.toLowerCase().includes(q) ||
      c.setor?.toLowerCase().includes(q)
    );
  }, [chaves, query]);

  const filteredItens = useMemo(() => {
    const q = query.toLowerCase();
    return itens.filter(i =>
      i.nome?.toLowerCase().includes(q) ||
      i.tipo?.toLowerCase().includes(q)
    );
  }, [itens, query]);

  const availableItensForSearch = useMemo(() => {
    if (!itemSearchQuery) return [];
    const q = itemSearchQuery.toLowerCase();
    return itens.filter(i =>
      i.disponivel && i.nome?.toLowerCase().includes(q)
    );
  }, [itens, itemSearchQuery]);

  return (
    <div className="espacos-container">
      <div className="espacos-tabs">
        <button
          className={`espacos-tab-btn ${activeTab === "chaves" ? "active" : ""}`}
          onClick={() => setActiveTab("chaves")}
        >
          <KeyIcon className="section-icon" /> Registro e Visualização de Chaves
        </button>
        <button
          className={`espacos-tab-btn ${activeTab === "itens" ? "active" : ""}`}
          onClick={() => setActiveTab("itens")}
        >
          <ToolboxIcon className="section-icon" /> Gestão de Itens da Portaria
        </button>
        <button
          className={`espacos-tab-btn ${activeTab === "reservas" ? "active" : ""}`}
          onClick={() => setActiveTab("reservas")}
        >
          <CalendarIcon className="section-icon" /> Reservas de Hoje
        </button>
      </div>

      <div className="tab-content">

        {/* --- ABA CHAVES --- */}
        {activeTab === "chaves" && (
          <section className="espacos-section">
            <div className="section-title">
              <KeyIcon className="section-icon" />
              <h2>Controle de Chaves</h2>
            </div>

            {/* FORMULÁRIO APENAS PARA ADMINS */}
            {isAdmin && (
              <form className="chaves-form" onSubmit={handleCriarChave}>
                <input
                  type="text"
                  placeholder="Nome da Área"
                  value={novaChave.area_nome}
                  onChange={e => setNovaChave({ ...novaChave, area_nome: e.target.value })}
                />
                <button type="submit">Cadastrar Chave</button>
              </form>
            )}

            <div className="filter-container">
              <input
                className="search-input"
                placeholder="Filtrar chaves..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>

            <div className="cards-grid">
              {filteredChaves.map(chave => (
                <div key={chave.id} className={`card ${chave.na_portaria ? 'disponivel' : 'ocupada'}`}>
                  <div className="card-header">
                    <span className="card-title">{chave.area_nome}</span>
                    <div style={{ display: "flex", gap: "5px" }}>
                      <button
                        className="admin-btn-small"
                        title="Histórico"
                        aria-label="Ver Histórico"
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalHistorico(chave);
                          fetchHistorico(chave.id);
                        }}
                      >
                        ⌛
                      </button>
                      {isAdmin && (
                        <>
                          <button
                            className="admin-btn-small edit-btn"
                            aria-label="Editar Chave"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditarChave(chave);
                            }}
                            title="Editar"
                          >
                            <PencilIcon style={{ width: 14 }} />
                          </button>
                          <button
                            className="admin-btn-small delete-btn"
                            aria-label="Excluir Chave"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletarChave(chave);
                            }}
                            title="Excluir"
                          >
                            <TrashIcon style={{ width: 14 }} />
                          </button>
                        </>
                      )}
                      <span className={`status-badge ${chave.na_portaria ? "verde" : "vermelho"}`}>
                        {chave.na_portaria ? "Na Portaria" : "Retirada"}
                      </span>
                    </div>
                  </div>

                  <div className="card-body">
                    {!chave.na_portaria && (
                      <div className="retirada-info-completa">
                        <hr />
                        <p><strong>Morador:</strong> {chave.retirado_por}</p>
                        <p><strong>Unidade:</strong> {chave.unidade || "Não informado"}</p>
                        <p><strong>Data de Retirada:</strong> {chave.data_retirada ? new Date(chave.data_retirada).toLocaleString('pt-BR') : '-'}</p>
                        <p><strong>Data da Devolução:</strong> <span className="pendente">Pendente</span></p>

                        {chave.assinatura_url && (
                          <div className="assinatura-container">
                            <p><strong>Assinatura:</strong></p>
                            <img
                              src={chave.assinatura_url}
                              alt="Assinatura"
                              className="assinatura-img"
                              onClick={() => setAssinaturaVer(chave.assinatura_url)}
                              title="Clique para ampliar"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {chave.na_portaria && chave.data_devolucao && (
                      <div className="historico-ultimo">
                        <hr />
                        <small>Última devolução: {new Date(chave.data_devolucao).toLocaleString('pt-BR')}</small>
                      </div>
                    )}
                  </div>

                  <div className="card-actions">
                    {chave.na_portaria ? (
                      <button className="retirar-btn-large" onClick={() => openRetirarChave(chave)}>
                        REGISTRAR RETIRADA
                      </button>
                    ) : (
                      <button className="devolver-btn-large" onClick={() => handleDevolverChave(chave)}>
                        REGISTRAR DEVOLUÇÃO
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {filteredChaves.length === 0 && <p className="empty-msg">Nenhuma chave encontrada.</p>}
            </div>
          </section>
        )}

        {/* --- ABA ITENS --- */}
        {activeTab === "itens" && (
          <section className="espacos-section">
            <div className="section-title">
              <ToolboxIcon className="section-icon" />
              <h2>Gestão de Itens da Portaria</h2>
            </div>

            {/* FORMULÁRIO DE CADASTRO RÁPIDO (IGUAL CHAVES) */}
            {isAdmin && (
              <form className="chaves-form" onSubmit={handleCriarItem}>
                <input
                  type="text"
                  placeholder="Nome do Item (ex: Carrinho 1)"
                  value={novoItem.nome}
                  onChange={e => setNovoItem({ ...novoItem, nome: e.target.value })}
                />
                <button type="submit">Cadastrar Item</button>
              </form>
            )}

            <div className="filter-container">
              <input
                className="search-input"
                placeholder="Filtrar itens..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>

            <div className="cards-grid">
              {filteredItens.map(item => (
                <div key={item.id} className={`card ${item.disponivel ? 'disponivel' : 'ocupada'}`}>
                  <div className="card-header">
                    <span className="card-title">{item.nome}</span>
                    <div style={{ display: "flex", gap: "5px" }}>
                      <button
                        className="admin-btn-small"
                        title="Histórico"
                        aria-label="Ver Histórico do Item"
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalHistorico(item); // Reusando o mesmo estado
                          fetchHistoricoItem(item.id);
                        }}
                      >
                        ⌛
                      </button>
                      {isAdmin && (
                        <>
                          <button
                            className="admin-btn-small edit-btn"
                            aria-label="Editar Item"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditarItem(item);
                            }}
                            title="Editar"
                          >
                            <PencilIcon style={{ width: 14 }} />
                          </button>
                          <button
                            className="admin-btn-small delete-btn"
                            aria-label="Excluir Item"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletarItem(item);
                            }}
                            title="Excluir"
                          >
                            <TrashIcon style={{ width: 14 }} />
                          </button>
                        </>
                      )}
                      <span className={`status-badge ${item.disponivel ? 'verde' : 'vermelho'}`}>
                        {item.disponivel ? "Disponível" : "Retirado"}
                      </span>
                    </div>
                  </div>
                  <div className="card-body">
                    {!item.disponivel && (
                      <div className="retirada-info-completa">
                        <hr />
                        <p><strong>Com:</strong> {item.retirado_por}</p>
                        <p><strong>Apto:</strong> {item.apartamento} / <strong>Bloco:</strong> {item.bloco}</p>
                        <p><strong>Horário:</strong> {item.data_retirada ? new Date(item.data_retirada).toLocaleString('pt-BR') : '-'}</p>

                        {item.assinatura_url && (
                          <div className="assinatura-container">
                            <p><strong>Assinatura:</strong></p>
                            <img
                              src={item.assinatura_url}
                              alt="Assinatura"
                              className="assinatura-img"
                              onClick={() => setAssinaturaVer(item.assinatura_url)}
                              title="Clique para ampliar"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="card-actions">
                    {item.disponivel ? (
                      <button className="retirar-btn-large" onClick={() => openRetirarItem(item)}>REGISTRAR EMPRÉSTIMO</button>
                    ) : (
                      <button className="devolver-btn-large" onClick={() => handleDevolverItem(item)}>REGISTRAR DEVOLUÇÃO</button>
                    )}
                  </div>
                </div>
              ))}
              {filteredItens.length === 0 && <p className="empty-msg">Nenhum item encontrado.</p>}
            </div>
          </section>
        )}

        {/* --- ABA RESERVAS --- */}
        {activeTab === "reservas" && (
          <section className="espacos-section">
            <div className="section-title">
              <CalendarIcon className="section-icon" />
              <h2>Reservas de Hoje</h2>
            </div>

            <div className="reservas-list">
              {reservas.length === 0 ? (
                <p className="empty-msg">Nenhuma reserva agendada para hoje.</p>
              ) : (
                reservas.map(reserva => (
                  <div key={reserva.id} className="reserva-item">
                    <span className="reserva-espaco">{reserva.espaco}</span>
                    <span className="reserva-morador">{reserva.nome_morador}</span>
                    <span className="reserva-horario">{reserva.hora_inicio} - {reserva.hora_fim}</span>
                  </div>
                ))
              )}
            </div>
          </section>
        )}
      </div>

      {/* --- MODAL DE RETIRADA DE CHAVE --- */}
      {
        modalChaveOpen && (
          <div className="foto-modal-overlay" onClick={() => setModalChaveOpen(false)}>
            <div className="retirada-modal" onClick={e => e.stopPropagation()}>
              <button className="foto-modal-close" onClick={() => setModalChaveOpen(false)}>✕</button>
              <h3>Retirar Chave: {selectedChave?.area_nome}</h3>

              <div className="retirada-form-group">
                <label>Nome do Morador / Responsável:</label>
                <input
                  autoFocus
                  type="text"
                  value={retiradaChaveForm.nome}
                  onChange={e => setRetiradaChaveForm({ ...retiradaChaveForm, nome: e.target.value })}
                  placeholder="Ex: João Silva"
                />
              </div>

              <div className="retirada-form-group">
                <label>Número da Unidade:</label>
                <input
                  type="text"
                  value={retiradaChaveForm.unidade}
                  onChange={e => setRetiradaChaveForm({ ...retiradaChaveForm, unidade: e.target.value })}
                  placeholder="Ex: 101 Bloco A"
                />
              </div>

              {/* ITEM LINKAGE */}
              <div className="retirada-form-group checkbox-group">
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={temItemEntrega}
                    onChange={e => setTemItemEntrega(e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span>Tem a entrega de um item?</span>
                </label>
              </div>

              {temItemEntrega && (
                <div className="retirada-form-group item-search-wrapper">
                  <label>Pesquisar Item:</label>
                  <input
                    type="text"
                    value={itemSearchQuery}
                    onChange={e => setItemSearchQuery(e.target.value)}
                    placeholder="Digite o nome do item..."
                    className="item-search-input"
                  />

                  {itensSelecionados.length > 0 && (
                    <div className="itens-selecionados-container">
                      {itensSelecionados.map(it => (
                        <div key={it.id} className="item-selecionado-badge">
                          <span>{it.nome}</span>
                          <button onClick={() => setItensSelecionados(itensSelecionados.filter(x => x.id !== it.id))}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {availableItensForSearch.length > 0 && (
                    <ul className="item-search-results">
                      {availableItensForSearch
                        .filter(it => !itensSelecionados.find(x => x.id === it.id))
                        .map(item => (
                          <li key={item.id} onClick={() => {
                            setItensSelecionados([...itensSelecionados, item]);
                            setItemSearchQuery("");
                          }}>
                            {item.nome}
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="retirada-form-group">
                <label>Data de Retirada:</label>
                <input
                  type="text"
                  value={new Date().toLocaleString('pt-BR')}
                  disabled
                  style={{ background: '#334155', color: '#94a3b8' }}
                />
              </div>

              <div className="retirada-form-group">
                <label>Assinatura do Morador (Obrigatório):</label>
                <div className="canvas-wrapper">
                  <canvas
                    ref={canvasRef}
                    width={480}
                    height={200}
                    className="assinatura-canvas"
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={stopDraw}
                    onMouseLeave={stopDraw}
                    onTouchStart={startDraw}
                    onTouchMove={draw}
                    onTouchEnd={stopDraw}
                  />
                </div>
                <button type="button" className="limpar-btn" onClick={clearCanvas}>
                  Limpar Assinatura
                </button>
              </div>

              <button className="confirmar-retirada-btn-large" onClick={handleConfirmarRetiradaChave}>
                CONFIRMAR E SALVAR
              </button>
            </div>
          </div>
        )
      }

      {/* --- MODAL DE RETIRADA DE ITEM --- */}
      {
        modalItemOpen && (
          <div className="foto-modal-overlay" onClick={() => setModalItemOpen(false)}>
            <div className="retirada-modal" onClick={e => e.stopPropagation()}>
              <button className="foto-modal-close" onClick={() => setModalItemOpen(false)}>✕</button>
              <h3>Emprestar Item: {selectedItem?.nome}</h3>

              <div className="retirada-form-group">
                <label>Nome do Morador/Funcionário:</label>
                <input
                  autoFocus
                  type="text"
                  value={retiradaItemForm.nome_morador}
                  onChange={e => setRetiradaItemForm({ ...retiradaItemForm, nome_morador: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="retirada-form-group half">
                  <label>Apartamento:</label>
                  <input
                    type="text"
                    value={retiradaItemForm.apartamento}
                    onChange={e => setRetiradaItemForm({ ...retiradaItemForm, apartamento: e.target.value })}
                  />
                </div>
                <div className="retirada-form-group half">
                  <label>Bloco:</label>
                  <input
                    type="text"
                    value={retiradaItemForm.bloco}
                    onChange={e => setRetiradaItemForm({ ...retiradaItemForm, bloco: e.target.value })}
                  />
                </div>
              </div>

              <div className="retirada-form-group">
                <label>Assinatura do Morador (Obrigatório):</label>
                <div className="canvas-wrapper">
                  <canvas
                    ref={canvasRef}
                    width={480}
                    height={200}
                    className="assinatura-canvas"
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={stopDraw}
                    onMouseLeave={stopDraw}
                    onTouchStart={startDraw}
                    onTouchMove={draw}
                    onTouchEnd={stopDraw}
                  />
                </div>
                <button type="button" className="limpar-btn" onClick={clearCanvas}>
                  Limpar Assinatura
                </button>
              </div>

              <button className="confirmar-retirada-btn-large" onClick={handleConfirmarRetiradaItem}>
                CONFIRMAR EMPRÉSTIMO
              </button>
            </div>
          </div>
        )
      }

      {/* Modal de Histórico */}
      {
        modalHistorico && (
          <div className="foto-modal-overlay">
            <div className="retirada-modal historico-modal">
              <button className="foto-modal-close" onClick={() => setModalHistorico(null)}>✕</button>
              <h3>Histórico: {modalHistorico.area_nome || modalHistorico.nome}</h3>

              <div className="historico-table-container">
                <table className="chaves-table">
                  <thead>
                    <tr>
                      <th>Retirada</th>
                      <th>Devolução</th>
                      <th>Nome</th>
                      <th>Unidade</th>
                      {modalHistorico.area_nome && <th>Item</th>}
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historicoData.length === 0 ? (
                      <tr><td colSpan={modalHistorico.area_nome ? "6" : "5"} style={{ textAlign: 'center' }}>Nenhum registro encontrado</td></tr>
                    ) : (
                      historicoData.map((log) => (
                        <tr key={log.id}>
                          <td>{new Date(log.data_retirada).toLocaleString('pt-BR')}</td>
                          <td>{log.data_devolucao ? new Date(log.data_devolucao).toLocaleString('pt-BR') : <span className="pendente">Pendente</span>}</td>
                          <td>{log.retirado_por}</td>
                          <td>{log.unidade || `${log.apartamento} / ${log.bloco}`}</td>
                          {modalHistorico.area_nome && <td>{log.item_nome || "-"}</td>}
                          <td>
                            {log.assinatura_url && (
                              <button
                                className="admin-btn-small"
                                onClick={() => setAssinaturaVer(log.assinatura_url)}
                                title="Ver Assinatura"
                              >
                                ✍️
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      }

      {/* Modal de Assinatura (Zoom) */}
      {
        assinaturaVer && (
          <div className="foto-modal-overlay" onClick={() => setAssinaturaVer(null)}>
            <div className="assinatura-zoom-container" onClick={e => e.stopPropagation()}>
              <button className="foto-modal-close" onClick={() => setAssinaturaVer(null)}>✕</button>
              <h3>Assinatura</h3>
              <img src={assinaturaVer} alt="Assinatura" className="assinatura-img-zoom" />
            </div>
          </div>
        )
      }

      {/* Modal de Edição Customizado */}
      {modalEditOpen && (
        <div className="modal-overlay">
          <div className="modal-container edit-modal">
            <div className="modal-header">
              <h3>Editar {editType === 'chave' ? 'Chave' : 'Item'}</h3>
              <button className="modal-close" onClick={() => setModalEditOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="retirada-form-group">
                <label>Nome da {editType === 'chave' ? 'Área' : 'Item'}:</label>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="Digite o novo nome..."
                  autoFocus
                />
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn-cancelar" onClick={() => setModalEditOpen(false)}>Cancelar</button>
              <button className="btn-confirmar" onClick={saveEdit}>Salvar Alterações</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação Unificado (Devolução/Exclusão) */}
      {modalConfirmOpen && (
        <div className="modal-overlay danger">
          <div className={`modal-container confirm-modal ${confirmConfig.type}`}>
            <div className="modal-header">
              <h3>{confirmConfig.title}</h3>
              <button className="modal-close" onClick={() => setModalConfirmOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: '1.6' }}>
                {confirmConfig.text}
              </p>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn-cancelar" onClick={() => setModalConfirmOpen(false)}>Cancelar</button>
              <button
                className={`btn-confirmar ${confirmConfig.type === 'danger' ? 'danger' : 'success'}`}
                onClick={() => {
                  confirmConfig.onConfirm();
                  setModalConfirmOpen(false);
                }}
              >
                {confirmConfig.type === 'danger' ? 'Sim, Excluir' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
