import React, { useState, useEffect } from "react";
import { X, Loader2, Check, Globe, Lock, Calendar, History, Info } from "lucide-react";
import { promotionService } from "@/services/coupon.service.js";

export default function UpdateCouponModal({ isOpen, onClose, onSuccess, couponId }) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [formData, setFormData] = useState(null);

    useEffect(() => {
        if (isOpen && couponId) {
            fetchDetail();
        } else {
            setStep(1);
        }
    }, [isOpen, couponId]);

    const fetchDetail = async () => {
        setIsLoadingDetail(true);
        try {
            const res = await promotionService.getPromotionDetail(couponId);
            setFormData(res.result);
        } catch (error) {
            alert("Không thể lấy thông tin chi tiết!");
            onClose();
        } finally {
            setIsLoadingDetail(false);
        }
    };

    if (!isOpen || !formData) return null;

    const steps = [
        { id: 1, title: "Thông tin chung" },
        { id: 2, title: "Giá trị giảm" },
        { id: 3, title: "Thời hạn & Lưu trú" },
        { id: 4, title: "Đối tượng & Giới hạn" }
    ];

    const handleChange = (field, value) => {
        const numericFields = ["discountVal", "maxDiscount", "minOrderVal", "minStay", "maxUsage", "agencyUsageLimit"];

        if (numericFields.includes(field)) {
            if (value === "") {
                setFormData(prev => ({ ...prev, [field]: "" }));
                return;
            }
            let val = parseFloat(value);
            if (isNaN(val)) return;
            val = Math.max(0, val);
            // Giới hạn 100%
            if (field === "discountVal" && formData.typeDiscount === "PERCENT") {
                val = Math.min(100, val);
            }
            setFormData(prev => ({ ...prev, [field]: val }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const validateForm = () => {
        const {
            name, discountVal,
            applyStartDate, applyEndDate,
            stayStartDate, stayEndDate,
            maxUsage, minStay
        } = formData;
        // 1. Kiểm tra trống thông tin cơ bản
        if (!name.trim()) return "Tên chương trình không được để trống";
        if (discountVal === "" || Number(discountVal) <= 0) return "Giá trị giảm phải lớn hơn 0";
        if (minStay === "" || Number(minStay) < 1) return "Số đêm ở tối thiểu phải từ 1";
        if (maxUsage === "" || Number(maxUsage) < 1) return "Số lượt dùng tối đa phải từ 1";
        // 2. Kiểm tra ngày áp dụng (Apply Date)
        if (!applyStartDate) return "Vui lòng chọn ngày bắt đầu áp dụng";
        if (!applyEndDate) return "Vui lòng chọn ngày kết thúc áp dụng";
        const applyStart = new Date(applyStartDate);
        const applyEnd = new Date(applyEndDate);
        if (applyEnd <= applyStart) return "Ngày kết thúc áp dụng phải sau ngày bắt đầu áp dụng";
        // 3. Kiểm tra ngày lưu trú (Stay Date)
        if (!stayStartDate) return "Vui lòng chọn ngày bắt đầu lưu trú";
        if (!stayEndDate) return "Vui lòng chọn ngày kết thúc lưu trú";
        const stayStart = new Date(stayStartDate);
        const stayEnd = new Date(stayEndDate);
        if (stayEnd <= stayStart) return "Ngày kết thúc lưu trú phải sau ngày bắt đầu lưu trú";
        // 4. Kiểm tra logic
        if (stayEnd < applyStart) return "Ngày kết thúc lưu trú không thể trước ngày bắt đầu khuyến mãi";

        return null;
    };

    const handleSubmit = async () => {
        // 1. Validation Logic
        const errorMsg = validateForm();
        if (errorMsg) return alert(errorMsg);

        setIsSubmitting(true);
        try {
            const payload = {
                name: formData.name,
                code: formData.code,
                discountVal: Number(formData.discountVal || 0),
                maxDiscount: Number(formData.maxDiscount || 0),
                minOrderVal: Number(formData.minOrderVal || 0),
                applyStartDate: formData.applyStartDate,
                applyEndDate: formData.applyEndDate,
                agencyUsageLimit: Math.floor(Number(formData.agencyUsageLimit || 1)),
                stayStartDate: formData.stayStartDate,
                stayEndDate: formData.stayEndDate,
                minStay: Math.floor(Number(formData.minStay || 1)),
                maxUsage: Math.floor(Number(formData.maxUsage || 0)),
                status: formData.status
            };

            await promotionService.updatePromotion(couponId, payload);
            alert("Cập nhật khuyến mãi thành công!");
            onSuccess();
            onClose();
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi khi cập nhật dữ liệu");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 font-sans text-slate-700">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b flex justify-between items-center bg-white">
                    <div className="flex gap-3 items-center">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><History size={20}/></div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Cập nhật mã giảm giá</h2>
                            <p className="text-sm text-slate-500 font-medium">Mã: <span className="font-mono font-bold text-blue-600 uppercase tracking-tight">{formData.code}</span></p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1"><X size={24} /></button>
                </div>

                {isLoadingDetail ? (
                    <div className="p-20 flex flex-col justify-center items-center gap-3">
                        <Loader2 className="animate-spin text-blue-600" size={32} />
                        <span className="text-sm font-medium text-slate-500">Đang tải dữ liệu chi tiết...</span>
                    </div>
                ) : (
                    <>
                        {/* Stepper */}
                        <div className="px-6 py-6 border-b bg-slate-50/30">
                            <div className="flex justify-between relative px-4">
                                <div className="absolute top-4 left-0 w-full h-[1px] bg-slate-200 -z-0"></div>
                                {steps.map((s) => (
                                    <div key={s.id} className="relative z-10 flex flex-col items-center cursor-pointer" onClick={() => setStep(s.id)}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-colors ${
                                            step >= s.id ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-300 text-slate-400"
                                        }`}>
                                            {step > s.id ? <Check size={14} /> : s.id}
                                        </div>
                                        <span className={`text-[11px] mt-2 font-semibold ${step === s.id ? "text-blue-600" : "text-slate-500"}`}>{s.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 min-h-[420px] max-h-[65vh] overflow-y-auto">
                            {/* Step 1: Thông tin chung */}
                            {step === 1 && (
                                <div className="space-y-5 animate-in slide-in-from-right-2">
                                    <div>
                                        <label className="block text-sm font-semibold mb-1.5 flex items-center gap-2">
                                            Mã giảm giá <Lock size={12} className="text-slate-400"/>
                                        </label>
                                        <input type="text" disabled className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 font-bold text-slate-400 uppercase cursor-not-allowed" value={formData.code} />
                                        <p className="text-[10px] text-slate-400 mt-1 italic font-medium">* Mã giảm giá không thể thay đổi để đảm bảo tính nhất quán dữ liệu.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-1.5">Tên chương trình <span className="text-red-500">*</span></label>
                                        <input type="text" className="w-full border border-slate-300 rounded-md p-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                               value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Giá trị giảm */}
                            {step === 2 && (
                                <div className="space-y-6 animate-in slide-in-from-right-2">
                                    <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider text-[11px]">Cấu hình mức giảm giá</label>
                                    <div className="space-y-4">
                                        <div className={`p-4 border rounded-lg transition-all ${formData.typeDiscount === "PERCENT" ? "border-blue-500 bg-blue-50/30" : "border-slate-200 opacity-60 pointer-events-none"}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-4 h-4 rounded-full border-4 ${formData.typeDiscount === "PERCENT" ? "border-blue-600" : "border-slate-300"}`}></div>
                                                <span className="text-sm font-bold">Theo Phần trăm (%)</span>
                                            </div>
                                            {formData.typeDiscount === "PERCENT" && (
                                                <div className="grid grid-cols-2 gap-4 mt-4 ml-7">
                                                    <div>
                                                        <label className="text-[11px] font-bold text-slate-500 block mb-1 uppercase">Mức giảm (%)</label>
                                                        <div className="relative">
                                                            <input type="number" className="w-full border border-slate-300 rounded-md p-2 font-bold text-blue-600" value={formData.discountVal} onChange={(e) => handleChange("discountVal", e.target.value)} />
                                                            <span className="absolute right-3 top-2 text-slate-400 font-bold">%</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-[11px] font-bold text-slate-500 block mb-1 uppercase">Giảm tối đa (VND)</label>
                                                        <input type="number" className="w-full border border-slate-300 rounded-md p-2 font-bold" value={formData.maxDiscount} onChange={(e) => handleChange("maxDiscount", e.target.value)} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className={`p-4 border rounded-lg transition-all ${formData.typeDiscount === "AMOUNT" ? "border-blue-500 bg-blue-50/30" : "border-slate-200 opacity-60 pointer-events-none"}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-4 h-4 rounded-full border-4 ${formData.typeDiscount === "AMOUNT" ? "border-blue-600" : "border-slate-300"}`}></div>
                                                <span className="text-sm font-bold">Số tiền cố định (VND)</span>
                                            </div>
                                            {formData.typeDiscount === "AMOUNT" && (
                                                <div className="mt-4 ml-7">
                                                    <label className="text-[11px] font-bold text-slate-500 block mb-1 uppercase">Số tiền giảm</label>
                                                    <div className="relative">
                                                        <input type="number" className="w-full border border-slate-300 rounded-md p-2 font-bold text-blue-600" value={formData.discountVal} onChange={(e) => handleChange("discountVal", e.target.value)} />
                                                        <span className="absolute right-3 top-2 text-slate-400 text-[10px] font-bold">VND</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 italic">* Loại giảm giá (Phần trăm/Số tiền) không thể sửa đổi sau khi đã kích hoạt mã.</p>
                                </div>
                            )}

                            {/* Step 3: Thời hạn & Lưu trú */}
                            {step === 3 && (
                                <div className="space-y-6 animate-in slide-in-from-right-2">
                                    <div className="bg-blue-50/50 p-4 rounded-lg space-y-4 border border-blue-100">
                                        <p className="text-[11px] font-bold text-blue-600 uppercase flex items-center gap-2"><Calendar size={14}/> Thời gian áp dụng mã</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 block mb-1">TỪ NGÀY</label>
                                                <input type="date" className="w-full border border-slate-300 rounded-md p-2 text-sm font-bold" value={formData.applyStartDate} onChange={(e) => handleChange("applyStartDate", e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 block mb-1">ĐẾN NGÀY</label>
                                                <input type="date" className="w-full border border-slate-300 rounded-md p-2 text-sm font-bold" min={formData.applyStartDate} value={formData.applyEndDate} onChange={(e) => handleChange("applyEndDate", e.target.value)} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-emerald-50/50 p-4 rounded-lg space-y-4 border border-emerald-100">
                                        <p className="text-[11px] font-bold text-emerald-600 uppercase flex items-center gap-2"><Calendar size={14}/> Thời gian khách lưu trú (Stay Date)</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 block mb-1">TỪ NGÀY</label>
                                                <input type="date" className="w-full border border-slate-300 rounded-md p-2 text-sm font-bold" min={formData.applyStartDate} value={formData.stayStartDate} onChange={(e) => handleChange("stayStartDate", e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 block mb-1">ĐẾN NGÀY</label>
                                                <input type="date" className="w-full border border-slate-300 rounded-md p-2 text-sm font-bold" min={formData.stayStartDate} value={formData.stayEndDate} onChange={(e) => handleChange("stayEndDate", e.target.value)} />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Số đêm ở tối thiểu</label>
                                        <input type="number" className="w-32 border border-slate-300 rounded-md p-2 font-bold" value={formData.minStay} onChange={(e) => handleChange("minStay", e.target.value)} />
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Đối tượng & Giới hạn */}
                            {step === 4 && (
                                <div className="space-y-8 animate-in slide-in-from-right-2">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2 text-center">Phạm vi hiển thị</label>
                                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                                {['PUBLIC', 'PRIVATE'].map(t => (
                                                    <button key={t} onClick={() => handleChange("typePromotion", t)} className={`flex-1 py-2 rounded-md text-[10px] font-bold transition-all ${formData.typePromotion === t ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"}`}>
                                                        {t === 'PUBLIC' ? <span className="flex items-center justify-center gap-1"><Globe size={12}/> PUBLIC</span> : <span className="flex items-center justify-center gap-1"><Lock size={12}/> PRIVATE</span>}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2 text-center">Trạng thái mã</label>
                                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                                {['ACTIVE', 'INACTIVE'].map(st => (
                                                    <button key={st} onClick={() => handleChange("status", st)} className={`flex-1 py-2 rounded-md text-[10px] font-bold transition-all ${formData.status === st ? (st === 'ACTIVE' ? "bg-white text-green-600 shadow-sm" : "bg-white text-red-600 shadow-sm") : "text-slate-400"}`}>
                                                        {st}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 border-t pt-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Giá đơn hàng tối thiểu (VND)</label>
                                                <input type="number" className="w-full border border-slate-300 rounded-md p-2 font-bold" value={formData.minOrderVal} onChange={(e) => handleChange("minOrderVal", e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Số lượt dùng tối đa</label>
                                                <input type="number" className="w-full border border-slate-300 rounded-md p-2 font-bold" value={formData.maxUsage} onChange={(e) => handleChange("maxUsage", e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Giới hạn mỗi đại lý</label>
                                                <input type="number" className="w-full border border-slate-300 rounded-md p-2 font-bold" value={formData.agencyUsageLimit} onChange={(e) => handleChange("agencyUsageLimit", e.target.value)} />
                                            </div>
                                            <div className="p-3 bg-slate-50 rounded-md border border-dashed border-slate-200">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Thống kê sử dụng</p>
                                                <p className="text-sm font-black text-slate-600">{formData.usedCount || 0} / {formData.maxUsage || '∞'} <span className="text-[10px] font-normal text-slate-400 ml-1">lượt đã dùng</span></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t bg-slate-50 flex justify-between items-center">
                            <button onClick={() => setStep(s => s - 1)} disabled={step === 1} className={`px-6 py-2 rounded-md font-bold text-sm transition-all ${step === 1 ? "opacity-0 invisible" : "text-slate-500 hover:bg-slate-200"}`}>Quay lại</button>
                            <div className="flex gap-3">
                                <button onClick={onClose} className="px-6 py-2 rounded-md font-bold text-sm text-slate-400 hover:text-slate-600 transition-colors">Hủy</button>
                                {step < 4 ? (
                                    <button onClick={() => setStep(s => s + 1)} className="bg-blue-600 text-white px-8 py-2 rounded-md font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95">Tiếp tục</button>
                                ) : (
                                    <button onClick={handleSubmit} disabled={isSubmitting} className="bg-blue-600 text-white px-8 py-2 rounded-md font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center gap-2 transition-all active:scale-95">
                                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Lưu thay đổi"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}