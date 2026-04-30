import { useState, useEffect, useRef, useMemo } from "react";
import {
    Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
    Car, Utensils, Sparkles, Building2, Package, Search, X, Loader2
} from "lucide-react";
import { createPortal } from "react-dom";
import { addonServiceApi } from "@/services/addonService.service.js";
import ToastPortal from "@/components/common/Notification/ToastPortal.jsx";
import { jwtDecode } from "jwt-decode";

const CATEGORIES = [
    { key: "all", label: "Tất cả" },
    { key: "FOOD_BEVERAGE", label: "Ẩm thực (F&B)" },
    { key: "TRANSPORT", label: "Vận chuyển" },
    { key: "SPA_WELLNESS", label: "Spa/Wellness" },
    { key: "CONFERENCE", label: "Hội nghị" },
];

const CATEGORY_LABELS = {
    FOOD_BEVERAGE: "Ẩm thực (F&B)",
    TRANSPORT: "Vận chuyển",
    SPA_WELLNESS: "Spa/Wellness",
    CONFERENCE: "Hội nghị",
};

const CATEGORY_COLORS = {
    FOOD_BEVERAGE: "bg-red-50 text-red-600 border border-red-200",
    TRANSPORT: "bg-blue-50 text-blue-600 border border-blue-200",
    SPA_WELLNESS: "bg-green-50 text-green-600 border border-green-200",
    CONFERENCE: "bg-teal-50 text-teal-600 border border-teal-200",
};

const CATEGORY_ICONS = {
    FOOD_BEVERAGE: <Utensils size={13} />,
    TRANSPORT: <Car size={13} />,
    SPA_WELLNESS: <Sparkles size={13} />,
    CONFERENCE: <Building2 size={13} />,
};

const UNITS = ["Lượt", "Theo Khách", "Theo Giờ", "Theo Ngày", "Theo Phòng"];
const getHotelIdFromToken = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;
    try {
        const decoded = jwtDecode(token);
        // Lấy hotelId từ các trường phổ biến trong JWT của bạn
        return decoded.hotelId || decoded.hotel_id || JSON.parse(localStorage.getItem("user"))?.hotelId;
    } catch (error) {
        console.error("Lỗi giải mã token:", error);
        return null;
    }
};

