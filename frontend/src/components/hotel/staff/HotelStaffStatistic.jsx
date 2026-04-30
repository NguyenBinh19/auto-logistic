import React from 'react';
import { Users, UserCheck, CreditCard } from 'lucide-react';

const StatCard = ({ title, value, color, icon: Icon, description }) => (
    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        {/* Trang trí nền */}
        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 group-hover:scale-110 transition-transform ${color.replace('text-', 'bg-')}`} />

        <div className="flex items-center gap-4 relative z-10">
            <div className={`p-3 rounded-2xl ${color.replace('text-', 'bg-').replace('600', '50')} ${color}`}>
                <Icon size={24} />
            </div>
            <div>
                <h3 className="text-[12px] font-bold text-slate-600 mb-0.5 uppercase tracking-widest">
                    {title}
                </h3>
                <p className="text-2xl font-black text-slate-800 leading-none">
                    {value}
                </p>
                {description && (
                    <p className="text-[10px] text-slate-500 mt-1 font-medium italic">
                        {description}
                    </p>
                )}
            </div>
        </div>
    </div>
);

const StaffStats = ({ data = [] }) => {
    // 1. Tính tổng nhân viên
    const totalStaff = data.length;

    // 2. Tính số nhân viên đang hoạt động (ACTIVE)
    const activeStaff = data.filter(s => s.status === 'ACTIVE').length;

    // 3. Định dạng hạn mức (Ví dụ cố định hoặc tính toán nếu có trường dữ liệu)
    const totalLimit = "100.000.000";

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard
                title="Tổng nhân viên"
                value={totalStaff < 10 ? `0${totalStaff}` : totalStaff}
                color="text-blue-600"
                icon={Users}
                description="Nhân sự trong hệ thống"
            />
            <StatCard
                title="Đang hoạt động"
                value={activeStaff < 10 ? `0${activeStaff}` : activeStaff}
                color="text-emerald-600"
                icon={UserCheck}
                description="Tài khoản sẵn sàng"
            />
        </div>
    );
};

export default StaffStats;