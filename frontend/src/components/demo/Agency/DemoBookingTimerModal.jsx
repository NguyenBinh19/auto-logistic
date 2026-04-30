import React, { useState, useEffect } from "react";
import { parseISO, differenceInSeconds } from "date-fns";
import { Clock, RefreshCw, Loader2 } from "lucide-react";

export default function BookingTimerBar({
                                            expiredAt,
                                            onExpire,
                                            onExtend,
                                            isExtending,
                                            extendCount = 0,
                                            maxExtensions = 3
                                        }) {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (!expiredAt) return;

        const tick = () => {
            const now = new Date();
            // Xử lý múi giờ Z đồng bộ với code chính để tránh nhảy thời gian
            const end = typeof expiredAt === "string"
                ? (expiredAt.endsWith('Z') ? parseISO(expiredAt) : parseISO(expiredAt + 'Z'))
                : expiredAt;

            const diff = differenceInSeconds(end, now);

            if (diff <= 0) {
                setTimeLeft(0);
                if (!isExtending) onExpire();
            } else {
                setTimeLeft(diff);
            }
        };

        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [expiredAt, onExpire, isExtending]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    // isLowTime dùng để đổi màu nền sang đỏ nhạt khi dưới 60 giây
    const isLowTime = timeLeft > 0 && timeLeft < 60;

    // Không render nếu hết thời gian và không đang gia hạn
    if (timeLeft <= 0 && !isExtending) return null;

    return (
        <div className={`sticky top-[64px] z-[100] w-full border-b transition-all duration-300 backdrop-blur-md ${
            isLowTime
                ? 'bg-red-600 text-white shadow-red-200/50'
                : 'bg-white/95 text-slate-800 shadow-slate-200/50'
        } shadow-sm`}>

            <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-3">
                <Clock
                    size={16}
                    className={isLowTime ? "text-white animate-pulse" : "text-orange-500"}
                />

                <span className={`text-sm font-medium ${isLowTime ? 'text-white' : 'text-slate-600'}`}>
                    Phòng được giữ trong:
                </span>

                <span className={`font-bold text-lg tabular-nums ${
                    isLowTime ? "text-white" : "text-blue-600"
                }`}>
                    {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                </span>

                <div className="ml-auto flex items-center gap-3">
                    <span className={`text-[10px] font-black uppercase tracking-tighter ${
                        isLowTime ? 'text-white/80' : 'text-slate-400'
                    }`}>
                        Gia hạn: {extendCount}/{maxExtensions}
                    </span>

                    {(isLowTime || isExtending) && extendCount < maxExtensions && (
                        <button
                            onClick={onExtend}
                            disabled={isExtending}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 disabled:opacity-50 ${
                                isLowTime
                                    ? 'bg-white text-red-600 hover:bg-slate-100'
                                    : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                        >
                            {isExtending ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                            GIA HẠN
                        </button>
                    )}
                </div>
            </div>

        </div>
    );
}