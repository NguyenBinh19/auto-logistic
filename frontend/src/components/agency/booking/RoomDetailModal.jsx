import { useEffect, useState } from "react";
import {
    X, Maximize, Users, BedDouble,
    CheckCircle2, Loader2, Waves, Baby,
    Coffee, Wind, Tv, Monitor
} from "lucide-react";
import { roomTypeService } from "@/services/roomtypes.service.js";
const DEFAULT_ROOM_IMAGE = "https://images.unsplash.com/photo-1590490360182-c33d57733427";

const RoomDetailModal = ({ roomId, onClose }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [roomData, setRoomData] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        setIsVisible(true);
        document.body.style.overflow = 'hidden';
        if (roomId) fetchDetail();

        return () => (document.body.style.overflow = 'unset');
    }, [roomId]);

    const fetchDetail = async () => {
        try {
            setIsLoading(true);
            const res = await roomTypeService.getRoomTypeDetail(roomId);
            setRoomData(res.result || res);
        } catch (err) {
            console.error("Lỗi lấy chi tiết hạng phòng:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 200);
    };

    if (!roomId) return null;

    const mainImageUrl = roomData?.images && roomData.images.length > 0
        ? roomData.images[activeImage]?.imageUrl
        : DEFAULT_ROOM_IMAGE;

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-md transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`bg-white w-full max-w-6xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-auto max-h-[95vh] transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>

                {isLoading ? (
                    <div className="w-full h-[500px] flex flex-col items-center justify-center gap-4">
                        <Loader2 className="animate-spin text-blue-600" size={40} />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Đang tải thông tin chi tiết...</p>
                    </div>
                ) : roomData && (
                    <>
                        {/* TRÁI: GALLERY ẢNH */}
                        <div className="w-full md:w-[60%] bg-slate-100 flex flex-col border-r border-slate-100">
                            <div className="flex-1 relative min-h-[350px] md:min-h-[500px] overflow-hidden bg-slate-200">
                                <img
                                    src={mainImageUrl}
                                    className="w-full h-full object-cover transition-all duration-700"
                                    alt={roomData.roomTitle}
                                />

                                <button onClick={handleClose} className="absolute top-6 left-6 p-2 bg-white/90 backdrop-blur rounded-full shadow-lg md:hidden">
                                    <X size={20} />
                                </button>
                            </div>

                            {roomData.images?.length > 1 && (
                                <div className="p-4 flex gap-3 overflow-x-auto bg-white border-t border-slate-100">
                                    {roomData.images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImage(idx)}
                                            className={`relative w-28 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${activeImage === idx ? 'border-blue-600 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                        >
                                            <img src={img.imageUrl} className="w-full h-full object-cover" alt="" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* PHẢI: NỘI DUNG */}
                        <div className="w-full md:w-[40%] flex flex-col p-8 md:p-12 overflow-y-auto custom-scrollbar bg-white">
                            <div className="flex justify-between items-start mb-8">
                                <h2 className="text-4xl font-black text-slate-900 leading-tight">
                                    {roomData.roomTitle}
                                </h2>
                                <button onClick={handleClose} className="hidden md:block p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                                    <X size={28} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-10">
                                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                        <Maximize size={20}/>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Diện tích</p>
                                        <p className="text-base font-black text-slate-800">{roomData.roomArea} m²</p>
                                    </div>
                                </div>
                                <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                                        <BedDouble size={20}/>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Loại giường</p>
                                        <p className="text-base font-black text-slate-800">{roomData.bedType}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-10">
                                {/* SỨC CHỨA */}
                                <section>
                                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-5">Tiêu chuẩn lưu trú</h3>
                                    <div className="flex gap-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-700 border border-slate-100">
                                                <Users size={22} />
                                            </div>
                                            <div>
                                                <p className="text-lg font-black text-slate-800">{roomData.maxAdults}</p>
                                                <p className="text-[11px] text-slate-500 font-bold uppercase">Người lớn</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-700 border border-slate-100">
                                                <Baby size={22} />
                                            </div>
                                            <div>
                                                <p className="text-lg font-black text-slate-800">{roomData.maxChildren}</p>
                                                <p className="text-[11px] text-slate-500 font-bold uppercase">Trẻ em</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* GIỚI THIỆU */}
                                <section>
                                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-4">Mô tả chi tiết</h3>
                                    <div className="text-slate-600 text-[15px] leading-relaxed whitespace-pre-line bg-slate-50/30 p-5 rounded-2xl border border-slate-100">
                                        {roomData.description || "Hạng phòng tiêu chuẩn với đầy đủ tiện nghi hiện đại."}
                                    </div>
                                </section>

                                {/* TRANG THIẾT BỊ */}
                                {roomData.amenities?.length > 0 && (
                                    <section>
                                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-5">Tiện ích phòng</h3>
                                        <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                                            {roomData.amenities.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                                    <span className="leading-tight">{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </div>

                            <button
                                onClick={handleClose}
                                className="mt-12 w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[13px] uppercase tracking-[0.3em] hover:bg-blue-600 transition-all shadow-xl active:scale-[0.98] mb-4"
                            >
                                Quay lại
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default RoomDetailModal;