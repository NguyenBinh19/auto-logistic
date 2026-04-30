import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import {
    Check, Copy, Home, Download, Wallet, MapPin, Loader2,
    Info, FileText, CreditCard, AlertCircle
} from "lucide-react";

const BookingSuccessDemo = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Lấy dữ liệu từ state (payload truyền từ màn hình Checkout)
    const state = location.state || {};

    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState(null);
    // Giả lập số dư mới (Thực tế sẽ gọi API như code mẫu của bạn)
    const [currentBalance, setCurrentBalance] = useState(15000000);

    // Chuẩn hóa dữ liệu hiển thị từ state
    const display = useMemo(() => ({
        code: state.bookingCode || "N/A",
        hotelName: state.hotelName || "Khách sạn chưa xác định",
        hotelImage: state.hotelImage,
        guestName: state.guestName || "Khách hàng lẻ",
        guestPhone: state.guestPhone || "Chưa có SĐT",
        guestEmail: state.guestEmail || "Chưa có email",
        checkIn: state.checkInDate || "",
        checkOut: state.checkOutDate || "",
        totalPrice: state.totalPrice || 0,
        paymentMethod: state.paymentMethod || "WALLET",
        rooms: state.totalRooms || 1,
        nights: state.totalNights || 1
    }), [state]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Helper định dạng
    const formatCurrency = (v) => new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND"
    }).format(v || 0);

    const safeFormatDate = (dateStr) => {
        if (!dateStr) return "---";
        try {
            // Nếu dateStr đã là định dạng dd/MM/yyyy thì trả về luôn
            if (dateStr.includes("/") && dateStr.length <= 10) return dateStr;
            return format(parseISO(dateStr), "dd/MM/yyyy");
        } catch (e) { return dateStr; }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert("Đã sao chép mã đặt phòng!");
    };

    const handleDownloadVoucher = () => {
        setIsDownloading(true);
        setDownloadError(null);
        // Giả lập logic tải file
        setTimeout(() => {
            setIsDownloading(false);
            alert("Đã tải Voucher PDF cho khách " + display.guestName);
        }, 1500);
    };

    // Giao diện khi không có dữ liệu (F5 trang)
    if (!location.state) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center p-8 bg-white rounded-2xl shadow-sm border max-w-sm">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <MapPin size={32} />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800">Không tìm thấy đơn hàng</h2>
                    <p className="text-slate-500 text-sm mt-2">Vui lòng quay lại trang chủ để kiểm tra danh sách đơn hàng.</p>
                    <button onClick={() => navigate("/")} className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl font-bold">VỀ TRANG CHỦ</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans antialiased">
            <div className="max-w-4xl mx-auto pt-12 px-4 text-center">

                {/* ICON THÀNH CÔNG VỚI HIỆU ỨNG BLUR */}
                <div className="relative inline-flex mb-6">
                    <div className="absolute inset-0 bg-emerald-200 blur-2xl opacity-40 rounded-full animate-pulse"></div>
                    <div className="relative inline-flex items-center justify-center w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full shadow-sm">
                        <Check size={40} strokeWidth={4}/>
                    </div>
                </div>

                <h1 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">
                    Thanh toán thành công! Đơn hàng đã được xác nhận.
                </h1>

                {/* BOOKING CODE CARD */}
                <div className="bg-white border border-slate-200 rounded-2xl py-5 px-10 inline-flex items-center gap-12 shadow-sm mb-10 group transition-all hover:border-blue-200">
                    <span className="text-slate-400 font-black text-[11px] uppercase tracking-wider">Mã đặt phòng</span>
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
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-wider">Khách sạn</p>
                                <p className="font-black text-slate-800 text-lg leading-tight uppercase">{display.hotelName}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-wider">Khách chính</p>
                                <p className="font-bold text-slate-700 text-base uppercase">{display.guestName}</p>
                                <p className="text-xs text-slate-400 font-medium">{display.guestPhone}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-wider">Thời gian lưu trú</p>
                                <p className="font-bold text-slate-700">{safeFormatDate(display.checkIn)} — {safeFormatDate(display.checkOut)}</p>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter mt-1">{display.nights} đêm • {display.rooms} Phòng</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-wider">Trạng thái đặt phòng</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase">Đã thanh toán</span>
                                    <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase">Confirmed</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CHI TIẾT THANH TOÁN (CARD MÀU XANH) */}
                <div className="bg-[#0ea5e9] rounded-3xl p-8 text-white text-left shadow-xl shadow-blue-100 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                        <Wallet size={120}/>
                    </div>
                    <h3 className="font-black text-xs uppercase tracking-[0.2em] mb-6 opacity-80">Chi tiết giao dịch</h3>
                    <div className="space-y-4 relative z-10">
                        <div className="flex justify-between items-center border-b border-white/20 pb-4">
                            <span className="text-sm font-bold opacity-90 flex items-center gap-2">
                                {display.paymentMethod === "CREDIT" ? <CreditCard size={18}/> : <Wallet size={18}/>}
                                Nguồn tiền: {display.paymentMethod === "CREDIT" ? "Hạn mức Tín dụng" : "Ví trả trước"}
                            </span>
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
                                    {formatCurrency(currentBalance)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* THÔNG BÁO LỖI */}
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
                        onClick={() => navigate("/demo-agency/search-hotel")}
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
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <p className="font-black text-slate-800 text-sm">Xác nhận tức thì</p>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">Đơn hàng đã được hệ thống khách sạn xác nhận ngay lập tức.</p>
                        </div>
                        <div className="space-y-2">
                            <p className="font-black text-slate-800 text-sm">Voucher điện tử</p>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">PDF đã được ẩn giá Net, sẵn sàng gửi cho khách hàng lẻ.</p>
                        </div>
                        <div className="space-y-2">
                            <p className="font-black text-slate-800 text-sm">Hóa đơn VAT</p>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">Hóa đơn đã được gửi vào hòm thư nội bộ của đại lý.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingSuccessDemo;