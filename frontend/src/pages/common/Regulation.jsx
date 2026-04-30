import React, { useRef } from "react";
import {
    FileText,
    ShieldCheck,
    CreditCard,
    Users,
    Clock,
    AlertCircle,
    BookOpen,
    Scale,
    Landmark,
    Building,
    ChevronRight,
    ArrowRight
} from "lucide-react";
import Header from "@/components/common/Homepage/Header.jsx";
import Footer from "@/components/common/Homepage/Footer.jsx";

const RegulationPage = () => {
    const introRef = useRef(null);
    const principleRef = useRef(null);
    const accountRef = useRef(null);
    const bookingRef = useRef(null);
    const paymentRef = useRef(null);
    const interestRef = useRef(null);
    const lockRef = useRef(null);
    const methodRef = useRef(null);
    const legalRef = useRef(null);

    const scrollToSection = (ref) => {
        const offset = 50; // Trừ hao khoảng cách của Header cố định
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = ref.current?.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });
    };

    const menu = [
        { name: "Giới thiệu chung", ref: introRef, icon: <BookOpen size={18} /> },
        { name: "Nguyên tắc hoạt động", ref: principleRef, icon: <ShieldCheck size={18} /> },
        { name: "Quy định tài khoản", ref: accountRef, icon: <Users size={18} /> },
        { name: "Quy trình đặt phòng", ref: bookingRef, icon: <Clock size={18} /> },
        { name: "Công nợ & thanh toán", ref: paymentRef, icon: <Landmark size={18} /> },
        { name: "Lãi suất chậm trả", ref: interestRef, icon: <AlertCircle size={18} /> },
        { name: "Khóa / mở tài khoản", ref: lockRef, icon: <Building size={18} /> },
        { name: "Phương thức thanh toán", ref: methodRef, icon: <CreditCard size={18} /> },
        { name: "Giá trị pháp lý", ref: legalRef, icon: <Scale size={18} /> },
    ];

    const SectionCard = ({ children, title, icon: Icon, sectionRef, id }) => (
        <section ref={sectionRef} className="mb-12 scroll-mt-28">
            <div className="bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden transition-all hover:shadow-md">
                <div className="border-b border-gray-50 bg-gray-50/50 px-8 py-5">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                        <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <Icon size={22} strokeWidth={2.5} />
                        </span>
                        {title}
                    </h2>
                </div>
                <div className="p-8 text-gray-600 leading-relaxed">
                    {children}
                </div>
            </div>
        </section>
    );

    return (
        <div className="selection:bg-blue-100 selection:text-blue-900">
            <Header />

            <main className="bg-[#f8fafc] min-h-screen pb-20">
                {/* HERO SECTION */}
                <div className="relative bg-[#0f172a] py-24 overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500 rounded-full blur-[100px]"></div>
                        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500 rounded-full blur-[100px]"></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-6 relative z-10 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-sm font-medium mb-6">
                            <ShieldCheck size={16} />
                            <span>Vận hành bởi hệ thống quản lý chuẩn quốc tế</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6">
                            Quy chế hoạt động <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                                Sàn giao dịch điện tử
                            </span>
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
                            Quy định nguyên tắc tổ chức, vận hành và quyền lợi của các bên tham gia,
                            nhằm kiến tạo môi trường kinh doanh minh bạch, an toàn và chuyên nghiệp.
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 px-6 -mt-10 relative z-20">

                    {/* SIDEBAR NAVIGATION */}
                    <aside className="lg:w-80 shrink-0">
                        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white p-6 sticky top-28">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 px-3">
                                Nội dung chi tiết
                            </h3>
                            <nav className="space-y-1">
                                {menu.map((item, index) => (
                                    <button
                                        key={index}
                                        onClick={() => scrollToSection(item.ref)}
                                        className="group w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 text-sm font-medium"
                                    >
                                        <span className="text-gray-400 group-hover:text-blue-500 transition-colors">
                                            {item.icon}
                                        </span>
                                        <span className="flex-1 text-left">{item.name}</span>
                                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                    </button>
                                ))}
                            </nav>

                        </div>
                    </aside>

                    {/* MAIN CONTENT AREAS */}
                    <div className="flex-1">

                        <SectionCard title="1. Giới thiệu chung" icon={BookOpen} sectionRef={introRef}>
                            <div className="space-y-4 text-[16px]">
                                <p>
                                    Sàn giao dịch đặt phòng là nền tảng trực tuyến kết nối các
                                    <span className="font-semibold text-gray-900"> Đại lý du lịch (Agency)</span> với các
                                    <span className="font-semibold text-gray-900"> Khách sạn (Hotel)</span>, mang đến giải pháp tối ưu
                                    trong quản lý booking và giao dịch tài chính.
                                </p>
                                <p>
                                    Thông qua hệ thống, các bên có thể tương tác trực tiếp, cập nhật tình trạng
                                    phòng theo thời gian thực và tự động hóa các báo cáo doanh thu một cách chính xác.
                                </p>
                                <div className="mt-6 p-4 border-l-4 border-blue-500 bg-blue-50 italic text-gray-700">
                                    "Bằng việc sử dụng hệ thống, người dùng xác nhận đã hiểu và cam kết tuân thủ
                                    toàn bộ các quy chuẩn vận hành được nêu tại đây."
                                </div>
                            </div>
                        </SectionCard>

                        <SectionCard title="2. Nguyên tắc hoạt động" icon={ShieldCheck} sectionRef={principleRef}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    "Minh bạch tuyệt đối về thông tin & giá",
                                    "Hệ thống hóa mọi dấu vết giao dịch (Audit Trail)",
                                    "Tuân thủ nghiêm ngặt Pháp luật Việt Nam",
                                    "Bảo mật đa lớp dữ liệu người dùng",
                                    "Tối ưu hóa quy trình bằng tự động hóa",
                                    "Công bằng và khách quan trong xử lý khiếu nại"
                                ].map((text, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                        <span className="text-gray-700">{text}</span>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>

                        <SectionCard title="3. Quy định về tài khoản" icon={Users} sectionRef={accountRef}>
                            <p className="mb-6">Hệ thống phân quyền chi tiết để đảm bảo tính bảo mật và chuyên môn hóa:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                {[
                                    { label: "Agency Manager", desc: "Quản trị cấp cao đại lý" },
                                    { label: "Agency Staff", desc: "Điều hành & Đặt phòng" },
                                    { label: "Hotel Owner", desc: "Quản lý doanh thu khách sạn" },
                                    { label: "Hotel Staff", desc: "Xác nhận & Cập nhật phòng" }
                                ].map((item, i) => (
                                    <div key={i} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                                        <h4 className="font-bold text-gray-900 text-sm mb-1">{item.label}</h4>
                                        <p className="text-xs text-gray-500">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm bg-yellow-50 text-yellow-800 p-4 rounded-lg border border-yellow-100">
                                <strong>Lưu ý:</strong> Người dùng chịu trách nhiệm pháp lý đối với mọi hành động thực hiện qua tài khoản cá nhân. Không cung cấp mật khẩu cho bất kỳ ai, kể cả nhân viên hỗ trợ hệ thống.
                            </p>
                        </SectionCard>

                        <SectionCard title="4. Quy trình đặt phòng" icon={Clock} sectionRef={bookingRef}>
                            <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                                {[
                                    { t: "Tìm kiếm", d: "Tra cứu khách sạn theo địa điểm, thời gian và hạng phòng." },
                                    { t: "Đối soát giá", d: "Hệ thống hiển thị giá thực tế đã bao gồm thuế phí." },
                                    { t: "Xác nhận", d: "Nhập thông tin khách và nhận mã giữ chỗ (PNR)." },
                                    { t: "Hoàn tất", d: "Ghi nhận đơn hàng và cập nhật hạn mức công nợ tức thì." }
                                ].map((step, i) => (
                                    <div key={i} className="relative">
                                        <div className="absolute -left-8 w-6 h-6 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center z-10">
                                            <span className="text-[10px] font-bold text-blue-600">{i + 1}</span>
                                        </div>
                                        <h4 className="font-bold text-gray-800">{step.t}</h4>
                                        <p className="text-sm text-gray-500">{step.d}</p>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>

                        <SectionCard title="5. Công nợ và thanh toán" icon={Landmark} sectionRef={paymentRef}>
                            <p className="mb-6 text-gray-600">
                                Chính sách tài chính linh hoạt hỗ trợ đại lý tối ưu dòng tiền thông qua hạn mức tín dụng (Credit Limit).
                            </p>
                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="text-center md:text-left">
                                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Ngày chốt sổ</p>
                                        <p className="text-2xl font-bold italic">25 hàng tháng</p>
                                    </div>
                                    <div className="text-center md:text-left border-y md:border-y-0 md:border-x border-white/10 py-4 md:py-0 md:px-8">
                                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Phát hành sao kê</p>
                                        <p className="text-2xl font-bold italic text-blue-400">Ngày 26</p>
                                    </div>
                                    <div className="text-center md:text-left">
                                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Thời hạn thanh toán</p>
                                        <p className="text-2xl font-bold italic">Trước ngày 02</p>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Landmark size={80} />
                                </div>
                            </div>
                        </SectionCard>

                        <SectionCard title="6. Lãi suất chậm thanh toán" icon={AlertCircle} sectionRef={interestRef}>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="group border border-gray-100 rounded-2xl p-6 bg-white hover:border-yellow-200 transition-all">
                                    <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 mb-4 group-hover:scale-110 transition-transform">
                                        <AlertCircle size={20} />
                                    </div>
                                    <h4 className="font-bold text-gray-900 mb-2 text-lg">Giai đoạn nhắc nợ</h4>
                                    <p className="text-sm text-gray-500 leading-relaxed">
                                        Áp dụng lãi suất <span className="font-bold text-gray-800">0.03% / ngày</span>. Tối đa trong 15 ngày làm việc đầu tiên sau khi quá hạn.
                                    </p>
                                </div>

                                <div className="group border border-gray-100 rounded-2xl p-6 bg-white hover:border-red-200 transition-all">
                                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-4 group-hover:scale-110 transition-transform">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <h4 className="font-bold text-gray-900 mb-2 text-lg">Giai đoạn vi phạm</h4>
                                    <p className="text-sm text-gray-500 leading-relaxed">
                                        Lãi suất tăng lên <span className="font-bold text-gray-800">0.05% / ngày</span>. Hệ thống tự động kích hoạt chế độ khóa tài khoản giao dịch.
                                    </p>
                                </div>
                            </div>
                        </SectionCard>

                        <SectionCard title="7. Khóa và mở khóa tài khoản" icon={Building} sectionRef={lockRef}>
                            <div className="flex flex-col md:flex-row gap-8 items-center">
                                <div className="flex-1">
                                    <p className="mb-4">Hệ thống áp dụng cơ chế tự động hóa để bảo vệ quyền lợi của các nhà cung cấp khách sạn:</p>
                                    <ul className="space-y-3">
                                        <li className="flex items-center gap-2 text-sm">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                            <span>Tự động khóa khi nợ quá hạn hoặc vượt hạn mức tín dụng.</span>
                                        </li>
                                        <li className="flex items-center gap-2 text-sm">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                            <span>Mở khóa ngay lập tức sau khi xác nhận thanh toán nợ gốc & lãi.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </SectionCard>

                        <SectionCard title="8. Phương thức thanh toán" icon={CreditCard} sectionRef={methodRef}>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {[
                                    { t: "QR Code", d: "Chuyển khoản nhanh 24/7" },
                                    { t: "Cổng nội địa", d: "ATM & Tài khoản ngân hàng" },
                                    { t: "Ví điện tử", d: "Momo, Zalopay & Payoo" }
                                ].map((item, i) => (
                                    <div key={i} className="text-center p-6 border border-gray-100 rounded-xl hover:shadow-sm transition-shadow">
                                        <div className="inline-block p-3 bg-blue-50 text-blue-600 rounded-full mb-3">
                                            <CreditCard size={20} />
                                        </div>
                                        <h4 className="font-bold text-gray-800 text-sm">{item.t}</h4>
                                        <p className="text-xs text-gray-400 mt-1">{item.d}</p>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>

                        <SectionCard title="9. Giá trị pháp lý" icon={Scale} sectionRef={legalRef}>
                            <div className="bg-blue-900 text-white rounded-2xl p-8 relative overflow-hidden">
                                <Scale className="absolute -bottom-4 -right-4 opacity-10" size={120} />
                                <p className="text-lg leading-relaxed relative z-10">
                                    "Các xác nhận điện tử, log dữ liệu và mã số booking được ghi nhận trên hệ thống
                                    có giá trị pháp lý là bằng chứng giao dịch cuối cùng, tương đương với hợp đồng
                                    văn bản được ký kết giữa các bên theo quy định của Luật Giao dịch điện tử hiện hành."
                                </p>
                            </div>
                        </SectionCard>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default RegulationPage;