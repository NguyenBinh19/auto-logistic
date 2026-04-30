import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children, roles: requiredRoles }) => {
    const token = localStorage.getItem("accessToken");
    const location = useLocation();

    // Đọc user từ localStorage nhưng ưu tiên dữ liệu từ Token
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    let userRolesStrings = [];
    let currentHotelId = null;
    let currentAgencyId = null;

    try {
        const decoded = jwtDecode(token);

        // 1. Lấy Roles từ Token (Nguồn tin cậy nhất)
        const rawRoles = decoded.scope || decoded.roles || decoded.authorities || [];
        userRolesStrings = Array.isArray(rawRoles)
            ? rawRoles.map(r => (typeof r === 'object' ? r.name : r))
            : rawRoles.split(" ");

        // 2. Lấy ID định danh (Ưu tiên Token > localStorage)
        // Lấy ID từ Token (Cũ)
        const hotelIdFromToken = decoded.hotelId || decoded.hotel_id;
        const agencyIdFromToken = decoded.agencyId || decoded.agency_id;

        // Lấy ID từ localStorage (Mới - do fetchStatus cập nhật)
        const hotelIdFromLocal = storedUser.hotelId;
        const agencyIdFromLocal = storedUser.agencyId;

        // KẾT HỢP: Chỉ cần 1 trong 2 nguồn có ID là hợp lệ
        currentHotelId = hotelIdFromToken || hotelIdFromLocal;
        currentAgencyId = agencyIdFromToken || agencyIdFromLocal;
    } catch (error) {
        console.error("Token decoding failed:", error);
        return <Navigate to="/login" replace />;
    }

    // // 3. Ưu tiên ADMIN - Cho phép vào mọi trang
    // if (userRolesStrings.some(role => role.includes("ADMIN"))) return children;

    // 4. THOÁT LOOP: Luôn cho phép ở lại các trang KYC
    const kycPaths = ["/kyc/status", "/profile"];
    if (kycPaths.some(path => location.pathname.startsWith(path))) {
        return children;
    }

    // 5. Kiểm tra quyền truy cập Route (requiredRoles)
    if (requiredRoles && requiredRoles.length > 0) {
        // Kiểm tra xem User có ít nhất 1 role nằm trong danh sách requiredRoles không
        const isAllowed = requiredRoles.some(role => userRolesStrings.includes(role));
        if (!isAllowed) {
            // Nếu là Admin nhưng đi lạc vào trang Hotel/Agency -> về Admin Dashboard
            if (userRolesStrings.some(role => role.includes("ADMIN"))) {
                return <Navigate to="/admin/dashboard" replace />;
            }
            // Các trường hợp khác về trang chủ
            return <Navigate to="/homepage" replace />;
        }
    }

    // 6. KIỂM TRA TRẠNG THÁI XÁC THỰC (KYC)
    const isHotelRole = userRolesStrings.some(r => r.includes("HOTEL"));
    const isAgencyRole = userRolesStrings.some(r => r.includes("AGENCY"));

    // Cách check: Chỉ cần ID là falsy (null, undefined, "", 0) là chặn
    if (isHotelRole && !currentHotelId) {
        return <Navigate to="/kyc/status" replace />;
    }

    if (isAgencyRole && !currentAgencyId) {
        return <Navigate to="/kyc/status" replace />;
    }

    return children;
};

export default ProtectedRoute;