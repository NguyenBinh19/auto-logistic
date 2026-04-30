import React, { useState } from "react";
import { CheckCircle, X, ArrowRight, ArrowLeft, CreditCard } from "lucide-react";

const DepositPopup = ({ onClose }) => {
    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState("");
    const [qrUrl, setQrUrl] = useState(null);
    const [copied, setCopied] = useState(false);

    const agencyId = "AGENCY123";

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

    const handleCopy = () => {
        navigator.clipboard.writeText(`NAP ${agencyId}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-[500px] overflow-hidden animate-in zoom-in duration-200">

                {/* Header */}
                <div className="flex justify-between items-center px-8 py-6 bg-slate-900 text-white">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-xl">
                            <CreditCard size={20} />
                        </div>
                        <span className="font-black uppercase tracking-tighter">Nạp tiền vào ví</span>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition">
                        <X size={24} />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-between px-10 py-6 bg-slate-50/50 border-b border-slate-100">
                    <StepItem active={step >= 1} done={step > 1} label="Nhập tiền" number="1" />
                    <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-4"></div>
                    <StepItem active={step === 2} done={false} label="Quét mã QR" number="2" />
                </div>

                <div className="p-8">
                    {step === 1 ? (
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Số tiền nạp (VND)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-slate-50 border-none rounded-2xl p-5 text-2xl font-black text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                                        placeholder="0"
                                    />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-slate-300 text-xl">₫</span>
                                </div>
                                {amount && (
                                    <p className="mt-3 text-sm font-bold text-blue-600 italic">
                                        Bằng chữ: {formatCurrency(amount)}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button onClick={onClose} className="flex-1 py-4 rounded-2xl font-black text-xs uppercase text-slate-400 hover:bg-slate-50 transition-all">Hủy bỏ</button>
                                <button
                                    onClick={handleNext}
                                    disabled={!amount || amount <= 0}
                                    className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 transition-all"
                                >
                                    Tiếp tục quét mã <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 text-center">
                            <div className="bg-slate-50 p-6 rounded-[32px] inline-block border border-slate-100 shadow-inner">
                                <img src={qrUrl} alt="QR" className="w-56 h-56 mix-blend-multiply" />
                            </div>

                            <div className="space-y-2">
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Nội dung chuyển khoản</p>
                                <div
                                    onClick={handleCopy}
                                    className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex justify-between items-center cursor-pointer group"
                                >
                                    <span className="font-mono font-black text-blue-600 uppercase tracking-widest">NAP {agencyId}</span>
                                    {copied ? <CheckCircle size={18} className="text-emerald-500" /> : <Copy size={18} className="text-blue-400 group-hover:text-blue-600" />}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setStep(1)} className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase text-slate-400 flex items-center justify-center gap-2 hover:bg-slate-50">
                                    <ArrowLeft size={14} /> Quay lại
                                </button>
                                <button onClick={onClose} className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase hover:bg-black transition-all">
                                    Tôi đã chuyển khoản
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const StepItem = ({ active, done, label, number }) => (
    <div className={`flex items-center gap-3 ${active ? "text-slate-900" : "text-slate-300"}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all ${
            done ? "bg-emerald-500 text-white" : active ? "bg-blue-600 text-white" : "bg-slate-200"
        }`}>
            {done ? <CheckCircle size={16} /> : number}
        </div>
        <span className="font-black text-[10px] uppercase tracking-widest">{label}</span>
    </div>
);

export default DepositPopup;