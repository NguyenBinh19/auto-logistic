import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../services/axios.config.js";
import { Building2, Briefcase, Loader2 } from "lucide-react";

const SelectRole = () => {
    const navigate = useNavigate();
    const { currentUser, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // If user already has roles, redirect away
    if (currentUser?.roles?.length > 0) {
        navigate("/", { replace: true });
        return null;
    }

    const handleSelectRole = async (role) => {
        setLoading(true);
        setError("");
        try {
            const response = await api.post("/users/select-role", { role });
            const updatedUser = response.data.result;
            updateUser(updatedUser);
            navigate("/", { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || "Chọn loại tài khoản thất bại. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="max-w-lg w-full mx-4">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-black text-slate-800 mb-2">Chọn loại tài khoản</h1>
                    <p className="text-slate-500">Vui lòng chọn loại tài khoản để tiếp tục sử dụng hệ thống</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm text-center">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <button
                        onClick={() => handleSelectRole("HOTEL_MANAGER")}
                        disabled={loading}
                        className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl border-2 border-transparent hover:border-blue-500 transition-all text-center disabled:opacity-50"
                    >
                        <Building2 size={48} className="mx-auto mb-4 text-blue-500 group-hover:scale-110 transition-transform" />
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Khách sạn</h3>
                        <p className="text-sm text-slate-500">Quản lý khách sạn,phòng,giá và đơn đặt hàng</p>
                    </button>

                    <button
                        onClick={() => handleSelectRole("AGENCY_MANAGER")}
                        disabled={loading}
                        className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl border-2 border-transparent hover:border-emerald-500 transition-all text-center disabled:opacity-50"
                    >
                        <Briefcase size={48} className="mx-auto mb-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Đại lý</h3>
                        <p className="text-sm text-slate-500">Đặt phòng, quản lý đơn hàng và khách hàng</p>
                    </button>
                </div>

                {loading && (
                    <div className="flex items-center justify-center mt-6 gap-2 text-slate-500">
                        <Loader2 size={20} className="animate-spin" />
                        <span>Đang xử lý</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SelectRole;
