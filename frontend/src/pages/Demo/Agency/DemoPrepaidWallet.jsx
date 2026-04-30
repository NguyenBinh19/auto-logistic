import React, { useState, useEffect } from "react";
import { Wallet, CreditCard, History, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { MOCK_AGENCY_DATA, MOCK_TRANSACTIONS } from '@/constant/agency_mockData.js';
import DepositPopup from "@/components/demo/Agency/DemoDepositPopup.jsx";

const DemoPrepaidWallet = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showPopup, setShowPopup] = useState(false);

    const walletBalance = MOCK_AGENCY_DATA.finance.walletBalance;
    const transactions = MOCK_TRANSACTIONS;
    const agencyId = "AGENCY123"; // ID cố định cho Demo

    const formatAmount = (amount, direction) => {
        const formatted = amount.toLocaleString("vi-VN") + " ₫";
        return direction === "IN" ? `+${formatted}` : `-${formatted}`;
    };

    const getIcon = (tx) => {
        if (tx.direction === "IN") return <ArrowDownCircle size={18} className="text-green-600" />;
        if (tx.direction === "OUT" && tx.sourceType === "Wallet") return <ArrowUpCircle size={18} className="text-red-500" />;
        return <CreditCard size={18} className="text-red-500" />;
    };

    return (
        <div className="min-h-screen bg-slate-100 p-8">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">
                Trung tâm tài chính
            </h1>

            <div className="flex gap-4 mb-8">
                <button
                    onClick={() => navigate("/demo-agency/prepaid")}
                    className={`px-5 py-2 rounded-md flex items-center gap-2 shadow transition
                    ${location.pathname.includes("prepaid")
                        ? "bg-blue-600 text-white"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"}`}
                >
                    <Wallet size={18} /> Ví trả trước
                </button>

                <button
                    onClick={() => navigate("/demo-agency/credit")}
                    className={`px-5 py-2 rounded-md flex items-center gap-2 shadow transition
                    ${location.pathname.includes("credit")
                        ? "bg-blue-600 text-white"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"}`}
                >
                    <CreditCard size={18} /> Tín dụng
                </button>
            </div>

            <h2 className="text-lg font-semibold mb-4">Tổng quan ví</h2>
            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <div className="grid grid-cols-1 gap-6 text-center">
                    <div className="bg-blue-600 rounded-md p-4 shadow-sm flex flex-col items-center text-white">
                        <p className="text-sm opacity-80">Số dư ví khả dụng</p>
                        <p className="text-xl font-bold mb-3">{walletBalance.toLocaleString("vi-VN")} ₫</p>
                        <button
                            className="px-4 py-1.5 bg-white text-blue-600 rounded-md text-sm font-medium shadow hover:bg-blue-50 transition"
                            onClick={() => setShowPopup(true)}
                        >
                            Nạp tiền
                        </button>
                    </div>
                    {/*<div className="bg-slate-50 rounded-md p-4 shadow-sm">*/}
                    {/*    <p className="text-sm text-slate-500">Tổng tài sản ví</p>*/}
                    {/*    <p className="text-xl font-bold text-blue-600">*/}
                    {/*        {(walletBalance + 20000000).toLocaleString("vi-VN")} ₫*/}
                    {/*    </p>*/}
                    {/*    <p className="text-xs text-slate-400 mt-2">*/}
                    {/*        (Số dư khả dụng + Tiền đang tạm giữ)*/}
                    {/*    </p>*/}
                    {/*</div>*/}
                </div>
            </div>

            <h2 className="text-lg font-semibold mb-4">Nạp tiền</h2>
            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 rounded-md p-5 shadow-sm flex flex-col items-center text-center">
                        <p className="font-medium mb-1">Phương thức nạp tiền</p>
                        <p className="text-sm text-slate-600">Quét mã QR để nạp tiền</p>
                        <p className="text-xs text-slate-500 mb-3">
                            Quét mã bằng ứng dụng ngân hàng của bạn
                        </p>
                        <div className="w-60 h-60 bg-white flex items-center justify-center rounded-md border p-2">
                            <img
                                src={`https://qr.sepay.vn/img?acc=0978072004&bank=MBBank&amount=&des=NAP%20${agencyId}&template=compact`}
                                alt="QR Code"
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col h-full">
                        <p className="text-base font-semibold text-slate-800 mb-3 border-b pb-2">
                            Chuyển khoản thủ công
                        </p>

                        <ul className="text-sm text-slate-700 space-y-3 flex-1 pt-2">
                            <li>🏦 <span className="font-medium">Ngân hàng:</span> MB Bank</li>
                            <li>💳 <span className="font-medium">Số tài khoản:</span> 0978072004</li>
                            <li>👤 <span className="font-medium">Chủ tài khoản:</span> Nguyen Thanh Binh</li>
                            <li>📝 <span className="font-medium">Cú pháp nạp tiền:</span> <span className="font-bold text-blue-600">NAP {agencyId}</span></li>
                        </ul>

                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(`NAP ${agencyId}`);
                                alert("Đã sao chép cú pháp!");
                            }}
                            className="mt-6 w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600
                                       text-white rounded-lg text-sm font-semibold shadow hover:opacity-90 transition"
                        >
                            Sao chép cú pháp
                        </button>
                    </div>
                </div>
            </div>

            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <History size={18} /> Lịch sử biến động (5 giao dịch gần nhất)
            </h2>

            <div className="bg-white shadow rounded-lg p-6">
                <ul className="divide-y divide-slate-200">
                    {transactions.map((tx) => (
                        <li key={tx.id} className="flex items-center justify-between py-3 hover:bg-slate-50 transition px-2 rounded-lg">
                            <div className="flex items-center gap-3">
                                {getIcon(tx)}
                                <div className="flex flex-col">
                                    <span className="text-slate-800 font-medium leading-tight">
                                        {tx.transactionType}
                                    </span>
                                    <span className="text-slate-500 text-xs mt-1">{tx.description}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span
                                    className={`font-bold ${tx.direction === "IN" ? "text-green-600" : "text-red-500"}`}
                                >
                                    {formatAmount(tx.amount, tx.direction)}
                                </span>
                                <span className="text-[10px] text-slate-400">{tx.createdAt}</span>
                            </div>
                        </li>
                    ))}
                </ul>
                <button
                    onClick={() => navigate("/demo-agency/transaction-history")}
                    className="mt-4 w-full text-blue-600 text-sm font-medium hover:underline py-2"
                >
                    Xem tất cả lịch sử &gt;
                </button>
            </div>

            {showPopup && <DepositPopup onClose={() => setShowPopup(false)} />}
        </div>
    );
};

export default DemoPrepaidWallet;