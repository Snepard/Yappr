import React, { memo } from "react";
import { Search, UserPlus, Check, Clock, Sparkles, Share2 } from "lucide-react";
import SidebarSkeleton from "../skeletons/SidebarSkeleton";

const FindFriendsTab = memo(({
  friendSearchQuery,
  setFriendSearchQuery,
  recommendedUsers,
  isRecommendationsLoading,
  searchResults,
  isSearching,
  sendFriendRequest,
  onOpenInvite,
}) => {
  const isSearchMode = Boolean(friendSearchQuery.trim());
  const displayList = isSearchMode ? searchResults : recommendedUsers;
  const isLoading = isSearchMode ? isSearching : isRecommendationsLoading;

  return (
    <div className="p-3 space-y-3.5">
      {/* Invite Friends Banner Card */}
      <div className="p-3 px-3.5 bg-gradient-to-r from-blue-50/80 via-sky-50/60 to-indigo-50/80 border border-blue-200/60 rounded-2xl flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold text-xs text-slate-800">Invite Friends</p>
          <p className="text-[11px] font-medium text-slate-500 truncate">Share your link to start chatting</p>
        </div>
        <button
          onClick={onOpenInvite}
          className="px-3.5 py-1.5 bg-[linear-gradient(135deg,#1e40af_0%,#2563eb_75%,#38bdf8_100%)] border border-white/20 text-white text-xs font-bold rounded-xl shadow-[0_4px_14px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_18px_rgba(37,99,235,0.45)] hover:brightness-110 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shrink-0 flex items-center gap-1.5"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Invite</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
        <input
          type="text"
          placeholder="Search @username or name..."
          value={friendSearchQuery}
          onChange={(e) => setFriendSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs bg-blue-50/50 border border-blue-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
        />
      </div>

      {/* Header */}
      <div className="flex items-center gap-1.5 px-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
        <span>{isSearchMode ? "Search Results" : "People You May Know"}</span>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <SidebarSkeleton />
      ) : displayList.length === 0 ? (
        <div className="text-center py-8 px-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <UserPlus className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-xs font-medium text-gray-500">
            {isSearchMode ? `No users matching "${friendSearchQuery}"` : "No recommendations right now"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayList.map((user) => {
            const status = user.relationshipStatus || "none";

            return (
              <div
                key={user._id}
                className="p-3 bg-white/80 border border-sky-100 rounded-2xl shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.fullName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-100 flex-shrink-0"
                    onError={(e) => {
                      e.target.src = "/avatar.png";
                    }}
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-gray-900 truncate">{user.fullName}</p>
                    <p className="text-[11px] font-medium text-blue-600 truncate">
                      @{user.username || user.email?.split("@")[0]}
                    </p>
                  </div>
                </div>

                {status === "none" && (
                  <button
                    onClick={() => sendFriendRequest(user._id)}
                    className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold rounded-xl shadow-xs hover:shadow-md hover:scale-105 transition-all cursor-pointer flex items-center gap-1 flex-shrink-0"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                )}

                {status === "sent" && (
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200/60 text-[11px] font-semibold rounded-xl flex items-center gap-1 flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    <span>Pending</span>
                  </span>
                )}

                {status === "received" && (
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200/60 text-[11px] font-semibold rounded-xl flex items-center gap-1 flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    <span>Request Received</span>
                  </span>
                )}

                {status === "friend" && (
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[11px] font-semibold rounded-xl flex items-center gap-1 flex-shrink-0">
                    <Check className="w-3 h-3" />
                    <span>Friends</span>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

FindFriendsTab.displayName = "FindFriendsTab";

export default FindFriendsTab;
