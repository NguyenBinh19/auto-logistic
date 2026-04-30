import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Users, CreditCard, CheckCircle2,
    ChevronRight, ShieldCheck,
    CigaretteOff, Loader2,
    AlertCircle, PhoneCall as PhoneIcon,
    Plus, Trash2, Ticket, Check, PhoneCall
} from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import BookingTimerBar from "@/components/demo/Agency/DemoBookingTimerModal";
import { MOCK_AGENCY_DATA } from "@/constant/agency_mockData.js";

// Component dịch vụ bổ sung
const ExtraServiceSection = ({ hotelId, onChange }) => {
    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
                 Dịch vụ bổ sung
            </h2>
            <div className="p-4 bg-blue-50/50 border border-dashed border-blue-200 rounded-lg flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">🍽️</div>
                    <div>
                        <p className="text-sm font-bold text-slate-700">Ăn sáng Buffet (Mặc định)</p>
                        <p className="text-[11px] text-blue-600 font-bold uppercase">Miễn phí theo gói phòng</p>
                    </div>
                </div>
                <Check size={18} className="text-blue-600" />
            </div>
        </div>
    );
};

export default function BookingCheckoutDemo() {
    const location = useLocation();
    const navigate = useNavigate();

    // 1. DỮ LIỆU CƠ BẢN
    const [data, setData] = useState(() => location.state || {
        hotelName: "Vinpearl Resort & Spa Ha Long",
        hotelImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800",
        selectedRooms: [
            { room_type_id: 101, name: "Classic Ocean View", count: 2, price: 2250000, maxAdults: 2, maxChildren: 1 }
        ],
        totalPrice: 4500000,
        expiredAt: new Date(new Date().getTime() + 15 * 60000).toISOString(),
        checkInDate: "2026-04-10T14:00:00Z",
        checkOutDate: "2026-04-12T12:00:00Z",
    });

    // 2. STATE HỆ THỐNG & UI
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showWallet, setShowWallet] = useState(false);
    const [promoError, setPromoError] = useState("");
    const [promoData, setPromoData] = useState({ code: "WELCOME2026" });
    const [isCheckingPromo, setIsCheckingPromo] = useState(false);
    const [availableCoupons] = useState([
        { id: 1, code: "WELCOME2026", discountVal: 500000, typeDiscount: "CASH" },
        { id: 2, code: "AGENCY10", discountVal: 10, typeDiscount: "PERCENT" }
    ]);

    const [extendCount, setExtendCount] = useState(0);
    const [isExtending, setIsExtending] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("WALLET");
    const [errors, setErrors] = useState({ name: "", email: "", phone: "" });
    const [customerInfo, setCustomerInfo] = useState({
        name: "",
        email: "",
        phone: ""
    });
    const [isAgreed, setIsAgreed] = useState(true);
    const [promoCode, setPromoCode] = useState("WELCOME2026");
    const [discountAmount, setDiscountAmount] = useState(500000);
    const [selectedAddons, setSelectedAddons] = useState([]);

    const MAX_EXTENSIONS = 3;

    // --- PRICE ENGINE ---
    const checkInDate = parseISO(data.checkInDate);
    const checkOutDate = parseISO(data.checkOutDate);
    const nights = Math.max(1, differenceInDays(checkOutDate, checkInDate));

    const roomPriceTotal = data.totalPrice || 0;
    const addonsTotal = selectedAddons.reduce((sum, s) => sum + (s.quantity * s.netPrice), 0);
    const currentGrandTotal = roomPriceTotal + addonsTotal - discountAmount;

    const walletBal = MOCK_AGENCY_DATA.finance.walletBalance;
    const creditBal = MOCK_AGENCY_DATA.finance.availableCredit;
    const isWalletInsufficient = currentGrandTotal > walletBal;
    const isCreditInsufficient = currentGrandTotal > creditBal;

    const formatCurrency = (v) => new Intl.NumberFormat("vi-VN").format(v) + " đ";
    const validateField = (name, value) => {
        let error = "";
        switch (name) {
            case "name":
                if (!value.trim()) error = "Vui lòng nhập tên khách hàng";
                else if (value.trim().length < 3) error = "Tên quá ngắn";
                break;
            case "email":
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!value) error = "Vui lòng nhập email";
                else if (!emailRegex.test(value)) error = "Email không hợp lệ";
                break;
            case "phone":
                const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
                if (!value) error = "Vui lòng nhập số điện thoại";
                else if (!phoneRegex.test(value)) error = "Số điện thoại không đúng định dạng VN";
                break;
            default:
                break;
        }
        setErrors(prev => ({ ...prev, [name]: error }));
        return error;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCustomerInfo(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) validateField(name, value);
    };

    // --- HANDLERS ---
    const handleApplyCoupon = (codeFromWallet) => {
        const targetCode = codeFromWallet || promoCode;
        if (!targetCode) return;

        setIsCheckingPromo(true);
        setPromoError("");

        // Giả lập API check mã
        setTimeout(() => {
            const found = availableCoupons.find(c => c.code === targetCode.toUpperCase());
            if (found) {
                setPromoData(found);
                setDiscountAmount(found.discountVal);
                setPromoCode(found.code);
            } else {
                setPromoError("Mã giảm giá không chính xác hoặc đã hết hạn");
            }
            setIsCheckingPromo(false);
            setShowWallet(false);
        }, 800);
    };

    const handleRemoveCoupon = () => {
        setPromoData(null);
        setDiscountAmount(0);
        setPromoCode("");
    };

    const handleConfirmBooking = () => {
        const errName = validateField("name", customerInfo.name);
        const errEmail = validateField("email", customerInfo.email);
        const errPhone = validateField("phone", customerInfo.phone);

        if (errName || errEmail || errPhone) {
            alert("Vui lòng kiểm tra lại thông tin khách hàng!");
            return;
        }
        // Kiểm tra số dư theo nguồn tiền được chọn
        const isInsufficient = paymentMethod === "WALLET" ? isWalletInsufficient : isCreditInsufficient;
        if (isInsufficient) {
            alert("Số dư tài khoản không đủ để thanh toán!");
            return;
        }
        if (!isAgreed) return;
        setIsSubmitting(true);
        // Giả lập API thanh toán
        setTimeout(() => {
            setIsSubmitting(false);
            // Dữ liệu sẽ gửi sang màn hình Success
            const successPayload = {
                bookingCode: "VN" + Math.random().toString(36).substring(2, 9).toUpperCase(),
                hotelName: data.hotelName,
                hotelImage: data.hotelImage,
                guestName: customerInfo.name,
                guestPhone: customerInfo.phone,
                guestEmail: customerInfo.email,
                checkInDate: format(checkInDate, "dd/MM/yyyy"),
                checkOutDate: format(checkOutDate, "dd/MM/yyyy"),
                totalPrice: currentGrandTotal,
                paymentMethod: paymentMethod,
                totalNights: nights,
                totalRooms: data.selectedRooms.reduce((acc, r) => acc + r.count, 0)
            };

            // Chuyển hướng kèm dữ liệu
            navigate("/demo-agency/booking-success", { state: successPayload });
        }, 2000);
    };

    const handleExtendHold = () => {
        if (extendCount >= MAX_EXTENSIONS) return;
        setIsExtending(true);
        setTimeout(() => {
            const newExpiry = new Date(new Date(data.expiredAt).getTime() + 15 * 60000).toISOString();
            setData(prev => ({ ...prev, expiredAt: newExpiry }));
            setExtendCount(prev => prev + 1);
            setIsExtending(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#f5f7fb] pb-20 font-sans">
            <BookingTimerBar
                expiredAt={data.expiredAt}
                onExpire={() => navigate("/demo-agency/search-hotel")}
                onExtend={handleExtendHold}
                isExtending={isExtending}
                extendCount={extendCount}
                maxExtensions={MAX_EXTENSIONS}
            />

            <div className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* CỘT TRÁI (THÔNG TIN KHÁCH & PHÒNG) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* 1. Thông tin khách */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800">
                            <Users size={20} className="text-blue-700"/> Thông tin khách
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-700 uppercase">Tên khách hàng</label>
                                <input
                                    name="name"
                                    className={`w-full border ${errors.name ? 'border-red-500' : 'border-slate-200'} p-2.5 rounded-lg text-sm focus:ring-1 outline-none font-bold`}
                                    value={customerInfo.name} placeholder="Nguyễn Văn A"
                                    onChange={handleInputChange}
                                    onBlur={(e) => validateField("name", e.target.value)}
                                />
                                {errors.name && <p className="text-[10px] text-red-500 font-medium italic mt-1">{errors.name}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-700 uppercase">Địa chỉ Email</label>
                                <input
                                    name="email"
                                    className={`w-full border ${errors.email ? 'border-red-500' : 'border-slate-200'} p-2.5 rounded-lg text-sm focus:ring-1 outline-none font-bold`}
                                    value={customerInfo.email} placeholder="example@gmail.com"
                                    onChange={handleInputChange}
                                    onBlur={(e) => validateField("email", e.target.value)}
                                />
                                {errors.email && <p className="text-[10px] text-red-500 font-medium italic mt-1">{errors.email}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-700 uppercase">Số điện thoại</label>
                                <input
                                    name="phone"
                                    className={`w-full border ${errors.phone ? 'border-red-500' : 'border-slate-200'} p-2.5 rounded-lg text-sm focus:ring-1 outline-none font-bold`}
                                    value={customerInfo.phone} placeholder="09xx xxx xxx"
                                    onChange={handleInputChange}
                                    onBlur={(e) => validateField("phone", e.target.value)}
                                />
                                {errors.phone && <p className="text-[10px] text-red-500 font-medium italic mt-1">{errors.phone}</p>}
                            </div>
                        </div>
                    </div>

                    {/* 2. Chi tiết phòng */}
                    <div className="space-y-4">
                        {data.selectedRooms?.map((room, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-black text-slate-800">{room.name} x {room.count}</h3>
                                </div>
                                <div className="flex flex-wrap gap-y-3 gap-x-6 text-[13px]">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Users size={16} className="text-blue-600"/>
                                        <span className="font-medium">
                                            Tối đa: {room.maxAdults} người lớn {room.maxChildren > 0 && `& ${room.maxChildren} trẻ em`}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-emerald-600 font-medium">
                                        <CheckCircle2 size={16}/><span>Bao gồm Internet & Phí dịch vụ</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <CigaretteOff size={16}/><span>Không hút thuốc</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <ExtraServiceSection
                        hotelId={data.hotelId}
                        onChange={setSelectedAddons}
                    />

                    {/* 4. Nguồn tiền thanh toán */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800">
                             Chọn nguồn tiền thanh toán
                        </h2>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${paymentMethod === "WALLET" ? "border-blue-500 bg-blue-50/40 shadow-sm" : "border-slate-100 hover:bg-slate-50"} ${isWalletInsufficient ? "opacity-60 bg-slate-50 cursor-not-allowed" : "cursor-pointer"}`}>
                                    <div className="flex items-center gap-4">
                                        <input type="radio" name="payment" className="w-5 h-5 accent-blue-600" checked={paymentMethod === "WALLET"} disabled={isWalletInsufficient} onChange={() => setPaymentMethod("WALLET")}/>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${paymentMethod === "WALLET" ? "bg-blue-600 shadow-lg" : "bg-slate-100"}`}>
                                                {paymentMethod === "WALLET" ? "💰" : "👛"}
                                            </div>
                                            <div>
                                                <span className={`font-bold text-[15px] ${paymentMethod === "WALLET" ? "text-blue-700" : "text-slate-800"}`}>Ví trả trước (Prepaid Wallet)</span>
                                                <p className="text-[11px] text-slate-500 font-medium">Sử dụng số dư
                                                    trong ví của bạn để thanh toán ngay lập tức</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1.5 rounded-full text-[11px] font-black border ${isWalletInsufficient ? "bg-red-50 text-red-600 border-red-100" : "bg-blue-100 text-blue-700 border-blue-200"}`}>
                                        Dư: {walletBal.toLocaleString()} đ
                                    </div>
                                </label>
                                {isWalletInsufficient && (
                                    <div className="px-4 py-2 bg-red-50/50 rounded-lg flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold italic">
                                            <AlertCircle size={14}/> Thiếu: {formatCurrency(currentGrandTotal - walletBal)}
                                        </div>
                                        <button className="text-[10px] bg-red-500 text-white px-2 py-1 rounded-md font-bold">Nạp tiền</button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${paymentMethod === "CREDIT" ? "border-purple-500 bg-purple-50/40 shadow-sm" : "border-slate-100 hover:bg-slate-50"} ${isCreditInsufficient ? "opacity-60 bg-slate-50 cursor-not-allowed" : "cursor-pointer"}`}>
                                    <div className="flex items-center gap-4">
                                        <input type="radio" name="payment" className="w-5 h-5 accent-purple-600" checked={paymentMethod === "CREDIT"} disabled={isCreditInsufficient} onChange={() => setPaymentMethod("CREDIT")}/>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${paymentMethod === "CREDIT" ? "bg-purple-600 shadow-lg" : "bg-slate-100"}`}>
                                                {paymentMethod === "CREDIT" ? "💎" : "💳"}
                                            </div>
                                            <div>
                                                <span className={`font-bold text-[15px] ${paymentMethod === "CREDIT" ? "text-purple-700" : "text-slate-800"}`}>Hạn mức Tín dụng (Credit Line)</span>
                                                <p className="text-[11px] text-slate-500 font-medium">Sử dụng hạn mức
                                                    tín dụng đã được cấp bởi hệ thống</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1.5 rounded-full text-[11px] font-black border ${isCreditInsufficient ? "bg-red-50 text-red-600 border-red-100" : "bg-purple-100 text-purple-700 border-purple-200"}`}>
                                        Dư: {creditBal.toLocaleString()} đ
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI: CHI TIẾT THANH TOÁN */}
                <aside className="lg:col-span-1">
                    <div className="sticky top-24 space-y-4">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                            {/* Banner khách sạn */}
                            <div className="relative h-24 flex items-end p-4">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20 z-10" />
                                <img
                                    src={data.hotelImage}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    alt="hotel"
                                />
                                <div className="relative z-20 text-white">
                                    <h3 className="font-bold text-[15px] leading-tight uppercase tracking-tight">{data.hotelName}</h3>
                                    <p className="text-[11px] opacity-80 mt-1">
                                        {format(checkInDate, "dd/MM/yyyy")} - {format(checkOutDate, "dd/MM/yyyy")}
                                    </p>
                                </div>
                            </div>

                            <div className="p-5 space-y-5">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>Tiền phòng ({nights} đêm)</span>
                                        <span className="font-bold text-slate-900">{formatCurrency(roomPriceTotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>Thuế & Phí dịch vụ</span>
                                        <span className="text-emerald-600 font-medium italic text-xs">Đã bao gồm</span>
                                    </div>
                                </div>

                                {/* BOX VOUCHER */}
                                <div className="pt-4 border-t border-slate-100">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="text-[11px] font-black text-slate-800 uppercase tracking-tighter">Mã giảm giá</label>
                                        <button
                                            onClick={() => setShowWallet(!showWallet)}
                                            className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                                        >
                                            <Ticket size={12}/> {showWallet ? "Đóng ví" : "Chọn từ ví"}
                                        </button>
                                    </div>

                                    <div className="flex gap-2">
                                        <div className="flex-1 relative">
                                            <input
                                                className={`w-full border ${promoError ? 'border-red-300 bg-red-50' : 'border-slate-200'} px-4 py-2.5 rounded-xl text-sm outline-none uppercase font-bold focus:border-blue-500`}
                                                placeholder="Nhập mã ưu đãi"
                                                value={promoCode}
                                                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                                disabled={!!promoData}
                                            />
                                            {isCheckingPromo && <Loader2 size={14} className="absolute right-3 top-3.5 animate-spin text-blue-500"/>}
                                        </div>
                                        <button
                                            onClick={() => promoData ? handleRemoveCoupon() : handleApplyCoupon()}
                                            className={`px-4 rounded-xl text-xs font-bold transition-all shadow-sm ${promoData ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-600'}`}
                                        >
                                            {promoData ? "Bỏ" : "Áp dụng"}
                                        </button>
                                    </div>

                                    {showWallet && (
                                        <div className="mt-2 bg-white border border-slate-100 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y z-50 relative">
                                            {availableCoupons.map((cp) => (
                                                <div key={cp.id} onClick={() => handleApplyCoupon(cp.code)} className="p-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center">
                                                    <div>
                                                        <div className="text-xs font-bold text-slate-700">{cp.code}</div>
                                                        <div className="text-[10px] text-slate-500">Giảm {cp.typeDiscount === "PERCENT" ? `${cp.discountVal}%` : formatCurrency(cp.discountVal)}</div>
                                                    </div>
                                                    <ChevronRight size={14} className="text-slate-300"/>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {promoError && <div className="mt-2 flex items-center gap-1 text-red-500 text-[10px] font-bold italic"><AlertCircle size={12}/> {promoError}</div>}
                                    {promoData && <div className="mt-2 flex items-center gap-1 text-emerald-600 text-[10px] font-bold italic bg-emerald-50 p-2 rounded-lg"><CheckCircle2 size={12}/> Giảm thành công: -{formatCurrency(discountAmount)}</div>}
                                </div>

                                <div className="border-t border-slate-100 pt-4 space-y-4">
                                    <div className="space-y-2">
                                        {selectedAddons.length > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-600 font-medium">Dịch vụ thêm</span>
                                                <span className="text-slate-800 font-bold">+{formatCurrency(addonsTotal)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-black text-slate-900 uppercase tracking-tighter">Giá quyết toán:</span>
                                            <span className="text-xl font-black text-purple-600">{formatCurrency(currentGrandTotal)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <input type="checkbox" className="w-4 h-4 text-blue-600 mt-0.5" checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)}/>
                                        <label className="text-[11px] text-slate-500 leading-tight">
                                            Tôi xác nhận các thông tin khách hàng là chính xác và đồng ý với <span className="text-blue-600 font-bold">Điều khoản đặt phòng</span>.
                                        </label>
                                    </div>

                                    <button
                                        onClick={handleConfirmBooking}
                                        disabled={isSubmitting || !isAgreed}
                                        className={`w-full py-4 text-white font-black rounded-xl shadow-lg flex justify-center items-center gap-2 ${isSubmitting || !isAgreed ? 'bg-slate-300' : 'bg-blue-600 hover:bg-blue-700'}`}
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <><CreditCard size={18}/> XÁC NHẬN ĐẶT NGAY</>}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* BOX GIỮ CHỖ AN TOÀN  */}
                        <div
                            className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldCheck size={80}/>
                            </div>
                            <h4 className="font-bold text-[15px] mb-1 flex items-center gap-2"><ShieldCheck
                                size={18}/> Giữ chỗ an toàn</h4>
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
                                <PhoneCall size={18}/>
                                <span className="text-base">1900 1234</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}