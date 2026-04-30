import api from "./axios.config.js";

// Lấy list các cancel-booking config
const getAllCancelConfig = async () => {
    try {
        const response = await api.get(`/system-config/cancel-policy`);
        return response.data;
    } catch (error) {
        console.error("Get All Cancel Config Error:", error);
        throw error;
    }
};

// Update các cancel-booking config
const updateCancelConfig = async (payload) => {
    try {
        const response = await api.put(`/system-config/cancel-penalty`, payload);
        return response.data;
    } catch (error) {
        console.error("Update Cancel Config Error:", error);
        throw error;
    }
};

// Get All Config
const getAllConfigs = async () => {
    try {
        const response = await api.get(`/system-config`);
        return response.data;
    } catch (error) {
        console.error("Get All Configs Error:", error);
        throw error;
    }
};

// Update Config
const updateConfig = async (payload) => {
    try {
        const response = await api.put(`/system-config`, payload);
        return response.data;
    } catch (error) {
        console.error("Update Config Error:", error);
        throw error;
    }
};

// Audit log của Admin
const getAllAuditLog = async () => {
    try {
        const response = await api.get(`/systemlogs`);
        return response.data;
    } catch (error) {
        console.error("Get All Audit Log Error:", error);
        throw error;
    }
};

export const systemConfigService = {
    getAllCancelConfig,
    updateCancelConfig,
    getAllAuditLog,
    getAllConfigs,
    updateConfig
}