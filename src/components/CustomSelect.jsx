import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './CustomSelect.css';

const CustomSelect = ({ options, value, onChange, placeholder, className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    const dropdownRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value);

    const updateCoords = () => {
        if (dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
    };

    const toggleOpen = () => {
        if (!isOpen) {
            updateCoords();
        }
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Se clicar fora do trigger E fora das opções (que estão em um portal)
            const portalMenu = document.getElementById('custom-select-portal-menu');
            if (isOpen &&
                dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                portalMenu && !portalMenu.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            window.addEventListener('scroll', updateCoords, true);
            window.addEventListener('resize', updateCoords);
            document.addEventListener('mousedown', handleClickOutside, true);
        }

        return () => {
            window.removeEventListener('scroll', updateCoords, true);
            window.removeEventListener('resize', updateCoords);
            document.removeEventListener('mousedown', handleClickOutside, true);
        };
    }, [isOpen]);

    const handleSelect = (optionValue) => {
        onChange({ target: { value: optionValue } });
        setIsOpen(false);
    };

    const dropdownMenu = (
        <ul
            id="custom-select-portal-menu"
            className="custom-select-options portal-dropdown"
            onMouseDown={(e) => e.stopPropagation()}
            style={{
                position: 'absolute',
                top: `${coords.top + 8}px`,
                left: `${coords.left}px`,
                width: `${coords.width}px`,
                zIndex: 999999
            }}
        >
            {options.map((option) => (
                <li
                    key={option.value}
                    className={`custom-select-option ${value === option.value ? 'selected' : ''}`}
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        handleSelect(option.value);
                    }}
                >
                    {option.label}
                    {value === option.value && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    )}
                </li>
            ))}
        </ul>
    );

    return (
        <div className={`custom-select-container ${className}`} ref={dropdownRef}>
            <div
                className={`custom-select-trigger ${isOpen ? 'active' : ''}`}
                onClick={toggleOpen}
            >
                <span>{selectedOption ? selectedOption.label : placeholder}</span>
                <svg
                    className={`select-arrow ${isOpen ? 'open' : ''}`}
                    width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </div>

            {isOpen && ReactDOM.createPortal(dropdownMenu, document.body)}
        </div>
    );
};

export default CustomSelect;
