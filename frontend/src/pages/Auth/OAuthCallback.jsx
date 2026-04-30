import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithOAuth2 } = useAuth();

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      setStatus("error");
      setErrorMsg(decodeURIComponent(error));
      return;
    }

    if (!token) {
      setStatus("error");
      setErrorMsg("Không tìm thấy token xác thực.");
      return;
    }

    const processLogin = async () => {
      try {
        const success = await loginWithOAuth2(token);
        if (success) {
          setStatus("success");
          // Check if user has roles - if not, redirect to role selection
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          const hasRoles = user.roles && user.roles.length > 0;
          if (!hasRoles) {
            setTimeout(() => navigate("/select-role", { replace: true }), 1000);
          } else {
            setTimeout(() => navigate("/", { replace: true }), 1000);
          }
        } else {
          setStatus("error");
          setErrorMsg("Đăng nhập thất bại. Vui lòng thử lại.");
        }
      } catch {
        setStatus("error");
        setErrorMsg("Có lỗi xảy ra khi xử lý đăng nhập.");
      }
    };

    processLogin();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center p-10 bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
        {status === "loading" && (
          <>
            <Loader2 size={48} className="animate-spin text-emerald-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Đang xử lý đăng nhập...</h2>
            <p className="text-slate-500">Vui lòng đợi trong giây lát.</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Đăng nhập thành công!</h2>
            <p className="text-slate-500">Đang chuyển hướng...</p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle size={48} className="text-rose-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Đăng nhập thất bại</h2>
            <p className="text-slate-500 mb-6">{errorMsg}</p>
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-colors"
            >
              Quay lại đăng nhập
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
