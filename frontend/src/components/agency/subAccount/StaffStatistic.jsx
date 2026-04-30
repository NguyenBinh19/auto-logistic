import React from 'react';
import { Users, CreditCard, PieChart } from 'lucide-react';

const AgencyStaffStats = ({ data = [] }) => {
    const totalStaff = data.length;
    const activeStaff = data.filter(s => s.status === 'ACTIVE').length;

    // // Giả sử mỗi nhân viên có trường usedAmount và limitAmount
    // const totalUsed = data.reduce((sum, s) => sum + (s.used || 0), 0);
    // const totalLimit = data.reduce((sum, s) => sum + (s.limit || 0), 0);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            <StatCard title="Tổng nhân viên" value={totalStaff} icon={Users} color="text-blue-600" />
            <StatCard title="Đang hoạt động" value={activeStaff} icon={PieChart} color="text-emerald-600" />
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, color, description }) => (
    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-5">
        <div className={`p-4 rounded-2xl ${color.replace('text-', 'bg-').replace('600', '50')} ${color}`}><Icon size={24} /></div>
        <div>
            <h3 className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">{title}</h3>
            <p className="text-xl font-black text-slate-800">{value}</p>
            {description && <p className="text-[10px] text-slate-400 font-medium">{description}</p>}
        </div>
    </div>
);

export default AgencyStaffStats;