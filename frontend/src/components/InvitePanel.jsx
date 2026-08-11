import React, { useState } from "react";
import {
  X,
  Copy,
  Check,
  Sparkles,
  UserPlus,
  MessageCircle,
  Mail,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

export const InvitePanel = () => {
  const { authUser } = useAuthStore();
  const { setIsInviteOpen } = useChatStore();
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
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-50/60 via-blue-50/40 to-sky-50/50 backdrop-blur-xl overflow-y-auto">
      {/* Translucent Glassmorphism Rectangular Card */}
      <div className="relative w-full max-w-sm sm:max-w-md bg-white/50 backdrop-blur-2xl backdrop-saturate-200 rounded-3xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_20px_60px_rgba(14,165,233,0.18)] border border-white/80 overflow-hidden flex flex-col ring-1 ring-sky-500/20 transition-all">
        {/* Glass Gloss Shine Line */}
        <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-br from-white/30 via-transparent to-transparent rotate-45 pointer-events-none" />

        {/* Top Header */}
        <div className="bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-500 p-5 sm:p-6 text-white text-center relative flex-shrink-0">
          <button
            onClick={() => setIsInviteOpen(false)}
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-2.5 sm:mb-3 border border-white/30 shadow-inner">
            <UserPlus className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-wide">Invite Friends</h2>
          <p className="text-xs text-blue-100 mt-0.5 sm:mt-1 font-medium">
            Share your link to chat together on YAPPR
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {/* Invite Link Section */}
          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              <span>Your Personal Invite Link</span>
            </label>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-100/80 border border-slate-200/80 p-2 rounded-2xl">
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="flex-1 bg-transparent px-2.5 py-1.5 text-xs text-slate-800 font-medium outline-none truncate w-full min-w-0"
              />
              <button
                onClick={handleCopyLink}
                className={`w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs flex-shrink-0 cursor-pointer ${
                  copied
                    ? "bg-emerald-600 text-white"
                    : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied!" : "Copy Link"}</span>
              </button>
            </div>
          </div>

          {/* Streamlined Quick Share Options (WhatsApp & Gmail Only) */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
              Quick Share
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleShare("whatsapp")}
                className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-50/90 via-green-50/80 to-teal-50/90 hover:from-emerald-100 hover:to-teal-100 text-emerald-800 text-xs font-bold border border-emerald-200/80 shadow-xs transition-all duration-200 active:scale-95 cursor-pointer"
                title="Share via WhatsApp"
              >
                <MessageCircle className="w-4.5 h-4.5 text-emerald-600 stroke-[2.2] shrink-0" />
                <span className="tracking-wide">WhatsApp</span>
              </button>

              <button
                onClick={() => handleShare("gmail")}
                className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-50/90 via-red-50/80 to-pink-50/90 hover:from-rose-100 hover:to-pink-100 text-rose-800 text-xs font-bold border border-rose-200/80 shadow-xs transition-all duration-200 active:scale-95 cursor-pointer"
                title="Compose on Gmail"
              >
                <Mail className="w-4.5 h-4.5 text-rose-600 stroke-[2.2] shrink-0" />
                <span className="tracking-wide">Gmail</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white/40 backdrop-blur-md px-4 sm:px-6 py-3.5 border-t border-white/60 text-center flex-shrink-0">
          <p className="text-[11px] text-slate-500 font-medium leading-normal">
            Anyone with this link can create an account and connect with you on YAPPR.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvitePanel;
