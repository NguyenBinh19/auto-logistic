import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, X } from "lucide-react";
import api from "../../services/axios.config";

export default function ChatbotPopup() {
    const userId = JSON.parse(sessionStorage.getItem("user"))?.userId || "guest";
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: "bot", content: "Hi 👋 Tôi có thể giúp gì cho bạn?" }
    ]);
    const [input, setInput] = useState("");
    const endRef = useRef(null);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const text = input;

        // 👤 add user message
        setMessages((prev) => [...prev, { role: "user", content: text }]);
        setInput("");

        // 🤖 loading message (UX xịn hơn)
        setMessages((prev) => [
            ...prev,
            { role: "bot", content: "Đang trả lời..." }
        ]);

        try {
            const res = await api.post(
                `/ai?sessionId=${userId}&userId=${userId}`,
                text,
                {
                    headers: {
                        "Content-Type": "text/plain",
                    },
                }
            );

            const reply = res.data;

            // replace loading message
            setMessages((prev) => {
                const newMsgs = [...prev];
                newMsgs[newMsgs.length - 1] = {
                    role: "bot",
                    content: reply,
                };
                return newMsgs;
            });
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                { role: "bot", content: "Lỗi server" },
            ]);
        }
    };

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <>
            {/* Floating Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setOpen(!open)}
                    className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-xl flex items-center justify-center text-white"
                >
                    {open ? <X size={24} /> : <MessageCircle size={24} />}
                </motion.button>
            </div>

            {/* Chat Popup */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.95 }}
                        className="fixed bottom-24 right-6 w-[360px] h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 flex justify-between items-center">
                            <div>
                                <div className="font-semibold">AI Support</div>
                                <div className="text-xs opacity-80">Online</div>
                            </div>
                            <button onClick={() => setOpen(false)}>
                                <X />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 p-3 overflow-y-auto bg-gray-50 space-y-3">
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`px-4 py-2 rounded-2xl max-w-[75%] text-sm shadow-sm ${msg.role === "user"
                                            ? "bg-blue-500 text-white"
                                            : "bg-white"
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            <div ref={endRef} />
                        </div>

                        {/* Input */}
                        <div className="p-3 border-t flex gap-2 bg-white">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                placeholder="Nhập tin nhắn..."
                                className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none"
                            />

                            <button
                                onClick={sendMessage}
                                className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}