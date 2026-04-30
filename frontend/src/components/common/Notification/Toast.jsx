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
      bg: "bg-green-50 border-green-400 text-green-700",
      icon: <CheckCircle size={18} className="text-green-500" />,
    },
    error: {
      bg: "bg-red-50 border-red-400 text-red-700",
      icon: <XCircle size={18} className="text-red-500" />,
    },
    info: {
      bg: "bg-[rgb(40,169,224,0.1)] border-[rgb(40,169,224,0.4)] text-[rgb(40,169,224)]",
      icon: <Info size={18} className="text-[rgb(40,169,224)]" />,
    },
    warning: {
      bg: "bg-yellow-50 border-yellow-400 text-yellow-700",
      icon: <AlertTriangle size={18} className="text-yellow-500" />,
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`flex items-center gap-3 border-l-4 px-4 py-3 rounded-xl shadow-sm ${styles[type].bg} transition-all`}
    >
      {styles[type].icon}
      <p className="text-sm font-medium">{message}</p>
    </motion.div>
  );
}
