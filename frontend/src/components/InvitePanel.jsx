import React, { useState } from "react";
import {
  X,
  Copy,
  Check,
  Sparkles,
  UserPlus,
  MessageCircle,
  Mail,
  Share2,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useThemeStore } from "../store/useThemeStore";

export const InvitePanel = () => {
  const { authUser } = useAuthStore();
  const { setIsInviteOpen } = useChatStore();
  const theme = useThemeStore((state) => state.theme);
  const isNeubrutalism = theme === "neubrutalism";
  const [copied, setCopied] = useState(false);

  const handleUsername = authUser?.username || authUser?.email?.split("@")[0] || "friend";
  const inviteUrl = `${window.location.origin}/signup?ref=${encodeURIComponent(handleUsername)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success("Invite link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy invite link");
    }
  };

  const handleShare = (platform) => {
    const text = `Join me on YAPPR! Connect and chat seamlessly: ${inviteUrl}`;
    let shareUrl = "";

    switch (platform) {
      case "whatsapp":
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        break;
      case "gmail":
        shareUrl = `https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=&su=${encodeURIComponent("Join me on YAPPR!")}&body=${encodeURIComponent(text)}`;
        break;
      default:
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank");
    }
  };

  return (
    <div
      className={`flex-1 flex items-center justify-center p-4 sm:p-6 transition-all overflow-hidden h-full ${
        isNeubrutalism
          ? "bg-[#FFFDF0] text-black"
          : "bg-gradient-to-br from-slate-50/70 via-blue-50/40 to-sky-50/60 backdrop-blur-xl"
      }`}
    >
      {/* Standardized Outer Frame Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className={`relative w-full max-w-2xl h-[560px] sm:h-[600px] max-h-[85vh] overflow-hidden flex flex-col transition-all ${
          isNeubrutalism
            ? "bg-white border-4 border-black shadow-[8px_8px_0_#000] rounded-none text-black"
            : "bg-white/80 backdrop-blur-2xl backdrop-saturate-200 rounded-3xl shadow-[0_20px_60px_rgba(14,165,233,0.15)] border border-white/90 ring-1 ring-sky-500/15"
        }`}
      >
        {!isNeubrutalism && (
          <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-br from-white/40 via-transparent to-transparent rotate-45 pointer-events-none" />
        )}

        {/* Top Header */}
        <div
          className={`p-5 sm:p-6 text-center relative flex-shrink-0 ${
            isNeubrutalism
              ? "bg-[#FFE600] text-black border-b-4 border-black"
              : "bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 text-white shadow-xs"
          }`}
        >
          <button
            onClick={() => setIsInviteOpen(false)}
            className={`absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-2 transition-all cursor-pointer ${
              isNeubrutalism
                ? "bg-black text-white border border-black hover:bg-[#FF007A] rounded-none shadow-[2px_2px_0_#000]"
                : "rounded-full bg-white/20 hover:bg-white/30 text-white hover:scale-105 active:scale-95"
            }`}
            title="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center mx-auto mb-2.5 sm:mb-3 ${
              isNeubrutalism
                ? "bg-black text-white border-2 border-black shadow-[3px_3px_0_#000] rounded-none"
                : "bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-inner"
            }`}
          >
            <UserPlus className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <h2
            className={`text-lg sm:text-xl font-black ${
              isNeubrutalism ? "uppercase tracking-tight text-black" : "tracking-wide text-white font-extrabold"
            }`}
          >
            Invite Friends
          </h2>
          <p
            className={`text-xs mt-0.5 sm:mt-1 ${
              isNeubrutalism ? "text-black font-extrabold" : "text-blue-100 font-medium"
            }`}
          >
            Share your personal link to connect and chat on YAPPR
          </p>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 flex flex-col justify-center">
          {/* Invite Link Section */}
          <div className="space-y-2">
            <label
              className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                isNeubrutalism ? "text-black" : "text-slate-700 font-bold"
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 flex-shrink-0 ${isNeubrutalism ? "text-black" : "text-blue-600"}`} />
              <span>Your Personal Invite Link</span>
            </label>

            <div
              className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-2.5 ${
                isNeubrutalism
                  ? "bg-white border-3 border-black shadow-[3px_3px_0_#000] rounded-none"
                  : "bg-slate-100/90 border border-slate-200/90 rounded-2xl shadow-inner"
              }`}
            >
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className={`flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm font-bold outline-none truncate w-full min-w-0 ${
                  isNeubrutalism ? "text-black" : "text-slate-800 font-semibold"
                }`}
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleCopyLink}
                className={`w-full sm:w-auto px-5 py-2.5 text-xs font-black uppercase flex items-center justify-center gap-2 transition-all flex-shrink-0 cursor-pointer ${
                  isNeubrutalism
                    ? copied
                      ? "bg-[#00E676] text-black border-2 border-black shadow-[2px_2px_0_#000] rounded-none"
                      : "bg-[#00E5FF] text-black border-2 border-black shadow-[2px_2px_0_#000] rounded-none"
                    : copied
                    ? "bg-emerald-600 text-white rounded-xl shadow-xs"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-xs font-bold"
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied!" : "Copy Link"}</span>
              </motion.button>
            </div>
          </div>

          {/* Streamlined Quick Share Options */}
          <div className="space-y-2">
            <label
              className={`text-[11px] font-black uppercase tracking-wider block ${
                isNeubrutalism ? "text-black" : "text-slate-500 font-bold"
              }`}
            >
              Quick Share Options
            </label>

            <div className="grid grid-cols-2 gap-3.5">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleShare("whatsapp")}
                className={`flex items-center justify-center gap-2.5 py-3.5 px-4 text-xs font-black uppercase transition-all cursor-pointer ${
                  isNeubrutalism
                    ? "bg-[#00E676] text-black border-3 border-black shadow-[3px_3px_0_#000] rounded-none"
                    : "rounded-2xl bg-gradient-to-r from-emerald-50/90 via-teal-50/90 to-emerald-100/70 text-emerald-900 border border-emerald-200/90 shadow-xs font-bold"
                }`}
                title="Share via WhatsApp"
              >
                <MessageCircle className="w-4.5 h-4.5 stroke-[2.5] shrink-0 text-emerald-600" />
                <span className="tracking-wide">WhatsApp</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleShare("gmail")}
                className={`flex items-center justify-center gap-2.5 py-3.5 px-4 text-xs font-black uppercase transition-all cursor-pointer ${
                  isNeubrutalism
                    ? "bg-[#FF007A] text-white border-3 border-black shadow-[3px_3px_0_#000] rounded-none"
                    : "rounded-2xl bg-gradient-to-r from-rose-50/90 via-pink-50/90 to-rose-100/70 text-rose-900 border border-rose-200/90 shadow-xs font-bold"
                }`}
                title="Compose on Gmail"
              >
                <Mail className="w-4.5 h-4.5 stroke-[2.5] shrink-0 text-rose-600" />
                <span className="tracking-wide">Gmail</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div
          className={`px-5 sm:px-6 py-4 text-center flex-shrink-0 ${
            isNeubrutalism
              ? "bg-[#FFFDF0] border-t-3 border-black text-black font-extrabold text-[11px]"
              : "bg-white/60 backdrop-blur-md border-t border-slate-200/70 text-slate-500 font-medium text-[11px]"
          }`}
        >
          <p className="leading-normal">
            Anyone with this link can create an account and connect with you on YAPPR.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default InvitePanel;
