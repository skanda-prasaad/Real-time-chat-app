import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type: "error" | "success" | "warning";
  isVisible: boolean;
  onClose: () => void;
}

export default function Toast({
  message,
  type,
  isVisible,
  onClose,
}: ToastProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(onClose, 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const styles = {
    base: "fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-auto z-50 max-w-sm mx-auto md:mx-0 p-4 rounded-lg shadow-lg transform transition-all duration-300",
    types: {
      error: "bg-red-500 text-white",
      warning: "bg-yellow-500 text-black",
      success: "bg-green-500 text-white",
    },
  };

  const icon = {
    error: "❌",
    warning: "⚠️",
    success: "✅",
  }[type];

  if (!isVisible) return null;

  return (
    <div
      className={`${styles.base} ${styles.types[type]} ${
        isAnimating ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div className="flex items-center">
        <span className="mr-2 flex-shrink-0">{icon}</span>
        <span className="flex-1 text-sm font-medium break-words">
          {message}
        </span>
        <button
          onClick={() => {
            setIsAnimating(false);
            setTimeout(onClose, 300);
          }}
          className="ml-2 text-white hover:text-gray-200 flex-shrink-0"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
