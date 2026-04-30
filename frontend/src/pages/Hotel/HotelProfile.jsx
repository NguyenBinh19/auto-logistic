import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Save, Hotel, MapPin, Upload, X, Loader2,
    CheckCircle2, Info, Plus, Check, Edit3, ShieldCheck
} from 'lucide-react';
import { ExternalLink, FileText, ArrowRight } from 'lucide-react';
import { partnerService } from "@/services/partner.service.js";
import { pdfDocumentService } from "@/services/pdf.service.js";
import ToastPortal from "@/components/common/Notification/ToastPortal.jsx";
import { commissionService } from "@/services/commission.service.js";

const HotelProfileManager = () => {
    const typeStyles = {
        DEAL: {
            label: 'Ưu đãi (Deal)',
            classes: 'text-emerald-700 bg-emerald-50 border-emerald-100'
        },
        DEFAULT: {
            label: 'Mặc định',
            classes: 'text-slate-600 bg-slate-100 border-slate-200'
        },
        HOTEL: {
            label: 'Riêng biệt',
            classes: 'text-blue-700 bg-blue-50 border-blue-100'
        }
    };
    const navigate = useNavigate();
    const currentUser = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('user'));
        } catch (e) {
            return null;
        }
    }, []);

    const isManager = currentUser?.roles === 'ROLE_HOTEL_MANAGER';
    const isStaff = currentUser?.roles === 'ROLE_HOTEL_STAFF';
    const canEdit = isManager;

    const toast = useRef();
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [originalData, setOriginalData] = useState(null);
    const [showSuccessBanner, setShowSuccessBanner] = useState(false);
    const [bankErrors, setBankErrors] = useState({});
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [policyUrl, setPolicyUrl] = useState("");
    const [showRankModal, setShowRankModal] = useState(false);
    const [rankHistory, setRankHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const fetchCommissionHistory = async () => {
        setLoadingHistory(true);
        try {
            const response = await commissionService.getMyHotelLogs();
            if (response.code === 1000) {
                setRankHistory(response.result);
                setShowRankModal(true);
            }
        } catch (error) {
            toast.current.addMessage({ mode: 'error', message: "Không thể tải lịch sử hoa hồng" });
        } finally {
            setLoadingHistory(false);
        }
    };

    const [formData, setFormData] = useState({
        hotelName: "", address: "", city: "", country: "",
        phone: "", email: "", description: "",
        amenitiesList: [],
        coverImageId: null
    });

    const [bankLoading, setBankLoading] = useState(false);
    const [bankData, setBankData] = useState({
        bankName: "",
        bankAccountNumber: "",
        bankAccountHolder: ""
    });

    const hotelId = originalData?.id;

    const [existingImages, setExistingImages] = useState([]);
    const [deleteImageIds, setDeleteImageIds] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [customAmenity, setCustomAmenity] = useState("");

    useEffect(() => { fetchDetail(); }, []);

    // 3. Hàm điều hướng sang KYC
    const handleGoToKYC = () => {
        if (!canEdit) {
            toast.current.addMessage({ mode: 'error', message: "Bạn không có quyền chỉnh sửa hồ sơ này!" });
            return;
        }
        navigate('/kyc/status', {
            state: {
                oldKycId: originalData?.verification?.id,
                partnerType: 'HOTEL'
            }
        });
    };

    const validateForm = () => {
        let newErrors = {};

        if (!formData.hotelName.trim()) newErrors.hotelName = "Tên khách sạn không được để trống";

        if (formData.phone && formData.phone.trim() !== "") {
            if (!/^\d{10,11}$/.test(formData.phone.replace(/\s/g, ""))) {
                newErrors.phone = "Số điện thoại không hợp lệ (10-11 số)";
            }
        }
        if (formData.email && formData.email.trim() !== "") {
            if (!/\S+@\S+\.\S+/.test(formData.email)) {
                newErrors.email = "Định dạng email không hợp lệ";
            }
        }
        // Thành phố
        const cityVal = formData.city || "";
        if (cityVal.trim() !== "") { // Chỉ kiểm tra khi có nhập
            if (/^\d+$/.test(cityVal.trim())) {
                newErrors.city = "Thành phố không hợp lệ (không thể chỉ có số)";
            }
        }
        // Địa chỉ chi tiết
        const addrVal = formData.address || "";
        if (addrVal.trim() !== "") { // Chỉ kiểm tra khi có nhập
            if (/^\d+$/.test(addrVal.trim())) {
                newErrors.address = "Địa chỉ không hợp lệ (không thể chỉ có số)";
            }
        }

        const descriptVar = formData.description || "";
        if (descriptVar.trim() !== "") { // Chỉ kiểm tra khi có nhập
            if (/^\d+$/.test(descriptVar.trim())) {
                newErrors.description = "Mô tả không hợp lệ (không thể chỉ có số)";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateBankForm = () => {
        let newErrors = {};
        // 1. Validate Tên ngân hàng
        const bankNameTrim = bankData.bankName.trim();
        if (!bankNameTrim) {
            newErrors.bankName = "Tên ngân hàng không được để trống";
        }
        else if (!/^[a-zA-Z0-9ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểếệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ\s]+$/.test(bankNameTrim)) {
            newErrors.bankName = "Tên ngân hàng không được chứa ký tự đặc biệt";
        }
        else if (/^\d+$/.test(bankNameTrim)) {
            newErrors.bankName = "Tên ngân hàng không được chỉ chứa mỗi số";
        }
        else if (bankNameTrim.length < 2) {
            newErrors.bankName = "Tên ngân hàng quá ngắn";
        }
        // 2. Validate Số tài khoản (Thường từ 8-15 số)
        const accountNumberClean = bankData.bankAccountNumber.replace(/\s/g, "");
        if (!accountNumberClean) {
            newErrors.bankAccountNumber = "Số tài khoản không được để trống";
        } else if (!/^\d+$/.test(accountNumberClean)) {
            newErrors.bankAccountNumber = "Số tài khoản chỉ được chứa chữ số";
        } else if (accountNumberClean.length < 8 || accountNumberClean.length > 16) {
            newErrors.bankAccountNumber = "Số tài khoản thường từ 8 đến 16 ký tự số";
        }
        // 3. Validate Chủ tài khoản (Phải là chữ In hoa, không số, không ký tự đặc biệt)
        const holderName = bankData.bankAccountHolder.trim();
        if (!holderName) {
            newErrors.bankAccountHolder = "Tên chủ tài khoản không được để trống";
        } else if (!/^[A-Z\s]+$/.test(holderName)) {
            newErrors.bankAccountHolder = "Tên chủ tài khoản phải là CHỮ IN HOA KHÔNG DẤU";
        }
        setBankErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const response = await partnerService.getHotelProfileDetail();
            const res = response.result;
            setOriginalData(res);

            setFormData({
                hotelName: res.hotelName || "",
                address: res.address || "",
                city: res.city || "",
                country: res.country || "",
                phone: res.phone || "",
                email: res.email || "",
                description: res.description || "",
                amenitiesList: res.amenitiesList || [],
                coverImageId: res.coverImageId || null
            });

            if (res.hotelId) {
                try {
                    const bankRes = await partnerService.getHotelBankInfo(res.hotelId);
                    if (bankRes.result) {
                        setBankData({
                            bankName: bankRes.result.bankName || "",
                            bankAccountNumber: bankRes.result.bankAccountNumber || "",
                            bankAccountHolder: bankRes.result.bankAccountHolder || ""
                        });
                    }
                } catch (bankErr) {
                    console.log("Hotel chưa thiết lập thông tin ngân hàng");
                }
            }

            const mappedImages = res.images?.map(img => ({
                id: img.imageId,
                url: img.imageUrl
            })) || [];

            setExistingImages(mappedImages);
            setDeleteImageIds([]);

            const pdfRes = await pdfDocumentService.getAllPdfs();
            if (pdfRes?.result) {
                const hotelPolicy = pdfRes.result.find(doc =>
                    doc.title.includes("Điều khoản hợp tác với Khách sạn")
                );
                setPolicyUrl(hotelPolicy?.fileUrl || "");
            }
        } catch (error) {
            toast.error("Lỗi tải dữ liệu");
        } finally { setLoading(false); }
    };

    useEffect(() => {
        document.body.style.overflow = showPdfModal ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [showPdfModal]);

    const handleSave = async () => {
        if (!canEdit) {
            toast.current.addMessage({ mode: 'error', message: "Bạn không có quyền chỉnh sửa hồ sơ này!" });
            return;
        }
        if (!validateForm()) {
            toast.error("Vui lòng kiểm tra lại các trường thông tin!");
            return;
        }
        setSaving(true);
        try {
            const updateRequest = {
                ...formData,
                deleteImageIds: deleteImageIds
            };
            const response = await partnerService.updateHotelProfile(updateRequest, newImages);

            if (response.code === 1000) {
                await fetchDetail();
                setShowSuccessBanner(true);
                setNewImages([]);
                toast.current?.addMessage({ mode: 'success', message: "Cập nhật thành công!" });
                setTimeout(() => setShowSuccessBanner(false), 5000);
            }
        } catch (error) {
            toast.error("Lỗi cập nhật");
        } finally { setSaving(false); }
    };

    const handleUpdateBank = async () => {
        if (!canEdit) {
            toast.current.addMessage({ mode: 'error', message: "Chỉ quản lý mới được cập nhật thông tin ngân hàng!" });
            return;
        }
        if (!validateBankForm()) {
            toast.current.addMessage({ mode: 'warning', message: "Thông tin ngân hàng không hợp lệ!" });
            return;
        }
        setBankLoading(true);
        try {
            const response = await partnerService.updateHotelBankInfo(originalData.hotelId, bankData);
            if (response.code === 1000) {
                toast.current.addMessage({ mode: 'success', message: "Cập nhật ngân hàng thành công!" });
            }
        } catch (error) {
            toast.current.addMessage({ mode: 'error', message: "Lỗi cập nhật ngân hàng" });
        } finally { setBankLoading(false); }
    };

    // Helper functions (toggleAmenity, addCustomAmenity, handleDeleteExisting giữ nguyên logic của bạn)
    const toggleAmenity = (name) => {
        setFormData(prev => ({
            ...prev,
            amenitiesList: prev.amenitiesList.includes(name)
                ? prev.amenitiesList.filter(a => a !== name)
                : [...prev.amenitiesList, name]
        }));
    };

    const addCustomAmenity = () => {
        if (!customAmenity.trim()) return;
        if (!formData.amenitiesList.includes(customAmenity.trim())) {
            setFormData(prev => ({ ...prev, amenitiesList: [...prev.amenitiesList, customAmenity.trim()] }));
        }
        setCustomAmenity("");
    };

    const handleDeleteExisting = (imgId) => {
        setExistingImages(prev => prev.filter(img => img.id !== imgId));
        setDeleteImageIds(prev => [...prev, imgId]);
    };

    const formatCommValue = (value, type) => {
        const num = Number(value || 0).toLocaleString('vi-VN');
        return type === 'FIXED' ? `${num}đ` : `${num}%`;
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600" size={40}/></div>;

    return (
        <div className="bg-[#F8FAFC] min-h-screen p-6 md:p-10 font-sans text-slate-900">
            <div className="max-w-6xl mx-auto space-y-6">

                {showSuccessBanner && (
                    <div className="mb-6 bg-emerald-500 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-4">
                        <div className="flex items-center gap-3">
                            <Check className="bg-white/20 p-1 rounded-full" size={20} />
                            <p className="text-sm font-bold uppercase tracking-tight">Hồ sơ khách sạn đã được cập nhật!</p>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <Hotel size={32} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black uppercase tracking-tight text-slate-800">{formData.hotelName}</h1>
                            <p className="text-xs text-slate-400 font-bold flex items-center gap-1 mt-1">
                                <MapPin size={12}/> {formData.city}, {formData.country}
                            </p>
                        </div>
                    </div>
                    {canEdit && (
                    <button onClick={handleSave} disabled={saving} className="w-full md:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 transition-all active:scale-95">
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Cập nhật thông tin
                    </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Cột trái: Form */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                            <h3 className="text-blue-600 font-black uppercase text-[11px] tracking-[0.2em] mb-8 flex items-center gap-2">
                                <Info size={16}/> Thông tin chung</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField
                                    label="Tên khách sạn"
                                    value={formData.hotelName}
                                    onChange={v => setFormData({...formData, hotelName: v})}
                                    error={errors.hotelName}
                                    disabled={!canEdit}
                                />
                                <InputField
                                    label="Số điện thoại"
                                    value={formData.phone}
                                    onChange={v => setFormData({...formData, phone: v})}
                                    error={errors.phone}
                                    disabled={!canEdit}
                                />
                                <InputField
                                    label="Email"
                                    value={formData.email}
                                    onChange={v => setFormData({...formData, email: v})}
                                    error={errors.email}
                                    disabled={!canEdit}
                                />
                                <InputField
                                    label="Thành phố"
                                    value={formData.city}
                                    onChange={v => setFormData({...formData, city: v})}
                                    error={errors.city}
                                    disabled={!canEdit}
                                />
                                <div className="md:col-span-2">
                                    <InputField label="Địa chỉ chi tiết" value={formData.address}
                                                onChange={v => setFormData({...formData, address: v})}
                                                error={errors.address} disabled={!canEdit}/>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label
                                        className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">
                                        Mô tả khách sạn
                                    </label>
                                    <textarea
                                        disabled={!canEdit}
                                        className={`w-full h-32 p-4 border-2 rounded-2xl outline-none text-sm font-medium transition-all ${
                                            !canEdit ? 'bg-slate-100 border-slate-100 text-slate-400' : 'bg-slate-50 border-slate-100 focus:border-blue-600'
                                        }`}
                                        value={formData.description}
                                        onChange={e => setFormData({...formData, description: e.target.value})}
                                        placeholder="Nhập mô tả chi tiết về khách sạn của bạn..."
                                    />
                                    {errors.description && (
                                        <p className="text-[10px] text-rose-500 font-bold italic ml-2 tracking-tight">
                                            {errors.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                            <h3 className="text-blue-600 font-black uppercase text-[11px] tracking-[0.2em] mb-6">Tiện
                                ích</h3>
                            {canEdit && (
                                <div className="flex gap-2 mb-6">
                                    <input type="text" placeholder="Thêm tiện ích..."
                                           className="flex-1 px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-blue-600"
                                           value={customAmenity} onChange={(e) => setCustomAmenity(e.target.value)}
                                           onKeyPress={(e) => e.key === 'Enter' && addCustomAmenity()}/>
                                    <button onClick={addCustomAmenity}
                                            className="bg-blue-600 text-white px-5 rounded-xl hover:bg-blue-700 transition-all">
                                        <Plus size={20}/></button>
                                </div>
                            )}
                            <div className="flex flex-wrap gap-2">
                                {formData.amenitiesList.map(item => (
                                    <button key={item} onClick={() => canEdit && toggleAmenity(item)}
                                            className={`px-4 py-2 border-2 rounded-xl text-[11px] font-black uppercase flex items-center gap-2 ${
                                                !canEdit ? 'bg-slate-50 text-slate-400 border-slate-200' : 'bg-blue-50 text-blue-600 border-blue-100'
                                            }`}>
                                        {item} {canEdit && <X size={14}/>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-8">
                                <h3 className="text-blue-600 font-black uppercase text-[11px] tracking-[0.2em]">
                                    Thông tin tài khoản nhận tiền
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label
                                        className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ngân
                                        hàng</label>
                                    <input
                                        type="text"
                                        className={`w-full px-5 py-3.5 bg-slate-50 border-2 rounded-2xl text-sm font-bold outline-none transition-all ${
                                            bankErrors.bankName ? 'border-rose-500' : 'border-slate-100 focus:border-blue-600'
                                        }`}
                                        value={bankData.bankName}
                                        onChange={e => setBankData({...bankData, bankName: e.target.value})}
                                        placeholder="VD: VIETCOMBANK"
                                        disabled={!canEdit}
                                    />
                                    {bankErrors.bankName && <p className="text-[9px] text-rose-500 font-bold ml-2">{bankErrors.bankName}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label
                                        className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Số
                                        tài khoản</label>
                                    <input
                                        type="text"
                                        className={`w-full px-5 py-3.5 bg-slate-50 border-2 rounded-2xl text-sm font-bold outline-none transition-all ${
                                            bankErrors.bankAccountNumber ? 'border-rose-500' : 'border-slate-100 focus:border-blue-600'
                                        }`}
                                        value={bankData.bankAccountNumber}
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, "");
                                            setBankData({...bankData, bankAccountNumber: val});
                                        }}
                                        placeholder="123XXXXXXXXX"
                                        disabled={!canEdit}
                                    />
                                    {bankErrors.bankAccountNumber && <p className="text-[9px] text-rose-500 font-bold ml-2">{bankErrors.bankAccountNumber}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label
                                        className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chủ
                                        tài khoản</label>
                                    <input
                                        type="text"
                                        className={`w-full px-5 py-3.5 bg-slate-50 border-2 rounded-2xl text-sm font-bold outline-none transition-all ${
                                            bankErrors.bankAccountHolder ? 'border-rose-500' : 'border-slate-100 focus:border-blue-600'
                                        }`}
                                        value={bankData.bankAccountHolder}
                                        onChange={e => {
                                            const val = e.target.value
                                                .toUpperCase()
                                                .normalize("NFD")
                                                .replace(/[\u0300-\u036f]/g, "")
                                                .replace(/[^A-Z\s]/g, "");
                                            setBankData({...bankData, bankAccountHolder: val});
                                        }}
                                        placeholder="NGUYEN VAN A"
                                        disabled={!canEdit}
                                    />
                                    {bankErrors.bankAccountHolder && <p className="text-[9px] text-rose-500 font-bold ml-2">{bankErrors.bankAccountHolder}</p>}
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end border-t border-slate-100 pt-6">
                                {canEdit && (
                                <button
                                    onClick={handleUpdateBank}
                                    disabled={bankLoading}
                                    className="w-full md:w-auto bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                                >
                                    {bankLoading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                                    Lưu tài khoản ngân hàng
                                </button>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Cột phải: Ảnh & KYC */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Hình ảnh */}
                        <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-black text-[11px] uppercase tracking-widest text-slate-800">Album
                                    ảnh ({existingImages.length})</h3>
                                {canEdit && (
                                    <label
                                        className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center cursor-pointer hover:bg-blue-600 hover:text-white transition-all">
                                        <input type="file" multiple className="hidden"
                                               onChange={(e) => setNewImages([...newImages, ...Array.from(e.target.files)])}/>
                                        <Upload size={18}/>
                                    </label>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {existingImages.map(img => (
                                    <div key={img.id}
                                         className={`relative aspect-square rounded-2xl overflow-hidden border-2 group ${formData.coverImageId === img.id ? 'border-blue-600' : 'border-slate-100'}`}>
                                        <img src={img.url} className="w-full h-full object-cover"/>
                                        <div
                                            className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                            <button onClick={() => setFormData({...formData, coverImageId: img.id})}
                                                    className="text-[9px] bg-blue-600 text-white px-2 py-1 rounded font-black uppercase">Ảnh
                                                bìa
                                            </button>
                                            <button onClick={() => handleDeleteExisting(img.id)}
                                                    className="bg-rose-500 text-white p-1.5 rounded-lg hover:scale-110 transition-transform">
                                                <X size={14}/></button>
                                        </div>
                                        {formData.coverImageId === img.id && <div
                                            className="absolute top-2 left-2 bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded">BÌA</div>}
                                    </div>
                                ))}
                                {newImages.map((file, idx) => (
                                    <div key={idx}
                                         className="relative aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-blue-400">
                                        <img src={URL.createObjectURL(file)}
                                             className="w-full h-full object-cover opacity-60"/>
                                        <button onClick={() => setNewImages(newImages.filter((_, i) => i !== idx))}
                                                className="absolute top-1 right-1 bg-slate-900 text-white rounded-full p-0.5">
                                            <X size={10}/></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CARD THÔNG TIN HOA HỒNG */}
                        <section
                            className="rounded-[28px] p-6 text-white shadow-lg relative overflow-hidden transition-all duration-500 bg-[#0F172A] border border-white/5"
                        >
                            <div className="absolute -right-2 -top-2 opacity-5">
                                <ShieldCheck size={120}/>
                            </div>

                            <div className="relative z-10 flex flex-col gap-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-2">
                                            Hoa hồng hiện tại
                                        </p>
                                        <div className="flex items-baseline gap-1">
                                            <h2 className="text-5xl font-black tracking-tighter">
                                                {originalData?.commissionValue || "0"}
                                                <span className="text-xl not-italic ml-1 opacity-50">
                                                    {originalData?.rateType === 'PERCENT' ? '%' : 'VNĐ'}
                                                </span>
                                            </h2>
                                        </div>
                                    </div>

                                    <button
                                        onClick={fetchCommissionHistory}
                                        disabled={loadingHistory}
                                        className="p-3 bg-white/5 hover:bg-blue-600 rounded-2xl transition-all border border-white/10 group active:scale-95"
                                    >
                                        {loadingHistory ? <Loader2 size={16} className="animate-spin"/> :
                                            <Info size={16}/>}
                                    </button>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Phân loại</span>
                                        <span
                                            className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider w-fit ${
                                                originalData?.commissionType === 'DEAL' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                    originalData?.commissionType === 'HOTEL' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                        'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                                            }`}>
                                            {originalData?.commissionType === 'DEAL' ? 'Ưu đãi (Deal)' :
                                                originalData?.commissionType === 'HOTEL' ? 'Riêng biệt' : 'Mặc định'}
                                        </span>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Cập
                                            nhật bởi</p>
                                        <p className="text-[11px] font-black text-white/80 uppercase mt-1">
                                            {originalData?.commissionUpdatedBy || "Hệ thống"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* PHẦN XÁC THỰC PHÁP LÝ */}
                        <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 text-slate-800/30"><ShieldCheck size={100}/>
                            </div>
                            <div className="flex justify-between items-center mb-6 relative z-10">
                                <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                    <CheckCircle2 size={16}/> Xác thực pháp lý
                                </h3>
                                {/* NÚT ĐIỀU HƯỚNG KYC */}
                                {canEdit && (
                                    <button
                                        onClick={handleGoToKYC}
                                        className="flex items-center gap-1.5 text-[9px] font-black text-white bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-all uppercase"
                                    >
                                        <Edit3 size={12}/> Sửa KYC
                                    </button>
                                )}
                            </div>
                            <div className="space-y-4 relative z-10">
                                <ReadOnlyItem label="Mã số thuế" value={originalData?.verification?.taxCode}/>
                                <ReadOnlyItem label="Số giấy phép KD"
                                              value={originalData?.verification?.businessLicenseNumber}/>
                                <ReadOnlyItem label="Người đại diện"
                                              value={originalData?.verification?.representativeName}/>
                            </div>
                        </div>

                        {/* PHẦN TÀI LIỆU HỢP ĐỒNG */}
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
                                    else toast.current.addMessage({
                                        mode: 'warning',
                                        message: "Tài liệu đang được cập nhật!"
                                    });
                                }}
                                className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-slate-200"
                            >
                                Xem chính sách
                            </button>
                        </div>

                    </div>
                </div>
            </div>
            <ToastPortal ref={toast} autoClose={true} autoCloseTime={3000}/>
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

            {/* MODAL LỊCH SỬ HOA HỒNG */}
            {showRankModal && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl flex flex-col max-h-[85vh] border border-slate-100 overflow-hidden">
                        <div className="px-8 pt-8 pb-5 flex justify-between items-start shrink-0">
                            <div className="flex flex-col gap-1">
                                <h3 className="text-[14px] font-black text-slate-900 uppercase tracking-[0.1em]">
                                    Lịch sử biến động hoa hồng
                                </h3>
                                <div className="w-8 h-1 bg-blue-600 rounded-full" />
                            </div>
                            <button
                                onClick={() => setShowRankModal(false)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-600 active:scale-90"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        {/* Danh sách cuộn */}
                        <div className="flex-1 overflow-y-auto px-8 custom-scrollbar pb-4">
                            {rankHistory && rankHistory.length > 0 ? (
                                <div className="relative border-l-2 border-slate-100 ml-2 pl-7 space-y-10 py-4">
                                    {rankHistory.map((item, index) => {
                                        const typeConfigs = {
                                            HOTEL: {
                                                label: 'Riêng biệt',
                                                style: 'text-blue-700 bg-blue-50 border-blue-100'
                                            },
                                            DEAL: {
                                                label: 'Ưu đãi (Deal)',
                                                style: 'text-emerald-700 bg-emerald-50 border-emerald-100'
                                            },
                                            DEFAULT: {
                                                label: 'Mặc định',
                                                style: 'text-slate-600 bg-slate-100 border-slate-200'
                                            }
                                        };
                                        const config = typeConfigs[item.newCommissionType] || typeConfigs.DEFAULT;
                                        return (
                                            <div key={item.id || index} className="relative animate-in slide-in-from-left-2 duration-300">
                                                {/* Dot tín hiệu */}
                                                <div className="absolute -left-[37px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm bg-blue-600" />

                                                <div className="flex flex-col gap-2">
                                                    <div className="flex justify-between items-center">
                                            <span className="text-[11px] font-black text-slate-900 tracking-tight">
                                                {new Date(item.changedAt).toLocaleString('vi-VN', {
                                                    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
                                                })}
                                            </span>
                                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider border ${config.style}`}>
                                                {config.label}
                                            </span>
                                                    </div>

                                                    <div className="flex items-center gap-3 py-1">
                                            <span className="text-[15px] font-bold text-slate-500">
                                               {formatCommValue(item.oldValue, item.oldRateType)}
                                            </span>
                                                        <ArrowRight size={14} className="text-slate-300" />
                                                        <span className="text-[20px] font-black text-blue-600 tracking-tighter">
                                                {formatCommValue(item.newValue, item.newRateType)}
                                            </span>
                                                    </div>

                                                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                                                        <p className="text-[12px] text-slate-600 leading-relaxed font-medium">
                                                            <span className="text-[10px] font-black text-slate-700 mr-1.5 opacity-70 uppercase">Ghi chú:</span>
                                                            {item.note || "Cập nhật hệ thống"}
                                                        </p>
                                                        <div className="flex justify-end border-t border-slate-200/50 mt-2 pt-1.5 text-[10px] font-bold text-slate-500 italic">
                                                            Bởi: <span className="uppercase ml-1 text-slate-800 not-italic">{item.changedBy}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-24 text-center">
                                    <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Không có dữ liệu lịch sử</p>
                                </div>
                            )}
                        </div>
                        <div className="p-8 pt-4 shrink-0 bg-white border-t border-slate-50">
                            <button
                                onClick={() => setShowRankModal(false)}
                                className="w-full py-4 bg-slate-900 text-white rounded-[20px] text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 hover:bg-blue-600 shadow-lg"
                            >
                                Đóng cửa sổ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Sub-components
const InputField = ({ label, value, onChange, error, disabled }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {label}
        </label>
        <input
            type="text"
            value={value}
            disabled={disabled}
            onChange={e => onChange(e.target.value)}
            className={`w-full px-5 py-3.5 bg-slate-50 border-2 rounded-2xl outline-none transition-all font-bold text-sm text-slate-700 ${
                error ? 'border-rose-500 focus:border-rose-600' : 'border-slate-100 focus:border-blue-600'
            }`}
        />
        {error && <p className="text-[10px] text-rose-500 font-bold italic ml-2 tracking-tight">{error}</p>}
    </div>
);

const ReadOnlyItem = ({ label, value }) => (
    <div>
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-bold text-slate-200">{value || "---"}</p>
    </div>
);

export default HotelProfileManager;