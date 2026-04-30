import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Info } from "lucide-react";

export default function Snackbar({ message, show, onClose }) {
  useEffect(() => {
    if (show) {
      const t = setTimeout(onClose, 2500);
      return () => clearTimeout(t);
    }
  }, [show]);

  if (!show) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[rgb(40,169,224)] text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg"
    >
      <Info size={16} className="inline mr-1 -mt-0.5" />
      {message}
    </motion.div>
  );
}
