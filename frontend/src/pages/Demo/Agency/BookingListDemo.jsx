import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Calendar,
    MessageCircle,
    Download,
    Star,
    RefreshCcw,
    Clock,
    ChevronRight
} from 'lucide-react';
import { MOCK_BOOKINGS } from "@/constant/agency_mockData.js";

const STATUS_TAB_MAP = {
    "Sắp khởi hành": ["BOOKED", "CONFIRMED", "PAID"],
    "Đang lưu trú": ["CHECKED-IN", "CHECKIN"],
    "Hoàn thành": ["COMPLETED", "CHECKOUT"],
    "Đã hủy": ["CANCELLED", "NO_SHOW", "NOSHOW"],
};

// Helper Functions
const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const formatCurrency = (amount) => {
    if (amount == null) return "—";
    return Number(amount).toLocaleString("vi-VN") + " ₫";
};

const getStatusLabel = (bookingStatus, paymentStatus) => {
    const s = bookingStatus?.toUpperCase();
    const p = paymentStatus?.toUpperCase();
    if (s === "CANCELLED" || s === "NO_SHOW" || s === "NOSHOW") return "ĐÃ HỦY";
    if (s === "CHECKOUT" || s === "COMPLETED") return "HOÀN THÀNH";
    if (p === "PAID") return "PAID & CONFIRMED";
    return s || "";
};

const OrderListScreen = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("Sắp khởi hành");
    const [searchText, setSearchText] = useState("");

    // 1. Logic lọc dữ liệu
    const filteredOrders = useMemo(() => {
        return MOCK_BOOKINGS.filter((order) => {
            const statusUpper = order.bookingStatus?.toUpperCase();
            const matchTab = STATUS_TAB_MAP[activeTab]?.includes(statusUpper);

            const searchLower = searchText.toLowerCase();
            const matchSearch = !searchText ||
                order.bookingCode?.toLowerCase().includes(searchLower) ||
                order.guestName?.toLowerCase().includes(searchLower) ||
                order.hotelName?.toLowerCase().includes(searchLower);

            return matchTab && matchSearch;
        });
    }, [activeTab, searchText]);

    // 2. Tính toán số lượng cho Badge trên Tabs
    const tabCounts = useMemo(() => {
        const counts = {};
        Object.keys(STATUS_TAB_MAP).forEach(tabName => {
            counts[tabName] = MOCK_BOOKINGS.filter(o =>
                STATUS_TAB_MAP[tabName].includes(o.bookingStatus?.toUpperCase())
            ).length;
        });
        return counts;
    }, []);

    return (
        <div className="bg-slate-50 min-h-screen p-6 font-sans text-slate-700">
            {/* Header */}
            <div className="max-w-5xl mx-auto mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Danh sách Đơn hàng</h1>
                <p className="text-sm text-slate-500">Theo dõi và quản lý toàn bộ đơn hàng đã đặt thành công</p>
            </div>

            {/* Filter Bar (Search) */}
            <div className="max-w-5xl mx-auto mb-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="relative">
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
            </div>

            {/* Tabs Navigation */}
            <div className="max-w-5xl mx-auto mb-6">
                <div className="flex gap-8 border-b border-slate-200 px-2 overflow-x-auto no-scrollbar">
                    {Object.keys(STATUS_TAB_MAP).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 text-sm font-semibold transition-all relative whitespace-nowrap ${
                                activeTab === tab ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <span className="flex items-center">
                                {tab}
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${
                                    activeTab === tab ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                                }`}>
                                    {tabCounts[tab] || 0}
                                </span>
                            </span>
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders List */}
            <div className="max-w-5xl mx-auto space-y-4">
                {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-xl py-20 text-center border border-slate-200">
                        <p className="text-slate-400">Không có đơn hàng nào trong mục này</p>
                    </div>
                ) : (
                    filteredOrders.map((order) => {
                        const statusLabel = getStatusLabel(order.bookingStatus, order.paymentStatus);

                        return (
                            <div key={order.bookingId} className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all">
                                {/* Card Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div
                                        className="cursor-pointer group"
                                        onClick={() => navigate(`/demo-agency/booking-list/detail/${order.bookingCode}`)}
                                    >
                                        <span className="text-blue-600 font-bold text-sm group-hover:underline underline-offset-4 decoration-2">
                                            #{order.bookingCode}
                                        </span>
                                        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                                            <Clock size={10} /> {new Date(order.createdAt).toLocaleString("vi-VN")}
                                        </p>
                                    </div>

                                    <div className={`text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1.5 uppercase ${
                                        statusLabel === 'PAID & CONFIRMED' ? 'bg-emerald-50 text-emerald-600' :
                                            statusLabel === 'HOÀN THÀNH' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'
                                    }`}>
                                        {statusLabel === 'ĐÃ HỦY' ? '✘' : <CheckIcon />}
                                        {statusLabel}
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-800 mb-2">{order.hotelName}</h3>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <span className="w-4 flex justify-center"><UserIcon /></span>
                                                <span className="font-medium text-slate-700">{order.guestName}</span>
                                                {order.totalGuests > 1 && <span>(+{order.totalGuests - 1} khách)</span>}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <span className="w-4 flex justify-center"><Calendar size={14} /></span>
                                                <span>{formatDate(order.checkInDate)} - {formatDate(order.checkOutDate)} ({order.nights} đêm)</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <span className="w-4 flex justify-center"><BedIcon /></span>
                                                <span>{order.totalRooms} phòng</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price & Actions */}
                                    <div className="text-right flex flex-col justify-between items-end min-w-[180px]">
                                        <div className="mb-2">
                                            <span className="text-emerald-600 font-bold text-xl block">
                                                {formatCurrency(order.finalAmount)}
                                            </span>
                                            {order.discountTotal > 0 && (
                                                <span className="text-[10px] text-emerald-500 italic font-medium">
                                                    Đã giảm {formatCurrency(order.discountTotal)}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            {activeTab === "Sắp khởi hành" && (
                                                <>
                                                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors">
                                                        <Download size={14} /> Tải Voucher
                                                    </button>
                                                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors">
                                                        <MessageCircle size={14} /> Chat
                                                    </button>
                                                </>
                                            )}
                                            {activeTab === "Hoàn thành" && (
                                                <>
                                                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200">
                                                        <Star size={14} /> Đánh giá
                                                    </button>
                                                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200">
                                                        <RefreshCcw size={14} /> Đặt lại
                                                    </button>
                                                </>
                                            )}
                                            {activeTab === "Đã hủy" && (
                                                <button className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold hover:bg-rose-100">
                                                    Xem lý do hủy
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

// SVG Sub-icons
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