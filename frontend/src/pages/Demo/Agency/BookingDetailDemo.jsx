import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, Copy, Download, UserCircle, FileText,
    XCircle, CheckCircle2, Info, Star, Calendar, Loader2,
    MapPin, Phone, Mail, BedDouble, Users, MessageSquare
} from 'lucide-react';
import { MOCK_BOOKING_FULL_DETAIL } from "@/constant/agency_mockData.js";

// Giả lập các Modal
const EditGuestModal = ({ isOpen, onClose }) => isOpen ? <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-in fade-in duration-200"><div className="bg-white p-6 rounded-xl shadow-xl"><h3>Sửa thông tin khách</h3><button onClick={onClose} className="mt-4 bg-slate-100 px-4 py-2 rounded-lg text-sm">Đóng</button></div></div> : null;
const SubmitFeedbackModal = ({ isOpen, onClose }) => isOpen ? <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-in fade-in duration-200"><div className="bg-white p-6 rounded-xl shadow-xl"><h3>Đánh giá</h3><button onClick={onClose} className="mt-4 bg-slate-100 px-4 py-2 rounded-lg text-sm">Đóng</button></div></div> : null;
const CancelBookingModal = ({ isOpen, onClose }) => isOpen ? <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-in fade-in duration-200"><div className="bg-white p-6 rounded-xl shadow-xl"><h3>Hủy phòng</h3><button onClick={onClose} className="mt-4 bg-rose-600 text-white px-4 py-2 rounded-lg text-sm">Đóng</button></div></div> : null;

const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const formatCurrency = (amount) => {
    if (amount == null) return "—";
    return Number(amount).toLocaleString("vi-VN") + " ₫";
};

const getStatusConfig = (status) => {
    const s = status?.toUpperCase();
    switch (s) {
        case "BOOKED":
            return { label: "ĐÃ ĐẶT", color: "bg-[#3b82f6]", desc: "Đơn hàng đã đặt chỗ." };
        case "CONFIRMED":
            return { label: "ĐÃ XÁC NHẬN", color: "bg-emerald-600", desc: "Thanh toán thành công." };
        case "CHECKED-IN":
            return { label: "ĐANG LƯU TRÚ", color: "bg-blue-600", desc: "Khách đã nhận phòng." };
        case "COMPLETED":
            return { label: "HOÀN THÀNH", color: "bg-slate-600", desc: "Giao dịch kết thúc." };
        case "CANCELLED":
            return { label: "ĐÃ HỦY", color: "bg-rose-600", desc: "Đơn hàng đã bị hủy." };
        default:
            return { label: s, color: "bg-slate-400", desc: "" };
    }
};

