import api from "./axios.config.js";

// Các hằng số định nghĩa sẵn
export const DOCUMENT_TYPES = {
    BUSINESS_LICENSE: "BUSINESS_LICENSE",
    REPRESENTATIVE_CIC_FRONT: "REPRESENTATIVE_CIC_FRONT",
    REPRESENTATIVE_CIC_BACK: "REPRESENTATIVE_CIC_BACK"
};

export const KYC_STATUS = {
    PENDING: "PENDING",
    REJECTED: "REJECTED",
    VERIFIED: "VERIFIED",
    NEED_MORE_INFORMATION: "NEED_MORE_INFORMATION"
};

// 1. Upload KYC (Tạo mới hoặc cập nhật khi status là NeedMoreInfo)
const uploadKyc = async (data, files) => {
    try {
        const formData = new FormData();

        formData.append("data", new Blob([JSON.stringify(data)], {
            type: 'application/json'
        }));

        // Gắn danh sách file
        files.forEach((file) => {
            formData.append("files", file);
        });

        const response = await api.post(`/kyc/upload`, formData);
        return response.data;
    } catch (error) {
        console.error("Backend Error Detail:", error.response?.data);
        throw error;
    }
};

// 2. Lấy toàn bộ danh sách đối tác chờ duyệt (Dành cho Admin)
const getAllPartnerVerifications = async () => {
    try {
        const response = await api.get(`/kyc`);
        return response.data;
    } catch (error) {
        console.error("Get All Verifications Error:", error);
        throw error;
    }
};

// 3. Lọc hồ sơ theo trạng thái
const getPartnerVerificationsByStatus = async (status) => {
    try {
        const response = await api.get(`/kyc/filter`, {
            params: { status }
        });
        return response.data;
    } catch (error) {
        console.error("Filter KYC Error:", error);
        throw error;
    }
};

// 4. Lấy chi tiết hồ sơ theo ID
const getVerificationDetail = async (verificationId) => {
    try {
        const response = await api.get(`/kyc/${verificationId}`);
        return response.data;
    } catch (error) {
        console.error("Get Detail Error:", error);
        throw error;
    }
};

// 5. Duyệt/Từ chối hồ sơ (Dành cho Admin)
const approveVerification = async (payload) => {
    try {
        const response = await api.post(`/kyc/approve`, payload);
        return response.data;
    } catch (error) {
        console.error("Approve Verification Error:", error);
        throw error;
    }
};

// 6. Lấy list hồ sơ theo userId
const getVerificationsByUserId = async () => {
    try {
        const response = await api.get(`/kyc/user`);
        return response.data;
    } catch (error) {
        console.error("Get Detail Error:", error);
        throw error;
    }
};

export const kycService = {
    uploadKyc,
    getAllPartnerVerifications,
    getPartnerVerificationsByStatus,
    getVerificationDetail,
    approveVerification,
    getVerificationsByUserId
};