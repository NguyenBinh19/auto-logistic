import React from 'react';
import { FileText, CreditCard, Sparkles } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const KYCPreparation = ({ onStart }) => {
    const navigate = useNavigate();
    return (
        <div className="p-10 text-center">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Xác minh danh tính người dùng</h1>

            <div className="space-y-4 max-w-2xl mx-auto mb-10">
                <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left">
                    <div className="bg-white p-3 rounded-xl shadow-sm"><FileText className="text-slate-400"/></div>
                    <div>
                        <h3 className="font-bold text-slate-700">Giấy phép kinh doanh (GPKD)</h3>
                        <p className="text-xs text-slate-500">Bản gốc hoặc bản sao công chứng còn hiệu lực.</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left">
                    <div className="bg-white p-3 rounded-xl shadow-sm"><CreditCard className="text-purple-500"/></div>
                    <div>
                        <h3 className="font-bold text-slate-700">CCCD/CMND người đại diện</h3>
                        <p className="text-xs text-slate-500">Mặt trước và mặt sau rõ nét.</p>
                    </div>
                </div>

            </div>

            <button
                onClick={onStart}
                className="w-full max-w-md bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            >
                Bắt đầu xác minh ngay
            </button>
            <button
                onClick={() => navigate("/")}
                className="w-full max-w-md bg-gray-400 mt-3 text-white py-4 rounded-xl font-bold hover:bg-gray-500 transition-all shadow-lg shadow-blue-200"
            >
                Để sau (Đăng xuất)
            </button>
        </div>
    );
};

export default KYCPreparation;