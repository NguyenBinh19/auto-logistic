import React, { useState, useEffect } from 'react';
import { dynamicPricingService } from '@/services/dynamicPricing.service.js';

const DAYS = [
    { id: 1, label: 'Thứ Hai', code: 'T2', dbKey: 'Monday' },
    { id: 2, label: 'Thứ Ba', code: 'T3', dbKey: 'Tuesday' },
    { id: 3, label: 'Thứ Tư', code: 'T4', dbKey: 'Wednesday' },
    { id: 4, label: 'Thứ Năm', code: 'T5', dbKey: 'Thursday' },
    { id: 5, label: 'Thứ Sáu', code: 'T6', dbKey: 'Friday' },
    { id: 6, label: 'Thứ Bảy', code: 'T7', dbKey: 'Saturday' },
    { id: 0, label: 'Chủ Nhật', code: 'CN', dbKey: 'Sunday' },
];

const WeeklyStrategy = ({ basePrice = 1500000, roomTypeId }) => {
    const [weeklyRules, setWeeklyRules] = useState(
        DAYS.map(day => ({
            ruleId: null,
            day_of_week: day.id,
            dbKey: day.dbKey,
            action: 'KEEP',
            adjustment_value: 0,
            adjustment_type: 'FIXED'
        }))
    );
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!roomTypeId) return;
        const load = async () => {
            try {
                const rules = await dynamicPricingService.getRulesByRoomType(roomTypeId);
                const weeklyFromApi = (rules.result || rules || []).filter(r => r.ruleType === 'WEEKLY');
                setWeeklyRules(DAYS.map(day => {
                    const found = weeklyFromApi.find(r => r.dayOfWeek === day.dbKey);
                    if (found) {
                        return {
                            ruleId: found.ruleId,
                            day_of_week: day.id,
                            dbKey: day.dbKey,
                            action: found.action || 'KEEP',
                            adjustment_value: found.adjustmentValue || 0,
                            adjustment_type: found.adjustmentType || 'FIXED'
                        };
                    }
                    return { ruleId: null, day_of_week: day.id, dbKey: day.dbKey, action: 'KEEP', adjustment_value: 0, adjustment_type: 'FIXED' };
                }));
            } catch (err) {
                console.error("Load weekly rules error:", err);
            }
        };
        load();
    }, [roomTypeId]);

    const handleSave = async () => {
        setSaving(true);
        try {
            for (const rule of weeklyRules) {
                if (rule.action === 'KEEP' && rule.ruleId) {
                    await dynamicPricingService.deleteRule(rule.ruleId);
                } else if (rule.action !== 'KEEP') {
                    const payload = {
                        roomTypeId,
                        ruleName: `Weekly - ${rule.dbKey}`,
                        ruleType: 'WEEKLY',
                        dayOfWeek: rule.dbKey,
                        action: rule.action,
                        priority: 1,
                        adjustmentType: rule.adjustment_type,
                        adjustmentValue: rule.adjustment_value,
                        isActive: true
                    };
                    if (rule.ruleId) {
                        await dynamicPricingService.updateRule(rule.ruleId, payload);
                    } else {
                        await dynamicPricingService.createRule(payload);
                    }
                }
            }
            alert("Đã lưu chiến lược tuần thành công!");
        } catch (err) {
            alert(err.response?.data?.message || "Lưu thất bại!");
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (dayId, field, value) => {
    setWeeklyRules(prev => prev.map(item => {
        if (item.day_of_week !== dayId) return item;

        if (field === 'adjustment_value') {
            const num = Number(value);
            if (num < 0) return item; 
        }

        return { ...item, [field]: value };
    }));
};

    return (
        <div className="w-full">
            {/* Header Section */}
            <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Chiến lược giá theo tuần</h2>
                <p className="text-sm text-gray-500">Thiết lập điều chỉnh giá dựa trên thứ trong tuần so với giá gốc</p>
            </div>

            {/* GRID SYSTEM */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
                {DAYS.map((day) => {
                    const rule = weeklyRules.find(r => r.day_of_week === day.id);
                    const showValueInput = ['INCREASE', 'DECREASE'].includes(rule.action);

                    return (
                        <div
                            key={day.id}
                            className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow h-full"
                        >
                            {/* Card Header: Thứ & Mã */}
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-800 text-[15px]">{day.label}</span>
                                <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded">
                                    {day.code}
                                </span>
                            </div>

                            {/* Section: Hành động */}
                            <div>
                                <label className="block text-xs text-gray-500 mb-1.5 font-medium">Hành động</label>
                                <div className="relative">
                                    <select
                                        value={rule.action}
                                        onChange={(e) => handleChange(day.id, 'action', e.target.value)}
                                        className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none appearance-none"
                                    >
                                        <option value="KEEP">Giữ nguyên</option>
                                        <option value="INCREASE">Tăng (+)</option>
                                        <option value="DECREASE">Giảm (-)</option>
                                    </select>
                                    {/* Custom Chevron Icon */}
                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Giá trị (Input Group) */}
                            {showValueInput && (
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1.5 font-medium">Giá trị</label>
                                    <div className="flex rounded-lg shadow-sm">
                                        <input
                                            type="number"
                                            min="0"
                                            value={rule.adjustment_value}
                                            onChange={(e) => handleChange(day.id, 'adjustment_value', e.target.value)}
                                            className="block w-full min-w-0 flex-1 border border-r-0 border-gray-300 rounded-none rounded-l-lg p-2.5 text-sm text-gray-900 outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
                                            placeholder="0"
                                        />
                                        <span className="inline-flex items-center px-0 border border-l-0 border-gray-300 rounded-r-lg bg-white relative">
                                            <select
                                                value={rule.adjustment_type}
                                                onChange={(e) => handleChange(day.id, 'adjustment_type', e.target.value)}
                                                className="h-full py-0 pl-2 pr-7 border-0 bg-transparent text-gray-500 text-sm rounded-r-lg focus:ring-0 focus:outline-none cursor-pointer appearance-none hover:bg-gray-50"
                                            >
                                                <option value="FIXED">đ</option>
                                                <option value="PERCENT">%</option>
                                            </select>

                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
                                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                                </svg>
                                            </div>
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>


            {/* Save Button */}
            <div className="flex justify-end mt-6">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
                >
                    {saving ? "Đang lưu..." : "Lưu chiến lược tuần"}
                </button>
            </div>
        </div>
    );
};

export default WeeklyStrategy;