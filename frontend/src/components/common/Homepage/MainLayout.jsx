import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, LogOut, Loader2 } from "lucide-react";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import Sections from "./Section.jsx";
import HotelSection from "@/components/common/Homepage/HotelSection.jsx";
import { userService } from "@/services/user.service";

const MainLayout = () => {
    const navigate = useNavigate();
    const [isApproved, setIsApproved] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        const user = JSON.parse(localStorage.getItem('user') || "{}");

        // CHỈ check nếu: Đã đăng nhập VÀ chưa có ID (đang chờ duyệt)
        const isWaitingForApproval = token && !user.hotelId && !user.agencyId;

        const checkApprovalStatus = async () => {
            try {
                const res = await userService.getMyProfile();
                if (res.code === 1000) {
                    const updatedUser = res.result;
                    const oldUser = JSON.parse(localStorage.getItem('user') || "{}");
                    const approved = (!oldUser.hotelId && updatedUser.hotelId) ||
                        (!oldUser.agencyId && updatedUser.agencyId);

                    if (approved) {
                        setIsApproved(true);
                        return true; // Đã duyệt
                    }
                }
            } catch (err) {
                console.error("Lỗi kiểm tra trạng thái:", err);
            }
            return false;
        };

        if (isWaitingForApproval) {
            // 1. Check ngay lập tức lần đầu
            checkApprovalStatus();
            // 2. Thiết lập quét định kỳ mỗi 10 giây (Polling)
            const interval = setInterval(async () => {
                const isNowApproved = await checkApprovalStatus();
                if (isNowApproved) {
                    clearInterval(interval); // Dừng quét nếu đã thấy duyệt
                }
            }, 10000);

            return () => clearInterval(interval);
        }
    }, []);

    const handleRelogin = () => {
        setLoading(true);
        localStorage.clear();
        sessionStorage.clear();
        setTimeout(() => {
            window.location.href = "/login";
        }, 800);
    };

    return (
        <div className="flex flex-col min-h-screen relative">
            {/* Modal Thông báo khóa toàn bộ màn hình */}
            {isApproved && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
                    <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl text-center animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={48} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase">Chúc mừng đối tác!</h2>
                        <p className="text-slate-600 mb-8 leading-relaxed">
                            Hồ sơ của bạn đã được phê duyệt thành công. Vui lòng đăng nhập lại để cập nhật quyền truy cập và bắt đầu sử dụng hệ thống.
                        </p>
                        <button
                            onClick={handleRelogin}
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "ĐĂNG NHẬP NGAY"}
                        </button>
                    </div>
                </div>
            )}

            {/* KHÓA PHẦN ĐẰNG SAU: Nếu đã duyệt thì ẩn toàn bộ Header/Content */}
            {!isApproved ? (
                <>
                    <Header />
                    <Sections />
                    <HotelSection />
                    <Footer />
                </>
            ) : (
                // Hiển thị một khung xương (skeleton) hoặc ảnh nền mờ để UI không bị "gãy"
                <div className="opacity-20 pointer-events-none">
                    <Header />
                    <Sections />
                </div>
            )}
        </div>
    );
};

export default MainLayout;