import React, { memo } from "react";
import { Search, X } from "lucide-react";

const SidebarSearch = memo(({ searchQuery, setSearchQuery, showOnlineOnly, setShowOnlineOnly, placeholder = "Search..." }) => {
  return (
    <div className="px-3 pt-2.5 pb-1 space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-8 py-2 text-xs bg-blue-50/50 border border-blue-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {setShowOnlineOnly && (
        <div className="flex items-center justify-between px-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-600 hover:text-gray-900 select-none">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-xs checkbox-primary rounded-md"
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
