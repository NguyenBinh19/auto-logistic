import React, { useState, useEffect } from "react";
import { X, Loader2, Check, RefreshCw, Info, Globe, Lock } from "lucide-react";
import { promotionService } from "@/services/coupon.service.js";

const getInitialState = () => ({
    code: "",
    name: "",
    typePromotion: "PUBLIC",
    typeDiscount: "PERCENTAGE",
    discountVal: "",
    maxDiscount: "",
    minOrderVal: "",
    applyStartDate: new Date().toISOString().split('T')[0],
    applyEndDate: "",
    stayStartDate: new Date().toISOString().split('T')[0],
    stayEndDate: "",
    agencyUsageLimit: 1,
    minStay: 1,
    maxUsage: "",
    status: "ACTIVE",
    createdBy: "ADMIN_TEST"
});

export default function CreateCouponModal({ isOpen, onClose, onSuccess}) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState(getInitialState());

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialState());
            setStep(1);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const steps = [
        { id: 1, title: "Thông tin chung" },
        { id: 2, title: "Giá trị giảm" },
        { id: 3, title: "Điều kiện" },
        { id: 4, title: "Đối tượng" }
    ];

    const generateRandomCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = 'PROMO';
        for (let i = 0; i < 5; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData(prev => ({ ...prev, code: result }));
    };


    // Hàm xử lý nhập liệu thông minh: Không bị kẹt số 0, không nhập số âm
    const handleChange = (field, value) => {
        const numericFields = ["discountVal", "maxDiscount", "minOrderVal", "minStay", "maxUsage", "agencyUsageLimit"];
        if (numericFields.includes(field)) {
            // Cho phép để trống để xóa trắng ô input
            if (value === "") {
                setFormData(prev => ({ ...prev, [field]: "" }));
                return;
            }
            let val = parseFloat(value);
            if (isNaN(val)) return;
            // Không cho phép số âm
            val = Math.max(0, val);
            // Giới hạn 100 nếu là phần trăm
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
            code, name, discountVal,maxUsage,
            applyStartDate, applyEndDate,
            stayStartDate, stayEndDate
        } = formData;
        // 1. Kiểm tra trống
        if (!code.trim()) return "Mã Code không được để trống";
        if (!name.trim()) return "Tên chương trình không được để trống";
        if (!discountVal || Number(discountVal) <= 0) return "Giá trị giảm phải lớn hơn 0";
        if (maxUsage === "" || Number(maxUsage) <= 0) return "Vui lòng nhập tổng lượt sử dụng tối đa (lớn hơn 0)";
        // 2. Kiểm tra ngày áp dụng (Apply Date)
        if (!applyStartDate) return "Vui lòng chọn ngày bắt đầu áp dụng";
        if (!applyEndDate) return "Vui lòng chọn ngày kết thúc áp dụng";
        const applyStart = new Date(applyStartDate);
        const applyEnd = new Date(applyEndDate);
        if (applyEnd < applyStart) return "Ngày kết thúc áp dụng không được trước ngày bắt đầu";
        // 3. Kiểm tra ngày lưu trú (Stay Date)
        if (!stayStartDate) return "Vui lòng chọn ngày bắt đầu lưu trú";
        if (!stayEndDate) return "Vui lòng chọn ngày kết thúc lưu trú";
        const stayStart = new Date(stayStartDate);
        const stayEnd = new Date(stayEndDate);
        if (stayEnd < stayStart) return "Ngày kết thúc lưu trú không được trước ngày bắt đầu lưu trú";
        // ngày lưu trú không  kết thúc trước khi mã bắt đầu có hiệu lực
        if (stayEnd < applyStart) return "Ngày kết thúc lưu trú không thể trước ngày bắt đầu áp dụng mã";

        return null;
    };

    const handleSubmit = async () => {
        const error = validateForm();
        if (error) return alert(error);

        setIsSubmitting(true);
        try {
            // Ép kiểu dữ liệu
            const payload = {
                ...formData,
                discountVal: Number(formData.discountVal || 0),
                maxDiscount: Number(formData.maxDiscount || 0),
                minOrderVal: Number(formData.minOrderVal || 0),
                agencyUsageLimit: Math.floor(Number(formData.agencyUsageLimit || 1)),
                minStay: Math.floor(Number(formData.minStay || 1)),
                maxUsage: Math.floor(Number(formData.maxUsage || 0)),
                code: formData.code.toUpperCase().replace(/\s+/g, '')
            };

            await promotionService.createPromotion(payload);
            alert("Tạo mã khuyến mãi thành công!");
            onSuccess();
            onClose();
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi hệ thống khi tạo khuyến mãi");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 font-sans text-slate-700">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b flex justify-between items-center bg-white">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Tạo mã giảm giá mới</h2>
                        <p className="text-sm text-slate-500">Cấu hình chi tiết cho chương trình khuyến mãi</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                        <X size={24} />
                    </button>
                </div>

                {/* Stepper */}
                <div className="px-6 py-6 border-b bg-slate-50/30">
                    <div className="flex justify-between relative px-4">
                        <div className="absolute top-4 left-0 w-full h-[1px] bg-slate-200 -z-0"></div>
                        {steps.map((s) => (
                            <div key={s.id} className="relative z-10 flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-colors ${
                                    step >= s.id ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-300 text-slate-400"
                                }`}>
                                    {step > s.id ? <Check size={14} /> : s.id}
                                </div>
                                <span className={`text-[11px] mt-2 font-semibold ${step === s.id ? "text-blue-600" : "text-slate-500"}`}>
                                    {s.title}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 min-h-[400px] overflow-y-auto">

                    {/* Bước 1: Thông tin chung */}
                    {step === 1 && (
                        <div className="space-y-5 animate-in slide-in-from-right-2">
                            <div>
                                <label className="block text-sm font-semibold mb-1.5">Mã giảm giá <span className="text-red-500">*</span></label>
                                <div className="flex gap-2">
                                    <input type="text" placeholder="Ví dụ: SUMMER2026" className="flex-1 border border-slate-300 rounded-md p-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 uppercase font-bold text-blue-600"
                                           value={formData.code} onChange={(e) => handleChange("code", e.target.value)} />
                                    <button onClick={generateRandomCode} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-md text-sm font-semibold flex items-center gap-2 border transition-all text-slate-700">
                                        <RefreshCw size={14} /> Ngẫu nhiên
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1.5">Tên chương trình <span className="text-red-500">*</span></label>
                                <input type="text" placeholder="Nhập tên chương trình (Ví dụ: Ưu đãi hè 2026)" className="w-full border border-slate-300 rounded-md p-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                       value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
                            </div>
                        </div>
                    )}

                    {/* Bước 2: Giá trị giảm */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-2">
                            <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider text-[11px]">Cấu hình mức giảm giá</label>

                            <div className="space-y-4">
                                {/* Option PERCENT */}
                                <div className={`p-4 border rounded-lg transition-all ${formData.typeDiscount === "PERCENT" ? "border-blue-500 bg-blue-50/30" : "border-slate-200"}`}>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="radio" name="typeDiscount" checked={formData.typeDiscount === "PERCENT"} onChange={() => handleChange("typeDiscount", "PERCENT")} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                                        <span className="text-sm font-bold">Theo Phần trăm (%)</span>
                                    </label>
                                    {formData.typeDiscount === "PERCENT" && (
                                        <div className="grid grid-cols-2 gap-4 mt-4 ml-7">
                                            <div>
                                                <label className="text-[11px] font-bold text-slate-500 block mb-1 uppercase">Mức giảm (%)</label>
                                                <div className="relative">
                                                    <input type="number" placeholder="0" className="w-full border border-slate-300 rounded-md p-2 pr-8 font-bold text-blue-600" value={formData.discountVal} onChange={(e) => handleChange("discountVal", e.target.value)} />
                                                    <span className="absolute right-3 top-2 text-slate-400 font-bold">%</span>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-bold text-slate-500 block mb-1 uppercase">Giảm tối đa (VND)</label>
                                                <div className="relative">
                                                    <input type="number" placeholder="0" className="w-full border border-slate-300 rounded-md p-2 pr-10 font-bold" value={formData.maxDiscount} onChange={(e) => handleChange("maxDiscount", e.target.value)} />
                                                    <span className="absolute right-3 top-2 text-slate-400 text-xs">VND</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Option AMOUNT */}
                                <div className={`p-4 border rounded-lg transition-all ${formData.typeDiscount === "AMOUNT" ? "border-blue-500 bg-blue-50/30" : "border-slate-200"}`}>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="radio" name="typeDiscount" checked={formData.typeDiscount === "AMOUNT"} onChange={() => handleChange("typeDiscount", "AMOUNT")} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                                        <span className="text-sm font-bold">Số tiền cố định (VND)</span>
                                    </label>
                                    {formData.typeDiscount === "AMOUNT" && (
                                        <div className="mt-4 ml-7">
                                            <label className="text-[11px] font-bold text-slate-500 block mb-1 uppercase">Số tiền giảm</label>
                                            <div className="relative">
                                                <input type="number" placeholder="0" className="w-full border border-slate-300 rounded-md p-2 pr-10 font-bold text-blue-600" value={formData.discountVal} onChange={(e) => handleChange("discountVal", e.target.value)} />
                                                <span className="absolute right-3 top-2 text-slate-400 text-xs">VND</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bước 3: Điều kiện */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right-2">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Giá trị đơn hàng tối thiểu (VND)</label>
                                <div className="relative">
                                    <input type="number" placeholder="0" className="w-full border border-slate-300 rounded-md p-2.5 pr-10 font-bold" value={formData.minOrderVal} onChange={(e) => handleChange("minOrderVal", e.target.value)} />
                                    <span className="absolute right-3 top-2.5 text-slate-400 text-xs font-semibold">VND</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Thời gian áp dụng mã</label>
                                    <div className="flex flex-col gap-2">
                                        <input type="date" className="w-full border border-slate-300 rounded-md p-2 text-sm font-medium" value={formData.applyStartDate} onChange={(e) => handleChange("applyStartDate", e.target.value)} />
                                        <input type="date" className="w-full border border-slate-300 rounded-md p-2 text-sm font-medium" min={formData.applyStartDate} value={formData.applyEndDate} onChange={(e) => handleChange("applyEndDate", e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Thời gian ở (Ngày lưu trú)</label>
                                    <div className="flex flex-col gap-2">
                                        <input type="date" className="w-full border border-slate-300 rounded-md p-2 text-sm font-medium" min={formData.applyStartDate} value={formData.stayStartDate} onChange={(e) => handleChange("stayStartDate", e.target.value)} />
                                        <input type="date" className="w-full border border-slate-300 rounded-md p-2 text-sm font-medium" min={formData.stayStartDate} value={formData.stayEndDate} onChange={(e) => handleChange("stayEndDate", e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 border rounded-xl space-y-4">
                                <label className="block text-[11px] font-black text-slate-400 uppercase">Ràng buộc hệ thống</label>
                                {/* Chỉnh sửa grid-cols-3 để 3 ô cùng hàng */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 block mb-1 italic">Số đêm tối thiểu</label>
                                        <input type="number"
                                               className="w-full border border-slate-300 rounded-md p-2 bg-white font-bold text-blue-600 outline-none focus:border-blue-500"
                                               value={formData.minStay}
                                               onChange={(e) => handleChange("minStay", e.target.value)}/>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 block mb-1 italic">Tổng lượt dùng</label>
                                        <input type="number"
                                               className="w-full border border-slate-300 rounded-md p-2 bg-white font-bold text-blue-600 outline-none focus:border-blue-500"
                                               value={formData.maxUsage}
                                               onChange={(e) => handleChange("maxUsage", e.target.value)}/>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 block mb-1 italic">Lượt dùng / Đại lý</label>
                                        <input type="number"
                                               className="w-full border border-slate-300 rounded-md p-2 bg-white font-bold text-blue-600 outline-none focus:border-blue-500"
                                               value={formData.agencyUsageLimit}
                                               onChange={(e) => handleChange("agencyUsageLimit", e.target.value)}/>
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1 italic leading-tight">
                                    * <b>Tổng lượt dùng:</b> Giới hạn toàn hệ thống. <br/>
                                    * <b>Lượt dùng / Đại lý:</b> Số lần tối đa một Agency được dùng mã này.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Bước 4: Đối tượng */}
                    {step === 4 && (
                        <div className="space-y-8 py-4 animate-in slide-in-from-right-2">
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => handleChange("typePromotion", "PUBLIC")}
                                        className={`p-6 border-2 rounded-xl flex flex-col items-center gap-3 transition-all ${formData.typePromotion === "PUBLIC" ? "border-blue-600 bg-blue-50" : "border-slate-100 opacity-60"}`}>
                                    <Globe className={formData.typePromotion === "PUBLIC" ? "text-blue-600" : "text-slate-300"} size={32} />
                                    <span className="font-bold text-sm">CÔNG KHAI (Mọi người)</span>
                                    <p className="text-[10px] text-center text-slate-500">Mã sẽ hiển thị công khai trên trang đặt phòng</p>
                                </button>
                                <button onClick={() => handleChange("typePromotion", "PRIVATE")} className={`p-6 border-2 rounded-xl flex flex-col items-center gap-3 transition-all ${formData.typePromotion === "PRIVATE" ? "border-blue-600 bg-blue-50" : "border-slate-100 opacity-60"}`}>
                                    <Lock className={formData.typePromotion === "PRIVATE" ? "text-blue-600" : "text-slate-300"} size={32} />
                                    <span className="font-bold text-sm">NỘI BỘ (Riêng tư)</span>
                                    <p className="text-[10px] text-center text-slate-500">Chỉ khách hàng có mã mới có thể áp dụng</p>
                                </button>
                            </div>

                            <div className="flex flex-col items-center pt-6 border-t border-dashed">
                                <label className="text-[11px] font-bold text-slate-400 uppercase mb-3">Trạng thái mã sau khi khởi tạo</label>
                                <div className="inline-flex p-1 bg-slate-100 rounded-lg shadow-inner">
                                    <button onClick={() => handleChange("status", "ACTIVE")} className={`px-8 py-2 rounded-md text-xs font-bold transition-all ${formData.status === "ACTIVE" ? "bg-white text-green-600 shadow-sm" : "text-slate-400"}`}>KÍCH HOẠT</button>
                                    <button onClick={() => handleChange("status", "INACTIVE")} className={`px-8 py-2 rounded-md text-xs font-bold transition-all ${formData.status === "INACTIVE" ? "bg-white text-red-500 shadow-sm" : "text-slate-400"}`}>TẠM DỪNG</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-slate-50 flex justify-between items-center">
                    <button onClick={() => setStep(s => s - 1)} disabled={step === 1} className={`px-6 py-2 rounded-md font-bold text-sm border bg-white transition-colors ${step === 1 ? "invisible" : "text-slate-600 hover:bg-slate-50"}`}>Quay lại</button>
                    <div className="flex gap-3">
                        {step < 4 ? (
                            <button onClick={() => setStep(s => s + 1)} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-md font-bold text-sm transition-all shadow-md shadow-blue-200">Tiếp theo</button>
                        ) : (
                            <button onClick={handleSubmit} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-md font-bold text-sm flex items-center gap-2 transition-all shadow-md shadow-blue-200">
                                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : "Xác nhận & Tạo mã"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}