import React, { useState, useEffect } from "react";
import {
    CheckCircle2,
    Eye,
    Clock,
    AlertCircle,
    FileText,
    ShieldCheck,
    ArrowRight,
    RefreshCw,
    Info,
    Image as ImageIcon,
    LogIn, ChevronLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { kycService } from "@/services/kyc.service.js";
import { jwtDecode } from "jwt-decode";

const VerificationStatusPage = () => {
    const navigate = useNavigate();
    // Hàm xử lý quay lại
    const handleGoBack = () => {
        try {
            const token = localStorage.getItem("accessToken");
            const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

            const isApproved = !!(storedUser.agencyId || storedUser.hotelId);

            if (!isApproved) {
                console.warn("Tài khoản chưa có agencyId/hotelId. Điều hướng về trang chủ.");
                navigate("/");
                return;
            }

            let isAgency = false;
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    const roles = decoded.roles || decoded.authorities || [];
                    const rolesStr = JSON.stringify(roles).toUpperCase();

                    if (rolesStr.includes("AGENCY") || decoded.agencyId) {
                        isAgency = true;
                    }
                } catch (e) {
                    console.error("Token decode error:", e);
                }
            }
            if (!isAgency) {
                const hasAgencyId = !!storedUser.agencyId;
                const isAgencyByType = storedUser.partnerType === "AGENCY";
                let isAgencyByRole = false;
                if (storedUser.roles) {
                    if (Array.isArray(storedUser.roles)) {
                        isAgencyByRole = storedUser.roles.some(r =>
                            (typeof r === 'string' ? r : r.name).toUpperCase().includes("AGENCY")
                        );
                    } else if (typeof storedUser.roles === 'string') {
                        isAgencyByRole = storedUser.roles.toUpperCase().includes("AGENCY");
                    }
                }
                isAgency = hasAgencyId || isAgencyByType || isAgencyByRole;
            }
            // 3. Thực hiện điều hướng
            const dashboardPath = isAgency ? "/agency/agency-dashboard" : "/hotel/dashboard";
            navigate(dashboardPath);
        } catch (error) {
            console.error("Lỗi điều hướng:", error);
            navigate("/");
        }
    };
    const [kycList, setKycList] = useState([]);
    const [kycDetail, setKycDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    useEffect(() => { fetchStatus(); }, []);

    const fetchStatus = async () => {
        setLoading(true);
        try {
            const res = await kycService.getVerificationsByUserId();
            const list = res?.result || [];
            const sortedList = [...list].sort((a, b) => b.id - a.id);
            setKycList(sortedList);

            if (sortedList.length > 0) {
                const latestKyc = sortedList[0];
                handleViewDetail(latestKyc.id);

                const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

                // 1. Tìm trong danh sách xem ĐÃ TỪNG có bản ghi nào VERIFIED chưa
                const verifiedRecord = sortedList.find(item => item.status === "VERIFIED");

                if (verifiedRecord) {
                    // NẾU ĐÃ TỪNG ĐƯỢC DUYỆT: Giữ nguyên ID (Lấy ID từ bản verified đó)
                    const updatedUser = {
                        ...storedUser,
                        agencyId: verifiedRecord.agencyId,
                        hotelId: verifiedRecord.hotelId,
                        kycStatus: latestKyc.status // Vẫn hiển thị status mới nhất (VD: PENDING)
                    };
                    localStorage.setItem("user", JSON.stringify(updatedUser));
                } else {
                    // NẾU CHƯA TỪNG ĐƯỢC DUYỆT (Tất cả đều PENDING hoặc REJECTED)
                    localStorage.setItem("user", JSON.stringify({
                        ...storedUser,
                        agencyId: null,
                        hotelId: null,
                        kycStatus: latestKyc.status
                    }));
                }
            }
        } catch (error) {
            console.error("Lỗi KYC:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = async (id) => {
        try {
            const detailRes = await kycService.getVerificationDetail(id);
            setKycDetail(detailRes?.result || detailRes);
        } catch (error) {
            console.error("Lỗi lấy chi tiết:", error);
        }
    };

    const handleUpdate = () => {
        if (kycDetail.id !== kycList[0].id) return;

        navigate("/kyc-intro", {
            state: {
                oldKycId: kycDetail.id,
                isUpdate: true
            }
        });
    };

    if (loading) return <LoadingState />;
    if (kycList.length === 0) return <EmptyState onStart={() => navigate("/kyc-intro")} />;

    const theme = getStatusTheme(kycDetail?.status);

    // ĐIỀU KIỆN: Chỉ bản ghi mới nhất VÀ có trạng thái cho phép mới được hiện nút Cập nhật
    const isLatest = kycDetail?.id === kycList[0]?.id;
    const statusAllowsUpdate = ["VERIFIED", "NEED_MORE_INFORMATION"].includes(kycDetail?.status?.toUpperCase());
    const canUpdate = isLatest && statusAllowsUpdate;

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-10 font-sans text-slate-700 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <button
                        onClick={handleGoBack}
                        className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black text-[10px] tracking-[0.2em] transition-all mb-4"
                    >
                        <ChevronLeft size={16}/> QUAY LẠI
                    </button>
                </div>
            </div>
            {/* Header & Trạng thái hiện tại */}
            <div
                className={`mb-10 rounded-[2.5rem] border-2 ${theme.border} overflow-hidden shadow-2xl bg-white transition-all`}>
                <div className={`p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 ${theme.bg}`}>
                    <div className="p-5 bg-white rounded-3xl shadow-sm">{theme.icon}</div>
                    <div className="flex-1 text-center md:text-left">
                        <div
                            className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase mb-3 tracking-widest ${theme.badgeBg} ${theme.text}`}>
                            {theme.label}
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 uppercase italic leading-none mb-2">
                            {isLatest ? "Phiên bản hiện tại" : `Chi tiết hồ sơ - Version ${kycDetail?.version}`}
                        </h2>
                        <p className="text-slate-600 font-medium max-w-2xl">{theme.desc}</p>

                        {/* HIỂN THỊ LÝ DO TỪ CHỐI (Nếu có) */}
                        {["REJECTED", "NEED_MORE_INFORMATION"].includes(kycDetail?.status?.toUpperCase()) && kycDetail?.rejectionReason && (
                            <div className={`mt-4 p-4 border-l-4 rounded-r-xl animate-in slide-in-from-left shadow-sm ${
                                kycDetail.status.toUpperCase() === "REJECTED"
                                    ? "bg-red-50 border-red-500"
                                    : "bg-blue-50 border-blue-500"
                            }`}>
                                <p className={`text-[10px] font-black uppercase tracking-wider ${
                                    kycDetail.status.toUpperCase() === "REJECTED" ? "text-red-600" : "text-blue-600"
                                }`}>
                                    {kycDetail.status.toUpperCase() === "REJECTED" ? "Lý do từ hệ thống:" : "Ghi chú bổ sung từ kiểm duyệt viên:"}
                                </p>
                                <p className={`text-sm font-bold mt-1 italic ${
                                    kycDetail.status.toUpperCase() === "REJECTED" ? "text-red-900" : "text-blue-900"
                                }`}>
                                    "{kycDetail.rejectionReason}"
                                </p>
                            </div>
                        )}
                    </div>

                    {canUpdate ? (
                        <button onClick={handleUpdate}
                                className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2 group shadow-xl">
                            Cập nhật thông tin <ArrowRight size={16}
                                                           className="group-hover:translate-x-1 transition-transform"/>
                        </button>
                    ) : isLatest && kycDetail?.status?.toUpperCase() === "PENDING" && (
                        <div
                            className="px-6 py-3 bg-slate-100 rounded-xl text-[10px] font-bold text-slate-400 uppercase border border-slate-200">
                            Đang trong quá trình xét duyệt
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Thông tin chi tiết */}
                <div className="lg:col-span-7 space-y-6">
                    <div
                        className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm relative overflow-hidden">
                        <h3 className="text-[11px] font-black uppercase text-blue-600 tracking-[0.2em] mb-8 flex items-center gap-2">
                            <Info size={16}/> Nội dung hồ sơ định danh
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 relative z-10">
                            <DataRow label="Tên doanh nghiệp / Pháp lý" value={kycDetail?.legalName}/>
                            <DataRow label="Mã số thuế" value={kycDetail?.taxCode}/>
                            <DataRow label="Loại đối tác"
                                     value={kycDetail?.partnerType === 'HOTEL' ? 'Khách sạn' : 'Đại lý'}/>
                            <DataRow label="Số GPKD" value={kycDetail?.businessLicenseNumber}/>
                            <DataRow label="Người đại diện pháp luật" value={kycDetail?.representativeName}/>
                            <DataRow label="Số CCCD / CMND" value={kycDetail?.representativeCICNumber}/>
                            <DataRow label="Ngày cấp CCCD" value={kycDetail?.representativeCICDate}/>
                            <DataRow label="Nơi cấp" value={kycDetail?.representativeCICPlace}/>
                            <div className="md:col-span-2">
                                <DataRow label="Địa chỉ trụ sở chính" value={kycDetail?.businessAddress}/>
                            </div>
                        </div>
                    </div>

                    {/* Danh sách ảnh tài liệu đính kèm */}
                    {kycDetail?.documents?.length > 0 && (
                        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                            <h3 className="text-[11px] font-black uppercase text-blue-600 tracking-[0.2em] mb-6 flex items-center gap-2">
                                <ImageIcon size={16}/> Tài liệu minh chứng đã tải lên
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {kycDetail.documents.map((doc) => (
                                    <a
                                        key={doc.id}
                                        href={doc.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative aspect-[3/4] bg-slate-100 rounded-2xl overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all shadow-sm"
                                    >
                                        <img src={doc.fileUrl} alt="KYC Document"
                                             className="w-full h-full object-cover transition-transform group-hover:scale-110"/>
                                        <div
                                            className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                            <p className="text-[8px] text-white font-black uppercase truncate">
                                                {translateDocType(doc.documentType)}
                                            </p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Danh sách lịch sử bên phải */}
                <div className="lg:col-span-5">
                    <div className="bg-slate-50/50 rounded-[2.5rem] p-6 border border-slate-200/60 backdrop-blur-sm">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase mb-6 tracking-[0.2em] px-2 flex justify-between items-center">
                            Lịch sử phiên bản
                            <span
                                className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md text-[10px]">{kycList.length}</span>
                        </h4>
                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {kycList.map((item, index) => {
                                const itemTheme = getStatusTheme(item.status);
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => handleViewDetail(item.id)}
                                        className={`group p-4 rounded-3xl bg-white border-2 cursor-pointer transition-all flex items-center justify-between ${item.id === kycDetail?.id ? 'border-blue-500 shadow-lg scale-[1.02]' : 'border-transparent hover:border-slate-200'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`p-3 rounded-2xl transition-colors ${item.id === kycDetail?.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                <Eye size={18}/>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs font-black text-slate-800">Phiên bản </p>
                                                    {index === 0 && <span
                                                        className="text-[8px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-black uppercase">Mới nhất</span>}
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                                    Gửi: {new Date(item.submittedAt).toLocaleDateString('vi-VN')}
                                                </p>
                                            </div>
                                        </div>
                                        <div
                                            className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-xl ${itemTheme.badgeBg} ${itemTheme.text}`}>
                                            {itemTheme.label}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    {/* Buttons */}
                    {/*<div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">*/}
                    {/*    <button*/}
                    {/*        onClick={() => navigate(-1)}*/}
                    {/*        className="flex items-center justify-center gap-2 bg-white text-slate-700 px-6 py-3 rounded-xl font-bold text-[14px] border border-slate-200 hover:bg-slate-50 transition-all flex-1"*/}
                    {/*    >*/}
                    {/*        <LogIn size={18} className="rotate-180"/> Quay lại*/}
                    {/*    </button>*/}
                    {/*</div>*/}
                </div>
            </div>
        </div>
    );
};

// --- Helper Functions ---

const translateDocType = (type) => {
    switch (type) {
        case "BUSINESS_LICENSE":
            return "Giấy phép kinh doanh";
        case "REPRESENTATIVE_CIC_FRONT":
            return "CCCD Mặt trước";
        case "REPRESENTATIVE_CIC_BACK":
            return "CCCD Mặt sau";
        default:
            return "Tài liệu đính kèm";
    }
};

const getStatusTheme = (status) => {
    const s = status?.toUpperCase();
    switch (s) {
        case "VERIFIED":
            return {
                icon: <CheckCircle2 size={48} className="text-emerald-500"/>,
                bg: "bg-emerald-50/50",
                border: "border-emerald-100",
                text: "text-emerald-700",
                badgeBg: "bg-emerald-100",
                label: "Đã xác thực",
                desc: "Tài khoản của bạn đã được kích hoạt đầy đủ các tính năng dành cho đối tác chính thức."
            };
        case "REJECTED":
            return {
                icon: <AlertCircle size={48} className="text-red-500" />,
                bg: "bg-red-50/50", border: "border-red-100",
                text: "text-red-700", badgeBg: "bg-red-100",
                label: "Bị từ chối", desc: "Hồ sơ của bạn đã bị từ chối vĩnh viễn hoặc vi phạm nghiêm trọng chính sách. Vui lòng liên hệ hỗ trợ để biết thêm chi tiết."
            };
        case "NEED_MORE_INFORMATION":
            return {
                icon: <Info size={48} className="text-blue-500" />,
                bg: "bg-blue-50/50", border: "border-blue-100",
                text: "text-blue-700", badgeBg: "bg-blue-100",
                label: "Cần bổ sung", desc: "Hồ sơ cần điều chỉnh hoặc cung cấp thêm hình ảnh giấy tờ rõ nét hơn để hoàn tất phê duyệt."
            };
        default:
            return {
                icon: <Clock size={48} className="text-amber-500" />,
                bg: "bg-amber-50/50", border: "border-amber-100",
                text: "text-amber-700", badgeBg: "bg-amber-100",
                label: "Đang chờ duyệt", desc: "Chúng tôi đã tiếp nhận hồ sơ và đang tiến hành kiểm duyệt. Kết quả sẽ có trong vòng 24h làm việc."
            };
    }
};

const DataRow = ({ label, value }) => (
    <div className="border-l-4 border-slate-50 pl-5 py-1">
        <p className="text-[9px] font-black text-slate-400 uppercase mb-1.5 tracking-wider">{label}</p>
        <p className="text-sm font-bold text-slate-800 leading-tight">{value || "---"}</p>
    </div>
);

const LoadingState = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
        <RefreshCw className="animate-spin text-blue-600" size={40} />
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Đang truy xuất thông tin hồ sơ...</p>
    </div>
);

const EmptyState = ({ onStart }) => (
    <div className="max-w-md mx-auto mt-20 text-center space-y-8 bg-white p-16 rounded-[3.5rem] border border-slate-100 shadow-2xl relative overflow-hidden text-slate-700">
        <div className="absolute top-0 left-0 w-full h-2 bg-blue-600" />
        <ShieldCheck size={64} className="text-blue-600 mx-auto" />
        <div>
            <h3 className="text-2xl font-black uppercase italic mb-3">Chưa có hồ sơ</h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">Tài khoản của bạn hiện chưa được định danh. Vui lòng gửi hồ sơ pháp lý để bắt đầu kinh doanh trên nền tảng.</p>
        </div>
        <button onClick={onStart} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl active:scale-95">
            Bắt đầu xác thực ngay
        </button>
    </div>
);

export default VerificationStatusPage;