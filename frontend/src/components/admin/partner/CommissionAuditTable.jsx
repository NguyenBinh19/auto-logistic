import React, { useMemo, useState, useEffect } from 'react';
import { format, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';
import { partnerService } from "@/services/partner.service.js";
import {
    ArrowRight, User, Clock, Hotel,
    Info, Percent, Banknote, ShieldCheck,
    Tag, Zap, AlertCircle
} from 'lucide-react';

const CommissionAuditTable = ({ data, loading, currentPage, pageSize, hotelMap }) => {
    const [hotelNames, setHotelNames] = useState({});

    const sortedData = useMemo(() => {
        if (!data) return [];
        return [...data].sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt));
    }, [data]);

    // useEffect(() => {
    //     const fetchNames = async () => {
    //         const uniqueIds = [...new Set(data.map(log => log.hotelId))];
    //         for (const id of uniqueIds) {
    //             if (!hotelNames[id]) {
    //                 try {
    //                     const response = await partnerService.getHotelPartnerDetail(id);
    //                     if (response?.result) {
    //                         setHotelNames(prev => ({ ...prev, [id]: response.result.hotelName }));
    //                     }
    //                 } catch (error) {
    //                     console.error(`Error fetching hotel name for ${id}`);
    //                 }
    //             }
    //         }
    //     };
    //     if (data.length > 0) fetchNames();
    // }, [data]);

    if (loading) return (
        <div className="py-24 text-center">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full"></div>
        </div>
    );

    // Hàm format giá trị chuẩn: 10% hoặc 10.000đ
    const formatValue = (value, type) => {
        const num = Number(value || 0).toLocaleString('vi-VN');
        return type === 'FIXED' ? `${num}đ` : `${num}%`;
    };

    const getCommTypeStyle = (type) => {
        switch (type) {
            case 'DEAL': return { class: "bg-rose-50 text-rose-700 border-rose-100", label: "DEAL", icon: <Zap size={10} /> };
            case 'DEFAULT': return { class: "bg-blue-50 text-blue-700 border-blue-100", label: "MẶC ĐỊNH", icon: <ShieldCheck size={10} /> };
            case 'HOTEL': return { class: "bg-amber-50 text-amber-700 border-amber-100", label: "KHÁCH SẠN", icon: <Hotel size={10} /> };
            default: return { class: "bg-slate-50 text-slate-700 border-slate-100", label: type || "HỆ THỐNG", icon: <Tag size={10} /> };
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center w-16">STT</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Khách sạn</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">Lộ trình thay đổi</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Phân loại</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Người thực hiện / Ghi chú</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest text-right">Thời gian ghi nhận</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                {sortedData.map((log, index) => {
                    const logDate = log.changedAt ? new Date(log.changedAt) : null;
                    const isDateValid = logDate && isValid(logDate);
                    const stt = (currentPage - 1) * pageSize + index + 1;
                    const typeStyle = getCommTypeStyle(log.newCommissionType);

                    return (
                        <tr key={log.id || index} className="group hover:bg-slate-50/50 transition-colors">
                            {/* Số thứ tự */}
                            <td className="px-6 py-5 text-center">
                                    <span className="text-xs font-mono font-bold text-slate-500">
                                        {String(stt).padStart(2, '0')}
                                    </span>
                            </td>
                            {/* Tên khách sạn */}
                            <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 text-[13px] leading-tight">
                                                {hotelMap[log.hotelId] || "Đang truy xuất..."}
                                            </span>
                                        <span className="text-[10px] text-slate-600 font-medium">ID: {log.hotelId}</span>
                                    </div>
                                </div>
                            </td>

                            {/* Lộ trình thay đổi giá trị */}
                            <td className="px-6 py-5">
                                <div className="flex items-center justify-center gap-2">
                                        <span className="text-[10px] font-black text-slate-400 line-through tracking-widest bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                            {formatValue(log.oldValue, log.oldRateType)}
                                        </span>
                                    <ArrowRight size={14} className="text-slate-400" />
                                    <span className="text-[11px] font-black px-3 py-1 rounded-full border shadow-sm  tracking-widest bg-blue-50 text-blue-700 border-blue-100">
                                            {formatValue(log.newValue, log.newRateType)}
                                        </span>
                                </div>
                            </td>

                            {/* Phân loại */}
                            <td className="px-6 py-5">
                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border w-fit font-black text-[9px] uppercase tracking-widest shadow-sm ${typeStyle.class}`}>
                                    {typeStyle.icon}
                                    {typeStyle.label}
                                </div>
                            </td>

                            {/* Người thực hiện & Ghi chú */}
                            <td className="px-6 py-5">
                                <div className="flex flex-col gap-1 max-w-[250px]">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                                        <User size={12} className="text-slate-600" />
                                        {log.changedBy || "Hệ thống"}
                                    </div>
                                    {log.note && (
                                        <div className="flex items-start gap-1.5 text-[11px] text-slate-900 group/reason relative" title={log.note}>
                                            <AlertCircle size={10} className="mt-0.5 flex-shrink-0 text-slate-400" />
                                            <p className="line-clamp-1 group-hover/reason:line-clamp-none transition-all duration-300 italic">
                                                {log.note}
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

export default CommissionAuditTable;