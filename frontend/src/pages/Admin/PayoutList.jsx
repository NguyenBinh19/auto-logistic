import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, Link } from "react-router-dom";
import {
    Search, Loader2, CheckCircle2, Clock, AlertCircle,
    ChevronLeft, ChevronRight, Download,
    Landmark, RefreshCw, FileText, X, Eye, ExternalLink
} from "lucide-react";
import { payoutService } from '@/services/payout.service.js';
import { pdfDocumentService } from "@/services/pdf.service.js";
import { format } from 'date-fns';

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

const formatDateISO = (date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const getPreviousCycleRange = () => {
    const now = new Date();
    const day = now.getDate();

    if (day >= 26) {
        const periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 26);
        const periodEnd = new Date(now.getFullYear(), now.getMonth(), 25);
        return { periodStart, periodEnd };
    }

    const periodStart = new Date(now.getFullYear(), now.getMonth() - 2, 26);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() - 1, 25);
    return { periodStart, periodEnd };
};

const PayoutList = () => {
    const location = useLocation();
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = currentUser?.roles || "";
    const isFullAdmin = userRole === "ROLE_ADMIN";
    const isReadOnly = !isFullAdmin;

    const [payoutData, setPayoutData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [statusFilter, setStatusFilter] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);
    const [detailModal, setDetailModal] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [markPaidModal, setMarkPaidModal] = useState(false);
    const [bankReference, setBankReference] = useState("");
    const [recipientBankName, setRecipientBankName] = useState("");
    const [recipientBankHolder, setRecipientBankHolder] = useState("");
    const [recipientBankAccount, setRecipientBankAccount] = useState("");
    const [proofImage, setProofImage] = useState(null);
    const [markingPaid, setMarkingPaid] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [policyUrl, setPolicyUrl] = useState("");
    const [isPdfLoading, setIsPdfLoading] = useState(true);
    const previousCycle = useMemo(() => getPreviousCycleRange(), []);

    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                const pdfRes = await pdfDocumentService.getAllPdfs();
                if (pdfRes?.result) {
                    const policyDoc = pdfRes.result.find(doc => {
                        const title = (doc.title || "").toLowerCase();
                        return title.includes("phụ lục") && title.includes("thanh toán");
                    });
                    setPolicyUrl(policyDoc?.fileUrl || "");
                }
            } catch (error) {
                console.error("Lỗi tải chính sách thanh toán:", error);
            }
        };
        fetchPolicy();
    }, []);

    useEffect(() => {
        document.body.style.overflow = showPdfModal ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [showPdfModal]);

    const fetchPayouts = async () => {
        setLoading(true);
        try {
            const params = {
                periodStart: formatDateISO(previousCycle.periodStart),
                periodEnd: formatDateISO(previousCycle.periodEnd),
                includeDisputed: false,
            };
            if (statusFilter) params.status = statusFilter;
            const res = await payoutService.getPayoutList(params);
            setPayoutData(res.result);
        } catch (err) {
            console.error("Failed to load payouts:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPayouts(); }, [statusFilter, previousCycle]);

    const filteredPayouts = useMemo(() => {
        if (!payoutData?.payouts) return [];
        return payoutData.payouts.filter(p => {
            const term = searchTerm.toLowerCase();
            return !term ||
                p.hotelName?.toLowerCase().includes(term) ||
                p.statementCode?.toLowerCase().includes(term);
        });
    }, [payoutData, searchTerm]);

    const totalPages = Math.ceil(filteredPayouts.length / rowsPerPage);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return filteredPayouts.slice(start, start + rowsPerPage);
    }, [filteredPayouts, currentPage]);

    const handleGenerate = async () => {
        if (!window.confirm("Bạn chỉ có thể tạo sao kê 1 lần cho 1 kỳ. Bạn chắc chắn muốn tạo chứ?")) return;
        setGenerating(true);
        try {
            const res = await payoutService.generateStatements();
            alert(res.message || `Đã tạo ${res.result?.length || 0} bảng sao kê`);
            fetchPayouts();
        } catch (err) {
            alert(err.response?.data?.message || "Lỗi khi tạo sao kê");
        } finally {
            setGenerating(false);
        }
    };

    const handleExportBatch = async () => {
        if (selectedIds.length === 0) return alert("Vui lòng chọn ít nhất 1 bản ghi");
        try {
            await payoutService.exportBatchPayment(selectedIds);
            alert("Đã cập nhật trạng thái sang PROCESSING");
            setSelectedIds([]);
            fetchPayouts();
        } catch (err) {
            alert(err.response?.data?.message || "Lỗi khi export");
        }
    };

    const handleMarkPaid = async () => {
        if (selectedIds.length !== 1) {
            return alert("Chỉ được chọn 1 sao kê để thanh toán");
        }
        if (!bankReference.trim()) return alert("Vui lòng nhập mã giao dịch ngân hàng");
        if (!recipientBankName.trim()) return alert("Vui lòng nhập ngân hàng người nhận");
        if (!recipientBankHolder.trim()) return alert("Vui lòng nhập người nhận");
        if (!recipientBankAccount.trim()) return alert("Vui lòng nhập số tài khoản người nhận");
        setMarkingPaid(true);
        try {
            await payoutService.markAsPaid({
                statementIds: selectedIds,
                bankReference: bankReference.trim(),
                bankName: recipientBankName.trim(),
                bankAccountHolder: recipientBankHolder.trim(),
                bankAccountNumber: recipientBankAccount.trim(),
            }, proofImage);
            alert("Đã đánh dấu thanh toán thành công!");
            setMarkPaidModal(false);
            setBankReference("");
            setRecipientBankName("");
            setRecipientBankHolder("");
            setRecipientBankAccount("");
            setProofImage(null);
            setSelectedIds([]);
            fetchPayouts();
        } catch (err) {
            alert(err.response?.data?.message || "Lỗi khi đánh dấu thanh toán");
        } finally {
            setMarkingPaid(false);
        }
    };

    const handleViewDetail = async (statementId) => {
        setDetailLoading(true);
        setDetailModal({});
        try {
            const res = await payoutService.getStatementDetail(statementId);
            setDetailModal(res.result);
        } catch (err) {
            alert("Lỗi khi tải chi tiết");
            setDetailModal(null);
        } finally {
            setDetailLoading(false);
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? [] : [id]);
    };



    const renderStatusTag = (status) => {
        const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${cfg.color}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
            </span>
        );
    };

    const formatMoney = (val) => {
        if (val == null) return "0";
        return Number(val).toLocaleString("vi-VN");
    };

    const stats = payoutData ? [
        { label: "Chờ xác nhận", value: payoutData.pendingCount || 0, color: "text-indigo-600", bg: "bg-indigo-50", icon: <Clock size={22} /> },
        { label: "Sẵn sàng thanh toán", value: payoutData.readyCount || 0, color: "text-blue-600", bg: "bg-blue-50", icon: <CheckCircle2 size={22} /> },
        // { label: "Đang xử lý", value: payoutData.processingCount || 0, color: "text-indigo-600", bg: "bg-indigo-50", icon: <Clock size={22} /> },
        { label: "Đã thanh toán", value: payoutData.paidCount || 0, color: "text-emerald-600", bg: "bg-emerald-50", icon: <Landmark size={22} /> },
        { label: "Tổng phải trả", value: formatMoney(payoutData.totalPayoutLiability) + " VND", color: "text-orange-600", bg: "bg-orange-50", icon: <FileText size={22} /> },
    ] : [];

    const getCurrentCycleNet = (statement) => {
        const grossRevenue = Number(statement?.grossRevenue || 0);
        const totalCommission = Number(statement?.totalCommission || 0);
        const totalRefunds = Number(statement?.totalRefunds || 0);
        const adjustments = Number(statement?.adjustments || 0);

        return grossRevenue - totalCommission - totalRefunds + adjustments;
    };
    const handleOpenMarkPaidModal = async () => {
        if (selectedIds.length !== 1) {
            alert("Chỉ được chọn 1 sao kê để thanh toán");
            return;
        }

        const selectedStatementId = selectedIds[0];

        try {
            setDetailLoading(true);

            const res = await payoutService.getStatementDetail(selectedStatementId);
            const statement = res.result;

            setRecipientBankName(statement.bankName || "");
            setRecipientBankHolder(statement.bankAccountHolder || "");
            setRecipientBankAccount(statement.bankAccountNumber || "");

            setMarkPaidModal(true);
        } catch (err) {
            console.error("Lỗi tải thông tin ngân hàng:", err);
            alert("Không thể tải thông tin ngân hàng của sao kê đã chọn");
        } finally {
            setDetailLoading(false);
        }
    };
    return (
        <div className="p-8 bg-[#f8fafc] min-h-screen font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 uppercase">Quản lý thanh toán (Payout)</h1>
                        <p className="text-slate-500 text-sm font-medium">
                            Sao kê & thanh toán cho khách sạn đối tác. Kỳ đang xử lý: {format(previousCycle.periodStart, "dd/MM/yyyy")} - {format(previousCycle.periodEnd, "dd/MM/yyyy")}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                if (!policyUrl) {
                                    alert("Đang tải hoặc không tìm thấy file PDF!");
                                    return;
                                }
                                setShowPdfModal(true);
                            }}
                            className="flex items-center gap-2 text-[11px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-5 py-2.5 rounded-xl hover:bg-blue-100 transition-all uppercase tracking-tight"
                        >
                            <FileText size={16} /> Phụ lục thanh toán
                        </button>
                        <button
                            onClick={handleGenerate}
                            disabled={generating || isReadOnly}
                            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-50"
                        >
                            {generating ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                            {isReadOnly ? "Quyền xem nội bộ" : (generating ? "Đang tạo..." : "Tạo sao kê")}
                        </button>
                    </div>
                </header>

                {/* Stats */}
                {payoutData && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        {stats.map((s, idx) => (
                            <div key={idx}
                                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
                                <div className={`p-4 ${s.bg} ${s.color} rounded-2xl`}>{s.icon}</div>
                                <div>
                                    <p className="text-slate-500 text-xs font-bold mb-1">{s.label}</p>
                                    <h3 className={`text-2xl font-black ${s.color}`}>{s.value}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Table Card */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <h2 className="text-lg font-black text-slate-800">Danh sách sao kê</h2>

                            {/* Bulk Actions */}
                            <div className="flex gap-2">
                                {/* <button
                                    onClick={handleExportBatch}
                                    disabled={selectedIds.length === 0}
                                    className={`flex items-center gap-1 px-4 py-2 rounded-xl font-bold text-xs transition-all
                ${selectedIds.length === 0
                                            ? "bg-blue-300 text-white cursor-not-allowed opacity-60"
                                            : "bg-blue-600 text-white hover:bg-blue-700"
                                        }`}
                                >
                                    <Download size={14} />
                                    Export ({selectedIds.length})
                                </button> */}
                                {!isReadOnly && (
                                    <button
                                        onClick={handleOpenMarkPaidModal}
                                        disabled={selectedIds.length !== 1}
                                        className={`flex items-center gap-1 px-4 py-2 rounded-xl font-bold text-xs transition-all
${selectedIds.length !== 1
                                                ? "bg-emerald-300 text-white cursor-not-allowed opacity-60"
                                                : "bg-emerald-600 text-white hover:bg-emerald-700"
                                            }`}
                                    >
                                        <CheckCircle2 size={14} />
                                        Thanh toán sao kê
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block tracking-widest">Trạng thái</label>
                                <select
                                    value={statusFilter}
                                    onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none"
                                >
                                    <option value="">Tất cả</option>
                                    <option value="PENDING_CONFIRMATION">Chờ xác nhận</option>
                                    <option value="APPROVED">Sẵn sàng</option>
                                    <option value="PROCESSING">Đang xử lý</option>
                                    <option value="PAID">Đã thanh toán</option>
                                    <option value="ROLLOVER">Chuyển kỳ sau</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block tracking-widest">Tìm kiếm</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Tìm theo khách sạn hoặc mã sao kê..."
                                        value={searchTerm}
                                        onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-blue-200"
                                    />
                                    <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/50 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-4 py-3 w-10">
                                            Chọn
                                        </th>
                                        <th className="px-4 py-3">Mã sao kê</th>
                                        <th className="px-4 py-3">Khách sạn</th>
                                        <th className="px-4 py-3">Ky sao kê</th>
                                        <th className="px-4 py-3 text-right">Doanh thu</th>
                                        <th className="px-4 py-3 text-right">Hoa hồng</th>
                                        <th className="px-4 py-3 text-right">Chuyển kỳ trước</th>
                                        <th className="px-4 py-3 text-right">Tổng thanh toán</th>
                                        <th className="px-4 py-3">Trạng thái</th>
                                        <th className="px-4 py-3 text-center">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-700">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="10" className="px-6 py-20 text-center">
                                                <Loader2 className="animate-spin mx-auto text-blue-500 mb-2" size={32} />
                                                <span className="text-xs font-bold text-gray-400 uppercase">Đang tải dữ liệu...</span>
                                            </td>
                                        </tr>
                                    ) : paginatedData.length === 0 ? (
                                        <tr>
                                            <td colSpan="10" className="px-6 py-20 text-center text-gray-400 font-bold uppercase text-xs">
                                                Không có dữ liệu
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedData.map(p => (
                                            <tr key={p.statementId} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-4 py-4">
                                                    {p.status === "APPROVED" && (
                                                        <input type="checkbox"
                                                            checked={selectedIds.includes(p.statementId)}
                                                            onChange={() => toggleSelect(p.statementId)}
                                                            className="rounded" />
                                                    )}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="font-black text-xs text-slate-700">{p.statementCode}</span>
                                                    <p className="text-[10px] text-slate-400 font-medium">{p.totalBookings} Booking</p>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <p className="font-bold text-sm text-slate-800">{p.hotelName}</p>
                                                    {p.missingBankInfo && (
                                                        <span className="inline-flex items-center gap-1 text-[9px] font-black text-red-500 mt-1">
                                                            <AlertCircle size={10} /> Thiếu thông tin ngân hàng
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-xs font-bold text-slate-600">
                                                    {p.periodStart && format(new Date(p.periodStart), 'dd/MM/yyyy')}
                                                    <br />
                                                    <span className="text-slate-400">đến {p.periodEnd && format(new Date(p.periodEnd), 'dd/MM/yyyy')}</span>
                                                </td>
                                                <td className="px-4 py-4 text-right font-bold text-sm text-slate-800">{formatMoney(p.grossRevenue)}</td>
                                                <td className="px-4 py-4 text-right font-bold text-sm text-red-500">-{formatMoney(p.totalCommission)}</td>
                                                <td className="px-4 py-4 text-right font-bold text-sm">
                                                    {Number(p.carriedForwardAmount || 0) > 0 ? (
                                                        <span className="text-indigo-600">
                                                            +{formatMoney(p.carriedForwardAmount)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400">0</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-right font-black text-sm text-blue-600">{formatMoney(p.netPayout)}</td>
                                                <td className="px-4 py-4">{renderStatusTag(p.status)}</td>
                                                <td className="px-4 py-4 text-center">
                                                    <button
                                                        onClick={() => handleViewDetail(p.statementId)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                        title="Xem chi tiet"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-4">
                                <p className="text-xs font-bold text-slate-400">
                                    Hiển thị {(currentPage - 1) * rowsPerPage + 1} - {Math.min(currentPage * rowsPerPage, filteredPayouts.length)} / {filteredPayouts.length}
                                </p>
                                <div className="flex gap-2">
                                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                                        className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-30">
                                        <ChevronLeft size={16} />
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button key={page} onClick={() => setCurrentPage(page)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${page === currentPage ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                                            {page}
                                        </button>
                                    ))}
                                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                                        className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-30">
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {detailModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
                            <div>
                                <h2 className="text-lg font-black text-slate-800">Chi tiết sao kê</h2>
                                {detailModal.statementCode && (
                                    <p className="text-sm font-bold text-blue-600">{detailModal.statementCode}</p>
                                )}
                            </div>
                            <button onClick={() => setDetailModal(null)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            {detailLoading ? (
                                <div className="text-center py-12"><Loader2 className="animate-spin mx-auto text-blue-500" size={32} /></div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                        <InfoBox label="Khach san" value={detailModal.hotelName} />
                                        <InfoBox label="Ky sao ke" value={
                                            detailModal.periodStart && detailModal.periodEnd
                                                ? `${format(new Date(detailModal.periodStart), 'dd/MM/yyyy')} - ${format(new Date(detailModal.periodEnd), 'dd/MM/yyyy')}`
                                                : '-'
                                        } />
                                        <InfoBox label="Tổng booking" value={detailModal.totalBookings} />
                                        <InfoBox label="Trạng thái" value={renderStatusTag(detailModal.status)} isComponent />
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                        <InfoBox
                                            label="Doanh thu gộp"
                                            value={`${formatMoney(detailModal.grossRevenue)} VND`}
                                            highlight="text-slate-800"
                                        />

                                        <InfoBox
                                            label="Hoa hồng"
                                            value={`-${formatMoney(detailModal.totalCommission)} VND`}
                                            highlight="text-red-500"
                                        />

                                        <InfoBox
                                            label="Hoàn trả"
                                            value={`-${formatMoney(detailModal.totalRefunds)} VND`}
                                            highlight="text-orange-500"
                                        />

                                        <InfoBox
                                            label="Thực nhận kỳ này"
                                            value={`${formatMoney(getCurrentCycleNet(detailModal))} VND`}
                                            highlight="text-emerald-600"
                                        />

                                        {Number(detailModal.carriedForwardAmount || 0) > 0 ? (
                                            <div className="col-span-2 md:col-start-3 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <InfoBox
                                                    label="Doanh thu chuyển kỳ trước"
                                                    value={`+${formatMoney(detailModal.carriedForwardAmount)} VND`}
                                                    highlight="text-indigo-600"
                                                />

                                                <InfoBox
                                                    label="Tổng thanh toán"
                                                    value={`${formatMoney(detailModal.netPayout)} VND`}
                                                    highlight="text-blue-600"
                                                />
                                            </div>
                                        ) : (
                                            <div className="col-span-2 md:col-start-4 md:col-span-1">
                                                <InfoBox
                                                    label="Tổng thanh toán"
                                                    value={`${formatMoney(detailModal.netPayout)} VND`}
                                                    highlight="text-blue-600"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Line Items Table */}
                                    {detailModal.lineItems && detailModal.lineItems.length > 0 && (
                                        <div className="mt-4">
                                            <h3 className="font-black text-sm text-slate-700 mb-3 uppercase">Chi tiết booking</h3>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left border-collapse text-sm">
                                                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase">
                                                        <tr>
                                                            <th className="px-3 py-2">Booking</th>
                                                            <th className="px-3 py-2">Agency</th>
                                                            <th className="px-3 py-2">Check-in</th>
                                                            <th className="px-3 py-2">Check-out</th>
                                                            <th className="px-3 py-2 text-right">Doanh thu</th>
                                                            <th className="px-3 py-2 text-right">Hoa hồng</th>
                                                            <th className="px-3 py-2 text-right leading-tight">
                                                                <div>Hoàn trả</div>
                                                                <div className="text-[10px] text-slate-400 font-normal">
                                                                    (cancel booking)
                                                                </div>
                                                            </th>
                                                            <th className="px-3 py-2 text-right">Thực nhận</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        {detailModal.lineItems.map(item => (
                                                            <tr key={item.lineItemId} className="hover:bg-gray-50/50">
                                                                <td className="px-3 py-2 font-bold text-xs">{item.bookingCode}</td>
                                                                <td className="px-3 py-2 text-xs text-slate-600">{item.agencyName || '-'}</td>
                                                                <td className="px-3 py-2 text-xs">{item.checkInDate && format(new Date(item.checkInDate), 'dd/MM/yyyy')}</td>
                                                                <td className="px-3 py-2 text-xs">{item.checkOutDate && format(new Date(item.checkOutDate), 'dd/MM/yyyy')}</td>
                                                                <td className="px-3 py-2 text-xs text-right font-bold">{formatMoney(item.grossAmount)}</td>
                                                                <td className="px-3 py-2 text-xs text-right text-red-500">-{formatMoney(item.commissionAmount)}</td>
                                                                <td className="px-3 py-2 text-xs text-right text-orange-500">-{formatMoney(item.refundAmount)}</td>
                                                                <td className="px-3 py-2 text-xs text-right font-black text-blue-600">{formatMoney(item.netAmount)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Mark as Paid Modal */}
            {markPaidModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 text-center border border-gray-100">
                        <Landmark size={48} className="mx-auto text-emerald-500 mb-4" />
                        <h3 className="text-xl font-black text-gray-800 uppercase mb-2">Xác nhận thanh toán</h3>
                        <p className="text-xs text-gray-500 font-medium mb-6">
                            Đánh dấu <span className="font-black text-blue-600">{selectedIds.length}</span> Sao kê là đã thanh toán
                        </p>
                        <div className="text-left mb-6">
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">
                                Mã giao dịch ngân hàng (Bank Reference)
                            </label>
                            <input
                                type="text"
                                value={bankReference}
                                onChange={e => setBankReference(e.target.value)}
                                placeholder="VD: FT2603260001234"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-emerald-300"
                            />
                        </div>
                        <div className="text-left mb-6">
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">
                                Người nhận (Chủ tài khoản)
                            </label>
                            <input
                                type="text"
                                value={recipientBankHolder}
                                onChange={e => setRecipientBankHolder(e.target.value)}
                                placeholder="VD: CONG TY TNHH ABC"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-emerald-300"
                            />
                        </div>
                        <div className="text-left mb-6">
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">
                                Ngân hàng người nhận
                            </label>
                            <input
                                type="text"
                                value={recipientBankName}
                                onChange={e => setRecipientBankName(e.target.value)}
                                placeholder="VD: Vietcombank"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-emerald-300"
                            />
                        </div>
                        <div className="text-left mb-6">
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">
                                Số tài khoản người nhận
                            </label>
                            <input
                                type="text"
                                value={recipientBankAccount}
                                onChange={e => setRecipientBankAccount(e.target.value)}
                                placeholder="VD: 1234567890"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-emerald-300"
                            />
                        </div>
                        <div className="text-left mb-6">
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">
                                Ảnh minh chứng chuyển khoản
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={e => setProofImage(e.target.files?.[0] || null)}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => {
                                setMarkPaidModal(false);
                                setBankReference("");
                                setRecipientBankName("");
                                setRecipientBankHolder("");
                                setRecipientBankAccount("");
                                setProofImage(null);
                            }}
                                className="py-3 bg-gray-100 rounded-2xl font-bold text-xs uppercase">Huỷ</button>
                            <button onClick={handleMarkPaid} disabled={markingPaid}
                                className="py-3 bg-emerald-600 text-white rounded-2xl font-bold text-xs uppercase disabled:opacity-50 flex items-center justify-center gap-2">
                                {markingPaid ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL PDF PHỤ LỤC */}
            {showPdfModal && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-0 md:p-8 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-5xl h-full md:h-[94vh] md:rounded-[32px] overflow-hidden shadow-2xl flex flex-col relative animate-in zoom-in duration-300 border border-white/20">
                        {/* Control Bar */}
                        <div className="absolute top-4 right-4 z-[100] flex items-center gap-2">
                            <a
                                href={policyUrl}
                                target="_blank"
                                rel="noreferrer"
                                title="Mở tab mới"
                                className="p-2.5 bg-white/90 backdrop-blur-md text-slate-500 hover:text-blue-600 rounded-xl border border-slate-200 shadow-sm transition-all active:scale-95"
                            >
                                <ExternalLink size={18} />
                            </a>
                            <button
                                onClick={() => {
                                    setShowPdfModal(false);
                                    setIsPdfLoading(true); // Reset trạng thái loading
                                }}
                                className="p-2.5 bg-slate-900/90 backdrop-blur-md text-white hover:bg-red-500 rounded-xl shadow-lg transition-all active:scale-95"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex-1 bg-slate-50 relative overflow-hidden">
                            {policyUrl ? (
                                <div className="w-full h-full overflow-hidden">
                                    <object
                                        data={`${policyUrl}#navpanes=0&view=FitH&toolbar=0`}
                                        type="application/pdf"
                                        style={{
                                            width: '100%',
                                            height: 'calc(100% + 40px)',
                                            marginTop: '-40px'
                                        }}
                                        className="relative z-10"
                                        onLoad={() => setIsPdfLoading(false)}
                                    >
                                        <iframe
                                            src={`${policyUrl}#navpanes=0&view=FitH&toolbar=0`}
                                            className="w-full h-full border-none"
                                            title="Tài liệu phụ lục"
                                            onLoad={() => setIsPdfLoading(false)}
                                        />
                                    </object>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-white">
                                    <p className="text-sm font-medium uppercase tracking-widest opacity-50">Tài liệu không tồn tại</p>
                                </div>
                            )}
                            {isPdfLoading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center z-[20] bg-slate-50">
                                    <Loader2 size={32} className="animate-spin text-blue-600 mb-2" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">
                                        Đang chuẩn bị tài liệu...
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const InfoBox = ({ label, value, highlight, isComponent }) => (
    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{label}</p>
        {isComponent ? value : <p className={`font-black text-sm ${highlight || 'text-slate-700'}`}>{value}</p>}
    </div>
);

export default PayoutList;