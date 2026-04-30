import React, { useState, useRef, useEffect } from "react";
import { Search, MapPin, Calendar, Users, Plus, Minus, ChevronDown, Building2, Globe, Info, BedDouble } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function HotelSearchForm() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isFocused, setIsFocused] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [error, setError] = useState("");
    const today = new Date().toISOString().split("T")[0];
    // Nội dung chạy ngang (Nối các gợi ý bằng dấu phân cách)
    const marqueeText = "Nhập tên TP /Phường,xã  •  Nhập tên khách sạn  •  Tìm theo địa chỉ cụ thể...";

    // State
    const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
    const [checkIn, setCheckIn] = useState(searchParams.get("checkIn") || "");
    const [checkOut, setCheckOut] = useState(searchParams.get("checkOut") || "");
    const [roomCount, setRoomCount] = useState(searchParams.get("rooms") || "0");
    const [adults, setAdults] = useState(searchParams.get("adults") || "0");
    const [children, setChildren] = useState(searchParams.get("children") || "0");

    useEffect(() => {
        if (checkIn) {
            const dateIn = new Date(checkIn);
            const dateOut = checkOut ? new Date(checkOut) : null;

            // Tính ngày tối thiểu cho Check-out (Check-in + 1 ngày)
            const minCheckOutDate = new Date(dateIn);
            minCheckOutDate.setDate(minCheckOutDate.getDate() + 1);
            const minCheckOutStr = minCheckOutDate.toISOString().split("T")[0];

            // Nếu chưa có checkOut hoặc checkOut <= checkIn, tự động cập nhật
            if (!checkOut || (dateOut && dateOut <= dateIn)) {
                setCheckOut(minCheckOutStr);
            }
        }
    }, [checkIn, checkOut]);

    const handleSearchClick = () => {
        if (!keyword.trim()) {
            setError("Vui lòng nhập địa điểm, địa chỉ hoặc tên khách sạn");
            return;
        }

        // Nếu có lọc theo phòng/khách thì yêu cầu nhập ngày
        const roomsValue = Number(roomCount || 0);
        const adultsValue = Number(adults || 0);
        const childrenValue = Number(children || 0);
        const hasRoomGuestFilter = roomsValue > 0 || adultsValue > 0 || childrenValue > 0;
        if (hasRoomGuestFilter && (!checkIn || !checkOut)) {
            setError("Vui lòng chọn ngày nhận phòng và trả phòng khi lọc theo số phòng hoặc số khách");
            return;
        }

        if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) {
            setError("Ngày trả phòng phải sau ngày nhận phòng!");
            return;
        }

        setError("");
        const params = new URLSearchParams();
        params.set("keyword", keyword.trim());
        if (checkIn) params.set("checkIn", checkIn);
        if (checkOut) params.set("checkOut", checkOut);
        params.set("rooms", String(roomsValue));
        params.set("adults", String(adultsValue));
        params.set("children", String(childrenValue));
        navigate(`/agency/search-hotel/list?${params.toString()}`);
    };

    const handleNumericInput = (value, setter) => {
        if (value === "") {
            setter("");
            return;
        }

        if (/^\d+$/.test(value)) {
            setter(String(Number(value)));
        }
    };

    const renderTooltip = () => showTooltip && (
        <div className="absolute bottom-full left-0 mb-2 w-max max-w-[400px] bg-slate-800 text-white text-[11px] p-3 rounded-lg shadow-xl z-[60] animate-in fade-in slide-in-from-bottom-2">
            <div className="flex gap-2 mb-2 text-blue-300 font-bold uppercase items-center">
                <Info size={14} /> Gợi ý tìm kiếm
            </div>
            <div className="space-y-1.5 text-slate-200">
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="flex-shrink-0">-</span>
                    <span>Tìm theo <b>Thành phố</b> (Đà Nẵng, Hà Nội...)</span>
                </div>
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="flex-shrink-0">-</span>
                    <span>Tìm theo <b>Tên khách sạn</b> (Mường Thanh, Pullman...)</span>
                </div>
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="flex-shrink-0">-</span>
                    <span>Tìm theo <b>Địa chỉ</b> hoặc <b>Phường/Xã</b> cụ thể</span>
                </div>
            </div>
            <div className="absolute top-full left-6 -mt-1 border-8 border-transparent border-t-slate-800"></div>
        </div>
    );

    const renderKeywordInput = () => (
        <div className="relative flex items-center bg-white rounded-lg px-3 py-2 border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-50 transition-all h-[42px] overflow-hidden">
            <Search className="text-slate-400 mr-2 flex-shrink-0 z-10 bg-white" size={18} />
            <div className="relative flex-1 h-full flex items-center overflow-hidden">
                {!keyword && !isFocused && (
                    <div className="absolute inset-0 flex items-center pointer-events-none whitespace-nowrap">
                        <div className="animate-marquee text-slate-400 text-sm pl-[100%]">{marqueeText}</div>
                        <div className="animate-marquee text-slate-400 text-sm pl-4">{marqueeText}</div>
                    </div>
                )}
                <input
                    type="text"
                    className="bg-transparent outline-none text-slate-700 text-sm w-full font-medium z-10 relative"
                    value={keyword}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchClick()}
                />
            </div>
        </div>
    );

    const inputCls = "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

    // Both hero and compact use the same single-row layout
    return (
        <div className="w-full flex flex-col">
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }
                .animate-marquee { display: inline-block; animation: marquee 25s linear infinite; }
            `}} />
            <div className="bg-white p-2 rounded-xl shadow-sm flex flex-row flex-nowrap gap-2 border border-slate-200 w-full items-center">

                <div className="flex-[1.8] min-w-0 w-full relative group" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
                    <label className="text-[10px] font-bold text-slate-500 ml-1 mb-0.5 block uppercase">Địa điểm / Khách sạn</label>
                    {renderTooltip()}
                    {renderKeywordInput()}
                </div>

                <div className="w-[150px]">
                    <label className="text-[10px] font-bold text-slate-500 ml-1 mb-0.5 block uppercase">Nhận phòng</label>
                    <div className="flex items-center bg-white rounded-lg px-2 py-2 border border-slate-200 focus-within:border-blue-500 transition-all h-[42px]">
                        <Calendar className="text-slate-400 mr-1.5 flex-shrink-0" size={16} />
                        <input type="date" className="bg-transparent outline-none text-slate-700 text-[13px] w-full" value={checkIn} min={today} onChange={(e) => setCheckIn(e.target.value)} />
                    </div>
                </div>

                <div className="w-[150px]">
                    <label className="text-[10px] font-bold text-slate-500 ml-1 mb-0.5 block uppercase">Trả phòng</label>
                    <div className="flex items-center bg-white rounded-lg px-2 py-2 border border-slate-200 focus-within:border-blue-500 transition-all h-[42px]">
                        <Calendar className="text-slate-400 mr-1.5 flex-shrink-0" size={16} />
                        <input type="date" className="bg-transparent outline-none text-slate-700 text-[13px] w-full" value={checkOut} min={checkIn ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split("T")[0] : today} onChange={(e) => setCheckOut(e.target.value)} />
                    </div>
                </div>

                <div className="w-[100px]">
                    <label className="text-[10px] font-bold text-slate-500 ml-1 mb-0.5 block uppercase">Số phòng</label>
                    <div className="flex items-center bg-white rounded-lg px-2 py-2 border border-slate-200 focus-within:border-blue-500 transition-all h-[42px]">
                        <BedDouble className="text-slate-400 mr-1.5 flex-shrink-0" size={16} />
                        <input
                            type="number"
                            min="0"
                            className={`bg-transparent outline-none text-slate-700 text-[13px] w-full font-medium ${inputCls}`}
                            value={roomCount}
                            onChange={(e) => handleNumericInput(e.target.value, setRoomCount)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearchClick()}
                        />
                    </div>
                </div>

                <div className="w-[110px]">
                    <label className="text-[10px] font-bold text-slate-500 ml-1 mb-0.5 block uppercase">Người lớn</label>
                    <div className="flex items-center bg-white rounded-lg px-2 py-2 border border-slate-200 focus-within:border-blue-500 transition-all h-[42px]">
                        <Users className="text-slate-400 mr-1.5 flex-shrink-0" size={16} />
                        <input
                            type="number"
                            min="0"
                            className={`bg-transparent outline-none text-slate-700 text-[13px] w-full font-medium ${inputCls}`}
                            value={adults}
                            onChange={(e) => handleNumericInput(e.target.value, setAdults)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearchClick()}
                        />
                    </div>
                </div>

                <div className="w-[100px]">
                    <label className="text-[10px] font-bold text-slate-500 ml-1 mb-0.5 block uppercase">Trẻ em</label>
                    <div className="flex items-center bg-white rounded-lg px-2 py-2 border border-slate-200 focus-within:border-blue-500 transition-all h-[42px]">
                        <Users className="text-slate-400 mr-1.5 flex-shrink-0" size={14} />
                        <input
                            type="number"
                            min="0"
                            className={`bg-transparent outline-none text-slate-700 text-[13px] w-full font-medium ${inputCls}`}
                            value={children}
                            onChange={(e) => handleNumericInput(e.target.value, setChildren)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearchClick()}
                        />
                    </div>
                </div>

                <div className="pt-[18px]">
                    <button onClick={handleSearchClick} className="bg-[#0061E5] hover:bg-blue-700 text-white font-black px-6 rounded-lg flex items-center justify-center gap-2 transition-colors uppercase text-[12px] h-[42px] min-w-[120px] shadow-md shadow-blue-100">
                        <Search size={16} strokeWidth={3} /> TÌM KIẾM
                    </button>
                </div>
            </div>
            {error && <p className="text-red-500 text-xs mt-1.5 ml-1 font-medium">{error}</p>}
        </div>
    );
}