import React, { useEffect, useState } from "react";
import { ShieldAlert, X } from "lucide-react"; // Dùng icon ShieldAlert cho giống Login

export default function SessionExpiredHandler() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("Tài khoản của bạn đã bị khóa.");

    useEffect(() => {
        // Lắng nghe sự kiện từ axios.config.js
        const handleAccountLocked = (event) => {
            const msg = event.detail || "Tài khoản của bạn đã bị khóa do vi phạm chính sách.";
            setMessage(msg);
            setIsOpen(true);
        };

        window.addEventListener("auth:account-locked", handleAccountLocked);

        return () => {
            window.removeEventListener("auth:account-locked", handleAccountLocked);
        };
    }, []);

    const handleLogout = () => {
        // Xóa sạch thông tin đăng nhập
        localStorage.clear();
        sessionStorage.clear();
        // Đóng modal
        setIsOpen(false);

        // Chuyển hướng về Login
        window.location.href = "/login";
    };

    if (!isOpen) return null;

    return (
        // Giao diện Custom
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-zoom-in relative">

                {/* Header Modal (Màu đỏ hồng giống ảnh) */}
                <div className="bg-rose-50 p-6 flex flex-col items-center justify-center text-center border-b border-rose-100">
                    <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mb-4 shadow-inner animate-bounce-short">
                        <ShieldAlert size={32} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800">Tài khoản bị khóa</h3>
                </div>

                {/* Body Modal */}
                <div className="p-6 text-center">
                    <p className="text-slate-600 font-medium leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Footer Modal */}
                <div className="p-4 bg-slate-50 flex justify-center">
                    <button
                        onClick={handleLogout}
                        className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-slate-900/20"
                    >
                        Đăng xuất ngay
                    </button>
                </div>

                {/* Nút tắt nhanh (cũng sẽ logout) */}
                <button
                    onClick={handleLogout}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 hover:bg-white rounded-full transition-all"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Style Animation inline để đảm bảo hiệu ứng chạy mượt */}
            <style>{`
                @keyframes zoom-in { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }
                .animate-zoom-in { animation: zoom-in 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.2s ease-out; }
                @keyframes bounce-short { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
                .animate-bounce-short { animation: bounce-short 0.5s ease-in-out 1; }
            `}</style>
        </div>
    );
}