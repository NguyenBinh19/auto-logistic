import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    History,
    Eye,
    Target,
    ArrowRight,
    MapPin,
    Zap,
    CheckCircle2,
    GraduationCap
} from 'lucide-react';
import Header from "@/components/common/Homepage/Header.jsx";
import Footer from "@/components/common/Homepage/Footer.jsx";

const AboutUsPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = "Về chúng tôi | HMS-B2B Project";
    }, []);

    return (
        <div className="bg-white min-h-screen flex flex-col font-sans">
            <Header />

            <main className="flex-grow">
                {/* --- 1. HERO SECTION --- */}
                <section className="relative h-[60vh] flex items-center bg-slate-900 overflow-hidden">
                    <div className="absolute inset-0">
                        <img
                            src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=2000"
                            alt="FPT Students Collaboration"
                            className="w-full h-full object-cover opacity-40"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/60 to-slate-900"></div>
                    </div>

                    <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                        <span className="text-blue-400 font-black tracking-[0.4em] uppercase text-[10px] mb-6 block">
                            FPT University Graduation Project
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter leading-tight">
                            Số hóa ngành khách sạn <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                                bắt đầu từ trí tuệ Việt
                            </span>
                        </h1>
                    </div>
                </section>

                {/* --- 2. PROJECT HISTORY --- */}
                <section className="py-24 bg-white relative overflow-hidden">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div className="space-y-8">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-blue-600 text-xs font-black uppercase tracking-widest border border-blue-100">
                                    <GraduationCap size={14} /> Khởi đầu từ ĐH FPT
                                </div>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
                                    Hành trình từ đồ án tốt nghiệp <br/> đến nền tảng thực tiễn
                                </h2>
                                <div className="space-y-6 text-slate-600 leading-relaxed text-lg italic font-medium border-l-4 border-blue-600 pl-6">
                                    "HMS-B2B được hình thành từ niềm đam mê công nghệ của nhóm sinh viên Đại học FPT. Xuất phát là một đồ án tốt nghiệp, chúng tôi khao khát mang kiến thức đã học để giải quyết bài toán vận hành thực tế cho ngành du lịch Việt Nam."
                                </div>
                                <p className="text-slate-500 leading-relaxed">
                                    Thay vì những lý thuyết xa xôi, chúng tôi tập trung vào việc thấu hiểu nỗi đau của các doanh nghiệp khách sạn tại Việt Nam. Bằng cách đầu tư vào công nghệ hiện đại, HMS-B2B kết nối các đối tác chỗ nghỉ với quy trình làm việc thông minh, tinh gọn và minh bạch ngay tại thị trường nội địa.
                                </p>
                            </div>
                            <div className="relative">
                                <img
                                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1000"
                                    className="rounded-[3rem] shadow-2xl"
                                    alt="Team Collaboration"
                                />
                                <div className="absolute -bottom-8 -right-8 bg-slate-900 text-white p-10 rounded-[2rem] hidden md:block shadow-xl border-t-4 border-blue-600">
                                    <div className="text-sm font-bold uppercase tracking-[0.2em] opacity-80 mb-2">Focused on</div>
                                    <div className="text-3xl font-black">VIETNAM</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- 3. VISION & MISSION --- */}
                <section className="py-24 bg-slate-50">
                    <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12">
                        {/* Vision Card */}
                        <div className="group p-12 bg-white rounded-[3rem] border border-slate-100 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500">
                            <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 transition-colors">
                                <Eye size={32} />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 mb-6 tracking-tighter uppercase">Tầm nhìn</h3>
                            <p className="text-slate-500 text-lg leading-relaxed">
                                Trở thành nền tảng quản lý và phân phối phòng hàng đầu cho các khách sạn vừa và nhỏ tại Việt Nam. Chúng tôi muốn chứng minh rằng công nghệ do người Việt trẻ phát triển hoàn toàn có thể cạnh tranh và mang lại giá trị thực cho người Việt.
                            </p>
                        </div>

                        {/* Mission Card */}
                        <div className="group p-12 bg-white rounded-[3rem] border border-slate-100 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500">
                            <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 transition-colors">
                                <Target size={32} />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 mb-6 tracking-tighter uppercase">Sứ mệnh</h3>
                            <p className="text-slate-500 text-lg leading-relaxed">
                                Sứ mệnh của chúng tôi là <span className="text-blue-600 font-bold">giúp du lịch Việt Nam vận hành thông minh hơn.</span> Chúng tôi đồng hành cùng các chủ khách sạn 24/7 để loại bỏ các thủ tục thủ công, giúp họ tập trung vào việc mang lại trải nghiệm tốt nhất cho khách lưu trú.
                            </p>
                        </div>
                    </div>
                </section>

                {/* --- 4. CORE VALUES --- */}
                <section className="py-24 bg-white">
                    <div className="max-w-4xl mx-auto px-6 text-center space-y-16">
                        <h2 className="text-xs font-black text-blue-600 uppercase tracking-[0.4em]">Giá trị dự án</h2>
                        <div className="grid md:grid-cols-3 gap-12">
                            <div className="space-y-4">
                                <CheckCircle2 className="mx-auto text-blue-600" size={40} />
                                <h4 className="font-black text-slate-900 text-xl tracking-tight">Thực tiễn</h4>
                                <p className="text-sm text-slate-500">Sản phẩm dựa trên nhu cầu thực tế của thị trường khách sạn Việt.</p>
                            </div>
                            <div className="space-y-4">
                                <MapPin className="mx-auto text-blue-600" size={40} />
                                <h4 className="font-black text-slate-900 text-xl tracking-tight">Nội địa</h4>
                                <p className="text-sm text-slate-500">Tối ưu hóa riêng cho cách vận hành và thói quen của người dùng Việt.</p>
                            </div>
                            <div className="space-y-4">
                                <Zap className="mx-auto text-blue-600" size={40} />
                                <h4 className="font-black text-slate-900 text-xl tracking-tight">Nhiệt huyết</h4>
                                <p className="text-sm text-slate-500">Tinh thần Nhiệt huyết của sinh viên FPT: Luôn sẵn sàng hỗ trợ 24/7.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- 5. CALL TO ACTION --- */}
                <section className="py-20 px-6">
                    <div className="max-w-6xl mx-auto bg-slate-900 rounded-[4rem] p-12 md:p-20 text-center text-white shadow-2xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-5xl font-black mb-10 tracking-tighter">
                                Đồng hành cùng <br/> đội ngũ trẻ tiềm năng
                            </h2>
                            <button
                                onClick={() => navigate("/contact")}
                                className="bg-blue-600 text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all flex items-center gap-3 mx-auto active:scale-95 shadow-xl shadow-blue-500/20"
                            >
                                Kết nối với chúng tôi <ArrowRight size={18} />
                            </button>
                        </div>
                        {/* Decorative element */}
                        <div className="absolute top-0 right-0 p-12 opacity-5">
                            <GraduationCap size={200} />
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default AboutUsPage;