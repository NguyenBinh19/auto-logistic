import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    FileText, CheckCircle, AlertCircle, Download,
    ArrowLeft, History, Search, ExternalLink, Printer,
    ChevronLeft, ChevronRight, Loader2, X
} from "lucide-react";
import StatementHeader from '@/components/hotel/finance/StatementHeader';
import { payoutService } from '@/services/payout.service';
import { pdfDocumentService } from "@/services/pdf.service.js";
import { toast } from 'react-hot-toast';
const BANK_LIST = [
    { code: "VCB", name: "Vietcombank" },
    { code: "TCB", name: "Techcombank" },
    { code: "ACB", name: "ACB" },
    { code: "BIDV", name: "BIDV" },
    { code: "VTB", name: "VietinBank" },
    { code: "MB", name: "MB Bank" },
    { code: "VPB", name: "VPBank" },
    { code: "TPB", name: "TPBank" },
    { code: "STB", name: "Sacombank" }
];
const STATUS_MAP = {
    PENDING_CONFIRMATION: { label: "Chờ xác nhận", color: "bg-amber-100 text-amber-700" },
    APPROVED: { label: "Đã xác nhận", color: "bg-emerald-100 text-emerald-700" },
    PROCESSING: { label: "Đang xử lý", color: "bg-blue-100 text-blue-700" },
    PAID: { label: "Đã thanh toán", color: "bg-green-100 text-green-700" },
    DISPUTED: { label: "Khiếu nại", color: "bg-red-100 text-red-700" },
    ROLLOVER: { label: "Chuyển kỳ sau", color: "bg-amber-100 text-amber-700" },
    MERGED: { label: "Đã gộp kỳ mới", color: "bg-slate-100 text-slate-500" },
};

const formatVN = (val) => val != null ? new Intl.NumberFormat('vi-VN').format(val) : '0';

