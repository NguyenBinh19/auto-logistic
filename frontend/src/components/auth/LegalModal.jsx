import React, { useEffect, useMemo } from "react";
import { X, ShieldCheck, FileText } from "lucide-react";

// Ảnh cho Điều khoản dịch vụ (Ví dụ: Văn phòng, bắt tay hợp tác)
const IMG_TERMS = "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop";
// Ảnh cho Chính sách bảo mật (Ví dụ: Khóa số, bảo mật dữ liệu)
const IMG_PRIVACY = "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1470&auto=format&fit=crop";

const LegalModal = ({ isOpen, onClose, title, type, children }) => {
  // Khóa scroll body khi modal mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Thêm padding-right để tránh layout shift khi scrollbar biến mất trên một số trình duyệt
      document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
    } else {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    }
    return () => {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    };
  }, [isOpen]);

  // Chọn ảnh và cấu hình dựa trên type (Dùng useMemo để tối ưu)
  const modalConfig = useMemo(() => {
    if (type === 'terms') {
      return {
        icon: <FileText size={24} />,
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-600',
        image: IMG_TERMS,
        imageOverlay: 'from-blue-900/40 to-slate-900/10' // Gradient phủ lên ảnh
      };
    } else {
      return {
        icon: <ShieldCheck size={24} />,
        bgColor: 'bg-emerald-100',
        textColor: 'text-emerald-600',
        image: IMG_PRIVACY,
        imageOverlay: 'from-emerald-900/40 to-slate-900/10'
      };
    }
  }, [type]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fade-in" 
        onClick={onClose}
      ></div>

      {/* Modal Container - Mở rộng max-width lên 4xl để chứa 2 cột */}
      <div className="relative bg-white rounded-[1.5rem] shadow-2xl w-full max-w-[900px] max-h-[85vh] flex flex-col animate-zoom-in overflow-hidden border border-slate-100">
        
        {/* === Header === */}
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-100 bg-white z-10 relative">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${modalConfig.bgColor} ${modalConfig.textColor}`}>
                {modalConfig.icon}
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">{title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all"
          >
            <X size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* === Main Body (Split Layout) === */}
        <div className="flex flex-1 overflow-hidden relative">
            
            {/* Left Column: Scrollable Text Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 bg-white relative z-10">
               {/* Thêm một lớp trang trí mờ */}
               <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:12px_12px]"></div>
               <div className="relative">
                  {children}
               </div>
            </div>

            {/* Right Column: Image Panel (Ẩn trên mobile) */}
            <div className="hidden md:block w-2/5 relative overflow-hidden bg-slate-100 border-l border-slate-100">
                 <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                    style={{ backgroundImage: `url(${modalConfig.image})` }}
                 />
                 {/* Lớp phủ Gradient để làm nổi bật nội dung và tạo chiều sâu */}
                 <div className={`absolute inset-0 bg-gradient-to-t ${modalConfig.imageOverlay} mix-blend-multiply`} />
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/20" /> {/* Fade nhẹ ở đáy */}
            </div>
        </div>

        {/* === Footer === */}
        <div className="p-5 md:p-6 border-t border-slate-100 bg-slate-50/80 flex justify-between items-center z-10 relative backdrop-blur-md">
          <span className="text-xs font-medium text-slate-400 hidden sm:block">
              Vui lòng đọc kỹ trước khi đồng ý.
          </span>
          <button 
            onClick={onClose}
            // Sử dụng màu tương ứng với loại modal cho nút bấm
            className={`px-6 py-3 ${type === 'terms' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2`}
          >
            <span>Đã hiểu & Đồng ý</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Animation styles (Nếu chưa có trong globals.css) */}
      <style>{`
        .animate-fade-in { animation: fadeIn 0.2s ease-out; }
        .animate-zoom-in { animation: zoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
    </div>
  );
};

export default LegalModal;