import React, { useState, useEffect } from 'react';
import { Calendar, ArrowRight, Save, Loader2, RefreshCw, Info } from 'lucide-react';
import { rankService } from '@/services/rank.service.js';

const RenderInputBox = ({
                            label,
                            type,
                            color,
                            value,
                            onChange,
                            onUpdate,
                            isLoading,
                            isGlobalLoading
                        }) => (
    <div className="flex-1 min-w-0 p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-blue-200 transition-all group">
        <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2 block ml-1 group-hover:text-blue-500 transition-colors">
            {label}
        </label>
        <div className="flex gap-2">
            <input
                value={value || ''}
                onChange={(e) => onChange(type, e.target.value)}
                className="w-full min-w-0 p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-700 outline-none focus:ring-2 ring-blue-500/10 text-center text-base"
                placeholder="MM-DD"
            />
            <button
                onClick={() => onUpdate(type)}
                disabled={isLoading || isGlobalLoading}
                className={`flex-shrink-0 p-2.5 rounded-xl text-white shadow-md active:scale-95 transition-all disabled:opacity-50 ${color}`}
            >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            </button>
        </div>
    </div>
);

const RankCycleTab = () => {
    const [loadingFetch, setLoadingFetch] = useState(false);
    const [loadingMap, setLoadingMap] = useState({});
    const [configs, setConfigs] = useState({
        RANK_PERIOD_1_START: '',
        RANK_PERIOD_1_END: '',
        RANK_PERIOD_2_START: '',
        RANK_PERIOD_2_END: ''
    });

    const fetchConfigs = async () => {
        setLoadingFetch(true);
        try {
            const res = await rankService.getAllRankCycles();
            const periodList = res?.result?.periods || [];
            const newConfigs = { ...configs };
            periodList.forEach(item => {
                if (newConfigs.hasOwnProperty(item.type)) {
                    newConfigs[item.type] = item.value;
                }
            });
            setConfigs(newConfigs);
        } catch (error) {
            console.error("Lỗi khi tải cấu hình:", error);
        } finally {
            setLoadingFetch(false);
        }
    };

    useEffect(() => {
        fetchConfigs();
    }, []);

    const handleChange = (type, val) => {
        // 1. Chỉ giữ lại số (loại bỏ mọi ký tự khác kể cả dấu - cũ)
        let numbersOnly = val.replace(/[^0-9]/g, '');
        // 2. Giới hạn tối đa 4 chữ số (Tháng: 2, Ngày: 2)
        numbersOnly = numbersOnly.slice(0, 4);
        let formatted = '';
        // 3. Logic chèn dấu gạch ngang thông minh
        if (numbersOnly.length > 2) {
            // Nếu có hơn 2 số, format thành XX-XX
            formatted = `${numbersOnly.slice(0, 2)}-${numbersOnly.slice(2)}`;
        } else {
            // Nếu có 2 số trở xuống, để nguyên số (cho phép xóa tự do)
            formatted = numbersOnly;
        }
        // 4. Cập nhật state
        setConfigs(prev => ({ ...prev, [type]: formatted }));
    };

    const handleUpdateSingle = async (type) => {
        const value = configs[type];
        if (!/^\d{2}-\d{2}$/.test(value)) {
            alert("Vui lòng nhập đúng định dạng Tháng-Ngày (VD: 06-30)");
            return;
        }

        const [month, day] = value.split('-').map(Number);
        if (month < 1 || month > 12) return alert("Tháng không hợp lệ (01-12)");
        const daysInMonth = new Date(2024, month, 0).getDate();
        if (day < 1 || day > daysInMonth) return alert(`Tháng ${month} không có ngày ${day}!`);

        setLoadingMap(prev => ({ ...prev, [type]: true }));
        try {
            await rankService.updateRankCycle({ type, value });
            alert(`Cập nhật thành công!`);
        } catch (error) {
            alert("Lỗi khi lưu cấu hình.");
        } finally {
            setLoadingMap(prev => ({ ...prev, [type]: false }));
        }
    };

    if (loadingFetch) return (
        <div className="p-20 text-center flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-blue-500" size={40} />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang tải dữ liệu...</span>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 p-2">

            {/* Header */}
            <div className="bg-slate-900 rounded-2xl p-5 text-white flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
                        <Calendar size={22} />
                    </div>
                    <div>
                        <h2 className="text-base font-bold tracking-tight uppercase">Cấu Hình Chu Kỳ Xét Hạng</h2>
                    </div>
                </div>
                <button onClick={fetchConfigs} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400">
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Note hướng dẫn */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
                <Info className="text-blue-500 shrink-0" size={20} />
                <div className="text-sm text-blue-800">
                    <p className="font-bold mb-1">Hướng dẫn cập nhật:</p>
                    <ul className="list-disc ml-4 space-y-1 text-xs opacity-90">
                        <li>Nhập theo định dạng <b>Tháng-Ngày</b> (Ví dụ: Tháng 6 ngày 30 nhập <b>06-30</b>).</li>
                        <li>Hệ thống sẽ tự động kiểm tra tính hợp lệ của ngày (Ví dụ: Tháng 02 không thể nhập ngày 30).</li>
                        <li><b>Lưu ý:</b> Nhấn nút Lưu <Save size={12} className="inline"/> cho từng ô để cập nhật riêng biệt vào hệ thống.</li>
                    </ul>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Kỳ 1 */}
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/60 shadow-inner">
                    <div className="flex items-center gap-2 mb-5 px-1 font-black text-slate-800 uppercase tracking-wider text-[11px]">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        Giai đoạn 01 (H1)
                    </div>
                    <div className="flex items-center gap-3">
                        <RenderInputBox
                            label="Bắt đầu"
                            type="RANK_PERIOD_1_START"
                            color="bg-blue-600 hover:bg-blue-700"
                            value={configs.RANK_PERIOD_1_START}
                            onChange={handleChange}
                            onUpdate={handleUpdateSingle}
                            isLoading={loadingMap.RANK_PERIOD_1_START}
                            isGlobalLoading={loadingFetch}
                        />
                        <ArrowRight className="text-slate-300 mt-5 shrink-0" size={18} />
                        <RenderInputBox
                            label="Kết thúc"
                            type="RANK_PERIOD_1_END"
                            color="bg-blue-600 hover:bg-blue-700"
                            value={configs.RANK_PERIOD_1_END}
                            onChange={handleChange}
                            onUpdate={handleUpdateSingle}
                            isLoading={loadingMap.RANK_PERIOD_1_END}
                            isGlobalLoading={loadingFetch}
                        />
                    </div>
                </div>

                {/* Kỳ 2 */}
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/60 shadow-inner">
                    <div className="flex items-center gap-2 mb-5 px-1 font-black text-slate-800 uppercase tracking-wider text-[11px]">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        Giai đoạn 02 (H2)
                    </div>
                    <div className="flex items-center gap-3">
                        <RenderInputBox
                            label="Bắt đầu"
                            type="RANK_PERIOD_2_START"
                            color="bg-emerald-600 hover:bg-emerald-700"
                            value={configs.RANK_PERIOD_2_START}
                            onChange={handleChange}
                            onUpdate={handleUpdateSingle}
                            isLoading={loadingMap.RANK_PERIOD_2_START}
                            isGlobalLoading={loadingFetch}
                        />
                        <ArrowRight className="text-slate-300 mt-5 shrink-0" size={18} />
                        <RenderInputBox
                            label="Kết thúc"
                            type="RANK_PERIOD_2_END"
                            color="bg-emerald-600 hover:bg-emerald-700"
                            value={configs.RANK_PERIOD_2_END}
                            onChange={handleChange}
                            onUpdate={handleUpdateSingle}
                            isLoading={loadingMap.RANK_PERIOD_2_END}
                            isGlobalLoading={loadingFetch}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RankCycleTab;