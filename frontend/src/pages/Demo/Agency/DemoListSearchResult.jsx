import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { List, Star, MapPin, ChevronLeft, ChevronRight, Search, Building2 } from "lucide-react";
import HotelSearchForm from "@/components/demo/Agency/DemoSearchForm.jsx";
import FilterSidebar from "@/components/demo/Agency/DemoFilterGroup.jsx";
import HotelCard from "@/components/demo/Agency/DemoHotelCard.jsx";
import { MOCK_HOTELS } from "@/constant/agency_mockData.js";
import homepage from "@/assets/images/homepage.jpg";

export default function DemoHotelSearchContainer() {
    const [searchParams] = useSearchParams();

    // Lấy thông tin từ URL
    const keyword = searchParams.get("keyword") || "";
    const checkIn = searchParams.get("checkIn") || "";
    const checkOut = searchParams.get("checkOut") || "";
    const rooms = searchParams.get("rooms") || "1";
    const adults = searchParams.get("adults") || "2";
    const children = searchParams.get("children") || "0";

    // State lưu trữ dữ liệu bộ lọc
    const [filters, setFilters] = useState({ star_rating: [], amenities: [] });

    // State cho Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const filteredHotels = useMemo(() => {
        return MOCK_HOTELS.filter(hotel => {
            // 1. Lọc theo Keyword (Tên hoặc Thành phố)
            const matchKeyword = !keyword ||
                hotel.hotel_name.toLowerCase().includes(keyword.toLowerCase()) ||
                hotel.city.toLowerCase().includes(keyword.toLowerCase());

            // 2. Lọc Hạng Sao (star_rating từ SQL)
            const matchStar = filters.star_rating.length === 0 ||
                filters.star_rating.includes(hotel.star_rating);

            // 3. Lọc Tiện ích (Kiểm tra mảng amenities)
            const matchAmenities = filters.amenities.length === 0 || filters.amenities.every(a => {
                // Ép kiểu về mảng nếu hotel.amenities đang là string dạng "['A', 'B']"
                const hotelAmenitiesArray = Array.isArray(hotel.amenities)
                    ? hotel.amenities
                    : hotel.amenities.replace(/[\[\]']/g, "").split(",").map(item => item.trim());

                return hotelAmenitiesArray.includes(a);
            });

            return matchKeyword && matchStar && matchAmenities;
        });
    }, [filters, keyword]);

    // --- LOGIC PHÂN TRANG ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentHotels = filteredHotels.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredHotels.length / itemsPerPage);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 400, behavior: 'smooth' });
    };

    const handleApplyFilter = (newFilters) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    return (
        <div className="w-full bg-slate-50 min-h-screen font-sans pb-20">
            {/* Banner Section */}
            <section className="relative h-[420px] flex items-center justify-center px-4">
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${homepage})` }}
                >
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>
                </div>
                <div className="relative z-10 w-full max-w-5xl text-center">
                    <h1 className="text-white text-4xl md:text-5xl font-black mb-6 tracking-tight uppercase leading-tight">
                        Nền tảng Đặt phòng B2B An toàn <br/> & Thông minh nhất Việt Nam
                    </h1>
                    <p className="text-slate-200 text-lg mb-10 font-medium opacity-90 italic">
                        Giải pháp giữ tiền trung gian (Escrow) bảo vệ dòng tiền 100% - Tích hợp AI tìm kiếm phòng siêu tốc
                    </p>
                    <div className="bg-white p-3 rounded-2xl shadow-2xl">
                        {/* SearchForm */}
                        <HotelSearchForm variant="hero" />
                    </div>
                </div>
            </section>

            <div className="max-w-[1300px] mx-auto py-8 px-6">
                {/* Search Info Header */}
                <div className="bg-white rounded-[24px] border border-slate-100 p-6 mb-8 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="text-left">
                            <h2 className="text-[#003580] font-black text-xl flex items-center gap-2 uppercase tracking-tighter">
                                <Search size={22} strokeWidth={3} className="text-blue-600" /> Kết quả tìm kiếm
                            </h2>
                            <div className="flex flex-wrap items-center gap-4 text-slate-400 text-[12px] font-bold mt-2 italic">
                                <span className="flex items-center gap-1">
                                    <MapPin size={14} className="text-blue-500"/> {keyword || "Tất cả địa điểm"}
                                </span>
                                {checkIn && checkOut && <span>📅 {checkIn} → {checkOut}</span>}
                                {rooms && <span>🏨 {rooms} phòng</span>}
                                <span>👥 {adults} Người lớn{children !== "0" ? `, ${children} Trẻ em` : ""}</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[12px] font-black flex items-center gap-2 shadow-lg shadow-blue-100 uppercase tracking-widest transition-all">
                                <List size={16} /> DANH SÁCH
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-50">
                        <span className="text-[11px] font-black text-slate-400 uppercase italic">
                            Hiển thị: <span className="text-slate-800">{filteredHotels.length} khách sạn phù hợp</span>
                        </span>
                        <div className="h-4 w-[1px] bg-slate-200 mx-2"></div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Component Bộ Lọc */}
                    <aside className="w-full lg:w-[280px] shrink-0">
                        <FilterSidebar onApplyFilter={handleApplyFilter} />
                    </aside>

                    {/* Danh sách Khách sạn */}
                    <div className="flex-1 space-y-5">
                        {filteredHotels.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-[32px] border border-slate-100 shadow-sm">
                                <Building2 size={48} className="mx-auto text-slate-200 mb-4" />
                                <p className="font-bold text-slate-500 uppercase text-sm tracking-widest">
                                    Không tìm thấy khách sạn nào khớp với tiêu chí của bạn.
                                </p>
                                <button
                                    onClick={() => setFilters({ star_rating: [], amenities: [] })}
                                    className="mt-4 text-blue-600 font-bold text-xs underline"
                                >
                                    Xóa tất cả bộ lọc
                                </button>
                            </div>
                        ) : (
                            currentHotels.map((hotel) => (
                                <HotelCard key={hotel.hotel_id} hotel={hotel} />
                            ))
                        )}

                        {/* Pagination Component */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-12">
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                >
                                    <ChevronLeft size={18}/>
                                </button>

                                {[...Array(totalPages)].map((_, index) => {
                                    const pageNum = index + 1;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => paginate(pageNum)}
                                            className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold text-[13px] transition-all shadow-sm ${
                                                currentPage === pageNum
                                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                                                    : "border border-slate-200 bg-white text-slate-600 hover:border-blue-500"
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                >
                                    <ChevronRight size={18}/>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}