import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
    CheckCircle2, Loader2, ArrowLeft,
    Lock, Eye, EyeOff, KeyRound, ShieldCheck, Check, X
} from "lucide-react";
import { authService } from "../../services/auth.service.js";
import LoginSlider from "../../components/auth/LoginSlider.jsx";
import Toast from "../../components/common/notification/Toast";
import ToastPortal from "../../components/common/notification/ToastPortal";

const BG_URL = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [toast, setToast] = useState({ show: false, message: "", type: "info" });
    const [confirmError, setConfirmError] = useState("");

    // Password Strength State
    const [passwordScore, setPasswordScore] = useState(0);
    const [passwordCriteria, setPasswordCriteria] = useState({
        length: false, hasNumber: false, hasSpecial: false, hasUpper: false
    });

    // --- LOGIC CHECK PASSWORD STRENGTH ---
    useEffect(() => {
        const criteria = {
            length: password.length >= 6,
            hasNumber: /\d/.test(password),
            hasUpper: /[A-Z]/.test(password),
            hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        setPasswordCriteria(criteria);
        const score = Object.values(criteria).filter(Boolean).length;
        setPasswordScore(score);
    }, [password]);

    useEffect(() => {
        if (!confirm) {
            setConfirmError("");
            return;
        }

        if (confirm !== password) {
            setConfirmError("Mật khẩu không khớp");
        } else {
            setConfirmError("");
        }
    }, [confirm, password]);

    const showToastOnce = (msg, type = "error") => {
        setToast({ show: true, message: msg, type });

        setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }));
        }, 3000);
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        // Validate
        if (!password || !confirm) {
            showToastOnce("Vui lòng nhập đầy đủ thông tin.");
            return;
        }
        if (password !== confirm) {
            showToastOnce("Mật khẩu xác nhận không khớp.");
            return;
        }
        if (passwordScore < 2) {
            showToastOnce("Mật khẩu quá yếu. Vui lòng đặt mật khẩu mạnh hơn.");
            return;
        }

        setLoading(true);
        try {
            // Gọi Service (Lưu ý: Service nhận token và newPassword)
            await authService.resetPassword(token, password);
            setIsSuccess(true); // Chuyển sang giao diện thành công
        } catch (err) {
            console.log("FULL ERROR:", err.response?.data);

            const errorCode = Number(err.response?.data?.code);

            // 👉 Bắt riêng lỗi password trùng
            if (errorCode === 1018) {
                showToastOnce("Mật khẩu mới không được trùng với mật khẩu cũ.", "error");
                return;
            }

            // 👉 fallback message
            const msg =
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.response?.data?.result?.message ||
                "Liên kết không hợp lệ hoặc đã hết hạn.";

            showToastOnce(msg, "error");
        } finally {
            setLoading(false);
        }
    };

    // Helper UI
    const getStrengthColor = () => {
        if (passwordScore <= 1) return "bg-red-500";
        if (passwordScore === 2) return "bg-yellow-500";
        if (passwordScore === 3) return "bg-blue-500";
        return "bg-green-500";
    };

    const getStrengthText = () => {
        if (passwordScore === 0) return "";
        if (passwordScore <= 1) return "Yếu";
        if (passwordScore === 2) return "Trung bình";
        if (passwordScore === 3) return "Tốt";
        return "Tuyệt vời";
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

            {/* MAIN CARD (GIỐNG FORGOT PASSWORD) */}
            <div className="relative z-10 w-full h-full md:h-auto md:max-w-6xl md:aspect-[16/9] bg-white md:rounded-[2.5rem] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">

                {/* LEFT - SLIDER */}
                <LoginSlider />

                {/* RIGHT */}
                <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">

                    <div className="max-w-md mx-auto w-full">

                        {/* HEADER */}
                        <div className="mb-8 text-center">
                            {isSuccess ? (
                                <>
                                    <CheckCircle2 className="mx-auto text-emerald-500 mb-4" size={40} />
                                    <h2 className="text-2xl font-bold">Thành công!</h2>
                                    <p className="text-slate-500 mt-2">
                                        Mật khẩu đã được cập nhật
                                    </p>
                                </>
                            ) : (
                                <>
                                    <KeyRound className="mx-auto text-blue-500 mb-4" size={36} />
                                    <h2 className="text-2xl font-bold">Đặt lại mật khẩu</h2>
                                    <p className="text-slate-500">
                                        Vui lòng tạo mật khẩu mới cho tài khoản của bạn
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
                                Đăng nhập
                            </button>
                        ) : (
                            <form onSubmit={onSubmit} className="space-y-6">

                                {/* PASSWORD */}
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 pl-10">
                                        Mật khẩu mới
                                    </label>
                                    <div className="relative">
                                        <Lock
                                            className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${focusedField === "password"
                                                ? "text-blue-500"
                                                : password
                                                    ? "text-blue-500"
                                                    : "text-gray-400"
                                                }`}
                                        />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onFocus={() => setFocusedField("password")}
                                            onBlur={() => setFocusedField(null)}
                                            placeholder="Mật khẩu mới"
                                            className={`w-full pl-10 pr-10 py-3 rounded-xl transition-all outline-none ${focusedField === "password"
                                                ? "border-2 border-blue-400 bg-white"
                                                : password
                                                    ? "border-2 border-blue-400 bg-white"
                                                    : "border border-slate-200 bg-white"
                                                }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                {/* PASSWORD STRENGTH (GIỮ NGUYÊN LOGIC) */}
                                {password && (
                                    <div className="bg-slate-50 p-3 rounded-xl border">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-xs font-bold text-slate-500 uppercase">
                                                Độ mạnh mật khẩu
                                            </span>
                                            <span
                                                className={`text-xs font-bold transition-colors ${passwordScore <= 1
                                                    ? "text-red-500"
                                                    : passwordScore === 2
                                                        ? "text-yellow-500"
                                                        : passwordScore === 3
                                                            ? "text-blue-500"
                                                            : "text-green-500"
                                                    }`}
                                            >
                                                {getStrengthText()}
                                            </span>
                                        </div>

                                        <div className="h-1 bg-slate-200 rounded mb-2">
                                            <div
                                                className={`${getStrengthColor()} h-1 rounded`}
                                                style={{ width: `${(passwordScore / 4) * 100}%` }}
                                            />
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <Badge active={passwordCriteria.length} text="6+ ký tự" />
                                            <Badge active={passwordCriteria.hasNumber} text="Số" />
                                            <Badge active={passwordCriteria.hasUpper} text="In hoa" />
                                            <Badge active={passwordCriteria.hasSpecial} text="Đặc biệt" />
                                        </div>
                                    </div>
                                )}

                                {/* CONFIRM */}
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 pl-10">
                                        Xác nhận mật khẩu mới
                                    </label>
                                    <div className="relative">
                                        <ShieldCheck
                                            className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${confirmError
                                                    ? "text-red-500"
                                                    : focusedField === "confirm"
                                                        ? "text-blue-500"
                                                        : confirm
                                                            ? "text-blue-500"
                                                            : "text-gray-400"
                                                }`}
                                        />

                                        <input
                                            type={showConfirm ? "text" : "password"}
                                            value={confirm}
                                            onChange={(e) => setConfirm(e.target.value)}
                                            onFocus={() => setFocusedField("confirm")}
                                            onBlur={() => setFocusedField(null)}
                                            placeholder="Xác nhận mật khẩu"
                                            className={`w-full pl-10 pr-10 py-3 rounded-xl transition-all outline-none ${confirmError
                                                    ? "border-2 border-red-500 bg-white"
                                                    : focusedField === "confirm"
                                                        ? "border-2 border-blue-400 bg-white"
                                                        : confirm
                                                            ? "border-2 border-blue-400 bg-white"
                                                            : "border border-slate-200 bg-white"
                                                }`}
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                        >
                                            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>

                                    {confirm && (
                                        <div className="mt-2">
                                            <Badge
                                                active={!confirmError}
                                                text={confirmError ? "Mật khẩu không khớp" : "Mật khẩu khớp"}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* SUBMIT */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex justify-center"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : "Đặt lại mật khẩu"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* TOAST */}
            {toast.show && (
                <div className="fixed top-6 right-6 z-[9999]">
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast({ ...toast, show: false })}
                    />
                </div>
            )}
        </div>
    );
};

// Sub-component Badge
const Badge = ({ active, text }) => (
    <div
        className={`flex items-center gap-1.5 text-[11px] font-bold px-2 py-1 rounded-md transition-all duration-300 ${active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"
            }`}
    >
        {active ? (
            <Check size={12} strokeWidth={4} />
        ) : (
            <div className="w-3 h-3 rounded-full bg-slate-300"></div>
        )}
        {text}
    </div>
);

export default ResetPassword;