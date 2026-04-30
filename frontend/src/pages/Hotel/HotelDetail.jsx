import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { format, addDays, parseISO, differenceInSeconds, isBefore, isAfter } from "date-fns";
import {
    MapPin, Wifi, Coffee, Users, Snowflake,
    Maximize, Minus, Plus, Clock,
    Star, Utensils, Check, BedDouble, Calendar as CalendarIcon,
    ChevronRight, Image as ImageIcon, Info, AlertCircle
} from "lucide-react";
import GalleryModal from "../../components/common/Hotel/GalleryModal.jsx";
import publicApi from "../../services/axios.config.js";
import { bookingService } from "@/services/booking.service";
import { roomTypeService } from "@/services/roomtypes.service.js";
import RoomDetailModal from "@/components/agency/booking/RoomDetailModal.jsx"
import { ROLES, ROLE_GROUP } from "../../constant/roles.js";
import { MessageCircle } from "lucide-react";
import api from "../../services/axios.config.js";
const DEFAULT_HOTEL_IMAGE = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb";
// --- 1. SUB-COMPONENT: TIMER MODAL ---
const BookingTimerModal = ({ expiredAt, onExpire, onExtend, isExtending }) => {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (!expiredAt) return;
        const interval = setInterval(() => {
            const now = new Date();
            const end = typeof expiredAt === 'string' ? parseISO(expiredAt) : expiredAt;
            const diff = differenceInSeconds(end, now);
            if (diff <= 0) {
                clearInterval(interval);
                setTimeLeft(0);
                onExpire();
            } else {
                setTimeLeft(diff);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [expiredAt]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300 text-center">
                <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <Clock className="text-blue-600 w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-800">Đang giữ phòng</h3>
                <p className="text-slate-500 text-sm mt-2 font-medium">Phiên giữ phòng đã bắt đầu. Vui lòng hoàn tất trong thời gian quy định.</p>
                <div className={`text-6xl font-mono font-black my-8 ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-blue-600'}`}>
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>
                <div className="space-y-3">
                    <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg transition-all active:scale-95">TIẾP TỤC THANH TOÁN</button>
                    <button onClick={onExtend} disabled={isExtending || timeLeft <= 0} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
                        {isExtending ? <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div> : "GIA HẠN THÊM"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- 2. MAIN COMPONENT ---
export default function HotelDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [openGallery, setOpenGallery] = useState(false);
    const [hotel, setHotel] = useState(null);
    const [roomTypes, setRoomTypes] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [selectedDetailRoom, setSelectedDetailRoom] = useState(null);
    // Lấy ngày hiện tại theo định dạng YYYY-MM-DD
    const todayStr = new Date().toISOString().split("T")[0];

    const [dates, setDates] = useState({
        checkIn: format(new Date(), 'yyyy-MM-dd'),
        checkOut: format(addDays(new Date(), 1), 'yyyy-MM-dd')
    });
    const [tempDates, setTempDates] = useState({ ...dates });

    const [selectedRooms, setSelectedRooms] = useState([]);
    const [bookingSession, setBookingSession] = useState(null);
    const [isExtending, setIsExtending] = useState(false);
    const token = localStorage.getItem("accessToken");
    let roles = [];

    let currentUser = null;

    if (token) {
        try {
            const decoded = jwtDecode(token);

            currentUser = {
                userId: decoded.userId || decoded.sub,
            };

            console.log("Decoded token:", decoded);

            roles = decoded.scope || [];
        } catch (err) {
            console.error("Invalid token");
        }
    }
    const isAgency = ROLE_GROUP.AGENCY.some(role =>
        roles.includes(role)
    );
    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    // Tính toán tổng tiền dự kiến dựa trên mảng selectedRooms
    const totalEstimatedPrice = useMemo(() => {
        return selectedRooms.reduce((total, item) => total + (item.price * item.count), 0);
    }, [selectedRooms]);

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
        setSelectedRooms([]); // Reset lựa chọn khi đổi ngày vì giá/số lượng có thể thay đổi
    };

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

                    // Kiểm tra trạng thái Inactive
                    const isInactive = staticRoom.roomStatus?.toLowerCase() === 'inactive';

                    return {
                        id: staticRoom.roomTypeId,
                        name: staticRoom.roomTitle,
                        description: staticRoom.description,
                        maxAdults: staticRoom.maxAdults || 2,
                        maxChildren: staticRoom.maxChildren || 0,
                        area: staticRoom.roomArea || 0,
                        bedType: staticRoom.bedType || "Giường đôi",
                        amenities: Array.isArray(staticRoom.amenities) ? staticRoom.amenities : [],
                        price: dynamicRoom?.price || 0,
                        quantity: isInactive ? 0 : (dynamicRoom?.quantityAvaiable || 0),
                        // Nếu inactive THÌ coi như hết phòng luôn
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

    const handleUpdateQuantity = (room, delta) => {
        setSelectedRooms(prev => {
            const existing = prev.find(item => item.id === room.id);
            if (existing) {
                const newCount = existing.count + delta;
                if (newCount > room.quantity) {
                    alert(`Hệ thống chỉ còn trống ${room.quantity} phòng!`);
                    return prev;
                }
                if (newCount <= 0) return prev.filter(item => item.id !== room.id);
                return prev.map(item => item.id === room.id ? { ...item, count: newCount } : item);
            } else {
                if (delta <= 0) return prev;
                return [...prev, { ...room, count: 1 }];
            }
        });
    };

    const handleBookNow = async () => {
        if (selectedRooms.length === 0) return;

        try {
            const payload = {
                hotelId: Number(id),
                checkInDate: dates.checkIn,
                checkOutDate: dates.checkOut,
                items: selectedRooms.map(room => ({
                    roomTypeId: Number(room.id),
                    quantity: Number(room.count)
                }))
            };

            const res = await bookingService.holdRoom(payload);

            if (res?.result) {
                navigate("/agency/booking-checkout", {
                    state: {
                        holdCode: res.result.holdCode,
                        expiredAt: res.result.expiredAt,
                        hotelName: hotel.hotelName,
                        hotelId: hotel.hotelId,
                        address: hotel.address,
                        checkInDate: dates.checkIn,
                        checkOutDate: dates.checkOut,
                        totalPrice: totalEstimatedPrice,
                        // Truyền thông tin chi tiết từng loại phòng đã chọn
                        selectedRooms: selectedRooms.map(r => ({
                            id: r.id,
                            name: r.name,
                            count: r.count,
                            // Truyền chính xác giá trị người lớn/trẻ em lấy từ r (room)
                            maxAdults: r.maxAdults,
                            maxChildren: r.maxChildren,
                            price: r.price
                        }))
                    }
                });
            }
        } catch (error) {
            console.error("Lỗi đặt phòng:", error.response?.data);
            alert(`Thông báo: ${error.response?.data?.message || "Không thể giữ phòng!"}`);
        }
    };

    const handleOpenChat = async (hotel) => {
        try {
            if (!currentUser?.userId) {
                alert("Bạn cần đăng nhập để chat");
                return;
            }

            const res = await api.post("/chat/init", null, {
                params: {
                    hotelId: hotel.hotelId || hotel.id,
                    userId: currentUser.userId
                }
            });

            const convo = res.data;

            console.log("Chat created:", convo);

        } catch (err) {
            console.error("Chat init lỗi:", err);
        }
    };

    const handleExtendHold = async () => {
        if (!bookingSession) return;
        setIsExtending(true);
        try {
            const res = await bookingService.extendHold(bookingSession.holdCode);
            if (res?.result) {
                setBookingSession(prev => ({ ...prev, expiredAt: res.result.expiredAt }));
            }
        } catch (error) {
            alert("Hết thời gian gia hạn hoặc lỗi hệ thống!");
        } finally {
            setIsExtending(false);
        }
    };
    const gallery =
        hotel?.images?.length > 0
            ? hotel.images
            : ["https://pix8.agoda.net/hotelImages/186/186135/186135_17083113400050872001.jpg"];
    if (!hotel) return <div className="flex justify-center items-center h-screen"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

    const handleNegotiation = async () => {
        try {
            if (!currentUser?.userId) {
                alert("Bạn cần đăng nhập để chat");
                return;
            }

            if (!hotel?.hotelId && !hotel?.id) {
                alert("Không tìm thấy khách sạn");
                return;
            }

            if (selectedRooms.length === 0) {
                alert("Vui lòng chọn ít nhất 1 phòng để thương lượng");
                return;
            }

            const res = await api.post("/chat/init-nego", null, {
                params: {
                    hotelId: hotel.hotelId || hotel.id,
                    userId: currentUser.userId,
                    bookingId: null,
                    hotelName: hotel.hotelName,
                    room: selectedRooms.map(r => r.name).join(", "),
                    checkIn: dates.checkIn,
                    checkOut: dates.checkOut
                }
            });

            const convo = res.data;

            navigate(`/agency/chat-page`, {
                state: {
                    conversationId: convo.conversationId,
                    bookingInfo: {
                        bookingId: null,
                        hotelName: hotel.hotelName,
                        room: selectedRooms.map(r => r.name).join(", "),
                        checkIn: dates.checkIn,
                        checkOut: dates.checkOut,
                        type: "NEGOTIATION"
                    }
                }
            });

        } catch (err) {
            console.error("Chat negotiation lỗi:", err);
            alert("Không thể mở chat thương lượng");
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen">

            <div className="flex flex-col min-h-screen relative">

                {bookingSession && (
                    <BookingTimerModal
                        expiredAt={bookingSession.expiredAt}
                        onExpire={() => { setBookingSession(null); window.location.reload(); }}
                        onExtend={handleExtendHold}
                        isExtending={isExtending}
                    />
                )}

                <main className="max-w-[1200px] mx-auto w-full pb-24">
                    <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
                        {/* IMAGE AREA */}
                        <div className="relative h-[480px] bg-slate-200">

                            {/* HERO IMAGE */}
                            <img
                                src={hotel.images?.[0] || DEFAULT_HOTEL_IMAGE}
                                className="w-full h-full object-cover cursor-pointer"
                                alt="Hotel"
                                onClick={() => setOpenGallery(true)}
                            />

                            {/* FLOATING GALLERY CARD */}
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
                                        Xem tất cả ảnh
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* INFO AREA */}
                        <div className="p-10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex text-yellow-400">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star key={i} size={16} fill="currentColor" />
                                    ))}
                                </div>
                                <span className="text-slate-500 text-sm font-bold">{hotel.avgRating}/5</span>
                            </div>

                            <h1 className="text-3xl font-black text-slate-900 mb-2">
                                {hotel.hotelName}
                            </h1>

                            <div className="flex items-center justify-between gap-2 mb-6">
                                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                                    <MapPin size={18} />
                                    <span>{hotel.address}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-100">
                                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold italic">
                                    Wifi miễn phí
                                </span>
                                <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold italic">
                                    Có bữa sáng
                                </span>
                            </div>
                        </div>
                    </section>
                    {openGallery && (
                        <GalleryModal
                            images={gallery}
                            onClose={() => setOpenGallery(false)}
                        />
                    )}
                    {isAgency && (<div className="bg-white p-6 mb-10 rounded-2xl shadow-xl border border-slate-100 flex items-end gap-6 sticky top-20 z-40">
                        <div className="flex-1 space-y-2">
                            <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2"><CalendarIcon size={14} className="text-blue-600" /> Nhận phòng</label>
                            <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-700" value={tempDates.checkIn} min={todayStr} onChange={(e) => setTempDates({ ...tempDates, checkIn: e.target.value })} />
                        </div>
                        <div className="flex-1 space-y-2">
                            <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2"><CalendarIcon size={14} className="text-blue-600" /> Trả phòng</label>
                            <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-700" value={tempDates.checkOut} min={tempDates.checkIn || todayStr} onChange={(e) => setTempDates({ ...tempDates, checkOut: e.target.value })} />
                        </div>
                        <button onClick={handleUpdateDates} className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-[50px] rounded-xl font-black text-sm uppercase tracking-widest shadow-lg active:scale-95">Cập nhật ngày</button>
                    </div>)}

                    <div className="space-y-6">
                        <h2 className="text-2xl font-black text-slate-800">Chọn phòng và xem giá</h2>
                        {loadingRooms ? (
                            <div className="py-24 text-center bg-white rounded-3xl border border-dashed">
                                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="font-bold text-slate-400">Đang cập nhật giá mới nhất...</p>
                            </div>
                        ) : roomTypes.map((room) => {
                            const selectedEntry = selectedRooms.find(r => r.id === room.id);
                            const currentCount = selectedEntry ? selectedEntry.count : 0;
                            const isSelected = currentCount > 0;

                            return (
                                <div
                                    key={room.id}
                                    className={`bg-white border rounded-[24px] flex flex-col md:flex-row p-5 gap-6 transition-all duration-300 ${isSelected
                                        ? "border-blue-500 shadow-[0_12px_40px_rgba(37,99,235,0.1)] ring-1 ring-blue-500"
                                        : "border-slate-100 shadow-sm hover:border-blue-200"
                                        } ${room.isSoldOut ? 'opacity-75 grayscale-[0.5]' : ''}`} // Thêm độ mờ và xám nhẹ nếu hết phòng/inactive
                                >
                                    {/* 1. KHU VỰC THÔNG TIN CHÍNH (BÊN TRÁI) */}
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="space-y-1">
                                                    <h3 className={`text-xl font-black leading-tight ${room.isSoldOut ? 'text-slate-400' : 'text-slate-900'}`}>
                                                        {room.name}
                                                    </h3>
                                                    <div className="flex flex-wrap gap-3 items-center">
                                                        {room.isSoldOut ? (
                                                            <span
                                                                className="bg-slate-100 text-slate-500 text-[10px] px-2.5 py-1 rounded-md font-black uppercase tracking-wider border border-slate-200">
                                                                Hết phòng
                                                            </span>
                                                        ) : (
                                                            <span
                                                                className="bg-emerald-50 text-emerald-600 text-[10px] px-2.5 py-1 rounded-md font-black uppercase tracking-wider border border-emerald-100">
                                                                Khả dụng
                                                            </span>
                                                        )}

                                                        {/* Nút xem chi tiết nổi bật để khách click */}
                                                        <button
                                                            onClick={() => setSelectedDetailRoom(room)}
                                                            className="group flex items-center gap-1.5 text-blue-600 text-[11px] font-black uppercase tracking-widest hover:text-blue-800 transition-all active:scale-95"
                                                        >
                                                            <Info size={14}
                                                                className="group-hover:rotate-12 transition-transform" />
                                                            <span
                                                                className="border-b border-blue-200 group-hover:border-blue-600">Xem chi tiết</span>
                                                        </button>

                                                        <button
                                                            onClick={handleNegotiation}
                                                            className="flex items-center gap-2 hover:bg-orange-50 text-orange-600 px-4 py-2 rounded-lg text-sm font-semibold transition"
                                                        >
                                                            Thương lượng giá
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Thông số phòng */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                <div
                                                    className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full text-[12px] text-slate-600 font-bold border border-slate-100">
                                                    <Users size={14} className="text-slate-400" />
                                                    {room.maxAdults} Người
                                                    lớn {room.maxChildren > 0 && `& ${room.maxChildren} Trẻ em`}
                                                </div>
                                                {room.area > 0 && (
                                                    <div
                                                        className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full text-[12px] text-slate-600 font-bold border border-slate-100">
                                                        <Maximize size={14} className="text-slate-400" />
                                                        {room.area} m²
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/*<div className="flex flex-wrap gap-x-6 gap-y-2 pt-4 border-t border-slate-50">*/}
                                        {/*    <div*/}
                                        {/*        className="flex items-center gap-2 text-emerald-600 text-[12px] font-bold">*/}
                                        {/*        <div*/}
                                        {/*            className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center">*/}
                                        {/*            <Check size={12} strokeWidth={3} />*/}
                                        {/*        </div>*/}
                                        {/*        Xác nhận ngay*/}
                                        {/*    </div>*/}
                                        {/*    <div*/}
                                        {/*        className="flex items-center gap-2 text-emerald-600 text-[12px] font-bold">*/}
                                        {/*        <div*/}
                                        {/*            className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center">*/}
                                        {/*            <Check size={12} strokeWidth={3} />*/}
                                        {/*        </div>*/}
                                        {/*        Miễn phí hủy phòng*/}
                                        {/*    </div>*/}
                                        {/*</div>*/}
                                    </div>

                                    {/* 2. KHU VỰC GIÁ VÀ ĐẶT PHÒNG (BÊN PHẢI) */}
                                    <div
                                        className="md:w-[260px] flex flex-col justify-between items-end bg-slate-50/50 rounded-2xl p-5 border border-slate-100/50">
                                        <div className="text-right w-full">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">
                                                Giá phòng/đêm từ
                                            </p>
                                            <div className="flex flex-col">
                                                <span className={`text-3xl font-black tracking-tighter ${room.isSoldOut ? 'text-slate-300' : 'text-blue-600'}`}>
                                                    {room.price > 0 ? formatCurrency(room.price) : "—"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="w-full space-y-4 mt-6">

                                            {isAgency && (<div className="flex flex-col gap-2">
                                                <div
                                                    className="flex items-center justify-between bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                                                    <button
                                                        onClick={() => handleUpdateQuantity(room, -1)}
                                                        disabled={currentCount === 0}
                                                        className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-600 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors disabled:opacity-30"
                                                    >
                                                        <Minus size={18} strokeWidth={2.5} />
                                                    </button>

                                                    <div className="flex flex-col items-center">
                                                        <input
                                                            type="number"
                                                            value={currentCount}
                                                            readOnly
                                                            className="w-10 text-center font-black text-slate-800 text-lg bg-transparent border-none focus:ring-0 p-0"
                                                        />
                                                        <span
                                                            className="text-[9px] font-black text-slate-400 uppercase -mt-1">Phòng</span>
                                                    </div>

                                                    <button
                                                        onClick={() => handleUpdateQuantity(room, 1)}
                                                        disabled={room.isSoldOut || currentCount >= room.quantity}
                                                        className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-600 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors disabled:opacity-30"
                                                    >
                                                        <Plus size={18} strokeWidth={2.5} />
                                                    </button>
                                                </div>

                                                {/* Trạng thái trống */}
                                                {room.quantity > 0 && (
                                                    <div
                                                        className={`flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-500 ${room.quantity <= 3
                                                            ? 'bg-red-50 text-red-600 animate-pulse'
                                                            : 'bg-emerald-50 text-emerald-700'
                                                            }`}>
                                                        <span
                                                            className={`w-1.5 h-1.5 rounded-full ${room.quantity <= 3 ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                                                        Còn {room.quantity} phòng trống
                                                    </div>
                                                )}
                                            </div>)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </main>

                {isAgency && (<div
                    className="sticky bottom-0 bg-white border-t border-slate-200 p-6 z-40 shadow-[0_-15px_40px_rgba(0,0,0,0.08)]">
                    <div className="max-w-[1200px] mx-auto flex justify-between items-center">
                        <div className="flex items-center gap-6">
                            {selectedRooms.length > 0 ? (
                                <>
                                    <div
                                        className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100">
                                        <Utensils size={24} />
                                    </div>
                                    <div>
                                        <span
                                            className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Lựa chọn của bạn</span>
                                        <h4 className="text-xl font-black text-slate-800 leading-none">
                                            {selectedRooms.length} loại phòng
                                            ({selectedRooms.reduce((acc, curr) => acc + curr.count, 0)} phòng)
                                        </h4>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center gap-4 text-slate-400 italic">
                                    <div
                                        className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                                        <AlertCircle size={24} /></div>
                                    <span className="font-bold text-sm uppercase tracking-widest">Chưa chọn phòng</span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-12">
                            <div className="text-right">
                                <span
                                    className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tổng tiền dự kiến</span>
                                <div className="text-3xl font-black text-blue-600 tracking-tighter">
                                    {formatCurrency(totalEstimatedPrice)}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleBookNow}
                                disabled={selectedRooms.length === 0}
                                className={`px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-2xl active:scale-95 ${selectedRooms.length > 0 ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                            >
                                {selectedRooms.length > 0 ? "ĐẶT NGAY" : "CHỌN PHÒNG"} <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>)}
            </div>
            {selectedDetailRoom && (
                <RoomDetailModal
                    roomId={selectedDetailRoom.id}
                    onClose={() => setSelectedDetailRoom(null)}
                />
            )}
        </div>
    );
}