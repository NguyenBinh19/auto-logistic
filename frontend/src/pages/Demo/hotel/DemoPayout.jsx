import { useState } from "react";
import { ChevronDown, CheckCircle, History, ExternalLink } from "lucide-react";
import { DEMO_PAYOUT_STATEMENTS, DEMO_PAYOUT_DETAIL } from "../mockData";

const formatCurrency = (n) => new Intl.NumberFormat("vi-VN").format(n);

const STATUS_MAP = {
    PENDING_CONFIRMATION: { label: "Chờ xác nhận", color: "bg-amber-100 text-amber-700" },
    APPROVED: { label: "Đã xác nhận", color: "bg-emerald-100 text-emerald-700" },
    PROCESSING: { label: "Đang xử lý", color: "bg-blue-100 text-blue-700" },
    PAID: { label: "Đã thanh toán", color: "bg-green-100 text-green-700" },
};

const DemoPayout = () => {
    // 1. CHỈNH SỬA: Đưa dữ liệu vào state để có thể cập nhật trạng thái
    const [statements, setStatements] = useState(DEMO_PAYOUT_STATEMENTS);
    const [selectedId, setSelectedId] = useState(null);
    const [confirmed, setConfirmed] = useState(false);

    // Tính toán dựa trên state mới
    const totalPaid = statements.filter((s) => s.status === "PAID").reduce((sum, s) => sum + s.netPayout, 0);
    const totalPending = statements.filter((s) => s.status !== "PAID").reduce((sum, s) => sum + s.netPayout, 0);

    // 2. CHỈNH SỬA: Hàm xác nhận cập nhật trực tiếp vào danh sách
    const handleConfirm = (id) => {
        setStatements(prev => 
            prev.map(stmt => 
                stmt.id === id ? { ...stmt, status: 'APPROVED' } : stmt
            )
        );
        setConfirmed(true);
        setTimeout(() => setConfirmed(false), 3000);
    };

    // Detail view
    if (selectedId) {
        // Lấy dữ liệu từ state 'statements' thay vì hằng số mockData
        const stmt = statements.find((s) => s.id === selectedId);
        const statusInfo = STATUS_MAP[stmt?.status] || { label: stmt?.status, color: "bg-slate-100 text-slate-600" };

        const platformCommission = stmt.totalCommission;
        const tax = Math.round(stmt.grossRevenue * 0.05);
        const detailNetPayout = stmt.grossRevenue - platformCommission - tax;

        return (
            <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-900">
                <div className="max-w-[1400px] mx-auto">
                    <button onClick={() => setSelectedId(null)} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 mb-4 transition-colors">
                        <ChevronDown size={16} className="rotate-90" /> Quay lại danh sách
                    </button>

                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8 mb-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-black text-slate-900">{stmt?.periodLabel}</h2>
                                <p className="text-xs text-slate-400 font-medium mt-1">{stmt?.statementCode}</p>
                            </div>
                            {/* Label trạng thái này sẽ tự động đổi màu/chữ khi state thay đổi */}
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${statusInfo.color}`}>{statusInfo.label}</span>
                        </div>

                        <div className="grid grid-cols-4 gap-6">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng doanh thu</p>
                                <p className="text-lg font-black text-slate-900">{formatCurrency(stmt.grossRevenue)} <span className="text-xs text-slate-400">đ</span></p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hoa hồng nền tảng</p>
                                <p className="text-lg font-black text-red-500">-{formatCurrency(platformCommission)} <span className="text-xs text-slate-400">đ</span></p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Thuế & phí</p>
                                <p className="text-lg font-black text-red-500">-{formatCurrency(tax)} <span className="text-xs text-slate-400">đ</span></p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Thực nhận</p>
                                <p className="text-lg font-black text-green-600">{formatCurrency(detailNetPayout)} <span className="text-xs text-slate-400">đ</span></p>
                            </div>
                        </div>

                        {stmt?.status === "PENDING_CONFIRMATION" && (
                            <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                                <p className="text-sm text-slate-500">Vui lòng xác nhận thông tin đối soát để chúng tôi tiến hành thanh toán.</p>
                                {/* Truyền stmt.id vào hàm handleConfirm */}
                                <button onClick={() => handleConfirm(stmt.id)} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 transition-colors">Xác nhận đối soát (Bản Demo)</button>
                            </div>
                        )}
                    </div>

                    {confirmed && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 mb-6">
                            <CheckCircle size={20} className="text-green-600" />
                            <span className="text-sm font-bold text-green-700">Xác nhận đối soát thành công!</span>
                        </div>
                    )}

                    {/* Danh sách booking giữ nguyên... */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                        <div className="p-6 border-b border-slate-50">
                            <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase text-[10px] tracking-widest">
                                Chi tiết các đơn đặt phòng ({DEMO_PAYOUT_DETAIL.bookings.length})
                            </h3>
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <th className="px-8 py-4">Mã đặt phòng</th>
                                    <th className="px-8 py-4">Khách hàng</th>
                                    <th className="px-8 py-4 text-center">Chu kỳ</th>
                                    <th className="px-8 py-4 text-right">Tổng tiền</th>
                                    <th className="px-8 py-4 text-right">Hoa hồng</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {DEMO_PAYOUT_DETAIL.bookings.map((b, i) => (
                                    <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-8 py-4 font-black text-blue-600">{b.bookingCode}</td>
                                        <td className="px-8 py-4 font-bold text-slate-700">{b.guestName}</td>
                                        <td className="px-8 py-4 text-center">
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${b.paidOnTime ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                                                {b.paidOnTime ? "Đúng kỳ" : "Sau kỳ"}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4 text-right font-black text-slate-900">{formatCurrency(b.amount)} <span className="text-xs text-slate-400">đ</span></td>
                                        <td className="px-8 py-4 text-right font-bold text-red-500">-{formatCurrency(b.commission)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // List view
    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-900">
            <div className="max-w-[1400px] mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Bảng kê thanh toán</h1>
                    <p className="text-sm text-gray-500">Theo dõi trạng thái thanh toán và chi tiết các kỳ đối soát (Kỳ: 26 tháng trước - 25 tháng sau)</p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tổng đã thanh toán</p>
                        <p className="text-2xl font-black text-green-600">{formatCurrency(totalPaid)} <span className="text-sm text-slate-400">đ</span></p>
                    </div>
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Đang chờ xử lý</p>
                        <p className="text-2xl font-black text-amber-600">{formatCurrency(totalPending)} <span className="text-sm text-slate-400">đ</span></p>
                    </div>
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Số kỳ thanh toán</p>
                        <p className="text-2xl font-black text-slate-800">{statements.length}</p>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                    <div className="p-6 border-b border-slate-50">
                        <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase text-[10px] tracking-widest">
                            <History size={16} className="text-blue-600" /> Tất cả các kỳ đối soát ({statements.length})
                        </h3>
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
                                    <tr key={stmt.id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-8 py-4 font-black text-blue-600">{stmt.statementCode}</td>
                                        <td className="px-8 py-4 font-bold text-slate-700">{stmt.periodLabel}</td>
                                        <td className="px-8 py-4 font-bold text-slate-600">{stmt.totalBookings}</td>
                                        <td className="px-8 py-4 text-right font-black text-slate-900">{formatCurrency(stmt.netPayout)} <span className="text-xs text-slate-400">đ</span></td>
                                        <td className="px-8 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${statusInfo.color}`}>{statusInfo.label}</span>
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            <button onClick={() => setSelectedId(stmt.id)} className="text-slate-300 hover:text-blue-600 transition-colors">
                                                <ExternalLink size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DemoPayout;