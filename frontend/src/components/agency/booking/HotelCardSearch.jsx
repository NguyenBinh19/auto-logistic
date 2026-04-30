import { useNavigate } from "react-router-dom";
import { Eye, MapPin, Star, CheckCircle2, Plus, AlertTriangle } from "lucide-react"; // Thêm icon để trực quan hơn
import React from "react";
import { useCompare } from '@/context/CompareContext.jsx';
import { jwtDecode } from "jwt-decode";
const DEFAULT_HOTEL_IMAGE = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb";

const HotelCard = ({ hotel, isSuggested = false }) => {
    const navigate = useNavigate();
    const { compareItems, toggleCompareItem } = useCompare();

    const isSelected = compareItems.some(item => item.hotelId === hotel.hotelId);

    const getRoleFromToken = () => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) return "AGENCY";

            const decoded = jwtDecode(token);
            let roles = decoded?.scope;

            if (!Array.isArray(roles)) {
                roles = roles ? [roles] : [];
            }

            // Ưu tiên kiểm tra ROLE_HOTEL
            if (roles.some(r => r.startsWith("ROLE_HOTEL"))) {
                return "HOTEL";
            }
            return "AGENCY";
        } catch (err) {
            return "AGENCY";
        }
    };

    const coverImg = (hotel.images && hotel.images.length > 0 && hotel.images[0])
        ? hotel.images[0]
        : DEFAULT_HOTEL_IMAGE;

    const starCount = hotel.starRating || 0;
    const formattedRating = (hotel.avgRating != null && hotel.avgRating > 0)
        ? hotel.avgRating.toFixed(1)
        : "Chưa có";

    const handleViewDetail = (e) => {
        if (e) e.stopPropagation();
        const userRole = getRoleFromToken();
        if (userRole === "HOTEL") {
            navigate(`/hotel/list-hotel/hotels/${hotel.hotelId}`);
        } else {
            navigate(`/agency/search-hotel/hotels/${hotel.hotelId}`);
        }
    };

    const handleToggleCompare = (e) => {
        e.stopPropagation();
        toggleCompareItem(hotel);
    };

    return (
        <div
            onClick={handleViewDetail} // Click vào card để xem chi tiết
            className={`bg-white border rounded-[28px] p-4 flex gap-6 hover:shadow-2xl transition-all group overflow-hidden relative cursor-pointer ${
                isSuggested
                    ? 'border-slate-100 hover:border-blue-200'
                    : isSelected
                        ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/10'
                        : 'border-slate-100 hover:border-blue-200'
            }`}
        >
            {/* Badge đề xuất */}
            {isSuggested && (
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-amber-100 border border-amber-300 rounded-full px-3 py-1">
                    <AlertTriangle size={12} className="text-amber-600" />
                    <span className="text-[10px] font-bold text-amber-700">Đề xuất - Không đủ sức chứa</span>
                </div>
            )}
            {/* Ảnh khách sạn */}
            <div className="w-[260px] h-[180px] rounded-[20px] overflow-hidden shrink-0 relative">
                <img src={coverImg} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={hotel.hotelName} />
                {isSelected && (
                    <div className="absolute inset-0 bg-blue-600/20 backdrop-blur-[2px] flex items-center justify-center">
                        <CheckCircle2 size={40} className="text-white drop-shadow-lg" />
                    </div>
                )}
            </div>

            <div className="flex-1 flex flex-col justify-between py-1">
                <div className="flex justify-between items-start">
                    <div className="max-w-[75%]">
                        <h3 className="text-[#003580] font-black text-[19px] leading-tight uppercase tracking-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                            {hotel.hotelName}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-2">
                            <div className="flex text-yellow-400">
                                {[...Array(starCount)].map((_, i) => <Star key={i} size={13} fill="currentColor" />)}
                            </div>
                            <span className="text-[#003580] text-[11px] font-black uppercase ml-1 italic">
                                {formattedRating !== "Chưa có" ? `${formattedRating}/5` : "Chưa có đánh giá"} ({hotel.totalReviews || 0} Reviews)
                            </span>
                        </div>
                        <p className="text-slate-400 text-[11px] font-bold mt-4 flex items-center gap-1 italic">
                            <MapPin size={12} className="text-blue-500 shrink-0" />
                            <span className="truncate">{hotel.address}, {hotel.city}</span>
                        </p>
                        {hotel.totalAvailableRooms != null && (
                            <div className="flex items-center gap-3 mt-2 text-[10px] font-bold">
                                <span className="text-slate-500">Còn trống: <span className="text-blue-600">{hotel.totalAvailableRooms} phòng</span></span>
                                {hotel.totalMaxGuests != null && (
                                    <span className="text-slate-500">Sức chứa tối đa: <span className="text-blue-600">{hotel.totalMaxGuests} khách</span></span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-between items-end mt-4">
                    <div className="flex gap-1.5 flex-wrap max-w-[50%]">
                        {hotel.amenities && hotel.amenities.slice(0, 3).map(t => (
                            <span key={t} className="px-2.5 py-1 bg-slate-50 text-slate-400 text-[8px] font-black rounded-lg uppercase border border-slate-100">
                                {t}
                            </span>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Nút so sánh */}
                        <button
                            onClick={handleToggleCompare}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                                isSelected
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'bg-white border-slate-200 text-slate-500 hover:border-blue-400 hover:text-blue-600'
                            }`}
                        >
                            {isSelected ? <CheckCircle2 size={14}/> : <Plus size={14}/>}
                            {isSelected ? "Đã chọn" : "So sánh"}
                        </button>

                        <button
                            onClick={handleViewDetail}
                            className="bg-[#003580] text-white px-7 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2 shrink-0"
                        >
                            <Eye size={14} strokeWidth={3} /> Xem phòng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HotelCard;