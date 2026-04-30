import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Users, X, ArrowRight } from "lucide-react";

const ROLES = [
    {
        id: "hotel",
        label: "Hotel Owner",
        sublabel: "Chủ khách sạn",
        icon: <Building2 size={32} />,
        color: "from-orange-500 to-amber-500",
        available: true,
        path: "/demo/hotel/dashboard",
    },
    {
        id: "agency",
        label: "Agency Manager",
        sublabel: "Quản lý đại lý",
        icon: <Users size={32} />,
        color: "from-green-500 to-emerald-500",
        available: true,
        path: "/demo-agency/dashboard",
    },
];

const DemoRoleSelect = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [hoveredRole, setHoveredRole] = useState(null);

    if (!isOpen) return null;

    const handleSelectRole = (role) => {
        if (!role.available) return;
        onClose();
        navigate(role.path);
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
                onClick={onClose}
            />
            <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all z-10"
                >
                    <X size={24} />
                </button>

                <div className="p-10 md:p-16">
                    <div className="text-center mb-12">
                        <span className="text-blue-600 font-black text-[10px] tracking-[0.3em] uppercase mb-3 block">
                            Demo Mode
                        </span>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-3">
                            Chọn vai trò trải nghiệm
                        </h2>
                        <p className="text-slate-400 text-sm font-medium">
                            Đây là bản mô phỏng. Không có dữ liệu nào được lưu lại.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {ROLES.map((role) => (
                            <button
                                key={role.id}
                                onClick={() => handleSelectRole(role)}
                                onMouseEnter={() => setHoveredRole(role.id)}
                                onMouseLeave={() => setHoveredRole(null)}
                                disabled={!role.available}
                                className={`relative p-8 rounded-3xl border-2 text-left transition-all duration-300 group ${
                                    role.available
                                        ? "border-slate-100 hover:border-blue-500 hover:shadow-xl cursor-pointer"
                                        : "border-slate-100 opacity-50 cursor-not-allowed"
                                }`}
                            >
                                <div
                                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${role.color} text-white flex items-center justify-center mb-6 shadow-lg ${
                                        role.available
                                            ? "group-hover:scale-110"
                                            : ""
                                    } transition-transform`}
                                >
                                    {role.icon}
                                </div>
                                <h3 className="text-lg font-black text-slate-900 mb-1">
                                    {role.label}
                                </h3>
                                <p className="text-sm text-slate-400 font-medium">
                                    {role.sublabel}
                                </p>
                                {!role.available && (
                                    <span className="absolute top-6 right-6 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                                        Sắp ra mắt
                                    </span>
                                )}
                                {role.available &&
                                    hoveredRole === role.id && (
                                        <div className="absolute bottom-6 right-6 text-blue-600">
                                            <ArrowRight size={20} />
                                        </div>
                                    )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DemoRoleSelect;
