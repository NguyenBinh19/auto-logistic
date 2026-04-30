import React from 'react';
import { useLocation, Link } from "react-router-dom";
import {
    LayoutDashboard,
    Search,
    Users,
    Wallet,
    History,
    CalendarDays,
    FileText,
    Map,
    Eye,
    List,
    CreditCard,
    Building2, 
    BarChart3, 
    MessageSquare,
    MessageCircle
} from "lucide-react";

const Sidebar = () => {
    const location = useLocation();
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = currentUser?.roles || "";
    // Kiểm tra xem có phải Admin tổng không
    const isFullAgency = userRole === "ROLE_AGENCY_MANAGER";

    const menuItems = [
        {
            icon: <LayoutDashboard size={20} />,
            label: "DASHBOARD",
            path: "/agency/agency-dashboard"
        },
        {
            icon: <Users size={20} />,
            label: "HỒ SƠ ĐẠI LÝ",
            path: "/agency/agency-profile"
        },
        {
            icon: <Search size={20} />,
            label: "TÌM KIẾM PHÒNG",
            path: "/agency/search-hotel"
        },
        {
            icon: <Users size={20} />,
            label: "QUẢN LÝ NHÂN VIÊN",
            path: "/agency/staff",
            hideForStaff: true,
            subItems: [
                { icon: <Users size={18} />, label: "Danh sách nhân viên", path: "/agency/staff" },
                { icon: <BarChart3 size={18} />, label: "Thống kê doanh số", path: "/agency/staff-spending-limit" },
            ]
        },
        {
            icon: <Wallet size={20} />,
            label: "TRUNG TÂM TÀI CHÍNH",
            path: "/agency/prepaid",
            subItems: [
                { icon: <Wallet size={18} />, label: "Ví trả trước", path: "/agency/prepaid" },
                { icon: <CreditCard size={18} />, label: "Tín dụng", path: "/agency/credit-wallet" },
            ]
        },
        {
            icon: <History size={20} />,
            label: "LỊCH SỬ GIAO DỊCH",
            path: "/agency/transaction-history"
        },
        {
            icon: <CalendarDays size={20} />,
            label: "QUẢN LÝ BOOKING",
            path: "/agency/booking-list",
        },
        {
            icon: <MessageSquare size={20} />,
            label: "PHẢN HỒI TỪ KHÁCH SẠN",
            path: "/agency/feedback-history"
        },
        {
            icon: <MessageCircle size={20} />,
            label: "Trung tâm trò chuyện",
            path: "/agency/chat-page"
        }
    ];

    const filteredMenuItems = menuItems.filter(item => {
        if (!isFullAgency && item.hideForStaff) {
            return false;
        }
        return true;
    });

    return (
        <aside className="w-[260px] h-screen sticky top-0 bg-white flex flex-col border-r border-slate-200 flex-shrink-0">
            {/* Header Sidebar*/}
            <div className="h-16 bg-blue-600 flex items-center px-6 shadow-sm flex-shrink-0">
                <span className="text-white font-bold text-lg uppercase tracking-wide flex items-center gap-2">
                    <Users className="text-white" size={24} /> TRAVEL AGENCY
                </span>
            </div>

            {/* Menu List */}
            <div className="flex-1 py-6 overflow-y-auto">
                {filteredMenuItems.map((item, index) => {
                    // const isExactActive = location.pathname === item.path;
                    //
                    // const isParentActive = item.subItems
                    //     ? item.subItems.some(sub => location.pathname.startsWith(sub.path))
                    //     : location.pathname === item.path;

                    const isActive = location.pathname.startsWith(item.path);

                    const isParentActive = item.subItems
                        ? item.subItems.some(sub => location.pathname.startsWith(sub.path))
                        : isActive;

                    return (
                        <div key={index} className="flex flex-col">
                            {/* Menu Chính */}
                            <Link
                                to={item.path}
                                className={`
                                    flex items-center gap-4 px-6 py-3 cursor-pointer transition-all duration-200 group
                                    ${isActive
                                        ? "text-blue-600 bg-blue-50 border-r-4 border-blue-600 font-bold"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"}
                                `}
                            >
                                <span className={`${isActive ? "" : "group-hover:scale-110 transition-transform"}`}>
                                    {item.icon}
                                </span>
                                <span className="text-sm uppercase tracking-tight">{item.label}</span>
                            </Link>

                            {/* Menu Con: Chỉ hiển thị khi Menu Cha đang Active (đã bấm vào hoặc đang ở các trang con) */}
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
                                                        ? "text-blue-600 font-semibold"
                                                        : "text-slate-500 hover:text-slate-800"}
                                                `}
                                            >
                                                <span className="opacity-70">{sub.icon}</span>
                                                <span className="text-[13px]">{sub.label}</span>
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

export default Sidebar;