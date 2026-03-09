import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import api from '../services/api';
import './CustomSelect.css';
import './PlateSearch.css';

const PlateSearch = ({ onSelect, searchField = "placa", placeholder, className = "" }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    const containerRef = useRef(null);

    const defaultPlaceholder = searchField === "placa"
        ? "Pesquise por placas cadastradas"
        : "Pesquise por documentos cadastrados";

    const MagnifyingGlassIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    );

    const IDCardIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M7 8h10M7 12h10M7 16h4" />
        </svg>
    );

    const updateCoords = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
    };

    useEffect(() => {
        const fetchResults = async () => {
            if (searchTerm.length < 2) {
                setResults([]);
                setIsOpen(false);
                return;
            }

            setLoading(true);
            try {
                const response = await api.get(`/acessos/search?q=${searchTerm}&field=${searchField}`);
                setResults(response.data.acessos || []);
                setIsOpen(response.data.acessos?.length > 0);
                updateCoords();
            } catch (error) {
                console.error("Erro ao pesquisar:", error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchResults, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, searchField]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            const isDropdownClick = event.target.closest('.portal-dropdown');
            if (containerRef.current && !containerRef.current.contains(event.target) && !isDropdownClick) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            window.addEventListener('scroll', updateCoords, true);
            window.addEventListener('resize', updateCoords);
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            window.removeEventListener('scroll', updateCoords, true);
            window.removeEventListener('resize', updateCoords);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = (access) => {
        onSelect(access);
        setSearchTerm("");
        setResults([]);
        setIsOpen(false);
    };

    return (
        <div className={`custom-select-container plate-search-container ${className}`} ref={containerRef}>
            <div className="search-input-wrapper">
                <div className="search-icon-container">
                    {searchField === "placa" ? <MagnifyingGlassIcon /> : <IDCardIcon />}
                </div>
                <input
                    type="text"
                    className="custom-select-trigger plate-search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                    placeholder={placeholder || defaultPlaceholder}
                    onFocus={() => {
                        updateCoords();
                        if (searchTerm.length >= 2 && results.length > 0) setIsOpen(true);
                    }}
                />
                {loading && (
                    <div className="search-loader">
                        <div className="spinner"></div>
                    </div>
                )}
            </div>

            {isOpen && createPortal(
                <ul
                    className="custom-select-options portal-dropdown"
                    style={{
                        position: 'absolute',
                        top: `${coords.top - 26}px`,
                        left: `${coords.left}px`,
                        width: `${coords.width}px`,
                        zIndex: 9999999
                    }}
                >
                    {results.map((access) => (
                        <li
                            key={access.id}
                            className="custom-select-option"
                            onClick={() => handleSelect(access)}
                        >
                            <div className="plate-option-content">
                                <span className="plate-badge">{searchField === "placa" ? access.placa : (access.documento || "N/A")}</span>
                                <span className="plate-owner">{access.nome}</span>
                                <span className="plate-vehicle">{access.marca} {access.modelo}</span>
                            </div>
                        </li>
                    ))}
                </ul>,
                document.body
            )}
        </div>
    );
};

export default PlateSearch;
