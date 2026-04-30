import React from "react";
import {
    X, CreditCard, Landmark, Clock,
    FileText, ArrowRight, ShieldCheck, Copy
} from "lucide-react";

const TransactionDetail = ({ isOpen, onClose, txnId }) => {
    if (!isOpen) return null;

    // Giả lập dữ liệu chi tiết (Trong thực tế sẽ fetch theo txnId)
    const detailData = {
        amount: 12500000,
        tax: 1250000,
        fee: 150000,
        total: 13900000,
        provider: "Cổng thanh toán Stripe",
        refId: "STR_PAY_77219902X",
        bookingCode: "DP-9921"
    };

    return (
        <>
            {/* Lớp nền mờ (Backdrop) */}
            <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Khung Drawer trượt từ phải sang */}
            <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                {/* Tiêu đề Drawer */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Chi tiết giao dịch</h3>
                        <p className="text-xs text-blue-600 font-mono font-medium tracking-tight">{txnId}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto h-[calc(100vh-85px)] custom-scrollbar">

                    {/* Biểu ngữ trạng thái */}
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-4 mb-8">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-200">
                            <ShieldCheck size={22} />
                        </div>
                        <div>
                            <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider mb-0.5">Trạng thái đối soát</p>
                            <p className="text-emerald-800 font-medium text-sm leading-snug">
                                Giao dịch đã được xác nhận và thanh toán thành công qua cổng liên kết.
                            </p>
                        </div>
                    </div>

                    {/* Tóm tắt tài chính */}
                    <div className="space-y-4 mb-8">
                        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-4">Thông tin tài chính</h4>

                        <div className="flex justify-between items-center py-1 text-sm text-gray-600">
                            <span>Số tiền tạm tính</span>
                            <span className="font-medium">{detailData.amount.toLocaleString('vi-VN')} đ</span>
                        </div>

                        <div className="flex justify-between items-center py-1 text-sm text-gray-600">
                            <span>Thuế GTGT (10%)</span>
                            <span className="font-medium">{detailData.tax.toLocaleString('vi-VN')} đ</span>
                        </div>

                        <div className="flex justify-between items-center py-1 text-sm text-gray-600">
                            <span>Phí dịch vụ hệ thống</span>
                            <span className="font-medium">{detailData.fee.toLocaleString('vi-VN')} đ</span>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                            <span className="font-bold text-gray-900">Tổng tiền thực nhận</span>
                            <span className="text-xl font-extrabold text-blue-600">
                                {detailData.total.toLocaleString('vi-VN')} <small className="text-xs font-normal">VNĐ</small>
                            </span>
                        </div>
                    </div>

                    {/* Dữ liệu Cổng thanh toán */}
                    <div className="bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-100">
                        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Dữ liệu Cổng thanh toán</h4>
                        <div className="space-y-5">
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1.5">Đơn vị cung cấp</p>
                                <div className="flex items-center gap-2.5 font-semibold text-sm text-gray-800">
                                    <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600">
                                        <Landmark size={14} />
                                    </div>
                                    {detailData.provider}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1.5">Mã tham chiếu hệ thống (Ref ID)</p>
                                <div className="flex items-center justify-between font-mono text-xs bg-white border border-gray-200 px-3 py-2.5 rounded-xl shadow-sm">
                                    <span className="text-gray-600 truncate mr-2">{detailData.refId}</span>
                                    <button className="text-blue-500 hover:text-blue-700 transition-colors">
                                        <Copy size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tiến trình xử lý (Timeline) */}
                    <div className="space-y-7 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-gray-200 mb-10">
                        <div className="relative pl-9">
                            <div className="absolute left-0 w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-blue-100">
                                <Clock size={10} className="text-blue-600" />
                            </div>
                            <p className="text-xs font-bold text-gray-900">Khởi tạo giao dịch</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">02/02/2026 - 10:30:05</p>
                        </div>

                        <div className="relative pl-9">
                            <div className="absolute left-0 w-6 h-6 bg-emerald-50 rounded-full flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-emerald-100">
                                <CreditCard size={10} className="text-emerald-600" />
                            </div>
                            <p className="text-xs font-bold text-gray-900">Thanh toán hoàn tất</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">02/02/2026 - 10:31:42</p>
                            <p className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded mt-1 inline-block font-medium">Đã ghi nhận công nợ</p>
                        </div>
                    </div>

                    {/* Nút hành động */}
                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-2 py-3.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200">
                            <FileText size={16} /> Xuất hóa đơn
                        </button>
                        <button className="flex items-center justify-center gap-2 py-3.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 hover:border-gray-300 transition-all">
                            Xem đặt phòng <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TransactionDetail;