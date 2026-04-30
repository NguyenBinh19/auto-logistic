import { useState } from "react";
import { Save, Hotel, MapPin, Upload, X, Info, Plus, Check, ImagePlus, ShieldCheck, CheckCircle2, Edit3 } from "lucide-react";
import { DEMO_HOTEL } from "../mockData";

const DemoProfile = () => {
    const [formData, setFormData] = useState({ ...DEMO_HOTEL });
    const [showSuccessBanner, setShowSuccessBanner] = useState(false);
    const [customAmenity, setCustomAmenity] = useState("");
    const [images, setImages] = useState([
        { id: 1, url: null }, { id: 2, url: null }, { id: 3, url: null }
    ]);

    const handleSave = () => {
        setShowSuccessBanner(true);
        setTimeout(() => setShowSuccessBanner(false), 3000);
    };

    const toggleAmenity = (name) => {
        setFormData((prev) => ({
            ...prev,
            amenities: prev.amenities.includes(name)
                ? prev.amenities.filter((a) => a !== name)
                : [...prev.amenities, name],
        }));
    };

    const addCustomAmenity = () => {
        if (!customAmenity.trim() || formData.amenities.includes(customAmenity.trim())) return;
        setFormData((prev) => ({ ...prev, amenities: [...prev.amenities, customAmenity.trim()] }));
        setCustomAmenity("");
    };

    return (
        <div className="bg-[#F8FAFC] min-h-screen p-6 md:p-10 font-sans text-slate-900">
            <div className="max-w-6xl mx-auto space-y-6">

                {showSuccessBanner && (
                    <div className="mb-6 bg-emerald-500 text-white p-4 rounded-2xl shadow-lg flex items-center gap-3 animate-in fade-in">
                        <Check className="bg-white/20 p-1 rounded-full" size={20} />
                        <p className="text-sm font-bold uppercase tracking-tight">Ho so khach san da duoc cap nhat! (Demo)</p>
                    </div>
                )}

                {/* Header card */}
                <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <Hotel size={32} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black uppercase tracking-tight text-slate-800">{formData.hotelName}</h1>
                            <p className="text-xs text-slate-400 font-bold flex items-center gap-1 mt-1">
                                <MapPin size={12} /> {formData.city}, {formData.country}
                            </p>
                        </div>
                    </div>
                    <button onClick={handleSave} className="w-full md:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 transition-all active:scale-95">
                        <Save size={18} /> Cap nhat thong tin
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left column: Form */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                            <h3 className="text-blue-600 font-black uppercase text-[11px] tracking-[0.2em] mb-8 flex items-center gap-2"><Info size={16} /> Thong tin chung</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Ten khach san" value={formData.hotelName} onChange={(v) => setFormData({ ...formData, hotelName: v })} />
                                <InputField label="So dien thoai" value={formData.phone} onChange={(v) => setFormData({ ...formData, phone: v })} />
                                <InputField label="Email" value={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} />
                                <InputField label="Thanh pho" value={formData.city} onChange={(v) => setFormData({ ...formData, city: v })} />
                                <div className="md:col-span-2">
                                    <InputField label="Dia chi chi tiet" value={formData.address} onChange={(v) => setFormData({ ...formData, address: v })} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Mo ta khach san</label>
                                    <textarea className="w-full h-32 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 outline-none text-sm font-medium transition-all" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                            <h3 className="text-blue-600 font-black uppercase text-[11px] tracking-[0.2em] mb-6">Tien ich</h3>
                            <div className="flex gap-2 mb-6">
                                <input type="text" placeholder="Them tien ich..." className="flex-1 px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-blue-600" value={customAmenity} onChange={(e) => setCustomAmenity(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCustomAmenity()} />
                                <button onClick={addCustomAmenity} className="bg-blue-600 text-white px-5 rounded-xl hover:bg-blue-700 transition-all"><Plus size={20} /></button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.amenities.map((item) => (
                                    <button key={item} onClick={() => toggleAmenity(item)} className="px-4 py-2 bg-blue-50 text-blue-600 border-2 border-blue-100 rounded-xl text-[11px] font-black uppercase flex items-center gap-2">
                                        {item} <X size={14} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right column: Images & KYC */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-black text-[11px] uppercase tracking-widest text-slate-800">Album anh ({images.length})</h3>
                                <label className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center cursor-pointer hover:bg-blue-600 hover:text-white transition-all">
                                    <Upload size={18} />
                                </label>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {images.map((img) => (
                                    <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-50 flex items-center justify-center text-slate-300">
                                        <ImagePlus size={24} />
                                    </div>
                                ))}
                                <div className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-300 hover:border-blue-400 hover:text-blue-400 cursor-pointer transition-colors">
                                    <Plus size={24} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 text-slate-800/30"><ShieldCheck size={100} /></div>
                            <div className="flex justify-between items-center mb-6 relative z-10">
                                <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                    <CheckCircle2 size={16} /> Xac thuc phap ly
                                </h3>
                                <button className="flex items-center gap-1.5 text-[9px] font-black text-white bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-all uppercase">
                                    <Edit3 size={12} /> Sua KYC
                                </button>
                            </div>
                            <div className="space-y-4 relative z-10">
                                <ReadOnlyItem label="Ma so thue" value="0315678901" />
                                <ReadOnlyItem label="So giay phep KD" value="41/GP-KD" />
                                <ReadOnlyItem label="Nguoi dai dien" value="Nguyen Van A" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InputField = ({ label, value, onChange, error }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={`w-full px-5 py-3.5 bg-slate-50 border-2 rounded-2xl outline-none transition-all font-bold text-sm text-slate-700 ${error ? "border-rose-500 focus:border-rose-600" : "border-slate-100 focus:border-blue-600"}`} />
        {error && <p className="text-[10px] text-rose-500 font-bold italic ml-2">{error}</p>}
    </div>
);

const ReadOnlyItem = ({ label, value }) => (
    <div>
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-bold text-slate-200">{value || "---"}</p>
    </div>
);

export default DemoProfile;
