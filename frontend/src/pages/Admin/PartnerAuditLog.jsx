import React, { useState, useEffect, useMemo } from 'react';
import {
    RefreshCcw, Search, Database, ChevronLeft, ChevronRight,
    Calendar, X
} from 'lucide-react';
import { commissionService } from '@/services/commission.service.js';
import { rankService } from '@/services/rank.service.js';
import { partnerService } from "@/services/partner.service.js"; // Import service lấy tên hotel
import CommissionAuditTable from '@/components/admin/partner/CommissionAuditTable';
import RankAuditTable from '@/components/admin/partner/RankAuditTable';

const PartnerAuditDashboard = () => {
    const [activeTab, setActiveTab] = useState("commission");
    const [data, setData] = useState([]);
    const [hotelMap, setHotelMap] = useState({}); // Lưu mapping ID -> Name
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // State lọc thời gian
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 15;

    const fetchData = async () => {
        setLoading(true);
        try {
            let res;
            if (activeTab === "commission") {
                res = await commissionService.getAllLogs();
            } else {
                res = await rankService.getAllRankHistories();
            }
            const resultData = res.result || res || [];

            // 1. Sắp xếp
            const sortedData = [...resultData].sort((a, b) =>
                new Date(b.changedAt || b.createdAt || 0) - new Date(a.changedAt || a.createdAt || 0)
            );

            // 2. Fetch toàn bộ tên Hotel để phục vụ Search (Chỉ fetch những ID chưa có trong map)
            const uniqueHotelIds = [...new Set(sortedData.map(item => item.hotelId))].filter(id => id && !hotelMap[id]);

            if (uniqueHotelIds.length > 0) {
                const newMap = { ...hotelMap };
                await Promise.all(uniqueHotelIds.map(async (id) => {
                    try {
                        const hotelRes = await partnerService.getHotelPartnerDetail(id);
                        if (hotelRes?.result) newMap[id] = hotelRes.result.hotelName;
                    } catch (e) { newMap[id] = "N/A"; }
                }));
                setHotelMap(newMap);
            }

            setData(sortedData);
            setCurrentPage(1);
        } catch (error) {
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [activeTab]);

    // LOGIC FILTER ĐA DẠNG
    const filteredData = useMemo(() => {
        return data.filter(item => {
            const s = searchTerm.toLowerCase();
            const hName = (hotelMap[item.hotelId] || "").toLowerCase();
            const aName = (item.agencyName || "").toLowerCase();
            const changedBy = (item.changedBy || "").toLowerCase();
            const note = (item.note || "").toLowerCase();
            const type = (item.newCommissionType || "").toLowerCase();

            // A. Search đa dạng
            const matchesSearch =
                hName.includes(s) ||
                aName.includes(s) ||
                changedBy.includes(s) ||
                note.includes(s) ||
                type.includes(s) ||
                item.hotelId?.toString().includes(s);

            // B. Lọc theo thời gian
            const itemDate = new Date(item.changedAt || item.createdAt);
            let matchesDate = true;
            if (startDate) {
                matchesDate = matchesDate && itemDate >= new Date(startDate);
            }
            if (endDate) {
                // Set endDate đến cuối ngày (23:59:59)
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                matchesDate = matchesDate && itemDate <= end;
            }

            return matchesSearch && matchesDate;
        });
    }, [data, searchTerm, hotelMap, startDate, endDate]);

    const totalPages = Math.ceil(filteredData.length / pageSize);
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredData.slice(startIndex, startIndex + pageSize);
    }, [filteredData, currentPage]);

    return (
        <div className="p-6 bg-[#F8FAFC] min-h-screen font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header & Search */}
                <div className="mb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">NHẬT KÝ ĐỐI TÁC</h2>
                        <p className="text-slate-500 text-sm font-medium">Theo dõi biến động và lịch sử hệ thống</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Lọc theo ngày */}
                        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                            <Calendar size={16} className="text-slate-400 ml-1" />
                            <input
                                type="date"
                                className="text-xs font-bold outline-none border-none bg-transparent"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            <span className="text-slate-300">-</span>
                            <input
                                type="date"
                                className="text-xs font-bold outline-none border-none bg-transparent"
                                value={endDate}
                                min={startDate}
                                onChange={(e) => {
                                    const selectedDate = e.target.value;
                                    if (startDate && selectedDate < startDate) {
                                        return;
                                    }
                                    setEndDate(selectedDate);
                                }}
                            />
                            {(startDate || endDate) && (
                                <button onClick={() => {setStartDate(""); setEndDate("")}} className="text-slate-400 hover:text-rose-500">
                                    <X size={14}/>
                                </button>
                            )}
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Tìm khách sạn, người thực hiện..."
                                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm w-64 shadow-sm"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            />
                        </div>

                        <button onClick={fetchData} className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm">
                            <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
                        </button>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-slate-200/40 p-1 rounded-2xl w-fit border mb-6">
                    {["commission", "rank"].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${
                                activeTab === tab ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
                            }`}
                        >
                            {tab === "commission" ? "HOA HỒNG" : "THỨ HẠNG"}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-xl overflow-hidden">
                    <div className="min-h-[400px]">
                        {activeTab === "commission" ? (
                            <CommissionAuditTable
                                data={paginatedData}
                                loading={loading}
                                currentPage={currentPage}
                                pageSize={pageSize}
                                hotelMap={hotelMap}
                            />
                        ) : (
                            <RankAuditTable data={paginatedData} loading={loading} currentPage={currentPage} pageSize={pageSize} />
                        )}
                        {!loading && paginatedData.length === 0 && (
                            <div className="py-24 text-center text-slate-400 font-bold uppercase text-xs">Không tìm thấy dữ liệu</div>
                        )}
                    </div>

                    {/* Pagination  */}
                    <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {filteredData.length} bản ghi được tìm thấy
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

export default PartnerAuditDashboard;