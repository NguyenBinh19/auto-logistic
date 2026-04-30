import React, { useState, useEffect } from 'react';
import { Calendar, Trash2, Edit2, Plus, Loader2 } from 'lucide-react';
import { dynamicPricingService } from '@/services/dynamicPricing.service.js';

const SpecialEvents = ({ roomTypeId }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [form, setForm] = useState({
        ruleName: '',
        startDate: '',
        endDate: '',
        action: 'INCREASE',
        adjustmentType: 'PERCENT',
        adjustmentValue: '',
    });

    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    useEffect(() => {
        if (roomTypeId) fetchEvents();
    }, [roomTypeId]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const rules = await dynamicPricingService.getRulesByRoomType(roomTypeId);
            const eventRules = (rules.result || rules || []).filter(r => r.ruleType === 'EVENT');
            setEvents(eventRules);
        } catch (err) {
            console.error('Load events error:', err);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setForm({
            ruleName: '',
            startDate: '',
            endDate: '',
            action: 'INCREASE',
            adjustmentType: 'PERCENT',
            adjustmentValue: '',
        });
        setEditingId(null);
        setErrorMessage('');
    };

    const handleSubmit = async () => {
        if (!form.ruleName.trim()) {
            setErrorMessage('Vui lòng nhập tên sự kiện');
            return;
        }

        if (!form.startDate) {
            setErrorMessage('Vui lòng chọn ngày bắt đầu');
            return;
        }

        if (!form.endDate) {
            setErrorMessage('Vui lòng chọn ngày kết thúc');
            return;
        }

        if (new Date(form.startDate) > new Date(form.endDate)) {
            setErrorMessage('Ngày bắt đầu không được sau ngày kết thúc');
            return;
        }

        if (form.adjustmentValue === '' || Number(form.adjustmentValue) <= 0) {
            setErrorMessage('Vui lòng nhập giá trị điều chỉnh hợp lệ');
            return;

        }
        setSubmitting(true);
        try {
            const payload = {
                roomTypeId,
                ruleName: form.ruleName,
                ruleType: 'EVENT',
                startDate: form.startDate,
                endDate: form.endDate,
                action: form.action,
                priority: 0,
                adjustmentType: form.adjustmentType,
                adjustmentValue: form.adjustmentValue,
                isActive: true,
            };

            if (editingId) {
                await dynamicPricingService.updateRule(editingId, payload);
            } else {
                await dynamicPricingService.createRule(payload);
            }

            resetForm();
            fetchEvents();
        } catch (err) {
            alert(err.response?.data?.message || 'Thao tác thất bại!');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (ev) => {
        setForm({
            ruleName: ev.ruleName,
            startDate: ev.startDate,
            endDate: ev.endDate,
            action: ev.action || 'INCREASE',
            priority: 0,
            adjustmentType: ev.adjustmentType,
            adjustmentValue: ev.adjustmentValue,
        });
        setEditingId(ev.ruleId);
    };

    const handleDelete = async (id) => {
        if (!confirm('Xác nhận xoá sự kiện này?')) return;
        try {
            await dynamicPricingService.deleteRule(id);
            fetchEvents();
        } catch (err) {
            alert('Xoá thất bại!');
        }
    };

    return (
        <div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Sự kiện Ngày Lễ & Đặc biệt</h2>
            <p className="text-sm text-gray-500 mb-6">Cấu hình giá cho các ngày lễ và sự kiện đặc biệt</p>

            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4">
                    {editingId ? 'Chỉnh sửa Sự kiện' : 'Thêm Sự kiện Mới'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên sự kiện</label>
                        <input
                            type="text"
                            placeholder="Ví dụ: Tết Nguyên Đán"
                            value={form.ruleName}
                            onChange={(e) => setForm({ ...form, ruleName: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Khoảng thời gian</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={form.startDate}
                                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none"
                            />
                            <span className="text-gray-500">đến</span>
                            <input
                                type="date"
                                value={form.endDate}
                                min={form.startDate || undefined}
                                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="mb-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hành động</label>
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="action"
                                    checked={form.action === 'INCREASE'}
                                    onChange={() => setForm({ ...form, action: 'INCREASE' })}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm text-gray-700">Tăng giá</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="action"
                                    checked={form.action === 'DECREASE'}
                                    onChange={() => setForm({ ...form, action: 'DECREASE' })}
                                    className="w-4 h-4 text-red-600"
                                />
                                <span className="text-sm text-gray-700">Giảm giá</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Kiểu điều chỉnh</label>
                        <div className="flex items-center gap-6 flex-wrap">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="adjustmentType"
                                    checked={form.adjustmentType === 'FIXED'}
                                    onChange={() => setForm({ ...form, adjustmentType: 'FIXED' })}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm text-gray-700">Giá cố định (₫)</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="adjustmentType"
                                    checked={form.adjustmentType === 'PERCENT'}
                                    onChange={() => setForm({ ...form, adjustmentType: 'PERCENT' })}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm text-gray-700">Phần trăm (%)</span>
                            </label>

                            <input
                                type="number"
                                min="0"
                                max={form.adjustmentType === 'PERCENT' ? 100 : undefined}
                                placeholder="Giá trị"
                                value={form.adjustmentValue}
                                onChange={(e) => {
                                    const raw = e.target.value;

                                    if (raw === '') {
                                        setForm({ ...form, adjustmentValue: '' });
                                        return;
                                    }

                                    let value = Number(raw);

                                    if (value < 0) value = 0;
                                    if (form.adjustmentType === 'PERCENT' && value > 100) value = 100;

                                    setForm({ ...form, adjustmentValue: value });
                                }}
                                className="border border-gray-300 rounded-lg px-3 py-1.5 w-32 outline-none"
                            />
                        </div>
                    </div>
                </div>
                {errorMessage && (
                    <div className="mb-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-700">
                        <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-[11px] font-bold text-rose-600">
                            !
                        </div>
                        <div className="leading-5">
                            <p className="font-bold">Không thể lưu sự kiện</p>
                            <p className="text-rose-700/90">{errorMessage}</p>
                        </div>
                    </div>
                )}
                <div className="flex justify-end gap-2">
                    {editingId && (
                        <button
                            onClick={resetForm}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-5 py-2 rounded-lg transition-colors"
                        >
                            Huỷ
                        </button>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {submitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                        {editingId ? 'Cập nhật' : 'Thêm Sự kiện'}
                    </button>

                </div>

            </div>

            <div>
                <h3 className="font-bold text-gray-800 mb-3">Danh sách Sự kiện Hiện tại</h3>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 size={24} className="animate-spin text-blue-500" />
                    </div>
                ) : events.length === 0 ? (
                    <p className="text-sm text-gray-400 italic py-4">Chưa có sự kiện nào được cấu hình.</p>
                ) : (
                    <div className="space-y-3">
                        {events.map((ev) => (
                            <div
                                key={ev.ruleId}
                                className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:shadow-sm transition-shadow"
                            >
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="font-bold text-gray-800">{ev.ruleName}</span>
                                    </div>

                                    <div className="text-sm text-gray-500 flex items-center gap-2 mb-2">
                                        <Calendar size={14} />
                                        {ev.startDate} - {ev.endDate}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`text-xs font-bold px-2 py-0.5 rounded ${ev.action === 'DECREASE'
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-blue-100 text-blue-700'
                                                }`}
                                        >
                                            {ev.action === 'DECREASE' ? '-' : '+'}
                                            {ev.adjustmentValue}
                                            {ev.adjustmentType === 'PERCENT' ? '%' : 'đ'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(ev)}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>

                                    <button
                                        onClick={() => handleDelete(ev.ruleId)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SpecialEvents;