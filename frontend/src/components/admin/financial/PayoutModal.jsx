import React from 'react';
import { X, Zap, Info, CheckCircle2 } from "lucide-react";

const PayoutModal = ({ isOpen, onClose, data }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-end md:items-center justify-center p-0 md:p-4 transition-all">
            {/* Modal Container: Full màn hình trên mobile, Bo tròn ở desktop */}
            <div className="bg-white w-full max-w-2xl rounded-t-[2rem] md:rounded-[2rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom md:zoom-in duration-300 max-h-[95vh] md:max-h-[90vh] flex flex-col">

                {/* Header: Cố định */}
                <div className="p-5 md:p-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                    <div>
                        <h2 className="text-lg md:text-xl font-black text-slate-800">Xử lý Chi tiền</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider md:hidden">Hệ thống Payout Auto</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                    >
                        <X size={24}/>
                    </button>
                </div>

                {/* Body: Cho phép cuộn nếu màn hình quá nhỏ */}
                <div className="p-5 md:p-8 overflow-y-auto custom-scrollbar flex-1">

                    {/* Info Grid: 1 cột trên mobile, 2 cột trên md trở lên */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Mã lệnh</p>
                            <p className="font-black text-slate-700 truncate">{data?.id || "N/A"}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Số tiền</p>
                            <p className="font-black text-blue-600 text-lg md:text-base">
                                {data?.net?.toLocaleString() || 0} <span className="text-xs font-medium">đ</span>
                            </p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Người thụ hưởng</p>
                            <p className="font-bold text-slate-700 text-sm md:text-base">{data?.hotel || "N/A"}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Ngân hàng</p>
                            <p className="font-bold text-slate-700 text-sm md:text-base">{data?.bank || "N/A"}</p>
                        </div>
                    </div>

                    {/* Tabs: Cuộn ngang trên mobile nếu cần */}
                    <div className="flex border-b border-slate-100 mb-6 overflow-x-auto no-scrollbar whitespace-nowrap">
                        <button className="px-4 md:px-6 py-3 border-b-2 border-blue-600 text-blue-600 font-bold text-xs md:text-sm">
                            Auto-Payout (Cổng tự động)
                        </button>
                        <button className="px-4 md:px-6 py-3 text-slate-400 font-bold text-xs md:text-sm hover:text-slate-600 transition-colors">
                            Manual (Thủ công)
                        </button>
                    </div>

                    {/* Auto Payout Content */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-blue-600 font-black text-sm uppercase tracking-tighter">
                            <Zap size={16} fill="currentColor"/> Cổng thanh toán trực tuyến
                        </div>

                        <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">
                            Hệ thống sẽ gọi lệnh chuyển <b>{data?.net?.toLocaleString()} đ</b> trực tiếp tới STK <b>{data?.bankNo}</b>.
                            <span className="hidden md:inline"> Vui lòng kiểm tra kỹ thông tin trước khi xác nhận.</span>
                        </p>

                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-2xl flex gap-3 shadow-sm shadow-blue-100/50">
                            <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[11px] font-black text-blue-800 uppercase">Phí giao dịch:</p>
                                <p className="text-xs text-blue-600 font-bold">11.000 đ <span className="font-medium opacity-70">(Trừ vào tài khoản Sàn)</span></p>
                            </div>
                        </div>

                        <div className="bg-emerald-50 border-l-4 border-emerald-400 p-4 rounded-r-2xl flex gap-3 shadow-sm shadow-emerald-100/50">
                            <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                            <div className="text-[11px] md:text-xs text-emerald-700 font-bold leading-relaxed space-y-1">
                                <p>• Xử lý tức thì (Real-time 24/7)</p>
                                <p>• Đồng bộ trạng thái tự động lên Dashboard</p>
                                <p>• Bảo mật theo tiêu chuẩn ngân hàng</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Action: Cố định ở đáy */}
                <div className="p-5 md:p-6 bg-slate-50/50 border-t border-slate-100 shrink-0">
                    <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-200 flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all text-sm md:text-base">
                        <Zap size={20} fill="currentColor" /> XÁC NHẬN CHUYỂN NGAY
                    </button>
                    {/* Chỉ hiện ở mobile để người dùng biết có thể kéo xuống */}
                    <p className="text-center text-[10px] text-slate-400 font-bold mt-3 md:hidden uppercase tracking-widest italic">
                        Thao tác này không thể hoàn tác
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PayoutModal;