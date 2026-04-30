import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Save, Loader2, RefreshCw, Info, Percent, Clock, AlertTriangle, ChevronRight, CheckCircle2, HelpCircle } from 'lucide-react';
import { systemConfigService } from '@/services/systemConfig.service.js';
import { toast } from 'react-hot-toast';
import ToastPortal from "@/components/common/Notification/ToastPortal.jsx";

const RenderInputBox = ({
                            label,
                            icon: Icon,
                            suffix,
                            value,
                            onChange,
                            isLoading,
                            placeholder,
                            helperText
                        }) => {
    const handleInputChange = (e) => {
        const val = e.target.value;
        // Loại bỏ tất cả ký tự không phải là số (0-9)
        const sanitizedVal = val.replace(/[^0-9]/g, '');
        onChange(sanitizedVal);
    };

    return (
        <div className="flex-1 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-blue-50 transition-colors">
                    {Icon && <Icon size={14} className="text-slate-500 group-hover:text-blue-500" />}
                </div>
                <label className="text-[10px] xl:text-[11px] font-black text-slate-600 uppercase tracking-widest">
                    {label}
                </label>
            </div>

            <div className="relative flex items-center">
                <input
                    type="text"
                    inputMode="numeric"
                    value={value || ''}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-lg transition-all"
                    placeholder={placeholder}
                />
                {suffix && (
                    <span className="absolute right-4 text-xs font-black text-slate-400 uppercase">
                        {suffix}
                    </span>
                )}
            </div>
            {helperText && <p className="mt-2 text-[11px] text-slate-600 italic leading-relaxed line-clamp-1">{helperText}</p>}
        </div>
    );
};

