import React, { useState, useEffect } from 'react';
import { X, Save, TrendingUp, Wallet, Loader2, Info, Star, Trophy, Crown, Medal, Gem, Award, Zap, ChevronDown, ShieldCheck } from 'lucide-react';
import { rankService } from '@/services/rank.service.js';

const AddRankingModal = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);

    const iconOptions = [
        { id: 'star', component: Star },
        { id: 'trophy', component: Trophy },
        { id: 'crown', component: Crown },
        { id: 'medal', component: Medal },
        { id: 'gem', component: Gem },
        { id: 'award', component: Award },
        { id: 'zap', component: Zap },
    ];

    // Giá trị mặc định ban đầu
    const initialFormState = {
        rankName: '',
        rankCode: '',
        description: '',
        icon: 'star',
        color: '#3b82f6',
        priority: 1,
        isActive: true,
        upgradeMinTotalRevenue: '',
        maintainMinRevenue: '',
        creditLimit: 0,
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        if (isOpen) {
            setFormData(initialFormState);
        }
    }, [isOpen]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        try {
            await rankService.createRank(formData);
            alert("Tạo hạng mới thành công!");
            onSuccess();
            onClose();
        } catch (error) {
            alert("Lỗi: " + (error.response?.data?.message || "Không thể tạo hạng"));
        } finally { setLoading(false); }
    };

    if (!isOpen) return null;

    const SelectedIconTag = iconOptions.find(i => i.id === formData.icon)?.component || Star;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-white w-full max-w-4xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in duration-200 flex flex-col max-h-[95vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl text-white shadow-lg" style={{ backgroundColor: formData.color }}>
                            <SelectedIconTag size={22} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Thêm hạng mới</h3>
                            <p className="text-xs text-slate-400 font-medium">Thiết lập cấp bậc và điều kiện cho đại lý</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
                </div>

                <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">

                    {/* 1. Định danh & Biểu tượng */}
                    <section className="space-y-4">
                        <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Info size={14} /> 1. Định danh & Biểu tượng
                        </h4>
                        <div className="grid grid-cols-12 gap-6">
                            <div className="col-span-12 md:col-span-8 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">Mã hạng (English code)</label>
                                        <input required name="rankCode" value={formData.rankCode} onChange={handleChange}
                                               className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono font-bold text-blue-600 focus:ring-2 ring-blue-500/10 outline-none"
                                               placeholder="VD: DIAMOND_MEMBER"/>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">Tên hiển thị </label>
                                        <input required name="rankName" value={formData.rankName} onChange={handleChange}
                                               className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 focus:ring-2 ring-blue-500/10 outline-none"
                                               placeholder="VD: Thành viên Kim Cương"/>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">Mô tả quyền lợi</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange}
                                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl h-20 outline-none focus:ring-2 ring-blue-500/10 text-sm"
                                              placeholder="Nhập các đặc quyền của hạng này..."/>
                                </div>
                            </div>

                            <div className="col-span-12 md:col-span-4 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">Độ ưu tiên & Màu</label>
                                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                                        <div className="flex items-center gap-3">
                                            <input name="color" type="color" value={formData.color} onChange={handleChange}
                                                   className="w-10 h-10 rounded-lg cursor-pointer border-2 border-white shadow-sm overflow-hidden" />
                                            <input name="colorText" type="text" value={formData.color} onChange={handleChange}
                                                   className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase outline-none" />
                                        </div>
                                        <div className="relative">
                                            <input name="priority" type="number" value={formData.priority} onChange={handleChange}
                                                   className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold pr-10 outline-none focus:border-blue-500" />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 uppercase">Cấp</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chọn Icon */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">Chọn biểu tượng đại diện</label>
                            <div className="flex flex-wrap gap-3 p-4 bg-slate-50 border border-slate-200 rounded-[24px]">
                                {iconOptions.map((item) => {
                                    const IconComp = item.component;
                                    const isSelected = formData.icon === item.id;
                                    return (
                                        <button key={item.id} type="button" onClick={() => setFormData(p => ({...p, icon: item.id}))}
                                                className={`p-4 rounded-2xl transition-all duration-300 ${isSelected ? 'bg-slate-900 text-white shadow-xl scale-110' : 'bg-white text-slate-400 hover:bg-slate-100 border border-slate-100'}`}>
                                            <IconComp size={24}/>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* 2. Điều kiện tài chính */}
                    <section className="space-y-4">
                        <h4 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-2">
                             2. Chỉ số thăng hạng & Duy trì
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-emerald-50/50 p-6 rounded-[24px] border border-emerald-100 space-y-4">
                                <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                                    <TrendingUp size={16} /> Yêu cầu nâng hạng
                                </div>
                                <div className="relative">
                                    <input name="upgradeMinTotalRevenue" type="number" value={formData.upgradeMinTotalRevenue} onChange={handleChange}
                                           className="w-full p-4 bg-white border border-emerald-200 rounded-2xl font-black text-slate-700 outline-none pr-12 focus:ring-4 ring-emerald-500/10" />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-emerald-600">VNĐ</span>
                                </div>
                                <p className="text-[10px] text-emerald-600 leading-relaxed font-medium">Doanh thu tối thiểu tích lũy trong chu kỳ để được xét nâng lên hạng này.</p>
                            </div>

                            <div className="bg-rose-50/50 p-6 rounded-[24px] border border-rose-100 space-y-4">
                                <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                                    <ShieldCheck size={16} /> Doanh thu duy trì
                                </div>
                                <div className="relative">
                                    <input name="maintainMinRevenue" type="number" value={formData.maintainMinRevenue} onChange={handleChange}
                                           className="w-full p-4 bg-white border border-rose-200 rounded-2xl font-black text-slate-700 outline-none pr-12 focus:ring-4 ring-rose-500/10" />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-rose-600">VNĐ</span>
                                </div>
                                <p className="text-[10px] text-rose-600 leading-relaxed font-medium">Doanh thu tối thiểu cần đạt để không bị hạ xuống hạng thấp hơn.</p>
                            </div>
                        </div>
                    </section>

                    {/* 3. Đặc quyền tài chính */}
                    <section className="space-y-4">
                        <h4 className="text-[11px] font-black text-amber-600 uppercase tracking-[0.2em] flex items-center gap-2">
                            3. Đặc quyền tài chính
                        </h4>
                        <div className="bg-slate-900 p-6 rounded-[24px] flex flex-col md:flex-row items-center gap-6">
                            <div className="flex-1 space-y-1">
                                <h5 className="text-white font-bold flex items-center gap-2">Hạn mức thấu chi (Credit Limit)</h5>
                                <p className="text-slate-400 text-xs">Số tiền đại lý được phép nợ hoặc thanh toán sau dựa trên hạng này.</p>
                            </div>
                            <div className="w-full md:w-64 relative">
                                <input name="creditLimit" type="number" value={formData.creditLimit} onChange={handleChange}
                                       className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl font-black text-white outline-none focus:bg-white/20 transition-all text-xl pr-14" />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-amber-400 text-xs uppercase tracking-tighter">VNĐ</span>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t flex justify-end gap-3 bg-slate-50">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 font-bold text-slate-400 hover:text-slate-600 transition-colors">Hủy bỏ</button>
                    <button type="submit" disabled={loading} className="bg-slate-900 hover:bg-black text-white px-10 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl active:scale-95 transition-all disabled:opacity-50">
                        {loading ? <Loader2 className="animate-spin" size={20}/> : <><Save size={20}/> Tạo hạng mới</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddRankingModal;