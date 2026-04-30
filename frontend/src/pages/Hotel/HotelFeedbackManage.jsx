import React, { useState, useEffect } from 'react';
import {
    Star, MessageCircle, AlertTriangle, Send,
    TrendingUp, TrendingDown, Flag, CheckCircle2,
    Image as ImageIcon, Filter, MessageSquareQuote, Loader2
} from 'lucide-react';
import { bookingService } from '@/services/booking.service.js';

const HotelFeedbackManagement = () => {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [replyText, setReplyText] = useState({});
    const [replyLoading, setReplyLoading] = useState({});

    useEffect(() => {
        fetchData();
    }, [page]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [feedbackRes, statsRes] = await Promise.all([
                bookingService.getHotelFeedback(page, 10),
                bookingService.getHotelFeedbackStats()
            ]);
            const pageData = feedbackRes.result;
            setReviews(pageData.content || []);
            setTotalPages(pageData.totalPages || 0);
            setStats(statsRes.result);
        } catch (err) {
            console.error("Fetch hotel feedback error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Hàm xác định màu sắc dựa trên số điểm
    const getScoreColor = (score) => {
        if (score >= 4.0) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        if (score >= 3.0) return 'text-amber-600 bg-amber-50 border-amber-100';
        return 'text-rose-600 bg-rose-50 border-rose-100';
    };

    // Xử lý gửi phản hồi (UC055.0 - Bước 6, 7)
    const handleSendReply = async (reviewId) => {
        if (!replyText[reviewId]) return;
        setReplyLoading(prev => ({ ...prev, [reviewId]: true }));
        try {
            await bookingService.replyToFeedback(reviewId, replyText[reviewId]);
            setReplyText(prev => ({ ...prev, [reviewId]: '' }));
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || "Gửi phản hồi thất bại!");
        } finally {
            setReplyLoading(prev => ({ ...prev, [reviewId]: false }));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 size={32} className="animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8 bg-[#f8fafc] min-h-screen font-sans">

            {/* 1. Dashboard Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                    <p className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-1">Điểm trung bình</p>
                    <h2 className="text-5xl font-black text-slate-800">{stats?.averageScore?.toFixed(1) || '0.0'}<span className="text-xl text-slate-400">/5.0</span></h2>
                    <p className="text-xs text-slate-600 mt-2">{stats?.totalReviews || 0} đánh giá</p>
                </div>

                <div className="md:col-span-3 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <p className="text-sm font-bold text-slate-700 mb-4">Chi tiết tiêu chí (Breakdown)</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                            { label: 'Vệ sinh', value: stats?.cleanlinessAvg },
                            { label: 'Dịch vụ', value: stats?.serviceAvg },
                            { label: 'Tổng quan', value: stats?.averageScore },
                        ].map((item, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex justify-between text-xs font-bold text-slate-500">
                                    <span>{item.label}</span>
                                    <span>{item.value?.toFixed(1) || '0.0'}</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${((item.value || 0) / 5) * 100}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-4 mt-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                            <CheckCircle2 size={14} className="text-emerald-500" /> Đã phản hồi: {stats?.respondedCount || 0}
                        </span>
                        <span className="flex items-center gap-1">
                            <AlertTriangle size={14} className="text-amber-500" /> Chờ xử lý: {stats?.pendingCount || 0}
                        </span>
                    </div>
                </div>
            </div>

            {/* 2. Review List */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800">Danh sách đánh giá từ Đại lý</h3>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white border rounded-xl text-sm font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all">
                            <Filter size={16} /> Lọc điểm số
                        </button>
                    </div>
                </div>

                {reviews.map((rev) => (
                    <div key={rev.reviewId} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                {/* Agency Info & Rating */}
                                <div className="flex gap-4">
                                    <div className={`w-14 h-14 rounded-2xl border flex flex-col items-center justify-center font-black ${getScoreColor(rev.ratingScore)}`}>
                                        {rev.ratingScore}
                                        <Star size={12} fill="currentColor" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-lg">{rev.agencyName}</h4>
                                        <div className="flex items-center gap-3 text-xs font-bold text-slate-400 mt-1">
                                            <span className="text-blue-600">Mã đơn: {rev.bookingCode}</span>
                                            <span>•</span>
                                            <span>Ngày gửi: {rev.createdAt}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div className="flex items-start gap-2">
                                    {rev.status === 'RESPONDED' ? (
                                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase flex items-center gap-1">
                      <CheckCircle2 size={12} /> Đã phản hồi
                    </span>
                                    ) : (
                                        <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full uppercase">Chờ xử lý</span>
                                    )}
                                    {/* Report Abuse */}
                                    <button title="Báo cáo vi phạm" className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                                        <Flag size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Category Scores */}
                            {(rev.cleanlinessScore || rev.serviceScore) && (
                                <div className="mt-4 flex gap-3 text-xs">
                                    {rev.cleanlinessScore && (
                                        <span className={`px-2 py-1 rounded-lg border font-bold ${getScoreColor(rev.cleanlinessScore)}`}>
                                            Vệ sinh: {rev.cleanlinessScore}/5
                                        </span>
                                    )}
                                    {rev.serviceScore && (
                                        <span className={`px-2 py-1 rounded-lg border font-bold ${getScoreColor(rev.serviceScore)}`}>
                                            Dịch vụ: {rev.serviceScore}/5
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Content */}
                            <div className="mt-6 p-5 bg-slate-50 rounded-2xl border border-slate-100 relative">
                                <MessageSquareQuote className="absolute -top-3 -left-2 text-slate-200" size={32} />
                                <p className="text-slate-700 text-sm leading-relaxed italic relative z-10">"{rev.comment}"</p>
                            </div>

                            {/* Reply Section */}
                            <div className="mt-6">
                                {rev.status === 'RESPONDED' ? (
                                    <div className="ml-8 p-5 bg-blue-50 border-l-4 border-blue-400 rounded-r-2xl">
                                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Phản hồi của khách sạn</p>
                                        <p className="text-sm text-blue-800 font-medium leading-relaxed">{rev.reply}</p>
                                        {rev.replyDate && <p className="text-[10px] text-blue-400 mt-2">{rev.replyDate}</p>}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                    <textarea
                        placeholder="Viết phản hồi của bạn để giải thích hoặc xin lỗi đại lý... (Bước 5)"
                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all"
                        value={replyText[rev.reviewId] || ""}
                        onChange={(e) => setReplyText({...replyText, [rev.reviewId]: e.target.value})}
                    />
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => handleSendReply(rev.reviewId)}
                                                disabled={!replyText[rev.reviewId] || replyLoading[rev.reviewId]}
                                                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all disabled:opacity-50"
                                            >
                                                {replyLoading[rev.reviewId] ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                                Gửi phản hồi
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
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

export default HotelFeedbackManagement;