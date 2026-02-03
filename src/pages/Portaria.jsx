import { useState, useEffect } from "react";
import api from "../services/api";
import "./Portaria.css";

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
      alert("Saída registrada com sucesso!");
      fetchAcessos();
    } catch (error) {
      alert("Erro ao registrar saída");
      console.error(error);
    }
  };

  useEffect(() => {
    if (activeTab === "visualizacao") {
      fetchAcessos();
    }
  }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/acessos", formData);
      alert("Acesso cadastrado com sucesso!");
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
      alert("Erro ao cadastrar acesso");
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
          📝 Cadastro de Acessos
        </button>
        <button
          type="button"
          className={`portaria-tab-btn ${activeTab === "visualizacao" ? "active" : ""}`}
          onClick={() => setActiveTab("visualizacao")}
        >
          📋 Visualização de Acessos
        </button>
        <button
          type="button"
          className={`portaria-tab-btn ${activeTab === "liberacao" ? "active" : ""}`}
          onClick={() => setActiveTab("liberacao")}
        >
          🔓 Liberação de Acessos
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="tab-content">
        {activeTab === "cadastro" && (
          <form className="cadastro-form" onSubmit={handleSubmit}>
            <h2>Cadastro de Acessos</h2>

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
            <h2>Visualização de Acessos</h2>
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
                          <span className="saida-trancada">🔒</span>
                        ) : (
                          <button
                            type="button"
                            className="registrar-saida-btn"
                            onClick={() => registrarSaida(a.id)}
                          >
                            🚪 Registrar Saída
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
            <h2>Liberação de Acessos</h2>
            <p>Funcionalidade em desenvolvimento...</p>
          </div>
        )}
      </div>
    </div>
  );
}
