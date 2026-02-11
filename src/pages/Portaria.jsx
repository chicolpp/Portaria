import { useState, useEffect } from "react";
import api from "../services/api";
import { toast } from "sonner";
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

const ToolboxIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5l2-3h2l2 3h5a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);

const PlusIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default function Portaria() {
  const [activeTab, setActiveTab] = useState("cadastro");
  const [acessos, setAcessos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    sobrenome: "",
    documento: "",
    placa: "",
    marca: "",
    modelo: "",
    cor: "",
  });

  // State para Itens
  const [itens, setItens] = useState([]);
  const [loadingItens, setLoadingItens] = useState(false);
  const [newItemNome, setNewItemNome] = useState("");
  const [retiradaData, setRetiradaData] = useState({
    nome_morador: "",
    apartamento: "",
    bloco: "",
  });
  const [itemParaRetirar, setItemParaRetirar] = useState(null);
  const [showModalRetirada, setShowModalRetirada] = useState(false);

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
      await api.post(`/acessos/${id}/saida`);
      toast.success("Saída registrada com sucesso!");
      fetchAcessos();
    } catch (error) {
      toast.error("Erro ao registrar saída");
      console.error(error);
    }
  };

  useEffect(() => {
    if (activeTab === "visualizacao") {
      fetchAcessos();
    }
    if (activeTab === "gestao-itens") {
      fetchItens();
    }
  }, [activeTab]);

  const fetchItens = async () => {
    setLoadingItens(true);
    try {
      const resp = await api.get("/itens");
      setItens(resp.data.itens);
    } catch (err) {
      toast.error("Erro ao buscar itens");
    } finally {
      setLoadingItens(false);
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    if (!newItemNome) return;
    try {
      await api.post("/itens", { nome: newItemNome });
      toast.success("Item cadastrado!");
      setNewItemNome("");
      fetchItens();
    } catch (err) {
      toast.error("Erro ao cadastrar item");
    }
  };

  const handleWithdrawItem = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/itens/${itemParaRetirar.id}/retirar`, retiradaData);
      toast.success("Retirada registrada!");
      setShowModalRetirada(false);
      setRetiradaData({ nome_morador: "", apartamento: "", bloco: "" });
      fetchItens();
    } catch (err) {
      toast.error("Erro ao registrar retirada");
    }
  };

  const handleReturnItem = async (id) => {
    try {
      await api.post(`/itens/${id}/devolver`);
      toast.success("Devolução registrada!");
      fetchItens();
    } catch (err) {
      toast.error("Erro ao registrar devolução");
    }
  };

  const openModalRetirada = (item) => {
    setItemParaRetirar(item);
    setShowModalRetirada(true);
  };

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
        <button
          type="button"
          className={`portaria-tab-btn ${activeTab === "gestao-itens" ? "active" : ""}`}
          onClick={() => setActiveTab("gestao-itens")}
        >
          <ToolboxIcon className="section-icon" style={{ width: 22, height: 22 }} /> Gestão de Itens
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

            <div className="form-group">
              <label>Documento (RG/CPF):</label>
              <input
                type="text"
                name="documento"
                value={formData.documento}
                onChange={handleChange}
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
              />
            </div>

            <div className="form-group">
              <label>Marca:</label>
              <input
                type="text"
                name="marca"
                value={formData.marca}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Modelo:</label>
              <input
                type="text"
                name="modelo"
                value={formData.modelo}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Cor:</label>
              <input
                type="text"
                name="cor"
                value={formData.cor}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Cadastrando..." : "Cadastrar Acesso"}
            </button>
          </form>
        )}

        {activeTab === "visualizacao" && (
          <div className="visualizacao">
            <h2><ListIcon className="section-icon" /> Visualização de Acessos</h2>
            {acessos.length === 0 ? (
              <p>Nenhum acesso cadastrado ainda.</p>
            ) : (
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
                  {acessos.map((a) => (
                    <tr key={a.id}>
                      <td>{a.id}</td>
                      <td>{a.nome}</td>
                      <td>{a.sobrenome}</td>
                      <td>{a.documento}</td>
                      <td>{a.placa}</td>
                      <td>{a.marca}</td>
                      <td>{a.modelo}</td>
                      <td>{a.cor}</td>
                      <td>{a.data_entrada ? new Date(a.data_entrada).toLocaleString("pt-BR") : "-"}</td>
                      <td>
                        {a.data_saida ? (
                          <span className="status-saida-registrada">
                            ✓ {new Date(a.data_saida).toLocaleString("pt-BR")}
                          </span>
                        ) : (
                          <span className="status-presente">🟢 Presente</span>
                        )}
                      </td>
                      <td>
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "liberacao" && (
          <div className="liberacao">
            <h2><ShieldCheckIcon className="section-icon" /> Liberação de Acessos</h2>
            <p>Funcionalidade em desenvolvimento...</p>
          </div>
        )}
        {activeTab === "gestao-itens" && (
          <div className="gestao-itens">
            <h2><ToolboxIcon className="section-icon" /> Gestão de Itens da Portaria</h2>

            {/* Cadastro rápido que nem chaves */}
            <div className="quick-add-container">
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Nome do novo item..."
                  value={newItemNome}
                  onChange={(e) => setNewItemNome(e.target.value)}
                />
              </div>
              <button
                onClick={handleCreateItem}
                className="submit-btn"
              >
                <PlusIcon style={{ width: 18, height: 18, marginRight: '8px' }} /> Adicionar Item
              </button>
            </div>

            {loadingItens ? (
              <p>Carregando itens...</p>
            ) : itens.length === 0 ? (
              <p>Nenhum item cadastrado.</p>
            ) : (
              <table className="acessos-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Status</th>
                    <th>Retirado Por</th>
                    <th>Unidade</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {itens.map((item) => (
                    <tr key={item.id}>
                      <td><strong>{item.nome}</strong></td>
                      <td>
                        {item.disponivel ? (
                          <span className="status-presente">🟢 Disponível</span>
                        ) : (
                          <span className="status-saida-registrada">🔴 Retirado</span>
                        )}
                      </td>
                      <td>{item.retirado_por || "-"}</td>
                      <td>{item.apartamento ? `${item.apartamento} - ${item.bloco}` : "-"}</td>
                      <td>
                        {item.disponivel ? (
                          <button
                            type="button"
                            className="admin-btn-small edit-btn"
                            onClick={() => openModalRetirada(item)}
                            data-tooltip="Retirar Item"
                          >
                            <LogOutIcon style={{ width: 14, height: 14 }} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="admin-btn-small ver-btn"
                            onClick={() => handleReturnItem(item.id)}
                            data-tooltip="Devolver Item"
                          >
                            <ShieldCheckIcon style={{ width: 14, height: 14 }} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Modal de Retirada (Estilo similar ao de chaves) */}
        {showModalRetirada && (
          <div className="modal-overlay" onClick={() => setShowModalRetirada(false)}>
            <div className="retirada-modal" onClick={e => e.stopPropagation()}>
              <h3>Retirar {itemParaRetirar?.nome}</h3>
              <form onSubmit={handleWithdrawItem}>
                <div className="form-group">
                  <label>Morador / Solicitante:</label>
                  <input
                    type="text"
                    required
                    value={retiradaData.nome_morador}
                    onChange={(e) => setRetiradaData({ ...retiradaData, nome_morador: e.target.value })}
                  />
                </div>
                <div className="retirada-grid">
                  <div className="form-group">
                    <label>Apto:</label>
                    <input
                      type="text"
                      required
                      value={retiradaData.apartamento}
                      onChange={(e) => setRetiradaData({ ...retiradaData, apartamento: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Bloco:</label>
                    <input
                      type="text"
                      required
                      value={retiradaData.bloco}
                      onChange={(e) => setRetiradaData({ ...retiradaData, bloco: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowModalRetirada(false)}>Cancelar</button>
                  <button type="submit" className="submit-btn">Confirmar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
