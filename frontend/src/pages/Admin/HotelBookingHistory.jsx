import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Calendar, Loader2, ReceiptText, Search, X, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { bookingService } from "@/services/booking.service.js";

const HotelBookingHistory = ({ hotelId }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const fetchBookings = React.useCallback(async () => {
        if (!hotelId) return;
        setLoading(true);
        try {
            const response = await bookingService.viewAllBookingByHotelId(hotelId);
            if (response?.code === 1000) {
                setBookings(response.result || []);
            }
        } catch (error) {
            console.error("Lỗi lấy lịch sử booking:", error);
        } finally {
            setLoading(false);
        }
    }, [hotelId]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(""), 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleDateChange = (field, value) => {
        setError("");
        if (field === "endDate" && dateRange.startDate && value < dateRange.startDate) {
            setError("Ngày kết thúc không được nhỏ hơn ngày bắt đầu");
            return;
        }
        setDateRange(prev => {
            const newState = { ...prev, [field]: value };
            if (field === "startDate" && newState.endDate && value > newState.endDate) {
                newState.endDate = "";
            }
            return newState;
        });
        setCurrentPage(1); // Reset về trang 1 khi lọc
    };

    const filteredData = useMemo(() => {
        return bookings.filter(b => {
            const bookingDate = b.createdAt ? b.createdAt.split('T')[0] : "";
            const isCompleted = b.bookingStatus?.toUpperCase() === "COMPLETED";
            const isPaid = b.paymentStatus?.toUpperCase() === "PAID";
            const matchStart = !dateRange.startDate || bookingDate >= dateRange.startDate;
            const matchEnd = !dateRange.endDate || bookingDate <= dateRange.endDate;
            return isCompleted && isPaid && matchStart && matchEnd;
        });
    }, [bookings, dateRange]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage]);

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - 2);
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`w-8 h-8 rounded-lg text-[11px] font-black transition-all ${
                        currentPage === i
                            ? "bg-slate-900 text-white shadow-lg"
                            : "text-slate-400 hover:bg-white hover:text-slate-900"
                    }`}
                >
                    {i}
                </button>
            );
        }
        return pages;
    };

    const totalRevenue = useMemo(() => {
        return filteredData.reduce((sum, b) => sum + (b.finalAmount || 0), 0);
    }, [filteredData]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount) + " ₫";
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500">

            {/* 1. TOP BAR: FILTER & REFERENCE REVENUE */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">

                {/* DATE FILTER */}
                <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm w-full lg:w-auto">
                    <div className="flex items-center gap-3 px-3 py-1.5 hover:bg-slate-50 rounded-xl transition-colors">
                        <Calendar size={16} className="text-slate-400" />
                        <input
                            type="date"
                            className="bg-transparent text-sm font-semibold text-slate-600 outline-none cursor-pointer"
                            value={dateRange.startDate}
                            onChange={(e) => handleDateChange("startDate", e.target.value)}
                        />
                    </div>
                    <div className="h-4 w-[1px] bg-slate-200 mx-1" />
                    <div className="flex items-center gap-3 px-3 py-1.5 hover:bg-slate-50 rounded-xl transition-colors">
                        <input
                            type="date"
                            className={`bg-transparent text-sm font-semibold outline-none cursor-pointer ${!dateRange.startDate ? 'text-slate-300' : 'text-slate-600'}`}
                            min={dateRange.startDate}
                            disabled={!dateRange.startDate}
                            value={dateRange.endDate}
                            onChange={(e) => handleDateChange("endDate", e.target.value)}
                        />
                    </div>
                    {(dateRange.startDate || dateRange.endDate) && (
                        <button
                            onClick={() => {
                                setDateRange({startDate: "", endDate: ""});
                                setError("");
                                setCurrentPage(1);
                            }}
                            className="ml-2 p-2 text-slate-400 hover:text-red-500 transition-colors"
                        >
                            <X size={16}/>
                        </button>
                    )}
                </div>

                {/* REFERENCE REVENUE */}
                <div
                    className="flex items-center gap-6 px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl w-full lg:w-auto">
                    <div>
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                            Doanh thu tham khảo
                        </p>
                        <p className="text-xl font-black text-slate-800">{formatCurrency(totalRevenue)}</p>
                    </div>
                    <div className="h-8 w-[1px] bg-slate-200" />
                    <div>
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Số lượng đơn</p>
                        <p className="text-xl font-black text-slate-800">{filteredData.length}</p>
                    </div>
                </div>
            </div>

            {/* 2. TABLE SECTION */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                        <tr className="border-b border-slate-100">
                            <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-wider text-left">Giao dịch</th>
                            <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-wider text-left">Khách hàng / Đại lý</th>
                            <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-wider text-left">Thời gian lưu trú</th>
                            <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-wider text-right">Tổng tiền</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="4" className="py-24 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" /></td></tr>
                        ) : paginatedData.length > 0 ? (
                            paginatedData.map((b) => (
                                <tr key={b.bookingCode} className="group hover:bg-slate-50/50 transition-colors">
                                    {/* Mã đơn */}
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div>
                                                <p className="text-[13px] font-bold text-slate-800 tracking-tight">{b.bookingCode}</p>
                                                <p className="text-[10px] text-slate-500 font-medium">Tạo: {b.createdAt?.split('T')[0]}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Khách hàng */}
                                    <td className="px-8 py-6">
                                        <p className="text-[13px] font-bold text-slate-700 uppercase">{b.guestName}</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[180px] font-medium">{b.agencyName}</p>
                                    </td>

                                    {/* Lưu trú */}
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-blue-500/60 uppercase">Check-in</span>
                                                <span className="text-[12px] font-bold text-slate-600">{b.checkInDate}</span>
                                            </div>
                                            <div className="h-6 w-[1px] bg-slate-100 rotate-12" />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-500 uppercase">Check-out</span>
                                                <span className="text-[12px] font-bold text-slate-600">{b.checkOutDate}</span>
                                            </div>
                                            <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-black rounded-md">
                                                    {b.totalRooms} PHÒNG
                                                </span>
                                        </div>
                                    </td>

                                    {/* Tiền */}
                                    <td className="px-8 py-6 text-right">
                                        <p className="text-[14px] font-black text-slate-900">{formatCurrency(b.finalAmount)}</p>
                                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">Hoàn tất</span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="py-32 text-center opacity-30 italic text-sm">
                                    Không có dữ liệu phù hợp với bộ lọc
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
                {/* --- FOOTER: PAGINATION UI --- */}
                {filteredData.length > itemsPerPage && (
                    <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            Hiển thị {paginatedData.length} / {filteredData.length} kết quả
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-20 transition-all"
                            >
                                <ChevronLeft size={18}/>
                            </button>

                            <div className="flex items-center gap-1">
                                {renderPageNumbers()}
                            </div>

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-20 transition-all"
                            >
                                <ChevronRight size={18}/>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HotelBookingHistory;