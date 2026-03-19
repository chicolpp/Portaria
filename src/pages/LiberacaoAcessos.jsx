import { useState, useEffect, useMemo } from "react";
import api from "../services/api";
import { formatDateTime } from "../utils/formatters";
import "./Portaria.css";

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

const CheckIcon = ({ className, style }) => (
  <svg className={className} style={{ width: 16, height: 16, ...style }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function LiberacaoAcessos() {
  const [acessos, setAcessos] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

  // Pega a unidade do morador atual
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userUnidade = user?.unidade || "";

  useEffect(() => {
    fetchAcessos();
  }, []);

  const fetchAcessos = async () => {
    try {
      const response = await api.get("/acessos");
      setAcessos(response.data.acessos);
    } catch (error) {
      console.error("Erro ao buscar acessos:", error);
    }
  };

  const acessosFiltrados = useMemo(() => {
    // Filtra apenas os acessos da unidade do usuário logado
    const filtrados = acessos.filter(a => a.unidade === userUnidade);

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
  }, [acessos, sortConfig, userUnidade]);

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
    <div className="portaria-container">
      <div className="visualizacao" style={{ marginTop: '20px' }}>
        <div className="visualizacao-header">
          <h2>Visualização de Acessos - Unidade {userUnidade}</h2>
        </div>
        {acessosFiltrados.length === 0 ? (
          <p>Nenhum acesso registrado para sua unidade.</p>
        ) : (
          <div className="responsive-table-container">
            {/* Desktop Table */}
            <table className="acessos-table desktop-only-table">
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
                </tr>
              </thead>
              <tbody>
                {acessosFiltrados.map((a) => (
                  <tr key={a.id}>
                    <td>{a.id}</td>
                    <td>{a.nome} {a.sobrenome}</td>
                    <td>{a.documento}</td>
                    <td>{a.placa}</td>
                    <td>{a.marca}</td>
                    <td>{a.modelo}</td>
                    <td>{a.cor}</td>
                    <td>{formatDateTime(a.data_entrada)}</td>
                    <td>
                      {a.data_saida ? (
                        <span className="status-saida-registrada">
                          <CheckIcon /> {formatDateTime(a.data_saida)}
                        </span>
                      ) : (
                        <span className="status-presente">🟢 Presente</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="mobile-cards-container mobile-only-cards">
              {acessosFiltrados.map((a) => (
                <div key={a.id} className="mobile-access-card">
                  <div className="card-header">
                    <span className="card-id">#{a.id}</span>
                    <div className="card-status">
                      {a.data_saida ? (
                        <span className="status-saida-registrada">
                          <CheckIcon /> Saída: {formatDateTime(a.data_saida)}
                        </span>
                      ) : (
                        <span className="status-presente">🟢 Presente</span>
                      )}
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="card-row">
                      <label>Nome:</label>
                      <span>{a.nome} {a.sobrenome}</span>
                    </div>
                    <div className="card-row">
                      <label>Documento:</label>
                      <span>{a.documento}</span>
                    </div>
                    {a.placa && (
                      <>
                        <div className="card-row">
                          <label>Veículo:</label>
                          <span>{a.marca} {a.modelo} ({a.cor})</span>
                        </div>
                        <div className="card-row">
                          <label>Placa:</label>
                          <span className="placa-badge">{a.placa}</span>
                        </div>
                      </>
                    )}
                    <div className="card-row">
                      <label>Entrada:</label>
                      <span>{formatDateTime(a.data_entrada)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
