import React, { useState, useEffect } from 'react';
import { X, Save, TrendingUp, ShieldCheck, Wallet, Loader2, Info, Star, Trophy, Crown, Medal, Gem, Award, Zap, AlertCircle, Users, UserCheck, Clock } from 'lucide-react';
import { rankService } from '@/services/rank.service.js';

const EditRankingDetailModal = ({ isOpen, onClose, rankId, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [formData, setFormData] = useState(null);

    const iconOptions = [
        { id: 'star', component: Star },
        { id: 'trophy', component: Trophy },
        { id: 'crown', component: Crown },
        { id: 'medal', component: Medal },
        { id: 'gem', component: Gem },
        { id: 'award', component: Award },
        { id: 'zap', component: Zap },
    ];

    useEffect(() => {
        if (rankId && isOpen) loadDetail();
    }, [rankId, isOpen]);

    const loadDetail = async () => {
        setFetching(true);
        try {
            const res = await rankService.getRankDetail(rankId);
            setFormData(res.result);
        } catch (error) {
            alert("Không thể tải thông tin chi tiết!");
            onClose();
        } finally { setFetching(false); }
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        // 1. Xử lý rankCode (Chữ hoa, không dấu, không ký tự đặc biệt)
        if (name === 'rankCode') {
            const cleanValue = value.toUpperCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/[^A-Z0-9_]/g, "");
            setFormData(prev => ({ ...prev, [name]: cleanValue }));
            return;
        }

        // 2. Xử lý NUMBER (Cho phép xóa trắng để nhập số mới)
        if (type === 'number') {
            // 1. Cho phép xóa trắng
            if (value === '') {
                setFormData(prev => ({ ...prev, [name]: '' }));
                return;
            }

            // 2. Chặn mọi chuỗi chứa dấu trừ (ngăn -0, -1, v.v.)
            if (value.includes('-')) return;
            // 3. Chuyển đổi và kiểm tra số hợp lệ
            const numValue = parseFloat(value);
            // Kiểm tra NaN (phòng trường hợp người dùng nhập ký tự lạ e, E)
            if (isNaN(numValue)) return;
            // Đảm bảo lưu số dương (parseFloat của "0" là 0, của "0.5" là 0.5)
            setFormData(prev => ({ ...prev, [name]: numValue }));
            return;
        }

        // 3. Xử lý Color text
        if (name === 'colorText') {
            let colorVal = value.startsWith('#') ? value : `#${value}`;
            setFormData(prev => ({ ...prev, color: colorVal.toUpperCase() }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!formData.rankCode.trim()) { alert("Mã hạng (English) không được để trống!"); return false; }
        if (!formData.rankName.trim()) { alert("Tên hạng không được để trống!"); return false; }
        if (formData.priority < 1) { alert("Độ ưu tiên tối thiểu là 1!"); return false; }
        if (formData.upgradeMinTotalRevenue === '' || formData.upgradeMinTotalRevenue < 0) {
            alert("Doanh thu nâng hạng không hợp lệ!"); return false;
        }
        if (formData.maintainMinRevenue === '' || formData.maintainMinRevenue < 0) {
            alert("Doanh thu duy trì không hợp lệ!"); return false;
        }
        if (formData.creditLimit === '' || formData.creditLimit < 0) {
            alert("Hạn mức thấu chi không hợp lệ!"); return false;
        }
        return true;
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        try {
            const updatePayload = {
                rankName: formData.rankName,
                description: formData.description,
                icon: formData.icon,
                color: formData.color,
                priority: formData.priority,
                upgradeMinTotalRevenue: formData.upgradeMinTotalRevenue,
                maintainMinRevenue: formData.maintainMinRevenue,
            };

            await rankService.updateRank(rankId, updatePayload);
            alert("Cập nhật hạng thành công!");
            onSuccess();
            onClose();
        } catch (error) {
            alert("Lỗi: " + (error.response?.data?.message || "Không thể cập nhật"));
        } finally { setLoading(false); }
    };

    if (!isOpen || !formData) return null;

    const SelectedIconTag = iconOptions.find(i => i.id === formData.icon)?.component || Star;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <form onSubmit={handleUpdate} className="bg-white w-full max-w-4xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl text-white shadow-lg transition-all duration-500" style={{ backgroundColor: formData.color }}>
                            <SelectedIconTag size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-black text-slate-800 uppercase">Chỉnh sửa hạng</h3>
                                <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-[10px] font-bold tracking-widest">{formData.rankCode}</span>
                            </div>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
                </div>

                <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
                    {fetching ? (
                        <div className="py-20 flex flex-col items-center gap-4 text-slate-400">
                            <Loader2 className="animate-spin" size={40}/>
                            <p>Đang đồng bộ dữ liệu...</p>
                        </div>
                    ) : (
                        <>
                            {/* 1. Thông tin cơ bản */}
                            <section className="space-y-4">
                                <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2"><Info size={14} /> 1. Thông tin cơ bản</h4>
                                <div className="grid grid-cols-12 gap-6">
                                    <div className="col-span-8 space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">Tên
                                                hạng hiển thị</label>
                                            <input required name="rankName" value={formData.rankName}
                                                   onChange={handleChange}
                                                   className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 outline-none focus:ring-2 ring-blue-500/10"/>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">Mô tả
                                                chi tiết</label>
                                            <textarea name="description" value={formData.description}
                                                      onChange={handleChange}
                                                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl h-24 outline-none text-sm"/>
                                        </div>
                                    </div>
                                    <div className="col-span-4 space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">Màu &
                                                Độ ưu tiên</label>
                                            <div
                                                className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <input name="color" type="color" value={formData.color}
                                                           onChange={handleChange}
                                                           className="w-10 h-10 rounded-lg cursor-pointer border-2 border-white shadow-sm"/>
                                                    <input name="colorText" type="text" value={formData.color}
                                                           onChange={handleChange}
                                                           className="flex-1 bg-white border border-slate-200 rounded-xl px-2 py-2 text-xs font-mono font-bold text-center uppercase"/>
                                                </div>
                                                <div className="relative">
                                                    <input name="priority" type="number" value={formData.priority}
                                                           onChange={handleChange}
                                                           className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold outline-none pr-12"/>
                                                    <span
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 uppercase">Ưu tiên</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Icon Picker */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">Thay đổi biểu
                                        tượng</label>
                                    <div
                                        className="flex flex-wrap gap-3 p-4 bg-slate-50 border border-slate-200 rounded-[24px]">
                                        {iconOptions.map((item) => {
                                            const IconComp = item.component;
                                            const isSelected = formData.icon === item.id;
                                            return (
                                                <button key={item.id} type="button" onClick={() => setFormData(p => ({...p, icon: item.id}))}
                                                        className={`p-4 rounded-2xl transition-all duration-300 ${isSelected ? 'bg-slate-900 text-white shadow-xl scale-110' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-100'}`}>
                                                    <IconComp size={24}/>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </section>

                            {/* 2. Chỉ số tài chính */}
                            <section className="space-y-4">
                                <h4 className="text-[11px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">2. Chỉ số thăng hạng & duy trì</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 bg-emerald-50/50 rounded-[28px] border border-emerald-100 space-y-3">
                                        <label className="text-[10px] font-black text-emerald-700 uppercase flex items-center gap-2"><Star size={12}/> Doanh thu nâng hạng</label>
                                        <div className="relative">
                                            <input name="upgradeMinTotalRevenue" type="number" value={formData.upgradeMinTotalRevenue} onChange={handleChange}
                                                   className="w-full p-4 bg-white border border-emerald-200 rounded-2xl font-black text-slate-700 text-lg outline-none pr-14 focus:ring-4 ring-emerald-500/10" />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-emerald-600">₫</span>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-rose-50/50 rounded-[28px] border border-rose-100 space-y-3">
                                        <label className="text-[10px] font-black text-rose-700 uppercase flex items-center gap-2"><ShieldCheck size={12}/> Doanh thu duy trì</label>
                                        <div className="relative">
                                            <input name="maintainMinRevenue" type="number" value={formData.maintainMinRevenue} onChange={handleChange}
                                                   className="w-full p-4 bg-white border border-rose-200 rounded-2xl font-black text-slate-700 text-lg outline-none pr-14 focus:ring-4 ring-rose-500/10" />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-rose-600">₫</span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 3. Thấu chi (Read Only) */}
                            <section className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[11px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2"> 3. Đặc quyền thấu chi</h4>
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-100">
                                        <AlertCircle size={12} />
                                        <span className="text-[10px] font-bold">Trường này không được phép sửa</span>
                                    </div>
                                </div>
                                <div className="p-6 bg-slate-900 rounded-[32px] text-white flex flex-col md:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white/10 rounded-2xl text-amber-400"><Wallet size={24}/></div>
                                        <div>
                                            <h4 className="font-bold">Hạn mức thấu chi cố định</h4>
                                            <p className="text-slate-400 text-[11px]">Hạn mức này chỉ có thể thiết lập khi tạo mới hạng</p>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <input disabled className="w-56 p-4 bg-white/5 border border-white/10 rounded-2xl text-xl font-black text-slate-300 outline-none cursor-not-allowed opacity-70"
                                               value={formData.creditLimit?.toLocaleString() || 0} />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-xs">VNĐ</span>
                                    </div>
                                </div>
                            </section>
                            {/* --- 4. THÔNG TIN HỆ THỐNG --- */}
                            <section className="pt-6 border-t border-slate-100">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                    {/* Ô 1: Đại lý áp dụng */}
                                    <div className="flex items-center gap-3 p-4 bg-blue-50/50 border border-blue-100 rounded-[20px] transition-all hover:bg-blue-50">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-50">
                                            <Users size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black text-blue-700 uppercase tracking-wider leading-none mb-1.5">Quy mô</p>
                                            <p className="text-sm font-black text-slate-800 truncate">
                                                {formData.agencies || 0} <span className="text-[11px] font-bold text-slate-400">đối tác</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Ô 2: Người cập nhật */}
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-[20px] transition-all hover:bg-slate-100/50">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-500 shadow-sm border border-slate-100">
                                            <UserCheck size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black text-slate-700 uppercase tracking-wider leading-none mb-1.5">Người cập nhật</p>
                                            <p className="text-sm font-black text-slate-700 truncate uppercase">
                                                {formData.updatedBy || 'Hệ thống'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Ô 3: Thời gian chỉnh sửa */}
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-[20px] transition-all hover:bg-slate-100/50">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-500 shadow-sm border border-slate-100">
                                            <Clock size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black text-slate-700 uppercase tracking-wider leading-none mb-1.5">Lần cuối lúc</p>
                                            <p className="text-sm font-bold text-slate-700 truncate">
                                                {formData.updatedAt ? new Date(formData.updatedAt).toLocaleDateString('vi-VN') : '---'}
                                                <span className="text-[11px] ml-1 text-slate-700 font-medium">
                        {formData.updatedAt ? new Date(formData.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                                            </p>
                                        </div>
                                    </div>

                                </div>
                            </section>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t flex justify-end gap-3 bg-slate-50">
                    <button type="button" onClick={onClose}
                            className="px-6 py-3 font-bold text-slate-400 hover:text-slate-600 transition-colors">Đóng
                        lại
                    </button>
                    <button type="submit" disabled={loading || fetching}
                            className="bg-slate-900 text-white px-10 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl hover:bg-black active:scale-95 transition-all disabled:opacity-50">
                        {loading ? <Loader2 className="animate-spin" size={20}/> : <><Save size={20}/> Lưu thay đổi</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditRankingDetailModal;