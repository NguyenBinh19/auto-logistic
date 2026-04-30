import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Phone, ShieldCheck, User, AtSign, CheckCircle2 } from 'lucide-react';
import { staffService } from '@/services/staff.service.js';

const StaffFormModal = ({ isOpen, onClose, initialData, onSuccess, isViewOnly = false }) => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserId = currentUser?.id || currentUser?._id || currentUser?.userId;
    const [formData, setFormData] = useState({
        userId: '',
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        phone: '',
        status: 'ACTIVE',
        permission: '',
        address: '',
        dob: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const sanitizeText = (text) => (!text || text.includes('?')) ? '' : text;

    useEffect(() => {
        if (initialData && isOpen) {
            setFormData({
                userId: initialData.id || '',
                firstName: sanitizeText(initialData.firstName),
                lastName: sanitizeText(initialData.lastName),
                username: initialData.username || '',
                email: initialData.email || '',
                phone: initialData.phone || '',
                status: initialData.status || 'ACTIVE',
                permission: initialData.permission || 'AGENCY_STAFF',
                address: initialData.address || '',
                dob: initialData.dob || '',
            });
        }
    }, [initialData, isOpen]);

    const handlePhoneChange = (e) => {
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
        if (isViewOnly || isSubmitting) return;
        if (formData.userId === currentUserId && formData.status !== initialData.status) {
            alert("Bạn không thể tự thay đổi trạng thái hoạt động của chính mình!");
            return;
        }
        const cleanPhone = formData.phone.trim();
        if (!validateVietnamesePhone(cleanPhone)) {
            alert("Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 số (03, 05, 07, 08, 09...).");
            return;
        }
        try {
            setIsSubmitting(true);
            const updatePayload = {
                userId: formData.userId,
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                username: formData.username,
                email: formData.email,
                phone: formData.phone,
                status: formData.status,
                permission: formData.permission,
            };

            await staffService.updateStaff(updatePayload);
            alert("Cập nhật nhân viên đại lý thành công!");
            onSuccess();
            onClose();
        } catch (error) {
            alert("Lỗi: " + (error.response?.data?.message || "Không thể cập nhật"));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;
    const isSelfEditing = formData.userId === currentUserId;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-end z-[150]">
            <form onSubmit={handleSubmit} className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

                {/* Header */}
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-blue-50/50 to-white">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                            {isViewOnly ? "Chi Tiết Nhân Sự" : "Cập Nhật Thông Tin"}
                        </h2>
                        <p className="text-xs text-[#006AFF] font-bold uppercase mt-1 tracking-widest">
                            Hồ sơ nhân viên Agency
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
                            <Input label="Email liên kết" value={formData.email} disabled />
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
                                disabled={isViewOnly}
                                onChange={e => handleNameChange('lastName', e.target.value)}
                            />
                            <Input
                                label="Tên nhân viên"
                                value={formData.firstName}
                                disabled={isViewOnly}
                                onChange={e => handleNameChange('firstName', e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Số điện thoại"
                                icon={<Phone size={14}/>}
                                inputMode="numeric"
                                value={formData.phone}
                                disabled={isViewOnly}
                                onChange={handlePhoneChange}
                            />
                            <Input label="Ngày sinh" icon={<Calendar size={14}/>} value={formData.dob || 'Chưa cập nhật'} disabled />
                        </div>
                        <Input label="Địa chỉ liên hệ" icon={<MapPin size={14}/>} value={formData.address || 'Chưa cập nhật'} disabled />
                    </div>

                    {/* Section 3: Quyền hạn & Trạng thái */}
                    <div className="space-y-4 pb-10">
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                            <ShieldCheck size={14} /> Phân quyền & Trạng thái
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">Vai trò Agency</label>
                                <select
                                    disabled={isViewOnly}
                                    value={formData.permission}
                                    onChange={e => setFormData(prev => ({...prev, permission: e.target.value}))}
                                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 cursor-pointer focus:border-blue-400 transition-all appearance-none"
                                >
                                    <option value="AGENCY_MANAGER">QUẢN LÝ ĐẠI LÝ</option>
                                    <option value="AGENCY_STAFF">NHÂN VIÊN ĐẠI LÝ</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">Trạng thái tài khoản</label>
                                <select
                                    disabled={isViewOnly || isSelfEditing}
                                    value={formData.status}
                                    onChange={e => setFormData(prev => ({...prev, status: e.target.value}))}
                                    className={`w-full px-4 py-4 border rounded-2xl outline-none font-black transition-all appearance-none ${
                                        formData.status === 'ACTIVE'
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            : 'bg-rose-50 text-rose-600 border-rose-100'
                                    }`}
                                >
                                    <option value="ACTIVE"> ĐANG HOẠT ĐỘNG</option>
                                    <option value="LOCKED"> ĐÃ KHÓA</option>
                                </select>
                                {isSelfEditing && !isViewOnly && (
                                    <p className="text-[10px] text-amber-600 font-bold mt-2 italic">
                                        Bạn không thể tự khóa tài khoản của chính mình
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-slate-100 flex gap-4 bg-white">
                    <button type="button" onClick={onClose} className="flex-1 py-4 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 transition-all border border-slate-200">
                        {isViewOnly ? "Đóng" : "Hủy bỏ"}
                    </button>
                    {!isViewOnly && (
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-[2] py-4 bg-[#006AFF] text-white font-black rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "ĐANG XỬ LÝ..." : <><CheckCircle2 size={20} /> XÁC NHẬN CẬP NHẬT</>}
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