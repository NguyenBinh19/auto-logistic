import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    Building2, Menu, X, LogOut, UserCircle, ShieldCheck,
    ChevronDown, User, LayoutDashboard, Clock, Loader2, AlertCircle
} from "lucide-react";
import { jwtDecode } from "jwt-decode";
import api from "../../../services/axios.config";
import { kycService } from "@/services/kyc.service.js";
import { MOCK_AGENCY_DATA } from '@/constant/agency_mockData.js';
import NotificationBell from "@/components/common/Notification/NotificationBell";
import Logo from "../../../../public/Logo_HMS_B2B.png"

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
    const [isPartnerDropdownOpen, setIsPartnerDropdownOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [userRoles, setUserRoles] = useState([]);
    const [hotelIdFromToken, setHotelIdFromToken] = useState(null);
    const [agencyIdFromToken, setAgencyIdFromToken] = useState(null);

    const [kycData, setKycData] = useState(null);
    const [isCheckingKyc, setIsCheckingKyc] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const dropdownRef = useRef(null);

    const [financeInfo, setFinanceInfo] = useState({
        walletBalance: 0,
        creditLimit: 0,
        currentCredit: 0,
        creditUsedPercent: 0,
    });

    // 1. Xử lý đóng Dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsAdminDropdownOpen(false);
                setIsPartnerDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 2. Đồng bộ hóa dữ liệu từ LocalStorage và Token
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        const storedUser = localStorage.getItem('user');

        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Lỗi parse user:", e);
            }
        } else {
            setUser(null);
        }

        if (token) {
            try {
                const decoded = jwtDecode(token);
                const scope = decoded.scope || decoded.roles || decoded.authorities || "";
                setUserRoles(Array.isArray(scope) ? scope : scope.split(" "));
                setHotelIdFromToken(decoded.hotelId || decoded.hotel_id);
                setAgencyIdFromToken(decoded.agencyId || decoded.agency_id);
            } catch (e) {
                setUserRoles([]);
                setHotelIdFromToken(null);
                setAgencyIdFromToken(null);
            }
        } else {
            setUserRoles([]);
            setHotelIdFromToken(null);
            setAgencyIdFromToken(null);
        }
    }, [location.pathname]); // Cập nhật lại khi chuyển trang

    // 1. Logic fetch KYC
    useEffect(() => {
        const fetchUserKyc = async () => {
            // Check nếu: Có user, không phải Admin, chưa có HotelId/AgencyId
            if (user && !isAdmin && !currentHotelId && !currentAgencyId) {
                setIsCheckingKyc(true);
                try {
                    const res = await kycService.getVerificationsByUserId();
                    if (res?.result && res.result.length > 0) {
                        // Lấy bản ghi mới nhất dựa trên ID hoặc thời gian
                        const latest = res.result.sort((a, b) => b.id - a.id)[0];
                        setKycData(latest);
                    }
                } catch (err) {
                    console.error("Lỗi fetch KYC:", err);
                } finally {
                    setIsCheckingKyc(false);
                }
            }
        };
        fetchUserKyc();
    }, [user, userRoles, location.pathname]);

    const isAdmin = useMemo(() => userRoles.some(role => role.includes("ADMIN")), [userRoles]);
    const isFullAdmin = useMemo(() => userRoles.some(role => role === "ROLE_ADMIN"), [userRoles]);
    const isAgencyManager = useMemo(() => userRoles.some(role => role.includes("ROLE_AGENCY_MANAGER")), [userRoles]);

    const currentHotelId = user?.hotelId || hotelIdFromToken;
    const currentAgencyId = user?.agencyId || agencyIdFromToken;

    // Hàm render Button KYC
    const renderKycStatus = () => {
        if (isAdmin || currentHotelId || currentAgencyId || !user) return null;
        if (isCheckingKyc) {
            return (
                <div className="flex items-center gap-2 px-4 py-2 text-slate-400 text-xs">
                    <Loader2 size={14} className="animate-spin" />
                    <span>Đang kiểm tra hồ sơ...</span>
                </div>
            );
        }
        // Trường hợp đang chờ duyệt
        if (kycData?.status === "PENDING") {
            return (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
                    <Clock size={18} className="animate-pulse" />
                    <div className="flex flex-col leading-none">
                        <span className="text-[12px] font-bold">Đang chờ duyệt</span>
                        <span className="text-[10px] opacity-70">Hồ sơ KYC đang xử lý</span>
                    </div>
                </div>
            );
        }
        // Trường hợp bị từ chối
        if (kycData?.status === "REJECTED") {
            return (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 cursor-not-allowed">
                    <AlertCircle size={18} />
                    <div className="flex flex-col items-start leading-none">
                        <span className="text-[12px] font-bold">Hồ sơ bị từ chối</span>
                        <span className="text-[10px] opacity-80">Vui lòng liên hệ hệ thống.</span>
                    </div>
                </div>
            );
        }
        // Trường hợp chưa gửi hồ sơ (null hoặc status khác)
        return (
            <button
                onClick={() => navigate("/kyc-intro")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-sm animate-pulse shadow-lg shadow-amber-200 hover:bg-amber-600"
            >
                <ShieldCheck size={18} />
                <span>Xác minh ngay</span>
            </button>
        );
    };

    // Định dạng tiền tệ
    const formatCurrency = (value) => {
        if (!value) return "0 ₫";
        return Number(value).toLocaleString("vi-VN") + " ₫";
    };

    const isDemoActive = useMemo(() => {
        return location.pathname.startsWith("/demo") || location.pathname.startsWith("/demo-agency");
    }, [location.pathname]);

    // Cập nhật Tiêu đề trang động
    useEffect(() => {
        const titles = {
            "/homepage": "Trang chủ | HMS-B2B",
            "/": "Trang chủ | HMS-B2B",
            "/login": "Đăng nhập | HMS-B2B",
            "/contact": "Liên hệ | HMS-B2B",
            "/about-us": "Về chúng tôi | HMS-B2B",
            "/profile": "Hồ sơ cá nhân | HMS-B2B",
            "/demo": "Trải nghiệm | HMS-B2B"
        };
        document.title = titles[location.pathname] || "HMS-B2B Project";
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        setUser(null);
        setUserRoles([]);

        window.location.href = "/login";
    };

    const navLinks = [
        { name: "Trang chủ", href: "/homepage" },
        { name: "Về chúng tôi", href: "/about-us" },
        { name: "Hướng dẫn", href: "/user-guide" },
        { name: "Liên hệ", href: "/contact" },
        { name: "Trải nghiệm hệ thống", href: "/demo", isDemo: true },
    ];

    useEffect(() => {
        if (user?.agencyId && isAgencyManager) {
            api.get(`/agencies/${user.agencyId}/finance`)
                .then(res => setFinanceInfo(prev => ({
                    ...prev,
                    ...res.data.result
                })))
                .catch(err => console.error("Lỗi lấy thông tin tài chính:", err));
        }
    }, [user?.agencyId, isAgencyManager]);

    useEffect(() => {
        if (agencyIdFromToken) {
            api.get(`/agencies/${agencyIdFromToken}/credit-summary`)
                .then((res) => {
                    const data = res.data.result;
                    setFinanceInfo(prev => ({
                        ...prev,
                        walletBalance: prev.walletBalance,
                        creditLimit: data.creditLimit || 0,
                        currentCredit: data.remainingCredit || 0,
                        creditUsedPercent: data.usedPercent || 0,
                    }));
                })
                .catch((err) => console.error("Error fetching finance info:", err));
        }
    }, [agencyIdFromToken]);

    const renderPartnerDropdownMenu = () => {
        // Kiểm tra xem user có phải là Agency (Manager hoặc Staff) hay không
        const isAgencyUser = userRoles.some(role => role.includes("AGENCY"));

        return (
            <div className="absolute right-0 mt-3 w-60 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in duration-150">
                <div className="px-4 py-2 border-b border-slate-50 mb-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tài khoản đối tác</p>
                </div>
                <button onClick={() => { navigate("/profile"); setIsPartnerDropdownOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-all">
                    <User size={18} className="text-slate-400" /> Hồ sơ cá nhân
                </button>
                <button onClick={() => {
                    // Nếu là Agency User (Manager/Staff) thì về dashboard agency, ngược lại về hotel
                    navigate(isAgencyUser ? "/agency/agency-dashboard" : "/hotel/dashboard");
                    setIsPartnerDropdownOpen(false);
                }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-all">
                    <LayoutDashboard size={18} className="text-slate-400" />
                    Dashboard {isAgencyUser ? "Đại lý" : "Khách sạn"}
                </button>
                <div className="h-px bg-slate-100 my-1"></div>

            </div>
        );
    };
    return (
        <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
            <div className="w-full px-4 sm:px-8 lg:px-12 mx-auto">
                <div className="flex justify-between items-center h-20">

                    <Link to="/homepage" className="flex-shrink-0 flex items-center gap-2 group">
                        <div className="bg-blue-600 p-1.5 rounded-xl transition-transform group-hover:rotate-12">
                            <Building2 className="text-white" size={24} strokeWidth={2.5} />
                        </div>
                        <span className="text-2xl font-black text-slate-800 tracking-tight">
                            HMS<span className="text-blue-600">-</span>B2B
                        </span>
                    </Link>

                    {/* DESKTOP NAV - Dành cho khách chưa đăng nhập */}
                    {!user && (
                        <nav className="hidden lg:flex items-center space-x-1">
                            {navLinks.map((link) => {
                                // Nếu là link demo thì check biến isDemoActive,
                                // ngược lại check pathname khớp hoàn toàn
                                const isActive = link.isDemo ? isDemoActive : location.pathname === link.href;
                                return (
                                    <Link
                                        key={link.name}
                                        to={link.href}
                                        className={`px-4 py-2 text-[15px] font-bold rounded-lg transition-all ${isActive
                                            ? "text-blue-600 bg-blue-50"
                                            : "text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    )}

                    {/* ACTIONS */}
                    <div className="hidden lg:flex items-center gap-3">
                        {!user ? (
                            <div className="flex items-center gap-3">
                                <button onClick={() => navigate("/login")}
                                    className="px-6 py-2.5 text-[15px] font-bold text-slate-700 hover:text-blue-600 transition-colors">
                                    Đăng nhập
                                </button>
                                <button onClick={() => navigate("/register")}
                                    className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
                                    Đăng ký đối tác
                                </button>
                            </div>
                        ) : isAdmin ? (
                            <div className="flex items-center gap-5">
                                <NotificationBell />
                                <div className="relative" ref={dropdownRef}>
                                    <div
                                        onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
                                        className="flex items-center gap-3 cursor-pointer group p-1.5 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all"
                                    >
                                        {/* Avatar hiển thị chữ cái đầu của tên */}
                                        <div
                                            className="w-10 h-10 rounded-full bg-[#006AFF] flex items-center justify-center text-white font-bold text-sm shadow-lg uppercase">
                                            {user?.firstName?.charAt(0) || 'AD'}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[15px] font-bold text-slate-800 leading-none">
                                                {user?.lastName} {user?.firstName}
                                            </span>
                                            {/* Hiển thị Label động dựa trên Role */}
                                            <span
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md mt-1 self-start uppercase tracking-wider ${isFullAdmin ? "text-blue-500 bg-blue-50" : "text-amber-600 bg-amber-50"
                                                    }`}>
                                                {isFullAdmin ? "Super Admin" : "Admin Staff"}
                                            </span>
                                        </div>
                                        <ChevronDown size={16}
                                            className={`text-slate-400 transition-transform ${isAdminDropdownOpen ? 'rotate-180' : ''}`} />
                                    </div>
                                    {isAdminDropdownOpen && (
                                        <div
                                            className="absolute right-0 mt-3 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in duration-150">
                                            <button onClick={() => {
                                                navigate("/profile");
                                                setIsAdminDropdownOpen(false);
                                            }}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600">
                                                <User size={18} /> Hồ sơ cá nhân
                                            </button>
                                            <button onClick={() => {
                                                navigate("/admin/dashboard");
                                                setIsAdminDropdownOpen(false);
                                            }}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600">
                                                <LayoutDashboard size={18} /> Dashboard quản trị
                                            </button>
                                            <div className="h-px bg-slate-100 my-1"></div>
                                            <button onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors">
                                                <LogOut size={18} /> Đăng xuất
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : isAgencyManager ? (
                            <div
                                className="flex items-center gap-6 bg-slate-50 px-4 rounded-2xl border border-slate-100">

                                <div onClick={() => navigate("/agency/prepaid")}
                                    className="flex flex-col cursor-pointer p-1.5 min-w-[120px]">
                                    <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Số dư khả dụng</span>
                                    <span
                                        className="text-lg font-black text-slate-800">{formatCurrency(financeInfo.walletBalance)}</span>
                                </div>
                                <button onClick={() => navigate("/agency/prepaid")}
                                    className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md hover:bg-blue-700 transition active:scale-95">Nạp
                                    tiền
                                </button>
                                <div className="flex flex-col p-1.5 min-w-[150px]">
                                    <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                                        Hạn mức tín dụng
                                    </span>
                                    <span className="text-lg font-black text-slate-800">
                                        {formatCurrency(financeInfo.creditLimit)}
                                    </span>
                                    <span className="text-[11px] text-slate-400 font-bold italic">
                                        {financeInfo.creditUsedPercent || 0}% đã sử dụng
                                    </span>
                                </div>
                                <NotificationBell />
                                {/*<Link to="/profile"*/}
                                {/*      className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white shadow-sm border border-slate-100 hover:border-blue-600 transition-colors">*/}
                                {/*    <div*/}
                                {/*        className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">*/}
                                {/*        <UserCircle size={20}/></div>*/}
                                {/*    <div className="flex flex-col">*/}
                                {/*        <span*/}
                                {/*            className="text-sm font-black text-slate-800 leading-none">{user?.lastName} {user?.firstName}</span>*/}
                                {/*        <span*/}
                                {/*            className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mt-1">Đối tác Đại lý</span>*/}
                                {/*    </div>*/}
                                {/*</Link>*/}

                                {/* PHẦN DROPDOWN CHO AGENCY */}
                                <div className="relative" ref={dropdownRef}>
                                    <div onClick={() => setIsPartnerDropdownOpen(!isPartnerDropdownOpen)}
                                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white shadow-sm border border-slate-100 hover:border-blue-600 transition-all cursor-pointer group">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <UserCircle size={20} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-800 leading-none">{user?.lastName} {user?.firstName}</span>
                                            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mt-1">Đối tác Đại lý</span>
                                        </div>
                                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isPartnerDropdownOpen ? 'rotate-180' : ''}`} />
                                    </div>
                                    {isPartnerDropdownOpen && renderPartnerDropdownMenu()}
                                </div>

                                <button onClick={handleLogout}
                                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors"><LogOut
                                        size={20} /></button>
                            </div>
                        ) : (
                            <div
                                className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                                <NotificationBell />
                                {renderKycStatus()}
                                {/*<button onClick={() => navigate("/profile")}*/}
                                {/*        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${location.pathname === "/profile" ? "bg-blue-600 text-white shadow-md" : "bg-white text-slate-600 hover:text-blue-600 border border-slate-100 shadow-sm"}`}>*/}
                                {/*    <User size={18}/><span>Hồ sơ</span>*/}
                                {/*</button>*/}

                                {/* PHẦN DROPDOWN CHO HOTEL / AGENCY STAFF / OTHERS */}
                                <div className="relative" ref={dropdownRef}>
                                    <div
                                        onClick={() => setIsPartnerDropdownOpen(!isPartnerDropdownOpen)}
                                        className="flex items-center gap-3 px-4 py-1.5 cursor-pointer group hover:bg-white rounded-xl transition-all"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <UserCircle size={20} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-800 leading-none">
                                                {user?.lastName} {user?.firstName}
                                            </span>
                                            {/* Logic hiển thị nhãn động dựa trên Role */}
                                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">
                                                {userRoles.some(r => r.includes("HOTEL"))
                                                    ? "Đối tác Khách sạn"
                                                    : userRoles.some(r => r.includes("AGENCY"))
                                                        ? "Nhân viên Đại lý"
                                                        : "Đối tác"}
                                            </span>
                                        </div>
                                        <ChevronDown
                                            size={14}
                                            className={`text-slate-400 transition-transform duration-200 ${isPartnerDropdownOpen ? 'rotate-180' : ''}`}
                                        />
                                    </div>
                                    {isPartnerDropdownOpen && renderPartnerDropdownMenu()}
                                </div>

                                {/*<div className="flex items-center gap-3 px-4 py-1.5">*/}
                                {/*    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100"><UserCircle size={20} /></div>*/}
                                {/*    <div className="flex flex-col">*/}
                                {/*        <span className="text-sm font-black text-slate-800 leading-none">{user?.lastName} {user?.firstName}</span>*/}
                                {/*        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">*/}
                                {/*            {userRoles.some(r => r.includes("HOTEL")) ? "Đối tác Khách sạn" : "Đại lý"}*/}
                                {/*        </span>*/}
                                {/*    </div>*/}
                                {/*</div>*/}
                                <div className="w-px h-8 bg-slate-200 mx-2"></div>
                                <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-rose-600 transition-colors" title="Đăng xuất"><LogOut size={20} /></button>
                            </div>
                        )}
                    </div>

                    {/* MOBILE BUTTON */}
                    <div className="lg:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-blue-50 transition-all">
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* MOBILE MENU - Đã tối ưu & sạch sẽ */}
            {isMenuOpen && (
                <div className="lg:hidden bg-white border-t border-slate-100 p-6 space-y-6 shadow-2xl animate-in slide-in-from-top-2">
                    <nav className="flex flex-col space-y-2">
                        {/* 1. Nav Links (Dành cho khách hoặc chế độ Demo) */}
                        {(!user || isDemoActive) && navLinks.map((link) => {
                            const isActive = link.isDemo ? isDemoActive : location.pathname === link.href;
                            // Nếu đã login thật (không phải demo) thì không hiện các link ngoài demo
                            if (user && !link.isDemo) return null;

                            return (
                                <Link
                                    key={link.name}
                                    to={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`px-4 py-3 text-lg font-bold rounded-xl flex items-center justify-between ${isActive ? "text-blue-600 bg-blue-50" : "text-slate-700 hover:bg-slate-50"
                                        }`}
                                >
                                    {link.name}
                                    {link.isDemo && isActive && (
                                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                                    )}
                                </Link>
                            );
                        })}

                        {/* 2. Menu dành riêng cho Admin (Khi không ở chế độ Demo) */}
                        {user && isAdmin && !isDemoActive && (
                            <>
                                <Link
                                    to="/admin/dashboard"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="px-4 py-3 text-lg font-bold rounded-xl text-blue-600 bg-blue-50"
                                >
                                    Dashboard Admin
                                </Link>
                                <Link
                                    to="/profile"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="px-4 py-3 text-lg font-bold rounded-xl text-slate-700"
                                >
                                    Hồ sơ cá nhân
                                </Link>
                            </>
                        )}

                        {/* 3. Menu cho User thực tế / Agency (Khi không là Admin) */}
                        {user && !isAdmin && (
                            <Link
                                to="/profile"
                                onClick={() => setIsMenuOpen(false)}
                                className="px-4 py-3 text-lg font-bold rounded-xl text-slate-700"
                            >
                                {isDemoActive ? "Hồ sơ của tôi" : "Hồ sơ đối tác"}
                            </Link>
                        )}
                    </nav>

                    {/* 4. Khu vực Action Buttons */}
                    <div className="pt-4 border-t border-slate-100">
                        {user ? (
                            <button
                                onClick={handleLogout}
                                className="w-full py-4 rounded-2xl bg-rose-50 text-rose-600 font-black flex justify-center items-center gap-2 border border-rose-100 transition-active active:scale-95"
                            >
                                <LogOut size={22} />
                                {isDemoActive ? "Thoát trải nghiệm" : "Đăng xuất tài khoản"}
                            </button>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => { navigate("/login"); setIsMenuOpen(false); }}
                                    className="w-full py-4 rounded-2xl bg-slate-100 text-slate-700 font-bold active:scale-95 transition-all"
                                >
                                    Đăng nhập
                                </button>
                                <button
                                    onClick={() => { navigate("/register"); setIsMenuOpen(false); }}
                                    className="w-full py-4 rounded-2xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all"
                                >
                                    Đăng ký đối tác
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;