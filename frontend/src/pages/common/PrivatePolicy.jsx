import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    UserCheck, Lock, Eye, Database, Share2, Printer,
    Clock, ChevronRight, AlertCircle, ArrowUp,
    Server, Smartphone, Globe, ShieldAlert, BadgeCheck
} from 'lucide-react';
import Header from "@/components/common/Homepage/Header.jsx";
import Footer from "@/components/common/Homepage/Footer.jsx";

const PrivacyPolicyPage = () => {
    const navigate = useNavigate();
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [readingProgress, setReadingProgress] = useState(0);

    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = "Chính sách bảo mật chi tiết | HMS-B2B Project";

        const handleScroll = () => {
            // Hiển thị nút Back to Top
            setShowScrollTop(window.scrollY > 400);

            // Tính toán tiến độ đọc
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (window.scrollY / totalHeight) * 100;
            setReadingProgress(progress);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 100;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    const handlePrint = () => window.print();

    return (
        <div className="bg-white min-h-screen flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Thanh tiến độ đọc (Reading Progress) */}
            <div className="fixed top-0 left-0 w-full h-1 z-[60] bg-slate-100">
                <div className="h-full bg-blue-600 transition-all duration-150" style={{ width: `${readingProgress}%` }}></div>
            </div>

            <Header />

            <main className="flex-grow">
                {/* --- 1. HERO SECTION --- */}
                <section className="relative pt-40 pb-24 bg-slate-900 overflow-hidden">
                    <div className="absolute inset-0 opacity-15">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500 rounded-full filter blur-[120px] translate-x-1/3 -translate-y-1/3"></div>
                        <Globe className="absolute left-10 bottom-10 text-white w-96 h-96 opacity-10 animate-pulse" />
                    </div>

                    <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full text-emerald-400 text-[11px] font-black uppercase tracking-[0.2em] mb-8 border border-emerald-500/20">
                            <BadgeCheck size={14} /> Dữ liệu được mã hóa chuẩn
                        </div>
                        <h1 className="text-4xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-tight">
                            Bảo mật dữ liệu <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400">
                                là cam kết sống còn
                            </span>
                        </h1>
                        <p className="text-slate-400 max-w-3xl mx-auto text-xl leading-relaxed font-medium">
                            Chúng tôi hiểu rằng trong ngành B2B, dữ liệu khách hàng và giá cả là tài sản nhạy cảm nhất. HMS-B2B thiết lập tiêu chuẩn bảo mật cao nhất để bảo vệ doanh nghiệp của bạn.
                        </p>
                    </div>
                </section>

                {/* --- 2. LAYOUT NỘI DUNG CHÍNH --- */}
                <section className="py-24 bg-white relative">
                    <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16">

                        {/* Sidebar Navigation (Bên trái) */}
                        <aside className="hidden lg:block lg:col-span-3">
                            <div className="sticky top-32 space-y-10">
                                <div>
                                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Mục lục chi tiết</h3>
                                    <nav className="flex flex-col gap-2">
                                        {[
                                            { id: "section-overview", label: "1. Tổng quan & Cam kết" },
                                            { id: "section-data", label: "2. Loại dữ liệu thu thập" },
                                            { id: "section-method", label: "3. Phương pháp bảo mật" },
                                            { id: "section-sharing", label: "4. Chia sẻ & Đối tác" },
                                            { id: "section-rights", label: "5. Quyền kiểm soát của bạn" },
                                            { id: "section-contact", label: "6. Liên hệ phản hồi" }
                                        ].map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => scrollToSection(item.id)}
                                                className="text-left text-sm font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 p-3 rounded-xl transition-all flex items-center gap-2 group"
                                            >
                                                <div className="w-1 h-1 bg-slate-300 rounded-full group-hover:w-4 group-hover:bg-blue-600 transition-all"></div>
                                                {item.label}
                                            </button>
                                        ))}
                                    </nav>
                                </div>

                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                    <div className="flex items-center gap-2 text-slate-900 font-black text-xs mb-4 uppercase">
                                        <Printer size={16} className="text-blue-600" /> Công cụ tài liệu
                                    </div>
                                    <button onClick={handlePrint} className="w-full py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all active:scale-95 mb-3">
                                        In bản chính sách này
                                    </button>
                                    <button className="w-full py-3 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">
                                        Tải PDF
                                    </button>
                                </div>
                            </div>
                        </aside>

                        {/* Nội dung chi tiết (Bên phải) */}
                        <div className="col-span-1 lg:col-span-9 space-y-24 pb-20">

                            {/* Section: Overview */}
                            <article id="section-overview" className="scroll-mt-32 space-y-8">
                                <div className="flex items-center gap-4 text-slate-400 text-sm">
                                    <Clock size={16} /> Ngày hiệu lực: 01/01/2026
                                </div>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                                    <span className="text-blue-600">01.</span> Tổng quan và Sự tin tưởng
                                </h2>
                                <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
                                    <p className="font-medium text-slate-900">
                                        Chào mừng bạn đến với HMS-B2B. Bằng việc sử dụng nền tảng của chúng tôi, bạn đã đặt trọn lòng tin vào cách chúng tôi quản lý dữ liệu vận hành của bạn.
                                    </p>
                                    <p>
                                        Chúng tôi không chỉ thu thập dữ liệu để vận hành hệ thống, mà còn để tạo ra một môi trường kinh doanh minh bạch. Chính sách này áp dụng cho mọi tương tác của bạn trên website, ứng dụng di động và các cổng API kết nối đối tác.
                                    </p>
                                    <div className="p-6 bg-blue-50 rounded-2xl border-l-4 border-blue-600 italic">
                                        "Chúng tôi cam kết không bao giờ bán, cho thuê hoặc trao đổi dữ liệu định danh khách hàng của bạn cho bên thứ ba vì mục đích quảng cáo."
                                    </div>
                                </div>
                            </article>

                            {/* Section: Data Types */}
                            <article id="section-data" className="scroll-mt-32 space-y-8">
                                <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                                    <span className="text-blue-600">02.</span> Dữ liệu chúng tôi thu thập
                                </h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:border-blue-200 transition-all">
                                        <Smartphone className="text-blue-600 mb-6" size={32} />
                                        <h4 className="font-black text-slate-900 text-xl mb-4 tracking-tight">Dữ liệu cá nhân</h4>
                                        <p className="text-sm text-slate-500 leading-relaxed">
                                            Họ tên, email, số điện thoại, chức vụ, và thông tin định danh doanh nghiệp (Mã số thuế) khi bạn đăng ký tài khoản Đại lý/Khách sạn.
                                        </p>
                                    </div>
                                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:border-blue-200 transition-all">
                                        <Database className="text-blue-600 mb-6" size={32} />
                                        <h4 className="font-black text-slate-900 text-xl mb-4 tracking-tight">Dữ liệu giao dịch</h4>
                                        <p className="text-sm text-slate-500 leading-relaxed">
                                            Lịch sử đặt phòng, thông tin khách lưu trú (nhằm mục đích check-in), chi tiết thanh toán công nợ và hóa đơn tài chính.
                                        </p>
                                    </div>
                                </div>
                            </article>

                            {/* Section: Security Method (PHẦN QUAN TRỌNG ĐỂ TẠO TIN TƯỞNG) */}
                            <article id="section-method" className="scroll-mt-32 space-y-8">
                                <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                                    <span className="text-blue-600">03.</span> Cách chúng tôi bảo vệ bạn
                                </h2>
                                <div className="space-y-6">
                                    <div className="flex gap-6 p-8 rounded-3xl border border-slate-100 hover:shadow-xl hover:shadow-slate-100 transition-all">
                                        <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shrink-0">
                                            <Server size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 mb-2 uppercase text-xs tracking-widest">Hạ tầng lưu trữ</h4>
                                            <p className="text-slate-500 text-sm">Dữ liệu được lưu trữ trên nền tảng Cloud tiên tiến (AWS/Google Cloud) với hệ thống tường lửa đa tầng và tự động sao lưu mỗi 6 tiếng.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-6 p-8 rounded-3xl border border-slate-100 hover:shadow-xl hover:shadow-slate-100 transition-all">
                                        <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shrink-0">
                                            <Lock size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 mb-2 uppercase text-xs tracking-widest">Mã hóa đầu cuối</h4>
                                            <p className="text-slate-500 text-sm">Mọi thông tin truyền tải giữa thiết bị của bạn và máy chủ đều qua giao thức HTTPS/TLS 1.3. Mật khẩu khách hàng được mã hóa một chiều (Bcrypt).</p>
                                        </div>
                                    </div>
                                </div>
                            </article>

                            {/* Section: Sharing */}
                            <article id="section-sharing" className="scroll-mt-32 space-y-8">
                                <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                                    <span className="text-blue-600">04.</span> Chia sẻ dữ liệu với bên thứ ba
                                </h2>
                                <p className="text-slate-600 text-lg leading-relaxed">
                                    Để hoàn tất dịch vụ du lịch, chúng tôi buộc phải chia sẻ thông tin trong các trường hợp:
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">!</div>
                                        <p className="text-sm text-slate-600"><strong>Với Khách sạn/Chỗ nghỉ:</strong> Cung cấp tên khách hàng và chi tiết đặt phòng để đảm bảo việc nhận phòng (Check-in).</p>
                                    </div>
                                    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">!</div>
                                        <p className="text-sm text-slate-600"><strong>Với Cơ quan pháp luật:</strong> Chỉ cung cấp khi có yêu cầu bằng văn bản chính thức phục vụ mục đích điều tra theo quy định pháp luật Việt Nam.</p>
                                    </div>
                                </div>
                            </article>

                            {/* Section: Rights */}
                            <article id="section-rights" className="scroll-mt-32 space-y-8">
                                <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                                    <span className="text-blue-600">05.</span> Quyền kiểm soát dữ liệu của bạn
                                </h2>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-blue-600 font-black text-xs uppercase">
                                            <UserCheck size={18} /> Quyền được biết
                                        </div>
                                        <p className="text-sm text-slate-500">Bạn có quyền yêu cầu trích xuất toàn bộ lịch sử dữ liệu mà hệ thống đang lưu giữ liên quan đến tài khoản của bạn.</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-rose-600 font-black text-xs uppercase">
                                            <ShieldAlert size={18} /> Quyền được xóa
                                        </div>
                                        <p className="text-sm text-slate-500">Khi ngừng hợp tác, bạn có quyền yêu cầu xóa vĩnh viễn dữ liệu (trừ dữ liệu hóa đơn cần lưu trữ theo luật kế toán).</p>
                                    </div>
                                </div>
                            </article>

                        </div>
                    </div>
                </section>

                {/* --- 3. CALL TO ACTION --- */}
                <section id="section-contact" className="py-24 bg-slate-900 relative overflow-hidden">
                    <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-12">
                        <div className="space-y-4">
                            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter">Liên hệ Ban Quản Trị Bảo Mật</h2>
                            <p className="text-slate-400 text-lg">Nếu bạn phát hiện lỗ hổng bảo mật hoặc có khiếu nại về dữ liệu cá nhân, hãy liên hệ ngay với chúng tôi.</p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-6">
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Email hỗ trợ</span>
                                <a href="mailto:security@hms-b2b.id.vn" className="text-2xl font-bold text-white hover:text-blue-400 transition-colors underline decoration-blue-500 underline-offset-8">security@hms-b2b.id.vn</a>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate("/homepage")}
                            className="bg-white text-slate-900 px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-600 hover:text-white transition-all active:scale-95 flex items-center gap-3 mx-auto shadow-2xl"
                        >
                            Quay lại trang chủ <ChevronRight size={18} />
                        </button>
                    </div>
                </section>
            </main>

            {/* Back to Top Button */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={`fixed bottom-10 right-10 p-4 bg-blue-600 text-white rounded-full shadow-2xl transition-all duration-300 z-50 hover:bg-blue-700 active:scale-90 ${showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
            >
                <ArrowUp size={24} />
            </button>

            <Footer />
        </div>
    );
};

export default PrivacyPolicyPage;