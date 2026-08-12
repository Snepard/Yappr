import React, { memo } from "react";
import { Users } from "lucide-react";

const SidebarGroupItem = memo(({ group, isSelected, onSelect }) => {
  return (
    <button
      onClick={() => onSelect(group)}
      className={`w-full p-2.5 flex items-center gap-3 rounded-2xl transition-all duration-200 cursor-pointer ${
        isSelected
          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
          : "hover:bg-sky-50/70 text-gray-700 hover:text-gray-900"
      }`}
    >
      <div className="relative flex-shrink-0">
        <div
          className={`w-11 h-11 rounded-2xl overflow-hidden ring-2 ${
            isSelected ? "ring-white/40" : "ring-blue-100"
          } shadow-xs bg-blue-50 flex items-center justify-center`}
        >
          {group.groupPic ? (
            <img src={group.groupPic} alt={group.name} className="w-full h-full object-cover" />
          ) : (
            <Users className={`w-5 h-5 ${isSelected ? "text-white" : "text-blue-600"}`} />
          )}
        </div>
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full ${
            isSelected ? "bg-white text-blue-600 border-indigo-600" : "bg-blue-600 text-white border-white"
          } flex items-center justify-center border-2 shadow-2xs`}
        >
          <Users className="w-2.5 h-2.5" />
        </div>
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between gap-1">
          <span className={`font-semibold text-sm truncate ${isSelected ? "text-white" : "text-gray-900"}`}>
            {group.name}
          </span>
          <span className={`text-[10px] font-medium ${isSelected ? "text-blue-100" : "text-gray-400"}`}>
            {group.members?.length || 0} members
          </span>
        </div>
        <span className={`text-xs font-medium truncate block ${isSelected ? "text-blue-100" : "text-gray-500"}`}>
          {group.description || "Group Chat"}
        </span>
      </div>
    </button>
  );
});

SidebarGroupItem.displayName = "SidebarGroupItem";

export default SidebarGroupItem;
