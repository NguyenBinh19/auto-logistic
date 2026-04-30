import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Wallet, Calendar, CheckCircle2, XCircle, Clock,
    Loader2, ChevronRight, Plus, FileText,
    Download, Star, MapPin, AlertCircle, Info, ShieldAlert, CreditCard
} from 'lucide-react';
import { jwtDecode } from "jwt-decode";

// Services
import { rankService } from '@/services/rank.service';
import { bookingService } from '@/services/booking.service';
import { agencyService } from '@/services/agency.service';
import api from "@/services/axios.config";

const AgencyDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [agencyId, setAgencyId] = useState(null);
    const [agencyData, setAgencyData] = useState(null);
    const navigate = useNavigate();

    const [rankData, setRankData] = useState(null);
    const [finance, setFinance] = useState({
        wallet: 0,
        credit: {
            remainingCredit: 0,
            debt: 0,
            creditLimit: 0,
            usedPercent: 0,
            dueDate: "",
            overdueDebt: 0
        }
    });
    const [monthlyStats, setMonthlyStats] = useState({
        completed: { count: 0, revenue: 0 },
        cancelled: { count: 0, revenue: 0 },
        others: { count: 0, revenue: 0 }
    });
    const [upcoming, setUpcoming] = useState({ day1: [], day2: [] });

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setAgencyId(decoded.agencyId || decoded.agency_id);
            } catch (error) { console.error("Token error", error); }
        }
    }, []);

    const fetchData = async () => {
        if (!agencyId) return;
        setLoading(true);
        try {
            const profileRes = await agencyService.getAgencyProfileDetail();
            const agency = profileRes?.result;

            const [rankRes, creditRes, bookingRes] = await Promise.allSettled([
                rankService.getRankDetail(agency?.rankId),
                api.get(`/agencies/${agencyId}/credit-summary`),
                bookingService.getBookingHistory()
            ]);

            const getRes = (res) => res.status === 'fulfilled' ? res.value : null;

            const creditResponse = getRes(creditRes);
            const creditInfo = creditResponse?.data?.result;

            setRankData(getRes(rankRes)?.result);
            setAgencyData(agency);

            setFinance({
                wallet: agency?.walletBalance || 0,
                credit: creditInfo || null
            });

            const bookings = getRes(bookingRes)?.result?.content || [];
            let stats = { completed: { count: 0, revenue: 0 }, cancelled: { count: 0, revenue: 0 }, others: { count: 0, revenue: 0 } };
            let d1 = [], d2 = [];

            const today = new Date();
            today.setHours(0,0,0,0);

            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            bookings.forEach(b => {
                const bookingDate = new Date(b.createdAt);
                const isThisMonth = bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;

                if (isThisMonth) {
                    if (b.bookingStatus === 'COMPLETED') {
                        stats.completed.count++;
                        stats.completed.revenue += b.finalAmount;
                    } else if (b.bookingStatus === 'CANCELLED') {
                        stats.cancelled.count++;
                        stats.cancelled.revenue += b.finalAmount;
                    } else {
                        stats.others.count++;
                        stats.others.revenue += b.finalAmount;
                    }
                }

                const checkIn = new Date(b.checkInDate).setHours(0,0,0,0);
                const diff = Math.round((checkIn - today.getTime()) / (1000 * 60 * 60 * 24));

                if (b.bookingStatus !== 'CANCELLED') {
                    if (diff === 0 || diff === 1) d1.push(b);
                    else if (diff === 2) d2.push(b);
                }
            });
            setMonthlyStats(stats);
            setUpcoming({ day1: d1, day2: d2 });

        } catch (error) {
            console.error("Fetch error", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [agencyId]);

    const formatVND = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

    if (loading) return <div className="flex h-screen items-center justify-center bg-white"><Loader2 className="animate-spin text-blue-500" size={40}/></div>;

    return (
        <div className="p-6 bg-[#F8FAFC] min-h-screen max-w-[1440px] mx-auto space-y-8 font-sans text-slate-900">

            {/* HEADER SECTION */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                        Chào mừng, {agencyData?.agencyName || "Emerald Travel"}!
                        <span
                            className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase border border-blue-200 shadow-sm shadow-blue-100/50">
                            <Star
                                size={11}
                                fill="currentColor"
                                className="text-blue-500 mb-0.5"
                            />
                            <span className="tracking-wider">
                                {rankData?.rankName || 'HẠNG PHỔ THÔNG'}
                            </span>
                        </span>
                    </h1>
                    <p className="text-slate-500 text-sm font-bold">Chào mừng bạn trở lại hệ thống. Đây là tóm tắt hiệu
                        suất của đại lý.</p>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-8 space-y-8">
                    {/* STATS SECTION */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatSummaryCard
                            label="ĐƠN THÀNH CÔNG" count={monthlyStats.completed.count} revenue={monthlyStats.completed.revenue}
                            icon={<CheckCircle2 size={16} className="text-emerald-500"/>}
                            bg="bg-white" border="border-emerald-100"
                            onDetail={() => navigate('/agency/booking-list')}
                        />
                        <StatSummaryCard
                            label="ĐƠN ĐÃ HỦY" count={monthlyStats.cancelled.count} revenue={monthlyStats.cancelled.revenue}
                            icon={<XCircle size={16} className="text-rose-500"/>}
                            bg="bg-white" border="border-rose-100"
                            onDetail={() => navigate('/agency/booking-list')}
                        />
                        <StatSummaryCard
                            label="ĐƠN KHÁC" count={monthlyStats.others.count} revenue={monthlyStats.others.revenue}
                            icon={<Clock size={16} className="text-blue-500"/>}
                            bg="bg-white" border="border-blue-100"
                            onDetail={() => navigate('/agency/booking-list')}
                        />
                    </div>

                    {/* SCHEDULE SECTION */}
                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Sắp khởi hành</h3>
                                <p className="text-slate-500 text-sm font-bold mt-1 tracking-wider">
                                    Lịch trình trong 48 giờ
                                </p>
                            </div>
                            <button onClick={() => navigate('/agency/booking-list')}
                                    className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-600 transition-colors">Xem tất cả</button>
                        </div>
                        <div className="space-y-10 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            <ScheduleSection title="HÔM NAY / TRONG 24H" list={upcoming.day1.slice(0, 5)} navigate={navigate} />
                            <ScheduleSection title="TRONG 48H TỚI" list={upcoming.day2.slice(0, 5)} navigate={navigate} />
                        </div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-4 space-y-6">
                    {/* VÍ TRẢ TRƯỚC CARD */}
                    <div
                        className="p-6 rounded-[32px] border border-blue-100 bg-white shadow-sm flex items-center gap-5">
                        <div className="p-4 bg-blue-50 rounded-[22px] text-blue-500 border border-blue-100">
                            <Wallet size={24}/>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Ví trả trước</p>
                            <p className="text-2xl font-black text-slate-900 tracking-tight">
                                {formatVND(finance.wallet)}
                            </p>
                        </div>
                    </div>

                    {/* QUẢN LÝ DƯ NỢ */}
                    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-200 space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <CreditCard size={18} className="text-blue-500"/>
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Thông tin tín
                                dụng</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between border-b border-slate-50 pb-2">
                                <span className="text-xs font-black text-slate-500 uppercase tracking-tight">Dư nợ hiện tại</span>
                                <span
                                    className="text-sm font-black text-slate-900">{formatVND(finance.credit?.debt)}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-50 pb-2">
                                <span className="text-xs font-black text-slate-500 uppercase tracking-tight">Hạn thanh toán</span>
                                <span className="text-sm font-black text-blue-500">
                                    {finance.credit?.dueDate ? new Date(finance.credit.dueDate).toLocaleDateString('vi-VN') : "---"}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-slate-50 pb-2">
                                <span className="text-xs font-black text-slate-500 uppercase tracking-tight">Sức mua còn lại</span>
                                <span
                                    className="text-sm font-black text-emerald-500">{formatVND(finance.credit.remainingCredit)}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/agency/credit-wallet')}
                            className="w-full py-4 bg-blue-500 text-white rounded-[20px] font-black text-[13px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-md"
                        >
                            Chi tiết
                        </button>
                    </div>

                    {/* QUICK ACTIONS */}
                    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-200">
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">Thao tác
                            nhanh</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <QuickBtn icon={<Plus size={20}/>} label="Tạo đơn mới"
                                      bg="bg-blue-50 text-blue-600 border-blue-100"
                                      onClick={() => navigate('/agency/search-hotel')}/>
                            <QuickBtn icon={<FileText size={20}/>} label="Lịch sử"
                                      bg="bg-indigo-50 text-indigo-600 border-indigo-100"
                                      onClick={() => navigate('/agency/transaction-history')}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS ---

const StatSummaryCard = ({label, count, revenue, icon, border, onDetail}) => (
    <div className={`p-6 rounded-[32px] border ${border} bg-white shadow-sm group relative`}>
        <div className="flex justify-between items-start mb-6">
            <div
                className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 group-hover:bg-blue-500 group-hover:text-white transition-colors">{icon}</div>
            <span
                className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Tháng này</span>
        </div>
        <div className="space-y-1">
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 leading-none">{count}</span>
                <span className="text-[10px] font-black text-slate-500 uppercase leading-none">{label}</span>
            </div>
            <p className="text-lg font-black text-blue-500 tracking-tight leading-none pt-1">{new Intl.NumberFormat('vi-VN').format(revenue)}₫</p>
        </div>
        <button
            onClick={onDetail}
            className="mt-6 flex items-center gap-1 text-[10px] font-black text-slate-900 hover:text-blue-500 transition-colors uppercase tracking-widest"
        >
            Chi tiết <ChevronRight size={12}/>
        </button>
    </div>
);

const ScheduleSection = ({ title, list, totalCount, navigate }) => (
    <div className="space-y-6">
        <div className="flex items-center justify-between sticky top-0 bg-white py-2 z-10">
            <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]"></div>
                <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-widest">{title}</h4>
            </div>
            {totalCount > 0 && (
                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                    {totalCount} đơn hàng
                </span>
            )}
        </div>

        <div className="space-y-4">
            {list.length > 0 ? (
                <>
                    {list.map((item, idx) => (
                        <div
                            key={idx}
                            onClick={() => navigate(`/agency/booking-list/detail/${item.bookingCode}`)}
                            className="flex items-center justify-between p-5 bg-white hover:bg-blue-50/30 rounded-[24px] border border-slate-100 hover:border-blue-200 transition-all cursor-pointer group shadow-sm"
                        >
                            <div className="flex items-center gap-5">
                                <div
                                    className="w-14 h-14 bg-slate-900 rounded-2xl flex flex-col items-center justify-center border border-slate-800 shadow-sm">
                                    <span
                                        className="text-[9px] font-black text-slate-500 uppercase">TH{new Date(item.checkInDate).getMonth() + 1}</span>
                                    <span
                                        className="text-xl font-black text-white">{new Date(item.checkInDate).getDate()}</span>
                                </div>
                                <div className="space-y-1">
                                    <h5 className="text-sm font-black text-slate-900 group-hover:text-blue-500 transition-colors uppercase truncate max-w-[180px] tracking-tight">{item.hotelName}</h5>
                                    <div
                                        className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase">
                                        <span>Code: <span className="text-blue-500">#{item.bookingCode}</span></span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                {/* Đổi items-end thành items-center cho cả cụm này */}
                                {item.paymentStatus === 'PAID' ? (
                                    <span
                                        className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-full uppercase border border-emerald-100">
                                        Đã thanh toán
                                    </span>
                                ) : (
                                    <span
                                        className="px-3 py-1 bg-amber-50 text-amber-600 text-[9px] font-black rounded-full uppercase border border-amber-100">
                                    Chờ thanh toán
                                </span>
                                )}
                                <p className="text-[10px] font-black text-slate-500 uppercase ">
                                    Xem chi tiết
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Nút Xem thêm nếu còn đơn */}
                    {totalCount > 5 && (
                        <button
                            onClick={() => navigate('/agency/booking-list')}
                            className="w-full py-4 border-2 border-dashed border-slate-100 rounded-[24px] text-[10px] font-black text-blue-500 uppercase tracking-widest hover:bg-blue-50 hover:border-blue-200 transition-all flex items-center justify-center gap-2 group"
                        >
                            Xem thêm {totalCount - 5} đơn hàng khác
                            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    )}
                </>
            ) : (
                <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-[24px] bg-slate-50/50">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">Không có lịch trình phù hợp</p>
                </div>
            )}
        </div>
    </div>
);

const QuickBtn = ({ icon, label, bg, onClick }) => (
    <button onClick={onClick} className={`${bg} p-5 rounded-[24px] border flex flex-col items-center gap-3 hover:shadow-md hover:translate-y-[-2px] transition-all active:scale-95 group w-full`}>
        <div className="group-hover:scale-110 transition-transform">{icon}</div>
        <span className="text-[10px] font-black uppercase tracking-tight text-center leading-tight">{label}</span>
    </button>
);

export default AgencyDashboard;