import { useState, useEffect, useRef } from "react";
import {
    X, Check, Plus, Wand2, Loader2,
    Type, Hash, DollarSign, Users, Home, Bed, Ruler, Baby, Tag, Save,
    ImagePlus
} from "lucide-react";
import { roomTypeService } from "@/services/roomtypes.service.js";

// --- COMPONENT INPUT ---
const InputField = ({ label, name, value, onChange, error, type = "text", placeholder, icon: Icon, required = false, disabled = false, ...props }) => (
    <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-700">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            {Icon && (
                <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${disabled ? "text-slate-300" : "text-slate-400"}`}>
                    <Icon size={18} />
                </div>
            )}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                placeholder={placeholder}
                className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-4 py-2 border rounded-lg text-sm transition-all outline-none
                    ${error
                    ? "border-red-300 ring-1 ring-red-100 bg-red-50/10"
                    : disabled
                        ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed select-none"
                        : "bg-white border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                }
                `}
                {...props}
            />
        </div>
        {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
);

const SUGGESTED_AMENITIES = ["Wifi tốc độ cao", "Smart TV", "Bồn tắm", "Máy sấy", "Loa Bluetooth", "Ban công", "Hướng biển", "Hướng phố"];

const RoomTypeModal = ({ onClose, onSuccess }) => {

    // --- STATE ---
    const [form, setForm] = useState({
        roomCode: "",
        roomTitle: "",
        description: "",
        basePrice: "",
        maxAdults: 1,
        maxChildren: 0,
        totalRooms: "",
        roomArea: "",
        bedType: "",
        keywords: "",
        roomStatus: "ACTIVE",
        amenities: []
    });

    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);
    const fileInputRef = useRef(null);
    const [tagInput, setTagInput] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    // --- XỬ LÝ HÌNH ẢNH ---
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Hỗ trợ tối đa 10 ảnh
        if (images.length + files.length > 10) {
            alert("Chỉ được tải lên tối đa 10 ảnh");
            return;
        }

        setImages(prev => [...prev, ...files]);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        URL.revokeObjectURL(previews[index]);
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    // --- XỬ LÝ FORM & CHẶN SỐ ÂM ---
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        let newValue = value;

        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));

        if (type === "number") {
            if (value === "") {
                newValue = "";
            } else {
                const numValue = parseFloat(value);
                if (numValue < 0) return; // Chặn số âm
                newValue = numValue;
            }
        }
        setForm(prev => ({ ...prev, [name]: newValue }));
    };

    const handleKeyDown = (e) => {
        // Chặn các ký tự không phải số trong input type number
        if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault();
    };

    // --- XỬ LÝ TIỆN ÍCH (TAGS) ---
    const handleAddTag = (e) => {
        if (e.key && e.key !== 'Enter') return;
        if (e) e.preventDefault();

        const val = tagInput.trim();
        if (val) {
            if (!form.amenities.includes(val)) {
                setForm(prev => ({
                    ...prev,
                    amenities: [...prev.amenities, val]
                }));
                setTagInput("");
            } else {
                // Nếu trùng thì chỉ cần xóa trắng hoặc báo lỗi nhẹ
                alert("Tiện ích này đã tồn tại!");
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

    // --- VALIDATION & SUBMIT ---
    const validate = () => {
        const newErrors = {};
        if (!form.roomCode.trim()) newErrors.roomCode = "Vui lòng nhập mã phòng";
        if (!form.roomTitle.trim()) newErrors.roomTitle = "Vui lòng nhập tên hạng phòng";
        if (form.basePrice === "" || Number(form.basePrice) <= 0) newErrors.basePrice = "Giá phòng phải lớn hơn 0";
        if (form.totalRooms === "" || Number(form.totalRooms) <= 0) newErrors.totalRooms = "Số lượng phòng phải lớn hơn 0";
        if (Number(form.maxAdults) < 1) newErrors.maxAdults = "Tối thiểu 1 người lớn";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        try {
            setLoading(true);

            // 1. Tạo object payload i
            const payload = {
                roomCode: form.roomCode.toUpperCase(),
                roomTitle: form.roomTitle,
                description: form.description,
                basePrice: Number(form.basePrice),
                maxAdults: Number(form.maxAdults),
                maxChildren: Number(form.maxChildren),
                roomArea: Number(form.roomArea) || 0,
                bedType: form.bedType,
                // keywords: form.keywords,
                totalRooms: Number(form.totalRooms),
                amenities: form.amenities,
                roomStatus: form.roomStatus
            };

            // 2. Gọi service (Service tự đóng gói thành Blob và kèm file)
            await roomTypeService.createRoomType(payload, images);

            onSuccess();
            handleClose();
        } catch (err) {
            console.error("Error creating room type:", err);
            // Hiển thị lỗi chi tiết từ server nếu có
            alert(err.response?.data?.message || "Có lỗi xảy ra khi tạo hạng phòng");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`bg-white w-full max-w-4xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>

                {/* HEADER */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800">Thêm hạng phòng mới</h2>
                    <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* BODY */}
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">

                    {/* 1. THÔNG TIN CƠ BẢN */}
                    <section>
                        <h3 className="text-sm font-bold text-slate-900 mb-4">Thông tin cơ bản</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                            <InputField label="Tên hạng phòng" name="roomTitle" value={form.roomTitle} onChange={handleChange} error={errors.roomTitle} required icon={Type} placeholder="VD: Deluxe King" />
                            <InputField label="Mã phòng (Code)" name="roomCode" value={form.roomCode} onChange={handleChange} error={errors.roomCode} required icon={Hash} placeholder="VD: DLX01" style={{ textTransform: "uppercase" }} />
                            <InputField label="Số lượng phòng (Vật lý)" name="totalRooms" type="number" value={form.totalRooms} onChange={handleChange} onKeyDown={handleKeyDown} error={errors.totalRooms} required icon={Home} />
                            <InputField label="Giá gốc (VNĐ/Đêm)" name="basePrice" type="number" value={form.basePrice} onChange={handleChange} onKeyDown={handleKeyDown} error={errors.basePrice} required icon={DollarSign} />
                        </div>
                    </section>

                    {/* 2. SỨC CHỨA & KÍCH THƯỚC */}
                    <section>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                            <InputField label="Sức chứa người lớn" name="maxAdults" type="number" value={form.maxAdults} onChange={handleChange} onKeyDown={handleKeyDown} error={errors.maxAdults} icon={Users} />
                            <InputField label="Sức chứa trẻ em" name="maxChildren" type="number" value={form.maxChildren} onChange={handleChange} onKeyDown={handleKeyDown} icon={Baby} />
                            <InputField label="Kích thước phòng (m²)" name="roomArea" type="number" value={form.roomArea} onChange={handleChange} onKeyDown={handleKeyDown} icon={Ruler} />
                            <InputField label="Loại giường" name="bedType" value={form.bedType} onChange={handleChange} icon={Bed} placeholder="King Bed / Twin Bed" />
                        </div>
                    </section>

                    {/* 3. MÔ TẢ & MARKETING */}
                    <section>
                        <h3 className="text-sm font-bold text-slate-900 mb-4">Mô tả phòng (Marketing)</h3>
                        <div className="space-y-4">
                            {/*<InputField label="Từ khóa chính (SEO)" name="keywords" value={form.keywords} onChange={handleChange} icon={Tag} placeholder="view biển, ban công..." />*/}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Mô tả chi tiết</label>
                                <div className="relative">
                                    <textarea name="description" rows={4} value={form.description} onChange={handleChange} placeholder="Nhập mô tả chi tiết..." className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none outline-none" />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 4. TIỆN ÍCH */}
                    <section>
                        <h3 className="text-sm font-bold text-slate-900 mb-3">Tiện ích</h3>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
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
                            <div className="relative mb-4">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleAddTag} // Bắt phím Enter
                                    placeholder="Thêm tiện ích (nhấn Enter để thêm)..."
                                    className="w-full pl-3 pr-10 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleAddTag()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-blue-500 transition-colors"
                                >
                                    <Plus size={16}/>
                                </button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {SUGGESTED_AMENITIES.map(item => {
                                    const isSelected = form.amenities.includes(item);
                                    return (
                                        <div key={item} onClick={() => toggleSuggestedAmenity(item)}
                                             className={`cursor-pointer text-xs px-3 py-2 rounded border transition-all flex items-center gap-2 ${isSelected ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-100 text-slate-600'}`}>
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

                    {/* 5. THƯ VIỆN ẢNH */}
                    <section>
                        <h3 className="text-sm font-bold text-slate-900 mb-4">Thư viện ảnh</h3>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full min-h-[160px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group"
                        >
                            {previews.length === 0 ? (
                                <div className="text-center space-y-2">
                                    <div className="flex justify-center"><ImagePlus size={32} className="text-slate-300 group-hover:text-blue-500 transition-colors" /></div>
                                    <p className="text-sm font-medium text-slate-600">Kéo thả ảnh vào đây hoặc nhấp để chọn</p>
                                    <p className="text-xs text-slate-400 italic">Hỗ trợ JPG, PNG (Tối đa 10 ảnh, mỗi ảnh ≤ 5MB)</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 md:grid-cols-5 gap-4 p-4 w-full">
                                    {previews.map((url, index) => (
                                        <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 shadow-sm group/img">
                                            <img src={url} alt="Room Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover/img:opacity-100 transition-opacity"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {previews.length < 10 && (
                                        <div className="aspect-video flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400 hover:text-blue-500 hover:border-blue-200 transition-all">
                                            <Plus size={20} />
                                        </div>
                                    )}
                                </div>
                            )}
                            <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleImageChange} />
                        </div>
                    </section>

                </div>

                {/* FOOTER */}
                <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-white rounded-b-xl">
                    <button type="button" onClick={handleClose} className="px-5 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors text-sm flex items-center gap-1">
                        <X size={16}/> Hủy bỏ
                    </button>
                    <button onClick={handleSubmit} disabled={loading} className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors text-sm flex items-center gap-2 shadow-lg shadow-blue-200 disabled:bg-slate-300 disabled:shadow-none">
                        {loading ? <Loader2 className="animate-spin" size={16}/> : <Save size={16} />}
                        Thêm hạng phòng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoomTypeModal;