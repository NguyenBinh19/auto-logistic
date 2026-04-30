import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { format, addDays, parseISO, isBefore, isAfter } from "date-fns";
import {
    MapPin, Star, Check, Users, Maximize, Info,
    Calendar as CalendarIcon, ChevronRight
} from "lucide-react";
import GalleryModal from "../../components/common/Hotel/GalleryModal.jsx";
import publicApi from "../../services/axios.config.js";
import { bookingService } from "@/services/booking.service";
import { roomTypeService } from "@/services/roomtypes.service.js";
import RoomDetailModal from "@/components/agency/booking/RoomDetailModal.jsx"
import { ROLE_GROUP } from "../../constant/roles.js";

export default function HotelDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    // States
    const [openGallery, setOpenGallery] = useState(false);
    const [hotel, setHotel] = useState(null);
    const [roomTypes, setRoomTypes] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [selectedDetailRoom, setSelectedDetailRoom] = useState(null);

    const [dates, setDates] = useState({
        checkIn: format(new Date(), 'yyyy-MM-dd'),
        checkOut: format(addDays(new Date(), 1), 'yyyy-MM-dd')
    });
    const [tempDates, setTempDates] = useState({ ...dates });

    // Role Logic
    const token = localStorage.getItem("accessToken");
    let roles = [];
    if (token) {
        try {
            const decoded = jwtDecode(token);
            roles = decoded.scope || [];
        } catch (err) {
            console.error("Invalid token");
        }
    }

    const isAgency = ROLE_GROUP.AGENCY.some(role => roles.includes(role));
    const isHotel = ROLE_GROUP.HOTEL.some(role => roles.includes(role));

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    // Fetch Logic
    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setLoadingRooms(true);
            try {
                const [hotelRes, staticRoomsData, availabilityData] = await Promise.all([
                    publicApi.get(`/hotels/${id}`),
                    roomTypeService.getRoomTypesDetailByHotelId(id).catch(() => ({ result: [] })),
                    bookingService.checkAvailability({
                        hotelId: Number(id),
                        checkIn: dates.checkIn,
                        checkOut: dates.checkOut
                    }).catch(() => ({ result: [] }))
                ]);

                setHotel(hotelRes.data.result);
                const staticList = staticRoomsData.result || [];
                const dynamicList = availabilityData.result || [];

                const mergedRooms = staticList.map(staticRoom => {
                    const dynamicRoom = dynamicList.find(d => d.roomTypeId === staticRoom.roomTypeId);
                    const isInactive = staticRoom.roomStatus?.toLowerCase() === 'inactive';

                    return {
                        id: staticRoom.roomTypeId,
                        name: staticRoom.roomTitle,
                        description: staticRoom.description,
                        maxAdults: staticRoom.max_adults || 2,
                        maxChildren: staticRoom.max_children || 0,
                        area: staticRoom.room_area || 0,
                        bedType: staticRoom.bedType || "Giường đôi",
                        amenities: Array.isArray(staticRoom.amenities) ? staticRoom.amenities : [],
                        price: dynamicRoom?.price || 0,
                        quantity: isInactive ? 0 : (dynamicRoom?.quantityAvaiable || 0),
                        isSoldOut: isInactive || !dynamicRoom || dynamicRoom.quantityAvaiable <= 0,
                        roomStatus: staticRoom.roomStatus
                    };
                });
                setRoomTypes(mergedRooms);
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setLoadingRooms(false);
            }
        };
        fetchData();
    }, [id, dates]);

    const handleUpdateDates = () => {
        const checkIn = parseISO(tempDates.checkIn);
        const checkOut = parseISO(tempDates.checkOut);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (isBefore(checkIn, today)) {
            alert("Ngày nhận phòng không được ở quá khứ.");
            return;
        }
        if (!isAfter(checkOut, checkIn)) {
            alert("Ngày trả phòng phải sau ngày nhận ít nhất 1 đêm.");
            return;
        }
        setDates(tempDates);
    };

    if (!hotel) return (
        <div className="flex justify-center items-center h-screen">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const gallery = hotel?.images?.length > 0 ? hotel.images : ["https://pix8.agoda.net/hotelImages/default.jpg"];

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="flex flex-col min-h-screen relative">

                <main className="max-w-[1200px] mx-auto w-full pb-24 pt-8">
                    {/* --- HOTEL INFO SECTION --- */}
                    <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
                        <div className="relative h-[480px] bg-slate-200">
                            <img
                                src={hotel.images?.[0]}
                                className="w-full h-full object-cover cursor-pointer"
                                alt="Hotel"
                                onClick={() => setOpenGallery(true)}
                            />
                            {hotel.images?.length > 1 && (
                                <div className="absolute right-6 bottom-6 bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-3 w-[220px]">
                                    <div className="grid grid-cols-2 gap-2">
                                        {hotel.images.slice(1, 5).map((img, i) => (
                                            <img
                                                key={i}
                                                src={img}
                                                onClick={() => setOpenGallery(true)}
                                                className="h-20 w-full object-cover rounded-xl cursor-pointer hover:opacity-90 transition"
                                            />
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setOpenGallery(true)}
                                        className="mt-3 w-full text-xs font-bold text-blue-600 hover:underline"
                                    >
                                        Xem tất cả {hotel.images.length} ảnh
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="p-10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex text-yellow-400">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star key={i} size={16} fill="currentColor" />
                                    ))}
                                </div>
                                <span className="text-slate-500 text-sm font-bold">Chế độ xem trước</span>
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 mb-2">{hotel.hotelName}</h1>
                            <div className="flex items-center gap-2 text-blue-600 font-bold mb-6 text-sm">
                                <MapPin size={18} />
                                <span>{hotel.address}</span>
                            </div>
                            <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-100">
                                {hotel.amenities?.map((am, idx) => (
                                    <span key={idx} className="bg-slate-50 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                                        {am}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* --- DATE FILTER SECTION --- */}
                    <div className="bg-white p-6 mb-10 rounded-2xl shadow-xl border border-slate-100 flex items-end gap-6 sticky top-20 z-40">
                        <div className="flex-1 space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <CalendarIcon size={14} className="text-blue-600" /> Ngày nhận
                            </label>
                            <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-700" value={tempDates.checkIn} onChange={(e) => setTempDates({ ...tempDates, checkIn: e.target.value })} />
                        </div>
                        <div className="flex-1 space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <CalendarIcon size={14} className="text-blue-600" /> Ngày trả
                            </label>
                            <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-700" value={tempDates.checkOut} onChange={(e) => setTempDates({ ...tempDates, checkOut: e.target.value })} />
                        </div>
                        <button onClick={handleUpdateDates} className="bg-slate-800 hover:bg-black text-white px-8 h-[50px] rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95">
                            Kiểm tra tồn kho
                        </button>
                    </div>

                    {/* --- ROOM LIST SECTION --- */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-black text-slate-800">Danh sách loại phòng</h2>
                        {loadingRooms ? (
                            <div className="py-24 text-center bg-white rounded-3xl border border-dashed">
                                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="font-bold text-slate-400">Đang tải dữ liệu tồn kho...</p>
                            </div>
                        ) : roomTypes.map((room) => (
                            <div
                                key={room.id}
                                className={`bg-white border rounded-[24px] flex flex-col md:flex-row p-5 gap-6 transition-all duration-300 border-slate-100 shadow-sm hover:border-blue-200 ${room.isSoldOut ? 'opacity-75' : ''}`}
                            >
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="space-y-1">
                                                <h3 className="text-xl font-black leading-tight text-slate-900">{room.name}</h3>
                                                <div className="flex flex-wrap gap-3 items-center">
                                                    <span className={`text-[10px] px-2.5 py-1 rounded-md font-black uppercase tracking-wider border ${room.roomStatus === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                                        {room.roomStatus}
                                                    </span>
                                                    <button onClick={() => setSelectedDetailRoom(room)} className="group flex items-center gap-1.5 text-blue-600 text-[11px] font-black uppercase tracking-widest hover:text-blue-800 transition-all">
                                                        <Info size={14} />
                                                        <span className="border-b border-blue-200 group-hover:border-blue-600">Thông tin chi tiết</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full text-[12px] text-slate-600 font-bold border border-slate-100">
                                                <Users size={14} className="text-slate-400" />
                                                {room.maxAdults} NL {room.maxChildren > 0 && `& ${room.maxChildren} TE`}
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full text-[12px] text-slate-600 font-bold border border-slate-100">
                                                <Maximize size={14} className="text-slate-400" />
                                                {room.area} m²
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-x-6 gap-y-2 pt-4 border-t border-slate-50">
                                        <div className="flex items-center gap-2 text-slate-400 text-[12px] font-bold">
                                            <Check size={12} strokeWidth={3} /> {room.bedType}
                                        </div>
                                    </div>
                                </div>

                                <div className="md:w-[260px] flex flex-col justify-center items-end bg-slate-50/50 rounded-2xl p-5 border border-slate-100/50">
                                    <div className="text-right w-full">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Giá bán công bố</p>
                                        <span className="text-2xl font-black tracking-tighter text-blue-600">
                                            {room.price > 0 ? formatCurrency(room.price) : "Liên hệ"}
                                        </span>
                                    </div>
                                    <div className={`mt-4 w-full py-2 px-3 rounded-xl text-center text-[11px] font-black uppercase tracking-wider ${room.quantity > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                        Trống: {room.quantity} phòng
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>

            {/* Modals */}
            {openGallery && <GalleryModal images={gallery} onClose={() => setOpenGallery(false)} />}
            {selectedDetailRoom && (
                <RoomDetailModal
                    roomId={selectedDetailRoom.id}
                    onClose={() => setSelectedDetailRoom(null)}
                />
            )}
        </div>
    );
}