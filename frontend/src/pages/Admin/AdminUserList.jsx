import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search, Filter, Users, ChevronLeft, ChevronRight,
    Loader2, Eye, ShieldBan, ShieldCheck, AlertCircle
} from "lucide-react";
import { userService } from "@/services/user.service.js";

const ROLES = [
    { value: "", label: "Tất cả vai trò" },
    { value: "ADMIN", label: "Admin" },
    { value: "ADMIN_STAFF", label: "Admin Staff" },
    { value: "HOTEL_MANAGER", label: "Hotel Manager" },
    { value: "HOTEL_STAFF", label: "Hotel Staff" },
    { value: "AGENCY_MANAGER", label: "Agency Manager" },
    { value: "AGENCY_STAFF", label: "Agency Staff" },
];

const STATUSES = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "ACTIVE", label: "Hoạt động" },
    { value: "BANNED", label: "Đã khóa" },
    { value: "UNVERIFIED", label: "Chưa xác minh" },
    { value: "LOCKED", label: "Tạm khóa" },
];

const AdminUserList = () => {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [metrics, setMetrics] = useState({ activeUsers: 0 });

    // Search & Filter
    const [keyword, setKeyword] = useState("");
    const [role, setRole] = useState("");
    const [status, setStatus] = useState("");

    // Pagination
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await userService.searchUsers({
                keyword: keyword || undefined,
                role: role || undefined,
                status: status || undefined,
                page,
                size,
            });
            const pageData = data.result;
            setUsers(pageData.content || []);
            setTotalPages(pageData.totalPages || 0);
            setTotalElements(pageData.totalElements || 0);
        } catch (err) {
            setError("Không thể tải danh sách người dùng.");
        } finally {
            setLoading(false);
        }
    }, [keyword, role, status, page, size]);

    const fetchMetrics = async () => {
        try {
            const data = await userService.getUserMetrics();
            setMetrics(data.result);
        } catch {
            // Silently fail for metrics
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        fetchMetrics();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(0);
    };

    const handleViewDetail = (userId) => {
        navigate(`/admin/users/${userId}`);
    };

    const getRoleBadge = (roleName) => {
        const map = {
            ADMIN: { label: "Admin", color: "bg-blue-100 text-blue-700" },
            ADMIN_STAFF: { label: "Admin Staff", color: "bg-indigo-100 text-indigo-700" },
            HOTEL_MANAGER: { label: "Hotel Manager", color: "bg-emerald-100 text-emerald-700" },
            HOTEL_STAFF: { label: "Hotel Staff", color: "bg-teal-100 text-teal-700" },
            AGENCY_MANAGER: { label: "Agency Manager", color: "bg-violet-100 text-violet-700" },
            AGENCY_STAFF: { label: "Agency Staff", color: "bg-purple-100 text-purple-700" },
            USER: { label: "User", color: "bg-gray-100 text-gray-600" },
        };
        return map[roleName] || { label: roleName, color: "bg-gray-100 text-gray-600" };
    };

    const getStatusBadge = (st) => {
        const map = {
            ACTIVE: { label: "Hoạt động", color: "bg-emerald-100 text-emerald-700" },
            BANNED: { label: "Đã khóa", color: "bg-red-100 text-red-700" },
            LOCKED: { label: "Tạm khóa", color: "bg-amber-100 text-amber-700" },
            UNVERIFIED: { label: "Chưa xác minh", color: "bg-slate-100 text-slate-600" },
        };
        return map[st] || { label: st, color: "bg-gray-100 text-gray-600" };
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleString("vi-VN", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen font-sans">
            {/* Header */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">QUẢN LÝ NGƯỜI DÙNG</h1>
                    <p className="text-slate-500 text-sm mt-1">Tìm kiếm, lọc và quản lý tài khoản người dùng</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 shadow-sm">
                    <p className="text-xs text-slate-600 font-medium">Người dùng hoạt động</p>
                    <p className="text-2xl font-black text-emerald-600">{metrics.activeUsers}</p>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
                <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-4">
                    <div className="flex-1 min-w-[240px]">
                        <label className="text-xs font-bold text-slate-600 uppercase mb-1 block">Tìm kiếm</label>
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="Email, tên hoặc số điện thoại..."
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
                            />
                        </div>
                    </div>
                    <div className="min-w-[180px]">
                        <label className="text-xs font-bold text-slate-600 uppercase mb-1 block">Vai trò</label>
                        <select
                            value={role}
                            onChange={(e) => { setRole(e.target.value); setPage(0); }}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 outline-none bg-white"
                        >
                            {ROLES.map((r) => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="min-w-[180px]">
                        <label className="text-xs font-bold text-slate-600 uppercase mb-1 block">Trạng thái</label>
                        <select
                            value={status}
                            onChange={(e) => { setStatus(e.target.value); setPage(0); }}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 outline-none bg-white"
                        >
                            {STATUSES.map((s) => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#006AFF] text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center gap-2"
                    >
                        <Filter size={16} /> Lọc
                    </button>
                </form>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3">
                    <AlertCircle size={20} />
                    <span className="text-sm font-bold">{error}</span>
                    <button onClick={fetchUsers} className="ml-auto text-sm font-bold underline">Thử lại</button>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-600 uppercase">Người dùng</th>
                                <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-600 uppercase">Email</th>
                                <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-600 uppercase">Vai trò</th>
                                <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-600 uppercase">Trạng thái</th>
                                <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-600 uppercase">Đăng nhập cuối</th>
                                <th className="text-center px-5 py-3.5 text-xs font-bold text-slate-600 uppercase">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-16">
                                        <Loader2 className="animate-spin text-blue-500 mx-auto" size={32} />
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-16 text-slate-400">
                                        <Users className="mx-auto mb-2" size={32} />
                                        <p className="font-medium">Không tìm thấy người dùng nào.</p>
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => {
                                    const statusBadge = getStatusBadge(user.status);
                                    return (
                                        <tr
                                            key={user.id}
                                            className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                                            onClick={() => handleViewDetail(user.id)}
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                                                        {user.avatarUrl ? (
                                                            <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Users size={16} className="text-slate-400" />
                                                        )}
                                                    </div>
                                                    <span className="font-bold text-sm text-slate-800">{user.username}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-600">{user.email}</td>
                                            <td className="px-5 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles && [...user.roles].map((r) => {
                                                        const badge = getRoleBadge(r.name);
                                                        return (
                                                            <span key={r.name} className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${badge.color}`}>
                                                                {badge.label}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${statusBadge.color}`}>
                                                    {statusBadge.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-500">
                                                {formatDate(user.lastLogin)}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleViewDetail(user.id); }}
                                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye size={16} className="text-slate-500" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-4 border-t border-slate-200 bg-slate-50">
                        <p className="text-sm text-slate-500">
                            Hiển thị {users.length} / {totalElements} người dùng
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-sm font-medium text-slate-600 px-3">
                                {page + 1} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                                disabled={page >= totalPages - 1}
                                className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUserList;
