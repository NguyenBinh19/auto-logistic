import api from "./axios.config.js";

const getInventoryGrid = async (startDate, endDate) => {
    const response = await api.get(`/inventory/grid`, {
        params: { startDate, endDate },
    });
    return response.data;
};

const bulkUpdateAllotment = async (data) => {
    const response = await api.post(`/inventory/allotment/bulk`, data);
    return response.data;
};

const updateSingleAllotment = async (data) => {
    const response = await api.put(`/inventory/allotment`, data);
    return response.data;
};

const setStopSell = async (data) => {
    const response = await api.post(`/inventory/stop-sell`, data);
    return response.data;
};

const removeStopSell = async (data) => {
    const response = await api.delete(`/inventory/stop-sell`, { data });
    return response.data;
};

export const inventoryService = {
    getInventoryGrid,
    bulkUpdateAllotment,
    updateSingleAllotment,
    setStopSell,
    removeStopSell,
};
