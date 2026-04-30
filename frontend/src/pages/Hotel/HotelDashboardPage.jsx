import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BedDouble, RefreshCcw, Loader2, ChevronRight,
    ArrowUpRight, ArrowDownLeft, Zap, Star, BellRing,
    Target, DoorOpen, ShieldCheck, ArrowRight, BarChart3
} from 'lucide-react';
import { bookingService } from '@/services/booking.service';
import { revenueService } from '@/services/revenue.service';
import { roomTypeService } from '@/services/roomtypes.service';
import { jwtDecode } from "jwt-decode";

const HotelProfessionalDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState(null);
    const [liveBookings, setLiveBookings] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [feedbackStats, setFeedbackStats] = useState(null);
    const [tasks, setTasks] = useState({ checkins: 0, checkouts: 0 });
    const [decisionAlerts, setDecisionAlerts] = useState([]);

    const getHotelId = useCallback(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) return null;
        try {
            const decoded = jwtDecode(token);
            return decoded.hotelId || decoded.hotel_id || JSON.parse(localStorage.getItem("user"))?.hotelId;
        } catch { return null; }
    }, []);

    // Bọc fetchData trong useCallback để tránh re-render vô tận
    const fetchData = useCallback(async (isRefresh = false) => {
        const hotelId = getHotelId();
        if (!hotelId) return;

        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        const today = new Date().toISOString().split('T')[0];

        try {
            const [revRes, bookingRes, feedbackRes, inRes, outRes, roomRes] = await Promise.allSettled([
                revenueService.getRevenueReport({ startDate: today, endDate: today, granularity: 'DAILY' }),
                bookingService.viewAllBookingByHotelId(hotelId),
                bookingService.getHotelFeedbackStats(),
                bookingService.getCheckInToday(),
                bookingService.getTodayDepartures(),
                roomTypeService.getRoomTypesDetailByHotelId(hotelId)
            ]);

            if (revRes.status === 'fulfilled' && revRes.value?.code === 1000) {
                const summary = revRes.value.result.summary;
                setStats(summary);
                generateStrategicAlerts(summary, feedbackRes.value?.result);
            }

            if (bookingRes.status === 'fulfilled' && bookingRes.value?.code === 1000) {
                const all = bookingRes.value.result || [];
                // Lọc trên chuỗi ngày
                const todayList = all.filter(b => {
                    if (!b.createdAt) return false;
                    const d = new Date(b.createdAt);
                    const now = new Date();
                    return d.toDateString() === now.toDateString();
                });
                setLiveBookings(todayList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5));
            }

            if (roomRes.status === 'fulfilled' && roomRes.value?.code === 1000) {
                setRoomTypes(roomRes.value.result || []);
            }

            setFeedbackStats(feedbackRes.status === 'fulfilled' ? feedbackRes.value.result : null);
            setTasks({
                checkins: inRes.status === 'fulfilled' ? (inRes.value.result?.length || 0) : 0,
                checkouts: outRes.status === 'fulfilled' ? (outRes.value.result?.length || 0) : 0
            });

        } catch (error) {
            console.error("Dashboard Error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [getHotelId]);

    const generateStrategicAlerts = (summary, feedback) => {
        const alerts = [];
        if (summary?.occupancyRate < 30) {
            alerts.push({ id: 'low-occ', type: 'danger', title: 'Công suất thấp', desc: `Chỉ đạt ${summary.occupancyRate}%, cần kích hoạt mã giảm giá ngay.`, btn: 'Tạo Coupon', link: '/hotel/coupons' });
        }
        if (feedback?.averageScore < 3.8 && feedback?.totalReviews > 0) {
            alerts.push({ id: 'low-score', type: 'warning', title: 'Chất lượng giảm', desc: `Điểm đánh giá hiện tại là ${feedback.averageScore}.`, btn: 'Xem Review', link: '/hotel/reviews' });
        }
        if (summary?.totalRoomNightsAvailable < 5) {
            alerts.push({ id: 'low-inv', type: 'info', title: 'Sắp hết phòng', desc: `Chỉ còn ${summary.totalRoomNightsAvailable} phòng trống.`, btn: 'Tăng giá ADR', link: '/hotel/room-types' });
        }
        setDecisionAlerts(alerts);
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formatVND = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#F4F7FE] text-[#4318FF]">
            <Loader2 size={40} className="animate-spin mb-4" />
            <span className="font-black uppercase text-[12px] tracking-widest text-[#1B2559]">Đang tải dữ liệu chiến lược...</span>
        </div>
    );

    return (
        <div className="p-5 bg-[#F4F7FE] min-h-screen font-sans text-[#1B2559]">
            <div className="max-w-[1400px] mx-auto space-y-5">

                {/* --- HEADER --- */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-[#1B2559]">TỔNG QUAN HOẠT ĐỘNG</h1>
                        <div className="flex items-center gap-2 text-[#707EAE] font-bold text-[12px] uppercase mt-1">
                            Hôm nay: {new Date().toLocaleDateString('vi-VN')}
                        </div>
                    </div>
                    <button onClick={() => fetchData(true)}
                            className="p-3 bg-white text-[#4318FF] rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
                        <RefreshCcw size={20} className={refreshing ? 'animate-spin' : ''}/>
                    </button>
                </div>

                {/* --- KPI CARDS --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard label="Doanh thu" value={formatVND(stats?.totalRevenue)}
                             trend={stats?.revenueGrowthPercent} icon={<Target size={20}/>} color="blue"/>
                    <KpiCard label="Công suất phòng"value={`${(stats?.occupancyRate || 0).toFixed(2)}%`}
                             trend={stats?.occupancyGrowthPercent} icon={<BedDouble size={20}/>}
                             progress={stats?.occupancyRate} color="purple"/>
                    <KpiCard label="Chỉ số ADR" value={formatVND(stats?.adr)} trend={stats?.adrGrowthPercent}
                             icon={<Zap size={20}/>} color="amber"/>
                    <FeedbackCard stats={feedbackStats} navigate={navigate}/>
                </div>

                {/* --- DECISION ALERTS --- */}
                {/*{decisionAlerts.length > 0 && (*/}
                {/*    <div className={`grid gap-4 ${decisionAlerts.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>*/}
                {/*        {decisionAlerts.map(alert => (*/}
                {/*            <div key={alert.id}*/}
                {/*                 className="bg-white p-4 rounded-2xl border-l-4 border-[#4318FF] shadow-sm flex items-center justify-between border border-slate-100">*/}
                {/*                <div className="flex items-center gap-4">*/}
                {/*                    <div*/}
                {/*                        className={`p-2.5 rounded-xl ${alert.type === 'danger' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>*/}
                {/*                        <BellRing size={20}/>*/}
                {/*                    </div>*/}
                {/*                    <div>*/}
                {/*                        <h4 className="font-black text-[13px] uppercase text-[#1B2559]">{alert.title}</h4>*/}
                {/*                        <p className="text-[12px] text-[#707EAE] font-bold mt-0.5">{alert.desc}</p>*/}
                {/*                    </div>*/}
                {/*                </div>*/}
                {/*                <button onClick={() => navigate(alert.link)}*/}
                {/*                        className="px-4 py-2 bg-[#1B2559] text-white rounded-xl text-[11px] font-black uppercase hover:bg-black transition-all">*/}
                {/*                    Xử lý ngay*/}
                {/*                </button>*/}
                {/*            </div>*/}
                {/*        ))}*/}
                {/*    </div>*/}
                {/*)}*/}
                <div
                    className="bg-white border border-slate-100 p-4 rounded-[24px] shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
                    <div className="flex items-center gap-4">
                        {/* Icon đại diện: Biểu đồ doanh thu */}
                        <div
                            className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform">
                            <BarChart3 size={24}/>
                        </div>

                        <div>
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                                Phân tích & Báo cáo doanh thu
                            </h4>
                            <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                                Xem chi tiết biến động doanh số, công suất phòng và hiệu quả kinh doanh.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/hotel/revenue-report')}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#1B2559] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-900 transition-all shadow-md active:scale-95"
                    >
                        Xem báo cáo <ArrowRight size={14}/>
                    </button>
                </div>

                <div className="grid grid-cols-12 gap-5">
                    {/* TRANSACTIONS TABLE */}
                    <div
                        className="col-span-12 lg:col-span-8 bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                            <h3 className="text-[14px] font-black uppercase text-[#1B2559]">Giao dịch phát sinh</h3>
                            <button onClick={() => navigate('/hotel/front-desk')}
                                    className="text-[11px] font-black text-[#4318FF] hover:underline uppercase">Xem tất
                                cả
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#F7F9FC] text-[11px] font-black text-[#707EAE] uppercase">
                                <tr>
                                    <th className="px-6 py-4">Khách hàng</th>
                                    <th className="px-4 py-4 text-center">Ngày nhận</th>
                                    <th className="px-4 py-4 text-right">Thanh toán</th>
                                    <th className="px-4 py-4 text-center">Trạng thái</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 text-[13px]">
                                {liveBookings.length > 0 ? liveBookings.map((b, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-all group">
                                        <td className="px-6 py-5 max-w-[200px]"> {/* Thêm max-width */}
                                            <p className="font-black text-[#1B2559] truncate">{b.guestName || 'Khách lẻ'}</p>
                                            <p className="text-[11px] font-bold text-[#4318FF] uppercase truncate">{b.agencyName}</p>
                                        </td>
                                        <td className="px-4 py-5 text-center font-bold text-[#1B2559]">{b.checkInDate}</td>
                                        <td className="px-4 py-5 text-right">
                                            <p className="font-black text-[#1B2559]">{formatVND(b.finalAmount)}</p>
                                            <p className={`text-[10px] font-black uppercase ${b.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {b.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                            </p>
                                        </td>
                                        <td className="px-4 py-5 text-center"><StatusBadge status={b.bookingStatus}/>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button onClick={() => navigate(`/hotel/view-booking/${b.bookingCode}`)}
                                                    className="p-2 bg-slate-100 text-[#707EAE] rounded-lg hover:bg-[#4318FF] hover:text-white transition-all">
                                                <ChevronRight size={16}/>
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5"
                                            className="py-24 text-center font-black text-[#707EAE] uppercase text-[11px]">Không
                                            có giao dịch mới
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="col-span-12 lg:col-span-4 space-y-5">
                        {/* OPERATIONS */}
                        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
                            <h3 className="text-[13px] font-black uppercase mb-5 flex items-center gap-2 text-[#1B2559]">
                                Lịch trình hôm nay
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <OperationMini label="Check-in" count={tasks.checkins} color="blue"
                                               onClick={() => navigate('/hotel/front-desk')}/>
                                <OperationMini label="Check-out" count={tasks.checkouts} color="emerald"
                                               onClick={() => navigate('/hotel/front-desk')}/>
                            </div>
                        </div>

                        {/* ROOM TYPES DETAIL */}
                        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-[13px] font-black uppercase text-[#1B2559] flex items-center gap-2">
                                    Quản lý hạng phòng
                                </h3>
                            </div>
                            {/* Thêm max-h và overflow-y-auto */}
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {roomTypes.map((room) => (
                                    <div key={room.roomTypeId}
                                         className="p-4 bg-[#F7F9FC] rounded-2xl hover:bg-white border border-transparent hover:border-slate-200 transition-all group">
                                        <div className="flex justify-between items-start">
                                            <div className="max-w-[85%]">
                                                <p className="text-[12px] font-black text-[#1B2559] uppercase truncate group-hover:text-[#4318FF]">{room.roomTitle}</p>
                                                <p className="text-[11px] font-bold text-[#707EAE] mt-0.5">{room.bedType} • {room.roomArea}m²</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const KpiCard = ({label, value, trend, icon, progress, color}) => {
    const trendValue = parseFloat(trend) || 0;
    const isPositive = trendValue >= 0;
    return (
        <div
            className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 relative group hover:shadow-md transition-all">
            <div className="flex justify-between items-center mb-4">
                <div
                    className={`p-3 rounded-2xl ${color === 'blue' ? 'bg-blue-50 text-[#4318FF]' : color === 'purple' ? 'bg-purple-50 text-purple-600' : 'bg-amber-50 text-amber-600'}`}>
                    {icon}
                </div>
                <div
                    className={`flex items-center font-black text-[11px] ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                    {isPositive ? <ArrowUpRight size={14}/> : <ArrowDownLeft size={14}/>}
                    {Math.abs(trendValue).toFixed(2)}%
                </div>
            </div>
            <p className="text-[11px] font-black text-[#47548C] uppercase tracking-wider">{label}</p>
            <h2 className="text-xl font-black text-[#1B2559] mt-1">{value || "---"}</h2>
            {progress !== undefined && (
                <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#4318FF] transition-all duration-700"
                         style={{width: `${Math.min(progress, 100)}%`}}></div>
                </div>
            )}
        </div>
    );
};

const FeedbackCard = ({stats, navigate}) => {
    const score = stats?.averageScore || 0;
    return (
        <div className="bg-[#1B2559] p-6 rounded-[32px] text-white shadow-lg flex flex-col justify-between group">
            <div className="flex justify-between items-center">
                <p className="text-[11px] font-bold opacity-70 uppercase tracking-wider">Đánh giá</p>
                <Star size={18} className="text-amber-400" fill="currentColor"/>
            </div>
            <div className="my-2">
                <h2 className="text-2xl font-black">{score.toFixed(1)} <span className="text-[12px] opacity-50">/ 5.0</span></h2>
                <p className="text-[10px] font-bold opacity-60 uppercase mt-1">{stats?.totalReviews || 0} lượt bình luận</p>
            </div>
            <button onClick={() => navigate('/hotel/reviews')} className="w-full py-2.5 bg-white/10 hover:bg-white hover:text-[#1B2559] rounded-xl text-[11px] font-black uppercase transition-all">Chi tiết</button>
        </div>
    );
};

const OperationMini = ({ label, count, color, onClick }) => (
    <div onClick={onClick} className="p-4 bg-[#F7F9FC] rounded-2xl cursor-pointer hover:bg-white border border-transparent hover:border-slate-200 transition-all flex flex-col items-center">
        <span className={`text-2xl font-black ${color === 'blue' ? 'text-[#4318FF]' : 'text-emerald-600'}`}>{count}</span>
        <span className="text-[11px] font-black text-[#1B2559] uppercase mt-1">{label}</span>
    </div>
);

const StatusBadge = ({ status }) => {
    const s = status?.toUpperCase();

    const config = {
        'BOOKED': 'bg-amber-100 text-amber-700',
        'CONFIRMED': 'bg-blue-100 text-[#4318FF]',
        'CHECKED-IN': 'bg-indigo-100 text-indigo-700',
        'CHECKED-OUT': 'bg-slate-200 text-slate-700',
        'COMPLETED': 'bg-emerald-100 text-emerald-700',
        'CANCELLED': 'bg-red-100 text-red-700',
        'NO_SHOW': 'bg-rose-100 text-rose-800 border border-rose-200',
    };

    const labels = {
        'BOOKED': 'Đã đặt',
        'CONFIRMED': 'Xác nhận',
        'CHECKED-IN': 'Đang ở',
        'CHECKED-OUT': 'Đã trả phòng',
        'COMPLETED': 'Hoàn tất',
        'CANCELLED': 'Đã hủy',
        'NO_SHOW': 'No-show'
    };

    return (
        <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg whitespace-nowrap ${config[s] || 'bg-slate-100 text-slate-600'}`}>
            {labels[s] || s}
        </span>
    );
};

export default HotelProfessionalDashboard;