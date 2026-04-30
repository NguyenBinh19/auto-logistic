import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft, User, Mail, Phone, MapPin, Shield, Calendar,
    Clock, Loader2, AlertCircle, ShieldBan, ShieldCheck,
    CheckCircle2, Ban, Award
} from "lucide-react";
import { userService } from "@/services/user.service.js";

const AdminUserDetail = () => {
    const { userId } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("general"); // "general" or "commercial"

    // Ban/Unban state
    const [banLoading, setBanLoading] = useState(false);
    const [showBanModal, setShowBanModal] = useState(false);
    const [banAction, setBanAction] = useState(null); // 'ban' or 'unban'
    const [banReason, setBanReason] = useState("");
    const [actionSuccess, setActionSuccess] = useState(null);
    const [actionError, setActionError] = useState(null);

    useEffect(() => {
        fetchUserDetail();
    }, [userId]);

    const fetchUserDetail = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await userService.getUserById(userId);
            setUser(data.result);
        } catch (err) {
            if (err.response?.status === 404) {
                setError("Hồ sơ người dùng không tồn tại hoặc đã bị xóa.");
            } else if (err.response?.status === 403) {
                setError("Không đủ quyền để xem hồ sơ này.");
            } else {
                setError("Không thể tải thông tin người dùng.");
            }
        } finally {
            setLoading(false);
        }
    };

    const openBanModal = (action) => {
        setBanAction(action);
        setBanReason("");
        setShowBanModal(true);
        setActionError(null);
    };

    const handleBanAction = async () => {
        setBanLoading(true);
        setActionError(null);
        setActionSuccess(null);
        try {
            const banned = banAction === "ban";
            const data = await userService.banUser(userId, banned, banReason);
            setUser(data.result);
            setShowBanModal(false);
            setActionSuccess(
                banned
                    ? "Tài khoản đã bị khóa thành công."
                    : "Tài khoản đã được mở khóa thành công."
            );
            setTimeout(() => setActionSuccess(null), 4000);
        } catch (err) {
            const msg = err.response?.data?.message || "Thao tác thất bại.";
            setActionError(msg);
        } finally {
            setBanLoading(false);
        }
    };

    const getRoleBadge = (roleName) => {
        const map = {
            ADMIN: { label: "Admin", color: "bg-blue-100 text-blue-700", pill: "bg-blue-500" },
            HOTEL_MANAGER: { label: "Hotel Manager", color: "bg-emerald-100 text-emerald-700", pill: "bg-emerald-500" },
            HOTEL_STAFF: { label: "Hotel Staff", color: "bg-teal-100 text-teal-700", pill: "bg-teal-500" },
            AGENCY_MANAGER: { label: "Agency Manager", color: "bg-violet-100 text-violet-700", pill: "bg-violet-500" },
            AGENCY_STAFF: { label: "Agency Staff", color: "bg-purple-100 text-purple-700", pill: "bg-purple-500" },
            USER: { label: "User", color: "bg-gray-100 text-gray-600", pill: "bg-gray-400" },
        };
        return map[roleName] || { label: roleName, color: "bg-gray-100 text-gray-600", pill: "bg-gray-400" };
    };

    const getStatusConfig = (status) => {
        const map = {
            ACTIVE: { label: "Hoạt động", color: "bg-emerald-100 text-emerald-700", headerBg: "bg-white" },
            BANNED: { label: "Đã khóa", color: "bg-red-100 text-red-700", headerBg: "bg-red-50 border-red-200" },
            LOCKED: { label: "Tạm khóa", color: "bg-amber-100 text-amber-700", headerBg: "bg-amber-50 border-amber-200" },
            UNVERIFIED: { label: "Chưa xác minh", color: "bg-slate-100 text-slate-600", headerBg: "bg-slate-50" },
        };
        return map[status] || { label: status, color: "bg-gray-100 text-gray-600", headerBg: "bg-white" };
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleString("vi-VN", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-blue-600" size={36} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 font-sans">
                <button
                    onClick={() => navigate("/admin/users")}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-8 font-medium"
                >
                    <ArrowLeft size={16} /> Quay lại danh sách
                </button>
                <div className="max-w-xl mx-auto text-center mt-16">
                    <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
                    <p className="text-slate-600 mb-4 font-medium">{error}</p>
                    <button
                        onClick={fetchUserDetail}
                        className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const statusConfig = getStatusConfig(user.status);
    const isAdmin = user.roles && [...user.roles].some((r) => r.name === "ADMIN");
    const isBanned = user.status === "BANNED";

    const isAgency = user?.roles?.some(r => r.name.includes("AGENCY_MANAGER"));
    const isHotel = user?.roles?.some(r => r.name.includes("HOTEL_MANAGER"));

    return (
        <div className="p-8 bg-slate-50 min-h-screen font-sans">
            {/* Back Button */}
            <button
                onClick={() => navigate("/admin/users")}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-700 mb-6 font-medium text-sm"
            >
                <ArrowLeft size={16}/> Quay lại danh sách người dùng
            </button>

            {/* Success/Error Messages */}
            {actionSuccess && (
                <div
                    className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-xl flex items-center gap-3 max-w-4xl">
                    <CheckCircle2 size={20}/>
                    <span className="text-sm font-bold">{actionSuccess}</span>
                </div>
            )}

            <div className="max-w-4xl">
                {/* Header Card */}
                <div className={`rounded-2xl p-6 mb-6 border shadow-sm ${statusConfig.headerBg}`}>
                    <div className="flex items-center gap-5">
                        <div
                            className="w-20 h-20 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                            {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt="" className="w-full h-full object-cover"/>
                            ) : (
                                <User size={32} className="text-slate-400"/>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-xl font-black text-slate-800">{user.username}</h1>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusConfig.color}`}>
                                    {statusConfig.label}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">ID: {user.id}</p>
                            <div className="flex gap-2 mt-2 flex-wrap">
                                {user.roles &&
                                    [...user.roles].map((role) => {
                                        const badge = getRoleBadge(role.name);
                                        return (
                                            <span key={role.name}
                                                  className={`px-3 py-1 rounded-full text-xs font-bold ${badge.color}`}>
                                                {badge.label}
                                            </span>
                                        );
                                    })}
                            </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            {!isAdmin && (
                                isBanned ? (
                                    <button
                                        onClick={() => openBanModal("unban")}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 transition-all"
                                    >
                                        <ShieldCheck size={16}/> Mở khóa
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => openBanModal("ban")}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-200 transition-all"
                                    >
                                        <ShieldBan size={16}/> Khóa tài khoản
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                    {/* Navigation Tabs */}
                    <div className="flex gap-6 mt-8 border-t border-slate-100 pt-2">
                        <button
                            onClick={() => setActiveTab("general")}
                            className={`py-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'general' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}
                        >
                            Thông tin cơ bản
                        </button>

                    </div>
                </div>
                {/* Content Area */}
                <div className="animate-in fade-in duration-300">
                    {/* Tab 1: Thông tin chung */}
                    {activeTab === "general" && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                                <h3 className="text-base font-bold text-slate-800 mb-5 flex items-center gap-2"><User
                                    size={18} className="text-slate-400"/> Thông tin liên hệ</h3>
                                <div className="space-y-4">
                                    <InfoRow icon={<Mail size={15}/>} label="Email" value={user.email}/>
                                    <InfoRow icon={<Phone size={15}/>} label="Số điện thoại"
                                             value={user.phone || "Chưa cập nhật"}/>
                                    <InfoRow icon={<MapPin size={15}/>} label="Địa chỉ"
                                             value={user.address || "Chưa cập nhật"}/>
                                    <InfoRow icon={<Calendar size={15}/>} label="Ngày sinh"
                                             value={user.dob || "Chưa cập nhật"}/>
                                </div>
                            </section>
                            <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                                <h3 className="text-base font-bold text-slate-800 mb-5 flex items-center gap-2"><Shield
                                    size={18} className="text-slate-400"/> Bảo mật</h3>
                                <div className="space-y-4">
                                    <InfoRow icon={<Clock size={15}/>} label="Đăng nhập cuối"
                                             value={formatDate(user.lastLogin)}/>
                                    <InfoRow icon={<Shield size={15}/>} label="Trạng thái tài khoản" value={<span
                                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusConfig.color}`}>{statusConfig.label}</span>}/>
                                    <InfoRow icon={<Shield size={15}/>} label="Mật khẩu" value="••••••••"/>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* Tab 2: Agency Ranking (Chỉ hiện nếu là Agency) */}
                    {isAgency && activeTab === "ranking" && (
                        <AgencyRankingTab user={user}/>
                    )}

                    {/* Tab 3: Hotel Commission (Chỉ hiện nếu là Hotel) */}
                    {isHotel && activeTab === "commission" && (
                        <SetHotelCommissions hotelId={user.id}/>
                    )}
                </div>
        </div>

    {/* Ban/Unban Modal */
    }
    {
        showBanModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                    <div className="flex items-center gap-3 mb-5">
                        {banAction === "ban" ? (
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <Ban size={20} className="text-red-600"/>
                            </div>
                        ) : (
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                <ShieldCheck size={20} className="text-emerald-600"/>
                            </div>
                        )}
                        <div>
                            <h3 className="font-bold text-slate-800">
                                {banAction === "ban" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                            </h3>
                            <p className="text-sm text-slate-500">{user.username} ({user.email})</p>
                        </div>
                    </div>

                    <div className="mb-5">
                        <label className="text-sm font-bold text-slate-600 mb-1.5 block">
                            Lý do {banAction === "ban" ? "khóa" : "mở khóa"}
                        </label>
                        <textarea
                            value={banReason}
                            onChange={(e) => setBanReason(e.target.value)}
                            rows={3}
                            placeholder="Nhập lý do..."
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 outline-none resize-none"
                        />
                    </div>

                    {actionError && (
                        <div
                            className="mb-4 bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg flex items-center gap-2 text-sm">
                            <AlertCircle size={14}/> {actionError}
                        </div>
                    )}

                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={() => setShowBanModal(false)}
                                disabled={banLoading}
                                className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleBanAction}
                                disabled={banLoading}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-70 ${
                                    banAction === "ban"
                                        ? "bg-red-600 hover:bg-red-700"
                                        : "bg-emerald-600 hover:bg-emerald-700"
                                }`}
                            >
                                {banLoading && <Loader2 className="animate-spin" size={14} />}
                                {banAction === "ban" ? "Khóa tài khoản" : "Mở khóa"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-start gap-3">
        <span className="text-slate-400 mt-0.5 flex-shrink-0">{icon}</span>
        <div className="flex-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
            <div className="text-sm font-medium text-slate-700 mt-0.5">
                {typeof value === "string" ? value : value}
            </div>
        </div>
    </div>
);

export default AdminUserDetail;
