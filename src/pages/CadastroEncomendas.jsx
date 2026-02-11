import { useState } from "react";
import api from "../services/api";
import { useToast } from "../components/Toast";
import "./Encomendas.css";

export default function CadastroEncomendas() {
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/encomendas", formData);
      alert("Encomenda cadastrada com sucesso!");
      setFormData({
        nome: "",
        unidade: "",
        documento: "",
        pagina: "",
        dataRecebimento: "",
        horaRecebimento: "",
      });
    } catch (error) {
      alert("Erro ao cadastrar encomenda");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="encomendas-container">
      <div className="tab-content">
        <form className="cadastro-form" onSubmit={handleSubmit}>
          <h2>Cadastro de Encomendas</h2>

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
            <label>Unidade:</label>
            <input
              type="text"
              name="unidade"
              value={formData.unidade}
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
              required
            />
          </div>

          <div className="form-group">
            <label>Hora de Recebimento:</label>
            <input
              type="time"
              name="horaRecebimento"
              value={formData.horaRecebimento}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar Encomenda"}
          </button>
        </form>
      </div>
    </div>
  );
}
