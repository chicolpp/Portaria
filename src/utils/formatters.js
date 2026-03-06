/**
 * Formata uma string de data (ISO ou similar) para o padrão brasileiro DD/MM/YYYY.
 * @param {string} dateString 
 * @returns {string}
 */
export const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString("pt-BR");
    } catch (error) {
        return dateString;
    }
};

/**
 * Formata uma string de data e hora para o padrão brasileiro DD/MM/YYYY HH:mm.
 * @param {string} dateTimeString 
 * @returns {string}
 */
export const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "-";
    try {
        const date = new Date(dateTimeString);
        if (isNaN(date.getTime())) return dateTimeString;
        return date.toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch (error) {
        return dateTimeString;
    }
};

/**
 * Formata uma string de hora HH:mm:ss ou HH:mm para HH:mm.
 * @param {string} timeString 
 * @returns {string}
 */
export const formatTime = (timeString) => {
    if (!timeString) return "-";
    return timeString.substring(0, 5);
};
