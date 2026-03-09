import React from 'react';
import Flatpickr from 'react-flatpickr';

/**
 * CustomFlatpickr Wrapper
 * 
 * Intercepts the react-flatpickr component to fix a bug in version 4.0.11
 * where the `options` object prop is leaked directly into the HTML <input> DOM node.
 */
const CustomFlatpickr = React.forwardRef(({ options, className, placeholder, children, ...props }, ref) => {
    const internalRef = React.useRef(null);
    const wrapperRef = React.useRef(null);

    // Filter illegal props
    const {
        dangerouslySetInnerHTML: _h,
        options: _o,
        ...safeProps
    } = props;

    // NOVO: Clique fora para fechar obrigatoriamente (Usando capture para ignorar stopPropagation)
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            const fp = internalRef.current?.flatpickr;
            if (fp && fp.isOpen) {
                // Se clicar fora do wrapper e do calendário
                const isInsideWrapper = wrapperRef.current?.contains(event.target);
                const isInsideCalendar = fp.calendarContainer?.contains(event.target);

                if (!isInsideWrapper && !isInsideCalendar) {
                    fp.close();
                }
            }
        };

        // Capture: true permite detectar o clique mesmo que o modal dê stopPropagation
        document.addEventListener('mousedown', handleClickOutside, true);
        return () => document.removeEventListener('mousedown', handleClickOutside, true);
    }, []);

    // Toggle logic: Use mousedown to check state BEFORE Flatpickr reacts.
    const handleMouseDown = (e) => {
        const fp = internalRef.current?.flatpickr;
        if (!fp) return;

        if (fp.isOpen) {
            fp.close();
            e.preventDefault();
            e.stopPropagation();
        }
    };

    return (
        <div
            ref={wrapperRef}
            onMouseDown={handleMouseDown}
            className="custom-flatpickr-wrapper"
            style={{
                width: '100%',
                position: 'relative',
                zIndex: internalRef.current?.flatpickr?.isOpen ? 21000 : 'auto'
            }}
        >
            <Flatpickr
                {...safeProps}
                options={options}
                ref={(node) => {
                    internalRef.current = node;
                    if (typeof ref === 'function') ref(node);
                    else if (ref) ref.current = node;
                }}
                className={className}
                placeholder={placeholder}
            />
        </div>
    );
});

CustomFlatpickr.displayName = 'CustomFlatpickr';

export default CustomFlatpickr;
