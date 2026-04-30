import React, { useState } from 'react';
import {
    BookOpen,
    UserPlus,
    CheckCircle,
    CreditCard,
    Search,
    HelpCircle,
    ChevronDown,
    ArrowRight,
    MousePointer2,
    Settings,
    FileText,
    Hotel,
    CalendarCheck,
    ShieldCheck,
    BarChart3,
    Clock,
    Wallet
} from 'lucide-react';

import Header from "@/components/common/Homepage/Header.jsx";
import Footer from "@/components/common/Homepage/Footer.jsx";

const UserGuidePage = () => {
    const [activeTab, setActiveTab] = useState("agency");
    const [openFaq, setOpenFaq] = useState(0);

    /* =========================
       AGENCY GUIDE (ĐẠI LÝ)
    ==========================*/
    const stepsAgency = [
        {
            title: "Đăng ký tài khoản Đối tác",
            desc: "Bắt đầu hành trình cộng tác bằng cách khởi tạo tài khoản doanh nghiệp trên hệ thống HMS-B2B.",
            icon: <UserPlus size={24} className="text-blue-600" />,
            details: [
                "Cung cấp thông tin pháp lý (Tên công ty, Mã số thuế)",
                "Đính kèm bản scan Giấy phép kinh doanh (GPKD)",
                "Thông tin người đại diện và đầu mối liên hệ chính",
                "Xác thực email để kích hoạt hồ sơ chờ duyệt"
            ]
        },
        {
            title: "Xác minh hồ sơ pháp lý",
            desc: "Đội ngũ Admin sẽ thẩm định hồ sơ của bạn để đảm bảo tính an toàn cho hệ thống giao dịch.",
            icon: <ShieldCheck size={24} className="text-emerald-600" />,
            details: [
                "Kiểm tra tính xác thực của doanh nghiệp",
                "Thời gian xét duyệt tiêu chuẩn: 12 – 24 giờ làm việc",
                "Nhận thông báo kích hoạt qua Email/SMS",
                "Cấp quyền truy cập Dashboard quản trị đại lý"
            ]
        },
        {
            title: "Quản lý Hạn mức & Tín dụng",
            desc: "HMS-B2B cung cấp giải pháp tài chính linh hoạt giúp đại lý tối ưu dòng tiền.",
            icon: <Wallet size={24} className="text-purple-600" />,
            details: [
                "Xem hạn mức tín dụng (Credit Limit) được cấp",
                "Theo dõi số dư khả dụng theo thời gian thực",
                "Cơ chế 'Đặt trước - Thanh toán sau' ưu việt",
                "Nhận thông báo nhắc nợ tự động khi đến kỳ"
            ]
        },
        {
            title: "Quy trình Đặt phòng (Booking)",
            desc: "Hệ thống tìm kiếm thông minh giúp bạn tìm được giá Net tốt nhất chỉ trong vài giây.",
            icon: <Search size={24} className="text-indigo-600" />,
            details: [
                "Tìm kiếm theo địa điểm, hạng sao hoặc tên khách sạn",
                "Hiển thị giá Net (Giá gốc B2B) không qua trung gian",
                "Nhập thông tin khách hàng và yêu cầu đặc biệt",
                "Xuất Voucher điện tử ngay sau khi xác nhận"
            ]
        },
        {
            title: "Quản lý & Hậu mãi",
            desc: "Kiểm soát mọi giao dịch và hỗ trợ khách hàng một cách chuyên nghiệp.",
            icon: <FileText size={24} className="text-blue-500" />,
            details: [
                "Quản lý trạng thái Booking (Đã xác nhận, Chờ thanh toán...)",
                "Yêu cầu hoàn/hủy hoặc thay đổi thông tin linh hoạt",
                "Tải hóa đơn điện tử (VAT) cho từng giao dịch",
                "Hệ thống báo cáo sản lượng theo tháng/quý"
            ]
        }
    ];

    /* =========================
       HOTEL GUIDE (KHÁCH SẠN)
    ==========================*/
    const stepsHotel = [
        {
            title: "Hợp tác & Kết nối",
            desc: "Đưa khách sạn của bạn tiếp cận mạng lưới hàng ngàn đại lý lữ hành toàn quốc.",
            icon: <Hotel size={24} className="text-blue-600" />,
            details: [
                "Đăng ký thông tin cơ sở lưu trú",
                "Ký kết hợp đồng điện tử với HMS-B2B",
                "Phân quyền tài khoản quản lý khách sạn",
                "Thiết lập thông tin liên hệ lễ tân/sales"
            ]
        },
        {
            title: "Số hóa Thông tin Phòng",
            desc: "Xây dựng gian hàng chuyên nghiệp để thu hút đại lý.",
            icon: <Settings size={24} className="text-slate-600" />,
            details: [
                "Upload hình ảnh chất lượng cao (Phòng, Tiện ích, View)",
                "Mô tả chi tiết các loại phòng và chính sách trẻ em",
                "Cập nhật danh mục tiện nghi (Bể bơi, Gym, Spa...)",
                "Thiết lập vị trí bản đồ chính xác"
            ]
        },
        {
            title: "Quản lý Giá & Quỹ phòng (Allotment)",
            desc: "Tối ưu hóa doanh thu thông qua công cụ quản lý giá linh hoạt.",
            icon: <BarChart3 size={24} className="text-amber-600" />,
            details: [
                "Thiết lập giá Net B2B theo mùa điểm/lễ tết",
                "Đóng/Mở quỹ phòng theo thời gian thực",
                "Cài đặt chính sách Hủy phòng (Cancellation Policy)",
                "Quản lý các chương trình khuyến mãi (Early Bird, Last Minute)"
            ]
        },
        {
            title: "Vận hành & Đón khách",
            desc: "Quy trình xử lý Booking tinh gọn giúp bộ phận lễ tân hoạt động hiệu quả.",
            icon: <CalendarCheck size={24} className="text-green-600" />,
            details: [
                "Nhận thông báo Booking mới tức thì qua Email/Hệ thống",
                "Xác nhận tình trạng phòng nhanh chóng",
                "Xem danh sách khách đến (Arrival List) hàng ngày",
                "Ghi nhận Check-in/Check-out trên hệ thống"
            ]
        },
        {
            title: "Đối soát & Thanh toán",
            desc: "Minh bạch hóa dòng tiền và doanh thu hàng tháng.",
            icon: <CreditCard size={24} className="text-indigo-600" />,
            details: [
                "Tự động tổng hợp doanh thu theo định kỳ",
                "Đối soát dữ liệu giữa Khách sạn và HMS-B2B",
                "Quản lý lịch sử thanh toán và công nợ",
                "Xuất báo cáo tài chính chi tiết dạng Excel"
            ]
        }
    ];

    const faqs = [
        {
            q: "Làm thế nào để nâng hạn mức tín dụng?",
            a: "Các đại lý có lịch sử thanh toán đúng hạn trong vòng 3 tháng liên tiếp sẽ được hệ thống tự động xem xét nâng hạn mức. Bạn cũng có thể gửi yêu cầu trực tiếp qua Dashboard để được xét duyệt nhanh."
        },
        {
            q: "Chính sách hoàn hủy phòng được quy định như thế nào?",
            a: "Chính sách hoàn hủy phụ thuộc vào từng khách sạn và hạng phòng cụ thể. Thông tin này luôn được hiển thị minh bạch tại bước xác nhận đặt phòng trước khi bạn nhấn nút 'Đặt ngay'."
        },
        {
            q: "Tôi có thể xuất hóa đơn VAT cho từng booking không?",
            a: "Hoàn toàn được. Hệ thống HMS-B2B tích hợp hóa đơn điện tử, bạn có thể đăng ký thông tin xuất hóa đơn trong phần quản lý tài khoản hoặc yêu cầu ngay khi booking hoàn tất."
        },
        {
            q: "Thời gian xử lý đối soát giữa Khách sạn và Hệ thống là bao lâu?",
            a: "Việc đối soát thường diễn ra vào ngày 01 đến ngày 05 hàng tháng. Tiền phòng sẽ được thanh toán cho khách sạn theo chu kỳ thỏa thuận trong hợp đồng hợp tác."
        }
    ];

    const steps = activeTab === "agency" ? stepsAgency : stepsHotel;

    return (
        <div className="bg-[#f8fafc] min-h-screen font-sans text-slate-900">
            <Header />

            <main className="pt-3 pb-20">
                {/* HERO SECTION */}
                <section className="max-w-7xl mx-auto px-6 mb-16">
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-12 md:p-20 shadow-sm overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-10 opacity-5">
                            <BookOpen size={200} />
                        </div>

                        <div className="relative z-10 max-w-3xl">
                            <span className="inline-block py-1 px-3 bg-blue-50 text-blue-600 rounded-full text-sm font-bold mb-4">
                                Tài liệu hỗ trợ đối tác
                            </span>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
                                Hướng dẫn vận hành <br />
                                <span className="text-blue-600">Hệ thống HMS-B2B</span>
                            </h1>
                            <p className="text-lg text-slate-500 leading-relaxed">
                                Chào mừng bạn đến với trung tâm hỗ trợ. Vui lòng chọn vai trò của bạn để xem quy trình hướng dẫn chi tiết từ lúc bắt đầu đến khi vận hành thành thạo.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ROLE SWITCHER */}
                <div className="flex justify-center mb-12">
                    <div className="bg-slate-200/50 p-1.5 rounded-2xl flex gap-1 border border-slate-200">
                        <button
                            onClick={() => setActiveTab("agency")}
                            className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all ${
                                activeTab === "agency"
                                    ? "bg-white text-blue-600 shadow-md ring-1 ring-black/5"
                                    : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            <UserPlus size={18} /> Đối với Đại lý
                        </button>
                        <button
                            onClick={() => setActiveTab("hotel")}
                            className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all ${
                                activeTab === "hotel"
                                    ? "bg-white text-blue-600 shadow-md ring-1 ring-black/5"
                                    : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            <Hotel size={18} /> Đối với Khách sạn
                        </button>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-10">
                    {/* MAIN CONTENT - STEPS */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-2xl font-bold flex items-center gap-3">
                                <div className="p-2 bg-blue-600 rounded-lg text-white">
                                    <Clock size={20} />
                                </div>
                                Quy trình triển khai {activeTab === "agency" ? "Đại lý" : "Khách sạn"}
                            </h3>
                            <span className="text-sm text-slate-400 font-medium">
                                {steps.length} bước tiêu chuẩn
                            </span>
                        </div>

                        <div className="space-y-6 relative">
                            {/* Vertical Line Decoration */}
                            <div className="absolute left-12 top-0 bottom-0 w-0.5 bg-slate-100 hidden md:block"></div>

                            {steps.map((step, index) => (
                                <div key={index} className="group relative bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:border-blue-200 transition-all hover:shadow-xl hover:shadow-blue-500/5">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="relative z-10 w-16 h-16 shrink-0 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                                            {step.icon}
                                            <div className="absolute -top-2 -left-2 w-6 h-6 bg-slate-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-4 ring-white">
                                                0{index + 1}
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <h4 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors">
                                                {step.title}
                                            </h4>
                                            <p className="text-slate-500 mb-6 leading-relaxed">
                                                {step.desc}
                                            </p>
                                            <div className="grid md:grid-cols-2 gap-y-3 gap-x-6">
                                                {step.details.map((detail, i) => (
                                                    <div key={i} className="flex items-start gap-2.5 text-[14px] text-slate-600">
                                                        <div className="mt-1 shrink-0">
                                                            <CheckCircle size={14} className="text-emerald-500" />
                                                        </div>
                                                        {detail}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SIDEBAR */}
                    <aside className="lg:col-span-4 space-y-8">
                        {/* FAQ SECTION */}
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                            <h4 className="text-xl font-bold mb-6 flex gap-3 items-center">
                                <HelpCircle className="text-blue-600" />
                                Câu hỏi thường gặp
                            </h4>
                            <div className="space-y-4">
                                {faqs.map((faq, index) => (
                                    <div key={index} className="border-b border-slate-50 last:border-0 pb-4 last:pb-0">
                                        <button
                                            onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                            className="flex justify-between w-full text-left font-semibold text-slate-700 hover:text-blue-600 transition-colors gap-4"
                                        >
                                            <span className="text-[15px] leading-snug">{faq.q}</span>
                                            <ChevronDown
                                                size={18}
                                                className={`shrink-0 transition-transform duration-300 ${openFaq === index ? "rotate-180" : ""}`}
                                            />
                                        </button>
                                        {openFaq === index && (
                                            <div className="mt-3 p-4 bg-slate-50 rounded-xl">
                                                <p className="text-sm text-slate-500 leading-relaxed">
                                                    {faq.a}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CONTACT CARD */}
                        <div className="bg-slate-900 text-white p-8 rounded-[2rem] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-blue-600/40"></div>

                            <h4 className="text-xl font-bold mb-4 relative z-10">
                                Bạn cần hỗ trợ thêm?
                            </h4>
                            <p className="text-slate-400 text-sm mb-8 leading-relaxed relative z-10">
                                Đội ngũ kỹ thuật và CSKH của chúng tôi luôn sẵn sàng giải đáp mọi thắc mắc của bạn 24/7.
                            </p>

                            <div className="mt-6 pt-6 border-t border-white/10 flex flex-col gap-3">
                                <div className="flex items-center gap-3 text-sm text-slate-300">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    Hỗ trợ trực tuyến đang sẵn sàng
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default UserGuidePage;