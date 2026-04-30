import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Building2, Phone, Mail, Globe, CheckCircle2,
    Loader2, Smartphone, CreditCard, Wallet,
    ArrowUpRight, Check, ShieldCheck, Edit3, AlertCircle
} from 'lucide-react';
import { toast } from "react-hot-toast";
import { MOCK_AGENCY_DATA } from '@/constant/agency_mockData.js';

const DemoAgencyProfile = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSuccessBanner, setShowSuccessBanner] = useState(false);
    const [errors, setErrors] = useState({});

    // Khởi tạo State từ dữ liệu Mock chung
    const [profile, setProfile] = useState(MOCK_AGENCY_DATA);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 600);
        return () => clearTimeout(timer);
    }, []);

    const PHONE_REGEX = /^[0-9]{10,11}$/;

    // Logic validate dữ liệu
    const validateForm = () => {
        let newErrors = {};

        if (!profile.agencyName?.trim()) {
            newErrors.agencyName = "Tên hiển thị không được để trống";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(profile.email)) {
            newErrors.email = "Định dạng email không hợp lệ";
        }

        if (profile.hotline && profile.hotline.trim() !== "") {
            const cleanHotline = profile.hotline.replace(/\s/g, "");
            if (!PHONE_REGEX.test(cleanHotline)) {
                newErrors.hotline = "Hotline phải từ 10-11 số";
            }
        }

        if (profile.contactPhone && profile.contactPhone.trim() !== "") {
            const cleanPhone = profile.contactPhone.replace(/\s/g, "");
            if (!PHONE_REGEX.test(cleanPhone)) {
                newErrors.contactPhone = "Số điện thoại không hợp lệ";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (!validateForm()) {
            toast.error("Vui lòng kiểm tra lại các thông tin nhập liệu!");
            return;
        }

        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            toast.success("Cập nhật thành công (Chế độ Demo)!");
            setShowSuccessBanner(true);
            setTimeout(() => setShowSuccessBanner(false), 5000);
        }, 1000);
    };

    const handleGoToKYC = () => {
        toast.info("Tính năng cập nhật KYC yêu cầu quyền Admin hệ thống.");
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
            <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Đang tải hồ sơ...</p>
        </div>
    );

    const formatVND = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

    return (
        <div className="bg-[#F8FAFC] min-h-screen p-6 md:p-10">
            <div className="max-w-5xl mx-auto">
                {/* Banner Success */}
                {showSuccessBanner && (
                    <div className="mb-6 bg-emerald-500 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between animate-in slide-in-from-top-4">
                        <div className="flex items-center gap-3">
                            <Check className="bg-white/20 p-1 rounded-full" size={20} />
                            <p className="text-sm font-bold uppercase tracking-tight">Hồ sơ đã được lưu thành công!</p>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 uppercase">Hồ sơ đại lý</h1>
                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Demo Mode Active</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[11px] tracking-widest shadow-xl hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                            LƯU THAY ĐỔI
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* THÔNG TIN PHÁP LÝ */}
                        <section className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5"><Building2 size={100}/></div>
                            <div className="flex justify-between items-center mb-8 relative z-10">
                                <h2 className="text-xs font-black text-slate-400 tracking-[0.2em] uppercase flex items-center gap-2">
                                    <ShieldCheck size={18} className="text-emerald-500" /> Xác minh pháp lý
                                </h2>
                                <button onClick={handleGoToKYC} className="flex items-center gap-2 text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-all uppercase">
                                    <Edit3 size={14} /> Cập nhật KYC
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                <ReadOnlyField label="Tên pháp nhân" value={profile.legalName} />
                                <ReadOnlyField label="Mã số thuế" value={profile.taxCode} />
                                <ReadOnlyField label="Số GPKD" value={profile.businessLicenseNumber} />
                                <ReadOnlyField label="Người đại diện" value={profile.representativeName} />
                                <div className="md:col-span-2">
                                    <ReadOnlyField label="Địa chỉ trụ sở" value={profile.address} />
                                </div>
                            </div>
                        </section>

                        {/* THÔNG TIN LIÊN HỆ */}
                        <section className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm">
                            <h2 className="text-xs font-black text-blue-600 tracking-[0.2em] uppercase mb-8 flex items-center gap-2"><Globe size={18} /> Liên hệ & Thương hiệu</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <EditableField
                                    label="Tên hiển thị"
                                    value={profile.agencyName}
                                    onChange={(v) => setProfile({...profile, agencyName: v})}
                                    error={errors.agencyName}
                                />
                                <EditableField
                                    label="Email"
                                    value={profile.email}
                                    icon={<Mail size={16} />}
                                    onChange={(v) => setProfile({...profile, email: v})}
                                    error={errors.email}
                                />
                                <EditableField
                                    label="Hotline"
                                    value={profile.hotline}
                                    icon={<Phone size={16} />}
                                    onChange={(v) => setProfile({...profile, hotline: v})}
                                    error={errors.hotline}
                                />
                                <EditableField
                                    label="SĐT Liên hệ"
                                    value={profile.contactPhone}
                                    icon={<Smartphone size={16} />}
                                    onChange={(v) => setProfile({...profile, contactPhone: v})}
                                    error={errors.contactPhone}
                                />
                            </div>
                        </section>
                    </div>

                    {/* TÀI CHÍNH */}
                    <div className="space-y-6">
                        <section
                            className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute -bottom-4 -right-4 opacity-10"><Wallet size={120}/></div>
                            <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                                <CreditCard size={18}/> Tài chính
                            </h2>
                            <div className="space-y-8">
                                <div>
                                    <p className="text-slate-400 text-[10px] font-black uppercase mb-1">Hạn mức tín
                                        dụng</p>
                                    <p className="text-2xl font-black italic">{formatVND(profile.finance.creditLimit)}</p>
                                </div>
                                <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-slate-400 text-[10px] font-black uppercase">Tín dụng hiện
                                            tại</p>
                                        <ArrowUpRight size={14} className="text-red-400"/>
                                    </div>
                                    <p className="text-xl font-black text-red-400">{formatVND(profile.finance.currentCredit)}</p>
                                    {/*<p className="text-[9px] text-slate-500 font-bold uppercase mt-2">Hạn: {profile.finance.dueDate}</p>*/}
                                </div>
                                {/*<div>*/}
                                {/*    <p className="text-slate-400 text-[10px] font-black uppercase mb-1">Số dư ví</p>*/}
                                {/*    <p className="text-xl font-black text-emerald-400">{formatVND(profile.finance.walletBalance)}</p>*/}
                                {/*</div>*/}
                            </div>
                        </section>

                        <div className="p-6 bg-blue-50 rounded-[32px] border border-blue-100">
                            <div className="flex items-center gap-2 text-blue-600 mb-2">
                                <AlertCircle size={16}/>
                                <span className="text-[10px] font-black uppercase">Chế độ trải nghiệm</span>
                            </div>
                            <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
                                Bạn có thể thay đổi các thông tin liên hệ để xem cách hệ thống validate dữ liệu thực tế.
                            </p>
                        </div>
                        <div className="bg-amber-50 rounded-[32px] p-6 border border-amber-100">
                            <div className="flex items-center gap-2 text-amber-600 mb-2">
                                <AlertCircle size={16}/>
                                <span className="text-[10px] font-black uppercase">Lưu ý trải nghiệm</span>
                            </div>
                            <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                                Trong bản chính thức, các thông tin pháp lý chỉ được thay đổi thông qua quy trình tái
                                xác minh (KYC) để đảm bảo an toàn.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sub-components
const ReadOnlyField = ({label, value}) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
        <div
            className="bg-slate-50 border border-slate-100 px-4 py-3.5 rounded-2xl text-slate-600 font-bold text-sm truncate">
            {value}
        </div>
    </div>
);

const EditableField = ({label, value, onChange, icon, error}) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none">{label}</label>
        <div className="relative">
            {icon && (
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${error ? 'text-rose-500' : 'text-slate-400'}`}>
                    {icon}
                </div>
            )}
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full ${icon ? 'pl-12' : 'pl-4'} pr-4 py-4 bg-white border-2 rounded-2xl outline-none transition-all text-sm font-bold shadow-sm ${
                    error ? 'border-rose-500 text-rose-700 bg-rose-50/30' : 'border-slate-100 focus:border-blue-600 text-slate-700'
                }`}
            />
        </div>
        {error && (
            <div className="flex items-center gap-1 mt-1 ml-1 text-rose-500">
                <AlertCircle size={12} />
                <span className="text-[10px] font-black italic uppercase tracking-tighter">{error}</span>
            </div>
        )}
    </div>
);

export default DemoAgencyProfile;