// ===================== STATEMENT LIST VIEW =====================
const StatementListView = ({ hotelId, onSelectStatement }) => {
    const [statements, setStatements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [policyUrl, setPolicyUrl] = useState("");
    const [isPdfLoading, setIsPdfLoading] = useState(true);

    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                const pdfRes = await pdfDocumentService.getAllPdfs();
                if (pdfRes?.result) {
                    const policyDoc = pdfRes.result.find(doc => {
                        const title = (doc.title || "").toLowerCase();
                        return title.includes("doanh thu") && title.includes("thanh toán");
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

    useEffect(() => {
        const fetchStatements = async () => {
            setLoading(true);
            try {
                const res = await payoutService.getHotelStatements(hotelId);
                if (res.code === 1000) {
                    setStatements(res.result || []);
                }
            } catch (error) {
                console.error("Lỗi tải danh sách đối soát:", error);
                toast.error("Không thể tải danh sách đối soát");
            } finally {
                setLoading(false);
            }
        };
        if (hotelId) fetchStatements();
    }, [hotelId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    if (statements.length === 0) {
        return (
            <div className="text-center py-20 text-slate-400">
                <FileText size={48} className="mx-auto mb-4 opacity-40" />
                <p className="font-bold">Chưa có bảng đối soát nào</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase text-[10px] tracking-widest">
                    <History size={16} className="text-blue-600" /> Tất cả các kỳ đối soát ({statements.length})
                </h3>
                {/* NÚT XEM CHÍNH SÁCH MỚI */}
                <button
                    onClick={() => {
                        if (!policyUrl) {
                            toast.error("Đang tải hoặc không tìm thấy file PDF!");
                            return;
                        }
                        setShowPdfModal(true);
                    }}
                    className="flex items-center gap-2 text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-all uppercase"
                >
                    <FileText size={14} /> Phụ lục thanh toán
                </button>
            </div>
            <table className="w-full text-left text-sm border-collapse">
                <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="px-8 py-4">Mã</th>
                        <th className="px-8 py-4">Kỳ</th>
                        <th className="px-8 py-4">Bookings</th>
                        <th className="px-8 py-4 text-right">Thực nhận</th>
                        <th className="px-8 py-4">Trạng thái</th>
                        <th className="px-8 py-4"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {statements.map((stmt) => {
                        const statusInfo = STATUS_MAP[stmt.status] || { label: stmt.status, color: "bg-slate-100 text-slate-600" };
                        return (
                            <tr key={stmt.statementId} className="hover:bg-slate-50/30 transition-colors group">
                                <td className="px-8 py-4 font-black text-blue-600">{stmt.statementCode}</td>
                                <td className="px-8 py-4 font-bold text-slate-700">
                                    {stmt.periodStart} ~ {stmt.periodEnd}
                                </td>
                                <td className="px-8 py-4 font-bold text-slate-600">{stmt.totalBookings}</td>
                                <td className="px-8 py-4 text-right font-black text-slate-900">
                                    {formatVN(stmt.netPayout)} <span className="text-xs text-slate-400">d</span>
                                </td>
                                <td className="px-8 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${statusInfo.color}`}>
                                        {statusInfo.label}
                                    </span>
                                </td>
                                <td className="px-8 py-4 text-right">
                                    <button
                                        onClick={() => onSelectStatement(stmt.statementId)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all text-xs font-bold"
                                    >
                                        <ExternalLink size={14} />
                                        <span>Chi tiết</span>
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {/* MODAL PDF CHÍNH SÁCH THANH TOÁN */}
            {showPdfModal && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-0 md:p-8 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-5xl h-full md:h-[94vh] md:rounded-[32px] overflow-hidden shadow-2xl flex flex-col relative animate-in zoom-in duration-300">
                        {/* Header Modal - Nút điều hướng */}
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
                                    setIsPdfLoading(true);
                                }}
                                className="p-2.5 bg-slate-900/90 backdrop-blur-md text-white hover:bg-red-500 rounded-xl shadow-lg transition-all active:scale-95"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Nội dung PDF */}
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
                                            title="Chính sách thanh toán"
                                            onLoad={() => setIsPdfLoading(false)}
                                        />
                                    </object>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                    <FileText size={40} className="mb-2 opacity-20" />
                                    <p className="text-sm font-medium">Đường dẫn tài liệu không hợp lệ.</p>
                                </div>
                            )}

                            {isPdfLoading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center z-[20] bg-slate-50">
                                    <Loader2 size={32} className="animate-spin text-blue-600 mb-2" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">
                                        Đang tải phụ lục thanh toán...
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

// ===================== STATEMENT DETAIL VIEW =====================
const StatementDetailView = ({ statementId, onBack }) => {
    const [statement, setStatement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const [bankInfo, setBankInfo] = useState({
        bankName: "",
        bankAccountHolder: "",
        bankAccountNumber: ""
    });

    const fetchDetail = useCallback(async () => {
        setLoading(true);
        try {
            const res = await payoutService.getHotelStatementDetail(statementId);
            if (res.code === 1000) {
                setStatement(res.result);
            }
        } catch (error) {
            console.error("Lỗi tải chi tiết đối soát:", error);
            toast.error("Không thể tải chi tiết đối soát");
        } finally {
            setLoading(false);
        }
    }, [statementId]);

    useEffect(() => {
        if (statementId) fetchDetail();
    }, [statementId, fetchDetail]);
    useEffect(() => {
        if (statement) {
            setBankInfo({
                bankName: statement.bankName || "",
                bankAccountHolder: statement.bankAccountHolder || "",
                bankAccountNumber: statement.bankAccountNumber || ""
            });
        }
    }, [statement]);
    const lineItems = statement?.lineItems || [];

    const filteredData = useMemo(() => {
        return lineItems.filter(item =>
            (item.bookingCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.agencyName || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, lineItems]);
    const [errors, setErrors] = useState({});
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const currentTableData = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * rowsPerPage;
        const lastPageIndex = firstPageIndex + rowsPerPage;
        return filteredData.slice(firstPageIndex, lastPageIndex);
    }, [currentPage, filteredData]);

    const handleConfirm = async () => {
        const newErrors = {};

        if (!bankInfo.bankName) {
            newErrors.bankName = "Chọn ngân hàng";
        }

        if (!bankInfo.bankAccountHolder) {
            newErrors.bankAccountHolder = "Nhập chủ tài khoản";
        }

        if (!bankInfo.bankAccountNumber) {
            newErrors.bankAccountNumber = "Nhập số tài khoản";
        } else if (!/^[0-9]{8,20}$/.test(bankInfo.bankAccountNumber)) {
            newErrors.bankAccountNumber = "Số tài khoản phải từ 8-20 chữ số";
        }
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setIsSubmitting(true);

        try {
            const res = await payoutService.confirmPayout(statementId, bankInfo);

            if (res.code === 1000) {
                toast.success("Xác nhận đối soát thành công!");
                setStatement(res.result);
                setShowConfirmModal(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Xác nhận thất bại");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDispute = async () => {
        const reason = window.prompt("Nhập lý do khiếu nại:");
        if (!reason) return;
        setIsSubmitting(true);
        try {
            const res = await payoutService.disputePayout(statementId, "OTHER", reason);
            if (res.code === 1000) {
                toast.success("Gửi đơn khiếu nại thành công!");
                setStatement(res.result);
            }
        } catch (error) {
            console.error("Lỗi gửi khiếu nại:", error);
            toast.error(error.response?.data?.message || "Gửi đơn khiếu nại thất bại");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    if (!statement) {
        return <div className="text-center py-20 text-slate-400">Không tìm thấy dữ liệu đối soát</div>;
    }

    const status = statement.status;
    const isPending = status === "PENDING_CONFIRMATION";
    const isPaid = status === "PAID";
    const isRollover = status === "ROLLOVER";
    const isMerged = status === "MERGED";
    const getCurrentCycleNet = (statement) => {
        const grossRevenue = Number(statement?.grossRevenue || 0);
        const totalCommission = Number(statement?.totalCommission || 0);
        const totalRefunds = Number(statement?.totalRefunds || 0);
        const adjustments = Number(statement?.adjustments || 0);

        return grossRevenue - totalCommission - totalRefunds + adjustments;
    };

    const currentCycleNet = getCurrentCycleNet(statement);
    const carriedForwardAmount = Number(statement?.carriedForwardAmount || 0);
    const totalPayment = Number(statement?.netPayout || 0);
    return (
        <>
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter">Đối soát</h1>
                        <span className="text-xs text-slate-400 font-bold">{statement.statementCode} | {statement.periodStart} ~ {statement.periodEnd}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    {/* <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs"><Printer size={14} /></button>
                    <button className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center gap-2">
                        <Download size={14} /> EXCEL
                    </button> */}
                </div>
            </div>

            <StatementHeader
                gross={statement.grossRevenue || 0}
                commission={statement.totalCommission || 0}
                refunds={statement.totalRefunds || 0}
                adjustments={-Number(statement.totalRefunds || 0)}
                currentCycleNet={currentCycleNet}
                carriedForward={carriedForwardAmount}
                net={totalPayment}
            />

            {isPaid && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-5">
                    <h3 className="text-sm font-black text-emerald-700 uppercase tracking-wider mb-3">Thông tin chuyển khoản</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="bg-white rounded-2xl p-4 border border-emerald-100">
                            <p className="text-[11px] font-bold text-slate-500 uppercase">Mã giao dịch</p>
                            <p className="font-black text-slate-800 mt-1">{statement.bankReference || "-"}</p>
                        </div>
                        <div className="bg-white rounded-2xl p-4 border border-emerald-100">
                            <p className="text-[11px] font-bold text-slate-500 uppercase">Người chi trả</p>
                            <p className="font-black text-slate-800 mt-1">{statement.paidBy || "-"}</p>
                        </div>
                        <div className="bg-white rounded-2xl p-4 border border-emerald-100">
                            <p className="text-[11px] font-bold text-slate-500 uppercase">Người nhận</p>
                            <p className="font-black text-slate-800 mt-1">{statement.bankAccountHolder || "-"}</p>
                            <p className="text-xs text-slate-500 mt-1">{statement.bankName || "-"} - {statement.bankAccountNumber || "-"}</p>
                        </div>
                        <div className="bg-white rounded-2xl p-4 border border-emerald-100">
                            <p className="text-[11px] font-bold text-slate-500 uppercase">Thời gian chuyển</p>
                            <p className="font-black text-slate-800 mt-1">
                                {statement.paidAt ? new Date(statement.paidAt).toLocaleString("vi-VN") : "-"}
                            </p>
                        </div>
                    </div>

                    {statement.paymentProofUrl && (
                        <a
                            href={statement.paymentProofUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center mt-4 px-4 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-700 text-xs font-black uppercase"
                        >
                            <ExternalLink size={14} className="mr-2" /> Xem ảnh minh chứng
                        </a>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase text-[10px] tracking-widest">
                        <FileText size={16} className="text-blue-600" /> Danh sách giao dịch ({filteredData.length})
                    </h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            type="text"
                            placeholder="Tìm mã đặt,đại lý..."
                            className="pl-10 pr-4 py-2 bg-slate-50 rounded-full text-xs outline-none w-64 focus:bg-white border border-transparent focus:border-blue-100 transition-all"
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                </div>

                <table className="w-full text-left text-sm border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <th className="px-8 py-4">Mã đặt</th>
                            <th className="px-8 py-4">Đại lý</th>
                            <th className="px-8 py-4">Check-in</th>
                            <th className="px-8 py-4">Đêm</th>
                            <th className="px-8 py-4 text-right">Tổng (đ)</th>
                            <th className="px-8 py-4 text-right">Hoa hồng (đ)</th>
                            <th className="px-3 py-2 text-right leading-tight">
                                <div>Hoàn trả</div>
                                <div className="text-[10px] text-slate-400 font-normal">
                                    (cancel booking)
                                </div>
                            </th>
                            <th className="px-8 py-4 text-right">Thực nhận (đ)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {currentTableData.map((item) => (
                            <tr key={item.lineItemId} className="hover:bg-slate-50/30 transition-colors">
                                <td className="px-8 py-4 font-black text-blue-600">{item.bookingCode}</td>
                                <td className="px-8 py-4 font-bold text-slate-700">{item.agencyName || '-'}</td>
                                <td className="px-8 py-4 text-slate-600">{item.checkInDate}</td>
                                <td className="px-8 py-4 text-slate-600">{item.roomNights}</td>
                                <td className="px-8 py-4 text-right font-bold text-slate-900">{formatVN(item.grossAmount)}</td>
                                <td className="px-8 py-4 text-right font-bold text-red-500">-{formatVN(item.commissionAmount)}</td>
                                <td className="px-8 py-4 text-right font-bold text-red-500">-{formatVN(item.refundAmount)}</td>
                                <td className="px-8 py-4 text-right font-black text-slate-900">{formatVN(item.netAmount)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-8 py-4 border-t border-slate-50 flex justify-between items-center bg-white">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Trang {currentPage} / {totalPages}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 border border-slate-100 rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-all"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 border border-slate-100 rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-all"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Action Bar */}
                <div className="bg-slate-900 p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng cộng thực nhận</span>
                        <span className="text-3xl font-black text-white">
                            {formatVN(statement.netPayout)} <span className="text-sm font-normal text-slate-500 italic">VND</span>
                        </span>
                    </div>

                    <div className="flex gap-3">
                        {isMerged ? (
                            <div className="flex items-center gap-3 font-bold text-xs px-6 py-3 rounded-2xl border text-slate-400 bg-slate-500/10 border-slate-500/20">
                                <CheckCircle size={16} /> ĐÃ GỘP VÀO KỲ MỚI
                            </div>
                        ) : isRollover ? (
                            <div className="flex items-center gap-3 font-bold text-xs px-6 py-3 rounded-2xl border text-amber-400 bg-amber-500/10 border-amber-500/20">
                                <AlertCircle size={16} /> CHUYỂN KỲ SAU
                            </div>
                        ) : isPending ? (
                            <>
                                <button
                                    onClick={handleDispute}
                                    disabled={isSubmitting}
                                    className="px-6 py-3 border border-slate-700 text-slate-300 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-50"
                                >
                                    Khiếu nại
                                </button>
                                <button
                                    onClick={() => setShowConfirmModal(true)}
                                    disabled={isSubmitting}
                                    className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-500 shadow-xl shadow-blue-900/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                                    XÁC NHẬN
                                </button>
                            </>
                        ) : (
                            <div className={`flex items-center gap-3 font-bold text-xs px-6 py-3 rounded-2xl border ${status === "DISPUTED"
                                ? "text-red-400 bg-red-500/10 border-red-500/20"
                                : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                                }`}>
                                {status === "DISPUTED" ? (
                                    <><AlertCircle size={16} /> ĐÃ KHIẾU NẠI</>
                                ) : (
                                    <><CheckCircle size={16} /> ĐÃ XÁC NHẬN {statement.confirmedAt ? ` (${new Date(statement.confirmedAt).toLocaleDateString('vi-VN')})` : ''}</>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
                        <h2 className="text-lg font-black">Nhập thông tin ngân hàng</h2>

                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">
                                Ngân hàng <span className="text-red-500">*</span>
                            </label>

                            <select
                                className="w-full p-3 border rounded-xl bg-white"
                                value={bankInfo.bankName}
                                onChange={(e) =>
                                    setBankInfo(prev => ({ ...prev, bankName: e.target.value }))
                                }
                            >
                                <option value="">-- Chọn ngân hàng --</option>
                                {BANK_LIST.map(bank => (
                                    <option key={bank.code} value={bank.name}>
                                        {bank.name}
                                    </option>
                                ))}
                            </select>

                            {errors.bankName && <p className="text-red-500 text-xs">{errors.bankName}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">
                                Chủ tài khoản <span className="text-red-500">*</span>
                            </label>

                            <input
                                type="text"
                                className="w-full p-3 border rounded-xl"
                                value={bankInfo.bankAccountHolder}
                                onChange={(e) =>
                                    setBankInfo(prev => ({ ...prev, bankAccountHolder: e.target.value }))
                                }
                            />

                            {errors.bankAccountHolder && <p className="text-red-500 text-xs">{errors.bankAccountHolder}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">
                                Số tài khoản <span className="text-red-500">*</span>
                            </label>

                            <input
                                type="text"
                                className="w-full p-3 border rounded-xl"
                                value={bankInfo.bankAccountNumber}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "");
                                    setBankInfo(prev => ({ ...prev, bankAccountNumber: value }));
                                }}
                            />

                            {errors.bankAccountNumber && <p className="text-red-500 text-xs">{errors.bankAccountNumber}</p>}
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="px-4 py-2 rounded-xl border"
                            >
                                Hủy
                            </button>

                            <button
                                onClick={handleConfirm}
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-blue-600 text-white rounded-xl flex items-center gap-2"
                            >
                                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// ===================== MAIN COMPONENT =====================
const SettlementDetail = ({ hotelId: propHotelId }) => {
    const [selectedStatementId, setSelectedStatementId] = useState(null);

    // Get hotelId from props or localStorage
    const hotelId = useMemo(() => {
        if (propHotelId) return propHotelId;
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            return user?.hotelId || null;
        } catch { return null; }
    }, [propHotelId]);

    return (
        <div className="p-8 bg-[#f8fafc] min-h-screen font-sans text-slate-800">
            <div className="max-w-7xl mx-auto space-y-6">
                {!selectedStatementId ? (
                    <>
                        <div className="flex items-center gap-4 mb-4">
                            <h1 className="text-2xl font-black uppercase tracking-tighter">Đối Soát</h1>
                        </div>
                        <StatementListView hotelId={hotelId} onSelectStatement={setSelectedStatementId} />
                    </>
                ) : (
                    <StatementDetailView
                        statementId={selectedStatementId}
                        onBack={() => setSelectedStatementId(null)}
                    />
                )}
            </div>
        </div>

    );
};

export default SettlementDetail;