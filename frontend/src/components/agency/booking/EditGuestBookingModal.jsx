import React, { useState, useEffect } from 'react';
import { X, Save, Info, AlertCircle } from 'lucide-react';
import { bookingService } from '@/services/booking.service.js';

const EditGuestModal = ({ booking, isOpen, onClose, onSaveSuccess }) => {
    const [formData, setFormData] = useState({
        guestName: '',
        guestPhone: '',
        guestEmail: '',
        notes: ''
    });
    const [errors, setErrors] = useState({}); // Lưu lỗi validate
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && booking) {
            setFormData({
                guestName: booking.guestName || '',
                guestPhone: booking.guestPhone || '',
                guestEmail: booking.guestEmail || '',
                notes: booking.notes || ''
            });
            setErrors({}); // Reset lỗi khi mở modal mới
        }
    }, [isOpen, booking]);

    // Hàm validate từng trường
    const validate = () => {
        let newErrors = {};

        // 1. Validate Họ tên: Không trống, tối thiểu 2 từ
        if (!formData.guestName.trim()) {
            newErrors.guestName = "Họ tên không được để trống";
        } else if (formData.guestName.trim().split(' ').length < 2) {
            newErrors.guestName = "Vui lòng nhập đầy đủ họ và tên";
        }

        // 2. Validate Số điện thoại: Định dạng Việt Nam (10 số)
        const phoneRegex = /^(0[3|5|7|8|9])([0-9]{8})$/;
        if (formData.guestPhone && !phoneRegex.test(formData.guestPhone)) {
            newErrors.guestPhone = "Số điện thoại không đúng định dạng (ví dụ: 0912345678)";
        }

        // 3. Validate Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.guestEmail && !emailRegex.test(formData.guestEmail)) {
            newErrors.guestEmail = "Email không hợp lệ";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Xóa lỗi của trường đó khi người dùng bắt đầu nhập lại
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Chạy validate trước khi gọi API
        if (!validate()) return;

        setIsLoading(true);
        try {
            const requestPayload = {
                bookingId: booking.bookingId,
                guestName: formData.guestName.trim(),
                guestPhone: formData.guestPhone,
                guestEmail: formData.guestEmail,
                notes: formData.notes
            };

            const response = await bookingService.updateUserInfoBooking(requestPayload);

            if (response && response.code === 1000) {
                onSaveSuccess(response.result);
                alert("Cập nhật thông tin khách hàng thành công!");
                onClose();
            } else {
                alert(response?.message || "Có lỗi xảy ra từ Server");
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.message;
            alert("Lỗi hệ thống: " + msg);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border border-slate-200">
                <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50/50">
                    <h2 className="font-bold text-slate-800 text-base uppercase tracking-tight">Chỉnh sửa khách lưu trú</h2>
                    <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                        <X size={20}/>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-blue-50 p-3 rounded-lg flex gap-3 border-l-4 border-blue-500 shadow-sm">
                        <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-blue-800 font-medium leading-relaxed">
                            Lưu ý: Hành động này chỉ thay đổi thông tin định danh, không ảnh hưởng đến giá phòng hoặc chính sách hủy.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {/* Họ tên */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Họ tên khách chính</label>
                            <input
                                name="guestName"
                                value={formData.guestName}
                                onChange={handleChange}
                                placeholder="NGUYEN VAN A"
                                className={`w-full px-4 py-2.5 border rounded-xl text-sm font-bold outline-none transition-all ${
                                    errors.guestName ? 'border-rose-500 bg-rose-50' : 'border-slate-200 focus:border-blue-500'
                                }`}
                            />
                            {errors.guestName && (
                                <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                                    <AlertCircle size={12} /> {errors.guestName}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Số điện thoại */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Số điện thoại</label>
                                <input
                                    name="guestPhone"
                                    value={formData.guestPhone}
                                    onChange={handleChange}
                                    placeholder="09xxx"
                                    className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-all ${
                                        errors.guestPhone ? 'border-rose-500 bg-rose-50' : 'border-slate-200 focus:border-blue-500'
                                    }`}
                                />
                                {errors.guestPhone && (
                                    <p className="mt-1 text-[11px] text-rose-500 font-medium">{errors.guestPhone}</p>
                                )}
                            </div>
                            {/* Email */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Email</label>
                                <input
                                    name="guestEmail"
                                    type="email"
                                    value={formData.guestEmail}
                                    onChange={handleChange}
                                    placeholder="example@gmail.com"
                                    className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-all ${
                                        errors.guestEmail ? 'border-rose-500 bg-rose-50' : 'border-slate-200 focus:border-blue-500'
                                    }`}
                                />
                                {errors.guestEmail && (
                                    <p className="mt-1 text-[11px] text-rose-500 font-medium">{errors.guestEmail}</p>
                                )}
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Yêu cầu đặc biệt</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Ghi chú về dị ứng, giờ đến, hoặc yêu cầu thêm..."
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none resize-none focus:border-blue-400 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 py-3 text-xs font-black text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl uppercase tracking-wider transition-all"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`flex-1 py-3 text-xs font-black text-white rounded-xl flex items-center justify-center gap-2 uppercase tracking-wider transition-all shadow-lg ${
                                isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
                            }`}
                        >
                            {isLoading ? (
                                <span className="animate-pulse">Đang kiểm tra...</span>
                            ) : (
                                <><Save size={16}/> Lưu thay đổi</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditGuestModal;