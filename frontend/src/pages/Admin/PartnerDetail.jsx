import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
    ArrowLeft, Building2, CreditCard, FileCheck,
    History, Info, MapPin, Phone, Mail, User,
    Star, Globe, Loader2, CreditCard as CardIcon,
    HotelIcon, CheckCircle2, ShieldAlert, Wallet
} from "lucide-react";
import { partnerService } from "@/services/partner.service.js";
import HotelBookingHistory from "./HotelBookingHistory.jsx"
import { toast } from "react-hot-toast";

const PartnerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isAgency = location.pathname.includes("/agency/");

    const [activeTab, setActiveTab] = useState("overview");
    const [partner, setPartner] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isBanning, setIsBanning] = useState(false);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            let response;
            if (isAgency) {
                response = await partnerService.getAgencyPartnerDetail(id);
            } else {
                response = await partnerService.getHotelPartnerDetail(id);
            }
            setPartner(response.result);
        } catch (error) {
            console.error("Lỗi lấy chi tiết:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [id, isAgency]);
    // HÀM XỬ LÝ BAN PARTNER
    const handleBanPartner = async () => {
        // 1. Kiểm tra nếu đã bị khóa rồi
        if (partner?.status?.toUpperCase() === "SUSPENDED") {
            toast.error("Đối tác này đã bị khóa từ trước.");
            return;
        }
        const reason = window.prompt("Nhập lý do khóa đối tác này (Bắt buộc):");
        if (reason === null) return; // Người dùng nhấn Hủy
        if (reason.trim() === "") {
            alert("Bạn phải nhập lý do để thực hiện khóa!");
            return;
        }
        const confirmBan = window.confirm("Hành động này sẽ khóa toàn bộ tài khoản nhân viên của đối tác. Xác nhận?");
        if (!confirmBan) return;
        setIsBanning(true);
        try {
            const partnerType = isAgency ? "AGENCY" : "HOTEL";

            await partnerService.banPartner(partnerType, id, {
                reason: reason,
                evidence: "Thao tác trực tiếp từ trang quản trị"
            });

            toast.success("Đã khóa đối tác và lưu vào danh sách đen.");
            fetchDetail(); // Reload lại dữ liệu để cập nhật trạng thái UI
        } catch (error) {
            console.error("Lỗi khi Ban:", error);
            toast.error("Không thể khóa đối tác. Vui lòng kiểm tra lại hồ sơ xác minh.");
        } finally {
            setIsBanning(false);
        }
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
            <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Đang truy xuất dữ liệu...</p>
        </div>
    );

    if (!partner) return <div className="p-20 text-center font-bold text-slate-500">Không tìm thấy dữ liệu đối tác.</div>;
    const displayName = isAgency ? partner.agencyName : partner.hotelName;
    const amenities = isAgency ? [] : (partner.amenitiesList || []);
    const verif = partner.verification || {};
    const isSuspended = partner.status?.toUpperCase() === "SUSPENDED";

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return "0 VNĐ";
        return new Intl.NumberFormat('vi-VN').format(amount) + " VNĐ";
    };

    const getStatusStyle = (status) => {
        switch (status?.toUpperCase()) {
            case "ACTIVE": return "bg-emerald-50 text-emerald-600 border-emerald-100";
            case "SUSPENDED": return "bg-red-600 text-white border-red-700 shadow-sm";
            case "LOCK": return "bg-amber-50 text-amber-600 border-amber-100";
            default: return "bg-slate-100 text-slate-500 border-slate-200";
        }
    };

    const getCommissionLabel = (type) => {
        switch (type?.toUpperCase()) {
            case "DEFAULT": return "Mặc định hệ thống";
            case "DEAL": return "Chương trình khuyến mãi";
            case "HOTEL": return "Thỏa thuận riêng";
            default: return type;
        }
    };

    const creditLimit = partner.creditLimit || 0;
    const currentCredit = partner.currentCredit || 0;
    const creditUsed = creditLimit - currentCredit; // Số tiền đã tiêu
    const creditPercent = creditLimit > 0 ? (creditUsed / creditLimit) * 100 : 0;

    return (
        <div className="p-8 bg-[#F8FAFC] min-h-screen">
            <div className="max-w-[1200px] mx-auto space-y-8">
                {/* HEADER ACTIONS */}
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-3 font-black text-slate-500 hover:text-slate-900 transition-all group text-xs tracking-widest"
                    >
                        <div
                            className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-all">
                            <ArrowLeft size={18}/>
                        </div>
                        QUAY LẠI
                    </button>

                    <div className="flex gap-3">
                        {isSuspended ? (
                            <div
                                className="flex items-center gap-2 bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-black text-[10px] tracking-widest border border-red-200 uppercase">
                                <ShieldAlert size={14}/> Đối tác đã bị đình chỉ
                            </div>
                        ) : (
                            <button
                                onClick={handleBanPartner}
                                disabled={isBanning}
                                className="bg-red-50 text-red-600 px-8 py-3 rounded-2xl font-black text-[10px] tracking-widest border border-red-100 hover:bg-red-600 hover:text-white transition-all uppercase flex items-center gap-2"
                            >
                                {isBanning ? <Loader2 size={14} className="animate-spin"/> : "Khóa Đối Tác"}
                            </button>
                        )}
                    </div>
                </div>

                {/* PROFILE HEADER CARD */}
                <div
                    className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-200 relative overflow-hidden">
                    {/* Background Icon Watermark */}
                    <div className="absolute top-0 right-0 p-10 opacity-5 text-slate-900 rotate-12">
                        {isAgency ? <Building2 size={120}/> : <HotelIcon size={120}/>}
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                        <div
                            className={`w-28 h-28 rounded-[32px] flex items-center justify-center text-white text-4xl font-black shadow-2xl ${isSuspended ? 'bg-slate-400' : (isAgency ? 'bg-blue-600' : 'bg-indigo-600')}`}>
                            {displayName?.charAt(0)}
                        </div>
                        <div className="flex-1 space-y-4 text-center md:text-left">
                            <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
                                <h1 className={`text-3xl font-black leading-tight ${isSuspended ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                                    {displayName}
                                </h1>
                                <span
                                    className={`text-[10px] px-4 py-1.5 rounded-full font-black uppercase border tracking-widest ${getStatusStyle(partner.status)}`}>
                                    {partner.status || "N/A"}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-x-8 gap-y-2 justify-center md:justify-start">
                                <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                                    <MapPin size={16} className="text-blue-500"/> {[partner.address, partner.city].filter(Boolean).join(", ") || "Chưa cập nhật địa chỉ"}
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 font-bold text-sm italic">
                                    <Globe size={16}
                                           className="text-blue-500"/> {isAgency ? "Đại lý lữ hành" : "Khách sạn & Khu nghỉ dưỡng"}
                                </div>
                                {!isAgency && partner.starRating && (
                                    <div className="flex items-center gap-1 text-amber-500 font-black text-sm">
                                        <Star size={16} fill="currentColor"/> {partner.starRating} Sao
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABS SELECTION */}
                <div className="flex gap-2 bg-white p-2 rounded-[28px] shadow-sm border border-slate-200 w-fit">
                    {[
                        {id: "overview", label: "TỔNG QUAN", icon: Info},
                        {id: "legal", label: "HỒ SƠ PHÁP LÝ", icon: FileCheck},
                        ...(isAgency ? [{id: "finance", label: "HẠN MỨC TÍN DỤNG", icon: CreditCard}] : []),
                        ...(!isAgency ? [{id: "booking_history", label: "LỊCH SỬ ĐẶT PHÒNG", icon: History}] : [])
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-8 py-4 rounded-[20px] font-black text-[10px] uppercase tracking-widest transition-all ${
                                activeTab === tab.id ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
                            }`}
                        >
                            <tab.icon size={14}/>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* CONTENT AREA */}
                <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-200 min-h-[400px]">
                    {activeTab === "booking_history" && !isAgency && (
                        <HotelBookingHistory hotelId={id} />
                    )}
                    {activeTab === "overview" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <section className="space-y-6">
                                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Thông
                                    tin liên hệ</h4>
                                <div className="space-y-4">
                                    <InfoItem icon={<User/>} label="Người đại diện" value={verif.representativeName}/>
                                    {isAgency ? (
                                        <>
                                            <InfoItem icon={<Phone/>} label="Số điện thoại liên hệ"
                                                      value={partner.contactPhone}/>
                                            <InfoItem icon={<Phone className="text-red-500"/>} label="Hotline Agency"
                                                      value={partner.hotline}/>
                                        </>
                                    ) : (
                                        <InfoItem icon={<Phone/>} label="Số điện thoại khách sạn"
                                                  value={partner.phone}/>
                                    )}
                                    <InfoItem icon={<Mail/>} label="Email đối tác" value={partner.email}/>
                                </div>

                                {/* --- PHẦN HOA HỒNG MỚI (CHỈ HIỂN THỊ NẾU LÀ HOTEL) --- */}
                                {!isAgency && partner.commissionValue !== undefined && (
                                    <div className="pt-2 space-y-4">
                                        <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">
                                            Chính sách hoa hồng
                                        </h4>
                                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                                            {/* Header  */}
                                            <div className="p-5 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-600 rounded-xl text-white shadow-sm shadow-blue-200">
                                                        <Wallet size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">Mức hoa hồng</p>
                                                        <p className="text-lg font-black text-slate-800 leading-none">
                                                            {partner.commissionValue?.toLocaleString('vi-VN')}
                                                            <span className="text-black-600 ml-0.5">
                                                                {partner.rateType === 'PERCENT' ? '%' : 'đ'}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[9px] font-black uppercase tracking-wider border border-blue-100">
                                                    {getCommissionLabel(partner.commissionType)}
                                                </span>
                                            </div>
                                            {/* Footer của Card: Thông tin người cập nhật */}
                                            <div className="grid grid-cols-2 divide-x divide-slate-50">
                                                <div className="p-4 flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                                        <User size={14} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[8px] font-black text-slate-600 uppercase leading-none mb-1">Cập nhật bởi</p>
                                                        <p className="text-[11px] font-bold text-slate-700 truncate">{partner.commissionUpdatedBy || "System"}</p>
                                                    </div>
                                                </div>
                                                <div className="p-4 flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                                        <History size={14} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[8px] font-black text-slate-600 uppercase leading-none mb-1">Thời gian</p>
                                                        <p className="text-[11px] font-bold text-slate-700">
                                                            {partner.commissionUpdatedAt ? new Date(partner.commissionUpdatedAt).toLocaleDateString('vi-VN') : "---"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {!isAgency && amenities.length > 0 && (
                                    <div className="pt-4">
                                        <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Tiện
                                            ích hệ thống</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {amenities.map((item, idx) => (
                                                <span key={idx}
                                                      className="bg-emerald-50 px-3 py-1.5 rounded-xl text-[10px] font-black text-emerald-700 border border-emerald-100 flex items-center gap-1">
                                                    <CheckCircle2 size={10}/> {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </section>

                            <section className="space-y-6">
                                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Mô tả &
                                    Vị trí</h4>
                                <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                                    <p className="text-sm text-slate-600 leading-relaxed italic mb-6">
                                        {partner.description || "Chưa có mô tả."}
                                    </p>
                                    <div className="flex items-start gap-3">
                                        <MapPin className="text-blue-500 mt-1" size={18}/>
                                        <div className="flex flex-col">
                                            {/* Dòng 1: Địa chỉ chi tiết */}
                                            {partner.address && (
                                                <p className="font-black text-slate-700 text-sm leading-tight">
                                                    {partner.address}
                                                </p>
                                            )}

                                            {/* Dòng 2: Thành phố và Quốc gia */}
                                            {(partner.city || partner.country) && (
                                                <p className="font-bold text-slate-500 text-[13px] mt-0.5">
                                                    {[partner.city, partner.country].filter(Boolean).join(", ")}
                                                </p>
                                            )}

                                            {/* Trường hợp trắng hoàn toàn (tùy chọn) */}
                                            {!partner.address && !partner.city && !partner.country && (
                                                <p className="font-medium text-slate-400 text-sm italic">
                                                    Chưa cập nhật địa chỉ
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === "legal" && (
                        <div className="max-w-3xl space-y-8">
                            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Thông tin
                                pháp lý được xác minh</h4>
                            <div
                                className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 p-10 bg-slate-50 rounded-[40px] border border-slate-100">
                                <LegalRow label="Tên pháp nhân" value={verif.legalName} bold/>
                                <LegalRow label="Mã số thuế" value={verif.taxCode}/>
                                <LegalRow label="Số giấy phép KD" value={verif.businessLicenseNumber}/>
                                <LegalRow label="Đại diện pháp luật" value={verif.representativeName}/>
                                <LegalRow label="Số CCCD/Định danh" value={verif.representativeCICNumber}/>
                            </div>
                        </div>
                    )}

                    {/* tab Finance */}
                    {activeTab === "finance" && isAgency && (
                        <div className="space-y-10 animate-in fade-in duration-500">
                            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">
                                Quản lý tài chính
                            </h4>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Thẻ Ví tiền */}
                                <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[32px] space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="p-3 bg-white rounded-2xl text-emerald-600 shadow-sm">
                                            <Wallet size={20}/>
                                        </div>
                                        <span
                                            className="text-[10px] font-black text-emerald-700 bg-white px-3 py-1 rounded-full border border-emerald-100">VÍ TRẢ TRƯỚC</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-emerald-800/60 uppercase tracking-widest">Số
                                            dư ví hiện tại</p>
                                        <h2 className="text-2xl font-black text-emerald-700 mt-1">
                                            {formatCurrency(partner.walletBalance)}
                                        </h2>
                                    </div>
                                </div>

                                {/* Thẻ Hạng Rank */}
                                <div className="bg-amber-50 border border-amber-100 p-8 rounded-[32px] space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="p-3 bg-white rounded-2xl text-amber-600 shadow-sm">
                                            <Star size={20}/>
                                        </div>
                                        <span
                                            className="text-[10px] font-black text-amber-700 bg-white px-3 py-1 rounded-full border border-amber-100">HẠNG ĐẠI LÝ</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-amber-800/60 uppercase tracking-widest">Cấp
                                            bậc hiện tại</p>
                                        <h2 className="text-2xl font-black text-amber-700 mt-1 uppercase italic">
                                            {partner.rankName || "BASIC"}
                                        </h2>
                                    </div>
                                </div>

                                {/* Thẻ Tổng Tín Dụng */}
                                <div
                                    className="bg-blue-600 p-8 rounded-[32px] space-y-4 shadow-xl shadow-blue-100 relative overflow-hidden">
                                    <div className="absolute -right-4 -bottom-4 opacity-10 text-white rotate-12">
                                        <CardIcon size={120}/>
                                    </div>
                                    <div className="flex justify-between items-center relative z-10">
                                        <div className="p-3 bg-white/20 rounded-2xl text-white backdrop-blur-md">
                                            <CreditCard size={20}/>
                                        </div>
                                        <span
                                            className="text-[10px] font-black text-white bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">TỔNG HẠN MỨC</span>
                                    </div>
                                    <div className="relative z-10">
                                        <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest">Hạn
                                            mức được cấp</p>
                                        <h2 className="text-2xl font-black text-white mt-1">
                                            {formatCurrency(partner.creditLimit)}
                                        </h2>
                                    </div>
                                </div>
                            </div>

                            {/* Chi tiết sử dụng tín dụng */}
                            <div className="bg-slate-50 border border-slate-100 rounded-[40px] p-10 space-y-8">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Tình
                                            trạng sử dụng nợ</p>
                                        <h3 className="text-xl font-black text-slate-800 uppercase">Phân tích nợ tín
                                            dụng</h3>
                                    </div>
                                    <div className="text-right">
                                        <span
                                            className="text-2xl font-black text-blue-600">{creditPercent.toFixed(1)}%</span>
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Đã sử dụng</p>
                                    </div>
                                </div>

                                {/* Thanh Progress */}
                                <div className="h-4 w-full bg-slate-200 rounded-full overflow-hidden flex">
                                    <div
                                        className="h-full bg-blue-600 transition-all duration-1000"
                                        style={{width: `${creditPercent}%`}}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                    <div
                                        className="flex items-center gap-4 p-6 bg-white rounded-[24px] border border-slate-100">
                                        <div className="w-2 h-10 bg-blue-600 rounded-full"/>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase">Dư nợ đã sử
                                                dụng</p>
                                            <p className="text-lg font-black text-slate-800">{formatCurrency(creditLimit - currentCredit)}</p>
                                        </div>
                                    </div>
                                    <div
                                        className="flex items-center gap-4 p-6 bg-white rounded-[24px] border border-slate-100">
                                        <div className="w-2 h-10 bg-emerald-500 rounded-full"/>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase">Khả dụng còn
                                                lại</p>
                                            <p className="text-lg font-black text-slate-800">{formatCurrency(partner.currentCredit)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Sub-components giữ nguyên
const LegalRow = ({label, value, bold = false}) => (
    <div className="space-y-1">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
        <p className={`${bold ? 'font-black text-slate-900 text-base' : 'font-bold text-slate-700 text-sm'} uppercase`}>
            {value || "---"}
        </p>
    </div>
);

const InfoItem = ({icon, label, value}) => (
    <div
        className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 transition-all">
        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
            {React.cloneElement(icon, {size: 18})}
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{label}</p>
            <p className="font-black text-slate-700 text-sm">{value || "---"}</p>
        </div>
    </div>
);

export default PartnerDetail;