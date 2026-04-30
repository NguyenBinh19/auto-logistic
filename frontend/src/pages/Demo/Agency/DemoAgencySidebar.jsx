import React from 'react';
import { useLocation, Link } from "react-router-dom";
import {
    LayoutDashboard,
    Search,
    Users,
    Wallet,
    History,
    CalendarDays,
    CreditCard,
    BarChart3,
    Building2,
    Users2
} from "lucide-react";

const DemoSidebar = () => {
    const location = useLocation();

    const demoRole = localStorage.getItem('demoRole') || "agency";
    const isFullAgency = demoRole === "agency";

    const menuItems = [
        {
            icon: <LayoutDashboard size={20} />,
            label: "DASHBOARD",
            path: "/demo-agency/dashboard"
        },
        {
            icon: <Users2 size={20} />,
            label: "HỒ SƠ CÁ NHÂN",
            path: "/demo-agency/profile"
        },
        {
            icon: <Search size={20} />,
            label: "TÌM KIẾM PHÒNG",
            path: "/demo-agency/search-hotel"
        },
        {
            icon: <Wallet size={20} />,
            label: "TRUNG TÂM TÀI CHÍNH",
            path: "/demo-agency/prepaid",
            subItems: [
                { icon: <Wallet size={18} />, label: "Ví trả trước", path: "/demo-agency/prepaid" },
                { icon: <CreditCard size={18} />, label: "Tín dụng", path: "/demo-agency/credit" },
            ]
        },
        {
            icon: <History size={20} />,
            label: "LỊCH SỬ GIAO DỊCH",
            path: "/demo-agency/transaction-history"
        },
        {
            icon: <CalendarDays size={20} />,
            label: "QUẢN LÝ BOOKING",
            path: "/demo-agency/booking-list",
        }
    ];

    const filteredMenuItems = menuItems.filter(item => {
        if (item.hideForStaff) return false;
        return true;
    });

    return (
        <aside className="w-[260px] h-screen sticky top-0 bg-white flex flex-col border-r border-slate-200 flex-shrink-0 z-40">
            {/* Header Sidebar */}
            <div className="h-16 bg-slate-900 flex flex-col justify-center px-6 shadow-sm flex-shrink-0">
                <span className="text-white text-center font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                    TRAVEL AGENCY
                </span>
                <span className="text-[10px] text-amber-400 font-black uppercase tracking-[0.2em]">
                    Demo Experience Mode
                </span>
            </div>

            {/* Menu List */}
            <div className="flex-1 py-6 overflow-y-auto">
                {filteredMenuItems.map((item, index) => {
                    const isActive = location.pathname.startsWith(item.path);
                    const isParentActive = item.subItems
                        ? item.subItems.some(sub => location.pathname === sub.path)
                        : isActive;

                    return (
                        <div key={index} className="flex flex-col">
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

                            {item.subItems && isParentActive && (
                                <div className="bg-slate-50/50 py-1">
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

            {/* Nút thoát Demo */}
            {/*<div className="p-4 border-t border-slate-100">*/}
            {/*    <button*/}
            {/*        onClick={() => {*/}
            {/*            localStorage.removeItem("isDemoMode");*/}
            {/*            localStorage.removeItem("demoRole");*/}
            {/*            window.location.href = "/demo";*/}
            {/*        }}*/}
            {/*        className="w-full py-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all"*/}
            {/*    >*/}
            {/*        Thoát trải nghiệm*/}
            {/*    </button>*/}
            {/*</div>*/}
        </aside>
    );
};

export default DemoSidebar;