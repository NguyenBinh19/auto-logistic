import { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ShieldCheck, ArrowLeft, Loader2, CheckCircle2, RefreshCw, LogIn,
} from "lucide-react";
import { authService } from "../../services/auth.service.js";
import LoginSlider from "../../components/auth/LoginSlider.jsx";
import Toast from "../../components/common/notification/Toast";
import ToastPortal from "../../components/common/notification/ToastPortal";

const BG_URL =
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop";

const OTP_LENGTH = 6;
const COOLDOWN_SECONDS = 60;

const maskEmail = (email) => {
  if (!email) return "";
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(local.length - 2, 2))}@${domain}`;
};

const VerifyOtp = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email") || "";

  // OTP input state
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const inputRefs = useRef([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const next = [...otp];
    next[index] = value;
    setOtp(next);
    setError("");

    // Auto-advance
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (value && index === OTP_LENGTH - 1 && next.every((d) => d)) {
      submitOtp(next.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;

    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtp(next);
    setError("");

    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();

    if (pasted.length === OTP_LENGTH) {
      submitOtp(pasted);
    }
  };

  const submitOtp = async (code) => {
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const res = await authService.verifyOtp(email, code);
      // Store token if returned
      if (res?.result?.token) {
        localStorage.setItem("accessToken", res.result.token);
      }
      setIsSuccess(true);
      setToast({ show: true, message: "Xác thực thành công!", type: "success" });
    } catch (err) {
      const msg =
        err.response?.data?.message || "Mã OTP không đúng. Vui lòng thử lại.";
      setError(msg);
      // Clear inputs on error
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    setError("");

    try {
      await authService.resendOtp(email);
      setResendCooldown(COOLDOWN_SECONDS);
      setToast({ show: true, message: "Đã gửi lại mã OTP!", type: "success" });
    } catch (err) {
      const msg = err.response?.data?.message || "Không thể gửi lại OTP. Vui lòng thử lại sau.";
      setError(msg);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden flex items-center justify-center font-sans bg-slate-900">
      {/* Background */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat animate-ken-burns-slow"
        style={{ backgroundImage: `url(${BG_URL})` }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px]" />
      </div>

      {/* Back button */}
      <button
        onClick={() => navigate("/login")}
        className="absolute top-6 left-6 z-30 flex items-center gap-2 text-white/90 hover:text-white px-4 py-2 rounded-full bg-white/10 border border-white/20 shadow-lg hover:bg-white/20 transition-all group backdrop-blur-md"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-bold">Quay lại</span>
      </button>

      {/* Main card - split layout */}
      <div className="relative z-10 w-full h-full md:h-auto md:max-w-6xl md:aspect-[16/9] bg-white md:rounded-[2.5rem] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 animate-zoom-in">

        <LoginSlider />

        <div className="flex flex-col relative overflow-y-auto custom-scrollbar bg-white">
          <div className="flex-1 flex flex-col justify-center p-8 md:p-12 lg:p-16">
            <div className="max-w-md mx-auto w-full">

              {/* Header */}
              <div className="mb-10 relative">
                <div className="absolute -top-10 -left-10 w-20 h-20 bg-cyan-100 rounded-full blur-xl opacity-50"></div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-inner transition-colors duration-500 ${isSuccess ? "bg-emerald-50" : "bg-cyan-50"}`}>
                  {isSuccess ? (
                    <CheckCircle2 size={32} className="text-blue-500" />
                  ) : (
                    <ShieldCheck size={32} className="text-cyan-600" />
                  )}
                </div>
                <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-2">
                  {isSuccess ? "Xác thực thành công!" : "Xác thực OTP"}
                </h1>
                {!isSuccess && (
                  <p className="text-slate-500 text-base font-medium leading-relaxed">
                    Mã xác thực 6 chữ số đã được gửi đến{" "}
                    <span className="font-bold text-slate-700">{maskEmail(email)}</span>
                  </p>
                )}
                <div className={`h-1.5 w-20 rounded-full mt-4 bg-gradient-to-r ${isSuccess ? "from-blue-500 to-cyan-400" : "from-cyan-500 to-blue-400"}`}></div>
              </div>

              {/* Success state */}
              {isSuccess ? (
                <div className="animate-fade-in-up space-y-6">
                  <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
                    <p className="text-slate-700 text-sm leading-relaxed text-center">
                      Tài khoản của bạn đã được kích hoạt thành công.
                      <br />
                      Bạn có thể đăng nhập ngay bây giờ.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/login")}
                    className="group w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    Đăng nhập ngay <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              ) : (
                /* OTP form */
                <div className="space-y-6">
                  {/* Error alert */}
                  {error && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold text-center animate-shake">
                      {error}
                    </div>
                  )}

                  {/* OTP inputs */}
                  <div className="flex justify-center gap-3">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => (inputRefs.current[i] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        onPaste={i === 0 ? handlePaste : undefined}
                        disabled={loading}
                        className={`w-12 h-14 text-center text-xl font-black rounded-xl border-2 outline-none transition-all duration-200 ${digit
                            ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                            : "border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300"
                          } focus:border-blue-500 focus:bg-white focus:shadow-lg focus:shadow-blue-500/10 disabled:opacity-50`}
                      />
                    ))}
                  </div>

                  {/* Submit button */}
                  <button
                    onClick={() => submitOtp(otp.join(""))}
                    disabled={loading || otp.some((d) => !d)}
                    className={`group w-full py-4 rounded-2xl font-black text-lg shadow-xl transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3 ${otp.every((d) => d) && !loading
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/20 cursor-pointer"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                      }`}
                  >
                    {loading ? (
                      <><Loader2 className="animate-spin" /> Đang xác thực...</>
                    ) : (
                      "Xác nhận"
                    )}
                  </button>

                  {/* Resend OTP */}
                  <div className="text-center">
                    <p className="text-sm text-slate-500 mb-2">Không nhận được mã?</p>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendCooldown > 0 || resendLoading}
                      className={`inline-flex items-center gap-2 text-sm font-bold transition-colors ${resendCooldown > 0 || resendLoading
                          ? "text-slate-400 cursor-not-allowed"
                          : "text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                        }`}
                    >
                      {resendLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <RefreshCw size={14} />
                      )}
                      {resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : "Gửi lại mã OTP"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      <ToastPortal>
        {toast.show && (
          <div className="fixed top-6 right-6 z-50 animate-slide-in-right">
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast({ ...toast, show: false })}
            />
          </div>
        )}
      </ToastPortal>

      <style>{`
        @keyframes ken-burns-slow { 0% { transform: scale(1); } 100% { transform: scale(1.15); } }
        .animate-ken-burns-slow { animation: ken-burns-slow 20s infinite alternate ease-in-out; }
        @keyframes zoom-in { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }
        .animate-zoom-in { animation: zoom-in 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out; }
      `}</style>
    </div>
  );
};

export default VerifyOtp;
