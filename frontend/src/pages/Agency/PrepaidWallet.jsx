import React, { useState, useEffect } from "react";
import { Wallet, CreditCard, History, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../services/axios.config";
import DepositPopup from "../../components/common/payment/DepositPopup";

const PrepaidWallet = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [showPopup, setShowPopup] = useState(false);
    const [paymentMode, setPaymentMode] = useState(null);

    const [walletBalance, setWalletBalance] = useState(0);
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const agencyId = user?.agencyId;
    const [transactions, setTransactions] = useState([]);
    const [showDemoInput, setShowDemoInput] = useState(false);
    const [demoAmount, setDemoAmount] = useState("");

    // ================= FETCH TRANSACTIONS =================
    useEffect(() => {
        if (agencyId) {
            api
                .get(`/transaction-history/${agencyId}/transactions/recent?limit=5`)
                .then((res) => {
                    setTransactions(res.data.result || []);
                })
                .catch((err) => console.error("Error fetching transactions:", err));
        }
    }, [agencyId]);

    useEffect(() => {
        if (agencyId) {
            api.get(`/agencies/agency-detail/${agencyId}`)
                .then(res => {
                    const data = res.data.result;
                    setWalletBalance(data.walletBalance || 0);
                })
                .catch(err => {
                    console.error("Error fetching agency detail:", err);
                });
        }
    }, [agencyId]);

    // ================= FORMAT =================
    const formatAmount = (amount, direction) => {
        const formatted = amount.toLocaleString("vi-VN") + " ₫";
        return direction === "IN" ? `+${formatted}` : `-${formatted}`;
    };

    const getIcon = (tx) => {
        if (tx.direction === "IN") return <ArrowDownCircle size={18} className="text-green-600" />;
        if (tx.direction === "OUT" && tx.sourceType === "Wallet") return <ArrowUpCircle size={18} className="text-red-500" />;
        return <CreditCard size={18} className="text-red-500" />;
    };

    const handleDemoPayment = async (amount) => {
        try {
            const res = await api.post("https://www.hmsb2b.site/payment/create", {
                agencyId,
                amount: Number(amount),
            });

            const { checkoutURL, fields } = res.data;

            const form = document.createElement("form");
            form.method = "POST";
            form.action = checkoutURL;

            Object.entries(fields).forEach(([key, value]) => {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = key;
                input.value = value;
                form.appendChild(input);
            });

            document.body.appendChild(form);
            form.submit();

            setShowDemoInput(false);
            setDemoAmount("");

        } catch (err) {
            console.error("Payment error:", err);
        }
    };

    // trigger demo
    useEffect(() => {
        if (paymentMode === "demo") {
            handleDemoPayment();
        }
    }, [paymentMode]);

    return (
        <div className="min-h-screen bg-slate-100 p-8">

            <h1 className="text-2xl font-bold text-slate-800 mb-6">
                Trung tâm tài chính
            </h1>

            {/* NAV */}
            <div className="flex gap-4 mb-8">
                <button
                    onClick={() => navigate("/agency/prepaid")}
                    className={`px-5 py-2 rounded-md flex items-center gap-2 shadow transition
                    ${location.pathname === "/agency/prepaid"
                            ? "bg-blue-600 text-white"
                            : "bg-slate-200 text-slate-700 hover:bg-slate-300"}`}
                >
                    <Wallet size={18} /> Ví trả trước
                </button>

                <button
                    onClick={() => navigate("/agency/credit-wallet")}
                    className={`px-5 py-2 rounded-md flex items-center gap-2 shadow transition
                    ${location.pathname === "/agency/credit-wallet"
                            ? "bg-blue-600 text-white"
                            : "bg-slate-200 text-slate-700 hover:bg-slate-300"}`}
                >
                    <CreditCard size={18} /> Tín dụng
                </button>
            </div>

            {/* WALLET */}
            <h2 className="text-lg font-semibold mb-4">Tổng quan ví</h2>
            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <div className="grid grid-cols-1 gap-6 text-center">
                    <div className="bg-blue-600 rounded-md p-4 shadow-sm flex flex-col items-center text-white">
                        <p className="text-sm opacity-80">Số dư ví khả dụng</p>
                        <p className="text-xl font-bold mb-3">
                            {walletBalance.toLocaleString("vi-VN")} ₫
                        </p>

                        <button
                            className="px-4 py-1.5 bg-white text-blue-600 rounded-md text-sm font-medium shadow"
                            onClick={() => {
                                setShowPopup(true);
                                setPaymentMode(null);
                            }}
                        >
                            Nạp tiền
                        </button>
                    </div>
                </div>
            </div>

            {/* ================= CHỌN MODE ================= */}
            {showPopup && !paymentMode && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow w-80">

                        <h3 className="text-lg font-semibold mb-4 text-center">
                            Chọn chế độ nạp tiền
                        </h3>

                        <button
                            className="w-full bg-blue-600 text-white py-2 rounded mb-2"
                            onClick={() => {
                                setShowPopup(false);
                                setShowDemoInput(true);  
                            }}
                        >
                            Demo (SePay Sandbox)
                        </button>

                        <button
                            className="w-full px-4 py-2 bg-green-600 text-white rounded"
                            onClick={() => setPaymentMode("real")}
                        >
                            Thanh toán thật
                        </button>

                        <button
                            className="mt-3 text-sm text-gray-500 w-full"
                            onClick={() => {
                                setShowPopup(false);
                                setPaymentMode(null);
                            }}
                        >
                            Huỷ
                        </button>
                    </div>
                </div>
            )}

            {/* REAL PAYMENT (GIỮ NGUYÊN) */}
            {showPopup && paymentMode === "real" && (
                <DepositPopup
                    onClose={() => {
                        setShowPopup(false);
                        setPaymentMode(null);
                    }}
                />
            )}

            <h2 className="text-lg font-semibold mb-4">Nạp tiền</h2>
            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <h2 className="text-lg font-semibold mb-6">Nạp tiền</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 rounded-md p-5 shadow-sm flex flex-col items-center text-center">
                        <p className="font-medium mb-1">Phương thức nạp tiền</p>
                        <p className="text-sm text-slate-600">Quét mã QR để nạp tiền</p>
                        <p className="text-xs text-slate-500 mb-3">
                            Quét mã bằng ứng dụng ngân hàng của bạn
                        </p>
                        <div className="w-60 h-60 bg-slate-200 flex items-center justify-center rounded-md border">
                            <img
                                src={`https://qr.sepay.vn/img?acc=0978072004&bank=MBBank&amount=&des=NAP%20${agencyId}&template=compact`}
                                alt="QR Code"
                            />
                        </div>

                    </div>

                    <div className="bg-white rounded-xl p-5 shadow-md flex flex-col h-full">
                        <p className="text-base font-semibold text-slate-800 mb-3 border-b pb-2">
                            Chuyển khoản thủ công
                        </p>

                        <ul className="text-sm text-slate-700 space-y-2 flex-1">
                            <li>🏦 <span className="font-medium">Ngân hàng:</span> MB Bank</li>
                            <li>💳 <span className="font-medium">Số tài khoản:</span> 0978072004</li>
                            <li>👤 <span className="font-medium">Chủ tài khoản:</span> Nguyen Thanh Binh</li>
                            <li>📝 <span className="font-medium">Cú pháp nạp tiền:</span> NAP {agencyId}</li>
                        </ul>

                        <button
                            className="mt-auto w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600
               text-white rounded-lg text-sm font-semibold shadow hover:opacity-90 transition"
                        >
                            Sao chép cú pháp
                        </button>
                    </div>
                </div>
            </div>

            {/* ================= HISTORY ================= */}
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <History size={18} /> Lịch sử biến động (5 giao dịch gần nhất)
            </h2>

            <div className="bg-white shadow rounded-lg p-6">
                <ul className="divide-y divide-slate-200">
                    {transactions.map((tx) => (
                        <li key={tx.id} className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3">
                                {getIcon(tx)}
                                <div className="flex flex-col">
                                    <span className="text-slate-800 font-medium">
                                        {tx.transactionType}
                                    </span>
                                    <span className="text-slate-600 text-sm">
                                        {tx.description}
                                    </span>
                                </div>
                            </div>

                            <span
                                className={`font-semibold ${tx.direction === "IN"
                                    ? "text-green-600"
                                    : "text-red-500"
                                    }`}
                            >
                                {formatAmount(tx.amount, tx.direction)}
                            </span>
                        </li>
                    ))}
                </ul>
                <button
                    onClick={() => navigate("/agency/transaction-history")}
                    className="mt-4 w-full text-blue-600 text-sm font-medium hover:underline"
                >
                    Xem tất cả lịch sử &gt;
                </button>
            </div>
            {showDemoInput && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow w-80">

                        <h3 className="text-lg font-semibold mb-4 text-center">
                            Nhập số tiền demo
                        </h3>

                        <input
                            type="number"
                            className="w-full border p-2 rounded mb-4"
                            placeholder="Ví dụ: 10000"
                            value={demoAmount}
                            onChange={(e) => setDemoAmount(e.target.value)}
                        />

                        <button
                            className="w-full bg-blue-600 text-white py-2 rounded mb-2"
                            onClick={() => handleDemoPayment(demoAmount)}
                            disabled={!demoAmount || Number(demoAmount) <= 0}
                        >
                            Thanh toán demo
                        </button>

                        <button
                            className="w-full text-gray-500 text-sm"
                            onClick={() => {
                                setShowDemoInput(false);
                                setDemoAmount("");
                            }}
                        >
                            Huỷ
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PrepaidWallet;