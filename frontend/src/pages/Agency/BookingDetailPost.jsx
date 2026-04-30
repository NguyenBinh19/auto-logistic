import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, Copy, Download, UserCircle, FileText,
    MessageCircle, XCircle, CheckCircle2, QrCode, Info, Star, Calendar, Loader2, ExternalLink, X
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { bookingService } from '@/services/booking.service.js';
import EditGuestModal from '@/components/agency/booking/EditGuestBookingModal.jsx';
import SubmitFeedbackModal from '@/components/agency/booking/SubmitFeedbackModal.jsx';
import CancelBookingModal from '@/components/agency/booking/CancelBookingModal.jsx';
import { pdfDocumentService } from "@/services/pdf.service.js";
import api from '../../services/axios.config';

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
            return { label: "ĐÃ ĐẶT", color: "bg-amber-500", desc: "Đơn hàng đã thanh toán." };
        case "CONFIRMED":
            return { label: "ĐÃ XÁC NHẬN", color: "bg-emerald-600", desc: "Thanh toán thành công. Sẵn sàng cho ngày Check-in." };
        case "CHECKED-IN":
            return { label: "ĐANG LƯU TRÚ", color: "bg-blue-600", desc: "Khách hàng đã làm thủ tục nhận phòng." };
        case "COMPLETED":
            return { label: "HOÀN THÀNH", color: "bg-slate-600", desc: "Giao dịch đã kết thúc." };
        case "CANCELLED":
            return { label: "ĐÃ HỦY", color: "bg-rose-600", desc: "Đơn hàng đã bị hủy hoặc quá hạn thanh toán." };
        case "NO_SHOW":
            return { label: "KHÔNG ĐẾN", color: "bg-purple-600", desc: "Khách hàng không đến nhận phòng theo lịch." };
        default:
            return { label: s, color: "bg-slate-400", desc: "" };
    }
};

