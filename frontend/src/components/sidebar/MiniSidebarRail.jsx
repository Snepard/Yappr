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
  Compass,
  Plus,
  Check,
  X,
  Share2,
} from "lucide-react";
import Tooltip from "../Tooltip";
import { useThemeStore } from "../../store/useThemeStore";

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
  const theme = useThemeStore((state) => state.theme);
  const isNeubrutalism = theme === "neubrutalism";

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
    <aside className={`h-full hidden md:flex w-16 sm:w-20 relative transition-all duration-200 flex-col items-center py-3.5 select-none overflow-hidden rounded-none ${
      isNeubrutalism
        ? 'bg-[#FFFDF0] border-r-3 border-black text-black'
        : 'bg-white/90 backdrop-blur-xl border-r border-sky-200/60'
    }`}>
      {/* Top Header: App Logo */}
      <div className="flex flex-col items-center gap-2 mb-3">
        <Tooltip label="Expand Sidebar" position="right">
          <button
            onClick={onExpand}
            className={`p-1 transition-all cursor-pointer group ${
              isNeubrutalism ? 'hover:bg-yellow-200 rounded-none' : 'hover:bg-sky-50 rounded-2xl'
            }`}
          >
            <img
              src="/YapprIcon.png"
              alt="YAPPR Logo"
              className="w-9 h-9 object-contain group-hover:scale-110 transition-transform"
            />
          </button>
        </Tooltip>
      </div>

      {/* User Profile Avatar Dropdown */}
      <div className="relative mb-3" ref={dropdownRef}>
        <Tooltip label={authUser?.fullName || "My Profile"} position="right">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className={`w-10 h-10 overflow-hidden hover:scale-105 transition-all relative block cursor-pointer ${
              isNeubrutalism
                ? 'border-2 border-black rounded-none shadow-[2px_2px_0_#000]'
                : 'rounded-2xl ring-2 ring-blue-400/40 shadow-xs'
            }`}
          >
            <img
              src={authUser?.profilePic || "/avatar.png"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </button>
        </Tooltip>

        {showProfileDropdown && (
          <div className={`fixed left-16 sm:left-20 top-16 w-52 z-[9999] overflow-hidden py-1.5 transition-all ${
            isNeubrutalism
              ? 'bg-white border-3 border-black shadow-[5px_5px_0_#000] text-black rounded-none font-bold'
              : 'bg-white/95 rounded-2xl shadow-xl border border-sky-100 backdrop-blur-xl'
          }`}>
            <Link
              to="/profile"
              onClick={() => setShowProfileDropdown(false)}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-all cursor-pointer ${
                isNeubrutalism
                  ? 'text-black hover:bg-[#FFE600] font-black uppercase'
                  : 'text-gray-700 hover:bg-sky-50 font-medium'
              }`}
            >
              <User className={`w-4 h-4 ${isNeubrutalism ? 'text-black' : 'text-blue-500'}`} />
              <span>View Profile</span>
            </Link>
            <button
              onClick={() => {
                setShowProfileDropdown(false);
                onOpenInvite();
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all cursor-pointer text-left ${
                isNeubrutalism
                  ? 'text-black hover:bg-[#00E5FF] font-black uppercase'
                  : 'text-gray-700 hover:bg-sky-50 font-medium'
              }`}
            >
              <UserPlus className={`w-4 h-4 ${isNeubrutalism ? 'text-black' : 'text-cyan-600'}`} />
              <span>Invite Friends</span>
            </button>
            <button
              onClick={() => {
                setShowProfileDropdown(false);
                onLogout();
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all cursor-pointer text-left ${
                isNeubrutalism
                  ? 'text-white bg-[#FF007A] hover:bg-pink-700 font-black uppercase border-t-2 border-black'
                  : 'text-red-600 hover:bg-red-50 font-medium'
              }`}
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      <div className={`w-10 h-px mb-3 ${isNeubrutalism ? 'bg-black' : 'bg-sky-100/80'}`} />

      {/* Tab Switcher Rail Buttons */}
      <div className={`flex flex-col items-center gap-2 p-1 mb-3 transition-all ${
        isNeubrutalism
          ? 'bg-white border-2 border-black shadow-[2px_2px_0_#000] rounded-none'
          : 'bg-slate-100/80 rounded-2xl border border-slate-200/60'
      }`}>
        <Tooltip label="Direct Chats" position="right">
          <button
            onClick={() => setActiveTab("chats")}
            className={`p-2 transition-all cursor-pointer ${
              isNeubrutalism
                ? activeTab === "chats"
                  ? "bg-[#FFE600] text-black border border-black shadow-[1px_1px_0_#000] font-black rounded-none"
                  : "text-black hover:bg-yellow-100 rounded-none"
                : activeTab === "chats"
                  ? "bg-white text-blue-600 shadow-xs scale-105 rounded-xl"
                  : "text-gray-500 hover:text-gray-800 hover:bg-white/50 rounded-xl"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </Tooltip>

        <Tooltip label="Group Channels" position="right">
          <button
            onClick={() => setActiveTab("groups")}
            className={`p-2 transition-all cursor-pointer ${
              isNeubrutalism
                ? activeTab === "groups"
                  ? "bg-[#FFE600] text-black border border-black shadow-[1px_1px_0_#000] font-black rounded-none"
                  : "text-black hover:bg-yellow-100 rounded-none"
                : activeTab === "groups"
                  ? "bg-white text-blue-600 shadow-xs scale-105 rounded-xl"
                  : "text-gray-500 hover:text-gray-800 hover:bg-white/50 rounded-xl"
            }`}
          >
            <Users className="w-4 h-4" />
          </button>
        </Tooltip>

        <Tooltip label="Discover & Add Friends" position="right">
          <button
            onClick={() => setActiveTab("discover")}
            className={`p-2 relative transition-all cursor-pointer ${
              isNeubrutalism
                ? activeTab === "discover"
                  ? "bg-[#FFE600] text-black border border-black shadow-[1px_1px_0_#000] font-black rounded-none"
                  : "text-black hover:bg-yellow-100 rounded-none"
                : activeTab === "discover"
                  ? "bg-white text-blue-600 shadow-xs scale-105 rounded-xl"
                  : "text-gray-500 hover:text-gray-800 hover:bg-white/50 rounded-xl"
            }`}
          >
            <Compass className="w-4 h-4" />
            {pendingRequests.length > 0 && (
              <span className={`absolute -top-1 -right-1 w-4 h-4 text-[10px] text-white font-black flex items-center justify-center ${
                isNeubrutalism
                  ? 'bg-[#FF007A] border border-black rounded-none'
                  : 'bg-red-500 rounded-full animate-pulse'
              }`}>
                {pendingRequests.length}
              </span>
            )}
          </button>
        </Tooltip>
      </div>

      <div className={`w-10 h-px mb-3 ${isNeubrutalism ? 'bg-black' : 'bg-sky-100/80'}`} />

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
                  className={`relative group transition-all p-0.5 cursor-pointer ${
                    isNeubrutalism
                      ? isSelected ? "border-2 border-black shadow-[2px_2px_0_#000] bg-[#FFE600] rounded-none" : "hover:border-2 hover:border-black rounded-none"
                      : isSelected ? "ring-2 ring-blue-500 scale-105 rounded-full" : "hover:scale-105 rounded-full"
                  }`}
                >
                  <div className={`w-10 h-10 overflow-hidden ${isNeubrutalism ? 'rounded-none' : 'rounded-full border border-white shadow-xs'}`}>
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
                    className={`absolute bottom-0 right-0 w-3 h-3 ${
                      isNeubrutalism ? 'border border-black rounded-none' : 'rounded-full border-2 border-white'
                    } ${isOnline ? "bg-emerald-500" : "bg-gray-300"}`}
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
                className={`w-10 h-10 flex items-center justify-center transition-all cursor-pointer ${
                  isNeubrutalism
                    ? 'bg-[#FF007A] text-white border-2 border-black shadow-[2px_2px_0_#000] rounded-none font-black hover:-translate-x-0.5 hover:-translate-y-0.5'
                    : 'rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm hover:scale-105'
                }`}
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
                    className={`relative group transition-all p-0.5 cursor-pointer ${
                      isNeubrutalism
                        ? isSelected ? "border-2 border-black shadow-[2px_2px_0_#000] bg-[#FFE600] rounded-none" : "hover:border-2 hover:border-black rounded-none"
                        : isSelected ? "ring-2 ring-blue-500 scale-105 rounded-2xl" : "hover:scale-105 rounded-2xl"
                    }`}
                  >
                    <div className={`w-10 h-10 overflow-hidden flex items-center justify-center ${
                      isNeubrutalism ? 'bg-[#00E5FF] rounded-none' : 'rounded-2xl border border-white bg-blue-50'
                    }`}>
                      {group.groupPic ? (
                        <img src={group.groupPic} alt={group.name} className="w-full h-full object-cover" />
                      ) : (
                        <Users className={`w-5 h-5 ${isNeubrutalism ? 'text-black' : 'text-blue-600'}`} />
                      )}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 flex items-center justify-center border-2 ${
                      isNeubrutalism ? 'bg-black text-white border-black rounded-none' : 'rounded-full bg-blue-600 text-white border-white shadow-2xs'
                    }`}>
                      <Users className="w-2.5 h-2.5" />
                    </div>
                  </button>
                </Tooltip>
              );
            })}
          </>
        )}

        {/* DISCOVER TAB RAIL */}
        {activeTab === "discover" && (
          <>
            <Tooltip label="Invite Friends Link" position="right">
              <button
                onClick={onOpenInvite}
                className={`w-10 h-10 flex items-center justify-center transition-all cursor-pointer ${
                  isNeubrutalism
                    ? 'bg-[#00E5FF] text-black border-2 border-black shadow-[2px_2px_0_#000] rounded-none font-black'
                    : 'rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm hover:scale-105'
                }`}
              >
                <Share2 className="w-4 h-4" />
              </button>
            </Tooltip>

            {/* Pending Requests List */}
            {pendingRequests.map((req) => (
              <div key={req._id} className="relative flex flex-col items-center gap-1 my-1">
                <Tooltip label={`Request from ${req.sender?.fullName}`} position="right">
                  <div className={`w-10 h-10 overflow-hidden ${
                    isNeubrutalism ? 'border-2 border-black rounded-none shadow-[2px_2px_0_#000]' : 'rounded-full border-2 border-amber-400'
                  }`}>
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
                    className={`w-5 h-5 flex items-center justify-center cursor-pointer ${
                      isNeubrutalism ? 'bg-[#00E676] text-black border border-black rounded-none font-bold' : 'rounded-full bg-emerald-500 text-white'
                    }`}
                    title="Accept"
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </button>
                  <button
                    onClick={() => declineFriendRequest(req._id)}
                    className={`w-5 h-5 flex items-center justify-center cursor-pointer ${
                      isNeubrutalism ? 'bg-black text-white border border-black rounded-none font-bold' : 'rounded-full bg-gray-400 text-white'
                    }`}
                    title="Decline"
                  >
                    <X className="w-3 h-3 stroke-[3]" />
                  </button>
                </div>
              </div>
            ))}

            {/* Recommended Users List */}
            {recommendedUsers.map((user) => (
              <Tooltip key={user._id} label={`Add ${user.fullName}`} position="right">
                <button
                  onClick={() => sendFriendRequest(user._id)}
                  className={`relative group transition-all p-0.5 cursor-pointer ${
                    isNeubrutalism ? 'hover:border-2 hover:border-black rounded-none' : 'hover:scale-105 rounded-full'
                  }`}
                >
                  <div className={`w-10 h-10 overflow-hidden ${isNeubrutalism ? 'rounded-none border border-black' : 'rounded-full border border-white'}`}>
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 flex items-center justify-center border-2 ${
                    isNeubrutalism ? 'bg-[#00E676] text-black border-black rounded-none' : 'rounded-full bg-blue-600 text-white border-white'
                  }`}>
                    <Plus className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                </button>
              </Tooltip>
            ))}
          </>
        )}
      </div>
    </aside>
  );
});

MiniSidebarRail.displayName = "MiniSidebarRail";

export default MiniSidebarRail;
