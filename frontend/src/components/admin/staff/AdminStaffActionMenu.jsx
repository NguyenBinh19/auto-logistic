import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit3, UserSearch, ShieldAlert } from 'lucide-react';

const StaffActionMenu = ({ onEdit, onViewDetails, isFullAdmin }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [openUp, setOpenUp] = useState(false);
    const menuRef = useRef(null);

    const toggleMenu = (e) => {
        if (!isOpen) {
            const rect = e.currentTarget.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            // Nếu không đủ 200px bên dưới thì mở lên trên
            setOpenUp(spaceBelow < 200);
        }
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Định nghĩa danh sách hành động dựa trên quyền
    const actions = [
        {
            label: 'Xem chi tiết',
            icon: <UserSearch size={16} />,
            onClick: onViewDetails,
            show: true // Luôn hiển thị
        },
        {
            label: 'Chỉnh sửa thông tin',
            icon: <Edit3 size={16} />,
            onClick: onEdit,
            show: isFullAdmin // CHỈ HIỆN NẾU LÀ ADMIN TỔNG
        },
    ];

    return (
        <div className="relative inline-block text-left" ref={menuRef}>
            <button
                onClick={toggleMenu}
                className={`p-2 rounded-lg transition-all ${
                    isOpen ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-100 text-slate-400'
                }`}
            >
                <MoreVertical size={18} />
            </button>

            {isOpen && (
                <div
                    className={`absolute right-0 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[999] overflow-hidden animate-in fade-in zoom-in duration-150 
                        ${openUp ? 'bottom-full mb-2 origin-bottom-right' : 'top-full mt-2 origin-top-right'}`}
                >
                    <div className="py-1">
                        {actions.map((action, index) => {
                            if (!action.show) return null; // Không render nếu không có quyền

                            return (
                                <button
                                    key={index}
                                    onClick={() => {
                                        action.onClick();
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    <span className="text-slate-400">{action.icon}</span>
                                    {action.label}
                                </button>
                            );
                        })}

                        {/* Thông báo nhỏ nếu là nhân viên (Optional) */}
                        {!isFullAdmin && (
                            <div className="px-4 py-2 mt-1 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                                <ShieldAlert size={12} className="text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Quyền hạn hạn chế</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffActionMenu;