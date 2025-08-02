import { useEffect, useState, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Search, X, User, LogOut, ChevronDown } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, messages } = useChatStore();
  const { onlineUsers, authUser, logout } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setShowProfileDropdown(false);
  };

  // Function to get the most recent message timestamp for a user
  const getLastMessageTime = (userId) => {
    if (!messages || messages.length === 0) return 0;
    
    // Find the most recent message involving this user
    const userMessages = messages.filter(msg => 
      msg.senderId === userId || msg.receiverId === userId
    );
    
    if (userMessages.length === 0) return 0;
    
    // Get the most recent message timestamp
    const lastMessage = userMessages[userMessages.length - 1];
    return new Date(lastMessage.createdAt || lastMessage.timestamp || 0).getTime();
  };

  const filteredUsers = users
    .filter((user) => {
      const matchesSearch = user.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesOnlineFilter = showOnlineOnly ? onlineUsers.includes(user._id) : true;
      return matchesSearch && matchesOnlineFilter;
    })
    .sort((a, b) => {
      // Sort by most recent message time (descending)
      const aLastMessage = getLastMessageTime(a._id);
      const bLastMessage = getLastMessageTime(b._id);
      
      // If both users have messages, sort by most recent
      if (aLastMessage && bLastMessage) {
        return bLastMessage - aLastMessage;
      }
      
      // If only one has messages, prioritize the one with messages
      if (aLastMessage && !bLastMessage) return -1;
      if (!aLastMessage && bLastMessage) return 1;
      
      // If neither has messages, sort by online status first, then alphabetically
      const aOnline = onlineUsers.includes(a._id);
      const bOnline = onlineUsers.includes(b._id);
      
      if (aOnline !== bOnline) {
        return bOnline - aOnline; // Online users first
      }
      
      // Finally, sort alphabetically by name
      return (a.fullName || '').localeCompare(b.fullName || '');
    });

  if (isUsersLoading) return <SidebarSkeleton />;

  // Hide sidebar on mobile when a user is selected
  const shouldHideSidebar = selectedUser && typeof window !== 'undefined' && window.innerWidth < 1024;

  return (
    <aside className={`h-full transition-all duration-300 border-r border-gray-200/50 flex flex-col bg-white/90 backdrop-blur-xl
      ${shouldHideSidebar ? 'hidden' : 'flex'}
      ${selectedUser ? 'w-0 lg:w-80' : 'w-full lg:w-80'}
      ${!selectedUser ? 'lg:min-w-80' : ''}
    `}>
      <div className="border-b border-gray-200/50 p-4 lg:p-5 bg-gradient-to-r from-purple-50/50 to-blue-50/50">
        {/* Profile Section */}
        <div className="flex items-center gap-3 mb-4 lg:mb-5">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="p-1 bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl shadow-sm h-12 w-12 lg:h-13 lg:w-13 
                         hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20
                         relative group cursor-pointer flex-shrink-0"
            >
              <img 
                src={authUser?.profilePic || "/avatar.png"} 
                alt="Profile" 
                className="w-full h-full object-cover rounded-3xl"
              />
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm group-hover:bg-purple-50 transition-colors">
                <ChevronDown className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-gray-500" />
              </div>
            </button>

            {/* Dropdown Menu */}
            <div className={`absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200/50 
                              backdrop-blur-xl z-50 overflow-hidden transition-all duration-300 ease-out origin-top
                              ${showProfileDropdown 
                                ? 'opacity-100 scale-100 translate-y-0' 
                                : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                              }`}
            >
              <div className="py-2">
                <Link
                  to="/profile"
                  onClick={() => setShowProfileDropdown(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r 
                             hover:from-purple-50 hover:to-blue-50 transition-all duration-200 cursor-pointer"
                >
                  <User className="w-4 h-4 text-purple-500" />
                  <span className="font-medium">View Profile</span>
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 
                             transition-all duration-200 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* User Info - Show on all screen sizes but adjust layout */}
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-base lg:text-lg text-gray-800 truncate">
              {authUser.fullName || authUser.name}
            </h2>
            <p className="text-xs lg:text-sm text-gray-500">
              <span className="text-green-500 font-medium">{onlineUsers.length - 1} online</span> • {users.length} total
            </p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="space-y-3 lg:space-y-4">
          <div className="relative">
            <Search className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 lg:pl-12 pr-10 lg:pr-12 py-2.5 lg:py-3 text-sm bg-white/70 border border-gray-200/50 rounded-xl 
                         focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 
                         transition-all duration-200 backdrop-blur-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 lg:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between bg-white/50 rounded-xl p-2.5 lg:p-3 border border-gray-200/50">
            <label className="flex items-center gap-2 lg:gap-3 cursor-pointer min-w-0 flex-1">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 flex-shrink-0"
              />
              <span className="text-xs lg:text-sm text-gray-700 font-medium truncate">Show online only</span>
            </label>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 lg:px-3 py-1 rounded-full font-medium flex-shrink-0 ml-2">
              {filteredUsers.length}
            </span>
          </div>
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 px-4">
            <Users className="w-8 lg:w-10 h-8 lg:h-10 mb-3 opacity-50" />
            <p className="text-sm text-center font-medium">
              {searchQuery ? "No contacts found" : showOnlineOnly ? "No online users" : "No contacts"}
            </p>
          </div>
        ) : (
          <div className="p-2 lg:p-3">
            {filteredUsers.map((user) => {
              const isSelected = selectedUser?._id === user._id;
              const isOnline = onlineUsers.includes(user._id);
              
              return (
                <button
                  key={user._id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full p-3 lg:p-4 flex items-center gap-3 lg:gap-4 rounded-2xl transition-all duration-200
                    hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 active:scale-[0.98] group mb-2
                    ${isSelected ? "bg-gradient-to-r from-purple-100 to-blue-100 shadow-lg ring-2 ring-purple-200/50" : "hover:shadow-md"}
                  `}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full overflow-hidden ring-2 ring-white shadow-lg group-hover:ring-purple-200 transition-all">
                      <img
                        src={user.profilePic || "/avatar.png"}
                        alt={user.fullName || "User"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/avatar.png";
                        }}
                      />
                    </div>
                    
                    <div className={`absolute bottom-0 right-0 w-3 h-3 lg:w-4 lg:h-4 rounded-full border-2 border-white transition-colors shadow-sm ${
                      isOnline ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                  </div>

                  {/* User Info - Always show but adjust text size */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className={`font-semibold truncate transition-colors text-sm lg:text-base ${
                      isSelected ? 'text-purple-700' : 'text-gray-800'
                    }`}>
                      {user.fullName || "Unknown User"}
                    </div>
                    <div className={`text-xs lg:text-sm transition-colors ${
                      isOnline 
                        ? 'text-green-600 font-medium' 
                        : 'text-gray-500'
                    }`}>
                      {isOnline ? "Online" : "Offline"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;