const CancelPolicyTab = () => {
    const [loadingFetch, setLoadingFetch] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const toastRef = useRef(null);
    const originalData = useRef({
        fullRefundDays: '',
        penaltyDays: '',
        level1Percent: '',
        level2Percent: '',
        level3Percent: ''
    });
    const [form, setForm] = useState({
        fullRefundDays: '',
        penaltyDays: '',
        level1Percent: '',
        level2Percent: '',
        level3Percent: ''
    });

    const showToast = (mode, message) => {
        if (toastRef.current) {
            toastRef.current.addMessage({ mode, message });
        }
    };

    const fetchConfigs = async () => {
        setLoadingFetch(true);
        try {
            const response = await systemConfigService.getAllCancelConfig();

            // Kiểm tra đúng cấu trúc: response.result
            if (response && response.result) {
                const data = response.result;
                const mappedData = {
                    fullRefundDays: data.CANCEL_FULL_REFUND_DAYS?.toString() ?? '0',
                    penaltyDays: data.CANCEL_PENALTY_DAYS?.toString() ?? '0',
                    level1Percent: data.CANCEL_LEVEL1_PERCENT?.toString() ?? '0',
                    level2Percent: data.CANCEL_LEVEL2_PERCENT?.toString() ?? '0',
                    level3Percent: data.CANCEL_LEVEL3_PERCENT?.toString() ?? '0'
                };

                setForm(mappedData);
                originalData.current = { ...mappedData };
                showToast("success", "Đã đồng bộ dữ liệu mới nhất");
            }
        } catch (error) {
            showToast("error", "Không thể tải cấu hình từ hệ thống");
        } finally {
            setLoadingFetch(false);
        }
    };

    useEffect(() => { fetchConfigs(); }, []);

    const validateFields = (dataToValidate) => {
        const { fullRefundDays, penaltyDays, level1Percent, level2Percent, level3Percent } = dataToValidate;
        // 1. Kiểm tra giá trị không hợp lệ (NaN hoặc Undefined/Null)
        const fields = { fullRefundDays, penaltyDays, level1Percent, level2Percent, level3Percent };
        const numberOnlyRegex = /^[0-9]+$/
        for (const [key, value] of Object.entries(fields)) {
            if (value === '' || value === null || value === undefined) {
                showToast("error", `Các trường cấu hình không được để trống!`);
                return false;
            }
            if (isNaN(Number(value))) {
                showToast("error", `Trường ${key} phải là một con số hợp lệ!`);
                return false;
            }
            if (!numberOnlyRegex.test(String(value).trim())) {
                showToast("error", "Dữ liệu không được chứa ký tự đặc biệt hoặc chữ cái!");
                return false;
            }
        }
        const fDays = Number(fullRefundDays);
        const pDays = Number(penaltyDays);
        const l1 = Number(level1Percent);
        const l2 = Number(level2Percent);
        const l3 = Number(level3Percent);
        // 2. Kiểm tra số nguyên (Integer) cho số ngày
        if (!Number.isInteger(fDays) || !Number.isInteger(pDays)) {
            showToast("error", "Số ngày phải là số nguyên (không chứa dấu thập phân)!");
            return false;
        }
        // 3. Chặn số âm
        if ([fDays, pDays, l1, l2, l3].some(v => v < 0)) {
            showToast("error", "Giá trị cấu hình không được là số âm!");
            return false;
        }
        // 4. Giới hạn thực tế (Tránh lỗi nhập liệu quá đà)
        if (fDays > 365 || pDays > 365) {
            showToast("error", "Mốc thời gian hủy không nên vượt quá 1 năm (365 ngày)!");
            return false;
        }
        // 5. Kiểm tra logic ngày: Mốc xa (Refund) > Mốc gần (Penalty)
        // Ví dụ: Hủy trước 7 ngày (Free) > Hủy trước 3 ngày (Phạt)
        if (fDays <= pDays) {
            showToast("error", "Mốc hoàn tiền (xa) phải lớn hơn mốc phạt trung gian (gần)!");
            return false;
        }
        // 6. Kiểm tra logic phần trăm tăng dần
        if (l1 > l2) {
            showToast("error", "Tỷ lệ phạt Level 1 phải nhỏ hơn hoặc bằng Level 2!");
            return false;
        }
        if (l2 > l3) {
            showToast("error", "Tỷ lệ phạt Level 2 phải nhỏ hơn hoặc bằng Level 3!");
            return false;
        }
        // 7. Kiểm tra giới hạn % (0 - 100)
        if ([l1, l2, l3].some(p => p > 100)) {
            showToast("error", "Tỷ lệ phạt không được vượt quá 100%!");
            return false;
        }
        return true;
    };

    const handleUpdateAll = async () => {
        const getValue = (key) => {
            const formVal = form[key];
            const originalVal = originalData.current[key];
            return (formVal !== null && formVal !== undefined && String(formVal).trim() !== '')
                ? formVal
                : originalVal;
        };
        const finalPayload = {
            fullRefundDays: getValue('fullRefundDays'),
            penaltyDays: getValue('penaltyDays'),
            level1Percent: getValue('level1Percent'),
            level2Percent: getValue('level2Percent'),
            level3Percent: getValue('level3Percent'),
        };

        const isValid = validateFields(finalPayload);

        if (!isValid) {
            console.error("Dừng lại do lỗi logic validation");
            return;
        }
        // Kiểm tra xem thực sự có thay đổi so với database không
        const hasChanged = Object.keys(finalPayload).some(
            key => String(finalPayload[key]) !== String(originalData.current[key])
        );
        if (!hasChanged) {
            showToast("info", "Dữ liệu hiện tại đã là mới nhất");
            return;
        }
        setLoadingSubmit(true);
        try {
            await systemConfigService.updateCancelConfig(finalPayload);
            showToast("success", "Cập nhật chính sách thành công!");
            // Cập nhật lại originalData sau khi thành công
            originalData.current = { ...finalPayload };
            setForm({ ...finalPayload });
            await fetchConfigs();
        } catch (error) {
            showToast("error", error.response?.data?.message || "Lỗi khi lưu cấu hình");
        } finally {
            setLoadingSubmit(false);
        }
    };

    if (loadingFetch) return (
        <div className="p-24 text-center flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang kết nối hệ thống...</span>
        </div>
    );

    return (
        <div
            className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 p-4 xl:p-8 bg-white/50 rounded-[40px]">
            <ToastPortal ref={toastRef} autoClose={true} autoCloseTime={2800}/>
            {/* Header Section */}
            <div className="bg-slate-900 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-center justify-between shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-12 -mt-12"></div>
                <div className="flex items-center gap-4 z-10">
                    <div className="p-2.5 bg-blue-500/20 rounded-xl border border-blue-500/20 shadow-inner">
                        <ShieldAlert size={22} className="text-blue-400"/>
                    </div>
                    <div>
                        <h2 className="text-base font-bold tracking-tight uppercase">
                            Thiết lập Chính sách Phạt hủy
                        </h2>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={fetchConfigs}
                    className="mt-4 sm:mt-0 p-2 hover:bg-white/10 rounded-full transition-all text-slate-400 group border border-white/5 active:scale-90"
                >
                    <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-700"/>
                </button>
            </div>

            {/* Hướng dẫn Logic */}
            <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-8 py-4 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <HelpCircle size={18} className="text-blue-600"/>
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-700">Hướng dẫn áp dụng thực tế</span>
                    </div>
                    <span
                        className="text-[10px] font-bold text-blue-500 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 animate-pulse">Dữ liệu thời gian thực</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                    <div className="p-8 hover:bg-emerald-50/40 transition-colors">
                        <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase mb-4">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                            TRƯỜNG HỢP HỦY SỚM
                        </div>
                        <p className="text-[15px] text-slate-600 leading-relaxed">
                            Khách hủy đơn <b>trước {form.fullRefundDays || '...'} ngày</b>. Hệ thống tự động thu phí
                            phạt <b className="text-emerald-700 text-lg">{form.level1Percent || '0'}%</b> tổng giá trị.
                        </p>
                    </div>

                    <div className="p-8 hover:bg-amber-50/40 transition-colors">
                        <div className="flex items-center gap-2 text-amber-600 font-black text-[10px] uppercase mb-4">
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                            TRƯỜNG HỢP TRUNG GIAN
                        </div>
                        <p className="text-[15px] text-slate-600 leading-relaxed">
                            Hủy từ <b>{form.penaltyDays || '...'}</b> đến <b>{form.fullRefundDays || '...'}</b> ngày
                            trước Check-in. Thu phí phạt <b
                            className="text-amber-700 text-lg">{form.level2Percent || '0'}%</b>.
                        </p>
                    </div>

                    <div className="p-8 hover:bg-red-50/40 transition-colors">
                        <div className="flex items-center gap-2 text-red-600 font-black text-[10px] uppercase mb-4">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                            TRƯỜNG HỢP CẬN NGÀY
                        </div>
                        <p className="text-[15px] text-slate-600 leading-relaxed">
                            Hủy trong vòng <b>dưới {form.penaltyDays || '...'} ngày</b>. Phạt mức tối đa <b
                            className="text-red-700 text-lg">{form.level3Percent || '0'}%</b> (Thường là mất cọc).
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Section */}
            <div className="space-y-8">
                {/* Hàng 1: Mốc thời gian */}
                <div className="space-y-4">
                    <div
                        className="flex items-center gap-3 px-2 font-black text-[11px] text-slate-500 uppercase tracking-widest">
                        <Clock size={16} className="text-blue-700"/> Mốc thời gian áp dụng (Số ngày trước Check-in)
                    </div>
                    <div className="flex flex-col md:flex-row gap-6">
                        <RenderInputBox
                            label="Mốc hoàn trả 100%"
                            icon={Clock}
                            suffix="Ngày"
                            value={form.fullRefundDays}
                            onChange={(val) => setForm({...form, fullRefundDays: val})}
                            isLoading={loadingSubmit}
                            placeholder="7"
                            helperText="Thời hạn xa nhất khách có thể hủy mà không mất phí."
                        />
                        <RenderInputBox
                            label="Mốc phạt trung gian"
                            icon={Clock}
                            suffix="Ngày"
                            value={form.penaltyDays}
                            onChange={(val) => setForm({...form, penaltyDays: val})}
                            isLoading={loadingSubmit}
                            placeholder="3"
                            helperText="Ranh giới giữa mức phạt nhẹ và mức phạt cận ngày."
                        />
                    </div>
                </div>

                {/* Hàng 2: Tỷ lệ phạt */}
                <div className="space-y-4">
                    <div
                        className="flex items-center gap-3 px-2 font-black text-[11px] text-slate-500 uppercase tracking-widest">
                        <Percent size={16} className="text-blue-700"/> Tỷ lệ phần trăm phạt tương ứng (0 - 100%)
                    </div>
                    <div className="flex flex-col md:flex-row gap-6">
                        <RenderInputBox label="Phí Level 1 (Sớm)" suffix="%" value={form.level1Percent}
                                        onChange={(val) => setForm({...form, level1Percent: val})}
                                        isLoading={loadingSubmit} placeholder="0"/>
                        <RenderInputBox label="Phí Level 2 (Vừa)" suffix="%" value={form.level2Percent}
                                        onChange={(val) => setForm({...form, level2Percent: val})}
                                        isLoading={loadingSubmit} placeholder="50"/>
                        <RenderInputBox label="Phí Level 3 (Trễ)" suffix="%" value={form.level3Percent}
                                        onChange={(val) => setForm({...form, level3Percent: val})}
                                        isLoading={loadingSubmit} placeholder="100"/>
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div
                className="flex flex-col xl:flex-row items-center justify-between gap-6 pt-8 border-t border-slate-200/60">
                <div className="flex gap-4 items-start max-w-2xl bg-red-50/50 p-4 rounded-2xl border border-red-100">
                    <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5"/>
                    <p className="text-[12px] text-slate-600 leading-relaxed">
                        <b className="text-red-700 uppercase">Nguyên tắc hệ thống:</b> Mốc hoàn tiền phải lớn hơn mốc
                        phạt trung gian.
                        Tỷ lệ phạt phải tăng dần theo độ trễ đặt phòng. Các thay đổi này không áp dụng hồi tố cho các
                        đơn đã đặt trước đó.
                    </p>
                </div>

                <button
                    onClick={handleUpdateAll}
                    disabled={loadingSubmit}
                    className="w-full xl:w-auto flex items-center justify-center gap-4 px-16 py-5 bg-slate-900 hover:bg-blue-600 text-white rounded-[24px] font-bold shadow-2xl transition-all duration-300 active:scale-95 disabled:opacity-50 group overflow-hidden relative"
                >
                    <div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    {loadingSubmit ? <Loader2 size={20} className="animate-spin"/> : <Save size={20}/>}
                    <span className="uppercase tracking-[0.2em] text-sm">Cập nhật chính sách</span>
                </button>
            </div>
        </div>
    );
};

export default CancelPolicyTab;