import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { authService } from "../../services/auth.service.js";
import { 
  CheckCircle, XCircle, Loader2, ArrowLeft, Mail, AlertCircle, ArrowRight 
} from "lucide-react";

import Toast from "../../components/common/notification/Toast.jsx";
import ToastPortal from "../../components/common/notification/ToastPortal";

const BG_URL = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null); // 'success' | 'error'
  const [message, setMessage] = useState("");

  // Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });

  const hasVerified = useRef(false);

  const showToastOnce = (msg, type = "error") => {
    setToast({ show: true, message: msg, type });
  };

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    const verify = async () => {
      // 1. Kiểm tra Token tồn tại
      if (!token) {
        setStatus("error");
        setMessage("Đường dẫn xác minh không hợp lệ. Vui lòng kiểm tra lại email của bạn.");
        setLoading(false);
        return;
      }

      // 2. Gọi API xác minh
      try {
        await authService.verifyEmail(token);
        setStatus("success");
        setMessage("Email của bạn đã được xác minh thành công. Bây giờ bạn có thể đăng nhập và trải nghiệm dịch vụ.");
        showToastOnce("Xác minh thành công!", "success");
      } catch (err) {
        setStatus("error");
        const msg = err.response?.data?.message || "Liên kết xác minh đã hết hạn hoặc không hợp lệ.";
        setMessage(msg);
      } finally {
        // Thêm chút delay giả để người dùng kịp nhìn thấy hiệu ứng loading đẹp mắt
        setTimeout(() => setLoading(false), 800);
      }
    };

    verify();
  }, [token]);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center font-sans bg-slate-900 overflow-hidden px-4">
      
      {/* 1. BACKGROUND LAYER */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat animate-ken-burns-slow"
        style={{ backgroundImage: `url(${BG_URL})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/90 via-slate-900/60 to-blue-900/40 backdrop-blur-[3px]" />
      </div>

      {/* 2. MAIN CARD */}
      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-zoom-in border border-white/50">
        
        {/* Decorative Top Bar */}
        <div className={`h-2 w-full ${
            loading ? "bg-blue-500 animate-pulse" : 
            status === 'success' ? "bg-emerald-500" : "bg-rose-500"
        }`}></div>

        <div className="p-8 md:p-10 text-center">
            
            {/* === TRẠNG THÁI: LOADING === */}
            {loading && (
                <div className="py-8">
                    <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 relative">
                         <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                         <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                         <Mail size={32} className="text-blue-500 relative z-10" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">Đang xác minh...</h2>
                    <p className="text-slate-500 font-medium">Vui lòng đợi trong giây lát.</p>
                </div>
            )}

            {/* === TRẠNG THÁI: THÀNH CÔNG === */}
            {!loading && status === 'success' && (
                <div className="py-2 animate-fade-in-up">
                    <div className="mx-auto w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 animate-bounce-slow shadow-lg shadow-emerald-500/20">
                        <CheckCircle size={48} className="text-emerald-500" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">Thành công! 🎉</h2>
                    <p className="text-slate-600 mb-8 leading-relaxed">
                        {message}
                    </p>
                    
                    <button 
                        onClick={() => navigate("/login")}
                        className="group w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-bold text-lg shadow-xl shadow-emerald-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        Đăng nhập ngay <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            )}

            {/* === TRẠNG THÁI: THẤT BẠI === */}
            {!loading && status === 'error' && (
                <div className="py-2 animate-fade-in-up">
                    <div className="mx-auto w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-rose-500/20">
                        <AlertCircle size={48} className="text-rose-500" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-3">Xác minh thất bại</h2>
                    <p className="text-slate-500 mb-8 leading-relaxed px-2">
                        {message}
                    </p>

                    <div className="space-y-3">
                        <button 
                            onClick={() => navigate("/register")}
                            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-lg active:scale-[0.98]"
                        >
                            Đăng ký lại
                        </button>
                        <button 
                            onClick={() => navigate("/")}
                            className="w-full py-3.5 bg-white border-2 border-slate-100 hover:bg-slate-50 text-slate-600 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={18} /> Về trang chủ
                        </button>
                    </div>
                </div>
            )}

        </div>
      </div>

      {/* Toast Notification */}
      <ToastPortal>
        {toast.show && (
             <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] animate-slide-in-up">
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast({ ...toast, show: false })} 
                />
             </div>
        )}
      </ToastPortal>

      {/* Global Styles for Animations */}
      <style>{`
         @keyframes ken-burns-slow { 
             0% { transform: scale(1); } 
             100% { transform: scale(1.1); } 
         }
         .animate-ken-burns-slow { animation: ken-burns-slow 20s infinite alternate ease-in-out; }
         
         @keyframes zoom-in { 
             0% { opacity: 0; transform: scale(0.95); } 
             100% { opacity: 1; transform: scale(1); } 
         }
         .animate-zoom-in { animation: zoom-in 0.4s cubic-bezier(0.16, 1, 0.3, 1); }

         @keyframes fade-in-up {
             0% { opacity: 0; transform: translateY(10px); }
             100% { opacity: 1; transform: translateY(0); }
         }
         .animate-fade-in-up { animation: fade-in-up 0.5s ease-out; }

         @keyframes bounce-slow {
             0%, 100% { transform: translateY(-5%); }
             50% { transform: translateY(5%); }
         }
         .animate-bounce-slow { animation: bounce-slow 2s infinite ease-in-out; }
      `}</style>
    </div>
  );
};

export default VerifyEmail;