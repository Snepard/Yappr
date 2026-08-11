import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Trash2,
  AlertTriangle,
  ShieldAlert,
  LogOut,
  HelpCircle,
  Check,
} from "lucide-react";

/**
 * Custom Confirmation Toast component rendered inside react-hot-toast.
 * Premium Glassmorphism Floating Card with real frosted glass physics, light reflection, and vibrant sky accents.
 */
const ConfirmToastCard = ({
  t,
  title,
  message,
  confirmText,
  cancelText,
  variant,
  icon: customIcon,
  onResolve,
}) => {
  // Listen for Enter / Escape key presses
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        toast.dismiss(t.id);
        onResolve(false);
      } else if (e.key === "Enter") {
        e.preventDefault();
        toast.dismiss(t.id);
        onResolve(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [t.id, onResolve]);

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          topBorder: "from-rose-500 via-red-500 to-amber-500",
          iconBg: "bg-red-500/10 text-red-600 border border-red-200/60 shadow-[0_4px_12px_rgba(239,68,68,0.15)]",
          btnGradient: "from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-500/30",
          defaultIcon: <Trash2 className="w-5 h-5 text-red-600" />,
        };
      case "warning":
        return {
          topBorder: "from-amber-400 via-orange-400 to-yellow-500",
          iconBg: "bg-amber-500/10 text-amber-700 border border-amber-200/60 shadow-[0_4px_12px_rgba(245,158,11,0.15)]",
          btnGradient: "from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg shadow-amber-500/30",
          defaultIcon: <AlertTriangle className="w-5 h-5 text-amber-700" />,
        };
      case "permission":
        return {
          topBorder: "from-sky-400 via-blue-500 to-indigo-500",
          iconBg: "bg-sky-500/10 text-sky-700 border border-sky-200/60 shadow-[0_4px_12px_rgba(14,165,233,0.15)]",
          btnGradient: "from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white shadow-lg shadow-blue-500/30",
          defaultIcon: <ShieldAlert className="w-5 h-5 text-sky-700" />,
        };
      case "info":
      default:
        return {
          topBorder: "from-blue-500 via-sky-400 to-cyan-400",
          iconBg: "bg-blue-500/10 text-blue-700 border border-blue-200/60 shadow-[0_4px_12px_rgba(37,99,235,0.15)]",
          btnGradient: "from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/30",
          defaultIcon: <HelpCircle className="w-5 h-5 text-blue-700" />,
        };
    }
  };

  const style = getVariantStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: -30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.94 }}
      transition={{ type: "spring", stiffness: 420, damping: 26 }}
      className={`
        relative pointer-events-auto w-[92vw] sm:w-[420px] max-w-md
        bg-white/45 backdrop-blur-2xl backdrop-saturate-200
        border border-white/80 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_20px_50px_rgba(14,165,233,0.22)]
        rounded-3xl p-5 text-slate-800 overflow-hidden z-[99999] ring-1 ring-sky-500/20
      `}
    >
      {/* Gloss Reflection Shine Overlay */}
      <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-br from-white/35 via-transparent to-transparent rotate-45 pointer-events-none" />

      {/* Top Accent Gradient Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${style.topBorder}`} />

      <div className="relative flex items-start gap-3.5 pt-1 z-10">
        {/* Frosted Glass Icon Container */}
        <div className={`p-2.5 rounded-2xl shrink-0 flex items-center justify-center backdrop-blur-md ${style.iconBg}`}>
          {customIcon || style.defaultIcon}
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-tight tracking-tight">
            {title}
          </h4>
          {message && (
            <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed break-words">
              {message}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="relative flex items-center justify-end gap-2.5 mt-4 pt-3.5 border-t border-white/60 z-10">
        <button
          onClick={() => {
            toast.dismiss(t.id);
            onResolve(false);
          }}
          className="px-4 py-2 rounded-2xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white/50 hover:bg-white/80 backdrop-blur-md transition-all border border-white/80 shadow-xs active:scale-95 cursor-pointer"
        >
          {cancelText}
        </button>

        <button
          onClick={() => {
            toast.dismiss(t.id);
            onResolve(true);
          }}
          className={`
            px-4 py-2 rounded-2xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer
            bg-gradient-to-r ${style.btnGradient}
          `}
        >
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          {confirmText}
        </button>
      </div>
    </motion.div>
  );
};

/**
 * Main confirmToast function returning a Promise<boolean>.
 */
export const confirmToast = ({
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger", // 'danger' | 'warning' | 'permission' | 'info'
  icon = null,
} = {}) => {
  return new Promise((resolve) => {
    toast.custom(
      (t) => (
        <ConfirmToastCard
          t={t}
          title={title}
          message={message}
          confirmText={confirmText}
          cancelText={cancelText}
          variant={variant}
          icon={icon}
          onResolve={resolve}
        />
      ),
      {
        position: "top-center",
        duration: Infinity, // Keep open until user responds
      }
    );
  });
};

/**
 * Convenience helper for Deletion prompts.
 */
export const confirmDelete = ({
  title = "Delete Item?",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
} = {}) => {
  return confirmToast({
    title,
    message,
    confirmText,
    cancelText,
    variant: "danger",
    icon: <Trash2 className="w-5 h-5 text-red-600" />,
  });
};

/**
 * Convenience helper for Permission prompts.
 */
export const confirmPermission = ({
  title = "Permission Request",
  message = "Do you grant permission to perform this action?",
  confirmText = "Allow",
  cancelText = "Deny",
} = {}) => {
  return confirmToast({
    title,
    message,
    confirmText,
    cancelText,
    variant: "permission",
    icon: <ShieldAlert className="w-5 h-5 text-sky-700" />,
  });
};

/**
 * Convenience helper for Logout prompts.
 */
export const confirmLogout = ({
  title = "Sign Out?",
  message = "Are you sure you want to log out of your Yappr account?",
  confirmText = "Log Out",
  cancelText = "Cancel",
} = {}) => {
  return confirmToast({
    title,
    message,
    confirmText,
    cancelText,
    variant: "warning",
    icon: <LogOut className="w-5 h-5 text-amber-700" />,
  });
};

export default confirmToast;
