import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../../services/auth.service.js";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowLeft,
    Loader2,
    User,
    UserPlus,
    Check,
    X,
    ShieldCheck,
    MailCheck,
    ArrowRight,
    Phone,
    Building2,
    Briefcase,
    AlertCircle, ExternalLink
} from "lucide-react";
import LoginSlider from "../../components/auth/LoginSlider.jsx";
import LegalModal from "../../components/auth/LegalModal.jsx";
import { pdfDocumentService } from '@/services/pdf.service.js';

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:8080/hms";
const BG_URL =
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2074&auto=format&fit=crop";

const TERMS_CONTENT = (
    <div className="space-y-4 text-slate-600 text-sm leading-relaxed text-justify">
        <p>
            <strong>1. Giới thiệu</strong>
            <br />
            Chào mừng bạn đến với TravelMate. Bằng việc đăng ký tài khoản, bạn xác nhận
            đã đọc, hiểu và đồng ý tuân thủ các Điều khoản dịch vụ này.
        </p>
        <p>
            <strong>2. Tài khoản người dùng</strong>
            <br />
            Bạn chịu trách nhiệm bảo mật thông tin tài khoản và mật khẩu của mình.
        </p>
    </div>
);

const PRIVACY_CONTENT = (
    <div className="space-y-4 text-slate-600 text-sm leading-relaxed text-justify">
        <p>
            <strong>1. Thu thập thông tin</strong>
            <br />
            Chúng tôi thu thập tên, email để xác thực danh tính.
        </p>
        <p>
            <strong>2. Bảo mật dữ liệu</strong>
            <br />
            Dữ liệu của bạn được mã hóa SSL và lưu trữ an toàn.
        </p>
    </div>
);

