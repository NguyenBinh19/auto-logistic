import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

const KPICard = ({ title, value, unit, trend, isUp }) => {
    // 1. Định dạng số: 1000000 -> 1.000.000
    const displayValue = typeof value === 'number'
        ? new Intl.NumberFormat('vi-VN').format(value)
        : value;

    // Nếu BE trả về null (do chưa có dữ liệu kỳ trước), hiển thị 0.0%
    const hasTrend = trend !== null && trend !== undefined;
    const trendValue = hasTrend ? Math.abs(trend).toFixed(1) : "0.0";

    return (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
                <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest group-hover:text-blue-600 transition-colors">
                    {title}
                </p>

                {/* Phần hiển thị % tăng trưởng */}
                <div className={`flex items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-bold ${
                    !hasTrend ? 'bg-slate-50 text-slate-400' :
                        isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                }`}>
                    {!hasTrend ? <Minus size={12} /> : isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {trendValue}%
                </div>
            </div>

            <div className="flex items-baseline gap-1">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                    {displayValue}
                </h2>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {unit}
                </span>
            </div>
        </div>
    );
};

export default KPICard;