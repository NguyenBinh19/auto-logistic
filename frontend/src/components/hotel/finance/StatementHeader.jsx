import React from 'react';
import {
    ArrowDownCircle,
    ArrowUpCircle,
    Wallet,
    Calculator,
    TrendingUp,
    CheckCircle2
} from "lucide-react";

const StatementHeader = ({
    gross = 0,
    commission = 0,
    adjustments = 0,
    currentCycleNet = 0,
    net = 0,
    carriedForward = 0
}) => {
    const formatVN = (val) => new Intl.NumberFormat('vi-VN').format(val || 0);

    const cf = Number(carriedForward) || 0;

    const items = [
        {
            label: "Tổng doanh thu (Gross)",
            value: gross,
            color: "text-slate-600",
            icon: <ArrowUpCircle size={20} />
        },
        {
            label: "Phí hoa hồng (Commission)",
            value: -Math.abs(Number(commission || 0)),
            color: "text-red-500",
            icon: <ArrowDownCircle size={20} />
        },
        {
            label: "Điều chỉnh/Hoàn tiền",
            value: adjustments,
            color: "text-amber-600",
            icon: <Calculator size={20} />
        },
        {
            label: "Thực nhận kỳ này",
            value: currentCycleNet,
            color: "text-emerald-600",
            icon: <CheckCircle2 size={20} />
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {items.map((item, idx) => (
                <StatementCard key={idx} item={item} formatVN={formatVN} />
            ))}

            {cf > 0 ? (
                <div className="md:col-start-3 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StatementCard
                        item={{
                            label: "Doanh thu chuyển kỳ trước",
                            value: cf,
                            color: "text-indigo-600",
                            icon: <TrendingUp size={20} />
                        }}
                        formatVN={formatVN}
                        forcePlus
                    />

                    <StatementCard
                        item={{
                            label: "Tổng thanh toán",
                            value: net,
                            color: "text-blue-600",
                            icon: <Wallet size={20} />
                        }}
                        formatVN={formatVN}
                    />
                </div>
            ) : (
                <div className="md:col-start-4">
                    <StatementCard
                        item={{
                            label: "Tổng thanh toán",
                            value: net,
                            color: "text-blue-600",
                            icon: <Wallet size={20} />
                        }}
                        formatVN={formatVN}
                    />
                </div>
            )}
        </div>
    );
};

const StatementCard = ({ item, formatVN, forcePlus = false }) => {
    const value = Number(item.value || 0);

    return (
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-slate-400">
                {item.icon}
                <span className="text-[10px] font-black uppercase tracking-widest">
                    {item.label}
                </span>
            </div>

            <h3 className={`text-xl font-black ${item.color}`}>
                {value < 0 ? '-' : forcePlus ? '+' : ''}
                {formatVN(Math.abs(value))} <span className="text-xs">đ</span>
            </h3>
        </div>
    );
};

export default StatementHeader;