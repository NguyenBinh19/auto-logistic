import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Wallet, Calendar, CheckCircle2, XCircle, Clock,
    Loader2, ChevronRight, Plus, FileText,
    Star, AlertCircle, CreditCard, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';

// Sử dụng dữ liệu Mock
import {
    MOCK_AGENCY_DATA,
    MOCK_TRANSACTIONS
} from '@/constant/agency_mockData.js';

const DemoAgencyDashboard = () => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Dữ liệu Mock từ hằng số
    const agency = MOCK_AGENCY_DATA;
    const transactions = MOCK_TRANSACTIONS;

    // Giả lập logic lịch trình sắp tới
    const upcomingDemo = {
        day1: [
            { bookingCode: "DEMO01", hotelName: "Vinpearl Luxury Resort", checkInDate: new Date(), paymentStatus: 'PAID' },
            { bookingCode: "DEMO02", hotelName: "InterContinental Danang", checkInDate: new Date(), paymentStatus: 'PENDING' }
        ],
        day2: [
            { bookingCode: "DEMO03", hotelName: "JW Marriott Phu Quoc", checkInDate: new Date(Date.now() + 172800000), paymentStatus: 'PAID' }
        ]
    };

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const formatVND = (val) => new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
    }).format(val || 0);

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-white">
            <Loader2 className="animate-spin text-blue-500" size={40}/>
        </div>
    );

    return (
        <div className="p-6 bg-[#F8FAFC] min-h-screen max-w-[1440px] mx-auto space-y-8 font-sans text-slate-900">
            {/* HEADER SECTION  */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                        Chào mừng, {agency.agencyName} (Demo)!
                        <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase border border-blue-200 shadow-sm shadow-blue-100/50">
                            <Star size={11} fill="currentColor" className="text-blue-500 mb-0.5" />
                            <span className="tracking-wider">{agency.rank.name}</span>
                        </span>
                    </h1>
                    <p className="text-slate-500 text-sm font-bold">Chế độ trải nghiệm dữ liệu mẫu. Mọi thao tác sẽ không lưu lại.</p>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* CỘT TRÁI - 8 COL */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                    {/* STATS SECTION  */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatSummaryCard
                            label="ĐƠN THÀNH CÔNG" count={agency.stats.newBookings} revenue={125000000}
                            icon={<CheckCircle2 size={16} className="text-emerald-500"/>}
                            border="border-emerald-100"
                            onDetail={() => navigate('/demo-agency/booking-list')}
                        />
                        <StatSummaryCard
                            label="ĐƠN ĐÃ HỦY" count={2} revenue={15000000}
                            icon={<XCircle size={16} className="text-rose-500"/>}
                            border="border-rose-100"
                            onDetail={() => navigate('/demo-agency/booking-list')}
                        />
                        <StatSummaryCard
                            label="ĐƠN KHÁC" count={5} revenue={25000000}
                            icon={<Clock size={16} className="text-blue-500"/>}
                            border="border-blue-100"
                            onDetail={() => navigate('/demo-agency/booking-list')}
                        />
                    </div>

                    {/* SCHEDULE SECTION */}
                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Sắp khởi hành
                                    (Demo)</h3>
                                <p className="text-slate-500 text-sm font-bold mt-1 tracking-wider">Lịch trình giả
                                    lập</p>
                            </div>
                            <button
                                onClick={() => navigate('/demo-agency/booking-list')}
                                className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-600"
                            >
                                Xem tất cả
                            </button>
                        </div>
                        <div className="space-y-10 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar text-left">
                            <ScheduleSection title="HÔM NAY / TRONG 24H" list={upcomingDemo.day1} navigate={navigate}/>
                            <ScheduleSection title="TRONG 48H TỚI" list={upcomingDemo.day2} navigate={navigate} />
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI - 4 COL */}
                <div className="col-span-12 lg:col-span-4 space-y-6 text-left">

                    {/* VÍ TRẢ TRƯỚC CARD */}
                    <div className="p-6 rounded-[32px] border border-blue-100 bg-white shadow-sm flex items-center gap-5">
                        <div className="p-4 bg-blue-50 rounded-[22px] text-blue-500 border border-blue-100">
                            <Wallet size={24}/>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Ví trả trước</p>
                            <p className="text-2xl font-black text-slate-900 tracking-tight">
                                {formatVND(agency.finance.walletBalance)}
                            </p>
                        </div>
                    </div>

                    {/* QUẢN LÝ DƯ NỢ  */}
                    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-200 space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <CreditCard size={18} className="text-blue-500"/>
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Thông tin tín dụng</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between border-b border-slate-50 pb-2">
                                <span className="text-xs font-black text-slate-500 uppercase tracking-tight">Dư nợ hiện tại</span>
                                <span className="text-sm font-black text-slate-900">{formatVND(agency.finance.currentCredit)}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-50 pb-2">
                                <span className="text-xs font-black text-slate-500 uppercase tracking-tight">Hạn thanh toán</span>
                                <span className="text-sm font-black text-blue-500">{agency.finance.dueDate}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-50 pb-2">
                                <span className="text-xs font-black text-slate-500 uppercase tracking-tight">Sức mua còn lại</span>
                                <span className="text-sm font-black text-emerald-500">{formatVND(agency.finance.availableCredit)}</span>
                            </div>
                        </div>
                        <button onClick={() => navigate('/demo-agency/credit')} className="w-full py-4 bg-blue-500 text-white rounded-[20px] font-black text-[13px] uppercase tracking-widest hover:bg-blue-600 shadow-md">
                            Chi tiết
                        </button>
                    </div>

                    {/* QUICK ACTIONS  */}
                    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-200">
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">Thao tác nhanh</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <QuickBtn icon={<Plus size={20}/>} label="Tạo đơn mới" bg="bg-blue-50 text-blue-600 border-blue-100" onClick={() => navigate('/demo-agency/search-hotel')}/>
                            <QuickBtn icon={<FileText size={20}/>} label="Lịch sử" bg="bg-indigo-50 text-indigo-600 border-indigo-100" onClick={() => navigate('/demo-agency/transaction-history')}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS  ---

const StatSummaryCard = ({label, count, revenue, icon, border, onDetail}) => (
    <div className={`p-6 rounded-[32px] border ${border} bg-white shadow-sm group relative text-left`}>
        <div className="flex justify-between items-start mb-6">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 group-hover:bg-blue-500 group-hover:text-white transition-colors">{icon}</div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Tháng này</span>
        </div>
        <div className="space-y-1">
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 leading-none">{count}</span>
                <span className="text-[10px] font-black text-slate-500 uppercase leading-none">{label}</span>
            </div>
            <p className="text-lg font-black text-blue-500 tracking-tight leading-none pt-1">{new Intl.NumberFormat('vi-VN').format(revenue)}₫</p>
        </div>
        <button onClick={onDetail} className="mt-6 flex items-center gap-1 text-[10px] font-black text-slate-900 hover:text-blue-500 transition-colors uppercase tracking-widest">
            Chi tiết <ChevronRight size={12}/>
        </button>
    </div>
);

const ScheduleSection = ({ title, list, navigate }) => (
    <div className="space-y-6">
        <div className="flex items-center gap-3 sticky top-0 bg-white py-2 z-10">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]"></div>
            <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-widest">{title}</h4>
        </div>
        <div className="space-y-4">
            {list.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-5 bg-white hover:bg-blue-50/30 rounded-[24px] border border-slate-100 hover:border-blue-200 transition-all cursor-pointer group shadow-sm">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-slate-900 rounded-2xl flex flex-col items-center justify-center border border-slate-800 shadow-sm">
                            <span className="text-[9px] font-black text-slate-500 uppercase">TH{item.checkInDate.getMonth() + 1}</span>
                            <span className="text-xl font-black text-white">{item.checkInDate.getDate()}</span>
                        </div>
                        <div className="space-y-1">
                            <h5 className="text-sm font-black text-slate-900 group-hover:text-blue-500 transition-colors uppercase truncate max-w-[180px] tracking-tight">{item.hotelName}</h5>
                            <div className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase">
                                <span>Code: <span className="text-blue-500">#{item.bookingCode}</span></span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <span className={`px-3 py-1 ${item.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'} text-[9px] font-black rounded-full uppercase border`}>
                            {item.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                        </span>
                        <p className="text-[10px] font-black text-slate-500 uppercase ">Xem chi tiết</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const QuickBtn = ({ icon, label, bg, onClick }) => (
    <button onClick={onClick} className={`${bg} p-5 rounded-[24px] border flex flex-col items-center gap-3 hover:shadow-md hover:translate-y-[-2px] transition-all active:scale-95 group w-full`}>
        <div className="group-hover:scale-110 transition-transform">{icon}</div>
        <span className="text-[10px] font-black uppercase tracking-tight text-center leading-tight">{label}</span>
    </button>
);

export default DemoAgencyDashboard;