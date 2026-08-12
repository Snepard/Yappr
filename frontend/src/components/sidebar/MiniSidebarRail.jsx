import React, { memo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  User,
  UserPlus,
  LogOut,
  MessageSquare,
  Sparkles,
  UserCheck,
  PanelLeftOpen,
  Plus,
  Check,
  X,
  Share2,
} from "lucide-react";
import Tooltip from "../Tooltip";

const MiniSidebarRail = memo(({
  authUser,
  showProfileDropdown,
  setShowProfileDropdown,
  onOpenInvite,
  onLogout,
  onExpand,
  activeTab,
  setActiveTab,
  groups,
  users,
  onlineUsers,
  selectedGroup,
  selectedUser,
  onSelectGroup,
  onSelectUser,
  pendingRequests = [],
  onCreateGroup,
  recommendedUsers = [],
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
}) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowProfileDropdown]);

  return (
    <aside className="h-full hidden md:flex w-16 sm:w-20 transition-all duration-300 flex-col items-center py-3.5 bg-white/90 backdrop-blur-xl border-r border-sky-200/60 select-none">
      {/* Top Header: App Logo & Expand Icon */}
      <div className="flex flex-col items-center gap-2 mb-3">
        <Tooltip label="Expand Sidebar" position="right">
          <button
            onClick={onExpand}
            className="p-1 rounded-2xl hover:bg-sky-50 transition-all cursor-pointer group"
          >
            <img
              src="/YapprIcon.png"
              alt="YAPPR Logo"
              className="w-9 h-9 object-contain group-hover:scale-110 transition-transform drop-shadow-xs"
            />
          </button>
        </Tooltip>

        <Tooltip label="Expand Sidebar" position="right">
          <button
            onClick={onExpand}
            className="p-1.5 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>

      {/* User Profile Avatar Dropdown */}
      <div className="relative mb-3" ref={dropdownRef}>
        <Tooltip label={authUser?.fullName || "My Profile"} position="right">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="w-10 h-10 rounded-2xl overflow-hidden ring-2 ring-blue-400/40 shadow-xs hover:scale-105 transition-all relative block cursor-pointer"
          >
            <img
              src={authUser?.profilePic || "/avatar.png"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </button>
        </Tooltip>

        {showProfileDropdown && (
          <div className="fixed left-16 sm:left-20 top-16 w-52 bg-white/95 rounded-2xl shadow-xl border border-sky-100 backdrop-blur-xl z-[9999] overflow-hidden py-1.5">
            <Link
              to="/profile"
              onClick={() => setShowProfileDropdown(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-sky-50 transition-all cursor-pointer font-medium"
            >
              <User className="w-4 h-4 text-blue-500" />
              <span>View Profile</span>
            </Link>
            <button
              onClick={() => {
                setShowProfileDropdown(false);
                onOpenInvite();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-sky-50 transition-all cursor-pointer font-medium text-left"
            >
              <UserPlus className="w-4 h-4 text-cyan-600" />
              <span>Invite Friends</span>
            </button>
            <button
              onClick={() => {
                setShowProfileDropdown(false);
                onLogout();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all cursor-pointer font-medium text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      <div className="w-10 h-px bg-sky-100/80 mb-3" />

      {/* Tab Switcher Rail Buttons */}
      <div className="flex flex-col items-center gap-2 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60 mb-3">
        <Tooltip label="Direct Chats" position="right">
          <button
            onClick={() => setActiveTab("chats")}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              activeTab === "chats"
                ? "bg-white text-blue-600 shadow-xs scale-105"
                : "text-gray-500 hover:text-gray-800 hover:bg-white/50"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </Tooltip>

        <Tooltip label="Group Channels" position="right">
          <button
            onClick={() => setActiveTab("groups")}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              activeTab === "groups"
                ? "bg-white text-blue-600 shadow-xs scale-105"
                : "text-gray-500 hover:text-gray-800 hover:bg-white/50"
            }`}
          >
            <Users className="w-4 h-4" />
          </button>
        </Tooltip>

        <Tooltip label="Find Friends" position="right">
          <button
            onClick={() => setActiveTab("find")}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              activeTab === "find"
                ? "bg-white text-blue-600 shadow-xs scale-105"
                : "text-gray-500 hover:text-gray-800 hover:bg-white/50"
            }`}
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </Tooltip>

        <Tooltip label="Friend Requests" position="right">
          <button
            onClick={() => setActiveTab("requests")}
            className={`p-2 rounded-xl relative transition-all cursor-pointer ${
              activeTab === "requests"
                ? "bg-white text-blue-600 shadow-xs scale-105"
                : "text-gray-500 hover:text-gray-800 hover:bg-white/50"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            {pendingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] bg-red-500 text-white font-bold rounded-full flex items-center justify-center animate-pulse">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </Tooltip>
      </div>

      <div className="w-10 h-px bg-sky-100/80 mb-3" />

      {/* Rail Tab Content List */}
      <div className="flex-1 w-full overflow-y-auto px-2 space-y-3 flex flex-col items-center">
        {/* CHATS TAB RAIL */}
        {activeTab === "chats" &&
          users.map((user) => {
            const isSelected = selectedUser?._id === user._id;
            const isOnline = onlineUsers.includes(user._id);
            return (
              <Tooltip key={user._id} label={user.fullName} position="right">
                <button
                  onClick={() => onSelectUser(user)}
                  className={`relative group rounded-full transition-all p-0.5 cursor-pointer ${
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
                      isOnline ? "bg-emerald-500" : "bg-gray-300"
                    }`}
                  />
                </button>
              </Tooltip>
            );
          })}

        {/* GROUPS TAB RAIL */}
        {activeTab === "groups" && (
          <>
            <Tooltip label="Create New Group" position="right">
              <button
                onClick={onCreateGroup}
                className="w-10 h-10 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm hover:scale-105 transition-all cursor-pointer"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </button>
            </Tooltip>

            {groups.map((group) => {
              const isSelected = selectedGroup?._id === group._id;
              return (
                <Tooltip key={group._id} label={group.name} position="right">
                  <button
                    onClick={() => onSelectGroup(group)}
                    className={`relative group transition-all p-0.5 rounded-2xl cursor-pointer ${
                      isSelected ? "ring-2 ring-blue-500 scale-105" : "hover:scale-105"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-2xl overflow-hidden border border-white shadow-xs bg-blue-50 flex items-center justify-center">
                      {group.groupPic ? (
                        <img src={group.groupPic} alt={group.name} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center border-2 border-white shadow-2xs">
                      <Users className="w-2.5 h-2.5" />
                    </div>
                  </button>
                </Tooltip>
              );
            })}
          </>
        )}

        {/* FIND TAB RAIL */}
        {activeTab === "find" && (
          <>
            <Tooltip label="Invite Friends Link" position="right">
              <button
                onClick={onOpenInvite}
                className="w-10 h-10 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-sm hover:scale-105 transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </Tooltip>

            {recommendedUsers.map((user) => (
              <Tooltip key={user._id} label={`Add ${user.fullName}`} position="right">
                <button
                  onClick={() => sendFriendRequest(user._id)}
                  className="relative group rounded-full transition-all p-0.5 cursor-pointer hover:scale-105"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-white shadow-xs">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center border-2 border-white shadow-2xs">
                    <Plus className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                </button>
              </Tooltip>
            ))}
          </>
        )}

        {/* REQUESTS TAB RAIL */}
        {activeTab === "requests" &&
          pendingRequests.map((req) => (
            <div key={req._id} className="relative flex flex-col items-center gap-1 my-1">
              <Tooltip label={`Request from ${req.sender?.fullName}`} position="right">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400 shadow-xs">
                  <img
                    src={req.sender?.profilePic || "/avatar.png"}
                    alt={req.sender?.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Tooltip>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => acceptFriendRequest(req._id)}
                  className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
                  title="Accept"
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </button>
                <button
                  onClick={() => declineFriendRequest(req._id)}
                  className="w-5 h-5 rounded-full bg-gray-400 text-white flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
                  title="Decline"
                >
                  <X className="w-3 h-3 stroke-[3]" />
                </button>
              </div>
            </div>
          ))}
      </div>
    </aside>
  );
});

MiniSidebarRail.displayName = "MiniSidebarRail";

export default MiniSidebarRail;
