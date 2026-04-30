import React from 'react';
import { Clock, CheckCircle2, Landmark } from "lucide-react";

const PayoutStats = () => {
    const stats = [
        { label: "Tổng yêu cầu chờ xử lý", value: "500.000.000 đ", sub: "(10 lệnh)", color: "text-amber-500", icon: <Clock size={24}/>, bg: "bg-amber-50" },
        { label: "Đã xử lý hôm nay", value: "1.200.000.000 đ", sub: "", color: "text-emerald-500", icon: <CheckCircle2 size={24}/>, bg: "bg-emerald-50" },
        { label: "Số dư khả dụng của Sàn", value: "10.000.000.000 đ", sub: "(Kết nối API ngân hàng)", color: "text-blue-600", icon: <Landmark size={24}/>, bg: "bg-blue-50" },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((s, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
                    <div className={`p-4 ${s.bg} ${s.color} rounded-2xl`}>{s.icon}</div>
                    <div>
                        <p className="text-slate-500 text-xs font-bold mb-1">{s.label}</p>
                        <h3 className={`text-2xl font-black ${s.color}`}>{s.value}</h3>
                        {s.sub && <p className="text-slate-400 text-[10px] font-bold">{s.sub}</p>}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PayoutStats;