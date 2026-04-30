import { useState } from "react";
import { Plus, Pencil, Trash2, User, Baby, Building2, X } from "lucide-react";
import { DEMO_ROOM_TYPES } from "../mockData";

const EMPTY_FORM = { title: "", area: "", adults: 2, children: 1, totalRooms: "", basePrice: "", description: "" };

const DemoRoomTypes = () => {
    const [roomTypes, setRoomTypes] = useState(() => DEMO_ROOM_TYPES.map((r) => ({ ...r })));
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);

    const handleToggleActive = (id) => {
        setRoomTypes((prev) => prev.map((rt) => (rt.id === id ? { ...rt, isActive: !rt.isActive } : rt)));
    };

    const openAdd = () => {
        setEditItem(null);
        setForm(EMPTY_FORM);
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditItem(item);
        setForm({ title: item.title, area: item.area, adults: item.adults, children: item.children, totalRooms: item.totalRooms, basePrice: item.basePrice, description: item.description || "" });
        setShowModal(true);
    };

    const handleSave = () => {
        if (!form.title.trim()) {
            alert("Vui lòng nhập tên hạng phòng");
            return;
        }
        if (editItem) {
            setRoomTypes((prev) => prev.map((rt) => (rt.id === editItem.id ? { ...rt, ...form, area: Number(form.area), adults: Number(form.adults), children: Number(form.children), totalRooms: Number(form.totalRooms), basePrice: Number(form.basePrice) } : rt)));
        } else {
            const newId = Math.max(...roomTypes.map((r) => r.id), 0) + 1;
            setRoomTypes((prev) => [...prev, { id: newId, ...form, area: Number(form.area), adults: Number(form.adults), children: Number(form.children), totalRooms: Number(form.totalRooms), availableRooms: Number(form.totalRooms), basePrice: Number(form.basePrice), isActive: true, amenities: [] }]);
        }
        setShowModal(false);
    };

    const handleDelete = (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa hạng phòng này không?")) return;
        setRoomTypes((prev) => prev.filter((rt) => rt.id !== id));
    };

    const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-900">
            <div className="max-w-7xl mx-auto">

                {/* HEADER */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Quản lý hạng phòng</h1>
                    <p className="text-slate-500 font-medium text-[15px]">Thiết lập và tối ưu hóa các loại phòng của khách sạn để tăng tỷ lệ đặt phòng</p>
                </div>

                {/* MAIN CARD */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">

                    {/* CARD HEADER */}
                    <div className="flex flex-row justify-between items-center p-6 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800">Danh sách hạng phòng</h2>
                        <button onClick={openAdd} className="flex items-center gap-1 text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer">
                            <Plus size={16} strokeWidth={3} />
                            Thêm hạng phòng mới
                        </button>
                    </div>

                    {/* TABLE */}
                    <div className="overflow-x-auto">
                        {roomTypes.length === 0 ? (
                            <div className="p-12 text-center text-slate-500">Chưa có dữ liệu loại phòng nào.</div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-sm font-semibold text-slate-500 border-b border-slate-100">
                                        <th className="px-6 py-5 w-[30%]">Thông tin phòng</th>
                                        <th className="px-6 py-5 w-[30%]">Sức chứa</th>
                                        <th className="px-6 py-5 w-[15%]">Số lượng phòng</th>
                                        <th className="px-6 py-5 w-[15%]">Trạng thái</th>
                                        <th className="px-6 py-5 w-[10%]">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {roomTypes.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                                            {/* COL 1 - Info */}
                                            <td className="px-6 py-5">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900 flex-shrink-0 mt-1">
                                                        <Building2 size={24} strokeWidth={2} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 text-[15px] mb-1">{item.title}</div>
                                                        <div className="text-slate-400 text-xs font-semibold">{item.area} m²</div>
                                                        <div className="text-blue-600 text-xs font-bold mt-1">
                                                            {new Intl.NumberFormat("vi-VN").format(item.basePrice)} ₫
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* COL 2 - Capacity */}
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-6 text-slate-700">
                                                    <div className="flex items-center gap-1.5">
                                                        <User size={15} fill="currentColor" className="text-slate-900" />
                                                        <span className="font-medium text-[14px]">{item.adults} Người lớn</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Baby size={16} className="text-slate-900" strokeWidth={2.5} />
                                                        <span className="font-medium text-[14px]">{item.children} Trẻ em</span>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* COL 3 - Physical rooms */}
                                            <td className="px-6 py-5">
                                                <span className="text-slate-800 font-medium text-[15px]">{item.totalRooms} phòng</span>
                                            </td>
                                            {/* COL 4 - Status toggle */}
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => handleToggleActive(item.id)} className={`w-11 h-6 rounded-full relative transition-colors duration-300 cursor-pointer ${item.isActive ? "bg-[#00C16A]" : "bg-slate-300"}`}>
                                                        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${item.isActive ? "left-[22px]" : "left-0.5"}`} />
                                                    </button>
                                                    <span className="text-xs font-medium text-slate-500">{item.isActive ? "Đang mở bán" : "Tạm ẩn"}</span>
                                                </div>
                                            </td>
                                            {/* COL 5 - Actions */}
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => openEdit(item)} className="w-8 h-8 flex items-center justify-center rounded bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors" title="Chỉnh sửa">
                                                        <Pencil size={14} strokeWidth={2.5} />
                                                    </button>
                                                    <button onClick={() => handleDelete(item.id)} className="w-8 h-8 flex items-center justify-center rounded bg-red-50 hover:bg-red-100 text-red-500 transition-colors" title="Xóa">
                                                        <Trash2 size={14} strokeWidth={2.5} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* ADD / EDIT MODAL */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                        <div className="relative bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl">
                            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 rounded-full">
                                <X size={20} />
                            </button>
                            <h3 className="text-xl font-extrabold text-slate-800 mb-6">{editItem ? "Chỉnh sửa hạng phòng" : "Thêm hạng phòng mới"}</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">Tên hạng phòng</label>
                                    <input placeholder="VD: Deluxe Double Ocean View" value={form.title} onChange={(e) => set("title", e.target.value)} className="w-full px-4 py-3 bg-slate-50 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500 border border-slate-200" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-600 mb-1">Diện tích (m²)</label>
                                        <input type="number" value={form.area} onChange={(e) => set("area", e.target.value)} className="w-full px-4 py-3 bg-slate-50 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500 border border-slate-200" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-600 mb-1">Số lượng phòng</label>
                                        <input type="number" value={form.totalRooms} onChange={(e) => set("totalRooms", e.target.value)} className="w-full px-4 py-3 bg-slate-50 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500 border border-slate-200" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-600 mb-1">Người lớn</label>
                                        <input type="number" value={form.adults} onChange={(e) => set("adults", e.target.value)} className="w-full px-4 py-3 bg-slate-50 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500 border border-slate-200" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-600 mb-1">Trẻ em</label>
                                        <input type="number" value={form.children} onChange={(e) => set("children", e.target.value)} className="w-full px-4 py-3 bg-slate-50 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500 border border-slate-200" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">Giá cơ bản (VND)</label>
                                    <input type="number" placeholder="VD: 1200000" value={form.basePrice} onChange={(e) => set("basePrice", e.target.value)} className="w-full px-4 py-3 bg-slate-50 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500 border border-slate-200" />
                                </div>
                                <button onClick={handleSave} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors mt-2">
                                    {editItem ? "Cập nhật thay đổi" : "Xác nhận thêm mới"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DemoRoomTypes;