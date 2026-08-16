import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, UserPlus, LogOut, ChevronDown, PanelLeftClose } from "lucide-react";
import Tooltip from "../Tooltip";
import { useThemeStore } from "../../store/useThemeStore";

const SidebarHeader = ({
  authUser,
  showProfileDropdown,
  setShowProfileDropdown,
  onOpenInvite,
  onLogout,
  onCollapse,
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
    <div className={
      isNeubrutalism
        ? "border-b-3 border-black bg-[#FFFDF0] text-black"
        : "border-b border-sky-100 bg-gradient-to-r from-blue-50/70 via-sky-50/50 to-blue-50/70"
    }>
      {/* Top Header Row: Brand & Collapse Toggle */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <div
          className="flex items-center space-x-2.5 cursor-pointer group"
          onClick={onCollapse}
        >
          <div className={isNeubrutalism ? "p-1 bg-black border-2 border-black rounded-none shadow-[2px_2px_0_#000] flex items-center justify-center" : ""}>
            <img
              src="/YapprIcon.png"
              alt="YAPPR Logo"
              className="w-7 h-7 object-contain group-hover:scale-110 transition-transform"
            />
          </div>
          <h1 className={
            isNeubrutalism
              ? "text-lg font-black text-black uppercase tracking-wider"
              : "text-lg font-bold bg-gradient-to-r from-blue-700 via-sky-600 to-cyan-600 bg-clip-text text-transparent tracking-wide"
          }>
            YAPPR
          </h1>
        </div>

        {/* Desktop Collapse Icon */}
        <Tooltip label="Collapse Sidebar" position="left">
          <button
            onClick={onCollapse}
            className={
              isNeubrutalism
                ? "hidden md:flex p-1.5 border-2 border-black bg-white hover:bg-[#FFE600] text-black shadow-[2px_2px_0_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer rounded-none"
                : "hidden md:flex p-1.5 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-blue-100/60 transition-all cursor-pointer"
            }
          >
            <PanelLeftClose className={`w-5 h-5 ${isNeubrutalism ? "stroke-[2.5]" : ""}`} />
          </button>
        </Tooltip>
      </div>

      {/* User Profile Info Card & Dropdown */}
      <div className="p-3.5 pt-2">
        <div className="flex items-center gap-3">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className={
                isNeubrutalism
                  ? "p-0.5 bg-[#FFE600] border-3 border-black rounded-none shadow-[3px_3px_0_#000] hover:shadow-[4px_4px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200 h-11 w-11 relative group cursor-pointer flex-shrink-0 focus:outline-none"
                  : "p-0.5 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl shadow-xs h-11 w-11 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 relative group cursor-pointer flex-shrink-0"
              }
            >
              <img
                src={authUser?.profilePic || "/avatar.png"}
                alt="Profile"
                className={
                  isNeubrutalism
                    ? "w-full h-full object-cover rounded-none border border-black"
                    : "w-full h-full object-cover rounded-[14px]"
                }
              />
              <div className={
                isNeubrutalism
                  ? "absolute -bottom-1 -right-1 bg-[#00E5FF] border-2 border-black text-black rounded-none p-0.5 shadow-[1px_1px_0_#000] group-hover:bg-[#FFE600] transition-colors"
                  : "absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs group-hover:bg-blue-50 transition-colors"
              }>
                <ChevronDown className={`w-2.5 h-2.5 ${isNeubrutalism ? "text-black stroke-[3]" : "text-gray-500"}`} />
              </div>
            </button>

            {showProfileDropdown && (
              <div className={
                isNeubrutalism
                  ? "absolute top-full left-0 mt-2 w-52 bg-white border-3 border-black shadow-[5px_5px_0_#000] text-black rounded-none z-50 overflow-hidden py-1.5 transition-all font-bold"
                  : "absolute top-full left-0 mt-2 w-52 bg-white/95 rounded-2xl shadow-xl border border-sky-100 backdrop-blur-xl z-50 overflow-hidden py-1.5 transition-all"
              }>
                <Link
                  to="/profile"
                  onClick={() => setShowProfileDropdown(false)}
                  className={
                    isNeubrutalism
                      ? "flex items-center gap-3 px-4 py-2.5 text-sm text-black hover:bg-[#FFE600] font-black uppercase transition-all cursor-pointer"
                      : "flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-sky-50 transition-all cursor-pointer font-medium"
                  }
                >
                  <User className={`w-4 h-4 ${isNeubrutalism ? "text-black stroke-[2.5]" : "text-blue-500"}`} />
                  <span>View Profile</span>
                </Link>
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    onOpenInvite();
                  }}
                  className={
                    isNeubrutalism
                      ? "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-black hover:bg-[#00E5FF] font-black uppercase transition-all cursor-pointer text-left"
                      : "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-sky-50 transition-all cursor-pointer font-medium text-left"
                  }
                >
                  <UserPlus className={`w-4 h-4 ${isNeubrutalism ? "text-black stroke-[2.5]" : "text-cyan-600"}`} />
                  <span>Invite Friends</span>
                </button>
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    onLogout();
                  }}
                  className={
                    isNeubrutalism
                      ? "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white bg-[#FF007A] hover:bg-pink-700 font-black uppercase border-t-2 border-black transition-all cursor-pointer text-left"
                      : "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all cursor-pointer font-medium text-left"
                  }
                >
                  <LogOut className={`w-4 h-4 ${isNeubrutalism ? "text-white stroke-[2.5]" : ""}`} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className={
              isNeubrutalism
                ? "font-black text-sm text-black truncate uppercase tracking-tight"
                : "font-bold text-sm text-gray-800 truncate"
            }>
              {authUser?.fullName || authUser?.name}
            </h2>
            <p className={
              isNeubrutalism
                ? "text-xs text-black font-extrabold truncate opacity-80"
                : "text-xs text-blue-600 font-semibold truncate"
            }>
              @{authUser?.username || authUser?.email?.split("@")[0]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(SidebarHeader);
