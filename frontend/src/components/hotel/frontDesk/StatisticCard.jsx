import React from 'react';
import { ChevronDown, ChevronUp, Home } from 'lucide-react';

const StatCard = ({ title, count, sub, type, active, onClick }) => {
    // Tối ưu icon: Sử dụng trực tiếp Up/Down thay vì xoay thủ công
    const icons = {
        arrival: <ChevronDown size={18} className={active ? "text-blue-600" : "text-slate-500"} />,
        departure: <ChevronUp size={18} className={active ? "text-amber-500" : "text-slate-500"} />,
        stay: <Home size={18} className={active ? "text-emerald-500" : "text-slate-500"} />
    };

    return (
        <div
            onClick={onClick}
            className={`relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                active
                    ? 'bg-white border-blue-200 shadow-[0_10px_25px_-5px_rgba(67,24,255,0.1)] scale-[1.02]'
                    : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-slate-200'
            }`}
        >
            {/* Thanh màu chỉ thị khi active - tạo điểm nhấn chuyên nghiệp */}
            {active && (
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
            )}

            <div className="flex justify-between items-center mb-3">
                <h3 className={`text-[11px] font-black uppercase tracking-wider ${
                    active ? 'text-blue-600' : 'text-slate-500'
                }`}>
                    {title}
                </h3>
                <div className={`p-2 rounded-xl transition-all ${
                    active ? 'bg-blue-50 shadow-inner' : 'bg-white border border-slate-100'
                }`}>
                    {icons[type]}
                </div>
            </div>

            <div className="flex items-baseline gap-1.5">
                <div className={`text-3xl font-black tracking-tight ${
                    active ? 'text-[#1B2559]' : 'text-slate-600'
                }`}>
                    {count}
                </div>
                <span className="text-[10px] font-bold text-slate-600 uppercase">Đơn</span>
            </div>

            <div className={`mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] font-bold ${
                active ? 'text-slate-600' : 'text-slate-400'
            }`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                    active ? 'bg-blue-500' : 'bg-slate-300'
                }`}></span>
                {sub}
            </div>
        </div>
    );
};

export default StatCard;