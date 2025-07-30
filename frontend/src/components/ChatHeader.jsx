import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  if (!selectedUser) return null;

  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="p-4 border-b border-base-300 bg-base-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Avatar with online indicator */}
          <div className="relative">
            <div className="avatar">
              <div className="w-12 h-12 rounded-full">
                <img 
                  src={selectedUser.profilePic || "/avatar.png"} 
                  alt={selectedUser.fullName}
                  className="rounded-full object-cover"
                />
              </div>
            </div>
            {/* Online status indicator */}
            <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-base-100 ${
              isOnline ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-semibold text-lg text-base-content">
              {selectedUser.fullName}
            </h3>
            <p className={`text-sm ${
              isOnline 
                ? 'text-green-500 font-medium' 
                : 'text-base-content/60'
            }`}>
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Close button */}
        <button 
          onClick={() => setSelectedUser(null)}
          className="p-2 hover:bg-base-200 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;