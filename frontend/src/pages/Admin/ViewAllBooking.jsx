import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Filter, Calendar, Building2, CreditCard, AlertCircle,
    ChevronRight, Loader2, RefreshCcw, FileSpreadsheet,
    ChevronLeft, ArrowRightLeft, LogIn, LogOut,
    User, Globe, ShieldCheck, Hotel, Briefcase, Clock
} from 'lucide-react';
import { bookingService } from '@/services/booking.service.js';
import { financialService } from '@/services/financial.service';
import { toast } from 'react-hot-toast';

// Cấu hình trạng thái hệ thống
const STATUS_CONFIG = {
    "BOOKED": { label: "ĐÃ ĐẶT", color: "bg-amber-500", border: "border-amber-200", text: "text-white" },
    "CONFIRMED": { label: "ĐÃ XÁC NHẬN", color: "bg-emerald-600", border: "border-emerald-200", text: "text-white" },
    "CHECKED-IN": { label: "ĐANG LƯU TRÚ", color: "bg-blue-600", border: "border-blue-200", text: "text-white" },
    // "CHECKED-OUT": { label: "HOÀN THÀNH", color: "bg-slate-600", border: "border-slate-300", text: "text-white" },
    "COMPLETED": { label: "HOÀN THÀNH", color: "bg-slate-600", border: "border-slate-300", text: "text-white" },
    "CANCELLED": { label: "ĐÃ HỦY", color: "bg-rose-600", border: "border-rose-200", text: "text-white" },
    "NO_SHOW": { label: "KHÔNG ĐẾN", color: "bg-purple-600", border: "border-purple-200", text: "text-white" },
};

