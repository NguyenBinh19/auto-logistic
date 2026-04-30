import api from "./axios.config.js"; 

// ============================
// 🔒 AUTH SERVICE
// ============================

// 1. Đăng nhập thường
const login = async (email, password) => {
  try {
    const response = await api.post(`/auth/token`, {
      email,
      password,
    });

    if (response.data && response.data.result.token) { 
      const { token, user } = response.data.result; 
      localStorage.setItem("accessToken", token); 
      return response.data; 
    }
    
    return response.data;
  } catch (error) {
    console.error("Auth Service Login Error:", error);
    throw error; 
  }
};

// 2. Đăng ký (với role selection)
const register = async (username, email, password, phone, role) => {
  try {
    const response = await api.post(`/users/register`, {
      username,
      email,
      password,
      phone,
      role,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 3. Đăng xuất
const logout = (token) => {
  if (token) {
    api.post(`/auth/logout`, { token }).catch(err => console.error(err));
  }
  
  localStorage.removeItem("user");
  localStorage.removeItem("accessToken"); 
  localStorage.removeItem("token"); 
};

// 4. Lấy user từ LocalStorage
const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) return JSON.parse(userStr);
  return null;
};

// 5. Lấy token
const getAccessToken = () => {
  return localStorage.getItem("accessToken") || localStorage.getItem("token");
};

// 6. Quên mật khẩu
const forgotPassword = async (email) => {
  try {
    const response = await api.post(`/auth/forgot-password`, { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 7. Reset mật khẩu
const resetPassword = async (token, newPassword) => {
  try {
    const response = await api.post(`/auth/reset-password`, { token, newPassword });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 8. Xác thực Email OTP
const verifyOtp = async (email, otp) => {
  try {
    const response = await api.post(`/auth/verify-otp`, { email, otp });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 9. Gửi lại OTP
const resendOtp = async (email) => {
  try {
    const response = await api.post(`/auth/resend-otp`, { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 10. Xác thực Email (link - legacy)
const verifyEmail = async (token) => {
  try {
    const response = await api.get(`/auth/verify-email`, { 
        params: { token } 
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const fetchUserProfile = async () => {
  try {
    const response = await api.get('/users/my-info'); 
    const userData = response.data.result;

    if (!userData.roles && userData.authorities) {
      userData.roles = userData.authorities.map(auth => ({
        roleName: auth.authority.replace("ROLE_", "")
      }));
    }

    return userData;
  } catch (error) {
    console.error("Fetch profile error:", error);
    throw error;
  }
};

const unlinkSocialAccount = async (provider) => {
  try {
    const response = await api.delete(`/auth/social/unlink`, {
      params: { provider }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const createPassword = async (password) => {
  try {
    const response = await api.post(`/auth/create-password`, { password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const authService = {
  login,
  register,
  logout,
  getCurrentUser,
  getAccessToken,
  forgotPassword,
  resetPassword,
  verifyOtp,
  resendOtp,
  verifyEmail,
  fetchUserProfile,
  unlinkSocialAccount,
  createPassword,
};