import { useEffect, useState, useRef, useMemo } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useFriendStore } from "../store/useFriendStore";
import { Link } from "react-router-dom";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import {
  Users,
  Search,
  X,
  User,
  LogOut,
  ChevronDown,
  MessageSquare,
  UserPlus,
  UserCheck,
  Check,
  Clock,
  Sparkles,
  Share2,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import InviteModal from "./InviteModal";
import { confirmLogout, confirmToast } from "../lib/confirmToast";

const Tooltip = ({ children, label, position = "right" }) => {
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

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, setIsInviteOpen } = useChatStore();
  const { onlineUsers, authUser, logout } = useAuthStore();
  const {
    searchResults,
    isSearching,
    pendingRequests,
    isRequestsLoading,
    recommendedUsers,
    isRecommendationsLoading,
    searchUsers,
    getRecommendedFriends,
    sendFriendRequest,
    getFriendRequests,
    acceptFriendRequest,
    declineFriendRequest,
    subscribeToFriendEvents,
  } = useFriendStore();

  const [activeTab, setActiveTab] = useState("chats"); // "chats" | "find" | "requests"
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [friendSearchQuery, setFriendSearchQuery] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const fixedDropdownRef = useRef(null);
  const collapsedAsideRef = useRef(null);
  const avatarButtonRef = useRef(null);

  useEffect(() => {
    getUsers();
    getFriendRequests();
    getRecommendedFriends();
    subscribeToFriendEvents();
  }, [getUsers, getFriendRequests, getRecommendedFriends, subscribeToFriendEvents]);

  // Fetch recommendations whenever switching to Find tab
  useEffect(() => {
    if (activeTab === "find") {
      getRecommendedFriends();
    }
  }, [activeTab, getRecommendedFriends]);

  // Handle searching for users when friendSearchQuery changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === "find" && friendSearchQuery.trim()) {
        searchUsers(friendSearchQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [friendSearchQuery, activeTab, searchUsers]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const inTrigger = dropdownRef.current && dropdownRef.current.contains(event.target);
      const inFixedPanel = fixedDropdownRef.current && fixedDropdownRef.current.contains(event.target);
      if (!inTrigger && !inFixedPanel) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    const confirmed = await confirmLogout();
    if (confirmed) {
      logout();
      setShowProfileDropdown(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        const matchesSearch =
          user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.username?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesOnlineFilter = showOnlineOnly ? onlineUsers.includes(user._id) : true;
        return matchesSearch && matchesOnlineFilter;
      })
      .sort((a, b) => {
        const aTime = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
        const bTime = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;

        if (aTime && bTime) return bTime - aTime;
        if (aTime && !bTime) return -1;
        if (!aTime && bTime) return 1;

        const aOnline = onlineUsers.includes(a._id);
        const bOnline = onlineUsers.includes(b._id);

        if (aOnline !== bOnline) return bOnline - aOnline;

        return (a.fullName || "").localeCompare(b.fullName || "");
      });
  }, [users, searchQuery, showOnlineOnly, onlineUsers]);

  if (isUsersLoading) return <SidebarSkeleton />;

  // ----------------------------------------------------
  // RENDER MINI COLLAPSED SIDEBAR RAIL (Desktop Only)
  // ----------------------------------------------------
  if (isCollapsed) {
    return (
      <>
        {/* Desktop Mini Sidebar Rail */}
        <aside ref={collapsedAsideRef} className="h-full hidden md:flex w-16 sm:w-20 transition-all duration-300 flex-col items-center py-4 bg-white/90 backdrop-blur-xl border-r border-sky-200/60 select-none">
          {/* Top: App Round Logo */}
          <div className="flex flex-col items-center mb-5">
            <Tooltip label="Expand Sidebar" position="right">
              <img
                src="/YapprIcon.png"
                alt="YAPPR Logo"
                className="w-10 h-10 object-contain cursor-pointer hover:scale-110 transition-transform drop-shadow-sm"
                onClick={() => setIsCollapsed(false)}
              />
            </Tooltip>
          </div>

          {/* Profile Avatar Button */}
          <div className="relative mb-5" ref={dropdownRef}>
            <Tooltip label={authUser?.fullName || "My Profile"} position="right">
              <button
                ref={avatarButtonRef}
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="w-10 h-10 rounded-2xl overflow-hidden ring-2 ring-blue-400/40 shadow-sm hover:scale-105 transition-all relative block"
              >
                <img
                  src={authUser?.profilePic || "/avatar.png"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </button>
            </Tooltip>

            {/* Mini Dropdown Menu */}
            {showProfileDropdown && (
              <div ref={fixedDropdownRef} className="fixed w-48 bg-white rounded-xl shadow-xl border border-sky-100 backdrop-blur-xl z-[9999] overflow-hidden py-1"
                style={{
                  top: avatarButtonRef.current ? avatarButtonRef.current.getBoundingClientRect().top : 0,
                  left: collapsedAsideRef.current ? collapsedAsideRef.current.getBoundingClientRect().right + 8 : 0
                }}
              >
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-800 truncate">{authUser?.fullName}</p>
                  <p className="text-[10px] text-blue-600 font-semibold truncate">@{authUser?.username}</p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setShowProfileDropdown(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-sky-50 transition-colors"
                >
                  <User className="w-4 h-4 text-blue-500" />
                  <span>View Profile</span>
                </Link>

                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    setIsInviteOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-sky-50 transition-colors cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-cyan-600" />
                  <span>Invite Friends</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Tab Shortcuts */}
          <div className="flex flex-col gap-2.5 mb-4 w-full px-2">
            <Tooltip label="Chats" position="right">
              <button
                onClick={() => {
                  setActiveTab("chats");
                  setIsCollapsed(false);
                }}
                className={`w-full py-2.5 rounded-xl flex items-center justify-center transition-all ${
                  activeTab === "chats"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-500 hover:bg-sky-50 hover:text-blue-600"
                }`}
              >
                <MessageSquare className="w-5 h-5" />
              </button>
            </Tooltip>

            <Tooltip label="Find Friends" position="right">
              <button
                onClick={() => {
                  setActiveTab("find");
                  setIsCollapsed(false);
                }}
                className={`w-full py-2.5 rounded-xl flex items-center justify-center transition-all ${
                  activeTab === "find"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-500 hover:bg-sky-50 hover:text-blue-600"
                }`}
              >
                <UserPlus className="w-5 h-5" />
              </button>
            </Tooltip>

            <Tooltip label="Friend Requests" position="right">
              <button
                onClick={() => {
                  setActiveTab("requests");
                  setIsCollapsed(false);
                }}
                className={`w-full py-2.5 rounded-xl flex items-center justify-center relative transition-all ${
                  activeTab === "requests"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-500 hover:bg-sky-50 hover:text-blue-600"
                }`}
              >
                <UserCheck className="w-5 h-5" />
                {pendingRequests.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {pendingRequests.length}
                  </span>
                )}
              </button>
            </Tooltip>
          </div>

          <div className="w-8 h-[1px] bg-sky-200/80 my-2" />

          {/* Mini Contact Avatars */}
          <div className="flex-1 overflow-y-auto w-full px-2 py-3 space-y-3 flex flex-col items-center">
            {filteredUsers.map((user) => {
              const isSelected = selectedUser?._id === user._id;
              const isOnline = onlineUsers.includes(user._id);

              return (
                <Tooltip key={user._id} label={user.fullName} position="right">
                  <button
                    onClick={() => setSelectedUser(user)}
                    className={`relative group rounded-full transition-all p-0.5 ${
                      isSelected ? "ring-2 ring-blue-500 scale-105" : "hover:scale-105"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white shadow-xs">
                      <img
                        src={user.profilePic || "/avatar.png"}
                        alt={user.fullName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/avatar.png";
                        }}
                      />
                    </div>
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        isOnline ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  </button>
                </Tooltip>
              );
            })}
          </div>

          <InviteModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />
        </aside>

        {/* Mobile Full Width View (WhatsApp style) */}
        <aside className="h-full w-full flex md:hidden transition-all duration-300 border-r border-sky-200/60 flex-col bg-white/90 backdrop-blur-xl">
          {/* Top Header: Brand */}
          <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-sky-100 bg-gradient-to-r from-blue-50/70 via-sky-50/50 to-blue-50/70">
            <div className="flex items-center space-x-2.5">
              <img
                src="/YapprIcon.png"
                alt="YAPPR Logo"
                className="w-8 h-8 object-contain drop-shadow-xs"
              />
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-700 via-sky-600 to-cyan-600 bg-clip-text text-transparent tracking-wide">
                YAPPR
              </h1>
            </div>
          </div>

          {/* Header & User Profile Bar */}
          <div className="border-b border-sky-100 p-4 bg-gradient-to-r from-blue-50/40 to-sky-50/40">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="p-1 bg-gradient-to-br from-blue-100 to-sky-100 rounded-2xl shadow-xs h-11 w-11 
                             hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20
                             relative group cursor-pointer flex-shrink-0"
                >
                  <img
                    src={authUser?.profilePic || "/avatar.png"}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-xs group-hover:bg-blue-50 transition-colors">
                    <ChevronDown className="w-2.5 h-2.5 text-gray-500" />
                  </div>
                </button>

                {showProfileDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-sky-100 backdrop-blur-xl z-50 overflow-hidden py-1">
                    <Link
                      to="/profile"
                      onClick={() => setShowProfileDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-sky-50 transition-all cursor-pointer"
                    >
                      <User className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">View Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        setIsInviteOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-sky-50 transition-all cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4 text-cyan-600" />
                      <span className="font-medium">Invite Friends</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-sm text-gray-800 truncate">
                  {authUser.fullName || authUser.name}
                </h2>
                <p className="text-xs text-blue-600 font-semibold truncate">
                  @{authUser.username || authUser.email?.split("@")[0]}
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-gray-100/80 p-1 rounded-xl gap-1">
              <button
                onClick={() => setActiveTab("chats")}
                className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === "chats" ? "bg-white text-blue-700 shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chats</span>
              </button>
              <button
                onClick={() => setActiveTab("find")}
                className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === "find" ? "bg-white text-blue-700 shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Find</span>
              </button>
              <button
                onClick={() => setActiveTab("requests")}
                className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 relative transition-all ${
                  activeTab === "requests" ? "bg-white text-blue-700 shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Requests</span>
                {pendingRequests.length > 0 && (
                  <span className="w-4 h-4 text-[10px] bg-red-500 text-white font-bold rounded-full flex items-center justify-center">
                    {pendingRequests.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-3">
            {activeTab === "chats" && (
              <div className="space-y-1.5">
                {filteredUsers.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => setSelectedUser(user)}
                    className="w-full p-2.5 flex items-center gap-3 rounded-2xl transition-all duration-200 hover:bg-sky-50/60"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white shadow-xs">
                        <img
                          src={user.profilePic || "/avatar.png"}
                          alt={user.fullName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          onlineUsers.includes(user._id) ? "bg-green-500" : "bg-gray-300"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="font-semibold text-sm text-gray-800 truncate">{user.fullName}</div>
                      <div className="text-xs text-blue-600 font-medium truncate">@{user.username}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {activeTab === "find" && (
              <div className="p-2 space-y-2">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
                  <input
                    type="text"
                    placeholder="Search @username or name..."
                    value={friendSearchQuery}
                    onChange={(e) => setFriendSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 text-xs bg-blue-50/50 border border-blue-200/60 rounded-xl focus:outline-none"
                  />
                </div>
                {recommendedUsers.map((user) => (
                  <div key={user._id} className="p-3 bg-white border border-blue-100 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={user.profilePic || "/avatar.png"} alt={user.fullName} className="w-10 h-10 rounded-full object-cover" />
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-gray-800 truncate">{user.fullName}</p>
                        <p className="text-[11px] text-blue-600 truncate">@{user.username}</p>
                      </div>
                    </div>
                    {user.relationshipStatus === "none" && (
                      <button
                        onClick={() => sendFriendRequest(user._id)}
                        className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-xl"
                      >
                        + Add
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {activeTab === "requests" && (
              <div className="p-2 space-y-3">
                {pendingRequests.map((req) => (
                  <div key={req._id} className="p-3 bg-white border border-gray-100 rounded-xl flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={req.sender.profilePic || "/avatar.png"} alt={req.sender.fullName} className="w-9 h-9 rounded-full object-cover" />
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-gray-800 truncate">{req.sender.fullName}</p>
                        <p className="text-[11px] text-blue-600 truncate">@{req.sender.username}</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => acceptFriendRequest(req._id)} className="px-2.5 py-1 bg-blue-600 text-white text-xs rounded-lg font-semibold">Accept</button>
                      <button onClick={() => declineFriendRequest(req._id)} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg font-semibold">Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </>
    );
  }

  // ----------------------------------------------------
  // RENDER EXPANDED SIDEBAR (Full view)
  // ----------------------------------------------------
  return (
    <aside className="h-full w-full md:w-80 transition-all duration-300 border-r border-sky-200/60 flex flex-col bg-white/90 backdrop-blur-xl">
      {/* Top Header: Brand & Collapse Toggle */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-sky-100 bg-gradient-to-r from-blue-50/70 via-sky-50/50 to-blue-50/70">
        <div
          className="flex items-center space-x-2.5 cursor-pointer group"
          onClick={() => setIsCollapsed(true)}
        >
          <img
            src="/YapprIcon.png"
            alt="YAPPR Logo"
            className="w-8 h-8 object-contain drop-shadow-xs group-hover:scale-110 transition-transform"
          />
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-700 via-sky-600 to-cyan-600 bg-clip-text text-transparent tracking-wide">
            YAPPR
          </h1>
        </div>

        {/* Desktop Collapse Icon (Hidden on mobile) */}
        <Tooltip label="Collapse Sidebar" position="left">
          <button
            onClick={() => setIsCollapsed(true)}
            className="hidden md:flex p-1.5 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-blue-100/60 transition-all cursor-pointer"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </Tooltip>
      </div>

      {/* Header & User Profile Bar */}
      <div className="border-b border-sky-100 p-4 bg-gradient-to-r from-blue-50/40 to-sky-50/40">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="p-1 bg-gradient-to-br from-blue-100 to-sky-100 rounded-2xl shadow-xs h-11 w-11 
                         hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20
                         relative group cursor-pointer flex-shrink-0"
            >
              <img
                src={authUser?.profilePic || "/avatar.png"}
                alt="Profile"
                className="w-full h-full object-cover rounded-xl"
              />
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-xs group-hover:bg-blue-50 transition-colors">
                <ChevronDown className="w-2.5 h-2.5 text-gray-500" />
              </div>
            </button>

            {/* Dropdown Menu */}
            <div
              className={`absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-sky-100 
                                backdrop-blur-xl z-50 overflow-hidden transition-all duration-300 ease-out origin-top
                                ${
                                  showProfileDropdown
                                    ? "opacity-100 scale-100 translate-y-0"
                                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                                }`}
            >
              <div className="py-2">
                <Link
                  to="/profile"
                  onClick={() => setShowProfileDropdown(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r 
                             hover:from-blue-50 hover:to-sky-50 transition-all duration-200 cursor-pointer"
                >
                  <User className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">View Profile</span>
                </Link>

                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    setIsInviteOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r 
                             hover:from-blue-50 hover:to-sky-50 transition-all duration-200 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-cyan-600" />
                  <span className="font-medium">Invite Friends</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 
                             transition-all duration-200 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-sm text-gray-800 truncate">
              {authUser.fullName || authUser.name}
            </h2>
            <p className="text-xs text-blue-600 font-semibold truncate">
              @{authUser.username || authUser.email?.split("@")[0]}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-gray-100/80 p-1 rounded-xl gap-1">
          <button
            onClick={() => setActiveTab("chats")}
            className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "chats"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chats</span>
          </button>

          <button
            onClick={() => setActiveTab("find")}
            className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "find"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Find</span>
          </button>

          <button
            onClick={() => setActiveTab("requests")}
            className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 relative transition-all ${
              activeTab === "requests"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Requests</span>
            {pendingRequests.length > 0 && (
              <span className="w-4 h-4 text-[10px] bg-red-500 text-white font-bold rounded-full flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto">
        {/* TAB 1: CHATS (Confirmed Friends) */}
        {activeTab === "chats" && (
          <div className="flex flex-col h-full">
            <div className="p-3 border-b border-gray-100 space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search friends..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs bg-gray-50/80 border border-sky-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOnlineOnly}
                    onChange={(e) => setShowOnlineOnly(e.target.checked)}
                    className="w-3 h-3 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-600 font-medium">Online only</span>
                </label>
                <span className="text-xs text-gray-400 font-medium">
                  {filteredUsers.length} friends
                </span>
              </div>
            </div>

            <div className="flex-1 p-3 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400 px-4 text-center">
                  <Users className="w-9 h-9 mb-2 opacity-40 text-blue-500" />
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    {searchQuery ? "No friends found" : "No friends yet"}
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    {searchQuery
                      ? "Try searching another name"
                      : "Search usernames in 'Find' tab to send friend requests!"}
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={() => setActiveTab("find")}
                      className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-sky-500 text-white text-xs font-semibold rounded-lg shadow-xs hover:opacity-90"
                    >
                      Find Friends
                    </button>
                  )}
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = selectedUser?._id === user._id;
                  const isOnline = onlineUsers.includes(user._id);

                  return (
                    <button
                      key={user._id}
                      onClick={() => setSelectedUser(user)}
                      className={`w-full p-2.5 flex items-center gap-3 rounded-2xl transition-all duration-200 mb-1.5 ${
                        isSelected
                          ? "bg-gradient-to-r from-blue-100/90 to-sky-100/90 shadow-sm ring-2 ring-blue-200/50"
                          : "hover:bg-sky-50/60"
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white shadow-xs">
                          <img
                            src={user.profilePic || "/avatar.png"}
                            alt={user.fullName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = "/avatar.png";
                            }}
                          />
                        </div>
                        <div
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                            isOnline ? "bg-green-500" : "bg-gray-300"
                          }`}
                        />
                      </div>

                      <div className="flex-1 min-w-0 text-left">
                        <div className="font-semibold text-sm text-gray-800 truncate">
                          {user.fullName}
                        </div>
                        <div className="text-xs text-blue-600 font-medium truncate">
                          @{user.username || user.email?.split("@")[0]}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: FIND FRIENDS */}
        {activeTab === "find" && (
          <div className="p-3">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
              <input
                type="text"
                placeholder="Search @username or name..."
                value={friendSearchQuery}
                onChange={(e) => setFriendSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 text-xs bg-blue-50/50 border border-blue-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              {friendSearchQuery && (
                <button
                  onClick={() => setFriendSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* SEARCH RESULTS MODE */}
            {friendSearchQuery.trim() ? (
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">
                  Search Results
                </h3>
                {isSearching ? (
                  <div className="flex justify-center items-center py-8 text-xs text-gray-500">
                    Searching users...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-8 px-4 text-gray-400">
                    <UserPlus className="w-8 h-8 mx-auto mb-2 opacity-40 text-blue-500" />
                    <p className="text-xs font-medium">No users found for "{friendSearchQuery}"</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {searchResults.map((user) => (
                      <div
                        key={user._id}
                        className="p-3 bg-white border border-sky-100 rounded-xl shadow-xs flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={user.profilePic || "/avatar.png"}
                            alt={user.fullName}
                            className="w-9 h-9 rounded-full object-cover border"
                            onError={(e) => {
                              e.target.src = "/avatar.png";
                            }}
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-gray-800 truncate">{user.fullName}</p>
                            <p className="text-[11px] text-blue-600 truncate">@{user.username}</p>
                          </div>
                        </div>

                        <div>
                          {user.relationshipStatus === "friends" && (
                            <span className="px-2.5 py-1 bg-green-50 text-green-600 text-[11px] font-semibold rounded-lg flex items-center gap-1">
                              <Check className="w-3 h-3" /> Friends
                            </span>
                          )}

                          {user.relationshipStatus === "pending_sent" && (
                            <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 text-[11px] font-semibold rounded-lg flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Sent
                            </span>
                          )}

                          {user.relationshipStatus === "pending_received" && (
                            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[11px] font-semibold rounded-lg">
                              Received
                            </span>
                          )}

                          {user.relationshipStatus === "none" && (
                            <button
                              onClick={() => sendFriendRequest(user._id)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all"
                            >
                              + Add
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* RECOMMENDATIONS / FRIENDS OF FRIENDS MODE */
              <div>
                {/* Invite Friends Banner */}
                <div className="mb-4 p-3 bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-500 rounded-2xl text-white shadow-xs flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-xs">Invite your friends</p>
                    <p className="text-[10px] text-blue-100">Share link to chat together</p>
                  </div>
                  <button
                    onClick={() => setIsInviteOpen(true)}
                    className="px-3 py-1.5 bg-white text-blue-600 font-bold text-xs rounded-xl shadow-xs hover:bg-blue-50 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Invite
                  </button>
                </div>

                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Friends of Friends
                    </h3>
                  </div>
                  <span className="text-[11px] text-gray-400 font-medium">Suggested</span>
                </div>

                {isRecommendationsLoading ? (
                  <div className="flex justify-center items-center py-8 text-xs text-gray-500">
                    Finding suggestions...
                  </div>
                ) : recommendedUsers.length === 0 ? (
                  <div className="text-center py-8 px-4 text-gray-400 bg-blue-50/30 rounded-2xl border border-blue-100/50">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-blue-500" />
                    <p className="text-xs font-semibold text-gray-700 mb-1">No suggestions available</p>
                    <p className="text-[11px] text-gray-500">
                      Add more friends or type a handle in the search bar above!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {recommendedUsers.map((user) => (
                      <div
                        key={user._id}
                        className="p-3 bg-white border border-blue-100/80 rounded-2xl shadow-xs flex items-center justify-between gap-3 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={user.profilePic || "/avatar.png"}
                            alt={user.fullName}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-100 border border-white"
                            onError={(e) => {
                              e.target.src = "/avatar.png";
                            }}
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-gray-800 truncate">{user.fullName}</p>
                            <p className="text-[11px] text-blue-600 font-medium truncate">
                              @{user.username}
                            </p>
                            <p className="text-[10px] text-blue-500 font-semibold mt-0.5 flex items-center gap-1">
                              <span>🤝</span> {user.mutualFriendsCount} mutual friend
                              {user.mutualFriendsCount > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>

                        <div>
                          {user.relationshipStatus === "pending_sent" && (
                            <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 text-[11px] font-semibold rounded-lg flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Sent
                            </span>
                          )}

                          {user.relationshipStatus === "pending_received" && (
                            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[11px] font-semibold rounded-lg">
                              Received
                            </span>
                          )}

                          {user.relationshipStatus === "none" && (
                            <button
                              onClick={() => sendFriendRequest(user._id)}
                              className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
                            >
                              + Add
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FRIEND REQUESTS */}
        {activeTab === "requests" && (
          <div className="p-3">
            {isRequestsLoading ? (
              <div className="flex justify-center items-center py-8 text-xs text-gray-500">
                Loading requests...
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <UserCheck className="w-8 h-8 mx-auto mb-2 opacity-40 text-blue-500" />
                <p className="text-xs font-medium">No pending friend requests</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((req) => (
                  <div
                    key={req._id}
                    className="p-3 bg-white border border-gray-100 rounded-xl shadow-xs flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={req.sender.profilePic || "/avatar.png"}
                        alt={req.sender.fullName}
                        className="w-10 h-10 rounded-full object-cover border"
                        onError={(e) => {
                          e.target.src = "/avatar.png";
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-xs text-gray-800 truncate">
                          {req.sender.fullName}
                        </p>
                        <p className="text-[11px] text-blue-600 truncate">
                          @{req.sender.username}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => acceptFriendRequest(req._id)}
                        className="flex-1 py-1.5 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white text-xs font-semibold rounded-lg shadow-xs"
                      >
                        Accept
                      </button>
                      <button
                        onClick={async () => {
                          const confirmed = await confirmToast({
                            title: "Decline Friend Request?",
                            message: `Are you sure you want to decline the request from ${req.sender?.fullName || "this user"}?`,
                            confirmText: "Decline",
                            cancelText: "Cancel",
                            variant: "warning",
                          });
                          if (confirmed) {
                            declineFriendRequest(req._id);
                          }
                        }}
                        className="flex-1 py-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 text-xs font-semibold rounded-lg transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <InviteModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />
    </aside>
  );
};

export default Sidebar;