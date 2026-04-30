import React, { useEffect, useMemo, useState, useCallback } from "react";
import { CalendarDays, Loader2, Search, X, ExternalLink, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { payoutService } from "@/services/payout.service.js";
import { format } from "date-fns";

const STATUS_CONFIG = {
    PENDING_CONFIRMATION: { label: "Chờ xác nhận", color: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" },
    APPROVED: { label: "Sẵn sàng", color: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-500" },
    PROCESSING: { label: "Đang xử lý", color: "bg-indigo-100 text-indigo-700 border-indigo-200", dot: "bg-indigo-500 animate-pulse" },
    PAID: { label: "Đã thanh toán", color: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
    ROLLOVER: { label: "Chuyển kỳ sau", color: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-400" },
    MERGED: { label: "Đã gộp kỳ mới", color: "bg-slate-100 text-slate-500 border-slate-200", dot: "bg-slate-400" },
    DISPUTED: { label: "Khiếu nại", color: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" },
    DRAFT: { label: "Nháp", color: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" },
};
const formatMoney = (val) => Number(val || 0).toLocaleString("vi-VN");

const PayoutStatementOverview = () => {
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [payoutData, setPayoutData] = useState({ payouts: [] });
    const [selectedStatementId, setSelectedStatementId] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = { includeDisputed: true };
            if (dateFrom && dateTo) {
                params.periodStart = dateFrom;
                params.periodEnd = dateTo;
            }
            const res = await payoutService.getPayoutList(params);
            setPayoutData(res?.result || { payouts: [] });
        } catch (error) {
            console.error("Failed to load statement overview", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredRows = useMemo(() => {
        const rows = payoutData?.payouts || [];
        if (!searchTerm.trim()) return rows;
        const term = searchTerm.toLowerCase();
        return rows.filter((item) =>
            (item.hotelName || "").toLowerCase().includes(term)
            || (item.statementCode || "").toLowerCase().includes(term)
        );
    }, [payoutData, searchTerm]);

    const summary = useMemo(() => {
        const rows = filteredRows;
        const uniqueHotels = new Set(rows.map((r) => r.hotelId)).size;
        const totalNet = rows.reduce((sum, r) => sum + Number(r.netPayout || 0), 0);
        const paidNet = rows
            .filter((r) => r.status === "PAID")
            .reduce((sum, r) => sum + Number(r.netPayout || 0), 0);
        return {
            totalStatements: rows.length,
            totalHotels: uniqueHotels,
            totalNet,
            paidNet,
        };
    }, [filteredRows]);

    return (<>
        <div className="p-8 bg-[#f8fafc] min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 uppercase">Tổng Statement Khách Sạn</h1>
                    <p className="text-sm text-slate-500 font-medium">Theo dõi toàn bộ kỳ đối soát theo mốc thời gian</p>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="md:col-span-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Tìm kiếm</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Khách sạn hoặc mã sao kê"
                                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm"
                            />
                            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Từ ngày</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Đến ngày</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm"
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={fetchData}
                            className="w-full py-3 rounded-xl bg-slate-900 text-white text-sm font-bold flex items-center justify-center gap-2"
                        >
                            <CalendarDays size={16} /> Lọc
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <SummaryCard label="Tổng sao kê" value={summary.totalStatements} color="text-slate-800" />
                    <SummaryCard label="Số khách sạn" value={summary.totalHotels} color="text-blue-700" />
                    <SummaryCard label="Tổng thực nhận" value={`${formatMoney(summary.totalNet)} VND`} color="text-slate-800" />
                    <SummaryCard label="Đã thanh toán" value={`${formatMoney(summary.paidNet)} VND`} color="text-emerald-700" />
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <tr>
                                    <th className="px-4 py-3">Mã sao kê</th>
                                    <th className="px-4 py-3">Khách sạn</th>
                                    <th className="px-4 py-3">Kỳ sao kê</th>
                                    <th className="px-4 py-3">Trạng thái</th>
                                    <th className="px-4 py-3 text-right">Thực nhận</th>
                                    <th className="px-4 py-3 text-right">Thời gian paid</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="py-16 text-center">
                                            <Loader2 size={30} className="animate-spin mx-auto text-blue-600" />
                                        </td>
                                    </tr>
                                ) : filteredRows.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="py-16 text-center text-xs text-slate-400 font-bold uppercase">Không có dữ liệu</td>
                                    </tr>
                                ) : (
                                    filteredRows.map((item) => (
                                        <tr key={item.statementId} className="hover:bg-slate-50/50">
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => setSelectedStatementId(item.statementId)}
                                                    className="font-black text-blue-700 hover:underline text-left"
                                                >
                                                    {item.statementCode}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-slate-700">{item.hotelName}</td>
                                            <td className="px-4 py-3 text-slate-600">
                                                {item.periodStart ? format(new Date(item.periodStart), "dd/MM/yyyy") : "-"}
                                                <span className="mx-1">-</span>
                                                {item.periodEnd ? format(new Date(item.periodEnd), "dd/MM/yyyy") : "-"}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${STATUS_CONFIG[item.status]?.color || STATUS_CONFIG.DRAFT.color
                                                        }`}
                                                >
                                                    {STATUS_CONFIG[item.status]?.label || item.status || "N/A"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-black text-slate-800">{formatMoney(item.netPayout)}</td>
                                            <td className="px-4 py-3 text-right text-slate-600">
                                                {item.paidAt ? format(new Date(item.paidAt), "dd/MM/yyyy HH:mm") : "-"}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => setSelectedStatementId(item.statementId)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all text-xs font-bold"
                                                >
                                                    <FileText size={13} /> Chi tiết
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        {selectedStatementId && (
            <StatementDetailModal
                statementId={selectedStatementId}
                onClose={() => setSelectedStatementId(null)}
            />
        )}
    </>);
};

const SummaryCard = ({ label, value, color }) => (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <h3 className={`text-xl font-black ${color}`}>{value}</h3>
    </div>
);

// ===================== STATEMENT DETAIL MODAL =====================
const StatementDetailModal = ({ statementId, onClose }) => {
    const [statement, setStatement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;

    const fetchDetail = useCallback(async () => {
        setLoading(true);
        try {
            const res = await payoutService.getStatementDetail(statementId);
            if (res.code === 1000) setStatement(res.result);
        } catch (error) {
            console.error("Lỗi tải chi tiết sao kê:", error);
        } finally {
            setLoading(false);
        }
    }, [statementId]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = "unset"; };
    }, []);

    const lineItems = statement?.lineItems || [];

    const filteredItems = useMemo(() => {
        if (!searchTerm.trim()) return lineItems;
        const term = searchTerm.toLowerCase();
        return lineItems.filter(
            (item) =>
                (item.bookingCode || "").toLowerCase().includes(term) ||
                (item.agencyName || "").toLowerCase().includes(term)
        );
    }, [lineItems, searchTerm]);

    const totalPages = Math.ceil(filteredItems.length / rowsPerPage);
    const currentTableData = useMemo(() => {
        const first = (currentPage - 1) * rowsPerPage;
        return filteredItems.slice(first, first + rowsPerPage);
    }, [currentPage, filteredItems]);

    const getCurrentCycleNet = (stmt) => {
        const gross = Number(stmt?.grossRevenue || 0);
        const commission = Number(stmt?.totalCommission || 0);
        const refunds = Number(stmt?.totalRefunds || 0);
        const adjustments = Number(stmt?.adjustments || 0);
        return gross - commission - refunds + adjustments;
    };

    const statusCfg = statement ? (STATUS_CONFIG[statement.status] || STATUS_CONFIG.DRAFT) : null;
    const isPaid = statement?.status === "PAID";

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Chi tiết sao kê</p>
                        <h2 className="text-base font-black text-blue-700">{statement?.statementCode || "..."}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="overflow-y-auto flex-1 p-6 space-y-5">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 size={30} className="animate-spin text-blue-600" />
                        </div>
                    ) : !statement ? (
                        <div className="text-center py-20 text-slate-400 font-bold text-sm">Không tìm thấy dữ liệu</div>
                    ) : (
                        <>
                            {/* Info Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <InfoCard label="Khách sạn" value={statement.hotelName} />
                                <InfoCard
                                    label="Kỳ sao kê"
                                    value={
                                        statement.periodStart && statement.periodEnd
                                            ? `${format(new Date(statement.periodStart), "dd/MM/yyyy")} - ${format(new Date(statement.periodEnd), "dd/MM/yyyy")}`
                                            : "-"
                                    }
                                />
                                <InfoCard label="Tổng booking" value={statement.totalBookings ?? "-"} />
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Trạng thái</p>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${statusCfg?.color}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg?.dot}`}></span>
                                        {statusCfg?.label}
                                    </span>
                                </div>
                            </div>

                            {/* Financial Summary */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <FinanceCard label="Doanh thu gộp" value={`${formatMoney(statement.grossRevenue)} VND`} color="text-slate-800" />
                                <FinanceCard label="Hoa hồng" value={`-${formatMoney(statement.totalCommission)} VND`} color="text-red-500" />
                                <FinanceCard label="Hoàn trả" value={`-${formatMoney(statement.totalRefunds)} VND`} color="text-red-400" />
                                <FinanceCard label="Thực nhận kỳ này" value={`${formatMoney(getCurrentCycleNet(statement))} VND`} color="text-blue-700" />
                            </div>

                            {(Number(statement.carriedForwardAmount || 0) !== 0 || true) && (
                                <div className="grid grid-cols-2 gap-3">
                                    <FinanceCard
                                        label="Doanh thu chuyển kỳ trước"
                                        value={`${Number(statement.carriedForwardAmount || 0) >= 0 ? "+" : ""}${formatMoney(statement.carriedForwardAmount)} VND`}
                                        color="text-blue-600"
                                    />
                                    <FinanceCard label="Tổng thanh toán" value={`${formatMoney(statement.netPayout)} VND`} color="text-slate-900" bold />
                                </div>
                            )}

                            {/* Payment Info (only if PAID) */}
                            {isPaid && (
                                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
                                    <h3 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-3">Thông tin thanh toán</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                        <div className="bg-white rounded-xl p-3 border border-emerald-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Mã giao dịch</p>
                                            <p className="font-black text-slate-800 mt-1 text-sm">{statement.bankReference || "-"}</p>
                                        </div>
                                        <div className="bg-white rounded-xl p-3 border border-emerald-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Người chi trả</p>
                                            <p className="font-black text-slate-800 mt-1 text-sm">{statement.paidBy || "-"}</p>
                                        </div>
                                        <div className="bg-white rounded-xl p-3 border border-emerald-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Người nhận</p>
                                            <p className="font-black text-slate-800 mt-1 text-sm">{statement.bankAccountHolder || "-"}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">{statement.bankName || "-"} - {statement.bankAccountNumber || "-"}</p>
                                        </div>
                                        <div className="bg-white rounded-xl p-3 border border-emerald-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Thời gian chuyển</p>
                                            <p className="font-black text-slate-800 mt-1 text-sm">
                                                {statement.paidAt ? new Date(statement.paidAt).toLocaleString("vi-VN") : "-"}
                                            </p>
                                        </div>
                                    </div>
                                    {statement.paymentProofUrl && (
                                        <a
                                            href={statement.paymentProofUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center mt-3 px-4 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-700 text-xs font-black uppercase gap-2"
                                        >
                                            <ExternalLink size={13} /> Xem ảnh minh chứng
                                        </a>
                                    )}
                                </div>
                            )}

                            {/* Booking Line Items */}
                            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <FileText size={14} className="text-blue-600" />
                                        Chi tiết booking ({filteredItems.length})
                                    </h3>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                                        <input
                                            type="text"
                                            placeholder="Tìm mã đặt, đại lý..."
                                            className="pl-9 pr-4 py-2 bg-slate-50 rounded-full text-xs outline-none w-52 border border-transparent focus:border-blue-100 focus:bg-white transition-all"
                                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                        />
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <th className="px-4 py-3">Booking</th>
                                                <th className="px-4 py-3">Đại lý</th>
                                                <th className="px-4 py-3">Check-in</th>
                                                <th className="px-4 py-3">Check-out</th>
                                                <th className="px-4 py-3 text-right">Doanh thu</th>
                                                <th className="px-4 py-3 text-right">Hoa hồng</th>
                                                <th className="px-3 py-3 text-right leading-tight">
                                                    <div>Hoàn trả</div>
                                                    <div className="text-[9px] text-slate-300 font-normal">(cancel)</div>
                                                </th>
                                                <th className="px-4 py-3 text-right">Thực nhận</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {currentTableData.length === 0 ? (
                                                <tr>
                                                    <td colSpan="8" className="py-10 text-center text-xs text-slate-400 font-bold">Không có booking</td>
                                                </tr>
                                            ) : (
                                                currentTableData.map((item) => (
                                                    <tr key={item.lineItemId} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-4 py-3 font-black text-blue-600">{item.bookingCode}</td>
                                                        <td className="px-4 py-3 font-semibold text-slate-700">{item.agencyName || "-"}</td>
                                                        <td className="px-4 py-3 text-slate-600">{item.checkInDate || "-"}</td>
                                                        <td className="px-4 py-3 text-slate-600">{item.checkOutDate || "-"}</td>
                                                        <td className="px-4 py-3 text-right font-bold text-slate-800">{formatMoney(item.grossAmount)}</td>
                                                        <td className="px-4 py-3 text-right font-bold text-red-500">-{formatMoney(item.commissionAmount)}</td>
                                                        <td className="px-4 py-3 text-right font-bold text-red-400">-{formatMoney(item.refundAmount)}</td>
                                                        <td className="px-4 py-3 text-right font-black text-slate-900">{formatMoney(item.netAmount)}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {totalPages > 1 && (
                                    <div className="px-5 py-3 border-t border-slate-50 flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Trang {currentPage} / {totalPages}</span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="p-1.5 border border-slate-100 rounded-lg hover:bg-slate-50 disabled:opacity-30"
                                            >
                                                <ChevronLeft size={14} />
                                            </button>
                                            <button
                                                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                className="p-1.5 border border-slate-100 rounded-lg hover:bg-slate-50 disabled:opacity-30"
                                            >
                                                <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const InfoCard = ({ label, value }) => (
    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="font-black text-slate-800 text-sm">{value}</p>
    </div>
);

const FinanceCard = ({ label, value, color, bold }) => (
    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className={`${bold ? "text-base" : "text-sm"} font-black ${color}`}>{value}</p>
    </div>
);

export default PayoutStatementOverview;
