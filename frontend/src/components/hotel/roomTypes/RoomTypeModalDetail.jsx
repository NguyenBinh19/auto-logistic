import { useState, useEffect, useRef } from "react";
import { X, Loader2, Save, Sparkles, Upload, Trash2, Plus, Check } from "lucide-react";
import { roomTypeService } from "@/services/roomtypes.service.js";

const SUGGESTED_AMENITIES = ["Wifi tốc độ cao", "Smart TV", "Bồn tắm", "Máy sấy", "Loa Bluetooth", "Ban công", "Hướng biển", "Hướng phố"];
const InputField = ({ label, name, value, onChange, type = "text", placeholder, className = "", ...props }) => (
    <div className={`space-y-1.5 ${className}`}>
        <label className="text-sm font-semibold text-slate-700 block">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            {...props}
        />
    </div>
);

const RoomTypeDetailModal = ({ roomId, onClose, onSuccess, onError }) => {
    const fileInputRef = useRef(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [tagInput, setTagInput] = useState("");
    const [isLocked, setIsLocked] = useState(false);

    const [form, setForm] = useState({
        roomTitle: "", description: "", basePrice: 0,
        maxAdults: 1, maxChildren: 0, roomArea: 0,
        bedType: "", totalRooms: 0, amenities: []
    });

    const [existingImages, setExistingImages] = useState([]);
    const [newFiles, setNewFiles] = useState([]);
    const [deletedImageIds, setDeletedImageIds] = useState([]);

    useEffect(() => {
        setIsVisible(true);
        document.body.style.overflow = 'hidden';
        if (roomId) fetchRoomData();

        return () => {
            document.body.style.overflow = 'unset';
            newFiles.forEach(f => URL.revokeObjectURL(f.preview));
        };
    }, [roomId]);

    const fetchRoomData = async () => {
        try {
            setIsLoadingData(true);
            const res = await roomTypeService.getRoomTypeDetail(roomId);
            const data = res.result || res;
            if (data.isEditable === false) {
                setIsLocked(true);
            }
            setForm({
                roomTitle: data.roomTitle || "",
                description: data.description || "",
                basePrice: data.basePrice || 0,
                maxAdults: data.maxAdults || 1,
                maxChildren: data.maxChildren || 0,
                roomArea: data.roomArea || 0,
                bedType: data.bedType || "King",
                totalRooms: data.totalRooms || 0,
                amenities: data.amenities || [],
            });
            setExistingImages(data.images || []);
            setDeletedImageIds([]);
            setNewFiles([]);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleAddTag = (e) => {
        if (e && e.key && e.key !== 'Enter') return;
        if (e) e.preventDefault();
        const val = tagInput.trim();
        if (val) {
            if (!form.amenities.includes(val)) {
                setForm(prev => ({ ...prev, amenities: [...prev.amenities, val] }));
                setTagInput("");
            } else {
                setTagInput("");
            }
        }
    };

    const removeTag = (tagToRemove) => {
        setForm(prev => ({ ...prev, amenities: prev.amenities.filter(tag => tag !== tagToRemove) }));
    };

    const toggleSuggestedAmenity = (amenity) => {
        setForm(prev => {
            const exists = prev.amenities.includes(amenity);
            return {
                ...prev,
                amenities: exists ? prev.amenities.filter(a => a !== amenity) : [...prev.amenities, amenity]
            };
        });
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const mappedFiles = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));
        setNewFiles(prev => [...prev, ...mappedFiles]);
        e.target.value = null;
    };

    const removeExistingImage = (id) => {
        setDeletedImageIds(prev => [...prev, id]);
        setExistingImages(prev => prev.filter(img => (img.imageId || img.id) !== id));
    };

    const removeNewFile = (index) => {
        setNewFiles(prev => {
            const updated = [...prev];
            URL.revokeObjectURL(updated[index].preview);
            updated.splice(index, 1);
            return updated;
        });
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === "number" ? (value === "" ? "" : Number(value)) : value
        }));
    };

    const handleAmenityChange = (item) => {
        setForm(prev => ({
            ...prev,
            amenities: prev.amenities.includes(item)
                ? prev.amenities.filter(a => a !== item)
                : [...prev.amenities, item]
        }));
    };

    const handleUpdate = async () => {
        if (!form.roomTitle.trim()) {
            alert("Vui lòng nhập tên hạng phòng!");
            return;
        }
        if (Number(form.basePrice) <= 0) {
            alert("Giá phòng phải lớn hơn 0!");
            return;
        }
        if (Number(form.maxAdults) < 1) {
            alert("Sức chứa người lớn tối thiểu là 1!");
            return;
        }
        if (isLocked) return;
        const isConfirmed = window.confirm("Bạn có chắc chắn muốn cập nhật các thay đổi cho hạng phòng này không?");

        if (!isConfirmed) return;

        try {
            setIsSaving(true);
            const payload = { ...form, deletedImageIds };
            const newImagesOnly = newFiles.map(f => f.file);

            await roomTypeService.updateRoomType(roomId, payload, newImagesOnly);

            setDeletedImageIds([]);
            setNewFiles([]);
            handleClose();
            if (onSuccess) onSuccess();
        } catch (err) {
            const errorCode = err?.response?.data?.code;
            if (errorCode === 2004) {
                setIsLocked(true); // Khóa form ngay lập tức
                alert("KHÔNG THỂ CHỈNH SỬA: Hạng phòng này đang có đơn đặt phòng hoặc đang trong quá trình vận hành. Vui lòng kiểm tra lại lịch phòng!");
            } else {
                alert("Cập nhật thất bại: " + (err?.response?.data?.message || "Lỗi hệ thống"));
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 200);
    };

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`bg-white w-full max-w-3xl rounded-xl shadow-2xl flex flex-col max-h-[95vh] transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>

                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800">Chỉnh sửa hạng phòng</h2>
                    <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {isLocked && (
                        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-800 animate-in slide-in-from-top-2">
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <span className="text-xl">⚠️</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold">Chế độ xem giới hạn</p>
                                <p className="text-xs opacity-80">Hạng phòng này đang có giao dịch thực tế, bạn không thể thay đổi thông tin cấu hình.</p>
                            </div>
                        </div>
                    )}
                    {isLoadingData ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                            <Loader2 className="animate-spin mb-3 text-blue-600" size={32} />
                            <span>Đang lấy dữ liệu mới nhất...</span>
                        </div>
                    ) : (
                        <div className={`space-y-8 ${isLocked ? 'pointer-events-none opacity-75' : ''}`}>
                            {/* THÔNG TIN CƠ BẢN */}
                            <section>
                                <h3 className="text-sm font-bold text-slate-900 mb-4">Thông tin cơ bản</h3>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                    <InputField label="Tên hạng phòng" name="roomTitle" value={form.roomTitle}
                                                onChange={handleChange} disabled={isLocked}/>
                                    <InputField label="Số lượng phòng" name="totalRooms" type="number"
                                                value={form.totalRooms} onChange={handleChange} disabled={isLocked}/>
                                    <InputField label="Sức chứa người lớn" name="maxAdults" type="number"
                                                value={form.maxAdults} onChange={handleChange} disabled={isLocked}/>
                                    <InputField label="Sức chứa trẻ em" name="maxChildren" type="number"
                                                value={form.maxChildren} onChange={handleChange} disabled={isLocked}/>
                                    <InputField label="Kích thước (m²)" name="roomArea" type="number"
                                                value={form.roomArea} onChange={handleChange} disabled={isLocked}/>
                                    <InputField
                                        label="Loại giường"
                                        name="bedType"
                                        value={form.bedType}
                                        onChange={handleChange}
                                        placeholder="Ví dụ: 1 giường King, 2 giường đơn..."
                                        disabled={isLocked}
                                    />
                                    <InputField label="Giá gốc (VNĐ/Đêm)" name="basePrice" type="number"
                                                value={form.basePrice} onChange={handleChange} disabled={isLocked} className="col-span-2"/>
                                </div>
                            </section>

                            {/* TIỆN ÍCH */}
                            <section>
                                <h3 className="text-sm font-bold text-slate-900 mb-3">Tiện ích</h3>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    {/* Danh sách Tags đã chọn */}
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {form.amenities.map((tag, index) => (
                                            <span key={index}
                                                  className="flex items-center gap-1 px-3 py-1 bg-white border border-blue-200 text-blue-700 rounded-full text-xs font-semibold shadow-sm animate-in fade-in zoom-in duration-200">
                                                {tag}
                                                <X size={12} className="cursor-pointer hover:text-red-500"
                                                   onClick={() => removeTag(tag)}/>
                                            </span>
                                        ))}
                                    </div>
                                    {/* Input thêm nhanh */}
                                    <div className="relative mb-4">
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={handleAddTag}
                                            placeholder="Thêm tiện ích (nhấn Enter để thêm)..."
                                            disabled={isLocked}
                                            className="w-full pl-3 pr-10 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400"
                                        />
                                        <button type="button" onClick={() => handleAddTag()}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-blue-500">
                                            <Plus size={16}/>
                                        </button>
                                    </div>
                                    {/* Gợi ý tiện ích dạng phẳng */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {SUGGESTED_AMENITIES.map(item => {
                                            const isSelected = form.amenities.includes(item);
                                            return (
                                                <div key={item} onClick={() => toggleSuggestedAmenity(item)}
                                                     className={`cursor-pointer text-xs px-3 py-2 rounded border transition-all flex items-center gap-2 ${isSelected ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' : 'bg-white border-slate-100 text-slate-600'}`}>
                                                    <div
                                                        className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                                                        {isSelected && <Check size={10} className="text-white"/>}
                                                    </div>
                                                    {item}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </section>

                            {/* THƯ VIỆN ẢNH */}
                            {!isLocked && (
                            <section>
                                <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Thư viện
                                    ảnh</h3>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 hover:border-blue-400 transition-all cursor-pointer"
                                >
                                    <Upload className="text-slate-400 mb-2" size={24}/>
                                    <p className="text-sm font-medium text-slate-600">Thêm ảnh mới cho hạng phòng</p>
                                    <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef}
                                           onChange={handleFileSelect}/>
                                </div>

                                <div className="grid grid-cols-4 gap-4 mt-6">
                                    {existingImages.map((img) => (
                                        <div key={`existing-${img.imageId || img.id}`}
                                             className="relative aspect-video rounded-lg overflow-hidden group border border-slate-200">
                                            <img src={img.imageUrl} className="w-full h-full object-cover"
                                                 alt="existing"/>
                                            <div
                                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <button onClick={() => removeExistingImage(img.imageId || img.id)}
                                                        className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg">
                                                    <Trash2 size={14}/>
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {newFiles.map((f, idx) => (
                                        <div key={`new-${f.preview}`}
                                             className="relative aspect-video rounded-lg overflow-hidden group border-2 border-blue-400">
                                            <img src={f.preview} className="w-full h-full object-cover" alt="new"/>
                                            <div
                                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <button onClick={() => removeNewFile(idx)}
                                                        className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg">
                                                    <Trash2 size={14}/>
                                                </button>
                                            </div>
                                            <div
                                                className="absolute top-1 right-1 bg-blue-600 text-[9px] text-white px-1.5 py-0.5 rounded font-bold uppercase">Mới
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                            )}
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-white rounded-b-xl">
                    <button onClick={handleClose}
                            className="px-5 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 text-sm">Hủy
                        bỏ
                    </button>
                    {!isLocked && (
                    <button
                        onClick={handleUpdate}
                        disabled={isSaving || isLoadingData}
                        className="px-6 py-2 rounded-lg bg-[#0066FF] hover:bg-blue-700 text-white font-semibold text-sm flex items-center gap-2 shadow-sm disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>}
                        Lưu thay đổi
                    </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoomTypeDetailModal;