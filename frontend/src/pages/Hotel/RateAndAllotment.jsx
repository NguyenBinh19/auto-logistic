import React, { useState, useEffect, useCallback } from 'react';
import { Layers, PenLine, ShieldOff } from 'lucide-react';
import InventoryGrid from '@/components/hotel/inventory/InventoryGrid.jsx';
import BulkUpdateModal from '@/components/hotel/inventory/BulkUpdateModal.jsx';
import StopSellModal from '@/components/hotel/inventory/StopSellModal.jsx';
import { inventoryService } from '@/services/inventory.service.js';
import { roomTypeService } from '@/services/roomtypes.service.js';
import { jwtDecode } from "jwt-decode";


const GRID_DAYS = 14;

const formatDateParam = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const RateAndAllotment = () => {
    const [gridData, setGridData] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [showStopSellModal, setShowStopSellModal] = useState(false);
    const [toast, setToast] = useState(null);

    // Date range state (start = today, end = today + GRID_DAYS)
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    });
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + GRID_DAYS - 1);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Load room types
    useEffect(() => {
        const loadRoomTypes = async () => {
            try {
                const res = await roomTypeService.getRoomTypesByHotelId();
                const list = res.result || res || [];
                setRoomTypes(list.map(rt => ({
                    ...rt,
                    roomTypeName: rt.roomTitle || rt.typeName || `Room #${rt.roomTypeId}`,
                    totalPhysicalRooms: rt.totalRooms,
                })));
            } catch (err) {
                console.error("Load room types error:", err);
            }
        };
        loadRoomTypes();
    }, []);

    // Load inventory grid
    const loadGrid = useCallback(async () => {
        setLoading(true);
        try {
            const res = await inventoryService.getInventoryGrid(
                formatDateParam(startDate),
                formatDateParam(endDate)
            );
            setGridData(res.result || []);
        } catch (err) {
            console.error("Load inventory grid error:", err);
            setGridData([]);
        } finally {
            setLoading(false);
        }
    }, [startDate]);

    useEffect(() => {
        loadGrid();
    }, [loadGrid]);

    // Navigate grid
    const handleNavigate = (direction) => {
        setStartDate(prev => {
            const d = new Date(prev);
            if (direction === 'prev') d.setDate(d.getDate() - GRID_DAYS);
            else if (direction === 'next') d.setDate(d.getDate() + GRID_DAYS);
            else { d.setTime(new Date().setHours(0, 0, 0, 0)); }
            return d;
        });
    };

    // Cell click - inline edit for single allotment
    const handleCellClick = async (roomTypeId, cell) => {
        const newVal = prompt(
            `Update allotment for ${cell.date}\nCurrent: ${cell.allotment} | Sold: ${cell.soldCount}\nMax: ${cell.totalPhysicalRooms}`,
            String(cell.allotment)
        );
        if (newVal === null) return;

        const parsed = parseInt(newVal, 10);
        if (isNaN(parsed) || parsed < 0) {
            showToast('Invalid value.', 'error');
            return;
        }

        try {
            await inventoryService.updateSingleAllotment({
                roomTypeId,
                date: cell.date,
                allotment: parsed,
            });
            showToast('Inventory updated');
            loadGrid();
        } catch (err) {
            showToast(err?.response?.data?.message || 'Update failed.', 'error');
        }
    };

    // Bulk update
    const handleBulkUpdate = async (payload) => {
        setActionLoading(true);
        try {
            await inventoryService.bulkUpdateAllotment(payload);
            showToast('Inventory updated');
            loadGrid();
        } finally {
            setActionLoading(false);
        }
    };

    // Stop-sell
    const handleSetStopSell = async (payload) => {
        setActionLoading(true);
        try {
            await inventoryService.setStopSell(payload);
            showToast('Restriction updated');
            loadGrid();
        } finally {
            setActionLoading(false);
        }
    };

    const handleRemoveStopSell = async (payload) => {
        setActionLoading(true);
        try {
            await inventoryService.removeStopSell(payload);
            showToast('Restriction removed');
            loadGrid();
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-900">
            {/* Page Header */}
            <div className="max-w-[1400px] mx-auto mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">
                            Giá & Phân bổ phòng
                        </h1>
                        <p className="text-gray-500 text-sm">
                            Quản lý số lượng phòng và trạng thái đóng bán
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowBulkModal(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <PenLine size={16} />
                            Cập nhật hàng loạt
                        </button>
                        <button
                            onClick={() => setShowStopSellModal(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
                        >
                            <ShieldOff size={16} />
                            Đóng bán
                        </button>
                    </div>
                </div>
            </div>

            {/* Inventory Grid */}
            <div className="max-w-[1400px] mx-auto">
                <InventoryGrid
                    gridData={gridData}
                    loading={loading}
                    onCellClick={handleCellClick}
                    onRefresh={loadGrid}
                    startDate={formatDateParam(startDate)}
                    endDate={formatDateParam(endDate)}
                    onNavigate={handleNavigate}
                />
            </div>

            {/* Modals */}
            <BulkUpdateModal
                isOpen={showBulkModal}
                onClose={() => setShowBulkModal(false)}
                roomTypes={roomTypes}
                onSubmit={handleBulkUpdate}
                loading={actionLoading}
            />

            <StopSellModal
                isOpen={showStopSellModal}
                onClose={() => setShowStopSellModal(false)}
                roomTypes={roomTypes}
                onSetStopSell={handleSetStopSell}
                onRemoveStopSell={handleRemoveStopSell}
                loading={actionLoading}
            />

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-bold transition-all ${toast.type === 'error'
                        ? 'bg-red-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
};

export default RateAndAllotment;
