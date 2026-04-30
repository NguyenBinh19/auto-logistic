import api from "./axios.config.js";

// 1. Kiểm tra phòng trống (Check Availability)
const checkAvailability = async (payload) => {
    try {
        const response = await api.post(`/booking/room_avai`, payload);
        return response.data;
    } catch (error) {
        console.log("STATUS:", error.response?.status);
        console.log("BACKEND DATA:", error.response?.data);
        console.error("Check Availability Error:", error);
        throw error;
    }
};

// 2. Giữ phòng (Hold Room)
const holdRoom = async (payload) => {
    try {
        const response = await api.post(`/booking/room_holds`, payload);
        return response.data;
    } catch (error) {
        console.error("Hold Room Error:", error);
        throw error;
    }
};

// 3. Gia hạn thời gian giữ phòng (Extend Hold)
const extendHold = async (holdCode) => {
    try {
        // body là object chứa holdCode
        const response = await api.post(`/booking/room_holds/extend`, { holdCode });
        return response.data;
    } catch (error) {
        console.error("Extend Hold Error:", error);
        throw error;
    }
};

// 4. Tạo booking (Create Booking)
const createBooking = async (payload) => {
    try {
        const response = await api.post(`/booking/create`, payload);
        return response.data;
    } catch (error) {
        console.error("Create Booking Error:", error);
        throw error;
    }
};

// 5. Search Hotel
const searchHotel = async (payload) => {
    try {
        const response = await api.get(`/hotels/search`, { params: payload });
        return response.data;
    } catch (error) {
        console.error("Search Hotel Error:", error);
        throw error;
    }
}

// UC-029: Lịch sử đặt phòng (phân trang)
const getBookingHistory = async (page = 0, size = 10) => {
    try {
        const response = await api.get(`/booking/history`, { params: { page, size } });
        return response.data;
    } catch (error) {
        console.error("Get Booking History Error:", error);
        throw error;
    }
};

// UC-030: Chi tiết booking theo booking code
const getBookingDetail = async (bookingCode) => {
    try {
        const response = await api.get(`/booking/detail/${bookingCode}`);
        return response.data;
    } catch (error) {
        console.error("Get Booking Detail Error:", error);
        throw error;
    }
};

// 6. View all booking of Admin
const viewAllBookingByAdmin = async () => {
    try {
        const response = await api.get(`/booking/listAll`);
        return response.data;
    } catch (error){
        console.error("View All Booking Error:", error);
        throw error;
    }
}

const viewAllBookingByHotelId = async (hotelId) => {
    try {
        const response = await api.get(`/booking/listAllByHotelId`, {
            params: { hotelId }
        });
        return response.data;
    } catch (error){
        console.error("View All Booking Error:", error);
        throw error;
    }
}

// Update thông tin khách của Booking
export const updateUserInfoBooking = async (requestData) => {
    try {
        const response = await api.post('/booking/update-guest', requestData);
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || "Lỗi cập nhật thông tin khách hàng";
        console.error("API Error UC-028:", errorMessage);
        throw error;
    }
};

// Lấy danh sách check-in hôm nay
export const getCheckInToday = async () => {
    try {
        const response = await api.get(`/booking/checkin/today`);
        return response.data;
    } catch (error){
        console.error("View All Booking Error:", error);
        throw error;
    }
}

// Lấy danh sách check-in theo ngày
export const getCheckInByDate = async (date) => {
    try {
        const response = await api.get(`/booking/checkin/${date}`);
        return response.data;
    } catch (error){
        console.error("View All Booking Error:", error);
        throw error;
    }
}

// UC-032: Submit feedback for a completed booking
const submitFeedback = async (data) => {
    const response = await api.post(`/feedbacks`, data);
    return response.data;
};

// UC-033: Get my feedback history (Agency)
const getMyFeedbackHistory = async (page = 0, size = 10) => {
    const response = await api.get(`/feedbacks/history`, { params: { page, size } });
    return response.data;
};

// UC-055: Get hotel's received feedback
const getHotelFeedback = async (page = 0, size = 10) => {
    const response = await api.get(`/feedbacks/my-hotel`, { params: { page, size } });
    return response.data;
};

