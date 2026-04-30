import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    ShieldCheck,
    CreditCard,
    Scale,
    AlertTriangle,
    UserX,
    Printer,
    ArrowUp,
    Info,
    CheckCircle2,
    Calendar,
    ExternalLink,
    Clock,
    Gavel,
    Lock
} from 'lucide-react';

import Header from "@/components/common/Homepage/Header.jsx";
import Footer from "@/components/common/Homepage/Footer.jsx";

const TermsOfServicePage = () => {
    const navigate = useNavigate();
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [readingProgress, setReadingProgress] = useState(0);

    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = "Điều khoản Dịch vụ | HMS-B2B Platform";

        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400);
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
                behavior: "smooth"
            });
        }
    };

    return (
        <div className="bg-[#f8fafc] min-h-screen flex flex-col font-sans selection:bg-blue-100">
            {/* PROGRESS BAR */}
            <div className="fixed top-0 left-0 w-full h-1 z-[100] bg-slate-200">
                <div
                    className="h-full bg-blue-600 transition-all duration-150"
                    style={{ width: `${readingProgress}%` }}
                />
            </div>

            <Header />

            <main className="flex-grow pt-0 pb-20">
                {/* HERO SECTION */}
                <section className="bg-white border-b border-slate-200 py-20 mb-12">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div className="max-w-3xl">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-blue-100">
                                    <ShieldCheck size={14} /> Văn bản pháp lý chính thức
                                </div>
                                <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-6">
                                    Điều khoản <span className="text-blue-600">Dịch vụ</span>
                                </h1>
                                <p className="text-slate-500 text-xl leading-relaxed font-medium">
                                    Văn bản này thiết lập các thỏa thuận pháp lý giữa nền tảng HMS-B2B và Đối tác (Đại lý/Khách sạn) về việc sử dụng dịch vụ và quản lý công nợ.
                                </p>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center">
                                <Calendar className="text-blue-600 mb-2" size={24} />
                                <span className="text-slate-400 text-xs font-bold uppercase">Cập nhật lần cuối</span>
                                <span className="text-slate-900 font-bold">15/01/2026</span>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12">
                    {/* SIDEBAR NAVIGATION */}
                    <aside className="hidden lg:block lg:col-span-3">
                        <div className="sticky top-32 space-y-8">
                            <nav className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100 space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-3">Mục lục chi tiết</p>
                                {[
                                    { id: "section-1", label: "1. Quy định chung", icon: <Info size={16}/> },
                                    { id: "section-2", label: "2. Tài khoản & Bảo mật", icon: <Lock size={16}/> },
                                    { id: "section-3", label: "3. Tài chính & Công nợ", icon: <CreditCard size={16}/> },
                                    { id: "section-4", label: "4. Chính sách Hoàn/Hủy", icon: <UserX size={16}/> },
                                    { id: "section-5", label: "5. Sở hữu trí tuệ", icon: <Scale size={16}/> },
                                    { id: "section-6", label: "6. Trách nhiệm pháp lý", icon: <AlertTriangle size={16}/> },
                                    { id: "section-7", label: "7. Giải quyết tranh chấp", icon: <Gavel size={16}/> },
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => scrollToSection(item.id)}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all group"
                                    >
                                        <span className="text-slate-400 group-hover:text-blue-600">{item.icon}</span>
                                        {item.label}
                                    </button>
                                ))}
                            </nav>

                            <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                                <div className="relative z-10">
                                    <h4 className="font-black text-lg mb-2">Bản cứng PDF</h4>
                                    <p className="text-slate-400 text-xs mb-6 leading-relaxed">Tải tài liệu bao gồm Phụ lục chính sách tín dụng chi tiết.</p>
                                    <button
                                        onClick={() => window.print()}
                                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-transform active:scale-95"
                                    >
                                        <Printer size={16}/> XUẤT FILE PDF
                                    </button>
                                </div>
                                <FileText className="absolute -bottom-4 -right-4 text-white/5 w-32 h-32" />
                            </div>
                        </div>
                    </aside>

                    {/* MAIN CONTENT AREA */}
                    <div className="col-span-1 lg:col-span-9 space-y-12">
                        {/* QUICK SUMMARY BOX */}
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[3rem] p-10 md:p-14 text-white shadow-lg shadow-blue-200">
                            <h3 className="text-3xl font-black mb-8 tracking-tight">Tóm lược "3 ĐÚNG" cho Đối tác</h3>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/20">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-4 font-bold">1</div>
                                    <p className="font-bold text-lg mb-2">Đúng Thông Tin</p>
                                    <p className="text-white/70 text-sm">Thông tin khách hàng chính xác để đảm bảo hiệu lực của Voucher.</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/20">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-4 font-bold">2</div>
                                    <p className="font-bold text-lg mb-2">Đúng Hạn Mức</p>
                                    <p className="text-white/70 text-sm">Theo dõi sát sao Credit Limit để tránh bị gián đoạn đặt phòng.</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/20">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-4 font-bold">3</div>
                                    <p className="font-bold text-lg mb-2">Đúng Chính Sách</p>
                                    <p className="text-white/70 text-sm">Nắm rõ quy định hoàn hủy của từng khách sạn trước khi xác nhận.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[4rem] p-8 md:p-16 shadow-sm border border-slate-100 space-y-24">
                            {/* SECTION 1 */}
                            <section id="section-1" className="scroll-mt-32">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl">01</div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Quy định chung</h2>
                                </div>
                                <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
                                    <p>Nền tảng <strong>HMS-B2B</strong> (sau đây gọi là "Hệ thống") là tài sản trí tuệ và được vận hành bởi dự án cùng tên, nhằm kết nối các Cơ sở lưu trú và Đại lý du lịch chuyên nghiệp.</p>
                                    <p>Bằng việc đăng ký tài khoản và truy cập hệ thống, Đối tác xác nhận đã đọc, hiểu và đồng ý bị ràng buộc bởi các Điều khoản này cùng các Phụ lục kèm theo.</p>
                                    <div className="p-6 bg-slate-50 rounded-3xl border-l-4 border-blue-600">
                                        <p className="text-sm font-medium italic">"Mọi giao dịch xác nhận đơn đặt (Booking) thông qua tài khoản của Đối tác được coi là một hợp đồng kinh tế có hiệu lực pháp lý tức thì giữa Đối tác và Nhà cung cấp dịch vụ."</p>
                                    </div>
                                </div>
                            </section>

                            {/* SECTION 2 */}
                            <section id="section-2" className="scroll-mt-32">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl">02</div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Tài khoản và bảo mật</h2>
                                </div>
                                <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
                                    <p>
                                        Đại lý phải cung cấp thông tin chính xác khi đăng ký tài khoản
                                        bao gồm tên doanh nghiệp, mã số thuế và người đại diện.
                                    </p>
                                    <p>
                                        Mọi giao dịch phát sinh từ tài khoản được xem là hợp lệ
                                        và đại lý có trách nhiệm thanh toán cho các đơn hàng đó.
                                    </p>
                                    <p>
                                        HMS-B2B có quyền khóa tài khoản nếu phát hiện hành vi gian lận
                                        hoặc truy cập trái phép.
                                    </p>
                                </div>
                            </section>

                            {/* SECTION 3 - IMPORTANT FINANCE SECTION */}
                            <section id="section-3" className="scroll-mt-32">
                                <div className="flex items-center gap-4 mb-8">
                                    <div
                                        className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl">03
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Tài chính & Thanh
                                        toán công nợ</h2>
                                </div>
                                <div className="space-y-8">
                                    <p className="text-slate-600 text-lg">Hệ thống áp dụng cơ chế quản lý công nợ tập trung để hỗ trợ dòng tiền cho Đối tác:</p>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100">
                                            <CreditCard className="text-blue-600 mb-4" size={32} />
                                            <h4 className="font-black text-slate-900 mb-3">Hạn mức tín dụng (Credit Limit)</h4>
                                            <p className="text-slate-600 text-sm leading-relaxed">Đối tác được cấp một hạn mức nợ dựa trên kết quả thẩm định. Nếu tổng dư nợ đạt ngưỡng 100%, hệ thống sẽ tự động tạm dừng tính năng đặt phòng cho đến khi khoản Top-up được ghi nhận.</p>
                                        </div>
                                        <div className="p-8 bg-rose-50/50 rounded-[2.5rem] border border-rose-100">
                                            <Clock className="text-rose-600 mb-4" size={32} />
                                            <h4 className="font-black text-slate-900 mb-3">Thời gian ân hạn 15 ngày</h4>
                                            <p className="text-slate-600 text-sm leading-relaxed">Sau mỗi chu kỳ chốt công nợ vào ngày 02 hàng tháng, Đối tác có 15 ngày làm việc để thanh toán. Sau thời gian này, lãi chậm trả sẽ được tính theo quy định của Luật Thương mại.</p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] flex items-start gap-6">
                                        <AlertTriangle className="text-amber-400 shrink-0" size={28} />
                                        <div>
                                            <h5 className="font-bold mb-2 uppercase tracking-widest text-xs text-slate-400">Cảnh báo nợ xấu</h5>
                                            <p className="text-sm text-slate-300 leading-relaxed">Các khoản nợ quá hạn trên 30 ngày sẽ dẫn đến việc đình chỉ tài khoản vĩnh viễn và chuyển giao hồ sơ cho bộ phận thu hồi nợ pháp lý.</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* SECTION 4 */}
                            <section id="section-4" className="scroll-mt-32">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl">04</div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Chính sách Hoàn/Hủy & No-show</h2>
                                </div>
                                <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
                                    <ul className="space-y-4">
                                        <li className="flex gap-4">
                                            <CheckCircle2 className="text-emerald-500 shrink-0 mt-1" size={20} />
                                            <span><strong>Điều kiện hủy:</strong> Phụ thuộc vào chính sách riêng của từng Khách sạn/NCC tại thời điểm đặt. Đối tác có nghĩa vụ kiểm tra kỹ "Cancellation Policy" trước khi Confirm.</span>
                                        </li>
                                        <li className="flex gap-4">
                                            <CheckCircle2 className="text-emerald-500 shrink-0 mt-1" size={20} />
                                            <span><strong>No-show:</strong> Trong trường hợp khách khách không đến nhận phòng mà không thông báo, 100% giá trị đêm đầu tiên hoặc toàn bộ đơn hàng sẽ bị tính phí tùy theo quy định khách sạn.</span>
                                        </li>
                                    </ul>
                                </div>
                            </section>

                            {/* SECTION 5 */}
                            <section id="section-5" className="scroll-mt-32">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl">05</div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Quyền sở hữu trí tuệ</h2>
                                </div>
                                <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
                                    <p>
                                        Toàn bộ giao diện, logo, dữ liệu và mã nguồn thuộc sở hữu HMS-B2B.
                                    </p>
                                    <p>
                                        Nghiêm cấm việc crawl hoặc scrape dữ liệu từ hệ thống
                                        khi chưa có sự cho phép bằng văn bản.
                                    </p>
                                </div>
                            </section>

                            {/* SECTION 6 */}
                            <section id="section-6" className="scroll-mt-32">
                                <div className="flex items-center gap-4 mb-8">
                                    <div
                                        className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl">06</div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Giới hạn trách nhiệm</h2>
                                </div>
                                <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
                                    <p>
                                        Khách sạn là đơn vị trực tiếp cung cấp dịch vụ lưu trú.
                                    </p>
                                    <p>
                                        HMS-B2B không chịu trách nhiệm về chất lượng phòng
                                        hoặc sự cố xảy ra tại khách sạn.
                                    </p>
                                </div>
                            </section>

                            {/* SECTION 7 */}
                            <section id="section-7" className="scroll-mt-32">
                                <div className="flex items-center gap-4 mb-8">
                                    <div
                                        className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl">07</div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Giải quyết tranh chấp</h2>
                                </div>
                                <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
                                    <p>Mọi tranh chấp phát sinh sẽ được ưu tiên giải quyết thông qua thương lượng trực tiếp trong vòng 30 ngày. Trường hợp không đạt được thỏa thuận, vụ việc sẽ được đưa ra Tòa án Kinh tế tại Thành phố nơi công ty đặt trụ sở để giải quyết theo pháp luật Việt Nam.</p>
                                </div>
                            </section>
                        </div>

                        {/* BOTTOM ACTIONS */}
                        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-[3rem] border border-slate-100 text-center shadow-sm">
                            <h4 className="text-2xl font-black text-slate-900 mb-4">Bạn vẫn còn điểm chưa rõ?</h4>
                            <p className="text-slate-500 mb-10 max-w-md">Đội ngũ pháp chế và quản lý nợ của chúng tôi sẵn sàng giải đáp các thắc mắc về hợp đồng và hạn mức tín dụng.</p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <button
                                    onClick={() => navigate("/contact")}
                                    className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
                                >
                                    Liên hệ ngay
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* SCROLL TO TOP */}
            <button
                onClick={() => window.scrollTo({top:0, behavior:"smooth"})}
                className={`fixed bottom-10 right-10 p-5 bg-white text-blue-600 rounded-[1.5rem] shadow-2xl border border-slate-100 transition-all duration-500 hover:-translate-y-2 z-[90]
                ${showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}`}
            >
                <ArrowUp size={24} strokeWidth={3} />
            </button>

            <Footer />
        </div>
    );
};

export default TermsOfServicePage;