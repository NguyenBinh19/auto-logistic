import React, { useEffect, useState } from 'react';
import {
    X, Info, Loader2, Building, Calendar, History,
    CheckCircle2, AlertCircle, Archive, RotateCcw
} from 'lucide-react';
import { commissionService } from '@/services/commission.service.js';

const CommissionModalForm = ({ id, isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [resettingId, setResettingId] = useState(null);
    const [detail, setDetail] = useState(null);
    const [hotels, setHotels] = useState([]);
    const [reason, setReason] = useState("");

    const loadDetail = async () => {
        setLoading(true);
        try {
            const res = await commissionService.getCommissionDetail(id);
            const commissionData = res.result.commission;
            setDetail(commissionData);

            if (commissionData.commissionType !== 'DEFAULT') {
                let hotelList = [];
                if (commissionData.commissionType === 'DEAL') {
                    try {
                        const hotelRes = await commissionService.getHotelsUsingDeal(id);
                        hotelList = hotelRes.result?.hotels || [];
                    } catch (err) {
                        hotelList = res.result.hotels || [];
                    }
                } else {
                    hotelList = res.result.hotels || [];
                }
                setHotels(Array.isArray(hotelList) ? hotelList : []);
            } else {
                setHotels([]);
            }
        } catch (error) {
            console.error("Lỗi detail:", error);
            alert("Không thể tải thông tin chi tiết");
            onClose();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id && isOpen) {
            loadDetail();
            setReason("");
        }
    }, [id, isOpen]);

    const handleResetToDefault = async (hotelId, hotelName) => {
        if (!window.confirm(`Bạn có chắc chắn muốn đưa khách sạn [${hotelName}] về mức hoa hồng mặc định của hệ thống?`)) return;

        setResettingId(hotelId);
        try {
            await commissionService.setDefaultCommission(hotelId);
            // Xóa hotel vừa reset ra khỏi danh sách đang hiển thị
            setHotels(prevHotels => prevHotels.filter(h => h.hotelId !== hotelId));
            alert(`Đã đưa khách sạn ${hotelName} về mức mặc định thành công!`);
            // Gọi lại để đồng bộ với server
            loadDetail();

            if (onSuccess) onSuccess();
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi khi đặt lại mức hoa hồng");
        } finally {
            setResettingId(null);
        }
    };

    if (!isOpen || !detail) return null;

    const type = detail.commissionType;
    const isReadOnly = !detail.isActive || type === 'HOTEL';
    const isDefault = type === 'DEFAULT';
    const hasHotels = hotels.length > 0;

    const isFieldDisabled = (fieldName) => {
        if (isReadOnly) return true;
        if (isDefault) return ['time', 'startDate', 'endDate'].includes(fieldName);
        if (type === 'HOTEL') {
            if (hasHotels) return ['time', 'startDate', 'endDate'].includes(fieldName);
            return false;
        }
        if (type === 'DEAL') {
            if (hasHotels) return ['rateType', 'commissionValue'].includes(fieldName);
            return false;
        }
        return false;
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (isReadOnly) return;
        if (!isFieldDisabled('commissionValue')) {
            if (parseFloat(detail.commissionValue) <= 0) return alert("Mức hoa hồng phải lớn hơn 0");
        }
        if (!reason.trim()) return alert("Vui lòng nhập lý do cập nhật chính sách");

        if (!isDefault && !isFieldDisabled('time')) {
            if (!detail.startDate || !detail.endDate) return alert("Vui lòng chọn đầy đủ thời gian áp dụng");
            if (new Date(detail.endDate) <= new Date(detail.startDate)) return alert("Ngày kết thúc phải lớn hơn ngày bắt đầu");
        }

        if (!window.confirm("Xác nhận lưu các thay đổi cho chính sách này?")) return;

        setLoading(true);
        try {
            const payload = {
                commissionId: id,
                rateType: detail.rateType,
                commissionValue: parseFloat(detail.commissionValue),
                startDate: detail.startDate ? new Date(detail.startDate).toISOString() : null,
                endDate: detail.endDate ? new Date(detail.endDate).toISOString() : null,
                note: detail.note || "",
                reason: reason,
                hotelIds: detail.hotelIds || []
            };

            await commissionService.updateCommission(payload);
            alert("Cập nhật chính sách thành công!");
            onSuccess();
            onClose();
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi khi cập nhật dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className={`bg-white rounded-3xl shadow-2xl w-full ${isDefault ? 'max-w-2xl' : 'max-w-5xl'} overflow-hidden flex flex-col md:flex-row animate-in zoom-in duration-200 border border-gray-100 max-h-[95vh] transition-all`}>

                {/* Bên trái: Form nội dung chính */}
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
                                {type === 'HOTEL'
                                    ? "Chi tiết chính sách khách sạn"
                                    : isReadOnly
                                        ? "Chi tiết chính sách (Lưu trữ)"
                                        : "Chỉnh sửa chính sách"
                                }
                                {detail.isActive ? <CheckCircle2 size={18} className="text-green-500" /> : <Archive size={18} className="text-gray-400" />}
                            </h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Loại: {type}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400"><X size={20} /></button>
                    </div>

                    {isReadOnly && type !== 'HOTEL' && (
                        <div className="mb-6 p-4 bg-gray-100 border-l-4 border-gray-400 rounded-r-xl flex gap-3 items-center">
                            <AlertCircle className="text-gray-500" size={20} />
                            <p className="text-xs font-bold text-gray-600 italic uppercase">Bản ghi này đã được lưu trữ và không thể chỉnh sửa thêm.</p>
                        </div>
                    )}
                    {type === 'HOTEL' && (
                        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl flex gap-3 items-center">
                            <Info className="text-blue-500" size={20} />
                            <p className="text-xs font-bold text-blue-600 italic uppercase">
                                Chính sách riêng của khách sạn. Vui lòng liên hệ đối tác để thỏa thuận thêm.
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Cách tính</label>
                                <select
                                    disabled={isFieldDisabled('rateType')}
                                    value={detail.rateType}
                                    onChange={(e) => setDetail({...detail, rateType: e.target.value})}
                                    className="w-full border-b-2 border-gray-100 py-2 outline-none focus:border-blue-600 font-bold bg-transparent disabled:opacity-50"
                                >
                                    <option value="PERCENT">Phần trăm (%)</option>
                                    <option value="FIXED">Cố định (VND)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Giá trị</label>
                                <input
                                    type="number"
                                    disabled={isFieldDisabled('commissionValue')}
                                    value={detail.commissionValue}
                                    onChange={(e) => setDetail({...detail, commissionValue: e.target.value})}
                                    className="w-full border-b-2 border-gray-100 py-2 outline-none focus:border-blue-600 font-black text-lg text-blue-600 disabled:text-gray-400"
                                />
                            </div>
                        </div>

                        {!isDefault && (
                            <div className={`p-5 rounded-2xl border ${isFieldDisabled('time') ? 'bg-gray-50 border-gray-100' : 'bg-orange-50/30 border-orange-100'} space-y-4`}>
                                <h4 className="text-[11px] font-black text-gray-500 flex items-center gap-2 uppercase"><Calendar size={14} /> Thời gian hiệu lực</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="datetime-local"
                                        disabled={isFieldDisabled('time')}
                                        className="bg-white border border-gray-200 rounded-lg p-2.5 text-xs font-bold outline-none disabled:bg-gray-100"
                                        value={detail.startDate?.substring(0,16) || ''}
                                        onChange={(e) => setDetail({...detail, startDate: e.target.value})}
                                    />
                                    <input
                                        type="datetime-local"
                                        disabled={isFieldDisabled('time')}
                                        className="bg-white border border-gray-200 rounded-lg p-2.5 text-xs font-bold outline-none disabled:bg-gray-100"
                                        value={detail.endDate?.substring(0,16) || ''}
                                        onChange={(e) => setDetail({...detail, endDate: e.target.value})}
                                    />
                                </div>
                            </div>
                        )}

                        {!isReadOnly && (
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><History size={14} className="text-orange-500" /> Lý do cập nhật *</label>
                                <textarea
                                    required
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:border-blue-500 outline-none h-20 shadow-sm transition-all"
                                    placeholder="Nhập lý do thay đổi..."
                                ></textarea>
                            </div>
                        )}

                        <div className="flex gap-3">
                            {!isReadOnly ? (
                                <>
                                    <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg disabled:bg-gray-300 flex justify-center items-center gap-2">
                                        {loading ? <Loader2 size={18} className="animate-spin" /> : "Lưu thay đổi"}
                                    </button>
                                    <button type="button" onClick={onClose} className="px-6 py-3.5 border border-gray-200 rounded-xl font-bold text-gray-500 hover:bg-gray-50">Hủy</button>
                                </>
                            ) : (
                                <button type="button" onClick={onClose} className="flex-1 bg-gray-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all">Đóng cửa sổ</button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Bên phải: Danh sách Hotel (Ẩn nếu là DEFAULT) */}
                {!isDefault && (
                    <div className="w-full md:w-80 bg-gray-50 p-6 border-l border-gray-100 flex flex-col">
                        <div className="flex items-center gap-2 mb-6 text-gray-600">
                            <Building size={18} /><h4 className="font-black uppercase text-[10px] tracking-widest">Khách sạn áp dụng</h4>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 text-center shadow-sm">
                            <div className="text-3xl font-black text-gray-800">{hotels.length}</div>
                            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Đối tác đang dùng</div>
                        </div>

                        <div className="space-y-2 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                            {hotels.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-[10px] text-gray-400 italic font-bold uppercase">Không có dữ liệu đối tác</p>
                                </div>
                            ) : (
                                hotels.map((h, index) => (
                                    <div key={index} className="bg-white p-3 rounded-xl border border-gray-100 flex items-center justify-between group hover:border-blue-200 transition-all">
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-black text-blue-500">ID: {h.hotelId}</p>
                                            <p className="text-[11px] font-bold text-gray-700 truncate pr-2">{h.hotelName || 'N/A'}</p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {!isReadOnly && type !== 'DEAL' && (
                                                <button
                                                    onClick={() => handleResetToDefault(h.hotelId, h.hotelName)}
                                                    disabled={resettingId === h.hotelId}
                                                    className="p-1.5 text-gray-300 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                                                    title="Gỡ khỏi chính sách này"
                                                >
                                                    {resettingId === h.hotelId ? (
                                                        <Loader2 size={14} className="animate-spin text-orange-500" />
                                                    ) : (
                                                        <RotateCcw size={14} />
                                                    )}
                                                </button>
                                            )}
                                            <div className={`w-1.5 h-1.5 rounded-full ${detail.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommissionModalForm;