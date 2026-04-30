import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, CheckCheck, Loader2, AlertCircle } from "lucide-react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";
import { notificationService } from "@/services/notification.service";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const WS_URL =
    import.meta.env.VITE_REACT_APP_API_URL?.replace(/\/+$/, "") ||
    "http://localhost:8080/hms";

const CATEGORY_COLORS = {
    BOOKING: "bg-blue-100 text-blue-600",
    PAYMENT: "bg-green-100 text-green-600",
    FINANCIAL: "bg-emerald-100 text-emerald-600",
    KYC: "bg-amber-100 text-amber-600",
    COMMISSION: "bg-purple-100 text-purple-600",
    FEEDBACK: "bg-orange-100 text-orange-600",
    HOTEL: "bg-indigo-100 text-indigo-600",
    AGENCY: "bg-cyan-100 text-cyan-600",
    RANK: "bg-yellow-100 text-yellow-700",
    SYSTEM: "bg-slate-200 text-slate-600",
    PARTNER: "bg-rose-100 text-rose-600",
    PROMOTION: "bg-pink-100 text-pink-600",
};

const NotificationBell = () => {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const dropdownRef = useRef(null);
    const stompRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Fetch unread count on mount
    useEffect(() => {
        notificationService
            .getUnreadCount()
            .then((r) => setUnreadCount(r.unreadCount))
            .catch(() => {});
    }, []);

    // WebSocket connection
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const client = new Client({
            webSocketFactory: () => new SockJS(`${WS_URL}/ws`),
            connectHeaders: { Authorization: `Bearer ${token}` },
            reconnectDelay: 5000,
            onConnect: () => {
                client.subscribe("/user/queue/notifications", (message) => {
                    const notif = JSON.parse(message.body);
                    setNotifications((prev) => [notif, ...prev]);
                    setUnreadCount((c) => c + 1);
                });
            },
            onStompError: (frame) => {
                console.error("STOMP error:", frame.headers["message"]);
            },
        });

        client.activate();
        stompRef.current = client;

        return () => {
            if (stompRef.current) {
                stompRef.current.deactivate();
            }
        };
    }, []);

    // Load notifications when opening dropdown
    const loadNotifications = useCallback(
        async (pageNum = 0) => {
            setLoading(true);
            setError(false);
            try {
                const data = await notificationService.getNotifications(pageNum, 20);
                if (pageNum === 0) {
                    setNotifications(data.content);
                } else {
                    setNotifications((prev) => [...prev, ...data.content]);
                }
                setHasMore(!data.last);
                setPage(pageNum);
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const handleToggle = () => {
        const next = !open;
        setOpen(next);
        if (next) {
            loadNotifications(0);
        }
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            loadNotifications(page + 1);
        }
    };

    const handleClickNotification = async (notif) => {
        if (!notif.isRead) {
            try {
                await notificationService.markAsRead(notif.id);
                setNotifications((prev) =>
                    prev.map((n) =>
                        n.id === notif.id ? { ...n, isRead: true } : n
                    )
                );
                setUnreadCount((c) => Math.max(0, c - 1));
            } catch {
                // silent
            }
        }
        setOpen(false);
        if (notif.targetUrl) {
            // Always navigate as absolute path to avoid relative-resolution bugs
            // (e.g. clicking the same notif from different routes leading to broken URLs).
            let url = String(notif.targetUrl).trim();
            if (!/^https?:\/\//i.test(url) && !url.startsWith("/")) {
                url = "/" + url;
            }
            navigate(url);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true }))
            );
            setUnreadCount(0);
toast.success("Đã đánh dấu đọc tất cả thông báo");
        } catch {
toast.error("Không thể đánh dấu đọc tất cả");        }
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "Just now";
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell button */}
            <button
                onClick={handleToggle}
                className="relative p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
                title="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 leading-none">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 mt-3 w-[380px] max-h-[480px] bg-white border border-slate-100 rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-150">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                        <h3 className="text-sm font-black text-slate-800">
                            Thông báo
                        </h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                <CheckCheck size={14} />
                                Đánh dấu đã đọc tất cả
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto">
                        {error && !loading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                <AlertCircle size={32} className="mb-2 opacity-40 text-red-400" />
                                <span className="text-sm font-medium text-red-500">
                                    Không thể tải thông báo
                                </span>
                                <button
                                    onClick={() => loadNotifications(0)}
                                    className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-700"
                                >
                                  Thử lại
                                </button>
                            </div>
                        ) : notifications.length === 0 && !loading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                <Bell size={32} className="mb-2 opacity-40" />
                                <span className="text-sm font-medium">
                                    Bạn đã đọc hết thông báo!
                                </span>
                            </div>
                        ) : (
                            <>
                                {notifications.map((notif) => (
                                    <button
                                        key={notif.id}
                                        onClick={() =>
                                            handleClickNotification(notif)
                                        }
                                        className={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 ${
                                            !notif.isRead ? "bg-blue-50/50" : ""
                                        }`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span
                                                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide ${
                                                        CATEGORY_COLORS[
                                                            notif.category
                                                        ] ||
                                                        "bg-slate-100 text-slate-500"
                                                    }`}
                                                >
                                                    {notif.category}
                                                </span>
                                                <span className="text-[10px] text-slate-400 ml-auto whitespace-nowrap">
                                                    {formatTime(
                                                        notif.createdAt
                                                    )}
                                                </span>
                                            </div>
                                            <p className="text-sm font-bold text-slate-800 truncate">
                                                {notif.title}
                                            </p>
                                            <p className="text-xs text-slate-500 truncate">
                                                {notif.message}
                                            </p>
                                        </div>
                                        {!notif.isRead && (
                                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                                        )}
                                    </button>
                                ))}
                                {hasMore && (
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={loading}
                                        className="w-full py-3 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-1"
                                    >
                                        {loading ? (
                                            <Loader2
                                                size={14}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            "Xem thêm"
                                        )}
                                    </button>
                                )}
                            </>
                        )}
                        {loading && notifications.length === 0 && (
                            <div className="flex items-center justify-center py-12">
                                <Loader2
                                    size={24}
                                    className="animate-spin text-blue-500"
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
