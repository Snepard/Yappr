import React, { memo } from "react";
import { Users } from "lucide-react";
import { useThemeStore } from "../../store/useThemeStore";

const SidebarGroupItem = memo(({ group, isSelected, onSelect }) => {
  const theme = useThemeStore((state) => state.theme);
  const isNeubrutalism = theme === "neubrutalism";

  return (
    <button
      onClick={() => onSelect(group)}
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
        <div
          className={`w-11 h-11 overflow-hidden flex items-center justify-center ${
            isNeubrutalism
              ? "bg-[#00E5FF] border-2 border-black rounded-none shadow-[2px_2px_0_#000]"
              : `rounded-2xl ring-2 ${isSelected ? "ring-white/40" : "ring-blue-100"} shadow-xs bg-blue-50`
          }`}
        >
          {group.groupPic ? (
            <img src={group.groupPic} alt={group.name} className="w-full h-full object-cover" />
          ) : (
            <Users className={`w-5 h-5 ${isNeubrutalism ? "text-black" : isSelected ? "text-white" : "text-blue-600"}`} />
          )}
        </div>
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 flex items-center justify-center border-2 shadow-2xs ${
            isNeubrutalism
              ? "bg-black text-white border-black rounded-none"
              : isSelected
                ? "bg-white text-blue-600 border-indigo-600 rounded-full"
                : "bg-blue-600 text-white border-white rounded-full"
          }`}
        >
          <Users className="w-2.5 h-2.5" />
        </div>
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between gap-1">
          <span className={`text-sm truncate ${
            isNeubrutalism
              ? "font-black text-black"
              : isSelected ? "text-white font-semibold" : "text-gray-900 font-semibold"
          }`}>
            {group.name}
          </span>
          <span className={`text-[10px] ${
            isNeubrutalism
              ? "font-bold text-black opacity-80"
              : isSelected ? "text-blue-100 font-medium" : "text-gray-400 font-medium"
          }`}>
            {group.members?.length || 0} members
          </span>
        </div>
        <span className={`text-xs truncate block ${
          isNeubrutalism
            ? "font-extrabold text-black/70"
            : isSelected ? "text-blue-100 font-medium" : "text-gray-500 font-medium"
        }`}>
          {group.description || "Group Chat"}
        </span>
      </div>
    </button>
  );
});

SidebarGroupItem.displayName = "SidebarGroupItem";

export default SidebarGroupItem;
