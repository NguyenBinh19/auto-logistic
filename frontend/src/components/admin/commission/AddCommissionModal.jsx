import React, { useEffect, useState, useMemo } from 'react';
import { X, Info, Loader2, Percent, Calendar, Building2, FileText, Search, Check, AlertCircle } from 'lucide-react';
import { commissionService } from '@/services/commission.service.js';
import { partnerService } from '@/services/partner.service.js';

const AddCommissionModal = ({ isOpen, onClose, onSuccess, hasDefault }) => {
    const [loading, setLoading] = useState(false);
    const [hotelPartners, setHotelPartners] = useState([]);
    const [searchHotel, setSearchHotel] = useState("");
    const [loadingHotels, setLoadingHotels] = useState(false);

    const [formData, setFormData] = useState({
        commissionType: hasDefault ? 'DEAL' : 'DEFAULT',
        rateType: 'PERCENT',
        commissionValue: '',
        startDate: '',
        endDate: '',
        note: '',
        hotelIds: [],
        isActive: true
    });

    useEffect(() => {
        if (isOpen) {
            // Reset form khi mở modal
            setFormData({
                commissionType: hasDefault ? 'DEAL' : 'DEFAULT',
                rateType: 'PERCENT',
                commissionValue: '',
                startDate: '',
                endDate: '',
                note: '',
                hotelIds: [],
                isActive: true
            });
            setSearchHotel("");

            // Chỉ fetch hotel nếu là loại HOTEL
            const fetchHotels = async () => {
                setLoadingHotels(true);
                try {
                    const res = await partnerService.getAllHotelPartner();
                    setHotelPartners(res.result || res || []);
                } catch (error) {
                    console.error("Lỗi tải danh sách đối tác:", error);
                } finally {
                    setLoadingHotels(false);
                }
            };
            fetchHotels();
        }
    }, [isOpen, hasDefault]);

    const filteredHotels = useMemo(() => {
        return hotelPartners.filter(h =>
            h.hotelName?.toLowerCase().includes(searchHotel.toLowerCase()) ||
            h.hotelId?.toString().includes(searchHotel)
        );
    }, [hotelPartners, searchHotel]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const toggleHotel = (id) => {
        setFormData(prev => ({
            ...prev,
            hotelIds: prev.hotelIds.includes(id)
                ? prev.hotelIds.filter(item => item !== id)
                : [...prev.hotelIds, id]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // --- VALIDATION LOGIC ---
        const val = parseFloat(formData.commissionValue);
        if (isNaN(val) || val <= 0) return alert("Mức hoa hồng phải lớn hơn 0");

        if (formData.commissionType === 'DEAL') {
            if (!formData.startDate || !formData.endDate) {
                return alert("Vui lòng nhập đầy đủ thời gian bắt đầu và kết thúc cho DEAL");
            }
            if (new Date(formData.endDate) <= new Date(formData.startDate)) {
                return alert("Ngày kết thúc phải lớn hơn ngày bắt đầu");
            }
        }

        if (formData.commissionType === 'HOTEL' && formData.hotelIds.length === 0) {
            return alert("Vui lòng chọn ít nhất một khách sạn để áp dụng chính sách");
        }

        // --- POPUP CONFIRM  ---
        let confirmMsg = "Bạn có chắc chắn muốn tạo chính sách hoa hồng này?";
        if (formData.commissionType === 'HOTEL') {
            confirmMsg = `XÁC NHẬN: Bạn đang chọn áp dụng cho ${formData.hotelIds.length} khách sạn.\nSau khi tạo, tất cả các khách sạn trong danh sách này đều sẽ được cập nhật hoa hồng theo thông tin mới nhất. Bạn vẫn muốn tiếp tục?`;
        }

        if (!window.confirm(confirmMsg)) return;

        setLoading(true);
        try {
            const payload = {
                commissionType: formData.commissionType,
                rateType: formData.rateType,
                commissionValue: val,
                note: formData.note,
                // DEFAULT và HOTEL không gửi time
                startDate: formData.commissionType === 'DEAL' ? formData.startDate : null,
                endDate: formData.commissionType === 'DEAL' ? formData.endDate : null,
                // DEFAULT và HOTEL mặc định true
                isActive: formData.commissionType === 'DEAL' ? formData.isActive : true,
                // DEAL và DEFAULT không gửi hotelIds
                hotelIds: formData.commissionType === 'HOTEL' ? formData.hotelIds : [],
            };

            await commissionService.createCommission(payload);
            alert("Tạo chính sách thành công!");
            onSuccess();
            onClose();
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi khi lưu dữ liệu lên hệ thống");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-100 max-h-[90vh] flex flex-col">

                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Tạo chính sách mới</h3>
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">Cấu hình hoa hồng hệ thống</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white hover:shadow-md rounded-full transition-all">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                    {/* 1. Loại chính sách */}
                    <div className="space-y-3">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Info size={14} className="text-blue-500" /> Hình thức áp dụng
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {!hasDefault && (
                                <button
                                    type="button"
                                    onClick={() => setFormData({...formData, commissionType: 'DEFAULT'})}
                                    className={`py-3 px-4 rounded-xl border-2 text-xs font-bold transition-all ${formData.commissionType === 'DEFAULT' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                                >
                                    Mặc định
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, commissionType: 'HOTEL'})}
                                className={`py-3 px-4 rounded-xl border-2 text-xs font-bold transition-all ${formData.commissionType === 'HOTEL' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                            >
                                Theo Khách sạn
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, commissionType: 'DEAL'})}
                                className={`py-3 px-4 rounded-xl border-2 text-xs font-bold transition-all ${formData.commissionType === 'DEAL' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                            >
                                Khuyến mãi (Deal)
                            </button>
                        </div>
                    </div>

                    {/* 2. Giá trị & Cách tính */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Cách tính</label>
                            <select
                                name="rateType"
                                value={formData.rateType}
                                onChange={handleChange}
                                className="w-full border-2 border-gray-50 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-bold text-gray-700 transition-all bg-gray-50/30"
                            >
                                <option value="PERCENT">Phần trăm (%)</option>
                                <option value="FIXED">Số tiền cố định (VND)</option>
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Giá trị hoa hồng</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="commissionValue"
                                    placeholder="0.00"
                                    value={formData.commissionValue}
                                    onChange={handleChange}
                                    className="w-full border-2 border-gray-50 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-black text-blue-600 bg-gray-50/30 transition-all"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-300 text-[10px]">
                                    {formData.rateType === 'PERCENT' ? '%' : 'VND'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 3. Phần HOTEL: Chỉ hiện khi chọn HOTEL */}
                    {formData.commissionType === 'HOTEL' && (
                        <div className="p-5 bg-blue-50/50 rounded-2xl border-2 border-blue-50 space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-[11px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                                    <Building2 size={14} /> Chọn khách sạn đối tác
                                </label>
                                <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-1 rounded-md">
                                    Đã chọn: {formData.hotelIds.length}
                                </span>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                                <input
                                    type="text"
                                    placeholder="Tìm theo tên hoặc mã khách sạn..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-blue-400 transition-all"
                                    value={searchHotel}
                                    onChange={(e) => setSearchHotel(e.target.value)}
                                />
                            </div>
                            <div className="bg-white border border-gray-100 rounded-xl max-h-40 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                {loadingHotels ? (
                                    <div className="flex justify-center py-4"><Loader2 className="animate-spin text-blue-200" /></div>
                                ) : filteredHotels.map(h => (
                                    <div
                                        key={h.hotelId}
                                        onClick={() => toggleHotel(h.hotelId)}
                                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                                            formData.hotelIds.includes(h.hotelId) ? 'bg-blue-600 text-white' : 'hover:bg-blue-50'
                                        }`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black opacity-70">ID: {h.hotelId}</span>
                                            <span className="text-[11px] font-bold truncate w-48">{h.hotelName}</span>
                                        </div>
                                        {formData.hotelIds.includes(h.hotelId) && <Check size={14} />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 4. Phần DEAL: Chỉ hiện khi chọn DEAL */}
                    {formData.commissionType === 'DEAL' && (
                        <div className="p-5 bg-orange-50/50 rounded-2xl border-2 border-orange-50 space-y-4">
                            <label className="text-[11px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-2">
                                <Calendar size={14} /> Chu kỳ hiệu lực
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-gray-400 ml-1">BẮT ĐẦU</span>
                                    <input
                                        type="datetime-local"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        className="w-full text-xs font-bold border border-orange-100 rounded-xl px-3 py-3 outline-none focus:border-orange-400 bg-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-gray-400 ml-1">KẾT THÚC</span>
                                    <input
                                        type="datetime-local"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        className="w-full text-xs font-bold border border-orange-100 rounded-xl px-3 py-3 outline-none focus:border-orange-400 bg-white"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                    className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                />
                                <label htmlFor="isActive" className="text-xs font-bold text-gray-600 cursor-pointer">Kích hoạt ngay sau khi tạo</label>
                            </div>
                        </div>
                    )}

                    {/* 5. Ghi chú */}
                    <div className="space-y-3">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <FileText size={14} /> Ghi chú nội dung
                        </label>
                        <textarea
                            name="note"
                            rows="2"
                            value={formData.note}
                            onChange={handleChange}
                            placeholder="Mô tả mục đích của chính sách hoa hồng này..."
                            className="w-full border-2 border-gray-50 rounded-2xl px-4 py-3 outline-none focus:border-blue-500 text-sm bg-gray-50/30 transition-all resize-none shadow-sm"
                        ></textarea>
                    </div>

                    {/* 6. Footer Buttons */}
                    <div className="flex gap-4 pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black shadow-xl shadow-gray-200 transition-all disabled:bg-gray-300 flex justify-center items-center gap-2"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : "Xác nhận tạo"}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-4 border-2 border-gray-50 rounded-2xl font-bold text-gray-400 hover:bg-gray-50 hover:border-gray-100 transition-all text-sm"
                        >
                            Đóng
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCommissionModal;