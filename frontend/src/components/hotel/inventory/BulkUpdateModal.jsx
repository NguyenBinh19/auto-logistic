import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

const DAYS = [
    { key: 'MONDAY', label: 'T2' },
    { key: 'TUESDAY', label: 'T3' },
    { key: 'WEDNESDAY', label: 'T4' },
    { key: 'THURSDAY', label: 'T5' },
    { key: 'FRIDAY', label: 'T6' },
    { key: 'SATURDAY', label: 'T7' },
    { key: 'SUNDAY', label: 'CN' },
];

const BulkUpdateModal = ({ isOpen, onClose, roomTypes, onSubmit, loading }) => {
    const [form, setForm] = useState({
        roomTypeId: '',
        startDate: '',
        endDate: '',
        allotment: '',
        daysOfWeek: [],
    });
    const [error, setError] = useState('');

    const allDaysSelected = form.daysOfWeek.length === 0;

    const toggleDay = (dayKey) => {
        setForm(prev => {
            const days = [...prev.daysOfWeek];
            const idx = days.indexOf(dayKey);
            if (idx >= 0) {
                days.splice(idx, 1);
            } else {
                days.push(dayKey);
            }
            return { ...prev, daysOfWeek: days };
        });
    };

    const selectAllDays = () => {
        setForm(prev => ({ ...prev, daysOfWeek: [] }));
    };

    const handleSubmit = async () => {
        setError('');
        if (!form.roomTypeId || !form.startDate || !form.endDate || form.allotment === '') {
            setError('Vui lòng nhập đầy đủ thông tin.');
            return;
        }
        if (new Date(form.endDate) < new Date(form.startDate)) {
            setError('Ngày kết thúc phải sau ngày bắt đầu.');
            return;
        }
        const allotment = parseInt(form.allotment, 10);
        if (isNaN(allotment) || allotment < 0) {
            setError('Số phòng phải là số không âm.');
            return;
        }
        if (selectedRoom && allotment > (selectedRoom.totalPhysicalRooms || selectedRoom.totalRooms)) {
            setError('Số phòng vượt quá số phòng thực tế.');
            return;
        }

        try {
            await onSubmit({
                roomTypeId: parseInt(form.roomTypeId, 10),
                startDate: form.startDate,
                endDate: form.endDate,
                allotment,
                daysOfWeek: form.daysOfWeek.length > 0 ? form.daysOfWeek : null,
            });
            onClose();
            setForm({ roomTypeId: '', startDate: '', endDate: '', allotment: '', daysOfWeek: [] });
        } catch (err) {
            const msg = err?.response?.data?.message || err.message || 'Không thể cập nhật số phòng.';
            setError(msg);
        }
    };

    if (!isOpen) return null;

    const selectedRoom = roomTypes.find(r => r.roomTypeId === parseInt(form.roomTypeId, 10));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-0 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-[15px] font-bold text-gray-900">Cập nhật số phòng hàng loạt</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">
                    {/* Room Type */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                            Loại phòng
                        </label>
                        <select
                            value={form.roomTypeId}
                            onChange={(e) => setForm(prev => ({ ...prev, roomTypeId: e.target.value }))}
                            className="w-full bg-gray-50 border border-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 outline-none font-medium"
                        >
                            <option value="">-- Chọn loại phòng --</option>
                            {roomTypes
                                .filter(rt => rt.roomStatus === 'active')
                                .map(rt => (
                                    <option key={rt.roomTypeId} value={rt.roomTypeId}>
                                        {rt.roomTypeName || rt.roomTitle} (Tối đa: {rt.totalPhysicalRooms || rt.totalRooms})
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                                Ngày bắt đầu
                            </label>
                            <input
                                type="date"
                                value={form.startDate}
                                onChange={(e) => setForm(prev => ({ ...prev, startDate: e.target.value }))}
                                className="w-full bg-gray-50 border border-gray-200 text-sm rounded-lg p-2.5 outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                                Ngày kết thúc
                            </label>
                            <input
                                type="date"
                                value={form.endDate}
                                onChange={(e) => setForm(prev => ({ ...prev, endDate: e.target.value }))}
                                className="w-full bg-gray-50 border border-gray-200 text-sm rounded-lg p-2.5 outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Days of Week */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                            Áp dụng theo thứ trong tuần
                        </label>
                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                type="button"
                                onClick={selectAllDays}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${allDaysSelected
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                Tất cả
                            </button>
                            {DAYS.map(day => {
                                const selected = form.daysOfWeek.includes(day.key);
                                return (
                                    <button
                                        key={day.key}
                                        type="button"
                                        onClick={() => toggleDay(day.key)}
                                        className={`w-9 h-9 rounded-lg text-xs font-bold border transition-colors ${selected
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        {day.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Allotment */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                            Số phòng bán (rooms)
                        </label>
                        <input
                            type="number"
                            min="0"
                            max={selectedRoom?.totalPhysicalRooms || selectedRoom?.totalRooms || 999}
                            value={form.allotment}
                            onChange={(e) => setForm(prev => ({ ...prev, allotment: e.target.value }))}
                            placeholder="Nhập số phòng mở bán"
                            className="w-full bg-gray-50 border border-gray-200 text-sm rounded-lg p-2.5 outline-none focus:ring-blue-500 focus:border-blue-500 font-medium"
                        />
                        {selectedRoom && (
                            <p className="mt-1 text-[11px] text-gray-400">
                                Tổng số phòng thực tế: {selectedRoom.totalPhysicalRooms || selectedRoom.totalRooms}
                            </p>
                        )}
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 text-red-600 text-xs font-medium p-3 rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                        Huỷ
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Save size={14} />
                        )}
                        Lưu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkUpdateModal;
