import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Forward, Send } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useThemeStore } from "../store/useThemeStore";

const ForwardModal = ({ isOpen, onClose, messageToForward }) => {
  const { users, forwardMessage } = useChatStore();
  const theme = useThemeStore((state) => state.theme);
  const isNeubrutalism = theme === "neubrutalism";
  const [searchQuery, setSearchQuery] = useState("");
  const [sendingId, setSendingId] = useState(null);

  if (!isOpen || !messageToForward) return null;

  const filteredUsers = users.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleForward = async (userId) => {
    setSendingId(userId);
    const success = await forwardMessage(userId, messageToForward);
    setSendingId(null);
    if (success) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", stiffness: 450, damping: 28 }}
          className={`w-full max-w-md p-5 overflow-hidden transition-all ${
            isNeubrutalism
              ? "bg-white border-4 border-black shadow-[8px_8px_0_#000] rounded-none text-black font-bold"
              : "bg-white/95 backdrop-blur-2xl border border-sky-100/90 shadow-2xl rounded-3xl text-slate-800 ring-1 ring-sky-500/10"
          }`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between pb-3 ${
            isNeubrutalism ? "border-b-3 border-black" : "border-b border-sky-100"
          }`}>
            <div className="flex items-center gap-2">
              <div className={
                isNeubrutalism
                  ? "p-2 bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0_#000] rounded-none"
                  : "p-2 rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-200/60"
              }>
                <Forward className={`w-5 h-5 ${isNeubrutalism ? "stroke-[2.5]" : ""}`} />
              </div>
              <div>
                <h3 className={isNeubrutalism ? "font-black text-base text-black uppercase leading-tight" : "font-bold text-base text-slate-900 leading-tight"}>
                  Forward Message
                </h3>
                <p className={isNeubrutalism ? "text-xs text-black/80 font-bold" : "text-xs text-slate-500 font-medium"}>
                  Select a contact to share this message with
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={
                isNeubrutalism
                  ? "p-1.5 bg-[#FF007A] text-white border-2 border-black shadow-[2px_2px_0_#000] rounded-none cursor-pointer"
                  : "p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              }
            >
              <X className={`w-5 h-5 ${isNeubrutalism ? "stroke-[3]" : ""}`} />
            </button>
          </div>

          {/* Message Preview Snippet */}
          <div className={
            isNeubrutalism
              ? "my-3.5 p-3 bg-[#FFFDF0] border-2 border-black shadow-[2px_2px_0_#000] text-xs text-black rounded-none flex items-center gap-2 font-bold"
              : "my-3.5 p-3 rounded-2xl bg-sky-50/70 border border-sky-100 text-xs text-slate-700 flex items-center gap-2"
          }>
            <div className={isNeubrutalism ? "w-1.5 h-8 bg-black shrink-0" : "w-1 h-8 rounded-full bg-sky-500 shrink-0"} />
            <div className="flex-1 truncate">
              {messageToForward.image && (
                <span className={isNeubrutalism ? "text-black font-black uppercase mr-1.5" : "text-sky-600 font-medium mr-1.5"}>[Image]</span>
              )}
              <span className="italic">{messageToForward.text || "Attachment"}</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
              isNeubrutalism ? "text-black stroke-[2.5]" : "text-slate-400"
            }`} />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={
                isNeubrutalism
                  ? "w-full pl-9 pr-4 py-2.5 bg-white text-black border-2 border-black shadow-[2px_2px_0_#000] rounded-none text-xs font-bold placeholder:text-black/50 focus:bg-[#FFE600] outline-none"
                  : "w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-100/80 border border-slate-200/80 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/50"
              }
            />
          </div>

          {/* User List */}
          <div className={
            isNeubrutalism
              ? "max-h-60 overflow-y-auto space-y-1.5 pr-1 border-2 border-black bg-white p-1 rounded-none divide-y-2 divide-black"
              : "max-h-60 overflow-y-auto space-y-1.5 pr-1"
          }>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 font-medium">
                No contacts found
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className={
                    isNeubrutalism
                      ? "flex items-center justify-between p-2.5 hover:bg-yellow-100 transition-all font-bold text-black"
                      : "flex items-center justify-between p-2.5 rounded-2xl hover:bg-sky-50/80 transition-all border border-transparent hover:border-sky-100 group"
                  }
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullName}
                      className={
                        isNeubrutalism
                          ? "w-9 h-9 object-cover border border-black shadow-[1px_1px_0_#000] rounded-none shrink-0"
                          : "w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                      }
                      onError={(e) => {
                        e.target.src = "/avatar.png";
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className={isNeubrutalism ? "font-black text-xs text-black truncate" : "font-bold text-xs text-slate-800 truncate"}>
                        {user.fullName}
                      </p>
                      <p className={isNeubrutalism ? "text-[11px] font-bold text-black/70 truncate" : "text-[11px] text-slate-400 truncate"}>
                        @{user.username}
                      </p>
                    </div>
                  </div>

                  <button
                    disabled={sendingId === user._id}
                    onClick={() => handleForward(user._id)}
                    className={
                      isNeubrutalism
                        ? "px-3.5 py-1.5 bg-[#00E676] text-black font-black uppercase text-xs border-2 border-black shadow-[2px_2px_0_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 rounded-none"
                        : "px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    }
                  >
                    <Send className={`w-3 h-3 ${isNeubrutalism ? "stroke-[2.5]" : ""}`} />
                    <span>{sendingId === user._id ? "Sending..." : "Forward"}</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ForwardModal;
