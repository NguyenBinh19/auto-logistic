import api from "./axios.config.js";

/**
 * 1. Tạo loại phòng mới
 * @param {Object} payload - Dữ liệu JSON (CreateRoomTypeRequest)
 * @param {File[]} files - Mảng các file ảnh mới
 */
const createRoomType = async (payload, files = []) => {
    try {
        const formData = new FormData();

        // Đóng gói JSON payload vào Blob
        const jsonBlob = new Blob([JSON.stringify(payload)], {
            type: "application/json",
        });
        formData.append("data", jsonBlob);

        // Đính kèm các file ảnh (Key là "files" theo BE createRoomType)
        if (files && files.length > 0) {
            files.forEach((file) => {
                formData.append("files", file);
            });
        }

        const response = await api.post(`/room-types`, formData);
        return response.data;
    } catch (error) {
        console.error("Create Room Type Error:", error);
        throw error;
    }
};

/**
 * 2. Cập nhật loại phòng
 * @param {Number} roomTypeId
 * @param {Object} payload - Dữ liệu JSON (UpdateRoomTypeRequest) bao gồm deletedImageIds
 * @param {File[]} newImages - Mảng các file ảnh mới bổ sung
 */
const updateRoomType = async (roomTypeId, payload, newImages = []) => {
    try {
        const formData = new FormData();

        // 1. Gửi payload JSON kèm danh sách deletedImageIds
        const jsonBlob = new Blob([JSON.stringify(payload)], {
            type: "application/json",
        });
        formData.append("data", jsonBlob);

        // 2. Gửi các file ảnh mới (Key khớp với @RequestPart("newImages") của Java)
        if (newImages && newImages.length > 0) {
            newImages.forEach((file) => {
                formData.append("newImages", file);
            });
        }

        const response = await api.put(`/room-types/${roomTypeId}`, formData);
        return response.data;
    } catch (error) {
        console.error("Update Room Type Error:", error);
        throw error;
    }
};

/** 3. Lấy danh sách loại phòng theo hotelId */
const getRoomTypesByHotelId = async (hotelId) => {
    const response = await api.get(`/room-types`, { params: { hotelId } });
    return response.data;
};

/** 4. Lấy chi tiết loại phòng (có bao gồm URL ảnh từ S3) */
const getRoomTypeDetail = async (roomTypeId) => {
    try {
        const response = await api.get(`/room-types/${roomTypeId}`);
        return response.data;
    } catch (error) {
        console.error("Get Room Type Detail Error:", error);
        throw error;
    }
};

/** 5. Vô hiệu hóa/Xoá loại phòng (set status 'inactive') */
const deleteRoomType = async (roomTypeId) => {
    try {
        const response = await api.delete(`/room-types/${roomTypeId}`);
        return response.data;
    } catch (error) {
        console.error("Delete Room Type Error:", error);
        throw error;
    }
};

/** 6. Lấy chi tiết thông tin loại phòng theo khách sạn */
const getRoomTypesDetailByHotelId = async (hotelId) => {
    try {
        const response = await api.get(`/room-types/details`, {
            params: { hotelId: hotelId }
        });
        return response.data;
    } catch (error) {
        console.error("Get Room Types Detail Error:", error);
        throw error;
    }
};

export const roomTypeService = {
    createRoomType,
    updateRoomType,
    getRoomTypesByHotelId,
    getRoomTypeDetail,
    deleteRoomType,
    getRoomTypesDetailByHotelId
};