import React, { useState, useRef, useEffect } from "react";
import { Search, MapPin, Calendar, Users, Plus, Minus, ChevronDown, Building2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MOCK_HOTELS } from "@/constant/agency_mockData.js";

export default function DemoHotelSearchForm({ variant = "hero" }) {
    const isHero = variant === "hero";
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // State
    const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
    const [suggestions, setSuggestions] = useState([]);
    const [checkIn, setCheckIn] = useState(searchParams.get("checkIn") || "");
    const [checkOut, setCheckOut] = useState(searchParams.get("checkOut") || "");
    const [roomCount, setRoomCount] = useState(Number(searchParams.get("rooms")) || 1);
    const [adults, setAdults] = useState(Number(searchParams.get("adults")) || 2);
    const [children, setChildren] = useState(Number(searchParams.get("children")) || 0);
    const [showGuestPicker, setShowGuestPicker] = useState(false);

    const guestRef = useRef(null);
    const searchRef = useRef(null);

    const handleKeywordChange = (e) => {
        const value = e.target.value;
        setKeyword(value);
        if (value.length > 1) {
            const filtered = MOCK_HOTELS.filter(h =>
                h.hotel_name.toLowerCase().includes(value.toLowerCase()) ||
                h.city.toLowerCase().includes(value.toLowerCase()) ||
                h.address.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    };

    // Đóng các popup khi click ngoài
    useEffect(() => {
        const handler = (e) => {
            if (guestRef.current && !guestRef.current.contains(e.target)) setShowGuestPicker(false);
            if (searchRef.current && !searchRef.current.contains(e.target)) setSuggestions([]);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const today = new Date().toISOString().split("T")[0];

    const handleSearchClick = () => {
        if (!keyword.trim()) return;
        const params = new URLSearchParams();
        params.set("keyword", keyword.trim());
        if (checkIn) params.set("checkIn", checkIn);
        if (checkOut) params.set("checkOut", checkOut);
        params.set("rooms", String(roomCount));
        params.set("adults", String(adults));
        params.set("children", String(children));
        navigate(`/demo-agency/search-hotel/list?${params.toString()}`);
    };

    const CounterRow = ({ label, value, onMinus, onPlus, min = 0 }) => (
        <div className="flex items-center justify-between py-2">
            <span className="text-sm text-slate-700 font-medium">{label}</span>
            <div className="flex items-center gap-2">
                <button type="button" onClick={onMinus} disabled={value <= min}
                        className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    <Minus size={14} />
                </button>
                <span className="w-6 text-center text-sm font-bold">{value}</span>
                <button type="button" onClick={onPlus}
                        className="w-7 h-7 rounded-full border border-blue-400 bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors">
                    <Plus size={14} />
                </button>
            </div>
        </div>
    );

    return (
        <div className={`${
            isHero
                ? "bg-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row gap-4 w-full max-w-5xl items-end"
                : "bg-white p-2 rounded-xl shadow-sm flex flex-row gap-2 border border-slate-200 w-full items-center"
        }`}>
            {/* Điểm đến */}
            <div className="flex-1 min-w-0 relative" ref={searchRef}>
                {!isHero && <label className="text-[10px] font-bold text-slate-500 ml-1 mb-0.5 block uppercase">Bạn muốn đi đâu?</label>}
                {isHero && <label className="text-[13px] font-bold text-slate-700 mb-1 block text-left uppercase">Bạn muốn đi đâu?</label>}
                <div className="flex items-center bg-white rounded-lg px-3 py-2 border border-slate-200 focus-within:border-blue-500 transition-all h-[42px]">
                    <input
                        type="text"
                        placeholder="Tên TP/ Khách sạn, Địa chỉ chi tiết..."
                        className="bg-transparent outline-none text-slate-700 text-sm w-full truncate"
                        value={keyword}
                        onChange={handleKeywordChange}
                        onKeyDown={(e) => e.key === "Enter" && handleSearchClick()}
                    />
                </div>

                {/* Dropdown gợi ý */}
                {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 z-[100] overflow-hidden text-left">
                        <p className="text-[10px] font-black text-slate-400 px-4 py-2 uppercase border-b border-slate-50">Kết quả gợi ý</p>
                        {suggestions.map(hotel => (
                            <div
                                key={hotel.hotel_id}
                                onClick={() => { setKeyword(hotel.hotel_name); setSuggestions([]); }}
                                className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center justify-between group transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Building2 size={16} className="text-slate-400 group-hover:text-blue-500" />
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{hotel.hotel_name}</p>
                                        <p className="text-[11px] text-slate-500 font-medium">{hotel.city}</p>
                                    </div>
                                </div>
                                <span className="text-[9px] bg-slate-100 px-2 py-0.5 rounded font-black text-slate-500 uppercase group-hover:bg-blue-100 group-hover:text-blue-600">
                                    {hotel.star_rating} SAO
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Nhận phòng */}
            <div className={isHero ? "w-[180px]" : "w-[150px]"}>
                <label className={`${isHero ? "text-[13px]" : "text-[10px]"} font-bold text-slate-700 mb-1 block text-left uppercase`}>Nhận phòng</label>
                <div className="flex items-center bg-white rounded-lg px-2 py-2 border border-slate-200 focus-within:border-blue-500 transition-all h-[42px]">
                    <Calendar className="text-slate-400 mr-1.5 flex-shrink-0" size={16} />
                    <input
                        type="date"
                        className="bg-transparent outline-none text-slate-700 text-[13px] w-full"
                        value={checkIn}
                        min={today}
                        onChange={(e) => setCheckIn(e.target.value)}
                    />
                </div>
            </div>

            {/* Trả phòng */}
            <div className={isHero ? "w-[180px]" : "w-[150px]"}>
                <label className={`${isHero ? "text-[13px]" : "text-[10px]"} font-bold text-slate-700 mb-1 block text-left uppercase`}>Trả phòng</label>
                <div className="flex items-center bg-white rounded-lg px-2 py-2 border border-slate-200 focus-within:border-blue-500 transition-all h-[42px]">
                    <Calendar className="text-slate-400 mr-1.5 flex-shrink-0" size={16} />
                    <input
                        type="date"
                        className="bg-transparent outline-none text-slate-700 text-[13px] w-full"
                        value={checkOut}
                        min={checkIn || today}
                        onChange={(e) => setCheckOut(e.target.value)}
                    />
                </div>
            </div>

            {/* Khách */}
            <div className={`relative ${isHero ? "w-[220px]" : "w-[160px]"}`} ref={guestRef}>
                <label className={`${isHero ? "text-[13px]" : "text-[10px]"} font-bold text-slate-700 mb-1 block text-left uppercase`}>KHÁCH & PHÒNG</label>
                <div
                    className="flex items-center bg-[#F0FFF4] rounded-lg px-2 py-2 border border-slate-200 cursor-pointer hover:border-blue-400 transition-all h-[42px]"
                    onClick={() => setShowGuestPicker(!showGuestPicker)}
                >
                    <Users className="text-slate-400 mr-1.5 flex-shrink-0" size={16} />
                    <div className="text-[#1A7331] text-[12px] font-bold truncate flex-1">{roomCount}P, {adults + children}K</div>
                    <ChevronDown size={12} className="text-slate-400 ml-1 flex-shrink-0" />
                </div>
                {showGuestPicker && (
                    <div className="absolute top-full left-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl p-4 z-50 w-[250px]">
                        <CounterRow label="Phòng" value={roomCount} min={1}
                                    onMinus={() => setRoomCount(Math.max(1, roomCount - 1))}
                                    onPlus={() => { if (roomCount < 9) setRoomCount(roomCount + 1); }}/>
                        <CounterRow label="Người lớn" value={adults} min={1}
                                    onMinus={() => setAdults(Math.max(1, adults - 1))}
                                    onPlus={() => { if (adults < 20) setAdults(adults + 1); }}/>
                        <CounterRow label="Trẻ em" value={children} min={0}
                                    onMinus={() => setChildren(Math.max(0, children - 1))}
                                    onPlus={() => { if (children < 10) setChildren(children + 1); }}/>
                        <button
                            type="button"
                            onClick={() => setShowGuestPicker(false)}
                            className="mt-3 w-full bg-blue-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Xong
                        </button>
                    </div>
                )}
            </div>

            {/* Nút bấm */}
            <div className={isHero ? "" : "pt-[18px]"}>
                <button
                    onClick={handleSearchClick}
                    className="bg-[#0061E5] hover:bg-blue-700 text-white font-black px-6 rounded-lg flex items-center justify-center gap-2 transition-colors uppercase text-[12px] h-[42px] min-w-[120px] shadow-md shadow-blue-100"
                >
                    <Search size={16} strokeWidth={3} />
                    TÌM KIẾM
                </button>
            </div>
        </div>
    );
}