import React, { useMemo } from 'react';
import { format, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';
import { TrendingUp, TrendingDown, Award, AlertCircle, Clock, User, MinusCircle } from 'lucide-react';

const RankAuditTable = ({ data, loading, currentPage, pageSize }) => {
    const sortedData = useMemo(() => {
        return [...data].sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt));
    }, [data]);

    if (loading) return (
        <div className="py-24 text-center">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full"></div>
        </div>
    );

    const getChangeTypeStyle = (type) => {
        switch (type) {
            case 'UPGRADE':
                return {
                    class: "bg-emerald-50 text-emerald-700 border-emerald-100",
                    icon: <TrendingUp size={14} className="text-emerald-500" />
                };
            case 'DOWNGRADE':
                return {
                    class: "bg-red-50 text-red-700 border-red-100",
                    icon: <TrendingDown size={14} className="text-red-500" />
                };
            default: // HOLD
                return {
                    class: "bg-amber-50 text-amber-700 border-amber-100",
                    icon: <MinusCircle size={14} className="text-amber-500" />
                };
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center w-16">STT</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Đại lý</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Lộ trình thay đổi</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Người thực hiện / Lý do</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest text-right">Thời gian ghi nhận</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                {sortedData.map((item, index) => {
                    const logDate = item.changedAt ? new Date(item.changedAt) : null;
                    const isDateValid = logDate && isValid(logDate);
                    const stt = (currentPage - 1) * pageSize + index + 1;
                    const statusStyle = getChangeTypeStyle(item.changeType);

                    return (
                        <tr key={item.id || index} className="group hover:bg-slate-50/50 transition-colors">
                            {/* Số thứ tự */}
                            <td className="px-6 py-5 text-center">
                                    <span className="text-xs font-mono font-bold text-slate-500">
                                        {String(stt).padStart(2, '0')}
                                    </span>
                            </td>

                            {/* Tên đại lý */}
                            <td className="px-6 py-5">
                                <div className="flex items-center gap-3">

                                    <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 text-[13px] leading-tight">
                                                {item.agencyName}
                                            </span>
                                        <span className="text-[10px] text-slate-600 font-medium">ID: {item.agencyId}</span>
                                    </div>
                                </div>
                            </td>

                            {/* Lộ trình thay đổi hạng */}
                            <td className="px-6 py-5">
                                <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                            {item.oldRank}
                                        </span>
                                    {statusStyle.icon}
                                    <span className={`text-[11px] font-black px-3 py-1 rounded-full border shadow-sm uppercase tracking-widest ${statusStyle.class}`}>
                                            {item.newRank}
                                        </span>
                                </div>
                            </td>

                            {/* Người thực hiện & Lý do */}
                            <td className="px-6 py-5">
                                <div className="flex flex-col gap-1 max-w-[250px]">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                                        <User size={12} className="text-slate-600" />
                                        {item.changedBy}
                                    </div>
                                    {item.reason && (
                                        <div
                                            className="flex items-start gap-1.5 text-[11px] text-slate-900 group/reason relative"
                                            title={item.reason}
                                        >
                                            <AlertCircle size={10} className="mt-0.5 flex-shrink-0" />
                                            <p className="line-clamp-1 group-hover/reason:line-clamp-none transition-all duration-300">
                                                {item.reason}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </td>

                            {/* Thời gian */}
                            <td className="px-6 py-5 text-right">
                                <div className="inline-flex flex-col items-end">
                                    <div className="flex items-center gap-1.5 text-slate-900 font-black text-xs">
                                        <Clock size={12} className="text-slate-500"/>
                                        {isDateValid ? format(logDate, 'HH:mm:ss') : '--:--:--'}
                                    </div>
                                    <span className="text-[10px] text-slate-700 font-bold uppercase tracking-tighter">
                                            {isDateValid ? format(logDate, 'dd MMM yyyy', {locale: vi}) : 'N/A'}
                                        </span>
                                </div>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
};

export default RankAuditTable;