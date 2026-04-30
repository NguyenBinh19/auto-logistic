// IMPORT GIỮ NGUYÊN
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail, ArrowLeft, Loader2, KeyRound, CheckCircle2, Home
} from "lucide-react";
import { authService } from "../../services/auth.service.js";

import Toast from "../../components/common/notification/Toast.jsx";
import ToastPortal from "../../components/common/notification/ToastPortal.jsx";
import LoginSlider from "../../components/auth/LoginSlider.jsx";

const BG_URL = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Vui lòng nhập email.");
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setIsSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.message || "Email không tồn tại.";
      setError(msg);
      setToast({ show: true, message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden flex items-center justify-center font-sans bg-slate-900">

      {/* BACKGROUND */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${BG_URL})` }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px]" />
      </div>

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate("/login")}
        className="absolute top-6 left-6 z-30 flex items-center gap-2 text-white/90 hover:text-white px-4 py-2 rounded-full bg-white/10 border border-white/20"
      >
        <ArrowLeft size={18} />
        <span>Quay lại</span>
      </button>

      {/* MAIN CARD GIỮ NGUYÊN LOGIN */}
      <div className="relative z-10 w-full h-full md:h-auto md:max-w-6xl md:aspect-[16/9] bg-white md:rounded-[2.5rem] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">

        {/* 🔥 SLIDER GIỮ NGUYÊN */}
        <LoginSlider />

        {/* RIGHT SIDE */}
        <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">

          <div className="max-w-md mx-auto w-full">

            {/* TITLE */}
            <div className="mb-8 text-center">
              {isSuccess ? (
                <>
                  <CheckCircle2 className="mx-auto text-emerald-500 mb-4" size={40} />
                  <h2 className="text-2xl font-bold">Đã gửi email!</h2>
                  <p className="text-slate-500 mt-2">
                    Kiểm tra email để đặt lại mật khẩu
                  </p>
                </>
              ) : (
                <>
                  <KeyRound className="mx-auto text-blue-500 mb-4" size={36} />
                  <h2 className="text-2xl font-bold">Quên mật khẩu?</h2>
                  <p className="text-slate-500">
                    Nhập địa chỉ email liên kết với tài khoản của bạn.Chúng tôi sẽ gửi mã xác thực để đặt lại mật khẩu
                  </p>
                </>
              )}
            </div>

            {/* SUCCESS */}
            {isSuccess ? (
              <button
                onClick={() => navigate("/login")}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold"
              >
                Quay lại đăng nhập
              </button>
            ) : (
              <>
                {error && (
                  <div className="mb-4 text-red-500 text-sm font-bold text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 pl-10">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email của bạn"
                        className="w-full pl-10 pr-4 py-3 border rounded-xl"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex justify-center"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : "Gửi link xác thực"}
                  </button>

                </form>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="w-full py-3 bg-slate-200 text-slate-700 rounded-xl font-bold 
               hover:bg-slate-300 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={18} />
                    Quay lại đăng nhập
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* TOAST */}
      <ToastPortal>
        {toast.show && (
          <div className="fixed top-6 right-6">
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast({ ...toast, show: false })}
            />
          </div>
        )}
      </ToastPortal>
    </div>
  );
};

export default ForgotPassword;