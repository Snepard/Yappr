import React, { memo } from "react";
import { Search, X } from "lucide-react";
import { useThemeStore } from "../../store/useThemeStore";

const SidebarSearch = memo(({ searchQuery, setSearchQuery, showOnlineOnly, setShowOnlineOnly, placeholder = "Search..." }) => {
  const theme = useThemeStore((state) => state.theme);
  const isNeubrutalism = theme === "neubrutalism";

  return (
    <div className="px-3 pt-2.5 pb-1 space-y-2">
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
          isNeubrutalism ? "text-black stroke-[2.5]" : "text-blue-400"
        }`} />
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full pl-9 pr-8 py-2 text-xs transition-all outline-none ${
            isNeubrutalism
              ? "bg-white text-black border-2 border-black shadow-[2px_2px_0_#000] rounded-none font-bold placeholder:text-black/60 focus:bg-[#FFE600]"
              : "bg-blue-50/50 border border-blue-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          }`}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className={`absolute right-2.5 top-1/2 transform -translate-y-1/2 p-0.5 ${
              isNeubrutalism
                ? "text-black hover:bg-black/10 rounded-none font-bold"
                : "text-gray-400 hover:text-gray-600 rounded-full"
            }`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {setShowOnlineOnly && (
        <div className="flex items-center justify-between px-1">
          <label className={`flex items-center gap-2 cursor-pointer text-xs select-none ${
            isNeubrutalism
              ? "font-extrabold text-black uppercase"
              : "font-medium text-gray-600 hover:text-gray-900"
          }`}>
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className={
                isNeubrutalism
                  ? "accent-black rounded-none border-2 border-black h-3.5 w-3.5 cursor-pointer"
                  : "checkbox checkbox-xs checkbox-primary rounded-md"
              }
            />
            <span>Online friends only</span>
          </label>
        </div>
      )}
    </div>
  );
});

SidebarSearch.displayName = "SidebarSearch";

export default SidebarSearch;
