import api from "./axios.config.js";

// Tạo mới nhân viên (Staff)
const createStaff = async (createStaffRequest) => {
    try {
        const response = await api.post(`/partners/create-staff`, createStaffRequest);
        return response.data;
    } catch (error) {
        console.error("Create Staff Error:", error);
        throw error;
    }
};

// Lấy danh sách nhân viên
const getStaffList = async () => {
    try {
        const response = await api.get(`/partners/list-staff`);
        return response.data;
    } catch (error) {
        console.error("Get Staff List Error:", error);
        throw error;
    }
};

// Khóa nhân viên theo userId
const lockStaff = async (userId) => {
    try {
        const response = await api.put(`/partners/lock/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Lock Staff Error:", error);
        throw error;
    }
};

// Mở khóa nhân viên theo userId
const unLockStaff = async (userId) => {
    try {
        const response = await api.put(`/partners/unlock/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Unlock Staff Error:", error);
        throw error;
    }
};

// Cập nhật thông tin nhân viên
const updateStaff = async (updateStaffRequest) => {
    try {
        const response = await api.put(`/partners/staff/update`, updateStaffRequest);
        return response.data;
    } catch (error) {
        console.error("Update Staff Error:", error);
        throw error;
    }
};

// Lấy danh sách nhân viên Admin
const getStaffAdminList = async () => {
    try {
        const response = await api.get(`/partners/list-admin`);
        return response.data;
    } catch (error) {
        console.error("Get Staff Admin List Error:", error);
        throw error;
    }
};

export const staffService = {
    createStaff,
    getStaffList,
    updateStaff,
    unLockStaff,
    lockStaff,
    getStaffAdminList,
};



