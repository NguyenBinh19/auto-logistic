import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import {
    Check, Copy, Home, Download, Wallet, MapPin, Loader2,
    Info, FileText, CreditCard, AlertCircle
} from "lucide-react";
import { bookingService } from "@/services/booking.service.js";
import api from "@/services/axios.config.js";

const BookingSuccessPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { booking, checkoutData } = location.state || {};

    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState(null);
    const [currentBalance, setCurrentBalance] = useState(null);

    const display = useMemo(() => ({
        code: booking?.bookingCode || checkoutData?.bookingCode || "N/A",
        hotelName: checkoutData?.hotelName || "Khách sạn chưa xác định",
        guestName: checkoutData?.guestName || "Khách hàng lẻ",
        guestPhone: checkoutData?.guestPhone || "Chưa có SĐT",
        guestEmail: checkoutData?.guestEmail || checkoutData?.email || booking?.guestEmail || "Chưa có email",
        checkIn: checkoutData?.checkInDate || "",
        checkOut: checkoutData?.checkOutDate || "",
        totalPrice: booking?.grandPrice || checkoutData?.grandPrice || booking?.totalPrice || checkoutData?.totalPrice || 0,
        paymentMethod: checkoutData?.paymentMethod || "WALLET",
        rooms: checkoutData?.rooms?.length || 1,
        nights: checkoutData?.totalNights || 1
    }), [booking, checkoutData]);

    useEffect(() => {
        const fetchLatestBalance = async () => {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            if (user?.agencyId) {
                try {
                    // Gọi API finance để lấy số dư ĐÃ TRỪ sau khi đặt phòng thành công
                    const res = await api.get(`/agencies/${user.agencyId}/finance`);
                    if (res.data?.result) {
                        // Tùy vào phương thức thanh toán mà lấy Wallet hoặc Credit
                        const balance = display.paymentMethod === "CREDIT"
                            ? res.data.result.currentCredit
                            : res.data.result.walletBalance;
                        setCurrentBalance(balance);
                    }
                } catch (err) {
                    console.error("Không thể cập nhật số dư mới:", err);
                }
            }
        };
        fetchLatestBalance();
    }, [display.paymentMethod]);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (!booking && !checkoutData) {
            console.error("Không tìm thấy dữ liệu đơn hàng.");
        }
    }, [booking, checkoutData]);

    // Helper định dạng
    const formatCurrency = (v) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v || 0);

    const safeFormatDate = (dateStr) => {
        if (!dateStr) return "---";
        try {
            if (dateStr.includes("/")) return dateStr;
            return format(parseISO(dateStr), "dd/MM/yyyy");
        } catch (e) { return dateStr; }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert("Đã sao chép mã đặt phòng!");
    };

    // Logic tải Voucher
    const handleDownloadVoucher = async () => {
        if (display.code === "N/A") {
            setDownloadError("Không tìm thấy mã đặt phòng hợp lệ.");
            return;
        }

        try {
            setIsDownloading(true);
            setDownloadError(null);

            const response = await bookingService.downloadVoucher(display.code);

            const blob = new Blob([response], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;

            // Format tên file chuẩn Agency: Voucher_[Mã]_[TênKhách].pdf
            const sanitizedName = display.guestName.trim().replace(/\s+/g, '_');
            link.setAttribute("download", `Voucher_${display.code}_${sanitizedName}.pdf`);

            document.body.appendChild(link);
            link.click();
            link.remove();

            // Hủy URL sau 100ms để đảm bảo download đã kích hoạt thành công
            setTimeout(() => window.URL.revokeObjectURL(url), 100);
        } catch (error) {
            console.error("Download Error:", error);
            const status = error.response?.status;
            setDownloadError(
                status === 403
                    ? "Voucher chỉ khả dụng cho các đơn hàng đã XÁC NHẬN (Confirmed)."
                    : "Hệ thống không thể tạo file lúc này. Vui lòng thử lại sau."
            );
        } finally {
            setIsDownloading(false);
        }
    };

    if (!booking && !checkoutData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center p-8 bg-white rounded-2xl shadow-sm border max-w-sm">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <MapPin size={32} />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800">Không tìm thấy đơn hàng</h2>
                    <p className="text-slate-500 text-sm mt-2">Vui lòng quay lại trang chủ để kiểm tra danh sách đơn hàng.</p>
                    <button onClick={() => navigate("/homepage")} className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl font-bold">VỀ TRANG CHỦ</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans antialiased">
            <div className="max-w-4xl mx-auto pt-12 px-4 text-center">

                {/* ICON THÀNH CÔNG */}
                <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full mb-6 shadow-sm">
                    <Check size={40} strokeWidth={4}/>
                </div>

                <h1 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">Thanh toán thành công! Đơn hàng đã được xác nhận. </h1>
                {/*<p className="text-slate-500 font-medium mb-8">*/}
                {/*    Mã đặt phòng đã được gửi đến <span className="text-slate-800 font-bold">{display.guestEmail}</span>*/}
                {/*</p>*/}

                {/* BOOKING CODE CARD */}
                <div className="bg-white border border-slate-200 rounded-2xl py-5 px-10 inline-flex items-center gap-12 shadow-sm mb-10">
                    <span className="text-slate-600 font-black text-[11px] uppercase tracking-wider">Mã đặt phòng</span>
                    <div className="flex items-center gap-4">
                        <span className="text-2xl font-black text-blue-700 tracking-tighter uppercase">#{display.code}</span>
                        <button onClick={() => copyToClipboard(display.code)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
                            <Copy size={20}/>
                        </button>
                    </div>
                </div>

                {/* TÓM TẮT ĐƠN HÀNG */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm text-left overflow-hidden mb-6">
                    <div className="p-6 border-b border-dashed border-slate-200 bg-slate-50/50 flex items-center gap-3">
                        <FileText size={20} className="text-blue-600"/>
                        <h2 className="font-black text-slate-800 uppercase tracking-widest text-xs">Tóm tắt đơn hàng</h2>
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-16">
                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] font-black text-slate-600 uppercase mb-1 tracking-wider">Khách sạn</p>
                                <p className="font-black text-slate-800 text-lg leading-tight uppercase">{display.hotelName}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-600 uppercase mb-1 tracking-wider">Khách chính</p>
                                <p className="font-bold text-slate-700 text-base">{display.guestName}</p>
                                <p className="text-xs text-slate-400 font-medium">{display.guestPhone}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] font-black text-slate-600 uppercase mb-1 tracking-wider">Thời gian lưu trú</p>
                                <p className="font-bold text-slate-700">{safeFormatDate(display.checkIn)} — {safeFormatDate(display.checkOut)}</p>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter mt-1">{display.nights} đêm • {display.rooms} Phòng</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-600 uppercase mb-1 tracking-wider">Trạng thái đặt phòng</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase">Đã thanh toán</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CHI TIẾT THANH TOÁN */}
                <div className="bg-[#0ea5e9] rounded-3xl p-8 text-white text-left shadow-xl shadow-blue-100 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Wallet size={120}/>
                    </div>
                    <h3 className="font-black text-xs uppercase tracking-[0.2em] mb-6 opacity-80">Chi tiết giao dịch</h3>
                    <div className="space-y-4 relative z-10">
                        <div className="flex justify-between items-center border-b border-white/20 pb-4">
            <span className="text-sm font-bold opacity-90 flex items-center gap-2">
                {display.paymentMethod === "CREDIT" ? <CreditCard size={18}/> : <Wallet size={18}/>}
                Nguồn tiền: {display.paymentMethod === "CREDIT" ? "Hạn mức Tín dụng" : "Ví trả trước"}
            </span>
                            {/* Hiển thị số tiền đã trừ */}
                            <span className="font-black text-2xl">-{formatCurrency(display.totalPrice)}</span>
                        </div>

                        <div className="flex justify-between items-center pt-2">
            <span className="text-sm font-medium opacity-80 italic underline underline-offset-4">
                Hệ thống đã cập nhật số dư của bạn.
            </span>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase opacity-60">
                                    Số dư {display.paymentMethod === "CREDIT" ? "tín dụng" : "ví"} khả dụng
                                </p>
                                <p className="font-black text-lg tracking-tighter">
                                    {/* Hiển thị số dư thực tế từ API, nếu đang load thì hiện "..." */}
                                    {currentBalance !== null ? formatCurrency(currentBalance) : "---"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* THÔNG BÁO LỖI (NẾU CÓ) */}
                {downloadError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600 max-w-lg mx-auto text-sm animate-in fade-in duration-300">
                        <AlertCircle size={18}/>
                        <span className="font-medium">{downloadError}</span>
                    </div>
                )}

                {/* NÚT HÀNH ĐỘNG */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 max-w-2xl mx-auto">
                    <button
                        onClick={handleDownloadVoucher}
                        disabled={isDownloading}
                        className={`flex flex-col items-center justify-center p-6 rounded-2xl transition-all group shadow-lg shadow-blue-100 
                            ${isDownloading ? 'bg-blue-400 cursor-wait' : 'bg-[#2563eb] hover:bg-blue-700 active:scale-95'}`}
                    >
                        {isDownloading ? <Loader2 className="mb-2 animate-spin text-white" size={24}/> :
                            <Download className="mb-2 text-white group-hover:translate-y-0.5 transition-transform" size={24}/>}
                        <span className="font-black text-sm uppercase text-white">{isDownloading ? "Đang xử lý..." : "Tải Voucher (PDF)"}</span>
                    </button>

                    <button
                        onClick={() => navigate("/agency/agency-dashboard")}
                        className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                    >
                        <Home className="mb-2 text-slate-400" size={24}/>
                        <span className="font-black text-sm uppercase">Về trang chủ</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Quản lý đơn hàng</span>
                    </button>
                </div>

                {/* THÔNG TIN LƯU Ý */}
                <div className="bg-white rounded-3xl border border-slate-200 p-8 text-left shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                    <h3 className="font-black text-slate-800 mb-8 uppercase tracking-widest text-[10px] flex items-center gap-2">
                        <Info size={16} className="text-emerald-500"/> Thông tin cần lưu ý
                    </h3>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <p className="font-black text-slate-800 text-sm">Xác nhận tức thì</p>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">Đơn hàng đã được hệ thống khách sạn xác nhận ngay lập tức.</p>
                        </div>
                        <div className="space-y-2">
                            <p className="font-black text-slate-800 text-sm">Voucher điện tử</p>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">PDF đã chuẩn, sẵn sàng gửi cho khách hàng.</p>
                        </div>
                        {/*<div className="space-y-2">*/}
                        {/*    <p className="font-black text-slate-800 text-sm">Hóa đơn VAT</p>*/}
                        {/*    <p className="text-xs text-slate-500 font-medium leading-relaxed">Hóa đơn đã được gửi vào hòm thư nội bộ của đại lý.</p>*/}
                        {/*</div>*/}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingSuccessPage;