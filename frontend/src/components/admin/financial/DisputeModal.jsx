import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    X, Upload, Loader2, CheckCircle2,
    MessageSquare, Hotel, DollarSign, Calendar,
    FileText, ShieldCheck, AlertCircle, Image as ImageIcon,
    ZoomIn, Trash2
} from 'lucide-react';
import { payoutService } from "@/services/payout.service";
import { toast } from "react-hot-toast";

const DisputeDetailModal = ({ isOpen, onClose, statement, onResolveSuccess }) => {
    const [disputeDetail, setDisputeDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [resolving, setResolving] = useState(false);
    const [adminReport, setAdminReport] = useState("");
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(prev => [...prev, ...files]);
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            if (statement?.statementId) fetchDetail();
        } else {
            document.body.style.overflow = 'unset';
            setAdminReport("");
            setSelectedFiles([]);
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen, statement]);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const res = await payoutService.getDisputeDetail(statement.statementId);
            setDisputeDetail(res.result);
            if (res.result?.adminReport) setAdminReport(res.result.adminReport);
        } catch (error) {
            toast.error("Không thể tải thông tin chi tiết");
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async () => {
        if (!adminReport.trim()) {
            toast.error("Vui lòng nhập nội dung báo cáo xử lý");
            return;
        }
        setResolving(true);
        try {
            const request = {
                disputeId: disputeDetail.disputeId,
                adminReport: adminReport,
                status: "RESOLVED"
            };
            await payoutService.resolveDispute(request, selectedFiles);
            toast.success("Xử lý khiếu nại thành công");
            onResolveSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi xử lý khiếu nại");
        } finally {
            setResolving(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={onClose} />

            <div className="relative bg-white w-full max-w-6xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md z-10">
                    <div className="flex items-center gap-5">
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Hồ sơ đối soát khiếu nại</h3>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs font-black px-3 py-1 bg-slate-100 text-slate-500 rounded-full uppercase tracking-wider">
                                    Mã đối soát: {statement?.statementCode}
                                </span>
                                <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${disputeDetail?.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600 animate-pulse'}`}>
                                    {disputeDetail?.status === 'RESOLVED' ? 'Đã giải quyết' : 'Đang chờ xử lý'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="group p-3 rounded-2xl hover:bg-rose-50 transition-all duration-300">
                        <X size={28} className="text-slate-400 group-hover:text-rose-500 group-hover:rotate-90 transition-all" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="h-[500px] flex flex-col items-center justify-center gap-4">
                            <Loader2 className="animate-spin text-blue-600" size={48} />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Đang truy xuất dữ liệu...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-5 h-full">

                            {/* Cột trái */}
                            <div className="lg:col-span-2 p-10 bg-slate-50/50 space-y-10 border-r border-slate-100">
                                <section className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><MessageSquare size={18}/></div>
                                        <h4 className="text-xs font-black uppercase text-slate-500 tracking-widest">Nội dung khiếu nại</h4>
                                    </div>
                                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 relative group">
                                        <p className="text-base font-bold text-slate-700 leading-relaxed italic italic">
                                            "{disputeDetail?.reasonDetails}"
                                        </p>
                                        <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase">
                                                <Calendar size={14} /> {new Date(disputeDetail?.createdAt).toLocaleString('vi-VN')}
                                            </div>
                                            <AlertCircle size={20} className="text-rose-400 opacity-20 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                </section>

                                <div className="grid grid-cols-1 gap-4">
                                    <DetailBox label="Đối tác khách sạn" value={statement?.hotelName} />
                                    <DetailBox label="Tổng tiền thanh toán" value={`${statement?.netPayout?.toLocaleString()} VND`} />
                                </div>
                            </div>

                            {/* Cột phải */}
                            <div className="lg:col-span-3 p-10 space-y-10 bg-white">
                                <section className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <h4 className="text-xs font-black uppercase text-slate-500 tracking-widest">Báo cáo giải quyết</h4>
                                        </div>
                                    </div>

                                    <textarea
                                        className="w-full h-44 p-8 bg-slate-50 border-2 border-slate-100 rounded-[32px] focus:border-blue-500 focus:bg-white outline-none text-base font-bold text-slate-700 transition-all placeholder:text-slate-300 resize-none"
                                        placeholder="Nhập chi tiết các bước đã kiểm tra và kết luận cuối cùng..."
                                        value={adminReport}
                                        onChange={(e) => setAdminReport(e.target.value)}
                                        disabled={disputeDetail?.status === 'RESOLVED'}
                                    />
                                </section>

                                {/* PHẦN HÌNH ẢNH  */}
                                <section className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <h4 className="text-xs font-black uppercase text-slate-500 tracking-widest">Bằng chứng giải quyết</h4>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {/* Hiển thị các ảnh đã lưu  */}
                                        {disputeDetail?.imageUrls?.map((url, idx) => (
                                            <div key={`saved-${idx}`} className="group relative aspect-square rounded-[24px] overflow-hidden border-2 border-slate-100 shadow-sm hover:shadow-md transition-all">
                                                <img src={url} className="w-full h-full object-cover" alt="Bằng chứng cũ" />
                                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <button onClick={() => setPreviewImage(url)} className="p-2 bg-white rounded-full text-slate-900 hover:scale-110 transition-transform">
                                                        <ZoomIn size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Upload ảnh mới */}
                                        {disputeDetail?.status !== 'RESOLVED' && (
                                            <>
                                                {selectedFiles.map((file, idx) => (
                                                    <div key={`new-${idx}`} className="group relative aspect-square rounded-[24px] overflow-hidden border-2 border-blue-200 border-dashed transition-all">
                                                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover opacity-70" alt="Bằng chứng mới" />
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <button onClick={() => removeFile(idx)} className="p-2 bg-rose-500 text-white rounded-full hover:scale-110 transition-transform shadow-lg">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                        <div className="absolute bottom-2 left-2 right-2 text-[8px] font-black uppercase bg-blue-600 text-white text-center py-1 rounded-lg">Mới chọn</div>
                                                    </div>
                                                ))}

                                                <label className="aspect-square border-2 border-dashed border-slate-200 rounded-[24px] flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all text-slate-400 hover:text-blue-500">
                                                    <div className="p-3 bg-slate-100 rounded-full group-hover:bg-blue-100"><Upload size={24} /></div>
                                                    <span className="text-[10px] font-black uppercase tracking-tighter">Thêm bằng chứng</span>
                                                    <input type="file" multiple className="hidden" accept="image/*" onChange={handleFileChange} />
                                                </label>
                                            </>
                                        )}

                                        {/* Trạng thái trống */}
                                        {!disputeDetail?.imageUrls?.length && !selectedFiles.length && (
                                            <div className="col-span-full py-12 flex flex-col items-center justify-center bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-100">
                                                <ImageIcon size={32} className="text-slate-200 mb-2" />
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Chưa có tệp đính kèm nào</p>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* Footer Action */}
                                <div className="pt-6">
                                    {disputeDetail?.status === 'RESOLVED' ? (
                                        <div className="w-full py-6 bg-emerald-50 text-emerald-600 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 border border-emerald-100 shadow-sm shadow-emerald-50">
                                            <div className="p-1 bg-emerald-500 text-white rounded-full"><CheckCircle2 size={16} /></div>
                                            Hồ sơ đã đóng - Giải quyết thành công
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleResolve}
                                            disabled={resolving}
                                            className="w-full py-6 bg-[#0f172a] text-white rounded-[28px] font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 transition-all flex items-center justify-center gap-4 shadow-xl shadow-blue-900/20 active:scale-[0.98]"
                                        >
                                            {resolving ? <Loader2 className="animate-spin" size={20}/> : <CheckCircle2 size={20}/>}
                                            Phê duyệt
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Lightbox Mini để xem ảnh to */}
            {previewImage && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-10 bg-slate-900/90" onClick={() => setPreviewImage(null)}>
                    <button className="absolute top-10 right-10 text-white p-4 hover:bg-white/10 rounded-full transition-colors"><X size={40} /></button>
                    <img src={previewImage} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300" alt="Zoom" />
                </div>
            )}
        </div>,
        document.body
    );
};

const DetailBox = ({ icon, label, value }) => (
    <div className="p-6 rounded-[28px] border border-blue-50 bg-white shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-2 text-blue-600/60">
            {icon}
            <span className="text-[10px] font-black uppercase tracking-[0.15em]">{label}</span>
        </div>
        <p className="text-lg font-black text-slate-800">{value || '---'}</p>
    </div>
);

export default DisputeDetailModal;