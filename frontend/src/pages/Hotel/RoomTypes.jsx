import {
    Plus, Loader2, Pencil, Trash2,
    User, Baby, Building2, Search, X, ChevronLeft, ChevronRight
} from "lucide-react";
import { useEffect, useState, useRef, useMemo } from "react";
import RoomTypeModal from "@/components/hotel/roomTypes/RoomTypeModal.jsx";
import RoomTypeDetailModal from "@/components/hotel/roomTypes/RoomTypeModalDetail.jsx";
import { roomTypeService } from "@/services/roomtypes.service.js";
import ToastPortal from "@/components/common/Notification/ToastPortal.jsx";


const ManageRoomTypes = () => {
    const [roomTypes, setRoomTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedRoomId, setSelectedRoomId] = useState(null);

    const toastRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // --- FETCH DATA ---
    const fetchRoomTypes = async () => {
        try {
            setLoading(true);
            const res = await roomTypeService.getRoomTypesByHotelId();

            const dataFromApi = res?.result || (Array.isArray(res) ? res : []);

            const mappedData = dataFromApi.map(item => {
                // Xử lý status: Dữ liệu thực tế là "ACTIVE" hoặc "inactive"
                const rawStatus = item.roomStatus || '';
                const isActive = rawStatus.toLowerCase() === 'active';

                return {
                    ...item,
                    id: item.roomTypeId,
                    title: item.roomTitle || "Không có tên",
                    // Khớp chính xác với JSON: max_adults, max_children, room_area
                    adults: item.max_adults ?? 0,
                    children: item.max_children ?? 0,
                    area: item.room_area ?? 0,
                    totalRooms: item.totalRooms ?? 0,
                    isActive: isActive
                };
            });
            setRoomTypes(mappedData);
        } catch (err) {
            console.error("Lỗi tải danh sách phòng:", err);
            setRoomTypes([]); // Tránh để state cũ
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoomTypes();
    }, []);

    const filteredData = useMemo(() => {
        return roomTypes.filter(item =>
            item.title.toLowerCase().includes(searchTerm.toLowerCase().trim())
        );
    }, [roomTypes, searchTerm]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage]);

    // Reset về trang 1 khi tìm kiếm
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // --- HANDLERS ---

    const handleAddNew = () => {
        setShowAddModal(true);
    };

    const handleEdit = (item) => {
        setSelectedRoomId(item.id);
    };

    const handleDelete = async (id) => {
        // Nội dung cảnh báo chi tiết
        const warningMessage =
            `⚠️ CẢNH BÁO QUAN TRỌNG:

1. Bạn đang thực hiện gỡ bỏ hoàn toàn hạng phòng này khỏi hệ thống.
2. Bạn PHẢI tự kiểm tra và xử lý các đơn hàng của hạng phòng này trong thời gian tới.
3. Hệ thống sẽ KHÔNG chịu trách nhiệm về các vấn đề phát sinh hoặc khiếu nại liên quan đến việc thiếu phòng cho khách đã đặt trước.
Bạn có chắc chắn xác nhận đã xử lý hết các đơn hàng và muốn tiếp tục xóa?`;

        const confirmDelete = window.confirm(warningMessage);
        if (!confirmDelete) return;

        try {
            setLoading(true); // Hiển thị trạng thái loading khi đang xóa
            await roomTypeService.deleteRoomType(id);

            // Thông báo thành công
            if (toastRef.current) {
                toastRef.current.addMessage({
                    mode: "success",
                    message: "Đã xóa hạng phòng thành công!"
                });
            }

            await fetchRoomTypes();
        } catch (err) {
            console.error("Xóa thất bại:", err);

            // Thông báo lỗi
            if (toastRef.current) {
                toastRef.current.addMessage({
                    mode: "error",
                    message: "Có lỗi xảy ra hoặc hạng phòng này đang có đơn hàng ràng buộc nên không thể xóa."
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSuccess = (customMessage) => {
        fetchRoomTypes();

        if (toastRef.current) {
            toastRef.current.addMessage({
                mode: "success",
                // Sử dụng tham số truyền vào
                message: customMessage || "Thao tác thành công!"
            });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-900">
            <ToastPortal ref={toastRef} autoClose={true} autoCloseTime={3000} />

            <div className="max-w-7xl mx-auto">

                {/* HEADER TITLE */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-800 mb-2">
                        Quản lý phòng
                    </h1>
                    <p className="text-slate-500 font-medium text-[15px]">
                        Quản lý và tối ưu hóa các hạng phòng của khách sạn để tăng tỷ lệ chuyển đổi
                    </p>
                </div>

                {/* SEARCH BAR  */}
                <div className="relative w-full mb-6">
                    <Search
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={20}
                    />
                    <input
                        type="text"
                        placeholder="Tìm kiếm nhanh tên hạng phòng (VD: Deluxe, Suite...)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-12 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm shadow-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors p-1"
                        >
                            <X size={18}/>
                        </button>
                    )}
                </div>

                {/* MAIN CARD */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">

                    {/* CARD HEADER */}
                    <div className="flex flex-row justify-between items-center p-6 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800">
                            Quản lý Hạng phòng (Inventory Setup)
                        </h2>

                        <button
                            onClick={handleAddNew}
                            className="flex items-center gap-1 text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                            <Plus size={16} strokeWidth={3}/>
                            Thêm hạng phòng mới
                        </button>
                    </div>

                    {/* TABLE LIST */}
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                                <Loader2 className="animate-spin mb-2" size={24}/>
                                Đang tải dữ liệu...
                            </div>
                        ) : filteredData.length === 0 ? (
                            <div className="p-12 text-center text-slate-500">
                                Chưa có dữ liệu loại phòng nào.
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                <tr className="text-sm font-semibold text-slate-600 border-b border-slate-100">
                                    <th className="px-6 py-5 w-[30%]">Thông tin</th>
                                    <th className="px-6 py-5 w-[30%]">Sức chứa</th>
                                    <th className="px-6 py-5 w-[15%]">Số lượng vật lý</th>
                                    <th className="px-6 py-5 w-[15%]">Trạng thái</th>
                                    <th className="px-6 py-5 w-[10%]">Hành động</th>
                                </tr>
                                </thead>
                                <tbody className="text-sm">
                                {paginatedData.map((item) => (
                                    <tr key={item.id}
                                        className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                                        {/* CỘT 1 */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-start gap-4">
                                                <div
                                                    className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900 flex-shrink-0 mt-1">
                                                    <Building2 size={24} strokeWidth={2}/>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 text-[15px] mb-1">
                                                        {item.title}
                                                    </div>
                                                    <div className="text-slate-400 text-xs font-semibold">
                                                        {item.area}m²
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        {/* CỘT 2 */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-6 text-slate-700">
                                                <div className="flex items-center gap-1.5">
                                                    <User size={15} fill="currentColor" className="text-slate-900"/>
                                                    <span
                                                        className="font-medium text-[14px]">x{item.adults} Người lớn</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Baby size={16} className="text-slate-900" strokeWidth={2.5}/>
                                                    <span
                                                        className="font-medium text-[14px]">x{item.children} Trẻ em</span>
                                                </div>
                                            </div>
                                        </td>
                                        {/* CỘT 3 */}
                                        <td className="px-6 py-5">
                                            <span className="text-slate-800 font-medium text-[15px]">
                                                {item.totalRooms} phòng
                                            </span>
                                        </td>
                                        {/* CỘT 4 */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className={`
                                                    w-11 h-6 rounded-full relative transition-colors duration-300 cursor-default
                                                    ${item.isActive ? 'bg-[#00C16A]' : 'bg-slate-300'}
                                                `}>
                                                    <div className={`
                                                        absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300
                                                        ${item.isActive ? 'left-[22px]' : 'left-0.5'}
                                                    `}/>
                                                </div>
                                                <span className="text-xs font-medium text-slate-500">
                                                    {item.isActive ? 'Đang rao' : 'Tạm ẩn'}
                                                </span>
                                            </div>
                                        </td>
                                        {/* CỘT 5 */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="w-8 h-8 flex items-center justify-center rounded bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                                                    title="Chỉnh sửa / Chi tiết"
                                                >
                                                    <Pencil size={14} strokeWidth={2.5}/>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="w-8 h-8 flex items-center justify-center rounded bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                                                    title="Chuyển vào thùng rác"
                                                >
                                                    <Trash2 size={14} strokeWidth={2.5}/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    {/* PHÂN TRANG (PAGINATION) FOOTER */}
                    {!loading && totalPages > 1 && (
                        <div
                            className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500">
                                Hiển thị <span
                                className="text-slate-900 font-bold">{paginatedData.length}</span> trên <span
                                className="text-slate-900 font-bold">{filteredData.length}</span> hạng phòng
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-30 transition-all"
                                >
                                    <ChevronLeft size={18}/>
                                </button>
                                <div className="flex items-center gap-1">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-white border border-transparent hover:border-slate-200'}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-30 transition-all"
                                >
                                    <ChevronRight size={18}/>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* MODAL 1 */}
                {showAddModal && (
                    <RoomTypeModal
                        // hotelId={HOTEL_ID}
                        onClose={() => setShowAddModal(false)}
                        onSuccess={() => handleSuccess("Thêm hạng phòng mới thành công!")}
                    />
                )}

                {/* MODAL 2 */}
                {selectedRoomId && (
                    <RoomTypeDetailModal
                        key={selectedRoomId} // Thêm key ở đây
                        roomId={selectedRoomId}
                        onClose={() => setSelectedRoomId(null)}
                        onSuccess={() => {
                            fetchRoomTypes();
                            setSelectedRoomId(null);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default ManageRoomTypes;