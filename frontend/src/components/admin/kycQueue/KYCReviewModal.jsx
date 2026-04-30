import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Check, Clock, Building2, User, Maximize2, Info, ZoomIn, ZoomOut, RotateCw, Minimize2, RefreshCcw } from "lucide-react";
import { kycService, KYC_STATUS } from '@/services/kyc.service.js';

const KYCReviewModal = ({ data, onClose, onRefresh }) => {
    const [submitting, setSubmitting] = useState(false);
    const [currentDocIndex, setCurrentDocIndex] = useState(0);
    // State cho chức năng Viewer
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Reset lại zoom/xoay khi đổi ảnh
    useEffect(() => {
        setZoom(1);
        setRotation(0);
    }, [currentDocIndex]);

    useEffect(() => {
        // Khi Modal mở: Khóa cuộn body
        document.body.style.overflow = 'hidden';
        // Khi Modal đóng (Cleanup function): Mở lại cuộn body
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    // Đảm bảo lấy đúng data từ API Response
    const actualData = data?.result || data;

    const allDocuments = actualData?.documents || [];
    const existingUrls = actualData?.existingDocuments || [];

    const displayDocs = [
        ...allDocuments,
        ...existingUrls.map((url, idx) => ({
            id: `old-${idx}`,
            fileUrl: url,
            documentType: "OLD_DOCUMENT",
            isOld: true // Thêm dòng này
        }))
    ];

    const currentDoc = displayDocs[currentDocIndex];

    // Hàm điều khiển
    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
    const handleRotate = () => setRotation(prev => prev + 90);
    const handleReset = () => { setZoom(1); setRotation(0); };
    const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

    const getPartnerLabel = (type) => {
        const t = type?.toUpperCase();
        if (t === 'HOTEL') return "KHÁCH SẠN";
        if (t === 'AGENCY') return "ĐẠI LÝ";
        return t || "N/A";
    };

    const getDocTypeLabel = (doc) => {
        // Lấy string type từ object doc, nếu không có thì mặc định là chuỗi rỗng
        const typeString = doc?.documentType || "";

        // Kiểm tra xem đây có phải ảnh cũ không (dựa trên flag hoặc tên file)
        const isOld = doc?.isOld || doc?.fileUrl?.includes('old_');

        let label = "";
        switch (typeString.toUpperCase()) {
            case 'BUSINESS_LICENSE':
                label = "GP KINH DOANH";
                break;
            case 'REPRESENTATIVE_CIC_FRONT':
                label = "CCCD MẶT TRƯỚC";
                break;
            case 'REPRESENTATIVE_CIC_BACK':
                label = "CCCD MẶT SAU";
                break;
            case 'OLD_DOCUMENT':
                label = "DỮ LIỆU CŨ";
                break;
            default:
                label = typeString ? typeString.replace(/_/g, ' ') : "TÀI LIỆU";
        }

        return isOld ? `[CŨ] ${label}` : label;
    };

    const handleAction = async (targetStatus) => {
        const vId = actualData?.id;
        if (!vId) {
            alert("Lỗi: Không tìm thấy ID hồ sơ!");
            return;
        }

        let reason = "";
        const normalizedStatus = targetStatus.toUpperCase();
        const isVerified = normalizedStatus === "VERIFIED";

        // Nếu không phải phê duyệt, bắt buộc nhập lý do
        if (!isVerified) {
            const statusLabel = targetStatus === KYC_STATUS.REJECTED ? "TỪ CHỐI" : "YÊU CẦU BỔ SUNG";
            reason = prompt(`Nhập lý do cho trạng thái [${statusLabel}]:`);

            if (reason === null) return; // Người dùng nhấn Cancel prompt
            if (!reason.trim()) {
                alert("BẮT BUỘC: Bạn phải nhập lý do khi từ chối hoặc yêu cầu bổ sung!");
                return;
            }
        }

        setSubmitting(true);
        try {
            // Xác định đây là hồ sơ mới hay hồ sơ cập nhật (Update Flow)
            const isUpdateFlow = !!(actualData.agencyId || actualData.hotelId);

            const payload = {
                verificationId: Number(vId),
                status: targetStatus,
                rejectionReason: isVerified ? "" : reason,
                verificationBefore: isUpdateFlow
            };

            await kycService.approveVerification(payload);
            alert("Xử lý hồ sơ thành công!");
            onRefresh();
            onClose();
        } catch (error) {
            console.error("Approve Error:", error);
            alert("Lỗi hệ thống: " + (error.response?.data?.message || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    if (!actualData) return null;

    return (
        <div className={`fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-[1000] font-sans ${isFullscreen ? 'p-0' : 'p-4'}`}>
            <div className={`bg-white w-full flex flex-col shadow-2xl overflow-hidden transition-all duration-300 ${isFullscreen ? 'h-screen max-w-none' : 'max-w-7xl max-h-[95vh] rounded-3xl border border-slate-200'}`}>

                {/* --- Header --- */}
                {!isFullscreen && (
                    <div className="px-8 py-5 border-b flex justify-between items-center bg-white shrink-0">
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic">
                                    Xét duyệt hồ sơ <span className="text-blue-600">Version {actualData.version}</span>
                                </h2>
                                {(actualData.agencyId || actualData.hotelId) && (
                                    <span
                                        className="px-3 py-1 bg-amber-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-sm">
                                    Hồ sơ cập nhật
                                </span>
                                )}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 font-bold uppercase tracking-widest">
                                {actualData.legalName} • MST: {actualData.taxCode}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-800"
                        >
                            <X size={24}/>
                        </button>
                    </div>
                )}

                {/* --- Main Content --- */}
                    <div className="flex-1 overflow-hidden flex">

                {/* Cột trái: Chi tiết dữ liệu */}
                {!isFullscreen && (
                    <div className="w-[35%] overflow-y-auto p-8 border-r space-y-10 bg-white">
                        <section>
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Building2 size={18}/></div>
                                <h4 className="text-[13px] font-black text-slate-800 uppercase tracking-widest">Dữ liệu
                                    pháp nhân</h4>
                            </div>
                            <div className="grid grid-cols-1 gap-5">
                                <InfoBox label="TÊN DOANH NGHIỆP" value={actualData.legalName}/>
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoBox label="MÃ SỐ THUẾ" value={actualData.taxCode}/>
                                    <InfoBox label="SỐ GIẤY PHÉP KD" value={actualData.businessLicenseNumber}/>
                                </div>
                                <InfoBox label="LOẠI ĐỐI TÁC" value={getPartnerLabel(actualData.partnerType)}/>
                                <InfoBox label="ĐỊA CHỈ TRỤ SỞ" value={actualData.businessAddress} isTextArea/>
                            </div>
                        </section>

                        <section className="pt-6 border-t border-slate-100">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><User size={18}/></div>
                                <h4 className="text-[13px] font-black text-slate-800 uppercase tracking-widest">Người
                                    đại diện</h4>
                            </div>
                            <div className="grid grid-cols-1 gap-5">
                                <InfoBox label="HỌ VÀ TÊN" value={actualData.representativeName}/>
                                <InfoBox label="SỐ CMND / CCCD" value={actualData.representativeCICNumber}/>
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoBox label="NGÀY CẤP" value={actualData.representativeCICDate}/>
                                    <InfoBox label="NƠI CẤP" value={actualData.representativeCICPlace}/>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* Cột phải: TRÌNH XEM ẢNH */}
                    <div className="flex-1 bg-slate-100 p-4 md:p-8 flex flex-col overflow-hidden relative">

                {/* Tabs chọn ảnh */}
                {!isFullscreen && (
                    <div className="flex gap-3 mb-6 overflow-x-auto pb-2 shrink-0 no-scrollbar">
                        {displayDocs.map((doc, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentDocIndex(idx)}
                                className={`px-5 py-2.5 bg-white border-2 rounded-xl text-[10px] font-black transition-all whitespace-nowrap shadow-sm ${currentDocIndex === idx ? 'border-blue-600 text-blue-600 ring-2 ring-blue-50' : 'border-transparent text-slate-400 hover:border-slate-200'}`}
                            >
                                {getDocTypeLabel(doc)}
                            </button>
                        ))}
                    </div>
                )}

                {/* VÙNG HIỂN THỊ ẢNH CHÍNH */}
                <div
                    className={`flex-1 bg-[#1a1c1e] rounded-[2rem] flex items-center justify-center overflow-hidden shadow-2xl relative border-4 border-white ${isFullscreen ? 'rounded-none border-0' : ''}`}>

                    {/* THANH CÔNG CỤ NỔI (Floating Toolbar) */}
                    <div
                        className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-2 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
                        <ToolbarButton onClick={handleZoomOut} icon={<ZoomOut size={18}/>} label="Thu nhỏ"/>
                        <div className="w-12 text-center text-white text-[10px] font-black">{Math.round(zoom * 100)}%
                        </div>
                        <ToolbarButton onClick={handleZoomIn} icon={<ZoomIn size={18}/>} label="Phóng to"/>
                        <div className="w-[1px] h-4 bg-white/20 mx-1"/>
                        <ToolbarButton onClick={handleRotate} icon={<RotateCw size={18}/>} label="Xoay"/>
                        <ToolbarButton onClick={handleReset} icon={<RefreshCcw size={18}/>} label="Làm mới"/>
                        <div className="w-[1px] h-4 bg-white/20 mx-1"/>
                        <ToolbarButton
                            onClick={toggleFullscreen}
                            icon={isFullscreen ? <Minimize2 size={18}/> : <Maximize2 size={18}/>}
                            label={isFullscreen ? "Thoát" : "Toàn màn hình"}
                        />
                    </div>

                    {currentDoc ? (
                        <div
                            className="w-full h-full flex items-center justify-center transition-all duration-300 ease-out cursor-grab active:cursor-grabbing"
                            onWheel={(e) => {
                                // Chặn hành vi cuộn của trình duyệt
                                if (e.cancelable) e.preventDefault();
                                if (e.deltaY < 0) handleZoomIn();
                                else handleZoomOut();
                            }}
                            style={{
                                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                            }}
                        >
                            <img
                                src={currentDoc.fileUrl}
                                alt="kyc-document"
                                className="max-w-full max-h-full object-contain shadow-2xl"
                                draggable="false"
                            />
                        </div>
                    ) : (
                        <div className="text-slate-500 flex flex-col items-center gap-4">
                            <AlertTriangle size={64}/>
                            <p className="font-black uppercase tracking-tighter">Thiếu dữ liệu hình ảnh</p>
                        </div>
                    )}

                    {/* Nút thoát nhanh Fullscreen ở góc */}
                    {isFullscreen && (
                        <button
                            onClick={toggleFullscreen}
                            className="absolute top-6 right-6 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all"
                        >
                            <X size={24}/>
                        </button>
                    )}
                </div>
            </div>
        </div>

    {/* --- Footer Logic  --- */
    }
    {
        !isFullscreen && (
            <div className="border-t bg-white shrink-0">
            {actualData?.status === KYC_STATUS.PENDING ? (
                <div className="p-6 border-t bg-white flex justify-between items-center shrink-0 px-8">
                    <div className="flex items-center gap-3 text-slate-400">
                    <div className="p-2 bg-slate-100 rounded-full"><Clock size={16} /></div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Thẩm định viên</span>
                                <span className="text-[11px] font-medium italic">Vui lòng đối soát kỹ thông tin</span>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button disabled={submitting} onClick={() => handleAction(KYC_STATUS.NEED_MORE_INFORMATION)} className="px-6 py-3 bg-white border-2 border-amber-500 text-amber-600 hover:bg-amber-50 rounded-2xl text-[11px] font-black uppercase transition-all">
                                Yêu cầu bổ sung
                            </button>
                            <button disabled={submitting} onClick={() => handleAction(KYC_STATUS.REJECTED)} className="px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl text-[11px] font-black uppercase transition-all">
                                Từ chối hồ sơ
                            </button>
                            <button disabled={submitting} onClick={() => handleAction(KYC_STATUS.VERIFIED)} className="px-12 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-2xl text-[11px] font-black uppercase transition-all shadow-xl">
                                {submitting ? "Đang xử lý..." : <div className="flex items-center gap-2"><Check size={18} /> Phê duyệt</div>}
                            </button>
                        </div>
                    </div>
                ) : (
                // Giao diện khi hồ sơ đã có kết quả
                <div className="p-6 bg-slate-50 border-t flex flex-col gap-4 px-10">
                    <div className="flex items-center gap-6">
                        {/* Phần bên trái: Chứa Reason Box */}
                        <div className="flex-1 min-w-0">
                            {actualData?.status !== KYC_STATUS.VERIFIED && actualData?.rejectionReason ? (
                                <div className={`relative p-4 rounded-2xl border-2 transition-all ${
                                    actualData?.status === KYC_STATUS.REJECTED
                                        ? 'bg-red-50/50 border-red-100'
                                        : 'bg-amber-50/50 border-amber-100'
                                }`}>
                                    <h5 className={`text-[10px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-2 ${
                                        actualData?.status === KYC_STATUS.REJECTED ? 'text-red-600' : 'text-amber-600'
                                    }`}>
                                        Lý do từ chối / bổ sung:
                                    </h5>
                                    {/* Giới hạn chiều cao và cho phép cuộn nếu lý do quá dài */}
                                    <div className="max-h-24 overflow-y-auto pr-2 custom-scrollbar">
                                        <p className="text-[13px] text-slate-700 font-bold italic leading-relaxed">
                                            "{actualData.rejectionReason}"
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-green-600 py-2">
                                    <div className="bg-green-100 p-1.5 rounded-full">
                                        <Check size={16} strokeWidth={4}/>
                                    </div>
                                    <span className="text-[11px] font-black uppercase tracking-widest">Hồ sơ này đã được phê duyệt thành công</span>
                                </div>
                            )}
                        </div>
                        {/* Phần bên phải: Nút Đóng */}
                        <div className="shrink-0">
                            <button
                                onClick={onClose}
                                className="px-10 py-3.5 bg-slate-800 text-white rounded-2xl text-[11px] font-black uppercase hover:bg-black transition-all shadow-lg active:scale-95"
                            >
                                Đóng cửa sổ
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        )}
            </div>
        </div>
    );
};

// Component hiển thị thông tin con
const InfoBox = ({label, value, isTextArea}) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-500 block ml-1 uppercase tracking-widest">{label}</label>
        <div
            className={`w-full px-4 py-3 border-2 border-slate-50 rounded-2xl bg-slate-50/50 text-[12px] font-bold text-slate-700 shadow-sm transition-all hover:border-slate-100 ${isTextArea ? 'min-h-[60px] leading-relaxed' : ''}`}>
            {value || <span className="text-slate-300 italic font-normal">Chưa cập nhật</span>}
        </div>
    </div>
);

const ToolbarButton = ({onClick, icon, label}) => (
    <button
        type="button" // Thêm type để tránh submit form ngoài ý muốn
        onClick={onClick}
        title={label}
        className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all flex items-center justify-center group relative"
    >
        {icon}
        {/* Tooltip hiện tên khi hover */}
        <span
            className="absolute -bottom-10 scale-0 group-hover:scale-100 transition-all bg-slate-800 text-[10px] text-white px-2 py-1 rounded-md whitespace-nowrap z-50">
            {label}
        </span>
    </button>
);

export default KYCReviewModal;