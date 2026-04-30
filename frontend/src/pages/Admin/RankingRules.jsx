import React, { useState, useEffect } from 'react';
import {
    Plus, RefreshCw, Trash2, CheckCircle2,
    BarChart3, Calendar, Clock, ArrowRight, Star, Trophy, Crown, Medal, Gem, Award, Zap,HelpCircle
} from 'lucide-react';
import { rankService } from '@/services/rank.service.js';
import AddRankingModal from '@/components/admin/ranking/AddRankingModal';
import EditRankingDetailModal from '@/components/admin/ranking/EditRankingModal';

const RankingRules = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedRankId, setSelectedRankId] = useState(null);
    const [rankingData, setRankingData] = useState([]);
    const [loading, setLoading] = useState(false);

    const ICON_MAP = {
        star: Star,
        trophy: Trophy,
        crown: Crown,
        medal: Medal,
        gem: Gem,
        award: Award,
        zap: Zap,
    };
    // State lưu cấu hình ngày
    const [periods, setPeriods] = useState({
        RANK_PERIOD_1_START: '--',
        RANK_PERIOD_1_END: '--',
        RANK_PERIOD_2_START: '--',
        RANK_PERIOD_2_END: '--'
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [ranksRes, periodsRes] = await Promise.all([
                rankService.getAllRanks(),
                rankService.getAllRankCycles()
            ]);

            // 1. Xử lý danh sách Rank (Chỉ lấy isActive: true)
            const rawRanks = ranksRes.result || ranksRes || [];
            const activeRanks = rawRanks
                .filter(rank => rank.isActive === true) // Lọc bỏ các hạng đã xóa mềm
                .sort((a, b) => {
                    if (a.period !== b.period) return a.period - b.period; // Xếp theo Kỳ trước
                    return b.priority - a.priority; // Sau đó xếp theo ưu tiên giảm dần
                });
            setRankingData(activeRanks);

            // 2. Xử lý Chu kỳ hiển thị
            const periodList = periodsRes?.result?.periods || periodsRes?.periods;
            if (periodList) {
                const pMap = {};
                periodList.forEach(p => { pMap[p.type] = p.value; });
                setPeriods(prev => ({ ...prev, ...pMap }));
            }
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSoftDelete = async (rankId, name) => {
        if (!window.confirm(`Xác nhận xóa hạng "${name.toUpperCase()}"? (Hạng sẽ ngừng hoạt động)`)) return;
        try {
            await rankService.deleteRank(rankId);
            fetchData();
        } catch (error) {
            alert("Có lỗi xảy ra khi thực hiện xóa.");
        }
    };
    const RankIcon = ({ iconName, size = 24, className = "" }) => {
        const IconComponent = ICON_MAP[iconName] || HelpCircle; // Nếu không tìm thấy thì hiện dấu hỏi
        return <IconComponent size={size} className={className} />;
    };

    return (
        <div className="p-4 md:p-8 lg:p-10 bg-[#f4f7fe] min-h-screen font-sans text-slate-700">
            <div className="max-w-[1600px] mx-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
                            QUẢN LÝ XẾP HẠNG
                        </h1>
                        <p className="text-slate-770 text-sm tracking-wide">Quản lý các cấp bậc thành viên và thiết lập điều kiện thăng hạng</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={fetchData} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 group">
                            <RefreshCw size={20} className={`${loading ? "animate-spin text-blue-600" : "text-slate-400 group-hover:rotate-180 transition-transform duration-500"}`} />
                        </button>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-black shadow-xl transition-all active:scale-95"
                        >
                            <Plus size={20} /> Tạo hạng mới
                        </button>
                    </div>
                </div>

                {/* SECTION 1: THÔNG TIN CHU KỲ (Read-only) */}
                <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm mb-12">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                            <Clock size={20} />
                        </div>
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Lịch trình xét hạng hệ thống</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Kỳ 1 */}
                        <div className="p-6 rounded-[32px] border border-slate-100 bg-slate-50/50">
                            <div className="flex items-center gap-2 mb-6">
                                <Calendar size={16} className="text-blue-600" />
                                <span className="text-xs font-black text-blue-900 uppercase tracking-tighter">Kỳ xét hạng 01 (H1)</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
                                    <span className="text-[9px] font-bold text-slate-600 uppercase block mb-1">Bắt đầu</span>
                                    <span className="font-mono font-bold text-slate-700">{periods.RANK_PERIOD_1_START}</span>
                                </div>
                                <ArrowRight className="text-slate-300" size={20} />
                                <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
                                    <span className="text-[9px] font-bold text-slate-600 uppercase block mb-1">Kết thúc</span>
                                    <span className="font-mono font-bold text-slate-700">{periods.RANK_PERIOD_1_END}</span>
                                </div>
                            </div>
                        </div>

                        {/* Kỳ 2 */}
                        <div className="p-6 rounded-[32px] border border-slate-100 bg-slate-50/50">
                            <div className="flex items-center gap-2 mb-6">
                                <Calendar size={16} className="text-emerald-600" />
                                <span className="text-xs font-black text-emerald-900 uppercase tracking-tighter">Kỳ xét hạng 02 (H2)</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
                                    <span className="text-[9px] font-bold text-slate-600 uppercase block mb-1">Bắt đầu</span>
                                    <span className="font-mono font-bold text-slate-700">{periods.RANK_PERIOD_2_START}</span>
                                </div>
                                <ArrowRight className="text-slate-300" size={20} />
                                <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
                                    <span className="text-[9px] font-bold text-slate-600 uppercase block mb-1">Kết thúc</span>
                                    <span className="font-mono font-bold text-slate-700">{periods.RANK_PERIOD_2_END}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 2: DANH SÁCH HẠNG (Chỉ hiện isActive: true) */}
                <div className="mb-8 flex items-center justify-between px-4">
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                        Danh sách hạng đang áp dụng ({rankingData.length})
                    </h2>
                </div>

                {rankingData.length === 0 ? (
                    <div className="bg-white rounded-[40px] p-32 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                        <Trophy size={48} className="mb-4 opacity-10" />
                        <p className="font-bold text-xs uppercase tracking-[0.2em]">Dữ liệu trống hoặc đã bị xóa hết</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {rankingData.map((rank) => (
                            <div key={rank.id} className="group bg-white rounded-[35px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
                                <div className="p-8 pb-4">
                                    <div className="flex justify-between items-start mb-6">
                                        <div
                                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg relative overflow-visible"
                                            style={{backgroundColor: rank.color || '#6366f1'}}
                                        >
                                            <RankIcon iconName={rank.icon} size={28}/>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-[9px] font-black text-slate-400 uppercase">Ưu tiên</span>
                                            <span className="text-xl font-black text-slate-800">{rank.priority}</span>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight">{rank.rankName}</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-md">
                                            <CheckCircle2 size={10}/> Hoạt động
                                        </div>
                                    </div>
                                </div>

                                <div className="px-8 mt-4 space-y-4 flex-grow">
                                    <div className="bg-slate-50 rounded-[24px] p-5 border border-slate-100 group-hover:bg-white group-hover:border-blue-100 transition-colors">
                                        <span className="text-[10px] font-black text-slate-600 uppercase block mb-3 tracking-widest">Doanh thu tối thiểu</span>
                                        <div className="flex items-center gap-3">
                                            <BarChart3 size={18} className="text-blue-500"/>
                                            <span className="text-base font-black text-slate-800">{(rank.upgradeMinTotalRevenue || 0).toLocaleString()} đ</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 flex gap-3">
                                    <button
                                        onClick={() => { setSelectedRankId(rank.id); setIsEditModalOpen(true); }}
                                        className="flex-[3] py-4 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-900 hover:text-white transition-all text-[10px] uppercase tracking-widest"
                                    >
                                        Chi tiết
                                    </button>
                                    <button
                                        onClick={() => handleSoftDelete(rank.id, rank.rankName)}
                                        className="flex-1 flex items-center justify-center py-4 text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white rounded-2xl transition-all"
                                    >
                                        <Trash2 size={18}/>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <AddRankingModal isOpen={isAddModalOpen}
                             onClose={() => setIsAddModalOpen(false)}
                             onSuccess={fetchData} />
            <EditRankingDetailModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} rankId={selectedRankId} onSuccess={fetchData} />
        </div>
    );
};

export default RankingRules;