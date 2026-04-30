import { useEffect, useState } from "react";
import { getFeaturedHotels } from "@/services/hotel.service.js";
import { useNavigate } from "react-router-dom";

const HotelSection = () => {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const token = localStorage.getItem("accessToken");
    const isLoggedIn = !!token;

    useEffect(() => {
        getFeaturedHotels()
            .then((data) => {
                const mapped = data.map((h) => ({
                    id: h.hotelId,
                    name: h.hotelName,
                    city: h.city,
                    stars: h.starRating,
                    image:
                        h.coverImage ||
                        h.images?.[0] ||
                        "https://images.unsplash.com/photo-1566073771259-6a8506099945",
                }));

                setHotels(mapped);
            })
            .catch((err) => {
                console.error("Load featured hotels failed", err);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <section className="py-16 text-center text-slate-500">
                Đang tải khách sạn...
            </section>
        );
    }

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4">

                {/* Header */}
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                        Khách sạn nổi bật
                    </h2>
                    <p className="text-slate-500 text-sm">
                        Những đối tác uy tín trong hệ thống của chúng tôi
                    </p>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {hotels.map((home) => (
                        <div
                            key={home.id}
                            onClick={() => navigate(`/agency/search-hotel/hotels/${home.id}`)}
                            className="bg-white rounded-xl shadow-md hover:shadow-lg transition cursor-pointer"
                        >
                            {/* Image */}
                            <div className="overflow-hidden rounded-t-xl">
                                <img
                                    src={home.image}
                                    alt={home.name}
                                    className="w-full h-44 object-cover hover:scale-105 transition-transform duration-300"
                                />
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <h3 className="font-semibold text-slate-900 mb-1">
                                    {home.name}
                                </h3>

                                {/* Stars */}
                                <div className="text-yellow-400 text-sm mb-1">
                                    {"★".repeat(home.stars || 0)}
                                </div>

                                <div className="text-sm text-slate-500 mb-2">
                                    {home.city}
                                </div>

                                {isLoggedIn ? (
                                    <div className="text-sm text-blue-600 font-medium">
                                        Xem thông tin khách sạn
                                    </div>
                                ) : (
                                    <div className="text-sm text-red-600 font-medium">
                                        Đăng nhập để xem giá B2B
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default HotelSection;
