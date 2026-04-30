import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function GalleryModal({ images = [], onClose }) {
    const [index, setIndex] = useState(0);

    // 🔒 khóa scroll khi mở modal
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    if (!images.length) return null;

    const prev = () =>
        setIndex((i) => (i === 0 ? images.length - 1 : i - 1));

    const next = () =>
        setIndex((i) => (i === images.length - 1 ? 0 : i + 1));

    return createPortal(
        <div className="fixed inset-0 z-[99] bg-black/95 flex flex-col">
            
            {/* BACKDROP CLICK */}
            <div
                className="absolute inset-0"
                onClick={onClose}
            />

            {/* HEADER */}
            <div className="relative z-10 flex items-center justify-between px-6 py-4 text-white">
                <span className="text-sm font-semibold">
                    {index + 1} / {images.length}
                </span>

                <button
                    onClick={onClose}
                    className="hover:scale-110 transition"
                >
                    <X size={28} />
                </button>
            </div>

            {/* IMAGE AREA */}
            <div className="relative z-10 flex-1 flex items-center justify-center">
                <button
                    onClick={prev}
                    className="absolute left-6 text-white/70 hover:text-white transition"
                >
                    <ChevronLeft size={44} />
                </button>

                <img
                    src={images[index]}
                    className="max-h-[80vh] max-w-[90vw] object-contain select-none"
                    draggable={false}
                />

                <button
                    onClick={next}
                    className="absolute right-6 text-white/70 hover:text-white transition"
                >
                    <ChevronRight size={44} />
                </button>
            </div>

            {/* THUMBNAILS */}
            <div className="relative z-10 px-6 pb-6 overflow-x-auto flex gap-3 justify-center">
                {images.map((img, i) => (
                    <img
                        key={i}
                        src={img}
                        onClick={() => setIndex(i)}
                        className={`h-20 w-28 object-cover rounded-lg cursor-pointer border-2 transition ${
                            i === index
                                ? "border-white scale-105"
                                : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                    />
                ))}
            </div>
        </div>,
        document.body
    );
}