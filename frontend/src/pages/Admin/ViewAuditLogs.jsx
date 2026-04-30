import React, { useEffect, useState, useMemo } from 'react';
import {
    History,
    RefreshCcw,
    Search,
    User,
    Clock,
    Database,
    Activity,
    ChevronLeft,
    ChevronRight,
    ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { systemConfigService } from '@/services/systemConfig.service';
import { userService } from '@/services/user.service';

// Component hiển thị Username từ UserId
const UserName = ({ userId }) => {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const getName = async () => {
            if (!userId) return;
            try {
                const res = await userService.getUserById(userId);
                if (isMounted) setName(res.result?.username || res.username || "Unknown");
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
    return <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{name}</span>;
};

const SystemLogList = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // State cho phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 15;

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await systemConfigService.getAllAuditLog();
            const data = res.result || [];
            const sortedData = data.sort((a, b) =>
                new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
            );
            setLogs(sortedData);
            setCurrentPage(1);
        } catch (error) {
            console.error("Lỗi tải nhật ký hệ thống:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const filteredLogs = useMemo(() => {
        return logs.filter(item =>
            item.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.userId?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [logs, searchTerm]);

    const totalPages = Math.ceil(filteredLogs.length / pageSize);
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredLogs.slice(startIndex, startIndex + pageSize);
    }, [filteredLogs, currentPage]);

    // Hàm xác định màu sắc dựa trên nội dung hành động
    const getActionStyle = (action = "") => {
        if (action.includes("Cập nhật")) return "bg-blue-50 text-blue-700 border-blue-100";
        if (action.includes("Xóa")) return "bg-red-50 text-red-700 border-red-100";
        if (action.includes("Tạo")) return "bg-emerald-50 text-emerald-700 border-emerald-100";
        return "bg-slate-50 text-slate-700 border-slate-100";
    };

    return (
        <div className="p-6 bg-[#F8FAFC] min-h-screen font-sans">
            <div className="max-w-7xl mx-auto">

                {/* Header Section */}
                <div className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
                            NHẬT KÝ HỆ THỐNG
                        </h2>
                        <p className="mt-1 text-slate-500 text-sm font-medium ">
                            Lịch sử chi tiết các thao tác thay đổi thông số trên hệ thống
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Tìm kiếm hành động..."
                                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all w-72 shadow-sm"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                        <button
                            onClick={fetchData}
                            className="p-2.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl transition-all shadow-sm active:scale-95"
                        >
                            <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
                        </button>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center w-16">STT</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Người thực hiện</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Nội dung hành động</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest text-right">Thời gian</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="4" className="py-24 text-center"><RefreshCcw className="animate-spin mx-auto text-slate-200" size={32} /></td></tr>
                            ) : paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-20 text-center">
                                        <Database className="mx-auto mb-2 opacity-10" size={48} />
                                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Trống</p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((item, index) => {
                                    const stt = (currentPage - 1) * pageSize + index + 1;
                                    const logDate = item.updatedAt ? new Date(item.updatedAt) : null;
                                    return (
                                        <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-5 text-center">
                                                    <span
                                                        className="text-xs font-mono font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
                                                        {String(stt).padStart(2, '0')}
                                                    </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="p-2 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                                        <User size={14}/>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        {/* HIỂN THỊ USERNAME */}
                                                        <UserName userId={item.userId}/>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`text-[13px] font-bold px-3 py-1 rounded-lg border shadow-sm ${getActionStyle(item.action)}`}>
                                                            {item.action}
                                                        </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="inline-flex flex-col items-end">
                                                    <div
                                                        className="flex items-center gap-1.5 text-slate-900 font-black text-xs">
                                                        <Clock size={12} className="text-slate-500"/>
                                                        {/* 2. Format giờ phút giây */}
                                                        {logDate ? format(logDate, 'HH:mm:ss') : '--:--:--'}
                                                    </div>
                                                    <span
                                                        className="text-[10px] text-slate-700 font-bold uppercase tracking-tighter">
                                                            {/* 3. Format ngày tháng Tiếng Việt */}
                                                        {logDate ? format(logDate, 'dd MMM yyyy', {locale: vi}) : 'N/A'}
                                                        </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div
                        className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {filteredLogs.length} kết quả được ghi nhận
                        </span>

                        {totalPages > 1 && (
                            <div className="flex items-center gap-1">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-900 disabled:opacity-30 transition-all shadow-sm"
                                >
                                    <ChevronLeft size={16}/>
                                </button>
                                <div className="px-4 text-[11px] font-black text-slate-700">
                                    TRANG {currentPage} / {totalPages}
                                </div>
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-900 disabled:opacity-30 transition-all shadow-sm"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemLogList;