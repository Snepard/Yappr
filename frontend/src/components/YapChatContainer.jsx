import React, { useState, useEffect, useRef } from "react";
import { useYapStore } from "../store/useYapStore";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import {
  Flame,
  Coffee,
  Copy,
  Check,
  LogOut,
  Trash2,
  Clock,
  Send,
  Shield,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";

const YapChatContainer = () => {
  const {
    activeSession,
    messages,
    sendYapMessage,
    leaveSession,
    endSession,
    sessionStartTime,
  } = useYapStore();
  const authUser = useAuthStore((state) => state.authUser);
  const theme = useThemeStore((state) => state.theme);
  const isNeubrutalism = theme === "neubrutalism";

  const [inputText, setInputText] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Live timer tracking session duration
  useEffect(() => {
    const start = sessionStartTime || Date.now();
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStartTime]);

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleCopyCode = () => {
    if (!activeSession?.sessionCode) return;
    navigator.clipboard.writeText(activeSession.sessionCode);
    setCopiedCode(true);
    toast.success("Room code copied");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    sendYapMessage(inputText);
    setInputText("");
  };

  const isCreator =
    activeSession?.createdBy?._id === authUser?._id ||
    activeSession?.createdBy === authUser?._id;

  const participantsList = activeSession?.activeParticipants || [];

  return (
    <div
      className={`h-full w-full flex flex-col overflow-hidden relative ${
        isNeubrutalism
          ? "bg-[#FFFDF0] text-black rounded-none md:border-3 md:border-black md:shadow-[4px_4px_0_#000]"
          : "bg-[#0b0f17] text-slate-100 rounded-xl md:rounded-2xl border-y border-slate-800/80 md:border md:border-slate-800/90 md:shadow-2xl"
      }`}
    >
      {/* 1. Simple Info Banner with Top Margin */}
      <div className="pt-3 px-3 sm:pt-4 sm:px-4 pb-1">
        <div
          className={`px-3.5 py-2 flex items-center justify-between text-xs select-none ${
            isNeubrutalism
              ? "bg-[#FF007A] text-white border-2 border-black font-black uppercase tracking-wider rounded-none shadow-[2px_2px_0_#000]"
              : "bg-orange-500/10 text-orange-300 border border-orange-500/25 rounded-xl font-medium"
          }`}
        >
          <div className="flex items-center gap-2">
            <Coffee className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Tea Time: Messages delete permanently when you leave.</span>
          </div>
        </div>
      </div>

      {/* 2. Chat Header: Room Code, Timer, Participants Avatars, End/Leave Actions */}
      <div
        className={`px-4 py-3 flex items-center justify-between gap-2 border-b ${
          isNeubrutalism
            ? "bg-white border-b-4 border-black"
            : "bg-[#101622] border-slate-800"
        }`}
      >
        {/* Left: Room Code & Timer */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleCopyCode}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 transition-colors cursor-pointer ${
              isNeubrutalism
                ? "bg-[#FFE600] border-2 border-black shadow-[2px_2px_0_#000] text-black font-black font-mono text-xs rounded-none"
                : "bg-[#161f2e] hover:bg-[#1c273a] border border-slate-700/80 text-orange-400 rounded-lg text-xs font-mono font-bold"
            }`}
            title="Copy room code"
          >
            <span className="opacity-70 font-sans font-normal">Code:</span>
            <span>{activeSession?.sessionCode || "------"}</span>
            {copiedCode ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Timer */}
          <div
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold ${
              isNeubrutalism
                ? "bg-[#00E5FF] border-2 border-black shadow-[2px_2px_0_#000] text-black rounded-none"
                : "bg-[#161f2e] border border-slate-700/80 text-slate-300 rounded-lg"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>
        </div>

        {/* Center: Participant Avatars */}
        <div className="hidden md:flex items-center gap-1.5">
          <div className="flex -space-x-2 overflow-hidden items-center">
            {participantsList.map((p, idx) => (
              <img
                key={p._id || idx}
                src={p.profilePic || "/avatar.png"}
                alt={p.fullName || "Participant"}
                title={p.fullName}
                className={`w-7 h-7 object-cover inline-block ${
                  isNeubrutalism
                    ? "border-2 border-black rounded-none"
                    : "rounded-full ring-2 ring-[#101622]"
                }`}
              />
            ))}
          </div>
          <span
            className={`text-xs ${
              isNeubrutalism ? "text-black font-bold" : "text-slate-400"
            }`}
          >
            {participantsList.length} in room
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {isCreator && (
            <button
              onClick={endSession}
              className={`px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isNeubrutalism
                  ? "bg-[#FF007A] text-white border-2 border-black shadow-[2px_2px_0_#000] rounded-none uppercase"
                  : "bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 rounded-lg"
              }`}
              title="End room for everyone"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">End Room</span>
            </button>
          )}

          <button
            onClick={leaveSession}
            className={`px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isNeubrutalism
                ? "bg-white text-black border-2 border-black shadow-[2px_2px_0_#000] hover:bg-yellow-200 rounded-none uppercase"
                : "bg-[#161f2e] hover:bg-[#1f2a3e] text-slate-300 hover:text-white border border-slate-700/80 rounded-lg"
            }`}
            title="Leave room"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Leave</span>
          </button>
        </div>
      </div>

      {/* 3. Messages Scroll Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-2 select-none">
            <div
              className={`p-3 flex items-center justify-center ${
                isNeubrutalism
                  ? "bg-[#FFE600] border-3 border-black shadow-[3px_3px_0_#000] text-black rounded-none"
                  : "bg-[#131b27] text-orange-400 border border-slate-800 rounded-2xl"
              }`}
            >
              <MessageSquare className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4
                className={`text-sm font-bold ${
                  isNeubrutalism ? "uppercase text-black font-black" : "text-white"
                }`}
              >
                No messages yet
              </h4>
              <p
                className={`text-xs max-w-xs ${
                  isNeubrutalism ? "text-black/70 font-bold" : "text-slate-400"
                }`}
              >
                Send a message to get started. All chat disappears once everyone leaves.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isSelf =
              msg.isSelf ||
              msg.senderId?.toString() === authUser?._id?.toString();

            return (
              <div
                key={msg._id}
                className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}
              >
                {/* Sender Tag */}
                {!isSelf && (
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <img
                      src={msg.senderPic || "/avatar.png"}
                      alt={msg.senderName}
                      className={`w-4 h-4 object-cover ${
                        isNeubrutalism ? "border border-black rounded-none" : "rounded-full"
                      }`}
                    />
                    <span
                      className={`text-[11px] font-semibold ${
                        isNeubrutalism ? "text-black font-bold" : "text-slate-400"
                      }`}
                    >
                      {msg.senderName}
                    </span>
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[70%] px-4 py-2.5 ${
                    isNeubrutalism
                      ? isSelf
                        ? "bg-[#00E5FF] text-black border-3 border-black shadow-[2px_2px_0_#000] rounded-none font-bold"
                        : "bg-white text-black border-3 border-black shadow-[2px_2px_0_#000] rounded-none font-medium"
                      : isSelf
                      ? "bg-orange-600 text-white rounded-2xl rounded-tr-sm shadow-xs"
                      : "bg-[#141b26] text-slate-100 rounded-2xl rounded-tl-sm border border-slate-800"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                    {msg.text}
                  </p>

                  <div
                    className={`mt-1 flex items-center justify-end text-[10px] ${
                      isNeubrutalism
                        ? "text-black/60 font-bold"
                        : isSelf
                        ? "text-orange-100/70"
                        : "text-slate-500"
                    }`}
                  >
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 4. Text-Only Message Input Bar */}
      <div
        className={`p-3 sm:p-4 border-t ${
          isNeubrutalism
            ? "bg-white border-t-4 border-black"
            : "bg-[#101622] border-slate-800"
        }`}
      >
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className={`flex-1 py-2 px-4 text-sm transition-colors focus:outline-none ${
              isNeubrutalism
                ? "bg-[#FFFDF0] text-black border-3 border-black shadow-[2px_2px_0_#000] rounded-none font-bold focus:bg-yellow-50"
                : "bg-[#131a26] text-white placeholder-slate-400 border border-slate-700/80 rounded-xl focus:border-orange-500"
            }`}
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`py-2 px-4 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 ${
              isNeubrutalism
                ? "bg-[#FFE600] text-black border-3 border-black shadow-[2px_2px_0_#000] active:translate-x-0.5 active:translate-y-0.5 rounded-none uppercase"
                : "bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-sm"
            }`}
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </form>

        <div
          className={`mt-1.5 text-[11px] text-center ${
            isNeubrutalism ? "text-black/60 font-bold" : "text-slate-500"
          }`}
        >
          Messages are not saved anywhere.
        </div>
      </div>
    </div>
  );
};

export default YapChatContainer;