const BookingDetailPost = () => {
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        // Giả lập fetch API
        const timer = setTimeout(() => {
            setBooking(MOCK_BOOKING_FULL_DETAIL);
            setLoading(false);
        }, 600);
        return () => clearTimeout(timer);
    }, []);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        alert("Đã sao chép: " + text);
    };

    const handleDownloadVoucher = () => {
        setIsDownloading(true);
        setTimeout(() => {
            setIsDownloading(false);
            alert("Đã kích hoạt tải Voucher!");
        }, 1200);
    };

    // Logic kiểm tra trạng thái
    const canDownloadVoucher = () => ['BOOKED', 'CONFIRMED'].includes(booking?.bookingStatus?.toUpperCase());
    const canEdit = () => {
        if (!booking) return false;
        const today = new Date().setHours(0,0,0,0);
        const checkIn = new Date(booking.checkInDate).setHours(0,0,0,0);
        return checkIn > today;
    };
    const canCancel = () => ['BOOKED'].includes(booking?.bookingStatus?.toUpperCase());

    if (loading) {
        return (
            <div className="bg-[#f0f2f5] min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin text-blue-600 mx-auto mb-2" size={32} />
                    <p className="text-slate-500 text-sm font-medium">Đang tải chi tiết đơn hàng...</p>
                </div>
            </div>
        );
    }

    const statusConfig = getStatusConfig(booking.bookingStatus);

    return (
        <div className="bg-[#f0f2f5] min-h-screen pb-12 font-sans text-slate-700">
            <div className="max-w-4xl mx-auto p-4">

                {/* Tiêu đề trang */}
                <div className="mb-4">
                    <h1 className="text-xl font-bold text-slate-800">Chi tiết đơn hàng</h1>
                    <p className="text-xs text-slate-500">Quản lý và thực hiện các nghiệp vụ sau bán cho đơn hàng đã xác
                        nhận</p>
                </div>

                {/* Banner Trạng thái */}
                <div className="bg-[#3b82f6] rounded-lg p-4 mb-4 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="bg-white rounded-full p-1">
                            <CheckCircle2 className="text-[#3b82f6]" size={20}/>
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-sm uppercase tracking-wide">{statusConfig.label}</h2>
                            <p className="text-blue-100 text-xs">{booking.bookingCode}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleCopy(booking.bookingCode)}
                        className="flex items-center gap-1.5 text-white text-xs font-medium hover:underline"
                    >
                        <Copy size={14}/> Sao chép
                    </button>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

                    {/* 1. Các tác vụ hậu mãi */}
                    <div className="p-5 border-b border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-slate-800">Các tác vụ hậu mãi</h3>
                            <span className="text-[10px] text-slate-400 font-medium">Chế độ ẩn giá (Agent Mode)</span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {/* Nút Tải Voucher */}
                            <button
                                onClick={handleDownloadVoucher}
                                disabled={isDownloading || !canDownloadVoucher()}
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-md text-xs font-bold transition-all ${
                                    isDownloading || !canDownloadVoucher()
                                        ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-100"
                                        : "bg-[#006ce4] text-white hover:bg-blue-700 active:scale-95 shadow-sm"
                                }`}
                            >
                                {isDownloading ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin"/>
                                        <span>Đang xử lý...</span>
                                    </>
                                ) : (
                                    <>
                                        <Download size={14}/>
                                        <span>Tải Voucher</span>
                                    </>
                                )}
                            </button>

                            {/* Sửa khách */}
                            <button
                                onClick={() => canEdit() ? setIsEditModalOpen(true) : alert("Không thể sửa thông tin tại thời điểm này.")}
                                className={`flex flex-col items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-bold transition-all border ${
                                    canEdit() ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50" : "bg-slate-50 text-slate-300 border-transparent cursor-not-allowed"
                                }`}
                            >
                                <UserCircle size={18} className={canEdit() ? "text-slate-600" : "text-slate-300"}/> Sửa
                                thông tin khách
                            </button>

                            {/* Đánh giá: Hiện sau CHECKOUT */}
                            {booking.bookingStatus?.toUpperCase() === 'COMPLETED' && (
                                <button
                                    onClick={() => setIsReviewModalOpen(true)}
                                    disabled={booking.hasFeedback}
                                    className={`flex flex-col items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-bold transition-all ${
                                        booking.hasFeedback
                                            ? "bg-slate-100 text-slate-400 border border-transparent cursor-not-allowed"
                                            : "bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                    }`}
                                >
                                    <Star size={18} fill={booking.hasFeedback ? "none" : "currentColor"}/>
                                    {booking.hasFeedback ? "Đã đánh giá" : "Đánh giá ngay"}
                                </button>
                            )}

                            {/* Nút Hủy phòng */}
                            <button
                                onClick={() => canCancel() ? setIsCancelModalOpen(true) : alert("Không thể hủy đơn lúc này.")}
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-md text-xs font-bold transition-all ${
                                    canCancel() ? "bg-[#fef2f2] text-rose-600 hover:bg-rose-100" : "bg-slate-100 text-slate-300 cursor-not-allowed"
                                }`}
                            >
                                <XCircle size={14}/> Hủy phòng
                            </button>
                        </div>
                    </div>

                    {/* 2. Xem nhanh Vé điện tử */}
                    <div className="p-5">
                        <h3 className="text-sm font-bold text-slate-800 mb-4">Xem nhanh Vé điện tử</h3>
                        <div className="border border-slate-200 rounded-xl p-6 relative">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h4 className="text-lg font-bold text-slate-900 leading-tight">{booking.hotelName}</h4>
                                    {booking.hotelStarRating > 0 && (
                                        <div className="flex gap-0.5 mt-1">
                                            {[...Array(booking.hotelStarRating)].map((_, i) => (
                                                <Star key={i} size={14} fill="#fabb05" className="text-[#fabb05]"/>
                                            ))}
                                            <span
                                                className="text-xs text-slate-400 ml-2">Khách sạn {booking.hotelStarRating} sao</span>
                                        </div>
                                    )}
                                    {booking.hotelAddress && (
                                        <p className="text-xs text-slate-400 mt-1">{booking.hotelAddress}</p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Stay Info</p>
                                    <p className="text-sm font-bold text-slate-800">
                                        {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                                    </p>
                                    <p className="text-[11px] text-slate-500">({booking.nights} Đêm)</p>
                                </div>
                            </div>

                            {/* Guest Info */}
                            <div className="space-y-3">
                                <p className="text-xs font-bold text-slate-800">Thông tin khách lưu trú:</p>
                                <div className="text-xs grid grid-cols-2 gap-2">
                                    <div className="flex gap-2">
                                        <span className="text-slate-400">Họ tên:</span>
                                        <span className="font-semibold text-slate-700">{booking.guestName}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-slate-400">Điện thoại:</span>
                                        <span className="font-semibold text-slate-700">{booking.guestPhone}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-slate-400">Email:</span>
                                        <span className="font-semibold text-slate-700">{booking.guestEmail}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-slate-400">Số khách:</span>
                                        <span
                                            className="font-semibold text-slate-700">{booking.totalGuests} người</span>
                                    </div>
                                </div>

                                {/* Room Details */}
                                {booking.roomDetails?.length > 0 && (
                                    <div className="pt-3">
                                        <p className="text-xs font-bold text-slate-800 mb-2">Danh sách phòng:</p>
                                        <div className="space-y-2">
                                            {booking.roomDetails.map((room, i) => (
                                                <div key={i}
                                                     className="text-xs flex justify-between bg-slate-50 rounded-lg px-3 py-2">
                                                    <span className="font-semibold text-slate-700">
                                                        {room.quantity}x {room.roomTitle}
                                                    </span>
                                                    <span className="text-slate-500">
                                                        {room.bedType && `${room.bedType} · `}{room.maxGuests} khách tối đa
                                                    </span>
                                                    <span
                                                        className="font-bold text-emerald-600">{formatCurrency(room.totalAmount)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Addon Services */}
                                {booking.addonServices?.length > 0 && (
                                    <div className="pt-2">
                                        <p className="text-xs font-bold text-slate-800 mb-1">Dịch vụ thêm:</p>
                                        <div className="space-y-1">
                                            {booking.addonServices.map((s, i) => (
                                                <div key={i}
                                                     className="text-xs flex justify-between px-3 py-1.5 bg-blue-50 rounded-lg">
                                                    <span
                                                        className="text-slate-700">{s.serviceName} × {s.quantity}</span>
                                                    <span
                                                        className="font-bold text-blue-700">{formatCurrency(s.totalPrice)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {booking.notes && (
                                    <div className="pt-2 text-xs text-slate-500 italic">
                                        Ghi chú: {booking.notes}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 3. Tài chính & Chính sách */}
                    <div className="p-5 bg-[#fcfcfc] border-t border-slate-100">
                        <h3 className="text-sm font-bold text-slate-800 mb-4">Thông tin tài chính & Chính sách</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Cột trái: Thanh toán */}
                            <div className="space-y-3">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Thông tin
                                    thanh toán</p>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Tổng tiền:</span>
                                    <span
                                        className="font-bold text-slate-900">{formatCurrency(booking.totalAmount)}</span>
                                </div>
                                {booking.discountAmount > 0 && (
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Giảm giá:</span>
                                        <span
                                            className="font-bold text-rose-600">- {formatCurrency(booking.discountAmount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xs border-t pt-2">
                                    <span className="text-slate-600 font-semibold">Thành tiền:</span>
                                    <span
                                        className="font-bold text-emerald-600 text-sm">{formatCurrency(booking.finalAmount)}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Phương thức TT:</span>
                                    <span className="font-bold text-slate-900">{booking.paymentMethod || "—"}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Trạng thái TT:</span>
                                    <span
                                        className={`font-bold ${booking.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-500'}`}>
                                        {booking.paymentStatus?.toUpperCase() || "—"}
                                    </span>
                                </div>
                            </div>

                            {/* Cột phải: Chính sách */}
                            <div className="space-y-3">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Chính sách
                                    quan trọng</p>
                                <div className="bg-[#f8f9fa] p-3 rounded-lg border-l-4 border-blue-500">
                                    <p className="text-[11px] font-bold text-slate-700">Trạng thái đơn</p>
                                    <p className="text-xs text-slate-600">{booking.bookingStatus?.toUpperCase()}</p>
                                </div>
                                <div className="bg-[#fef2f2] p-3 rounded-lg border-l-4 border-rose-500">
                                    <p className="text-[11px] font-bold text-rose-700">Chính sách hủy</p>
                                    <p className="text-xs text-rose-600 leading-relaxed">
                                        Phí phạt được tính dựa trên thời điểm hủy so với ngày Check-in.
                                        Hệ thống sẽ tự động trừ phí vào số tiền đã thanh toán và hoàn trả phần còn lại
                                        vào ví của bạn.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modals */}
                <EditGuestModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}/>
                <SubmitFeedbackModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)}/>
                <CancelBookingModal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)}/>
            </div>
        </div>
    );
};

export default BookingDetailPost;