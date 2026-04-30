import api from "./axios.config.js";

// Export Report
const exportFinancialReport = async (exportRequest) => {
    try {
        const response = await api.post('/financial/export', exportRequest, {
            // Axios không ép kiểu String
            responseType: 'arraybuffer'
        });
        return response.data;
    } catch (error) {
        console.log("STATUS:", error.response?.status);
        console.log("EXPORT ERROR DATA:", error.response?.data);
        console.error("Financial Export Error:", error);
        throw error;
    }
};

const getSummary = async (agencyId) => {
    try {
        const response = await api.get(`/transaction-history/${agencyId}/transactions/summary`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const financialService = {
    exportFinancialReport,
    getSummary
};