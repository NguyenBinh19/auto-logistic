import { useState } from "react";
import { parseISO, differenceInSeconds } from "date-fns";
import { promotionService} from "@/services/coupon.service.js";

export const useBookingPromotion = (bookingData, navigate) => {
    const [promoCode, setPromoCode] = useState("");
    const [promoData, setPromoData] = useState(null);
    const [isCheckingPromo, setIsCheckingPromo] = useState(false);
    const [promoError, setPromoError] = useState("");
    const [showWallet, setShowWallet] = useState(false);
    const [availableCoupons, setAvailableCoupons] = useState([]);

    // 1. Fetch danh sách voucher từ Wallet
    const fetchWalletCoupons = async () => {
        try {
            const payload = {
                hotelId: bookingData.hotelId,
                checkin: bookingData.checkInDate,
                checkout: bookingData.checkOutDate,
                billAmount: bookingData.totalPrice
            };

            const response = await promotionService.getAvailablePromotions(payload);


            if (response?.result) {
                setAvailableCoupons(response.result);
            }
        } catch (error) {
            console.error("Lỗi lấy danh sách coupon wallet:", error);
        }
    };


    const handleApplyCoupon = async (codeFromWallet = null) => {
        const targetCode = codeFromWallet || promoCode;
        if (!targetCode) return;

        setIsCheckingPromo(true);
        setPromoError("");
        try {
            const payload = {
                hotelId: bookingData.hotelId,
                code: targetCode.trim(),
                checkin: bookingData.checkInDate,
                checkout: bookingData.checkOutDate,
                billAmount: bookingData.totalPrice
            };

            const response = await promotionService.checkPromotionCode(payload);

            if (response?.result) {
                setPromoData(response.result);
                setPromoCode(targetCode);
                setShowWallet(false);
            } else {

                setPromoError("Mã giảm giá không khả dụng.");
            }
        } catch (error) {

            const errMsg = error.response?.data?.message || "Mã không hợp lệ hoặc đã hết hạn.";
            setPromoError(errMsg);
            setPromoData(null);
        } finally {
            setIsCheckingPromo(false);
        }
    };

    const handleRemoveCoupon = () => {
        setPromoData(null);
        setPromoCode("");
        setPromoError("");
    };

    // 3. Tính toán giá trị giảm
    const basePrice = Number(bookingData.totalPrice) || 0;
    let discountAmount = 0;

    if (promoData) {
        if (promoData.typeDiscount === "PERCENT") {
            discountAmount = (basePrice * promoData.discountVal) / 100;
            // Chặn mức giảm tối đa (Max Discount)
            if (promoData.maxDiscount && discountAmount > promoData.maxDiscount) {
                discountAmount = promoData.maxDiscount;
            }
        } else {
            // Loại FIXED_AMOUNT
            discountAmount = promoData.discountVal;
        }
    }

    const finalPrice = Math.max(0, basePrice - discountAmount);

    return {
        promoCode, setPromoCode,
        promoData,
        isCheckingPromo,
        promoError,
        showWallet, setShowWallet,
        availableCoupons,
        fetchWalletCoupons,
        handleApplyCoupon,
        handleRemoveCoupon,
        discountAmount, // BigDecimal bên Java
        finalPrice
    };
};