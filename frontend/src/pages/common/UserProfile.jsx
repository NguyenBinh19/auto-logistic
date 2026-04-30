import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    User, Mail, Phone, MapPin, Shield, Camera, Trash2,
    Save, Loader2, CheckCircle2, AlertCircle, ArrowLeft, Pencil
} from "lucide-react";
import { userService } from "@/services/user.service.js";
import { useAuth } from "@/context/AuthContext.jsx";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const UserProfile = () => {
    const navigate = useNavigate();
    const { updateUser } = useAuth();
    const fileInputRef = useRef(null);

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(false);

    // Edit form state
    const [editData, setEditData] = useState({ phone: "", address: "" });
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [errors, setErrors] = useState({});

    // Avatar state
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [avatarError, setAvatarError] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await userService.getMyProfile();
            const user = data.result;
            setProfile(user);
            setEditData({ phone: user.phone || "", address: user.address || "" });
        } catch (err) {
            if (err.response?.status === 401) {
                navigate("/login");
                return;
            }
            setError("Không thể tải thông tin hồ sơ. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        let newErrors = {};
        const phoneRegex = /^(0[3|5|7|8|9])([0-9]{8})$/;

        // Validate Phone
        if (editData.phone) {
            const cleanPhone = editData.phone.replace(/\s/g, "");
            if (!phoneRegex.test(cleanPhone)) {
                newErrors.phone = "Số điện thoại không hợp lệ (phải có 10 số, bắt đầu bằng 03, 05, 07, 08, 09).";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        setSaving(true);
        setSaveError(null);
        setErrors({});
        setSaveSuccess(false);
        try {
            const data = await userService.updateMyProfile(editData);
            const user = data.result;
            setProfile(user);
            updateUser(user);
            setSaveSuccess(true);
            setEditMode(false);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            const msg = err.response?.data?.message || "Cập nhật thất bại.";
            setSaveError(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAvatarError(null);

        if (!ALLOWED_TYPES.includes(file.type)) {
            setAvatarError("Chỉ chấp nhận ảnh JPG, JPEG, PNG hoặc WebP.");
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            setAvatarError("Kích thước ảnh không được vượt quá 5MB.");
            return;
        }

        setAvatarUploading(true);
        try {
            const data = await userService.uploadAvatar(file);
            const user = data.result;
            setProfile(user);
            updateUser(user);
        } catch (err) {
            setAvatarError(err.response?.data?.message || "Tải ảnh thất bại.");
        } finally {
            setAvatarUploading(false);
            e.target.value = "";
        }
    };

    const handleRemoveAvatar = async () => {
        setAvatarUploading(true);
        setAvatarError(null);
        try {
            const data = await userService.removeAvatar();
            const user = data.result;
            setProfile(user);
            updateUser(user);
        } catch (err) {
            setAvatarError(err.response?.data?.message || "Xóa ảnh thất bại.");
        } finally {
            setAvatarUploading(false);
        }
    };

    const getRoleBadge = (roleName) => {
        const map = {
            ADMIN: { label: "Admin", color: "bg-blue-100 text-blue-700" },
            HOTEL_MANAGER: { label: "Hotel Manager", color: "bg-emerald-100 text-emerald-700" },
            HOTEL_STAFF: { label: "Hotel Staff", color: "bg-teal-100 text-teal-700" },
            AGENCY_MANAGER: { label: "Agency Manager", color: "bg-violet-100 text-violet-700" },
            AGENCY_STAFF: { label: "Agency Staff", color: "bg-purple-100 text-purple-700" },
            USER: { label: "User", color: "bg-gray-100 text-gray-700" },
        };
        return map[roleName] || { label: roleName, color: "bg-gray-100 text-gray-700" };
    };

    const getStatusBadge = (status) => {
        const map = {
            ACTIVE: { label: "Hoạt động", color: "bg-emerald-100 text-emerald-700" },
            BANNED: { label: "Đã khóa", color: "bg-red-100 text-red-700" },
            LOCKED: { label: "Tạm khóa", color: "bg-amber-100 text-amber-700" },
            UNVERIFIED: { label: "Chưa xác minh", color: "bg-slate-100 text-slate-600" },
        };
        return map[status] || { label: status, color: "bg-gray-100 text-gray-700" };
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
            <div className="max-w-2xl mx-auto mt-20 text-center">
                <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
                <p className="text-slate-600 mb-4">{error}</p>
                <button
                    onClick={fetchProfile}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    if (!profile) return null;

    const statusBadge = getStatusBadge(profile.status);

    return (
        <div className="bg-[#F8FAFC] min-h-screen p-6 md:p-10 font-sans">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                {/* Header */}
                <div className="mb-8">
                    {/* Nút Back đơn giản */}
                    <button
                        onClick={() => navigate(-1)}
                        className="group flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-4"
                    >
                        <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm group-hover:bg-slate-50">
                            <ArrowLeft size={18} />
                        </div>
                        <span className="text-sm font-bold">Quay lại</span>
                    </button>

                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-900">Hồ sơ của tôi</h1>
                            <p className="text-slate-500 text-sm mt-1">Xem và quản lý thông tin cá nhân</p>
                        </div>
                        {!editMode ? (
                            <button
                                onClick={() => setEditMode(true)}
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#006AFF] hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all"
                            >
                                <Pencil size={16} /> Chỉnh sửa
                            </button>
                        ) : (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setEditMode(false);
                                        setEditData({ phone: profile.phone || "", address: profile.address || "" });
                                        setSaveError(null);
                                    }}
                                    className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-[#006AFF] hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all disabled:opacity-70"
                                >
                                    {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                    Lưu
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Success / Error Messages */}
                {saveSuccess && (
                    <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-xl flex items-center gap-3">
                        <CheckCircle2 size={20} />
                        <span className="text-sm font-bold">Cập nhật hồ sơ thành công!</span>
                    </div>
                )}
                {saveError && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3">
                        <AlertCircle size={20} />
                        <span className="text-sm font-bold">{saveError}</span>
                    </div>
                )}

                {/* Avatar Section */}
                <section className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-sm mb-6">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
                                {profile.avatarUrl ? (
                                    <img
                                        src={profile.avatarUrl}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="text-slate-400" size={40} />
                                )}
                            </div>
                            {avatarUploading && (
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                                    <Loader2 className="animate-spin text-white" size={24} />
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">
                                {profile.username || "Chưa cập nhật"}
                            </h2>
                            <div className="flex gap-2 mt-2">
                                {profile.roles &&
                                    [...profile.roles].map((role) => {
                                        const badge = getRoleBadge(role.name);
                                        return (
                                            <span key={role.name} className={`px-3 py-1 rounded-full text-xs font-bold ${badge.color}`}>
                                                {badge.label}
                                            </span>
                                        );
                                    })}
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadge.color}`}>
                                    {statusBadge.label}
                                </span>
                            </div>
                            <div className="flex gap-2 mt-3">
                                <button
                                    onClick={handleAvatarClick}
                                    disabled={avatarUploading}
                                    className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-all"
                                >
                                    <Camera size={14} /> Upload ảnh
                                </button>
                                {profile.avatarUrl && (
                                    <button
                                        onClick={handleRemoveAvatar}
                                        disabled={avatarUploading}
                                        className="flex items-center gap-1.5 px-4 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-all"
                                    >
                                        <Trash2 size={14} /> Xóa ảnh
                                    </button>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                            {avatarError && (
                                <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                                    <AlertCircle size={12} /> {avatarError}
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {/* Profile Info */}
                <section className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <User className="text-slate-400" size={20} /> Thông tin cá nhân
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Read-only fields */}
                        <ReadOnlyField
                            icon={<User size={16} />}
                            label="Tên đăng nhập"
                            value={profile.username}
                        />
                        <ReadOnlyField
                            icon={<Mail size={16} />}
                            label="Email"
                            value={profile.email}
                        />
                        <ReadOnlyField
                            icon={<Shield size={16} />}
                            label="Mật khẩu"
                            value="••••••••"
                        />

                        {/* Editable fields */}
                        {editMode ? (
                            <>
                                <div>
                                    <label
                                        className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                        <Phone size={14} className="text-slate-400" /> Số điện thoại
                                    </label>
                                    <input
                                        type="text"
                                        value={editData.phone}
                                        onChange={(e) => {
                                            const value = e.target.value;

                                            // chỉ cho số (0-9)
                                            if (/^\d*$/.test(value)) {
                                                setEditData((p) => ({ ...p, phone: value }));

                                                if (errors.phone) {
                                                    setErrors(prev => ({ ...prev, phone: null }));
                                                }
                                            }
                                        }}
                                        placeholder="Nhập số điện thoại"
                                        className={`w-full px-4 py-3 border rounded-xl font-medium outline-none transition-all ${errors.phone
                                                ? "border-red-500 bg-red-50 focus:ring-red-100"
                                                : "border-slate-200 focus:ring-blue-200 focus:border-blue-400"
                                            }`}
                                    />
                                    {errors.phone &&
                                        <p className="text-red-500 text-[11px] font-bold mt-1 ml-1 animate-shake">{errors.phone}</p>}
                                </div>
                                <div className="md:col-span-2">
                                    <label
                                        className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                        <MapPin size={14} className="text-slate-400" /> Địa chỉ
                                    </label>
                                    <input
                                        type="text"
                                        value={editData.address}
                                        onChange={(e) => setEditData((p) => ({ ...p, address: e.target.value }))}
                                        placeholder="Nhập địa chỉ"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all"
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <ReadOnlyField
                                    icon={<Phone size={16} />}
                                    label="Số điện thoại"
                                    value={profile.phone || "Chưa cập nhật"}
                                />
                                <ReadOnlyField
                                    icon={<MapPin size={16} />}
                                    label="Địa chỉ"
                                    value={profile.address || "Chưa cập nhật"}
                                />
                            </>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

const ReadOnlyField = ({ icon, label, value }) => (
    <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            {React.cloneElement(icon, { className: "text-slate-400" })} {label}
        </label>
        <div className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-700 font-medium">
            {value || "—"}
        </div>
    </div>
);

export default UserProfile;
