import api from "./axios.config.js";

// 1. Tạo commission
const createCommission = async (payload) => {
    try {
        const response = await api.post(`/commissions`, payload);
        return response.data;
    } catch (error) {
        console.error("Create Commission Error:", error);
        throw error;
    }
};

// 2. Xóa/Lưu trữ commission
const deleteCommission = async (id, payload) => {
    try {
        const response = await api.delete(`/commissions/${id}`, { data: payload });
        return response.data;
    } catch (error) {
        console.error("Delete Commission Error:", error);
        throw error;
    }
};

// 3. Lấy danh sách tất cả commission
const getAllCommissions = async () => {
    try {
        const response = await api.get(`/commissions`);
        return response.data;
    } catch (error) {
        console.error("Get All Commissions Error:", error);
        throw error;
    }
};

// 4. Lấy chi tiết commission
const getCommissionDetail = async (id) => {
    try {
        const response = await api.get(`/commissions/${id}`);
        return response.data;
    } catch (error) {
        console.error("Get Commission Detail Error:", error);
        throw error;
    }
};

// 5. Cập nhật commission
const updateCommission = async (payload) => {
    try {
        const response = await api.put(`/commissions`, payload);
        return response.data;
    } catch (error) {
        console.error("Update Commission Error:", error);
        throw error;
    }
};

// 6. Kích hoạt DEAL commission
const activeCommission = async (commissionId) => {
    try {
        const response = await api.patch(`/commissions/active/${commissionId}`);
        return response.data;
    } catch (error) {
        console.error("Active Commission Error:", error);
        throw error;
    }
};

// 7. Lấy số lượng và danh sách hotel đang sử dụng DEAL
const getHotelsUsingDeal = async (commissionId) => {
    try {
        const response = await api.get(`/commissions/hotels/${commissionId}`);
        return response.data;
    } catch (error) {
        console.error("Get Hotels Using Deal Error:", error);
        throw error;
    }
};

// 8. Reset commission của hotel về mặc định
const setDefaultCommission = async (hotelId) => {
    try {
        const response = await api.patch(`/commissions/set-default/${hotelId}`);
        return response.data;
    } catch (error) {
        console.error("Set Default Commission Error:", error);
        throw error;
    }
};

// 9. Admin Lấy tất cả logs lịch sử commission
const getAllLogs = async () => {
    try {
        const response = await api.get(`/commissions/logs`);
        return response.data;
    } catch (error) {
        console.error("Get All Logs Error:", error);
        throw error;
    }
};

// 10. Hotel Lấy logs lịch sử của khách sạn hiện tại
const getMyHotelLogs = async () => {
    try {
        const response = await api.get(`/commissions/logs/hotel`);
        return response.data;
    } catch (error) {
        console.error("Get My Hotel Logs Error:", error);
        throw error;
    }
};

export const commissionService = {
    createCommission,
    deleteCommission,
    getAllCommissions,
    getCommissionDetail,
    updateCommission,
    activeCommission,
    getHotelsUsingDeal,
    setDefaultCommission,
    getAllLogs,
    getMyHotelLogs,
};