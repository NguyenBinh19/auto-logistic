import React, { useState, useEffect, useMemo } from 'react';
import KYCTable from '@/components/admin/kycQueue/KYCTable.jsx';
import KYCReviewModal from '@/components/admin/kycQueue/KYCReviewModal.jsx';
import {
    Search, Eye, Building2, Hotel, Users,
    Loader2, Info, Filter, ChevronRight
} from "lucide-react";
import { kycService, KYC_STATUS } from '@/services/kyc.service.js';

const KYCQueuePage = () => {
    const [allData, setAllData] = useState([]); // Lưu toàn bộ dữ liệu trả về
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(KYC_STATUS.PENDING);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 10;
    const [searchTerm, setSearchTerm] = useState("");
    useEffect(() => {
        setCurrentPage(0);
    }, [searchTerm, activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {

            const res = await kycService.getPartnerVerificationsByStatus(activeTab);
            const responseData = res.result || res;

            const fullList = Array.isArray(responseData) ? responseData : (responseData.content || []);
            setAllData(fullList);
        } catch (error) {
            console.error("Lỗi lấy danh sách KYC:", error);
            setAllData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const filteredData = useMemo(() => {
        const search = searchTerm.toLowerCase().trim();
        if (!search) return allData;

        return allData.filter(item =>
            (item.legalName || "").toLowerCase().includes(search) ||
            (item.taxCode || "").includes(search)
        );
    }, [allData, searchTerm]);

    // Phân trang dựa trên mảng đã lọc
    const paginatedData = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, currentPage, pageSize]);

    const handleOpenReview = async (item) => {
        try {
            const res = await kycService.getVerificationDetail(item.id);
            const detailData = res.result || res;
            setSelectedRequest(detailData);
            setIsModalOpen(true);
        } catch (error) {
            console.error("Detail Error:", error);
            alert("Không thể lấy thông tin chi tiết hồ sơ.");
        }
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen font-sans">
            <h1 className="text-2xl font-bold text-[#1e293b] mb-1">XỬ LÝ XÁC MINH KYC</h1>
            <p className="text-slate-500 text-[14px] mb-8">Xử lý yêu cầu đăng ký tài khoản mới cho Đại lý và Khách
                sạn</p>

            {/* Toolbar: Tabs + Search */}
            <div className="bg-white rounded-t-2xl border-x border-t border-slate-200 px-6 pt-5 flex flex-col md:flex-row items-end md:items-center justify-between gap-4">
                {/* Tabs bên trái */}
                <div className="flex gap-8 overflow-x-auto w-full md:w-auto">
                    <TabItem
                        label="Chờ duyệt"
                        active={activeTab === KYC_STATUS.PENDING}
                        onClick={() => setActiveTab(KYC_STATUS.PENDING)}
                    />
                    <TabItem
                        label="Cần bổ sung"
                        active={activeTab === KYC_STATUS.NEED_MORE_INFORMATION}
                        onClick={() => setActiveTab(KYC_STATUS.NEED_MORE_INFORMATION)}
                    />
                    <TabItem
                        label="Đã duyệt"
                        active={activeTab === KYC_STATUS.VERIFIED}
                        onClick={() => setActiveTab(KYC_STATUS.VERIFIED)}
                        color="text-emerald-600"
                    />
                    <TabItem
                        label="Đã từ chối"
                        active={activeTab === KYC_STATUS.REJECTED}
                        onClick={() => setActiveTab(KYC_STATUS.REJECTED)}
                        color="text-red-600"
                    />
                </div>

                {/* Ô Search bên phải */}
                <div className="relative w-full md:w-80 mb-3">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={16}
                    />
                    <input
                        type="text"
                        placeholder="Tìm tên đối tác, MST..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500/10 outline-none transition-all placeholder:font-normal"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 hover:text-slate-600"
                        >
                            XÓA
                        </button>
                    )}
                </div>
            </div>

    {/* Table */
    }
            <KYCTable
                data={paginatedData}
                onReview={handleOpenReview}
                loading={loading}
                pagination={{
                    total: allData.length,
                    current: currentPage,
                    size: pageSize,
                    onPageChange: (newPage) => setCurrentPage(newPage)
                }}
            />

    {/* Modal Detail */
    }
    {
        isModalOpen && (
            <KYCReviewModal
                data={selectedRequest}
                onClose={() => setIsModalOpen(false)}
                onRefresh={fetchData}
            />
        )
    }
</div>
)
    ;
};

const TabItem = ({label, active, onClick, color = "text-blue-600"}) => (
    <div
        onClick={onClick}
        className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${active ? `border-blue-600 ${color}` : 'border-transparent text-slate-400 hover:text-slate-600'}`}
    >
        <span className="text-[13px] font-bold">{label}</span>
    </div>
);

export default KYCQueuePage;