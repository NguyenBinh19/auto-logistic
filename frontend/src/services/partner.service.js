import api from "./axios.config.js";

// Lấy danh sách tất cả Agency
const getAllAgencyPartner = async () => {
    try {
        const response = await api.get(`/agencies`);
        return response.data;
    } catch (error){
        console.error("Get List Agency Partner Error:", error);
        throw error;
    }
}

// Lấy thông tin chi tiết Agency theo agencyId
const getAgencyPartnerDetail = async (agencyId) => {
    try {
        const response = await api.get(`/agencies/${agencyId}`);
        return response.data;
    } catch (error) {
        console.error("Get Agency Partner Detail Error:", error);
        throw error;
    }
};

// Lấy danh sách tất cả Hotel
const getAllHotelPartner = async () => {
    try {
        const response = await api.get(`/hotels/list`);
        return response.data;
    } catch (error){
        console.error("Get List Hotel Partner Error:", error);
        throw error;
    }
}

// Lấy thông tin chi tiết Hotel theo hotelId
const getHotelPartnerDetail = async (hotelId) => {
    try {
        const response = await api.get(`/hotels/list/${hotelId}`);
        return response.data;
    } catch (error) {
        console.error("Get Hotel Partner Detail Error:", error);
        throw error;
    }
};

// Ban partner của Admin
const banPartner = async (partnerType, partnerId, reasonRequest) => {
    try {
        const response = await api.put(`/partners/${partnerType.toUpperCase()}/${partnerId}/ban`,
            reasonRequest
        );
        return response.data;
    } catch (error) {
        console.error("Ban Partner Error:", error);
        throw error;
    }
};

// Update Hotel Profile
const updateHotelProfile = async (updateRequest, newImages) => {
    try {
        const formData = new FormData();
        // Bọc JSON request vào Blob với type application/json
        formData.append(
            "data",
            new Blob([JSON.stringify(updateRequest)], { type: "application/json" })
        );
        // Gửi danh sách ảnh mới kèm key "newImages"
        if (newImages && newImages.length > 0) {
            newImages.forEach((file) => {
                formData.append("newImages", file);
            });
        }
        const response = await api.put(`/hotels/update`, formData);
        return response.data;
    } catch (error) {
        console.error("Update Hotel Profile Error:", error);
        throw error;
    }
};

// Lấy thông tin chi tiết Hotel
const getHotelProfileDetail = async () => {
    try {
        const response = await api.get(`/hotels/detail`);
        return response.data;
    } catch (error) {
        console.error("Get Agency Partner Detail Error:", error);
        throw error;
    }
};

// Lấy thông tin ngân hàng của Hotel
const getHotelBankInfo = async (hotelId) => {
    try {
        const response = await api.get(`/hotels/${hotelId}/bank-info`);
        return response.data;
    } catch (error) {
        console.error("Get Hotel Bank Info Error:", error);
        throw error;
    }
};

// Cập nhật thông tin ngân hàng của Hotel
const updateHotelBankInfo = async (hotelId, bankInfoRequest) => {
    try {
        const response = await api.put(
            `/hotels/${hotelId}/bank-info`,
            bankInfoRequest
        );
        return response.data;
    } catch (error) {
        console.error("Update Hotel Bank Info Error:", error);
        throw error;
    }
};

export const partnerService = {
    getAllAgencyPartner,
    getAllHotelPartner,
    getHotelPartnerDetail,
    getAgencyPartnerDetail,
    banPartner,
    updateHotelProfile,
    getHotelProfileDetail,
    getHotelBankInfo,
    updateHotelBankInfo,
};