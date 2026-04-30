import React, { useState, useEffect } from 'react';
import { Settings, Save } from 'lucide-react';
import WeeklyStrategy from '@/components/hotel/dynamicPricing/WeeklyStrategy.jsx';
import SpecialEvents from '@/components/hotel/dynamicPricing/SpecialEvents.jsx';
// import OccupancyRules from '@/components/hotel/dynamicPricing/OccupancyRules.jsx';
import { roomTypeService } from '@/services/roomtypes.service.js';

const HOTEL_ID = 2;

const DynamicPricing = () => {
    const [activeTab, setActiveTab] = useState('WEEKLY'); // WEEKLY, EVENT, OCCUPANCY
    const [isAutoPricingOn, setIsAutoPricingOn] = useState(true);
    const [roomTypes, setRoomTypes] = useState([]);
    const [selectedRoomTypeId, setSelectedRoomTypeId] = useState(null);

    // Load room types
    useEffect(() => {
        const loadRoomTypes = async () => {
            try {
                const res = await roomTypeService.getRoomTypesByHotelId(HOTEL_ID);
                const list = res.result || res || [];
                setRoomTypes(list);
                if (list.length > 0) setSelectedRoomTypeId(list[0].roomTypeId);
            } catch (err) {
                console.error("Load room types error:", err);
            }
        };
        loadRoomTypes();
    }, []);

    const selectedRoom = roomTypes.find(r => r.roomTypeId === selectedRoomTypeId);
    const basePrice = selectedRoom?.basePrice || 1500000;

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-900">

            {/* --- 1. TIÊU ĐỀ TRANG --- */}
            <div className="max-w-7xl mx-auto mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    Định giá tự động
                </h1>
                <p className="text-gray-500 text-sm">
                    Cấu hình giá động và tối ưu doanh thu
                </p>
            </div>

            <div className="max-w-7xl mx-auto">

                {/* --- 2. CARD ĐIỀU KHIỂN --- */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        {/* CỘT 1: TRẠNG THÁI */}
                        <div className="flex flex-col h-full">
                            <h3 className="text-[15px] font-bold text-gray-900 mb-1">
                                Trạng thái Tự động hóa giá
                            </h3>
                            <p className="text-[13px] text-gray-500 mb-4">
                                Điều khiển toàn bộ hệ thống tự động hóa giá
                            </p>

                            <div className="mt-auto flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-700">Trạng thái:</span>

                                {/* Nút Toggle Switch Custom */}
                                <button
                                    onClick={() => setIsAutoPricingOn(!isAutoPricingOn)}
                                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                                        isAutoPricingOn ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}
                                >
                                    <span
                                        className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                                            isAutoPricingOn ? 'translate-x-6' : 'translate-x-0'
                                        }`}
                                    />
                                </button>

                                <span className="text-sm font-bold text-gray-900">
                                    {isAutoPricingOn ? 'ON' : 'OFF'}
                                </span>
                            </div>
                        </div>

                        {/* CỘT 2: ÁP DỤNG CHO (Có vách ngăn bên trái) */}
                        <div className="flex flex-col h-full md:border-l md:border-gray-100 md:pl-8">
                            <h3 className="text-[15px] font-bold text-gray-900 mb-1">
                                Áp dụng cho
                            </h3>
                            <p className="text-[13px] text-gray-500 mb-4">
                                Chọn loại phòng để áp dụng chiến lược giá
                            </p>

                            <div className="mt-auto">
                                <select
                                    value={selectedRoomTypeId || ''}
                                    onChange={(e) => setSelectedRoomTypeId(Number(e.target.value))}
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                                >
                                    {roomTypes.map(rt => (
                                        <option key={rt.roomTypeId} value={rt.roomTypeId}>
                                            {rt.roomTitle ||  `Room Type #${rt.roomTypeId}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* CỘT 3: GIÁ GỐC  */}
                        <div className="flex flex-col h-full md:border-l md:border-gray-100 md:pl-8">
                            <h3 className="text-[15px] font-bold text-gray-900 mb-1">
                                Giá Gốc tham chiếu
                            </h3>
                            <p className="text-[13px] text-gray-500 mb-4">
                                Tất cả điều chỉnh giá tự động đều dựa trên giá gốc này
                            </p>

                            <div className="mt-auto flex items-baseline">
                                <span className="text-sm text-gray-600 font-medium mr-2">Giá Chuẩn:</span>
                                <span className="text-xl font-bold text-blue-600">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(basePrice)}
                                </span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* --- 3. PHẦN TABS VÀ NỘI DUNG --- */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[500px]">
                    {/* TABS HEADER */}
                    <div className="border-b border-gray-200 px-6 pt-2">
                        <div className="flex gap-8">
                            <button
                                onClick={() => setActiveTab('WEEKLY')}
                                className={`py-4 text-[13px] font-bold uppercase tracking-wide border-b-[3px] transition-all ${
                                    activeTab === 'WEEKLY' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                CHIẾN LƯỢC TUẦN
                            </button>
                            <button
                                onClick={() => setActiveTab('EVENT')}
                                className={`py-4 text-[13px] font-bold uppercase tracking-wide border-b-[3px] transition-all ${
                                    activeTab === 'EVENT' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                NGÀY LỄ & SỰ KIỆN
                            </button>
                            {/* <button
                                onClick={() => setActiveTab('OCCUPANCY')}
                                className={`py-4 text-[13px] font-bold uppercase tracking-wide border-b-[3px] transition-all ${
                                    activeTab === 'OCCUPANCY' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                LUẬT THEO CÔNG SUẤT
                            </button> */}
                        </div>
                    </div>

                    {/* TAB CONTENT */}
                    <div className="p-6">
                        {selectedRoomTypeId && activeTab === 'WEEKLY' && <WeeklyStrategy basePrice={basePrice} roomTypeId={selectedRoomTypeId} />}
                        {selectedRoomTypeId && activeTab === 'EVENT' && <SpecialEvents roomTypeId={selectedRoomTypeId} />}
                        {/* {activeTab === 'OCCUPANCY' && <OccupancyRules />} */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DynamicPricing;