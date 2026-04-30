import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BedDouble, RefreshCcw, ChevronRight,
    ArrowUpRight, ArrowDownLeft, Zap, Star, BellRing,
    Target, Calendar
} from 'lucide-react';

// DỮ LIỆU MOCK ĐỂ THAY THẾ API
const MOCK_STATS = {
    totalRevenue: 125000000,
    revenueGrowthPercent: 12.5,
    occupancyRate: 85,
    occupancyGrowthPercent: 5.2,
    adr: 1450000,
    adrGrowthPercent: -2.4,
    totalRoomNightsAvailable: 4
};

const MOCK_BOOKINGS = [
    { guestName: 'Nguyễn Văn A', agencyName: 'Booking.com', checkInDate: '2026-04-15', finalAmount: 2500000, paymentStatus: 'PAID', bookingStatus: 'CONFIRMED', bookingCode: 'BK001' },
    { guestName: 'Trần Thị B', agencyName: 'Agoda', checkInDate: '2026-04-15', finalAmount: 1800000, paymentStatus: 'UNPAID', bookingStatus: 'CHECKED_IN', bookingCode: 'BK002' },
    { guestName: 'Lê Hoàng C', agencyName: 'Khách lẻ', checkInDate: '2026-04-16', finalAmount: 4200000, paymentStatus: 'PAID', bookingStatus: 'BOOKED', bookingCode: 'BK003' },
    { guestName: 'Phạm Minh D', agencyName: 'Traveloka', checkInDate: '2026-04-15', finalAmount: 950000, paymentStatus: 'PAID', bookingStatus: 'COMPLETED', bookingCode: 'BK004' },
    { guestName: 'Hoàng Anh E', agencyName: 'Expedia', checkInDate: '2026-04-14', finalAmount: 3100000, paymentStatus: 'UNPAID', bookingStatus: 'CANCELLED', bookingCode: 'BK005' },
];

const MOCK_ROOM_TYPES = [
    { roomTypeId: 1, roomTitle: 'Deluxe Ocean View', bedType: 'King Bed', roomArea: 35 },
    { roomTypeId: 2, roomTitle: 'Superior Garden', bedType: 'Twin Bed', roomArea: 28 },
    { roomTypeId: 3, roomTitle: 'Suite Family Room', bedType: '2 Double Beds', roomArea: 50 },
    { roomTypeId: 4, roomTitle: 'Standard Single', bedType: 'Single Bed', roomArea: 22 },
];

