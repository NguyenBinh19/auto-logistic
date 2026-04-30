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

    // Xử lý loại bỏ ký tự lỗi phông
    const sanitizeText = (text) => {
        if (!text) return '';
        return text.includes('?') ? '' : text;
    };

    useEffect(() => {
        if (initialData) {
            setFormData({
                userId: initialData.id || '',
                firstName: initialData.firstName || '',
                lastName: initialData.lastName || '',
                username: initialData.username || '',
                email: initialData.email || '',
                phone: initialData.phone || '',
                status: initialData.status || 'ACTIVE',
                permission: initialData.permission || '',
                address: initialData.address || '',
                dob: initialData.dob || ''
            });
        }
    }, [initialData, isOpen]);

    // Ép kiểu: Chỉ cho nhập số cho SĐT
    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
        setFormData({ ...formData, phone: value });
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
        if (isViewOnly) return;
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
            const updatePayload = {
                userId: formData.userId,
                firstName: formData.firstName,
                lastName: formData.lastName,
                username: formData.username,
                email: formData.email,
                phone: formData.phone,
                status: formData.status,
                permission: formData.permission
            };

            await staffService.updateStaff(updatePayload);
            alert("Cập nhật thông tin nhân viên thành công!");
            onSuccess();
            onClose();
        } catch (error) {
            alert("Lỗi: " + (error.response?.data?.message || "Không thể cập nhật"));
        }
    };

    if (!isOpen) return null;

    const isHotelAccount = formData.permission?.startsWith('HOTEL_');
    const isSelfEditing = formData.userId === currentUserId;
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-end z-[150]">
            <form onSubmit={handleSubmit} className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

                {/* Header */}
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                            {isViewOnly ? "Chi Tiết Hồ Sơ" : "Chỉnh Sửa Nhân Viên"}
                        </h2>
                        <p className="text-xs text-slate-400 font-bold uppercase mt-1 tracking-widest">
                            {isViewOnly ? "Chế độ xem thông tin" : "Cập nhật dữ liệu hệ thống"}
                        </p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">

                    {/* Section: Tài khoản hệ thống */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-tighter">
                            <AtSign size={14} /> Thông tin định danh
                        </div>
                        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <Input label="Tên đăng nhập" value={formData.username} disabled />
                            <Input label="Email hệ thống" value={formData.email} disabled />
                        </div>
                    </div>

                    {/* Section: Thông tin cá nhân */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-tighter">
                            <User size={14} /> Thông tin cá nhân
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Họ & Tên đệm"
                                placeholder="VD: Nguyễn"
                                value={formData.lastName}
                                disabled={isViewOnly}
                                onChange={e => handleNameChange('lastName', e.target.value)}
                            />
                            <Input
                                label="Tên nhân viên"
                                placeholder="VD: Văn A"
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
                                placeholder="Nhập 10 số..."
                                value={formData.phone}
                                disabled={isViewOnly}
                                onChange={handlePhoneChange}
                            />
                            <Input
                                label="Ngày sinh (Chỉ xem)"
                                icon={<Calendar size={14}/>}
                                value={formData.dob || 'Chưa cập nhật'}
                                disabled={true}
                            />
                        </div>

                        <Input
                            label="Địa chỉ hiện tại (Chỉ xem)"
                            icon={<MapPin size={14}/>}
                            value={formData.address || 'Chưa cập nhật'}
                            disabled={true}
                        />
                    </div>

                    {/* Section: Phân quyền & Trạng thái */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-tighter">
                            <ShieldCheck size={14} /> Quyền hạn & Trạng thái
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase tracking-widest">Vai trò</label>
                                <select
                                    disabled={isViewOnly}
                                    value={formData.permission}
                                    onChange={e => setFormData({...formData, permission: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-700 transition-all cursor-pointer"
                                >
                                    {isHotelAccount ? (
                                        <>
                                            <option value="HOTEL_MANAGER">QUẢN LÝ KHÁCH SẠN</option>
                                            <option value="HOTEL_STAFF">NHÂN VIÊN KHÁCH SẠN</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="AGENCY_MANAGER">QUẢN LÝ ĐẠI LÝ</option>
                                            <option value="AGENCY_STAFF">NHÂN VIÊN ĐẠI LÝ</option>
                                        </>
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase tracking-widest">Trạng thái tài khoản</label>
                                <select
                                    disabled={isViewOnly || isSelfEditing}
                                    value={formData.status}
                                    onChange={e => setFormData({...formData, status: e.target.value})}
                                    className={`w-full px-4 py-3 border rounded-xl outline-none transition-all font-black ${
                                        formData.status === 'ACTIVE'
                                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                            : 'bg-rose-50 border-rose-100 text-rose-600'
                                    }`}
                                >
                                    <option value="ACTIVE"> ĐANG HOẠT ĐỘNG</option>
                                    <option value="LOCKED"> ĐANG BỊ KHÓA</option>
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
                        {isViewOnly ? "Đóng cửa sổ" : "Hủy bỏ"}
                    </button>
                    {!isViewOnly && (
                        <button type="submit" className="flex-[2] py-4 bg-[#006AFF] text-white font-black rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2">
                            <CheckCircle2 size={20} /> XÁC NHẬN CẬP NHẬT
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

const Input = ({ label, icon, disabled, ...props }) => (
    <div>
        <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase tracking-widest flex items-center gap-1">
            {icon} {label}
        </label>
        <input
            className={`w-full px-4 py-3 border border-slate-200 rounded-xl outline-none transition-all font-medium ${
                disabled
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-transparent'
                    : 'bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 text-slate-700'
            }`}
            disabled={disabled}
            {...props}
        />
    </div>
);

export default StaffFormModal;