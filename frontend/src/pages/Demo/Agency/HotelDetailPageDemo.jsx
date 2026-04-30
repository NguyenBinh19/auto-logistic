import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, addDays, parseISO, isBefore, isAfter } from "date-fns";
import {
    MapPin, Users, Maximize, Minus, Plus,
    Star, Utensils, Check, Calendar as CalendarIcon,
    ChevronRight, Info, AlertCircle
} from "lucide-react";
import GalleryModal from "@/components/common/Hotel/GalleryModal.jsx";
import RoomDetailModal from "@/components/demo/Agency/RoomDetailModalDemo.jsx";
import BookingTimerModal from "@/components/demo/Agency/DemoBookingTimerModal.jsx";
import {
    MOCK_HOTELS,
    MOCK_HOTEL_IMAGES,
    MOCK_ROOM_TYPES,
} from "@/constant/agency_mockData.js";

export default function HotelDetailPageDemo() {
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

    const [selectedRooms, setSelectedRooms] = useState([]);
    const [bookingSession, setBookingSession] = useState(null);
    const [isExtending, setIsExtending] = useState(false);

    // Giả lập Agency Role
    const isAgency = true;
    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    const totalEstimatedPrice = useMemo(() => {
        return selectedRooms.reduce((total, item) => total + (item.price * item.count), 0);
    }, [selectedRooms]);

    // Logic Fetch Data
    useEffect(() => {
        const fetchMergedData = () => {
            setLoadingRooms(true);

            // 1. Giả lập lấy thông tin Hotel
            const targetHotel = MOCK_HOTELS.find(h => h.hotel_id === Number(id)) || MOCK_HOTELS[0];
            const hotelImgs = MOCK_HOTEL_IMAGES
                .filter(img => img.hotel_id === targetHotel.hotel_id)
                .map(img => img.image_url);
            setHotel({ ...targetHotel, images: hotelImgs });

            const merged = MOCK_ROOM_TYPES
                .filter(r => r.hotel_id === targetHotel.hotel_id)
                .map(staticRoom => {
                    // Logic y hệt code API:
                    const isInactive = staticRoom.room_status?.toLowerCase() === 'inactive';

                    const quantityAvailable = isInactive ? 0 : (Math.floor(Math.random() * 10));

                    return {
                        id: staticRoom.room_type_id,
                        name: staticRoom.room_title,
                        description: staticRoom.description,
                        maxAdults: staticRoom.max_adults || 2,
                        maxChildren: staticRoom.max_children || 0,
                        area: staticRoom.room_area || 0,
                        bedType: staticRoom.bed_type || "Giường đôi",
                        price: staticRoom.base_price,
                        quantity: isInactive ? 0 : quantityAvailable,
                        // Nếu inactive HOẶC số lượng <= 0 THÌ coi như hết phòng
                        isSoldOut: isInactive || quantityAvailable <= 0,
                        roomStatus: staticRoom.room_status
                    };
                });

            setTimeout(() => {
                setRoomTypes(merged);
                setLoadingRooms(false);
            }, 800);
        };
        fetchMergedData();
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
        setSelectedRooms([]);
    };

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

    const handleBookNow = () => {
        // 1. Tạo thời gian hết hạn (15 phút từ bây giờ)
        const expiredAt = new Date(new Date().getTime() + 15 * 60000).toISOString();

        // 2. Chuẩn bị dữ liệu để truyền sang màn Checkout
        const checkoutData = {
            hotelName: hotel.hotel_name,
            hotelImage: hotel.images?.[0],
            checkInDate: dates.checkIn,
            checkOutDate: dates.checkOut,
            selectedRooms: selectedRooms, // Danh sách phòng đã chọn
            totalPrice: totalEstimatedPrice,
            expiredAt: expiredAt,
            holdCode: "DEMO-" + Math.random().toString(36).substr(2, 9).toUpperCase()
        };

        // 3. Chuyển trang (Giả sử đường dẫn màn checkout của bạn là /booking-checkout-demo)
        navigate("/demo-agency/booking-checkout", { state: checkoutData });
    };

    if (!hotel) return (
        <div className="flex justify-center items-center h-screen">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="flex flex-col min-h-screen relative">
                {bookingSession && (
                    <BookingTimerModal
                        expiredAt={bookingSession.expiredAt}
                        onExpire={() => { setBookingSession(null); window.location.reload(); }}
                        onExtend={() => setIsExtending(false)}
                        isExtending={isExtending}
                    />
                )}

                <main className="max-w-[1200px] mx-auto w-full pb-24 pt-8 px-4">
                    {/* Phần Header Hotel */}
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
                                            <img key={i} src={img} onClick={() => setOpenGallery(true)} className="h-20 w-full object-cover rounded-xl cursor-pointer hover:opacity-90 transition" />
                                        ))}
                                    </div>
                                    <button onClick={() => setOpenGallery(true)} className="mt-3 w-full text-xs font-bold text-blue-600 hover:underline">Xem tất cả ảnh</button>
                                </div>
                            )}
                        </div>

                        <div className="p-10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex text-yellow-400">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                                </div>
                                <span className="text-slate-500 text-sm font-bold">{hotel.star_rating}.0/5 Tuyệt vời</span>
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 mb-2">{hotel.hotel_name}</h1>
                            <div className="flex items-center gap-2 text-blue-600 font-bold mb-6 text-sm">
                                <MapPin size={18} />
                                <span>{hotel.address}</span>
                            </div>
                        </div>
                    </section>

                    {openGallery && <GalleryModal images={hotel.images} onClose={() => setOpenGallery(false)} />}

                    {/* Thanh cập nhật ngày tháng */}
                    {isAgency && (
                        <div className="bg-white p-6 mb-10 rounded-2xl shadow-xl border border-slate-100 flex items-end gap-6 sticky top-20 z-40">
                            <div className="flex-1 space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><CalendarIcon size={14} className="text-blue-700" /> Nhận phòng</label>
                                <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-700" value={tempDates.checkIn} onChange={(e) => setTempDates({ ...tempDates, checkIn: e.target.value })} />
                            </div>
                            <div className="flex-1 space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><CalendarIcon size={14} className="text-blue-700" /> Trả phòng</label>
                                <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-700" value={tempDates.checkOut} onChange={(e) => setTempDates({ ...tempDates, checkOut: e.target.value })} />
                            </div>
                            <button onClick={handleUpdateDates} className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-[50px] rounded-xl font-black text-sm uppercase tracking-widest shadow-lg active:scale-95 transition-all">Cập nhật ngày</button>
                        </div>
                    )}

                    {/* Danh sách phòng */}
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
                                <div key={room.id} className={`bg-white border rounded-[24px] flex flex-col md:flex-row p-5 gap-6 transition-all duration-300 ${isSelected ? "border-blue-500 shadow-[0_12px_40px_rgba(37,99,235,0.1)] ring-1 ring-blue-500" : "border-slate-100 shadow-sm hover:border-blue-200"} ${room.isSoldOut ? 'opacity-75 grayscale-[0.5]' : ''}`}>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="space-y-1">
                                                    <h3 className={`text-xl font-black leading-tight ${room.isSoldOut ? 'text-slate-400' : 'text-slate-900'}`}>{room.name}</h3>
                                                    <div className="flex flex-wrap gap-3 items-center">
                                                        {room.isSoldOut ? (
                                                            <span className="bg-slate-100 text-slate-500 text-[10px] px-2.5 py-1 rounded-md font-black uppercase tracking-wider border border-slate-200">Hết phòng</span>
                                                        ) : (
                                                            <span className="bg-emerald-50 text-emerald-600 text-[10px] px-2.5 py-1 rounded-md font-black uppercase tracking-wider border border-emerald-100">Khả dụng</span>
                                                        )}
                                                        <button onClick={() => setSelectedDetailRoom(room)} className="group flex items-center gap-1.5 text-blue-600 text-[11px] font-black uppercase tracking-widest hover:text-blue-800 transition-all">
                                                            <Info size={14} className="group-hover:rotate-12 transition-transform" />
                                                            <span className="border-b border-blue-200">Xem chi tiết</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full text-[12px] text-slate-600 font-bold border border-slate-100">
                                                    <Users size={14} className="text-slate-400" />
                                                    {room.maxAdults} Người lớn {room.maxChildren > 0 && `& ${room.maxChildren} Trẻ em`}
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full text-[12px] text-slate-600 font-bold border border-slate-100">
                                                    <Maximize size={14} className="text-slate-400" /> {room.area} m²
                                                </div>
                                            </div>
                                        </div>

                                    </div>

                                    <div className="md:w-[260px] flex flex-col justify-between items-end bg-slate-50/50 rounded-2xl p-5 border border-slate-100/50">
                                        <div className="text-right w-full">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Giá phòng/đêm từ</p>
                                            <span className={`text-3xl font-black tracking-tighter ${room.isSoldOut ? 'text-slate-300' : 'text-blue-600'}`}>
                                                {room.price > 0 ? formatCurrency(room.price) : "—"}
                                            </span>
                                        </div>
                                        <div className="w-full space-y-4 mt-6">
                                            {isAgency && (
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center justify-between bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                                                        <button onClick={() => handleUpdateQuantity(room, -1)} disabled={currentCount === 0} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-600 rounded-lg hover:bg-blue-50 disabled:opacity-30"><Minus size={18} /></button>
                                                        <div className="flex flex-col items-center">
                                                            <input type="number" value={currentCount} readOnly className="w-10 text-center font-black text-slate-800 text-lg bg-transparent border-none p-0 focus:ring-0" />
                                                            <span className="text-[9px] font-black text-slate-400 uppercase -mt-1">Phòng</span>
                                                        </div>
                                                        <button onClick={() => handleUpdateQuantity(room, 1)} disabled={room.isSoldOut || currentCount >= room.quantity} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-600 rounded-lg hover:bg-blue-50 disabled:opacity-30"><Plus size={18} /></button>
                                                    </div>

                                                    {/* THÔNG BÁO PHÒNG TRỐNG*/}
                                                    {!room.isSoldOut && room.quantity > 0 && (
                                                        <div className={`flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider ${room.quantity <= 3 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-emerald-50 text-emerald-700'}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${room.quantity <= 3 ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                                                            Còn {room.quantity} phòng trống
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </main>

                {/* Footer Toolbar */}
                {isAgency && (
                    <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 z-40 shadow-[0_-15px_40px_rgba(0,0,0,0.08)]">
                        <div className="max-w-[1200px] mx-auto flex justify-between items-center px-4">
                            <div className="flex items-center gap-6">
                                {selectedRooms.length > 0 ? (
                                    <>
                                        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100"><Utensils size={24} /></div>
                                        <div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Lựa chọn của bạn</span>
                                            <h4 className="text-xl font-black text-slate-800 leading-none">
                                                {selectedRooms.length} loại phòng ({selectedRooms.reduce((acc, curr) => acc + curr.count, 0)} phòng)
                                            </h4>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center gap-4 text-slate-400 italic">
                                        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center"><AlertCircle size={24} /></div>
                                        <span className="font-bold text-sm uppercase tracking-widest">Chưa chọn phòng</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-12">
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tổng tiền dự kiến</span>
                                    <div className="text-3xl font-black text-blue-600 tracking-tighter">{formatCurrency(totalEstimatedPrice)}</div>
                                </div>
                                <button
                                    onClick={handleBookNow}
                                    disabled={selectedRooms.length === 0}
                                    className={`px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-2xl active:scale-95 ${selectedRooms.length > 0 ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                                >
                                    {selectedRooms.length > 0 ? "ĐẶT NGAY" : "CHỌN PHÒNG"} <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {selectedDetailRoom && <RoomDetailModal roomId={selectedDetailRoom.id} onClose={() => setSelectedDetailRoom(null)} />}
        </div>
    );
}