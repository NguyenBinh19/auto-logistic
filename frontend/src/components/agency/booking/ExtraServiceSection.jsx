import { useState, useEffect } from "react";
import { Car, Utensils, Sparkles, Building2, Package, Plus, Minus, ChevronDown, ChevronUp } from "lucide-react";
import { addonServiceApi } from "@/services/addonService.service.js";

const CATEGORY_LABELS = {
    FOOD_BEVERAGE: "Ẩm thực (F&B)",
    TRANSPORT: "Vận chuyển",
    SPA_WELLNESS: "Spa/Wellness",
    CONFERENCE: "Hội nghị",
};

const CATEGORY_COLORS = {
    FOOD_BEVERAGE: "bg-red-50 text-red-600",
    TRANSPORT: "bg-blue-50 text-blue-600",
    SPA_WELLNESS: "bg-green-50 text-green-600",
    CONFERENCE: "bg-teal-50 text-teal-600",
};

const CATEGORY_ICONS = {
    FOOD_BEVERAGE: <Utensils size={14} />,
    TRANSPORT: <Car size={14} />,
    SPA_WELLNESS: <Sparkles size={14} />,
    CONFERENCE: <Building2 size={14} />,
};

/**
 * UC-026 - Add Extra Service
 * Props:
 *   hotelId (number): id khách sạn
 *   onChange (fn): callback (selectedServices) khi thay đổi
 */
