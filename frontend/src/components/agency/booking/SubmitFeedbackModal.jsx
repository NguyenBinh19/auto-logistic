import React, { useState } from 'react';
import { Star, Send, X, ShieldCheck, Trophy, AlertCircle } from 'lucide-react';
import { bookingService } from '@/services/booking.service.js';

const RATING_CRITERIA = [
    { id: 'overall', label: 'Xếp hạng sao (Tổng quan)' },
    { id: 'cleanliness', label: 'Vệ sinh sạch sẽ' },
    { id: 'service', label: 'Chất lượng phục vụ' }
];

const SubmitFeedbackModal = ({ isOpen, onClose, booking, onSuccess }) => {
    // Nếu isOpen = false thì không render gì cả
    if (!isOpen) return null;

    const [formData, setFormData] = useState({
        overall: 5,
        cleanliness: 5,
        service: 5,
        comment: '',
        bookingId: booking?.bookingId || '',
        hotelId: booking?.hotelId || ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleStarClick = (criteria, value) => {
        setFormData(prev => ({ ...prev, [criteria]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        console.log(booking)
        try {
            // console.log("Dữ liệu gửi lên BE:", formData);
            await new Promise(resolve => setTimeout(resolve, 1000));
            await bookingService.submitFeedback({
                bookingId: formData.bookingId,
                hotelId: formData.hotelId,
                overall: formData.overall,
                cleanliness: formData.cleanliness,
                service: formData.service,
                comment: formData.comment,
            });

            // Gọi onSuccess để cập nhật state 'hasFeedback' ở trang chi tiết
            if (onSuccess) onSuccess();
            // Đóng modal
            onClose();
        } catch (err) {
            const msg = err.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.";
            setError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="px-6 py-5 border-b flex justify-between items-center bg-slate-50/80">
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-800">Viết đánh giá</h2>
                        <p className="text-xs text-blue-600 font-bold uppercase mt-1">
                            Mã đơn: {booking?.bookingCode}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Phần 1: Stars */}
                    <div className="space-y-4">
                        {RATING_CRITERIA.map((cat) => (
                            <div key={cat.id} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <span className="text-sm font-semibold text-slate-600">{cat.label}</span>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={24}
                                            onClick={() => handleStarClick(cat.id, star)}
                                            className={`cursor-pointer transition-all ${
                                                star <= formData[cat.id] ? "fill-amber-400 text-amber-400" : "text-slate-200"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Phần 2: Comment */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Nhận xét chi tiết</label>
                        <textarea
                            required
                            value={formData.comment}
                            onChange={(e) => setFormData({...formData, comment: e.target.value})}
                            placeholder="Cảm nhận của bạn về kỳ nghỉ..."
                            className="w-full p-4 border border-slate-200 rounded-2xl text-sm h-24 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none resize-none"
                        />
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose} // NÚT "ĐỂ SAU" BÂY GIỜ SẼ CHẠY VÌ onClose ĐÃ ĐƯỢC NHẬN ĐÚNG
                            className="flex-1 px-6 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-2xl"
                        >
                            Để sau
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-[2] flex items-center justify-center gap-2 px-8 py-3 bg-[#006ce4] hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 transition-all"
                        >
                            <Send size={18} />
                            {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubmitFeedbackModal;