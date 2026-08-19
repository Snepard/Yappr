import React, { memo } from "react";
import { Users } from "lucide-react";
import { useThemeStore } from "../../store/useThemeStore";

const SidebarGroupItem = memo(({ group, isSelected, onSelect }) => {
  const theme = useThemeStore((state) => state.theme);
  const isNeubrutalism = theme === "neubrutalism";

  return (
    <button
      onClick={() => onSelect(group)}
      className={`relative w-full p-2.5 flex items-center gap-3 transition-all duration-150 cursor-pointer overflow-hidden ${
        isNeubrutalism
          ? isSelected
            ? "bg-[#FFE600] text-black border-3 border-black shadow-[3px_3px_0_#000] font-black rounded-none"
            : "hover:bg-yellow-100 text-black border-2 border-transparent hover:border-black rounded-none"
          : isSelected
            ? "bg-gradient-to-r from-blue-50/90 via-sky-50/80 to-blue-50/50 text-slate-900 border border-blue-200/80 shadow-xs shadow-blue-500/5 rounded-2xl"
            : "hover:bg-slate-100/70 text-gray-700 hover:text-gray-900 border border-transparent rounded-2xl"
      }`}
    >
      {!isNeubrutalism && isSelected && (
        <span className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-blue-600 rounded-r-full" />
      )}
      <div className="relative flex-shrink-0">
        <div
          className={`w-11 h-11 overflow-hidden flex items-center justify-center ${
            isNeubrutalism
              ? "bg-[#00E5FF] border-2 border-black rounded-none shadow-[2px_2px_0_#000]"
              : `rounded-2xl ring-2 transition-all ${
                  isSelected
                    ? "ring-blue-500/40 bg-blue-100/80 text-blue-700 scale-[1.02]"
                    : "ring-blue-100 bg-blue-50 text-blue-600"
                } shadow-xs`
          }`}
        >
          {group.groupPic ? (
            <img src={group.groupPic} alt={group.name} className="w-full h-full object-cover" />
          ) : (
            <Users
              className={`w-5 h-5 ${
                isNeubrutalism ? "text-black" : isSelected ? "text-blue-700" : "text-blue-600"
              }`}
            />
          )}
        </div>
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 flex items-center justify-center border-2 shadow-2xs ${
            isNeubrutalism
              ? "bg-black text-white border-black rounded-none"
              : isSelected
              ? "bg-blue-600 text-white border-blue-50 rounded-full"
              : "bg-blue-600 text-white border-white rounded-full"
          }`}
        >
          <Users className="w-2.5 h-2.5" />
        </div>
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between gap-1">
          <span
            className={`text-sm truncate ${
              isNeubrutalism
                ? "font-black text-black"
                : isSelected
                ? "text-slate-900 font-bold"
                : "text-gray-900 font-semibold"
            }`}
          >
            {group.name}
          </span>
          <span
            className={`text-[10px] ${
              isNeubrutalism
                ? "font-bold text-black opacity-80"
                : isSelected
                ? "text-blue-600 font-bold"
                : "text-gray-400 font-medium"
            }`}
          >
            {group.members?.length || 0} members
          </span>
        </div>
        <span
          className={`text-xs truncate block ${
            isNeubrutalism
              ? "font-extrabold text-black/70"
              : isSelected
              ? "text-blue-600 font-semibold"
              : "text-gray-500 font-medium"
          }`}
        >
          {group.description || "Group Chat"}
        </span>
      </div>
    </button>
  );
});

SidebarGroupItem.displayName = "SidebarGroupItem";

export default SidebarGroupItem;
