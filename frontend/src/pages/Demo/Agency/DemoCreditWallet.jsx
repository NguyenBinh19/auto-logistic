import React from "react";
import { Wallet, CreditCard, History, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { MOCK_AGENCY_DATA, MOCK_TRANSACTIONS } from '@/constant/agency_mockData.js';

const DemoCreditWallet = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const {
        creditLimit,
        currentCredit,
        availableCredit,
        dueDate
    } = MOCK_AGENCY_DATA.finance;
    const usedPercent = ((currentCredit / creditLimit) * 100).toFixed(1);

    const transactions = MOCK_TRANSACTIONS;

    const handlePayDebt = async () => {
        const { value: amount } = await Swal.fire({
            title: "Nhập số tiền muốn thanh toán",
            input: "number",
            inputAttributes: { min: 1, step: 1000 },
            showCancelButton: true,
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Hủy",
            confirmButtonColor: "#2563eb",
            text: "Tiền sẽ được trừ vào dư nợ tín dụng hiện tại của đại lý."
        });

        if (amount) {
            Swal.fire({
                icon: "success",
                title: "Thanh toán thành công (Demo)",
                text: `Bạn đã thanh toán ${Number(amount).toLocaleString("vi-VN")} ₫ cho dư nợ tín dụng.`,
                confirmButtonColor: "#2563eb",
            });
        }
    };

    const handleRequestLimit = () => {
        Swal.fire({
            title: "Yêu cầu nới hạn mức",
            text: "Hệ thống sẽ gửi yêu cầu nâng hạn mức tín dụng của bạn tới quản trị viên. Kết quả sẽ có sau 24h làm việc.",
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "Gửi yêu cầu",
            confirmButtonColor: "#2563eb",
        });
    };

    const formatCurrency = (value) => {
        return value?.toLocaleString("vi-VN") + " ₫";
    };

    const formatAmount = (amount, direction) => {
        const formatted = amount?.toLocaleString("vi-VN") + " ₫";
        return direction === "IN" ? `+${formatted}` : `-${formatted}`;
    };

    const getIcon = (tx) => {
        if (tx.direction === "IN") return <ArrowDownCircle size={18} className="text-green-600" />;
        if (tx.direction === "OUT" && tx.sourceType === "Wallet") return <ArrowUpCircle size={18} className="text-red-500" />;
        return <CreditCard size={18} className="text-red-500" />;
    };

    return (
        <div className="min-h-screen bg-slate-100 p-8">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Trung tâm tài chính</h1>
            {/* Điều hướng Tabs */}
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

            {/* Tổng quan tín dụng */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <h2 className="text-lg font-semibold mb-4">Tổng quan tín dụng</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">

                    <div className="bg-green-50 rounded-md p-4 shadow-sm flex flex-col items-center border border-green-100">
                        <p className="text-sm text-slate-600">Sức mua tín dụng còn lại</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(availableCredit)}</p>
                        <p className="text-xs text-slate-500 mt-1 italic">Đã sử dụng {100-usedPercent}% hạn mức</p>
                    </div>

                    <div className="bg-yellow-100 rounded-md p-4 shadow-sm flex flex-col items-center border border-yellow-200">
                        <p className="text-sm text-slate-600">Nợ cần thanh toán</p>
                        <p className="text-2xl font-bold text-orange-600">{formatCurrency(currentCredit)}</p>
                        <p className="text-xs text-slate-500 mt-1 font-medium text-red-600">Hạn chót: {dueDate}</p>
                        <button
                            onClick={handlePayDebt}
                            className="mt-3 px-4 py-1.5 bg-blue-600 text-white rounded-md text-sm font-semibold shadow hover:bg-blue-700 transition w-full max-w-[150px]"
                        >
                            Thanh toán nợ
                        </button>
                    </div>

                    <div className="bg-blue-50 rounded-md p-4 shadow-sm flex flex-col items-center border border-blue-100">
                        <p className="text-sm text-slate-600">Tổng hạn mức được cấp</p>
                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(creditLimit)}</p>
                    </div>

                </div>
            </div>

            {/* Lịch sử giao dịch */}
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 italic">
                <History size={18} /> Lịch sử biến động hạn mức
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
                                    <span className="text-slate-500 text-xs mt-0.5">{tx.description}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span
                                    className={`font-bold ${tx.direction === "IN" ? "text-green-600" : "text-red-500"}`}
                                >
                                    {formatAmount(tx.amount, tx.direction)}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">{tx.createdAt}</span>
                            </div>
                        </li>
                    ))}
                </ul>
                <button
                    onClick={() => navigate("/demo-agency/transaction-history")}
                    className="mt-4 w-full text-blue-600 text-sm font-bold hover:underline py-2"
                >
                    Xem toàn bộ lịch sử tín dụng &gt;
                </button>
            </div>
        </div>
    );
};

export default DemoCreditWallet;