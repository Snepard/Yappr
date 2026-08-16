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
    <div className={`flex-1 flex items-center justify-center p-4 sm:p-6 transition-all overflow-y-auto ${
      isNeubrutalism ? 'bg-[#FFFDF0] text-black' : 'bg-gradient-to-br from-slate-50/60 via-blue-50/40 to-sky-50/50 backdrop-blur-xl'
    }`}>
      {/* Rectangular Card */}
      <div className={`relative w-full max-w-sm sm:max-w-md overflow-hidden flex flex-col transition-all ${
        isNeubrutalism
          ? 'bg-white border-4 border-black shadow-[8px_8px_0_#000] rounded-none text-black'
          : 'bg-white/50 backdrop-blur-2xl backdrop-saturate-200 rounded-3xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_20px_60px_rgba(14,165,233,0.18)] border border-white/80 ring-1 ring-sky-500/20'
      }`}>
        {!isNeubrutalism && (
          <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-br from-white/30 via-transparent to-transparent rotate-45 pointer-events-none" />
        )}

        {/* Top Header */}
        <div className={`p-5 sm:p-6 text-center relative flex-shrink-0 ${
          isNeubrutalism
            ? 'bg-[#FFE600] text-black border-b-4 border-black'
            : 'bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-500 text-white'
        }`}>
          <button
            onClick={() => setIsInviteOpen(false)}
            className={`absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-1.5 transition-all cursor-pointer ${
              isNeubrutalism
                ? 'bg-black text-white border border-black hover:bg-[#FF007A] rounded-none shadow-[2px_2px_0_#000]'
                : 'rounded-full bg-white/20 hover:bg-white/30 text-white'
            }`}
            title="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center mx-auto mb-2.5 sm:mb-3 ${
            isNeubrutalism
              ? 'bg-black text-white border-2 border-black shadow-[3px_3px_0_#000] rounded-none'
              : 'bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-inner'
          }`}>
            <UserPlus className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <h2 className={`text-lg sm:text-xl font-black ${isNeubrutalism ? 'uppercase tracking-tight text-black' : 'tracking-wide text-white font-bold'}`}>
            Invite Friends
          </h2>
          <p className={`text-xs mt-0.5 sm:mt-1 ${isNeubrutalism ? 'text-black font-extrabold' : 'text-blue-100 font-medium'}`}>
            Share your link to chat together on YAPPR
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {/* Invite Link Section */}
          <div>
            <label className={`text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5 ${
              isNeubrutalism ? 'text-black' : 'text-slate-700'
            }`}>
              <Sparkles className={`w-3.5 h-3.5 flex-shrink-0 ${isNeubrutalism ? 'text-black' : 'text-blue-600'}`} />
              <span>Your Personal Invite Link</span>
            </label>

            <div className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 ${
              isNeubrutalism
                ? 'bg-white border-3 border-black shadow-[3px_3px_0_#000] rounded-none'
                : 'bg-slate-100/80 border border-slate-200/80 rounded-2xl'
            }`}>
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className={`flex-1 bg-transparent px-2.5 py-1.5 text-xs font-bold outline-none truncate w-full min-w-0 ${
                  isNeubrutalism ? 'text-black' : 'text-slate-800 font-medium'
                }`}
              />
              <button
                onClick={handleCopyLink}
                className={`w-full sm:w-auto px-4 py-2 text-xs font-black uppercase flex items-center justify-center gap-1.5 transition-all flex-shrink-0 cursor-pointer ${
                  isNeubrutalism
                    ? copied
                      ? "bg-[#00E676] text-black border-2 border-black shadow-[2px_2px_0_#000] rounded-none"
                      : "bg-[#00E5FF] text-black border-2 border-black shadow-[2px_2px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 rounded-none"
                    : copied
                      ? "bg-emerald-600 text-white rounded-xl shadow-xs"
                      : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl shadow-xs"
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied!" : "Copy Link"}</span>
              </button>
            </div>
          </div>

          {/* Streamlined Quick Share Options */}
          <div>
            <label className={`text-[11px] font-black uppercase tracking-wider mb-2 block ${
              isNeubrutalism ? 'text-black' : 'text-slate-500 font-bold'
            }`}>
              Quick Share
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleShare("whatsapp")}
                className={`flex items-center justify-center gap-2.5 py-3 px-4 text-xs font-black uppercase transition-all cursor-pointer ${
                  isNeubrutalism
                    ? 'bg-[#00E676] text-black border-3 border-black shadow-[3px_3px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 rounded-none'
                    : 'rounded-2xl bg-gradient-to-r from-emerald-50/90 via-green-50/80 to-teal-50/90 text-emerald-800 border border-emerald-200/80 shadow-xs active:scale-95'
                }`}
                title="Share via WhatsApp"
              >
                <MessageCircle className="w-4.5 h-4.5 stroke-[2.5] shrink-0" />
                <span className="tracking-wide">WhatsApp</span>
              </button>

              <button
                onClick={() => handleShare("gmail")}
                className={`flex items-center justify-center gap-2.5 py-3 px-4 text-xs font-black uppercase transition-all cursor-pointer ${
                  isNeubrutalism
                    ? 'bg-[#FF007A] text-white border-3 border-black shadow-[3px_3px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 rounded-none'
                    : 'rounded-2xl bg-gradient-to-r from-rose-50/90 via-red-50/80 to-pink-50/90 text-rose-800 border border-rose-200/80 shadow-xs active:scale-95'
                }`}
                title="Compose on Gmail"
              >
                <Mail className="w-4.5 h-4.5 stroke-[2.5] shrink-0" />
                <span className="tracking-wide">Gmail</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-4 sm:px-6 py-3.5 text-center flex-shrink-0 ${
          isNeubrutalism
            ? 'bg-[#FFFDF0] border-t-3 border-black text-black font-extrabold text-[11px]'
            : 'bg-white/40 backdrop-blur-md border-t border-white/60 text-slate-500 font-medium text-[11px]'
        }`}>
          <p className="leading-normal">
            Anyone with this link can create an account and connect with you on YAPPR.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvitePanel;
