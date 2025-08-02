import { X, ArrowLeft } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  if (!selectedUser) return null;

  const isOnline = onlineUsers.includes(selectedUser._id);

  const handleBackToContacts = () => {
    setSelectedUser(null);
  };

  return (
    <div className="p-4 border-b border-gray-200/50 bg-white/90 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Back button for mobile */}
          <button
            onClick={handleBackToContacts}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            title="Back to contacts"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>

          {/* Avatar with online indicator */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden ring-2 ring-white shadow-lg">
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
            <div className={`absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white shadow-sm transition-colors ${
              isOnline ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
          </div>

          {/* User info */}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-base sm:text-lg text-gray-800 truncate">
              {selectedUser.fullName}
            </h3>
            <p className={`text-xs sm:text-sm transition-colors ${
              isOnline 
                ? 'text-green-600 font-medium' 
                : 'text-gray-500'
            }`}>
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Close button - hidden on mobile, shown on desktop */}
        <button
          onClick={() => setSelectedUser(null)}
          className="hidden lg:flex p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          title="Close chat"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;