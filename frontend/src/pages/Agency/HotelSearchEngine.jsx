import React from "react";
import { useNavigate } from "react-router-dom";
import HotelSearchForm from "@/components/agency/booking/SearchForm.jsx";
import { History, Star, Gift, Crown, Building2 } from "lucide-react";
import homepage from "@/assets/images/homepage.jpg";
import phuQuocImg from "@/assets/images/phu-quoc.jpg";
import vungTauImg from "@/assets/images/vung-tau.jpg";
import daLatImg from "@/assets/images/da-lat.jpg";
import daNangImg from "@/assets/images/da-nang.jpg";
import quyNhonImg from "@/assets/images/quy-nhon.webp";
import nhaTrangImg from "@/assets/images/nha-trang.webp";
import phanThietImg from "@/assets/images/phan-thiet.png";
import phuYenImg from "@/assets/images/phu-yen.jpg";

const DESTINATIONS = [
    { id: 1, name: "Phú Quốc",  img: phuQuocImg, gridClass: "md:col-span-2 md:row-span-1" },
    { id: 4, name: "Vũng Tàu", img: vungTauImg, gridClass: "md:col-span-1 md:row-span-2" },
    { id: 2, name: "Đà Lạt", img: daLatImg, gridClass: "md:col-span-1 md:row-span-1" },
    { id: 3, name: "Đà Nẵng",  img: daNangImg, gridClass: "md:col-span-1 md:row-span-1" },
];

const DESTINATIONS_GROUP_2 = [
    { id: 5, name: "Nha Trang", img: nhaTrangImg, gridClass: "md:col-span-1 md:row-span-2" },
    { id: 6, name: "Quy Nhơn",  img: quyNhonImg, gridClass: "md:col-span-2 md:row-span-1" },
    { id: 7, name: "Phan Thiết", img: phanThietImg, gridClass: "md:col-span-1 md:row-span-1" },
    { id: 8, name: "Phú Yên",  img: phuYenImg, gridClass: "md:col-span-1 md:row-span-1" },
];

export default function HotelSearchEngine() {
    const navigate = useNavigate();
    const handleQuickSearch = (name) => {
        // const today = new Date();
        // const tomorrow = new Date(today);
        // tomorrow.setDate(tomorrow.getDate() + 1);
        // const nextDay = new Date(tomorrow);
        // nextDay.setDate(nextDay.getDate() + 2);

        const params = new URLSearchParams();
        params.set("keyword", name);
        // params.set("checkIn", tomorrow.toISOString().split("T")[0]);
        // params.set("checkOut", nextDay.toISOString().split("T")[0]);
        // params.set("rooms", "1");
        // params.set("adults", "2");
        // params.set("children", "0");

        navigate(`/agency/search-hotel/list?${params.toString()}`);
    };

    return (
        <div className="w-full bg-[#F8FAFC] min-h-screen">
            {/* ================= HERO SECTION ================= */}
            <section className="relative h-[550px] flex flex-col items-center justify-center text-center px-4 overflow-hidden">

                {/* 1. Background Image & Overlay  */}
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000"
                    style={{ backgroundImage: `url(${homepage})` }}
                >
                    {/* Lớp phủ màu đen mờ */}
                    <div className="absolute inset-0 bg-black/70"></div>
                    {/* Lớp gradient nhẹ phía dưới */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#F8FAFC]/20"></div>
                </div>

                {/* 2. Content (Text & Headline) */}
                <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
                    <h1 className="text-white text-4xl md:text-6xl font-black mb-4 tracking-tight drop-shadow-2xl">
                        Tìm kiếm khách sạn và resort
                    </h1>
                    <p className="text-blue-50 text-sm md:text-lg opacity-90 max-w-2xl mx-auto font-medium mb-10 drop-shadow-md">
                        Hệ thống tìm kiếm thông minh dành riêng cho đại lý du lịch với giá tốt nhất và khuyến mãi đặc biệt
                    </p>

                    {/* 3. Search Bar Widget */}
                    <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-5 duration-700">
                        <div className="bg-white p-3 rounded-2xl shadow-2xl">
                            <HotelSearchForm variant="hero" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= BÊN DƯỚI ================= */}
            <div className="max-w-6xl mx-auto py-16 px-3">
                {/* Tiêu đề vùng trắng */}
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                        Điểm đến yêu thích trong nước
                    </h2>
                    <p className="text-slate-500 font-medium mt-1">
                        Lên rừng xuống biển. Trọn vẹn Việt Nam
                    </p>
                </div>

                {/* Grid ảnh địa điểm */}
                {/* Grid nhóm 1 */}
                <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 h-auto md:h-[500px] mb-6">
                    {DESTINATIONS.map((dest) => (
                        <DestinationCard key={dest.id} dest={dest} onSearch={handleQuickSearch} />
                    ))}
                </div>

                {/* Grid nhóm 2 */}
                <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 h-auto md:h-[500px]">
                    {DESTINATIONS_GROUP_2.map((dest) => (
                        <DestinationCard key={dest.id} dest={dest} onSearch={handleQuickSearch} />
                    ))}
                </div>
            </div>
        </div>
    );
}
// Component phụ để tránh lặp code
function DestinationCard({ dest, onSearch }) {
    return (
        <div
            onClick={() => onSearch(dest.name)}
            className={`relative overflow-hidden rounded-2xl cursor-pointer group shadow-lg ${dest.gridClass}`}
        >
            <img
                src={dest.img}
                alt={dest.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
            <div className="absolute bottom-5 left-6 text-white">
                <h3 className="text-2xl font-black drop-shadow-md">{dest.name}</h3>
            </div>
        </div>
    );
}

function PromoCard({ icon, bgColor, textColor, title, desc, badgeText, badgeSub }) {
    return (
        <div className="bg-white border border-slate-50 rounded-[32px] p-8 flex flex-col items-center text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className={`${bgColor} ${textColor} p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform`}>{icon}</div>
            <h3 className="font-black text-slate-800 mb-1 uppercase tracking-tight">{title}</h3>
            <p className="text-[11px] text-slate-500 font-bold mb-6 italic leading-relaxed">{desc}</p>
            <div className={`${bgColor} ${textColor} w-full py-4 rounded-2xl border border-white`}>
                <div className="font-black text-lg tracking-widest">{badgeText}</div>
                <div className="text-[10px] font-bold italic opacity-70 uppercase tracking-tighter">{badgeSub}</div>
            </div>
        </div>
    );
}