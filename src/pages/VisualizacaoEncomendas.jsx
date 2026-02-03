import { useState, useEffect } from "react";
import api from "../services/api";
import "./Encomendas.css";

export default function VisualizacaoEncomendas() {
  const [encomendas, setEncomendas] = useState([]);

  const fetchEncomendas = async () => {
    try {
      const response = await api.get("/encomendas");
      setEncomendas(response.data.encomendas);
    } catch (error) {
      console.error("Erro ao buscar encomendas:", error);
    }
  };

  useEffect(() => {
    fetchEncomendas();
  }, []);

  return (
    <div className="encomendas-container">
      <div className="tab-content">
        <div className="visualizacao">
          <h2>Visualização de Encomendas</h2>
          {encomendas.length === 0 ? (
            <p>Nenhuma encomenda cadastrada ainda.</p>
          ) : (
            <table className="encomendas-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Unidade</th>
                  <th>Documento</th>
                  <th>Página</th>
                  <th>Data</th>
                  <th>Hora</th>
                </tr>
              </thead>
              <tbody>
                {encomendas.map((e) => (
                  <tr key={e.id}>
                    <td>{e.nome}</td>
                    <td>{e.unidade}</td>
                    <td>{e.documento}</td>
                    <td>{e.pagina}</td>
                    <td>{e.data_recebimento}</td>
                    <td>{e.hora_recebimento}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