const BookingDetailPost = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const bookingCode = decodeURIComponent(id || "");
    const [isPdfLoading, setIsPdfLoading] = useState(true);

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [showPolicyModal, setShowPolicyModal] = useState(false);
    const [policyUrl, setPolicyUrl] = useState("");
    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                const pdfRes = await pdfDocumentService.getAllPdfs();
                if (pdfRes?.result) {
                    // Tìm tài liệu có tiêu đề phù hợp với "Hủy phòng" hoặc "Hoàn tiền"
                    const policyDoc = pdfRes.result.find(doc =>
                        doc.title.includes("Phụ lục hủy phòng") ||
                        doc.title.includes("Chính sách hoàn tiền")
                    );
                    setPolicyUrl(policyDoc?.fileUrl || "");
                }
            } catch (error) {
                console.error("Không thể tải chính sách:", error);
            }
        };
        fetchPolicy();
    }, []);

    // Khóa cuộn trang khi mở modal
    useEffect(() => {
        document.body.style.overflow = showPolicyModal ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [showPolicyModal]);

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            try {
                const res = await bookingService.getBookingDetail(bookingCode);
                setBooking(res.result);
            } catch (err) {
                setError("Không thể tải chi tiết đơn hàng. Vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        };
        if (bookingCode) fetchDetail();
    }, [bookingCode]);

    //Download voucher
    const handleDownloadVoucher = async () => {
        if (!booking?.bookingCode) return;

        try {
            setIsDownloading(true);
            const response = await bookingService.downloadVoucher(booking.bookingCode);

            // Kiểm tra nếu response rỗng
            if (!response) {
                throw new Error("Dữ liệu file trống");
            }

            const blob = new Blob([response], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;

            const sanitizedName = (booking.guestName || "Guest").trim().replace(/\s+/g, '_');
            link.setAttribute("download", `Voucher_${booking.bookingCode}_${sanitizedName}.pdf`);

            document.body.appendChild(link);
            link.click();
            link.remove();

            // Giải phóng bộ nhớ
            setTimeout(() => window.URL.revokeObjectURL(url), 100);
            alert("Tải Voucher thành công!");

        } catch (error) {
            console.error("Download Error:", error);
            const status = error.response?.status;
            if (status === 403) {
                alert("Lỗi: Voucher chỉ khả dụng cho đơn hàng đã xác nhận (Confirmed).");
            } else if (status === 404) {
                alert("Lỗi: Không tìm thấy file Voucher trên hệ thống.");
            } else {
                alert("Hệ thống không thể tạo file lúc này. Vui lòng thử lại sau.");
            }
        } finally {
            setIsDownloading(false);
        }
    };

    // Hàm xử lý sau khi Modal lưu thành công
    const handleUpdateSuccess = (updatedBooking) => {
        setBooking(updatedBooking);
    };

    // Xử lý hủy phòng
    const canCancel = () => {
        if (!booking) return false;
        const s = booking.bookingStatus?.toUpperCase();
        // Chỉ cho phép hủy khi chưa Check-in và trạng thái là CONFIRMED hoặc BOOKED
        const validStatus = ['BOOKED'].includes(s);
        if (!validStatus) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkIn = new Date(booking.checkInDate);
        checkIn.setHours(0, 0, 0, 0);
        // Không cho phép bấm nút hủy nếu ngày hiện tại đã sau ngày Check-in
        return checkIn >= today;
    };

    const canEdit = () => {
        if (!booking || !booking.checkInDate) return false;

        const today = new Date();
        const checkIn = new Date(booking.checkInDate);
        // Reset thời gian về 0h để so sánh
        today.setHours(0, 0, 0, 0);
        checkIn.setHours(0, 0, 0, 0);
        // Cho phép sửa nếu ngày check-in vẫn còn ở tương lai (sau ngày hôm nay)
        return checkIn.getTime() > today.getTime();
    };

    // Hàm xử lý hủy đơn
    const handleCancelBooking = async (reason) => {
        const isConfirmed = window.confirm(
            "XÁC NHẬN HỦY: Hành động này không thể hoàn tác. Bạn có chắc chắn muốn tiếp tục?"
        );
        if (!isConfirmed) return;

        try {
            const payload = {
                bookingCode: booking.bookingCode,
                reason: reason || "Yêu cầu hủy"
            };
            const response = await bookingService.cancelBooking(payload);
            const data = response.result;
            // Cập nhật trạng thái tại chỗ
            setBooking(prev => ({
                ...prev,
                bookingStatus: 'CANCELLED'
            }));
            // Hiển thị thông báo chi tiết
            alert(
                `Hủy thành công!\n` +
                `---------------------------\n` +
                `Mã đơn: ${data.bookingCode}\n` +
                `Số tiền booking: ${formatCurrency(data.finalAmount)}\n` +
                `Phí hủy dịch vụ: ${formatCurrency(data.cancellationPenalty)}\n` +
                `Tiền hoàn lại cho bạn: ${formatCurrency(data.refundAmount)}\n` +
                `Lý do: ${data.reason}`
            );
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Không thể hủy đơn hàng này.";
            alert("Lỗi: " + errorMsg);
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        alert("Đã sao chép: " + text);
    };

    // Điều kiện đánh giá
    const canReview = () => {
        return booking?.bookingStatus?.toUpperCase() === 'COMPLETED' && !booking.hasFeedback;
    };

    const canDownloadVoucher = () => {
        const s = booking?.bookingStatus?.toUpperCase();
        return s === 'BOOKED' || s === 'CONFIRMED';
    };

    if (loading) {
        return (
            <div className="bg-[#f0f2f5] min-h-screen flex items-center justify-center">
                <p className="text-slate-500">Đang tải chi tiết đơn hàng...</p>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="bg-[#f0f2f5] min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-rose-500">{error || "Không tìm thấy đơn hàng"}</p>
                <button onClick={() => navigate(-1)} className="text-sm text-blue-600 underline">Quay lại</button>
            </div>
        );
    }

    const handleChatWithHotel = async () => {
        try {
            const currentUser = JSON.parse(sessionStorage.getItem("user"));

            if (!currentUser?.userId) {
                alert("Bạn cần đăng nhập để chat");
                return;
            }

            if (!booking?.hotelId) {
                alert("Không tìm thấy khách sạn");
                return;
            }

            const res = await api.post("/chat/init", null, {
                params: {
                    hotelId: booking.hotelId,
                    userId: currentUser.userId,
                    bookingId: booking.id,
                    bookingCode: booking.bookingCode,
                    hotelName: booking.hotelName,
                    room: booking.roomDetails?.[0]?.roomTitle,
                    checkIn: booking.checkInDate,
                    checkOut: booking.checkOutDate
                }
            });

            const convo = res.data;

            navigate(`/agency/chat-page`, {
                state: {
                    conversationId: convo.conversationId,
                    bookingInfo: {
                        bookingId: booking.id,
                        bookingCode: booking.bookingCode,
                        hotelName: booking.hotelName,
                        room: booking.roomDetails?.[0]?.roomTitle,
                        checkIn: booking.checkInDate,
                        checkOut: booking.checkOutDate
                    }
                }
            });

        } catch (err) {
            console.error("Chat init lỗi:", err);
            alert("Không thể mở chat");
        }
    };

    const statusConfig = getStatusConfig(booking.bookingStatus);

    return (
        <div className="bg-[#f0f2f5] min-h-screen pb-12 font-sans text-slate-700">
            <div className="max-w-4xl mx-auto p-4">

                {/* Tiêu đề trang */}
                <div className="mb-4">
                    <h1 className="text-xl font-bold text-slate-800">Chi tiết đơn hàng</h1>
                    <p className="text-xs text-slate-500">Quản lý và thực hiện các nghiệp vụ sau bán cho đơn hàng đã xác nhận</p>
                </div>

                {/* Banner Trạng thái */}
                <div className="bg-[#3b82f6] rounded-lg p-4 mb-4 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="bg-white rounded-full p-1">
                            <CheckCircle2 className="text-[#3b82f6]" size={20} />
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
                        <Copy size={14} /> Sao chép
                    </button>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

                    {/* 1. Các tác vụ hậu mãi */}
                    <div className="p-5 border-b border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-slate-800">
                                Các tác vụ hậu mãi
                            </h3>

                            <button
                                onClick={() => handleChatWithHotel()}
                                className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600"
                            >
                                <MessageCircle size={16} />
                                Chat với khách sạn
                            </button>
                        </div>
                        {/* Thay đổi grid-cols-4 thành grid-cols-2 md:grid-cols-5 để thêm nút Đánh giá */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {/* Nút Tải Voucher */}
                            <button
                                onClick={handleDownloadVoucher}
                                disabled={isDownloading || !canDownloadVoucher()}
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-md text-xs font-bold transition-all ${isDownloading || !canDownloadVoucher()
                                    ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-100"
                                    : "bg-[#006ce4] text-white hover:bg-blue-700 active:scale-95 shadow-sm"
                                    }`}
                            >
                                {isDownloading ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        <span>Đang xử lý...</span>
                                    </>
                                ) : (
                                    <>
                                        <Download size={14} />
                                        <span>Tải Voucher</span>
                                    </>
                                )}
                            </button>

                            {/* Sửa khách */}
                            <button
                                onClick={() => canEdit() ? setIsEditModalOpen(true) : alert("Không thể sửa thông tin tại thời điểm này.")}
                                className={`flex flex-col items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-bold transition-all border ${canEdit() ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50" : "bg-slate-50 text-slate-300 border-transparent cursor-not-allowed"
                                    }`}
                            >
                                <UserCircle size={18} className={canEdit() ? "text-slate-600" : "text-slate-300"} /> Sửa
                                thông tin khách
                            </button>

                            {/* Đánh giá: Hiện sau CHECKOUT */}
                            {booking.bookingStatus?.toUpperCase() === 'COMPLETED' && (
                                <button
                                    onClick={() => setIsReviewModalOpen(true)}
                                    disabled={booking.hasFeedback}
                                    className={`flex flex-col items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-bold transition-all ${booking.hasFeedback
                                        ? "bg-slate-100 text-slate-400 border border-transparent cursor-not-allowed"
                                        : "bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100"
                                        }`}
                                >
                                    <Star size={18} fill={booking.hasFeedback ? "none" : "currentColor"} />
                                    {booking.hasFeedback ? "Đã đánh giá" : "Đánh giá ngay"}
                                </button>
                            )}

                            {/* Nút Hủy phòng */}
                            <button
                                onClick={() => {
                                    if (!canCancel()) {
                                        alert("Không thể hủy đơn lúc này.");
                                        return;
                                    }
                                    if (policyUrl) {
                                        setShowPolicyModal(true); // Mở modal chính sách trước
                                    } else {
                                        setIsCancelModalOpen(true); // Nếu ko có PDF thì mở thẳng modal hủy như cũ
                                    }
                                }}
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-md text-xs font-bold transition-all ${canCancel() ? "bg-[#fef2f2] text-rose-600 hover:bg-rose-100" : "bg-slate-100 text-slate-300 cursor-not-allowed"
                                    }`}
                            >
                                <XCircle size={14} /> Hủy phòng
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
                                                <Star key={i} size={14} fill="#fabb05" className="text-[#fabb05]" />
                                            ))}
                                            <span className="text-xs text-slate-400 ml-2">Khách sạn {booking.hotelStarRating} sao</span>
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
                                        <span className="font-semibold text-slate-700">{booking.totalGuests} người</span>
                                    </div>
                                </div>

                                {/* Room Details */}
                                {booking.roomDetails?.length > 0 && (
                                    <div className="pt-3">
                                        <p className="text-xs font-bold text-slate-800 mb-2">Danh sách phòng:</p>
                                        <div className="space-y-2">
                                            {booking.roomDetails.map((room, i) => (
                                                <div key={i} className="text-xs flex justify-between bg-slate-50 rounded-lg px-3 py-2">
                                                    <span className="font-semibold text-slate-700">
                                                        {room.quantity}x {room.roomTitle}
                                                    </span>
                                                    <span className="text-slate-500">
                                                        {room.bedType && `${room.bedType} · `}{room.maxGuests} khách tối đa
                                                    </span>
                                                    <span className="font-bold text-emerald-600">{formatCurrency(room.totalAmount)}</span>
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
                                                <div key={i} className="text-xs flex justify-between px-3 py-1.5 bg-blue-50 rounded-lg">
                                                    <span className="text-slate-700">{s.serviceName} × {s.quantity}</span>
                                                    <span className="font-bold text-blue-700">{formatCurrency(s.totalPrice)}</span>
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
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Thông tin thanh toán</p>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Tổng tiền:</span>
                                    <span className="font-bold text-slate-900">{formatCurrency(booking.totalAmount)}</span>
                                </div>
                                {booking.discountAmount > 0 && (
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Giảm giá:</span>
                                        <span className="font-bold text-rose-600">- {formatCurrency(booking.discountAmount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xs border-t pt-2">
                                    <span className="text-slate-600 font-semibold">Thành tiền:</span>
                                    <span className="font-bold text-emerald-600 text-sm">{formatCurrency(booking.finalAmount)}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Phương thức TT:</span>
                                    <span className="font-bold text-slate-900">{booking.paymentMethod || "—"}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Trạng thái TT:</span>
                                    <span className={`font-bold ${booking.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-500'}`}>
                                        {booking.paymentStatus?.toUpperCase() || "—"}
                                    </span>
                                </div>
                            </div>

                            {/* Cột phải: Chính sách */}
                            <div className="space-y-3">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Chính sách quan trọng</p>
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

                {/* Nút quay lại */}
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-md transition-all border border-slate-200"
                    >
                        <ArrowLeft size={14} /> Quay lại danh sách
                    </button>
                </div>
            </div>

            {/* Modals */}
            <EditGuestModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                booking={booking}
                onSaveSuccess={handleUpdateSuccess}
            />

            <SubmitFeedbackModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                booking={booking}
                onSuccess={() => setBooking(prev => ({ ...prev, hasFeedback: true }))}
            />

            <CancelBookingModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                booking={booking}
                onConfirm={handleCancelBooking}
            />

            {/* MODAL PHỤ LỤC HỦY PHÒNG & HOÀN TIỀN */}
            {showPolicyModal && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-0 md:p-8 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-5xl h-full md:h-[94vh] md:rounded-[32px] overflow-hidden shadow-2xl flex flex-col relative animate-in zoom-in duration-300">
                        {/* Header Modal */}
                        <div className="absolute top-4 right-4 z-[100] flex items-center gap-2">
                            <a
                                href={policyUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2.5 bg-white/90 backdrop-blur-md text-slate-500 hover:text-blue-600 rounded-xl border border-slate-200 shadow-sm transition-all active:scale-95"
                            >
                                <ExternalLink size={18} />
                            </a>
                            <button
                                onClick={() => {
                                    setShowPolicyModal(false);
                                    setIsPdfLoading(true);
                                }}
                                className="p-2.5 bg-slate-900/90 backdrop-blur-md text-white hover:bg-red-500 rounded-xl shadow-lg transition-all active:scale-95"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Nội dung PDF */}
                        <div className="flex-1 bg-slate-50 relative overflow-hidden">
                            {policyUrl ? (
                                <div className="w-full h-full overflow-hidden">
                                    <object
                                        data={`${policyUrl}#navpanes=0&view=FitH&toolbar=0`}
                                        type="application/pdf"
                                        style={{
                                            width: '100%',
                                            height: 'calc(100% + 40px)',
                                            marginTop: '-40px'
                                        }}
                                        className="relative z-10"
                                        onLoad={() => setIsPdfLoading(false)}
                                    >
                                        <iframe
                                            src={`${policyUrl}#navpanes=0&view=FitH&toolbar=0`}
                                            className="w-full h-full border-none"
                                            title="Phụ lục hủy phòng"
                                            onLoad={() => setIsPdfLoading(false)}
                                        />
                                    </object>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-slate-500">Tài liệu không khả dụng.</p>
                                </div>
                            )}

                            {isPdfLoading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center z-[15] bg-slate-50">
                                    <Loader2 size={32} className="animate-spin text-blue-600 mb-2" />
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                        Đang tải chính sách hủy phòng...
                                    </span>
                                </div>
                            )}
                        </div>
                        {/* Footer Modal -*/}
                        <div className="p-4 bg-white border-t border-slate-100 flex justify-center z-20">
                            <button
                                onClick={() => {
                                    setShowPolicyModal(false);
                                    setIsCancelModalOpen(true);
                                    setIsPdfLoading(true);
                                }}
                                className="bg-rose-600 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-rose-700 transition-all active:scale-95"
                            >
                                Tôi đã hiểu, tiếp tục hủy đơn
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingDetailPost;


