import React, { useState, useEffect } from 'react';
import {
    BarChart3, Download, Calendar, Filter,
    RefreshCcw, ArrowRight, Home, AlertCircle
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';
import KPICard from '@/components/hotel/report/KPICard';
import { revenueService } from '@/services/revenue.service';
import { financialService } from '@/services/financial.service';
import { toast } from 'react-hot-toast';

const RevenueReport = () => {
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [decisionAlerts, setDecisionAlerts] = useState([]);
    const [strategicHacks, setStrategicHacks] = useState([]);
    const [startDate, setStartDate] = useState("2026-03-01");
    const [endDate, setEndDate] = useState("2026-03-31");
    const [granularity, setGranularity] = useState("DAILY"); // DAILY | WEEKLY | MONTHLY
    const [dateError, setDateError] = useState("");
    const MAX_DAILY_RANGE_DAYS = 365;
    const getHotelId = () => {
        const user = JSON.parse(localStorage.getItem("user"));
        return user?.hotelId;
    };
    const validateRevenueRequest = (start, end, granularity = "DAILY") => {
        if (!start || !end) {
            return "Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc";
        }

        const s = new Date(start);
        const e = new Date(end);

        if (s > e) {
            return "Ngày bắt đầu không thể lớn hơn ngày kết thúc";
        }

        const diffTime = Math.abs(e - s);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (granularity === "DAILY" && diffDays > MAX_DAILY_RANGE_DAYS) {
            return `Với chế độ xem theo NGÀY, khoảng cách không được quá ${MAX_DAILY_RANGE_DAYS} ngày`;
        }

        return null;
    };

    // Hàm phân tích dữ liệu từ summary
    const analyzePerformance = (summary) => {
        const hacks = [];
        if (!summary) return;
        // 1. Phân tích Công suất (Occupancy)
        if (summary.occupancyRate < 40) {
            hacks.push({
                title: "Cải thiện lấp đầy",
                desc: `Công suất đạt ${summary.occupancyRate}%, thấp hơn kỳ vọng. Hãy cân nhắc chạy Flash Sale vào các ngày giữa tuần.`,
                type: "warning"
            });
        } else if (summary.occupancyRate > 85) {
            hacks.push({
                title: "Tối ưu giá bán",
                desc: "Công suất đang rất cao. Bạn có thể tăng giá ADR thêm 5-10% để tối ưu lợi nhuận cho các đêm còn lại.",
                type: "success"
            });
        }
        // 2. Phân tích ADR & RevPAR
        if (summary.revenueGrowthPercent < 0) {
            hacks.push({
                title: "Cảnh báo tăng trưởng",
                desc: `Doanh thu giảm ${Math.abs(summary.revenueGrowthPercent)}% so với kỳ trước. Cần kiểm tra lại chính sách giá cạnh tranh.`,
                type: "danger"
            });
        }
        // 3. Gợi ý dựa trên RevPAR (Hiệu suất tổng thể)
        if (summary.revPar < (summary.adr * 0.5)) {
            hacks.push({
                title: "Hiệu suất phòng thấp",
                desc: "Chỉ số RevPAR chưa đạt mức tối ưu so với giá bán trung bình. Cần đẩy mạnh Marketing trên các kênh.",
                type: "info"
            });
        }

        setStrategicHacks(hacks);
    };

    const fetchRevenue = async () => {
        const error = validateRevenueRequest(startDate, endDate, granularity);
        if (error) {
            setDateError(error);
            return; // Dừng lại không gọi API
        }
        setLoading(true);
        setDateError(""); // Xóa lỗi cũ nếu có
        try {
            const params = {
                startDate,
                endDate,
                granularity,
            };
            const res = await revenueService.getRevenueReport(params);

            if (res.code === 1000) {
                setReportData(res.result);
                analyzePerformance(res.result.summary);
            }
        } catch (error) {
            console.error("Lỗi tải báo cáo:", error);
            toast.error("Không thể kết nối máy chủ để tải báo cáo doanh thu");
        } finally {
            setLoading(false);
        }
    };

    // --- LOGIC XỬ LÝ DOWNLOAD FILE  ---
    const handleDownloadReport = async (format = 'EXCEL', reportType = 'REVENUE') => {
        const hotelId = getHotelId(); // Lấy ID ở đây
        if (!hotelId) {
            toast.error("Không tìm thấy thông tin khách sạn");
            return;
        }
        try {
            toast.loading(`Đang tải file ${format}...`, { id: 'export-status' });

            const exportRequest = {
                reportType,
                format,
                startDate,
                endDate,
                hotelId,
                statuses: []
            };

            // 1. Nhận về ArrayBuffer (Dữ liệu máy nguyên bản)
            const buffer = await financialService.exportFinancialReport(exportRequest);

            // 2. Kiểm tra nếu Backend vô tình trả về JSON lỗi thay vì file
            // (Nếu buffer quá nhỏ, có thể đó là JSON báo lỗi)
            const decoder = new TextDecoder('utf-8');
            try {
                const possibleJson = JSON.parse(decoder.decode(new Uint8Array(buffer).slice(0, 500)));
                if (possibleJson.result) {
                    // Nếu BE vẫn bọc trong {result: {data: [...]}}
                    // thì ta lấy mảng data đó chuyển thành Uint8Array
                    const actualData = new Uint8Array(possibleJson.result.data);
                    downloadFile(actualData, format, possibleJson.result.fileName);
                    return;
                }
            } catch (e) {
                // Không phải JSON, tiến hành xử lý như file thô
            }
            // 3. Xử lý tải file thô
            const contentType = format === 'PDF'
                ? 'application/pdf'
                : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

            const blob = new Blob([buffer], { type: contentType });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Bao_cao_${format}_${startDate}.${format === 'PDF' ? 'pdf' : 'xlsx'}`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success(`Tải file thành công`, { id: 'export-status' });
        } catch (error) {
            console.error("Lỗi:", error);
            toast.error("Lỗi định dạng file từ Server", { id: 'export-status' });
        }
    };

    const handleGranularityChange = (mode) => {
        setGranularity(mode);
        const error = validateRevenueRequest(startDate, endDate, mode);
        if (error) setDateError(error);
        else setDateError("");
    };

    useEffect(() => {
        const error = validateRevenueRequest(startDate, endDate, granularity);
        if (!error) {
            fetchRevenue();
        } else {
            setDateError(error);
        }
    }, [startDate, endDate, granularity]);

    const summary = reportData?.summary || {};
    const trendData = reportData?.trend || [];
    const roomTypeStats = reportData?.byRoomType || [];

    return (
        <div className="p-8 bg-[#f8fafc] min-h-screen font-sans">

            {/* PHẦN TIÊU ĐỀ (HEADER) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
                        Báo cáo doanh thu
                    </h1>
                    <p className="text-slate-500 font-medium mt-1 italic text-sm">
                        Hệ thống quản lý khách sạn
                    </p>
                </div>
                <div className="flex gap-3">
                    {/* NÚT DOWNLOAD ĐÃ ĐƯỢC TÍCH HỢP */}
                    <button
                        onClick={() => handleDownloadReport('EXCEL')}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-xs hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                    >
                        <Download size={16} /> XUẤT EXCEL
                    </button>
                    <button
                        onClick={() => handleDownloadReport('PDF')}
                        className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-2xl font-bold text-xs hover:bg-red-700 transition-all shadow-lg active:scale-95"
                    >
                        <Download size={16} /> XUẤT PDF
                    </button>
                </div>
            </div>

            {/* BỘ LỌC (FILTERS) */}
            <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-wrap items-center gap-6 mb-8">
                {/* Chọn khoảng ngày */}
                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                    <Calendar size={16} className={dateError ? 'text-red-500' : 'text-blue-600'} />
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-transparent text-xs font-bold outline-none"
                    />
                    <ArrowRight size={14} className="text-slate-300" />
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-transparent text-xs font-bold outline-none"
                    />
                </div>

                {/* Chọn độ chia biểu đồ (Ngày/Tuần/Tháng) */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    {['DAILY', 'WEEKLY', 'MONTHLY'].map((mode) => (
                        <button
                            key={mode}
                            onClick={() => handleGranularityChange(mode)}
                            className={`px-6 py-2 rounded-lg text-[10px] font-black transition-all ${granularity === mode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {mode === 'DAILY' ? 'NGÀY' : mode === 'WEEKLY' ? 'TUẦN' : 'THÁNG'}
                        </button>
                    ))}
                </div>
            </div>
            {/* Message báo lỗi đồng bộ với ErrorCode của BE */}
            {dateError && (
                <div className="flex items-center gap-2 text-red-500 text-[11px] font-bold px-4 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle size={14} />
                    <span className="uppercase tracking-tight">{dateError}</span>
                </div>
            )}

            {/* THẺ CHỈ SỐ KPI  */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KPICard title="Doanh thu tháng" value={summary.totalRevenue || 0} unit="VNĐ" trend={summary.revenueGrowthPercent || 0} isUp={(summary.revenueGrowthPercent || 0) >= 0} />
                <KPICard title="Công suất phòng theo tháng" value={summary.occupancyRate || 0} unit="%" trend={summary.occupancyGrowthPercent || 0} isUp={(summary.occupancyGrowthPercent || 0) >= 0} />
                <KPICard title="ADR (Giá TB tháng)" value={summary.adr || 0} unit="VNĐ" trend={summary.adrGrowthPercent || 0} isUp={(summary.adrGrowthPercent || 0) >= 0} />
                <KPICard title="RevPAR tháng" value={summary.revPar || 0} unit="VNĐ" trend={summary.revParGrowthPercent || 0} isUp={(summary.revParGrowthPercent || 0) >= 0} />
            </div>
            {/* SECTION  */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Tổng đơn trong tháng</p>
                        <h4 className="text-xl font-black text-slate-800">{summary.totalBookings} <span className="text-sm font-medium text-slate-700">Đơn</span></h4>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                        <Calendar size={20} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Tỷ lệ hủy đơn trong tháng</p>
                        <h4 className="text-xl font-black text-rose-600">
                            {summary.totalBookings > 0
                                ? ((summary.cancelledBookings / summary.totalBookings) * 100).toFixed(1)
                                : 0}%
                        </h4>
                    </div>
                    <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
                        <AlertCircle size={20} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Đêm phòng đã bán (Tháng)</p>
                        <h4 className="text-xl font-black text-emerald-600">{summary.totalRoomNightsSold} / {summary.totalRoomNightsAvailable}</h4>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                        <Home size={20} />
                    </div>
                </div>
            </div>
            {/* PHẦN GỢI Ý CHIẾN LƯỢC */}
            {!loading && granularity === 'MONTHLY' && strategicHacks.length > 0 && (
                <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="flex flex-wrap gap-6">
                        {strategicHacks.map((hack, index) => (
                            <div
                                key={index}
                                className={`bg-white border border-slate-100 p-6 rounded-[2.5rem] shadow-sm flex items-start gap-4 transition-all hover:shadow-md hover:border-blue-100
                        ${strategicHacks.length === 1
                                    ? 'w-full md:w-[450px]' 
                                    : 'flex-1 min-w-[300px] max-w-[calc(33.333%-1rem)]' 
                                }
                    `}
                            >
                                <div className={`p-3.5 rounded-2xl shrink-0 shadow-inner ${
                                    hack.type === 'warning' ? 'bg-amber-50 text-amber-600' :
                                        hack.type === 'danger' ? 'bg-rose-50 text-rose-600' :
                                            hack.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                                }`}>
                                    <BarChart3 size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Gợi ý chiến lược</h4>
                                    </div>
                                    <h5 className="text-sm font-extrabold text-slate-800 leading-tight mb-2 truncate">
                                        {hack.title}
                                    </h5>
                                    <p className="text-[12px] font-medium text-slate-500 leading-relaxed italic">
                                        {hack.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* BIỂU ĐỒ XU HƯỚNG  */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl relative min-h-[500px]">
                    {loading && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-[3rem]">
                            <RefreshCcw className="animate-spin text-blue-600" size={32} />
                        </div>
                    )}

                    <h3 className="text-lg font-black text-slate-800 mb-10 uppercase flex items-center gap-2">
                        <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                        Biến động doanh thu & Công suất
                    </h3>

                    <div className="h-[380px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    {/* Hiệu ứng đổ màu chuyển sắc cho vùng dưới đường biểu đồ */}
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />

                                {/* YAxis bên trái cho Doanh thu (Triệu VNĐ) */}
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`} />

                                {/* YAxis bên phải cho Công suất (%) */}
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#10b981', fontSize: 10}} unit="%" />

                                <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />

                                {/* Đường Doanh thu (Area) */}
                                <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fill="url(#colorRev)" />

                                {/* Đường Công suất (Dạng nét đứt) */}
                                <Area yAxisId="right" type="monotone" dataKey="occupancyRate" stroke="#10b981" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* THỐNG KÊ THEO LOẠI PHÒNG  */}
                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl">
                    <h3 className="text-lg font-black text-slate-800 mb-8 uppercase flex items-center gap-2">
                        <Home size={20} className="text-blue-600" /> Phân tích loại phòng
                    </h3>
                    <div className="space-y-6 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                        {roomTypeStats.length > 0 ? roomTypeStats.map((item, idx) => (
                            <div key={idx} className="p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[11px] font-black text-slate-550 uppercase leading-tight w-2/3">
                                        {item.roomTypeName}
                                    </span>
                                    <span className="text-sm font-black text-blue-600">{item.contribution}%</span>
                                </div>
                                {/* Thanh tiến trình thể hiện % đóng góp doanh thu */}
                                <div className="w-full bg-white h-1.5 rounded-full overflow-hidden mb-3">
                                    <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${item.contribution}%` }}></div>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-slate-400">{item.roomNightsSold} đêm đã bán</span>
                                    <span className="text-slate-700">{new Intl.NumberFormat('vi-VN').format(item.revenue)} VNĐ</span>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10 text-slate-400 font-medium italic">
                                Chưa có dữ liệu doanh thu cho từng loại phòng
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default RevenueReport;