import React, { useState, useEffect, useMemo } from "react";
import api from "../services/api";
import { formatDate, formatTime } from "../utils/formatters";
import "./Encomendas.css";

const PackageIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m7.5 4.27 9 5.15" />
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </svg>
);

const EyeIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const PencilIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const BoxIcon = PackageIcon;

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

export default function VisualizacaoEncomendas() {
  const [encomendas, setEncomendas] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  const [modalFoto, setModalFoto] = useState(null);
  const [isViewingSignature, setIsViewingSignature] = useState(false);

  // Usuário logado
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userUnidade = user?.unidade || "";

  useEffect(() => {
    fetchEncomendas();
  }, []);

  const fetchEncomendas = async () => {
    setFetchLoading(true);
    try {
      const response = await api.get("/encomendas");
      const data = response.data.encomendas || [];
      setEncomendas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro na API:", error);
      setEncomendas([]);
    } finally {
      setFetchLoading(false);
    }
  };

  const encomendasFiltradas = useMemo(() => {
    // Filtrar apenas da unidade
    const filtradas = encomendas.filter(e => e.unidade === userUnidade);

    if (sortConfig.key) {
      filtradas.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (valA === null || valA === undefined) valA = '';
        if (valB === null || valB === undefined) valB = '';

        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
          if (sortConfig.direction === 'asc') return valA.localeCompare(valB);
          else return valB.localeCompare(valA);
        } else {
          if (sortConfig.direction === 'asc') return valA > valB ? 1 : -1;
          else return valA < valB ? 1 : -1;
        }
      });
    }

    return filtradas;
  }, [encomendas, sortConfig, userUnidade]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => <SortIcon active={sortConfig.key === key} direction={sortConfig.direction} />;

  const openFotoModal = (fotoUrl, isSignature = false) => {
    setModalFoto(fotoUrl);
    setIsViewingSignature(isSignature);
  };
  const closeFotoModal = () => {
    setModalFoto(null);
    setIsViewingSignature(false);
  };

  return (
    <div className="encomendas-container">
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
                  <h3>Assinatura de Retirada</h3>
                </div>
                <div className="modal-signature-view">
                  <img src={modalFoto} alt="Assinatura" style={{width:'100%', height:'auto'}} />
                </div>
              </>
            ) : (
              <>
                <div className="modal-header">
                  <span className="modal-header-icon">📦</span>
                  <h3>Foto da Encomenda</h3>
                </div>
                <div className="modal-photo-view">
                  <img src={modalFoto} alt="Foto" style={{maxWidth:'100%', maxHeight:'60vh', objectFit:'contain'}} />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="visualizacao" style={{ marginTop: '20px' }}>
        <div className="visualizacao-header">
          <h2><BoxIcon className="section-icon" style={{ width: 22, height: 22 }} /> Visualização de Encomendas - Unidade {userUnidade}</h2>
        </div>
        
        {fetchLoading ? (
          <div className="loading-container" style={{ textAlign: 'center', padding: '40px' }}>
            <p>Carregando encomendas...</p>
          </div>
        ) : encomendasFiltradas.length === 0 ? (
          <p>Nenhuma encomenda registrada para sua unidade.</p>
        ) : (
          <div className="responsive-table-container">
            {/* Desktop Table */}
            <table className="encomendas-table desktop-only-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('id')} className="sortable-th">
                    <div className="th-content">ID {getSortIcon('id')}</div>
                  </th>
                  <th onClick={() => handleSort('nome')} className="sortable-th">
                    <div className="th-content">Nome Destinatário {getSortIcon('nome')}</div>
                  </th>
                  <th onClick={() => handleSort('documento')} className="sortable-th">
                    <div className="th-content">Cod. Rastreamento {getSortIcon('documento')}</div>
                  </th>
                  <th onClick={() => handleSort('data_recebimento')} className="sortable-th">
                    <div className="th-content">Data/Hora Recebido {getSortIcon('data_recebimento')}</div>
                  </th>
                  <th>Foto da Chegada</th>
                  <th onClick={() => handleSort('retirado')} className="sortable-th">
                    <div className="th-content">Status {getSortIcon('retirado')}</div>
                  </th>
                  <th onClick={() => handleSort('nome_retirada')} className="sortable-th">
                    <div className="th-content">Dados de Retirada {getSortIcon('nome_retirada')}</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {encomendasFiltradas.map((e) => (
                  <tr key={e.id}>
                    <td>{e.id}</td>
                    <td>{e.nome}</td>
                    <td>{e.documento || "—"}</td>
                    <td>{formatDate(e.data_recebimento)} {formatTime(e.hora_recebimento)}</td>
                    <td>
                      {e.foto ? (
                        <button
                          type="button"
                          className="admin-btn-small ver-btn"
                          onClick={() => openFotoModal(e.foto)}
                          title="Ver Foto da Chegada"
                        >
                          <EyeIcon style={{ width: 14, height: 14 }} /> Ver Foto
                        </button>
                      ) : "—"}
                    </td>
                    <td>
                      {e.retirado ? (
                        <span className="status-retirado">✓ Retirado</span>
                      ) : (
                        <span className="status-aguardando">⏳ Aguardando Retirada</span>
                      )}
                    </td>
                    <td>
                      {e.retirado ? (
                        <div className="retirada-info-cell">
                          <span><strong>{e.nome_retirada}</strong></span>
                          <span>{formatDate(e.data_retirada)} {formatTime(e.hora_retirada)}</span>
                          {e.assinatura && (
                            <button
                              type="button"
                              className="admin-btn-small ver-btn"
                              onClick={() => openFotoModal(e.assinatura, true)}
                              title="Ver Assinatura de Retirada"
                              style={{marginTop: 4}}
                            >
                              <PencilIcon style={{ width: 14, height: 14 }} /> Assinatura
                            </button>
                          )}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="mobile-cards-container mobile-only-cards">
              {encomendasFiltradas.map((e) => (
                <div key={e.id} className="mobile-access-card">
                  <div className="card-header">
                    <span className="card-id">#{e.id}</span>
                    <div className="card-status">
                      {e.retirado ? (
                        <span className="status-retirado">✓ Retirado</span>
                      ) : (
                        <span className="status-aguardando">⏳ Aguardando</span>
                      )}
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="card-row">
                      <label>Nome:</label>
                      <span>{e.nome}</span>
                    </div>
                    {e.documento && (
                      <div className="card-row">
                        <label>Rastreamento:</label>
                        <span>{e.documento}</span>
                      </div>
                    )}
                    <div className="card-row">
                      <label>Recebimento:</label>
                      <span>{formatDate(e.data_recebimento)} {formatTime(e.hora_recebimento)}</span>
                    </div>
                    {e.retirado && (
                      <div className="card-row highlighted-retirada">
                        <label>Retirada por:</label>
                        <span>{e.nome_retirada} ({formatDate(e.data_retirada)} {formatTime(e.hora_retirada)})</span>
                      </div>
                    )}
                  </div>
                  <div className="card-actions">
                    {e.foto && (
                      <button
                        type="button"
                        className="admin-btn-small ver-btn mobile-action-btn"
                        onClick={() => openFotoModal(e.foto)}
                      >
                        <EyeIcon style={{ width: 16, height: 16 }} />
                        <span>Ver Foto Recib.</span>
                      </button>
                    )}
                    {e.assinatura && (
                      <button
                        type="button"
                        className="admin-btn-small ver-btn mobile-action-btn"
                        onClick={() => openFotoModal(e.assinatura, true)}
                      >
                        <PencilIcon style={{ width: 16, height: 16 }} />
                        <span>Assinatura Retirada</span>
                      </button>
                    )}
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
