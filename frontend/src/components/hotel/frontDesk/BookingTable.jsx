import React from 'react';
import { CreditCard, UserCheck, LogOut, Info, UserX, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BookingTable = ({ bookings, activeTab, onCheckout, onCheckin, onNoShow, currentPage, totalPages, onPageChange, totalResults }) => {
    const navigate = useNavigate();
    const today = new Date().toLocaleDateString('en-CA');
    const formatVND = (val) => new Intl.NumberFormat('vi-VN').format(val) + " ₫";
    const handleAction = (item) => {
        if (activeTab === 'arrival') {
            if (item.checkInDate > today) {
                alert(`Khách đến sớm! Ngày hẹn là ${item.checkInDate}. Không thể thực hiện check-in trước ngày này.`);
                return;
            }
            onCheckin?.(item.bookingCode);
        } else if (activeTab === 'departure') {
            if (item.checkOutDate > today) {
                const confirmEarlyOut = window.confirm(
                    `Khách trả phòng sớm! Ngày hẹn trả là ${item.checkOutDate}. \nBạn có muốn thực hiện Check-out sớm không?`
                );
                if (!confirmEarlyOut) return;
            }
            onCheckout?.(item.bookingCode);
        }
    };
    return (
        <div className="flex flex-col">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100">
                        <th className="px-8 py-5 text-[11px] font-black text-slate-900 uppercase tracking-[0.1em]">
                            Khách hàng / Mã đơn
                        </th>
                        <th className="px-8 py-5 text-[11px] font-black text-slate-900 uppercase tracking-[0.1em]">
                            Khách sạn
                        </th>
                        <th className="px-8 py-5 text-[11px] font-black text-slate-900 uppercase tracking-[0.1em]">
                            Lịch trình
                        </th>
                        <th className="px-8 py-5 text-[11px] font-black text-slate-900 uppercase tracking-[0.1em] text-center">
                            Tổng số phòng
                        </th>
                        <th className="px-8 py-5 text-[11px] font-black text-slate-900 uppercase tracking-[0.1em]">
                            Tổng tiền
                        </th>
                        <th className="px-8 py-5 text-[11px] font-black text-slate-900 uppercase tracking-[0.1em]">
                            Thanh toán
                        </th>
                        <th className="px-8 py-5 text-[11px] font-black text-slate-900 uppercase tracking-[0.1em] text-right">
                            Thao tác
                        </th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                    {bookings.length === 0 ? (
                        <tr>
                            <td colSpan="7"
                                className="px-8 py-20 text-center text-slate-300 font-bold uppercase text-xs">Không có
                                dữ
                                liệu
                            </td>
                        </tr>
                    ) : (
                        bookings.map((item) => (
                            <tr key={item.bookingCode} className="hover:bg-blue-50/20 transition-colors">
                                <td className="px-8 py-6">
                                    <div className="font-black text-slate-900 text-sm">{item.guestName}</div>
                                    <div className="text-[10px] font-bold text-blue-600">#{item.bookingCode}</div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="text-xs font-bold text-slate-700">{item.hotelName}</div>
                                    <div
                                        className="text-[9px] text-slate-400 font-black uppercase">{item.agencyName || 'Khách lẻ'}</div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="text-xs font-black text-slate-800">{item.checkInDate}</div>
                                    <div
                                        className="text-[9px] text-slate-400 font-bold uppercase italic">đến {item.checkOutDate}</div>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <span
                                        className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-black text-slate-600">
                                        {item.totalRooms}
                                    </span>
                                </td>
                                <td className="px-8 py-6 font-black text-blue-700 text-sm">
                                    {formatVND(item.finalAmount)}
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`px-3 py-1.5 rounded-full text-[9px] font-black border uppercase ${
                                        item.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                                    }`}>
                                        {item.paymentStatus}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex justify-center items-center gap-2 w-full">
                                        {/* 1. Nút Xem chi tiết: Luôn hiện */}
                                        <button
                                            onClick={() => navigate(`/hotel/view-booking/${item.bookingCode}`)}
                                            title="Chi tiết đơn"
                                            className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm flex-shrink-0"
                                        >
                                            <Info size={16}/>
                                        </button>

                                        <div className="flex items-center gap-2">
                                            {/* 2. Kiểm tra các trạng thái ĐÃ KẾT THÚC */}
                                            {['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(item.bookingStatus) ? (
                                                <div className="min-w-[120px] flex justify-center">
                                                    {item.bookingStatus === 'NO_SHOW' && (
                                                        <span
                                                            className="inline-flex items-center justify-center px-4 py-2.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-[10px] font-black uppercase tracking-widest h-[42px] w-full shadow-sm">
                            Đã báo Không đến
                        </span>
                                                    )}
                                                    {item.bookingStatus === 'COMPLETED' && (
                                                        <span
                                                            className="inline-flex items-center justify-center px-4 py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-[10px] font-black uppercase tracking-widest h-[42px] w-full shadow-sm">
                            Đã hoàn thành
                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                /* 3. Các trạng thái CÒN HOẠT ĐỘNG (ARRIVAL hoặc DEPARTURE) */
                                                <>
                                                    {activeTab === 'arrival' ? (
                                                        item.bookingStatus === 'CHECKED-IN' ? (
                                                            <div className="min-w-[120px]">
                                <span
                                    className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-[10px] font-black uppercase tracking-widest h-[42px] w-full shadow-sm">
                                    Đang lưu trú
                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => onNoShow?.(item)}
                                                                    title={today < item.checkInDate ? `Chỉ báo No-show từ ngày ${item.checkInDate}` : "Báo khách không đến"}
                                                                    disabled={today < item.checkInDate}
                                                                    className={`p-2.5 rounded-xl border transition-all ${
                                                                        today < item.checkInDate ? "bg-slate-50 text-slate-300 border-slate-100" : "bg-white border-rose-200 text-rose-500 hover:bg-rose-50"
                                                                    }`}
                                                                >
                                                                    <UserX size={16}/>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleAction(item)}
                                                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg bg-blue-600 text-white hover:bg-blue-700 whitespace-nowrap"
                                                                >
                                                                    <UserCheck size={14}/> Check-in
                                                                </button>
                                                            </div>
                                                        )
                                                    ) : (
                                                        /* Nếu là tab DEPARTURE: Luôn hiện nút Check-out cho khách đang ở (CHECKED-IN) */
                                                        <button
                                                            onClick={() => handleAction(item)}
                                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg bg-emerald-600 text-white hover:bg-emerald-700 whitespace-nowrap"
                                                        >
                                                            <LogOut size={14}/> Check-out
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>


            {/* --- GIAO DIỆN PHÂN TRANG (Đã đưa vào trong khối return) --- */}
            {totalResults > 0 && (
                <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        Hiển thị <span className="text-slate-900">{bookings.length}</span> / {totalResults} kết quả
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-xl border transition-all ${
                                currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'bg-white hover:border-blue-500 text-slate-600 shadow-sm'
                            }`}
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <div className="flex items-center gap-1">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => onPageChange(i + 1)}
                                    className={`w-10 h-10 rounded-xl text-[11px] font-black transition-all ${
                                        currentPage === i + 1
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'bg-white text-slate-500 border border-slate-200 hover:border-blue-200'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded-xl border transition-all ${
                                currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'bg-white hover:border-blue-500 text-slate-600 shadow-sm'
                            }`}
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingTable;