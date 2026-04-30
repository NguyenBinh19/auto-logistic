import api from "./axios.config.js";

// 1. Tạo hạng mới
const createRank = async (payload) => {
    try {
        const response = await api.post(`/ranks`, payload);
        return response.data;
    } catch (error) {
        console.error("Create Rank Error:", error);
        throw error;
    }
};

// 2. Cập nhật thông tin hạng
const updateRank = async (id, payload) => {
    try {
        const response = await api.put(`/ranks/${id}`, payload);
        return response.data;
    } catch (error) {
        console.error("Update Rank Error:", error);
        throw error;
    }
};

// 3. Lấy chi tiết một hạng
const getRankDetail = async (id) => {
    try {
        const response = await api.get(`/ranks/${id}`);
        return response.data;
    } catch (error) {
        console.error("Get Rank Detail Error:", error);
        throw error;
    }
};

// 4. Lấy danh sách tất cả hạng
const getAllRanks = async () => {
    try {
        const response = await api.get(`/ranks`);
        return response.data;
    } catch (error) {
        console.error("Get All Ranks Error:", error);
        throw error;
    }
};

// 5. Xóa hạng
const deleteRank = async (id) => {
    try {
        const response = await api.delete(`/ranks/${id}`);
        return response.data;
    } catch (error) {
        console.error("Delete Rank Error:", error);
        throw error;
    }
};

// 6. Cập nhật chu kỳ xét hạng
const updateRankCycle = async (payload) => {
    try {
        const response = await api.put(`/ranks/config-cycle`, payload);
        return response.data;
    } catch (error) {
        console.error("Update Rank Cycle Error:", error);
        throw error;
    }
};

// 7. Lấy thông tin chu kỳ xét hạng hiện tại
const getRankCycle = async (type) => {
    try {
        const response = await api.get(`/ranks/config-cycle`, { params: { type } });
        return response.data;
    } catch (error) {
        console.error("Get Rank Cycle Error:", error);
        throw error;
    }
};

// 8. Lấy tất cả danh sách chu kỳ
const getAllRankCycles = async () => {
    try {
        const response = await api.get(`/ranks/config-cycles`);
        return response.data;
    } catch (error) {
        console.error("Get All Rank Cycle Error:", error);
        throw error;
    }
};

// 9. Lấy chu kỳ/kỳ xét hạng mới nhất
const getLatestPeriod = async () => {
    try {
        const response = await api.get(`/ranks/period/latest`);
        return response.data;
    } catch (error) {
        console.error("Get Latest Period Error:", error);
        throw error;
    }
};

// 10. Lấy danh sách ứng viên có thể nâng hạng
const getUpgradeCandidates = async (payload) => {
    try {
        const response = await api.post(`/ranks/upgrade`, payload);
        return response.data;
    } catch (error) {
        console.error("Get Upgrade Error:", error);
        throw error;
    }
};

// 11. Lấy danh sách ứng viên có thể bị hạ hạng
const getDowngradeCandidates = async (payload) => {
    try {
        const response = await api.post(`/ranks/downgrade`, payload);
        return response.data;
    } catch (error) {
        console.error("Get Downgrade Error:", error);
        throw error;
    }
};

// 12. Lấy chi tiết hạng của một đại lý cụ thể
const getAgencyRankDetail = async (payload) => {
    try {
        const response = await api.post(`/ranks/agency/detail`, payload);
        return response.data;
    } catch (error) {
        console.error("Get Agency Rank Detail Error:", error);
        throw error;
    }
};

/// 13. Thực hiện thay đổi hạng (Chốt hạng)
const changeRank = async (payload) => {
    try {
        const response = await api.post(`/ranks/agency/change`, payload);
        return response.data;
    } catch (error) {
        console.error("Change Rank Error:", error);
        throw error;
    }
};

// 14. Lấy toàn bộ lịch sử thay đổi hạng
const getAllRankHistories = async () => {
    try {
        const response = await api.get(`/ranks/history`);
        return response.data;
    } catch (error) {
        console.error("Get All Rank Histories Error:", error);
        throw error;
    }
};

// 15. Lấy lịch sử thay đổi hạng của đại lý
const getMyAgencyRankHistories = async () => {
    try {
        const response = await api.get(`/ranks/history/agency`);
        return response.data;
    } catch (error) {
        console.error("Get My Agency Rank Histories Error:", error);
        throw error;
    }
};

export const rankService = {
    createRank,
    updateRank,
    getRankDetail,
    getAllRanks,
    deleteRank,
    updateRankCycle,
    getRankCycle,
    getAllRankCycles,
    getLatestPeriod,
    getUpgradeCandidates,
    getDowngradeCandidates,
    getAgencyRankDetail,
    changeRank,
    getAllRankHistories,
    getMyAgencyRankHistories,
};