import React, { useState } from "react";
import { X, Copy, Check, Sparkles, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";

const InviteModal = ({ isOpen, onClose }) => {
  const { authUser } = useAuthStore();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 transform transition-all my-auto max-h-[90vh] flex flex-col">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-500 p-5 sm:p-6 text-white text-center relative flex-shrink-0">
          <button
            onClick={onClose}
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
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              <span>Your Personal Invite Link</span>
            </label>

            {/* Link & Copy Container */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-gray-50 border border-gray-200 p-2 rounded-2xl">
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="flex-1 bg-transparent px-2.5 py-1.5 text-xs text-gray-700 font-medium outline-none truncate w-full min-w-0"
              />
              <button
                onClick={handleCopyLink}
                className={`w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs flex-shrink-0 cursor-pointer ${
                  copied
                    ? "bg-green-600 text-white"
                    : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied!" : "Copy Link"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 sm:px-6 py-3 border-t border-gray-100 text-center flex-shrink-0">
          <p className="text-[11px] text-gray-400 font-medium leading-normal">
            Anyone with this link can create an account and connect with you on YAPPR.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;
