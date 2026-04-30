import React, { useEffect, useState } from "react";
import {
    X, Maximize, Users, BedDouble,
    Loader2, Waves, Baby
} from "lucide-react";
import { MOCK_ROOM_TYPES, MOCK_ROOM_IMAGES } from "@/constant/agency_mockData.js";

const RoomDetailModalDemo = ({ roomId, onClose }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [roomData, setRoomData] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        setIsVisible(true);
        document.body.style.overflow = 'hidden';

        // Giả lập fetching
        if (roomId) {
            fetchMockDetail(roomId);
        }

        return () => (document.body.style.overflow = 'unset');
    }, [roomId]);

    const fetchMockDetail = (id) => {
        setIsLoading(true);
        setTimeout(() => {
            // 1. Tìm thông tin cơ bản của phòng
            const baseRoom = MOCK_ROOM_TYPES.find(r => r.room_type_id === id);
            if (baseRoom) {
                // 2. Tìm danh sách ảnh tương ứng từ MOCK_ROOM_IMAGES
                const roomImages = MOCK_ROOM_IMAGES
                    .filter(img => img.room_type_id === id)
                    .map(img => ({ imageUrl: img.s3_key }));
                // 3. Xử lý amenities
                let finalAmenities = [];
                if (Array.isArray(baseRoom.amenities)) {
                    finalAmenities = baseRoom.amenities;
                } else if (typeof baseRoom.amenities === 'string') {
                    try {
                        finalAmenities = JSON.parse(baseRoom.amenities.replace(/'/g, '"'));
                    } catch (e) {
                        finalAmenities = [];
                    }
                }

                setRoomData({
                    ...baseRoom,
                    images: roomImages,
                    amenities: finalAmenities
                });
            }
            setIsLoading(false);
        }, 500);
    };

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 200);
    };

    if (!roomId) return null;

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
                                {roomData.images?.length > 0 ? (
                                    <img
                                        src={roomData.images[activeImage]?.imageUrl}
                                        className="w-full h-full object-cover transition-all duration-700"
                                        alt={roomData.room_title}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                                        <Waves size={48} />
                                    </div>
                                )}
                                <button onClick={handleClose} className="absolute top-6 left-6 p-2 bg-white/90 backdrop-blur rounded-full shadow-lg md:hidden">
                                    <X size={20} />
                                </button>
                            </div>

                            {roomData.images?.length > 1 && (
                                <div className="p-4 flex gap-3 overflow-x-auto bg-white border-t border-slate-100 custom-scrollbar">
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
                                <div className="space-y-1">
                                    <h2 className="text-4xl font-black text-slate-900 leading-tight">
                                        {roomData.room_title}
                                    </h2>
                                </div>
                                <button onClick={handleClose} className="hidden md:block p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                                    <X size={28} />
                                </button>
                            </div>

                            {/* Grid thông số diện tích & giường */}
                            <div className="grid grid-cols-2 gap-4 mb-10">
                                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                        <Maximize size={20}/>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Diện tích</p>
                                        <p className="text-base font-black text-slate-800">{roomData.room_area} m²</p>
                                    </div>
                                </div>
                                <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                                        <BedDouble size={20}/>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Giường</p>
                                        <p className="text-base font-black text-slate-800">{roomData.bed_type}</p>
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
                                                <p className="text-lg font-black text-slate-800">{roomData.max_adults}</p>
                                                <p className="text-[11px] text-slate-500 font-bold uppercase">Người lớn</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-700 border border-slate-100">
                                                <Baby size={22} />
                                            </div>
                                            <div>
                                                <p className="text-lg font-black text-slate-800">{roomData.max_children}</p>
                                                <p className="text-[11px] text-slate-500 font-bold uppercase">Trẻ em</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* GIỚI THIỆU */}
                                <section>
                                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-4">Mô tả hạng phòng</h3>
                                    <div className="text-slate-600 text-[15px] leading-relaxed whitespace-pre-line bg-slate-50/30 p-5 rounded-2xl border border-slate-100">
                                        {roomData.description}
                                    </div>
                                </section>

                                {/* TIỆN ÍCH PHÒNG */}
                                {roomData.amenities?.length > 0 && (
                                    <section>
                                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-5">Trang thiết bị & Tiện ích</h3>
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

export default RoomDetailModalDemo;