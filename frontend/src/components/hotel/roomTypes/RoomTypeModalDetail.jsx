import { useState, useEffect, useRef } from "react";
import { X, Loader2, Save, Sparkles, Upload, Trash2 } from "lucide-react";
import { roomTypeService } from "@/services/roomtypes.service.js";

const AMENITY_GROUPS = {
    "Phòng tắm": ["Bồn tắm", "Máy sấy", "Áo choàng", "Dép đi trong phòng", "Vòi sen đứng"],
    "Công nghệ": ["Smart TV", "Wifi tốc độ cao", "Loa Bluetooth", "Điện thoại nội bộ", "Két sắt điện tử"],
    "View": ["Hướng biển", "Hướng thành phố", "Hướng vườn", "Ban công", "Cửa sổ lớn"]
};

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

const RoomTypeDetailModal = ({ roomId, onClose, onSuccess }) => {
    const fileInputRef = useRef(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

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
            alert("Cập nhật thất bại!");
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
                    {isLoadingData ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                            <Loader2 className="animate-spin mb-3 text-blue-600" size={32} />
                            <span>Đang lấy dữ liệu mới nhất...</span>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* THÔNG TIN CƠ BẢN */}
                            <section>
                                <h3 className="text-sm font-bold text-slate-900 mb-4">Thông tin cơ bản</h3>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                    <InputField label="Tên hạng phòng" name="roomTitle" value={form.roomTitle} onChange={handleChange} />
                                    <InputField label="Số lượng phòng" name="totalRooms" type="number" value={form.totalRooms} onChange={handleChange} />
                                    <InputField label="Sức chứa người lớn" name="maxAdults" type="number" value={form.maxAdults} onChange={handleChange} />
                                    <InputField label="Sức chứa trẻ em" name="maxChildren" type="number" value={form.maxChildren} onChange={handleChange} />
                                    <InputField label="Kích thước (m²)" name="roomArea" type="number" value={form.roomArea} onChange={handleChange} />
                                    <InputField
                                        label="Loại giường"
                                        name="bedType"
                                        value={form.bedType}
                                        onChange={handleChange}
                                        placeholder="Ví dụ: 1 giường King, 2 giường đơn..."
                                    />
                                    <InputField label="Giá gốc (VNĐ/Đêm)" name="basePrice" type="number" value={form.basePrice} onChange={handleChange} className="col-span-2" />
                                </div>
                            </section>

                            {/* TIỆN ÍCH */}
                            <section>
                                <h3 className="text-sm font-bold text-slate-900 mb-4">Tiện ích</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {Object.entries(AMENITY_GROUPS).map(([group, items]) => (
                                        <div key={group} className="p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                                            <h4 className="text-[11px] font-bold text-slate-400 uppercase mb-3 tracking-widest">{group}</h4>
                                            <div className="space-y-2">
                                                {items.map(item => (
                                                    <label key={`${group}-${item}`} className="flex items-center gap-2.5 cursor-pointer group">
                                                        <input
                                                            type="checkbox"
                                                            checked={form.amenities.includes(item)}
                                                            onChange={() => handleAmenityChange(item)}
                                                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="text-sm text-slate-600 group-hover:text-slate-900">{item}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* THƯ VIỆN ẢNH */}
                            <section>
                                <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Thư viện ảnh</h3>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 hover:border-blue-400 transition-all cursor-pointer"
                                >
                                    <Upload className="text-slate-400 mb-2" size={24} />
                                    <p className="text-sm font-medium text-slate-600">Thêm ảnh mới cho hạng phòng</p>
                                    <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
                                </div>

                                <div className="grid grid-cols-4 gap-4 mt-6">
                                    {existingImages.map((img) => (
                                        <div key={`existing-${img.imageId || img.id}`} className="relative aspect-video rounded-lg overflow-hidden group border border-slate-200">
                                            <img src={img.imageUrl} className="w-full h-full object-cover" alt="existing" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <button onClick={() => removeExistingImage(img.imageId || img.id)} className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {newFiles.map((f, idx) => (
                                        <div key={`new-${f.preview}`} className="relative aspect-video rounded-lg overflow-hidden group border-2 border-blue-400">
                                            <img src={f.preview} className="w-full h-full object-cover" alt="new" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <button onClick={() => removeNewFile(idx)} className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                            <div className="absolute top-1 right-1 bg-blue-600 text-[9px] text-white px-1.5 py-0.5 rounded font-bold uppercase">Mới</div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-white rounded-b-xl">
                    <button onClick={handleClose} className="px-5 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 text-sm">Hủy bỏ</button>
                    <button
                        onClick={handleUpdate}
                        disabled={isSaving || isLoadingData}
                        className="px-6 py-2 rounded-lg bg-[#0066FF] hover:bg-blue-700 text-white font-semibold text-sm flex items-center gap-2 shadow-sm disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoomTypeDetailModal;