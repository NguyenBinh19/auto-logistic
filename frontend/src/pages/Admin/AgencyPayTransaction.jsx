import React, { useState, useMemo } from "react";
import {
    Search, Filter, Download, ExternalLink,
    Calendar, ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight, FileText
} from "lucide-react";
import TransactionDetail from "@/components/admin/financial/TransactionDetail.jsx";

const TransactionDashboard = () => {
    const [selectedId, setSelectedId] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Logic Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const transactions = [
        { id: "GD-2026-001", date: "02/02/2026 10:30", agency: "Việt Travel", bookingRef: "DP-9921", amount: 12500000, method: "Thẻ nội địa", status: "Thành công" },
        { id: "GD-2026-002", date: "02/02/2026 14:15", agency: "Saigontourist", bookingRef: "DP-8842", amount: 8400000, method: "Ví điện tử", status: "Chờ xử lý" },
        { id: "GD-2026-003", date: "01/02/2026 09:00", agency: "Mytour", bookingRef: "DP-7712", amount: 21000000, method: "Chuyển khoản", status: "Thất bại" },
        { id: "GD-2026-004", date: "31/01/2026 16:45", agency: "Việt Travel", bookingRef: "DP-6651", amount: 4500000, method: "Thẻ nội địa", status: "Đã hoàn tiền" },
        { id: "GD-2026-005", date: "30/01/2026 10:00", agency: "Hanoi Tourist", bookingRef: "DP-1234", amount: 15000000, method: "Chuyển khoản", status: "Thành công" },
        { id: "GD-2026-006", date: "29/01/2026 08:30", agency: "Bamboo Travel", bookingRef: "DP-5566", amount: 3200000, method: "Ví điện tử", status: "Thành công" },
    ];

    // Tính toán dữ liệu hiển thị theo trang
    const totalPages = Math.ceil(transactions.length / itemsPerPage);
    const currentTableData = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * itemsPerPage;
        const lastPageIndex = firstPageIndex + itemsPerPage;
        return transactions.slice(firstPageIndex, lastPageIndex);
    }, [currentPage, itemsPerPage]);

    const getStatusStyle = (status) => {
        switch (status) {
            case "Thành công": return "bg-emerald-50 text-emerald-700 border-emerald-100";
            case "Chờ xử lý": return "bg-amber-50 text-amber-700 border-amber-100";
            case "Thất bại": return "bg-rose-50 text-rose-700 border-rose-100";
            case "Đã hoàn tiền": return "bg-gray-100 text-gray-600 border-gray-200";
            default: return "bg-gray-50 text-gray-500";
        }
    };

    const handleViewDetail = (id) => {
        setSelectedId(id);
        setIsDetailOpen(true);
    };

    const handleExport = (format) => {
        // UC084.E1: Kiểm tra nếu không có dữ liệu
        if (transactions.length === 0) {
            alert("Không có bản ghi nào để xuất theo tiêu chí đã chọn.");
            return;
        }

        setIsExporting(true);

        // Giả lập xử lý xuất file (Processing)
        setTimeout(() => {
            setIsExporting(false);
            alert(`Đang khởi tạo tải xuống tệp ${format.toUpperCase()}...`);
            // Trong thực tế, đây là nơi gọi API: GET /api/finance/export?format=xlsx&...filters
        }, 1500);
    };

    return (
        <div className="p-4 md:p-8 bg-[#f8fafc] min-h-screen font-sans text-gray-900">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">LỊCH SỬ THANH TOÁN</h1>
                    <p className="text-gray-500 text-sm">Theo dõi dòng tiền và đối soát thanh toán đối tác.</p>
                </div>
                <div className="relative group">
                    <button
                        disabled={isExporting}
                        className={`flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isExporting ? (
                            <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Đang xử lý...
            </span>
                        ) : (
                            <>
                                <Download size={18} className="text-blue-600"/>
                                Xuất dữ liệu
                            </>
                        )}
                    </button>

                    {/* Dropdown Menu - Hiển thị khi hover hoặc click */}
                    <div
                        className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2">
                        <button
                            onClick={() => handleExport('xlsx')}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors"
                        >
                            <div className="p-1.5 bg-green-100 text-green-600 rounded-lg"><FileText size={14}/></div>
                            Xuất Excel (.xlsx)
                        </button>
                        <button
                            onClick={() => handleExport('pdf')}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl transition-colors"
                        >
                            <div className="p-1.5 bg-rose-100 text-rose-600 rounded-lg"><FileText size={14}/></div>
                            Xuất PDF (Báo cáo)
                        </button>
                        <button
                            onClick={() => handleExport('csv')}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-colors"
                        >
                            <div className="p-1.5 bg-gray-200 text-gray-600 rounded-lg"><FileText size={14}/></div>
                            Xuất dữ liệu thô (.csv)
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Section */}
            <div
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                    <input
                        type="text"
                        placeholder="Tìm kiếm giao dịch..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        className="flex-1 md:w-48 px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm text-gray-600 outline-none">
                        <option>Tất cả trạng thái</option>
                        <option>Thành công</option>
                    </select>
                    <button className="p-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800">
                        <Filter size={18}/>
                    </button>
                </div>
            </div>

            {/* Table Container - Quan trọng cho Responsive */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table
                        className="w-full text-left border-collapse min-w-[1000px]"> {/* min-w đảm bảo các cột không bị dồn */}
                        <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-[180px]">Ngày
                                thực hiện
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-[150px]">Mã
                                giao dịch
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Đối tác /
                                Đặt phòng
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right w-[150px]">Số tiền</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center w-[150px]">Trạng thái</th>
                            <th className="px-6 py-4 w-[60px]"></th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                        {currentTableData.map((txn) => (
                            <tr key={txn.id} className="hover:bg-blue-50/30 transition-colors group">
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-gray-300" />
                                        {txn.date}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <button onClick={() => handleViewDetail(txn.id)} className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
                                        {txn.id}
                                    </button>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">{txn.agency}</div>
                                    <div className="text-xs text-gray-400 flex items-center gap-1">
                                        {txn.bookingRef} <ExternalLink size={10} />
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                        <span className="text-sm font-bold text-gray-900">
                                            {txn.amount.toLocaleString('vi-VN')} đ
                                        </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(txn.status)} whitespace-nowrap`}>
                                            {txn.status.toUpperCase()}
                                        </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleViewDetail(txn.id)} className="p-2 text-gray-400 hover:text-blue-600 transition-all">
                                        <ChevronRight size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Section */}
                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-500">
                        Hiển thị <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-medium">{Math.min(currentPage * itemsPerPage, transactions.length)}</span> trong tổng số <span className="font-medium">{transactions.length}</span> kết quả
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center mr-4">
                            <span className="text-sm text-gray-500 mr-2">Số dòng:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {setItemsPerPage(Number(e.target.value)); setCurrentPage(1);}}
                                className="bg-white border border-gray-200 rounded-lg text-sm p-1 outline-none"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                            </select>
                        </div>

                        <div className="flex gap-1">
                            <button
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-blue-600 disabled:opacity-50 transition-all"
                            >
                                <ChevronsLeft size={16} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-blue-600 disabled:opacity-50 transition-all"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <div className="flex items-center px-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg">
                                {currentPage} / {totalPages}
                            </div>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-blue-600 disabled:opacity-50 transition-all"
                            >
                                <ChevronRight size={16} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-blue-600 disabled:opacity-50 transition-all"
                            >
                                <ChevronsRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <TransactionDetail isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} txnId={selectedId} />
        </div>
    );
};

export default TransactionDashboard;