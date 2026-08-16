import React, { memo } from "react";
import { useThemeStore } from "../../store/useThemeStore";

const SidebarUserItem = memo(({ user, isSelected, isOnline, onSelect }) => {
  const theme = useThemeStore((state) => state.theme);
  const isNeubrutalism = theme === "neubrutalism";

  return (
    <button
      onClick={() => onSelect(user)}
      className={`w-full p-2.5 flex items-center gap-3 transition-all duration-150 cursor-pointer ${
        isNeubrutalism
          ? isSelected
            ? "bg-[#FFE600] text-black border-3 border-black shadow-[3px_3px_0_#000] font-black rounded-none"
            : "hover:bg-yellow-100 text-black border-2 border-transparent hover:border-black rounded-none"
          : isSelected
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 rounded-2xl"
            : "hover:bg-sky-50/70 text-gray-700 hover:text-gray-900 rounded-2xl"
      }`}
    >
      <div className="relative flex-shrink-0">
        <div className={`w-11 h-11 overflow-hidden shrink-0 ${
          isNeubrutalism
            ? "border-2 border-black rounded-none shadow-[2px_2px_0_#000]"
            : `rounded-full ring-2 ${isSelected ? "ring-white/40" : "ring-white"} shadow-xs`
        }`}>
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
          className={`absolute bottom-0 right-0 w-3.5 h-3.5 ${
            isNeubrutalism
              ? "border border-black rounded-none shadow-[1px_1px_0_#000]"
              : `rounded-full border-2 ${isSelected ? "border-indigo-600" : "border-white"}`
          } ${isOnline ? "bg-emerald-500" : "bg-gray-300"}`}
        />
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between gap-1">
          <span className={`text-sm truncate ${
            isNeubrutalism
              ? "font-black text-black"
              : isSelected ? "text-white font-semibold" : "text-gray-900 font-semibold"
          }`}>
            {user.fullName}
          </span>
          {user.lastMessageTime && (
            <span className={`text-[10px] flex-shrink-0 ${
              isNeubrutalism
                ? "font-bold text-black opacity-80"
                : isSelected ? "text-blue-100 font-medium" : "text-gray-400 font-medium"
            }`}>
              {new Date(user.lastMessageTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
        <span className={`text-xs truncate block ${
          isNeubrutalism
            ? "font-extrabold text-black/70"
            : isSelected ? "text-blue-100 font-medium" : "text-blue-600 font-medium"
        }`}>
          @{user.username || user.email?.split("@")[0]}
        </span>
      </div>
    </button>
  );
});

SidebarUserItem.displayName = "SidebarUserItem";

export default SidebarUserItem;