const HotelDemoDashboard = () => {
    const navigate = useNavigate();
    const formatVND = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

    // Giả lập Decision Alerts dựa trên MOCK_STATS
    const decisionAlerts = [
        { id: 'low-inv', type: 'info', title: 'Sắp hết phòng', desc: `Chỉ còn ${MOCK_STATS.totalRoomNightsAvailable} phòng trống.`, btn: 'Tăng giá ADR', link: '/demo/hotel/room-types' }
    ];

    return (
        <div className="p-5 bg-[#F4F7FE] min-h-screen font-sans text-[#1B2559]">
            <div className="max-w-[1400px] mx-auto space-y-5">

                {/* --- HEADER --- */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-[#1B2559]">TỔNG QUAN HOẠT ĐỘNG (DEMO)</h1>
                        <div className="flex items-center gap-2 text-[#707EAE] font-bold text-[12px] uppercase mt-1">
                            Hôm nay: {new Date().toLocaleDateString('vi-VN')}
                        </div>
                    </div>
                    <button onClick={() => window.location.reload()}
                            className="p-3 bg-white text-[#4318FF] rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all active:scale-95">
                        <RefreshCcw size={20} />
                    </button>
                </div>

                {/* --- KPI CARDS --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard label="Doanh thu" value={formatVND(MOCK_STATS.totalRevenue)}
                             trend={MOCK_STATS.revenueGrowthPercent} icon={<Target size={20}/>} color="blue"/>
                    <KpiCard label="Công suất" value={`${MOCK_STATS.occupancyRate}%`}
                             trend={MOCK_STATS.occupancyGrowthPercent} icon={<BedDouble size={20}/>}
                             progress={MOCK_STATS.occupancyRate} color="purple"/>
                    <KpiCard label="Giá ADR" value={formatVND(MOCK_STATS.adr)} trend={MOCK_STATS.adrGrowthPercent}
                             icon={<Zap size={20}/>} color="amber"/>
                    <FeedbackCard stats={{averageScore: 4.5, totalReviews: 120}} navigate={navigate}/>
                </div>

                {/* --- DECISION ALERTS --- */}
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    {decisionAlerts.map(alert => (
                        <div key={alert.id}
                             className="bg-white p-4 rounded-2xl border-l-4 border-[#4318FF] shadow-sm flex items-center justify-between border border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className={`p-2.5 rounded-xl ${alert.type === 'danger' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-[#4318FF]'}`}>
                                    <BellRing size={20}/>
                                </div>
                                <div>
                                    <h4 className="font-black text-[13px] uppercase text-[#1B2559]">{alert.title}</h4>
                                    <p className="text-[12px] text-[#707EAE] font-bold mt-0.5">{alert.desc}</p>
                                </div>
                            </div>
                            <button onClick={() => navigate(alert.link)}
                                    className="px-4 py-2 bg-[#1B2559] text-white rounded-xl text-[11px] font-black uppercase hover:bg-black transition-all">
                                Xử lý ngay
                            </button>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-12 gap-5">
                    {/* TRANSACTIONS TABLE */}
                    <div className="col-span-12 lg:col-span-8 bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                            <h3 className="text-[14px] font-black uppercase text-[#1B2559]">Giao dịch phát sinh</h3>
                            <button className="text-[11px] font-black text-[#4318FF] hover:underline uppercase">Xem tất cả</button>
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
                                {MOCK_BOOKINGS.map((b, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-all group">
                                        <td className="px-6 py-5 max-w-[200px]">
                                            <p className="font-black text-[#1B2559] truncate">{b.guestName}</p>
                                            <p className="text-[11px] font-bold text-[#4318FF] uppercase truncate">{b.agencyName}</p>
                                        </td>
                                        <td className="px-4 py-5 text-center font-bold text-[#1B2559]">{b.checkInDate}</td>
                                        <td className="px-4 py-5 text-right">
                                            <p className="font-black text-[#1B2559]">{formatVND(b.finalAmount)}</p>
                                            <p className={`text-[10px] font-black uppercase ${b.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {b.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                            </p>
                                        </td>
                                        <td className="px-4 py-5 text-center"><StatusBadge status={b.bookingStatus}/></td>
                                        <td className="px-6 py-5 text-right">
                                            <button className="p-2 bg-slate-100 text-[#707EAE] rounded-lg hover:bg-[#4318FF] hover:text-white transition-all">
                                                <ChevronRight size={16}/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="col-span-12 lg:col-span-4 space-y-5">
                        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
                            <h3 className="text-[13px] font-black uppercase mb-5 flex items-center gap-2 text-[#1B2559]">
                                 Lịch trình hôm nay
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <OperationMini label="Check-in" count={12} color="blue" />
                                <OperationMini label="Check-out" count={5} color="emerald" />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
                            <h3 className="text-[13px] font-black uppercase text-[#1B2559] mb-5">Quản lý hạng phòng</h3>
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {MOCK_ROOM_TYPES.map((room) => (
                                    <div key={room.roomTypeId} className="p-4 bg-[#F7F9FC] rounded-2xl hover:bg-white border border-transparent hover:border-slate-200 transition-all group">
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

// --- SUB-COMPONENTS (GIỮ NGUYÊN TỪ BẢN PROFESSIONAL) ---

const KpiCard = ({label, value, trend, icon, progress, color}) => {
    const isPositive = trend >= 0;
    return (
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 relative group hover:shadow-md transition-all">
            <div className="flex justify-between items-center mb-4">
                <div className={`p-3 rounded-2xl ${color === 'blue' ? 'bg-blue-50 text-[#4318FF]' : color === 'purple' ? 'bg-purple-50 text-purple-600' : 'bg-amber-50 text-amber-600'}`}>
                    {icon}
                </div>
                <div className={`flex items-center font-black text-[11px] ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                    {isPositive ? <ArrowUpRight size={14}/> : <ArrowDownLeft size={14}/>}
                    {Math.abs(trend)}%
                </div>
            </div>
            <p className="text-[11px] font-black text-[#47548C] uppercase tracking-wider">{label}</p>
            <h2 className="text-xl font-black text-[#1B2559] mt-1">{value}</h2>
            {progress !== undefined && (
                <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#4318FF] transition-all duration-700" style={{width: `${progress}%`}}></div>
                </div>
            )}
        </div>
    );
};

const FeedbackCard = ({stats, navigate}) => (
    <div className="bg-[#1B2559] p-6 rounded-[32px] text-white shadow-lg flex flex-col justify-between group">
        <div className="flex justify-between items-center">
            <p className="text-[11px] font-bold opacity-70 uppercase tracking-wider">Đánh giá</p>
            <Star size={18} className="text-amber-400" fill="currentColor"/>
        </div>
        <div className="my-2">
            <h2 className="text-2xl font-black">{stats.averageScore.toFixed(1)} <span className="text-[12px] opacity-50">/ 5.0</span></h2>
            <p className="text-[10px] font-bold opacity-60 uppercase mt-1">{stats.totalReviews} lượt bình luận</p>
        </div>
        <button className="w-full py-2.5 bg-white/10 hover:bg-white hover:text-[#1B2559] rounded-xl text-[11px] font-black uppercase transition-all">Chi tiết</button>
    </div>
);

const OperationMini = ({ label, count, color }) => (
    <div className="p-4 bg-[#F7F9FC] rounded-2xl border border-transparent hover:border-slate-200 transition-all flex flex-col items-center">
        <span className={`text-2xl font-black ${color === 'blue' ? 'text-[#4318FF]' : 'text-emerald-600'}`}>{count}</span>
        <span className="text-[11px] font-black text-[#1B2559] uppercase mt-1">{label}</span>
    </div>
);

const StatusBadge = ({ status }) => {
    const config = {
        'BOOKED': 'bg-amber-100 text-amber-700',
        'CONFIRMED': 'bg-blue-100 text-[#4318FF]',
        'CHECKED_IN': 'bg-indigo-100 text-indigo-700',
        'COMPLETED': 'bg-emerald-100 text-emerald-700',
        'CANCELLED': 'bg-red-100 text-red-700',
    };
    const labels = {
        'BOOKED': 'Đã đặt', 'CONFIRMED': 'Xác nhận', 'CHECKED_IN': 'Đang ở', 'COMPLETED': 'Hoàn tất', 'CANCELLED': 'Đã hủy'
    };
    return (
        <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg whitespace-nowrap ${config[status] || 'bg-slate-100 text-slate-600'}`}>
            {labels[status] || status}
        </span>
    );
};

export default HotelDemoDashboard;