import api from "./axios.config.js";

// Get all pricing rules for a room type
const getRulesByRoomType = async (roomTypeId) => {
    const response = await api.get(`/room-pricing-rules/room-type/${roomTypeId}`);
    return response.data;
};

// Create a new pricing rule
const createRule = async (data) => {
    const response = await api.post(`/room-pricing-rules`, data);
    return response.data;
};

// Update a pricing rule
const updateRule = async (id, data) => {
    const response = await api.put(`/room-pricing-rules/${id}`, data);
    return response.data;
};

// Delete a pricing rule
const deleteRule = async (id) => {
    const response = await api.delete(`/room-pricing-rules/${id}`);
    return response.data;
};

// Calculate final price for a specific date
const calculatePrice = async (roomTypeId, date, basePrice) => {
    const response = await api.get(`/room-pricing-rules/calculate`, {
        params: { roomTypeId, date, basePrice },
    });
    return response.data;
};

export const dynamicPricingService = {
    getRulesByRoomType,
    createRule,
    updateRule,
    deleteRule,
    calculatePrice,
};
