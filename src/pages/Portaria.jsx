import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import api from "../services/api";
import { toast } from "sonner";
import { formatDate, formatDateTime } from "../utils/formatters";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { Portuguese } from "flatpickr/dist/l10n/pt.js";
import "./Portaria.css";
import PremiumSelect from "../components/PremiumSelect";

const applyDocumentMask = (value, type) => {
  if (!value) return "";
  if (type === "CPF") {
    let v = value.replace(/\D/g, "").substring(0, 11);
    return v.replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  if (type === "RG" || type === "RG/CPF") {
    let v = value.replace(/[^\dXx]/g, "").substring(0, 9);
    if (v.length > 8) return v.replace(/^(.{2})(.{3})(.{3})(.{1})$/, "$1.$2.$3-$4");
    if (v.length > 5) return v.replace(/^(.{2})(.{3})(.{1,3})$/, "$1.$2.$3");
    if (v.length > 2) return v.replace(/^(.{2})(.{1,3})$/, "$1.$2");
    return v;
  }
  if (type === "CNH") {
    return value.replace(/\D/g, "").substring(0, 11);
  }
  return value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
};

const applyPlacaMask = (value) => {
  if (!value) return "";
  let v = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (v.length > 3) {
    return v.substring(0, 3) + "-" + v.substring(3, 7);
  }
  return v;
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

const SearchIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const FilterIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const ChevronDownIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const FileTextIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const CreditCardIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const GlobeIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const UserIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ShieldIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
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
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  const [modalEditar, setModalEditar] = useState(null);
  const [editFormData, setEditFormData] = useState({
    nome: "",
    documento: "",
    placa: "",
    marca: "",
    modelo: "",
    cor: "",
  });
  const [formData, setFormData] = useState({
    nome: "",
    documento: "",
    placa: "",
    marca: "",
    modelo: "",
    cor: "",
  });

  const [docType, setDocType] = useState("RG");
  const [quickSearchPlaca, setQuickSearchPlaca] = useState("");
  const [quickSearchDoc, setQuickSearchDoc] = useState("");
  const [quickSearchDocType, setQuickSearchDocType] = useState("RG");
  const [showQuickSearchDropdown, setShowQuickSearchDropdown] = useState(false);
  const quickSearchRef = useRef(null);

  const docTypeOptions = [
    { value: "RG", label: "RG", icon: <FileTextIcon style={{ width: 14, height: 14 }} /> },
    { value: "CNH", label: "CNH", icon: <CreditCardIcon style={{ width: 14, height: 14 }} /> },
    { value: "CPF", label: "CPF", icon: <UserIcon style={{ width: 14, height: 14 }} /> },
    { value: "Passaporte", label: "Passaporte", icon: <GlobeIcon style={{ width: 14, height: 14 }} /> },
    { value: "RNE", label: "RNE", icon: <ShieldIcon style={{ width: 14, height: 14 }} /> },
    { value: "CRNM", label: "CRNM", icon: <ShieldIcon style={{ width: 14, height: 14 }} /> }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (quickSearchRef.current && !quickSearchRef.current.contains(event.target)) {
        setShowQuickSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleQuickSearchDocTypeSelect = (type) => {
    setQuickSearchDocType(type);
    setQuickSearchDoc((prev) => applyDocumentMask(prev, type));
  };

  const handleQuickSearchPlacaChange = (e) => {
    const value = applyPlacaMask(e.target.value);
    setQuickSearchPlaca(value);
    setQuickSearchDoc(""); // Clear other field to avoid confusion
    setShowQuickSearchDropdown(value.length > 0);
  };

  const handleQuickSearchDocChange = (e) => {
    const value = applyDocumentMask(e.target.value, quickSearchDocType);
    setQuickSearchDoc(value);
    setQuickSearchPlaca(""); // Clear other field to avoid confusion
    setShowQuickSearchDropdown(value.length > 0);
  };

  const quickSearchResults = useMemo(() => {
    const searchTerm = quickSearchPlaca || quickSearchDoc;
    const searchMode = quickSearchPlaca ? "placa" : (quickSearchDoc ? "documento" : null);

    if (!searchTerm || !searchMode) return [];

    // Pega registros únicos baseados em documento ou placa para evitar duplicatas no dropdown
    const uniqueMap = new Map();

    acessos.forEach(a => {
      let isMatch = false;
      let sortKey = "";

      if (searchMode === "placa" && a.placa) {
        if (a.placa.toUpperCase().includes(searchTerm.toUpperCase())) {
          isMatch = true;
          sortKey = a.placa;
        }
      } else if (searchMode === "documento" && a.documento) {
        if (a.documento.includes(searchTerm)) {
          isMatch = true;
          sortKey = a.documento;
        }
      }

      if (isMatch && !uniqueMap.has(sortKey)) {
        uniqueMap.set(sortKey, a);
      }
    });

    return Array.from(uniqueMap.values()).slice(0, 5); // limite de 5 resultados
  }, [acessos, quickSearchPlaca, quickSearchDoc]);

  const handleSelectQuickSearchItem = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    setFormData({
      nome: item.nome || "",
      documento: item.documento || "",
      placa: item.placa || "",
      marca: item.marca || "",
      modelo: item.modelo || "",
      cor: item.cor || "",
    });
    setDocType("RG/CPF"); // Resetando the doc type visual for filling
    setQuickSearchPlaca("");
    setQuickSearchDoc("");
    setShowQuickSearchDropdown(false);
    toast.success("Dados preenchidos com sucesso!");
  };

  const handleDocTypeSelect = (type) => {
    setDocType(type);
    setFormData((prev) => ({ ...prev, documento: applyDocumentMask(prev.documento, type) }));
  };

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === "documento") {
      value = applyDocumentMask(value, docType);
    } else if (e.target.name === "placa") {
      value = applyPlacaMask(value);
    }
    setFormData({ ...formData, [e.target.name]: value });
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
      await api.post(`/acessos/${id}/saida`);
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
      documento: acesso.documento,
      placa: acesso.placa || "",
      marca: acesso.marca || "",
      modelo: acesso.modelo || "",
      cor: acesso.cor || "",
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (editFormData.placa) {
      const placaRegex = /^[A-Z]{3}-\d[A-Z0-9]\d{2}$/;
      if (!placaRegex.test(editFormData.placa)) {
        toast.error("Formato de placa inválido. Use o padrão ABC-1234 ou ABC-1D23.");
        return;
      }
    }

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
    const filtrados = acessos.filter(a => {
      const nomeCompleto = (a.nome || "").toLowerCase();
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

    if (sortConfig.key) {
      filtrados.sort((a, b) => {
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

    return filtrados;
  }, [acessos, filtros, sortConfig]);

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

  useEffect(() => {
    fetchAcessos(); // Load access history initially for the quick search autocomplete
  }, []);

  useEffect(() => {
    if (activeTab === "visualizacao") {
      fetchAcessos();
    }
  }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.placa) {
      const placaRegex = /^[A-Z]{3}-\d[A-Z0-9]\d{2}$/;
      if (!placaRegex.test(formData.placa)) {
        toast.error("Formato de placa inválido. Use o padrão ABC-1234 ou ABC-1D23.");
        return;
      }
    }

    setLoading(true);

    try {
      await api.post("/acessos", formData);
      toast.success("Acesso cadastrado com sucesso!");
      setFormData({
        nome: "",
        documento: "",
        placa: "",
        marca: "",
        modelo: "",
        cor: "",
      });
      setDocType("RG");
      setQuickSearchDocType("RG");
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
          <div className="cadastro-tab-wrapper">
            <form className="cadastro-form" onSubmit={handleSubmit}>
              <h2><UserPlusIcon className="section-icon" style={{ width: 22, height: 22 }} /> Cadastro de Acessos</h2>

              <div className="quick-search-section" ref={quickSearchRef}>
                <h3><SearchIcon className="section-icon" style={{ width: 18, height: 18 }} /> Pesquisa Rápida (Autopreenchimento)</h3>
                <p className="quick-search-desc">Busque acessos anteriores para preencher o formulário automaticamente.</p>

                <div className="quick-search-controls">
                  <div className="quick-search-field">
                    <label>Pesquisar por Placa:</label>
                    <input
                      type="text"
                      className="quick-search-input"
                      placeholder="Ex: ABC-1234"
                      value={quickSearchPlaca}
                      onChange={handleQuickSearchPlacaChange}
                      onFocus={() => { if (quickSearchPlaca) setShowQuickSearchDropdown(true); }}
                      maxLength="8"
                    />
                  </div>

                  <div className="quick-search-field">
                    <label>Pesquisar por Documento:</label>
                    <div className="quick-search-input-wrapper">
                      <div className="doc-type-wrapper-inline premium-wrapper">
                        <PremiumSelect
                          options={docTypeOptions}
                          value={quickSearchDocType}
                          onChange={handleQuickSearchDocTypeSelect}
                        />
                      </div>
                      <input
                        type="text"
                        className="quick-search-input"
                        placeholder={`Ex: (${quickSearchDocType})`}
                        value={quickSearchDoc}
                        onChange={handleQuickSearchDocChange}
                        onFocus={() => { if (quickSearchDoc) setShowQuickSearchDropdown(true); }}
                        maxLength="20"
                      />
                    </div>
                  </div>

                  {showQuickSearchDropdown && (quickSearchPlaca || quickSearchDoc) && createPortal(
                    <>
                      <div className="premium-select-backdrop" onMouseDown={() => setShowQuickSearchDropdown(false)} />
                      <div
                        className="quick-search-dropdown premium-autocomplete"
                        style={{
                          position: 'absolute',
                          top: `${quickSearchRef.current?.getBoundingClientRect().bottom + window.scrollY + 8}px`,
                          left: `${quickSearchRef.current?.getBoundingClientRect().left + window.scrollX}px`,
                          width: `${quickSearchRef.current?.getBoundingClientRect().width}px`,
                          zIndex: 999999
                        }}
                      >
                        {quickSearchResults.length > 0 ? (
                          quickSearchResults.map(item => (
                            <div
                              key={item.id}
                              className="quick-search-item"
                              onMouseDown={(e) => handleSelectQuickSearchItem(e, item)}
                            >
                              <div className="qs-primary">
                                <strong>{quickSearchPlaca ? item.placa : item.documento}</strong>
                                <span className="qs-complement">{item.nome}</span>
                              </div>
                              <div className="qs-secondary">
                                {quickSearchPlaca ? `Doc: ${item.documento}` : (item.placa ? `Placa: ${item.placa}` : 'Sem placa')}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="quick-search-item empty">Nenhum registro encontrado.</div>
                        )}
                      </div>
                    </>,
                    document.body
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Nome:</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Ex: João Silva"
                  required
                />
              </div>

              <div className="form-group">
                <label>Documento:</label>
                <div className="quick-search-input-wrapper" style={{ marginTop: '5px' }}>
                  <div className="doc-type-wrapper-inline premium-wrapper">
                    <PremiumSelect
                      options={docTypeOptions}
                      value={docType}
                      onChange={handleDocTypeSelect}
                    />
                  </div>

                  <input
                    type="text"
                    name="documento"
                    className="quick-search-input"
                    value={formData.documento}
                    onChange={handleChange}
                    placeholder={
                      docType === "CPF" ? "Ex: 123.456.789-00" :
                        docType === "RG" ? "Ex: 12.345.678-x" :
                          docType === "CNH" ? "Ex: 12345678901" :
                            "Ex: AB123456"
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Placa:</label>
                <input
                  type="text"
                  name="placa"
                  value={formData.placa}
                  onChange={handleChange}
                  placeholder="Ex: ABC-1234"
                  maxLength="8"
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
          </div>
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
                      <th onClick={() => handleSort('id')} className="sortable-th">
                        <div className="th-content">ID {getSortIcon('id')}</div>
                      </th>
                      <th onClick={() => handleSort('nome')} className="sortable-th">
                        <div className="th-content">Nome {getSortIcon('nome')}</div>
                      </th>
                      <th onClick={() => handleSort('documento')} className="sortable-th">
                        <div className="th-content">Documento {getSortIcon('documento')}</div>
                      </th>
                      <th onClick={() => handleSort('placa')} className="sortable-th">
                        <div className="th-content">Placa {getSortIcon('placa')}</div>
                      </th>
                      <th onClick={() => handleSort('marca')} className="sortable-th">
                        <div className="th-content">Marca {getSortIcon('marca')}</div>
                      </th>
                      <th onClick={() => handleSort('modelo')} className="sortable-th">
                        <div className="th-content">Modelo {getSortIcon('modelo')}</div>
                      </th>
                      <th onClick={() => handleSort('cor')} className="sortable-th">
                        <div className="th-content">Cor {getSortIcon('cor')}</div>
                      </th>
                      <th onClick={() => handleSort('data_entrada')} className="sortable-th">
                        <div className="th-content">Entrada {getSortIcon('data_entrada')}</div>
                      </th>
                      <th onClick={() => handleSort('data_saida')} className="sortable-th">
                        <div className="th-content">Saída {getSortIcon('data_saida')}</div>
                      </th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {acessosFiltrados.map((a) => (
                      <tr key={a.id}>
                        <td>{a.id}</td>
                        <td>{a.nome}</td>
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
                <h2>Liberação de Acessos</h2>
                <p>Funcionalidade em desenvolvimento...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL EDITAR ACESSO */}
      {modalEditar && (
        <div className="global-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setModalEditar(null); }}>
          <div className="global-modal" onMouseDown={(e) => e.stopPropagation()}>
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
              </div>

              <div className="modal-form-row">
                <div className="modal-field">
                  <label className="modal-label">Placa</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={editFormData.placa}
                    onChange={(e) => setEditFormData({ ...editFormData, placa: applyPlacaMask(e.target.value) })}
                    placeholder="Ex: ABC-1234"
                    maxLength="8"
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
        <div className="global-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setModalFiltro(false); }}>
          <div className="global-modal" onMouseDown={(e) => e.stopPropagation()}>
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
                    onChange={(e) => setFiltrosTemporarios({ ...filtrosTemporarios, placa: applyPlacaMask(e.target.value) })}
                    placeholder="ABC-1234"
                    maxLength="8"
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
