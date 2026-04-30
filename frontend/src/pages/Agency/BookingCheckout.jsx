import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { parseISO, differenceInSeconds, format, differenceInDays } from "date-fns";
import {
    Clock, CheckCircle2, User, CigaretteOff, RefreshCw, Loader2,
    MapPin, Users, ShieldCheck, Wallet, CreditCard,
    Tag, XCircle, ChevronRight, AlertCircle, PhoneCall, TrendingUp, X, ExternalLink, FileText, ArrowRight
} from "lucide-react";
import { bookingService } from "@/services/booking.service.js";
import { useBookingPromotion } from "@/components/agency/booking/useBookingPromotion.js";
import { addonServiceApi } from "@/services/addonService.service.js";
import ExtraServiceSection from "@/components/agency/booking/ExtraServiceSection.jsx";
import api from "@/services/axios.config.js";
import { pdfDocumentService } from "@/services/pdf.service.js";

/* ================= TIMER BAR ================= */
const BookingTimerBar = ({ expiredAt, onExpire, onExtend, isExtending, extendCount, maxExtensions }) => {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (!expiredAt) return;
        const interval = setInterval(() => {
            const now = new Date();
            const end = typeof expiredAt === "string"
                ? (expiredAt.endsWith('Z') ? parseISO(expiredAt) : parseISO(expiredAt + 'Z'))
                : expiredAt;

            // console.log("Current Time:", now.toISOString(), " | Expired At:", end.toISOString());
            const diff = differenceInSeconds(end, now);
            if (diff <= 0) {
                clearInterval(interval);
                onExpire();
            } else {
                setTimeLeft(diff);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [expiredAt, onExpire]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const isLowTime = timeLeft > 0 && timeLeft < 60;

    return (
        <div className={`border-b sticky top-0 z-50 transition-colors ${isLowTime ? 'bg-red-50' : 'bg-white'}`}>
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
                <Clock size={18} className={isLowTime ? "text-red-500 animate-pulse" : "text-orange-500"} />
                <span className="text-sm text-slate-600 font-medium">Phòng và giá tốt đang được giữ trong:</span>
                <span className={`font-bold ${isLowTime ? "text-red-600" : "text-blue-600"}`}>
                    {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                </span>

                <div className="ml-auto flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        Lượt gia hạn: {extendCount}/{maxExtensions}
                    </span>
                    {isLowTime && extendCount < maxExtensions && (
                        <button
                            onClick={onExtend}
                            disabled={isExtending}
                            className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                        >
                            {isExtending ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                            GIA HẠN
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ================= MAIN PAGE ================= */
export default function BookingCheckoutPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isPdfLoading, setIsPdfLoading] = useState(true);
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [policyUrl, setPolicyUrl] = useState("");
    const [agencyStatus, setAgencyStatus] = useState("");
    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                const pdfRes = await pdfDocumentService.getAllPdfs();
                if (pdfRes?.result) {
                    // Tìm tài liệu có tiêu đề phù hợp
                    const policyDoc = pdfRes.result.find(doc =>
                        doc.title.includes("Phụ lục điều khoản đặt phòng") ||
                        doc.title.includes("Quy tắc đặt phòng")
                    );
                    setPolicyUrl(policyDoc?.fileUrl || "");
                }
            } catch (error) {
                console.error("Không thể tải chính sách:", error);
            }
        };
        fetchPolicy();
    }, []);
    // Khóa cuộn trang khi mở modal
    useEffect(() => {
        document.body.style.overflow = showPdfModal ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [showPdfModal]);

    // const [data, setData] = useState(location.state || {});
    // Khởi tạo data: Ưu tiên dữ liệu cũ đang thanh toán dở
    const [data, setData] = useState(() => {
        const savedJSON = localStorage.getItem("pending_checkout");
        const newState = location.state; // Dữ liệu mới nhất từ trang tìm kiếm/phòng
        if (savedJSON) {
            const savedData = JSON.parse(savedJSON);
            // Nếu có đơn mới từ location.state VÀ nó khác với đơn trong storage
            if (newState?.holdCode && newState.holdCode !== savedData.holdCode) {
                // Khách đang đặt phòng khác rồi! Xóa dữ liệu cũ
                localStorage.removeItem("pending_checkout");
                return newState;
            }
            // Nếu không có đơn mới (vừa nạp tiền về), hoặc trùng code thì dùng storage
            return savedData;
        }
        return newState || {};
    });
    const [isExtending, setIsExtending] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("");

    // UC-026 - Dịch vụ thêm
    const [selectedAddons, setSelectedAddons] = useState([]);

    // số lần gia hạn (Tối đa 3 lần)
    const [extendCount, setExtendCount] = useState(0);
    const MAX_EXTENSIONS = 3;
    const [isAgreed, setIsAgreed] = useState(false);

    // Khởi tạo thông tin khách hàng từ dữ liệu đã lưu (nếu có)
    const [customerInfo, setCustomerInfo] = useState(() => {
        const savedJSON = localStorage.getItem("pending_checkout");
        const newState = location.state;
        if (savedJSON) {
            const savedData = JSON.parse(savedJSON);
            // nếu code khác nhau thì trả về trắng để nhập mới
            if (newState?.holdCode && newState.holdCode !== savedData.holdCode) {
                return { name: "", email: "", phone: "", notes: "" };
            }
            return savedData.customerInfo || { name: "", email: "", phone: "", notes: "" };
        }
        return { name: "", email: "", phone: "", notes: "" };
    });

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const agencyId = user?.agencyId;
    // state để lưu số dư
    const [balances, setBalances] = useState({ walletBalance: 0, creditBalance: 0 });
    useEffect(() => {
        const fetchAccountData = async () => {
            if (agencyId) {
                try {
                    const res = await api.get(`/agencies/${agencyId}/finance`);
                    if (res.data?.result) {
                        setBalances({
                            // Map đúng tên trường
                            walletBalance: Number(res.data.result.walletBalance) || 0,
                            creditBalance: Number(res.data.result.currentCredit) || 0
                        });
                    }
                } catch (error) {
                    console.error("Lỗi lấy thông tin tài chính:", error);
                }
            } else {
                console.warn("Không tìm thấy AgencyId để gọi API Finance");
            }
        };

        const fetchAccountAgencyData = async () => {
            if (agencyId) {
                try {
                    const res = await api.get(`/agencies/${agencyId}`);
                    if (res.data?.result) {
                        setAgencyStatus(res.data.result.status);
                    }
                } catch (error) {
                    console.error("Lỗi lấy thông tin tài chính:", error);
                }
            } else {
                console.warn("Không tìm thấy AgencyId để gọi API Finance");
            }
        };

        fetchAccountData();
        fetchAccountAgencyData();
    }, [user?.agencyId, data.agencyId]);

    // SỬ DỤNG CUSTOM HOOK LOGIC VOUCHER
    const {
        promoCode, setPromoCode, promoData, isCheckingPromo, promoError,
        showWallet, setShowWallet, availableCoupons, fetchWalletCoupons,
        handleApplyCoupon, handleRemoveCoupon, discountAmount, finalPrice
    } = useBookingPromotion(data, navigate);

    useEffect(() => {
        if (!data.holdCode) {
            navigate("/");
            return;
        }
        fetchWalletCoupons();
    }, [data.holdCode]);

    /* --- VALIDATE Logic --- */
    const handleNameChange = (val) => {
        const regex = /[^a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s]/g;
        setCustomerInfo({ ...customerInfo, name: val.replace(regex, "") });
    };
    const handleEmailChange = (val) => setCustomerInfo({ ...customerInfo, email: val.replace(/\s+/g, "") });
    const handlePhoneChange = (val) => setCustomerInfo({ ...customerInfo, phone: val.replace(/\D/g, "").slice(0, 11) });
    const validateEmail = (email) => String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

    const formatCurrency = (v) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

    if (!data.holdCode) return null;

    const checkInDate = parseISO(data.checkInDate);
    const checkOutDate = parseISO(data.checkOutDate);
    const nights = Math.max(1, differenceInDays(checkOutDate, checkInDate));
    const totalRooms = data.selectedRooms?.reduce((sum, r) => sum + r.count, 0) || 0;
    const totalAdults = data.selectedRooms?.reduce((sum, r) => sum + (r.maxAdults * r.count), 0) || 0;
    const totalChildren = data.selectedRooms?.reduce((sum, r) => sum + ((r.maxChildren || 0) * r.count), 0) || 0;

    const roomPrice = data.totalPrice || 0;

    // ưu đãi agency (20%)
    const basePrice = roomPrice / 0.8;
    const agencyDiscount = basePrice - roomPrice;

    // dịch vụ thêm
    const addonsTotal = selectedAddons.reduce(
        (sum, s) => sum + (s.quantity || 1) * (s.netPrice || 0),
        0
    );

    // voucher
    const promoDiscount = discountAmount || 0;

    // tổng cuối
    const grandTotal = roomPrice + addonsTotal - promoDiscount;

    const handleExpire = () => {
        alert("Phiên giữ chỗ đã hết hạn. Hệ thống sẽ quay về trang tìm kiếm.");
        navigate("/homepage");
    };

    const handleExtendHold = async () => {
        if (extendCount >= MAX_EXTENSIONS) return alert("Hết lượt gia hạn.");
        setIsExtending(true);
        try {
            const response = await bookingService.extendHold(data.holdCode);
            if (response?.result) {
                setData(prev => ({ ...prev, expiredAt: response.result.expiredAt }));
                setExtendCount(prev => prev + 1);
            }
        } catch (error) { alert("Lỗi gia hạn."); } finally { setIsExtending(false); }
    };
const validateSelectedAddons = async () => {
    if (selectedAddons.length === 0) return true;

    const res = await addonServiceApi.getActiveAddonServicesByHotel(data.hotelId);
    const activeServices = res?.result || [];

    const activeServiceIds = new Set(
        activeServices.map(s => Number(s.serviceId))
    );

    const invalidAddon = selectedAddons.find(
        addon => !activeServiceIds.has(Number(addon.serviceId))
    );

    if (invalidAddon) {
        alert(`Dịch vụ "${invalidAddon.serviceName}" hiện không còn khả dụng. Vui lòng reload lại trang để cập nhật lại.`);
        return false;
    }

    return true;
};
    const handleConfirmBooking = async () => {
        const { name, email, phone } = customerInfo;
        if (!name.trim() || !email.trim() || !phone.trim() || !paymentMethod) return alert("Vui lòng điền đủ thông tin!");
        if (!isAgreed) {
            return alert("Bạn cần đồng ý với Quy tắc đặt phòng & Chính sách hủy để tiếp tục!");
        }
        if (!validateEmail(email)) return alert("Email sai định dạng!");
        if (phone.length < 10) return alert("Số điện thoại không hợp lệ!");
        const invalidAddon = selectedAddons.find(
            (item) =>
                (item.requireServiceDate && !item.serviceDate) ||
                (item.requireFlightInfo && (!item.flightNumber?.trim() || !item.flightTime))
        );

        if (invalidAddon) {
            if (invalidAddon.requireServiceDate && !invalidAddon.serviceDate) {
                return alert(`Vui lòng chọn ngày sử dụng cho dịch vụ: ${invalidAddon.serviceName}`);
            }

            if (invalidAddon.requireFlightInfo && !invalidAddon.flightNumber?.trim()) {
                return alert(`Vui lòng nhập số hiệu chuyến bay cho dịch vụ: ${invalidAddon.serviceName}`);
            }

            if (invalidAddon.requireFlightInfo && !invalidAddon.flightTime) {
                return alert(`Vui lòng chọn giờ hạ cánh cho dịch vụ: ${invalidAddon.serviceName}`);
            }
        }

        setIsSubmitting(true);
        try {
             const addonValid = await validateSelectedAddons();
    if (!addonValid) {
        setIsSubmitting(false);
        return;
    }
            const payload = {
                holdCode: data.holdCode,
                guestName: name.trim(),
                guestPhone: phone.trim(),
                guestEmail: email.trim(),
                notes: customerInfo.notes || "",
                paymentMethod: paymentMethod,
                totalGuests: data.selectedRooms?.reduce(
                    (sum, r) =>
                        sum +
                        ((Number(r.maxAdults || 0) + Number(r.maxChildren || 0)) * Number(r.count || 0)),
                    0
                ) || 1,
                discountTotal: Number(discountAmount || 0),
                promotionCode: promoData?.code ? String(promoData.code) : null
            };
            const response = await bookingService.createBooking(payload);
            if (response?.result) {
                // Lưu dịch vụ thêm nếu có
                if (selectedAddons.length > 0) {
                    try {
                        const addonPayload = selectedAddons.map(({ netPrice, ...rest }) => rest);
                        await addonServiceApi.addServicesToBooking({
                            bookingId: response.result.bookingId,
                            services: addonPayload,
                        });
                    } catch (addonErr) {
                        console.warn("Lưu dịch vụ thêm thất bại:", addonErr);
                    }
                }
                // Gửi đầy đủ thông tin sang trang Success
                navigate("/booking-success", {
                    state: {
                        booking: response.result,
                        checkoutData: {
                            hotelName: data.hotelName,
                            hotelImage: data.hotelImage,
                            totalPrice: grandTotal,
                            guestName: name.trim(),
                            guestPhone: phone,
                            guestEmail: email,
                            checkInDate: format(checkInDate, "dd/MM/yyyy"),
                            checkOutDate: format(checkOutDate, "dd/MM/yyyy"),
                            totalNights: nights,
                            totalRooms: totalRooms,
                            paymentMethod: paymentMethod
                        }
                    }
                });
            }
        } catch (error) {
            const errorData = error.response?.data;
            const errorCode = errorData?.code;
            const errorMessage = errorData?.message;

            // Xử lý lỗi thiếu tiền
            if (errorCode === 2206) {
                alert("Số dư tài khoản của bạn không đủ để thực hiện thanh toán này. Vui lòng kiểm tra lại Ví hoặc Hạn mức tín dụng!");
            }
            // Xử lý lỗi phiên giữ chỗ hết hạn (Nếu có)
            else if (errorCode === 1402) { // code 1402 là hết hạn hold
                alert("Phiên giữ chỗ đã hết hạn. Vui lòng thực hiện tìm kiếm lại.");
                navigate("/agency/search-hotel");
            }
            // Các lỗi hệ thống hoặc lỗi khác
            else {
                alert(`Lỗi: ${errorMessage || "Hệ thống đang bận, vui lòng thử lại sau!"}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoToDeposit = () => {
        // 1. Lưu lại toàn bộ data hiện tại của trang Checkout vào máy khách
        const checkoutState = {
            ...data,
            customerInfo, // Lưu luôn cả thông tin khách đã nhập dở
            selectedAddons,
            paymentMethod
        };
        localStorage.setItem("pending_checkout", JSON.stringify(checkoutState));
        // 2. Chuyển hướng sang trang nạp tiền
        navigate("/agency/prepaid");
    };

    const currentGrandTotal = Number(grandTotal || 0);
    const walletBal = Number(balances.walletBalance || 0);
    const creditBal = Number(balances.creditBalance || 0);

    const isWalletInsufficient = currentGrandTotal > walletBal;
    const isCreditInsufficient = currentGrandTotal > creditBal;

    return (
        <div className="min-h-screen bg-[#f5f7fb] pb-20 font-sans">
            <BookingTimerBar
                expiredAt={data.expiredAt}
                onExpire={() => navigate("/agency/search-hotel")}
                onExtend={handleExtendHold}
                isExtending={isExtending}
                extendCount={extendCount}
                maxExtensions={MAX_EXTENSIONS}
            />

            <div className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* CỘT TRÁI (THÔNG TIN KHÁCH & PHÒNG) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800">
                            <Users size={20} className="text-blue-700" /> Thông tin khách
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-700 uppercase">Tên khách hàng</label>
                                <input
                                    className="w-full border border-slate-200 p-2.5 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                    value={customerInfo.name} placeholder="Nguyễn Văn A"
                                    onChange={(e) => handleNameChange(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-700 uppercase">Địa chỉ Email</label>
                                <input
                                    className="w-full border border-slate-200 p-2.5 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                    value={customerInfo.email} placeholder="example@gmail.com"
                                    onChange={(e) => handleEmailChange(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-700 uppercase">Số điện thoại</label>
                                <input
                                    className="w-full border border-slate-200 p-2.5 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                    value={customerInfo.phone} placeholder="09xx xxx xxx"
                                    onChange={(e) => handlePhoneChange(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {data.selectedRooms?.map((room, idx) => (
                            <div key={idx}
                                className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
                                <h3 className="text-lg font-black text-slate-800">{room.name} x {room.count}</h3>
                                <div className="flex flex-wrap gap-y-3 gap-x-6 text-[13px]">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Users size={16} className="text-blue-600" />
                                        <span
                                            className="font-medium">Tối đa: {room.maxAdults} người lớn {room.maxChildren > 0 && `& ${room.maxChildren} trẻ em`}</span>
                                    </div>
                                    {/*<div className="flex items-center gap-2 text-emerald-600 font-medium">*/}
                                    {/*    <CheckCircle2 size={16} /><span>Bao gồm Internet & Phí dịch vụ</span>*/}
                                    {/*</div>*/}
                                    {/*<div className="flex items-center gap-2 text-slate-500">*/}
                                    {/*    <CigaretteOff size={16} /><span>Không hút thuốc</span>*/}
                                    {/*</div>*/}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* UC-026 - Dịch vụ thêm */}
                    <ExtraServiceSection
                        hotelId={data.hotelId}
                        checkInDate={data.checkInDate}
                        checkOutDate={data.checkOutDate}
                        onChange={setSelectedAddons}
                    />

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800">
                            Chọn nguồn tiền thanh toán
                        </h2>

                        <div className="space-y-4">
                            {/* --- LỰA CHỌN VÍ TRẢ TRƯỚC --- */}
                            <div className="space-y-2">
                                <label
                                    className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${paymentMethod === "WALLET"
                                        ? "border-blue-500 bg-blue-50/40 shadow-sm"
                                        : "border-slate-100 hover:bg-slate-50"
                                        } ${isWalletInsufficient ? "opacity-60 bg-slate-50 cursor-not-allowed" : "cursor-pointer"}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="radio"
                                            name="payment"
                                            className="w-5 h-5 accent-blue-600 cursor-pointer"
                                            checked={paymentMethod === "WALLET"}
                                            disabled={isWalletInsufficient}
                                            onChange={() => setPaymentMethod("WALLET")}
                                        />
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${paymentMethod === "WALLET" ? "bg-blue-600 shadow-lg" : "bg-slate-100"}`}>
                                                {paymentMethod === "WALLET" ? "💰" : "👛"}
                                            </div>
                                            <div>
                                                <span
                                                    className={`font-bold text-[15px] ${paymentMethod === "WALLET" ? "text-blue-700" : "text-slate-800"}`}>
                                                    Ví trả trước (Prepaid Wallet)
                                                </span>
                                                <p className="text-[11px] text-slate-500 font-medium">Sử dụng số dư
                                                    trong ví của bạn để thanh toán ngay lập tức</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className={`px-3 py-1.5 rounded-full text-[11px] font-black border transition-colors ${isWalletInsufficient
                                            ? "bg-red-50 text-red-600 border-red-100"
                                            : "bg-blue-100 text-blue-700 border-blue-200"
                                            }`}>
                                        Còn: {walletBal.toLocaleString()} đ
                                    </div>
                                </label>
                                {/* Cảnh báo số dư không đủ */}
                                {isWalletInsufficient && (
                                    <div
                                        className="px-4 py-2 bg-red-50/50 rounded-lg flex justify-between items-center animate-in fade-in slide-in-from-top-1">
                                        <div
                                            className="flex items-center gap-2 text-red-500 text-[10px] font-bold italic">
                                            <AlertCircle size={14} />
                                            Thiếu: {formatCurrency(currentGrandTotal - walletBal)}
                                        </div>
                                        <button
                                            onClick={handleGoToDeposit}
                                            className="text-[10px] bg-red-500 text-white px-2 py-1 rounded-md font-bold hover:bg-red-600 transition-colors"
                                        >
                                            Nạp tiền ngay
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* --- LỰA CHỌN HẠN MỨC TÍN DỤNG --- */}
                            <div className="space-y-2">
                                <label
                                    className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${paymentMethod === "CREDIT"
                                        ? "border-purple-500 bg-purple-50/40 shadow-sm"
                                        : "border-slate-100 hover:bg-slate-50"
                                        } ${isCreditInsufficient ? "opacity-60 bg-slate-50 cursor-not-allowed" : "cursor-pointer"}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="radio"
                                            name="payment"
                                            className="w-5 h-5 accent-purple-600 cursor-pointer"
                                            checked={paymentMethod === "CREDIT"}
                                            disabled={isCreditInsufficient}
                                            onChange={() => setPaymentMethod("CREDIT")}
                                        />
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${paymentMethod === "CREDIT" ? "bg-purple-600 shadow-lg" : "bg-slate-100"}`}>
                                                {paymentMethod === "CREDIT" ? "💎" : "💳"}
                                            </div>
                                            <div>
                                                <span
                                                    className={`font-bold text-[15px] ${paymentMethod === "CREDIT" ? "text-purple-700" : "text-slate-800"}`}>
                                                    Hạn mức Tín dụng (Credit Line)
                                                </span>
                                                <p className="text-[11px] text-slate-500 font-medium">Sử dụng hạn mức
                                                    tín dụng đã được cấp bởi hệ thống</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className={`px-3 py-1.5 rounded-full text-[11px] font-black border transition-colors ${isCreditInsufficient
                                            ? "bg-red-50 text-red-600 border-red-100"
                                            : "bg-purple-100 text-purple-700 border-purple-200"
                                            }`}>
                                        Còn: {creditBal.toLocaleString()} đ
                                    </div>
                                </label>

                                {/* Cảnh báo hạn mức không đủ ngay dưới Option */}
                                {grandTotal > balances.creditBalance && (
                                    <div className="px-4 py-2 bg-red-50/50 rounded-lg flex justify-between items-center animate-in fade-in slide-in-from-top-1">
                                        <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold italic">
                                            <AlertCircle size={14} />
                                            Hạn mức không đủ (Thiếu: {formatCurrency(grandTotal - balances.creditBalance)})
                                        </div>
                                        <button
                                            onClick={handleGoToDeposit}
                                            className="text-[10px] bg-red-500 text-white px-2 py-1 rounded-md font-bold hover:bg-red-600 transition-colors"
                                        >
                                            Nạp tiền ngay
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI: CHI TIẾT THANH TOÁN  */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="sticky top-24 space-y-4">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                            {/* Banner khách sạn */}
                            <div className="relative h-24 flex items-end p-4">
                                <div
                                    className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20 z-10" />
                                <img
                                    src={data.hotelImage || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=500"}
                                    className="absolute inset-0 w-full h-full object-cover" alt="hotel" />
                                <div className="relative z-20 text-white">
                                    <h3 className="font-bold text-[15px] leading-tight">{data.hotelName}</h3>
                                    <p className="text-[11px] opacity-80 mt-1">{format(checkInDate, "dd/MM/yyyy")} - {format(checkOutDate, "dd/MM/yyyy")}</p>
                                </div>
                            </div>

                            <div className="p-5 space-y-5">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>Tiền phòng ({nights} đêm)</span>
                                        <span className="font-bold text-slate-900">
                                            {formatCurrency(roomPrice)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-600">

                                    </div>
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>Thuế & Phí</span>
                                        <span
                                            className="text-emerald-600 font-medium italic text-xs">Đã bao gồm</span>
                                    </div>
                                </div>

                                {/* BOX VOUCHER TÍCH HỢP LOGIC */}
                                <div className="pt-4 border-t border-slate-100">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="text-[11px] font-black text-slate-800 uppercase">Mã
                                            giảm giá</label>
                                        <button onClick={() => setShowWallet(!showWallet)}
                                            className="text-[10px] font-bold text-blue-600 hover:underline">
                                            {showWallet ? "Đóng ví" : "Chọn từ ví"}
                                        </button>
                                    </div>

                                    <div className="flex gap-2">
                                        <div className="flex-1 relative">
                                            <input
                                                className={`w-full border ${promoError ? 'border-red-300' : 'border-slate-200'} px-4 py-2.5 rounded-xl text-sm outline-none uppercase font-bold`}
                                                placeholder="Nhập mã"
                                                value={promoCode}
                                                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                                disabled={!!promoData}
                                            />
                                            {isCheckingPromo && <Loader2 size={14}
                                                className="absolute right-3 top-3 animate-spin text-slate-400" />}
                                        </div>
                                        <button
                                            onClick={() => promoData ? handleRemoveCoupon() : handleApplyCoupon()}
                                            className={`px-4 rounded-xl text-xs font-bold transition-all ${promoData ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                        >
                                            {promoData ? "Bỏ" : "Áp dụng"}
                                        </button>
                                    </div>

                                    {/* Dropdown ví voucher */}
                                    {showWallet && (
                                        <div
                                            className="mt-2 bg-white border border-slate-100 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y z-50 relative">
                                            {availableCoupons.length > 0 ? availableCoupons.map((cp) => (
                                                <div key={cp.id} onClick={() => handleApplyCoupon(cp.code)}
                                                    className="p-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center">
                                                    <div>
                                                        <div
                                                            className="text-xs font-bold text-slate-700">{cp.code}</div>
                                                        <div
                                                            className="text-[10px] text-slate-500">Giảm {cp.typeDiscount === "PERCENT" ? `${cp.discountVal}%` : formatCurrency(cp.discountVal)}</div>
                                                    </div>
                                                    <ChevronRight size={14} className="text-slate-300" />
                                                </div>
                                            )) : <div
                                                className="p-4 text-[11px] text-slate-400 text-center italic">Không
                                                có mã khả dụng</div>}
                                        </div>
                                    )}

                                    {promoError && <div
                                        className="mt-2 flex items-center gap-1 text-red-500 text-[10px] font-bold italic">
                                        <AlertCircle size={12} /> {promoError}</div>}
                                    {promoData && <div
                                        className="mt-2 flex items-center gap-1 text-emerald-600 text-[10px] font-bold italic">
                                        <CheckCircle2 size={12} /> Giảm thành công:
                                        -{formatCurrency(discountAmount)}</div>}
                                </div>

                                <div
                                    className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                    <span
                                        className="text-sm font-black text-slate-900">Giá phòng cuối cùng:</span>
                                    <span
                                        className="text-xl font-black text-purple-600 leading-none">{formatCurrency(finalPrice)}</span>
                                </div>

                                {/* CHECKBOX ĐIỀU KHOẢN */}

                                <div className="border-t border-slate-100 pt-4 space-y-2">
                                    {/*<div className="flex justify-between text-sm">*/}
                                    {/*    <span className="text-emerald-600 font-bold">Ưu đãi Agency</span>*/}
                                    {/*    <span className="text-emerald-600 font-bold">-{formatCurrency(agencyDiscount)}</span>*/}
                                    {/*</div>*/}
                                    {addonsTotal > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600 font-bold">Dịch vụ thêm</span>
                                            <span
                                                className="text-slate-800 font-bold">+{formatCurrency(addonsTotal)}</span>
                                        </div>
                                    )}
                                    <div className="flex items-start gap-3 pt-2">
                                        <div className="flex items-center h-5">
                                            <input
                                                id="terms"
                                                type="checkbox"
                                                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                                                checked={isAgreed}
                                                onChange={(e) => setIsAgreed(e.target.checked)}
                                            />
                                        </div>
                                        <label htmlFor="terms"
                                            className="text-[12px] text-slate-600 leading-tight cursor-pointer select-none">
                                            Tôi đồng ý với {" "}
                                            <span
                                                onClick={() => policyUrl ? setShowPdfModal(true) : alert("Tài liệu đang được cập nhật!")}
                                                className="text-blue-600 font-bold hover:underline cursor-pointer"
                                            >
                                                Quy tắc đặt phòng & Chính sách hủy
                                            </span>{" "}
                                            của hệ thống.
                                        </label>
                                    </div>
                                    <div
                                        className="bg-blue-600 mt-4 p-4 rounded-xl text-white flex justify-between items-center shadow-lg">
                                        <span
                                            className="text-[10px] font-black uppercase opacity-80">Tổng cộng</span>
                                        <span className="text-xl font-black">{formatCurrency(grandTotal)}</span>
                                    </div>

                                </div>

                                <div className="relative group w-full">
                                    <button
                                        onClick={handleConfirmBooking}
                                        disabled={isSubmitting || agencyStatus === "LOCKED" || agencyStatus === "LEGAL"}
                                        className="w-full py-4 bg-[#1a73e8] hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-black rounded-xl shadow-lg transition-all flex justify-center items-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="animate-spin" size={20} />
                                        ) : (
                                            <>
                                                <CreditCard size={18} /> ĐẶT NGAY
                                            </>
                                        )}
                                    </button>

                                    {/* Tooltip chỉ hiện khi status là LOCKED hoặc LEGAL */}
                                    {(agencyStatus === "LOCKED" || agencyStatus === "LEGAL") && (
                                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            Tài khoản của bạn đã bị khóa
                                        </span>
                                    )}
                                </div>


                            </div>
                        </div>

                        {/* BOX GIỮ CHỖ AN TOÀN  */}
                        <div
                            className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldCheck size={80} />
                            </div>
                            <h4 className="font-bold text-[15px] mb-1 flex items-center gap-2"><ShieldCheck
                                size={18} /> Giữ chỗ an toàn</h4>
                            <p className="text-[11px] leading-relaxed opacity-90 font-medium">
                                Hệ thống đang giữ giá tốt nhất cho bạn. Vui lòng thanh toán trước khi thời gian
                                giữ phòng kết thúc.
                            </p>
                        </div>
                        {/* HỖ TRỢ 24/7 */}
                        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-2">
                            <h4 className="font-bold text-slate-800 text-[15px]">Hỗ trợ 24/7</h4>
                            <p>Đội ngũ hỗ trợ chuyên nghiệp sẵn sàng giúp bạn mọi lúc</p>
                            <div className="flex items-center gap-2 text-blue-700 font-black">
                                <PhoneCall size={18} />
                                <span className="text-base">1900 1234</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* MODAL PDF ĐIỀU KHOẢN ĐẶT PHÒNG */}
            {showPdfModal && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-0 md:p-8 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-5xl h-full md:h-[94vh] md:rounded-[32px] overflow-hidden shadow-2xl flex flex-col relative animate-in zoom-in duration-300">

                        {/* Header Modal - Nút điều hướng */}
                        <div className="absolute top-4 right-4 z-[100] flex items-center gap-2">
                            <a
                                href={policyUrl}
                                target="_blank"
                                rel="noreferrer"
                                title="Mở tab mới"
                                className="p-2.5 bg-white/90 backdrop-blur-md text-slate-500 hover:text-blue-600 rounded-xl border border-slate-200 shadow-sm transition-all active:scale-95"
                            >
                                <ExternalLink size={18} />
                            </a>
                            <button
                                onClick={() => {
                                    setShowPdfModal(false);
                                    setIsPdfLoading(true);
                                }}
                                className="p-2.5 bg-slate-900/90 backdrop-blur-md text-white hover:bg-red-500 rounded-xl shadow-lg transition-all active:scale-95"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Nội dung PDF */}
                        <div className="flex-1 bg-slate-50 relative overflow-hidden">
                            {policyUrl ? (
                                <div className="w-full h-full overflow-hidden">
                                    <object

                                        data={`${policyUrl}#navpanes=0&view=FitH&toolbar=0`}
                                        type="application/pdf"
                                        style={{
                                            width: '100%',
                                            height: 'calc(100% + 40px)',
                                            marginTop: '-40px'
                                        }}
                                        className="relative z-10"
                                        onLoad={() => setIsPdfLoading(false)}
                                    >
                                        <iframe
                                            src={`${policyUrl}#navpanes=0&view=FitH&toolbar=0`}
                                            className="w-full h-full border-none"
                                            title="Chính sách đặt phòng"
                                            onLoad={() => setIsPdfLoading(false)}
                                        />
                                    </object>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                    <Info size={40} className="mb-2 opacity-20" />
                                    <p className="text-sm font-medium">Tài liệu đang được cập nhật...</p>
                                </div>
                            )}

                            {isPdfLoading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center z-[20] bg-slate-50">
                                    <Loader2 size={32} className="animate-spin text-blue-600 mb-2" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
                                        Đang chuẩn bị tài liệu...
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}