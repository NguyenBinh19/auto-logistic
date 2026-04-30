import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import ReactDOM from "react-dom";
import Toast from "./Toast";

const ToastPortal = forwardRef(({ autoClose = false, autoCloseTime = 3000 }, ref) => {
  const [toasts, setToasts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [portalId] = useState("toast-portal-root");

  // 1. Tạo div root để mount portal nếu chưa có
  useEffect(() => {
    let div = document.getElementById(portalId);
    if (!div) {
        div = document.createElement("div");
        div.id = portalId;
        // Style cố định vị trí hiển thị thông báo (Góc trên bên phải)
        div.style = "position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;";
        document.body.appendChild(div);
    }
    setLoaded(true);
    
    // Cleanup khi unmount (Tuỳ chọn, thường Portal root nên giữ nguyên)
    // return () => document.body.removeChild(div); 
  }, [portalId]);

  // 2. Hàm xóa toast theo ID
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 3. Public hàm addMessage ra ngoài cho cha dùng (thông qua ref)
  useImperativeHandle(ref, () => ({
    addMessage(toast) {
      // toast ở đây là object { mode: 'success', message: '...' } từ UserManagementPage gửi vào
      const id = Date.now() + Math.random(); // Tạo ID unique
      setToasts((prev) => [...prev, { ...toast, id }]);
    },
  }));

  // 4. Render
  if (!loaded) return null;

  return ReactDOM.createPortal(
    <div className="toast-container">
      {toasts.map((t) => (
        <Toast
          key={t.id}
          mode={t.mode} // 'success', 'error', 'info', 'warning'
          message={t.message}
          onClose={() => removeToast(t.id)}
          autoClose={autoClose}
          autoCloseTime={autoCloseTime}
        />
      ))}
    </div>,
    document.getElementById(portalId)
  );
});

export default ToastPortal;