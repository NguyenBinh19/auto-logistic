import api from "./axios.config";

const BASE = "/notifications";

export const notificationService = {
    getNotifications: (page = 0, size = 10, category, isRead) => {
        const params = { page, size };
        if (category) params.category = category;
        if (isRead !== undefined && isRead !== null) params.isRead = isRead;
        return api.get(BASE, { params }).then((res) => res.data.result);
    },

    getUnreadCount: () => {
        return api.get(`${BASE}/unread-count`).then((res) => res.data.result);
    },

    markAsRead: (id) => {
        return api.patch(`${BASE}/${id}/read`).then((res) => res.data.result);
    },

    markAllAsRead: () => {
        return api.patch(`${BASE}/read-all`).then((res) => res.data);
    },
};
