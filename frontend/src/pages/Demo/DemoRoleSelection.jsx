import React, { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Building2, Hotel, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import Header from "@/components/common/Homepage/Header.jsx";
import Footer from "@/components/common/Homepage/Footer.jsx";

const DemoRoleSelection = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = "Trải nghiệm | HMS-B2B Project";
    }, []);

    const roles = [
        {
            id: "agency",
            title: "Quản lý Đại lý ",
            description: "Trải nghiệm giao diện đặt phòng, quản lý hạn mức tín dụng và danh sách đơn hàng dành cho đại lý du lịch.",
            icon: <Building2 size={40} className="text-blue-600" />,
            path: "/demo-agency/dashboard",
            color: "bg-blue-50",
            hoverBorder: "hover:border-blue-500"
        },
        {
            id: "hotel",
            title: "Chủ khách sạn ",
            description: "Khám phá công cụ quản lý phòng, duyệt đơn đặt phòng và theo dõi doanh thu thực tế của khách sạn.",
            icon: <Hotel size={40} className="text-amber-600" />,
            path: "/demo/hotel/dashboard",
            color: "bg-amber-50",
            hoverBorder: "hover:border-amber-500"
        }
    ];

    const handleSelectRole = (role) => {
        localStorage.setItem("isDemoMode", "true");
        localStorage.setItem("demoRole", role.id);
        navigate(role.path);
    };

    return (
        <div className="bg-white min-h-screen flex flex-col font-sans">
            {/* --- HEADER --- */}
            <Header />

            <main className="flex-grow">
                {/* --- HERO SECTION (Style tương tự ContactPage) --- */}
                <section className="relative py-20 bg-slate-900 overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/4"></div>
                        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-500 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/4"></div>
                    </div>

                    <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-6 border border-blue-500/20">
                            <span>Chế độ trải nghiệm dùng thử</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter">
                            Chọn vai trò bạn muốn <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Trải nghiệm</span>
                        </h1>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
                            Hệ thống sẽ cung cấp dữ liệu mô phỏng tương ứng với vai trò bạn chọn để bạn có cái nhìn tổng quan nhất về tính năng.
                        </p>
                    </div>
                </section>

                {/* --- ROLE CARDS SECTION --- */}
                <section className="py-16 container mx-auto px-6 -mt-10 relative z-20">
                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {roles.map((role) => (
                            <div
                                key={role.id}
                                onClick={() => handleSelectRole(role)}
                                className={`group relative bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden ${role.hoverBorder}`}
                            >
                                {/* Background Decor */}
                                <div className={`absolute top-0 right-0 w-32 h-32 ${role.color} opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-[5rem] -z-10`}></div>

                                <div className={`${role.color} w-20 h-20 rounded-3xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                                    {role.icon}
                                </div>

                                <h3 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
                                    {role.title}
                                    <ArrowRight size={24} className="text-blue-500 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                </h3>

                                <p className="text-slate-500 leading-relaxed font-medium mb-8">
                                    {role.description}
                                </p>

                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest pt-6 border-t border-slate-50">
                                    <ShieldCheck size={14} className="text-emerald-500" />
                                    <span>Truy cập tức thì • Không cần đăng ký</span>
                                </div>
                            </div>
                        ))}
                    </div>

                </section>
            </main>

            {/* --- FOOTER --- */}
            <Footer />
        </div>
    );
};

export default DemoRoleSelection;