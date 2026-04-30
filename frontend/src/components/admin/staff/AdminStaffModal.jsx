import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Phone, ShieldCheck, User, AtSign, CheckCircle2 } from 'lucide-react';
import { staffService } from '@/services/staff.service.js';

const StaffFormModal = ({ isOpen, onClose, initialData, onSuccess, isViewOnly = false }) => {
    // 1. Lấy thông tin người đang đăng nhập
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserId = currentUser?.id || currentUser?._id || currentUser?.userId;
    const currentUserRole = currentUser?.roles || "";

    // 2. Kiểm tra xem người đang đăng nhập có phải ADMIN tổng không
    // Chỉ ROLE_ADMIN mới được Edit. ADMIN_STAFF sẽ bị ép vào trạng thái viewOnly.
    const isFullAdmin = currentUserRole.includes("ROLE_ADMIN");
    const effectiveViewOnly = isViewOnly || !isFullAdmin;

    const [formData, setFormData] = useState({
        userId: '',
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        phone: '',
        status: 'ACTIVE',
        permission: 'ADMIN_STAFF', // Mặc định là ADMIN_STAFF
        address: '',
        dob: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const sanitizeText = (text) => {
        if (!text) return '';
        return text.includes('?') ? '' : text;
    };

    useEffect(() => {
        if (initialData && isOpen) {
            setFormData({
                userId: initialData.id || '',
                firstName: initialData.firstName || '',
                lastName: initialData.lastName || '',
                username: initialData.username || '',
                email: initialData.email || '',
                phone: initialData.phone || '',
                status: initialData.status || 'ACTIVE',
                permission: initialData.permission || 'ADMIN_STAFF',
                address: initialData.address || '',
                dob: initialData.dob || '',
            });
        }
    }, [initialData, isOpen]);

    const handlePhoneChange = (e) => {
        if (effectiveViewOnly) return;
        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
        setFormData(prev => ({ ...prev, phone: value }));
    };

    const validateVietnamesePhone = (phone) => {
        const vnf_regex = /^(03|05|07|08|09)+([0-9]{8})$/;
        return vnf_regex.test(phone);
    };

    const handleNameChange = (field, value) => {
        // 1. Loại bỏ số và ký tự đặc biệt ngay lập tức
        // Giữ lại chữ cái và dấu cách
        let cleanValue = value.replace(/[0-9!@#$%^&*(),.?":{}|<>]/g, '');
        // 2. Không cho phép nhập dấu cách ở ngay đầu dòng
        cleanValue = cleanValue.trimStart();
        if (cleanValue === '') {
            setFormData(prev => ({ ...prev, [field]: '' }));
            return;
        }
        // 3. Chuẩn hóa viết hoa chữ cái đầu
        const formattedName = cleanValue.toLowerCase().replace(/(^|\s)\S/g, (l) => l.toUpperCase());
        setFormData(prev => ({ ...prev, [field]: formattedName }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Chặn tuyệt đối nếu không phải ADMIN tổng
        if (effectiveViewOnly || isSubmitting) return;
        if (formData.userId === currentUserId && formData.status !== initialData.status) {
            alert("Bạn không được phép tự thay đổi trạng thái hoạt động của chính mình!");
            setFormData(prev => ({...prev, status: initialData.status}));
            return;
        }
        const cleanPhone = formData.phone.trim();
        if (!validateVietnamesePhone(cleanPhone)) {
            alert("Số điện thoại không hợp lệ!");
            return;
        }

        try {
            setIsSubmitting(true);
            const updatePayload = {
                userId: formData.userId,
                firstName: formData.firstName,
                lastName: formData.lastName,
                username: formData.username,
                email: formData.email,
                phone: formData.phone,
                status: formData.status,
                permission: formData.permission, // Luôn gửi permission hiện tại (ADMIN_STAFF)
            };

            await staffService.updateStaff(updatePayload);
            alert("Cập nhật thông tin Quản trị viên thành công!");
            onSuccess();
            onClose();
        } catch (error) {
            alert("Lỗi: " + (error.response?.data?.message || "Không thể cập nhật"));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-end z-[150]">
            <form onSubmit={handleSubmit} className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

                {/* Header */}
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-blue-50/50 to-white">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                            {effectiveViewOnly ? "Chi Tiết Quản Trị Viên" : "Cập Nhật Quản Trị Viên"}
                        </h2>
                        <p className="text-xs text-[#006AFF] font-bold uppercase mt-1 tracking-widest">
                            Hệ thống quản lý nhân sự
                        </p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 hover:bg-rose-50 hover:text-rose-500 rounded-full transition-all text-slate-400">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">

                    {/* Section 1: Định danh */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                            <AtSign size={14} /> Tài khoản hệ thống
                        </div>
                        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-5 rounded-[24px] border border-slate-100">
                            <Input label="Tên đăng nhập" value={formData.username} disabled />
                            <Input label="Email" value={formData.email} disabled />
                        </div>
                    </div>

                    {/* Section 2: Thông tin cá nhân */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                            <User size={14} /> Thông tin cá nhân
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Họ & Tên đệm"
                                value={formData.lastName}
                                disabled={effectiveViewOnly}
                                onChange={e => handleNameChange('lastName', e.target.value)}
                            />
                            <Input
                                label="Tên"
                                value={formData.firstName}
                                disabled={effectiveViewOnly}
                                onChange={e => handleNameChange('firstName', e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Số điện thoại"
                                icon={<Phone size={14}/>}
                                value={formData.phone}
                                disabled={effectiveViewOnly}
                                onChange={handlePhoneChange}
                            />
                            <Input label="Ngày sinh" icon={<Calendar size={14}/>} value={formData.dob || 'Chưa cập nhật'} disabled />
                        </div>
                        <Input label="Địa chỉ" icon={<MapPin size={14}/>} value={formData.address || 'Chưa cập nhật'} disabled />
                    </div>

                    {/* Section 3: Quyền hạn & Trạng thái */}
                    <div className="space-y-4 pb-10">
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                            <ShieldCheck size={14} /> Cấp bậc & Trạng thái
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Cấp bậc: Khóa cứng không cho sửa */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Vai trò</label>
                                <div className="w-full px-5 py-4 bg-slate-100 border-2 border-transparent rounded-2xl font-bold text-slate-500 flex items-center gap-2">
                                    {formData.permission === 'ADMIN' ? "ADMIN TỔNG" : "ADMIN STAFF"}
                                </div>
                            </div>

                            {/* Trạng thái: Chỉ ADMIN tổng mới được đổi, và không được tự khóa mình */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Trạng thái</label>
                                <select
                                    disabled={effectiveViewOnly || formData.userId === currentUserId}
                                    className={`w-full px-5 py-4 border-2 border-transparent rounded-2xl font-bold outline-none transition-all ${
                                        (effectiveViewOnly || formData.userId === currentUserId)
                                            ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                                            : "bg-slate-50 focus:border-[#006AFF] text-slate-800"
                                    }`}
                                    value={formData.status}
                                    onChange={e => setFormData({...formData, status: e.target.value})}
                                >
                                    <option value="ACTIVE">ĐANG HOẠT ĐỘNG</option>
                                    <option value="LOCKED">ĐANG KHÓA</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-slate-100 flex gap-4 bg-white">
                    <button type="button" onClick={onClose}
                            className="flex-1 py-4 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 transition-all border border-slate-200">
                        {effectiveViewOnly ? "Đóng" : "Hủy bỏ"}
                    </button>

                    {!effectiveViewOnly && (
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-[2] py-4 bg-[#006AFF] text-white font-black rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "ĐANG XỬ LÝ..." : <><CheckCircle2 size={20} /> CẬP NHẬT HỒ SƠ</>}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

const Input = ({ label, icon, disabled, ...props }) => (
    <div className="w-full">
        <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest flex items-center gap-1.5 ml-1">
            {icon} {label}
        </label>
        <input
            className={`w-full px-4 py-3.5 border border-slate-200 rounded-2xl outline-none transition-all font-bold ${
                disabled ? 'bg-slate-100 text-slate-400 border-transparent cursor-not-allowed' : 'bg-white focus:border-blue-400 text-slate-700'
            }`}
            disabled={disabled}
            {...props}
        />
    </div>
);

export default StaffFormModal;