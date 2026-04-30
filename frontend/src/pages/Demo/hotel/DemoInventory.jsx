import { useState } from "react";
import { Ban, ChevronLeft, ChevronRight, PenLine, ShieldOff, X } from "lucide-react";
import { DEMO_INVENTORY_GRID, DEMO_ROOM_TYPES } from "../mockData";

const formatCurrency = (n) => new Intl.NumberFormat("vi-VN").format(n);

const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return { dayName: days[d.getDay()], dayNum: d.getDate(), month: d.getMonth() + 1, isWeekend: d.getDay() === 0 || d.getDay() === 6 };
};

const ALL_ROOM_TYPES_OPTION = "__ALL__";

const DemoInventory = () => {
    const [offset, setOffset] = useState(0);
    const [grid, setGrid] = useState(DEMO_INVENTORY_GRID);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [showStopSellModal, setShowStopSellModal] = useState(false);
    const [toast, setToast] = useState(null);

    // Bulk Update form state
    const [bulkRoomTypeId, setBulkRoomTypeId] = useState(ALL_ROOM_TYPES_OPTION);
    const [bulkStartDate, setBulkStartDate] = useState("");
    const [bulkEndDate, setBulkEndDate] = useState("");
    const [bulkAllotment, setBulkAllotment] = useState("");
    const [bulkRate, setBulkRate] = useState("");

    // Stop-sell form state
    const [stopRoomTypeId, setStopRoomTypeId] = useState(ALL_ROOM_TYPES_OPTION);
    const [stopStartDate, setStopStartDate] = useState("");
    const [stopEndDate, setStopEndDate] = useState("");

    const visibleDays = grid.slice(offset, offset + 7);
    const roomTypes = DEMO_ROOM_TYPES.filter((r) => r.isActive);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

    const handleCellClick = (roomTypeId, day) => {
        const cell = day.roomTypes.find((r) => r.roomTypeId === roomTypeId);
        if (!cell || cell.stopSell) return;
        const newVal = prompt(`Cập nhật allotment cho ${day.date}\nHiện tại: ${cell.available} phòng`, String(cell.available));
        if (newVal === null) return;
        const parsed = parseInt(newVal, 10);
        if (isNaN(parsed) || parsed < 0) return;
        setGrid((prev) => prev.map((d) => d.date === day.date
            ? { ...d, roomTypes: d.roomTypes.map((r) => r.roomTypeId === roomTypeId ? { ...r, available: parsed } : r) }
            : d));
        showToast("Đã cập nhật tồn kho (Bản Demo)");
    };

    const applyBulkUpdate = () => {
        if (!bulkStartDate || !bulkEndDate) { showToast("Vui lòng chọn khoảng ngày"); return; }
        const newAllot = bulkAllotment !== "" ? parseInt(bulkAllotment, 10) : null;
        const newRate = bulkRate !== "" ? parseInt(bulkRate, 10) : null;
        if (newAllot === null && newRate === null) { showToast("Nhập số lượng hoặc giá cần cập nhật"); return; }

        setGrid((prev) => prev.map((d) => {
            if (d.date < bulkStartDate || d.date > bulkEndDate) return d;
            return {
                ...d,
                roomTypes: d.roomTypes.map((r) => {
                    if (bulkRoomTypeId !== ALL_ROOM_TYPES_OPTION && r.roomTypeId !== parseInt(bulkRoomTypeId)) return r;
                    return {
                        ...r,
                        ...(newAllot !== null ? { available: newAllot } : {}),
                        ...(newRate !== null ? { rate: newRate } : {}),
                    };
                }),
            };
        }));
        setShowBulkModal(false);
        setBulkAllotment(""); setBulkRate("");
        showToast("Đã cập nhật hàng loạt (Bản Demo)");
    };

    const applyStopSell = () => {
        if (!stopStartDate || !stopEndDate) { showToast("Vui lòng chọn khoảng ngày"); return; }
        setGrid((prev) => prev.map((d) => {
            if (d.date < stopStartDate || d.date > stopEndDate) return d;
            return {
                ...d,
                roomTypes: d.roomTypes.map((r) => {
                    if (stopRoomTypeId !== ALL_ROOM_TYPES_OPTION && r.roomTypeId !== parseInt(stopRoomTypeId)) return r;
                    return { ...r, stopSell: true };
                }),
            };
        }));
        setShowStopSellModal(false);
        showToast("Đã đóng bán (Bản Demo)");
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-900">
            {/* Toast */}
            {toast && (
                <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-bold animate-in fade-in">{toast}</div>
            )}

            {/* Page Header */}
            <div className="max-w-[1400px] mx-auto mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Giá & Phân bổ phòng</h1>
                        <p className="text-gray-500 text-sm">Quản lý số lượng phòng trống và trạng thái đóng bán</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setShowBulkModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm">
                            <PenLine size={16} /> Cập nhật hàng loạt
                        </button>
                        <button onClick={() => setShowStopSellModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors">
                            <ShieldOff size={16} /> Đóng bán
                        </button>
                    </div>
                </div>
            </div>

            {/* Date navigation */}
            <div className="max-w-[1400px] mx-auto mb-4 flex items-center gap-2">
                <button disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - 7))} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-colors">
                    <ChevronLeft size={18} />
                </button>
                <span className="text-sm font-bold text-slate-600 px-3">{visibleDays[0]?.date} - {visibleDays[visibleDays.length - 1]?.date}</span>
                <button disabled={offset + 7 >= grid.length} onClick={() => setOffset(Math.min(grid.length - 7, offset + 7))} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-colors">
                    <ChevronRight size={18} />
                </button>
            </div>

            {/* Grid */}
            <div className="max-w-[1400px] mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="text-left px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-widest w-[160px] sticky left-0 bg-white z-10">Loại phòng</th>
                                {visibleDays.map((day) => {
                                    const d = formatDate(day.date);
                                    return (
                                        <th key={day.date} className={`text-center px-2 py-3 min-w-[100px] ${d.isWeekend ? "bg-amber-50/50" : ""}`}>
                                            <div className="text-[10px] font-black text-slate-400 uppercase">{d.dayName}</div>
                                            <div className="text-sm font-black text-slate-700">{d.dayNum}/{d.month}</div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {roomTypes.map((rt) => (
                                <tr key={rt.id} className="border-b border-slate-50 hover:bg-slate-50/30">
                                    <td className="px-4 py-4 sticky left-0 bg-white z-10">
                                        <p className="text-sm font-bold text-slate-800">{rt.title}</p>
                                        <p className="text-[10px] text-slate-400">{rt.totalRooms} phòng</p>
                                    </td>
                                    {visibleDays.map((day) => {
                                        const cell = day.roomTypes.find((r) => r.roomTypeId === rt.id);
                                        if (!cell) return <td key={day.date} />;
                                        const d = formatDate(day.date);
                                        return (
                                            <td key={day.date} onClick={() => handleCellClick(rt.id, day)} className={`text-center px-2 py-3 cursor-pointer hover:bg-blue-50 transition-colors ${d.isWeekend ? "bg-amber-50/50" : ""} ${cell.stopSell ? "bg-red-50" : ""}`}>
                                                {cell.stopSell ? (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <Ban size={16} className="text-red-500" />
                                                        <span className="text-[10px] font-black text-red-500 uppercase">Stop-sell</span>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-1">
                                                        <div className="text-sm font-black text-blue-600">{formatCurrency(cell.rate)}</div>
                                                        <div className={`text-[10px] font-bold ${cell.available <= 3 ? "text-red-500" : "text-slate-400"}`}>{cell.available} phòng</div>
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Legend */}
            <div className="max-w-[1400px] mx-auto mt-4 flex gap-6 text-xs font-bold text-slate-400">
                <span className="flex items-center gap-2"><span className="w-3 h-3 bg-amber-50 rounded border border-amber-200" /> Cuối tuần</span>
                <span className="flex items-center gap-2"><span className="w-3 h-3 bg-red-50 rounded border border-red-200" /> Đang đóng bán</span>
                <span className="flex items-center gap-2"><span className="text-red-500">3 phòng</span> Sắp hết phòng</span>
            </div>

            {/* Bulk Update Modal */}
            {showBulkModal && (
                <SimpleModal title="Cập nhật hàng loạt" onClose={() => setShowBulkModal(false)}>
                    <p className="text-sm text-slate-500 mb-4">Chọn loại phòng, khoảng ngày và giá trị cần cập nhật.</p>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Loại phòng</label>
                    <select value={bulkRoomTypeId} onChange={(e) => setBulkRoomTypeId(e.target.value)} className="w-full mb-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none">
                        <option value={ALL_ROOM_TYPES_OPTION}>Tất cả loại phòng</option>
                        {roomTypes.map((rt) => <option key={rt.id} value={rt.id}>{rt.title}</option>)}
                    </select>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Khoảng ngày</label>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <input type="date" value={bulkStartDate} onChange={(e) => setBulkStartDate(e.target.value)} className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none" />
                        <input type="date" value={bulkEndDate} onChange={(e) => setBulkEndDate(e.target.value)} className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none" />
                    </div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Số lượng phòng trống (để trống = không đổi)</label>
                    <input type="number" min="0" value={bulkAllotment} onChange={(e) => setBulkAllotment(e.target.value)} placeholder="Ví dụ: 10" className="w-full mb-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none" />
                    <label className="block text-xs font-bold text-slate-500 mb-1">Giá phòng (VND, để trống = không đổi)</label>
                    <input type="number" min="0" value={bulkRate} onChange={(e) => setBulkRate(e.target.value)} placeholder="Ví dụ: 1500000" className="w-full mb-4 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none" />
                    <button onClick={applyBulkUpdate} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700">Áp dụng</button>
                </SimpleModal>
            )}

            {/* Stop Sell Modal */}
            {showStopSellModal && (
                <SimpleModal title="Đóng bán phòng" onClose={() => setShowStopSellModal(false)}>
                    <p className="text-sm text-slate-500 mb-4">Chọn loại phòng và khoảng ngày cần đóng bán.</p>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Loại phòng</label>
                    <select value={stopRoomTypeId} onChange={(e) => setStopRoomTypeId(e.target.value)} className="w-full mb-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none">
                        <option value={ALL_ROOM_TYPES_OPTION}>Tất cả loại phòng</option>
                        {roomTypes.map((rt) => <option key={rt.id} value={rt.id}>{rt.title}</option>)}
                    </select>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Khoảng ngày</label>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <input type="date" value={stopStartDate} onChange={(e) => setStopStartDate(e.target.value)} className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none" />
                        <input type="date" value={stopEndDate} onChange={(e) => setStopEndDate(e.target.value)} className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none" />
                    </div>
                    <button onClick={applyStopSell} className="w-full py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700">Đóng bán</button>
                </SimpleModal>
            )}
        </div>
    );
};

const SimpleModal = ({ title, onClose, children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 rounded-full"><X size={20} /></button>
            <h3 className="text-lg font-extrabold text-slate-800 mb-4">{title}</h3>
            {children}
        </div>
    </div>
);

export default DemoInventory;
