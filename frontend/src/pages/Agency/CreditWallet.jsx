import React, { useState, useEffect } from "react";
import { Wallet, CreditCard, ArrowDownCircle, ArrowUpCircle, ExternalLink, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../services/axios.config";
import { pdfDocumentService } from "@/services/pdf.service.js";
import Swal from "sweetalert2";

const CreditWallet = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const agencyId = user?.agencyId;

  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({});

  // ================= FORMAT =================
  const formatAmount = (amount, direction) => {
    const formatted = amount?.toLocaleString("vi-VN") + " ₫";
    return direction === "IN" ? `+${formatted}` : `-${formatted}`;
  };

  const formatCurrency = (value) => {
    if (!value) return "0 ₫";
    return value.toLocaleString("vi-VN") + " ₫";
  };

  const formatPercent = (value) => {
    if (!value) return "0%";
    return (value * 100).toFixed(2) + "%";
  };

  // ================= STATUS =================
  const getStatusColor = (status) => {
    switch (status) {
      case "WARNING":
        return "text-yellow-600";
      case "LOCKED":
        return "text-red-600";
      case "LEGAL":
        return "text-red-800";
      default:
        return "text-green-600";
    }
  };

  const [showPdfModal, setShowPdfModal] = useState(false);
  const [policyUrl, setPolicyUrl] = useState("");
  const [isPdfLoading, setIsPdfLoading] = useState(true);

  // Tải link PDF chính sách tín dụng
  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const pdfRes = await api.get("/pdf-documents");
        if (pdfRes?.data?.result) {
          const policyDoc = pdfRes.data.result.find(doc =>
            doc.title.includes("Phụ lục tín dụng") ||
            doc.title.includes("thanh toán công nợ")
          );
          setPolicyUrl(policyDoc?.fileUrl || "");
        }
      } catch (error) {
        console.error("Không thể tải chính sách tín dụng:", error);
      }
    };
    fetchPolicy();
  }, []);

  // Khóa cuộn trang khi mở modal
  useEffect(() => {
    document.body.style.overflow = showPdfModal ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [showPdfModal]);

  const getStatusLabel = (status) => {
    switch (status) {
      case "WARNING":
        return "Cảnh báo";
      case "LOCKED":
        return "Đã khóa";
      case "LEGAL":
        return "Xử lý pháp lý";
      default:
        return "Bình thường";
    }
  };

  // ================= ICON =================
  const getIcon = (tx) => {
    if (tx.direction === "IN")
      return <ArrowDownCircle size={18} className="text-green-600" />;
    if (tx.direction === "OUT" && tx.sourceType === "Wallet")
      return <ArrowUpCircle size={18} className="text-red-500" />;
    return <CreditCard size={18} className="text-red-500" />;
  };

  // ================= PAY =================
  const handlePayDebt = async () => {
    const maxDebt = Number(summary.debt || 0);

    const { value: amount } = await Swal.fire({
      title: "Nhập số tiền muốn thanh toán",
      input: "number",
      inputAttributes: {
        min: 1,
        step: 1
      },
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy",
      text: `Tối đa: ${maxDebt.toLocaleString("vi-VN")} ₫`,
      footer: `<button id="pay-all-btn" style="
      background:#16a34a;
      color:white;
      border:none;
      padding:6px 12px;
      border-radius:6px;
      cursor:pointer;
      font-size:12px;
    ">
    Thanh toán tất cả
  </button>`,

      didOpen: () => {
        const input = Swal.getInput();

        input.addEventListener("input", () => {
          let value = Number(input.value);

          if (value <= 0) input.value = "";
          if (value > maxDebt) input.value = maxDebt;
        });

        const btn = document.getElementById("pay-all-btn");

        btn.addEventListener("click", () => {
          Swal.close();

          api.post(`/agencies/${agencyId}/pay-debt?payment=${maxDebt}`)
            .then(() => {
              return Swal.fire({
                icon: "success",
                title: "Thanh toán thành công",
                text: `Đã thanh toán toàn bộ ${maxDebt.toLocaleString("vi-VN")} ₫`,
              });
            })
            .then(() => api.get(`/agencies/${agencyId}/credit-summary`))
            .then((res) => setSummary(res.data.result || {}))
            .catch((err) => {
              Swal.fire({
                icon: "error",
                title: "Thanh toán thất bại",
                text: err.response?.data?.message || err.message,
              });
            });
        });
      },

      inputValidator: (value) => {
        if (!value) return "Vui lòng nhập số tiền";

        const num = Number(value);

        if (num <= 0) return "Số tiền phải lớn hơn 0";

        if (num > maxDebt) {
          return `Không được vượt quá ${maxDebt.toLocaleString("vi-VN")} ₫`;
        }

        return null;
      }
    });

    if (amount) {
      api.post(`/agencies/${agencyId}/pay-debt?payment=${amount}`)
        .then(() => {
          Swal.fire({
            icon: "success",
            title: "Thanh toán thành công",
            text: `Bạn đã thanh toán ${Number(amount).toLocaleString("vi-VN")} ₫`,
            confirmButtonColor: "#3085d6",
          });
          return api.get(`/agencies/${agencyId}/credit-summary`);
        })
        .then((res) => setSummary(res.data.result || {}))
        .catch((err) => {
          Swal.fire({
            icon: "error",
            title: "Thanh toán thất bại",
            text: err.response?.data?.message || err.message,
            confirmButtonColor: "#d33",
          });
        });
    }
  };

  // ================= FETCH =================
  useEffect(() => {
    if (agencyId) {
      api.get(`/transaction-history/${agencyId}/transactions/recent?limit=5`)
        .then((res) => setTransactions(res.data.result || []))
        .catch(console.error);

      api.get(`/agencies/${agencyId}/credit-summary`)
        .then((res) => setSummary(res.data.result || {}))
        .catch(console.error);
    }
  }, [agencyId]);

  // ================= UI =================
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

      {/* SUMMARY */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Tổng quan tín dụng</h2>

        <div className="flex justify-between items-center mb-6">
          {/* Nút Xem chính sách */}
          {policyUrl && (
            <button
              onClick={() => setShowPdfModal(true)}
              className="flex items-center gap-2 text-[11px] font-black text-black-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-all uppercase tracking-wider"
            >
              <ExternalLink size={14} /> Phụ lục công nợ
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-6 text-center">

          {/* REMAINING */}
          <div className="bg-green-50 rounded-md p-4 shadow-sm">
            <p className="text-sm text-slate-600">Sức mua còn lại</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.remainingCredit)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Đã sử dụng {summary.usedPercent}%
            </p>
          </div>

          {/* DEBT */}
          <div className="bg-yellow-100 rounded-md p-4 shadow-sm flex flex-col gap-2 relative group">

            {/* HEADER */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">Nợ cần thanh toán</p>

              {/* ICON HOVER */}
              {summary.lateDays > 0 && (
                <div className="relative">
                  <span className="cursor-pointer text-slate-500 hover:text-slate-700">
                    ⓘ
                  </span>

                  {/* TOOLTIP */}
                  <div className="absolute right-0 mt-2 w-56 bg-white text-xs text-slate-700
                        shadow-lg rounded-md p-3 opacity-0 group-hover:opacity-100
                        pointer-events-none transition z-10">
                    <p>Quá hạn: <b>{summary.lateDays} ngày</b></p>
                    <p>Ngày làm việc: <b>{summary.lateWorkingDays}</b></p>
                    <p>Lãi suất: <b>{formatPercent(summary.penaltyRate)} / ngày</b></p>
                    <p className="text-red-500 font-semibold mt-1">
                      Lãi phạt: {formatCurrency(summary.penaltyAmount)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* AMOUNT */}
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(summary.debt)}
            </p>

            {/* FOOTER */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Hạn: {summary.dueDate}
              </span>

              {/* STATUS BADGE */}
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(summary.status)}`}>
                {getStatusLabel(summary.status)}
              </span>
            </div>

            {/* WARNING */}
            {summary.status === "LOCKED" && (
              <p className="text-xs text-red-600 font-bold">
                Tài khoản đã bị khóa
              </p>
            )}

            {/* BUTTON */}
            <button
              onClick={handlePayDebt}
              className="mt-2 px-4 py-1.5 bg-blue-600 text-white rounded-md text-sm shadow hover:bg-blue-700 transition"
            >
              Thanh toán nợ
            </button>
          </div>

          {/* LIMIT */}
          <div className="bg-blue-50 rounded-md p-4 shadow-sm">
            <p className="text-sm text-slate-600">Hạn mức tín dụng</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(summary.creditLimit)}
            </p>
          </div>

        </div>
      </div>

      {/* TRANSACTIONS */}
      <div className="bg-white shadow rounded-lg p-6">
        <ul className="divide-y divide-slate-200">
          {transactions.map((tx) => (
            <li key={tx.id} className="flex justify-between py-3">
              <div className="flex items-center gap-3">
                {getIcon(tx)}
                <div>
                  <span className="font-medium">{tx.transactionType}</span>
                  <div className="text-sm text-slate-500">
                    {tx.description}
                  </div>
                </div>
              </div>

              <span
                className={`font-semibold ${tx.direction === "IN"
                  ? "text-green-600"
                  : "text-red-500"}`}
              >
                {formatAmount(tx.amount, tx.direction)}
              </span>
            </li>
          ))}
        </ul>

        <button
          onClick={() => navigate("/agency/transaction-history")}
          className="mt-4 w-full text-blue-600 text-sm hover:underline"
        >
          Xem tất cả lịch sử &gt;
        </button>
      </div>
      {/* MODAL PDF CHÍNH SÁCH TÍN DỤNG */}
      {showPdfModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-5xl h-full md:h-[94vh] md:rounded-[32px] overflow-hidden shadow-2xl flex flex-col relative animate-in zoom-in duration-300">
            {/* Header Modal - Nút điều hướng */}
            <div className="absolute top-4 right-4 z-[100] flex items-center gap-2">
              <a
                href={policyUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-white/90 backdrop-blur-md text-slate-500 hover:text-blue-600 rounded-xl border border-slate-200 shadow-sm transition-all active:scale-95"
                title="Mở trong tab mới"
              >
                <ExternalLink size={18} />
              </a>
              <button
                onClick={() => {
                  setShowPdfModal(false);
                  setIsPdfLoading(true);
                }}
                className="p-2.5 bg-slate-900/90 backdrop-blur-md text-white hover:bg-red-500 rounded-xl shadow-lg transition-all active:scale-95"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 bg-slate-100 relative overflow-hidden">
              {policyUrl ? (
                <div className="w-full h-full overflow-hidden">
                  <object
                    data={`${policyUrl}#navpanes=0&view=FitH&toolbar=0`}
                    type="application/pdf"
                    style={{
                      width: '100%',
                      height: 'calc(100% + 40px)',
                      marginTop: '-40px'
                    }}
                    className="relative z-10"
                    onLoad={() => setIsPdfLoading(false)}
                  >
                    <iframe
                      src={`${policyUrl}#navpanes=0&view=FitH&toolbar=0`}
                      className="w-full h-full border-none"
                      title="Credit Policy Preview"
                      onLoad={() => setIsPdfLoading(false)}
                    />
                  </object>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-white">
                  <p className="text-sm font-medium">Tài liệu chính sách chưa khả dụng.</p>
                </div>
              )}

              {isPdfLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-[20] bg-slate-50">
                  <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-3"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
                    Đang tải phụ lục tín dụng...
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditWallet;
