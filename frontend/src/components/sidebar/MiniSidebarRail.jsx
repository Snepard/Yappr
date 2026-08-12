import React, { memo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, User, UserPlus, LogOut } from "lucide-react";
import Tooltip from "../Tooltip";

const MiniSidebarRail = memo(({
  authUser,
  showProfileDropdown,
  setShowProfileDropdown,
  onOpenInvite,
  onLogout,
  onExpand,
  groups,
  users,
  onlineUsers,
  selectedGroup,
  selectedUser,
  onSelectGroup,
  onSelectUser,
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
    <aside className="h-full hidden md:flex w-16 sm:w-20 transition-all duration-300 flex-col items-center py-4 bg-white/90 backdrop-blur-xl border-r border-sky-200/60 select-none">
      {/* App Round Logo */}
      <div className="flex flex-col items-center mb-5">
        <Tooltip label="Expand Sidebar" position="right">
          <img
            src="/YapprIcon.png"
            alt="YAPPR Logo"
            className="w-10 h-10 object-contain cursor-pointer hover:scale-110 transition-transform drop-shadow-xs"
            onClick={onExpand}
          />
        </Tooltip>
      </div>

      {/* Profile Avatar Button */}
      <div className="relative mb-5" ref={dropdownRef}>
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
          <div className="fixed left-16 sm:left-20 top-16 w-48 bg-white/95 rounded-2xl shadow-xl border border-sky-100 backdrop-blur-xl z-[9999] overflow-hidden py-1.5">
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

      <div className="w-8 h-px bg-sky-100 my-2" />

      {/* Rail Items List */}
      <div className="flex-1 w-full overflow-y-auto px-2 space-y-3 flex flex-col items-center">
        {/* Groups */}
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
              </button>
            </Tooltip>
          );
        })}

        {/* Users */}
        {users.map((user) => {
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
      </div>
    </aside>
  );
});

MiniSidebarRail.displayName = "MiniSidebarRail";

export default MiniSidebarRail;
