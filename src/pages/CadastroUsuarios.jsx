import { useState, useEffect, useMemo, useRef } from "react";
import api from "../services/api";
import { toast } from "sonner";
import { applyDocumentMask, applyPlateMask } from "../utils/formatters";
import "./CadastroUsuarios.css";
import PremiumSelect from "../components/PremiumSelect";

// Ícones SVG inline para documentos
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

// Ícones SVG inline (Padronizados com Encomendas)
const UserPlusIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" />
    <line x1="22" y1="11" x2="16" y2="11" />
  </svg>
);

const UsersIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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
  </svg>
);

const LockIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const UnlockIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>
);

const FilterIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const EditIcon = PencilIcon;
const KeyIcon = UnlockIcon;
const EyeIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const CarIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <path d="M9 17h6" />
    <circle cx="17" cy="17" r="2" />
  </svg>
);

const PlusIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
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

export default function CadastroUsuarios() {
  const [activeTab, setActiveTab] = useState("cadastro");
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalEditar, setModalEditar] = useState(null);
  const [modalDetalhes, setModalDetalhes] = useState(null);
  const [modalFiltro, setModalFiltro] = useState(false);
  const [filtros, setFiltros] = useState({
    nome: "",
    email: "",
    cargo: "todos",
    status: "todos", // todos, ativo, inativo
    permissao: "todos" // todos, admin, usuario
  });
  const [filtrosTemporarios, setFiltrosTemporarios] = useState({ ...filtros });
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  const [modalVeiculos, setModalVeiculos] = useState(false);
  const [tempVeiculos, setTempVeiculos] = useState([]);
  const [formData, setFormData] = useState({
    nome: "",
    sobrenome: "",
    email: "",
    password: "",
    confirmPassword: "",
    cargo: "porteiro",
    is_admin: false,
    unidade: "",
    documento: "",
    temVeiculo: false,
    veiculos: [],
  });
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [editFormData, setEditFormData] = useState({
    nome: "",
    sobrenome: "",
    email: "",
    password: "",
    cargo: "",
    is_admin: false,
    ativo: true,
    unidade: "",
    documento: "",
  });
  const [editFotoFile, setEditFotoFile] = useState(null);
  const [editFotoPreview, setEditFotoPreview] = useState(null);

  // Persistence: Restore from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('cadastro_user_data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Don't restore passwords
        const { password: _p, confirmPassword: _cp, ...rest } = parsedData;
        setFormData(prev => ({ ...prev, ...rest }));
      } catch (e) {
        console.error("Error restoring form data", e);
      }
    }

    const savedPhoto = localStorage.getItem('cadastro_user_photo');
    if (savedPhoto) {
      setFotoPreview(savedPhoto);
    }
  }, []);

  // Persistence: Save to localStorage on change
  useEffect(() => {
    const { password: _p, confirmPassword: _cp, ...rest } = formData;
    localStorage.setItem('cadastro_user_data', JSON.stringify(rest));
  }, [formData]);
  const [cargoDropdownOpen, setCargoDropdownOpen] = useState(false);
  const [docType, setDocType] = useState("RG");
  const [editDocType, setEditDocType] = useState("RG");

  const docTypeOptions = [
    { value: "RG", label: "RG", icon: <FileTextIcon style={{ width: 14, height: 14 }} /> },
    { value: "CNH", label: "CNH", icon: <CreditCardIcon style={{ width: 14, height: 14 }} /> },
    { value: "CPF", label: "CPF", icon: <UserIcon style={{ width: 14, height: 14 }} /> },
    { value: "Passaporte", label: "Passaporte", icon: <GlobeIcon style={{ width: 14, height: 14 }} /> },
    { value: "RNE", label: "RNE", icon: <ShieldIcon style={{ width: 14, height: 14 }} /> },
    { value: "CRNM", label: "CRNM", icon: <ShieldIcon style={{ width: 14, height: 14 }} /> }
  ];

  const [modalWebcam, setModalWebcam] = useState(false);
  const [webcamTarget, setWebcamTarget] = useState(null); // 'cadastro' ou 'editar'
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const cameraInputRef = useRef(null);

  const cargos = [
    { value: "porteiro", label: "Porteiro" },
    { value: "supervisor", label: "Supervisor" },
    { value: "zelador", label: "Zelador" },
    { value: "sindico", label: "Síndico" },
    { value: "administrador", label: "Administrador" },
    { value: "morador", label: "Morador" },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === "checkbox" ? checked : value;

    if (name === "documento") {
      finalValue = applyDocumentMask(finalValue, docType);
    }
    
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: finalValue,
      };

      // Se mudar para morador, remove admin
      if (name === "cargo" && value === "morador") {
        newData.is_admin = false;
      }

      // Se marcar "Tem veículo?", abre o modal
      if (name === "temVeiculo" && finalValue === true) {
        if (newData.veiculos.length === 0) {
          setTempVeiculos([{ placa: "", marca: "", modelo: "", cor: "" }]);
        } else {
          setTempVeiculos([...newData.veiculos]);
        }
        setModalVeiculos("cadastro");
      }

      return newData;
    });
  };

  const handleDocTypeSelect = (type) => {
    setDocType(type);
    setFormData((prev) => ({ ...prev, documento: applyDocumentMask(prev.documento, type) }));
  };

  const handleFotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFotoFile(file);
        setFotoPreview(base64String);
        localStorage.setItem('cadastro_user_photo', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === "checkbox" ? checked : value;

    if (name === "documento") {
      finalValue = applyDocumentMask(finalValue, editDocType);
    }
    
    setEditFormData((prev) => {
      const newData = {
        ...prev,
        [name]: finalValue,
      };

      // Se mudar para morador, remove admin
      if (name === "cargo" && value === "morador") {
        newData.is_admin = false;
      }

      // Se marcar "Tem veículo?", abre o modal
      if (name === "temVeiculo" && finalValue === true) {
        if (!newData.veiculos || newData.veiculos.length === 0) {
          setTempVeiculos([{ placa: "", marca: "", modelo: "", cor: "" }]);
        } else {
          setTempVeiculos([...newData.veiculos]);
        }
        setModalVeiculos("editar");
      }

      return newData;
    });
  };

  const handleEditDocTypeSelect = (type) => {
    setEditDocType(type);
    setEditFormData((prev) => ({ ...prev, documento: applyDocumentMask(prev.documento, type) }));
  };

  const fetchUsuarios = async () => {
    try {
      const response = await api.get("/usuarios");
      setUsuarios(response.data.usuarios);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "visualizacao") {
      fetchUsuarios();
    }
  }, [activeTab]);

  const handleVeiculoChange = (index, field, value) => {
    const newVeiculos = [...tempVeiculos];
    if (field === "placa") {
      newVeiculos[index][field] = applyPlateMask(value);
    } else {
      newVeiculos[index][field] = value;
    }
    setTempVeiculos(newVeiculos);
  };

  const addVeiculoRow = () => {
    setTempVeiculos([...tempVeiculos, { placa: "", marca: "", modelo: "", cor: "" }]);
  };

  const removeVeiculoRow = (index) => {
    const newVeiculos = tempVeiculos.filter((_, i) => i !== index);
    setTempVeiculos(newVeiculos);
  };

  const confirmarVeiculos = () => {
    // Filtrar veículos vazios (pelo menos a placa deve existir)
    const validVeiculos = tempVeiculos.filter(v => v.placa.trim() !== "");
    
    if (modalVeiculos === "cadastro") {
      setFormData(prev => ({ 
        ...prev, 
        veiculos: validVeiculos,
        temVeiculo: validVeiculos.length > 0 
      }));
    } else if (modalVeiculos === "editar") {
      setEditFormData(prev => ({ 
        ...prev, 
        veiculos: validVeiculos,
        temVeiculo: validVeiculos.length > 0 
      }));
    }
    setModalVeiculos(false);
  };

  const cancelarVeiculos = () => {
    // Se o usuário fechar o modal sem confirmar, desativa o checkbox
    // se ele não tiver veículos já cadastrados/confirmados.
    if (modalVeiculos === "cadastro") {
      setFormData(prev => ({ 
        ...prev, 
        temVeiculo: prev.veiculos.length > 0 
      }));
    } else if (modalVeiculos === "editar") {
      setEditFormData(prev => ({ 
        ...prev, 
        temVeiculo: prev.veiculos.length > 0 
      }));
    }
    setModalVeiculos(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.warning("As senhas não coincidem!");
      return;
    }

    if (formData.password.length < 6) {
      toast.warning("A senha deve ter pelo menos 6 caracteres!");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append("nome", formData.nome);
      data.append("sobrenome", formData.sobrenome);
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("cargo", formData.cargo);
      data.append("is_admin", formData.is_admin.toString());
      data.append("unidade", formData.unidade || "");
      data.append("documento", formData.documento || "");
      data.append("veiculos", JSON.stringify(formData.veiculos));
      if (fotoFile) {
        data.append("foto", fotoFile);
      } else if (fotoPreview && fotoPreview.startsWith('data:image')) {
        // If we restored from localStorage and don't have the File object, send base64
        // The backend might need to handle this. But usually, we want to try to get the File.
        // Convert Base64 back to Blob if no File is present.
        const response = await fetch(fotoPreview);
        const blob = await response.blob();
        data.append("foto", blob, "user_photo.jpg");
      }

      await api.post("/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Usuário cadastrado com sucesso!");
      localStorage.removeItem('cadastro_user_data');
      localStorage.removeItem('cadastro_user_photo');
      setFormData({
        nome: "",
        sobrenome: "",
        email: "",
        password: "",
        confirmPassword: "",
        cargo: "porteiro",
        is_admin: false,
        unidade: "",
        documento: "",
        temVeiculo: false,
        veiculos: [],
      });
      setDocType("RG");
      setFotoFile(null);
      setFotoPreview(null);
    } catch (error) {
      toast.error(error.response?.data?.error || "Erro ao cadastrar usuário");
      console.error(error);
    } finally {
      setLoading(false);
    }
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
          const file = new File([blob], "user_photo.jpg", { type: "image/jpeg" });
          if (webcamTarget === 'cadastro') {
            setFotoFile(file);
            setFotoPreview(dataUrl);
            localStorage.setItem('cadastro_user_photo', dataUrl);
          } else {
            setEditFotoFile(file);
            setEditFotoPreview(dataUrl);
          }
          closeWebcamModal();
        });
    }
  };

  const openWebcamModal = (target) => {
    setWebcamTarget(target);
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

  const openEditarModal = (usuario) => {
    setModalEditar(usuario);
    setEditFormData({
      nome: usuario.nome,
      sobrenome: usuario.sobrenome,
      email: usuario.email,
      password: "",
      cargo: usuario.cargo,
      is_admin: usuario.is_admin,
      ativo: usuario.ativo,
      unidade: usuario.unidade || "",
      documento: usuario.documento || "",
      temVeiculo: usuario.veiculos && usuario.veiculos.length > 0,
      veiculos: usuario.veiculos || [],
    });
    setEditFotoFile(null);
    // Backend returns Base64 or a filename. If it's Base64, it starts with data:image
    const isBase64 = usuario.foto && usuario.foto.startsWith('data:image');
    setEditFotoPreview(usuario.foto ? (isBase64 ? usuario.foto : `/uploads/${usuario.foto}`) : null);
  };

  const closeEditarModal = () => {
    setModalEditar(null);
    setEditFotoFile(null);
    setEditFotoPreview(null);
  };

  const handleEditFotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setEditFotoFile(file);
        setEditFotoPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      data.append("nome", editFormData.nome);
      data.append("sobrenome", editFormData.sobrenome);
      data.append("email", editFormData.email);
      data.append("cargo", editFormData.cargo);
      data.append("is_admin", editFormData.is_admin.toString());
      data.append("ativo", editFormData.ativo.toString());
      data.append("unidade", editFormData.unidade || "");
      data.append("documento", editFormData.documento || "");
      data.append("veiculos", JSON.stringify(editFormData.veiculos));
      if (editFormData.password) {
        data.append("password", editFormData.password);
      }
      if (editFotoFile) {
        data.append("foto", editFotoFile);
      }

      await api.put(`/usuarios/${modalEditar.id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Usuário atualizado com sucesso!");
      closeEditarModal();
      fetchUsuarios();
    } catch (error) {
      toast.error("Erro ao atualizar usuário");
      console.error(error);
    }
  };

  const toggleStatus = async (id) => {
    try {
      await api.post(`/usuarios/${id}/toggle-status`);
      fetchUsuarios();
    } catch (error) {
      toast.error("Erro ao alterar status");
      console.error(error);
    }
  };

  const deletarUsuario = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este usuário?")) {
      return;
    }

    try {
      await api.delete(`/usuarios/${id}`);
      toast.success("Usuário excluído com sucesso!");
      fetchUsuarios();
    } catch (error) {
      toast.error("Erro ao excluir usuário");
      console.error(error);
    }
  };

  const clearFiltros = () => {
    const limpo = {
      nome: "",
      email: "",
      cargo: "todos",
      status: "todos",
      permissao: "todos"
    };
    setFiltrosTemporarios(limpo);
  };

  const usuariosFiltrados = useMemo(() => {
    const filtrados = usuarios.filter(u => {
      const nomeCompleto = `${u.nome} ${u.sobrenome}`.toLowerCase();
      const matchNome = !filtros.nome || nomeCompleto.includes(filtros.nome.toLowerCase());
      const matchEmail = !filtros.email || u.email.toLowerCase().includes(filtros.email.toLowerCase());
      const matchCargo = filtros.cargo === "todos" || u.cargo === filtros.cargo;

      let matchStatus = true;
      if (filtros.status === "ativo") matchStatus = u.ativo;
      else if (filtros.status === "inativo") matchStatus = !u.ativo;

      let matchPermissao = true;
      if (filtros.permissao === "admin") matchPermissao = u.is_admin;
      else if (filtros.permissao === "usuario") matchPermissao = !u.is_admin;

      return matchNome && matchEmail && matchCargo && matchStatus && matchPermissao;
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
  }, [usuarios, filtros, sortConfig]);

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
    <div className="usuarios-container">
      {/* MODAL EDITAR */}
      {modalEditar && (
        <div className="global-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) closeEditarModal(); }}>
          <div className="global-modal" onMouseDown={(e) => e.stopPropagation()}>
            <button className="global-modal-close" onClick={closeEditarModal}>✕</button>
            <h3>Editar Usuário</h3>
            <form className="modal-form" onSubmit={handleEditSubmit}>
              <div className="form-group foto-edit-group secao-foto-dados">
                <label>Foto do Usuário:</label>
                <div className="foto-edit-container">
                  {editFotoPreview ? (
                    <div className="photo-preview-container">
                      <img src={editFotoPreview} alt="Preview" className="foto-edit-preview" />
                      <button
                        type="button"
                        className="remove-photo-btn"
                        onClick={() => {
                          setEditFotoFile(null);
                          setEditFotoPreview(null);
                        }}
                      >
                        ✕ remover
                      </button>
                    </div>
                  ) : (
                    <div className="foto-edit-placeholder">👤</div>
                  )}
                </div>
                <div className="photo-actions-edit">
                  <button
                    type="button"
                    className="photo-action-btn camera-btn"
                    onClick={() => openWebcamModal('editar')}
                  >
                    📷 Tirar Foto
                  </button>
                  <button
                    type="button"
                    className="photo-action-btn gallery-btn"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = handleEditFotoChange;
                      input.click();
                    }}
                  >
                    🖼️ Galeria
                  </button>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Nome:</label>
                  <input
                    type="text"
                    name="nome"
                    value={editFormData.nome}
                    onChange={handleEditChange}
                    placeholder="Ex: João"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Sobrenome:</label>
                  <input
                    type="text"
                    name="sobrenome"
                    value={editFormData.sobrenome}
                    onChange={handleEditChange}
                    placeholder="Ex: Silva"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditChange}
                  placeholder="Ex: joao@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Nova Senha (deixe em branco para manter):</label>
                <input
                  type="password"
                  name="password"
                  value={editFormData.password}
                  onChange={handleEditChange}
                  placeholder="••••••••"
                />
              </div>

              <div className="form-group">
                <label>Cargo:</label>
                <select
                  name="cargo"
                  value={editFormData.cargo}
                  onChange={handleEditChange}
                >
                  {cargos.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              {editFormData.cargo === "morador" && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Unidade:</label>
                    <input
                      type="text"
                      name="unidade"
                      value={editFormData.unidade}
                      onChange={handleEditChange}
                      placeholder="Ex: Apt 101"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <div className="label-with-action">
                      <label>Documento:</label>
                      <div className="doc-type-wrapper-inline premium-wrapper">
                        <PremiumSelect
                          options={docTypeOptions}
                          value={editDocType}
                          onChange={handleEditDocTypeSelect}
                        />
                      </div>
                    </div>
                    <input
                      type="text"
                      name="documento"
                      className="premium-input-standalone"
                      value={editFormData.documento}
                      onChange={handleEditChange}
                      placeholder={
                        editDocType === "CPF" ? "Ex: 123.456.789-00" :
                          editDocType === "RG" ? "Ex: 12.345.678-x" :
                            editDocType === "CNH" ? "Ex: 12345678901" :
                              "Ex: AB123456"
                      }
                      required
                    />
                  </div>
                </div>
              )}

              {editFormData.cargo === "morador" && (
                <div className="form-group vehicle-checkbox-group">
                  <label>VEÍCULOS</label>
                  <div className="checkbox-row">
                    <label className="premium-switch">
                      <input
                        type="checkbox"
                        id="editTemVeiculo"
                        name="temVeiculo"
                        checked={editFormData.temVeiculo}
                        onChange={handleEditChange}
                      />
                      <span className="switch-slider"></span>
                    </label>
                    <label htmlFor="editTemVeiculo" className="switch-label">O morador possui veículos?</label>
                  </div>

                  {editFormData.temVeiculo && editFormData.veiculos.length > 0 && (
                    <div className="vehicle-summary-area">
                      {editFormData.veiculos.map((v, idx) => (
                        <div key={idx} className="vehicle-summary-card">
                          <CarIcon className="summary-card-icon" />
                          <div className="summary-badges-container">
                            <span className="summary-badge plate">{v.placa}</span>
                            <span className="summary-badge brand">{v.marca}</span>
                            <span className="summary-badge model">{v.modelo}</span>
                            <span className="summary-badge color">{v.cor}</span>
                          </div>
                        </div>
                      ))}
                      <button 
                        type="button" 
                        className="edit-vehicles-btn"
                        onClick={() => {
                          setTempVeiculos([...editFormData.veiculos]);
                          setModalVeiculos("editar");
                        }}
                      >
                        ✏️ Editar Veículos
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="edit-toggles-row">
                {editFormData.cargo !== "morador" && (
                  <div className={`edit-toggle-box ${editFormData.is_admin ? "active" : ""}`}>
                    <div className="edit-toggle-info">
                      <span className="edit-toggle-icon">👑</span>
                      <span className="edit-toggle-title">Administrador</span>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        name="is_admin"
                        checked={editFormData.is_admin}
                        onChange={handleEditChange}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                )}

                <div className={`edit-toggle-box ${editFormData.ativo ? "ativo" : "inativo"}`}>
                  <div className="edit-toggle-info">
                    <span className="edit-toggle-icon">{editFormData.ativo ? "✓" : "✕"}</span>
                    <span className="edit-toggle-title">Ativo</span>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      name="ativo"
                      checked={editFormData.ativo}
                      onChange={handleEditChange}
                    />
                    <span className="toggle-slider ativo-slider"></span>
                  </label>
                </div>
              </div>


              <button type="submit" className="submit-btn">
                💾 Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TABS NAVIGATION */}
      <div className="usuarios-tabs">
        <button
          type="button"
          className={`usuarios-tab-btn ${activeTab === "cadastro" ? "active" : ""}`}
          onClick={() => setActiveTab("cadastro")}
        >
          <UserPlusIcon style={{ width: '18px', height: '18px' }} />
          Novo Usuário
        </button>
        <button
          type="button"
          className={`usuarios-tab-btn ${activeTab === "visualizacao" ? "active" : ""}`}
          onClick={() => setActiveTab("visualizacao")}
        >
          <UsersIcon style={{ width: '18px', height: '18px' }} />
          Gerenciar Usuários
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="tab-content">
        {activeTab === "cadastro" && (
          <form className="cadastro-form" onSubmit={handleSubmit}>
            <h2>Cadastro de Usuário</h2>

            {/* Seção Foto + Dados Pessoais - Moved to Top */}
            <div className="secao-foto-dados">
              <div className="foto-upload-box">
                <div className="foto-preview">
                  {fotoPreview ? (
                    <div className="photo-preview-container">
                      <img src={fotoPreview} alt="Preview" className="photo-preview-img" />
                      <button
                        type="button"
                        className="remove-photo-btn"
                        onClick={() => {
                          setFotoFile(null);
                          setFotoPreview(null);
                          localStorage.removeItem('cadastro_user_photo');
                        }}
                      >
                        ✕ remover
                      </button>
                    </div>
                  ) : (
                    <span className="foto-placeholder">👤</span>
                  )}
                </div>
                <div className="photo-actions">
                  <button
                    type="button"
                    className="photo-action-btn camera-btn"
                    onClick={() => openWebcamModal('cadastro')}
                  >
                    📷 Tirar Foto
                  </button>
                  <button
                    type="button"
                    className="photo-action-btn gallery-btn"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = handleFotoChange;
                      input.click();
                    }}
                  >
                    🖼️ Galeria
                  </button>
                </div>
              </div>

              <div className="dados-pessoais">
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
              </div>
            </div>

            {/* Linha Email + Cargo */}
            <div className="form-row-2">
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Ex: joao@email.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Cargo:</label>
                <div className="custom-select-container">
                  <div
                    className={`custom-select ${cargoDropdownOpen ? "open" : ""}`}
                    onClick={() => setCargoDropdownOpen(!cargoDropdownOpen)}
                  >
                    <span className="custom-select-value">
                      {cargos.find((c) => c.value === formData.cargo)?.label || "Selecione"}
                    </span>
                    <span className={`custom-select-arrow ${cargoDropdownOpen ? "open" : ""}`}>▼</span>
                  </div>
                  <div className={`custom-select-options ${cargoDropdownOpen ? "open" : ""}`}>
                    {cargos.map((c) => (
                      <div
                        key={c.value}
                        className={`custom-select-option ${formData.cargo === c.value ? "selected" : ""}`}
                        onClick={() => {
                          setFormData((prev) => {
                            const newData = { ...prev, cargo: c.value };
                            if (c.value === "morador") {
                              newData.is_admin = false;
                            }
                            return newData;
                          });
                          setCargoDropdownOpen(false);
                        }}
                      >
                        {c.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Linha Senha + Confirmar */}
            <div className="form-row-2">
              <div className="form-group">
                <label>Senha:</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label>Confirmar Senha:</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {formData.cargo === "morador" && (
              <div className="form-row-2">
                <div className="form-group">
                  <label>Unidade:</label>
                  <input
                    type="text"
                    name="unidade"
                    value={formData.unidade}
                    onChange={handleChange}
                    placeholder="Ex: Apt 101"
                    required
                  />
                </div>
                <div className="form-group">
                  <div className="label-with-action">
                    <label>Documento:</label>
                    <div className="doc-type-wrapper-inline premium-wrapper">
                      <PremiumSelect
                        options={docTypeOptions}
                        value={docType}
                        onChange={handleDocTypeSelect}
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    name="documento"
                    className="premium-input-standalone"
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
            )}

            {formData.cargo === "morador" && (
              <div className="form-group vehicle-checkbox-group">
                <label>VEÍCULOS</label>
                <div className="checkbox-row">
                  <label className="premium-switch">
                    <input
                      type="checkbox"
                      id="temVeiculo"
                      name="temVeiculo"
                      checked={formData.temVeiculo}
                      onChange={handleChange}
                    />
                    <span className="switch-slider"></span>
                  </label>
                  <label htmlFor="temVeiculo" className="switch-label">O morador possui veículos?</label>
                </div>

                {formData.temVeiculo && formData.veiculos.length > 0 && (
                  <div className="vehicle-summary-area">
                    {formData.veiculos.map((v, idx) => (
                      <div key={idx} className="vehicle-summary-card">
                        <CarIcon className="summary-card-icon" />
                        <div className="summary-badges-container">
                          <span className="summary-badge plate">{v.placa}</span>
                          <span className="summary-badge brand">{v.marca}</span>
                          <span className="summary-badge model">{v.modelo}</span>
                          <span className="summary-badge color">{v.cor}</span>
                        </div>
                      </div>
                    ))}
                    <button 
                      type="button" 
                      className="edit-vehicles-btn"
                      onClick={() => {
                        setTempVeiculos([...formData.veiculos]);
                        setModalVeiculos("cadastro");
                      }}
                    >
                      ✏️ Editar Veículos
                    </button>
                  </div>
                )}
              </div>
            )}


            {formData.cargo !== "morador" && (
              <div className="admin-toggle-container">
                <div className="admin-toggle-box">
                  <div className="admin-toggle-info">
                    <span className="admin-toggle-icon">👑</span>
                    <div>
                      <span className="admin-toggle-title">Administrador</span>
                      <span className="admin-toggle-desc">Acesso total ao sistema</span>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      name="is_admin"
                      checked={formData.is_admin}
                      onChange={handleChange}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Cadastrando..." : "Cadastrar Usuário"}
            </button>
          </form>
        )}

        {activeTab === "visualizacao" && (
          <div className="visualizacao">
            <div className="visualizacao-header">
              <h2>Gerenciamento de Usuários</h2>
              <button
                className="admin-btn-small ver-btn header-filter-btn"
                onClick={() => setModalFiltro(true)}
              >
                <FilterIcon style={{ width: 16, height: 16 }} />
                <span>Filtrar</span>
              </button>
            </div>
            {usuarios.length === 0 ? (
              <p>Nenhum usuário cadastrado ainda.</p>
            ) : (
              <div className="responsive-table-container">
                <table className="usuarios-table desktop-only-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('id')} className="sortable-th">
                        <div className="th-content">ID {getSortIcon('id')}</div>
                      </th>
                      <th onClick={() => handleSort('nome')} className="sortable-th">
                        <div className="th-content">Nome {getSortIcon('nome')}</div>
                      </th>
                      <th onClick={() => handleSort('email')} className="sortable-th">
                        <div className="th-content">Email {getSortIcon('email')}</div>
                      </th>
                      <th onClick={() => handleSort('cargo')} className="sortable-th">
                        <div className="th-content">Cargo {getSortIcon('cargo')}</div>
                      </th>
                      <th onClick={() => handleSort('is_admin')} className="sortable-th">
                        <div className="th-content">Permissão {getSortIcon('is_admin')}</div>
                      </th>
                      <th onClick={() => handleSort('ativo')} className="sortable-th">
                        <div className="th-content">Status {getSortIcon('ativo')}</div>
                      </th>
                      <th onClick={() => handleSort('data_criacao')} className="sortable-th">
                        <div className="th-content">Cadastro {getSortIcon('data_criacao')}</div>
                      </th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosFiltrados.map((u) => (
                      <tr key={u.id} className={!u.ativo ? "usuario-inativo" : ""}>
                        <td>{u.id}</td>
                        <td>{u.nome} {u.sobrenome}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className="cargo-badge">
                            {cargos.find((c) => c.value === u.cargo)?.label || u.cargo}
                          </span>
                        </td>
                        <td>
                          {u.is_admin ? (
                            <span className="admin-badge">👑 Admin</span>
                          ) : (
                            <span className="user-badge">👤 Usuário</span>
                          )}
                        </td>
                        <td>
                          <span className={`status-badge ${u.ativo ? "ativo" : "inativo"}`}>
                            {u.ativo ? "✓ Ativo" : "✕ Inativo"}
                          </span>
                        </td>
                        <td>{new Date(u.data_criacao).toLocaleDateString("pt-BR")}</td>
                        <td className="acoes-cell">
                          <button
                            type="button"
                            className="admin-btn-small edit-btn"
                            onClick={() => openEditarModal(u)}
                            data-tooltip="Editar"
                          >
                            <PencilIcon style={{ width: 14, height: 14 }} />
                          </button>
                          <button
                            type="button"
                            className={`admin-btn-small ver-btn ${u.ativo ? "logout-action" : ""}`}
                            onClick={() => toggleStatus(u.id)}
                            data-tooltip={u.ativo ? "Desativar" : "Ativar"}
                          >
                            {u.ativo ? <LockIcon style={{ width: 14, height: 14 }} /> : <KeyIcon style={{ width: 14, height: 14 }} />}
                          </button>
                          <button
                            type="button"
                            className="admin-btn-small delete-btn"
                            onClick={() => deletarUsuario(u.id)}
                            data-tooltip="Excluir"
                          >
                            <TrashIcon style={{ width: 14, height: 14 }} />
                          </button>
                          {u.cargo === "morador" && (
                            <button
                              type="button"
                              className="admin-btn-small view-info-btn"
                              onClick={() => setModalDetalhes(u)}
                              data-tooltip="Visualizar Detalhes"
                            >
                              <EyeIcon style={{ width: 14, height: 14 }} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile Card View */}
                <div className="mobile-cards-container mobile-only-cards">
                  {usuariosFiltrados.map((u) => (
                    <div key={u.id} className={`mobile-access-card ${!u.ativo ? "usuario-inativo-card" : ""}`}>
                      <div className="card-header">
                        <span className="card-id">#{u.id}</span>
                        <div className="card-status">
                          <span className={`status-badge ${u.ativo ? "ativo" : "inativo"}`}>
                            {u.ativo ? "✓ Ativo" : "✕ Inativo"}
                          </span>
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="card-row">
                          <label>Nome:</label>
                          <span>{u.nome} {u.sobrenome}</span>
                        </div>
                        <div className="card-row">
                          <label>Email:</label>
                          <span>{u.email}</span>
                        </div>
                        <div className="card-row">
                          <label>Cargo:</label>
                          <span className="cargo-badge">
                            {cargos.find((c) => c.value === u.cargo)?.label || u.cargo}
                          </span>
                        </div>
                        <div className="card-row">
                          <label>Permissão:</label>
                          <span>
                            {u.is_admin ? (
                              <span className="admin-badge">👑 Admin</span>
                            ) : (
                              <span className="user-badge">👤 Usuário</span>
                            )}
                          </span>
                        </div>
                        <div className="card-row">
                          <label>Cadastro:</label>
                          <span>{new Date(u.data_criacao).toLocaleDateString("pt-BR")}</span>
                        </div>
                      </div>
                      <div className="card-actions">
                        <button
                          type="button"
                          className="admin-btn-small edit-btn mobile-action-btn"
                          onClick={() => openEditarModal(u)}
                        >
                          <EditIcon style={{ width: 16, height: 16 }} />
                          <span>Editar</span>
                        </button>
                        <button
                          type="button"
                          className={`admin-btn-small ver-btn mobile-action-btn ${u.ativo ? "logout-action" : ""}`}
                          onClick={() => toggleStatus(u.id)}
                        >
                          {u.ativo ? <LockIcon style={{ width: 16, height: 16 }} /> : <KeyIcon style={{ width: 16, height: 16 }} />}
                          <span>{u.ativo ? "Desativar" : "Ativar"}</span>
                        </button>
                        <button
                          type="button"
                          className="admin-btn-small delete-btn mobile-action-btn"
                          onClick={() => deletarUsuario(u.id)}
                        >
                          <TrashIcon style={{ width: 16, height: 16 }} />
                          <span>Excluir</span>
                        </button>
                        {u.cargo === "morador" && (
                          <button
                            type="button"
                            className="admin-btn-small view-info-btn mobile-action-btn"
                            onClick={() => setModalDetalhes(u)}
                          >
                            <EyeIcon style={{ width: 16, height: 16 }} />
                            <span>Visualizar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Filtro */}
      {modalFiltro && (
        <div className="global-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setModalFiltro(false); }}>
          <div className="global-modal" onMouseDown={(e) => e.stopPropagation()}>
            <button className="global-modal-close" onClick={() => setModalFiltro(false)}>✕</button>
            <div className="modal-header">
              <FilterIcon style={{ width: 20, height: 20, marginRight: '10px' }} />
              <h3>Filtrar Usuários</h3>
            </div>

            <div className="modal-form">
              <div className="modal-form-row">
                <div className="modal-field">
                  <label className="modal-label">Nome</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={filtrosTemporarios.nome}
                    onChange={(e) => setFiltrosTemporarios({ ...filtrosTemporarios, nome: e.target.value })}
                    placeholder="Filtrar por nome..."
                  />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Email</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={filtrosTemporarios.email}
                    onChange={(e) => setFiltrosTemporarios({ ...filtrosTemporarios, email: e.target.value })}
                    placeholder="Filtrar por email..."
                  />
                </div>
              </div>

              <div className="modal-form-row">
                <div className="modal-field">
                  <label className="modal-label">Cargo</label>
                  <select
                    className="modal-input"
                    value={filtrosTemporarios.cargo}
                    onChange={(e) => setFiltrosTemporarios({ ...filtrosTemporarios, cargo: e.target.value })}
                  >
                    <option value="todos">Todos</option>
                    {cargos.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="modal-field">
                  <label className="modal-label">Status</label>
                  <select
                    className="modal-input"
                    value={filtrosTemporarios.status}
                    onChange={(e) => setFiltrosTemporarios({ ...filtrosTemporarios, status: e.target.value })}
                  >
                    <option value="todos">Todos</option>
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="modal-field">
                <label className="modal-label">Permissão</label>
                <select
                  className="modal-input"
                  value={filtrosTemporarios.permissao}
                  onChange={(e) => setFiltrosTemporarios({ ...filtrosTemporarios, permissao: e.target.value })}
                >
                  <option value="todos">Todos</option>
                  <option value="admin">Administrador</option>
                  <option value="usuario">Usuário Comum</option>
                </select>
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
      {/* Modal de Detalhes do Morador */}
      {modalDetalhes && (
        <div className="global-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setModalDetalhes(null); }}>
          <div className="global-modal details-modal" onMouseDown={(e) => e.stopPropagation()}>
            <button className="global-modal-close" onClick={() => setModalDetalhes(null)}>✕</button>
            <div className="modal-header">
              <EyeIcon style={{ width: 24, height: 24, marginRight: '10px', color: '#10b981' }} />
              <h3>Informações do Cadastro</h3>
            </div>

            <div className="details-content">
              <div className="details-photo-section">
                {modalDetalhes.foto ? (
                  <img 
                    src={modalDetalhes.foto.startsWith('data:image') ? modalDetalhes.foto : `/uploads/${modalDetalhes.foto}`} 
                    alt="Foto" 
                    className="details-photo" 
                  />
                ) : (
                  <div className="details-photo-placeholder">👤</div>
                )}
                <div className="details-main-info">
                  <h4>{modalDetalhes.nome} {modalDetalhes.sobrenome}</h4>
                  <span className="cargo-badge morador-badge">Morador</span>
                </div>
              </div>

              <div className="details-grid">
                <div className="detail-item">
                  <label>Email</label>
                  <span>{modalDetalhes.email}</span>
                </div>
                <div className="detail-item">
                  <label>Unidade</label>
                  <span>{modalDetalhes.unidade || "Não informada"}</span>
                </div>
                <div className="detail-item">
                  <label>Documento</label>
                  <span>{modalDetalhes.documento || "Não informado"}</span>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <span className={`status-badge ${modalDetalhes.ativo ? "ativo" : "inativo"}`}>
                    {modalDetalhes.ativo ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Data de Cadastro</label>
                  <span>{new Date(modalDetalhes.data_criacao).toLocaleDateString("pt-BR")}</span>
                </div>
                <div className="detail-item">
                  <label>ID do Usuário</label>
                  <span>#{modalDetalhes.id}</span>
                </div>
              </div>

              {modalDetalhes.veiculos && modalDetalhes.veiculos.length > 0 && (
                <div className="details-vehicles-section">
                  <label className="section-label">Veículos Cadastrados</label>
                  <div className="details-vehicles-list">
                    {modalDetalhes.veiculos.map((v, idx) => (
                      <div key={idx} className="detail-vehicle-card">
                        <CarIcon className="summary-card-icon" />
                        <div className="summary-badges-container">
                          <span className="summary-badge plate">{v.placa}</span>
                          <span className="summary-badge brand">{v.marca}</span>
                          <span className="summary-badge model">{v.modelo}</span>
                          <span className="summary-badge color">{v.cor}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button 
                className="submit-btn" 
                onClick={() => setModalDetalhes(null)}
                style={{ marginTop: '20px', width: '100%' }}
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VEICULOS */}
      {modalVeiculos && (
        <div className="global-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) cancelarVeiculos(); }}>
          <div className="global-modal vehicles-modal" onMouseDown={(e) => e.stopPropagation()}>
            <button className="global-modal-close" onClick={cancelarVeiculos}>✕</button>
            <div className="modal-header">
              <CarIcon style={{ width: 24, height: 24, marginRight: '10px', color: 'var(--primary-light)' }} />
              <h3>Cadastro de Veículos do Morador</h3>
            </div>

            <div className="modal-form">
              <div className="vehicles-list">
                {tempVeiculos.map((v, idx) => (
                  <div key={idx} className="vehicle-input-row">
                    <div className="input-with-label">
                      <label>Placa</label>
                      <input
                        type="text"
                        value={v.placa}
                        onChange={(e) => handleVeiculoChange(idx, "placa", e.target.value)}
                        placeholder="ABC-1234"
                        className="plate-input"
                      />
                    </div>
                    <div className="input-with-label">
                      <label>Marca</label>
                      <input
                        type="text"
                        value={v.marca}
                        onChange={(e) => handleVeiculoChange(idx, "marca", e.target.value)}
                        placeholder="Marca"
                      />
                    </div>
                    <div className="input-with-label">
                      <label>Modelo</label>
                      <input
                        type="text"
                        value={v.modelo}
                        onChange={(e) => handleVeiculoChange(idx, "modelo", e.target.value)}
                        placeholder="Modelo"
                      />
                    </div>
                    <div className="input-with-label">
                      <label>Cor</label>
                      <input
                        type="text"
                        value={v.cor}
                        onChange={(e) => handleVeiculoChange(idx, "cor", e.target.value)}
                        placeholder="Cor"
                      />
                    </div>
                    <button 
                      type="button" 
                      className="remove-vehicle-btn"
                      onClick={() => removeVeiculoRow(idx)}
                      title="Remover Veículo"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="modal-actions-left">
                <button type="button" className="add-vehicle-btn" onClick={addVeiculoRow}>
                  <PlusIcon style={{ width: 18, height: 18 }} />
                  <span>Adicionar outro carro</span>
                </button>
              </div>

              <div className="modal-footer" style={{ marginTop: '20px' }}>
                <button
                  type="button"
                  className="submit-btn"
                  onClick={confirmarVeiculos}
                  style={{ width: '100%' }}
                >
                  Confirmar Cadastro de Veículos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal da Webcam */}
      {modalWebcam && (
        <div className="global-modal-overlay webcam-overlay" onClick={closeWebcamModal}>
          <div className="global-modal webcam-modal" onClick={e => e.stopPropagation()}>
            <button className="global-modal-close" onClick={closeWebcamModal}>✕</button>
            <div className="modal-header">
              <span className="modal-header-icon">📷</span>
              <h3>Capturar Foto</h3>
            </div>
            <div className="webcam-container">
              <video ref={videoRef} autoPlay playsInline className="webcam-video" />
              <div className="webcam-controls">
                <button type="button" className="capture-btn" onClick={capturePhoto}>
                  <div className="capture-btn-inner"></div>
                </button>
              </div>
            </div>
            <p className="webcam-hint">Posicione o rosto no centro da imagem</p>
          </div>
        </div>
      )}

      {/* Input Oculto para mobile/camera nativa */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={webcamTarget === 'cadastro' ? handleFotoChange : handleEditFotoChange}
      />
    </div>
  );
}