/* ========== MODAL FORM ========== */
const ServiceModal = ({ mode, initial, onClose, onSaved }) => {
    const [form, setForm] = useState(
        initial || {
            serviceName: "",
            category: "",
            description: "",
            netPrice: "",
            publicPrice: "",
            unit: "",
            requireServiceDate: false,
            requireFlightInfo: false,
            requireSpecialNote: false,
        }
    );
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Khi modal mở: chặn cuộn
        document.body.style.overflow = "hidden";
        // Khi modal đóng cuộn lại
        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    const handleChange = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

    const handleSubmit = async () => {
        const hotelId = getHotelIdFromToken();
        if (!hotelId) {
            return alert("Không tìm thấy ID khách sạn quản lý. Vui lòng đăng nhập lại!");
        }
        // 1. Validate Tên dịch vụ
        if (!form.serviceName.trim()) {
            return alert("Vui lòng nhập tên dịch vụ!");
        }

        // 2. Validate Danh mục
        if (!form.category) {
            return alert("Vui lòng chọn danh mục!");
        }

        // 3. Validate Đơn vị tính (Yêu cầu bắt buộc)
        if (!form.unit || form.unit.trim() === "") {
            return alert("Vui lòng chọn đơn vị tính!");
        }

        // 3. Validate Giá công bố
        // Kiểm tra trống:
        if (form.publicPrice === "" || form.publicPrice === null || form.publicPrice === undefined) {
            return alert("Vui lòng nhập giá công bố!");
        }
        // Kiểm tra số âm:
        if (Number(form.publicPrice) < 0) {
            return alert("Giá công bố không được là số âm!");
        }

        setSaving(true);
        try {
            const payload = {
                ...form,
                hotelId: hotelId,
                netPrice: 0,
                publicPrice: form.publicPrice ? Number(form.publicPrice) : null,
            };
            if (mode === "create") {
                await addonServiceApi.createAddonService(payload);
            } else {
                await addonServiceApi.updateAddonService(initial.serviceId, payload);
            }
            onSaved();
        } catch (err) {
            alert("Lưu thất bại: " + (err?.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };
    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
                    <h2 className="text-base font-bold text-slate-800">
                        {mode === "create" ? "Thêm Dịch Vụ Mới" : "Sửa thông tin dịch vụ"}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">×
                    </button>
                </div>

                {/* Body: Có scroll nếu nội dung quá dài */}
                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                    {/* Thông tin chung */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-slate-700">Thông tin chung</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Tên dịch vụ *</label>
                                <input
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="VD: Gala Dinner Buffet"
                                    value={form.serviceName}
                                    onChange={(e) => handleChange("serviceName", e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Danh mục *</label>
                                <select
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={form.category}
                                    onChange={(e) => handleChange("category", e.target.value)}
                                >
                                    <option value="">Chọn danh mục</option>
                                    {CATEGORIES.filter((c) => c.key !== "all").map((c) => (
                                        <option key={c.key} value={c.key}>{c.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 mb-1 block">Mô tả</label>
                            <textarea
                                rows={2}
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                placeholder="Giới thiệu ngắn gọn để hiện trên App Đại lý"
                                value={form.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Giá & Đơn vị */}
                    <div className="space-y-4 pt-2">
                        <h3 className="text-sm font-semibold text-slate-700">Giá &amp; Đơn vị</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Giá công bố (Tuỳ chọn)</label>
                                <div className="relative">
                                    <span
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">đ</span>
                                    <input
                                        type="number"
                                        min="0"
                                        onKeyDown={(e) => {
                                            if (e.key === "-" || e.key === "e") e.preventDefault(); // Ngăn nhập dấu trừ và ký tự 'e'
                                        }}
                                        className="w-full border border-slate-200 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="700000"
                                        value={form.publicPrice}
                                        onChange={(e) => handleChange("publicPrice", e.target.value)}
                                    />
                                </div>
                               
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Đơn vị tính *</label>
                                <select
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={form.unit}
                                    onChange={(e) => handleChange("unit", e.target.value)}
                                >
                                    <option value="">Chọn đơn vị tính</option>
                                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Cấu hình trường nhập liệu */}
                    <div className="pt-2">
                        <h3 className="text-sm font-semibold text-slate-700 mb-1">Cấu hình trường nhập liệu</h3>
                        <p className="text-xs text-slate-400 mb-3">Khi Agency đặt, họ cần nhập thêm thông tin gì?</p>
                        <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={form.requireServiceDate}
                                    onChange={(e) => handleChange("requireServiceDate", e.target.checked)}
                                    className="w-4 h-4 accent-blue-600 rounded"
                                />
                                <span
                                    className="text-sm text-slate-600 group-hover:text-blue-600 transition-colors font-medium">Yêu cầu Ngày sử dụng (Service Date)</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={form.requireFlightInfo}
                                    onChange={(e) => handleChange("requireFlightInfo", e.target.checked)}
                                    className="w-4 h-4 accent-blue-600 rounded"
                                />
                                <span
                                    className="text-sm text-slate-600 group-hover:text-blue-600 transition-colors font-medium">
                                    Thông tin Chuyến bay (Số hiệu, Giờ hạ cánh)
                                    <span className="ml-1 text-[10px] text-slate-400">(*) Vận chuyển</span>
                                </span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={form.requireSpecialNote}
                                    onChange={(e) => handleChange("requireSpecialNote", e.target.checked)}
                                    className="w-4 h-4 accent-blue-600 rounded"
                                />
                                <span
                                    className="text-sm text-slate-600 group-hover:text-blue-600 transition-colors font-medium">Ghi chú đặc biệt (Dị ứng, Ăn chay...)</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Footer: Cố định phía dưới */}
                <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-white">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="px-6 py-2 text-sm font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-200 disabled:opacity-60 disabled:shadow-none"
                    >
                        {saving ? "Đang lưu..." : "Lưu dịch vụ"}
                    </button>
                </div>
            </div>
        </div>
    );
    return createPortal(modalContent, document.body);
};

/* ========== MAIN PAGE ========== */
const AddonServiceManager = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("all");
    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const toastRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchServices = async () => {
        const hotelId = getHotelIdFromToken();
        if (!hotelId) {
            console.error("Không tìm thấy Hotel ID");
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            // Sử dụng hotelId lấy từ token
            const res = await addonServiceApi.getAddonServicesByHotel(hotelId);
            setServices(res?.result || []);
        } catch (err) {
            setServices([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    // const filtered = activeCategory === "all"
    //     ? services
    //     : services.filter((s) => s.category === activeCategory);
    const filtered = useMemo(() => {
        return services.filter((s) => {
            // Điều kiện 1: Lọc theo Tab Category
            const matchesCategory = activeCategory === "all" || s.category === activeCategory;

            // Điều kiện 2: Lọc theo Search Term (Tên dịch vụ)
            const matchesSearch = s.serviceName
                .toLowerCase()
                .includes(searchTerm.toLowerCase().trim());

            return matchesCategory && matchesSearch;
        });
    }, [services, activeCategory, searchTerm]);

    const handleToggle = async (svc) => {
        try {
            await addonServiceApi.toggleAddonServiceStatus(svc.serviceId);
            toastRef.current?.addMessage({ mode: "success", message: "Cập nhật trạng thái thành công!" });
            fetchServices();
        } catch {
            toastRef.current?.addMessage({ mode: "error", message: "Cập nhật trạng thái thất bại!" });
        }
    };

    const handleDelete = async (svc) => {
        if (!window.confirm(`Bạn có chắc muốn xóa dịch vụ "${svc.serviceName}"?`)) return;
        try {
            await addonServiceApi.deleteAddonService(svc.serviceId);
            toastRef.current?.addMessage({ mode: "success", message: "Đã xóa dịch vụ!" });
            fetchServices();
        } catch {
            toastRef.current?.addMessage({ mode: "error", message: "Xóa thất bại!" });
        }
    };

    const formatPrice = (v) =>
        v != null ? new Intl.NumberFormat("vi-VN").format(v) + " đ" : "—";

    return (
        <div className="space-y-6">
            <ToastPortal ref={toastRef} autoClose={true} autoCloseTime={3000} />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">QUẢN LÝ DỊCH VỤ</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Quản lý Dịch vụ Bổ trợ</p>
                </div>
                <button
                    onClick={() => { setEditTarget(null); setShowModal(true); }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                >
                    <Plus size={16} /> Thêm dịch vụ mới
                </button>
            </div>

            {/*/!* Category Tabs *!/*/}
            {/*<div className="flex gap-2 flex-wrap">*/}
            {/*    {CATEGORIES.map((cat) => (*/}
            {/*        <button*/}
            {/*            key={cat.key}*/}
            {/*            onClick={() => setActiveCategory(cat.key)}*/}
            {/*            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border*/}
            {/*                ${activeCategory === cat.key*/}
            {/*                ? "bg-blue-600 text-white border-blue-600"*/}
            {/*                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"*/}
            {/*            }`}*/}
            {/*        >*/}
            {/*            {cat.label}*/}
            {/*        </button>*/}
            {/*    ))}*/}
            {/*</div>*/}

            {/* TOOLBAR: Gộp Tabs và Search vào cùng một hàng */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Category Tabs */}
                <div className="flex gap-2 flex-wrap">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.key}
                            onClick={() => {
                                setActiveCategory(cat.key);
                                // Tùy chọn: Reset search khi đổi tab hoặc giữ nguyên tùy ý bạn
                            }}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border
                                ${activeCategory === cat.key
                                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                            }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Search Input UI */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Tìm tên dịch vụ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium shadow-sm"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-600">
                        <th className="px-6 py-3 text-left">Dịch vụ</th>
                        <th className="px-4 py-3 text-left">Loại</th>
                        {/*<th className="px-4 py-3 text-left">Giá Net B2B</th>*/}
                        <th className="px-4 py-3 text-left">Đơn vị tính</th>
                        <th className="px-4 py-3 text-left">Trạng thái</th>
                        <th className="px-4 py-3 text-center">Hành động</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={6} className="text-center py-16 text-slate-400">
                                Đang tải...
                            </td>
                        </tr>
                    ) : filtered.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="text-center py-16 text-slate-400">
                                <Package size={40} className="mx-auto mb-2 text-slate-300" />
                                Chưa có dịch vụ nào
                            </td>
                        </tr>
                    ) : (
                        filtered.map((svc) => {
                            const isActive = svc.status === "active";
                            return (
                                <tr key={svc.serviceId} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                                                {CATEGORY_ICONS[svc.category] || <Package size={16} />}
                                            </div>
                                            <span className="font-medium text-slate-800">{svc.serviceName}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[svc.category] || "bg-slate-100 text-slate-600"}`}>
                                                {CATEGORY_ICONS[svc.category]}
                                                {CATEGORY_LABELS[svc.category] || svc.category}
                                            </span>
                                    </td>
                                    {/*<td className="px-4 py-4 text-slate-700 font-medium">*/}
                                    {/*    {formatPrice(svc.netPrice)}*/}
                                    {/*</td>*/}
                                    <td className="px-4 py-4 text-slate-600">{svc.unit}</td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggle(svc)}
                                                title="Bật/Tắt trạng thái"
                                            >
                                                {isActive
                                                    ? <ToggleRight size={28} className="text-blue-600" />
                                                    : <ToggleLeft size={28} className="text-slate-300" />
                                                }
                                            </button>
                                            <span className={`text-xs font-medium ${isActive ? "text-slate-700" : "text-slate-400"}`}>
                                                    {isActive ? "Đang bán" : "Tạm dừng"}
                                                </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => { setEditTarget(svc); setShowModal(true); }}
                                                className="text-blue-500 hover:text-blue-700 transition-colors p-1"
                                                title="Sửa"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(svc)}
                                                className="text-red-400 hover:text-red-600 transition-colors p-1"
                                                title="Xóa"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <ServiceModal
                    mode={editTarget ? "edit" : "create"}
                    initial={editTarget
                        ? {
                            ...editTarget,
                            netPrice: editTarget.netPrice ?? "",
                            publicPrice: editTarget.publicPrice ?? "",
                        }
                        : null
                    }
                    onClose={() => { setShowModal(false); setEditTarget(null); }}
                    onSaved={() => {
                        setShowModal(false);
                        setEditTarget(null);
                        fetchServices();
                        toastRef.current?.addMessage({
                            mode: "success",
                            message: editTarget ? "Cập nhật dịch vụ thành công!" : "Thêm dịch vụ thành công!"
                        });
                    }}
                />
            )}
        </div>
    );
};

export default AddonServiceManager;