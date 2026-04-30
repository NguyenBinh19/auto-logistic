import React, { useState, useEffect, useMemo } from 'react';
import {
    AlertCircle, Eye, Loader2, Calendar,
    LayoutList, Ticket, TrendingUp, Search, X,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import { payoutService } from "@/services/payout.service";
import DisputeDetailModal from '@/components/admin/financial/DisputeModal.jsx';

const DisputeManagement = () => {
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStatement, setSelectedStatement] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        fetchDisputedStatements();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const fetchDisputedStatements = async () => {
        setLoading(true);
        try {
            const res = await payoutService.getDisputedStatements();
            setDisputes(res.result || []);
        } catch (error) {
            console.error("Lỗi fetch danh sách:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredDisputes = useMemo(() => {
        const search = searchTerm.toLowerCase().trim();
        if (!search) return disputes;

        return disputes.filter(item =>
            (item.hotelName || "").toLowerCase().includes(search) ||
            (item.statementCode || "").toLowerCase().includes(search)
        );
    }, [disputes, searchTerm]);

    const totalPages = Math.ceil(filteredDisputes.length / itemsPerPage);
    const paginatedDisputes = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredDisputes.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredDisputes, currentPage]);

    const handleViewDetail = (item) => {
        setSelectedStatement(item);
        setIsModalOpen(true);
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3 text-slate-800">
                        Quản lý Khiếu nại
                    </h2>
                    <p className="text-slate-400 text-sm font-medium mt-1">
                        Xử lý các yêu cầu khiếu nại tài chính từ đối tác khách sạn
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-white border border-slate-200 px-6 py-3 rounded-3xl shadow-sm text-right">
                        <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Tổng khiếu nại</p>
                        <p className="text-2xl font-black text-slate-800">{disputes.length}</p>
                    </div>
                </div>
            </div>
            {/* 3. Search Bar Section */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm theo tên khách sạn hoặc mã đối soát ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-10 py-4 bg-white border border-slate-200 rounded-[20px] text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all placeholder:font-medium placeholder:text-slate-300"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-100 hover:bg-slate-200 p-1 rounded-full transition-colors"
                        >
                            <X size={14} className="text-slate-500" />
                        </button>
                    )}
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100">
                        <th className="p-6 text-[10px] font-black uppercase text-slate-600 tracking-widest">Đối tác & Mã</th>
                        <th className="p-6 text-[10px] font-black uppercase text-slate-600 tracking-widest">Thời gian kỳ này</th>
                        <th className="p-6 text-[10px] font-black uppercase text-slate-600 tracking-widest">Thống kê đơn</th>
                        <th className="p-6 text-[10px] font-black uppercase text-slate-600 tracking-widest text-right">Chi tiết dòng tiền</th>
                        <th className="p-6 text-[10px] font-black uppercase text-slate-600 tracking-widest text-center">Thao tác</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                    {paginatedDisputes.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="p-20 text-center">
                                <div className="flex flex-col items-center justify-center space-y-3">
                                    <AlertCircle size={48} className="text-slate-200" />
                                    <p className="font-bold text-slate-400 uppercase text-xs">Hiện tại không có khiếu nại nào</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        paginatedDisputes.map((item) => (
                            <tr key={item.statementId} className="hover:bg-blue-50/30 transition-all group">
                                {/* Cột 1: Khách sạn */}
                                <td className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-sm shadow-lg shadow-slate-200">
                                            {item.hotelName?.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-800 text-base mb-0.5 leading-none">{item.hotelName}</p>
                                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                                                    {item.statementCode}
                                                </span>
                                        </div>
                                    </div>
                                </td>

                                {/* Cột 2: Thời gian */}
                                <td className="p-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-slate-700 text-xs font-bold">
                                            <Calendar size={14} className="text-slate-400" />
                                            <span>{item.periodStart}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold pl-5">
                                            đến {item.periodEnd}
                                        </div>
                                    </div>
                                </td>

                                {/* Cột 3: Thống kê */}
                                <td className="p-6">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <Ticket size={14} className="text-slate-400" />
                                            <span className="text-xs font-bold text-slate-600">{item.totalBookings} Bookings</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <TrendingUp size={14} className="text-slate-400" />
                                            <span className="text-xs font-bold text-slate-600">{item.totalRoomNights} Đêm phòng</span>
                                        </div>
                                    </div>
                                </td>

                                {/* Cột 4: Dòng tiền */}
                                <td className="p-6 text-right">
                                    <div className="space-y-1.5">
                                        <div className="text-[10px] font-bold text-slate-400 flex justify-end gap-2 uppercase">
                                            Doanh thu: <span className="text-slate-600">{item.grossRevenue?.toLocaleString()}</span>
                                        </div>
                                        <div className="text-[10px] font-bold text-rose-400 flex justify-end gap-2 uppercase">
                                            Hoa hồng: <span>-{item.totalCommission?.toLocaleString()}</span>
                                        </div>
                                        <div className="text-lg font-black text-slate-900 leading-none mt-1">
                                            {item.netPayout?.toLocaleString()} <span className="text-[10px] text-slate-400 font-bold">VND</span>
                                        </div>
                                    </div>
                                </td>

                                {/* Cột 5: Nút bấm */}
                                <td className="p-6 text-center">
                                    {item.status === 'RESOLVED' ? (
                                        // Nút dành cho đơn đã xử lý xong
                                        <button
                                            onClick={() => handleViewDetail(item)}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                                        >
                                            <Eye size={14} />
                                            Xem chi tiết
                                        </button>
                                    ) : (
                                        // Nút dành cho đơn cần giải quyết (DISPUTED)
                                        <button
                                            onClick={() => handleViewDetail(item)}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-md shadow-slate-200"
                                        >
                                            <AlertCircle size={14} />
                                            Chi tiết
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
            {/* --- Pagination Footer --- */}
            {totalPages > 1 && (
                <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                            Trang {currentPage} / {totalPages}
                        </span>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft size={18} className="text-slate-600" />
                        </button>

                        <div className="flex gap-1">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                                        currentPage === i + 1
                                            ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                                            : 'bg-white border border-slate-200 text-slate-400 hover:border-slate-400'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight size={18} className="text-slate-600" />
                        </button>
                    </div>
                </div>
            )}

            <DisputeDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                statement={selectedStatement}
                onResolveSuccess={fetchDisputedStatements}
            />
        </div>
    );
};

export default DisputeManagement;