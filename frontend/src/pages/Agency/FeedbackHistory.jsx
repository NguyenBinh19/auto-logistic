import React, { useState, useEffect } from 'react';
import {
    Star, MessageSquare, Calendar, Hotel,
    ChevronDown, ChevronUp, Filter, ExternalLink,
    Search, MessageCircleReply, Loader2
} from 'lucide-react';
import { bookingService } from '@/services/booking.service.js';

const FeedbackHistory = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchHistory();
    }, [page]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const data = await bookingService.getMyFeedbackHistory(page, 10);
            const pageData = data.result;
            setFeedbacks(pageData.content || []);
            setTotalPages(pageData.totalPages || 0);
        } catch (err) {
            console.error("Fetch feedback history error:", err);
        } finally {
            setLoading(false);
        }
    };

    // State cho Filter và Expand
    const [filterRating, setFilterRating] = useState('all');
    const [expandedId, setExpandedId] = useState(null);

    // Xử lý Filter
    const filteredList = feedbacks.filter(item => {
        if (filterRating === 'all') return true;
        if (filterRating === 'low') return item.ratingScore <= 2;
        return item.ratingScore === parseInt(filterRating);
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 size={32} className="animate-spin text-blue-500" />
            </div>
        );
    }

    // Nếu không có lịch sử
    if (feedbacks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border border-dashed border-slate-300">
                <MessageSquare size={64} className="text-slate-200 mb-4" />
                <p className="text-slate-500 font-medium">Bạn chưa đánh giá chuyến đi nào.</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
            {/* Header & Filter Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Lịch sử đánh giá</h1>
                    <p className="text-sm text-slate-500">Quản lý và xem lại các phản hồi đã gửi cho khách sạn</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select
                            value={filterRating}
                            onChange={(e) => setFilterRating(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                        >
                            <option value="all">Tất cả đánh giá</option>
                            <option value="5">5 Sao (Tuyệt vời)</option>
                            <option value="low">1-2 Sao (Cần cải thiện)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div className="space-y-4">
                {filteredList.map((item) => (
                    <div
                        key={item.reviewId}
                        className={`bg-white rounded-2xl border transition-all duration-300 ${
                            item.reply ? "border-blue-100 ring-1 ring-blue-50/50" : "border-slate-100"
                        }`}
                    >
                        {/* Summary Card */}
                        <div className="p-6 flex flex-col md:flex-row gap-6 cursor-pointer" onClick={() => setExpandedId(expandedId === item.reviewId ? null : item.reviewId)}>
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 group">
                                        <Hotel className="text-slate-400" size={18} />
                                        <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                                            {item.hotelName}
                                            <ExternalLink size={14} className="opacity-0 group-hover:opacity-100" />
                                        </h3>
                                    </div>
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={16} className={i < item.ratingScore ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-4 text-xs text-slate-500 font-medium">
                                    <span className="flex items-center gap-1.5"><Calendar size={14} /> {item.stayDates}</span>
                                    <span className="flex items-center gap-1.5"><Search size={14} /> Gửi ngày: {item.createdAt}</span>
                                    <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[10px] uppercase font-bold">NV: {item.reviewerName}</span>
                                </div>

                                <p className="text-sm text-slate-600 line-clamp-2 italic">"{item.comment}"</p>
                            </div>

                            <div className="flex flex-row md:flex-col justify-between items-end border-l border-slate-50 pl-0 md:pl-6">
                                {item.reply && (
                                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full mb-2">
                                        <MessageCircleReply size={14} /> Đã phản hồi
                                    </span>
                                )}
                                <button className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                                    {expandedId === item.reviewId ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Expanded Content */}
                        {expandedId === item.reviewId && (
                            <div className="px-6 pb-6 pt-2 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-sm font-bold text-slate-400 uppercase text-[10px] mb-2 tracking-widest">Đánh giá của bạn</p>
                                    <p className="text-sm text-slate-700 leading-relaxed">{item.comment}</p>
                                </div>

                                {item.reply ? (
                                    <div className="ml-8 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-xl space-y-2">
                                        <div className="flex justify-between items-center">
                                            <p className="text-xs font-bold text-blue-800">Phản hồi từ Khách sạn</p>
                                            <span className="text-[10px] text-blue-400 font-medium">{item.replyDate}</span>
                                        </div>
                                        <p className="text-sm text-blue-700 leading-relaxed italic">"{item.reply}"</p>
                                    </div>
                                ) : (
                                    <div className="ml-8 p-4 bg-slate-50 border-l-4 border-slate-200 rounded-r-xl">
                                        <p className="text-xs italic text-slate-400">Khách sạn chưa phản hồi đánh giá này.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-4">
                    <button
                        disabled={page === 0}
                        onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 text-sm font-medium bg-white border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition-colors"
                    >
                        Trước
                    </button>
                    <span className="text-sm text-slate-500">
                        Trang {page + 1} / {totalPages}
                    </span>
                    <button
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 text-sm font-medium bg-white border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition-colors"
                    >
                        Sau
                    </button>
                </div>
            )}
        </div>
    );
};

export default FeedbackHistory;