import React, { memo } from "react";

const SidebarUserItem = memo(({ user, isSelected, isOnline, onSelect }) => {
  return (
    <button
      onClick={() => onSelect(user)}
      className={`w-full p-2.5 flex items-center gap-3 rounded-2xl transition-all duration-200 cursor-pointer ${
        isSelected
          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
          : "hover:bg-sky-50/70 text-gray-700 hover:text-gray-900"
      }`}
    >
      <div className="relative flex-shrink-0">
        <div className={`w-11 h-11 rounded-full overflow-hidden ring-2 ${isSelected ? "ring-white/40" : "ring-white"} shadow-xs`}>
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
          className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 ${
            isSelected ? "border-indigo-600" : "border-white"
          } ${isOnline ? "bg-emerald-500" : "bg-gray-300"}`}
        />
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between gap-1">
          <span className={`font-semibold text-sm truncate ${isSelected ? "text-white" : "text-gray-900"}`}>
            {user.fullName}
          </span>
          {user.lastMessageTime && (
            <span className={`text-[10px] font-medium flex-shrink-0 ${isSelected ? "text-blue-100" : "text-gray-400"}`}>
              {new Date(user.lastMessageTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
        <span className={`text-xs font-medium truncate block ${isSelected ? "text-blue-100" : "text-blue-600"}`}>
          @{user.username || user.email?.split("@")[0]}
        </span>
      </div>
    </button>
  );
});

SidebarUserItem.displayName = "SidebarUserItem";

export default SidebarUserItem;
