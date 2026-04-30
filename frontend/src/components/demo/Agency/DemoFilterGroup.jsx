import React, { useState } from "react";
import { Wifi, Star, Settings2, Umbrella, Waves, Palmtree, Briefcase, UtensilsCrossed, Search, Dumbbell } from "lucide-react";

export default function DemoFilterSidebar({ onApplyFilter }) {
    // State lưu trữ các lựa chọn
    const [selectedStars, setSelectedStars] = useState([]);
    const [selectedAmenities, setSelectedAmenities] = useState([]);

    // Xử lý chọn hạng sao
    const handleStarToggle = (star) => {
        setSelectedStars(prev =>
            prev.includes(star) ? prev.filter(s => s !== star) : [...prev, star]
        );
    };

    // Xử lý chọn tiện ích
    const handleAmenityToggle = (value) => {
        setSelectedAmenities(prev =>
            prev.includes(value) ? prev.filter(a => a !== value) : [...prev, value]
        );
    };

    const handleApply = () => {
        if (onApplyFilter) {
            onApplyFilter({
                star_rating: selectedStars,
                amenities: selectedAmenities
            });
        }
    };

    return (
        <aside className="w-[280px] bg-white rounded-[24px] border border-slate-100 p-5 sticky top-5 h-fit shadow-sm font-sans text-left">
            <h3 className="font-black text-[#003580] text-[15px] mb-6 flex items-center gap-2 uppercase tracking-tight">
                <Settings2 size={18} className="text-blue-600" /> Bộ lọc nâng cao
            </h3>

            {/* LỌC THEO HẠNG SAO */}
            <div className="mb-6 pb-6 border-b border-slate-100">
                <h4 className="text-[12px] font-black text-[#003580] uppercase mb-4 flex items-center gap-2 tracking-tighter">
                    <Star size={14} className="text-blue-600" fill="currentColor" /> Hạng sao
                </h4>
                <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map(star => (
                        <label key={star} className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                checked={selectedStars.includes(star)}
                                onChange={() => handleStarToggle(star)}
                            />
                            <div className="flex items-center gap-1">
                                <div className="flex text-yellow-400">
                                    {[...Array(star)].map((_, i) => <Star key={i} size={11} fill="currentColor" />)}
                                </div>
                                <span className="text-[12px] font-bold text-slate-500 group-hover:text-blue-600">({star} sao)</span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* LỌC THEO TIỆN ÍCH */}
            <div className="mb-6 pb-6 border-b border-slate-100">
                <h4 className="text-[12px] font-black text-[#003580] uppercase mb-4 flex items-center gap-2 tracking-tighter">
                    <Umbrella size={14} className="text-blue-600" /> Tiện ích
                </h4>
                <div className="space-y-3">
                    <FilterItem
                        label="Wifi miễn phí"
                        icon={<Wifi size={14} className="text-blue-400" />}
                        isChecked={selectedAmenities.includes("Wifi")}
                        onChange={() => handleAmenityToggle("Wifi")}
                    />
                    <FilterItem
                        label="Hồ bơi"
                        icon={<Waves size={14} className="text-cyan-500" />}
                        isChecked={selectedAmenities.includes("Pool")}
                        onChange={() => handleAmenityToggle("Pool")}
                    />
                    <FilterItem
                        label="Bãi biển riêng"
                        icon={<Palmtree size={14} className="text-orange-500" />}
                        isChecked={selectedAmenities.includes("Beach")}
                        onChange={() => handleAmenityToggle("Beach")}
                    />
                    <FilterItem
                        label="Spa & Thư giãn"
                        icon={<Briefcase size={14} className="text-pink-500" />}
                        isChecked={selectedAmenities.includes("Spa")}
                        onChange={() => handleAmenityToggle("Spa")}
                    />
                    <FilterItem
                        label="Nhà hàng"
                        icon={<UtensilsCrossed size={14} className="text-red-500" />}
                        isChecked={selectedAmenities.includes("Fine Dining")}
                        onChange={() => handleAmenityToggle("Fine Dining")}
                    />
                    <FilterItem
                        label="Phòng Gym"
                        icon={<Dumbbell size={14} className="text-slate-500" />}
                        isChecked={selectedAmenities.includes("Gym")}
                        onChange={() => handleAmenityToggle("Gym")}
                    />
                </div>
            </div>

            <button
                onClick={handleApply}
                className="w-full bg-[#0061E5] text-white py-4 rounded-xl font-black text-[11px] shadow-lg shadow-blue-100 uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                <Search size={14} strokeWidth={3} /> Áp dụng bộ lọc
            </button>
        </aside>
    );
}

const FilterItem = ({ label, icon, isChecked, onChange }) => (
    <label className="flex items-center gap-3 cursor-pointer group">
        <input
            type="checkbox"
            checked={isChecked}
            onChange={onChange}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-[12px] font-bold text-slate-500 group-hover:text-blue-600 flex items-center gap-2 transition-colors">
            {icon} {label}
        </span>
    </label>
);