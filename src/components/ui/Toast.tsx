import { X } from "lucide-react";
import { useEffect } from "react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type,
  onClose,
  duration = 3500,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 border shadow-lg animate-slide-up ${
        type === "success"
          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
          : type === "error"
            ? "bg-red-50 border-red-200 text-red-800"
            : "bg-blue-50 border-blue-200 text-blue-800"
      }`}
    >
      <span className="text-xs font-sans font-medium">{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="p-0.5 hover:opacity-70 transition cursor-pointer"
        aria-label="Fechar notificação"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
