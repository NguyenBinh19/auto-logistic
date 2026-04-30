import { Outlet } from "react-router-dom";
import Sidebar from "@/components/hotel/dashboard/Sidebar.jsx";
import Header from "@/components/common/Homepage/Header";
import Footer from "@/components/common/Homepage/Footer";

const HotelLayout = () => {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900">

            {/* Header */}
            <div className="sticky top-0 z-50 bg-white shadow-sm w-full">
                <Header />
            </div>

            {/* Body */}
            <div className="flex flex-1 relative">

                {/* Sidebar */}
                <div className="w-[260px] flex-shrink-0 bg-white border-r border-slate-200">
                    <Sidebar />
                </div>

                {/* Nội dung  */}
                <main className="flex-1 bg-slate-50">
                    <div className="p-6 md:p-8">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 bg-slate-900 text-white border-t border-slate-200">
                <Footer />
            </div>

        </div>
    );
};

export default HotelLayout;