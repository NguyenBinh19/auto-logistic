import { useLocation, Link } from "react-router-dom";
import {
    Home, Hotel, Tags, Package, CalendarDays,
    LineChart, TicketPercent, Wallet, Bell, MessageSquare, Building2, Users, StarHalf, MessageCircle
} from "lucide-react";

const Sidebar = () => {
    const location = useLocation();
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = currentUser?.roles || "";
    // Kiểm tra xem có phải Admin tổng không
    const isFullHotel = userRole === "ROLE_HOTEL_MANAGER";

    const menuItems = [
        { icon: <Home size={20} />, label: "Dashboard", path: "/hotel/dashboard" },
        { icon: <Users size={20} />, label: "HỒ SƠ KHÁCH SẠN", path: "/hotel/profile" },
        { icon: <Hotel size={20} />, label: "QUẢN LÝ PHÒNG", path: "/hotel/room-types" },
        { icon: <Users size={20} />, label: "QUẢN LÝ NHÂN VIÊN & PHÂN QUYỀN", path: "/hotel/staff", hideForStaff: true, },
        { icon: <Package size={20} />, label: "QUẢN LÝ DỊCH VỤ", path: "/hotel/addon-services" },
        { icon: <CalendarDays size={20} />, label: "LỊCH QUẢN LÝ TỒN KHO", path: "/hotel/rate-allotment" },
        { icon: <LineChart size={20} />, label: "ĐỊNH GIÁ TỰ ĐỘNG", path: "/hotel/dynamic-pricing", hideForStaff: true, },
        { icon: <TicketPercent size={20} />, label: "QUẢN LÝ MÃ GIẢM GIÁ", path: "/hotel/coupons", hideForStaff: true, },
        { icon: <LineChart size={20} />, label: "BÁO CÁO DOANH THU", path: "/hotel/revenue-report" },
        { icon: <Wallet size={20} />, label: "TÀI CHÍNH & THANH TOÁN", path: "/hotel/payout-state", hideForStaff: true, },
        { icon: <Bell size={20} />, label: "QUẦY LỄ TÂN", path: "/hotel/front-desk" },
        // { icon: <MessageSquare size={20} />, label: "TRUNG TÂM TRÒ CHUYỆN", path: "/hotel/chat" },
        { icon: <StarHalf size={20} />, label: "ĐÁNH GIÁ & XẾP HẠNG", path: "/hotel/reviews" },
        { icon: <MessageCircle size={20} />, label: "TRUNG TÂM TRÒ CHUYỆN", path: "/hotel/chat-page" }
    ];

    const filteredMenuItems = menuItems.filter(item => {
        if (!isFullHotel && item.hideForStaff) {
            return false;
        }
        return true;
    });

    return (
        <aside className="w-[260px] h-screen sticky top-0 bg-white flex flex-col border-r border-slate-200 flex-shrink-0">

            {/* Header Sidebar - Giữ cố định */}
            <div className="h-16 bg-blue-600 flex items-center px-6 shadow-md flex-shrink-0 z-10">
                <span className="text-white font-bold text-lg uppercase tracking-wide flex items-center gap-2">
                    <Building2 className="text-white" size={24} /> HOTEL
                </span>
            </div>

            {/* Menu List - Vùng có thể cuộn */}
            <div className="flex-1 overflow-y-auto py-4 space-y-1 custom-scrollbar shadow-[inset_0_-10px_10px_-10px_rgba(0,0,0,0.05)]">
                {filteredMenuItems.map((item, index) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={index}
                            to={item.path}
                            className={`
                                flex items-center gap-4 px-6 py-3 cursor-pointer transition-all duration-200 group relative
                                ${isActive
                                ? "text-blue-600 bg-blue-50/80 font-semibold"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"}
                            `}
                        >
                            {/* Line active trang trí bên phải hoặc trái */}
                            {isActive && (
                                <div className="absolute right-0 top-0 h-full w-1 bg-blue-600 rounded-l-md" />
                            )}

                            <span className={`${isActive ? "scale-110" : "group-hover:scale-110 transition-transform"}`}>
                                {item.icon}
                            </span>
                            <span className="text-sm uppercase tracking-tight leading-tight">{item.label}</span>
                        </Link>
                    );
                })}
            </div>

            {/* Thêm CSS inline cho scrollbar mượt mà */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                }
            `}</style>
        </aside>
    );
};

export default Sidebar;