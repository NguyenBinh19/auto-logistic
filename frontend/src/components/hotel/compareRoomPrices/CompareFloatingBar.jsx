import React, { useMemo } from 'react';
import { useCompare } from '@/context/CompareContext.jsx';
import { X, Star, ShieldCheck, MapPinned, Trash2, Info, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CompareModal() {
    const { isModalOpen, setIsModalOpen, compareItems, clearAll, removeItem } = useCompare();
    const navigate = useNavigate();

    const specs = useMemo(() => [

        { label: "Hình ảnh & Đặt phòng", key: "action_area", type: "action" },
        { label: "Hạng sao", key: "starRating", type: "star",  },
        { label: "Thành phố", key: "city",  },
        { label: "Đánh giá (TB)", key: "avgRating", type: "rating" },
        { label: "Tổng đánh giá", key: "totalReviews", type: "text" },
        { label: "Tiện ích tiêu biểu", key: "amenities", type: "tags" },
        { label: "Địa chỉ", key: "address", type: "text" },
    ], []);

    const isDifferent = (key) => {
        if (key === "action_area") return false;
        if (compareItems.length < 2) return false;
        const values = compareItems.map(h => JSON.stringify(h[key]));
        return new Set(values).size > 1;
    };

    if (!isModalOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-[95vw] h-[92vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col border border-white/20">

                {/* Header cố định của Modal */}
                <div className="p-6 border-b bg-white flex justify-between items-center shrink-0 z-50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-[#003580] rounded-2xl text-white shadow-lg">
                            <ShieldCheck size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-[#003580] uppercase italic tracking-tighter">Bảng đối chiếu dịch vụ</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase italic">Agency Manager Comparison Tool</p>
                        </div>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 flex items-center justify-center bg-slate-100 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-inner">
                        <X size={24} />
                    </button>
                </div>

                {/* Khu vực Table  */}
                <div className="flex-1 overflow-auto custom-scrollbar bg-white">
                    <table className="w-full border-separate border-spacing-0 table-fixed">
                        <thead>
                        <tr>
                            {/* Ô góc trên bên trái */}
                            <th className="sticky top-0 left-0 z-[60] p-6 w-[220px] bg-slate-50 border-b-2 border-r border-slate-200 text-left">
                                <span className="text-[11px] font-black uppercase text-[#003580] italic">Thông tin khách sạn</span>
                            </th>

                            {compareItems.map(hotel => (
                                /* Tên khách sạn */
                                <th key={hotel.hotelId} className="sticky top-0 z-50 p-6 bg-white border-b-2 border-l border-white min-w-[320px] text-left">
                                    <div className="flex justify-between items-start gap-4">
                                            <span className="text-blue-900 text-[13px] font-black uppercase leading-tight italic line-clamp-2">
                                                {hotel.hotelName}
                                            </span>
                                        <button
                                            onClick={() => removeItem(hotel.hotelId)}
                                            className="text-blue-300 hover:text-black transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </th>
                            ))}
                        </tr>
                        </thead>

                        <tbody>
                        {specs.map((spec, idx) => {
                            const highlightRow = isDifferent(spec.key);
                            return (
                                <tr key={idx} className={highlightRow ? 'bg-orange-50/30' : ''}>
                                    {/* Cột tiêu chí bên trái (Sticky Left) */}
                                    <td className="sticky left-0 z-40 p-6 bg-slate-50 border-b border-r border-slate-200 shadow-[2px_0_5px_rgba(0,0,0,0.03)] font-black text-[10px] uppercase text-slate-500 italic flex items-center gap-2">
                                        {spec.icon} {spec.label}
                                        {highlightRow && <Info size={12} className="text-orange-400" />}
                                    </td>

                                    {/* Nội dung dữ liệu */}
                                    {compareItems.map(hotel => (
                                        <td key={hotel.hotelId} className="p-6 border-b border-l border-slate-100 align-top">

                                            {/* Case 1: Khu vực Ảnh và Nút đặt phòng */}
                                            {spec.type === "action" ? (
                                                    <div className="space-y-4">
                                                        <div className="h-48 rounded-2xl overflow-hidden shadow-md">
                                                            <img
                                                                src={hotel.images?.[0] || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"}
                                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                                                alt="hotel"
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                setIsModalOpen(false);
                                                                navigate(`/hotels/${hotel.hotelId}`);
                                                            }}
                                                            className="w-full bg-[#003580] text-white py-4 rounded-xl font-black text-[11px] uppercase tracking-tighter flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
                                                        >
                                                            Đặt ngay <ArrowRight size={14} />
                                                        </button>
                                                    </div>
                                                )

                                                /* Case 2: Hạng sao */
                                                : spec.type === "star" ? (
                                                        <div className="flex text-yellow-400">
                                                            {[...Array(Number(hotel[spec.key]) || 0)].map((_, i) => (
                                                                <Star key={i} size={14} fill="currentColor"/>
                                                            ))}
                                                        </div>
                                                    )

                                                    /* Case 3: Đánh giá */
                                                    : spec.type === "rating" ? (
                                                            <div className="text-lg font-black text-[#003580]">
                                                                {hotel[spec.key] > 0 ? hotel[spec.key].toFixed(1) : "N/A"}
                                                                <span className="text-[10px] font-bold text-slate-300 ml-1">/ 5.0</span>
                                                            </div>
                                                        )

                                                        /* Case 4: Tiện ích */
                                                        : spec.type === "tags" ? (
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {(hotel[spec.key] || []).map(tag => (
                                                                        <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 text-[9px] font-black rounded uppercase">
                                                                {tag}
                                                            </span>
                                                                    ))}
                                                                </div>
                                                            )

                                                            /* Case 5: Văn bản dài   */
                                                            : (
                                                                <div className="text-[13px] font-bold text-slate-600 leading-relaxed break-words whitespace-normal">
                                                                    {hotel[spec.key] || "---"}
                                                                </div>
                                                            )}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>

                {/* Footer Footer Footer */}
                <div className="p-6 border-t bg-slate-50 flex justify-center gap-6 shrink-0">
                    <button onClick={clearAll} className="px-8 py-3 rounded-xl font-black text-[10px] uppercase text-slate-400 hover:text-red-500 transition-all ">Xóa tất cả</button>
                    <button onClick={() => setIsModalOpen(false)} className="px-12 py-3 bg-white border border-slate-200 rounded-xl font-black text-[10px] uppercase text-slate-600 shadow-sm">Đóng bảng</button>
                </div>
            </div>
        </div>
    );
}