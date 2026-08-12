import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, UserPlus, LogOut, ChevronDown, PanelLeftClose } from "lucide-react";
import Tooltip from "../Tooltip";

const SidebarHeader = ({
  authUser,
  showProfileDropdown,
  setShowProfileDropdown,
  onOpenInvite,
  onLogout,
  onCollapse,
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
    <div className="border-b border-sky-100 bg-gradient-to-r from-blue-50/70 via-sky-50/50 to-blue-50/70">
      {/* Top Header Row: Brand & Collapse Toggle */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <div
          className="flex items-center space-x-2.5 cursor-pointer group"
          onClick={onCollapse}
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

        {/* Desktop Collapse Icon */}
        <Tooltip label="Collapse Sidebar" position="left">
          <button
            onClick={onCollapse}
            className="hidden md:flex p-1.5 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-blue-100/60 transition-all cursor-pointer"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </Tooltip>
      </div>

      {/* User Profile Info Card & Dropdown */}
      <div className="p-3.5 pt-2">
        <div className="flex items-center gap-3">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="p-0.5 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl shadow-xs h-11 w-11 
                         hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20
                         relative group cursor-pointer flex-shrink-0"
            >
              <img
                src={authUser?.profilePic || "/avatar.png"}
                alt="Profile"
                className="w-full h-full object-cover rounded-[14px]"
              />
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs group-hover:bg-blue-50 transition-colors">
                <ChevronDown className="w-2.5 h-2.5 text-gray-500" />
              </div>
            </button>

            {showProfileDropdown && (
              <div className="absolute top-full left-0 mt-2 w-52 bg-white/95 rounded-2xl shadow-xl border border-sky-100 backdrop-blur-xl z-50 overflow-hidden py-1.5 transition-all">
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

          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-sm text-gray-800 truncate">
              {authUser?.fullName || authUser?.name}
            </h2>
            <p className="text-xs text-blue-600 font-semibold truncate">
              @{authUser?.username || authUser?.email?.split("@")[0]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(SidebarHeader);
