import React from 'react';
import { Check, RefreshCw, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate, useLocation } from "react-router-dom"; // Thêm useLocation

const KYCSuccessView = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Kiểm tra xem có phải từ luồng Update chuyển sang không
    // (Giả sử trang Upload hồ sơ truyền state: { isUpdate: true })
    const isUpdateMode = location.state?.isUpdate || false;

    const handleAction = () => {
        if (isUpdateMode) {
            // Nếu là Update, quay về trang quản lý trạng thái KYC
            navigate("/kyc/status");
        } else {
            // Nếu là đăng ký mới, có thể về trang chủ hoặc landing page tùy bạn
            navigate("/");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
            <div className="bg-white w-full max-w-[540px] rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">

                {/* Header Section */}
                <div className="bg-[#f0f7ff] p-8 pb-10 flex flex-col items-center text-center relative">
                    <div className="relative mb-6">
                        <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center overflow-hidden border border-blue-50">
                            <ShieldCheck className="w-12 h-12 text-blue-600" />
                        </div>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#ffb800] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap shadow-sm border border-white">
                            Đang xét duyệt
                        </div>
                    </div>

                    <h2 className="text-[22px] font-bold text-[#1e293b] mb-3 leading-tight">
                        {isUpdateMode ? "Cập nhật hồ sơ thành công!" : "Hồ sơ đã được gửi thành công!"}
                    </h2>
                    <p className="text-[13px] text-slate-500 leading-relaxed max-w-[400px]">
                        Hệ thống đã ghi nhận thông tin thay đổi. Đội ngũ quản trị sẽ tiến hành thẩm định lại hồ sơ của bạn.
                    </p>
                </div>

                {/* Timeline Section */}
                <div className="p-8 pt-10">
                    <h3 className="text-center font-bold text-slate-700 mb-8 text-[15px]">
                        Tiến trình xử lý hồ sơ
                    </h3>

                    <div className="max-w-[320px] mx-auto space-y-0">
                        <TimelineItem
                            status="done"
                            label={isUpdateMode ? "Gửi yêu cầu chỉnh sửa" : "Đăng ký tài khoản"}
                        />
                        <TimelineItem
                            status="done"
                            label="Tiếp nhận hồ sơ"
                        />
                        <TimelineItem
                            status="active"
                            label="Admin đang thẩm định"
                            sub="Dự kiến hoàn tất trong 2 - 24 giờ làm việc."
                        />
                        <TimelineItem
                            status="waiting"
                            label="Kích hoạt trạng thái mới"
                            isLast
                        />
                    </div>

                    {/* Buttons: Điều hướng dựa trên ngữ cảnh */}
                    <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">
                        <button
                            onClick={handleAction}
                            className="flex items-center justify-center gap-2 bg-[#1e293b] text-white px-6 py-3.5 rounded-xl font-bold text-[14px] hover:bg-slate-800 transition-all flex-1 shadow-lg shadow-slate-200"
                        >
                            {isUpdateMode ? (
                                <>Xem trạng thái KYC <ArrowRight size={18} /></>
                            ) : (
                                <>Về trang chủ <ArrowLeft size={18} className="rotate-180" /></>
                            )}
                        </button>
                    </div>

                    <p className="text-center text-[11px] text-slate-400 font-bold uppercase mt-6 tracking-tight">
                        Cảm ơn bạn đã tin tưởng sử dụng dịch vụ của chúng tôi.
                    </p>
                </div>
            </div>
        </div>
    );
};

const TimelineItem = ({status, label, sub, isLast}) => {
    const isDone = status === 'done';
    const isActive = status === 'active';

    return (
        <div className="flex gap-4 min-h-[64px]">
            <div className="flex flex-col items-center">
                <div
                    className={`w-[26px] h-[26px] rounded-full flex items-center justify-center z-10 transition-colors ${
                        isDone ? 'bg-[#10b981]' : isActive ? 'bg-[#ffb800]' : 'bg-slate-200'
                    }`}>
                    {isDone ? (
                        <Check size={16} className="text-white stroke-[3]" />
                    ) : isActive ? (
                        <RefreshCw size={14} className="text-white animate-spin stroke-[3]" />
                    ) : (
                        <div className="w-2 h-2 bg-white rounded-full opacity-60" />
                    )}
                </div>
                {!isLast && <div className="w-[2px] flex-1 bg-slate-100 my-1"></div>}
            </div>
            <div className="pb-6">
                <p className={`text-[14px] font-bold leading-none mb-1.5 ${
                    isActive ? 'text-slate-900' : isDone ? 'text-slate-700' : 'text-slate-400'
                }`}>
                    {label}
                </p>
                {sub && (
                    <p className="text-[12px] text-slate-400 leading-relaxed font-medium">
                        {sub}
                    </p>
                )}
            </div>
        </div>
    );
};

export default KYCSuccessView;