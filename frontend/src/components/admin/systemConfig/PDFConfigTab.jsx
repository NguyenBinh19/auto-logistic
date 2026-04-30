import React, { useState, useEffect, useRef } from 'react';
import { FileText, Upload, Trash2, Loader2, Plus, FileDown, Search, AlertCircle, RefreshCw, Save, Edit3, X, Clock, User, HardDrive, ExternalLink } from 'lucide-react';
import { pdfDocumentService } from '@/services/pdf.service.js';
import { userService } from '@/services/user.service';
import ToastPortal from "@/components/common/Notification/ToastPortal.jsx";

const UserName = ({ userId }) => {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const getName = async () => {
            if (!userId || userId === "null") {
                setLoading(false);
                return;
            }
            try {
                const res = await userService.getUserById(userId);
                if (isMounted) setName(res.result?.username || res.username || "Admin");
            } catch (err) {
                if (isMounted) setName("N/A");
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        getName();
        return () => { isMounted = false; };
    }, [userId]);

    if (loading) return <div className="h-4 w-20 bg-slate-100 animate-pulse rounded"></div>;

    return (
        <div className="flex items-center gap-2">
            <span className="text-slate-900">{name}</span>
        </div>
    );
};

const PdfConfigTab = () => {
    const [pdfs, setPdfs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [selectedDoc, setSelectedDoc] = useState(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    const toastRef = useRef(null);
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    // --- LOGIC CHẶN CUỘN TRANG ---
    useEffect(() => {
        if (selectedDoc) {
            // Khi mở modal
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = 'var(--scrollbar-width, 0px)';
        } else {
            // Khi đóng modal
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        }
        // Cleanup function khi component bị unmount
        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        };
    }, [selectedDoc]);

    const showToast = (mode, message) => {
        if (toastRef.current) toastRef.current.addMessage({ mode, message });
    };

    const fetchPdfs = async () => {
        setLoading(true);
        try {
            const response = await pdfDocumentService.getAllPdfs();
            if (response?.result) setPdfs(response.result);
        } catch (error) {
            showToast("error", "Không thể tải danh sách tài liệu");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPdfs(); }, []);

    const handleViewDetail = async (id) => {
        setIsDetailLoading(true);
        try {
            const response = await pdfDocumentService.getPdfById(id);
            if (response?.result) {
                setSelectedDoc(response.result);
            }
        } catch (error) {
            showToast("error", "Không thể lấy thông tin chi tiết tài liệu");
        } finally {
            setIsDetailLoading(false);
        }
    };

    const resetForm = () => {
        setFile(null);
        setTitle('');
        setDescription('');
        setEditingId(null);
        const fileInput = document.getElementById('pdf-upload');
        if (fileInput) fileInput.value = '';
    };

    const handleStartEdit = (doc) => {
        setEditingId(doc.documentId);
        setTitle(doc.title);
        setDescription(doc.description || '');
        setFile(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return showToast("error", "Tiêu đề không được để trống");
        if (!editingId && !file) return showToast("error", "Vui lòng chọn file");

        setIsProcessing(true);
        try {
            if (editingId) {
                await pdfDocumentService.updatePdf(editingId, { title: title.trim(), description: description.trim() });
                showToast("success", "Cập nhật thành công!");
            } else {
                await pdfDocumentService.uploadPdf(file, title, description);
                showToast("success", "Tải lên thành công!");
            }
            resetForm();
            fetchPdfs();
        } catch (error) {
            showToast("error", error.response?.data?.message || "Lỗi hệ thống");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa vĩnh viễn tài liệu này?")) return;
        try {
            await pdfDocumentService.deletePdf(id);
            showToast("success", "Đã xóa tài liệu");
            fetchPdfs();
        } catch (error) {
            showToast("error", "Lỗi khi xóa");
        }
    };

    const formatBytes = (bytes) => {
        if (!bytes) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'KB', 'MB', 'GB'][i];
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 p-4 xl:p-8">
            <ToastPortal ref={toastRef} autoClose={true}/>
            {/* Modal Xem chi tiết & Preview PDF */}
            {selectedDoc && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={() => setSelectedDoc(null)} // Click ra ngoài để đóng
                >
                    <div
                        className="bg-white w-full max-w-6xl h-[90vh] rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in duration-300"
                        onClick={(e) => e.stopPropagation()} // Ngăn chặn đóng khi click vào trong modal
                    >

                        {/* Sidebar */}
                        <div className="w-full md:w-80 p-8 border-r border-slate-100 flex flex-col bg-white">
                            <div className="flex justify-between items-start mb-6">
                                <button onClick={() => setSelectedDoc(null)}
                                        className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                    <X size={24} className="text-slate-400"/>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                <h3 className="text-xl font-black text-slate-800 mb-2 leading-tight">{selectedDoc.title}</h3>
                                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                                    {selectedDoc.description || "Không có mô tả cho tài liệu này."}
                                </p>

                                <div
                                    className="space-y-4 bg-slate-50 p-5 rounded-2xl mb-6 text-sm font-bold text-slate-600">
                                    <div className="flex flex-col gap-1">
                                        <span
                                            className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tên file</span>
                                        <span className="text-slate-900 break-all">{selectedDoc.fileName}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span
                                            className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Người tải</span>
                                        <UserName userId={selectedDoc.uploadedBy}/>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span
                                            className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Ngày tải</span>
                                        <span
                                            className="text-slate-900">{new Date(selectedDoc.createdAt).toLocaleString('vi-VN')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 space-y-3 border-t border-slate-100">
                                <a
                                    href={selectedDoc.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full py-3.5 bg-slate-100 text-slate-700 rounded-xl font-black text-xs text-center hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                                >
                                    <ExternalLink size={16}/> MỞ Ở TAB
                                </a>
                                <button
                                    onClick={() => setSelectedDoc(null)}
                                    className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-black text-xs hover:bg-slate-800 transition-all"
                                >
                                    ĐÓNG
                                </button>
                            </div>
                        </div>

                        {/* Preview Iframe */}
                        <div className="flex-1 bg-slate-100 relative h-full">
                            <iframe
                                src={`https://docs.google.com/viewer?url=${encodeURIComponent(selectedDoc.fileUrl)}&embedded=true`}
                                className="w-full h-full border-none relative z-10"
                                title="PDF Preview"
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-0 bg-slate-50">
                                <Loader2 size={40} className="animate-spin text-slate-300 mb-2"/>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đang tải tài liệu...</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div
                className="bg-slate-900 rounded-2xl p-5 text-white flex items-center justify-between shadow-xl relative overflow-hidden">
                <div className="flex items-center gap-4 z-10">
                    <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400 border border-blue-500/10">
                        <FileText size={22}/>
                    </div>
                    <div>
                        <h2 className="text-base font-bold tracking-tight uppercase">
                            Quản lý tài liệu PDF
                        </h2>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={fetchPdfs}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400"
                >
                    <RefreshCw size={18} className={loading ? "animate-spin" : ""}/>
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="xl:col-span-1">
                    <div
                        className={`bg-white p-6 rounded-[28px] border sticky top-8 transition-all ${editingId ? 'border-amber-400 ring-4 ring-amber-500/5' : 'border-slate-200'}`}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-black uppercase text-slate-600 flex items-center gap-2">
                                {editingId ? <Edit3 size={14} className="text-amber-500"/> :
                                    <Plus size={14} className="text-blue-500"/>}
                                {editingId ? 'Cập nhật' : 'Thêm mới'}
                            </h3>
                            {editingId && <button onClick={resetForm}
                                                  className="text-[10px] font-black text-red-500 bg-red-50 px-3 py-1 rounded-full">HỦY </button>}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex items-center gap-1.5 px-1 text-[10px] font-medium text-amber-600">
                                <span>Tiêu đề cần chuẩn xác để không ảnh hưởng hiển thị phía người dùng</span>
                            </div>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold"
                                placeholder="Tiêu đề tài liệu..."
                            />
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 min-h-[100px] text-sm"
                                placeholder="Mô tả..."
                            />
                            {!editingId && (
                                <label
                                    className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-slate-200 rounded-[24px] cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all">
                                    <input
                                        id="pdf-upload"
                                        type="file"
                                        accept="application/pdf"
                                        onChange={(e) => setFile(e.target.files[0])}
                                        className="hidden"
                                    />
                                    <Upload size={32} className={file ? "text-blue-500" : "text-slate-300"}/>
                                    <span
                                        className="mt-2 text-[10px] font-black text-slate-500 uppercase px-4 text-center truncate w-full">
                                        {file ? file.name : "Chọn file PDF"}
                                    </span>
                                </label>
                            )}
                            <button disabled={isProcessing}
                                    className={`w-full py-4 text-white rounded-2xl font-black flex items-center justify-center gap-2 ${editingId ? 'bg-amber-500' : 'bg-slate-900'}`}>
                                {isProcessing ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>}
                                {editingId ? 'LƯU THAY ĐỔI' : 'TẢI LÊN NGAY'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className="xl:col-span-2">
                    <div
                        className="bg-white rounded-[28px] border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                        {loading ? (
                            <div className="p-20 flex flex-col items-center"><Loader2
                                className="animate-spin text-blue-600" size={40}/></div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {pdfs.length > 0 ? pdfs.map((doc) => (
                                    <div key={doc.documentId}
                                         className="p-6 flex items-center justify-between group hover:bg-slate-50/80 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-all">
                                                <FileDown size={24}/>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-700">{doc.title}</h4>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatBytes(doc.fileSize)} • {new Date(doc.createdAt).toLocaleDateString('vi-VN')}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleViewDetail(doc.documentId)}
                                                className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                title="Xem trực tiếp"
                                            >
                                                {isDetailLoading ? <Loader2 size={18} className="animate-spin"/> :
                                                    <Search size={18}/>}
                                            </button>
                                            <button onClick={() => handleStartEdit(doc)}
                                                    className="p-2.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all">
                                                <Edit3 size={18}/></button>
                                            <button onClick={() => handleDelete(doc.documentId)}
                                                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                                <Trash2 size={18}/></button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-20 flex flex-col items-center text-slate-400">
                                        <AlertCircle size={40} className="mb-2 opacity-20"/>
                                        <p className="text-xs font-black uppercase tracking-widest">Chưa có tài liệu
                                            nào</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
                
                /* Đảm bảo animation mượt mà */
                .zoom-in { transform: scale(0.95); opacity: 0; }
                .zoom-in.animate-in { transform: scale(1); opacity: 1; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
            `}</style>
        </div>
    );
};

export default PdfConfigTab;