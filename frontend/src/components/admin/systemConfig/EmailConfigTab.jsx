import React, { useState, useEffect, useRef } from 'react';
import { Mail, Save, Loader2, RefreshCw, AlertCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { systemConfigService } from '@/services/systemConfig.service';
import ToastPortal from "@/components/common/Notification/ToastPortal.jsx";

const EmailConfigTab = () => {
    const [config, setConfig] = useState(null);
    const [emailValue, setEmailValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const toastRef = useRef(null);

    const fetchData = async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const res = await systemConfigService.getAllConfigs();
            const emailConfig = res.result?.find(c => c.configCode === 'SUPPORT_EMAIL');

            if (emailConfig) {
                setConfig(emailConfig);
                setEmailValue(emailConfig.configValue);
            }
        } catch (err) {
            toastRef.current?.addMessage({ mode: 'error', message: 'Không thể tải cấu hình email' });
        } finally {
            if (!isSilent) setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // Logic Validate Email bằng Regex
    const validateEmail = (email) => {
        const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return regex.test(email);
    };

    const handleUpdate = async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const trimmedEmail = emailValue.trim();

        if (!trimmedEmail) {
            toastRef.current?.addMessage({ mode: 'error', message: 'Vui lòng nhập địa chỉ email' });
            return;
        }

        if (!validateEmail(trimmedEmail)) {
            toastRef.current?.addMessage({ mode: 'error', message: 'Định dạng Email không hợp lệ' });
            return;
        }

        setUpdating(true);
        try {
            await systemConfigService.updateConfig({
                configId: config.configId,
                configValue: trimmedEmail,
                description: config.description
            });

            if (toastRef.current) {
                toastRef.current.addMessage({
                    mode: 'success',
                    message: 'Cập nhật Email hệ thống thành công!'
                });
            }
            await fetchData(true);

        } catch (err) {
            console.error("Update error:", err);
            toastRef.current?.addMessage({
                mode: 'error',
                message: err.response?.data?.message || 'Cập nhật thất bại'
            });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="p-20 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Đang tải dữ liệu...</span>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 p-4 xl:p-8 animate-in fade-in duration-500">
            <ToastPortal ref={toastRef} autoClose={true}/>

            {/* Header */}
            <div
                className="bg-slate-900 rounded-2xl p-5 text-white flex items-center justify-between shadow-xl relative overflow-hidden">
                <div className="flex items-center gap-4 z-10">
                    <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
                        <Mail size={22}/>
                    </div>
                    <div>
                        <h2 className="text-base font-bold tracking-tight uppercase">
                            Cấu hình Email hỗ trợ
                        </h2>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={fetchData}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400"
                    title="Làm mới dữ liệu"
                >
                    <RefreshCw size={18} className={loading ? "animate-spin" : ""}/>
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Form cấu hình */}
                <div className="xl:col-span-2 space-y-6">
                    <div
                        className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2">
                                <h3 className="text-xs font-black uppercase text-slate-700 tracking-widest">Thông
                                    tin Email</h3>
                            </div>
                            {validateEmail(emailValue) && (
                                <div
                                    className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-tighter">
                                    <CheckCircle2 size={12}/> Email hợp lệ
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleUpdate} className="space-y-8">
                            <div className="space-y-3">
                                <label
                                    className="text-[11px] font-black text-slate-700 uppercase tracking-wider ml-1">
                                    Địa chỉ Email tiếp nhận <span className="text-red-500">*</span>
                                </label>
                                <div className="relative group">
                                    <div
                                        className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                        <Mail size={20}/>
                                    </div>
                                    <input
                                        type="text"
                                        value={emailValue}
                                        onChange={(e) => setEmailValue(e.target.value)}
                                        className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 focus:bg-white transition-all font-bold text-slate-800"
                                        placeholder="support@yourdomain.com"
                                    />
                                </div>
                            </div>

                            {/* Nút lưu */}
                            <div className="flex justify-end pt-2">
                                <button
                                    disabled={updating || !config}
                                    className="px-8 py-3.5 bg-slate-900 text-white rounded-xl font-black flex items-center justify-center gap-2.5 hover:bg-slate-800 transition-all shadow-lg active:scale-[0.96] disabled:opacity-50 disabled:active:scale-100"
                                >
                                    {updating ? (
                                        <Loader2 size={18} className="animate-spin"/>
                                    ) : (
                                        <Save size={18}/>
                                    )}
                                    <span className="tracking-widest uppercase text-xs">LƯU </span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {config && (
                        <div
                            className="flex items-center justify-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            <RefreshCw size={10}/>
                            Đồng bộ lúc: {new Date(config.updatedAt).toLocaleString('vi-VN')}
                        </div>
                    )}
                </div>

                {/* Hướng dẫn/Ghi chú */}
                <div className="xl:col-span-1">
                    <div className="xl:col-span-1">
                        <div
                            className="bg-amber-50/50 rounded-[32px] border border-amber-100 p-8 flex flex-col h-full">
                            <div className="flex items-center gap-3 mb-6">
                                <div
                                    className="p-2.5 bg-amber-500 rounded-xl text-white shadow-lg shadow-amber-200">
                                    <AlertCircle size={20}/>
                                </div>
                                <h4 className="font-black text-amber-800 text-xs uppercase tracking-[0.15em]">Lưu
                                    ý</h4>
                            </div>

                            <div className="flex-1 space-y-5">
                                <div className="p-5 bg-white/60 rounded-2xl border border-amber-200/50 shadow-sm">
                                    <p className="text-sm font-bold text-amber-900 leading-relaxed">
                                        Email này được cấu hình để làm địa chỉ đích tiếp nhận toàn bộ dữ liệu từ các
                                        <span className="text-amber-600"> Form hỗ trợ khách hàng</span> và
                                        <span className="text-amber-600"> Yêu cầu tư vấn</span> trên trang chủ.
                                    </p>
                                </div>

                                <div className="px-2 space-y-3">
                                    <p className="text-xs font-bold text-amber-800/60 leading-relaxed italic">
                                        Thay đổi có hiệu lực ngay lập tức trên hệ thống.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailConfigTab;