import { useState, useEffect } from "react";
import { Clock, ShieldAlert } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";

const GroupTimeoutBanner = ({ until }) => {
  const theme = useThemeStore((state) => state.theme);
  const isNeubrutalism = theme === "neubrutalism";
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0, isExpired: false });

  useEffect(() => {
    if (!until) return;

    const calculateTimeLeft = () => {
      const targetTime = new Date(until).getTime();
      const now = new Date().getTime();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft({ minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ minutes, seconds, isExpired: false });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [until]);

  if (timeLeft.isExpired || !until) return null;

  const formattedMins = String(timeLeft.minutes).padStart(2, "0");
  const formattedSecs = String(timeLeft.seconds).padStart(2, "0");

  return (
    <div className={
      isNeubrutalism
        ? "w-full bg-[#FFE600] border-y-3 border-black px-4 py-2.5 flex items-center justify-between shadow-[0_3px_0_#000] text-black font-bold"
        : "w-full bg-amber-500/10 border-y border-amber-500/30 px-4 py-2.5 flex items-center justify-between shadow-xs animate-fade-in backdrop-blur-md"
    }>
      <div className="flex items-center space-x-2.5">
        <ShieldAlert className={`w-5 h-5 shrink-0 ${isNeubrutalism ? "text-black stroke-[2.5]" : "text-amber-600 animate-pulse"}`} />
        <div>
          <p className={isNeubrutalism ? "text-xs font-black uppercase text-black" : "text-xs font-bold text-amber-900"}>
            Read-Only Mode Active (Timed Out)
          </p>
          <p className={isNeubrutalism ? "text-[11px] text-black/80 font-bold" : "text-[11px] text-amber-700/90 font-medium"}>
            An admin put you on timeout. You cannot send messages or edit group info until the timer expires.
          </p>
        </div>
      </div>

      <div className={
        isNeubrutalism
          ? "flex items-center space-x-2 bg-black text-white border-2 border-black px-3 py-1.5 rounded-none font-mono font-black text-xs shrink-0 shadow-[2px_2px_0_#000]"
          : "flex items-center space-x-2 bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 rounded-xl text-amber-900 font-mono font-bold text-xs shrink-0 shadow-inner"
      }>
        <Clock className={`w-4 h-4 ${isNeubrutalism ? "text-white stroke-[2.5]" : "text-amber-700 animate-spin-slow"}`} />
        <span>
          {formattedMins}m : {formattedSecs}s
        </span>
      </div>
    </div>
  );
};

export default GroupTimeoutBanner;
