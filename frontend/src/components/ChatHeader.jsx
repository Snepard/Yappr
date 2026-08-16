import { useRef, useState } from "react";
import { X, ArrowLeft, Lock, Users, Settings, Info } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import { useThemeStore } from "../store/useThemeStore";
import Tooltip from "./Tooltip";

const ChatHeader = ({ isSidebarCollapsed, setIsSidebarCollapsed }) => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { selectedGroup, setSelectedGroup, setIsGroupInfoOpen } = useGroupStore();
  const { onlineUsers } = useAuthStore();
  const theme = useThemeStore((state) => state.theme);
  const isNeubrutalism = theme === "neubrutalism";

  if (!selectedUser && !selectedGroup) return null;

  if (selectedGroup) {
    const handleCloseGroup = () => {
      setSelectedGroup(null);
    };

    return (
      <div className={`px-4 py-3 select-none transition-all ${
        isNeubrutalism
          ? "bg-[#FFFDF0] border-b-3 border-black text-black"
          : "border-b border-sky-100 bg-white/80 backdrop-blur-xl shadow-xs"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {/* Back button for mobile */}
            <Tooltip label="Back to chats" position="right">
              <button
                onClick={handleCloseGroup}
                className={`md:hidden p-2 flex-shrink-0 transition-colors ${
                  isNeubrutalism
                    ? "bg-white border-2 border-black text-black shadow-[2px_2px_0_#000] rounded-none font-bold"
                    : "hover:bg-sky-50 rounded-xl text-gray-600"
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Tooltip>

            {/* Group Avatar */}
            <div
              onClick={() => setIsGroupInfoOpen(true)}
              className="relative flex-shrink-0 cursor-pointer group"
            >
              <div className={`w-10 h-10 overflow-hidden flex items-center justify-center ${
                isNeubrutalism
                  ? "bg-[#00E5FF] border-2 border-black shadow-[2px_2px_0_#000] rounded-none"
                  : "rounded-2xl ring-2 ring-white shadow-xs bg-blue-50"
              }`}>
                {selectedGroup.groupPic ? (
                  <img
                    src={selectedGroup.groupPic}
                    alt={selectedGroup.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Users className={`w-5 h-5 ${isNeubrutalism ? "text-black" : "text-blue-600"}`} />
                )}
              </div>
            </div>

            {/* Group info */}
            <div
              onClick={() => setIsGroupInfoOpen(true)}
              className="min-w-0 flex-1 cursor-pointer"
            >
              <h3 className={`font-bold text-sm sm:text-base truncate transition-colors ${
                isNeubrutalism
                  ? "font-black text-black uppercase hover:text-blue-800"
                  : "text-gray-800 hover:text-blue-600"
              }`}>
                {selectedGroup.name}
              </h3>
              <p className={`text-xs truncate ${
                isNeubrutalism
                  ? "font-bold text-black opacity-80"
                  : "text-gray-500 font-medium"
              }`}>
                {selectedGroup.members?.length || 0} members
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <Tooltip label="Group Settings & Members" position="left">
              <button
                onClick={() => setIsGroupInfoOpen(true)}
                className={`p-2 transition-all cursor-pointer ${
                  isNeubrutalism
                    ? "border-2 border-black bg-white hover:bg-[#FFE600] text-black shadow-[2px_2px_0_#000] active:translate-x-0.5 active:translate-y-0.5 rounded-none font-bold"
                    : "hover:bg-sky-50 hover:text-blue-600 rounded-xl text-gray-500"
                }`}
              >
                <Info className={`w-5 h-5 ${isNeubrutalism ? "stroke-[2.5]" : ""}`} />
              </button>
            </Tooltip>

            <Tooltip label="Close chat" position="left">
              <button
                onClick={handleCloseGroup}
                className={`p-2 transition-all flex-shrink-0 cursor-pointer ${
                  isNeubrutalism
                    ? "border-2 border-black bg-[#FF007A] text-white shadow-[2px_2px_0_#000] active:translate-x-0.5 active:translate-y-0.5 rounded-none font-bold"
                    : "hover:bg-red-50 hover:text-red-500 rounded-xl text-gray-400"
                }`}
              >
                <X className={`w-5 h-5 ${isNeubrutalism ? "stroke-[3]" : ""}`} />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    );
  }

  const isOnline = onlineUsers.includes(selectedUser._id);
  const isE2EE = Boolean(selectedUser.publicKey);

  const handleBackToContacts = () => {
    setSelectedUser(null);
  };

  return (
    <div className={`px-4 py-3 select-none transition-all ${
      isNeubrutalism
        ? "bg-[#FFFDF0] border-b-3 border-black text-black"
        : "border-b border-sky-100 bg-white/80 backdrop-blur-xl shadow-xs"
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Back button for mobile */}
          <Tooltip label="Back to contacts" position="right">
            <button
              onClick={handleBackToContacts}
              className={`md:hidden p-2 flex-shrink-0 transition-colors ${
                isNeubrutalism
                  ? "bg-white border-2 border-black text-black shadow-[2px_2px_0_#000] rounded-none font-bold"
                  : "hover:bg-sky-50 rounded-xl text-gray-600"
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Tooltip>

          {/* Avatar with online indicator */}
          <div className="relative flex-shrink-0">
            <div className={`w-10 h-10 overflow-hidden ${
              isNeubrutalism
                ? "border-2 border-black shadow-[2px_2px_0_#000] rounded-none bg-[#FFE600]"
                : "rounded-full ring-2 ring-white shadow-xs"
            }`}>
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={selectedUser.fullName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "/avatar.png";
                }}
              />
            </div>
            {/* Online status indicator */}
            <div
              className={`absolute bottom-0 right-0 w-3 h-3 transition-colors ${
                isNeubrutalism
                  ? "border border-black rounded-none shadow-[1px_1px_0_#000]"
                  : "rounded-full border-2 border-white"
              } ${isOnline ? "bg-emerald-500" : "bg-gray-300"}`}
            />
          </div>

          {/* User info */}
          <div className="min-w-0 flex-1">
            <h3 className={`font-bold text-sm sm:text-base truncate flex items-center gap-2 ${
              isNeubrutalism ? "font-black text-black uppercase" : "text-gray-800"
            }`}>
              <span>{selectedUser.fullName}</span>
              <span className={`text-xs ${
                isNeubrutalism ? "text-black font-extrabold opacity-80" : "font-semibold text-blue-600/80"
              }`}>
                @{selectedUser.username || selectedUser.email?.split("@")[0]}
              </span>
            </h3>
            <div className="flex items-center gap-2 text-xs">
              <span
                className={`transition-colors ${
                  isNeubrutalism
                    ? isOnline ? "text-black font-black uppercase bg-[#00E676] px-1.5 border border-black" : "text-black/60 font-bold"
                    : isOnline ? "text-green-600 font-semibold" : "text-gray-400 font-semibold"
                }`}
              >
                {isOnline ? "Online" : "Offline"}
              </span>
              {isE2EE && (
                <span className={`text-[10px] flex items-center gap-1 border ${
                  isNeubrutalism
                    ? "bg-[#00E5FF] text-black border-black font-black rounded-none uppercase px-1.5 py-0.5 shadow-[1px_1px_0_#000]"
                    : "text-blue-600 bg-blue-50 border-blue-100 rounded-full font-bold px-2 py-0.5"
                }`}>
                  <Lock className={`w-2.5 h-2.5 ${isNeubrutalism ? "stroke-[3]" : ""}`} /> E2EE
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Close button */}
        <Tooltip label="Close chat" position="left">
          <button
            onClick={() => setSelectedUser(null)}
            className={`p-2 transition-all flex-shrink-0 cursor-pointer ${
              isNeubrutalism
                ? "border-2 border-black bg-[#FF007A] text-white shadow-[2px_2px_0_#000] active:translate-x-0.5 active:translate-y-0.5 rounded-none font-bold"
                : "hover:bg-red-50 hover:text-red-500 rounded-xl text-gray-400"
            }`}
          >
            <X className={`w-5 h-5 ${isNeubrutalism ? "stroke-[3]" : ""}`} />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default ChatHeader;

