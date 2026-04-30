import React, { useState } from 'react';
import { X, Send, AlertCircle, CheckCircle2, Loader2, User, Mail, Phone, MessageSquare } from 'lucide-react';
import publicApi from '@/services/publicApi.config';

const SupportModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        topic: 'GENERAL',
        subject: '',
        message: ''
    });

    const [status, setStatus] = useState({ loading: false, error: '', success: false });

    // Đóng Modal và reset trạng thái (Alternative Flow: Reset Form)
    const handleClose = () => {
        setFormData({ fullName: '', email: '', phone: '', topic: 'GENERAL', subject: '', message: '' });
        setStatus({ loading: false, error: '', success: false });
        onClose();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (status.error) setStatus(prev => ({ ...prev, error: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate mandatory fields
        if (!formData.fullName || !formData.email || !formData.message) {
            setStatus({ ...status, error: 'Vui lòng điền đầy đủ các trường bắt buộc (*)' });
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setStatus({ ...status, error: 'Email không đúng định dạng' });
            return;
        }

        // Validate phone format if provided
        if (formData.phone && !/^[0-9+\-\s()]{7,20}$/.test(formData.phone)) {
            setStatus({ ...status, error: 'Số điện thoại không đúng định dạng' });
            return;
        }

        setStatus({ ...status, loading: true });

        try {
            const topicLabels = { GENERAL: 'Hỗ trợ chung', BOOKING: 'Vấn đề đặt phòng', PARTNER: 'Hợp tác đối tác', TECH: 'Lỗi kỹ thuật' };
            const subject = formData.subject || topicLabels[formData.topic] || formData.topic;

            await publicApi.post('/support', {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone || null,
                subject: subject,
                message: formData.message
            });

            setStatus({ loading: false, error: '', success: true });
        } catch (err) {
            const msg = err.response?.status === 500
                ? 'Hệ thống email gặp sự cố. Vui lòng thử lại sau!'
                : (err.response?.data?.message || 'Hệ thống email gặp sự cố. Thử lại sau!');
            setStatus({ loading: false, error: msg, success: false });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop: Nhấn ra ngoài để đóng */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={handleClose}></div>

            {/* Modal Box */}
            <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20">

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all z-10"
                >
                    <X size={24}/>
                </button>

                <div className="p-10 md:p-16">
                    {status.success ? (
                        /* Post-condition: Thành công */
                        <div className="text-center py-10 animate-in zoom-in duration-500">
                            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <CheckCircle2 size={48} />
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Gửi thành công!</h2>
                            <p className="text-slate-500 font-medium mb-10 leading-relaxed">
                                Cảm ơn bạn. Yêu cầu đã được chuyển đến Ban quản trị.<br/>Chúng tôi sẽ phản hồi sớm nhất qua email.
                            </p>
                            <button
                                onClick={handleClose}
                                className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all shadow-xl"
                            >
                                Đóng cửa sổ
                            </button>
                        </div>
                    ) : (
                        /* Normal Flow: Form nhập liệu */
                        <>
                            <div className="mb-10">
                                <span className="text-blue-600 font-black text-[10px] tracking-[0.3em] uppercase mb-2 block">Support Form</span>
                                <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter italic">Gửi lời nhắn</h2>
                                <p className="text-slate-400 font-bold text-xs">Chúng tôi thường phản hồi trong vòng 24 giờ làm việc.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {status.error && (
                                    <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-3 border border-red-100 animate-pulse">
                                        <AlertCircle size={18}/> {status.error}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative group">
                                        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18}/>
                                        <input
                                            name="fullName" value={formData.fullName} onChange={handleChange}
                                            type="text" placeholder="Họ và tên *"
                                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none font-bold text-sm transition-all"
                                        />
                                    </div>
                                    <div className="relative group">
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18}/>
                                        <input
                                            name="email" value={formData.email} onChange={handleChange}
                                            type="email" placeholder="Email liên hệ *"
                                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none font-bold text-sm transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative group">
                                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18}/>
                                        <input
                                            name="phone" value={formData.phone} onChange={handleChange}
                                            type="text" placeholder="Số điện thoại"
                                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none font-bold text-sm transition-all"
                                        />
                                    </div>
                                    <select
                                        name="topic" value={formData.topic} onChange={handleChange}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white outline-none font-bold text-sm transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="GENERAL">Hỗ trợ chung</option>
                                        <option value="BOOKING">Vấn đề đặt phòng</option>
                                        <option value="PARTNER">Hợp tác đối tác</option>
                                        <option value="TECH">Lỗi kỹ thuật</option>
                                    </select>
                                </div>

                                <div className="relative group">
                                    <MessageSquare className="absolute left-5 top-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18}/>
                                    <textarea
                                        name="message" value={formData.message} onChange={handleChange}
                                        rows="4" placeholder="Nội dung cần hỗ trợ *..."
                                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-[2rem] focus:border-blue-600 focus:bg-white outline-none font-bold text-sm transition-all resize-none"
                                    ></textarea>
                                </div>

                                <button
                                    disabled={status.loading}
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-slate-900 transition-all shadow-xl shadow-blue-200 active:scale-95 disabled:opacity-50 mt-4"
                                >
                                    {status.loading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Gửi yêu cầu ngay</>}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SupportModal;