import React from "react";
import { useNavigate } from "react-router-dom";
import { Eye, MapPin, Star, Building2 } from "lucide-react";
import { MOCK_HOTEL_IMAGES } from "@/constant/agency_mockData.js";

const DemoHotelCard = ({ hotel }) => {
    const navigate = useNavigate();

    const hotelImg = MOCK_HOTEL_IMAGES.find(
        img => img.hotel_id === hotel.hotel_id && img.is_cover === true
    )?.image_url || "https://images.unsplash.com/photo-1566073771259-6a8506099945";
    const starCount = hotel.star_rating || 0;

    const getAmenities = () => {
        if (Array.isArray(hotel.amenities)) return hotel.amenities;
        try {
            // Nếu là string dạng "['Wifi', 'Pool']" thì replace để parse
            return hotel.amenities.replace(/[\[\]']/g, "").split(",").map(item => item.trim());
        } catch (e) {
            return [];
        }
    };

    const handleViewDetail = (e) => {
        if (e) e.stopPropagation();
        // Route dành cho Agency demo
        navigate(`/demo-agency/search-hotel/hotels/${hotel.hotel_id}`);
    };

    return (
        <div
            onClick={handleViewDetail}
            className="bg-white border border-slate-100 rounded-[28px] p-4 flex flex-col md:flex-row gap-6 hover:shadow-2xl hover:border-blue-200 transition-all group overflow-hidden relative cursor-pointer"
        >
            {/* 1. KHỐI ẢNH (Bên trái) */}
            <div className="w-full md:w-[260px] h-[180px] rounded-[20px] overflow-hidden shrink-0 relative">
                <img
                    src={hotelImg}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt={hotel.hotel_name}
                />
            </div>

            {/* 2. NỘI DUNG (Bên phải) */}
            <div className="flex-1 flex flex-col justify-between py-1 text-left">
                <div>
                    <div className="flex justify-between items-start">
                        <div className="max-w-[75%]">
                            <h3 className="text-[#003580] font-black text-[19px] leading-tight uppercase tracking-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                                {hotel.hotel_name}
                            </h3>

                            {/* Hạng sao & Đánh giá */}
                            <div className="flex items-center gap-1.5 mt-2">
                                <div className="flex text-yellow-400">
                                    {[...Array(starCount)].map((_, i) => (
                                        <Star key={i} size={13} fill="currentColor" />
                                    ))}
                                </div>
                                <span className="text-[#003580] text-[11px] font-black uppercase ml-1 italic opacity-70">
                                    Tiêu chuẩn {starCount} sao
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Địa chỉ */}
                    <p className="text-slate-400 text-[11px] font-bold mt-4 flex items-center gap-1 italic">
                        <MapPin size={12} className="text-blue-500 shrink-0" />
                        <span className="truncate">{hotel.address}, {hotel.city}</span>
                    </p>
                </div>

                {/* 3. FOOTER CARD (Tiện ích & Nút bấm) */}
                <div className="flex justify-between items-end mt-4">
                    {/* Tiện ích */}
                    <div className="flex gap-1.5 flex-wrap max-w-[60%]">
                        {getAmenities().slice(0, 3).map((item, idx) => (
                            <span
                                key={idx}
                                className="px-2.5 py-1 bg-slate-50 text-slate-400 text-[8px] font-black rounded-lg uppercase border border-slate-100 flex items-center gap-1"
                            >
                                <Building2 size={10} /> {item}
                            </span>
                        ))}
                    </div>

                    {/* Nút xem chi tiết */}
                    <button
                        onClick={handleViewDetail}
                        className="bg-[#003580] text-white px-7 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2 shrink-0 active:scale-95"
                    >
                        <Eye size={14} strokeWidth={3} /> Xem phòng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DemoHotelCard;