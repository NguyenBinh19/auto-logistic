import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    MapPin, Calendar, Search,
    Building2, UserCheck, ShieldCheck, Bot, Wallet,
    Users, Plus, Minus, ChevronDown, Play, Info
} from "lucide-react";
import { useLocation } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import homepage from "@/assets/images/homepage.jpg";
import DemoRoleSelect from "@/pages/Demo/DemoRoleSelect.jsx";

const HomePage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isFocused, setIsFocused] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const marqueeText = "Nhập tên TP /Phường,xã  •  Nhập tên khách sạn  •  Tìm theo địa chỉ cụ thể...";

    // 1. Logic Kiểm tra đăng nhập
    const token = localStorage.getItem("accessToken");
    const isLoggedIn = !!token;

    // 2. State cho Form Tìm kiếm
    const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
    const [checkIn, setCheckIn] = useState(searchParams.get("checkIn") || "");
    const [checkOut, setCheckOut] = useState(searchParams.get("checkOut") || "");
    const [roomCount, setRoomCount] = useState(Number(searchParams.get("rooms")) || 1);
    const [adults, setAdults] = useState(Number(searchParams.get("adults")) || 2);
    const [children, setChildren] = useState(Number(searchParams.get("children")) || 0);
    const [showGuestPicker, setShowGuestPicker] = useState(false);
    const [showDemoModal, setShowDemoModal] = useState(false);
    const guestRef = useRef(null);

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

    const today = new Date().toISOString().split("T")[0];
    const guestSummary = `${roomCount} phòng, ${adults} người lớn, ${children} trẻ em`;
    const getRoleFromToken = () => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) return "HOTEL"; // Fallback nếu chưa đăng nhập

            const decoded = jwtDecode(token);

            // 1. Quét tất cả các trường có thể chứa Role (Đồng bộ với ProtectedRoute)
            const rawRoles = decoded.roles || decoded.authorities || decoded.scope || [];

            // 2. Chuyển thành mảng String chuẩn
            const rolesArray = Array.isArray(rawRoles)
                ? rawRoles.map(r => (typeof r === 'object' ? r.name : String(r)))
                : String(rawRoles).split(" ");

            // 3. Ưu tiên kiểm tra AGENCY trước để điều hướng Agency Search
            if (rolesArray.some(role => role.includes("AGENCY"))) {
                return "AGENCY";
            }

            // 4. Nếu có Role HOTEL
            if (rolesArray.some(role => role.includes("HOTEL"))) {
                return "HOTEL";
            }

            return "HOTEL"; // Mặc định nếu không khớp
        } catch (err) {
            console.error("Lỗi giải mã Token tại HomePage:", err);
            return "HOTEL";
        }
    };
    // 3. Đóng guest picker khi click ngoài
    useEffect(() => {
        const handler = (e) => {
            if (guestRef.current && !guestRef.current.contains(e.target)) {
                setShowGuestPicker(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // 4. Hàm xử lý Tìm kiếm
    const handleSearchClick = () => {
        if (!isLoggedIn) {
            navigate("/login");
            return;
        }

        if (!keyword.trim()) {
            alert("Vui lòng nhập thông tin!");
            return;
        }

        const currentRole = getRoleFromToken();

        const params = new URLSearchParams();
        params.set("keyword", keyword.trim());
        if (checkIn) params.set("checkIn", checkIn);
        if (checkOut) params.set("checkOut", checkOut);
        params.set("rooms", String(roomCount));
        params.set("adults", String(adults));
        params.set("children", String(children));

        // Điều hướng dựa trên Role
        if (currentRole === "HOTEL") {
            // Nếu là HOTEL -> đi đến hotel/list-hotel
            navigate(`/hotel/list-hotel?${params.toString()}`);
        } else {
            // Nếu là AGENCY (hoặc mặc định) -> giữ nguyên agency/search-hotel/list
            navigate(`/agency/search-hotel/list?${params.toString()}`);
        }
    };

    // 5. Hàm điều hướng cho 2 nút Agency/Hotel
    const handleRoleNav = (path) => {
        if (isLoggedIn) navigate(path);
        else navigate("/login");
    };

    // Component con
    const CounterRow = ({ label, value, onMinus, onPlus, min = 0 }) => (
        <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
            <span className="text-sm text-slate-700 font-medium">{label}</span>
            <div className="flex items-center gap-3">
                <button type="button" onClick={onMinus} disabled={value <= min}
                        className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30">
                    <Minus size={14} />
                </button>
                <span className="w-4 text-center text-sm font-bold">{value}</span>
                <button type="button" onClick={onPlus}
                        className="w-8 h-8 rounded-full border border-blue-400 bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-100">
                    <Plus size={14} />
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col">
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }
                .animate-marquee { display: inline-block; animation: marquee 25s linear infinite; }
            `
            }}/>
            {/* ================= HERO SECTION ================= */}
            <section
                className="relative min-h-[650px] flex flex-col items-center justify-center text-center px-4 py-12">
                <div className="absolute inset-0 z-0 bg-cover bg-center" style={{backgroundImage: `url(${homepage})`}}>
                    <div className="absolute inset-0 bg-black/50"></div>
                </div>

                <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
                        Nền tảng Đặt phòng B2B An toàn & Thông minh
                    </h1>
                    <p className="text-blue-100 text-lg md:text-xl mb-10 opacity-90">
                        Giải pháp Escrow bảo vệ dòng tiền 100% cho Đại lý và Khách sạn
                    </p>

                    {/* Role Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-12">
                        <button onClick={() => handleRoleNav("/demo-agency/dashboard")}
                                className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#00A651] hover:bg-[#008f45] text-white font-bold transition-all active:scale-95 shadow-lg">
                            <UserCheck size={20}/> Tôi là Đại lý
                        </button>
                        <button onClick={() => handleRoleNav("/demo/hotel/dashboard")}
                                className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#F36F21] hover:bg-[#d85e17] text-white font-bold transition-all active:scale-95 shadow-lg">
                            <Building2 size={20}/> Tôi là Khách sạn
                        </button>

                    </div>

                    {/* ================= TÍCH HỢP SEARCH FORM ================= */}
                    <div
                        className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-4 w-full items-end">

                        {/* Điểm đến - Updated to match code 2 */}
                        <div
                            className="flex-[1.8] min-w-0 w-full relative group text-left"
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                        >
                            <label className="text-[12px] font-bold text-slate-700 uppercase ml-1 mb-1 block">Bạn muốn đi đâu?</label>

                            {showTooltip && (
                                <div
                                    className="absolute bottom-full left-0 mb-2 w-max max-w-[400px] bg-slate-800 text-white text-[11px] p-3 rounded-lg shadow-xl z-[60] animate-in fade-in slide-in-from-bottom-2">
                                    <div className="flex gap-2 mb-2 text-blue-300 font-bold uppercase items-center">
                                        <Info size={14}/> Gợi ý tìm kiếm
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
                                    <div
                                        className="absolute top-full left-6 -mt-1 border-8 border-transparent border-t-slate-800"></div>
                                </div>
                            )}

                            <div
                                className="relative flex items-center bg-white rounded-lg px-3 py-2 border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-50 transition-all h-[48px] overflow-hidden">
                                <Search className="text-slate-400 mr-2 flex-shrink-0 z-10 bg-white" size={18}/>
                                <div className="relative flex-1 h-full flex items-center overflow-hidden">
                                    {!keyword && !isFocused && (
                                        <div
                                            className="absolute inset-0 flex items-center pointer-events-none whitespace-nowrap">
                                            <div
                                                className="animate-marquee text-slate-400 text-sm pl-[100%]">{marqueeText}</div>
                                            <div
                                                className="animate-marquee text-slate-400 text-sm pl-4">{marqueeText}</div>
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
                        </div>

                        {/* Ngày nhận phòng */}
                        <div className="w-full md:w-[170px] text-left">
                            <label className="text-[12px] font-bold text-slate-700 uppercase ml-1 mb-1 block">Nhận
                                phòng</label>
                            <div
                                className="flex items-center bg-slate-50 rounded-lg px-3 py-3 border border-slate-200 focus-within:border-blue-500 transition-all">
                                <Calendar className="text-slate-400 mr-2" size={18}/>
                                <input
                                    type="date"
                                    className="bg-transparent outline-none text-slate-700 text-sm w-full cursor-pointer"
                                    value={checkIn}
                                    min={today}
                                    onChange={(e) => setCheckIn(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Ngày trả phòng */}
                        <div className="w-full md:w-[170px] text-left">
                            <label className="text-[12px] font-bold text-slate-700 uppercase ml-1 mb-1 block">Trả
                                phòng</label>
                            <div
                                className="flex items-center bg-slate-50 rounded-lg px-3 py-3 border border-slate-200 focus-within:border-blue-500 transition-all">
                                <Calendar className="text-slate-400 mr-2" size={18}/>
                                <input
                                    type="date"
                                    className="bg-transparent outline-none text-slate-700 text-sm w-full cursor-pointer"
                                    value={checkOut}
                                    min={checkIn ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split("T")[0] : today}
                                    onChange={(e) => setCheckOut(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Khách & Phòng */}
                        <div className="w-full md:w-[240px] text-left relative" ref={guestRef}>
                            <label className="text-[12px] font-bold text-slate-700 uppercase ml-1 mb-1 block">Khách &
                                Phòng</label>
                            <div
                                onClick={() => setShowGuestPicker(!showGuestPicker)}
                                className="flex items-center bg-[#F0FFF4] rounded-lg px-3 py-3 border border-slate-200 cursor-pointer hover:border-green-400 transition-all"
                            >
                                <Users className="text-green-600 mr-2" size={20}/>
                                <span className="text-green-800 font-medium text-sm truncate">{guestSummary}</span>
                                <ChevronDown className="ml-auto text-green-600" size={16}/>
                            </div>

                            {/* Guest Picker Popover */}
                            {showGuestPicker && (
                                <div
                                    className="absolute top-full right-0 left-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 p-4 z-50 min-w-[250px]">
                                    <CounterRow label="Phòng" value={roomCount} min={1}
                                                onMinus={() => setRoomCount(Math.max(1, roomCount - 1))}
                                                onPlus={() => setRoomCount(roomCount + 1)}/>
                                    <CounterRow label="Người lớn" value={adults} min={1}
                                                onMinus={() => setAdults(Math.max(1, adults - 1))}
                                                onPlus={() => setAdults(adults + 1)}/>
                                    <CounterRow label="Trẻ em" value={children} min={0}
                                                onMinus={() => setChildren(Math.max(0, children - 1))}
                                                onPlus={() => setChildren(children + 1)}/>
                                    <button onClick={() => setShowGuestPicker(false)}
                                            className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg font-bold text-sm">Xong
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Nút tìm kiếm */}
                        <button
                            onClick={handleSearchClick}
                            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all h-[48px]"
                        >
                            <Search size={20} strokeWidth={3}/>
                            TÌM KIẾM
                        </button>
                    </div>
                </div>
            </section>

            {/* ================= FEATURES SECTION ================= */}
            <section className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
                        <div
                            className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShieldCheck size={30}/></div>
                        <h3 className="font-bold text-xl mb-3">Hỗ trợ 24/7</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">Đội ngũ chuyên viên sẵn sàng xử lý mọi sự
                            cố phát sinh bất kể ngày đêm.</p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
                        <div
                            className="w-14 h-14 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Bot size={30}/></div>
                        <h3 className="font-bold text-xl mb-3">Bảo vệ đối tác</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">Đàm phán tối ưu chính sách hoàn hủy cho
                            đại lý trong mọi tình huống.</p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
                        <div
                            className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Wallet size={30}/></div>
                        <h3 className="font-bold text-xl mb-3">Thanh toán linh hoạt</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">Tích hợp ví điện tử và hạn mức tín dụng
                            giúp doanh nghiệp tối ưu dòng tiền.</p>
                    </div>
                </div>
            </section>

            <DemoRoleSelect isOpen={showDemoModal} onClose={() => setShowDemoModal(false)}/>
        </div>
    );
};

export default HomePage;