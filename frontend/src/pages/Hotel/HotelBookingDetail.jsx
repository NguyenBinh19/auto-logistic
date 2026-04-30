import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft, Calendar, User, Phone, Mail, MapPin,
    Star, BedDouble, Users, Maximize2, CreditCard,
    ArrowLeftRight, Printer, Download, Clock, Hotel,
    ShieldCheck, Tag, Coffee, Info, Sparkles, CheckCircle2
} from 'lucide-react';
import { bookingService } from '@/services/booking.service.js';

const HotelBookingDetail = () => {
    const { bookingCode } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    const STATUS_CONFIG = {
        "BOOKED": { label: "ĐÃ ĐẶT", color: "bg-amber-500", text: "text-amber-500", shadow: "shadow-amber-200" },
        "CONFIRMED": { label: "ĐÃ XÁC NHẬN", color: "bg-emerald-600", text: "text-emerald-600", shadow: "shadow-emerald-200" },
        "CHECKED-IN": { label: "ĐANG LƯU TRÚ", color: "bg-blue-600", text: "text-blue-600", shadow: "shadow-blue-200" },
        "CHECKED-OUT": { label: "HOÀN THÀNH", color: "bg-slate-600", border: "border-slate-300", text: "text-white" },
        "COMPLETED": { label: "HOÀN THÀNH", color: "bg-slate-600", text: "text-slate-600", shadow: "shadow-slate-200" },
        "CANCELLED": { label: "ĐÃ HỦY", color: "bg-rose-600", text: "text-rose-600", shadow: "shadow-rose-200" },
        "NO_SHOW": { label: "KHÔNG ĐẾN", color: "bg-purple-600", text: "text-purple-600", shadow: "shadow-purple-200" },
    };

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            try {
                const data = await bookingService.getBookingDetailOfAdmin(bookingCode);
                if (data && data.result) setBooking(data.result);
            } catch (err) {
                console.error("Lỗi lấy chi tiết:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [bookingCode]);

    const formatVND = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const formatDate = (dateStr) => {
        if(!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const parseAmenities = (amenityStr) => {
        try {
            return amenityStr ? JSON.parse(amenityStr) : [];
        } catch (e) {
            return [];
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-black animate-pulse tracking-widest text-xs">ĐANG TRUY XUẤT DỮ LIỆU...</p>
            </div>
        </div>
    );

    if (!booking) return <div className="p-20 text-center font-bold text-slate-400">Không tìm thấy mã đơn hàng này trên hệ thống.</div>;

    const status = STATUS_CONFIG[booking.bookingStatus?.toUpperCase()] || { label: booking.bookingStatus, color: "bg-slate-400" };

    return (
        <div className="bg-[#f1f5f9] min-h-screen p-4 md:p-8 font-sans text-slate-900">
            <div className="max-w-6xl mx-auto">

                {/* Header Action Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-black text-[10px] tracking-[0.2em] transition-all mb-4"
                        >
                            <ChevronLeft size={16} /> QUAY LẠI DANH SÁCH
                        </button>
                        <h1 className="text-3xl font-black tracking-tighter text-slate-800 flex items-center gap-3">
                            Chi tiết <span className="text-blue-600">Đơn hàng</span>
                        </h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column (2/3) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* 1. Tổng quan đơn hàng */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/60 border border-white relative overflow-hidden">
                            <div className={`absolute top-0 right-0 px-10 py-3 ${status.color} text-white font-black text-[11px] rounded-bl-[1.5rem] tracking-[0.2em] shadow-lg ${status.shadow}`}>
                                {status.label}
                            </div>

                            <div className="mb-10">
                                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest mb-3 inline-block">Mã hệ thống: {booking.bookingId}</span>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tight">{booking.bookingCode}</h2>
                                <p className="text-slate-400 font-bold text-xs mt-2 flex items-center gap-2">
                                    <Clock size={14}/> Khởi tạo lúc: {new Date(booking.createdAt).toLocaleTimeString('vi-VN')} ngày {formatDate(booking.createdAt)}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Ngày đến</p>
                                    <p className="font-black text-slate-800 text-lg">{formatDate(booking.checkInDate)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Ngày đi</p>
                                    <p className="font-black text-slate-800 text-lg">{formatDate(booking.checkOutDate)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Thời gian</p>
                                    <p className="font-black text-blue-600 text-lg">{booking.nights} ĐÊM</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Số khách</p>
                                    <p className="font-black text-slate-800 text-lg">{booking.totalGuests} NGƯỜI</p>
                                </div>
                            </div>
                        </div>

                        {/* 2. Chi tiết phòng lưu trú */}
                        <div className="space-y-5">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                    <BedDouble className="text-blue-600" /> Danh sách phòng ({booking.totalRooms})
                                </h3>
                            </div>
                            {booking.roomDetails.map((room, idx) => (
                                <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-white shadow-xl flex flex-col md:flex-row gap-8">
                                    <div className="w-full md:w-40 h-40 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 border border-slate-100 flex-shrink-0">
                                        <Hotel size={48} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="font-black text-slate-900 text-xl tracking-tight">{room.roomTitle}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Mã: {room.roomCode}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{room.bedType} Bed</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Đơn giá / Đêm</p>
                                                <p className="font-black text-slate-900 text-lg">{formatVND(room.pricePerNight)}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-6">
                                            <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-black border border-blue-100 uppercase tracking-tighter flex items-center gap-1">
                                                <Users size={12}/> Tối đa {room.maxGuests} khách
                                            </span>
                                            {parseAmenities(room.amenities).map((amn, i) => (
                                                <span key={i} className="px-3 py-1.5 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black border border-slate-100 uppercase tracking-tighter flex items-center gap-1">
                                                    <CheckCircle2 size={12} className="text-emerald-500"/> {amn}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="pt-5 border-t border-slate-50 flex justify-between items-center">
                                            <p className="text-[10px] font-black text-slate-400 uppercase">Thành tiền phòng</p>
                                            <p className="font-black text-slate-900 text-xl tracking-tighter">{formatVND(room.subtotalAmount)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 3. Dịch vụ bổ sung (Add-ons) */}
                        {booking.addonServices?.length > 0 && (
                            <div className="space-y-5">
                                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 ml-2">
                                    <Sparkles className="text-amber-500" /> Dịch vụ đi kèm
                                </h3>
                                <div className="bg-white rounded-[2.5rem] border border-white shadow-xl overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                            <th className="px-8 py-5">Tên dịch vụ / Ghi chú</th>
                                            <th className="px-6 py-5 text-center">Số lượng</th>
                                            <th className="px-8 py-5 text-right">Tổng phí</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                        {booking.addonServices.map((svc, i) => (
                                            <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="font-black text-slate-800 text-sm uppercase tracking-tight">{svc.serviceName}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold mt-1 flex items-center gap-2 italic">
                                                        <Info size={12} className="text-amber-500"/> {svc.specialNote || "Không có yêu cầu đặc biệt"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-center">
                                                    <span className="px-3 py-1 bg-slate-100 rounded-lg font-black text-slate-600 text-xs">x{svc.quantity}</span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="font-black text-slate-900 text-sm">{formatVND(svc.totalPrice)}</div>
                                                    {/*<div className="text-[9px] text-slate-400 font-bold uppercase">{formatVND(svc.unitPrice)} / đơn vị</div>*/}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column (1/3) */}
                    <div className="space-y-8">

                        {/* 4. Thông tin khách hàng */}
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-white">
                            <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-3">
                                <User className="text-blue-600" size={20}/> Chủ đơn đặt phòng
                            </h3>
                            <div className="space-y-6">
                                <div className="flex items-center gap-5 p-5 bg-blue-50/50 rounded-[1.5rem] border border-blue-100/50">
                                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-200">
                                        {booking.guestName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 text-lg leading-tight tracking-tight">{booking.guestName}</p>
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Khách hàng HMS</p>
                                    </div>
                                </div>

                                <div className="space-y-4 px-2">
                                    <div className="flex items-center gap-4 group">
                                        <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all"><Phone size={18}/></div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Điện thoại</p>
                                            <p className="text-sm font-black text-slate-800">{booking.guestPhone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 group">
                                        <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all"><Mail size={18}/></div>
                                        <div className="overflow-hidden">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email liên hệ</p>
                                            <p className="text-sm font-black text-slate-800 truncate">{booking.guestEmail}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 5. Thông tin địa điểm */}
                        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden group">
                            <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                <Hotel size={160} />
                            </div>
                            <h3 className="text-lg font-black mb-8 flex items-center gap-3 relative z-10 text-blue-400">
                                <Hotel size={20}/> Địa điểm lưu trú
                            </h3>
                            <div className="relative z-10 space-y-4">
                                <div>
                                    <h4 className="text-2xl font-black leading-tight tracking-tight mb-2">{booking.hotelName}</h4>
                                    <div className="flex gap-1.5">
                                        {[...Array(booking.hotelStarRating)].map((_, i) => (
                                            <Star key={i} size={14} fill="#fbbf24" className="text-amber-400" />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 text-slate-400 border-t border-white/10 pt-4">
                                    <MapPin size={18} className="flex-shrink-0 text-blue-400 mt-1" />
                                    <p className="text-xs font-bold leading-relaxed">{booking.hotelAddress}</p>
                                </div>
                            </div>
                        </div>

                        {/* 6. Hóa đơn chi tiết */}
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-white">
                            <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-3">
                                <CreditCard className="text-blue-600" size={20}/> Quyết toán doanh thu
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest">
                                    <span>Tạm tính phòng</span>
                                    <span className="text-slate-900">{formatVND(booking.totalAmount)}</span>
                                </div>
                                <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest">
                                    <span>Dịch vụ thêm</span>
                                    <span className="text-slate-900">
                                        {formatVND(booking.addonServices?.reduce((sum, s) => sum + s.totalPrice, 0) || 0)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs font-black text-rose-500 uppercase tracking-widest">
                                    <span>Khuyến mãi</span>
                                    <span>- {formatVND(booking.discountAmount)}</span>
                                </div>
                                <div className="pt-6 border-t border-slate-100">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Tổng cộng (Đã VAT)</p>
                                            <p className="text-4xl font-black text-blue-600 tracking-tighter">
                                                {formatVND(booking.finalAmount)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 space-y-3">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nguồn thu</span>
                                        <span className="text-[11px] font-black text-slate-800 uppercase flex items-center gap-2">
                                            <ShieldCheck size={14} className="text-blue-600"/> {booking.paymentMethod}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</span>
                                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${booking.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100 shadow-sm'}`}>
                                            {booking.paymentStatus === 'PAID' ? 'Đã thu tiền' : 'Chưa thanh toán'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HotelBookingDetail;