import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Phone,
    Mail,
    MapPin,
    ArrowRight,
    Clock,
    MessageSquare,
    Globe,
    AlertCircle,
    Send
} from 'lucide-react';
import Header from "@/components/common/Homepage/Header.jsx";
import Footer from "@/components/common/Homepage/Footer.jsx";
import SupportModal from "@/components/common/Homepage/SupportModal.jsx";

const ContactPage = () => {
    const navigate = useNavigate();
    const [mapError, setMapError] = useState(false);
    const [isSupportOpen, setIsSupportOpen] = useState(false);
    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = "Liên hệ | HMS-B2B Project";
    }, []);

    const contactInfo = {
        hotline: "024 7300 5588",
        email: "bookingsphere@gmail.com",
        address: "Khu Công nghệ cao Hòa Lạc, Thạch Thất, Hà Nội",
        workingHours: "Thứ 2 - Thứ 6: 08:30 - 17:30"
    };

    return (
        <div className="bg-white min-h-screen flex flex-col font-sans">
            <Header />

            <main className="flex-grow">
                {/* --- 1. HERO SECTION --- */}
                <section className="relative py-24 bg-slate-900 overflow-hidden">
                    <div className="absolute inset-0 opacity-20">

                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/4"></div>
                        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/4"></div>
                    </div>

                    <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
                        <span className="text-blue-400 font-black tracking-[0.4em] uppercase text-[10px] mb-4 block">
                            FPT University Graduation Project
                        </span>
                        <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter">
                            Gắn kết để <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Vươn xa</span>
                        </h1>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
                            Chúng tôi luôn sẵn sàng lắng nghe các ý kiến đóng góp và đề xuất hợp tác từ các đối tác khách sạn trên khắp Việt Nam.
                        </p>
                    </div>
                </section>

                {/* --- 2. CONTACT CARDS --- */}
                <section className="py-12 container mx-auto px-6 -mt-16 relative z-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Hotline Card */}
                        <a href={`tel:${contactInfo.hotline.replace(/\s/g, '')}`}
                           className="group bg-white/80 backdrop-blur-lg p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-white hover:border-blue-600 transition-all duration-500">
                            <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                                <Phone size={24} />
                            </div>
                            <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-3">Hotline 24/7</h3>
                            <p className="text-2xl font-black text-slate-900 tracking-tighter group-hover:text-blue-600 transition-colors">{contactInfo.hotline}</p>
                            <p className="text-sm text-slate-400 mt-2 font-medium italic">Nhấn để gọi trực tiếp</p>
                        </a>

                        {/* Email Card */}
                        <a href={`mailto:${contactInfo.email}`}
                           className="group bg-white/80 backdrop-blur-lg p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-white hover:border-blue-600 transition-all duration-500">
                            <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-slate-900/30 group-hover:scale-110 transition-transform">
                                <Mail size={24} />
                            </div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Gửi Email</h3>
                            <p className="text-lg font-bold text-slate-900 break-all underline decoration-slate-200">{contactInfo.email}</p>
                            <p className="text-sm text-slate-400 mt-2 font-medium italic">Chúng tôi phản hồi sớm nhất</p>
                        </a>

                        {/* Office Card */}
                        <div className="bg-white/80 backdrop-blur-lg p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-white transition-all duration-500 hover:shadow-2xl">
                            <div className="w-14 h-14 bg-slate-100 text-slate-900 rounded-2xl flex items-center justify-center mb-8">
                                <MapPin size={24} />
                            </div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Văn phòng</h3>
                            <p className="text-slate-700 font-bold leading-tight">{contactInfo.address}</p>
                            <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                                <Clock size={12} /> {contactInfo.workingHours}
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- 3. INTERACTION SECTION: Map & CTA --- */}
                <section className="py-20 container mx-auto px-6">
                    <div className="bg-slate-900 rounded-[4rem] overflow-hidden grid lg:grid-cols-2 shadow-2xl">

                        {/* Google Maps Integration  */}
                        <div className="h-[500px] lg:h-auto bg-slate-800 relative">
                            {mapError ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center bg-slate-800">
                                    <AlertCircle size={48} className="text-slate-600 mb-4" />
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Bản đồ đang cập nhật</p>
                                </div>
                            ) : (
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.506341935394!2d105.52271427503094!3d21.012416680632863!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31345b465a4e65fb%3A0xaae60567ad023452!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBGUFQgSMOgIE7hu5lp!5e0!3m2!1svi!2s!4v1709280000000!5m2!1svi!2s"
                                    className="w-full h-full border-0 opacity-100 transition-opacity duration-700"
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    onError={() => setMapError(true)}
                                    title="FPT University Location"
                                ></iframe>
                            )}
                        </div>

                        {/* CTA / Support Form Trigger */}
                        <div className="p-12 md:p-20 flex flex-col justify-center border-l border-slate-800">
                            <div className="w-12 h-1 bg-blue-600 mb-10"></div>
                            <h2 className="text-4xl font-black text-white mb-8 tracking-tighter leading-tight">
                                Giải quyết mọi phiền toái <br/> trong vận hành
                            </h2>
                            <p className="text-slate-400 mb-12 text-lg leading-relaxed font-medium">
                                Đội ngũ sinh viên nhiệt huyết từ ĐH FPT cam kết đồng hành và hỗ trợ các chủ khách sạn
                                tối ưu hóa quy trình kinh doanh bằng công nghệ thuần Việt.
                            </p>

                            <button
                                onClick={() => setIsSupportOpen(true)}
                                className="group w-full md:w-fit bg-blue-600 text-white px-12 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-white hover:text-slate-900 transition-all duration-500 shadow-2xl active:scale-95"
                            >
                                Gửi lời nhắn cho nhóm <Send size={16}
                                                            className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"/>
                            </button>

                            <div className="mt-12 pt-12 border-t border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-none">Team
                                        hỗ trợ 24/7</p>
                                </div>
                                <Globe size={20} className="text-slate-800 animate-spin-slow"/>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <SupportModal
                isOpen={isSupportOpen}
                onClose={() => setIsSupportOpen(false)}
            />
            <Footer/>
        </div>
    );
};

export default ContactPage;