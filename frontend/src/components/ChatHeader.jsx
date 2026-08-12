import { useRef, useState } from "react";
import { X, ArrowLeft, Lock, Users, Settings, Info } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import Tooltip from "./Tooltip";

const ChatHeader = ({ isSidebarCollapsed, setIsSidebarCollapsed }) => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { selectedGroup, setSelectedGroup, setIsGroupInfoOpen } = useGroupStore();
  const { onlineUsers } = useAuthStore();

  if (!selectedUser && !selectedGroup) return null;

  if (selectedGroup) {
    const handleCloseGroup = () => {
      setSelectedGroup(null);
    };

    return (
      <div className="px-4 py-3 border-b border-sky-100 bg-white/80 backdrop-blur-xl shadow-xs select-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {/* Back button for mobile */}
            <Tooltip label="Back to chats" position="right">
              <button
                onClick={handleCloseGroup}
                className="md:hidden p-2 hover:bg-sky-50 rounded-xl transition-colors flex-shrink-0 text-gray-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Tooltip>

            {/* Group Avatar */}
            <div
              onClick={() => setIsGroupInfoOpen(true)}
              className="relative flex-shrink-0 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl overflow-hidden ring-2 ring-white shadow-xs bg-blue-50 flex items-center justify-center">
                {selectedGroup.groupPic ? (
                  <img
                    src={selectedGroup.groupPic}
                    alt={selectedGroup.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Users className="w-5 h-5 text-blue-600" />
                )}
              </div>
            </div>

            {/* Group info */}
            <div
              onClick={() => setIsGroupInfoOpen(true)}
              className="min-w-0 flex-1 cursor-pointer"
            >
              <h3 className="font-bold text-sm sm:text-base text-gray-800 truncate hover:text-blue-600 transition-colors">
                {selectedGroup.name}
              </h3>
              <p className="text-xs text-gray-500 font-medium truncate">
                {selectedGroup.members?.length || 0} members
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <Tooltip label="Group Settings & Members" position="left">
              <button
                onClick={() => setIsGroupInfoOpen(true)}
                className="p-2 hover:bg-sky-50 hover:text-blue-600 rounded-xl transition-colors text-gray-500 cursor-pointer"
              >
                <Info className="w-5 h-5" />
              </button>
            </Tooltip>

            <Tooltip label="Close chat" position="left">
              <button
                onClick={handleCloseGroup}
                className="p-2 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors flex-shrink-0 text-gray-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
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
    <div className="px-4 py-3 border-b border-sky-100 bg-white/80 backdrop-blur-xl shadow-xs select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Back button for mobile */}
          <Tooltip label="Back to contacts" position="right">
            <button
              onClick={handleBackToContacts}
              className="md:hidden p-2 hover:bg-sky-50 rounded-xl transition-colors flex-shrink-0 text-gray-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Tooltip>

          {/* Avatar with online indicator */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white shadow-xs">
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
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white transition-colors ${
                isOnline ? "bg-green-500" : "bg-gray-300"
              }`}
            />
          </div>

          {/* User info */}
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-sm sm:text-base text-gray-800 truncate flex items-center gap-2">
              <span>{selectedUser.fullName}</span>
              <span className="text-xs font-semibold text-blue-600/80">
                @{selectedUser.username || selectedUser.email?.split("@")[0]}
              </span>
            </h3>
            <div className="flex items-center gap-2 text-xs">
              <span
                className={`transition-colors font-semibold ${
                  isOnline ? "text-green-600" : "text-gray-400"
                }`}
              >
                {isOnline ? "Online" : "Offline"}
              </span>
              {isE2EE && (
                <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-blue-100">
                  <Lock className="w-2.5 h-2.5" /> E2EE
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Close button */}
        <Tooltip label="Close chat" position="left">
          <button
            onClick={() => setSelectedUser(null)}
            className="p-2 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors flex-shrink-0 text-gray-400 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default ChatHeader;

