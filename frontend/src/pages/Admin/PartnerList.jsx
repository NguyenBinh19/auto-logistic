import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search, Eye, Building2, Hotel, Users,
    Loader2, Info, Filter, ChevronRight
} from "lucide-react";
import { partnerService } from "@/services/partner.service.js";

const PartnerList = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [sortBy, setSortBy] = useState("NAME_ASC");
    const [activeTab, setActiveTab] = useState("Agency");
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const getStatusStyle = (status) => {
        switch (status?.toUpperCase()) {
            case "ACTIVE":
                return "bg-emerald-50 text-emerald-600 border-emerald-100";
            case "INACTIVE":
                return "bg-slate-100 text-slate-500 border-slate-200";
            case "LOCK":
                return "bg-amber-50 text-amber-600 border-amber-100";
            case "SUSPENDED":
                return "bg-red-50 text-red-600 border-red-100";
            default:
                return "bg-slate-50 text-slate-400 border-slate-100";
        }
    };

    const renderStatus = (status) => {
        switch (status?.toUpperCase()) {
            case "ACTIVE": return "ĐANG HOẠT ĐỘNG";
            case "INACTIVE": return "KHÔNG HOẠT ĐỘNG";
            case "LOCK": return "TẠM KHÓA";
            case "SUSPENDED": return "CẤM";
            default: return "KHÔNG XÁC ĐỊNH";
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            let response;
            if (activeTab === "Agency") {
                response = await partnerService.getAllAgencyPartner();
            } else {
                response = await partnerService.getAllHotelPartner();
            }
            setPartners(response.result || []);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách đối tác:", error);
            setPartners([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const filteredPartners = useMemo(() => {
        let result = partners.filter(p => {
            const status = (p.status || "").toUpperCase();
            if (status === "PENDING") return false;
            // Lọc theo Search Term
            const name = (p.agencyName || p.hotelName || "").toLowerCase();
            const email = (p.email || "").toLowerCase();
            const search = searchTerm.toLowerCase();
            const matchesSearch = name.includes(search) || email.includes(search);
            // Lọc theo Status Tab
            const matchesStatus = filterStatus === "ALL" || status === filterStatus;
            return matchesSearch && matchesStatus;
        });
        // Logic Sắp xếp
        return result.sort((a, b) => {
            const nameA = (a.agencyName || a.hotelName || "").toLowerCase();
            const nameB = (b.agencyName || b.hotelName || "").toLowerCase();

            switch (sortBy) {
                case "NAME_ASC": return nameA.localeCompare(nameB);
                case "NAME_DESC": return nameB.localeCompare(nameA);
                case "CREDIT_DESC": return (b.currentCredit || 0) - (a.currentCredit || 0);
                default: return 0;
            }
        });
    }, [partners, searchTerm, filterStatus, sortBy]);

    const currentTableData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredPartners.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredPartners, currentPage]);
    const totalPages = Math.ceil(filteredPartners.length / itemsPerPage);
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus, sortBy, activeTab]);

    return (
        <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans">
            <div className="max-w-[1440px] mx-auto space-y-8">

                {/* HEADER & STATISTICS */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2 uppercase">QUẢN LÝ ĐỐI TÁC</h1>
                        <p className="text-slate-500 font-medium text-sm ">
                            Danh sách {activeTab === "Agency" ? "Đại lý lữ hành" : "Cơ sở lưu trú"} chính thức trên hệ thống
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 min-w-[200px]">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <Users size={20}/>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-700 uppercase tracking-tighter">Đang hiển thị</p>
                                <p className="text-lg font-black text-slate-800">{filteredPartners.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABS SELECTION */}
                <div className="flex items-center justify-between border-b border-slate-200">
                    <div className="flex gap-8">
                        {[
                            { id: "Agency", label: "Đại lý lữ hành", icon: <Building2 size={18}/> },
                            { id: "Hotel", label: "Khách sạn & Resort", icon: <Hotel size={18}/> }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setSearchTerm("");
                                }}
                                className={`flex items-center gap-2 pb-4 px-1 text-[11px] font-black tracking-[0.1em] transition-all relative ${
                                    activeTab === tab.id ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
                                }`}
                            >
                                {tab.icon}
                                {tab.label.toUpperCase()}
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full shadow-lg" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* SEARCH & FILTER CONTAINER */}
                <div className="bg-white p-3 rounded-[32px] shadow-sm border border-slate-200 flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
                    {/* Search Box  */}
                    <div className="relative flex-1 group">
                        <Search
                            className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                            size={20}
                        />
                        <input
                            type="text"
                            placeholder={`Tìm theo tên hoặc email của ${activeTab === 'Agency' ? 'đại lý' : 'khách sạn'}...`}
                            className="w-full pl-16 pr-4 py-4 bg-slate-50/50 group-hover:bg-slate-50 border-none rounded-[24px] focus:ring-2 focus:ring-blue-500/20 outline-none font-bold text-slate-700 placeholder:text-slate-300 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* Right Actions - Các bộ lọc */}
                    <div className="flex flex-wrap items-center gap-3 px-2">
                        <div className="h-8 w-[1px] bg-slate-200 hidden lg:block mx-2" />
                        <div className="flex items-center gap-3 w-full lg:w-auto">
                            {/* Filter Status */}
                            <div className="relative flex-1 lg:flex-none">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="w-full lg:w-auto appearance-none bg-slate-50 border border-slate-100 text-[11px] font-black text-slate-600 py-3 pl-4 pr-10 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer uppercase tracking-tight hover:bg-slate-100 transition-all"
                                >
                                    <option value="ALL">Tất cả trạng thái</option>
                                    <option value="ACTIVE"> Đang hoạt động</option>
                                    <option value="LOCK"> Tạm khóa</option>
                                    <option value="SUSPENDED"> Đã cấm</option>
                                    <option value="INACTIVE"> Không hoạt động</option>
                                </select>
                                <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                            </div>
                            {/* Sort Order */}
                            <div className="relative flex-1 lg:flex-none">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full lg:w-auto appearance-none bg-slate-50 border border-slate-100 text-[11px] font-black text-slate-600 py-3 pl-4 pr-10 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer uppercase tracking-tight hover:bg-slate-100 transition-all"
                                >
                                    <option value="NAME_ASC">Tên: A → Z</option>
                                    <option value="NAME_DESC">Tên: Z → A</option>
                                    {activeTab === "Agency" && <option value="CREDIT_DESC">Tín dụng cao nhất</option>}
                                </select>
                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" size={14} />
                            </div>
                            {/* Clear Button */}
                            {(searchTerm || filterStatus !== "ALL") && (
                                <button
                                    onClick={() => {setSearchTerm(""); setFilterStatus("ALL");}}
                                    className="p-3 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all flex items-center justify-center"
                                    title="Xóa bộ lọc"
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest hidden xl:inline mr-2">Xóa lọc</span>
                                    <Info size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* DATA TABLE */}
                <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                    <table className="w-full text-left border-collapse table-fixed">
                        <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="w-[60px] p-6 text-[11px] font-black text-slate-600 uppercase tracking-widest">STT</th>
                            <th className="w-[25%] p-6 text-[11px] font-black text-slate-600 uppercase tracking-widest">Tên
                                đối tác
                            </th>
                            <th className="w-[20%] p-6 text-[11px] font-black text-slate-600 uppercase tracking-widest">Liên
                                hệ
                            </th>
                            <th className="w-[20%] p-6 text-[11px] font-black text-slate-600 uppercase tracking-widest">Địa
                                chỉ
                            </th>
                            <th className="w-[150px] p-6 text-[11px] font-black text-slate-600 uppercase tracking-widest text-center">Trạng
                                thái
                            </th>
                            {activeTab === "Agency" && (
                                <th className="w-[15%] p-6 text-[11px] font-black text-slate-600 uppercase tracking-widest text-right">Tài
                                    chính</th>
                            )}
                            <th className="w-[80px] p-6 text-[11px] font-black text-slate-600 uppercase tracking-widest text-right">Thao
                                tác
                            </th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="p-20 text-center">
                                    <Loader2 className="animate-spin inline-block text-blue-600 mb-4" size={40}/>
                                    <p className="font-black text-slate-400 uppercase text-xs tracking-widest">Đang tải
                                        dữ liệu hệ thống...</p>
                                </td>
                            </tr>
                        ) : currentTableData.length > 0 ? (
                            currentTableData.map((p, index) => (
                                <tr key={p.agencyId || p.hotelId} className="hover:bg-slate-50/80 transition-all group">
                                    <td className="p-6 text-center font-bold text-slate-400 text-xs">
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg uppercase">
                                                {(p.agencyName || p.hotelName || "?").charAt(0)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-black text-slate-800 text-base leading-tight truncate"
                                                   title={p.agencyName || p.hotelName}>
                                                    {p.agencyName || p.hotelName}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <td className="p-6">
                                            {/* Kiểm tra cả contactPhone (Agency) và phone (Hotel) */}
                                            <div className="text-sm font-black text-slate-700">
                                                {p.contactPhone || p.phone || "---"}
                                            </div>
                                            <div
                                                className="text-[11px] font-medium text-slate-400 truncate max-w-[150px]">
                                                {p.email || "Không có email"}
                                            </div>
                                        </td>
                                        {/*<div className="text-[11px] font-medium text-slate-400 truncate max-w-[150px]">*/}
                                        {/*    {p.email || "Không có email"}*/}
                                        {/*</div>*/}
                                    </td>
                                    <td className="p-6">
                                        <p className="text-sm font-bold text-slate-500 max-w-[200px] truncate leading-relaxed">
                                            {p.address || "---"}
                                        </p>
                                    </td>
                                    <td className="p-6 text-center">
                                        <div className="flex justify-center">
                                                <span className={`
                                                    px-4 py-1.5 rounded-xl text-[10px] font-black border tracking-widest 
                                                    inline-flex items-center justify-center min-w-[135px] gap-2
                                                    ${getStatusStyle(p.status)}
                                                `}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                        p.status?.toUpperCase() === 'ACTIVE' ? 'bg-emerald-500' :
                                                            p.status?.toUpperCase() === 'SUSPENDED' ? 'bg-red-500' :
                                                                p.status?.toUpperCase() === 'LOCK' ? 'bg-amber-500' : 'bg-slate-400'
                                                    }`}/>
                                                    {renderStatus(p.status)}
                                                </span>
                                        </div>
                                    </td>
                                    {activeTab === "Agency" && (
                                        <td className="p-6 text-right">
                                            <p className="font-black text-sm text-slate-800">
                                                {p.currentCredit !== null ? new Intl.NumberFormat('vi-VN').format(p.currentCredit) : "---"}
                                                <span className="text-[10px] text-slate-400 ml-1 font-normal">VNĐ</span>
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                                                Hạn
                                                mức: {p.creditLimit !== null ? new Intl.NumberFormat('vi-VN').format(p.creditLimit) : "---"}
                                            </p>
                                        </td>
                                    )}
                                    <td className="p-6 text-right">
                                        <button
                                            onClick={() => navigate(`/admin/partners/${activeTab.toLowerCase()}/${p.agencyId || p.hotelId}`)}
                                            className="p-3 bg-slate-50 group-hover:bg-blue-600 group-hover:text-white text-slate-400 rounded-2xl transition-all shadow-sm active:scale-95"
                                            title="Xem chi tiết"
                                        >
                                            <Eye size={20}/>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={activeTab === "Agency" ? 6 : 5} className="p-20 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <Info className="text-slate-200" size={48}/>
                                        <p className="font-black text-slate-300 uppercase tracking-widest text-sm">
                                            Không có dữ liệu phù hợp
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                {filteredPartners.length > 0 && (
                    <div
                        className="p-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/30">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                            Hiển thị {currentTableData.length}/{filteredPartners.length} đối tác
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-all shadow-sm"
                            >
                            <ChevronRight size={18} className="rotate-180" />
                            </button>
                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, i) => {
                                    const pageNum = i + 1;
                                    // Logic chỉ hiển thị một số trang nếu tổng số trang quá lớn
                                    if (totalPages > 5 && Math.abs(pageNum - currentPage) > 2 && pageNum !== 1 && pageNum !== totalPages) {
                                        if (pageNum === currentPage - 3 || pageNum === currentPage + 3) return <span key={pageNum}>...</span>;
                                        return null;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                                                currentPage === pageNum
                                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                                                    : "bg-white border border-slate-200 text-slate-400 hover:border-blue-300"
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-all shadow-sm"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PartnerList;