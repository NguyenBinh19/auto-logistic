import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Building2, Info, Phone, Mail, MapPin,
    Globe, CheckCircle2, Loader2, Smartphone,
    CreditCard, Wallet, ArrowUpRight, Check,
    ShieldCheck, Edit3, AlertCircle, X
} from 'lucide-react';
import { ExternalLink, FileText, ArrowRight } from 'lucide-react';
import { agencyService } from "@/services/agency.service.js";
import { pdfDocumentService } from "@/services/pdf.service.js";
import { rankService } from "@/services/rank.service.js"
import { partnerService } from "@/services/partner.service.js";
import { toast } from "react-hot-toast";

const AgencyProfile = () => {
    const navigate = useNavigate();
    const currentUser = useMemo(() => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            // console.log("Current User Data:", user);
            return user;
        } catch (e) {
            return null;
        }
    }, []);
    const isManager = currentUser?.roles === 'ROLE_AGENCY_MANAGER';
    const isStaff = currentUser?.roles === 'ROLE_AGENCY_STAFF';
    // Quyền chỉnh sửa: Chỉ Manager mới có quyền sửa hồ sơ
    const canEdit = isManager;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSuccessBanner, setShowSuccessBanner] = useState(false);
    const [originalData, setOriginalData] = useState(null);
    const [errors, setErrors] = useState({});
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [policyUrl, setPolicyUrl] = useState("");

    const [rankData, setRankData] = useState(null);
    const [currentRank, setCurrentRank] = useState(null);
    const [rankHistory, setRankHistory] = useState([]);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    // // Hàm fetch thông tin hạng
    // const fetchRankData = async (agencyId) => {
    //     if (!agencyId) return;
    //     try {
    //         // 1. Lấy hạng hiện tại bằng ID lấy từ response profile
    //         const rankRes = await rankService.getAgencyRankDetail({ agencyId: agencyId });
    //         setCurrentRank(rankRes.result);
    //         // 2. Lấy lịch sử hạng (hàm này thường lấy theo token nên giữ nguyên)
    //         const historyRes = await rankService.getMyAgencyRankHistories();
    //         setRankHistory(historyRes.result || []);
    //     } catch (error) {
    //         console.error("Lỗi khi tải thông tin hạng:", error);
    //     }
    // };
    const [profile, setProfile] = useState({
        agencyName: "",
        email: "",
        hotline: "",
        contactPhone: "",
        address: "",
        taxCode: "",
        legalName: "",
        representativeName: "",
        businessLicenseNumber: "",
        creditLimit: 0,
        currentCredit: 0
    });

    // 2. Hàm Validate logic
    const validateForm = () => {
        let newErrors = {};
        const phoneRegex = /^\d{10,11}$/;
        // Validate Tên đại lý
        if (!profile.agencyName?.trim()) {
            newErrors.agencyName = "Tên hiển thị không được để trống";
        }
        // Validate Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (profile.email && profile.email.trim() !== "") {
            if (!emailRegex.test(profile.email)) {
                newErrors.email = "Định dạng email không hợp lệ";
            }
        }
        // Validate Hotline (Cho phép 10-11 số)
        if (profile.hotline && profile.hotline.trim() !== "") {
            if (!phoneRegex.test(profile.hotline.replace(/\s/g, ""))) {
                newErrors.hotline = "Hotline phải từ 10-11 số";
            }
        }
        // Validate SĐT liên hệ
        if (profile.contactPhone && profile.contactPhone.trim() !== "") {
            if (!phoneRegex.test(profile.contactPhone.replace(/\s/g, ""))) {
                newErrors.contactPhone = "Số điện thoại không hợp lệ";
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // const fetchAgencyDetail = async () => {
    //     setLoading(true);
    //     try {
    //         const response = await agencyService.getAgencyProfileDetail();
    //         const res = response.result;
    //         setOriginalData(res);
    //
    //         setProfile({
    //             agencyName: res.agencyName || "",
    //             email: res.email || "",
    //             hotline: res.hotline || "",
    //             contactPhone: res.contactPhone || "",
    //             address: res.address || "",
    //             taxCode: res.verification?.taxCode || "Chưa cập nhật",
    //             legalName: res.verification?.legalName || "Chưa cập nhật",
    //             representativeName: res.verification?.representativeName || "Chưa cập nhật",
    //             businessLicenseNumber: res.verification?.businessLicenseNumber || "Chưa cập nhật",
    //             creditLimit: res.creditLimit || 0,
    //             currentCredit: res.currentCredit || 0
    //         });
    //         if (res.agencyId) {
    //             fetchRankData(res.agencyId);
    //         }
    //         const pdfRes = await pdfDocumentService.getAllPdfs();
    //         if (pdfRes?.result) {
    //             const agencyPolicy = pdfRes.result.find(doc =>
    //                 doc.title.includes("Điều khoản hợp tác với Đại lý")
    //             );
    //             setPolicyUrl(agencyPolicy?.fileUrl || "");
    //         }
    //     } catch (error) {
    //         toast.error("Không thể tải thông tin đại lý");
    //     } finally {
    //         setLoading(false);
    //     }
    // };
    //
    // useEffect(() => {
    //     fetchAgencyDetail();
    // }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const agencyRes = await agencyService.getAgencyProfileDetail();
            const agency = agencyRes.result;
            setOriginalData(agency);

            setProfile({
                agencyName: agency.agencyName || "",
                email: agency.email || "",
                hotline: agency.hotline || "",
                contactPhone: agency.contactPhone || "",
                address: agency.address || "",
                taxCode: agency.verification?.taxCode || "Chưa cập nhật",
                legalName: agency.verification?.legalName || "Chưa cập nhật",
                representativeName: agency.verification?.representativeName || "Chưa cập nhật",
                businessLicenseNumber: agency.verification?.businessLicenseNumber || "Chưa cập nhật",
                creditLimit: agency.creditLimit || 0,
                currentCredit: agency.currentCredit || 0
            });
            // Promise.allSettled trả về một mảng các object {status, value/reason}
            const results = await Promise.allSettled([
                agency.rankId ? rankService.getRankDetail(agency.rankId) : Promise.reject("No Rank ID"),
                rankService.getMyAgencyRankHistories(),
                pdfDocumentService.getAllPdfs()
            ]);
            // Helper check an toàn
            const getSafeValue = (promiseResult) =>
                (promiseResult && promiseResult.status === 'fulfilled') ? promiseResult.value : null;
            const rankDetailRes = getSafeValue(results[0]);
            const historyRes = getSafeValue(results[1]);
            const pdfRes = getSafeValue(results[2]);
            // Gán dữ liệu
            setRankData(rankDetailRes?.result || null);
            setRankHistory(historyRes?.result || []);
            if (pdfRes?.result) {
                const policy = pdfRes.result.find(doc => doc.title.includes("Điều khoản hợp tác với Đại lý"));
                setPolicyUrl(policy?.fileUrl || "");
            }
        } catch (error) {
            console.error("Lỗi fetch dữ liệu:", error);
            toast.error("Không thể tải đầy đủ thông tin hồ sơ");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);
    useEffect(() => {
        document.body.style.overflow = showPdfModal ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [showPdfModal]);

    const handleGoToKYC = () => {
        if (!canEdit) {
            toast.error("Chỉ quản lý mới có quyền cập nhật thông tin pháp lý");
            return;
        }
        // Gửi kèm agencyId và kycId sang màn hình KYC
        navigate('/kyc/status', {
            state: {
                oldKycId: originalData?.verification?.id,
                partnerType: 'AGENCY'
            }
        });
    };

    const handleSave = async () => {
        if (!canEdit) {
            toast.error("Bạn không có quyền chỉnh sửa hồ sơ này!");
            return;
        }
        if (!validateForm()) {
            toast.error("Vui lòng kiểm tra lại các thông tin nhập liệu!");
            return;
        }
        setSaving(true);
        try {
            const updateBody = {
                agencyName: profile.agencyName?.trim(),
                email: profile.email?.trim(),
                hotline: profile.hotline?.trim(),
                contactPhone: profile.contactPhone?.trim()
            };
            const response = await agencyService.upAgencyProfileDetail(updateBody);
            if (response.code === 1000) {
                toast.success("Cập nhật thành công!");
                setShowSuccessBanner(true);
                setTimeout(() => setShowSuccessBanner(false), 5000);
            }
        } catch (error) {
            toast.error("Lưu thất bại!");
        } finally { setSaving(false); }
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
            <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Đang tải hồ sơ...</p>
        </div>
    );

    return (
        <div className="bg-[#F8FAFC] min-h-screen p-6 md:p-10">
            <div className="max-w-5xl mx-auto">
                {showSuccessBanner && (
                    <div className="mb-6 bg-emerald-500 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between animate-in slide-in-from-top-4">
                        <div className="flex items-center gap-3">
                            <Check className="bg-white/20 p-1 rounded-full" size={20} />
                            <p className="text-sm font-bold uppercase tracking-tight">Hồ sơ đã được lưu thành công!</p>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-3xl font-black text-slate-900 uppercase">Hồ sơ đại lý</h1>
                    {canEdit && (
                        <button onClick={handleSave} disabled={saving} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[11px] tracking-widest shadow-xl hover:bg-blue-700 transition-all flex items-center gap-2">
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                            LƯU THAY ĐỔI
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* THÔNG TIN PHÁP LÝ */}
                        <section
                            className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5"><Building2 size={100}/></div>
                            <div className="flex justify-between items-center mb-8 relative z-10">
                                <h2 className="text-xs font-black text-slate-400 tracking-[0.2em] uppercase flex items-center gap-2">
                                    <ShieldCheck size={18} className="text-emerald-500"/> Xác minh pháp lý
                                </h2>
                                {canEdit && (
                                    <button onClick={handleGoToKYC}
                                            className="flex items-center gap-2 text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-all uppercase">
                                        <Edit3 size={14}/> Cập nhật KYC
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                <ReadOnlyField label="Tên pháp nhân" value={profile.legalName}/>
                                <ReadOnlyField label="Mã số thuế" value={profile.taxCode}/>
                                <ReadOnlyField label="Số GPKD" value={profile.businessLicenseNumber}/>
                                <ReadOnlyField label="Người đại diện" value={profile.representativeName}/>
                            </div>
                        </section>

                        {/* THÔNG TIN LIÊN HỆ */}
                        <section className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm">
                            <h2 className="text-xs font-black text-blue-600 tracking-[0.2em] uppercase mb-8 flex items-center gap-2">
                                <Globe size={18}/> Liên hệ & Thương hiệu</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <EditableField
                                    label="Tên hiển thị"
                                    value={profile.agencyName}
                                    onChange={(v) => setProfile({...profile, agencyName: v})}
                                    error={errors.agencyName}
                                    disabled={!canEdit}
                                />
                                <EditableField
                                    label="Email"
                                    value={profile.email}
                                    icon={<Mail size={16}/>}
                                    onChange={(v) => setProfile({...profile, email: v})}
                                    error={errors.email}
                                    disabled={!canEdit}
                                />
                                <EditableField
                                    label="Hotline"
                                    value={profile.hotline}
                                    icon={<Phone size={16}/>}
                                    onChange={(v) => setProfile({...profile, hotline: v})}
                                    error={errors.hotline}
                                    disabled={!canEdit}
                                />
                                <EditableField
                                    label="SĐT Liên hệ"
                                    value={profile.contactPhone}
                                    icon={<Smartphone size={16}/>}
                                    onChange={(v) => setProfile({...profile, contactPhone: v})}
                                    error={errors.contactPhone}
                                    disabled={!canEdit}
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
                                <CreditCard size={18}/> Tài chính</h2>
                            <div className="space-y-8">
                                <div>
                                    <p className="text-slate-400 text-[10px] font-black uppercase mb-1">Hạn mức</p>
                                    <p className="text-2xl font-black italic">{new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND'
                                    }).format(profile.creditLimit)}</p>
                                </div>
                                <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-slate-400 text-[10px] font-black uppercase">Tín dụng hiện
                                            tại</p>
                                        <ArrowUpRight size={14} className="text-red-400"/>
                                    </div>
                                    <p className="text-xl font-black text-red-400">{new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND'
                                    }).format(profile.currentCredit)}</p>
                                </div>
                            </div>
                        </section>

                        {/* CARD HẠNG HIỆN TẠI */}
                        <section
                            className="rounded-2xl p-4 text-white shadow-sm relative overflow-hidden mb-6 transition-all border border-white/5"
                            style={{
                                backgroundColor: rankData?.color || '#1e293b',
                                backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.1), transparent)'
                            }}
                        >
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10">
                                <ShieldCheck size={48}/>
                            </div>

                            <div className="relative z-10 flex items-center justify-between">
                                <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">
                Hạng hiện tại
            </span>
                                    <h2 className="text-2xl font-black uppercase tracking-tight leading-none">
                                        {rankData?.rankName || originalData?.rankName || "---"}
                                    </h2>
                                </div>

                                {/* Nút lịch sử tinh gọn */}
                                <button
                                    onClick={() => setShowHistoryModal(true)}
                                    className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10 active:scale-95 group"
                                >
                                    <span className="text-[10px] font-black uppercase tracking-wider">Lịch sử</span>
                                    <Info size={14} className="group-hover:rotate-12 transition-transform"/>
                                </button>
                            </div>
                        </section>

                        <div
                            className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm relative overflow-hidden transition-all hover:border-blue-200 group">
                            <div className="flex items-center gap-3.5 mb-5">
                                <div
                                    className="p-2 bg-blue-50 rounded-lg text-blue-600 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                    <FileText size={18}/>
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.1em] text-blue-600/80 mb-0.5">
                                        Chính sách
                                    </h3>
                                    <h2 className="text-[12px] font-bold text-slate-800 leading-tight truncate">
                                        Điều khoản hợp tác HMS-B2B
                                    </h2>
                                </div>
                            </div>
                            {/* Nút bấm thiết kế tinh gọn */}
                            <button
                                onClick={() => {
                                    if (policyUrl) setShowPdfModal(true);
                                    else alert("Tài liệu đang được cập nhật!"); // Dùng trực tiếp hàm toast
                                }}
                                className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-slate-200"
                            >
                                Xem chính sách
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* MODAL PDF  */}
            {showPdfModal && (
                <div
                    className="fixed inset-0 z-[10000] flex items-center justify-center p-0 md:p-8 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div
                        className="bg-white w-full max-w-5xl h-full md:h-[94vh] md:rounded-[32px] overflow-hidden shadow-2xl flex flex-col relative animate-in zoom-in duration-300">
                        <div className="absolute top-4 right-4 z-[100] flex items-center gap-2">
                            <a
                                href={policyUrl}
                                target="_blank"
                                rel="noreferrer"
                                title="Mở tab mới"
                                className="p-2.5 bg-white/90 backdrop-blur-md text-slate-500 hover:text-blue-600 rounded-xl border border-slate-200 shadow-sm transition-all active:scale-95"
                            >
                                <ExternalLink size={18}/>
                            </a>
                            <button
                                onClick={() => setShowPdfModal(false)}
                                className="p-2.5 bg-slate-900/90 backdrop-blur-md text-white hover:bg-red-500 rounded-xl shadow-lg transition-all active:scale-95"
                            >
                                <X size={18}/>
                            </button>
                        </div>
                        {/* Content View */}
                        <div className="flex-1 bg-slate-50 relative">
                            <iframe
                                src={`https://docs.google.com/viewer?url=${encodeURIComponent(policyUrl)}&embedded=true`}
                                className="w-full h-full border-none relative z-10"
                                title="PDF Preview"
                            />
                            {/* Background Loading */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-0">
                                <Loader2 size={32} className="animate-spin text-blue-600/20 mb-2"/>
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                        Đang tải tài liệu...
                    </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* MODAL LỊCH SỬ HẠNG */}
            {showHistoryModal && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-slate-100">
                        <div className="px-6 py-5 flex justify-between items-center border-b border-slate-50 shrink-0 bg-white z-10">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                                    Lịch sử thay đổi hạng
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowHistoryModal(false)}
                                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 active:scale-95"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto px-6 custom-scrollbar bg-white">
                            {rankHistory && rankHistory.length > 0 ? (
                                <div className="relative border-l-2 border-slate-100 ml-1.5 pl-6 py-6">
                                    {rankHistory.map((item, index) => {
                                        const statusConfig = {
                                            UPGRADE: {
                                                dot: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]',
                                                label: 'Nâng hạng',
                                                badge: 'text-blue-600 bg-blue-50'
                                            },
                                            DOWNGRADE: {
                                                dot: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]',
                                                label: 'Hạ hạng',
                                                badge: 'text-rose-600 bg-rose-50'
                                            },
                                            HOLD: {
                                                dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]',
                                                label: 'Giữ hạng',
                                                badge: 'text-amber-600 bg-amber-50'
                                            }
                                        };
                                        const currentStatus = statusConfig[item.changeType] || statusConfig.HOLD;
                                        return (
                                            <div
                                                key={item.id || index}
                                                className={`relative animate-in slide-in-from-bottom-2 duration-300 ${index !== 0 ? 'mt-10' : ''}`}
                                            >
                                                {/* Dot tín hiệu */}
                                                <div className={`absolute -left-[33px] top-1 w-3 h-3 rounded-full ring-4 ring-white ${currentStatus.dot}`}/>
                                                <div className="flex flex-col gap-2">
                                                    {/* Time & Type Row */}
                                                    <div className="flex justify-between items-center">
                                            <span
                                                className="text-[10px] font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                                                {new Date(item.changedAt).toLocaleString('vi-VN', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${currentStatus.badge}`}>
                                                            {currentStatus.label}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span
                                                            className="text-sm font-bold text-slate-700">{item.oldRank}</span>
                                                        <ArrowRight size={14} className="text-slate-700"/>
                                                        <span
                                                            className="text-[16px] font-black text-slate-900 uppercase tracking-tight">
                                                {item.newRank}
                                            </span>
                                                    </div>
                                                    <div
                                                        className="space-y-1 text-[12px] border-l-2 border-slate-50 pl-3 mt-1">
                                                        <div
                                                            className="flex justify-between border-b border-dashed border-slate-100 pb-1">
                                                            <span className="text-slate-600 font-medium">Doanh thu ghi nhận:</span>
                                                            <span className="font-black text-slate-800">
                                                    {new Intl.NumberFormat('vi-VN').format(item.totalRevenue)}đ
                                                </span>
                                                        </div>

                                                        <div className="pt-1">
                                                            <p className="text-slate-900 leading-relaxed">
                                                                "{item.reason || "Cập nhật hệ thống"}"
                                                            </p>
                                                        </div>

                                                        <div
                                                            className="text-[10px] text-slate-500 pt-1 flex justify-end">
                                                            <span>Thực hiện: <span
                                                                className="font-bold text-slate-700 uppercase">{item.changedBy}</span></span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="h-64 flex flex-col items-center justify-center text-slate-300">
                                    <AlertCircle size={40} strokeWidth={1} className="mb-2" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Chưa có dữ liệu</p>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-slate-50 shrink-0 bg-white">
                            <button
                                onClick={() => setShowHistoryModal(false)}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-lg active:scale-[0.98]"
                            >
                                Đóng cửa sổ
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <style jsx>{`
    .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #e2e8f0;
        border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #cbd5e1;
    }
`}</style>
        </div>
    );
};

// Components con
const ReadOnlyField = ({label, value}) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
        <div
            className="bg-slate-50 border border-slate-100 px-4 py-3.5 rounded-2xl text-slate-600 font-bold text-sm truncate">
            {value}
        </div>
    </div>
);

const EditableField = ({label, value, onChange, icon, error, disabled}) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none">{label}</label>
        <div className="relative">
            {icon && (
                <div
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${error ? 'text-rose-500' : 'text-slate-400'}`}>
                    {icon}
                </div>
            )}
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className={`w-full ${icon ? 'pl-12' : 'pl-4'} pr-4 py-4 bg-white border-2 rounded-2xl outline-none transition-all text-sm font-bold shadow-sm ${
                    error ? 'border-rose-500 text-rose-700 bg-rose-50/30' : 'border-slate-100 focus:border-blue-600 text-slate-700'
                }`}
            />
        </div>
        {error && (
            <div className="flex items-center gap-1 mt-1 ml-1 text-rose-500">
                <AlertCircle size={12}/>
                <span className="text-[10px] font-black italic uppercase tracking-tighter">{error}</span>
            </div>
        )}
    </div>
);

export default AgencyProfile;