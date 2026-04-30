import api from "./axios.config.js";

// ============================
// 👤 USER SERVICE (UC-014, UC-015, UC-080, UC-081, UC-082)
// ============================

// UC-014: Get current user profile
const getMyProfile = async () => {
    const response = await api.get("/users/my-info");
    return response.data;
};

// UC-015: Update profile info (phone, address)
const updateMyProfile = async (data) => {
    const response = await api.put("/users/my-info", data);
    return response.data;
};

// UC-015: Upload avatar
const uploadAvatar = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/users/my-info/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

// UC-015: Remove avatar
const removeAvatar = async () => {
    const response = await api.delete("/users/my-info/avatar");
    return response.data;
};

// UC-080: Search users (Admin)
const searchUsers = async ({
    keyword = "",
    role = "",
    status = "",
    page = 0,
    size = 10,
    sortBy = "username",
    sortDir = "asc",
} = {}) => {
    const params = { page, size, sortBy, sortDir };
    if (keyword) params.keyword = keyword;
    if (role) params.role = role;
    if (status) params.status = status;

    const response = await api.get("/users/search", { params });
    return response.data;
};

// UC-080: Get user metrics (Admin)
const getUserMetrics = async () => {
    const response = await api.get("/users/metrics");
    return response.data;
};

// UC-081: Get user details (Admin)
const getUserById = async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
};

// UC-082: Ban/Unban user (Admin)
const banUser = async (userId, banned, reason = "") => {
    const response = await api.put(`/users/${userId}/ban`, { banned, reason });
    return response.data;
};

export const userService = {
    getMyProfile,
    updateMyProfile,
    uploadAvatar,
    removeAvatar,
    searchUsers,
    getUserMetrics,
    getUserById,
    banUser,
};
