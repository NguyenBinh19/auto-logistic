import { useState } from "react";
import { Zap, Calendar, BarChart3 } from "lucide-react";
import { DEMO_DYNAMIC_PRICING, DEMO_ROOM_TYPES } from "../mockData";

const TABS = [
    { key: "weekly", label: "Theo tuần" },
    { key: "events", label: "Sự kiện" },
    { key: "occupancy", label: "Công suất" },
];

const DemoDynamicPricing = () => {
    const [activeTab, setActiveTab] = useState("weekly");
    const [isAutoPricingOn, setIsAutoPricingOn] = useState(true);
    const [selectedRoomTypeId, setSelectedRoomTypeId] = useState(DEMO_ROOM_TYPES[0]?.id);

    const { weeklyRules, events, occupancyRules } = DEMO_DYNAMIC_PRICING;
    const selectedRoom = DEMO_ROOM_TYPES.find((r) => r.id === selectedRoomTypeId);

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-900">

            {/* Page title */}
            <div className="max-w-7xl mx-auto mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Định giá tự động</h1>
                <p className="text-gray-500 text-sm">Cấu hình giá động và tối ưu doanh thu</p>
            </div>

            <div className="max-w-7xl mx-auto">

                {/* Control card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        {/* Col 1: Status toggle */}
                        <div className="flex flex-col h-full">
                            <h3 className="text-[15px] font-bold text-gray-900 mb-1">Trạng thái Tự động hóa giá</h3>
                            <p className="text-[13px] text-gray-500 mb-4">Điều khiển toàn bộ hệ thống tự động hóa giá</p>
                            <div className="mt-auto flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-700">Trạng thái:</span>
                                <button onClick={() => setIsAutoPricingOn(!isAutoPricingOn)} className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${isAutoPricingOn ? "bg-blue-600" : "bg-gray-300"}`}>
                                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${isAutoPricingOn ? "translate-x-6" : "translate-x-0"}`} />
                                </button>
                                <span className="text-sm font-bold text-gray-900">{isAutoPricingOn ? "ON" : "OFF"}</span>
                            </div>
                        </div>

                        {/* Col 2: Room type selector */}
                        <div className="flex flex-col h-full md:border-l md:border-gray-100 md:pl-8">
                            <h3 className="text-[15px] font-bold text-gray-900 mb-1">Áp dụng cho</h3>
                            <p className="text-[13px] text-gray-500 mb-4">Chọn loại phòng để áp dụng chiến lược giá</p>
                            <div className="mt-auto">
                                <select value={selectedRoomTypeId || ""} onChange={(e) => setSelectedRoomTypeId(Number(e.target.value))} className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg p-2.5 outline-none font-medium cursor-pointer hover:bg-gray-100 transition-colors">
                                    {DEMO_ROOM_TYPES.filter((r) => r.isActive).map((rt) => (
                                        <option key={rt.id} value={rt.id}>{rt.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Col 3: Tab selector */}
                        <div className="flex flex-col h-full md:border-l md:border-gray-100 md:pl-8">
                            <h3 className="text-[15px] font-bold text-gray-900 mb-1">Chiến lược</h3>
                            <p className="text-[13px] text-gray-500 mb-4">Chọn loại chiến lược để cấu hình</p>
                            <div className="mt-auto flex gap-2">
                                {TABS.map(({ key, label }) => (
                                    <button key={key} onClick={() => setActiveTab(key)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === key ? "bg-blue-600 text-white shadow-sm" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Weekly tab */}
                {activeTab === "weekly" && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="text-base font-bold text-gray-900">Điều chỉnh giá theo ngày trong tuần</h2>
                        </div>
                        <div className="grid grid-cols-7 divide-x divide-gray-100">
                            {weeklyRules.map((ws) => (
                                <div key={ws.day} className="p-4 text-center hover:bg-slate-50/50 transition-colors">
                                    <p className="text-xs font-black text-slate-400 uppercase mb-3">{ws.day}</p>
                                    <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-black ${ws.modifier > 0 ? "bg-green-50 text-green-600" : ws.modifier < 0 ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-500"}`}>
                                        {ws.modifier > 0 ? "+" : ""}{ws.modifier}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Events tab */}
                {activeTab === "events" && (
                    <div className="space-y-4">
                        {events.map((ev, i) => (
                            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200/50">
                                        <Zap size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{ev.name}</p>
                                        <p className="text-xs text-gray-400 font-medium">{ev.startDate} - {ev.endDate}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className={`px-4 py-2 rounded-xl text-sm font-black ${ev.modifier > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                                        {ev.modifier > 0 ? "+" : ""}{ev.modifier}%
                                    </div>
                                    <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${ev.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"}`}>
                                        {ev.isActive ? "Đang hoạt động" : "Không hoạt động"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Occupancy tab */}
                {activeTab === "occupancy" && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="text-base font-bold text-gray-900">Điều chỉnh giá theo công suất</h2>
                        </div>
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    <th className="text-left px-6 py-3">Mức công suất</th>
                                    <th className="text-center px-6 py-3">Tỷ lệ lấp phòng</th>
                                    <th className="text-center px-6 py-3">Điều chỉnh giá</th>
                                </tr>
                            </thead>
                            <tbody>
                                {occupancyRules.map((rule, i) => (
                                    <tr key={i} className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold text-gray-700">{rule.threshold}%+</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${rule.threshold > 80 ? "bg-red-500" : rule.threshold > 50 ? "bg-amber-500" : "bg-blue-500"}`} style={{ width: `${rule.threshold}%` }} />
                                                </div>
                                                <span className="text-xs font-bold text-gray-500">{rule.threshold}%+</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-black ${rule.modifier > 0 ? "bg-green-50 text-green-600" : rule.modifier < 0 ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-500"}`}>
                                                {rule.modifier > 0 ? "+" : ""}{rule.modifier}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DemoDynamicPricing;
