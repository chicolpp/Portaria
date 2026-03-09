import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './PremiumSelect.css';

/**
 * PremiumSelect - A robust, stylish dropdown component rebuilt from scratch.
 * Resolves click-through bugs by using a portal-based backdrop.
 */
const PremiumSelect = ({
    options,
    value,
    onChange,
    placeholder = "Selecione uma opção",
    className = "",
    icon: TriggerIcon
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    const triggerRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value);

    const updateCoords = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
    };

    const handleToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isOpen) {
            updateCoords();
        }
        setIsOpen(!isOpen);
    };

    const handleSelect = (e, optionValue) => {
        e.preventDefault();
        e.stopPropagation();
        onChange(optionValue);
        setIsOpen(false);
    };

    const handleClose = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(false);
    };

    useEffect(() => {
        if (isOpen) {
            window.addEventListener('scroll', updateCoords, true);
            window.addEventListener('resize', updateCoords);
        }
        return () => {
            window.removeEventListener('scroll', updateCoords, true);
            window.removeEventListener('resize', updateCoords);
        };
    }, [isOpen]);

    return (
        <div className={`premium-select-container ${className}`} ref={triggerRef}>
            <button
                type="button"
                className={`premium-select-trigger ${isOpen ? 'active' : ''}`}
                onMouseDown={handleToggle}
            >
                <div className="trigger-content">
                    {TriggerIcon && <TriggerIcon className="trigger-icon" />}
                    <span>{selectedOption ? selectedOption.label : placeholder}</span>
                </div>
                <svg className={`trigger-arrow ${isOpen ? 'open' : ''}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </button>

            {isOpen && createPortal(
                <>
                    {/* The Backdrop: Physically blocks clicks to anything behind the menu */}
                    <div
                        className="premium-select-backdrop"
                        onMouseDown={handleClose}
                    />

                    <ul
                        className="premium-select-menu"
                        style={{
                            top: `${coords.top + 8}px`,
                            left: `${coords.left}px`,
                            width: `${coords.width}px`
                        }}
                    >
                        {options.map((option) => (
                            <li
                                key={option.value}
                                className={`premium-select-option ${value === option.value ? 'selected' : ''}`}
                                onMouseDown={(e) => handleSelect(e, option.value)}
                            >
                                <div className="option-label">
                                    {option.icon && <span className="option-icon">{option.icon}</span>}
                                    <span>{option.label}</span>
                                </div>
                                {value === option.value && (
                                    <svg className="selected-tick" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                )}
                            </li>
                        ))}
                    </ul>
                </>,
                document.body
            )}
        </div>
    );
};

export default PremiumSelect;