const RegistrationSuccessModal = ({ isOpen, email, countdown, onVerifyNow }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative overflow-hidden animate-zoom-in border border-blue-100">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-50 rounded-full blur-2xl"></div>

                <div className="text-center relative z-10">
                    <div className="mx-auto mb-6 w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center animate-bounce-slow">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <MailCheck size={32} className="text-white" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-slate-800 mb-2">
                        Đăng ký thành công!
                    </h2>

                    <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                        Chúng tôi đã gửi mã xác thực OTP 6 số đến email:
                        <br />
                        <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-1 inline-block">
                            {email}
                        </span>
                        <br />
                        Vui lòng kiểm tra hộp thư và nhập mã OTP để kích hoạt tài khoản.
                    </p>

                    <div className="mb-6">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Tự động chuyển hướng sau
                        </p>
                        <div className="text-4xl font-black text-slate-800 tabular-nums">
                            {countdown}
                            <span className="text-sm font-medium text-slate-400 ml-1">
                                giây
                            </span>
                        </div>
                        <div className="h-1.5 w-32 mx-auto bg-slate-100 rounded-full mt-3 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-1000 ease-linear"
                                style={{ width: `${(countdown / 5) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* <button
                        onClick={onVerifyNow}
                        className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        Xác thực OTP ngay <ArrowRight size={18} />
                    </button> */}
                </div>
            </div>
        </div>
    );
};

const Register = () => {
    const navigate = useNavigate();
    const scrollContainerRef = useRef(null);
    const [isPdfLoading, setIsPdfLoading] = useState(true);
    const [step, setStep] = useState(1); // 1: Role selection, 2: Form
    const [selectedRole, setSelectedRole] = useState(""); // HOTEL_MANAGER or AGENCY_MANAGER

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });

    const [agreed, setAgreed] = useState(false);
    const [modalType, setModalType] = useState(null);

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [countdown, setCountdown] = useState(5);

    const [passwordCriteria, setPasswordCriteria] = useState({
        length: false,
        hasNumber: false,
        hasSpecial: false,
        hasUpper: false,
    });
    const [passwordScore, setPasswordScore] = useState(0);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [error, setError] = useState("");
    const [focusedField, setFocusedField] = useState(null);

    const [showPdfModal, setShowPdfModal] = useState(false);
    const [pdfLinks, setPdfLinks] = useState({
        HOTEL_MANAGER: null,
        AGENCY_MANAGER: null
    });
    useEffect(() => {
        const fetchLegalPdfs = async () => {
            try {
                const res = await pdfDocumentService.getAllPdfs();
                if (res?.result) {
                    // File 1: Chứa từ khóa "Khách sạn"
                    const hotelFile = res.result.find(doc =>
                        doc.title.includes("Điều khoản hợp tác với Khách sạn")
                    );
                    // File 2: Chứa từ khóa "Đại lý" (Khớp với title bạn vừa nêu)
                    const agencyFile = res.result.find(doc =>
                        doc.title.includes("Điều khoản hợp tác với Đại lý")
                    );

                    setPdfLinks({
                        HOTEL_MANAGER: hotelFile?.fileUrl || null,
                        AGENCY_MANAGER: agencyFile?.fileUrl || null
                    });
                }
            } catch (err) {
                console.error("Lỗi khi đồng bộ file PDF pháp lý:", err);
            }
        };
        fetchLegalPdfs();
    }, []);

    const [touched, setTouched] = useState({ password: false });

    useEffect(() => {
        let timer;
        if (showSuccessModal && countdown > 0) {
            timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
        } else if (showSuccessModal && countdown === 0) {
            navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
        }
        return () => clearTimeout(timer);
    }, [showSuccessModal, countdown, navigate, formData.email]);

    useEffect(() => {
        const pwd = formData.password;
        const criteria = {
            length: pwd.length >= 6,
            hasNumber: /\d/.test(pwd),
            hasUpper: /[A-Z]/.test(pwd),
            hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
        };

        setPasswordCriteria(criteria);
        setPasswordScore(Object.values(criteria).filter(Boolean).length);


    }, [formData.password]);

    const validateForm = () => {
        let newErrors = {};

        // Validate Họ tên
        if (!formData.username.trim()) {
            newErrors.username = "Họ và tên không được để trống";
        } else if (formData.username.trim().length < 2) {
            newErrors.username = "Họ và tên quá ngắn";
        }

        // Validate Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) {
            newErrors.email = "Email không được để trống";
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Định dạng email không hợp lệ";
        }

        // Validate Số điện thoại (Nếu nhập thì phải đúng 10 số)
        if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\s/g, ""))) {
            newErrors.phone = "Số điện thoại phải gồm 10 chữ số";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const getPasswordCriteria = (pwd = "") => ({
        length: pwd.length >= 6,
        hasNumber: /\d/.test(pwd),
        hasUpper: /[A-Z]/.test(pwd),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Xóa lỗi của trường đang nhập
        if (errors[name]) {
            setErrors(prev => {
                const newErrs = { ...prev };
                delete newErrs[name];
                return newErrs;
            });
        }
    };

    const handleSocialLogin = (provider) => {
        window.location.href = `${API_BASE_URL}/oauth2/authorization/${provider}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Xóa lỗi tổng quát (nếu còn dùng)

        if (!validateForm()) {
            // Tự động cuộn lên lỗi đầu tiên
            if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
            }
            return;
        }

        if (!agreed) {
            setError("Bạn cần đồng ý với Điều khoản dịch vụ để tiếp tục.");
            return;
        }

        if (!selectedRole) {
            setError("Vui lòng chọn loại tài khoản.");
            setStep(1);
            return;
        }

        const { username, email, phone, password, confirmPassword } = formData;

        if (!username || !email || !phone || !password || !confirmPassword) {
            setError("Vui lòng điền đầy đủ thông tin.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp.");
            return;
        }

        const c = getPasswordCriteria(password);
        const strongEnough = c.length && c.hasNumber && c.hasUpper && c.hasSpecial;

        if (!strongEnough) {
            setTouched((prev) => ({ ...prev, password: true }));
            setError(
                "Mật khẩu chưa đủ mạnh. Mật khẩu phải có ít nhất 6 ký tự, gồm chữ in hoa, số và ký tự đặc biệt."
            );
            return;
        }

        setLoading(true);
        try {
            const res = await authService.register(
                username,
                email,
                password,
                phone,
                selectedRole,
            );

            if (res) {
                setShowSuccessModal(true);
                setCountdown(5);
            }
        } catch (err) {
            console.error("Registration Error:", err);
            const status = err?.response?.status;
            const data = err?.response?.data;

            const serverMsg =
                data?.message || data?.error || data?.msg || data?.title || "";

            const fieldErrors =
                data?.errors ||
                data?.data?.errors ||
                data?.violations ||
                data?.details ||
                [];

            const firstFieldMsg =
                Array.isArray(fieldErrors) && fieldErrors.length
                    ? fieldErrors[0]?.message || fieldErrors[0]?.msg || ""
                    : "";

            const msg = firstFieldMsg || serverMsg || "";
            const s = String(msg).toLowerCase();

            if (status === 400) {
                if (s.includes("password") || s.includes("mật khẩu")) {
                    setError(
                        firstFieldMsg ||
                        "Mật khẩu không đạt yêu cầu. Vui lòng thêm chữ in hoa, số và ký tự đặc biệt."
                    );
                } else if (s.includes("validation failed")) {
                    setError("Thông tin đăng ký chưa hợp lệ. Vui lòng kiểm tra lại.");
                } else {
                    setError(msg || "Thông tin đăng ký chưa hợp lệ. Vui lòng kiểm tra lại.");
                }
            } else if (status === 409) {
                setError("Email đã được đăng ký. Vui lòng dùng email khác.");
            } else {
                setError("Đăng ký thất bại. Vui lòng thử lại.");
            }
        } finally {
            setLoading(false);
        }
    };

    const getStrengthColor = () => {
        if (passwordScore <= 1) return "bg-red-500";
        if (passwordScore === 2) return "bg-yellow-500";
        if (passwordScore === 3) return "bg-blue-500";
        return "bg-green-500";
    };

    const getStrengthText = () => {
        if (passwordScore === 0) return "";
        if (passwordScore <= 1) return "Quá yếu";
        if (passwordScore === 2) return "Trung bình";
        if (passwordScore === 3) return "Tốt";
        return "Tuyệt vời";
    };

    const isFormValid =
        passwordScore >= 2 && formData.username && formData.phone && formData.email && agreed && selectedRole;

    return (
        <div className="relative h-screen w-screen overflow-hidden flex items-center justify-center font-sans bg-slate-900">
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat animate-ken-burns-slow"
                style={{ backgroundImage: `url(${BG_URL})` }}
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/90 via-slate-900/50 to-emerald-900/30 backdrop-blur-[2px]" />
            </div>

            <button
                onClick={() => navigate("/")}
                className="absolute top-6 left-6 z-30 flex items-center gap-2 text-white/90 hover:text-white px-4 py-2 rounded-full bg-white/10 border border-white/20 shadow-lg hover:bg-white/20 transition-all group backdrop-blur-md"
            >
                <ArrowLeft
                    size={18}
                    className="group-hover:-translate-x-1 transition-transform"
                />
                <span className="text-sm font-bold">Trang chủ</span>
            </button>

            <div className="relative z-10 w-full h-full md:h-[90vh] md:max-w-6xl bg-white md:rounded-[2.5rem] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 animate-zoom-in">
                <LoginSlider />

                <div className="flex flex-col relative bg-white min-h-0">


                    <div
                        ref={scrollContainerRef}
                        className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-6 md:p-12 relative z-10 pb-40 scroll-smooth"
                    >
                        <div className="max-w-md mx-auto w-full mt-4 md:mt-8 pb-40">
                            <div className="mb-8">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-100">
                                    <UserPlus size={14} /> Đăng ký đối tác
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                                    {step === 1 ? "Bạn là ai?" : "Tạo tài khoản"}
                                </h1>
                                <p className="text-slate-500 font-medium">
                                    {step === 1
                                        ? "Chọn loại tài khoản phù hợp với bạn."
                                        : "Điền thông tin để hoàn tất đăng ký."}
                                </p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold flex items-center gap-3 animate-shake shadow-sm">
                                    <X size={16} /> {error}
                                </div>
                            )}

                            {/* Step 1: Role Selection */}
                            {step === 1 && (
                                <div className="space-y-4">
                                    <button
                                        type="button"
                                        onClick={() => { setSelectedRole("HOTEL_MANAGER"); setStep(2); setError(""); }}
                                        className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 text-left group hover:shadow-lg ${selectedRole === "HOTEL_MANAGER"
                                            ? "border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/10"
                                            : "border-slate-100 bg-white hover:border-emerald-300"
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${selectedRole === "HOTEL_MANAGER"
                                                ? "bg-emerald-500 text-white"
                                                : "bg-slate-100 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600"
                                                }`}>
                                                <Building2 size={28} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-black text-slate-800 text-lg">Tôi là Khách sạn</h3>
                                                <p className="text-sm text-slate-500 mt-0.5">Quản lý khách sạn, phòng, giá cả và đặt phòng</p>
                                            </div>
                                            <ArrowRight size={20} className={`transition-colors ${selectedRole === "HOTEL_MANAGER" ? "text-emerald-500" : "text-slate-300"
                                                }`} />
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => { setSelectedRole("AGENCY_MANAGER"); setStep(2); setError(""); }}
                                        className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 text-left group hover:shadow-lg ${selectedRole === "AGENCY_MANAGER"
                                            ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/10"
                                            : "border-slate-100 bg-white hover:border-blue-300"
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${selectedRole === "AGENCY_MANAGER"
                                                ? "bg-blue-500 text-white"
                                                : "bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600"
                                                }`}>
                                                <Briefcase size={28} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-black text-slate-800 text-lg">Tôi là Đại lý</h3>
                                                <p className="text-sm text-slate-500 mt-0.5">Tìm kiếm, đặt phòng và quản lý booking cho khách hàng</p>
                                            </div>
                                            <ArrowRight size={20} className={`transition-colors ${selectedRole === "AGENCY_MANAGER" ? "text-blue-500" : "text-slate-300"
                                                }`} />
                                        </div>
                                    </button>
                                    <div className="mt-6 text-center">
                                        <span className="text-sm text-slate-500 font-medium">
                                            Đã có tài khoản?{" "}
                                        </span>
                                        <Link
                                            to="/login"
                                            className="text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors"                                        >
                                            Đăng nhập ngay
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Registration Form */}
                            {step === 2 && (
                                <>
                                    {/* Back to role selection */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setStep(1);
                                            setSelectedRole("");
                                        }}
                                        className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-500 transition-colors"
                                    >
                                        <ArrowLeft size={16} />
                                        {selectedRole === "HOTEL_MANAGER" ? "Khách sạn" : "Đại lý"} — Thay đổi
                                    </button>

                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        {/* username */}
                                        <div className="relative group">
                                            <div
                                                className={`absolute left-4 top-3.5 transition-colors ${focusedField === "username"
                                                    ? "text-blue-500"
                                                    : "text-slate-400"
                                                    }`}
                                            >
                                                <User size={20} />
                                            </div>
                                            <input
                                                type="text"
                                                name="username"
                                                onFocus={() => setFocusedField("username")}
                                                onBlur={() => setFocusedField(null)}
                                                value={formData.username}
                                                onChange={handleChange}
                                                className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 rounded-xl outline-none font-semibold text-slate-800 transition-all ${focusedField === "username"
                                                    ? "border-blue-400 bg-white"
                                                    : "border-slate-100 hover:border-slate-300"
                                                    }`}
                                                placeholder="Họ và tên đầy đủ"
                                            />
                                            {errors.username && (
                                                <p className="mt-1.5 ml-1 text-xs font-bold text-rose-500 flex items-center gap-1 animate-fade-in">
                                                    <AlertCircle size={12} /> {errors.username}
                                                </p>
                                            )}
                                        </div>

                                        {/* Email */}
                                        <div className="relative group">
                                            <div
                                                className={`absolute left-4 top-3.5 transition-colors ${focusedField === "email"
                                                    ? "text-blue-500"
                                                    : "text-slate-400"
                                                    }`}
                                            >
                                                <Mail size={20} />
                                            </div>
                                            <input
                                                type="email"
                                                name="email"
                                                onFocus={() => setFocusedField("email")}
                                                onBlur={() => setFocusedField(null)}
                                                value={formData.email}
                                                onChange={handleChange}
                                                className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 rounded-xl outline-none font-semibold text-slate-800 transition-all ${focusedField === "email"
                                                    ? "border-blue-400 bg-white"
                                                    : "border-slate-100 hover:border-slate-300"
                                                    }`}
                                                placeholder="Email"
                                            />
                                            {errors.email && (
                                                <p className="mt-1.5 ml-1 text-xs font-bold text-rose-500 flex items-center gap-1 animate-fade-in">
                                                    <AlertCircle size={12} /> {errors.email}
                                                </p>
                                            )}
                                        </div>

                                        {/* Phone */}
                                        <div className="relative group">
                                            <div
                                                className={`absolute left-4 top-3.5 transition-colors ${focusedField === "phone"
                                                    ? "text-blue-500"
                                                    : "text-slate-400"
                                                    }`}
                                            >
                                                <Phone size={20} />
                                            </div>
                                            <input
                                                type="tel"
                                                name="phone"
                                                onFocus={() => setFocusedField("phone")}
                                                onBlur={() => setFocusedField(null)}
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 rounded-xl outline-none font-semibold text-slate-800 transition-all ${focusedField === "phone"
                                                    ? "border-blue-400 bg-white"
                                                    : "border-slate-100 hover:border-slate-300"
                                                    }`}
                                                placeholder="Số điện thoại"
                                            />
                                            {errors.phone && (
                                                <p className="mt-1.5 ml-1 text-xs font-bold text-rose-500 flex items-center gap-1 animate-fade-in">
                                                    <AlertCircle size={12} /> {errors.phone}
                                                </p>
                                            )}
                                        </div>

                                        {/* Password */}
                                        <div className="relative group">
                                            <div
                                                className={`absolute left-4 top-3.5 transition-colors ${focusedField === "password"
                                                    ? "text-blue-500"
                                                    : "text-slate-400"
                                                    }`}
                                            >
                                                <Lock size={20} />
                                            </div>

                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                onFocus={() => setFocusedField("password")}
                                                onBlur={() => {
                                                    setFocusedField(null);
                                                    setTouched((prev) => ({ ...prev, password: true }));
                                                }}
                                                value={formData.password}
                                                onChange={handleChange}
                                                className={`w-full pl-12 pr-12 py-3.5 bg-slate-50 border-2 rounded-xl outline-none font-semibold text-slate-800 transition-all ${focusedField === "password"
                                                    ? "border-blue-400 bg-white"
                                                    : "border-slate-100 hover:border-slate-300"
                                                    }`}
                                                placeholder="Mật khẩu"
                                            />

                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-2"
                                            >
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>

                                        {/* Password Check */}
                                        <div
                                            className={`overflow-hidden transition-all duration-500 ease-in-out ${formData.password ? "max-h-72 opacity-100" : "max-h-0 opacity-0"
                                                }`}
                                        >
                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-1">
                                                <div className="flex justify-between items-center mb-2">
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

                                                <div
                                                    className="h-1.5 w-full bg-slate-200 rounded-full mb-3 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${getStrengthColor()}`}
                                                        style={{ width: `${(passwordScore / 4) * 100}%` }}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-2">
                                                    <Badge active={passwordCriteria.length} text="Ít nhất 6 ký tự" />
                                                    <Badge active={passwordCriteria.hasNumber} text="Có chứa số" />
                                                    <Badge active={passwordCriteria.hasUpper} text="Chữ in hoa" />
                                                    <Badge
                                                        active={passwordCriteria.hasSpecial}
                                                        text="Ký tự đặc biệt"
                                                    />
                                                </div>

                                                {/* ✅ Fix hiển thị inline đỏ (không vỡ chữ / không bị tách) */}
                                                {formData.password && touched.password && passwordScore < 4 && (
                                                    <div className="mt-3 flex items-start gap-2 text-rose-600">
                                                        <X size={16} className="mt-0.5 shrink-0" />
                                                        <p className="text-sm font-semibold leading-relaxed whitespace-normal break-words">
                                                            Mật khẩu chưa đủ mạnh. Hãy thêm{" "}
                                                            <span className="font-black">số</span>,{" "}
                                                            <span className="font-black">chữ in hoa</span> và{" "}
                                                            <span className="font-black">ký tự đặc biệt</span>.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Confirm Password */}
                                        <div className="relative group">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                name="confirmPassword"
                                                onFocus={() => setFocusedField("confirmPassword")}
                                                onBlur={() => setFocusedField(null)}
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                className={`w-full pl-4 pr-12 py-3.5 bg-slate-50 border-2 rounded-xl outline-none font-semibold text-slate-800 transition-all ${focusedField === "confirmPassword"
                                                    ? "border-blue-400 bg-white"
                                                    : "border-slate-100 hover:border-slate-300"
                                                    }`}
                                                placeholder="Nhập lại mật khẩu"
                                            />

                                            {formData.confirmPassword &&
                                                formData.password === formData.confirmPassword && (
                                                    <div
                                                        className="absolute right-12 top-1/2 -translate-y-1/2 text-green-500">
                                                        <Check
                                                            size={18}
                                                            fill="currentColor"
                                                            className="text-white"
                                                        />
                                                    </div>
                                                )}

                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-2"
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff size={20} />
                                                ) : (
                                                    <Eye size={20} />
                                                )}
                                            </button>
                                        </div>

                                        {/* Checkbox Terms */}
                                        {/*<div className="flex items-start gap-3 mt-4 group">*/}
                                        {/*    <div className="relative flex items-center pt-0.5">*/}
                                        {/*        <input*/}
                                        {/*            type="checkbox"*/}
                                        {/*            id="terms"*/}
                                        {/*            checked={agreed}*/}
                                        {/*            onChange={(e) => setAgreed(e.target.checked)}*/}
                                        {/*            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-slate-300 transition-all checked:border-emerald-500 checked:bg-emerald-500 hover:border-emerald-400"*/}
                                        {/*        />*/}
                                        {/*        <Check*/}
                                        {/*            size={14}*/}
                                        {/*            strokeWidth={3}*/}
                                        {/*            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100"*/}
                                        {/*        />*/}
                                        {/*    </div>*/}
                                        {/*    <label*/}
                                        {/*        htmlFor="terms"*/}
                                        {/*        className="text-sm text-slate-500 leading-snug cursor-pointer select-none"*/}
                                        {/*    >*/}
                                        {/*        Tôi đồng ý với{" "}*/}
                                        {/*        <button*/}
                                        {/*            type="button"*/}
                                        {/*            onClick={() => setModalType("terms")}*/}
                                        {/*            className="text-emerald-600 font-bold hover:underline"*/}
                                        {/*        >*/}
                                        {/*            Điều khoản*/}
                                        {/*        </button>{" "}*/}
                                        {/*        và{" "}*/}
                                        {/*        <button*/}
                                        {/*            type="button"*/}
                                        {/*            onClick={() => setModalType("privacy")}*/}
                                        {/*            className="text-emerald-600 font-bold hover:underline"*/}
                                        {/*        >*/}
                                        {/*            Chính sách bảo mật*/}
                                        {/*        </button>*/}
                                        {/*        .*/}
                                        {/*    </label>*/}
                                        {/*</div>*/}

                                        {/* Checkbox Đồng ý điều khoản */}
                                        <div className="flex items-start gap-3 mt-4 group">
                                            <div className="relative flex items-center pt-0.5">
                                                <input
                                                    type="checkbox"
                                                    id="terms"
                                                    checked={agreed}
                                                    onChange={(e) => setAgreed(e.target.checked)}
                                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-slate-300 transition-all checked:border-blue-500 checked:bg-blue-500 hover:border-blue-400"
                                                />
                                                <Check
                                                    size={14}
                                                    strokeWidth={3}
                                                    className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100"
                                                />
                                            </div>
                                            <label
                                                htmlFor="terms"
                                                className="text-sm text-slate-500 leading-snug cursor-pointer select-none"
                                            >
                                                Tôi đồng ý với{" "}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (pdfLinks[selectedRole]) {
                                                            setShowPdfModal(true);
                                                        } else {
                                                            alert("Tài liệu đang được cập nhật, vui lòng thử lại sau.");
                                                        }
                                                    }}
                                                    className="font-bold text-cyan-600 hover:text-blue-600 hover:underline transition-colors"
                                                >
                                                    Điều khoản & Chính sách dành
                                                    cho {selectedRole === "HOTEL_MANAGER" ? "Khách sạn" : "Đại lý"}
                                                </button>
                                            </label>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading || !isFormValid}
                                            className={`group w-full py-4 rounded-2xl font-black text-lg shadow-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] mt-4 ${isFormValid
                                                ? "bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white shadow-blue-500/30 cursor-pointer"
                                                : "bg-slate-200 text-slate-400 cursor-not-allowed opacity-80"
                                                }`}
                                        >
                                            {loading ? (
                                                <Loader2 className="animate-spin" />
                                            ) : (
                                                <>
                                                    Tạo tài khoản <ShieldCheck size={20} />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                    <div className="mt-6 text-center">
                                        <span className="text-sm text-slate-500 font-medium">
                                            Đã có tài khoản?{" "}
                                        </span>
                                        <Link
                                            to="/login"
                                            className="text-sm font-bold text-cyan-600 hover:text-blue-600 hover:underline decoration-2 underline-offset-4 transition-colors"
                                        >
                                            Đăng nhập ngay
                                        </Link>
                                    </div>
                                    {/* Social Login */}


                                    <p className="text-center text-slate-500 font-medium md:hidden pb-8">
                                        Đã có tài khoản?{" "}
                                        <Link
                                            to="/login"
                                            className="text-emerald-600 font-black hover:underline"
                                        >
                                            Đăng nhập
                                        </Link>
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <RegistrationSuccessModal
                isOpen={showSuccessModal}
                email={formData.email}
                countdown={countdown}
                onLoginNow={() => navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`)}
            />

            <LegalModal
                isOpen={modalType === "terms"}
                onClose={() => setModalType(null)}
                title="Điều khoản dịch vụ"
                type="terms"
            >
                {TERMS_CONTENT}
            </LegalModal>

            <LegalModal
                isOpen={modalType === "privacy"}
                onClose={() => setModalType(null)}
                title="Chính sách bảo mật"
                type="privacy"
            >
                {PRIVACY_CONTENT}
            </LegalModal>

            {/* Animation Styles */}
            <style>{`
        @keyframes ken-burns-slow { 0% { transform: scale(1); } 100% { transform: scale(1.15); } }
        .animate-ken-burns-slow { animation: ken-burns-slow 20s infinite alternate ease-in-out; }
        @keyframes zoom-in { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }
        .animate-zoom-in { animation: zoom-in 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes bounce-slow { 0%, 100% { transform: translateY(-5%); } 50% { transform: translateY(5%); } }
        .animate-bounce-slow { animation: bounce-slow 2s infinite ease-in-out; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
            {/*{showPdfModal && (*/}
            {/*    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">*/}
            {/*        <div*/}
            {/*            className="bg-white w-full max-w-5xl h-full md:h-[94vh] md:rounded-[32px] overflow-hidden shadow-2xl flex flex-col relative animate-in zoom-in duration-300">*/}
            {/*            <div className="absolute top-4 right-4 z-[100] flex items-center gap-2">*/}
            {/*                <a*/}
            {/*                    href={pdfLinks[selectedRole]}*/}
            {/*                    target="_blank"*/}
            {/*                    rel="noreferrer"*/}
            {/*                    title="Mở tab mới"*/}
            {/*                    className="p-2.5 bg-white/90 backdrop-blur-md text-slate-500 hover:text-blue-600 rounded-xl border border-slate-200 shadow-sm transition-all active:scale-95"*/}
            {/*                >*/}
            {/*                    <ExternalLink size={18}/>*/}
            {/*                </a>*/}
            {/*                <button*/}
            {/*                    onClick={() => setShowPdfModal(false)}*/}
            {/*                    className="p-2.5 bg-slate-900/90 backdrop-blur-md text-white hover:bg-red-500 rounded-xl shadow-lg transition-all active:scale-95"*/}
            {/*                >*/}
            {/*                    <X size={18}/>*/}
            {/*                </button>*/}
            {/*            </div>*/}

            {/*            /!* Iframe content *!/*/}
            {/*            <div className="flex-1 bg-slate-100 relative">*/}
            {/*                <iframe*/}
            {/*                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(pdfLinks[selectedRole])}&embedded=true`}*/}
            {/*                    className="w-full h-full border-none relative z-10"*/}
            {/*                    title="PDF Preview"*/}
            {/*                />*/}
            {/*                <div className="absolute inset-0 flex flex-col items-center justify-center z-0 bg-slate-50">*/}
            {/*                    <Loader2 size={40} className="animate-spin text-slate-200 mb-3"/>*/}
            {/*                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Đang tải tài liệu...</span>*/}
            {/*                </div>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*)}*/}

            {showPdfModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-5xl h-full md:h-[94vh] md:rounded-[32px] overflow-hidden shadow-2xl flex flex-col relative animate-in zoom-in duration-300">
                        {/* Header Modal */}
                        <div className="absolute top-4 right-4 z-[100] flex items-center gap-2">
                            <a
                                href={pdfLinks[selectedRole]}
                                target="_blank"
                                rel="noreferrer"
                                title="Mở tab mới"
                                className="p-2.5 bg-white/90 backdrop-blur-md text-slate-500 hover:text-blue-600 rounded-xl border border-slate-200 shadow-sm transition-all active:scale-95"
                            >
                                <ExternalLink size={18} />
                            </a>
                            <button
                                onClick={() => {
                                    setShowPdfModal(false);
                                    setIsPdfLoading(true);
                                }}
                                className="p-2.5 bg-slate-900/90 backdrop-blur-md text-white hover:bg-red-500 rounded-xl shadow-lg transition-all active:scale-95"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Nội dung PDF  */}
                        <div className="flex-1 bg-slate-100 relative">
                            {pdfLinks[selectedRole] ? (
                                <object
                                    data={`${pdfLinks[selectedRole]}#view=FitH`}
                                    type="application/pdf"
                                    className="w-full h-full border-none relative z-10"
                                    onLoad={() => setIsPdfLoading(false)}
                                >
                                    <iframe
                                        src={`${pdfLinks[selectedRole]}#view=FitH`}
                                        className="w-full h-full border-none"
                                        title="PDF Preview"
                                        onLoad={() => setIsPdfLoading(false)}
                                    />
                                </object>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-500 z-20 relative bg-white">
                                    <p className="font-medium text-lg">Không tìm thấy tài liệu liên quan.</p>
                                    <p className="text-sm">Vui lòng kiểm tra lại đường dẫn tài liệu.</p>
                                </div>
                            )}

                            {isPdfLoading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center z-[15] bg-slate-50">
                                    <Loader2 size={40} className="animate-spin text-blue-600 mb-3" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
                                        Đang chuẩn bị tài liệu...
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

// Badge component
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

// const Badge = ({ active, text }) => (
//     <div
//         className={`flex items-center gap-1.5 text-[11px] font-bold px-2 py-1 rounded-md transition-all duration-300 ${
//             active
//                 ? "bg-blue-100 text-blue-600 border border-blue-200"
//                 : "bg-slate-100 text-slate-400"
//         }`}
//     >
//         {active ? (
//             <Check size={12} strokeWidth={4} />
//         ) : (
//             <div className="w-3 h-3 rounded-full bg-slate-300"></div>
//         )}
//         {text}
//     </div>
// );

export default Register;