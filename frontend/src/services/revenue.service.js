import api from "./axios.config.js";

// View Rvenue Report of Hotel
const getRevenueReport = async ( params) => {
    try {
        const response = await api.get(`/revenue/report`, {
            params
        });
        return response.data;
    } catch (error) {
        console.log("STATUS:", error.response?.status);
        console.log("BACKEND REVENUE ERROR:", error.response?.data);
        console.error("Get Revenue Report Error:", error);
        throw error;
    }
};

export const revenueService = {
    getRevenueReport,
};