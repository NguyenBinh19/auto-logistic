import React, { useState } from 'react';
import { X, User, Mail, Phone, ShieldCheck, Send, Info, UserPlus, Fingerprint } from 'lucide-react';
import { staffService } from '@/services/staff.service.js';

const StaffCreateModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        phone: '',
        permission: 'HOTEL_STAFF'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 1. Xử lý Username: Không dấu, không cách, chữ thường
    const handleUsernameChange = (val) => {
        const cleanValue = val.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Bỏ dấu tiếng Việt
            .replace(/\s/g, '') // Bỏ dấu cách
            .replace(/[^a-z0-9._]/g, ''); // Chỉ giữ lại chữ, số, chấm và gạch dưới
        setFormData({ ...formData, username: cleanValue });
    };

    // 2. Xử lý SĐT: Chỉ số, tối đa 10 số
    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
        setFormData({ ...formData, phone: value });
    };
    const validateVietnamesePhone = (phone) => {
        const vnf_regex = /^(03|05|07|08|09)+([0-9]{8})$/;
        return vnf_regex.test(phone);
    };

    // 3. Viết hoa chữ cái đầu (Ví dụ: nguyễn văn -> Nguyễn Văn)
    const formatName = (val) => {
        return val.toLowerCase().replace(/(^|\s)\S/g, (l) => l.toUpperCase());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const cleanPhone = formData.phone.trim(); // Loại bỏ khoảng trắng thừa
        if (!validateVietnamesePhone(cleanPhone)) {
            alert("Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 số (ví dụ: 09xx...)");
            return;
        }
        setIsSubmitting(true);

        try {
            // Chuẩn hóa dữ liệu lần cuối trước khi gửi để tránh lỗi phông
            const finalData = {
                ...formData,
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                username: formData.username.trim(),
                email: formData.email.trim().toLowerCase()
            };

            await staffService.createStaff(finalData);
            alert("Chúc mừng! Tài khoản " + finalData.username + " đã được tạo thành công.");

            setFormData({ firstName: '', lastName: '', username: '', email: '', phone: '', permission: 'HOTEL_STAFF' });
            onSuccess();
            onClose();
        } catch (error) {
            alert(error.response?.data?.message || "Hệ thống đang bận, vui lòng thử lại sau!");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-[200] p-4">
            <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">

                {/* Header: Thiết kế hiện đại với Gradient */}
                <div className="bg-gradient-to-br from-[#006AFF] to-[#004DB3] p-10 text-white relative">
                    <button onClick={onClose} className="absolute top-8 right-8 p-2.5 hover:bg-white/20 rounded-2xl transition-all active:scale-90">
                        <X size={24} />
                    </button>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-white/20 rounded-2xl">
                            <UserPlus size={32} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black tracking-tight">Nhân sự mới</h2>
                            <p className="text-blue-100/80 text-sm font-medium">Thiết lập tài khoản hệ thống cho nhân viên</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-6">

                    {/* Section 1: Tài khoản đăng nhập */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            <Fingerprint size={14} /> Định danh hệ thống
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <InputGroup label="Tên đăng nhập">
                                <input
                                    required
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#006AFF] focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700"
                                    placeholder="ví dụ: hung.nguyen"
                                    value={formData.username}
                                    onChange={(e) => handleUsernameChange(e.target.value)}
                                />
                            </InputGroup>

                            <InputGroup label="Email liên kết" icon={<Mail size={14}/>}>
                                <input
                                    required
                                    type="email"
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#006AFF] focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700"
                                    placeholder="nhanvien@gmail.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                            </InputGroup>
                        </div>
                    </div>

                    {/* Section 2: Hồ sơ cá nhân */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            <User size={14} /> Thông tin hồ sơ
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <InputGroup label="Họ & Tên đệm">
                                <input
                                    required
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#006AFF] transition-all font-semibold"
                                    placeholder="Nguyễn Văn"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({...formData, lastName: formatName(e.target.value)})}
                                />
                            </InputGroup>
                            <InputGroup label="Tên">
                                <input
                                    required
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#006AFF] transition-all font-semibold"
                                    placeholder="Hùng"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({...formData, firstName: formatName(e.target.value)})}
                                />
                            </InputGroup>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <InputGroup label="Số điện thoại" icon={<Phone size={14}/>}>
                                <input
                                    required
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#006AFF] transition-all font-bold tracking-wider"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    placeholder="0912 345 678"
                                    value={formData.phone}
                                    onChange={handlePhoneChange}
                                />
                            </InputGroup>

                            <InputGroup label="Vai trò" icon={<ShieldCheck size={14}/>}>
                                <select
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#006AFF] transition-all font-black text-[#006AFF] appearance-none cursor-pointer"
                                    value={formData.permission}
                                    onChange={(e) => setFormData({...formData, permission: e.target.value})}
                                >
                                    <option value="HOTEL_MANAGER">QUẢN LÝ (Manager)</option>
                                    <option value="HOTEL_STAFF">NHÂN VIÊN (Staff)</option>
                                </select>
                            </InputGroup>
                        </div>
                    </div>

                    {/* Alert Info */}
                    <div className="bg-amber-50 p-5 rounded-[24px] flex items-start gap-4 border border-amber-100">
                        <div className="p-2 bg-amber-500 rounded-xl text-white shrink-0">
                            <Info size={16} />
                        </div>
                        <p className="text-[12px] text-amber-800 leading-relaxed">
                            <b>Bảo mật:</b> Mật khẩu khởi tạo sẽ được gửi trực tiếp đến email nhân viên.
                            Yêu cầu nhân viên đổi mật khẩu ngay sau lần đăng nhập đầu tiên.
                        </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-4 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-5 text-slate-500 font-bold hover:bg-slate-100 rounded-[24px] transition-all active:scale-95"
                        >
                            Hủy lệnh
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-[2] py-5 bg-[#006AFF] text-white font-black rounded-[24px] shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                        >
                            {isSubmitting ? (
                                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Send size={20} /> XÁC NHẬN TẠO MỚI
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const InputGroup = ({ label, icon, children }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-2">
            {icon} {label}
        </label>
        <div className="relative">
            {children}
        </div>
    </div>
);

export default StaffCreateModal;