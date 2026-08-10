import { useRef, useState } from "react";
import { X, ArrowLeft, Lock } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const Tooltip = ({ children, label, position = "bottom" }) => {
  const [coords, setCoords] = useState(null);
  const [visible, setVisible] = useState(false);
  const targetRef = useRef(null);

  const handleMouseEnter = () => {
    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setCoords(rect);
      setVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setVisible(false);
  };

  if (!label) return children;

  let tooltipStyle = {};
  if (coords) {
    if (position === "right") {
      tooltipStyle = {
        top: `${coords.top + coords.height / 2}px`,
        left: `${coords.right + 12}px`,
        transform: "translateY(-50%)",
      };
    } else if (position === "left") {
      tooltipStyle = {
        top: `${coords.top + coords.height / 2}px`,
        left: `${coords.left - 12}px`,
        transform: "translate(-100%, -50%)",
      };
    } else if (position === "top") {
      tooltipStyle = {
        top: `${coords.top - 12}px`,
        left: `${coords.left + coords.width / 2}px`,
        transform: "translate(-50%, -100%)",
      };
    } else if (position === "bottom") {
      tooltipStyle = {
        top: `${coords.bottom + 12}px`,
        left: `${coords.left + coords.width / 2}px`,
        transform: "translate(-50%, 0)",
      };
    }
  }

  return (
    <div
      ref={targetRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative inline-flex items-center justify-center"
    >
      {children}
      {visible && coords && (
        <div
          style={tooltipStyle}
          className="fixed px-3 py-1.5 bg-[#111214] text-white text-[12px] font-bold rounded-xl shadow-2xl backdrop-blur-md whitespace-nowrap z-[9999] pointer-events-none transition-all duration-150 ease-out flex items-center justify-center select-none"
        >
          {/* Discord-style Arrow Pointer */}
          {position === "right" && (
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-[#111214] rotate-45 rounded-xs" />
          )}
          {position === "left" && (
            <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-[#111214] rotate-45 rounded-xs" />
          )}
          {position === "top" && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#111214] rotate-45 rounded-xs" />
          )}
          {position === "bottom" && (
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#111214] rotate-45 rounded-xs" />
          )}

          <span className="relative z-10">{label}</span>
        </div>
      )}
    </div>
  );
};

const ChatHeader = ({ isSidebarCollapsed, setIsSidebarCollapsed }) => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  if (!selectedUser) return null;

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
            className="p-2 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors flex-shrink-0 text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default ChatHeader;