const AdminBookingList = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Trạng thái bộ lọc
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const fetchAllBookings = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await bookingService.viewAllBookingByAdmin();
            if (data && data.result) {
                const sortedData = data.result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setBookings(sortedData);
            }
        } catch (err) {
            setError("Không thể kết nối đến máy chủ.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAllBookings(); }, []);

    // Định dạng tiền tệ VND
    const formatVND = (amount) => new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
    }).format(amount);

    // Định dạng ngày Việt Nam
    const formatDateVN = (dateStr) => {
        if (!dateStr) return "--/--/----";
        const d = new Date(dateStr);
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // Logic Tìm kiếm và Lọc
    const filteredBookings = useMemo(() => {
        return bookings.filter(item => {
            const searchLower = searchTerm.toLowerCase();
            const matchSearch =
                item.guestName?.toLowerCase().includes(searchLower) ||
                item.bookingCode?.toLowerCase().includes(searchLower) ||
                item.hotelName?.toLowerCase().includes(searchLower);

            const matchStatus = statusFilter === "" || item.bookingStatus?.toUpperCase() === statusFilter.toUpperCase();

            // Lọc theo ngày Check-in
            const matchDate = dateFilter === "" || item.checkInDate?.includes(dateFilter);

            return matchSearch && matchStatus && matchDate;
        });
    }, [bookings, searchTerm, statusFilter, dateFilter]);

    // Phân trang
    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
    const currentData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredBookings.slice(start, start + itemsPerPage);
    }, [filteredBookings, currentPage]);

    const getStatusBadge = (status) => {
        const s = status?.toUpperCase();
        const config = STATUS_CONFIG[s] || { label: s, color: "bg-slate-400", border: "border-slate-200", text: "text-white" };
        return (
            <span className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-black border tracking-wider shadow-sm ${config.color} ${config.text} ${config.border}`}>
                {config.label}
            </span>
        );
    };
    // --- LOGIC XỬ LÝ DOWNLOAD FILE EXCEL ---
    const handleDownloadReport = async (format = 'EXCEL', reportType = 'BOOKING_LIST') => {
        try {
            toast.loading(`Đang khởi tạo file ${format}...`, { id: 'export-status' });

            // Xử lý ngày mặc định nếu dateFilter trống để tránh lỗi 2401
            const today = new Date().toISOString().split('T')[0];
            const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

            const exportRequest = {
                reportType,
                format,
                // Nếu có dateFilter thì lấy ngày đó cho cả start và end (hoặc tùy logic BE)
                // Nếu không có, gửi một khoảng mặc định an toàn
                startDate: dateFilter || firstDayOfMonth,
                endDate: dateFilter || today,
                status: statusFilter || null,
                searchTerm: searchTerm || null
            };

            // Gọi service để lấy ArrayBuffer
            const buffer = await financialService.exportFinancialReport(exportRequest);

            // Kiểm tra lỗi từ backend trả về dưới dạng JSON trong ArrayBuffer
            const decoder = new TextDecoder('utf-8');
            const previewText = decoder.decode(new Uint8Array(buffer).slice(0, 500));

            try {
                const possibleJson = JSON.parse(previewText);
                if (possibleJson.code !== 1000 && possibleJson.message) {
                    toast.error(`Lỗi: ${possibleJson.message}`, { id: 'export-status' });
                    return;
                }
                if (possibleJson.result && possibleJson.result.data) {
                    const actualData = new Uint8Array(possibleJson.result.data);
                    downloadFileBlob(actualData, format);
                    toast.success(`Tải file thành công`, { id: 'export-status' });
                    return;
                }
            } catch (e) {
                // Nếu không phải JSON, nghĩa là đây là file binary xịn
            }

            downloadFileBlob(buffer, format);
            toast.success(`Tải file thành công`, { id: 'export-status' });
        } catch (error) {
            console.error("Lỗi xuất file:", error);
            toast.error("Không thể xuất file. Vui lòng kiểm tra lại khoảng ngày.", { id: 'export-status' });
        }
    };
    // Hàm phụ trợ tạo link download từ Blob
    const downloadFileBlob = (data, format) => {
        const contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        const blob = new Blob([data], { type: contentType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Đặt tên file theo ngày hiện tại
        const timeStamp = new Date().toISOString().split('T')[0];
        link.download = `Danh_sach_dat_phong_${timeStamp}.xlsx`;

        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-[#f1f5f9] min-h-screen font-sans text-slate-800 p-4 md:p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <span className="text-black-600"> QUẢN LÝ ĐẶT PHÒNG</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Quản lý và điều phối các giao dịch lưu trú toàn hệ thống</p>
                </div>

                <div className="flex gap-3">
                    <button onClick={fetchAllBookings}
                            className="p-3 bg-white border border-slate-200 rounded-2xl hover:shadow-md active:scale-95 transition-all">
                        <RefreshCcw size={20} className={loading ? "animate-spin text-blue-600" : "text-slate-600"}/>
                    </button>
                    {/*<button*/}
                    {/*    onClick={() => handleDownloadReport('EXCEL')}*/}
                    {/*    className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-slate-800 shadow-lg active:scale-95 transition-all"*/}
                    {/*>*/}
                    {/*    <FileSpreadsheet size={18}/> <span>Xuất Excel</span>*/}
                    {/*</button>*/}
                </div>
            </div>

            {/* Filter Bar */}
            <div className="max-w-7xl mx-auto mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="sm:col-span-2 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                    <input
                        type="text"
                        placeholder="Tìm theo Mã đơn, Tên khách hoặc Khách sạn..."
                        value={searchTerm}
                        onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                        className="w-full pl-12 pr-4 py-4 bg-white border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm font-medium"
                    />
                </div>
                <div className="relative">
                    <select
                        value={statusFilter}
                        onChange={(e) => {setStatusFilter(e.target.value); setCurrentPage(1);}}
                        className="w-full px-4 py-4 bg-white border-0 rounded-2xl outline-none appearance-none font-bold text-slate-700 shadow-sm cursor-pointer focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Tất cả trạng thái</option>
                        {Object.keys(STATUS_CONFIG).map(key => (
                            <option key={key} value={key}>{STATUS_CONFIG[key].label}</option>
                        ))}
                    </select>
                    <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
                <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="date"
                        onChange={(e) => {setDateFilter(e.target.value); setCurrentPage(1);}}
                        className="w-full pl-12 pr-4 py-4 bg-white border-0 rounded-2xl outline-none font-bold text-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Content Table */}
            <div className="max-w-7xl mx-auto bg-white rounded-[2rem] shadow-xl border border-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[1000px]">
                        <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-900 text-[10px] uppercase tracking-widest font-black">
                            <th className="px-8 py-6">Thông tin đơn hàng</th>
                            <th className="px-8 py-6">Khách hàng & Đối tác</th>
                            <th className="px-4 py-6 text-center">Thời gian lưu trú</th>
                            <th className="px-8 py-6 text-right">Doanh thu</th>
                            <th className="px-8 py-6 text-center">Trạng thái</th>
                            <th className="px-6 py-6"></th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="6" className="py-32 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={48}/></td></tr>
                        ) : currentData.length > 0 ? currentData.map((item) => (
                            <tr key={item.bookingCode} className="hover:bg-slate-50/80 transition-all group">
                                <td className="px-8 py-6">
                                    <div className="font-black text-blue-600 text-sm tracking-tight">{item.bookingCode}</div>
                                    <div className="text-[10px] text-slate-400 mt-1 font-bold flex items-center gap-1.5">
                                        <Clock size={12}/> {formatDateVN(item.createdAt)}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 font-bold text-[10px]">
                                                {item.guestName?.charAt(0)}
                                            </div>
                                            <span className="font-extrabold text-slate-800 text-sm">{item.guestName}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Hotel size={14} className="text-slate-400"/>
                                            <span className="text-xs font-bold truncate max-w-[180px]">{item.hotelName}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Briefcase size={12} className="text-amber-500"/>
                                            <span className="text-[9px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase">
                                                    {item.agencyName || "Khách lẻ B2C"}
                                                </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-6">
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="text-center">
                                            <p className="text-[8px] font-black text-emerald-600 uppercase mb-1">Nhận phòng</p>
                                            <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl font-black text-[11px] border border-emerald-100">
                                                {formatDateVN(item.checkInDate)}
                                            </div>
                                        </div>
                                        <ArrowRightLeft size={14} className="text-slate-300 mt-4"/>
                                        <div className="text-center">
                                            <p className="text-[8px] font-black text-rose-600 uppercase mb-1">Trả phòng</p>
                                            <div className="bg-rose-50 text-rose-700 px-3 py-1.5 rounded-xl font-black text-[11px] border border-rose-100">
                                                {formatDateVN(item.checkOutDate)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex justify-center">
                                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                                                {item.totalRooms} PHÒNG
                                            </span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="font-black text-slate-900 text-base">{formatVND(item.finalAmount)}</div>
                                    <div className={`text-[9px] font-bold uppercase mt-1 flex items-center justify-end gap-1.5 ${item.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                        <CreditCard size={12}/>
                                        {item.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    {getStatusBadge(item.bookingStatus)}
                                </td>
                                <td className="px-6 py-6 text-right">
                                    <button onClick={() => navigate(`/admin/view-booking/${item.bookingCode}`)}
                                            className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm group-hover:scale-110">
                                        <ChevronRight size={20}/>
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="py-32 text-center">
                                    <AlertCircle className="mx-auto text-slate-300 mb-4" size={48} />
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Không tìm thấy dữ liệu phù hợp</p>
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        Trang {currentPage} / {totalPages || 1} — {filteredBookings.length} Đơn hàng
                    </div>

                    <div className="flex items-center gap-2">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
                                className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-blue-600 hover:text-white disabled:opacity-30 transition-all shadow-sm">
                            <ChevronLeft size={20}/>
                        </button>
                        <div className="flex gap-1.5">
                            {[...Array(totalPages)].map((_, i) => (
                                <button key={i} onClick={() => setCurrentPage(i + 1)}
                                        className={`w-10 h-10 rounded-xl text-xs font-black transition-all border ${currentPage === i + 1 ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
                                    {i + 1}
                                </button>
                            )).slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1))}
                        </div>
                        <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)}
                                className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-blue-600 hover:text-white disabled:opacity-30 transition-all shadow-sm">
                            <ChevronRight size={20}/>
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer Admin Info */}
            <div className="max-w-7xl mx-auto mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 opacity-40 px-4 text-[10px] font-black uppercase tracking-widest">
                <div className="flex items-center gap-2 text-slate-500">
                    <Globe size={14}/> <span>Hệ thống quản trị HMS B2B Việt Nam </span>
                </div>
            </div>
        </div>
    );
};

export default AdminBookingList;