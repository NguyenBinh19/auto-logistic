import api from "./axios.config.js";

// Update thông tin cơ bản
const upAgencyProfileDetail = async (updateData) => {
    try {
        const response = await api.put(`/agencies/update`, updateData);
        return response.data;
    } catch (error) {
        console.error("Update Agency Error:", error);
        throw error;
    }
};

// Lấy thông tin chi tiết Agency
const getAgencyProfileDetail = async () => {
    try {
        const response = await api.get(`/agencies/detail`);
        return response.data;
    } catch (error) {
        console.error("Get Agency Partner Detail Error:", error);
        throw error;
    }
};

// Xem thông tin booking của nhân viên
const getAgencyStaffBooking = async () => {
    try {
        const response = await api.get(`/agencies/user-booking`);
        return response.data;
    } catch (error) {
        console.error("Get Agency Staff Booking Error:", error);
        throw error;
    }
};

export const agencyService = {
    upAgencyProfileDetail,
    getAgencyProfileDetail,
    getAgencyStaffBooking
};