import { MapPin, Phone, Facebook, Twitter, Instagram, Globe } from "lucide-react";

const Footer = () => {
    return (
        <footer className="bg-[#1e293b] text-slate-300 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* --- MAIN GRID --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

                    {/* COL 1: BRAND INFO */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white mb-2">HMS-B2B</h3>
                        <p className="text-sm leading-relaxed text-slate-400">
                            Nền tảng đặt phòng B2B an toàn & thông minh nhất Việt Nam.
                            Mang lại giải pháp quản lý khách sạn toàn diện và hiệu quả.
                        </p>
                    </div>

                    {/* COL 2: COMPANY INFO */}
                    <div>
                        <h4 className="text-base font-bold text-white mb-6 uppercase tracking-wider">Thông tin công ty</h4>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin className="flex-shrink-0 text-white mt-0.5" size={18} />
                                <span>123 Đường ABC, Quận XYZ, TP.HCM</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="flex-shrink-0 text-white" size={18} />
                                <span>+84 123 456 789</span>
                            </li>
                        </ul>
                    </div>

                    {/* COL 3: QUICK LINKS */}
                    <div>
                        <h4 className="text-base font-bold text-white mb-6 uppercase tracking-wider">Liên kết nhanh</h4>
                        <ul className="space-y-3 text-sm">
                            <li><a href="/term-service" className="hover:text-blue-400 transition-colors">Điều khoản sử dụng</a></li>
                            <li><a href="/private-policy" className="hover:text-blue-400 transition-colors">Chính sách bảo mật</a></li>
                            <li><a href="/regulation" className="hover:text-blue-400 transition-colors">Quy chế hoạt động sàn</a></li>
                            <li><a href="/user-guide" className="hover:text-blue-400 transition-colors">Hướng dẫn sử dụng</a></li>
                        </ul>
                    </div>

                    {/* COL 4: SOCIALS */}
                    <div>
                        <h4 className="text-base font-bold text-white mb-6 uppercase tracking-wider">Kết nối với chúng tôi</h4>
                        <div className="flex gap-4">
                            {/* Facebook */}
                            <a href="/homepage" className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center text-white hover:scale-110 transition-transform">
                                <Facebook size={20} fill="currentColor" strokeWidth={0} />
                            </a>

                            {/* Twitter */}
                            <a href="/homepage" className="w-10 h-10 rounded-full bg-[#1DA1F2] flex items-center justify-center text-white hover:scale-110 transition-transform">
                                <Twitter size={20} fill="currentColor" strokeWidth={0} />
                            </a>

                            {/* Instagram */}
                            <a href="/homepage" className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center text-white hover:scale-110 transition-transform">
                                <Instagram size={20} strokeWidth={2} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* --- BOTTOM BAR --- */}
                <div className="border-t border-slate-700/50 pt-8 text-center">
                    <p className="text-sm text-slate-500">
                        © 2024 HMS-B2B. Tất cả quyền được bảo lưu.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;