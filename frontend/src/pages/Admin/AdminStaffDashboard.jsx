import { Plus, ChevronLeft, ChevronRight, Loader2, Search, Filter } from 'lucide-react';
import StaffStats from '@/components/admin/staff/AdminStaffStatistic.jsx';
import StaffActionMenu from '@/components/admin/staff/AdminStaffActionMenu.jsx';
import StaffFormModal from '@/components/admin/staff/AdminStaffModal.jsx';
import StaffCreateModal from "@/components/admin/staff/AdminCreateModal.jsx";
import React, { useState, useMemo, useEffect } from 'react';
import { staffService } from '@/services/staff.service.js';
import { ROLES } from '@/constant/roles.js';

const StaffDashboard = () => {
    const [staffs, setStaffs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        data: null,
        isViewOnly: false
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const userRole = currentUser?.roles || "";
    // Chỉ ADMIN TỔNG (ROLE_ADMIN) mới có quyền CRUD
    const isFullAdmin = userRole === "ROLE_ADMIN";
    // ADMIN STAFF vẫn vào được nhưng chỉ để xem
    const isAdminStaff = userRole === "ROLE_ADMIN_STAFF";
    const currentUserId = currentUser?.id || currentUser?._id || currentUser?.userId;

    const fetchStaffList = async () => {
        try {
            setLoading(true);
            const response = await staffService.getStaffAdminList();
            const data = response.result || [];
            const adminStaff = data.filter(s =>
                s.permission?.includes("ADMIN")
            );
            setStaffs(adminStaff);
        } catch (error) {
            console.error("Lỗi khi tải danh sách Admin:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStaffList(); }, []);

    // --- Logic Lọc Dữ Liệu ---
    const filteredStaffs = useMemo(() => {
        return staffs.filter(staff => {
            const fullName = `${staff.lastName || ''} ${staff.firstName || ''}`.toLowerCase();
            const email = (staff.email || '').toLowerCase();
            const username = (staff.username || '').toLowerCase();
            const search = searchTerm.toLowerCase();
            const matchesSearch = fullName.includes(search) || email.includes(search) || username.includes(search);
            let matchesRole = true;
            if (filterRole !== 'ALL') {
                if (filterRole === 'ADMIN') {
                    matchesRole = staff.permission === 'ADMIN' || staff.permission === 'ROLE_ADMIN';
                } else if (filterRole === 'ADMIN_STAFF') {
                    matchesRole = staff.permission === 'ADMIN_STAFF' || staff.permission === 'ROLE_ADMIN_STAFF';
                }
            }
            const matchesStatus = filterStatus === 'ALL' || staff.status === filterStatus;
            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [staffs, searchTerm, filterRole, filterStatus]);

    const handleAddStaff = () => {
        if (!isFullAdmin) return alert("Chỉ Admin tổng mới có quyền thêm mới!");
        setIsCreateOpen(true);
    };

    const handleEditStaff = (staff) => {
        setModalConfig({ isOpen: true, data: staff, isViewOnly: false });
    };

    const handleViewDetails = (staff) => {
        setModalConfig({ isOpen: true, data: staff, isViewOnly: true });
    };

    const handleToggleStatus = async (staff) => {
        // 1. Chặn tự khóa mình
        if (staff.id === currentUserId) {
            alert("Bạn không thể tự khóa tài khoản của chính mình!");
            return;
        }
        // 2. Chặn ADMIN_STAFF khóa ADMIN
        if (userRole === 'ADMIN_STAFF' && staff.permission === 'ADMIN') {
            alert("Bạn không có quyền thay đổi trạng thái của Quản trị viên cấp cao!");
            return;
        }
        const actionText = staff.status === 'ACTIVE' ? 'khóa' : 'mở khóa';
        if (!window.confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản này?`)) return;
        try {
            if (staff.status === 'ACTIVE') {
                await staffService.lockStaff(staff.id);
            } else {
                await staffService.unLockStaff(staff.id);
            }
            fetchStaffList();
        } catch (error) {
            alert(`Lỗi khi ${actionText} tài khoản`);
        }
    };

    const currentTableData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredStaffs.slice(start, start + itemsPerPage);
    }, [currentPage, filteredStaffs]);

    const totalPages = Math.max(1, Math.ceil(filteredStaffs.length / itemsPerPage));
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterRole, filterStatus]);

    return (
        <div className="bg-[#F8FAFC] min-h-screen p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-800">QUẢN LÝ NHÂN VIÊN HỆ THỐNG</h1>
                    {/* CHỈ ADMIN TỔNG MỚI THẤY NÚT THÊM */}
                    {isFullAdmin && (
                        <button
                            onClick={handleAddStaff}
                            className="bg-[#006AFF] text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-95"
                        >
                            <Plus size={20}/> Thêm quản trị viên
                        </button>
                    )}
                </div>

                <StaffStats data={staffs}/>

                {/* Search & Filter Bar */}
                <div className="mt-8 flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm theo tên, email hoặc username..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">

                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                            <select
                                className="bg-transparent text-sm font-semibold text-slate-600 focus:outline-none cursor-pointer"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="ALL">Tất cả trạng thái</option>
                                <option value="ACTIVE">Hoạt động</option>
                                <option value="LOCKED">Bị khóa</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 mt-8">
                    <div className="overflow-visible rounded-[24px">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/30 border-b border-slate-50">
                            <tr className="text-[12px] font-bold text-slate-600 uppercase tracking-wider">
                                <th className="px-8 py-5">Quản trị viên</th>
                                <th className="px-8 py-5">Vai trò</th>
                                <th className="px-8 py-5">Thông tin cá nhân</th>
                                <th className="px-8 py-5 text-center">Trạng thái</th>
                                <th className="px-8 py-5 text-right">Thao tác</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 min-h-[450px]">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-20"><Loader2
                                        className="animate-spin mx-auto text-blue-500"/></td>
                                </tr>
                            ) : filteredStaffs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-20">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <Search size={40} className="mb-2 opacity-20" />
                                            <p>{searchTerm ? "Không tìm thấy nhân viên phù hợp" : "Chưa có nhân viên nào"}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : currentTableData.map((staff) => (
                                <tr key={staff.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#006AFF] font-bold uppercase">
                                                {(staff.lastName?.[0] || staff.username?.[0] || 'A')}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">
                                                    {staff.lastName || staff.firstName
                                                        ? `${staff.lastName || ''} ${staff.firstName || ''}`.trim()
                                                        : staff.username}
                                                </p>
                                                <p className="text-xs text-slate-400 font-medium">{staff.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                            <span className={`text-[10px] font-black px-2 py-1 rounded-md border ${
                                                staff.permission === "ADMIN" || staff.permission === "ROLE_ADMIN"
                                                    ? 'bg-rose-50 text-rose-600 border-rose-100'
                                                    : 'bg-blue-50 text-[#006AFF] border-blue-100'
                                            }`}>
                                           {staff.permission === "ADMIN" || staff.permission === "ROLE_ADMIN"
                                               ? 'ADMIN TỔNG'
                                               : 'ADMIN STAFF'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm text-slate-600 font-medium">{staff.phone || 'Chưa có SĐT'}</p>
                                        <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                                            {staff.address || 'Chưa có địa chỉ'}
                                        </p>
                                        {staff.dob && <p className="text-[10px] text-slate-400">NS: {staff.dob}</p>}
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="flex flex-col items-center gap-1.5">
                                            {/* Toggle Switch */}
                                            <Toggle
                                                checked={staff.status === 'ACTIVE'}
                                                onChange={() => handleToggleStatus(staff)}
                                                disabled={!isFullAdmin || staff.id === currentUserId}
                                            />
                                            {/* Label Trạng thái  */}
                                            <span className={`text-[9px] font-bold uppercase tracking-wider ${
                                                staff.id === currentUserId
                                                    ? 'text-slate-400 italic' 
                                                    : (staff.status === 'ACTIVE' ? 'text-emerald-500' : 'text-rose-500')
                                            }`}>
                                                {staff.id === currentUserId ? (
                                                    <span className="flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                                        Đang truy cập
                                                    </span>
                                                ) : (
                                                    staff.status === 'ACTIVE' ? 'Hoạt động' : 'Bị khóa'
                                                )}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <StaffActionMenu
                                            isFullAdmin={isFullAdmin}
                                            onEdit={isFullAdmin ? () => handleEditStaff(staff) : null}
                                            onToggle={isFullAdmin ? () => handleToggleStatus(staff) : null}
                                            onViewDetails={() => handleViewDetails(staff)}
                                            onViewHistory={() => alert(`Lịch sử giao dịch: ${staff.username}`)}
                                            status={staff.status}
                                        />
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Phân Trang */}
                    {filteredStaffs.length > itemsPerPage && (
                        <div
                            className="px-8 py-6 bg-slate-50/30 border-t border-slate-50 flex items-center justify-center gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-blue-600 disabled:opacity-50"
                            >
                                <ChevronLeft size={18}/>
                            </button>
                            {[...Array(totalPages)].map((_, index) => (
                                <button
                                    key={index + 1}
                                    onClick={() => setCurrentPage(index + 1)}
                                    className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                                        currentPage === index + 1
                                            ? 'bg-[#006AFF] text-white shadow-md'
                                            : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                                    }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-blue-600 disabled:opacity-50"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <StaffFormModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({...modalConfig, isOpen: false})}
                initialData={modalConfig.data}
                isViewOnly={modalConfig.isViewOnly || !isFullAdmin}
                onSuccess={fetchStaffList}
            />
            <StaffCreateModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={fetchStaffList}
            />
        </div>
    );
};

const Toggle = ({checked, onChange, disabled}) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input
            type="checkbox"
            className="sr-only peer"
            checked={checked}
            onChange={disabled ? null : onChange} // Chặn sự kiện change
            disabled={disabled}
        />
        <div
            className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full transition-colors"></div>
    </label>
);

export default StaffDashboard;