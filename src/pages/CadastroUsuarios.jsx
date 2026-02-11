import { useState, useEffect } from "react";
import api from "../services/api";
import { toast } from "sonner";
import "./CadastroUsuarios.css";

export default function CadastroUsuarios() {
  const [activeTab, setActiveTab] = useState("cadastro");
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalEditar, setModalEditar] = useState(null);
  const [formData, setFormData] = useState({
    nome: "",
    sobrenome: "",
    email: "",
    password: "",
    confirmPassword: "",
    cargo: "porteiro",
    is_admin: false,
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
  });
  const [editFotoFile, setEditFotoFile] = useState(null);
  const [editFotoPreview, setEditFotoPreview] = useState(null);
  const [cargoDropdownOpen, setCargoDropdownOpen] = useState(false);

  const cargos = [
    { value: "porteiro", label: "Porteiro" },
    { value: "supervisor", label: "Supervisor" },
    { value: "zelador", label: "Zelador" },
    { value: "sindico", label: "Síndico" },
    { value: "administrador", label: "Administrador" },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFotoFile(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: type === "checkbox" ? checked : value,
    });
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
      if (fotoFile) {
        data.append("foto", fotoFile);
      }

      await api.post("/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Usuário cadastrado com sucesso!");
      setFormData({
        nome: "",
        sobrenome: "",
        email: "",
        password: "",
        confirmPassword: "",
        cargo: "porteiro",
        is_admin: false,
      });
      setFotoFile(null);
      setFotoPreview(null);
    } catch (error) {
      toast.error(error.response?.data?.error || "Erro ao cadastrar usuário");
      console.error(error);
    } finally {
      setLoading(false);
    }
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
    });
    setEditFotoFile(null);
    setEditFotoPreview(usuario.foto ? `/uploads/${usuario.foto}` : null);
  };

  const closeEditarModal = () => {
    setModalEditar(null);
    setEditFotoFile(null);
    setEditFotoPreview(null);
  };

  const handleEditFotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditFotoFile(file);
      setEditFotoPreview(URL.createObjectURL(file));
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

  return (
    <div className="usuarios-container">
      {/* MODAL EDITAR */}
      {modalEditar && (
        <div className="modal-overlay" onClick={closeEditarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeEditarModal}>✕</button>
            <h3>Editar Usuário</h3>
            <form className="modal-form" onSubmit={handleEditSubmit}>
              <div className="form-group foto-edit-group">
                <label>Foto do Usuário:</label>
                <div className="foto-edit-container">
                  {editFotoPreview ? (
                    <img src={editFotoPreview} alt="Preview" className="foto-edit-preview" />
                  ) : (
                    <div className="foto-edit-placeholder">👤</div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditFotoChange}
                    id="edit-foto-input"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="edit-foto-input" className="foto-edit-btn">
                    📷 Alterar Foto
                  </label>
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

              <div className="edit-toggles-row">
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
          ➕ Novo Usuário
        </button>
        <button
          type="button"
          className={`usuarios-tab-btn ${activeTab === "visualizacao" ? "active" : ""}`}
          onClick={() => setActiveTab("visualizacao")}
        >
          👥 Gerenciar Usuários
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="tab-content">
        {activeTab === "cadastro" && (
          <form className="cadastro-form" onSubmit={handleSubmit}>
            <h2>Cadastro de Usuário</h2>

            {/* Seção Foto + Dados Pessoais */}
            <div className="secao-foto-dados">
              <div className="foto-upload-box">
                <div className="foto-preview">
                  {fotoPreview ? (
                    <img src={fotoPreview} alt="Preview" />
                  ) : (
                    <span className="foto-placeholder">👤</span>
                  )}
                </div>
                <label className="foto-upload-btn">
                  📷 Escolher Foto
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFotoChange}
                    hidden
                  />
                </label>
              </div>

              <div className="dados-pessoais">
                <div className="form-group">
                  <label>Nome:</label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
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
                          setFormData({ ...formData, cargo: c.value });
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

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Cadastrando..." : "Cadastrar Usuário"}
            </button>
          </form>
        )}

        {activeTab === "visualizacao" && (
          <div className="visualizacao">
            <h2>Gerenciamento de Usuários</h2>
            {usuarios.length === 0 ? (
              <p>Nenhum usuário cadastrado ainda.</p>
            ) : (
              <table className="usuarios-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Cargo</th>
                    <th>Permissão</th>
                    <th>Status</th>
                    <th>Cadastro</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => (
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
                          className="btn-editar"
                          onClick={() => openEditarModal(u)}
                          data-tooltip="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className={`btn-toggle ${u.ativo ? "desativar" : "ativar"}`}
                          onClick={() => toggleStatus(u.id)}
                          data-tooltip={u.ativo ? "Desativar" : "Ativar"}
                        >
                          {u.ativo ? "🔒" : "🔓"}
                        </button>
                        <button
                          type="button"
                          className="btn-excluir"
                          onClick={() => deletarUsuario(u.id)}
                          data-tooltip="Excluir"
                        >
                          🗑️
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
