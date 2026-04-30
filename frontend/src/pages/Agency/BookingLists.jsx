import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Calendar,
    ChevronDown,
    MessageCircle,
    Download,
    Star,
    RefreshCcw,
    FileText,
    Clock, Loader2, XCircle, ChevronRight,
} from 'lucide-react';
import { bookingService } from '@/services/booking.service.js';
import SubmitFeedbackModal from '@/components/agency/booking/SubmitFeedbackModal.jsx';
import CancelBookingModal from '@/components/agency/booking/CancelBookingModal.jsx';

const STATUS_TAB_MAP = {
    "Sắp khởi hành": ["BOOKED", "CONFIRMED", "PAID"],
    "Đang lưu trú": ["CHECKED-IN", "CHECKIN"],
    "Hoàn thành": ["COMPLETED", "CHECKOUT"],
    "Đã hủy": ["CANCELLED", "NO_SHOW", "NO_SHOW"],
};

const getTabFromStatus = (bookingStatus) => {
    const s = bookingStatus?.toUpperCase();
    if (STATUS_TAB_MAP["Sắp khởi hành"].includes(s)) return "Sắp khởi hành";
    if (STATUS_TAB_MAP["Đang lưu trú"].includes(s)) return "Đang lưu trú";
    if (STATUS_TAB_MAP["Hoàn thành"].includes(s)) return "Hoàn thành";
    if (STATUS_TAB_MAP["Đã hủy"].includes(s)) return "Đã hủy";
    return "Sắp khởi hành";
};

const getStatusLabel = (bookingStatus, paymentStatus) => {
    const s = bookingStatus?.toUpperCase();
    const p = paymentStatus?.toUpperCase();

    if (s === "CANCELLED" || s === "NO_SHOW" || s === "NOSHOW") return "ĐÃ HỦY";
    if (s === "CHECKOUT" || s === "COMPLETED") return "HOÀN THÀNH";
    if (p === "PAID") return "PAID & CONFIRMED";
    return s || "";
};

const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const formatCurrency = (amount) => {
    if (amount == null) return "—";
    return Number(amount).toLocaleString("vi-VN") + " ₫";
};

