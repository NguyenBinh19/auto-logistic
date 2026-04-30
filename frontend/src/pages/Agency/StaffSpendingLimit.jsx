import React, { useState, useEffect } from 'react';
import {
    BarChart3, Search, Wallet, Loader2,
    ChevronRight, Receipt, User,
    TrendingUp, Calendar, ArrowRight, X, CircleDollarSign
} from 'lucide-react';
import { agencyService } from '@/services/agency.service';

// Cấu hình trạng thái
const getStatusConfig = (status) => {
    const s = status?.toUpperCase();
    switch (s) {
        case "BOOKED":
            return { label: "ĐÃ ĐẶT", color: "bg-amber-500" };
        case "CONFIRMED":
            return { label: "ĐÃ XÁC NHẬN", color: "bg-emerald-600" };
        case "CHECKED-IN":
            return { label: "ĐANG LƯU TRÚ", color: "bg-blue-600" };
        case "COMPLETED":
            return { label: "HOÀN THÀNH", color: "bg-slate-600" };
        case "CANCELLED":
            return { label: "ĐÃ HỦY", color: "bg-rose-600" };
        case "NO_SHOW":
            return { label: "KHÔNG ĐẾN", color: "bg-purple-600" };
        default:
            return { label: s, color: "bg-slate-400" };
    }
};
const StaffBookingAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [staffData, setStaffData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

    const fetchSpendingData = async () => {
        setLoading(true);
        try {
            const response = await agencyService.getAgencyStaffBooking();
            setStaffData(response?.result || []);
        } catch (error) {
            console.error("Lỗi lấy dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSpendingData();
    }, []);

    const formatVND = (val) => new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(val || 0);

    const getDisplayName = (staff) => {
        if (!staff.fullName || staff.fullName.includes('null') || staff.fullName.trim() === '') {
            return staff.username;
        }
        return staff.fullName;
    };

    const filteredStaff = staffData.filter(staff =>
        getDisplayName(staff).toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC]">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                <p className="font-bold text-slate-500 tracking-tight">Đang tải dữ liệu doanh số nhân viên...</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 bg-[#F8FAFC] min-h-screen font-sans text-[#1B2559]">
            <div className="max-w-[1600px] mx-auto space-y-6">

                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 rounded-[24px] shadow-sm border border-slate-100">
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter ">Thống kê doanh số nhân viên</h1>
                        <p className="text-xs font-bold text-slate-600  mt-1">Theo dõi hiệu suất đặt phòng thời gian thực</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Tìm kiếm nhân viên..."
                                className="pl-10 pr-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-sm w-full sm:w-80 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Dashboard Cards Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatBox
                        label="Tổng doanh thu"
                        value={formatVND(staffData.reduce((acc, curr) => acc + curr.totalMoneyUsage, 0))}
                        icon={<TrendingUp size={20} />}
                        color="bg-blue-600"
                    />
                    <StatBox
                        label="Tổng số đơn"
                        value={`${staffData.reduce((acc, curr) => acc + curr.totalBooking, 0)} đơn`}
                        icon={<Calendar size={20} />}
                        color="bg-indigo-600"
                    />
                    <StatBox
                        label="Nhân sự hoạt động"
                        value={staffData.length}
                        icon={<User size={20} />}
                        color="bg-slate-800"
                    />
                </div>

                <div className="grid grid-cols-12 gap-6">
                    {/* Danh sách nhân viên */}
                    <div className={`${selectedUser ? 'col-span-12 lg:col-span-7' : 'col-span-12'} transition-all duration-300`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filteredStaff.map((staff) => (
                                <StaffCompactCard
                                    key={staff.userId}
                                    staff={staff}
                                    name={getDisplayName(staff)}
                                    isSelected={selectedUser?.userId === staff.userId}
                                    onSelect={() => setSelectedUser(staff)}
                                    formatVND={formatVND}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Chi tiết đơn hàng khi chọn */}
                    {selectedUser && (
                        <div className="col-span-12 lg:col-span-5 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden sticky top-8">
                                <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200">
                                            {getDisplayName(selectedUser).charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-sm uppercase tracking-tight">{getDisplayName(selectedUser)}</h3>
                                            <p className="text-[10px] font-bold text-slate-400">Danh sách {selectedUser.totalBooking} giao dịch</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedUser(null)}
                                        className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors shadow-sm"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="p-4 space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                                    {selectedUser.bookings?.map((b, idx) => (
                                        <div key={idx} className="group p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-500/30 hover:shadow-md transition-all">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                                                        <CircleDollarSign size={16}/>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className="text-[11px] font-black text-slate-700 uppercase tracking-tight">
                                                                    Giao dịch #{idx + 1}
                                                            </span>
                                                            <StatusBadge status={b.bookingStatus}/>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-sm font-black text-slate-800">{formatVND(b.paymentAmount)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                                    <span className="text-xs font-bold opacity-70">Tổng cộng chi tiêu</span>
                                    <span
                                        className="text-lg font-black">{formatVND(selectedUser.totalMoneyUsage)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Sub-components ---

const StatBox = ({label, value, icon, color}) => (
    <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex items-center gap-5">
        <div className={`${color} p-4 rounded-2xl text-white shadow-lg`}>{icon}</div>
        <div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-xl font-black text-slate-800 tracking-tight">{value}</p>
        </div>
    </div>
);

const StaffCompactCard = ({ staff, name, isSelected, onSelect, formatVND }) => (
    <div
        onClick={onSelect}
        className={`relative overflow-hidden p-5 rounded-[24px] border transition-all duration-300 cursor-pointer group ${
            isSelected
                ? 'bg-blue-600 border-blue-600 shadow-xl shadow-blue-100 ring-4 ring-blue-50'
                : 'bg-white border-slate-100 hover:border-blue-200 shadow-sm'
        }`}
    >
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-colors ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-blue-600'
                }`}>
                    {name.charAt(0)}
                </div>
                <div>
                    <h3 className={`text-sm font-black tracking-tight transition-colors ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                        {name}
                    </h3>
                </div>
            </div>
            <ArrowRight size={16} className={isSelected ? 'text-white' : 'text-slate-300 group-hover:translate-x-1 transition-transform'} />
        </div>

        <div className="space-y-1">
            <p className={`text-[9px] font-black uppercase tracking-[0.1em] ${isSelected ? 'text-blue-100' : 'text-slate-600'}`}>
                Tổng doanh số
            </p>
            <p className={`text-lg font-black tracking-tighter ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                {formatVND(staff.totalMoneyUsage)}
            </p>
        </div>

        <div className={`mt-4 pt-3 border-t flex items-center justify-between ${isSelected ? 'border-white/10' : 'border-slate-50'}`}>
            <div className="flex items-center gap-1">
                <span className={`text-[10px] font-black ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                    {staff.totalBooking} đơn hàng
                </span>
            </div>
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    const config = getStatusConfig(status);
    return (
        <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-tighter text-white shadow-sm ${config.color}`}>
            {config.label}
        </span>
    );
};

export default StaffBookingAnalytics;