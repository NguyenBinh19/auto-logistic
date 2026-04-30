import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

const STATUS_COLORS = {
    AVAILABLE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    HURRY: 'bg-orange-50 text-orange-700 border-orange-200',
    SOLD_OUT: 'bg-red-50 text-red-700 border-red-200',
    STOP_SELL: 'bg-gray-100 text-gray-500 border-gray-300',
};

const STATUS_DOT = {
    AVAILABLE: 'bg-emerald-500',
    HURRY: 'bg-orange-500',
    SOLD_OUT: 'bg-red-500',
    STOP_SELL: 'bg-gray-400',
};

const STATUS_LABELS = {
    AVAILABLE: 'Còn phòng',
    HURRY: 'Sắp hết',
    SOLD_OUT: 'Hết phòng',
    STOP_SELL: 'Đóng bán',
};

const DAY_NAMES_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const InventoryGrid = ({ gridData, loading, onCellClick, onRefresh, startDate, endDate, onNavigate }) => {

    const dateRange = useMemo(() => {
        const dates = [];
        const start = new Date(startDate);
        const end = new Date(endDate);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            dates.push(new Date(d));
        }
        return dates;
    }, [startDate, endDate]);

    const formatDate = (date) => {
        const d = new Date(date);
        return `${d.getDate()}/${d.getMonth() + 1}`;
    };

    const getDayName = (date) => {
        const d = new Date(date);
        return DAY_NAMES_VI[d.getDay()];
    };

    const isWeekend = (date) => {
        const d = new Date(date);
        return d.getDay() === 0 || d.getDay() === 6;
    };

    const isToday = (date) => {
        const today = new Date();
        const d = new Date(date);
        return d.toDateString() === today.toDateString();
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header with navigation */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/50">
                <div className="flex items-center gap-3">
                    <h2 className="text-[15px] font-bold text-gray-900">
                        Bảng tồn phòng
                    </h2>
                    <button
                        onClick={onRefresh}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        title="Tải lại"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onNavigate('prev')}
                        className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={() => onNavigate('today')}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-xs font-semibold transition-colors"
                    >
                        Hôm nay
                    </button>
                    <button
                        onClick={() => onNavigate('next')}
                        className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4">
                    {Object.entries(STATUS_LABELS).map(([key, label]) => (
                        <div key={key} className="flex items-center gap-1.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[key]}`} />
                            <span className="text-[11px] text-gray-500 font-medium">{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="py-24 flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading...</p>
                </div>
            ) : gridData.length === 0 ? (
                <div className="py-24 text-center text-sm text-gray-400">
                    Không có loại phòng. Vui lòng tạo loại phòng trước.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left font-bold text-gray-700 min-w-[180px] border-r border-gray-200">
                                    Loại phòng
                                </th>
                                <th className="sticky left-[180px] z-10 bg-gray-50 px-2 py-3 text-center font-bold text-gray-700 min-w-[60px] border-r border-gray-200">
                                    Tổng
                                </th>
                                {dateRange.map((date, i) => (
                                    <th
                                        key={i}
                                        className={`px-1 py-2 text-center min-w-[54px] ${isToday(date) ? 'bg-blue-50' : isWeekend(date) ? 'bg-amber-50/50' : ''
                                            }`}
                                    >
                                        <div className={`text-[10px] font-medium ${isWeekend(date) ? 'text-amber-600' : 'text-gray-400'}`}>
                                            {getDayName(date)}
                                        </div>
                                        <div className={`text-[11px] font-bold ${isToday(date) ? 'text-blue-600' : 'text-gray-700'}`}>
                                            {formatDate(date)}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {gridData.map((roomType) => (
                                <React.Fragment key={roomType.roomTypeId}>
                                    {/* Allotment Row */}
                                    <tr className="border-b border-gray-100 hover:bg-gray-50/50">
                                        <td className="sticky left-0 z-10 bg-white px-4 py-2.5 border-r border-gray-200" rowSpan={3}>
                                            <div className="font-bold text-gray-900 text-[13px]">{roomType.roomTypeName}</div>
                                            <div className="text-[10px] text-gray-400 mt-0.5">
                                                Tối đa: {roomType.totalPhysicalRooms} phòng
                                            </div>
                                        </td>
                                        <td className="sticky left-[180px] z-10 bg-white px-2 py-2 text-center border-r border-gray-200">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">Phân bổ</span>
                                        </td>
                                        {roomType.dates.map((cell, i) => (
                                            <td
                                                key={`allot-${i}`}
                                                onClick={() => onCellClick(roomType.roomTypeId, cell)}
                                                className={`px-1 py-1.5 text-center cursor-pointer transition-colors hover:bg-blue-50 ${isToday(cell.date) ? 'bg-blue-50/30' : ''
                                                    }`}
                                            >
                                                <span className="font-bold text-gray-900 text-[12px]">
                                                    {cell.allotment}
                                                </span>
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Sold Row */}
                                    <tr className="border-b border-gray-50">
                                        <td className="sticky left-[180px] z-10 bg-white px-2 py-1 text-center border-r border-gray-200">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">Đã bán</span>
                                        </td>
                                        {roomType.dates.map((cell, i) => (
                                            <td
                                                key={`sold-${i}`}
                                                className={`px-1 py-1 text-center ${isToday(cell.date) ? 'bg-blue-50/30' : ''
                                                    }`}
                                            >
                                                <span className="text-[11px] text-gray-500 font-medium">
                                                    {cell.soldCount}
                                                </span>
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Available/Status Row */}
                                    <tr className="border-b border-gray-200">
                                        <td className="sticky left-[180px] z-10 bg-white px-2 py-1.5 text-center border-r border-gray-200">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">Còn lại</span>
                                        </td>
                                        {roomType.dates.map((cell, i) => (
                                            <td
                                                key={`avail-${i}`}
                                                className={`px-1 py-1 text-center ${isToday(cell.date) ? 'bg-blue-50/30' : ''
                                                    }`}
                                            >
                                                <span className={`inline-flex items-center justify-center w-7 h-5 rounded text-[10px] font-bold border ${STATUS_COLORS[cell.status]}`}>
                                                    {cell.stopSell ? 'X' : cell.available}
                                                </span>
                                            </td>
                                        ))}
                                    </tr>
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default InventoryGrid;
