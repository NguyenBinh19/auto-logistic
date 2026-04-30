import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

const CancelBookingModal = ({ isOpen, onClose, booking, onConfirm }) => {
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setLoading(true);
        await onConfirm(reason);
        setLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-6">
                    <div className="flex items-center gap-3 text-rose-600 mb-4">
                        <div className="p-2 bg-rose-50 rounded-full">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-lg font-bold">Xác nhận hủy đặt chỗ</h3>
                    </div>

                    <div className="bg-amber-50 border-l-4 border-amber-400 p-3 mb-4">
                        <p className="text-xs text-amber-700 leading-relaxed">
                            <strong>Lưu ý:</strong> Theo chính sách, nếu hủy trong vòng 3 ngày trước ngày nhận phòng, bạn sẽ bị phạt phí 1 đêm đầu tiên.
                        </p>
                    </div>

                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Lý do hủy (Không bắt buộc)</label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Nhập lý do khách hủy..."
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none min-h-[100px]"
                    />
                </div>

                <div className="flex gap-2 p-4 bg-slate-50 border-t">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-all"
                    >
                        Quay lại
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="flex-1 py-2.5 text-sm font-bold bg-rose-600 text-white hover:bg-rose-700 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        Xác nhận hủy
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CancelBookingModal;