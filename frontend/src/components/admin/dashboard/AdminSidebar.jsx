import { useLocation, Link } from "react-router-dom";
import {
    LayoutDashboard, Settings, PenLine, BarChart3,
    CreditCard, Contact2, Users, HandCoins, ShieldCheck,
    ClipboardCheck, Building2, BookOpen, UserRoundCog, FileText, MessageSquareWarning, ShieldAlert, MessageCircle
} from "lucide-react";
import React from "react";

const SidebarAdmin = () => {
    const location = useLocation();
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = currentUser?.roles || "";
    const isFullAdmin = userRole === "ROLE_ADMIN";

    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: "DASHBOARD", path: "/admin/dashboard" },
        {
            icon: <Settings size={20} />,
            label: "CẤU HÌNH HỆ THỐNG",
            path: "/admin/system-config",
            hideForStaff: true

        },
        {
            icon: <UserRoundCog size={20} />,
            label: "QUẢN LÝ NHÂN VIÊN HỆ THỐNG",
            path: "/admin/staff",
            hideForStaff: true
        },
        { icon: <BarChart3 size={20} />, label: "QUẢN LÝ XẾP HẠNG", path: "/admin/ranking-rules", hideForStaff: true },
        { icon: <PenLine size={20} />, label: "QUẢN LÝ HOA HỒNG", path: "/admin/commission", hideForStaff: true },
        { icon: <Contact2 size={20} />, label: "XỬ LÝ XÁC MINH KYC", path: "/admin/kyc-queue" },
        // { icon: <Clock size={20} />, label: "LỊCH SỬ THANH TOÁN", path: "/admin/payment-transaction" },
        { icon: <CreditCard size={20} />, label: "QUẢN LÝ HẠN MỨC & HẠNG", path: "/admin/set-ranking" },
        {
            icon: <HandCoins size={20} />, label: "XỬ LÝ GIAO DỊCH THANH TOÁN", path: "/admin/payout-list",
            subItems: [
                { icon: <FileText size={19} />, label: "TỔNG SAO KÊ", path: "/admin/payout-statements" },
                { icon: <MessageSquareWarning size={19} />, label: "XỬ LÝ KHIẾU NẠI", path: "/admin/dispute" },
            ]
        },
        { icon: <ClipboardCheck size={20} />, label: "QUẢN LÝ ĐẶT PHÒNG", path: "/admin/view-booking" },
        { icon: <Users size={20} />, label: "QUẢN LÝ NGƯỜI DÙNG", path: "/admin/users", hideForStaff: true },
        { icon: <Building2 size={20} />, label: "QUẢN LÝ ĐỐI TÁC", path: "/admin/partners" },
        { icon: <BookOpen size={20} />, label: "NHẬT KÝ HỆ THỐNG", path: "/admin/audit-logs", hideForStaff: true },
        {
            icon: <ShieldAlert size={20} />,
            label: "NHẬT KÝ ĐỐI TÁC",
            path: "/admin/partner-audit",
            hideForStaff: true
        },
        {
            icon: <MessageCircle size={20} />,
            label: "Trung tâm trò chuyện",
            path: "/admin/chat-page"
        }
    ];

    const filteredMenuItems = menuItems.filter(item => {
        if (!isFullAdmin && item.hideForStaff) return false;
        return true;
    });

    return (
        <aside className="w-[280px] h-screen sticky top-0 bg-white flex flex-col border-r border-slate-200 flex-shrink-0 font-sans shadow-lg">
            {/* Header Sidebar */}
            <div className="h-14 bg-[#337ab7] flex items-center px-4 shadow-sm flex-shrink-0">
                <span className="text-white font-semibold text-base uppercase tracking-wider flex items-center gap-3">
                    <ShieldCheck size={22} fill="white" fillOpacity={0.2} />
                    {isFullAdmin ? "SYSTEM ADMIN" : "STAFF ADMIN"}
                </span>
            </div>

            {/* Menu List */}
            <div className="flex-1 overflow-y-auto bg-white py-4">
                {filteredMenuItems.map((item, index) => {
                    // Kiểm tra active cho menu cha
                    const isActive = location.pathname.startsWith(item.path);
                    const isParentActive = item.subItems
                        ? item.subItems.some(sub => location.pathname.startsWith(sub.path)) || isActive
                        : isActive;

                    return (
                        <div key={index} className="flex flex-col">
                            {/* Menu Chính */}
                            <Link
                                to={item.path}
                                className={`
                                    flex items-center gap-4 px-6 py-3.5 transition-all duration-200 group border-l-[4px]
                                    ${isActive
                                        ? "text-[#2e6da4] bg-[#f4f8fb] border-[#337ab7] font-bold"
                                        : "text-[#333] hover:bg-gray-50 hover:text-slate-900 border-transparent font-medium"}
                                `}
                            >
                                <span className={`${isActive ? "text-[#337ab7]" : "text-gray-500 group-hover:scale-110 transition-transform"}`}>
                                    {item.icon}
                                </span>
                                <span className="text-[13px] uppercase tracking-tight">{item.label}</span>
                            </Link>

                            {/* Menu Con */}
                            {item.subItems && isParentActive && (
                                <div className="bg-slate-50/50 py-1 transition-all duration-300">
                                    {item.subItems.map((sub, subIdx) => {
                                        const isSubActive = location.pathname === sub.path;
                                        return (
                                            <Link
                                                key={subIdx}
                                                to={sub.path}
                                                className={`
                                                    flex items-center gap-3 pl-14 pr-6 py-2.5 transition-colors
                                                    ${isSubActive
                                                        ? "text-[#337ab7] font-semibold"
                                                        : "text-slate-500 hover:text-slate-800"}
                                                `}
                                            >
                                                <span className="opacity-70">{sub.icon}</span>
                                                <span className="text-[12px] uppercase">{sub.label}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </aside>
    );
};

export default SidebarAdmin;