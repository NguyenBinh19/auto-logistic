import React, { useState, useEffect } from 'react';
import { Hotel, User, Building, Building2, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { KYC_STATUS } from '@/services/kyc.service.js';
import { userService } from '@/services/user.service';

// Component hiển thị Username
const UserName = ({ userId }) => {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const getName = async () => {
            if (!userId || userId === "null") {
                setLoading(false);
                return;
            }
            try {
                const res = await userService.getUserById(userId);
                if (isMounted) setName(res.result?.username || res.username || "Admin");
            } catch (err) {
                if (isMounted) setName("N/A");
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        getName();
        return () => { isMounted = false; };
    }, [userId]);

    if (loading) return <div className="h-4 w-20 bg-slate-100 animate-pulse rounded"></div>;

    return (
        <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-bold">
                {name.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium text-slate-700">{name}</span>
        </div>
    );
};

const KYCTable = ({ data, onReview, loading, pagination }) => {
    if (loading) return <div className="bg-white p-10 text-center border">Đang tải dữ liệu...</div>;
    const { total, current, size, onPageChange } = pagination;
    const totalPages = Math.ceil(total / size);

    const renderPageNumbers = () => {
        const pages = [];
        for (let i = 0; i < totalPages; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={`w-8 h-8 rounded-lg text-[13px] font-bold transition-all ${
                        current === i
                            ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                            : "hover:bg-slate-200 text-slate-600"
                    }`}
                >
                    {i + 1}
                </button>
            );
        }
        return pages;
    };

    const getPartnerInfo = (type) => {
        switch (type?.toUpperCase()) {
            case 'HOTEL':
                return {
                    label: "Khách sạn",
                    class: "bg-purple-100 text-purple-700 border-purple-200",
                    icon: <Hotel size={12} />
                };
            case 'AGENCY':
                return {
                    label: "Đại lý",
                    class: "bg-blue-100 text-blue-700 border-blue-200",
                    icon: <Building2 size={12} />
                };
            default:
                return {
                    label: type || "Khác",
                    class: "bg-slate-100 text-slate-600 border-slate-200",
                    icon: <User size={12} />
                };
        }
    };
    return (
        <div className="bg-white rounded-b-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="bg-slate-50/80 text-slate-600 text-[11px] uppercase tracking-wider border-b border-slate-200">
                    <th className="px-6 py-4 font-bold">Ngày nộp</th>
                    <th className="px-6 py-4 font-bold">Đối tượng</th>
                    <th className="px-6 py-4 font-bold">Tên đơn vị</th>
                    <th className="px-6 py-4 font-bold">Mã số thuế</th>
                    <th className="px-6 py-4 font-bold">Người xử lý</th>
                    <th className="px-6 py-4 font-bold text-right">Hành động</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {data.length === 0 ? (
                    <tr>
                        <td colSpan="6" className="p-12 text-center text-slate-400 text-sm italic">
                            Không có hồ sơ nào cần xử lý
                        </td>
                    </tr>
                ) : (
                    data.map((row) => {
                        const partner = getPartnerInfo(row.partnerType);
                        return (
                            <tr key={row.id} className="hover:bg-blue-50/30 transition-colors group">
                                <td className="px-6 py-4 text-[13px] text-slate-500">
                                    {row.submittedAt ? new Date(row.submittedAt).toLocaleDateString('vi-VN') : "N/A"}
                                </td>
                                <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border ${partner.class}`}>
                                            {partner.icon} {partner.label}
                                        </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div
                                        className="text-[13px] font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                        {row.legalName}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-[13px] text-slate-500 font-mono tracking-tight">
                                    {row.taxCode}
                                </td>
                                <td className="px-6 py-4">
                                    {row.reviewedBy ? (
                                        <UserName userId={row.reviewedBy}/>
                                    ) : (
                                        <span
                                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[11px] font-medium border border-amber-100 italic">
                                                <Clock size={12} className="animate-pulse"/> Chờ tiếp nhận
                                            </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => onReview(row)}
                                        className={`${
                                            row.status === KYC_STATUS.PENDING
                                                ? "bg-blue-600 hover:bg-blue-700"
                                                : "bg-slate-600 hover:bg-slate-700"
                                        } text-white px-5 py-1.5 rounded-lg text-[13px] font-bold transition-all shadow-sm hover:shadow-md active:scale-95`}
                                    >
                                        {row.status === KYC_STATUS.PENDING ? "Duyệt hồ sơ" : "Xem chi tiết"}
                                    </button>
                                </td>
                            </tr>
                        );
                    })
                )}
                </tbody>
            </table>
            {/* Pagination Footer */}
            {total > 0 && (
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                    <div className="text-[13px] text-slate-500">
                        Đang xem bản
                        ghi <b>{current * size + 1}</b> - <b>{Math.min((current + 1) * size, total)}</b> trên tổng
                        số <b>{total}</b>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            disabled={current === 0}
                            onClick={() => onPageChange(current - 1)}
                            className="p-2 rounded-lg border bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        <div className="flex items-center gap-1">
                            {renderPageNumbers()}
                        </div>

                        <button
                            type="button"
                            disabled={current >= totalPages - 1}
                            onClick={() => onPageChange(current + 1)}
                            className="p-2 rounded-lg border bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KYCTable;