import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useDeleteAnimationStore } from "../store/useDeleteAnimationStore";

export const DeleteMessageAnimation = () => {
  const { isAnimating, messageText, closeAnimation } = useDeleteAnimationStore();
  const [animationStage, setAnimationStage] = useState("idle"); // 'idle' | 'pop' | 'swirl' | 'closed' | 'success'

  useEffect(() => {
    if (!isAnimating) {
      setAnimationStage("idle");
      return;
    }

    // High-performance snappy timeline (1.3s total)
    setAnimationStage("pop");

    // Start swirling into bin
    const swirlTimer = setTimeout(() => {
      setAnimationStage("swirl");
    }, 240);

    // Lid closes & message enters bin
    const closeTimer = setTimeout(() => {
      setAnimationStage("closed");
    }, 640);

    // Show success badge
    const successTimer = setTimeout(() => {
      setAnimationStage("success");
    }, 800);

    // Finish & cleanup (set to 1.8s total duration)
    const finishTimer = setTimeout(() => {
      closeAnimation();
    }, 1800);

    return () => {
      clearTimeout(swirlTimer);
      clearTimeout(closeTimer);
      clearTimeout(successTimer);
      clearTimeout(finishTimer);
    };
  }, [isAnimating, closeAnimation]);

  if (!isAnimating) return null;

  const isLidClosed = animationStage === "closed" || animationStage === "success";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-slate-900/15 backdrop-blur-md backdrop-saturate-150 select-none pointer-events-auto overflow-hidden transform-gpu"
      >
        {/* Soft Responsive Ambient Glow Spotlight */}
        <div className="absolute w-80 h-80 sm:w-[480px] sm:h-[480px] rounded-full bg-gradient-to-tr from-sky-300/30 via-blue-400/20 to-indigo-300/20 blur-3xl opacity-90 animate-pulse pointer-events-none transform-gpu" />

        <div className="relative flex flex-col items-center justify-center transform-gpu">
          {/* Floating Responsive Message Card */}
          <AnimatePresence>
            {(animationStage === "pop" || animationStage === "swirl") && (
              <motion.div
                key="swirling-message"
                initial={{ opacity: 0, scale: 0.3, y: -10, rotate: 0 }}
                animate={
                  animationStage === "pop"
                    ? { opacity: 1, scale: 1.02, y: -160, rotate: -6 }
                    : {
                        opacity: [1, 1, 0.7, 0],
                        scale: [1.02, 0.75, 0.35, 0.05],
                        y: [-160, -100, -30, 20],
                        x: [0, 30, -20, 0],
                        rotate: [-6, 120, 260, 360],
                      }
                }
                transition={
                  animationStage === "pop"
                    ? { type: "spring", stiffness: 450, damping: 24 }
                    : { duration: 0.42, ease: "easeOut" }
                }
                className="absolute top-0 z-30 max-w-[240px] sm:max-w-[340px] px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 text-white text-xs sm:text-sm font-semibold shadow-xl shadow-blue-500/25 border border-white/40 flex items-center gap-2 backdrop-blur-md transform-gpu"
              >
                <div className="w-2 h-2 rounded-full bg-rose-300 animate-ping shrink-0" />
                <span className="truncate max-w-[180px] sm:max-w-[260px]">
                  {messageText.length > 30 ? `${messageText.slice(0, 30)}...` : messageText}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Light Themed Responsive 3D Trash Bin */}
          <motion.div
            animate={
              isLidClosed
                ? { scale: [1, 1.08, 0.98, 1], y: [0, -4, 1, 0] }
                : { scale: 1, y: 0 }
            }
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative z-20 flex flex-col items-center transform-gpu"
          >
            {/* Expanded SVG Canvas (200x220) to prevent lid clipping when opening */}
            <svg
              viewBox="0 0 200 220"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-40 h-44 sm:w-56 sm:h-60 md:w-64 md:h-68 drop-shadow-[0_16px_32px_rgba(14,165,233,0.2)]"
            >
              {/* Soft Ground Shadow */}
              <ellipse cx="100" cy="204" rx="60" ry="8" fill="#0EA5E9" fillOpacity="0.18" />

              {/* Bin Body Container */}
              <path
                d="M52 94 L62 192 C62 198 69 202 76 202 L124 202 C131 202 138 198 138 192 L148 94 Z"
                fill="url(#binLightGradientBig)"
                stroke="#94A3B8"
                strokeWidth="3"
              />

              {/* Metallic Vertical Ribs */}
              <line x1="76" y1="108" x2="80" y2="190" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
              <line x1="100" y1="108" x2="100" y2="190" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
              <line x1="124" y1="108" x2="120" y2="190" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />

              {/* Bin Rim */}
              <rect
                x="46"
                y="88"
                width="108"
                height="12"
                rx="6"
                fill="#F1F5F9"
                stroke="#94A3B8"
                strokeWidth="3"
              />

              {/* Animated Trash Bin Lid (Pivot point at right rim: 148px 94px) */}
              <motion.g
                initial={{ rotate: -40, y: 0, x: 0 }}
                animate={
                  isLidClosed
                    ? { rotate: 0, y: 0, x: 0 }
                    : { rotate: -42, y: 0, x: 0 }
                }
                transition={{ type: "spring", stiffness: 500, damping: 24 }}
                style={{ transformOrigin: "148px 94px" }}
              >
                {/* Lid Handle */}
                <path
                  d="M86 70 L86 60 C86 56 91 52 100 52 C109 52 114 56 114 60 L114 70"
                  fill="none"
                  stroke="#F43F5E"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                {/* Lid Top Plate */}
                <rect
                  x="40"
                  y="70"
                  width="120"
                  height="18"
                  rx="9"
                  fill="url(#lidLightGradientBig)"
                  stroke="#FB7185"
                  strokeWidth="2.5"
                />
              </motion.g>

              {/* Light Gradients */}
              <defs>
                <linearGradient id="binLightGradientBig" x1="52" y1="94" x2="148" y2="202" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFFFFF" />
                  <stop offset="0.6" stopColor="#F8FAFC" />
                  <stop offset="1" stopColor="#E2E8F0" />
                </linearGradient>
                <linearGradient id="lidLightGradientBig" x1="40" y1="70" x2="160" y2="88" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FB7185" />
                  <stop offset="1" stopColor="#F43F5E" />
                </linearGradient>
              </defs>
            </svg>

            {/* Spark Burst Effect on Lid Closure */}
            {isLidClosed && (
              <div className="absolute top-12 pointer-events-none transform-gpu">
                {[0, 60, 120, 180, 240, 300].map((angle, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 1, scale: 0.3, x: 0, y: 0 }}
                    animate={{
                      opacity: 0,
                      scale: 1,
                      x: Math.cos((angle * Math.PI) / 180) * 48,
                      y: Math.sin((angle * Math.PI) / 180) * 48,
                    }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="absolute w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#F43F5E]"
                  />
                ))}
              </div>
            )}
          </motion.div>

          {/* Light Glass "Message Deleted" Status Badge */}
          <AnimatePresence>
            {animationStage === "success" && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.9 }}
                animate={{ opacity: 1, y: 26, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 450, damping: 24 }}
                className="absolute -bottom-16 sm:-bottom-20 px-4 sm:px-6 py-2 sm:py-2.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-sky-100 text-slate-800 text-xs sm:text-sm font-bold shadow-xl shadow-sky-500/15 flex items-center gap-2 ring-1 ring-sky-500/10 transform-gpu whitespace-nowrap"
              >
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
                <span>Message Deleted</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DeleteMessageAnimation;