const OrderListScreen = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [activeTab, setActiveTab] = useState("Sắp khởi hành");
    const [searchText, setSearchText] = useState("");

    const [isDownloading, setIsDownloading] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    const tabs = [
        { name: "Sắp khởi hành" },
        { name: "Đang lưu trú" },
        { name: "Hoàn thành" },
        { name: "Đã hủy" },
    ];

    // Reset về trang 0 khi thay đổi Tab hoặc Tìm kiếm
    useEffect(() => {
        setPage(0);
    }, [activeTab, searchText]);

    const fetchHistory = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const res = await bookingService.getBookingHistory(page, 10);
            const data = res.result;
            setOrders(data.content || []);
            setTotalPages(data.totalPages || 0);
            if (!isSilent) window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            console.error("Lỗi khi tải lịch sử đặt phòng:", err);
        } finally {
            if (!isSilent) setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handleDownloadVoucher = async (order) => {
        try {
            setIsDownloading(order.bookingCode);
            const response = await bookingService.downloadVoucher(order.bookingCode);
            const blob = new Blob([response], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `Voucher_${order.bookingCode}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => window.URL.revokeObjectURL(url), 100);
        } catch (error) {
            alert("Voucher hiện chưa sẵn sàng hoặc có lỗi hệ thống.");
        } finally {
            setIsDownloading(null);
        }
    };

    // // Kiểm tra quyền hủy
    // const canCancel = (order) => {
    //     if (!order || !order.checkInDate) return false;
    //     const s = order.bookingStatus?.toUpperCase();
    //     // Chỉ cho phép hủy khi trạng thái là BOOKED
    //     const validStatus = ['BOOKED'].includes(s);
    //     if (!validStatus) return false;
    //     const today = new Date();
    //     today.setHours(0, 0, 0, 0);
    //     const checkIn = new Date(order.checkInDate);
    //     checkIn.setHours(0, 0, 0, 0);
    //     // Không cho phép hủy nếu ngày hiện tại đã sau ngày Check-in (CheckIn >= Today)
    //     return checkIn >= today;
    // };
    //
    // // Xử lý Hủy đơn từ Modal
    // const handleCancelBooking = async (reason) => {
    //     try {
    //         await bookingService.cancelBooking({
    //             bookingCode: selectedBooking.bookingCode,
    //             reason: reason || "Đại lý yêu cầu hủy"
    //         });
    //         alert("Hủy đơn hàng thành công!");
    //         setIsCancelModalOpen(false);
    //         fetchHistory();
    //     } catch (err) {
    //         alert("Lỗi: " + (err.response?.data?.message || "Không thể hủy đơn"));
    //     }
    // };

    const handleOpenReview = (order) => {
        if (!order) return;
        // Lưu đơn hàng vào state để Modal có thể truy cập thông tin (bookingId, hotelId, bookingCode)
        setSelectedBooking(order);
        // Mở Modal
        setIsReviewModalOpen(true);
    };
    const handleFeedbackSuccess = () => {
        alert("Đánh giá của bạn đã được gửi thành công!");
        // Cập nhật ngay lập tức vào danh sách orders hiện tại trong state
        // giúp nút chuyển sang "Đã đánh giá" mà không cần đợi API load lại
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.bookingId === selectedBooking.bookingId
                    ? { ...order, hasFeedback: true } // Ép trạng thái đã đánh giá
                    : order
            )
        );
        setIsReviewModalOpen(false);
        setSelectedBooking(null);
        // Gọi lại API để đồng bộ dữ liệu chuẩn từ server
        fetchHistory(true);
    };

    const filteredOrders = orders.filter((o) => {
        // Luôn ép status về UpperCase để so sánh với Map
        const statusUpper = o.bookingStatus?.toUpperCase();
        const matchTab = STATUS_TAB_MAP[activeTab]?.includes(statusUpper);

        const searchLower = searchText.toLowerCase();
        const matchSearch = !searchText ||
            o.bookingCode?.toLowerCase().includes(searchLower) ||
            o.guestName?.toLowerCase().includes(searchLower) ||
            o.hotelName?.toLowerCase().includes(searchLower);

        return matchTab && matchSearch;
    });

    const tabCounts = Object.fromEntries(
        Object.entries(STATUS_TAB_MAP).map(([tabName, statuses]) => [
            tabName,
            orders.filter(o => statuses.includes(o.bookingStatus?.toUpperCase())).length,
        ])
    );

    return (
        <div className="bg-slate-50 min-h-screen p-6 font-sans text-slate-700">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Danh sách Đơn hàng</h1>
                <p className="text-sm text-slate-500">Theo dõi và quản lý toàn bộ đơn hàng đã đặt thành công</p>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center mb-6">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Tìm theo Mã đơn (#BK...), Tên khách, hoặc Tên khách sạn..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-8 border-b border-slate-200 mb-6 px-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        className={`pb-3 text-sm font-semibold transition-all relative ${
                            activeTab === tab.name ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        {tab.name}
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${
                            activeTab === tab.name ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                            {tabCounts[tab.name] ?? 0}
                        </span>
                        {activeTab === tab.name && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>
                        )}
                    </button>
                ))}
            </div>

            {/* Order List */}
            {loading ? (
                <div className="text-center text-slate-400 py-20">Đang tải dữ liệu...</div>
            ) : filteredOrders.length === 0 ? (
                <div className="text-center text-slate-400 py-20">Không có đơn hàng nào trong mục này</div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order) => {
                        const statusLabel = getStatusLabel(order.bookingStatus, order.paymentStatus);
                        const tab = getTabFromStatus(order.bookingStatus);
                        // Hàm điều hướng dùng chung
                        const goToDetail = () => navigate(`/agency/booking-list/detail/${encodeURIComponent(order.bookingCode)}`);
                        return (
                            <div
                                key={order.bookingId}
                                className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all relative group cursor-pointer"
                                onClick={goToDetail} // Cho phép click vào bất cứ đâu trống trên card để vào chi tiết
                            >
                                {/* Nút mũi tên với hiệu ứng trượt nhẹ khi hover vào card */}
                                <div className="absolute top-1/2 -translate-y-1/2 right-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300">
                                    <ChevronRight size={22} strokeWidth={2.5} />
                                </div>

                                <div className="flex justify-between items-start mb-4">
                                    <div className="pr-12"> {/* Chừa khoảng trống rộng hơn cho mũi tên */}
                                        <span className="text-blue-600 font-bold text-sm group-hover:text-blue-700 group-hover:underline underline-offset-4 decoration-2 transition-all">
                                            {order.bookingCode}
                                        </span>
                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                            {order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : ""}
                                        </p>
                                    </div>

                                    {/* Status Label */}
                                    <div className={`text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1.5 mr-8 ${
                                        statusLabel === 'PAID & CONFIRMED' ? 'bg-emerald-50 text-emerald-600' :
                                            statusLabel === 'HOÀN THÀNH' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'
                                    }`}>
                                        {statusLabel !== 'ĐÃ HỦY' && <CheckIcon/>}
                                        {statusLabel}
                                    </div>
                                </div>

                                <div className="flex gap-4 pr-10">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-800 mb-1">{order.hotelName}</h3>
                                        <div className="space-y-1">
                                            <p className="text-xs text-slate-500 flex items-center gap-2">
                                                <span className="w-4 flex justify-center"><UserIcon/></span>
                                                {order.guestName}{order.totalGuests > 1 ? ` (+${order.totalGuests - 1} người)` : ""}
                                            </p>
                                            <p className="text-xs text-slate-500 flex items-center gap-2">
                                                <span className="w-4 flex justify-center"><Calendar size={14}/></span>
                                                {formatDate(order.checkInDate)} - {formatDate(order.checkOutDate)} ({order.nights} đêm)
                                            </p>
                                            <p className="text-xs text-slate-500 flex items-center gap-2">
                                                <span className="w-4 flex justify-center"><BedIcon/></span>
                                                {order.totalRooms} phòng
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col justify-between items-end">
                                        <span
                                            className="text-emerald-600 font-bold text-lg">{formatCurrency(order.finalAmount)}</span>

                                        <div className="flex gap-2">
                                            {tab === "Sắp khởi hành" && (
                                                <>
                                                    <button
                                                        onClick={() => handleDownloadVoucher(order)}
                                                        disabled={isDownloading === order.bookingCode}
                                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:bg-slate-300 transition-all shadow-sm"
                                                    >
                                                        {isDownloading === order.bookingCode ?
                                                            <Loader2 size={14} className="animate-spin"/> :
                                                            <Download size={14}/>}
                                                        Tải Voucher
                                                    </button>
                                                    {/*<button*/}
                                                    {/*    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors">*/}
                                                    {/*    <MessageCircle size={14}/> Chat với KS*/}
                                                    {/*</button>*/}
                                                    {/*{canCancel(order) && (*/}
                                                    {/*    <button*/}
                                                    {/*        onClick={() => { setSelectedBooking(order); setIsCancelModalOpen(true); }}*/}
                                                    {/*        className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold hover:bg-rose-100"*/}
                                                    {/*    >*/}
                                                    {/*        <XCircle size={14} /> Hủy*/}
                                                    {/*    </button>*/}
                                                    {/*)}*/}
                                                </>
                                            )}
                                            {/*{tab === "Hoàn thành" && (*/}
                                            {/*    <>*/}
                                            {/*        <button*/}
                                            {/*            onClick={() => handleOpenReview(order)}*/}
                                            {/*            // Vô hiệu hóa nút nếu hasFeedback là true*/}
                                            {/*            disabled={order.hasFeedback === true}*/}
                                            {/*            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${*/}
                                            {/*                order.hasFeedback*/}
                                            {/*                    ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"*/}
                                            {/*                    : "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 shadow-sm"*/}
                                            {/*            }`}*/}
                                            {/*        >*/}
                                            {/*            <Star*/}
                                            {/*                size={14}*/}
                                            {/*                // Nếu đã đánh giá thì tô màu vàng cho ngôi sao*/}
                                            {/*                fill={order.hasFeedback ? "#94a3b8" : "none"}*/}
                                            {/*                className={order.hasFeedback ? "text-slate-400" : ""}*/}
                                            {/*            />*/}
                                            {/*            {order.hasFeedback ? "Đã đánh giá" : "Đánh giá ngay"}*/}
                                            {/*        </button>*/}
                                            {/*    </>*/}
                                            {/*)}*/}
                                            {/*{tab === "Đã hủy" && (*/}
                                            {/*    <button*/}
                                            {/*        className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold hover:bg-rose-100">*/}
                                            {/*        Xem lý do*/}
                                            {/*    </button>*/}
                                            {/*)}*/}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10 mb-6">
                    <button
                        disabled={page === 0}
                        onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 rounded-lg border bg-white text-sm font-medium disabled:opacity-40 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                    ← Trước
                    </button>

                    <div className="flex gap-1">
                        {[...Array(totalPages)].map((_, i) => {
                            // Chỉ hiển thị số trang trong khoảng gần trang hiện tại hoặc đầu/cuối
                            if (i === 0 || i === totalPages - 1 || (i >= page - 1 && i <= page + 1)) {
                                return (
                                    <button
                                        key={i}
                                        onClick={() => setPage(i)}
                                        className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                                            page === i
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'bg-white border text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                );
                            } else if (i === page - 2 || i === page + 2) {
                                return <span key={i} className="px-1 text-slate-400 self-center">...</span>;
                            }
                            return null;
                        })}
                    </div>

                    <button
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 rounded-lg border bg-white text-sm font-medium disabled:opacity-40 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        Tiếp →
                    </button>
                </div>
            )}
            {/* Modals */}
            {isReviewModalOpen && selectedBooking && (
                <SubmitFeedbackModal
                    isOpen={isReviewModalOpen}
                    onClose={() => { setIsReviewModalOpen(false); setSelectedBooking(null); }}
                    booking={selectedBooking}
                    onSuccess={handleFeedbackSuccess}
                />
            )}
            {isCancelModalOpen && selectedBooking && (
                <CancelBookingModal
                    isOpen={isCancelModalOpen}
                    onClose={() => { setIsCancelModalOpen(false); setSelectedBooking(null); }}
                    bookingCode={selectedBooking.bookingCode}
                    onConfirm={handleCancelBooking}
                />
            )}
        </div>
    );
};

// Sub-icons
const CheckIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const UserIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

const BedIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 4v16"></path>
        <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
        <path d="M2 17h20"></path>
        <path d="M6 8v9"></path>
    </svg>
);

export default OrderListScreen;