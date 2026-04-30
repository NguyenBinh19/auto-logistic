import React, { useEffect, useState } from 'react';
import { UserX } from 'lucide-react';
import StatCard from '@/components/hotel/frontDesk/StatisticCard.jsx';
import FilterHeader from '@/components/hotel/frontDesk/FilterHeader.jsx';
import BookingTable from '@/components/hotel/frontDesk/BookingTable.jsx';
import { bookingService } from '@/services/booking.service';
import { Search } from 'lucide-react';
import { toast } from 'react-hot-toast';

const FrontDeskDashboard = () => {
    const [activeTab, setActiveTab] = useState('arrival');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const today = new Date().toLocaleDateString('en-CA');
    const [currentDate, setCurrentDate] = useState(today);

    const [noShowModal, setNoShowModal] = useState({ show: false, booking: null, reason: "" });

    // Hàm mở Modal
    const openNoShowModal = (booking) => {
        if (today < booking.checkInDate) {
            toast.error(`Không thể báo Không đến trước ngày nhận phòng (${booking.checkInDate})!`);
            return;
        }
        setNoShowModal({
            show: true,
            booking,
            reason: "Khách không đến sau giờ quy định!"
        });
    };

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Số lượng đơn mỗi trang

    useEffect(() => {
        setCurrentPage(1);
        fetchBookings();
    }, [currentDate, activeTab]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            let response;
            const isToday = currentDate === today;

            if (activeTab === 'arrival') {
                response = isToday
                    ? await bookingService.getCheckInToday()
                    : await bookingService.getCheckInByDate(currentDate);
            }
            else if (activeTab === 'departure') {
                response = isToday
                    ? await bookingService.getTodayDepartures()
                    : await bookingService.getDeparturesByDate(currentDate);
            }
            else {
                setBookings([]);
                return;
            }

            if (response && response.result) {
                // Lọc bỏ các dòng trùng bookingCode, chỉ giữ lại dòng đầu tiên
                const uniqueBookings = Array.from(
                    new Map(response.result.map(item => [item['bookingCode'], item])).values()
                );
                setBookings(uniqueBookings);
            }
        } catch (error) {
            console.error("Lỗi tải danh sách:", error);
            toast.error("Không thể tải danh sách đơn hàng");
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    // Hàm xử lý gửi yêu cầu No-show
    const handleConfirmNoShow = async () => {
        const { booking, reason } = noShowModal;
        try {
            setLoading(true);
            const payload = {
                bookingCode: booking.bookingCode,
                reason: reason
            };

            const res = await bookingService.reportNoShow(payload);

            if (res.code === 1000 || res.result) {
                toast.success(`Đã đánh dấu Không đến cho đơn ${booking.bookingCode}!`);
                setNoShowModal({ show: false, booking: null, reason: "" });
                fetchBookings(); // Reload lại danh sách
            }
        } catch (error) {
            console.error("No-show error:", error);
            toast.error(error.response?.data?.message || "Lỗi khi báo cáo Không đến");
        } finally {
            setLoading(false);
        }
    };

    // Hàm xử lý Check-in
    const handleCheckin = async (bookingCode) => {
        if (!window.confirm(`Xác nhận thực hiện Check-in cho đơn ${bookingCode}?`)) return;
        try {
            setLoading(true);
            const payload = {
                bookingCode: bookingCode
            };
            const res = await bookingService.checkinGuest(payload);
            if (res.code === 1000 || res.result) {
                toast.success("Check-in thành công! Khách đã nhận phòng.");
                fetchBookings(); // Tải lại danh sách để cập nhật trạng thái mới
            }
        } catch (error) {
            console.error("Check-in error:", error);
            const msg = error.response?.data?.message || "Lỗi thực hiện check-in";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    // Hàm xử lý Checkout
    const handleCheckout = async (bookingCode) => {
        if (!window.confirm(`Xác nhận thực hiện checkout cho đơn ${bookingCode}?`)) return;

        try {
            setLoading(true);
            const res = await bookingService.performCheckout(bookingCode);
            if (res.code === 1000) {
                toast.success("Checkout thành công!");
                fetchBookings(); // Tải lại danh sách sau khi checkout
            }
        } catch (error) {
            console.error("Checkout error:", error);
            toast.error(error.response?.data?.message || "Lỗi thực hiện checkout");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [currentDate, activeTab]);

    const filteredBookings = bookings.filter(b =>
        b.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.bookingCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedBookings = filteredBookings.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="p-6 bg-[#f8fafc] min-h-screen font-sans">
            <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 mb-8">Vận hành Lễ tân</h1>

            <div className="relative w-full mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm tên khách, mã đơn hàng..."
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 hover:text-slate-600 transition-all uppercase tracking-widest"
                    >
                        Xóa
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                <StatCard title="Khách đến" count={activeTab === 'arrival' ? bookings.length : 0} sub="Lịch check-in"
                          type="arrival" active={activeTab === 'arrival'} onClick={() => setActiveTab('arrival')}/>
                <StatCard
                    title="Khách đi"
                    count={activeTab === 'departure' ? bookings.length : 0}
                    sub="Lịch check-out"
                    type="departure"
                    active={activeTab === 'departure'}
                    onClick={() => setActiveTab('departure')}
                />
                {/*<StatCard title="Đang lưu trú" count={0} sub="Phòng bận" type="stay" active={activeTab === 'stay'} onClick={() => setActiveTab('stay')} />*/}
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                <FilterHeader
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    currentDate={currentDate}
                    setCurrentDate={setCurrentDate}
                    today={today}
                />

                {loading ? (
                    <div className="py-32 flex flex-col items-center justify-center gap-4">
                        <div
                            className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Đang tải...</p>
                    </div>
                ) : (
                    <BookingTable
                        bookings={paginatedBookings}
                        activeTab={activeTab}
                        onCheckin={handleCheckin}
                        onCheckout={handleCheckout}
                        onNoShow={openNoShowModal}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalResults={filteredBookings.length}
                    />
                )}
            </div>
            {noShowModal.show && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div
                        className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 border border-slate-100 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-4 text-rose-600 mb-6">
                            <div className="p-3 bg-rose-50 rounded-2xl"><UserX size={28}/></div>
                            <h3 className="text-xl font-black uppercase tracking-tighter">Báo cáo Khách không đến</h3>
                        </div>

                        <div className="space-y-4 mb-8">
                            <p className="text-sm text-slate-500 font-medium">
                                Xác nhận khách <span
                                className="text-slate-900 font-black">{noShowModal.booking?.guestName}</span> không đến
                                nhận phòng?
                            </p>
                            <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100">
                                <p className="text-[10px] text-rose-700 font-black uppercase tracking-widest leading-relaxed">
                                    Hệ thống sẽ giải phóng phòng và áp dụng phí phạt theo chính sách.
                                </p>
                            </div>
                        </div>

                        <label
                            className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Lý
                            do báo cáo</label>
                        <textarea
                            className="w-full p-4 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all mb-8 bg-slate-50/50"
                            rows="3"
                            value={noShowModal.reason}
                            onChange={(e) => setNoShowModal({...noShowModal, reason: e.target.value})}
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => setNoShowModal({show: false, booking: null, reason: ""})}
                                className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
                            >Đóng
                            </button>
                            <button
                                onClick={handleConfirmNoShow}
                                className="flex-1 py-4 bg-rose-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-rose-200 hover:bg-rose-700 active:scale-95 transition-all"
                            >Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FrontDeskDashboard;