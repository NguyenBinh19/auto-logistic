import React, { useState } from "react";
import { CheckCircle, X, ArrowRight, ArrowLeft, CreditCard } from "lucide-react";

const DepositPopup = ({ onClose }) => {
    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState("");
    const [qrUrl, setQrUrl] = useState(null);
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const agencyId = user?.agencyId;

    const formatCurrency = (value) =>
        value ? new Intl.NumberFormat("vi-VN").format(value) + " ₫" : "";

    const handleNext = () => {
        const acc = "0978072004";
        const bank = "MB";
        const des = `NAP ${agencyId}`;
        const url = `https://qr.sepay.vn/img?acc=${acc}&bank=${bank}&amount=${amount}&des=${des}&template=compact`;
        setQrUrl(url);
        setStep(2);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-[500px] overflow-hidden animate-fadeIn">

                <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <div className="flex items-center gap-2 font-semibold text-lg">
                        <CreditCard size={22} /> Nạp tiền vào ví
                    </div>
                    <button onClick={onClose} className="hover:text-slate-200 transition">
                        <X size={22} />
                    </button>
                </div>

                <div className="flex items-center justify-between px-6 py-4 bg-slate-50">
                    <div className={`flex items-center gap-2 ${step >= 1 ? "text-blue-600 font-semibold" : "text-slate-400"}`}>
                        {step > 1 ? <CheckCircle size={20} /> : <span className="w-6 h-6 rounded-full border flex items-center justify-center">1</span>}
                        <span>Nhập số tiền</span>
                    </div>
                    <div className="flex-1 border-t border-slate-300 mx-2"></div>
                    <div className={`flex items-center gap-2 ${step === 2 ? "text-blue-600 font-semibold" : "text-slate-400"}`}>
                        {step === 2 ? <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">2</span> : <span className="w-6 h-6 rounded-full border flex items-center justify-center">2</span>}
                        <span>Quét QR</span>
                    </div>
                </div>

                <div className="p-6">
                    {step === 1 && (
                        <div className="animate-slideIn">
                            <p className="text-sm text-slate-500 mb-4">Nhập số tiền bạn muốn nạp, hệ thống sẽ tạo mã QR tương ứng.</p>
                            <div className="relative mb-6">
                                <span className="absolute left-3 top-3 text-slate-400">₫</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full border rounded-lg p-3 pl-8 focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                                    placeholder="Ví dụ: 5000000"
                                />
                            </div>
                            {amount && <p className="text-right text-slate-600 mb-4">Số tiền: <span className="font-semibold text-blue-600">{formatCurrency(amount)}</span></p>}
                            <div className="flex justify-end gap-2">
                                <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">
                                    Hủy
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={!amount}
                                    className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg flex items-center gap-2 hover:opacity-90 transition disabled:opacity-50"
                                >
                                    Tiếp tục <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-slideIn">
                            <p className="text-sm text-slate-500 mb-4">Dùng ứng dụng ngân hàng để quét mã QR bên dưới.</p>
                            {qrUrl && (
                                <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center">
                                    <img src={qrUrl} alt="QR SePay" className="w-64 h-64 border rounded-lg shadow-md mb-4" />
                                    <button
                                        onClick={() => navigator.clipboard.writeText("NAP_AGENCY123")}
                                        className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm hover:bg-blue-200 transition"
                                    >
                                        Sao chép nội dung chuyển khoản
                                    </button>
                                </div>
                            )}
                            <div className="flex justify-between mt-6">
                                <button
                                    onClick={() => setStep(1)}
                                    className="px-4 py-2 bg-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-300 transition"
                                >
                                    <ArrowLeft size={16} /> Quay lại
                                </button>
                                <button onClick={onClose} className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:opacity-90 transition">
                                    Đóng
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DepositPopup;
