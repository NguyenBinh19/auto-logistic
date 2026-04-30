import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import DemoSidebar from "@/pages/Demo/Agency/DemoAgencySidebar.jsx";
import Header from "@/components/common/Homepage/Header";
import Footer from "@/components/common/Homepage/Footer";
import DemoRoleSelect from "@/pages/Demo/DemoRoleSelect";
import { Repeat, UserPlus, LogOut, Building2 } from "lucide-react";

const DemoAgencyLayout = () => {
    const navigate = useNavigate();
    const [showRoleSelect, setShowRoleSelect] = useState(false);
    const [showWelcome, setShowWelcome] = useState(() => {
        const hasSeen = sessionStorage.getItem("hasSeenAgencyWelcome");
        return hasSeen !== "true";
    });

    const handleCloseWelcome = () => {
        setShowWelcome(false);
        sessionStorage.setItem("hasSeenAgencyWelcome", "true");
    };
    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900">

            {/* Header - Vẫn dùng Header chung nhưng bên trong Header bạn nên
                check if(isDemoMode) để hiển thị UI phù hợp */}
            <div className="sticky top-0 z-[60] bg-white shadow-sm w-full">
                <Header/>
            </div>

            {/* 2. Banner Demo - Tinh chỉnh màu sắc và khoảng cách */}
            <div
                className="sticky top-[72px] z-[50] w-full bg-[#2d3fe0] text-white py-2.5 px-6 flex items-center justify-between text-sm font-bold shadow-[0_4px_12px_-2px_rgba(0,0,0,0.15)] mb-6">
                <div className="flex items-center gap-3">
                    <span
                        className="bg-white/20 px-2 py-0.5 rounded text-[10px] uppercase tracking-widest border border-white/10">
                        Demo Mode
                    </span>
                    <span className="font-medium tracking-tight">
                        Bạn đang trải nghiệm với vai trò <strong className="text-blue-100">Agency Manager</strong>
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    {/* Nút Đổi vai trò: Mở Modal */}
                    <button
                        onClick={() => setShowRoleSelect(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-xs border border-white/5"
                    >
                        <Repeat size={14}/> Đổi vai trò
                    </button>

                    {/* Nút Thoát: Về trang chủ */}
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-100 rounded-lg transition-all text-xs border border-red-500/20"
                    >
                        <LogOut size={14}/> Thoát
                    </button>
                </div>
        </div>

    {/* Body */
    }
    <div className="flex flex-1 relative">

        {/* Sidebar phiên bản Demo */}
        <div className="w-[260px] flex-shrink-0 bg-white border-r border-slate-200">
            <DemoSidebar/>
        </div>

        {/* Nội dung trang Demo */}
        <main className="flex-1 bg-slate-50">

            <div className="p-4 md:p-8">
                <Outlet/>
            </div>
        </main>
    </div>

    {/* Footer */
    }
    <div className="flex-shrink-0">
        <Footer/>
    </div>
            {/* 5. Welcome Overlay - Modal chào mừng */}
            {showWelcome && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                    <div className="relative bg-white rounded-3xl p-10 max-w-lg text-center shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Building2 size={40}/>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tighter">
                            Chào mừng đến Demo Agency!
                        </h2>
                        <p className="text-slate-500 mb-8 leading-relaxed text-sm">
                            Bạn đang trải nghiệm hệ thống với vai trò <strong>Agency Manager</strong>.
                            Khám phá cách quản lý danh sách khách sạn và đơn đặt hàng một cách chuyên nghiệp nhất.
                        </p>
                        <button
                            onClick={handleCloseWelcome}
                            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-xl active:scale-95"
                        >
                            Bắt đầu khám phá ngay
                        </button>
                    </div>
                </div>
            )}

            <DemoRoleSelect
                isOpen={showRoleSelect}
                onClose={() => setShowRoleSelect(false)}
            />

</div>
)
    ;
};

export default DemoAgencyLayout;