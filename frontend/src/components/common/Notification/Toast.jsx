import React from "react";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Info, AlertTriangle } from "lucide-react";

export default function Toast({ message, type = "info", onClose, autoClose, autoCloseTime }) {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose(); // Lệnh này sẽ báo cho Portal biết để xóa Toast này đi
      }, autoCloseTime);
      return () => clearTimeout(timer); // Dọn dẹp nếu người dùng đóng thủ công
    }
  }, [autoClose, autoCloseTime, onClose]);

  const styles = {
    success: {
      bg: "bg-emerald-50 border-emerald-500 text-emerald-800",
      icon: <CheckCircle size={18} className="text-emerald-500" />,
    },
    error: {
      bg: "bg-rose-50 border-rose-500 text-rose-800",
      icon: <XCircle size={18} className="text-rose-500" />,
    },
    info: {
      bg: "bg-sky-50 border-sky-500 text-sky-800",
      icon: <Info size={18} className="text-sky-500" />,
    },
    warning: {
      bg: "bg-amber-50 border-amber-500 text-amber-800",
      icon: <AlertTriangle size={18} className="text-amber-600" />,
    },
  };

  return (
      <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`flex items-center gap-3 border-l-4 px-4 py-3 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] ${styles[type].bg} transition-all`}
      >
        {styles[type].icon}
        <p className="text-sm font-medium">{message}</p>
      </motion.div>
  );
}
