import React, { useState, useMemo } from "react";
import { MOCK_AGENCY_DATA, MOCK_TRANSACTIONS } from '@/constant/agency_mockData.js';

const DemoTransactionHistoryPage = () => {
    // 1. Quản lý State cho bộ lọc (Giữ nguyên cấu trúc bản gốc)
    const [page, setPage] = useState(0);
    const [filters, setFilters] = useState({
        dateFrom: "",
        dateTo: "",
        type: "ALL",
        source: "ALL",
    });

    // 2. Logic giả lập Summary từ dữ liệu Mock
    const summary = {
        totalSpending: 22800000,
        spendingGrowth: 12.5,
        totalTopup: 45000000,
        topupGrowth: 5.2,
        totalPenalty: 500000,
        penaltyGrowth: 0
    };

    // 3. Logic giả lập lọc dữ liệu (Để Demo trông thật hơn khi thao tác)
    const filteredTransactions = useMemo(() => {
        return MOCK_TRANSACTIONS.filter(tx => {
            const matchType = filters.type === "ALL" || tx.transactionType.toLowerCase().includes(filters.type.toLowerCase());
            const matchSource = filters.source === "ALL" || tx.sourceType === filters.source;
            return matchType && matchSource;
        });
    }, [filters]);

    const totalPages = 1;

    const formatCurrency = (value) => {
        return value?.toLocaleString("vi-VN") + " ₫";
    };

    const formatAmount = (amount, direction) => {
        const formatted = amount.toLocaleString("vi-VN") + " ₫";
        return direction === "IN" ? `+${formatted}` : `-${formatted}`;
    };

    const handleExportExcel = () => {
        alert("Tính năng Demo: Hệ thống đang trích xuất dữ liệu ra file Excel...");
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Lịch sử giao dịch</h1>
                    <p className="text-sm text-slate-500">Xem và quản lý các biến động số dư của đại lý</p>
                </div>
                <button
                    onClick={handleExportExcel}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:opacity-90 transition flex items-center gap-2 font-medium"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Xuất Excel
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tổng chi tiêu tháng này</span>
                    <span className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalSpending)}</span>
                    <span className="text-[11px] font-medium text-red-400 mt-1">
                        ↑ {summary.spendingGrowth}% so với tháng trước
                    </span>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tổng tiền nạp</span>
                    <span className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalTopup)}</span>
                    <span className="text-[11px] font-medium text-green-500 mt-1">
                        ↑ {summary.topupGrowth}% so với tháng trước
                    </span>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tổng phí phạt / Khác</span>
                    <span className="text-2xl font-bold text-slate-800">{formatCurrency(summary.totalPenalty)}</span>
                    <span className="text-[11px] font-medium text-slate-400 mt-1">
                        Ổn định so với tháng trước
                    </span>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-8">
                <h2 className="text-sm font-bold text-slate-700 mb-6 flex items-center gap-2 uppercase tracking-tight">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 12.414V19a1 1 0 01-.553.894l-4 2A1 1 0 019 21v-8.586L3.293 6.707A1 1 0 013 6V4z" />
                    </svg>
                    Bộ lọc tìm kiếm
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="flex flex-col">
                        <label className="text-[11px] font-bold text-slate-400 mb-2 uppercase">Từ ngày</label>
                        <input
                            type="date"
                            value={filters.dateFrom}
                            onChange={e => setFilters({ ...filters, dateFrom: e.target.value })}
                            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-[11px] font-bold text-slate-400 mb-2 uppercase">Đến ngày</label>
                        <input
                            type="date"
                            value={filters.dateTo}
                            onChange={e => setFilters({ ...filters, dateTo: e.target.value })}
                            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-[11px] font-bold text-slate-400 mb-2 uppercase">Loại giao dịch</label>
                        <select
                            value={filters.type}
                            onChange={e => setFilters({ ...filters, type: e.target.value })}
                            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition"
                        >
                            <option value="ALL">Tất cả</option>
                            <option value="Nạp tiền">Nạp tiền (Top-up)</option>
                            <option value="Thanh toán">Thanh toán (Payment)</option>
                            <option value="Hoàn tiền">Hoàn trả (Refund)</option>
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label className="text-[11px] font-bold text-slate-400 mb-2 uppercase">Nguồn tiền</label>
                        <select
                            value={filters.source}
                            onChange={e => setFilters({ ...filters, source: e.target.value })}
                            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition"
                        >
                            <option value="ALL">Tất cả nguồn</option>
                            <option value="Wallet">Ví trả trước</option>
                            <option value="Credit">Hạn mức tín dụng</option>
                            <option value="Bank">Ngân hàng</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <button
                        onClick={() => setPage(0)}
                        className="px-6 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-black transition"
                    >
                        Áp dụng lọc
                    </button>
                    <button
                        onClick={() => setFilters({ dateFrom: "", dateTo: "", type: "ALL", source: "ALL" })}
                        className="px-6 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-200 transition"
                    >
                        Xóa bộ lọc
                    </button>
                </div>
            </div>

            {/* Transaction Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-widest border-b border-slate-100">
                    <tr>
                        <th className="py-4 px-4 text-center">Thời gian</th>
                        <th className="px-4">Loại GD</th>
                        <th className="px-4">Nội dung chi tiết</th>
                        <th className="px-4 text-center">Nguồn</th>
                        <th className="px-4 text-right">Số tiền</th>
                        <th className="px-4 text-center">Trạng thái</th>
                    </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-50">
                    {filteredTransactions.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="text-center py-12 text-slate-400 font-medium italic">
                                Không tìm thấy dữ liệu giao dịch phù hợp
                            </td>
                        </tr>
                    ) : (
                        filteredTransactions.map(tx => (
                            <tr key={tx.id} className="hover:bg-slate-50/50 transition">
                                <td className="py-4 px-4 text-center text-slate-500 font-medium">
                                    {tx.createdAt}
                                </td>

                                <td className="px-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter
                                            ${tx.transactionType.includes("Thanh toán") ? "bg-amber-100 text-amber-700" :
                                            tx.transactionType.includes("Nạp") ? "bg-emerald-100 text-emerald-700" :
                                                "bg-blue-100 text-blue-700"}`}>
                                            {tx.transactionType}
                                        </span>
                                </td>

                                <td className="px-4 text-slate-700 font-semibold">{tx.description}</td>

                                <td className="px-4 text-center">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border 
                                            ${tx.sourceType === "Wallet" ? "border-indigo-200 text-indigo-600 bg-indigo-50" :
                                            tx.sourceType === "Bank" ? "border-slate-200 text-slate-600 bg-slate-50" :
                                                "border-purple-200 text-purple-600 bg-purple-50"}`}>
                                            {tx.sourceType}
                                        </span>
                                </td>

                                <td className={`px-4 font-black text-right text-base
                                        ${tx.direction === "IN" ? "text-emerald-500" : "text-rose-500"}`}>
                                    {formatAmount(tx.amount, tx.direction)}
                                </td>

                                <td className="px-4 text-center">
                                    <div className="flex items-center justify-center gap-1.5 text-emerald-600 font-bold text-[11px]">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                        Thành công
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>

                {/* Pagination (Giả lập) */}
                <div className="flex justify-between items-center px-6 py-4 bg-slate-50/50 border-t border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <span>Trang {page + 1} / {totalPages}</span>
                    <div className="flex gap-2">
                        <button disabled className="px-4 py-2 rounded-lg bg-white border border-slate-200 opacity-50 cursor-not-allowed">Trình trước</button>
                        <button disabled className="px-4 py-2 rounded-lg bg-white border border-slate-200 opacity-50 cursor-not-allowed">Trang sau</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DemoTransactionHistoryPage;