const ExtraServiceSection = ({ hotelId, checkInDate, checkOutDate, onChange }) => {
    const [services, setServices] = useState([]);
    const [selected, setSelected] = useState({}); // { serviceId: { qty, serviceDate, flightNumber, flightTime, specialNote, expanded } }
    const [loading, setLoading] = useState(true);
    const [serviceErrors, setServiceErrors] = useState({});

    useEffect(() => {
        if (!hotelId) return;
        addonServiceApi.getActiveAddonServicesByHotel(hotelId)
            .then((res) => setServices(res?.result || []))
            .catch(() => setServices([]))
            .finally(() => setLoading(false));
    }, [hotelId]);

    const formatCurrency = (v) =>
        v != null ? new Intl.NumberFormat("vi-VN").format(v) + " ₫" : "";

    const notifyChange = (newSelected) => {
        if (!onChange) return;

        const payload = Object.entries(newSelected)
            .filter(([, v]) => v.checked)
            .map(([id, v]) => {
                const svc = services.find(s => String(s.serviceId) === String(id));
                return {
                    serviceId: Number(id),
                    serviceName: svc?.serviceName || '',
                    quantity: v.qty,
                    serviceDate: v.serviceDate || null,
                    flightNumber: v.flightNumber || null,
                    flightTime: v.flightTime || null,
                    specialNote: v.specialNote || null,
                    netPrice: svc?.netPrice ?? 0,
                    requireServiceDate: !!svc?.requireServiceDate,
                    requireFlightInfo: !!svc?.requireFlightInfo,
                    requireSpecialNote: !!svc?.requireSpecialNote,
                };
            });

        onChange(payload);
    };

    const toggleSelect = (svc) => {
        setSelected((prev) => {
            const was = prev[svc.serviceId];
            const next = was?.checked
                ? { ...was, checked: false }
                : { checked: true, qty: 1, serviceDate: "", flightNumber: "", flightTime: "", specialNote: "", expanded: true };

            const updated = { ...prev, [svc.serviceId]: next };

            setServiceErrors((prevErrors) => ({
                ...prevErrors,
                [svc.serviceId]: {
                    serviceDate: '',
                    flightNumber: '',
                    flightTime: '',
                },
            }));

            notifyChange(updated);
            return updated;
        });
    };

    const updateField = (serviceId, field, value) => {
        setSelected((prev) => {
            const updated = { ...prev, [serviceId]: { ...prev[serviceId], [field]: value } };

            setServiceErrors((prevErrors) => ({
                ...prevErrors,
                [serviceId]: {
                    ...(prevErrors[serviceId] || {}),
                    [field]: '',
                },
            }));

            notifyChange(updated);
            return updated;
        });
    };

    const changeQty = (serviceId, delta) => {
        setSelected((prev) => {
            const current = prev[serviceId]?.qty || 1;
            const next = Math.max(1, current + delta);
            const updated = { ...prev, [serviceId]: { ...prev[serviceId], qty: next } };
            notifyChange(updated);
            return updated;
        });
    };

    if (loading) return null;
    if (services.length === 0) return null;

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold mb-1 text-slate-800">Dịch vụ thêm</h2>
            <p className="text-xs text-slate-500 mb-5">Chọn dịch vụ bổ trợ kèm theo cho chuyến lưu trú này</p>

            <div className="space-y-3">
                {services.map((svc) => {
                    const sel = selected[svc.serviceId];
                    const isSelected = sel?.checked;
                    const totalLine = isSelected ? svc.netPrice * (sel.qty || 1) : null;

                    return (
                        <div
                            key={svc.serviceId}
                            className={`border rounded-xl transition-all overflow-hidden ${isSelected ? "border-blue-300 bg-blue-50/30" : "border-slate-100 hover:border-slate-200"
                                }`}
                        >
                            {/* Service row */}
                            <div className="flex items-center gap-4 p-4">
                                {/* Checkbox */}
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 accent-blue-600 flex-shrink-0"
                                    checked={!!isSelected}
                                    onChange={() => toggleSelect(svc)}
                                />

                                {/* Icon */}
                                <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 flex-shrink-0">
                                    {CATEGORY_ICONS[svc.category] || <Package size={16} />}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-slate-800 text-sm">{svc.serviceName}</div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${CATEGORY_COLORS[svc.category] || "bg-slate-100 text-slate-500"}`}>
                                            {CATEGORY_ICONS[svc.category]}
                                            {CATEGORY_LABELS[svc.category] || svc.category}
                                        </span>
                                        <span className="text-[11px] text-slate-400">{svc.unit}</span>
                                    </div>
                                </div>

                                {/* Price + qty */}
                                <div className="text-right flex-shrink-0">
                                    <div className="text-sm font-bold text-slate-800">{formatCurrency(svc.netPrice)}</div>
                                    <div className="text-[10px] text-slate-400">/{svc.unit}</div>
                                </div>

                                {/* Qty controls */}
                                {isSelected && (
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => changeQty(svc.serviceId, -1)}
                                            className="w-6 h-6 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors"
                                        >
                                            <Minus size={12} />
                                        </button>
                                        <span className="w-6 text-center text-sm font-bold">{sel.qty}</span>
                                        <button
                                            type="button"
                                            onClick={() => changeQty(svc.serviceId, +1)}
                                            className="w-6 h-6 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 flex items-center justify-center transition-colors"
                                        >
                                            <Plus size={12} />
                                        </button>
                                    </div>
                                )}

                                {/* Expand toggle */}
                                {isSelected && (svc.requireServiceDate || svc.requireFlightInfo || svc.requireSpecialNote) && (
                                    <button
                                        type="button"
                                        onClick={() => updateField(svc.serviceId, "expanded", !sel.expanded)}
                                        className="text-slate-400 hover:text-slate-600 flex-shrink-0"
                                    >
                                        {sel.expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </button>
                                )}
                            </div>

                            {/* Expanded extra fields */}
                            {isSelected && sel.expanded && (
                                <div className="px-4 pb-4 pt-0 space-y-3 border-t border-blue-100 bg-white">
                                    {svc.requireServiceDate && (
                                        <div>
                                            <label className="text-xs text-slate-500 mb-1 block font-medium">
                                                Ngày sử dụng dịch vụ *
                                            </label>
                                            <input
                                                type="date"
                                                value={sel.serviceDate}
                                                min={checkInDate || undefined}
                                                max={checkOutDate || undefined}
                                                onChange={(e) => updateField(svc.serviceId, "serviceDate", e.target.value)}
                                                className={`border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 ${serviceErrors[svc.serviceId]?.serviceDate
                                                        ? 'border-red-300 bg-red-50 focus:ring-red-300'
                                                        : 'border-slate-200 focus:ring-blue-400'
                                                    }`}
                                            />
                                            {serviceErrors[svc.serviceId]?.serviceDate && (
                                                <p className="mt-1 text-xs text-red-600">
                                                    {serviceErrors[svc.serviceId].serviceDate}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    {svc.requireFlightInfo && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs text-slate-500 mb-1 block font-medium">
                                                    Số hiệu chuyến bay *
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="VD: VN123"
                                                    value={sel.flightNumber}
                                                    onChange={(e) => updateField(svc.serviceId, "flightNumber", e.target.value)}
                                                    className={`border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 ${serviceErrors[svc.serviceId]?.flightNumber
                                                        ? 'border-red-300 bg-red-50 focus:ring-red-300'
                                                        : 'border-slate-200 focus:ring-blue-400'
                                                        }`}
                                                />
                                                {serviceErrors[svc.serviceId]?.flightNumber && (
                                                    <p className="mt-1 text-xs text-red-600">
                                                        {serviceErrors[svc.serviceId].flightNumber}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="text-xs text-slate-500 mb-1 block font-medium">
                                                    Giờ hạ cánh *
                                                </label>
                                                <input
                                                    type="time"
                                                    value={sel.flightTime}
                                                    onChange={(e) => updateField(svc.serviceId, "flightTime", e.target.value)}
                                                    className={`border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 ${serviceErrors[svc.serviceId]?.flightTime
                                                        ? 'border-red-300 bg-red-50 focus:ring-red-300'
                                                        : 'border-slate-200 focus:ring-blue-400'
                                                        }`}
                                                />
                                                {serviceErrors[svc.serviceId]?.flightTime && (
                                                    <p className="mt-1 text-xs text-red-600">
                                                        {serviceErrors[svc.serviceId].flightTime}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {svc.requireSpecialNote && (
                                        <div>
                                            <label className="text-xs text-slate-500 mb-1 block font-medium">Ghi chú đặc biệt</label>
                                            <input
                                                type="text"
                                                placeholder="VD: Dị ứng tôm, Ăn chay..."
                                                value={sel.specialNote}
                                                onChange={(e) => updateField(svc.serviceId, "specialNote", e.target.value)}
                                                className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            />
                                        </div>
                                    )}
                                    {/* Sub-total line */}
                                    <div className="text-right text-xs text-slate-500">
                                        Thành tiền: <span className="font-bold text-slate-800">{formatCurrency(totalLine)}</span>
                                    </div>
                                </div>
                            )}

                            {/* Selected but no extra fields - show subtotal */}
                            {isSelected && !sel.expanded && !(svc.requireServiceDate || svc.requireFlightInfo || svc.requireSpecialNote) && (
                                <div className="px-4 pb-3 text-right text-xs text-slate-500 border-t border-blue-100">
                                    Thành tiền: <span className="font-bold text-slate-800">{formatCurrency(totalLine)}</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ExtraServiceSection;
