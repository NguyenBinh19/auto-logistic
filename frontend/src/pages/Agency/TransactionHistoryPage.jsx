import React, { useEffect, useState } from "react";
import api from "../../services/axios.config";

const TransactionHistoryPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [summary, setSummary] = useState({
        totalSpending: 0,
        totalTopup: 0,
        totalPenalty: 0,
    });

    const [filters, setFilters] = useState({
        dateFrom: "",
        dateTo: "",
        type: "ALL",
        source: "ALL",
    });

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const agencyId = user?.agencyId;

    const handleExportExcel = async () => {
        try {
            const res = await api.get(`/transaction-history/${agencyId}/transactions/export`, {
                responseType: "blob",
                params: {
                    dateFrom: filters.dateFrom,
                    dateTo: filters.dateTo,
                    type: filters.type,
                    source: filters.source,
                },
            });

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "lich_su_giao_dich.xlsx");
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Error exporting Excel:", err);
        }
    };


    useEffect(() => {
        if (agencyId) {
            api.get(`/transaction-history/${agencyId}/transactions?page=${page}&size=${size}`, {
                params: {
                    dateFrom: filters.dateFrom,
                    dateTo: filters.dateTo,
                    type: filters.type,
                    source: filters.source,
                },
            })
                .then(res => {
                    const data = res.data.result;
                    setTransactions(data.content || []);
                    setTotalPages(data.totalPages || 0);
                })
                .catch(err => console.error("Error fetching transactions:", err));

            // Lấy summary
            api.get(`/transaction-history/${agencyId}/transactions/summary`)
                .then(res => {
                    setSummary(res.data.result);
                })
                .catch(err => console.error("Error fetching summary:", err));
        }
    }, [agencyId, page, size, filters]);

    const formatCurrency = (value) => {
        return value?.toLocaleString("vi-VN") + " ₫";
    };

    const formatAmount = (amount, direction) => {
        const formatted = amount.toLocaleString("vi-VN") + " ₫";
        return direction === "IN" ? `+${formatted}` : `-${formatted}`;
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Lịch sử giao dịch</h1>
                <button
                    onClick={handleExportExcel}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:opacity-90 transition flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4h16v16H4z" />
                    </svg>
                    Xuất Excel
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow p-4 flex flex-col">
                    <span className="text-sm text-slate-500">Tổng chi tiêu</span>
                    <span className="text-xl font-bold text-red-600">{formatCurrency(summary.totalSpending)}</span>
                    <span className="text-xs text-slate-400">
                        {summary.spendingGrowth >= 0
                            ? `+${summary.spendingGrowth}% so với tháng trước`
                            : `${summary.spendingGrowth}% so với tháng trước`}
                    </span>
                </div>

                <div className="bg-white rounded-xl shadow p-4 flex flex-col">
                    <span className="text-sm text-slate-500">Tổng nạp</span>
                    <span className="text-xl font-bold text-green-600">{formatCurrency(summary.totalTopup)}</span>
                    <span className="text-xs text-slate-400">
                        {summary.topupGrowth >= 0
                            ? `+${summary.topupGrowth}% so với tháng trước`
                            : `${summary.topupGrowth}% so với tháng trước`}
                    </span>
                </div>

                <div className="bg-white rounded-xl shadow p-4 flex flex-col">
                    <span className="text-sm text-slate-500">Tổng phí phạt</span>
                    <span className="text-xl font-bold text-slate-800">{formatCurrency(summary.totalPenalty)}</span>
                    <span className="text-xs text-slate-400">
                        {summary.penaltyGrowth > 0 ? `+${summary.penaltyGrowth}% so với tháng trước` : "Không có khoản phạt nào"}
                    </span>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <h2 className="text-lg font-semibold text-slate-700 mb-6 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 12.414V19a1 1 0 01-.553.894l-4 2A1 1 0 019 21v-8.586L3.293 6.707A1 1 0 013 6V4z" />
                    </svg>
                    Bộ lọc giao dịch
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="flex flex-col">
                        <label className="text-xs font-medium text-slate-600 mb-1">Từ ngày</label>
                        <input
                            type="date"
                            value={filters.dateFrom}
                            onChange={e => setFilters({ ...filters, dateFrom: e.target.value })}
                            className="border rounded-lg px-3 py-2 text-sm focus:ring focus:ring-blue-200 focus:border-blue-400 transition"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-xs font-medium text-slate-600 mb-1">Đến ngày</label>
                        <input
                            type="date"
                            value={filters.dateTo}
                            onChange={e => setFilters({ ...filters, dateTo: e.target.value })}
                            className="border rounded-lg px-3 py-2 text-sm focus:ring focus:ring-blue-200 focus:border-blue-400 transition"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-xs font-medium text-slate-600 mb-1">Loại giao dịch</label>
                        <select
                            value={filters.type}
                            onChange={e => setFilters({ ...filters, type: e.target.value })}
                            className="border rounded-lg px-3 py-2 text-sm focus:ring focus:ring-blue-200 focus:border-blue-400 transition"
                        >
                            <option value="ALL">Tất cả loại giao dịch</option>
                            <option value="Top-up">Top-up</option>
                            <option value="Payment">Payment</option>
                            <option value="Refund">Refund</option>
                            <option value="Penalty">Penalty</option>
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label className="text-xs font-medium text-slate-600 mb-1">Nguồn tiền</label>
                        <select
                            value={filters.source}
                            onChange={e => setFilters({ ...filters, source: e.target.value })}
                            className="border rounded-lg px-3 py-2 text-sm focus:ring focus:ring-blue-200 focus:border-blue-400 transition"
                        >
                            <option value="ALL">Tất cả nguồn tiền</option>
                            <option value="Wallet">Ví</option>
                            <option value="Credit">Tín dụng</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={() => setPage(0)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm shadow flex items-center gap-2 hover:bg-blue-700 transition"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h18M3 12h18M3 20h18" />
                        </svg>
                        Áp dụng
                    </button>
                    <button
                        onClick={() => setFilters({ dateFrom: "", dateTo: "", type: "ALL", source: "ALL" })}
                        className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm shadow flex items-center gap-2 hover:bg-slate-300 transition"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v6h6M20 20v-6h-6M5 19a9 9 0 0114-14" />
                        </svg>
                        Đặt lại
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 text-slate-600 uppercase text-xs">
                        <tr>
                            <th className="py-2 px-3 text-center align-middle">Mã GD</th>
                            <th className="px-3 text-center align-middle">Thời gian</th>
                            <th className="px-3 text-center align-middle">Loại GD</th>
                            <th className="px-3 text-center align-middle">Nội dung</th>
                            <th className="px-3 text-center align-middle">Nguồn</th>
                            <th className="px-3 text-center align-middle">Số tiền</th>
                            <th className="px-3 text-center align-middle">Số dư sau</th>
                            <th className="px-3 text-center align-middle">Trạng thái</th>
                        </tr>
                    </thead>

                    <tbody>
                        {transactions.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center py-6 text-slate-500">
                                    Không có giao dịch nào
                                </td>
                            </tr>
                        ) : (
                            transactions.map(tx => (
                                <tr key={tx.id} className="border-b hover:bg-slate-50 transition">
                                    <td className="py-2 px-3 font-semibold text-slate-700 text-center align-middle">
                                        #{tx.transactionCode}
                                    </td>

                                    <td className="px-3 text-slate-600 text-center align-middle">
                                        {new Date(tx.transactionDate).toLocaleString("vi-VN", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit"
                                        })}
                                    </td>

                                    <td className="px-3 text-center align-middle">
                                        <span className={`px-2 py-1 rounded text-xs font-medium
            ${tx.transactionType === "Payment" ? "bg-red-100 text-red-600" :
                                                tx.transactionType === "Top-up" ? "bg-green-100 text-green-600" :
                                                    tx.transactionType === "Refund" ? "bg-blue-100 text-blue-600" :
                                                        tx.transactionType === "Penalty" ? "bg-orange-100 text-orange-600" :
                                                            "bg-slate-100 text-slate-600"}`}>
                                            {tx.transactionType}
                                        </span>
                                    </td>

                                    <td className="px-3 text-slate-700 text-center align-middle">{tx.description}</td>

                                    <td className="px-3 text-center align-middle">
                                        <span className={`px-2 py-1 rounded text-xs font-medium
            ${tx.sourceType === "Wallet" ? "bg-indigo-100 text-indigo-600" :
                                                "bg-purple-100 text-purple-600"}`}>
                                            {tx.sourceType}
                                        </span>
                                    </td>

                                    <td className={`px-3 font-semibold text-center align-middle
          ${tx.direction === "IN" ? "text-green-600" : "text-red-500"}`}>
                                        {formatAmount(tx.amount, tx.direction)}
                                    </td>

                                    <td className="px-3 text-slate-700 text-center align-middle">
                                        {tx.balanceAfter.toLocaleString("vi-VN")} ₫
                                    </td>

                                    <td className="px-3 text-center align-middle">
                                        <span className={`px-2 py-1 rounded text-xs font-medium
            ${tx.status === "Success" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}`}>
                                            {tx.status === "Success" ? "Thành công" : "Đang xử lý"}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>

                </table>

                <div className="flex justify-between items-center mt-4 text-sm text-slate-500">
                    <span>Trang {page + 1} / {totalPages}</span>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 0}
                            onClick={() => setPage(prev => Math.max(prev - 1, 0))}
                            className="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300 disabled:opacity-50"
                        >
                            Trang trước
                        </button>
                        <button
                            disabled={page >= totalPages - 1}
                            onClick={() => setPage(prev => Math.min(prev + 1, totalPages - 1))}
                            className="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50"
                        >
                            Tiếp theo
                        </button>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default TransactionHistoryPage;