// UC-055: Get hotel feedback stats
const getHotelFeedbackStats = async () => {
    const response = await api.get(`/feedbacks/my-hotel/stats`);
    return response.data;
};

// UC-055: Reply to a review
const replyToFeedback = async (reviewId, reply) => {
    const response = await api.post(`/feedbacks/${reviewId}/reply`, { reply });
    return response.data;
};

// Download voucher
const downloadVoucher = async (bookingCode) => {
    try {
        const response = await api.get(`/booking/voucher/${bookingCode}`, {
            responseType: "blob", // để xử lý file PDF
        });
        // Tạo link download giả lập để trình duyệt tải file về
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `Voucher_${bookingCode}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        return response.data;
    } catch (error) {
        console.error("Download Voucher Error:", error);
        throw error;
    }
};

// Lấy danh sách check-out hôm nay
const getTodayDepartures = async () => {
    try {
        const response = await api.get(`/booking/checkout/today`);
        return response.data;
    } catch (error) {
        console.error("Get Today Departures Error:", error);
        throw error;
    }
};

// Lấy danh sách check-out theo ngày cụ thể
const getDeparturesByDate = async (date) => {
    try {
        const response = await api.get(`/booking/checkout/${date}`);
        return response.data;
    } catch (error) {
        console.error("Get Departures By Date Error:", error);
        throw error;
    }
};

// Thực hiện Checkout (Quy trình chuẩn)
const performCheckout = async (bookingCode) => {
    try {
        const response = await api.post(`/booking/checkout/${bookingCode}/process`);
        return response.data;
    } catch (error) {
        console.error("Perform Checkout Error:", error);
        throw error;
    }
};

// Checkout nhanh (không hóa đơn)
const expressCheckout = async (bookingCode) => {
    try {
        const response = await api.post(`/booking/checkout/${bookingCode}/express`);
        return response.data;
    } catch (error) {
        console.error("Express Checkout Error:", error);
        throw error;
    }
};

// Thực hiện Check-in
const checkinGuest = async (payload) => {
    try {
        const response = await api.post(`/booking/checkin`, payload);
        return response.data;
    } catch (error) {
        console.error("Check-in Error:", error);
        throw error;
    }
};

// Báo cáo No-show (Khách không đến)
const reportNoShow = async (payload) => {
    try {
        const response = await api.post(`/booking/no-show`, payload);
        return response.data;
    } catch (error) {
        console.error("No-show Report Error:", error);
        throw error;
    }
};

// Hủy đặt phòng
const cancelBooking = async (payload) => {
    try {
        const response = await api.post(`/booking/cancel`, payload);
        return response.data;
    } catch (error) {
        console.error("Cancel Booking Error:", error);
        throw error;
    }
};

// Chi tiết booking theo booking code cho Admin
const getBookingDetailOfAdmin = async (bookingCode) => {
    try {
        const response = await api.get(`/booking/detail-with-nouid/${bookingCode}`);
        return response.data;
    } catch (error) {
        console.error("Get Booking Detail Of Admin Error:", error);
        throw error;
    }
};

// Chi tiết booking theo bookingId
const getBookingDetailById = async (bookingId) => {
    try {
        const response = await api.get(`/booking/detail/id/${bookingId}`);
        return response.data;
    } catch (error) {
        console.error("Get Booking Detail By Id Error:", error);
        throw error;
    }
};

export const bookingService = {
    checkAvailability,
    holdRoom,
    extendHold,
    createBooking,
    searchHotel,
    getBookingHistory,
    getBookingDetail,
    viewAllBookingByAdmin,
    viewAllBookingByHotelId,
    updateUserInfoBooking,
    getCheckInToday,
    getCheckInByDate,
    submitFeedback,
    getMyFeedbackHistory,
    getHotelFeedback,
    getHotelFeedbackStats,
    replyToFeedback,
    downloadVoucher,
    getTodayDepartures,
    getDeparturesByDate,
    performCheckout,
    expressCheckout,
    checkinGuest,
    reportNoShow,
    cancelBooking,
    getBookingDetailOfAdmin,
    getBookingDetailById
};