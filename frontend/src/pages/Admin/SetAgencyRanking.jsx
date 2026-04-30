import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Award, ChevronRight, CheckCircle2, XCircle,
    MapPin, Loader2, RefreshCw, TrendingUp,
    ArrowUpRight, ArrowDownRight, Mail, Calendar, Info, ArrowRight,
    ExternalLink, Hash, Eye, DollarSign, History
} from 'lucide-react';
import { rankService } from '@/services/rank.service.js';
import { kycService } from '@/services/kyc.service.js';
import { bookingService } from '@/services/booking.service.js';

const AgencyRankingManager = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('UPGRADE');
    const [periods, setPeriods] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    const [agencies, setAgencies] = useState([]);
    const [loading, setLoading] = useState(false);

    const [selectedAgency, setSelectedAgency] = useState(null);
    const [agencyDetail, setAgencyDetail] = useState(null);
    const [kycDetail, setKycDetail] = useState(null);
    const [bookingDetails, setBookingDetails] = useState([]);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [reason, setReason] = useState('');
    const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
    // Khởi tạo chu kỳ
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                const [allCycles, latest] = await Promise.all([
                    rankService.getAllRankCycles(),
                    rankService.getLatestPeriod()
                ]);
                const latestData = latest?.result;
                const rawPeriods = allCycles?.result?.periods || [];
                const currentYear = new Date().getFullYear();
                const isLatestK2 = latestData?.endDate.includes("-12-");

                const formattedPeriods = [
                    {
                        type: "Kỳ 1",
                        startDate: `${currentYear}-${rawPeriods[0]?.value}`,
                        endDate: `${currentYear}-${rawPeriods[1]?.value}`
                    },
                    {
                        type: "Kỳ 2",
                        startDate: `${isLatestK2 ? currentYear - 1 : currentYear}-${rawPeriods[2]?.value}`,
                        endDate: `${isLatestK2 ? currentYear - 1 : currentYear}-${rawPeriods[3]?.value}`
                    }
                ];

                setPeriods(formattedPeriods);
                setSelectedPeriod(latestData);
            } catch (error) {
                console.error("Lỗi khởi tạo:", error);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    // Tải danh sách ứng viên
    const fetchAgencies = async () => {
        if (!selectedPeriod?.startDate) return;
        setLoading(true);
        try {
            const payload = { startDate: selectedPeriod.startDate, endDate: selectedPeriod.endDate };
            const res = activeTab === 'UPGRADE'
                ? await rankService.getUpgradeCandidates(payload)
                : await rankService.getDowngradeCandidates(payload);
            setAgencies(res?.result || []);
        } catch (error) {
            setAgencies([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAgencies(); }, [activeTab, selectedPeriod]);

    // Xử lý mở Modal chi tiết
    const handleViewDetail = async (agency) => {
        setSelectedAgency(agency);
        setLoadingDetail(true);
        setKycDetail(null);
        setBookingDetails([]);
        setReason('');

        try {
            const rankPayload = {
                agencyId: agency.agencyId,
                startDate: selectedPeriod.startDate,
                endDate: selectedPeriod.endDate,
                targetRankId: agency.targetRankId,
                changeType: activeTab
            };
            const rankRes = await rankService.getAgencyRankDetail(rankPayload);
            const detailData = rankRes?.result;
            setAgencyDetail(detailData);

            // 1. Lấy thông tin KYC
            const kycId = detailData?.partnerVerificationId;
            if (kycId) {
                kycService.getVerificationDetail(kycId).then(res => setKycDetail(res?.result));
            }
            // 2. Lấy chi tiết từng Booking để hiển thị thông tin thay vì ID
            if (detailData?.bookingIds?.length > 0) {
                setLoadingBookings(true);
                const promises = detailData.bookingIds.map(id =>
                    bookingService.getBookingDetailById(id).catch(() => null)
                );
                const results = await Promise.all(promises);
                setBookingDetails(results.filter(r => r !== null).map(r => r.result));
                setLoadingBookings(false);
            }
        } catch (error) {
            console.error("Lỗi tải chi tiết:", error);
        } finally {
            setLoadingDetail(false);
        }
    }

    const handleConfirmChange = async (status) => {
        const cleanReason = reason?.trim() || "";
        if (cleanReason.length < 5) {
            return alert("Vui lòng nhập lý do cụ thể (tối thiểu 5 ký tự).");
        }
        try {
            await rankService.changeRank({
                agencyId: selectedAgency.agencyId,
                currentRankId: agencyDetail?.currentRank?.id,
                targetRankId: agencyDetail?.targetRank?.id,
                totalRevenue: agencyDetail?.totalRevenue,
                changeType: activeTab,
                reason: cleanReason,
                status
            });
            alert("Thao tác thành công!");
            setSelectedAgency(null);
            fetchAgencies();
        } catch (error) {
            alert("Lỗi cập nhật hạng.");
        }
    };

    return (
        <div className="p-4 md:p-10 bg-[#F4F7FE] min-h-screen font-sans text-slate-700">
            <div className="max-w-[1600px] mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase flex items-center gap-3">
                            XÉT DUYỆT HẠNG ĐẠI LÝ
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Phân tích hiệu suất và phê duyệt thay đổi cấp bậc đối tác</p>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-2 rounded-[2rem] shadow-sm border border-slate-100">
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            {periods.map(p => (
                                <button key={p.type} onClick={() => setSelectedPeriod(p)}
                                        className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all uppercase tracking-tighter ${selectedPeriod?.startDate === p.startDate ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>
                                    {p.type} ({p.startDate.split('-')[0]})
                                </button>
                            ))}
                        </div>
                        <button onClick={fetchAgencies} className="p-2.5 hover:bg-slate-50 rounded-full transition-all text-slate-400">
                            <RefreshCw size={18} className={loading ? "animate-spin text-blue-600" : ""}/>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-1">
                    <div className="flex gap-2">
                        {['UPGRADE', 'DOWNGRADE'].map(t => (
                            <button key={t} onClick={() => setActiveTab(t)}
                                    className={`px-6 py-3 text-xs font-black transition-all rounded-t-2xl flex items-center gap-2 ${activeTab === t ? 'bg-white border-x border-t border-slate-200 text-blue-600 -mb-[1px]' : 'text-slate-400 hover:text-slate-600'}`}>
                                {t === 'UPGRADE' ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
                                {t === 'UPGRADE' ? 'ỨNG VIÊN NÂNG HẠNG' : 'ĐỀ XUẤT HẠ HẠNG'}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-3">
                        <Calendar size={14}/> {selectedPeriod?.startDate} - {selectedPeriod?.endDate}
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full py-20 flex flex-col items-center gap-4">
                            <Loader2 className="animate-spin text-blue-600" size={48}/>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Đang tải dữ liệu...</p>
                        </div>
                    ) : agencies.length > 0 ? agencies.map(agency => (
                        <div key={agency.agencyId} onClick={() => handleViewDetail(agency)}
                             className="group bg-white p-6 rounded-[2.5rem] border border-slate-100 hover:border-blue-500/20 hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden">
                            <div className="flex items-start justify-between relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-slate-50 rounded-[1.2rem] flex items-center justify-center font-black text-xl text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        {agency.agencyName.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-800 text-base group-hover:text-blue-600 transition-colors">{agency.agencyName}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold mt-1 flex items-center gap-1 uppercase tracking-tighter">
                                            <Mail size={10}/> {agency.email}
                                        </p>
                                    </div>
                                </div>
                                <div className={`p-2 rounded-xl ${activeTab === 'UPGRADE' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                    {activeTab === 'UPGRADE' ? <ArrowUpRight size={18}/> : <ArrowDownRight size={18}/>}
                                </div>
                            </div>
                            <div className="mt-6 p-4 bg-slate-50 rounded-2xl flex justify-between items-center group-hover:bg-white transition-all">
                                <div className="text-center flex-1">
                                    <p className="text-[8px] font-black text-slate-400 uppercase">Hiện tại</p>
                                    <p className="font-black text-slate-600 text-xs">{agency.currentRank}</p>
                                </div>
                                <ChevronRight size={16} className="text-slate-300"/>
                                <div className="text-center flex-1">
                                    <p className="text-[8px] font-black text-blue-400 uppercase">Đề xuất</p>
                                    <p className="font-black text-blue-600 text-xs">{agency.targetRank}</p>
                                </div>
                            </div>
                            {/* Nút Xem chi tiết tại card */}
                            <button
                                onClick={() => handleViewDetail(agency)}
                                className="mt-5 w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-2 hover:bg-blue-600 transition-all"
                            >
                                <Eye size={14}/> Xem chi tiết & Đối soát
                            </button>
                        </div>
                    )) : (
                        <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                            <Info className="mx-auto text-slate-300 mb-4" size={48}/>
                            <p className="font-black text-slate-400 uppercase tracking-[0.3em] text-sm">Không có dữ liệu</p>
                        </div>
                    )}
                </div>

                {/* MODAL CHI TIẾT */}
                {selectedAgency && (
                    <div className="fixed inset-0 z-[100] overflow-y-auto">
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedAgency(null)} />
                        <div className="flex min-h-full items-center justify-center p-4 md:p-8 relative z-[110]">
                            <div className="bg-white w-full max-w-6xl rounded-[2.5rem] shadow-2xl overflow-hidden">
                                {loadingDetail ? (
                                    <div className="p-20 flex flex-col items-center gap-4 text-blue-600">
                                        <Loader2 className="animate-spin" size={40}/>
                                        <span className="text-[10px] font-black uppercase tracking-widest">Đang đối soát dữ liệu...</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col lg:flex-row max-h-[90vh]">
                                        {/* CỘT TRÁI: THÔNG TIN ĐỐI TÁC */}
                                        <div
                                            className="lg:w-[35%] bg-slate-50/80 p-8 border-r border-slate-100 overflow-y-auto">
                                            <div className="space-y-8">
                                                <div>
                                                    <h2 className="text-xl font-black text-slate-800 leading-tight">
                                                        {kycDetail?.legalName || agencyDetail?.agencyName}
                                                    </h2>
                                                    <p className="text-[11px] text-slate-500 mt-2 flex items-start gap-1 italic">
                                                        <MapPin size={14} className="text-blue-500 shrink-0"/>
                                                        {kycDetail?.businessAddress || agencyDetail?.address}
                                                    </p>
                                                </div>

                                                <div
                                                    className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                                                    <p className="text-[10px] font-black text-slate-600 uppercase mb-1">Doanh
                                                        thu kỳ này</p>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-2xl font-black text-slate-900">
                                                            {agencyDetail?.totalRevenue?.toLocaleString()}
                                                        </span>
                                                        <span
                                                            className="text-[10px] font-bold text-slate-400">VNĐ</span>
                                                    </div>
                                                    <TrendingUp
                                                        className={`absolute -bottom-2 -right-2 ${activeTab === 'UPGRADE' ? 'text-emerald-500/10' : 'text-rose-500/10 rotate-180'}`}
                                                        size={80}/>
                                                </div>

                                                <div className="space-y-4">
                                                    <div
                                                        className="flex justify-between items-center border-l-2 border-blue-600 pl-2">
                                                        <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Hồ
                                                            sơ pháp lý</h4>
                                                        <span
                                                            className={`text-[9px] px-2 py-0.5 rounded-full font-black ${kycDetail?.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                                                            {kycDetail?.status || 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {[
                                                            {label: "MST", value: kycDetail?.taxCode},
                                                            {
                                                                label: "Giấy phép",
                                                                value: kycDetail?.businessLicenseNumber
                                                            },
                                                            {label: "Đại diện", value: kycDetail?.representativeName},
                                                            {label: "CCCD", value: kycDetail?.representativeCICNumber},
                                                            {label: "Nơi cấp", value: kycDetail?.representativeCICPlace}
                                                        ].map((item, idx) => (
                                                            <div key={idx}
                                                                 className="flex justify-between items-start bg-white/50 p-3 rounded-xl border border-slate-100">
                                                                <span
                                                                    className="text-[9px] font-bold text-slate-600 uppercase w-20">{item.label}</span>
                                                                <span
                                                                    className="text-[11px] font-black text-slate-700 text-right">{item.value || "---"}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* DANH SÁCH BOOKING ĐÓNG GÓP DOANH THU */}
                                                <div className="space-y-4">
                                                    <div
                                                        className="flex items-center justify-between border-l-2 border-slate-900 pl-3">
                                                        <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Đơn
                                                            hàng đóng góp</h4>
                                                        <span
                                                            className="text-[9px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full">
                                                            {agencyDetail?.bookingIds?.length || 0}
                                                        </span>
                                                    </div>

                                                    <div className="space-y-2">
                                                        {loadingBookings ? (
                                                            <div className="py-10 text-center"><Loader2
                                                                className="animate-spin mx-auto text-slate-300"
                                                                size={20}/></div>
                                                        ) : bookingDetails.length > 0 ? bookingDetails.map((book, idx) => (
                                                            <button
                                                                key={idx}
                                                                onClick={() => navigate(`/admin/view-booking/${book.bookingCode}`)}
                                                                className="w-full bg-white p-4 rounded-2xl border border-slate-100 hover:border-blue-500 hover:shadow-md transition-all group text-left relative overflow-hidden"
                                                            >
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <div
                                                                            className="p-1.5 bg-slate-50 rounded-lg text-slate-400 group-hover:text-blue-600 transition-colors">
                                                                            <Hash size={12}/>
                                                                        </div>
                                                                        <span className="text-[11px] font-black text-slate-700 uppercase tracking-tighter">{book.bookingCode}</span>
                                                                    </div>
                                                                </div>
                                                                <ArrowRight size={14}
                                                                            className="absolute bottom-4 right-4 text-slate-200 group-hover:text-blue-500 transition-all group-hover:translate-x-1"/>
                                                            </button>
                                                        )) : (
                                                            <p className="text-[10px] text-slate-400 italic text-center py-4">Không
                                                                tìm thấy chi tiết đơn hàng</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* CỘT PHẢI: QUYẾT ĐỊNH */}
                                        <div className="lg:w-[65%] p-10 flex flex-col bg-white overflow-y-auto">
                                            <div className="space-y-8">
                                                {/* Header Modal */}
                                                <div className="flex justify-between items-center">
                                                    <h3 className="text-[12px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                                        Lộ trình {activeTab === 'UPGRADE' ? "Nâng hạng" : "Hạ hạng"} đối tác
                                                    </h3>
                                                    <button onClick={() => setSelectedAgency(null)} className="text-slate-500 hover:text-rose-500 transition-colors">
                                                        <XCircle size={24}/>
                                                    </button>
                                                </div>

                                                {/* So sánh Rank (Visual) */}
                                                <div className={`flex items-center gap-4 p-3 rounded-[2.2rem] ${activeTab === 'UPGRADE' ? 'bg-blue-50/50' : 'bg-rose-50/50'}`}>
                                                    <div className="flex-1 bg-white p-5 rounded-[1.8rem] text-center shadow-sm">
                                                        <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Hiện tại</p>
                                                        <p className="text-lg font-black uppercase" style={{color: agencyDetail?.currentRank?.color}}>
                                                            {agencyDetail?.currentRank?.rankName}
                                                        </p>
                                                    </div>
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 border-4 border-white shadow-md ${activeTab === 'UPGRADE' ? 'bg-blue-600' : 'bg-rose-600'}`}>
                                                        <ArrowRight size={20} strokeWidth={3}/>
                                                    </div>
                                                    <div className="flex-1 bg-white p-5 rounded-[1.8rem] text-center shadow-sm border-2 border-dashed border-slate-200">
                                                        <p className={`text-[8px] font-black uppercase mb-1 italic ${activeTab === 'UPGRADE' ? 'text-blue-500' : 'text-rose-500'}`}>
                                                            {activeTab === 'UPGRADE' ? 'Đề xuất nâng lên' : 'Đề xuất hạ xuống'}
                                                        </p>
                                                        <p className={`text-lg font-black uppercase ${activeTab === 'UPGRADE' ? 'text-blue-600' : 'text-rose-600'}`}>
                                                            {agencyDetail?.targetRank?.rankName}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Bảng so sánh chi tiết đặc quyền */}
                                                <div className="space-y-4">
                                                    <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-2">So sánh thay đổi đặc quyền</h4>
                                                    <div className="grid grid-cols-1 gap-3">
                                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                            <div className="flex items-center gap-3">
                                                                <div>
                                                                    <p className="text-[9px] font-black text-slate-600 uppercase">Hạn mức thấu chi</p>
                                                                    <p className="text-[11px] font-bold text-slate-500">
                                                                        {agencyDetail?.currentRank?.creditLimit?.toLocaleString()}đ
                                                                        <ArrowRight size={10} className="inline mx-2 text-slate-300"/>
                                                                        <span className="text-blue-600 font-black">{agencyDetail?.targetRank?.creditLimit?.toLocaleString()}đ</span>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                            <div className="flex items-center gap-3">
                                                                <div>
                                                                    <p className="text-[9px] font-black text-slate-600 uppercase">Doanh thu duy trì tối thiểu</p>
                                                                    <p className="text-[11px] font-bold text-slate-500">
                                                                        {agencyDetail?.currentRank?.maintainMinRevenue?.toLocaleString()}đ
                                                                        <ArrowRight size={10} className="inline mx-2 text-slate-300"/>
                                                                        <span className="text-blue-600 font-black">{agencyDetail?.targetRank?.maintainMinRevenue?.toLocaleString()}đ</span>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="p-4 bg-blue-50/30 rounded-2xl border border-blue-100/50">
                                                            <p className="text-[9px] font-black text-blue-400 uppercase mb-1">Mô tả đặc quyền hạng mới</p>
                                                            <p className="text-xs font-bold text-slate-600 leading-relaxed italic">
                                                                "{agencyDetail?.targetRank?.description || "Chưa có mô tả chi tiết cho hạng này."}"
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* LỊCH SỬ THAY ĐỔI THỨ HẠNG  */}
                                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-2">
                                                            Lịch sử thăng/hạ hạng
                                                        </h4>
                                                        <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                                                            {agencyDetail?.histories?.length || 0} bản ghi
                                                        </span>
                                                    </div>
                                                    <div className={`relative ml-4 transition-all duration-500 ${
                                                        isHistoryExpanded ? "max-h-[400px] overflow-y-auto pr-3 custom-scrollbar" : "max-h-fit"
                                                    } before:absolute before:inset-y-0 before:left-0 before:w-[1px] before:bg-slate-200`}>
                                                        <div className="space-y-6">
                                                            {agencyDetail?.histories?.length > 0 ? (
                                                                (isHistoryExpanded
                                                                        ? agencyDetail.histories
                                                                        : agencyDetail.histories.slice(0, 3)
                                                                ).map((his, idx) => (
                                                                    <div key={his.id || idx}
                                                                         className="relative pl-7 group">
                                                                        <div
                                                                            className={`absolute left-[-4.5px] top-5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm z-10 ${
                                                                                his.changeType === 'UPGRADE' ? 'bg-emerald-500' :
                                                                                    his.changeType === 'HOLD' ? 'bg-amber-500' : 'bg-rose-500'
                                                                            }`}/>
                                                                        <div
                                                                            className="bg-slate-50/50 hover:bg-white hover:shadow-md border border-slate-100/50 hover:border-slate-200 p-4 rounded-2xl transition-all duration-300">
                                                                            {/* Header Card */}
                                                                            <div
                                                                                className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                                                                <div
                                                                                    className="flex items-center gap-2">
                                                                                    <span
                                                                                        className="text-[11px] font-black text-slate-600 uppercase">{his.oldRank}</span>
                                                                                    <ArrowRight size={10}
                                                                                                className="text-slate-300"/>
                                                                                    <span
                                                                                        className={`text-[11px] font-black uppercase ${
                                                                                            his.changeType === 'UPGRADE' ? 'text-emerald-600' :
                                                                                                his.changeType === 'HOLD' ? 'text-amber-600' : 'text-rose-600'
                                                                                        }`}>
                                                                                        {his.newRank}
                                                                                    </span>
                                                                                </div>
                                                                                <span
                                                                                    className="text-[10px] font-bold text-slate-700">
                                                                                    {his.changedAt ? new Date(his.changedAt).toLocaleDateString('vi-VN') : '---'}
                                                                                </span>
                                                                            </div>

                                                                            {/* Info Grid */}
                                                                            <div className="grid grid-cols-2 gap-4">
                                                                                <div
                                                                                    className="flex items-center gap-1.5 text-slate-600">
                                                                                    <DollarSign size={12}
                                                                                                className="opacity-50"/>
                                                                                    <span
                                                                                        className="text-[10px] font-bold">
                                                                                        Doanh thu: {his.totalRevenue?.toLocaleString()}đ
                                                                                    </span>
                                                                                </div>
                                                                                <div
                                                                                    className="flex items-center gap-1.5 text-slate-600">
                                                                                    <History size={12}
                                                                                             className="opacity-50"/>
                                                                                    <span
                                                                                        className="text-[10px] font-bold uppercase tracking-tighter">
                                                                                        {his.changeType === 'UPGRADE' && 'Nâng hạng'}
                                                                                        {his.changeType === 'HOLD' && 'Giữ hạng'}
                                                                                        {his.changeType === 'DOWNGRADE' && 'Hạ hạng'}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            {/* Reason */}
                                                                            {his.reason && (
                                                                                <div
                                                                                    className="flex items-start gap-2 mt-3 pt-3 border-t border-slate-200/40">
                                                                                    <Info size={12}
                                                                                          className="text-blue-700 mt-0.5 shrink-0"/>
                                                                                    <p className="text-[10px] text-slate-700 italic leading-relaxed">
                                                                                        Lý do: {his.reason}
                                                                                    </p>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div
                                                                    className="py-6 text-center text-[10px] text-slate-400 font-bold uppercase italic tracking-widest">
                                                                Chưa có lịch sử thay đổi
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {/* Nút Xem thêm */}
                                                    {agencyDetail?.histories?.length > 3 && (
                                                        <button
                                                            onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                                                            className="w-full py-2 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 border border-slate-100"
                                                        >
                                                            {isHistoryExpanded ? "Thu gọn lịch sử" : `Xem tiếp (${agencyDetail.histories.length - 3} bản ghi)`}
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Lý do phê duyệt */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center ml-2">
                                                        <label className="text-[9px] font-black text-slate-700 uppercase">Ghi chú phê duyệt <span className="text-rose-500">*</span></label>
                                                        <span className="text-[9px] font-bold text-slate-500 uppercase italic">Tối thiểu 5 ký tự</span>
                                                    </div>
                                                    <textarea
                                                        className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.8rem] outline-none transition-all text-sm min-h-[100px] focus:bg-white focus:border-blue-500 shadow-inner"
                                                        placeholder="Ví dụ: Đại lý có tiềm năng phát triển lớn, các booking đều có giá trị cao..."
                                                        value={reason}
                                                        onChange={(e) => setReason(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            {/* Nút hành động */}
                                            <div className="flex gap-4 pt-8 mt-auto">
                                                <button onClick={() => handleConfirmChange('HOLD')} className="px-8 py-4 rounded-2xl bg-slate-100 text-slate-500 font-black text-[10px] uppercase hover:bg-slate-200 transition-all">
                                                    Giữ nguyên hạng
                                                </button>
                                                <button
                                                    disabled={reason.trim().length < 5}
                                                    onClick={() => handleConfirmChange('APPROVE')}
                                                    className={`flex-1 py-4 rounded-2xl text-white font-black text-[10px] uppercase shadow-xl transition-all flex items-center justify-center gap-2 ${reason.trim().length < 5 ? 'bg-slate-300' : activeTab === 'UPGRADE' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'}`}
                                                >
                                                    <CheckCircle2 size={16}/>
                                                    Xác nhận {activeTab === 'UPGRADE' ? 'Nâng hạng' : 'Hạ hạng'} đối tác
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgencyRankingManager;