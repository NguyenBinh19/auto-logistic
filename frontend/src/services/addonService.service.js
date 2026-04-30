import api from "./axios.config.js";

// 1. Tạo dịch vụ bổ trợ (UC-066)
const createAddonService = async (payload) => {
    const response = await api.post(`/addon-services`, payload);
    return response.data;
};

// 2. Cập nhật dịch vụ bổ trợ (UC-067)
const updateAddonService = async (serviceId, payload) => {
    const response = await api.put(`/addon-services/${serviceId}`, payload);
    return response.data;
};

// 3. Xóa dịch vụ bổ trợ (UC-068)
const deleteAddonService = async (serviceId) => {
    const response = await api.delete(`/addon-services/${serviceId}`);
    return response.data;
};

// 4. Toggle trạng thái dịch vụ
const toggleAddonServiceStatus = async (serviceId) => {
    const response = await api.patch(`/addon-services/${serviceId}/status`);
    return response.data;
};

// 5. Lấy danh sách dịch vụ theo hotel (Hotel admin)
const getAddonServicesByHotel = async (hotelId, category = null) => {
    const params = { hotelId };
    if (category) params.category = category;
    const response = await api.get(`/addon-services`, { params });
    return response.data;
};

// 6. Lấy dịch vụ active theo hotel (Agency khi checkout)
const getActiveAddonServicesByHotel = async (hotelId) => {
    const response = await api.get(`/addon-services/active`, { params: { hotelId } });
    return response.data;
};

// 7. UC-026: Thêm dịch vụ vào booking
const addServicesToBooking = async (payload) => {
    const response = await api.post(`/addon-services/booking`, payload);
    return response.data;
};

// 8. Lấy dịch vụ đã đặt trong booking
const getBookingAddonServices = async (bookingId) => {
    const response = await api.get(`/addon-services/booking/${bookingId}`);
    return response.data;
};

export const addonServiceApi = {
    createAddonService,
    updateAddonService,
    deleteAddonService,
    toggleAddonServiceStatus,
    getAddonServicesByHotel,
    getActiveAddonServicesByHotel,
    addServicesToBooking,
    getBookingAddonServices,
};
